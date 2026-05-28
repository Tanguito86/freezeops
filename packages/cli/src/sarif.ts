import type { RuleEngineResult, RuleViolation } from "@tanguito/freezeops-core";

// ── SARIF 2.1.0 constants ──────────────────────────────────────────────

const SARIF_SCHEMA = "https://json.schemastore.org/sarif-2.1.0.json";
const SARIF_VERSION = "2.1.0";
const TOOL_NAME = "FreezeOps";
const TOOL_INFO_URI = "https://github.com/Tanguito86/freezeops";
const RULES_URI = "https://github.com/Tanguito86/freezeops/blob/main/docs/rules.md";

// ── Rule descriptors ────────────────────────────────────────────────────

interface SarifRule {
  id: string;
  name: string;
  shortDescription: { text: string };
  helpUri: string;
}

const SARIF_RULES: SarifRule[] = [
  {
    id: "max_changed_lines",
    name: "MaxChangedLines",
    shortDescription: {
      text: "A pull request exceeded the maximum allowed changed lines.",
    },
    helpUri: `${RULES_URI}#max_changed_lines`,
  },
  {
    id: "protected_paths",
    name: "ProtectedPaths",
    shortDescription: {
      text: "A file in a protected path was modified.",
    },
    helpUri: `${RULES_URI}#protected_paths`,
  },
  {
    id: "forbidden_text",
    name: "ForbiddenText",
    shortDescription: {
      text: "A file contains a forbidden text pattern.",
    },
    helpUri: `${RULES_URI}#forbidden_text`,
  },
];

// ── Result mapping ──────────────────────────────────────────────────────

function violationToResult(v: RuleViolation, index: number) {
  const result: Record<string, unknown> = {
    ruleId: v.ruleType,
    ruleIndex: index,
    level: "error",
    message: { text: v.message },
    properties: {},
  };

  if (v.file) {
    result.locations = [
      {
        physicalLocation: {
          artifactLocation: { uri: v.file },
        },
      },
    ];
  }

  const props = result.properties as Record<string, unknown>;
  if (v.detail) props.detail = v.detail;
  if (v.matchedPattern) props.matchedPattern = v.matchedPattern;
  if (v.matchedGlob) props.matchedGlob = v.matchedGlob;

  return result;
}

// ── Public API ──────────────────────────────────────────────────────────

export interface SarifOptions {
  version: string;
  fileCount: number;
}

/**
 * Build a SARIF 2.1.0 report from a FreezeOps rule engine result.
 * Returns the SARIF log as a plain object (caller serializes to JSON).
 */
export function buildSarifReport(
  result: RuleEngineResult,
  options: SarifOptions,
) {
  const rules: SarifRule[] = [];
  const ruleIndexes: Record<string, number> = {};

  for (const rule of SARIF_RULES) {
    ruleIndexes[rule.id] = rules.length;
    rules.push(rule);
  }

  const results = result.violations.map((v) =>
    violationToResult(v, ruleIndexes[v.ruleType] ?? 0),
  );

  return {
    $schema: SARIF_SCHEMA,
    version: SARIF_VERSION,
    runs: [
      {
        tool: {
          driver: {
            name: TOOL_NAME,
            informationUri: TOOL_INFO_URI,
            version: options.version,
            rules,
          },
        },
        results,
      },
    ],
  };
}
