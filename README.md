# Codex Enterprise Starter

A security-first Codex setup kit for Windows-first power users and small teams.
It turns a mature local Codex configuration into a clean, shareable repository:
global instructions, MCP defaults, specialist agents, approval rules, skill
catalogs, plugin packaging, validation scripts, and bilingual how-to docs.

This repository does not include tokens, auth files, memories, sessions, local
project paths, private keys, cookies, or machine-specific state.

## What It Installs

- `~/.codex/AGENTS.md` durable working agreements.
- `~/.codex/config.toml` with safe defaults, MCP servers, feature flags, and
  specialist agent registrations.
- `~/.codex/agents/*.toml` for focused code mapping, docs research, review,
  frontend verification, security audit, test verification, and release
  verification.
- `~/.codex/rules/default.rules` with narrow command approval rules.
- Optional global Git hygiene: ignore file plus a pre-commit hook that blocks
  obvious secrets and runs Gitleaks when available.
- Optional skill installation from `catalog/skills.json`.
- A local plugin marketplace entry for the bundled
  `codex-enterprise-workflows` plugin.

## Quick Start

PowerShell:

```powershell
cd "$env:USERPROFILE\Desktop\codex-enterprise-starter"
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -InstallSkills -InstallGitGuards -Force
```

Bash or WSL:

```bash
cd ~/Desktop/codex-enterprise-starter
chmod +x scripts/install.sh
./scripts/install.sh --install-skills --install-git-guards --force
```

After installation, restart Codex and run:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

## Safe Defaults

- Sandbox stays enabled.
- Approval policy stays interactive.
- Agent network access stays off unless a profile or explicit approval enables it.
- Authenticated remote connectors are disabled by default.
- MCPs that can touch external systems should prompt before risky tools.
- GitHub push, release creation, deployment, secret rotation, package publishing,
  destructive file operations, and credential access remain approval-gated.

## Repository Layout

```text
catalog/                 MCP and skill catalogs
docs/                    English and Turkish setup guides
plugins/                 Optional local Codex plugin package
scripts/                 Install and validation scripts
templates/codex/         Files copied into ~/.codex
templates/git/           Optional global Git hygiene files
```

## What Was Found Locally

The previous global Codex work changed the live user setup, not a new Desktop
repository. The important current-state locations were:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/SECURITY_OPERATIONS.md`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.agents/skills/*`
- `~/.gitignore_global`
- `~/.githooks/pre-commit`

See [docs/local-audit.md](docs/local-audit.md) for the normalized audit.

## Publishing To GitHub

This repository is designed to be pushed after validation, but the installer's
job is local setup only. It does not create remotes, commit, push, publish,
deploy, or open pull requests.

Before pushing:

```bash
npm run validate
git status --short
git diff --cached
```

If Gitleaks is installed:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

## Official Codex References

The docs in this repo are based on the current Codex manual fetched on
2026-06-10 and local configuration evidence. Start with:

- Codex CLI reference: https://developers.openai.com/codex/cli/reference
- AGENTS.md guidance: https://developers.openai.com/codex/guides/agents-md
- Skills: https://developers.openai.com/codex/skills
- MCP: https://developers.openai.com/codex/mcp
- Rules: https://developers.openai.com/codex/rules
- Hooks: https://developers.openai.com/codex/hooks
- Permissions: https://developers.openai.com/codex/permissions
- Plugins: https://developers.openai.com/codex/plugins
- Windows: https://developers.openai.com/codex/windows
