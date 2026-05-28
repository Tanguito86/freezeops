# Dogfooding FreezeOps

FreezeOps runs on itself. Every PR and push to `main` is audited by the
same tool we're building.

## What it validates

| Rule | Config | Purpose |
|---|---|---|
| `max_changed_lines` | 500 lines | Keep PRs reviewable |
| `forbidden_text` | `eval(`, `console.log("debug")`, `TODO_THROWAWAY` | Catch debugging leftovers |
| `protected_paths` | `packages/core/src/engine.ts` | Require extra scrutiny for rule engine changes |

> **Note:** `engine.ts` protection is a governance test. If it blocks real
> development, the rule can be relaxed or scoped down.

## Testing violations locally

```bash
# Create a file with a forbidden pattern
echo 'const x = eval("1+1");' > _test_violation.js

# Stage it
git add _test_violation.js

# Run FreezeOps
node packages/cli/dist/index.js
# → FreezeOps check FAIL
# → - [forbidden_text] Forbidden pattern detected
#     file: _test_violation.js
#     detail: "eval("

# Clean up
git reset HEAD _test_violation.js
rm _test_violation.js
```

## What to expect in GitHub Actions

### On a PR

1. **Annotations** — each violation appears as an inline error in the
   "Files changed" tab.

2. **Job summary** — a markdown table appears in the workflow run summary.

3. **PR comment** — a single comment is posted (or updated) with the full
   report. If `GITHUB_TOKEN` is missing, the comment is skipped with a
   warning — the check still passes or fails based on violations.

4. **Check status** — the workflow run shows ❌ if violations are found.

### On push to main

Annotations and job summary are generated. No PR comment is posted
(because there's no PR).

## Disabling PR comments

```yaml
- uses: ./
  with:
    comment: false
```

Or from the CLI:

```bash
node packages/cli/dist/index.js check --no-comment
```
