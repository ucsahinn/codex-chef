# Installation Guide

This guide installs the starter into the current user's Codex home. By default
Codex uses `~/.codex`; if `CODEX_HOME` is set, the installer uses that path.

## Prerequisites

- Codex CLI or Codex app installed.
- Git installed.
- Node.js 18 or newer for validation and optional skill installation.
- `npx` available if you use stdio MCP servers or install curated skills.
- Optional: Gitleaks for stronger pre-commit and pre-push scanning.
- Optional on Windows: `winget`, `uvx`, and current Windows 11 for the best
  native sandbox path.

## PowerShell Install

```powershell
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Useful switches:

- `-All`: install Codex templates, curated skills, and global Git guards.
- `-InstallSkills`: attempt to install entries from `catalog/skills.json`.
- `-InstallGitGuards`: install global Git ignore and pre-commit hook.
- `-Force`: overwrite managed Codex files after creating backups.
- `-NoBackup`: skip backups. Not recommended.

## Bash or WSL Install

```bash
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Useful flags:

- `--all`
- `--install-skills`
- `--install-git-guards`
- `--force`
- `--no-backup`

## What Gets Backed Up

Existing files are copied into:

```text
~/.codex/backups/codex-enterprise-starter-YYYYMMDD-HHMMSS/
```

The installer backs up managed targets before replacing them:

- `AGENTS.md`
- `config.toml`
- `rules/default.rules`
- `agents/*.toml`
- personal plugin marketplace file

## Post-Install Checks

Restart Codex, then run:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

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
.\scripts\install.ps1 -Force
```

Bash:

```bash
CODEX_HOME="$PWD/tmp/codex-home" AGENTS_HOME="$PWD/tmp/agents-home" \
  ./scripts/install.sh --force
```

Remove the `tmp/` folder after testing.

## Rollback

1. Close Codex.
2. Copy files back from the timestamped backup folder.
3. Restart Codex.
4. Run `codex doctor --summary`.

The installer does not delete backups.
