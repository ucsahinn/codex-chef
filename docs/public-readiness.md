# Public Readiness

This repository is intended for public use, but it must stay honest about its
scope.

## Positioning

- Community starter, not an official OpenAI product.
- Official-source-backed, with links to current Codex documentation.
- Local setup kit, not a managed enterprise policy product.
- Safe defaults first; users intentionally enable account connectors.
- First-screen README includes English and Turkish entry points, real badges,
  emoji accents, and public-safe animated SVG visuals.
- Senior operating standards are documented in
  [docs/best-practices.md](best-practices.md).

## Public User Requirements

- Clone-and-run instructions work from any directory.
- Windows PowerShell and Bash/WSL installers exist.
- Installers support non-mutating previews: PowerShell `-WhatIf` and Bash
  `--dry-run`.
- Installers create backups before replacing managed files.
- Directory replacement is limited to managed Codex/Agents targets.
- Users can smoke-test with temporary `CODEX_HOME` and `AGENTS_HOME`.
- No local state, auth, sessions, memories, project trust, or private paths are
  published.
- Authenticated MCPs are disabled until a user intentionally enables them.
- `package.json` stays `private: true` to avoid accidental npm publishing.
- README visuals are stored under `assets/`, include accessible SVG metadata,
  lightweight motion with reduced-motion fallback, and do not use private
  screenshots, fake metrics, or unlicensed media.
- GitHub issue and pull request templates include public-safe reminders.
- Dependabot is configured for GitHub Actions and npm manifest update PRs.
- Installable skill sources are checked offline by `npm run verify:skills`,
  locked in `catalog/skills-lock.json`, and can be resolved online with
  `npm run verify:skills:online` before publication.

## Maintainer Requirements

Before pushing:

```bash
npm run check
git status --short
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

After pushing:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

The hashes must match, and the GitHub Actions run must be successful before
creating release notes.
