# Release Checklist — v0.1.0

Before tagging and publishing a release, run through this checklist
in order. Every item must pass before the tag is created.

## Pre-tag

- [ ] `npm run validate` — build core + typecheck + build CLI
- [ ] Dogfood local PASS: `node packages/cli/dist/index.js check --config freezeops.yml`
- [ ] Demo smoke — edit `examples/shmup-demo/src/ui/menu.js` → PASS
- [ ] Demo smoke — edit `examples/shmup-demo/src/gameplay/player.js` → FAIL (`protected_paths`)
- [ ] GitHub Actions `validate.yml` workflow PASS
- [ ] GitHub Actions `freezeops.yml` workflow PASS
- [ ] `CHANGELOG.md` date updated
- [ ] `RELEASE_NOTES.md` reviewed
- [ ] `README.md` reviewed (links, badges, version)
- [ ] Working tree clean (`git status`)

## Tag

- [ ] `git tag v0.1.0`
- [ ] `git push origin v0.1.0`

## GitHub Release

- [ ] Create release at `https://github.com/tanguito/freezeops/releases/new`
- [ ] Tag: `v0.1.0`
- [ ] Title: `FreezeOps v0.1.0`
- [ ] Body: copy from `RELEASE_NOTES.md`

## Post-release

- [ ] Verify release page renders correctly
- [ ] Verify tag is visible on GitHub
- [ ] Announce (if applicable)
