# Example PRs — What FreezeOps Catches

Realistic PR scenarios and how FreezeOps responds to each.

---

## Scenario 1: Safe UI Change

**What happened:** A developer added a new menu item to the game UI.

```
Changed files:
  src/ui/menu.js  +8 lines
```

**Rules in play:**
```yaml
max_changed_lines: 200
protected_paths:
  - src/gameplay/**
  - src/engine/**
```

**Result: ✅ PASS**
- 8 lines changed → under 200 limit
- `src/ui/menu.js` not in any protected path
- 0 violations

---

## Scenario 2: AI "Improves" the Game Loop

**What happened:** Claude Code replaced `requestAnimationFrame` with
`setInterval` for "performance."

```
Changed files:
  src/engine/loop.js  +3, -3 lines
    + setInterval(gameLoop, 16);
    - requestAnimationFrame(gameLoop);
```

**Rules in play:**
```yaml
max_changed_lines: 200
protected_paths:
  - src/engine/**
forbidden_text:
  - setInterval
```

**Result: ❌ FAIL — 2 violations**

```
- [protected_paths] Modified protected path
  file: src/engine/loop.js
  detail: matched glob: src/engine/**

- [forbidden_text] Forbidden pattern detected
  file: src/engine/loop.js
  detail: "setInterval"
```

**What happens next:** PR blocked. Developer sees exactly what went
wrong. The AI's "optimization" is caught before review.

---

## Scenario 3: Large Refactor

**What happened:** A developer refactored the billing module — split
one large file into 6 smaller files.

```
Changed files:
  src/billing/invoice.ts      +45, -120 lines
  src/billing/payment.ts      +80 new file
  src/billing/subscription.ts +65 new file
  src/billing/tax.ts          +55 new file
  src/billing/receipt.ts      +70 new file
  src/billing/index.ts        +15, -4 lines

  Total: +330, -124 = 454 lines changed
```

**Rules in play:**
```yaml
max_changed_lines: 400
protected_paths:
  - src/billing/**
forbidden_text:
  - eval(
```

**Result: ❌ FAIL — 2 violation types**

```
- [max_changed_lines] Diff exceeds limit
  detail: 454 lines changed (limit: 400)

- [protected_paths] Modified protected path
  file: src/billing/invoice.ts
  file: src/billing/payment.ts
  ... (all 6 files listed)
```

**What happens next:** The refactor is too large for one PR. The
developer splits it into 2 PRs (invoice+payment, then rest).
Protected_paths is expected here — billing is sensitive. But the
split PRs isolate the review.

---

## Scenario 4: Debugging Leftover

**What happened:** A developer fixed a bug but forgot to remove a
debug `console.log`.

```
Changed files:
  src/api/handler.ts  +12, -3 lines
    + console.log("DEBUG: user token =", token);
    + // Fixed the auth check
```

**Rules in play:**
```yaml
max_changed_lines: 400
forbidden_text:
  - console.log(
  - eval(
  - TODO_THROWAWAY
```

**Result: ❌ FAIL — 1 violation**

```
- [forbidden_text] Forbidden pattern detected
  file: src/api/handler.ts
  detail: "console.log("
```

**What happens next:** PR blocked. Developer removes the debug line
and re-pushes. Passes clean the second time. Embarrassment avoided.

---

## Scenario 5: Everything Fine

**What happened:** A developer added 2 new utility functions and tests.

```
Changed files:
  src/utils/format.ts  +25 lines
  test/format.test.ts  +45 lines
  Total: 70 lines
```

**Rules in play:**
```yaml
max_changed_lines: 400
protected_paths:
  - src/auth/**
forbidden_text:
  - eval(
  - console.log(
```

**Result: ✅ PASS**
- 70 lines → under 400 limit
- Neither file in `src/auth/**`
- No forbidden patterns in added lines
- 0 violations

---

## Key Takeaways

1. **One violation = PR blocked.** No partial passes.
2. **Clear messaging.** Every violation says exactly what, where, and why.
3. **Multiple rules fire simultaneously.** One bad file can trigger
   protected_paths AND forbidden_text.
4. **PASS is silent.** When nothing is wrong, FreezeOps says nothing
   beyond a single "PASS" line.
