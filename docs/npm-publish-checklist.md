# npm Publish Checklist

Checklist for publishing `@tanguito/freezeops-core` and `@tanguito/freezeops` to npm.

> **Note:** The `@freezeops` scope is reserved for a future organization migration.
> For now, packages live under the personal scope `@tanguito`.

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
npm view @tanguito/freezeops-core version
```

### 3. Publish CLI

```bash
cd packages/cli
npm publish --access public
```

Verify:

```bash
npm view @tanguito/freezeops version
npx freezeops check
```

### 4. Verify package pages

- https://www.npmjs.com/package/@tanguito/freezeops-core
- https://www.npmjs.com/package/@tanguito/freezeops

---

## Post-publish

- [ ] `npx freezeops check` works from any directory
- [ ] Fresh install test: `mkdir /tmp/test && cd /tmp/test && npm init -y && npm i @tanguito/freezeops && npx freezeops check`
- [ ] GitHub Action using `Tanguito86/freezeops@v0.2.0` still works
- [ ] Update release notes with npm badge

---

## Rollback

If something goes wrong:

```bash
# Unpublish within 72 hours
npm unpublish @tanguito/freezeops@0.2.0
npm unpublish @tanguito/freezeops-core@0.2.0
```
