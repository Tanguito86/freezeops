# FreezeOps v0.1.0

**Deterministic guardrails for AI-assisted development.**

Initial public release of FreezeOps — a policy engine that protects
sensitive code from AI coding tool changes. No AI. No cloud. Just rules.

---

## What's Included

### Rule Engine (core)
- 3 rule types: `max_changed_lines`, `protected_paths`, `forbidden_text`
- YAML config loader with exhaustive validation
- Git diff reader: staged, working tree, and base-ref comparison
- TypeScript, ESM, strict mode, Node 20+

### CLI
- Local mode: console output with structured violation reports
- `check` command with `--config`, `--base-ref`, and `--no-comment`
- GitHub Actions mode: workflow commands, job summary, inline annotations

### GitHub Action
- `action.yml` using Node 20
- Inputs: `config`, `base-ref`, `comment`
- Inline annotations on violating files (PR diff view)
- Job summary with violations table
- PR comment reporter — single comment, auto-update, no duplicates
- Graceful fallback when `GITHUB_TOKEN` is missing

### Dogfooding
- FreezeOps audits its own repo on every PR and push to main

### Demo
- `examples/shmup-demo/` — HTML5 game with protected gameplay code
- Edit the menu → PASS. Touch the game loop → FAIL.

---

## Known Limitations

- Diff parser handles unified diff only (add/modify/delete)
- `forbidden_text` uses substring matching, not regex
- PR comments require `pull-requests: write` permission
- Not published to npm yet
- Not available on GitHub Marketplace yet

---

## Next Steps

- **v0.2.0**: more rule types, file exclusions, `--fix` dry-run mode
- **v0.3.0**: npm package, GitHub Marketplace listing
- **v1.0.0**: audit mode comparisons, team configs, semantic rule ideas
