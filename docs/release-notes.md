# Release Notes

This page follows the release users should install now. Older engineering history remains available in [CHANGELOG.md](../CHANGELOG.md), so the public release guide stays useful instead of becoming an ever-growing archive.

## v0.5.54 - 2026-07-26

Codex Chef 0.5.54 adds a project-scoped Brain vault and completes the colorful CLI, install, update, refresh, and repair experience without weakening user-owned configuration boundaries.

### What Changed

- Added Codex Chef Brain with preview-first capture, project-scoped retrieval, Markdown vault storage, schemas, templates, backup and restore plans, Windows ACL evidence, documentation, and regression tests.
- Restored and refined the colorful U.C.S. operator interface with clearer menu importance, action impact, operation receipts, version/commit evidence, and a green third signature color.
- Separated first install, safe existing-install reconciliation, managed update, force refresh, and drift repair into explicit cross-platform behaviors.
- Normal update now refreshes Codex Chef-owned files after backup while preserving user-owned `config.toml` settings and synchronizing only managed tables.
- Full install now uses the colorful CLI as the recommended public path and does not open a second nested confirmation flow after CLI `APPLY`.
- Expanded installer, CLI, Brain, locale, portability, package, and release validation.

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

Then restart Codex and verify the installed runtime:

```bash
npm run verify:install:runtime
npm run codex:status
```

### Compatibility

- Node.js 18 or newer
- Windows PowerShell, macOS, Linux, and WSL
- Existing user-owned skills, MCPs, profile choices, custom config tables, and unrelated plugin files remain outside normal prune behavior
