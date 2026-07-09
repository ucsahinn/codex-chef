# GitHub Repository Settings

Use this checklist after the source tree is verified and the user has explicitly
approved GitHub settings changes. These are repository metadata recommendations;
the installer must not apply them automatically.

## Recommended Description

```text
Codex Chef: Windows-first Codex setup kit with agents, skills, MCP connectors, safe installers, validation gates, and multilingual docs.
```

## Recommended Topics

```text
codex
codex-chef
openai
codex-cli
ai-agents
mcp
model-context-protocol
agent-skills
windows
powershell
developer-tools
security
starter-template
setup
automation
```

## Website

Leave blank unless a stable project page exists. Do not use a local file path,
temporary preview URL, or private workspace URL.

## Social Preview

Use `assets/social-preview.png` as the GitHub social preview image. Keep
`assets/social-preview.svg` as the editable source artwork.

## Features

- Issues: enable.
- Discussions: optional; enable only if the maintainer intends to answer
  community questions.
- Wiki: disable unless docs are intentionally moved there.
- Projects: optional.
- Sponsorships/packages: leave off unless intentionally maintained.

## Branch And Actions

- Default branch: `main`.
- Require GitHub Actions validation before release claims.
- Keep workflow permissions least-privilege; this repo's validation workflow
  uses `contents: read`.
- Do not publish release artifacts from source folders. Use GitHub Releases for
  archives or installers if they are ever created.

## Release Metadata

For v0.5.45, use:

```text
Title: Codex Chef v0.5.45
Tag: v0.5.45
Notes: tmp/release-notes-current.md
```

Before creating the release, verify:

```bash
npm run check
npm run verify:skills:online
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

The local and remote hashes must match before publishing the release.
