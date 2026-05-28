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

## Why FreezeOps

Existing tools don't solve this problem:

| Tool | What it does | Why it's not enough |
|---|---|---|
| Linters | Style rules | Don't understand which code is sensitive |
| Tests | Verify behavior | Can't block changes to untested code |
| Code review | Human judgment | AI generates faster than humans can review |
| Git hooks | Block on pattern | Same file, different rules — no context |

FreezeOps fills the gap: **policy enforcement between CI and code review.**
It's the layer that says "this path is off-limits, this pattern is banned"
— and enforces it deterministically, before the PR reaches a human.

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

## Design Principles

1. **Deterministic.** Every rule is a pure function. Same diff →
   same result. Every time.

2. **Offline.** No API calls, no cloud services, no telemetry.
   Runs entirely in your CI runner.

3. **Transparent.** Violations show exactly what triggered them:
   which file, which rule, which pattern.

4. **Minimal.** The engine is ~120 lines. Rules are ~40 lines each.
   Small enough to audit in 10 minutes.

5. **Config-driven.** All behavior comes from `freezeops.yml`.
   No hidden settings, no magic defaults.

---

## Deterministic vs AI Magic

FreezeOps is intentionally non-AI. Here's why:

| | AI-based tools | FreezeOps |
|---|---|---|
| **Same input → same output?** | Sometimes | Always |
| **False positives?** | Common | Near-zero |
| **Explains decisions?** | "Probably unsafe" | Exact file, rule, pattern |
| **Needs network?** | Usually | Never |
| **Auditable?** | Black box | 120 lines of TypeScript |

AI is great at generating code. It's terrible at enforcing boundaries.
FreezeOps does the enforcing — deterministically.

---

## When NOT to Use FreezeOps

| Situation | Why | Alternative |
|---|---|---|
| You need code quality review | FreezeOps checks boundaries, not logic | SonarQube, CodeClimate |
| You want AI-powered suggestions | FreezeOps is deterministic on purpose | CodeRabbit, Copilot |
| Your team has no sensitive code | No paths to protect | Standard CI only |
| You need regex patterns | Substring only (regex planned) | ESLint, grep hooks |
| You want a cloud service | FreezeOps runs in your CI | Wait for SaaS tier |

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

## Case Studies

Real projects protected by FreezeOps.

### Galaxy Raiders

HTML5 shmup with 70+ JS files, 5 bosses, and frozen gameplay zones.
16 protected files across 5 categories: gameplay core, balance,
bosses, scoring, and audio DSP.

```yaml
# Real config (subset):
protected_paths:
  - www/game-loop.js       # Frame timing
  - www/collisions.js      # Hitboxes
  - www/boss-patterns.js   # Boss AI
  - www/audio-engine.js    # DSP runtime

forbidden_text:
  - setInterval            # Breaks frame timing
  - Math.random(           # Non-deterministic
  - TODO_THROWAWAY         # Debug leftovers
```

**Results:** 4 pre-existing violations caught on first run.
Smoke: menus ✅ (safe), collisions ❌ (protected). 21K-line
dirty working tree blocked by `max_changed_lines`.

[Full case study →](docs/case-studies/galaxy-raiders.md) · [Config →](https://github.com/Tanguito86/galaxy-raiders/blob/master/freezeops.yml)

### SoundBend

Private Android/Kotlin real-time audio DSP app with parametric EQ,
limiter chain, and PCM pipeline. Protected DSP engine, limiter
chain, audio routing, and resampling from accidental AI changes.

**Results:** Lab paths ✅, limiter chain ❌, Thread.sleep ❌.
Zero DSP/audio behavior touched.

[Full case study →](docs/case-studies/soundbend.md)
*Repository is private — case study omits proprietary details.*

---

## Dogfooding

FreezeOps audits itself. Our own `freezeops.yml` protects the rule
engine from accidental changes and blocks debugging leftovers.

See [docs/dogfood.md](docs/dogfood.md)

---

## What We Learned

After integrating FreezeOps into Galaxy Raiders and dogfooding it on
itself, a few patterns emerged:

1. **`protected_paths` is the killer feature.** Blocking changes to
   specific files catches the most dangerous AI behavior: touching
   code it doesn't understand.

2. **`forbidden_text` finds pre-existing debt.** `setInterval` and
   `Math.random(` were already in the working tree before FreezeOps
   was installed — the tool surfaced them on its first run, not just
   future changes.

3. **`max_changed_lines` catches reality.** A 21K-line dirty working
   tree triggers the limit immediately. Useful signal: if you have
   that much uncommitted work, your PRs aren't small.

4. **Configs can self-trigger.** Listing patterns in `freezeops.yml`
   that also appear in your docs or comments will trigger violations
   on your own config file. Future versions will add exclusions.

5. **Packs accelerate, but don't replace customization.** Every repo
   has its own structure. Galaxy Raiders needed exact file paths, not
   glob patterns — all 70 JS files live flat in `www/`.

---

## How It Works

```
freezeops.yml          git diff
     │                     │
     ▼                     ▼
┌──────────┐       ┌──────────────┐
│  config  │       │   git diff   │
│  loader  │       │   reader     │
└──────────┘       └──────────────┘
     │                     │
     └──────┬──────────────┘
            ▼
     ┌────────────┐      ┌──────────────┐
     │   rule     │ ───▶ │  violations  │
     │   engine   │      │  (if any)    │
     └────────────┘      └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  annotations │
                         │  + PR comment│
                         └──────────────┘
```

[Full architecture →](docs/architecture.md) · [How it works →](docs/how-freezeops-works.md)

---

## Documentation

- [Rules](docs/rules.md) — rule types and configuration
- [GitHub Action](docs/action.md) — inputs, permissions, examples
- [CLI](docs/cli.md) — terminal usage and flags
- [Architecture](docs/architecture.md) — engine internals, data flow
- [How it works](docs/how-freezeops-works.md) — plain-English walkthrough
- [Quickstart](docs/quickstart.md) — 2-minute setup with troubleshooting
- [Rule packs](docs/rule-packs.md) — available packs, customization
- [First rule pack](docs/first-rule-pack.md) — create your own in 15 min
- [Dogfooding](docs/dogfood.md) — how we use FreezeOps on itself

---

## Status

**v0.1.0** — Local CLI, GitHub Action, annotations, PR comments, and
dogfooding are live. See [CHANGELOG.md](CHANGELOG.md).

---

## Contributing

FreezeOps is open source and deterministic-first. We welcome:

- **Rule packs** — new configs for ecosystems we haven't covered
- **Bug fixes** — if something breaks, tell us
- **Docs** — examples, guides, translations
- **Ideas** — open a [Rule Request](https://github.com/Tanguito86/freezeops/issues/new?template=rule-request.yml)

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.
Quick links:

- [Create your first rule pack →](docs/first-rule-pack.md)
- [Architecture overview →](docs/architecture.md)
- [Bad vs good examples →](examples/bad-vs-good)

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
