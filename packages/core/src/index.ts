/**
 * FreezeOps Core — deterministic rules engine for codebase governance.
 */

export { loadConfig } from "./config.js";
export type { LoadConfigOptions } from "./config.js";

import type {
  FreezeOpsConfig,
  FreezeOpsRule,
  FreezeOpsResult,
  MaxChangedLinesRule,
  ProtectedPathsRule,
  ForbiddenTextRule,
} from "./types.js";

export type {
  FreezeOpsConfig,
  FreezeOpsRule,
  FreezeOpsResult,
  MaxChangedLinesRule,
  ProtectedPathsRule,
  ForbiddenTextRule,
};

export function runFreezeOpsCheck(): FreezeOpsResult {
  return { passed: true };
}
