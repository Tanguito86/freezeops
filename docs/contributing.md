# Contributing to FreezeOps

FreezeOps is deterministic guardrails for AI-assisted development.
We keep it simple: no AI in the tool itself, no cloud, no complex
dependencies. Just rules.

## Philosophy

1. **Deterministic first.** Every rule must produce the same output
   for the same input. No heuristics, no ML, no "probably fine."

2. **CI-first.** FreezeOps is a GitHub Action. The CLI exists to
   support local testing and the CI workflow. Design for CI first,
   CLI second.

3. **No breaking changes to configs.** Once a rule type or config
   format is released, it stays backward-compatible. New fields are
   optional. Old fields keep working.

4. **Small surface area.** The engine is ~120 lines. Rules are ~40
   lines each. Keep it that way. A new rule should fit in a single
   file under 80 lines.

## What to contribute

| Good contributions | Avoid |
|---|---|
| New rule types (deterministic) | AI-powered rules |
| New rule packs (configs/) | Dashboard / web UI |
| Docs, examples, guides | Cloud services |
| Bug fixes for existing rules | npm packages (yet) |
| Workflow improvements | Breaking config format |

## Getting Started

```bash
git clone https://github.com/Tanguito86/freezeops.git
cd freezeops
npm install
npm run validate        # Build + typecheck
node packages/cli/dist/index.js check --config freezeops.yml  # Dogfood
```

## Adding a Rule Pack

See [docs/first-rule-pack.md](first-rule-pack.md) for a step-by-step
guide. TL;DR:

1. Create `configs/YOUR_PACK_NAME.yml`
2. Follow the existing format (2-3 rules, comments explaining why)
3. Test with the CLI: `node packages/cli/dist/index.js check --config configs/YOUR_PACK_NAME.yml`
4. Add to the pack table in README.md and docs/config-copy/README.md

## Adding a Rule Type

See [docs/architecture.md](architecture.md) for the engine internals.

1. Add your type to `packages/core/src/types.ts`
2. Add config validation in `packages/core/src/config.ts`
3. Add rule logic in `packages/core/src/engine.ts`
4. Build and test: `npm run validate`
5. Smoke test with a real config

## Pull Requests

- Small, focused PRs. One rule, one pack, one fix per PR.
- Run `npm run validate` before pushing.
- Run dogfood: `node packages/cli/dist/index.js check --config freezeops.yml`
- If adding a pack, test it: `node packages/cli/dist/index.js check --config configs/YOUR_PACK.yml`
- Use the PR template — it's in `.github/PULL_REQUEST_TEMPLATE.md`

## Commit Convention

```
type: description

- Bullet points for what changed
- Validation notes
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`

## Code of Conduct

Be kind. This is a tool for making software safer. The people using
it are trying to protect code they care about. Respect that.

## Questions?

Open a [Config Help](https://github.com/Tanguito86/freezeops/issues/new?template=config-help.yml) issue.
