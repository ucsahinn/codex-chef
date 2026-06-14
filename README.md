# Codex Enterprise Starter

<p align="center">
  <img src="assets/banner.svg" alt="Codex Enterprise Starter banner showing agents, MCPs, skills, verification, and bilingual docs" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-enterprise-starter/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-enterprise-starter/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-enterprise-starter?color=0f766e" /></a>
  <a href="README.tr.md"><img alt="English and Turkish docs" src="https://img.shields.io/badge/docs-English%20%2B%20T%C3%BCrk%C3%A7e-0f766e" /></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a> | <a href="README.tr.md">🇹🇷 Türkçe</a>
</p>

Security-first Codex setup for Windows-first power users and small teams. It packages a repeatable local Codex baseline: durable instructions, conservative config, specialist agents, approval rules, MCP defaults, curated skill metadata, plugin packaging, validation scripts, and bilingual docs.

This is an unofficial community starter, not an OpenAI product. It is mapped to current official Codex documentation and keeps risky actions approval-gated by default.

## ⚡ Start Here

| Goal | Link |
| --- | --- |
| Install safely | [Quick Start](#-quick-start) |
| Preview changes before writing anything | [Dry Run](#-dry-run-first) |
| See what gets installed | [Install Surface](#-install-surface) |
| Verify before publishing | [Verification](docs/verification.md) |
| Troubleshoot Windows/Codex issues | [Troubleshooting](docs/troubleshooting.md) |
| Upgrade an existing setup | [Upgrade Guide](docs/upgrade.md) |

## 🧭 What This Repo Is

Codex Enterprise Starter turns scattered local setup knowledge into a public, reviewable starter repository. It helps users answer:

- What should live in `AGENTS.md`, config, skills, plugins, MCP, rules, or hooks?
- Which connectors are safe by default?
- Which global files are touched by setup?
- How do I verify this before trusting it?
- How do I extend it without leaking secrets or weakening approvals?

## 🧩 Install Surface

The installers copy these managed templates:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-enterprise-workflows`
- `~/.agents/plugins/marketplace.json`

Optional switches can also install:

- Global Git ignore rules at `~/.gitignore_global`
- A global Git pre-commit hook under `~/.githooks`
- Curated public Codex skills from `catalog/skills.json`

## 🚫 What It Does Not Do

The installer does not:

- Store tokens, cookies, auth files, private keys, memories, sessions, or local project state.
- Enable authenticated account, database, production, or broad filesystem MCP connectors by default.
- Commit, push, create releases, deploy, publish packages, rotate secrets, or change GitHub settings.
- Delete user data without first backing up managed targets, unless the user explicitly chooses `-NoBackup` or `--no-backup`.

## 🔎 Dry Run First

PowerShell:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

Bash or WSL:

```bash
./scripts/install.sh --all --force --dry-run
```

Dry runs print the target Codex/Agents homes and the changes that would happen without touching real files, Git settings, or global skills.

## ⚡ Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Bash or WSL:

```bash
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

After installation, restart Codex and run:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Use `-InstallSkills` / `--install-skills` or `-InstallGitGuards` / `--install-git-guards` when you only want one optional part of the setup.

## 🧠 Operating Model

1. Map unfamiliar code with `code_mapper`.
2. Verify current APIs and product behavior with `docs_researcher`.
3. Implement in the main thread with repo instructions and selected skills.
4. Use `test_verifier`, `frontend_verifier`, or `security_auditor` when the task needs deeper evidence.
5. Use `release_verifier` before push, tag, release, package, deploy, or publication.

The result is a small specialist-team workflow inside Codex while the main thread stays focused on decisions, implementation, and final evidence.

## 🎬 Visual Overview

<p align="center">
  <img src="assets/workflow-overview.svg" alt="Workflow overview showing install, route, research, implement, and verify steps" width="100%" />
</p>

## 🛡️ Safe Defaults

- Sandbox stays enabled.
- Approval policy stays interactive.
- Workspace command network access stays off.
- Shell subprocesses inherit only a trimmed environment with default secret exclusions.
- Authenticated remote connectors stay disabled until a task needs them.
- MCP tools that can touch external systems prompt before risky actions.
- Skills are installed only from package/skill pairs in the catalog and lock file.
- Deletion, cleanup, overwrite, credential access, publish, push, and release operations remain approval-gated.

## ✅ Trust Signals

| Signal | Evidence |
| --- | --- |
| 🛡️ Public-safe by design | No tokens, auth files, sessions, memories, cookies, private keys, or machine-specific state are included. |
| 🧪 Real validation | `npm run check` runs repository, docs, skill-source, and security checks. |
| 🔐 Secret scanning ready | Gitleaks command is documented and the Git hook runs it when available. |
| 🌐 Bilingual docs | English and Turkish doc pairs are enforced by validation. |
| 🎬 Accessible visuals | SVG assets include title, description, motion, reduced-motion fallback, and README alt text. |
| 🧩 Skill source gate | `catalog/skills-lock.json` is checked against installable skill metadata. |
| 🔌 Conservative MCPs | Authenticated account, database, and broad filesystem connectors stay disabled. |
| 🧭 Source-backed guidance | Research notes record source type, confidence, support, and outdated-risk. |
| ♻️ CI alignment | GitHub Actions runs the same `npm run check` path plus shell parser checks. |

## 📁 Repository Layout

```text
.github/                 CI workflow plus issue and PR templates
assets/                  Public-safe README visuals
catalog/                 Skill and MCP source metadata
docs/                    English and Turkish setup guides
plugins/                 Bundled local Codex plugin
scripts/                 Install and validation scripts
templates/codex/         Files copied into ~/.codex
templates/git/           Optional global Git hygiene files
```

## 🧾 Verify Locally

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Optional online skill-source check:

```bash
npm run verify:skills:online
```

Online skill verification uses the network and the Skills CLI. It is intentionally separate from the default offline gate.

## 📚 Documentation

- [Install](docs/install.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Expected output](docs/expected-output.md)
- [Upgrade guide](docs/upgrade.md)
- [Codex surfaces](docs/codex-surfaces.md)
- [Skills and agents](docs/skills-and-agents.md)
- [MCP catalog](docs/mcp-catalog.md)
- [Security model](docs/security-model.md)
- [Verification](docs/verification.md)
- [Public readiness](docs/public-readiness.md)
- [Research notes](docs/research-notes.md)
- [Publishing](docs/publish.md)

## 📚 Official Codex References

Primary source: https://developers.openai.com/codex/codex-manual.md

Focused docs:

- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins
- MCP and connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- Windows: https://developers.openai.com/codex/windows
- Config, permissions, rules, hooks, and AGENTS.md are mapped in [docs/research-notes.md](docs/research-notes.md).

## 🚀 Publishing Boundary

This repo is built to be public-ready after validation, but the installer is local-only. Commit, push, tag, release, package publishing, deployments, and GitHub settings changes must be explicit human decisions after local verification.
