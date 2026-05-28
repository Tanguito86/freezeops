# Architecture

How FreezeOps works under the hood.

## Overview

```
freezeops.yml          Your rules
     │
     ▼
config.ts              Load + validate YAML → FreezeOpsConfig
     │
     ▼
git.ts                 git diff → ChangedFile[]
     │
     ▼
engine.ts              ChangedFile[] + FreezeOpsConfig → RuleViolation[]
     │
     ▼
CLI / GitHub Action    Format output → console or annotations
```

## Packages

```
packages/
├── core/              Deterministic engine (no I/O beyond git)
│   ├── types.ts       All TypeScript interfaces
│   ├── config.ts      loadConfig(): YAML → validated config
│   ├── engine.ts      runRuleEngine(): diff + config → violations
│   ├── git.ts         getChangedFilesFromGit(): git diff → ChangedFile[]
│   └── index.ts       Barrel exports
│
└── cli/               Terminal + GitHub Actions output
    ├── index.ts       parseArgs(), env vars, wiring
    ├── report.ts      buildMarkdownReport()
    └── github-comment.ts  postOrUpdatePrComment()
```

## Data Flow

### 1. Config Loading (`config.ts`)

Loads `freezeops.yml`, validates every field, returns a typed
`FreezeOpsConfig`. Validation is exhaustive:

- File not found → clear error
- Invalid YAML → clear error
- Missing `rules` array → clear error
- Unknown rule type → clear error
- Invalid values (negative `max_changed_lines`, empty paths) → clear error

### 2. Git Diff Reading (`git.ts`)

Strategy (in priority order):
1. `git diff baseRef...HEAD` (PR against a base)
2. `git diff --cached` (staged changes)
3. `git diff` (working tree)

Parses unified diff output into `ChangedFile[]`:
```typescript
interface ChangedFile {
  path: string;
  addedLines: string[];
  removedLines: string[];
}
```

### 3. Rule Engine (`engine.ts`)

For each rule type, for each changed file, checks if a violation
exists. Rules are independent — one file can trigger multiple
violations.

**Current rules (v0.1.0):**

- **max_changed_lines**: sums added + removed across all files,
  compares against threshold
- **protected_paths**: checks each file path against glob patterns
  (minimatch). A match = violation.
- **forbidden_text**: scans each added line for substring matches.
  A match = violation with the pattern shown.

### 4. Output (`cli/`)

**Local mode** (no `GITHUB_ACTIONS` env var):
- Console output: PASS/FAIL header, file count, rule count, violation list
- Exit code: 0 on pass, 1 on violations

**GitHub Actions mode** (`GITHUB_ACTIONS=true`):
- `::error file=...::` annotations on violating files
- Job summary with markdown table
- PR comment (single, auto-updating) if token available

## Design Decisions

### Why substring matching instead of regex?

Regex is powerful but introduces false positives from bad patterns,
catastrophic backtracking, and complexity. Substring matching is
deterministic, fast, and transparent. If you can see the string,
FreezeOps catches it.

Future versions may add optional regex support behind a flag.

### Why no file exclusions?

FreezeOps checks every changed file against every rule. No `.gitignore`
for rules. This is intentional — exclusions create blind spots.

If a rule is too aggressive for your docs, tune the patterns, not the
file list. Future versions may add `exclude` fields to rules.

### Why a monorepo?

Two packages, tightly coupled:
- `@freezeops/core` is the engine — could be published to npm
- `@freezeops/cli` is the user-facing tool — depends on core

Keeping them in one repo simplifies versioning and testing during
early development. They'll be split when npm publishing happens.

## Adding a New Rule Type

1. Add interface to `types.ts`:
   ```typescript
   export interface MyNewRule extends BaseRule {
     type: "my_new_rule";
     value: number;
   }
   ```

2. Add to union type:
   ```typescript
   export type FreezeOpsRule = MaxChangedLinesRule | ProtectedPathsRule | ForbiddenTextRule | MyNewRule;
   ```

3. Add config validation in `config.ts` `validateConfig()`

4. Add rule logic in `engine.ts` `runRuleEngine()`:
   ```typescript
   case "my_new_rule":
     if (rule.value < someThreshold) {
       violations.push({ rule: "my_new_rule", file, detail: "..." });
     }
     break;
   ```

5. Build + test + dogfood.
