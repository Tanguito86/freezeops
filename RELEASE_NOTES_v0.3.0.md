# FreezeOps v0.3.0 — Release Notes

**Date:** 2026-05-28
**Tag:** v0.3.0

---

## What Changed

v0.3.0 adds optional SARIF 2.1.0 output. FreezeOps can now export its
violations as SARIF, making it compatible with GitHub Code Scanning,
VS Code, and any tool that reads SARIF. No breaking changes — the
feature is off by default and does not affect existing behavior.

### SARIF Output

```bash
npx freezeops check --sarif freezeops.sarif.json
```

The SARIF report maps each FreezeOps violation to a result with:

| SARIF field | FreezeOps source |
|---|---|
| `ruleId` | `violation.ruleType` (`max_changed_lines`, `protected_paths`, `forbidden_text`) |
| `level` | `"error"` |
| `message.text` | `violation.message` |
| `locations[].physicalLocation.artifactLocation.uri` | `violation.file` (if available) |
| `properties.detail` | `violation.detail` |
| `properties.matchedPattern` | `violation.matchedPattern` |
| `properties.matchedGlob` | `violation.matchedGlob` |

---

## GitHub Action + Code Scanning

```yaml
- uses: Tanguito86/freezeops@v0.3.0
  with:
    sarif: freezeops.sarif.json

- uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: freezeops.sarif.json
```

---

## Why This Matters

SARIF (Static Analysis Results Interchange Format) is the standard format
for static analysis tools. By exporting SARIF, FreezeOps plugs into:

- **GitHub Code Scanning** — violations appear in Security → Code Scanning
- **VS Code SARIF Viewer** — violations shown inline in the editor
- **Any SARIF-compatible dashboard** — no custom parsing needed

This makes FreezeOps more of a "professional tool" without changing how
it works or what it checks.

---

## Limitations

- **No precise line numbers.** Violations reference files, not line/column.
  Line-level precision is planned for a future release.
- **SARIF is optional.** If you don't pass `--sarif`, nothing changes.
- **`upload-sarif` is handled separately.** FreezeOps generates the file;
  you use `github/codeql-action/upload-sarif` to upload it.

---

## Breaking Changes

**None.** v0.2.0 configs and workflows work exactly as before.

---

## Upgrade from v0.2.0

### npm

```bash
npm install -D @tanguito/freezeops@0.3.0
```

### GitHub Action

```yaml
- uses: Tanguito86/freezeops@v0.3.0
  with:
    config: freezeops.yml
    base-ref: origin/main
```

No config changes needed. The new `sarif` input is optional.

---

## Smoke Test Results

All tests pass on the v0.3.0 codebase:

| Test | Result |
|---|---|
| `npm run validate` | ✅ PASS |
| Dogfood root | ✅ PASS |
| CLI without `--sarif` | ✅ PASS |
| CLI with `--sarif` (no violations) | ✅ PASS, JSON valid |
| CLI with `--sarif` (violation) | ✅ FAIL, results: 1, ruleId, level, file, properties |
| `npm pack` core | ✅ 8.7K, dist/ only |
| `npm pack` CLI | ✅ 5.5K, dist/ only |

---

## Available on npm

```bash
npm install -D @tanguito/freezeops
npx freezeops check --sarif freezeops.sarif.json
```

- [@tanguito/freezeops-core](https://www.npmjs.com/package/@tanguito/freezeops-core) — deterministic rules engine
- [@tanguito/freezeops](https://www.npmjs.com/package/@tanguito/freezeops) — CLI + GitHub Action
