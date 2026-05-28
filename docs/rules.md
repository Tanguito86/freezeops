# Rule Types

FreezeOps supports three deterministic rule types. Rules are defined
in `freezeops.yml` and evaluated in order.

---

## Global `ignore`

Files matching these glob patterns are excluded from ALL rules. They
don't count toward `max_changed_lines` and won't trigger any violations.

```yaml
ignore:
  - docs/**
  - README.md
  - dist/**
  - coverage/**
  - node_modules/**
```

**Use for:** build output, generated code, documentation — anything
where changes are routine and shouldn't trigger rules.

---

## Rule-level `exclude`

All three rule types support an optional `exclude` field. Files matching
these globs are excluded from that specific rule only.

```yaml
rules:
  - type: forbidden_text
    patterns:
      - console.log(
    exclude:
      - docs/**       # docs can mention console.log without violation

  - type: protected_paths
    paths:
      - src/**
    exclude:
      - src/config.ts  # allow changes to config while protecting the rest

  - type: max_changed_lines
    value: 500
    exclude:
      - *.md           # don't count markdown against the line limit
```

**Use for:** carving out safe zones within protected areas, or
excluding documentation from content checks.

---

## max_changed_lines

Block PRs that exceed a line change threshold.

### Config

```yaml
rules:
  - type: max_changed_lines
    value: 500
```

Or with `exclude`:

```yaml
rules:
  - type: max_changed_lines
    value: 500
    exclude:
      - docs/**
      - *.md
```

### What it detects

Counts `addedLines` + `removedLines` across all changed files
(after applying global `ignore` and rule-level `exclude`).
If the total exceeds `value`, the PR is blocked.

### Use for

- Keeping PRs reviewable
- Enforcing small, focused changes
- Preventing AI-generated mega-diffs

### Limitations

- Does not distinguish between code, comments, or whitespace
- Binary file changes are not counted

---

## protected_paths

Block changes to files or directories that require extra scrutiny.

### Config

```yaml
rules:
  - type: protected_paths
    paths:
      - gameplay/**
      - dsp/runtime/**
      - packages/core/src/engine.ts
```

Or with `exclude`:

```yaml
rules:
  - type: protected_paths
    paths:
      - src/**
    exclude:
      - src/config.ts     # config can change freely
```

### What it detects

If any changed file's path matches a glob in `paths` (and doesn't
match `exclude`), a violation is raised. Uses
[minimatch](https://github.com/isaacs/minimatch) for glob matching.

Violations include `matchedGlob` — the specific glob that triggered
the violation.

### Use for

- Freezing stable modules
- Requiring human review for critical paths
- Protecting runtime code from AI drift

### Limitations

- One violation per file (does not list every matching glob)
- Only checks file paths, not content

---

## forbidden_text

Block PRs that introduce banned patterns in new or modified lines.

### Config (substring match — default)

```yaml
rules:
  - type: forbidden_text
    patterns:
      - eval(
      - setInterval
      - console.log("debug")
```

### Config (regex mode — opt-in)

```yaml
rules:
  - type: forbidden_text
    regex: true
    patterns:
      - "console\\.log\\("
      - "TODO_[A-Z_]+"
      - "debugger;?\\s*$"
```

Or with `exclude`:

```yaml
rules:
  - type: forbidden_text
    patterns:
      - setInterval
    exclude:
      - docs/**
      - README.md
```

### What it detects

- **Substring mode (default):** scans each added line in every changed
  file. If a line **contains** one of the patterns, a violation is raised.
- **Regex mode (`regex: true`):** compiles each pattern as a `RegExp`
  and tests each added line. Invalid regex patterns are caught at config
  load time with a clear error message.

Violations include `matchedPattern` — the specific pattern that triggered
the violation.

### Use for

- Catching debugging leftovers (`console.log`, `debugger`)
- Blocking dangerous APIs (`eval`, `Function()`)
- Enforcing team conventions (`TODO_THROWAWAY`)
- Regex mode: matching patterns with surrounding context (e.g., `console.log(` anywhere vs only `console.log`)

### Limitations

- Default: substring match only (not regex — use `regex: true` to opt in)
- Does not scan removed lines
- Does not check context (e.g., if the pattern is inside a comment)
- Regex mode: patterns must be valid JavaScript regex — invalid patterns
  cause a config load error
