# FreezeOps

**Guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging your codebase. FreezeOps lets you define deterministic safety rules that run on every PR — no AI, no cloud, just rules.

---

## Status: v0.4 — Git Diff Reader

Config loading, rule engine, and git diff reader are live. GitHub Action ships in v0.5.

---

## Quickstart

```bash
npm install
npm run validate                           # typecheck + build
node packages/cli/dist/index.js            # run against local changes
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

### Rule types

- **max_changed_lines** — fail if total changed lines exceeds `value`
- **protected_paths** — fail if any changed file matches a glob in `paths`
- **forbidden_text** — fail if any added line contains a pattern in `patterns`

---

## CLI

```bash
node packages/cli/dist/index.js
```

The CLI reads local git changes (staged first, then working tree) and runs all configured rules.

Clean pass:
```
FreezeOps check passed
Files checked: 3
Rules checked: 2
Violations: 0
```

With violations:
```
FreezeOps check failed
Files checked: 3
Rules checked: 2
Violations: 1
  - Modified protected path [gameplay/player.js] (matched glob: gameplay/**)
```

### Local testing workflow

```bash
# 1. Make changes to a file
echo "setInterval(() => {}, 1000)" >> utils.js

# 2. Run FreezeOps (checks working tree)
node packages/cli/dist/index.js

# 3. Stage the changes
git add utils.js

# 4. Run again (checks staged)
node packages/cli/dist/index.js
```

---

## Engine Input Model

```typescript
interface ChangedFile {
  path: string;
  addedLines: string[];
  removedLines?: string[];
}
```

---

## Packages

- `@freezeops/core` — config loader + rules engine + git diff reader
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
