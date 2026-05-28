# npm Publish Checklist

Checklist for publishing `@freezeops/core` and `@freezeops/cli` to npm.

---

## Pre-publish

- [ ] `npm run validate` — build + typecheck PASS
- [ ] Dogfood root PASS (`npx freezeops check`)
- [ ] `npm pack` on both packages — tarballs clean (no extra files)
- [ ] Local install test PASS (`npm install ../freezeops-*.tgz && npx freezeops check`)
- [ ] `CHANGELOG.md` up to date
- [ ] `README.md` version correct
- [ ] All `package.json` versions match
- [ ] Working tree clean

---

## Publish

### 1. Login to npm

```bash
npm login
```

Verify:

```bash
npm whoami
```

### 2. Publish core first

```bash
cd packages/core
npm publish --access public
```

Verify:

```bash
npm view @freezeops/core version
```

### 3. Publish CLI

```bash
cd packages/cli
npm publish --access public
```

Verify:

```bash
npm view @freezeops/cli version
npx @freezeops/cli check --help
```

### 4. Verify package pages

- https://www.npmjs.com/package/@freezeops/core
- https://www.npmjs.com/package/@freezeops/cli

---

## Post-publish

- [ ] `npx @freezeops/cli check` works from any directory
- [ ] Fresh install test: `mkdir /tmp/test && cd /tmp/test && npm init -y && npm i @freezeops/cli && npx freezeops check`
- [ ] GitHub Action using `Tanguito86/freezeops@v0.2.0` still works
- [ ] Update release notes with npm badge: `[![npm version](https://badge.fury.io/js/@freezeops%2Fcli.svg)](https://www.npmjs.com/package/@freezeops/cli)`

---

## Rollback

If something goes wrong:

```bash
# Unpublish within 72 hours
npm unpublish @freezeops/cli@0.2.0
npm unpublish @freezeops/core@0.2.0
```
