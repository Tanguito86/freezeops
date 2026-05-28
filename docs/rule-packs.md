# Starter Rule Packs

Pre-built FreezeOps configs for common project types. Pick one, copy
it to your repo root as `freezeops.yml`, and you're protected in under
2 minutes.

## Quick Start

```bash
# 1. Pick a pack that matches your project
ls configs/

# 2. Copy it to your repo root
cp configs/web-safe.yml ./freezeops.yml

# 3. Customize paths to match your actual structure
# (edit freezeops.yml — it's just YAML)

# 4. Run a check
npx freezeops check
```

## Available Packs

| Pack | For | Protects |
|---|---|---|
| `minimal-safe.yml` | Any project | Line count limits, debugging leftovers |
| `web-safe.yml` | React, Vue, Svelte, Next.js | Auth, middleware, XSS vectors |
| `node-safe.yml` | Express, Fastify, NestJS | Auth, billing, migrations, shell injection |
| `game-runtime-safe.yml` | Games, DSP, real-time engines | Gameplay, engine, collision, timing |
| `android-safe.yml` | Android (Kotlin/Java/Compose) | Audio, billing, auth, debug logs |

## Pack Details

### minimal-safe.yml

The universal starter. Two rules only — blocks massive PRs and catches
debugging leftovers AI tools leave behind.

**Use when:** you want the simplest possible config, or you're not sure
which pack fits.

### web-safe.yml

For browser-based applications. Protects auth flows, middleware, and
security-sensitive paths. Blocks `eval()`, `dangerouslySetInnerHTML`,
and `document.write()` — the three horsemen of XSS.

**Use when:** you're building a web app with any framework and want
auth/security boundaries enforced.

### node-safe.yml

For server-side Node.js. Protects auth, billing, payments, and
database migrations. Blocks `child_process.exec()` and `execSync()` —
shell injection vectors that AI tools generate without warning.

**Use when:** you have a backend that handles money, auth, or
database schemas.

### game-runtime-safe.yml

For games and real-time systems. AI coding tools frequently suggest
"optimizations" that break determinism — `setInterval` replacing
`requestAnimationFrame`, or `Math.random()` in place of a seeded RNG.

**Use when:** your runtime is sensitive to timing, determinism, or
frame-precise behavior.

### android-safe.yml

For Android apps. Protects audio processing, billing/in-app purchases,
and authentication code. Blocks `Log.d()` debug calls that shouldn't
reach production.

**Use when:** you're building an Android app with Kotlin or Java.

## Customizing

Packs are starting points, not prisons. Open the config and edit:

- **Paths**: change `src/auth/**` to match your actual folder structure
- **Limits**: adjust `max_changed_lines` for your team's PR norms
- **Patterns**: add or remove `forbidden_text` entries
- **Rules**: add more `protected_paths` entries for your critical code

Every pack includes comments explaining what each rule protects and why.

## Limitations

- Packs use **substring matching** for `forbidden_text` (not regex).
  If a pattern appears in comments or docs, it may trigger — adjust
  paths or patterns accordingly.
- Packs are **examples**, not exhaustive. They protect common attack
  surfaces, not every possible one.
- Packs work with FreezeOps v0.1.0+. Future versions may add new rule
  types — packs will be updated.

## Adding Your Own

Create a new `.yml` file in `configs/` with the same structure. If
it's broadly useful, open a PR — we'd love to include it.
