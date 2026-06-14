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
.\scripts\install.ps1 -All -Force -WhatIf
```

Install after the preview is correct:

```powershell
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Useful switches:

- `-All`: install Codex templates, verified public skills, and global Git
  guards.
- `-InstallSkills`: install `catalog/skills.json` entries that have
  `install: true`, a verified `package` in `owner/repo` format, and a matching
  `skill` name. The installer calls `npx.cmd skills add <package> --skill
  <skill> --agent codex --yes --global`.
- `-InstallGitGuards`: install global Git ignore and pre-commit hook.
- `-Force`: overwrite managed Codex files after creating backups.
- `-NoBackup`: skip backups. Not recommended.
- `-WhatIf`: preview file, Git, and skill operations without changing the real
  setup.

## Bash Or WSL Install

Preview without writing:

```bash
./scripts/install.sh --all --force --dry-run
```

Install after the preview is correct:

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
- `--dry-run`

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
- bundled local plugin directory

Directory replacement is allowed only under the managed Codex or Agents home.
The installer refuses unmanaged directory targets.

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
