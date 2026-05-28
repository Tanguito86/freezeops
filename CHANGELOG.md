# Changelog

## v0.1.0 — 2026-05-28

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
