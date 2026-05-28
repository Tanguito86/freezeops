# Install from npm

FreezeOps is available as `@freezeops/cli` on npm.

## Quick Install

```bash
npm install -D @freezeops/cli
```

This installs both the CLI and the `@freezeops/core` engine as a dependency.

## Usage

```bash
# Run a safety check (looks for freezeops.yml in current directory)
npx freezeops check

# With a custom config path
npx freezeops check --config path/to/freezeops.yml

# Compare against a base ref (for CI)
npx freezeops check --base-ref origin/main
```

## GitHub Action (v0.2.0+)

```yaml
# .github/workflows/freezeops.yml
name: FreezeOps
on: [pull_request]

permissions:
  contents: read
  pull-requests: write

jobs:
  freezeops:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: Tanguito86/freezeops@v0.2.0
        with:
          config: freezeops.yml
```

Or use the npm-installed version in CI:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20

- run: npm ci
- run: npx freezeops check
```

## Requirements

- Node.js >= 20.0.0
- Git repository (FreezeOps reads `git diff`)

## Troubleshooting

### `Config file not found`

FreezeOps looks for `freezeops.yml` in the current directory.
Create one or point to it:

```bash
npx freezeops check --config ./path/to/freezeops.yml
```

### `Not a git repository`

FreezeOps must run inside a git repository. It reads the working
tree diff to identify changed files.

### `command not found: freezeops`

Make sure `@freezeops/cli` is installed:

```bash
npm install -D @freezeops/cli
npx freezeops check
```

### No violations but I expected some

FreezeOps checks `git diff` (staged first, then working tree).
If you have no uncommitted changes, there are no files to check.
Try making a change first, or use `--base-ref` to compare branches.
