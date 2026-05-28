import { minimatch } from "minimatch";

import type {
  ChangedFile,
  FreezeOpsConfig,
  ForbiddenTextRule,
  MaxChangedLinesRule,
  ProtectedPathsRule,
  RuleEngineInput,
  RuleEngineResult,
  RuleViolation,
} from "./types.js";

// ─── Public API ──────────────────────────────────────────────────────────

export function runRuleEngine(input: RuleEngineInput): RuleEngineResult {
  const violations: RuleViolation[] = [];
  const { config, changedFiles } = input;

  for (const rule of config.rules) {
    switch (rule.type) {
      case "protected_paths":
        violations.push(...checkProtectedPaths(rule, changedFiles));
        break;
      case "forbidden_text":
        violations.push(...checkForbiddenText(rule, changedFiles));
        break;
      case "max_changed_lines":
        violations.push(...checkMaxChangedLines(rule, changedFiles));
        break;
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    checkedRules: config.rules.length,
  };
}

// ─── protected_paths ─────────────────────────────────────────────────────

function checkProtectedPaths(
  rule: ProtectedPathsRule,
  changedFiles: ChangedFile[],
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  for (const file of changedFiles) {
    for (const glob of rule.paths) {
      if (minimatch(file.path, glob)) {
        violations.push({
          ruleType: "protected_paths",
          message: "Modified protected path",
          file: file.path,
          detail: `matched glob: ${glob}`,
        });
        break; // one violation per file is enough
      }
    }
  }

  return violations;
}

// ─── forbidden_text ──────────────────────────────────────────────────────

function checkForbiddenText(
  rule: ForbiddenTextRule,
  changedFiles: ChangedFile[],
): RuleViolation[] {
  const violations: RuleViolation[] = [];

  for (const file of changedFiles) {
    for (const pattern of rule.patterns) {
      for (const line of file.addedLines) {
        if (line.includes(pattern)) {
          violations.push({
            ruleType: "forbidden_text",
            message: `Forbidden pattern detected`,
            file: file.path,
            detail: `"${pattern}"`,
          });
          break; // one violation per pattern per file is enough
        }
      }
    }
  }

  return violations;
}

// ─── max_changed_lines ───────────────────────────────────────────────────

function checkMaxChangedLines(
  rule: MaxChangedLinesRule,
  changedFiles: ChangedFile[],
): RuleViolation[] {
  let total = 0;

  for (const file of changedFiles) {
    total += file.addedLines.length;
    total += file.removedLines?.length ?? 0;
  }

  if (total > rule.value) {
    return [
      {
        ruleType: "max_changed_lines",
        message: "PR exceeds max changed lines",
        detail: `${total} > ${rule.value}`,
      },
    ];
  }

  return [];
}
