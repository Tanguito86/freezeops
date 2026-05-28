# FreezeOps

**Deterministic guardrails for AI-assisted development.**

Stop AI coding tools from silently damaging sensitive codebases.
No AI. No cloud. Just rules.

---

[![CI](https://github.com/Tanguito86/freezeops/actions/workflows/validate.yml/badge.svg)](https://github.com/Tanguito86/freezeops/actions/workflows/validate.yml)
[![FreezeOps](https://github.com/Tanguito86/freezeops/actions/workflows/freezeops.yml/badge.svg)](https://github.com/Tanguito86/freezeops/actions/workflows/freezeops.yml)

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

## 2-Minute Setup

```bash
# 1. Pick a rule pack for your project type
cp configs/web-safe.yml ./freezeops.yml

# 2. Edit paths to match your repo structure
#    (open freezeops.yml — it's just YAML with comments)

# 3. Add the workflow (copy examples/workflows/freezeops.yml
#    to .github/workflows/freezeops.yml)

# 4. Open a PR. FreezeOps checks it automatically.
```

Done. Your repo now has deterministic guardrails.

**Need a different project type?** [Browse all packs →](configs/) or read the [Quickstart Guide →](docs/quickstart.md)

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

## Starter Rule Packs

Pre-built configs for common project types. Copy, paste, protected.

```bash
cp configs/web-safe.yml ./freezeops.yml   # React, Vue, Next.js
cp configs/node-safe.yml ./freezeops.yml  # Express, Fastify
cp configs/game-runtime-safe.yml ./freezeops.yml  # Games, DSP
```

[Browse all packs](configs/) · [Usage guide](docs/rule-packs.md)

| Project type | Recommended pack |
|---|---|
| Any repo | `minimal-safe.yml` |
| Web app (React, Vue, Svelte) | `web-safe.yml` |
| Node backend (Express, Fastify) | `node-safe.yml` |
| Game / runtime / DSP | `game-runtime-safe.yml` |
| Android / mobile | `android-safe.yml` |

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
