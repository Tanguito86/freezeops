/**
 * FreezeOps Core — deterministic rules engine for codebase governance.
 */

export { loadConfig } from "./config.js";
export type { LoadConfigOptions } from "./config.js";

export { runRuleEngine } from "./engine.js";

export { getChangedFilesFromGit } from "./git.js";
export type { GitDiffOptions } from "./git.js";

import type {
  FreezeOpsConfig,
  FreezeOpsRule,
  MaxChangedLinesRule,
  ProtectedPathsRule,
  ForbiddenTextRule,
  ChangedFile,
  RuleViolation,
  RuleEngineResult,
  RuleEngineInput,
} from "./types.js";

export type {
  FreezeOpsConfig,
  FreezeOpsRule,
  MaxChangedLinesRule,
  ProtectedPathsRule,
  ForbiddenTextRule,
  ChangedFile,
  RuleViolation,
  RuleEngineResult,
  RuleEngineInput,
};

// ── Legacy (01A bootstrap) ──────────────────────────────────────────────

export function runFreezeOpsCheck(): { passed: boolean } {
  return { passed: true };
}
