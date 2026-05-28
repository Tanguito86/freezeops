# Rule Types

FreezeOps supports three deterministic rule types. Rules are defined
in `freezeops.yml` and evaluated in order.

---

## max_changed_lines

Block PRs that exceed a line change threshold.

### Config

```yaml
rules:
  - type: max_changed_lines
    value: 500
```

### What it detects

Counts `addedLines` + `removedLines` across all changed files.
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

### What it detects

If any changed file's path matches a glob in `paths`, a violation is
raised. Uses [minimatch](https://github.com/isaacs/minimatch) for glob
matching.

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

### Config

```yaml
rules:
  - type: forbidden_text
    patterns:
      - eval(
      - setInterval
      - console.log("debug")
```

### What it detects

Scans each added line in every changed file. If a line **contains**
one of the patterns (substring match), a violation is raised.

### Use for

- Catching debugging leftovers (`console.log`, `debugger`)
- Blocking dangerous APIs (`eval`, `Function()`)
- Enforcing team conventions (`TODO_THROWAWAY`)

### Limitations

- Substring match only — not regex (regex planned for v0.2)
- Does not scan removed lines
- Does not check context (e.g., if the pattern is inside a comment)
