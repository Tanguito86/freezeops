# How FreezeOps Works

A plain-English explanation of what happens when you run FreezeOps.

---

## The 3-Second Version

You write rules in `freezeops.yml`. FreezeOps checks every PR against
those rules. If a rule is broken → blocked. If not → passes.

No AI. No cloud. No false positives.

---

## Step by Step

### 1. You define the rules

```yaml
# freezeops.yml
version: "1"
rules:
  - type: max_changed_lines
    value: 300              # No PR can change more than 300 lines

  - type: protected_paths
    paths:
      - src/auth/**         # Auth code is sensitive

  - type: forbidden_text
    patterns:
      - eval(               # eval is dangerous
      - console.log(        # No debug logs in production
```

### 2. Someone opens a PR

A developer (or an AI coding tool) opens a PR. It touches 4 files:

- `src/auth/login.ts` (changed 2 lines)
- `src/ui/menu.tsx` (changed 150 lines)
- `src/utils/helpers.ts` (changed 200 lines — includes `console.log("debug")`)

### 3. FreezeOps runs

The GitHub Action workflow triggers. FreezeOps:

1. Runs `git diff origin/main...HEAD` to see what changed
2. Parses the diff into a list of files with added/removed lines
3. Checks each file against each rule

### 4. Rule checking

**max_changed_lines**: 2 + 150 + 200 = 352 lines changed. Limit is 300.
→ ❌ Violation.

**protected_paths**: `src/auth/login.ts` matches `src/auth/**`.
→ ❌ Violation.

**forbidden_text**: `src/utils/helpers.ts` has `console.log(` in added lines.
→ ❌ Violation.

### 5. Result

```
FreezeOps check FAIL
Files checked: 3
Rules checked: 3
Violations: 3

- [max_changed_lines] Diff exceeds limit
  detail: 352 lines changed (limit: 300)

- [protected_paths] Modified protected path
  file: src/auth/login.ts
  detail: matched glob: src/auth/**

- [forbidden_text] Forbidden pattern detected
  file: src/utils/helpers.ts
  detail: "console.log("
```

The PR is blocked. The developer knows exactly why.

---

## What Makes It Deterministic?

Every check is a pure function:

- **Same diff → same violations.** No randomness, no heuristics.
- **Same config → same behavior.** No learning, no adaptation.
- **No network.** Everything runs locally in CI.
- **No AI.** The tool doesn't decide if a change is safe — you do,
  via the rules.

If you run FreezeOps twice on the same PR, you get the exact same
output. Always.

---

## When FreezeOps Helps

- **AI coding tools** (Claude, Cursor, Copilot) that make changes
  without understanding which code is sensitive
- **Large teams** where not everyone knows which files are off-limits
- **Regulated code** (auth, payments, DSP) where changes need review
- **Game runtimes** where "minor optimizations" break determinism
- **Onboarding** — new contributors learn boundaries from the config

## When FreezeOps Doesn't Help

- **Code quality** — it doesn't review logic, just enforces boundaries
- **Security audits** — it catches patterns, not vulnerabilities
- **Test coverage** — it doesn't know if your code works
- **Replacing code review** — it's a guardrail, not a reviewer

---

## The Config File

`freezeops.yml` is the single source of truth. It lives in your repo
root. Every contributor, every AI tool, every CI run sees the same
rules.

That's the whole idea: **boundaries you define, enforced deterministically.**
