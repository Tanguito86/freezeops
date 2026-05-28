// ─── Rule type discriminators ────────────────────────────────────────────

export type RuleType =
  | "max_changed_lines"
  | "protected_paths"
  | "forbidden_text";

// ─── Individual rule shapes ──────────────────────────────────────────────

export interface MaxChangedLinesRule {
  type: "max_changed_lines";
  value: number;
  /** If set, only count changes in files matching these globs. */
  paths?: string[];
  exclude?: string[];
}

export interface ProtectedPathsRule {
  type: "protected_paths";
  paths: string[];
  exclude?: string[];
}

export interface ForbiddenTextRule {
  type: "forbidden_text";
  patterns: string[];
  /** Opt-in regex mode. Default: substring match. */
  regex?: boolean;
  exclude?: string[];
}

// ─── Union ───────────────────────────────────────────────────────────────

export type FreezeOpsRule =
  | MaxChangedLinesRule
  | ProtectedPathsRule
  | ForbiddenTextRule;

// ─── Config root ─────────────────────────────────────────────────────────

export interface FreezeOpsConfig {
  version: string;
  rules: FreezeOpsRule[];
  /** Glob patterns for files to ignore globally. */
  ignore?: string[];
}

// ─── Engine input / output ───────────────────────────────────────────────

export interface ChangedFile {
  path: string;
  addedLines: string[];
  removedLines?: string[];
}

export interface RuleViolation {
  ruleType: string;
  message: string;
  file?: string;
  detail?: string;
  /** The pattern that triggered a forbidden_text violation. */
  matchedPattern?: string;
  /** The glob that triggered a protected_paths violation. */
  matchedGlob?: string;
}

export interface RuleEngineResult {
  passed: boolean;
  violations: RuleViolation[];
  checkedRules: number;
}

export interface RuleEngineInput {
  config: FreezeOpsConfig;
  changedFiles: ChangedFile[];
}
