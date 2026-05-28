# Create Your First Rule Pack

A step-by-step guide to creating a new pack in under 15 minutes.

---

## What's a Rule Pack?

A `.yml` file in `configs/` with 2-3 rules tuned for a specific
project type. Anyone can copy it to their repo as `freezeops.yml`
and get instant protection.

---

## Step 1: Pick a Project Type

What kind of project are you protecting?

| Project type | Example pack | What it protects |
|---|---|---|
| Web app | `web-safe.yml` | Auth, middleware, XSS |
| Backend | `node-safe.yml` | Auth, billing, migrations |
| Game | `game-runtime-safe.yml` | Gameplay, engine, timing |
| Android | `android-safe.yml` | Audio, billing, debug logs |
| Universal | `minimal-safe.yml` | Line limits, leftovers |

If your project type isn't listed → create a new one! This guide
walks you through it.

---

## Step 2: Create the File

```bash
cp configs/minimal-safe.yml configs/YOUR_NAME-safe.yml
```

Example: `configs/python-safe.yml`, `configs/rust-safe.yml`,
`configs/react-native-safe.yml`.

**Naming convention:**
- Lowercase, hyphens, ends with `-safe.yml`
- Descriptive: `python-django-safe.yml`, not `my-pack.yml`

---

## Step 3: Fill in the Rules

Every pack has this structure:

```yaml
# ── your-pack-name ─────────────────────────────────────────
# One-line description of what this pack protects.
#
# Two-line explanation of why these protections matter.
# Copy to your repo root as freezeops.yml
# ───────────────────────────────────────────────────────────

version: "1"
rules:
  - type: max_changed_lines
    value: ???           # Pick a number

  - type: protected_paths
    paths:
      - ???/**           # List sensitive directories

  - type: forbidden_text
    patterns:
      - ???              # List dangerous patterns
```

### Picking `max_changed_lines`

| Project type | Suggested value | Why |
|---|---|---|
| Games / real-time | 200 | Gameplay changes must be surgical |
| Web apps | 300 | Frontend PRs should be focused |
| Mobile apps | 300 | Mobile diffs should be tight |
| Backends | 400 | Backend PRs can be larger |
| Libraries / SDKs | 200 | API changes need careful review |

### Picking `protected_paths`

Think: **what code would cause the most damage if an AI changed it
without review?**

- Auth flows → `src/auth/**`, `middleware/auth/**`
- Payments → `src/billing/**`, `src/payments/**`
- Database schemas → `prisma/migrations/**`, `src/db/migrations/**`
- Game mechanics → `gameplay/**`, `engine/**`, `physics/**`
- Audio/DSP → `dsp/**`, `audio/**`, `src/main/java/**/audio/**`

Keep it to **3-4 paths max**. Too many paths = noise.

### Picking `forbidden_text`

Think: **what patterns do AI tools generate that are dangerous in
your ecosystem?**

| Ecosystem | Dangerous patterns |
|---|---|
| JavaScript/TS | `eval(`, `child_process.exec(`, `dangerouslySetInnerHTML` |
| Python | `eval(`, `exec(`, `subprocess.call(` |
| Java/Kotlin | `Log.d(`, `System.exit(`, `Runtime.getRuntime().exec(` |
| Game dev | `setInterval`, `Math.random(`, `new Date()` (if deterministic) |
| General | `TODO_THROWAWAY`, `HACK:`, `FIXME:` |

Keep it to **3-5 patterns max**. Substring matching — keep them specific.

---

## Step 4: Add Comments

Comments are what make packs useful. Every rule should explain **why**:

```yaml
  # Auth code is the most sensitive surface in any web app.
  # A single AI-suggested change can break login, expose tokens,
  # or bypass 2FA. FreezeOps blocks changes here by default.
  - type: protected_paths
    paths:
      - src/auth/**
```

Without comments, it's just YAML. With comments, it's documentation.

---

## Step 5: Test Your Pack

```bash
# Build
npm run validate

# Smoke test on clean tree (should pass)
node packages/cli/dist/index.js check --config configs/YOUR_NAME-safe.yml

# Trigger a violation to verify rules work
echo "// test" >> src/auth/login.ts
node packages/cli/dist/index.js check --config configs/YOUR_NAME-safe.yml
# Should show: [protected_paths] Modified protected path

# Clean up
git checkout src/auth/login.ts
```

**If the test passes with 0 violations on a clean tree** → your pack is valid.

---

## Step 6: Add to the Repo

1. Add to README pack table:
   ```markdown
   | Python/Django | `python-django-safe.yml` |
   ```

2. Add to `examples/config-copy/README.md`:
   ```markdown
   | Python/Django | Backend | `configs/python-django-safe.yml` |
   ```

3. Update `docs/rule-packs.md` with your pack's details.

---

## Common Mistakes

### Too many protected paths

```yaml
# BAD — protects everything, nothing can change
paths:
  - src/**
  - lib/**
  - config/**
  - test/**
```

```yaml
# GOOD — surgical, protects only what matters
paths:
  - src/auth/**
  - src/billing/**
  - prisma/migrations/**
```

### Patterns that are too broad

```yaml
# BAD — catches legitimate code
patterns:
  - log         # Matches "login", "logout", "blog", "catalog"...
  - function    # Matches every function declaration
  - import      # Matches every import statement
```

```yaml
# GOOD — specific and intentional
patterns:
  - console.log(    # Debugging leftover
  - eval(           # Dangerous eval
  - .only(          # Mocha .only() left in tests
```

### Forgetting to test on a clean tree

If your pack triggers violations on its own repo (because the config
YAML lists patterns that appear in comments), you need to adjust.
The pack should pass with 0 violations on a clean working tree.

---

## Done!

Open a PR with your pack. Use the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
