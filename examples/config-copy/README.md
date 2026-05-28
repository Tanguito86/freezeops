# FreezeOps Config — Copy One

Pick the config that matches your project, copy it to your repo root
as `freezeops.yml`, and you're protected in under 2 minutes.

## Available Packs

| Pack | For | File |
|---|---|---|
| Minimal (universal) | Any project | `configs/minimal-safe.yml` |
| Web | React, Vue, Svelte, Next.js | `configs/web-safe.yml` |
| Node | Express, Fastify, NestJS | `configs/node-safe.yml` |
| Game / Runtime | Games, DSP, real-time | `configs/game-runtime-safe.yml` |
| Android | Kotlin, Java, Compose | `configs/android-safe.yml` |

## Quick Copy

```bash
# Pick one:
cp configs/minimal-safe.yml ./freezeops.yml
cp configs/web-safe.yml ./freezeops.yml
cp configs/node-safe.yml ./freezeops.yml
cp configs/game-runtime-safe.yml ./freezeops.yml
cp configs/android-safe.yml ./freezeops.yml
```

## Which Pack Should I Pick?

- **Not sure?** → `minimal-safe.yml`. It's the safest universal default.
- **Web app (React, Vue, Svelte)?** → `web-safe.yml`. Protects auth, middleware, blocks XSS.
- **Backend (Express, Fastify)?** → `node-safe.yml`. Protects auth, billing, migrations.
- **Game or real-time engine?** → `game-runtime-safe.yml`. Protects gameplay, engine, DSP.
- **Android app?** → `android-safe.yml`. Protects audio, billing, auth.

## Customize

Open the config and edit paths to match your repo. Every pack has comments
explaining what each rule protects.

Need more details? [Rule packs guide →](../docs/rule-packs.md)
