# Release Notes

This page follows the release users should install now. Older engineering history remains available in [CHANGELOG.md](../CHANGELOG.md), so the public release guide stays useful instead of becoming an ever-growing archive.

## v0.5.55 - 2026-07-26

Codex Chef 0.5.55 makes the colorful operator CLI easier to read, prevents unnecessary same-version updates, and fixes installer preflight compatibility across Windows Codex CLI command-token variants.

### What Changed

- Made primary CLI screens compact by default and added `--details` for full tables, setup notes, and diagnostic evidence.
- Added visible update progress with local and available version reporting.
- Same-version update requests now stop before confirmation, validation, installation, or managed-file writes.
- Newer updates fetch once, compare the inspected package version, and fast-forward from the same fetched commit.
- Successful child-command noise stays in local logs; failures still print complete troubleshooting output.
- Reduced preview, install, refresh, skills, MCP, routing, diagnostics, backup, and log screen density.
- Fixed installer preflight on PCs where Codex normalizes the exact read-only PowerShell probe as one command token instead of several tokens.
- Added regression coverage for compact and detailed CLI views plus both Windows PowerShell token forms.

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
