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

// ─── Audit result (placeholder — engine ships in 01C) ───────────────────

export interface FreezeOpsResult {
  passed: boolean;
}
