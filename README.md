# FreezeOps

**Deterministic guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging sensitive codebases.
No AI. No cloud. Just rules.

---

[![CI](https://github.com/tanguito/freezeops/actions/workflows/validate.yml/badge.svg)](https://github.com/tanguito/freezeops/actions/workflows/validate.yml)
[![FreezeOps](https://github.com/tanguito/freezeops/actions/workflows/freezeops.yml/badge.svg)](https://github.com/tanguito/freezeops/actions/workflows/freezeops.yml)

---

## The Problem

Teams using Claude, Cursor, Copilot, or OpenCode are shipping AI-generated
code faster than ever. But nobody is checking whether that code respects
critical boundaries:

- Gameplay logic that must not change
- DSP runtimes that must stay frozen
- Security-sensitive paths that need human review
- Debugging leftovers that shouldn't reach production

**Silent damage.** No test catches it. No linter blocks it. By the time
someone notices, the regression is already deployed.

---

## What FreezeOps Does

Define safety rules in a YAML file. FreezeOps checks every PR against them
— deterministically, offline, no AI involved.

```yaml
# freezeops.yml
version: "1"
rules:
  - type: max_changed_lines
    value: 500

  - type: protected_paths
    paths:
      - gameplay/**
      - dsp/runtime/**

  - type: forbidden_text
    patterns:
      - eval(
      - setInterval
      - Math.random()
```

If a PR touches a protected path or adds a forbidden pattern → ❌ blocked.
If it stays within bounds → ✅ passes.

---

## Quickstart

### As a GitHub Action

```yaml
# .github/workflows/freezeops.yml
name: FreezeOps
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  freezeops:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install & build
        run: npm install && npm run build

      - uses: tanguito/freezeops@main
        with:
          config: freezeops.yml
          base-ref: origin/main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Locally

```bash
git clone https://github.com/tanguito/freezeops.git
cd freezeops
npm install && npm run build

# Check working tree
node packages/cli/dist/index.js

# Check staged changes
node packages/cli/dist/index.js check

# Compare against a base ref
node packages/cli/dist/index.js check --base-ref origin/main
```

---

## Rule Types

| Rule | What it catches |
|---|---|
| `max_changed_lines` | PRs that are too large to review safely |
| `protected_paths` | Changes to files that must not be touched lightly |
| `forbidden_text` | Debugging leftovers, dangerous patterns, banned APIs |

Full docs: [docs/rules.md](docs/rules.md)

---

## What FreezeOps Is NOT

- ❌ An AI code reviewer
- ❌ A linter
- ❌ A test runner
- ❌ A security scanner
- ❌ A cloud service

It's a **deterministic policy engine for your repo's safety boundaries.**

---

## Why Deterministic?

Same input → same output. Always. No hallucinations, no false
negatives, no "I think this is probably fine." When FreezeOps blocks
a PR, you know exactly why.

---

## Demo

A 60-second example: [examples/shmup-demo](examples/shmup-demo)

Shows a tiny HTML5 shoot-em-up with protected gameplay code. Edit the
menu → FreezeOps passes. Touch the game loop → FreezeOps blocks it.
Full walkthrough: [docs/demo.md](docs/demo.md)

---

## Dogfooding

FreezeOps audits itself. Our own `freezeops.yml` protects the rule
engine from accidental changes and blocks debugging leftovers.

See [docs/dogfood.md](docs/dogfood.md)

---

## Documentation

- [Rules](docs/rules.md) — rule types and configuration
- [GitHub Action](docs/action.md) — inputs, permissions, examples
- [CLI](docs/cli.md) — terminal usage and flags
- [Dogfooding](docs/dogfood.md) — how we use FreezeOps on itself

---

## Status

**v0.1.0** — Local CLI, GitHub Action, annotations, PR comments, and
dogfooding are live. See [CHANGELOG.md](CHANGELOG.md).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). TL;DR: deterministic first,
no AI dependency, small changes.

---

## Known Limitations

- **Diff parser**: unified diff only (add/modify/delete). No binary/rename support yet
- **forbidden_text**: substring matching, not regex
- **PR comments**: require `pull-requests: write` permission
- **Package**: not published to npm yet
- **Marketplace**: not listed on GitHub Marketplace yet

---

## License

MIT — see [LICENSE](LICENSE)
