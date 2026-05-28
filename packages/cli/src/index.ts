#!/usr/bin/env node

/**
 * FreezeOps CLI — deterministic safety rules runner.
 */

import { loadConfig, runFreezeOpsCheck } from "@freezeops/core";

async function main(): Promise<void> {
  try {
    const config = await loadConfig();

    console.log("FreezeOps config loaded OK");
    console.log(`Rules: ${config.rules.length}`);

    // Placeholder — real audit ships in 01C
    const result = runFreezeOpsCheck();
    if (!result.passed) {
      console.error("FreezeOps check failed");
      process.exit(1);
    }
  } catch (err) {
    console.error(String((err as Error).message ?? err));
    process.exit(1);
  }
}

main();
