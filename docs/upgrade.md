# Upgrade Guide

Use this guide when you already have a Codex setup and want to adopt a newer
version of this starter.

## Safe Upgrade Flow

The guided CLI wraps the safe path:

```powershell
npm run chef -- --update
npm run chef -- --update --verbose-plan
npm run chef -- --update --apply
```

Without `--apply`, update mode does not change managed/global files; normal CLI
logs are still repo-local unless `--no-log` is supplied. The default preview is
concise; `npm run chef -- --update --verbose-plan` prints the full install
dry-run evidence. Apply mode requires a clean worktree and runs
`git pull --ff-only`. If the pull advances the repo, the CLI prints a fresh
preview and stops; rerun `npm run chef -- --update --apply` only after
reviewing that updated preview. If the repo is already current, apply runs
local validation and refreshes managed files through the backup-backed
installer without installing curated global skills or optional global Git
guards.

Manual flow:

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

List and inspect available backup archives before rollback:

```powershell
npm run chef -- --backups
npm run chef -- --backups --backup <id>
npm run chef -- --backups --backup <id> --delete
```

The backup archive inspect view is metadata-only and prints paths, sizes,
hashes, manifest status, and restorable targets without printing file contents.
Deletion is preview-first; add `--apply` only after confirming the resolved
archive path belongs to the backup you no longer need.

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
2. Preview restore from the selected backup archive:
   `npm run chef -- --backups --backup <id> --restore`.
3. Apply only after the preview is correct:
   `npm run chef -- --backups --backup <id> --restore --apply`.
4. Restart Codex.
5. Re-run `codex doctor --summary`.

The restore apply path creates a rollback backup of current targets first. It
restores only known Codex Chef-managed files and does not delete old backup
archives automatically.
