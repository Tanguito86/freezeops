# Case Studies

Real projects using FreezeOps in production. Each case study documents
the project, the risks, the configuration, and the results.

---

## Galaxy Raiders

**HTML5 Canvas shoot-em-up with 70+ JS files, 5 bosses, and frozen gameplay zones.**

- **Protected:** Gameplay core, hitboxes, boss patterns, difficulty, scoring, audio DSP
- **Rules:** 16 protected files, 3 forbidden patterns, 200-line diff limit
- **Result:** 4 pre-existing violations caught on first run. Clean smoke tests: menus ✅, collisions ❌.

[Read full case study →](galaxy-raiders.md)
[View config →](https://github.com/Tanguito86/galaxy-raiders/blob/master/freezeops.yml)

---

## SoundBend

**Private Android/Kotlin DSP runtime app with real-time PCM audio processing.**

- **Protected:** DSP engine, limiter chain, audio pipeline, resampling, FFT/analysis
- **Rules:** Protected paths on core DSP + audio runtime, forbidden blocking calls, 250-line diff limit
- **Result:** Lab files ✅, limiter chain ❌, Thread.sleep ❌. No DSP/audio behavior touched.

[Read full case study →](soundbend.md)
*Repository is private — case study omits proprietary implementation details.*

---

## Add Your Project

Using FreezeOps on a real project? We'd love to feature it here.

Open a PR adding:
1. A new `.md` file in `docs/case-studies/`
2. An entry in this README

Follow the Galaxy Raiders format: what the project is, what risks
FreezeOps protects, the config applied, and real test results.
