# FreezeOps

**Guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging your codebase. FreezeOps lets you define deterministic safety rules that run on every PR — no AI, no cloud, just rules.

---

## Status: v0.5 — GitHub Action

Runs as a GitHub Action on pull requests and pushes. PR comments ship in v0.6.

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

jobs:
  freezeops:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0              # needed for base-ref comparison

      - name: Install dependencies
        run: npm install

      - uses: ./
        with:
          config: freezeops.yml
          base-ref: origin/main
```

The action reads `freezeops.yml` from your repo root by default and compares the PR against `origin/main`.

### Inputs

| Input | Default | Description |
|---|---|---|
| `config` | `freezeops.yml` | Path to config file |
| `base-ref` | _(none)_ | Base ref for diff (e.g. `origin/main`) |

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
```

### Output format

```
FreezeOps check PASS
Files checked: 3
Rules checked: 2
Violations: 0
```

On failure:
```
FreezeOps check FAIL
Files checked: 3
Rules checked: 2
Violations: 2

- [protected_paths] Modified protected path
  file: gameplay/player.js
  detail: gameplay/**
- [forbidden_text] Forbidden pattern detected
  file: utils.js
  detail: "eval("
```

---

## Packages

- `@freezeops/core` — config loader + rules engine + git diff reader
- `@freezeops/cli` — terminal runner + GitHub Action entrypoint

---

## Philosophy

- **Deterministic.** Same input → same output. Always.
- **Offline-first.** No network calls during audit.
- **Minimal.** Small enough for one person to maintain.
- **Zero lock-in.** Open source, plain YAML config.

---

## License

MIT
