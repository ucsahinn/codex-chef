# Upgrade Guide

Use this guide when you already have a Codex setup and want to adopt a newer
version of this starter.

## Safe Upgrade Flow

1. Pull the repository update.
2. Review the diff.
3. Preview installer changes.
4. Run the installer only after the preview looks correct.
5. Restart Codex.
6. Verify active config and skills.

PowerShell:

```powershell
git pull
npm run check
.\scripts\install.ps1 -All -Force -WhatIf
.\scripts\install.ps1 -All -Force
```

Bash or WSL:

```bash
git pull
npm run check
./scripts/install.sh --all --force --dry-run
./scripts/install.sh --all --force
```

## Backups

By default, overwritten managed files are backed up under:

```text
~/.codex/backups/codex-enterprise-starter-YYYYMMDD-HHMMSS/
```

Do not use `-NoBackup` or `--no-backup` unless you already have another backup.

## What To Compare

Review these files before upgrading:

- `templates/codex/AGENTS.md`
- `templates/codex/config.windows.toml`
- `templates/codex/config.unix.toml`
- `templates/codex/rules/default.rules`
- `catalog/skills.json`
- `catalog/skills-lock.json`
- `catalog/mcp-servers.json`

## After Upgrade

Run:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Inside Codex, check:

```text
/mcp
/skills
/plugins
/hooks
```

## Rollback

1. Close Codex.
2. Copy the previous files back from the timestamped backup directory.
3. Restart Codex.
4. Re-run `codex doctor --summary`.
