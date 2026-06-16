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
node scripts/plan-install.mjs --all --json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
.\scripts\install.ps1 -All -Interactive
npm run verify:install:runtime -- --expect-skills
```

Bash or WSL:

```bash
git pull
npm run check
node scripts/plan-install.mjs --all --json
./scripts/install.sh --all --dry-run
./scripts/install.sh --all --interactive
npm run verify:install:runtime -- --expect-skills
```

`-Force` / `--force` is for deliberate replacement upgrades. A normal first
install or existing-user refresh should omit force so existing `config.toml` is
merged and other existing managed files are skipped. During replacement
upgrade, force is safe only after you reviewed the preview and are comfortable
replacing managed targets from this repo's templates.

If you intentionally want to replace managed targets from the current repo
templates after reviewing the preview, rerun the same installer with `-Force`
or `--force`.

## Backups

By default, overwritten managed files are backed up under:

```text
~/.codex/backups/codex-chef-YYYYMMDD-HHMMSS/
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
- `catalog/agents.json`
- `catalog/mcp-servers.json`
- `manifests/install-plan.json`
- `schemas/install-plan.schema.json`

## After Upgrade

Run:

```bash
codex doctor --summary
npm run verify:install:runtime -- --expect-skills
codex exec --strict-config "Summarize the active Codex setup."
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
