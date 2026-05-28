# FreezeOps

**Guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging your codebase. FreezeOps lets you define deterministic safety rules that run on every PR — no AI, no cloud, just rules.

---

## Status: v0.3 — Rule Engine

Config loading + deterministic rule engine live. Git diff reader ships in v0.4.

---

## Quickstart

```bash
npm install
npm run validate                           # typecheck + build
node packages/cli/dist/index.js            # run CLI
```

---

## freezeops.yml

```yaml
version: "1"
rules:
  - type: max_changed_lines
    value: 500

  - type: protected_paths
    paths:
      - gameplay/**
      - engine/core/**

  - type: forbidden_text
    patterns:
      - setInterval
      - eval(
```

### Supported rule types

- **max_changed_lines** — fail if total changed lines exceeds `value`
- **protected_paths** — fail if any changed file matches a glob in `paths`
- **forbidden_text** — fail if any added line contains a pattern in `patterns`

---

## Engine Input Model

The rule engine accepts an explicit list of changed files:

```typescript
interface ChangedFile {
  path: string;           // relative file path
  addedLines: string[];   // new or modified lines
  removedLines?: string[]; // deleted lines (optional)
}

interface RuleEngineInput {
  config: FreezeOpsConfig;
  changedFiles: ChangedFile[];
}
```

---

## CLI

```bash
node packages/cli/dist/index.js
```

Clean output:
```
FreezeOps check passed
Rules checked: 3
Violations: 0
```

With violations:
```
FreezeOps check failed
Rules checked: 3
Violations: 2
  - Modified protected path [gameplay/player.js] (matched glob: gameplay/**)
  - Forbidden pattern detected [utils.js] ("eval(")
```

---

## Packages

- `@freezeops/core` — config loader + deterministic rules engine
- `@freezeops/cli` — terminal runner

---

## Philosophy

- **Deterministic.** Same input → same output. Always.
- **Offline-first.** No network calls during audit.
- **Minimal.** Small enough for one person to maintain.
- **Zero lock-in.** Open source, plain YAML config.

---

## License

MIT
