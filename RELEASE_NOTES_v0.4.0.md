# FreezeOps v0.4.0 — Scoped Governance

## The Problem

Global `max_changed_lines` was a good start, but real projects have
asymmetric sensitivity. Adding 300 lines to a UI component is fine.
Adding 70 lines to an auth module is not.

A single global limit couldn't distinguish between "safe to edit freely"
and "needs careful review."

## The Solution

Scoped `max_changed_lines` lets you set per-zone thresholds:

```yaml
rules:
  # Global safety net
  - type: max_changed_lines
    value: 300

  # Auth is sensitive — keep changes small
  - type: max_changed_lines
    value: 60
    paths:
      - src/auth/**
      - src/firebase/**

  # UI is flexible — catch only at global level
  # (no scoped rule needed)
```

When `paths` is specified, only matching files count toward the limit.
Files outside the scope are ignored by that rule.

## Real-World Validation

Tested in RecepciónApp (React/Firebase WMS, private repo):

| Zone | Limit | Outcome |
|---|---|---|
| Global | 300 lines | — |
| Auth + Firebase | 60 lines | 71 lines ❌ blocked |
| DB + Sync + Store | 80 lines | — |
| Remito + Domain | 100 lines | — |
| Backend export | 40 lines | — |

**Smoke test results (7/7):**

- A. 5 lines in UI component → ✅ PASS
- B. 1 line in protected auth → ❌ `protected_paths` detected
- C. 70 lines in auth → ❌ `max_changed_lines` 70 > 60 + `protected_paths`
- D. 70 lines in hooks (non-scoped) → ✅ PASS
- E. `eval(` in source → ❌ `forbidden_text`
- F. Regex → N/A (WMS doesn't use regex)
- G. SARIF with violation → valid JSON, `results.length > 0`

## Configuration Example

```yaml
version: "1"

ignore:
  - node_modules/**
  - dist/**
  - coverage/**

rules:
  # Global cap
  - type: max_changed_lines
    value: 300

  # Auth is sensitive
  - type: max_changed_lines
    value: 60
    paths:
      - src/auth/**
      - src/firebase*.ts

  # Data layer
  - type: max_changed_lines
    value: 80
    paths:
      - src/db/**
      - src/sync/**

  # Backend is very sensitive
  - type: max_changed_lines
    value: 40
    paths:
      - backend/**

  # Auth layer
  - type: protected_paths
    paths:
      - src/auth/**
      - src/config/authMode.ts

  # Forbidden patterns
  - type: forbidden_text
    patterns:
      - eval(
      - TODO_THROWAWAY
```

## Limitations (by design)

- **No line ownership.** A scoped rule counts all changed lines in
  matching files — it doesn't know if the change is a type rename or
  a logic rewrite.
- **No semantic analysis.** FreezeOps doesn't parse code. It counts
  lines and matches patterns.
- **Deterministic only.** Same input → same output. No heuristics,
  no AI, no false positives.

## What's Next

Feature freeze. Using the product in production for several weeks.
Gathering real feedback, opening issues, and letting real-world use
inform v0.5.0 design.

## Install

```bash
npm install -D @tanguito/freezeops@0.4.0
```

```bash
npx freezeops check
```

```bash
npx freezeops check --sarif freezeops.sarif.json
```
