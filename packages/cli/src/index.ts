#!/usr/bin/env node

/**
 * FreezeOps CLI — deterministic safety rules runner.
 *
 * Usage:
 *   node packages/cli/dist/index.js
 *   node packages/cli/dist/index.js check
 *   node packages/cli/dist/index.js check --config path.yml
 *   node packages/cli/dist/index.js check --base-ref origin/main
 *   node packages/cli/dist/index.js check --sarif freezeops.sarif.json
 *
 * GitHub Actions:
 *   INPUT_CONFIG → --config
 *   INPUT_BASE_REF → --base-ref
 *   INPUT_COMMENT → --comment (post/update PR comment)
 *   INPUT_SARIF → --sarif (write SARIF 2.1.0 report)
 *
 * In GitHub Actions, violations are reported as annotations, a job
 * summary is written, and optionally a PR comment is posted.
 * Locally, output goes to the console.
 */

import * as core from "@actions/core";
import * as github from "@actions/github";
import fs from "node:fs/promises";
import path from "node:path";
import { readFileSync } from "node:fs";

const PKG_VERSION: string = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8"),
).version;

import {
  getChangedFilesFromGit,
  loadConfig,
  runRuleEngine,
} from "@tanguito/freezeops-core";
import type { RuleEngineInput, RuleEngineResult } from "@tanguito/freezeops-core";

import { postOrUpdatePrComment } from "./github-comment.js";
import { buildMarkdownReport } from "./report.js";
import { buildSarifReport } from "./sarif.js";

// ── Environment detection ───────────────────────────────────────────────

const isGitHubActions = process.env["GITHUB_ACTIONS"] === "true";
const isPullRequest =
  isGitHubActions && github.context.eventName === "pull_request";

// ── Argument parsing ────────────────────────────────────────────────────

interface CliArgs {
  config?: string;
  baseRef?: string;
  comment: boolean;
  sarif?: string;
}

function parseArgs(raw: string[]): CliArgs {
  const args: CliArgs = { comment: true };

  // GitHub Actions injects inputs as INPUT_<NAME> env vars (hyphens → underscores)
  args.config = process.env["INPUT_CONFIG"] || undefined;
  args.baseRef = process.env["INPUT_BASE_REF"] || undefined;
  args.sarif = process.env["INPUT_SARIF"] || undefined;

  const commentEnv = process.env["INPUT_COMMENT"];
  if (commentEnv !== undefined) {
    args.comment = commentEnv !== "false" && commentEnv !== "0";
  }

  for (let i = 0; i < raw.length; i++) {
    if ((raw[i] === "--config" || raw[i] === "-c") && raw[i + 1]) {
      args.config = raw[++i];
    } else if ((raw[i] === "--base-ref" || raw[i] === "-b") && raw[i + 1]) {
      args.baseRef = raw[++i];
    } else if (raw[i] === "--no-comment") {
      args.comment = false;
    } else if ((raw[i] === "--sarif" || raw[i] === "-s") && raw[i + 1]) {
      args.sarif = raw[++i];
    }
  }

  return args;
}

// ── Output: local console ───────────────────────────────────────────────

function printLocal(result: RuleEngineResult, fileCount: number): void {
  const status = result.passed ? "PASS" : "FAIL";
  console.log(`FreezeOps check ${status}`);
  console.log(`Files checked: ${fileCount}`);
  console.log(`Rules checked: ${result.checkedRules}`);
  console.log(`Violations: ${result.violations.length}`);

  if (result.violations.length > 0) {
    console.log("");
    for (const v of result.violations) {
      console.log(`- [${v.ruleType}] ${v.message}`);
      if (v.file) console.log(`  file: ${v.file}`);
      if (v.detail) console.log(`  detail: ${v.detail}`);
    }
  }
}

// ── Output: GitHub Actions annotations ──────────────────────────────────

function reportGitHubActions(
  result: RuleEngineResult,
  fileCount: number,
  report: string,
): void {
  // Job summary
  core.summary.addRaw(report);
  core.summary.write().catch(() => {});

  if (result.violations.length === 0) {
    core.notice(
      `FreezeOps passed — ${result.checkedRules} rule(s), 0 violations`,
    );
    return;
  }

  // Annotations
  for (const v of result.violations) {
    const props: core.AnnotationProperties = {
      title: `[${v.ruleType}] ${v.message}`,
    };
    if (v.file) props.file = v.file;
    core.error(v.detail ?? v.message, props);
  }
}

// ── Output: PR comment ──────────────────────────────────────────────────

async function tryPostPrComment(report: string): Promise<void> {
  const token = process.env["GITHUB_TOKEN"];
  if (!token) {
    core.warning(
      "GITHUB_TOKEN not available — skipping PR comment. " +
        "Add `permissions: { pull-requests: write }` to your workflow.",
    );
    return;
  }

  const posted = await postOrUpdatePrComment({ body: report, token });
  if (!posted) {
    core.warning(
      "Could not post PR comment — check token has pull-requests:write.",
    );
  }
}

// ── Main ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  try {
    const rawArgs = process.argv.slice(2);
    const args = parseArgs(rawArgs);

    const config = await loadConfig({ configPath: args.config });
    const changedFiles = await getChangedFilesFromGit({
      baseRef: args.baseRef,
    });

    const input: RuleEngineInput = { config, changedFiles };
    const result = runRuleEngine(input);

    const report = buildMarkdownReport({ result, fileCount: changedFiles.length });

    // ── SARIF output (optional) ──────────────────────────────────────
    if (args.sarif) {
      try {
        const sarif = buildSarifReport(result, {
          version: PKG_VERSION,
          fileCount: changedFiles.length,
        });
        const sarifPath = path.resolve(args.sarif);
        await fs.mkdir(path.dirname(sarifPath), { recursive: true });
        await fs.writeFile(sarifPath, JSON.stringify(sarif, null, 2));
        console.log(`SARIF report written: ${sarifPath}`);
      } catch (sarifErr) {
        const msg = String((sarifErr as Error).message ?? sarifErr);
        console.error(`SARIF write failed: ${msg}`);
        // Don't crash — SARIF is best-effort
      }
    }

    if (isGitHubActions) {
      reportGitHubActions(result, changedFiles.length, report);

      if (isPullRequest && args.comment) {
        await tryPostPrComment(report);
      }
    } else {
      printLocal(result, changedFiles.length);
    }

    if (!result.passed) {
      if (isGitHubActions) {
        core.setFailed(
          `FreezeOps found ${result.violations.length} violation(s)`,
        );
      } else {
        process.exit(1);
      }
    }
  } catch (err) {
    const message = String((err as Error).message ?? err);
    if (isGitHubActions) {
      core.setFailed(message);
    } else {
      console.error(message);
      process.exit(1);
    }
  }
}

main();
