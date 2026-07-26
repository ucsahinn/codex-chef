# Release Notes

This page follows the release users should install now. Older engineering history remains available in [CHANGELOG.md](../CHANGELOG.md), so the public release guide stays useful instead of becoming an ever-growing archive.

## v0.5.56 - 2026-07-26

Codex Chef 0.5.56 prevents installer preflight from failing on older Windows Codex CLI builds that do not classify read-only PowerShell wrapper commands.

### What Changed

- Accepts `allow` or compatibility `no-match` only for the exact read-only PowerShell wrapper probes used by approval validation.
- Still requires direct `Get-Content` inspection to resolve to `allow`.
- Still requires destructive PowerShell wrappers such as `Remove-Item` to resolve to `prompt`.
- Reports older wrapper-classification behavior as a warning instead of blocking installation.
- Works for first installation and existing-install reconciliation without weakening write, credential, publish, or destructive approval boundaries.

### Install Or Upgrade

First installation:

```bash
npm run chef -- --install
npm run chef -- --install --apply
```

Existing installation:

```bash
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
```

Use `--details` when you need the full evidence tables:

```bash
npm run chef -- --status --details
```

Then restart Codex and verify the installed runtime:

```bash
npm run verify:install:runtime
npm run codex:status
```

### Compatibility

- Node.js 18 or newer
- Windows PowerShell, macOS, Linux, and WSL
- Existing user-owned skills, MCPs, profile choices, custom config tables, and unrelated plugin files remain outside normal prune behavior
