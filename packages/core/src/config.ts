import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

import type {
  FreezeOpsConfig,
  FreezeOpsRule,
  ForbiddenTextRule,
  MaxChangedLinesRule,
  ProtectedPathsRule,
} from "./types.js";

// ─── Public API ──────────────────────────────────────────────────────────

export interface LoadConfigOptions {
  /** Path to freezeops config file. Defaults to `freezeops.yml` in cwd. */
  configPath?: string;
}

/**
 * Load and validate a `freezeops.yml` config file.
 *
 * Returns a fully-typed `FreezeOpsConfig` or throws a descriptive error.
 */
export async function loadConfig(
  options: LoadConfigOptions = {},
): Promise<FreezeOpsConfig> {
  const filePath = resolve(options.configPath ?? "freezeops.yml");

  let raw: unknown;
  try {
    const text = await readFile(filePath, "utf-8");
    raw = parseYaml(text);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Config file not found: ${filePath}`);
    }
    throw new Error(`Failed to parse YAML config: ${filePath}\n${String(err)}`);
  }

  return validateConfig(raw, filePath);
}

// ─── Validation ──────────────────────────────────────────────────────────

const SUPPORTED_TYPES = new Set<string>([
  "max_changed_lines",
  "protected_paths",
  "forbidden_text",
]);

function validateConfig(raw: unknown, filePath: string): FreezeOpsConfig {
  if (raw == null || typeof raw !== "object") {
    throw new Error(`Invalid config: expected an object, got ${typeof raw}`);
  }

  const obj = raw as Record<string, unknown>;

  // version
  if (typeof obj.version !== "string" || obj.version.trim().length === 0) {
    throw new Error("Config must have a non-empty 'version' string");
  }

  // rules
  if (!Array.isArray(obj.rules)) {
    throw new Error("Config must have a 'rules' array");
  }
  if (obj.rules.length === 0) {
    throw new Error("Config 'rules' array must have at least one rule");
  }

  const rules: FreezeOpsRule[] = obj.rules.map((rule: unknown, i: number) =>
    validateRule(rule, i, filePath),
  );

  return { version: obj.version, rules };
}

function validateRule(
  raw: unknown,
  index: number,
  filePath: string,
): FreezeOpsRule {
  const prefix = `rules[${index}]`;

  if (raw == null || typeof raw !== "object") {
    throw new Error(`${prefix}: expected an object, got ${typeof raw}`);
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.type !== "string" || !SUPPORTED_TYPES.has(obj.type)) {
    throw new Error(
      `${prefix}: unknown or missing rule type "${String(obj.type)}". ` +
        `Supported types: ${[...SUPPORTED_TYPES].join(", ")}`,
    );
  }

  switch (obj.type) {
    case "max_changed_lines":
      return validateMaxChangedLines(obj, prefix);
    case "protected_paths":
      return validateProtectedPaths(obj, prefix);
    case "forbidden_text":
      return validateForbiddenText(obj, prefix);
    default:
      // should be unreachable
      throw new Error(`${prefix}: unsupported rule type "${obj.type}"`);
  }
}

function validateMaxChangedLines(
  obj: Record<string, unknown>,
  prefix: string,
): MaxChangedLinesRule {
  const value = obj.value;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${prefix}: "value" must be a positive number`);
  }
  return { type: "max_changed_lines", value };
}

function validateProtectedPaths(
  obj: Record<string, unknown>,
  prefix: string,
): ProtectedPathsRule {
  if (!Array.isArray(obj.paths) || obj.paths.length === 0) {
    throw new Error(
      `${prefix}: "paths" must be a non-empty array of glob strings`,
    );
  }
  for (const p of obj.paths) {
    if (typeof p !== "string" || p.trim().length === 0) {
      throw new Error(
        `${prefix}: each entry in "paths" must be a non-empty string`,
      );
    }
  }
  return { type: "protected_paths", paths: obj.paths as string[] };
}

function validateForbiddenText(
  obj: Record<string, unknown>,
  prefix: string,
): ForbiddenTextRule {
  if (!Array.isArray(obj.patterns) || obj.patterns.length === 0) {
    throw new Error(
      `${prefix}: "patterns" must be a non-empty array of regex strings`,
    );
  }
  for (const p of obj.patterns) {
    if (typeof p !== "string" || p.trim().length === 0) {
      throw new Error(
        `${prefix}: each entry in "patterns" must be a non-empty string`,
      );
    }
  }
  return { type: "forbidden_text", patterns: obj.patterns as string[] };
}
