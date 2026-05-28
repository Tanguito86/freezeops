# FreezeOps v0.2.0 — Release Notes

**Date:** 2026-05-28
**Tag:** v0.2.0

---

## What Changed

v0.2.0 adds real-world ergonomics based on feedback from two production
integrations: Galaxy Raiders (HTML5 shmup) and SoundBend (Android/Kotlin
DSP). No breaking changes — v0.1.0 configs work exactly as before.

### Three new features

#### 1. Global `ignore`

Exclude files from ALL rules. Build output, generated code, docs —
anything that changes routinely but shouldn't trigger violations.

```yaml
ignore:
  - node_modules/**
  - dist/**
  - coverage/**
  - docs/**
```

#### 2. Rule-level `exclude`

Carve out safe zones within protected areas. All three rule types
support per-rule exclusions.

```yaml
rules:
  - type: forbidden_text
    patterns:
      - setInterval
    exclude:
      - docs/**        # docs can mention setInterval

  - type: protected_paths
    paths:
      - src/**
    exclude:
      - src/config.ts   # config can change freely
```

#### 3. Regex opt-in

`forbidden_text` now supports regex matching when you need more precision
than substring matching.

```yaml
rules:
  - type: forbidden_text
    regex: true
    patterns:
      - "console\\.log\\("
      - "TODO_[A-Z_]+"
```

### Also

- **Better violations** — `matchedPattern` and `matchedGlob` fields
  for precise diagnostics
- **Updated starter packs** — all five packs now include common
  `ignore` paths (`node_modules/**`, `dist/**`, `coverage/**`)

---

## Why This Matters

Two real-world integrations surfaced three patterns:

| Problem | Solution | Feature |
|---|---|---|
| Config files self-trigger `forbidden_text` | Exclude docs/config from checks | `exclude` |
| Build output counted toward `max_changed_lines` | Remove build dirs globally | `ignore` |
| Substring matching too coarse for `console.log(` | Allow full regex matching | `regex: true` |

FreezeOps now adapts to your repo structure without false positives.

---

## Breaking Changes

**None.** All v0.1.0 configs are valid v0.2.0 configs. New fields
(`ignore`, `exclude`, `regex`) are optional.

---

## Upgrade from v0.1.0

1. **If you use a starter pack,** copy the updated version:
   ```bash
   cp configs/web-safe.yml ./freezeops.yml
   ```

2. **If you have a custom config,** add an `ignore` section:
   ```yaml
   ignore:
     - node_modules/**
     - dist/**
     - coverage/**
   ```

3. **Optional:** add `exclude` to rules that trigger on docs or config files.

That's it. No other changes needed.

---

## Smoke Test Results

All tests pass on the v0.2.0 codebase:

| Test | Result |
|---|---|
| `npm run validate` | ✅ PASS |
| Dogfood root | ✅ PASS |
| minimal-safe pack | ✅ PASS |
| web-safe pack | ✅ PASS |
| node-safe pack | ✅ PASS |
| game-runtime-safe pack | ✅ PASS |
| android-safe pack | ✅ PASS |
| `forbidden_text` exclude `docs/**` | ✅ PASS |
| Regex mode detects pattern | ✅ FAIL (correct) |
| Invalid regex → clear error | ✅ SyntaxError message |
| `protected_paths` with `exclude` | ✅ PASS |

---

## What's Next (v0.3.0 candidates)

- `max_changed_lines` per-file mode
- SARIF output
- `--fix` dry-run mode
- More starter packs (Python, Rust, Go)
- GitHub Marketplace listing

---

## Available on npm

FreezeOps v0.2.0 is published to npm under `@tanguito`.

```bash
npm install -D @tanguito/freezeops
npx freezeops check
```

- [@tanguito/freezeops-core](https://www.npmjs.com/package/@tanguito/freezeops-core) — deterministic rules engine
- [@tanguito/freezeops](https://www.npmjs.com/package/@tanguito/freezeops) — CLI + GitHub Action
