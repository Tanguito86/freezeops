# FreezeOps

**Guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging your codebase. FreezeOps lets you define deterministic safety rules that run on every PR — no AI, no cloud, just rules.

---

## Status: v0.6 — PR Comments

Annotations, job summary, and PR comments are live. Ready for dogfooding.

---

## Quickstart

```bash
npm install
npm run validate                           # typecheck + build

# Run locally
node packages/cli/dist/index.js
node packages/cli/dist/index.js check --config freezeops.yml
node packages/cli/dist/index.js check --base-ref origin/main
```

---

## GitHub Action

```yaml
name: FreezeOps
on:
  pull_request:
  push:

permissions:
  contents: read
  pull-requests: write          # needed for PR comments

jobs:
  freezeops:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install dependencies
        run: npm install

      - uses: ./
        with:
          config: freezeops.yml
          base-ref: origin/main
          comment: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

| Input | Default | Description |
|---|---|---|
| `config` | `freezeops.yml` | Path to config file |
| `base-ref` | _(none)_ | Base ref for diff (e.g. `origin/main`) |
| `comment` | `true` | Post/update a PR comment with the report |

### How PR comments work

- One comment per PR — FreezeOps finds and updates its previous comment
- Identified by an invisible `<!-- freezeops-report -->` marker
- No comment spam, no duplicates
- If `GITHUB_TOKEN` is missing, comments are skipped (non-fatal)

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
# Check working tree changes
node packages/cli/dist/index.js

# Check staged changes  
node packages/cli/dist/index.js check

# Custom config
node packages/cli/dist/index.js check --config path/to/freezeops.yml

# Compare against a base ref (for PR simulation)
node packages/cli/dist/index.js check --base-ref origin/main

# Disable PR comments (when running as GitHub Action)
node packages/cli/dist/index.js check --no-comment
```

---

## Packages

- `@freezeops/core` — config loader + rules engine + git diff reader
- `@freezeops/cli` — terminal runner + GitHub Action entrypoint + PR reporter

---

## Philosophy

- **Deterministic.** Same input → same output. Always.
- **Offline-first.** No network calls during audit.
- **Minimal.** Small enough for one person to maintain.
- **Zero lock-in.** Open source, plain YAML config.

---

## Dogfooding

FreezeOps audits itself. See [docs/dogfood.md](docs/dogfood.md) for details.

Our own `freezeops.yml`:
```yaml
rules:
  - type: max_changed_lines
    value: 500
  - type: forbidden_text
    patterns:
      - eval(
      - console.log("debug")
      - TODO_THROWAWAY
  - type: protected_paths
    paths:
      - packages/core/src/engine.ts
```

The workflow runs on every PR and push to main — annotations, summary,
and a PR comment with the full report.

---

## License

MIT
