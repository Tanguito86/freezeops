#!/usr/bin/env node

/**
 * FreezeOps CLI — deterministic safety rules runner.
 */

import {
  getChangedFilesFromGit,
  loadConfig,
  runRuleEngine,
} from "@freezeops/core";
import type { RuleEngineInput } from "@freezeops/core";

async function main(): Promise<void> {
  try {
    const config = await loadConfig();

    // Read real git diff (staged → working tree fallback)
    const changedFiles = await getChangedFilesFromGit();

    const input: RuleEngineInput = { config, changedFiles };
    const result = runRuleEngine(input);

    console.log(
      result.passed ? "FreezeOps check passed" : "FreezeOps check failed",
    );
    console.log(`Files checked: ${changedFiles.length}`);
    console.log(`Rules checked: ${result.checkedRules}`);
    console.log(`Violations: ${result.violations.length}`);

    if (result.violations.length > 0) {
      console.log("");
      for (const v of result.violations) {
        const file = v.file ? ` [${v.file}]` : "";
        const detail = v.detail ? ` (${v.detail})` : "";
        console.log(`  - ${v.message}${file}${detail}`);
      }
      process.exit(1);
    }
  } catch (err) {
    console.error(String((err as Error).message ?? err));
    process.exit(1);
  }
}

main();
