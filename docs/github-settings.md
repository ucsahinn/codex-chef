# GitHub Repository Settings

These settings shape the project’s public first impression. Apply them manually only after the source tree is verified and the account-level change is explicitly approved.

Current published baseline: **v0.5.57**.

## Description

```text
Cross-platform Codex setup kit with specialist agents, curated skills, conservative MCP defaults, preview-first installers, and release-grade validation.
```

## Topics

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
macos
linux
powershell
developer-tools
security
setup
```

## Website And Social Preview

Leave the website blank unless a stable public project page exists. Never use a local path, temporary preview URL, or private workspace link.

Use `assets/social-preview.png` for GitHub’s social preview. Keep `assets/social-preview.svg` as the editable source.

## Repository Features

- Issues: enabled.
- Discussions: enable only if maintainers plan to answer community questions.
- Wiki: disabled while the versioned docs in this repository remain canonical.
- Projects: optional.
- Packages and sponsorships: disabled unless someone will actively maintain them.

## Branch And Actions

- Default branch: `main`.
- Require the validation workflow to pass before release claims.
- Keep workflow permissions read-only and action references pinned to full commit SHAs.
- Keep release publication manual; validation workflows must not push, tag, or publish.

## Release Metadata

For v0.5.57:

```text
Title: Codex Chef v0.5.57
Tag: v0.5.57
Notes: tmp/release-notes-current.md
```

Before publishing a future release, run `npm run check`, `npm run verify:skills:online`, `npm run release:notes`, `gitleaks detect --redact --no-banner --no-git --verbose`, and the local/remote commit equality check described in [Publishing](publish.md).
