# Publishing checklist

Use this when pushing the repo to GitHub (or similar) for the first time.

## 1. Update placeholders

- [ ] `README.md` — update repo links if org/username differs
- [ ] `CHANGELOG.md` — update release URL tag
- [ ] `package.json` — add `repository`, `homepage`, `bugs` fields if desired

## 2. Initial commit

```bash
git add .
git status   # confirm node_modules, dist, target are NOT staged
git commit -m "Initial release v0.1.0 — trading system web UI"
```

## 3. Create remote and push

```bash
git remote add origin git@github.com:Kolzodev712/trading-system-ui.git
git push -u origin main
```

## 4. GitHub release (optional)

Tag `v0.1.0` and attach release notes from [CHANGELOG.md](../CHANGELOG.md):

```bash
git tag -a v0.1.0 -m "v0.1.0 — initial web UI"
git push origin v0.1.0
```

## 5. Verify clone-from-scratch

```bash
cd /tmp && git clone <repo-url> trading-system-ui-test
cd trading-system-ui-test
npm ci && npm test && npm run build
```

## What not to commit

Already in [`.gitignore`](../.gitignore):

- `node_modules/`
- `dist/`
- `target/`
- `.env`

**Do commit:** `src/gen/` (generated proto types), `proto/`, lockfile.
