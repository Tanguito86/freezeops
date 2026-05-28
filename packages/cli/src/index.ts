#!/usr/bin/env node

/**
 * FreezeOps CLI — deterministic safety rules runner.
 *
 * Usage:
 *   node packages/cli/dist/index.js
 *   node packages/cli/dist/index.js check
 *   node packages/cli/dist/index.js check --config path.yml
 *   node packages/cli/dist/index.js check --base-ref origin/main
 *
 * GitHub Actions:
 *   INPUT_CONFIG → --config
 *   INPUT_BASE_REF → --base-ref
 *
 * In GitHub Actions, violations are reported as annotations and a job
 * summary is written. Locally, output goes to the console.
 */

import * as core from "@actions/core";

import {
  getChangedFilesFromGit,
  loadConfig,
  runRuleEngine,
} from "@freezeops/core";
import type { RuleEngineInput, RuleEngineResult } from "@freezeops/core";

// ── Environment detection ───────────────────────────────────────────────

const isGitHubActions = process.env["GITHUB_ACTIONS"] === "true";

// ── Argument parsing ────────────────────────────────────────────────────

interface CliArgs {
  config?: string;
  baseRef?: string;
}

function parseArgs(raw: string[]): CliArgs {
  const args: CliArgs = {};

  // GitHub Actions injects inputs as INPUT_<NAME> env vars (hyphens → underscores)
  args.config = process.env["INPUT_CONFIG"] || undefined;
  args.baseRef = process.env["INPUT_BASE_REF"] || undefined;

  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "--config" && raw[i + 1]) {
      args.config = raw[++i];
    } else if (raw[i] === "--base-ref" && raw[i + 1]) {
      args.baseRef = raw[++i];
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
): void {
  // Summary heading
  core.summary.addHeading("FreezeOps Report", 1);

  const status = result.passed ? "✅ PASS" : "❌ FAIL";
  core.summary.addRaw(`**Status:** ${status}<br>`);
  core.summary.addRaw(`**Files checked:** ${fileCount}<br>`);
  core.summary.addRaw(`**Rules checked:** ${result.checkedRules}<br>`);
  core.summary.addRaw(`**Violations:** ${result.violations.length}<br>`);

  if (result.violations.length > 0) {
    core.summary.addHeading("Violations", 2);

    // Build summary table
    core.summary.addTable([
      [
        { data: "Rule", header: true },
        { data: "File", header: true },
        { data: "Detail", header: true },
      ],
      ...result.violations.map((v) => [
        v.ruleType,
        v.file ?? "-",
        v.detail ?? v.message,
      ]),
    ]);

    // Annotations: one error per violation
    for (const v of result.violations) {
      const props: core.AnnotationProperties = {
        title: `[${v.ruleType}] ${v.message}`,
      };
      if (v.file) props.file = v.file;
      core.error(v.detail ?? v.message, props);
    }
  }

  // Write summary to step output
  core.summary.write().catch(() => {
    // summary.write() can fail in some CI environments — non-fatal
  });

  // Final status notice
  if (result.passed) {
    core.notice(
      `FreezeOps passed — ${result.checkedRules} rule(s), 0 violations`,
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

    if (isGitHubActions) {
      reportGitHubActions(result, changedFiles.length);
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
