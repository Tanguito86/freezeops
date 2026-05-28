# Changelog

## [Unreleased]

### Features

- **`max_changed_lines` path scoping** — `paths` field limits line counting to specific globs, enabling per-zone thresholds (e.g., 40 lines for `src/auth/**`, 500 globally)

## [0.3.0] — 2026-05-28

### Features

- **SARIF output** — optional SARIF 2.1.0 report via `--sarif` flag
- **`--sarif` / `-s` CLI flag** — writes violations as SARIF results (ruleId, level, message, locations, properties)
- **GitHub Action `sarif` input** — same as CLI flag, compatible with `github/codeql-action/upload-sarif`
- **Code Scanning compatible** — SARIF reports can be uploaded to GitHub Code Scanning

### Docs

- `docs/action.md`: SARIF section with `upload-sarif` workflow example
- `docs/cli.md`: SARIF output usage and field reference
- `README.md`: SARIF example in Install from npm section

### Breaking changes

None. SARIF output is optional and does not change existing behavior.

## [0.2.0] — 2026-05-28

### Features

- **Global `ignore`** — files matching these glob patterns are excluded from ALL rules
- **Rule-level `exclude`** — all three rule types support per-rule glob exclusions
- **Regex opt-in** — `forbidden_text` supports `regex: true` for full regex matching
- **Better violations** — `matchedPattern` and `matchedGlob` fields for precise diagnostics

### Rule packs

- All packs now include `ignore` for `node_modules/**`, `dist/**`, `coverage/**`

### Docs

- Updated `docs/rules.md` with `ignore`, `exclude`, and `regex` documentation
- Updated `docs/rule-packs.md` with global ignore section
- Updated `README.md` config example with new features

### npm Packaging

- Removed `"private": true` from `@tanguito/freezeops-core` and `@tanguito/freezeops`
- Added `repository`, `homepage`, `bugs`, `keywords`, `license` fields
- Added `files` whitelist (dist/ only) and `publishConfig`
- Fixed CLI `main` and `exports` to point to dist
- Added `docs/npm-install.md` and `docs/npm-publish-checklist.md`
- README: added Install from npm section
- Published to npm as `@tanguito/freezeops-core` and `@tanguito/freezeops`

### Breaking changes

None. v0.1.0 configs work unchanged.

## [0.1.0] — 2026-05-28

Initial public release.

### Core

- Deterministic rule engine with three rule types
- YAML config loader with validation
- Git diff reader (staged, working tree, base-ref comparison)
- TypeScript monorepo (core + CLI), ESM, strict mode

### Rules

- `max_changed_lines` — block PRs that exceed a line change threshold
- `protected_paths` — block changes to glob-matched files
- `forbidden_text` — block added lines containing banned patterns

### GitHub Action

- `action.yml` with `config`, `base-ref`, and `comment` inputs
- Inline annotations on violating files
- Job summary with violations table
- PR comment reporter (single comment, auto-update, no duplicates)
- Graceful fallback when `GITHUB_TOKEN` is missing

### CLI

- Local mode: console output with structured violations
- `check` command with `--config`, `--base-ref`, `--no-comment` flags
- GitHub Actions mode: workflow commands + summary + annotations

### Dogfooding

- FreezeOps audits its own repo
- Workflow runs on every PR and push to main
- Rule engine file protected as governance test
