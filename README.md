# Codex Chef

<p align="center">
  <img src="assets/icon.svg" alt="Codex Chef icon" width="120" />
  <br />
  <img src="assets/banner.svg" alt="Codex Chef banner showing agents, MCPs, skills, verification, and multilingual docs" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Documentation languages" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  🌐 <strong>Docs:</strong>
  <a href="README.de.md">🇩🇪 Deutsch</a> |
  <a href="README.es.md">🇪🇸 Español</a> |
  <a href="README.md">🇬🇧 English</a> |
  <a href="README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="README.tr.md">🇹🇷 Türkçe</a> |
  <a href="README.fr.md">🇫🇷 French / Français</a>
</p>

Codex Chef gives a Windows-first Codex setup a clean starting point: safer defaults, a named specialist team, curated skills, MCP defaults, local plugin workflows, and validation that users can inspect before anything touches their machine.

This is an unofficial community starter, not an OpenAI product. It is mapped to current official Codex documentation and keeps risky actions approval-gated by default.

The multilingual README entry points and six-language deep docs coverage are part
of the release surface, so users do not have to start from English-only docs.

## 🚀 Copy-Paste Install

Windows PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Safe preview first:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
node scripts/plan-install.mjs --all --json --redact-paths
```

## 🍳 What You Get After Install

Codex Chef installs a reviewed Codex baseline, not a hidden sync from someone
else's machine. The install source is this repo: `templates/codex/config.*.toml`,
`templates/codex/agents/*.toml`, `plugins/codex-chef-workflows`, and the
manifest-backed install plan.

| Surface | What lands on your machine |
| --- | --- |
| 🤖 Agent team | 20 registered Codex subagent role files under `~/.codex/agents/*.toml`. |
| 🧠 Durable guidance | Global `~/.codex/AGENTS.md` with safe routing, verification, and approval rules. |
| 🔌 MCP defaults | 7 useful MCP servers enabled and 8 authenticated/high-risk connectors parked disabled. |
| 🧩 Plugin + skills | Local `codex-chef-workflows` plugin, two bundled skills, and nine optional curated global skills. |
| 🛡️ Safety gates | Backups, dry-run planning, secret scanning, validation, and approval-gated risky actions. |

## 🤖 Installed Agent Team

These are Codex subagent role definitions, not separate background services.
Codex uses their names, descriptions, and TOML role files when routing a task.

| Role | Config ID | Best for |
| --- | --- | --- |
| 🗺️ Code Mapper | `code_mapper` | Reads an unfamiliar repo before implementation: files, ownership, boundaries, and data flow. |
| 📚 Docs Researcher | `docs_researcher` | Checks official docs, standards, APIs, and version-sensitive behavior before the answer hardens. |
| 🧭 Context Architect | `context_architect` | Decides whether behavior belongs in a prompt, `AGENTS.md`, skill, plugin, MCP, hook, rule, memory, or config. |
| ✍️ Prompt Architect | `prompt_architect` | Turns vague work into reliable prompts, task briefs, success criteria, and reusable instructions. |
| 🔌 MCP Integrator | `mcp_integrator` | Plans least-privilege MCP connectors, auth boundaries, enabled tools, and troubleshooting. |
| 🎯 Product Strategist | `product_strategist` | Pushes on framing, scope, alternatives, and the smallest useful version. |
| 🏗️ Engineering Planner | `engineering_planner` | Locks architecture, data flow, diagrams, edge cases, and test strategy before build work starts. |
| 🎨 Design Reviewer | `design_reviewer` | Reviews UX, accessibility, visual polish, design-system fit, and generic AI output risk. |
| 🧰 DevEx Auditor | `devex_auditor` | Tests onboarding friction, docs clarity, first-run flow, and time-to-hello-world. |
| 🕵️ Root-Cause Debugger | `root_cause_debugger` | Reproduces failures, traces data flow, tests hypotheses, and finds the cause before fixes. |
| ✅ QA Lead | `qa_lead` | Exercises user flows, hunts regressions, plans coverage, and re-verifies fixes. |
| ⚡ Performance Auditor | `performance_auditor` | Measures page speed, Core Web Vitals, traces, resource budgets, and regressions. |
| 📝 Docs Author | `docs_author` | Catches stale claims, release-note gaps, missing guides, and weak documentation coverage. |
| 📐 Spec Author | `spec_author` | Converts fuzzy intent into an executable spec with non-goals, edge cases, and quality gates. |
| 🔍 Code Reviewer | `code_reviewer` | Reviews correctness, regressions, security, maintainability, and missing tests with fresh context. |
| 🖥️ Frontend Verifier | `frontend_verifier` | Checks rendered UI, screenshots, responsive layout, interaction states, and console errors. |
| 🛡️ Security Auditor | `security_auditor` | Reviews auth, secrets, permissions, API routes, data access, dependencies, and abuse paths. |
| 🧪 Test Verifier | `test_verifier` | Runs lint, typecheck, tests, builds, smoke checks, and collects failure evidence. |
| 🚢 Release Verifier | `release_verifier` | Checks git hygiene, version/changelog state, artifacts, secret scans, CI, and publish gates. |
| 🩺 Codex Doctor | `codex_doctor` | Diagnoses starter health, catalog drift, install-plan coverage, docs, MCP defaults, and next checks. |

## 🧩 Skills Included

Codex Chef ships two local plugin skills. With `-All` or `-InstallSkills`, it
can also install nine reviewed public skills for frontend, design, dependency,
and Vercel workflows.

| Skill | ID | Install mode | Why you would use it |
| --- | --- | --- | --- |
| 🍳 Chef Operator | `codex-chef-operator` | Plugin-local | Keeps this starter maintained without weakening install safety or security gates. |
| 📐 Offline Diagram Triplet | `offline-diagram-triplet` | Plugin-local | Turns Mermaid into editable Excalidraw, SVG, PNG, and Markdown without network access. |
| ⬆️ Dependency Upgrade | `dependency-upgrade` | Optional global | Handles dependency upgrades with safer review and verification habits. |
| 🖼️ Frontend Builder | `frontend-skill` | Optional global | Builds visually stronger frontend experiences. |
| 💎 Interface Polish | `impeccable` | Optional global | Audits, sharpens, and hardens frontend interfaces. |
| 🎨 Design Taste | `design-taste-frontend` | Optional global | Adds senior UI/UX taste and reduces generic AI output. |
| 🧱 Image To Code | `image-to-code` | Optional global | Converts visual references into frontend code. |
| ✨ High-End Visual Design | `high-end-visual-design` | Optional global | Improves hierarchy, spacing, visual direction, and polish. |
| ♿ Web Guidelines | `web-design-guidelines` | Optional global | Reviews accessibility, UX quality, and interface standards. |
| ⚛️ React Best Practices | `vercel-react-best-practices` | Optional global | Optimizes React and Next.js implementation patterns. |
| ▲ Vercel Optimize | `vercel-optimize` | Optional global | Investigates Vercel cost, performance, and platform usage. |

## 🔌 MCP Defaults

Enabled by default for useful local/research work: OpenAI Developer Docs,
Context7, sequential thinking, Playwright, Chrome DevTools, Serena, and memory.
Disabled by default until explicitly needed: filesystem, GitHub, Figma, Linear,
Notion, Sentry, Vercel, and Supabase.

## &#127760; Language Entry Points

| Language | README |
| --- | --- |
| &#127465;&#127466; Deutsch | [README.de.md](README.de.md) |
| &#127466;&#127480; Español | [README.es.md](README.es.md) |
| &#127468;&#127463; English | [README.md](README.md) |
| &#127463;&#127479; Português (Brasil) | [README.pt-BR.md](README.pt-BR.md) |
| &#127481;&#127479; Türkçe | [README.tr.md](README.tr.md) |
| &#127467;&#127479; French / Français | [README.fr.md](README.fr.md) |

## ⚡ Start Here

| Goal | Link |
| --- | --- |
| Install safely | [Quick Start](#-quick-start) |
| Preview changes before writing anything | [Dry Run](#-dry-run-first) |
| Inspect the full install plan | [Install Plan](#-install-plan) |
| See what gets installed | [Install Surface](#-install-surface) |
| Understand Codex capabilities | [Capability Map](docs/codex-capability-map.md) |
| Map ECC/GStack-style workflows | [Workflow Surface Map](docs/workflow-surface-map.md) |
| Verify before publishing | [Verification](docs/verification.md) |
| Read release notes | [Release Notes](docs/release-notes.md) |
| Prepare GitHub metadata | [GitHub Settings](docs/github-settings.md) |
| Review advisory inputs | [Advisory Sources](docs/advisory-sources.md) |
| Troubleshoot Windows/Codex issues | [Troubleshooting](docs/troubleshooting.md) |
| Upgrade an existing setup | [Upgrade Guide](docs/upgrade.md) |

## 🧭 What This Repo Is

Codex Chef turns scattered local setup knowledge into a public, reviewable starter repository. It helps users answer:

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
- `~/.codex/plugins/codex-chef-workflows`
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

## 🧾 Install Plan

For a machine-readable no-write plan:

```bash
node scripts/plan-install.mjs --all --json
```

For quick discovery before reading the full JSON:

```bash
node scripts/plan-install.mjs --list-profiles
node scripts/plan-install.mjs --list-operations
```

The plan is backed by `manifests/install-plan.json` and records each managed
operation, collision policy, backup behavior, risk level, and required flag.
It is inspired by ECC's manifest-driven install architecture, but remains
Codex-only and does not import ECC's global config, hooks, MCPs, or skill
catalog. See [ECC Compatibility](docs/ecc-compatibility.md).

## ⚡ Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Bash or WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
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
2. Use `context_architect` when you need to decide whether behavior belongs in prompts, `AGENTS.md`, skills, plugins, MCP, hooks, memory, rules, or config.
3. Verify current APIs and product behavior with `docs_researcher`; use `prompt_architect` for reusable prompts, briefs, and instruction systems.
4. Use `mcp_integrator` before enabling or troubleshooting connectors and MCP tool exposure.
5. Implement in the main thread with repo instructions and selected skills.
6. Use `test_verifier`, `frontend_verifier`, or `security_auditor` when the task needs deeper evidence.
7. Use `codex_doctor` for starter health and drift checks.
8. Use `release_verifier` before push, tag, release, package, deploy, or publication.

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
| 🧪 Real validation | `npm run check` runs repo, docs, install-plan, agent drift, MCP drift, skill-source, supply-chain, and security checks. |
| 🔐 Secret scanning ready | Gitleaks command is documented and the Git hook runs it when available. |
| 🌐 Multilingual docs | Deutsch, Español, English, Português (Brasil), Türkçe, and Français README and deep documentation files are present; six-language deep docs are enforced by validation. |
| 🎬 Accessible visuals | SVG assets include title, description, motion, reduced-motion fallback, and README alt text. |
| 🧩 Skill source gate | `catalog/skills-lock.json` is checked against installable skill metadata. |
| 📐 Offline diagrams | Bundled `offline-diagram-triplet` emits Mermaid, editable Excalidraw, SVG, PNG, and Markdown with zero network. |
| 🤖 Agent drift gate | `catalog/agents.json` is checked against Windows/Unix config blocks and role TOML files. |
| 🩺 Doctor gate | `npm run codex:doctor` summarizes repo-only Codex starter health without global writes. |
| 🧾 Install plan gate | `manifests/install-plan.json` and the install-state preview schema are validated before installer execution. |
| 🔌 Conservative MCPs | Authenticated account, database, and broad filesystem connectors stay disabled. |
| 🧭 Source-backed guidance | Research notes record source type, confidence, support, and outdated-risk. |
| 📣 Public-safe triage | CODEOWNERS and issue templates route bugs, features, questions, and security reports without private data. |
| ♻️ CI alignment | GitHub Actions runs the same `npm run check` path plus shell parser checks. |

## 📁 Repository Layout

```text
.github/                 CI workflow plus issue and PR templates
assets/                  Public-safe README visuals
catalog/                 Skill and MCP source metadata
README*.md               Multilingual public entry points
docs/                    Six-language setup and verification guides
manifests/               No-write install plan metadata
plugins/                 Bundled local Codex plugin
schemas/                 Lightweight validation schemas
scripts/                 Install, doctor, and validation scripts
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

Every deep guide has English, German, Spanish, Brazilian Portuguese, Turkish, and French files. For example, `docs/install.md` is paired with `docs/install.de.md`, `docs/install.es.md`, `docs/install.pt-BR.md`, `docs/install.tr.md`, and `docs/install.fr.md`.

- [Install](docs/install.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Expected output](docs/expected-output.md)
- [Upgrade guide](docs/upgrade.md)
- [Codex capability map](docs/codex-capability-map.md)
- [Workflow surface map](docs/workflow-surface-map.md)
- [Codex surfaces](docs/codex-surfaces.md)
- [Skills and agents](docs/skills-and-agents.md)
- [MCP catalog](docs/mcp-catalog.md)
- [Security model](docs/security-model.md)
- [Verification](docs/verification.md)
- [Public readiness](docs/public-readiness.md)
- [SEO and discoverability](docs/seo.md)
- [Research notes](docs/research-notes.md)
- [Advisory sources](docs/advisory-sources.md)
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
