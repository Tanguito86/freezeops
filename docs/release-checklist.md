# Release Checklist

Checklist for preparing and publishing a FreezeOps release.

---

## v0.2.0 Checklist

- [x] `npm run validate` — build + typecheck PASS
- [x] `node packages/cli/dist/index.js check --config freezeops.yml` — dogfood root PASS
- [x] Smoke: `minimal-safe.yml` PASS
- [x] Smoke: `web-safe.yml` PASS
- [x] Smoke: `node-safe.yml` PASS
- [x] Smoke: `game-runtime-safe.yml` PASS
- [x] Smoke: `android-safe.yml` PASS
- [x] Smoke: regex detect PASS
- [x] Smoke: invalid regex → clear error
- [x] `CHANGELOG.md` updated with `[0.2.0]` section
- [x] `RELEASE_NOTES_v0.2.0.md` created
- [x] `README.md` version updated to v0.2.0
- [x] All `package.json` versions bumped to `0.2.0`
- [x] Working tree clean
- [ ] Tag `v0.2.0` on `main`
- [ ] Push tag: `git push origin v0.2.0`
- [ ] Create GitHub release from tag
- [ ] Attach `RELEASE_NOTES_v0.2.0.md` as release body

---

## Checklist Template

For future releases, copy this:

```
- [ ] `npm run validate`
- [ ] Dogfood root PASS
- [ ] Smoke: all 5 starter packs PASS
- [ ] Smoke: new feature tests PASS
- [ ] `CHANGELOG.md` updated
- [ ] `RELEASE_NOTES_vX.Y.Z.md` created
- [ ] `README.md` version updated
- [ ] `package.json` versions bumped
- [ ] Working tree clean
- [ ] Tag `vX.Y.Z` on `main`
- [ ] Push tag
- [ ] GitHub release
```
