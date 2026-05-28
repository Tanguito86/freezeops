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

  // Apply global ignore filter
  const files = config.ignore
    ? changedFiles.filter((f) => !matchesAny(f.path, config.ignore!))
    : changedFiles;

  for (const rule of config.rules) {
    switch (rule.type) {
      case "protected_paths":
        violations.push(...checkProtectedPaths(rule, files));
        break;
      case "forbidden_text":
        violations.push(...checkForbiddenText(rule, files));
        break;
      case "max_changed_lines":
        violations.push(...checkMaxChangedLines(rule, files));
        break;
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    checkedRules: config.rules.length,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Check if a path matches any glob in the list. */
function matchesAny(path: string, globs: string[]): boolean {
  for (const g of globs) {
    if (minimatch(path, g)) return true;
  }
  return false;
}

/** Compile patterns for forbidden_text — returns matchers. */
function compileMatchers(
  rule: ForbiddenTextRule,
): Array<(line: string) => boolean> {
  if (rule.regex) {
    const compiled: RegExp[] = [];
    for (const p of rule.patterns) {
      compiled.push(new RegExp(p));
    }
    return compiled.map((re) => (line: string) => re.test(line));
  }
  // Default: substring match
  return rule.patterns.map((p) => (line: string) => line.includes(p));
}

// ─── protected_paths ─────────────────────────────────────────────────────

function checkProtectedPaths(
  rule: ProtectedPathsRule,
  changedFiles: ChangedFile[],
): RuleViolation[] {
  const violations: RuleViolation[] = [];
  const exclude = rule.exclude ?? [];

  for (const file of changedFiles) {
    // Rule-level exclude
    if (matchesAny(file.path, exclude)) continue;

    for (const glob of rule.paths) {
      if (minimatch(file.path, glob)) {
        violations.push({
          ruleType: "protected_paths",
          message: "Modified protected path",
          file: file.path,
          detail: `matched glob: ${glob}`,
          matchedGlob: glob,
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
  const exclude = rule.exclude ?? [];
  const matchers = compileMatchers(rule);

  for (const file of changedFiles) {
    // Rule-level exclude
    if (matchesAny(file.path, exclude)) continue;

    for (let pi = 0; pi < rule.patterns.length; pi++) {
      const pattern = rule.patterns[pi];
      const match = matchers[pi];

      for (const line of file.addedLines) {
        if (match(line)) {
          violations.push({
            ruleType: "forbidden_text",
            message: "Forbidden pattern detected",
            file: file.path,
            detail: `"${pattern}"`,
            matchedPattern: pattern,
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
  const exclude = rule.exclude ?? [];
  let total = 0;

  for (const file of changedFiles) {
    if (matchesAny(file.path, exclude)) continue;
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
