# Public Readiness

This repository is intended for public use, but it must stay honest about its
scope.

## Positioning

- Community starter, not an official OpenAI product.
- Official-source-backed, with links to current Codex documentation.
- Local setup kit, not a managed enterprise policy product.
- Safe defaults first; users intentionally enable account connectors.
- First-screen README includes Deutsch, Español, English, Português (Brasil),
  Türkçe, and Français entry points, real badges, emoji accents, and
  public-safe animated SVG visuals.
- Senior operating standards are documented in
  [docs/best-practices.md](best-practices.md).

## Public User Requirements

- Clone-and-run instructions work from any directory.
- Windows PowerShell and Bash/WSL installers exist.
- Installers support non-mutating previews: PowerShell `-WhatIf` and Bash
  `--dry-run`.
- Users can inspect the manifest-backed install plan with
  `npm run plan:install` before any installer writes to global Codex, Agents,
  or Git targets.
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
- Root README language entry points are source-controlled for English, Turkish,
  German, Spanish, Brazilian Portuguese, and French so the public landing page
  does not depend on a broken or placeholder locale link.
- README locale consistency is machine-gated so each root language entry keeps
  the same language switcher, install commands, verification command, and
  public-safe positioning.
- GitHub issue and pull request templates include public-safe reminders.
- Blank issues are disabled so bugs, feature requests, questions, and security
  reports go through scoped public-safe flows.
- CODEOWNERS records the default public owner for review routing.
- Dependabot is configured for GitHub Actions and npm manifest update PRs.
- GitHub Actions dependencies are pinned to full commit SHAs, and workflow
  validation rejects tag-based action refs before publication.
- Workflow validation rejects any `*: write` permission in validation
  workflows; publish/release automation remains manual.
- Installable skill sources are checked offline by `npm run verify:skills`,
  mirrored in the `catalog/skills-lock.json` source allowlist, and resolved
  online with `npm run verify:skills:online` before publication.
- Versioned release notes live in [docs/release-notes.md](release-notes.md) and
  stay aligned with `CHANGELOG.md`.
- Task-focused knowledge-base articles live under [kb/](../kb/README.md) in
  English and Turkish so common operator decisions do not bloat the README or
  release notes.
- GitHub repository description, topics, feature toggles, and release metadata
  are documented in [docs/github-settings.md](github-settings.md).
- MCP catalog entries are checked against Windows and Unix Codex config
  templates.
- Specialist agent catalog entries are checked against Windows and Unix Codex
  config templates and reviewed agent role files.
- Supply-chain IOC scanning is part of the default check pipeline.
- Release-readiness validation checks release notes, GitHub settings docs,
  workflow hardening, Gitleaks gate documentation, and artifact hygiene.
- Workflow-security validation rejects validation workflows that retain checkout
  credentials, request broad write permissions, run implicit dependency
  installs, or perform push/release/auth actions.
- Package-surface validation dry-runs the npm source payload with scripts
  disabled and a repo-local cache so public handoff cannot include scratch
  output, auth files, archives, or local agent state.
- `package.json` keeps an explicit source package allowlist so package dry-runs
  stay deterministic and cannot silently include ignored scratch output, local
  agent state, archives, or auth material.
- Plugin manifests cannot bundle hooks, MCP servers, apps, write-capable
  interfaces, or marketplace authentication requirements by default.
- MCP validation rejects floating npm specs, unpinned git launchers, and plugin
  `.mcp.json` drift.
- Advisory-source guidance documents which upstream security, Codex, GitHub,
  PowerShell, and ECC comparison sources maintainers should re-check before a
  release.

## Maintainer Requirements

Before pushing:

```bash
npm run check
npm run validate:release
node scripts/plan-install.mjs --all --json --redact-paths
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
