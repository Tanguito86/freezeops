# Contributing

Thanks for your interest in FreezeOps.

## Philosophy

FreezeOps is **deterministic first.** Every feature must:

1. Produce the same output for the same input — always
2. Work offline with no network calls during audits
3. Be small enough for one person to reason about
4. Have zero AI/LLM dependency

## Setup

```bash
git clone https://github.com/tanguito/freezeops.git
cd freezeops
npm install
npm run validate    # typecheck + build
```

## Making Changes

1. Run `npm run validate` before committing
2. Add tests for new rule types
3. Keep PRs under 500 lines (we dogfood `max_changed_lines`)
4. Don't introduce new dependencies without discussion

## Commit Style

Conventional commits:
```
feat: add X rule type
fix: handle empty diff
docs: update CLI reference
chore: dogfood config update
```

## What We Don't Want (Yet)

- AI/LLM features
- Cloud backends
- Dashboards
- New frameworks
- Major refactors
- Scope creep

Small, focused improvements are always welcome.
