import type { RuleEngineResult } from "@tanguito/freezeops-core";

// ── Marker for deduplication ────────────────────────────────────────────

export const FREEZEOPS_COMMENT_MARKER = "<!-- freezeops-report -->";

// ── Markdown report builder ─────────────────────────────────────────────

export interface ReportOptions {
  result: RuleEngineResult;
  fileCount: number;
}

/**
 * Build a markdown report string suitable for both the GitHub job summary
 * and PR comment body.
 */
export function buildMarkdownReport(options: ReportOptions): string {
  const { result, fileCount } = options;
  const status = result.passed ? "✅ PASS" : "❌ FAIL";

  const lines: string[] = [
    "# FreezeOps Report",
    "",
    `**Status:** ${status}`,
    `**Files checked:** ${fileCount}`,
    `**Rules checked:** ${result.checkedRules}`,
    `**Violations:** ${result.violations.length}`,
  ];

  if (result.violations.length > 0) {
    lines.push("", "## Violations", "");
    lines.push("| Rule | File | Detail |");
    lines.push("|------|------|--------|");
    for (const v of result.violations) {
      const rule = escapePipe(v.ruleType);
      const file = v.file ? escapePipe(v.file) : "-";
      const detail = escapePipe(v.detail ?? v.message);
      lines.push(`| ${rule} | ${file} | ${detail} |`);
    }
  }

  // Invisible marker for deduplication
  lines.push("", FREEZEOPS_COMMENT_MARKER);

  return lines.join("\n");
}

function escapePipe(s: string): string {
  return s.replace(/\|/g, "\\|");
}
