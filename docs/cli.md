# CLI

FreezeOps can be run locally from the terminal for pre-commit checks
or manual audits.

---

## Quickstart

```bash
git clone https://github.com/tanguito/freezeops.git
cd freezeops
npm install && npm run build
```

---

## Commands

### Check working tree

```bash
node packages/cli/dist/index.js
```

Checks unstaged changes against `freezeops.yml` in the current directory.

### Check staged changes

```bash
node packages/cli/dist/index.js check
```

Checks staged changes first. Falls back to working tree if nothing is staged.
Same as running without arguments in a typical pre-commit workflow.

### Custom config path

```bash
node packages/cli/dist/index.js check --config path/to/freezeops.yml
```

### Compare against a base ref

```bash
node packages/cli/dist/index.js check --base-ref origin/main
```

Runs `git diff origin/main...HEAD` and checks the resulting diff.
Useful for simulating what the GitHub Action would do on a PR.

### Disable PR comments (GitHub Actions mode)

```bash
node packages/cli/dist/index.js check --no-comment
```

Only relevant when `GITHUB_ACTIONS=true`.

---

## Behavior

### Staged vs working tree

| State | What gets checked |
|---|---|
| Staged changes exist | `git diff --cached` |
| No staged changes | `git diff` (working tree) |
| `--base-ref` provided | `git diff baseRef...HEAD` |

### GitHub Actions detection

When `GITHUB_ACTIONS=true`:
- Output uses workflow commands (`::notice::`, `::error::`)
- Job summary is written
- PR comment is posted if `pull_request` event + token available

### Exit codes

| Code | Meaning |
|---|---|
| `0` | All rules passed |
| `1` | Violations found or error occurred |

---

## Output

### Clean pass

```
FreezeOps check PASS
Files checked: 3
Rules checked: 2
Violations: 0
```

### Violations

```
FreezeOps check FAIL
Files checked: 3
Rules checked: 2
Violations: 2

- [protected_paths] Modified protected path
  file: gameplay/player.js
  detail: matched glob: gameplay/**
- [forbidden_text] Forbidden pattern detected
  file: utils.js
  detail: "eval("
```
