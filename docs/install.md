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
npm run verify:install:runtime
codex --strict-config "Summarize the active Codex setup."
```

`npm run verify:install:runtime` is read-only. It checks the installed
`~/.codex` and `~/.agents` targets, then compares them with the active Codex
runtime home reported by `codex doctor --json`. If Codex is reading a sandbox
or alternate `CODEX_HOME`, the verifier reports that mismatch instead of
silently claiming MCPs are missing.

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

## Rollback

1. Close Codex.
2. Copy files back from the timestamped backup folder.
3. Restart Codex.
4. Run `codex doctor --summary`.

The installer does not delete backups.
