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
 */

import {
  getChangedFilesFromGit,
  loadConfig,
  runRuleEngine,
} from "@freezeops/core";
import type { RuleEngineInput, RuleEngineResult } from "@freezeops/core";

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

// ── Output formatting ───────────────────────────────────────────────────

function printResult(result: RuleEngineResult, fileCount: number): void {
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

    printResult(result, changedFiles.length);

    if (!result.passed) {
      process.exit(1);
    }
  } catch (err) {
    console.error(String((err as Error).message ?? err));
    process.exit(1);
  }
}

main();
