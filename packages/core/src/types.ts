// ─── Rule type discriminators ────────────────────────────────────────────

export type RuleType =
  | "max_changed_lines"
  | "protected_paths"
  | "forbidden_text";

// ─── Individual rule shapes ──────────────────────────────────────────────

export interface MaxChangedLinesRule {
  type: "max_changed_lines";
  value: number;
}

export interface ProtectedPathsRule {
  type: "protected_paths";
  paths: string[];
}

export interface ForbiddenTextRule {
  type: "forbidden_text";
  patterns: string[];
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
