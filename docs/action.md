# GitHub Action

FreezeOps runs as a [GitHub Action](https://docs.github.com/en/actions).

---

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `config` | No | `freezeops.yml` | Path to the config file |
| `base-ref` | No | _(none)_ | Base ref for diff (e.g. `origin/main`) |
| `comment` | No | `true` | Post or update a PR comment |

---

## Permissions

```yaml
permissions:
  contents: read
  pull-requests: write
```

- `contents: read` — needed for checkout
- `pull-requests: write` — needed for PR comments

If you don't need PR comments, you can omit `pull-requests: write`
and set `comment: false`.

---

## Full Workflow Example

```yaml
name: FreezeOps
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  freezeops:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0            # needed for base-ref comparison

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install & build
        run: npm install && npm run build

      - uses: tanguito/freezeops@main
        with:
          config: freezeops.yml
          base-ref: origin/main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> **Important:** `fetch-depth: 0` is required for `base-ref` to work.
> Without it, the action can only check working tree / staged changes.

---

## Without PR Comments

```yaml
- uses: tanguito/freezeops@main
  with:
    config: freezeops.yml
    base-ref: origin/main
    comment: false
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Annotations and job summary are still generated. Only the PR comment
is skipped.

---

## Output

### On pass

- Job summary with status
- PR comment (if enabled) with ✅ PASS

### On failure

- Inline annotations on violating files
- Job summary with violations table
- PR comment (if enabled) with violations table
- Workflow run marked as ❌ failed
