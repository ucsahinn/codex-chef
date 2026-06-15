# Publishing Checklist

The repository is designed to be public, but publishing is a separate user
decision.

## Before Push Or Release

```bash
npm run check
npm run validate:release
npm run verify:skills:online
node scripts/plan-install.mjs --all --json --redact-paths
npm run validate:install-state
git status --short
git diff --check
git diff --cached --check
```

If Gitleaks is installed:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

For a release, also confirm:

- `package.json` version matches the intended tag.
- `CHANGELOG.md` has a dated version section.
- [docs/release-notes.md](release-notes.md) matches the release.
- [docs/github-settings.md](github-settings.md) has the intended repository
  description, topics, and release metadata.
- `git diff --cached` contains only reviewed source/docs/config files.
- ignored `.serena/`, `tmp/`, logs, caches, screenshots, and generated archives
  are not staged.

## Create A Repository

Using GitHub CLI, after review and explicit approval:

```bash
gh repo create codex-chef --public --source . --remote origin
git push -u origin main
```

Manual remote setup:

```bash
git remote add origin https://github.com/<owner>/codex-chef.git
git push -u origin main
```

## Existing Repository Release Flow

After explicit commit/push/release approval:

```bash
git add <reviewed files>
git diff --cached
git commit -m "Release Codex Chef v0.5.2"
git push origin main
git tag v0.5.2
git push origin v0.5.2
gh release create v0.5.2 --title "Codex Chef v0.5.2" --notes-file docs/release-notes.md
```

After pushing, verify remote equality and CI:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
gh run list --workflow validate --branch main --limit 1
```

## Do Not Publish

- real credentials
- auth files
- generated Codex memory/session state
- user-specific `.codex` backups
- local project paths
- installers and release archives

## Release Artifacts

This setup kit is source-first. If you later create zip archives or installers,
publish those through GitHub Releases, not as regular source files.
