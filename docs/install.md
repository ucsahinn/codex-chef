# Installation Guide

This guide installs the starter into the current user's Codex home. By default
Codex uses `~/.codex`; if `CODEX_HOME` is set, the installer uses that path.

## Prerequisites

- Codex CLI or Codex app installed.
- Git installed.
- Node.js 18 or newer for validation and optional skill installation.
- `npx` available if you use stdio MCP servers or install verified public
  skills.
- Optional: Gitleaks for stronger pre-commit and pre-push scanning.
- Optional on Windows: `winget`, `uvx`, and current Windows 11 for the best
  native sandbox path.

## PowerShell Install

Preview without writing:

```powershell
.\scripts\install.ps1 -All -WhatIf
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
  existing agent files, rules, and marketplace files are skipped.
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
  `config.toml` is merged and other existing managed files are skipped.
- `--no-backup`
- `--dry-run`
- `--plain-output`: use ASCII status markers.
- `--interactive`: guided Bash/WSL setup with the same path, skills, force,
  Git-guard, and continue prompts.

Both installers finish with a capability board that lists the specialist
agents, default-ready MCP servers, disabled opt-in MCP connectors, bundled
plugin skills, and reviewed global skills. Account, database, production, and
broad filesystem connectors remain disabled unless you explicitly enable them
later.

## What Gets Backed Up

Existing files are copied into:

```text
~/.codex/backups/codex-chef-YYYYMMDD-HHMMSS/
```

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
npm run codex:status
npm run verify:install:runtime
codex --strict-config "Summarize the active Codex setup."
```

`npm run codex:status` is the end-user status board. It combines repo-only
starter health, installed-runtime drift, direct Codex doctor check summaries,
and skill context-budget warnings. Use `npm run codex:status:all` when the real
install intentionally included curated skills and optional Git guards.

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

If you already have a Codex setup, the safe default path is still the normal
install command. Existing `config.toml` is backed up and merged; existing user
tables are preserved. Other existing managed files are skipped unless you use
`-Force` / `--force` after reviewing the preview.

## Rollback

1. Close Codex.
2. Copy files back from the timestamped backup folder.
3. Restart Codex.
4. Run `codex doctor --summary`.

The installer does not delete backups.
