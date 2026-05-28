# Release Checklist

Checklist for preparing and publishing a FreezeOps release.

---

## v0.3.0 Checklist

- [ ] `npm install` — dependencies correct
- [ ] `npm run validate` — build + typecheck PASS
- [ ] `node packages/cli/dist/index.js check --config freezeops.yml` — dogfood root PASS
- [ ] Smoke: SARIF clean PASS — `--sarif /tmp/test.json` writes valid JSON
- [ ] Smoke: SARIF violation PASS — exit 1, `results.length > 0`, `ruleId`, `level`, `file`, `properties`
- [ ] Smoke: `npm pack` core — dist/ only, no extra files
- [ ] Smoke: `npm pack` CLI — dist/ only, no extra files
- [ ] `CHANGELOG.md` updated with `[0.3.0]` section
- [ ] `RELEASE_NOTES_v0.3.0.md` created
- [ ] `README.md` version updated to v0.3.0
- [ ] All `package.json` versions bumped to `0.3.0`
- [ ] Working tree clean
- [ ] `npm publish` core: `cd packages/core && npm publish --access public`
- [ ] `npm publish` CLI: `cd packages/cli && npm publish --access public`
- [ ] Tag `v0.3.0` on `main`
- [ ] Push tag: `git push origin v0.3.0`
- [ ] Create GitHub release from tag
- [ ] Attach `RELEASE_NOTES_v0.3.0.md` as release body

---

## v0.2.0 Checklist

- [x] `npm run validate` — build + typecheck PASS
- [x] Dogfood root PASS
- [x] Smoke: all 5 starter packs PASS
- [x] Smoke: regex detect PASS
- [x] Smoke: invalid regex → clear error
- [x] `CHANGELOG.md` updated
- [x] `RELEASE_NOTES_v0.2.0.md` created
- [x] `README.md` version updated
- [x] `package.json` versions bumped
- [x] Working tree clean
- [x] Tag `v0.2.0` on `main`
- [x] Push tag
- [x] GitHub release

---

## Checklist Template

For future releases, copy this:

```
- [ ] `npm install`
- [ ] `npm run validate`
- [ ] Dogfood root PASS
- [ ] Smoke: new feature tests PASS
- [ ] Smoke: npm pack clean
- [ ] `CHANGELOG.md` updated
- [ ] `RELEASE_NOTES_vX.Y.Z.md` created
- [ ] `README.md` version updated
- [ ] `package.json` versions bumped
- [ ] Working tree clean
- [ ] npm publish core + CLI
- [ ] Tag `vX.Y.Z` on `main`
- [ ] Push tag
- [ ] GitHub release
```
