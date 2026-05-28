#!/usr/bin/env node

/**
 * FreezeOps CLI — deterministic safety rules runner.
 *
 * Bootstrap v0.1 — placeholder. Real CLI ships in Sprint 01B.
 */

import { runFreezeOpsCheck } from "@freezeops/core";

function main(): void {
  const result = runFreezeOpsCheck();

  if (result.passed) {
    console.log("FreezeOps CLI bootstrap OK");
    process.exit(0);
  } else {
    console.error("FreezeOps check failed");
    process.exit(1);
  }
}

main();
