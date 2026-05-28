# Case Study: Galaxy Raiders

**Project:** Galaxy Raiders — HTML5 Canvas shoot-em-up
**Repo:** [Tanguito86/galaxy-raiders](https://github.com/Tanguito86/galaxy-raiders)
**FreezeOps version:** v0.1.0
**Date:** May 2026

---

## What Is Galaxy Raiders?

Galaxy Raiders is a feature-complete arcade shmup with 70+ JavaScript
files, 5 bosses, a rank/scoring system, Web Audio DSP engine, and
Android deployment via Capacitor. The project CLAUDE.md explicitly
forbids modifying 6 frozen zones: **hitboxes, difficulty, patterns,
score, rank, bosses.**

The codebase is actively developed with AI coding tools (Claude Code,
OpenCode) — making it a perfect candidate for deterministic policy
enforcement.

---

## Why FreezeOps?

Before FreezeOps, the project relied on a CLAUDE.md file to
communicate frozen zones to AI tools:

> *"NO modificar gameplay: hitboxes, dificultad, patrones, score, rank, bosses."*

**The problem:** AI coding tools don't reliably read or respect
CLAUDE.md. They generate code in context windows, not in
filesystem-aware sessions. A CLAUDE.md comment is invisible to the
tool making the change.

FreezeOps makes these boundaries **machine-enforceable.**

---

## Risks Protected

| Risk | Consequence if ignored | Protected by |
|---|---|---|
| **Gameplay drift** | Frame timing breaks, rAF replaced with setInterval | `protected_paths` on `game-loop.js`, `update.js` |
| **Hitbox changes** | Collision detection silently breaks | `protected_paths` on `collisions.js` |
| **Boss pattern corruption** | Bosses become too easy or impossible | `protected_paths` on `boss-patterns.js`, `boss-ai-movement.js` |
| **Difficulty skew** | Balance tuning accidentally modified | `protected_paths` on `balance.js`, `game-config.js` |
| **Rank/score drift** | Scoring integrity lost | `protected_paths` on `hardcore-rank.js`, `hardcore-combo.js` |
| **Audio DSP regression** | Web Audio API routing breaks | `protected_paths` on `audio-engine.js`, `audio-bus.js` |
| **Debugging leftovers** | `console.log`, `TODO_THROWAWAY` reach production | `forbidden_text` |
| **AI "optimizations"** | `setInterval`, `Math.random()` injected | `forbidden_text` |

---

## Configuration Applied

16 files across 5 frozen zones, plus 3 forbidden patterns:

```yaml
version: "1"
rules:
  - type: max_changed_lines
    value: 200

  # Core gameplay
  - type: protected_paths
    paths:
      - www/game-loop.js
      - www/collisions.js
      - www/update.js
      - www/combat.js
      - www/entities.js

  # Balance & difficulty
  - type: protected_paths
    paths:
      - www/balance.js
      - www/game-config.js

  # Bosses & patterns
  - type: protected_paths
    paths:
      - www/boss-patterns.js
      - www/boss-ai-movement.js
      - www/update-boss.js
      - www/enemy-pattern-hooks.js

  # Scoring & rank
  - type: protected_paths
    paths:
      - www/hardcore-rank.js
      - www/hardcore-combo.js

  # Audio DSP runtime
  - type: protected_paths
    paths:
      - www/audio-engine.js
      - www/audio-bus.js

  - type: forbidden_text
    patterns:
      - setInterval
      - Math.random(
      - TODO_THROWAWAY
```

[Full config →](https://github.com/Tanguito86/galaxy-raiders/blob/master/freezeops.yml)

---

## Smoke Test Results

All tests run against real Galaxy Raiders working tree, not mock data.

| Test | Expected | Actual |
|---|---|---|
| Clean working tree | PASS | ✅ PASS — 0 violations |
| Edit `www/menus.js` (safe) | PASS | ✅ PASS — menus.js not in any protected path |
| Edit `www/collisions.js` (protected) | FAIL | ❌ FAIL — `[protected_paths] Modified protected path` |
| Pre-existing dirty files | FAIL | ❌ FAIL — 4 violations detected |

### Pre-existing violations found

The Galaxy Raiders working tree had uncommitted changes that FreezeOps
immediately surfaced:

```
[masked — developer working tree]
Files checked: 11
Violations: 4

- [max_changed_lines] Exceeded limit (21K > 200 lines)
- [forbidden_text] setInterval in audio-music-gen.js
- [forbidden_text] Math.random( in audio-music-gen.js
- [forbidden_text] Math.random( in draw.js
```

This wasn't a false positive — these were real debugging leftovers
and AI-generated shortcuts sitting in the working tree. FreezeOps
caught them on its first run.

---

## What We Learned

### 1. `protected_paths` was the most valuable rule

The 16 protected files cover the exact frozen zones from CLAUDE.md.
This rule alone blocks the most dangerous class of changes: AI tools
touching gameplay code they don't understand.

### 2. `forbidden_text` found pre-existing debt

`setInterval` and `Math.random(` were already present in the working
tree. FreezeOps didn't just protect against *future* AI changes — it
surfaced *existing* patterns that should have been caught earlier.

### 3. `max_changed_lines` caught a massive working tree

21,000 lines of uncommitted changes in the working tree triggered the
200-line limit. This is a useful signal: if you have 21K lines of
uncommitted work, you're not doing small, reviewable PRs.

### 4. Config files need to avoid self-triggering

The Galaxy Raiders `freezeops.yml` lists `setInterval` in its
`forbidden_text` section. Since the YAML file contains the string
`setInterval` as a pattern name, the config itself could trigger
the rule on the first commit. We worked around this by removing
`forbidden_text` from the initial commit diff (only the config
file was new). Future versions should add a `--skip-patterns-in`
or file exclusion feature.

### 5. Rule packs are starting points, not universal truth

The `game-runtime-safe.yml` pack provided a solid foundation (200
line limit, gameplay/engine protection), but Galaxy Raiders needed
**exact file paths** — not glob patterns like `gameplay/**`. The
project doesn't use subdirectories; all 70 JS files live flat in
`www/`. This reinforces: packs accelerate onboarding, but every
repo needs customization.

---

## What's Not Protected (Yet)

Galaxy Raiders has ~70 JavaScript files. The 16 protected files
cover the most critical frozen zones, but these are intentionally
left unprotected:

- **Rendering** (`www/draw.js`, `www/renderer.js`) — visual changes
  are allowed. The game can get cosmetic improvements.
- **UI/Menus** (`www/menus.js`, `www/ui.js`) — explicitly safe to edit.
- **Input** (`www/input-*.js`) — input handling can change.
- **Parallax backgrounds** — visual polish, not gameplay.
- **Hardcore system beyond rank/combo** — pressure, rhythm, wave
  composition can evolve.

This is by design: FreezeOps protects what MUST not change, not
everything that COULD change.

---

## Conclusion

Galaxy Raiders went from "CLAUDE.md says don't touch this" to
"FreezeOps blocks PRs that touch this." The policy is now:

1. **Visible** — in `freezeops.yml`, not buried in a markdown file
2. **Enforceable** — CI blocks violations, not just warns
3. **Auditable** — every violation shows exact file, rule, and pattern

The CLAUDE.md is still there (it helps humans). But FreezeOps is
the enforcement layer that AI tools can't ignore.
