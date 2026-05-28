# Quickstart

Get FreezeOps running on your repo in under 2 minutes.

---

## 1. Pick a Rule Pack

Choose the config that matches your project:

```bash
# Any project
cp configs/minimal-safe.yml ./freezeops.yml

# Web app (React, Vue, Svelte, Next.js)
cp configs/web-safe.yml ./freezeops.yml

# Node.js backend (Express, Fastify, NestJS)
cp configs/node-safe.yml ./freezeops.yml

# Game, DSP, or real-time runtime
cp configs/game-runtime-safe.yml ./freezeops.yml

# Android app (Kotlin, Java, Compose)
cp configs/android-safe.yml ./freezeops.yml
```

## 2. Customize (30 seconds)

Open `freezeops.yml` and adjust:

- **Paths**: change `src/auth/**` to match your actual folder structure
- **Limits**: tune `max_changed_lines` for your team's PR norms
- **Patterns**: add or remove `forbidden_text` entries

Every pack includes comments explaining what each rule does.

## 3. Add the GitHub Action

Copy the workflow template:

```bash
cp examples/workflows/freezeops.yml .github/workflows/freezeops.yml
```

Or create `.github/workflows/freezeops.yml` manually:

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
          fetch-depth: 0

      - name: Clone & build FreezeOps
        run: |
          git clone https://github.com/Tanguito86/freezeops.git /tmp/freezeops
          cd /tmp/freezeops
          npm install
          npm run build

      - name: Run FreezeOps
        run: |
          cd /tmp/freezeops
          node packages/cli/dist/index.js check \
            --config "$GITHUB_WORKSPACE/freezeops.yml" \
            --base-ref "origin/${{ github.base_ref }}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 4. Open a PR

That's it. On your next PR, FreezeOps will:

- Scan changed files against your rules
- Post inline annotations on violations
- Add a summary comment to the PR

If the PR violates a rule → ❌ blocked with a clear explanation.
If it stays within bounds → ✅ passes silently.

---

## Local Usage

You don't need a PR to test. Clone the repo and run locally:

```bash
git clone https://github.com/Tanguito86/freezeops.git
cd freezeops
npm install && npm run build

# Check your working tree
node packages/cli/dist/index.js check --config ./freezeops.yml

# Check against a base branch
node packages/cli/dist/index.js check \
  --config ./freezeops.yml \
  --base-ref origin/main
```

---

## Testing the Demo

FreezeOps ships with a demo project. See it in action:

```bash
cd examples/shmup-demo

# Should pass (clean state)
node ../../packages/cli/dist/index.js --config freezeops.yml

# Trigger a violation
echo "// oops" >> src/gameplay/player.js
node ../../packages/cli/dist/index.js --config freezeops.yml
# → FAIL: protected_paths

# Clean up
git checkout src/gameplay/player.js
```

---

## Troubleshooting

### "base-ref not found" or empty diff

FreezeOps compares the PR branch against a base ref. Make sure:

- `actions/checkout@v4` has `fetch-depth: 0` (fetches full git history)
- `base-ref` matches the target branch (usually `origin/main` or `${{ github.base_ref }}`)

### PR comment doesn't appear

The PR comment reporter needs:

- `permissions.pull-requests: write` in the workflow
- `GITHUB_TOKEN` passed as an environment variable
- The workflow must run on `pull_request` events (not just `push`)

### "config file not found"

The `--config` flag expects a path relative to the current working directory.
In GitHub Actions, `$GITHUB_WORKSPACE` is the repo root. Use:

```
--config "$GITHUB_WORKSPACE/freezeops.yml"
```

### Documentation triggers forbidden_text

If your freezeops.yml lists patterns like `eval(` or `setInterval` and your
docs explain those patterns, the docs will trigger violations. Fix:

- Remove docs/ from protected paths
- Use more specific patterns (e.g., `\beval(` → wait, no regex yet — use `--config` with a different config for docs, or add docs to a `.freezeopsignore`)

### "permission denied" on PR comment

Make sure your workflow has:

```yaml
permissions:
  pull-requests: write
```

Not just `contents: read`.
