#!/usr/bin/env node

/**
 * FreezeOps CLI — deterministic safety rules runner.
 */

import { loadConfig, runRuleEngine } from "@freezeops/core";
import type { RuleEngineInput } from "@freezeops/core";

async function main(): Promise<void> {
  try {
    const config = await loadConfig();

    // Mock input — real diff reader ships in 01D
    const input: RuleEngineInput = {
      config,
      changedFiles: [],
    };

    const result = runRuleEngine(input);

    if (result.passed) {
      console.log("FreezeOps check passed");
      console.log(`Rules checked: ${result.checkedRules}`);
      console.log(`Violations: ${result.violations.length}`);
    } else {
      console.log("FreezeOps check failed");
      console.log(`Rules checked: ${result.checkedRules}`);
      console.log(`Violations: ${result.violations.length}`);
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
