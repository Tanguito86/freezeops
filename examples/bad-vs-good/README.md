# Bad vs Good — Rule Packs

Side-by-side examples of configs that go wrong vs configs that work.

---

## 1. Protected Paths: Too Broad vs Surgical

### ❌ Bad — protects everything

```yaml
rules:
  - type: protected_paths
    paths:
      - src/**
      - lib/**
      - app/**
```

**Why it fails:** Nothing can change. Every PR triggers protected_paths.
Developers disable FreezeOps within a day.

### ✅ Good — surgical protection

```yaml
rules:
  - type: protected_paths
    paths:
      - src/auth/**
      - src/billing/**
      - src/payments/**
```

**Why it works:** Only the 3 most sensitive subsystems are protected.
UI changes, utility functions, tests — all safe to edit.

---

## 2. max_changed_lines: Wrong Number

### ❌ Bad — too strict

```yaml
rules:
  - type: max_changed_lines
    value: 10
```

**Why it fails:** Even a one-line bug fix with a test might add 12 lines.
Every PR gets blocked. False positive rate: ~90%.

### ✅ Good — realistic

```yaml
rules:
  - type: max_changed_lines
    value: 300
```

**Why it works:** Catches truly massive PRs (refactors, AI rewrites)
while letting normal work through.

---

## 3. forbidden_text: Too Broad vs Specific

### ❌ Bad — catches legitimate code

```yaml
rules:
  - type: forbidden_text
    patterns:
      - log
      - exec
      - function
      - import
```

**Why it fails:** `log` matches "login", "logout", "blog", "catalog".
`exec` matches "executive", "execution". `function` matches every
function declaration. False positive rate: ~100%.

### ✅ Good — specific and intentional

```yaml
rules:
  - type: forbidden_text
    patterns:
      - console.log(
      - eval(
      - child_process.exec(
      - .only(
```

**Why it works:** Each pattern is specific enough to catch only the
dangerous usage. `console.log(` catches debug logs, not "logging".
`.only(` catches leftover Mocha/Jest focused tests.

---

## 4. Wrong Paths for the Ecosystem

### ❌ Bad — generic paths that don't match

```yaml
# For a Python project
rules:
  - type: protected_paths
    paths:
      - src/auth/**
      - components/**
```

**Why it fails:** Python projects don't have `src/` or `components/`.
These rules match nothing — FreezeOps runs but protects nothing.

### ✅ Good — ecosystem-specific paths

```yaml
# For a Python/Django project
rules:
  - type: protected_paths
    paths:
      - myapp/auth/**
      - myapp/billing/**
      - myapp/migrations/**
```

**Why it works:** Paths match the actual project structure. Protection
is real.

---

## 5. Rules That Fight Each Other

### ❌ Bad — contradictory

```yaml
rules:
  - type: max_changed_lines
    value: 500

  - type: forbidden_text
    patterns:
      - import              # Blocks every import statement
```

**Why it fails:** Every file with imports triggers forbidden_text.
The max_changed_lines rule never even gets a chance to work.

### ✅ Good — complementary

```yaml
rules:
  - type: max_changed_lines
    value: 500

  - type: forbidden_text
    patterns:
      - eval(
      - TODO_THROWAWAY

  - type: protected_paths
    paths:
      - src/auth/**
```

**Why it works:** Each rule catches a different class of problem.
They complement each other without overlap.

---

## Key Takeaways

1. **Surgical, not blanket.** Protect specific paths, not entire trees.
2. **Realistic limits.** Set thresholds that catch outliers, not every PR.
3. **Specific patterns.** Substring matching needs precision.
4. **Ecosystem-aware.** Paths must match your actual project structure.
5. **Test your pack.** Run it on a clean tree — 0 violations expected.
