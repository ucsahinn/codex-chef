# Release Notes

This page follows the release users should install now. Older engineering history remains available in [CHANGELOG.md](../CHANGELOG.md), so the public release guide stays useful instead of becoming an ever-growing archive.

## v0.5.57 - 2026-07-26

Codex Chef 0.5.57 makes installation, skill, MCP, and status screens reflect the setup actually present on the machine. It also adds the canonical Brain control workspace for project, goal, knowledge, decision, and memory coordination.

### What Changed

- Detects fresh, incomplete, current, drifted, and invalid-skill installation states before an interactive full install.
- Previews fresh installs before typed `APPLY`, exits cleanly when the complete setup is already current, and routes managed drift to backup-backed repair.
- Verifies curated skills through a real `SKILL.md` and labels each one ready, missing, or invalid; user-installed skills remain preserved.
- Separates installed MCP config from catalog defaults and reports enabled, disabled, not-configured, and user-added connectors without claiming a live health probe.
- Keeps the normal status board concise; `--details` restores per-MCP, routing, context-budget, setup-note, target/ambient, and log evidence.
- Corrects approval/account-guidance counts and removes the second nested confirmation from force refresh after Chef already received typed approval.
- Adds the canonical bilingual Brain workspace, Obsidian control canvases, dashboard, and structured project, goal, knowledge, decision, personal, memory, and archive surfaces.
- Extends Windows/Bash temporary-home, idempotence, CLI transcript, Turkish, documentation, package, security, and release regression coverage.

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

Use the state-aware status screens before and after installation:

```bash
npm run chef -- --skills
npm run chef -- --mcp
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
