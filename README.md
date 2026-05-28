# FreezeOps

**Guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging your codebase. FreezeOps lets you define deterministic safety rules that run on every PR — no AI, no cloud, just rules.

---

## Status: Bootstrap v0.1

This is the foundation. No rules engine yet. Just a clean monorepo that compiles.

---

## What FreezeOps will do

- Read declarative YAML rules (`freezeops.yml`)
- Analyze git diffs
- Block PRs that violate your constraints
- Run offline, no backend, no telemetry

Example rule (coming in v0.2):

```yaml
rules:
  - type: protected_paths
    paths:
      - gameplay/**
      - dsp/runtime/**
  - type: forbidden_text
    patterns:
      - setInterval
      - eval(
```

---

## Quickstart

```bash
npm install
npm run validate    # typecheck + build
```

---

## Packages

| Package | Purpose |
|---------|---------|
| `@freezeops/core` | Deterministic rules engine |
| `@freezeops/cli` | Terminal runner |

---

## Philosophy

- **Deterministic.** Same input → same output. Always.
- **Offline-first.** No network calls during audit.
- **Minimal.** Small enough for one person to maintain.
- **Zero lock-in.** Open source, plain YAML config.

---

## License

MIT
