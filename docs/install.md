# Installation Guide

This guide installs the starter into the current user's Codex home. By default
Codex uses `~/.codex`; if `CODEX_HOME` is set, the installer uses that path.

## Prerequisites

- Codex CLI or Codex app installed.
- Git installed.
- Node.js 18 or newer for validation and optional skill installation.
- `npx` available for the default stdio MCP servers and verified public skill
  installation.
- Optional: Gitleaks for stronger pre-commit and pre-push scanning.
- Optional on Windows: `winget` and current Windows 11 for the best native
  sandbox path.
- `uvx` if you keep the default Serena semantic-code MCP enabled. Without
  `uvx`, disable Serena or expect the status board to report its setup note.

## PowerShell Install

Preview without writing:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Inspect the manifest-backed operation plan without invoking either installer:

```bash
node scripts/plan-install.mjs --all --json
```

List available manifest profiles and operations before reviewing the full JSON:

```bash
node scripts/plan-install.mjs --list-profiles
node scripts/plan-install.mjs --list-operations
```

The plan lists managed targets, optional global Git changes, curated skill
commands, collision policy, backup behavior, and risk level.
The profile copy operation includes `development.config.toml`,
`review.config.toml`, `ci.config.toml`, and `token-safe.config.toml`.

Default-enabled MCPs still have launcher prerequisites. Node/npx-backed MCPs
start after Node can download their pinned packages. Serena is default-enabled
for semantic code navigation, but it needs `uvx` and the pinned git source. If a
fresh machine does not have that launcher, either install `uvx` or set
`mcp_servers.serena.enabled = false` before expecting `/mcp` to show it live.

Install after the preview is correct:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Automation-friendly install without questions:

```powershell
.\scripts\install.ps1 -All
```

Repair an existing global Codex setup:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
.\scripts\install.ps1 -Repair
```

Repair mode is for machines that already have a Codex setup. It previews or
applies backup-backed reconciliation for Codex Chef-managed guidance, rules,
agent/profile files, the bundled plugin, missing config blocks, and the local
plugin marketplace entry. It preserves unrelated marketplace plugins and never
deletes user skills; extra or duplicate global skills are reported as cleanup
candidates.

Update an existing checkout and managed setup through the guided CLI:

```powershell
npm run chef -- --update
npm run chef -- --update --verbose-plan
npm run chef -- --update --apply
```

Without `--apply`, update mode does not change managed/global files; normal
CLI logs are still repo-local unless `--no-log` is supplied. The default
preview is concise; `npm run chef -- --update --verbose-plan` prints the full
install dry-run evidence. Apply mode requires a clean worktree and runs
`git pull --ff-only`. If the pull advances the repo, the CLI prints a fresh
preview and stops; rerun `npm run chef -- --update --apply` after reviewing
that updated preview. If the repo is already current, apply refreshes managed
files through the backup-backed installer. Update does not install curated global skills
or optional global Git guards; use `--install --apply` or `--skills --apply`
when you want those explicit surfaces.

Inspect or restore Codex Chef backup archives through the same CLI:

```powershell
npm run chef -- --backups
npm run chef -- --backups --backup <id>
npm run chef -- --backups --backup <id> --restore
npm run chef -- --backups --backup <id> --delete
npm run chef -- --backups --backup <id> --restore --apply
npm run chef -- --backups --backup <id> --delete --apply
```

The list and inspect commands are metadata-only: they show backup archive
locations, manifest status, restorable file counts, sizes, and hashes without
printing file contents. Restore is a preview unless `--apply` is supplied. The
apply path creates a new rollback backup of current targets before copying
known Codex Chef-managed files back from the selected archive. Delete is also
preview-first: `--delete` prints the resolved archive path without removing it,
and `--delete --apply` removes only the selected Codex Chef backup archive under
the canonical backup root.

Useful switches:

- `-All`: install Codex templates, the local Codex Chef plugin, specialist
  agents, profiles, rules, and verified public/first-party skills. It does not
  change global Git config.
- `-InstallSkills`: install `catalog/skills.json` entries that have
  `install: true`, a verified `package` in `owner/repo` format, and a matching
  `skill` name. The installer calls `npx.cmd skills add <package> --skill
  <skill> --agent codex --yes --global` with a repo-local npm cache under
  ignored `tmp/npm-cache` unless the user already set npm cache env vars.
- `-InstallGitGuards`: install global Git ignore, global pre-commit hook, and
  set `core.excludesfile` plus `core.hooksPath`. This is intentionally separate
  because it affects every Git repository for the current user.
- `-Force`: overwrite managed Codex files after creating backups. Use this for
  deliberate upgrades only after reviewing `-WhatIf`; without it, existing
  `config.toml` is backed up and receives only missing Codex Chef blocks, while
  existing agent files and rules are skipped. The personal plugin marketplace
  file is not replaced; only the Codex Chef entry is added or updated after
  backup and unrelated plugin entries are preserved.
- `-Repair`: repair an existing setup with the shared repair engine. With
  `-WhatIf`, it prints a no-write repair plan. Without `-WhatIf`, it backs up
  and repairs managed drift. It does not delete user skills.
- `-NoBackup`: skip backups. Not recommended.
- `-WhatIf`: preview file, Git, and skill operations without changing the real
  setup.
- `-Interactive`: ask before using custom Codex/Agents home values and before
  enabling optional global Git guards. It also asks whether to install the
  reviewed skills, whether to force-replace managed files after backup, and
  whether to continue after the plan summary. It never asks for tokens or
  credentials.
- `-PlainOutput`: use ASCII status markers instead of emoji, useful for older
  Windows consoles, CI logs, and terminals that render Unicode poorly.

## Bash Or WSL Install

Preview without writing:

```bash
./scripts/install.sh --all --dry-run
```

Install after the preview is correct:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all
```

Useful flags:

- `--all`: recommended full Codex Chef setup without global Git config changes.
- `--install-skills`
- `--install-git-guards`: opt in to global Git ignore and hook settings.
- `--force`: replace managed targets after backup; without it, existing
  `config.toml` is merged and other existing managed files are skipped. The
  personal plugin marketplace file is not replaced; only the Codex Chef entry
  is added or updated after backup and unrelated plugin entries are preserved.
- `--repair`: preview or apply backup-backed repair for an existing global
  Codex setup. Use it with `--dry-run` for a no-write plan.
- `--no-backup`
- `--dry-run`
- `--plain-output`: use ASCII status markers.
- `--interactive`: guided Bash/WSL setup with the same path, skills, force,
  Git-guard, and continue prompts.

Both installers finish with a capability board that lists the specialist
agents, default-ready MCP servers, disabled opt-in MCP connectors, bundled
plugin skills, reviewed global skills, enterprise routing profiles, and MCP
setup notes. The setup notes call out local tooling, OAuth authorization,
filesystem-path selection, and `SUPABASE_DB_URL` requirements before a task
needs that connector. Account, database, production, and broad filesystem
connectors remain disabled unless you explicitly enable them later.
Agent role files are installed without per-agent model/reasoning pins. The
active profile and Codex runtime choose the task-appropriate balance; use
`token-safe.config.toml` for broad or long-running work that needs lower
verbosity and tighter tool-output limits without disabling skills, agents, or
MCPs.

## What Gets Backed Up

Existing files are copied into:

```text
~/.codex/backups/codex-chef-YYYYMMDD-HHMMSS/
```

New backups also include `.codex-chef-backup.json`, a small manifest with the
operation, package version, platform, backup-relative paths, sizes, hashes, and
any archive issues detected while writing metadata.

The installer backs up managed targets before replacing them:

- `AGENTS.md`
- `config.toml`
- `rules/default.rules`
- `agents/*.toml`
- personal plugin marketplace file
- bundled local plugin directory

Directory replacement is allowed only under the managed Codex or Agents home.
The installer refuses unmanaged directory targets.

## Post-Install Checks

Restart Codex, then run:

```bash
codex doctor --summary
npm run codex:routing
npm run codex:status
npm run verify:install:runtime
codex exec --strict-config "Summarize the active Codex setup."
```

`npm run codex:routing` prints the enterprise routing board from
`catalog/routing-profiles.json`: task shapes, matching subagents, skills, MCPs,
and config/profile flags. The board is a visible routing contract, not a hidden
execution hook; risky account, deployment, database, destructive, and broad
filesystem actions still require explicit approval.

`npm run codex:status` is the end-user status board. It combines repo-only
starter health, installed-runtime drift, direct Codex doctor check summaries,
skill context-budget warnings, routing board summary, effective control summary,
and MCP setup notes. Use `npm run codex:status:all` when the real install
intentionally included curated skills and optional Git guards.

`npm run verify:install:runtime` is read-only. It checks the installed
`~/.codex` and `~/.agents` targets, checks managed agent, rule, profile, and
plugin files for source drift, then runs Codex CLI checks with `CODEX_HOME`
explicitly pointed at the installed target. If the ambient shell is reading a
sandbox or alternate `CODEX_HOME`, the verifier reports that drift as a warning
while still proving whether the installed target exposes the expected MCP
config.

Inside Codex, use:

```text
/mcp
/skills
/plugins
/hooks
```

## Test Without Touching Your Real Setup

PowerShell:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
.\scripts\install.ps1 -Force -WhatIf
```

Bash:

```bash
CODEX_HOME="$PWD/tmp/codex-home" AGENTS_HOME="$PWD/tmp/agents-home" \
  ./scripts/install.sh --force --dry-run
```

Use non-dry-run temp homes only when you intentionally want a smoke install.
Remove `tmp/` only when you created it intentionally.

If you already have a Codex setup, inspect the repair plan first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
```

If repair is clean, continue with the normal install command. Existing
`config.toml` is backed up and merged; existing user tables are preserved.
Other existing managed files are skipped unless you use `-Force` / `--force`
after reviewing the preview. The personal plugin marketplace keeps unrelated
entries and receives only the Codex Chef entry upsert after backup. When managed
drift exists, `-Repair` / `--repair` is the safer first step before force
replacement.

## Rollback

1. Close Codex.
2. List backup archives with `npm run chef -- --backups`.
3. Preview restore from the selected archive:
   `npm run chef -- --backups --backup <id> --restore`.
4. Apply only after the preview is correct:
   `npm run chef -- --backups --backup <id> --restore --apply`.
5. Restart Codex.
6. Run `codex doctor --summary`.

Restore creates a rollback backup of the current managed targets first. The
installer and CLI do not delete backups unless you explicitly run the
preview-first backup delete flow with `--apply`.
