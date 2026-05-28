# Case Study: SoundBend

**Project:** SoundBend — Android/Kotlin real-time audio DSP app
**Repo:** Private ([Tanguito86/soundbend](https://github.com/Tanguito86/soundbend))
**FreezeOps version:** v0.1.0
**Date:** May 2026

> **Note:** The SoundBend repository is private. This case study
> intentionally omits proprietary implementation details, full file
> paths, and internal architecture. It describes the integration in
> general terms to demonstrate FreezeOps protecting a non-game,
> Android/Kotlin real-time DSP codebase.

---

## What Is SoundBend?

SoundBend is a private Android equalizer app with a custom DSP engine
written in Kotlin. It processes PCM audio in real time through a
multi-module architecture:

- **DSP core** — parametric EQ, biquad filters, mid-side processing,
  FFT-based spectrum analysis, resampling, and dynamics processing.
- **Audio pipeline** — PCM playback engine with AudioTrack output,
  sample rate conversion, processing pipeline orchestration, and
  output safety guards.
- **Limiter chain** — true peak limiter with 4x oversampling,
  lookahead gain reduction, safety clamping, and soft clipping.

The app targets Android 13+ with < 10 ms latency on mid-range devices.

---

## Why FreezeOps?

SoundBend processes 48 kHz stereo PCM. A single changed filter
coefficient, a misplaced normalization step, or a `Thread.sleep`
in the audio callback path can introduce artifacts that are invisible
to unit tests but audible to users.

**The risk profile:**

| Risk | Consequence | Domain |
|---|---|---|
| DSP drift | Filter parameters change → sound degrades | Audio quality |
| Limiter chain tampering | Gain reduction logic breaks → clipping | Output safety |
| Audio routing regression | Processing order changes → latency spikes | Real-time budget |
| Realtime latency regression | Blocking calls in callback → buffer underrun | Playback integrity |
| Debugging leftovers | Production builds with debug code | Release quality |
| AI "optimizations" | Hardcoded sample rates, removed guards | Runtime correctness |

Before FreezeOps, these risks were managed through code review and
discipline. Now they're **machine-enforceable.**

---

## Configuration Applied

The config protects the DSP engine, limiter chain, resampling logic,
audio pipeline, audio session management, and FFT/analysis modules.
Three rule types are used, adapted specifically for Android/Kotlin
DSP development.

### Generic config structure (not exact)

```yaml
version: "1"
rules:
  # Audio DSP changes must be surgical
  - type: max_changed_lines
    value: 250

  # Core DSP engine — frozen
  - type: protected_paths
    paths:
      - core-dsp/**         # ParametricEQ, BiquadFilter, FFT, resampling
      - audio-runtime/**    # PCM pipeline, output guard, SRC
      - app/**/audio/       # Audio service, playback engine

  # Limiter chain — frozen
  - type: protected_paths
    paths:
      - core-dsp/**/limiter/

  # Danger patterns for Android audio development
  - type: forbidden_text
    patterns:
      - Thread.sleep(       # Blocks audio callback → underrun
      - TODO_THROWAWAY      # Debug leftovers in production
```

**Rule rationale:**

- **`protected_paths`** on the DSP engine and limiter chain: these
  are the core intellectual property. Any change needs deliberate
  human review.
- **`protected_paths`** on the audio pipeline: the processing order,
  output guard, and sample rate converter must be stable.
- **`max_changed_lines: 250`**: DSP changes should be surgical.
  Large PRs in audio code are a red flag.
- **`forbidden_text`**: `Thread.sleep` in Kotlin blocks the calling
  thread — disastrous in an audio callback. `TODO_THROWAWAY` catches
  debug code that shouldn't ship.

---

## Smoke Test Results

All tests run against the real SoundBend working tree. No mock data.

| Test | Expected | Actual |
|---|---|---|
| Clean working tree | PASS | ✅ PASS — 0 violations |
| Dirty non-critical files (`lab/` path) | PASS | ✅ PASS — 4 modified files, none protected |
| Edit limiter chain file (protected) | FAIL | ❌ FAIL — `[protected_paths]` |
| `Thread.sleep(` in non-protected file | FAIL | ❌ FAIL — `[forbidden_text]` |

### Notes

- **4 dirty files in `lab/` passed** because the lab/ directory
  contains experimental soft-clipper harnesses — not production DSP.
- **Limiter chain modification blocked** — the most dangerous
  change: tampering with gain reduction logic.
- **`Thread.sleep` caught** — a real pattern AI tools inject into
  Android code when asked to "add a delay." FreezeOps caught it
  at the PR level.

---

## Why This Matters

SoundBend proves FreezeOps works outside game development. The same
rule engine that protects an HTML5 shmup's hitboxes also protects
an Android Kotlin DSP pipeline.

**Key differences from Galaxy Raiders:**

| Aspect | Galaxy Raiders | SoundBend |
|---|---|---|
| Language | JavaScript | Kotlin |
| Platform | Web + Capacitor | Android native |
| Module structure | Flat `www/` directory | Multi-module Gradle |
| Critical runtime | Game loop (rAF) | Audio callback thread |
| Risk profile | Gameplay drift | DSP/audio regression |
| Repo visibility | Public | Private |

Same FreezeOps. Same rules. Different domain.

---

## What's Not Protected (by design)

SoundBend's configuration intentionally leaves these areas unprotected:

- **UI layer** — Compose screens, components, themes, navigation
- **EQ presets** — genre presets, user presets database
- **Monetization** — billing, feature gates, entitlements
- **Visualizer** — spectrum rendering, FFT display
- **AutoEQ database** — device EQ profiles
- **Onboarding / Settings** — screens, preferences
- **Bluetooth preset management** — device profile matching

These areas can evolve freely. FreezeOps protects what MUST not
change — not everything that COULD change.

---

## Conclusion

SoundBend went from "be careful with the DSP" to "FreezeOps blocks
PRs that touch the DSP." The policy is now:

1. **Visible** — in `freezeops.yml`, version-controlled alongside the code
2. **Enforceable** — CI blocks violations with exact file + rule references
3. **Auditable** — every violation shows what triggered it and why

The DSP is still being developed. New features, better filters,
improved performance — all welcome. But changes to the production
audio pipeline must be deliberate, reviewed, and intentional.

FreezeOps ensures they are.
