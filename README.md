# FreezeOps

**Guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging your codebase. FreezeOps lets you define deterministic safety rules that run on every PR — no AI, no cloud, just rules.

---

## Status: v0.2 — Config Loader

Config loading and validation is live. Rule evaluation ships in v0.3.

---

## Quickstart

```bash
npm install
npm run validate          # typecheck + build
node packages/cli/dist/index.js   # run CLI
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
      - eval\(
      - Math\.random\(\)
```

### Supported rule types

- **max_changed_lines** — fail if PR changes more than `value` lines
- **protected_paths** — fail if any changed file matches a glob in `paths`
- **forbidden_text** — fail if any added line matches a pattern in `patterns`

---

## CLI

```bash
node packages/cli/dist/index.js
# FreezeOps config loaded OK
# Rules: 3
```

Errors are human-readable:

```
Config file not found: /home/user/project/freezeops.yml
rules[1]: unknown or missing rule type "lint". Supported types: max_changed_lines, protected_paths, forbidden_text
rules[0]: "value" must be a positive number
```

---

## Packages

- `@freezeops/core` — deterministic rules engine + config loader
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
