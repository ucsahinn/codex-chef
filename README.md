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
  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> <strong>Docs:</strong>
  <a href="README.de.md"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"></a> |
  <a href="README.es.md"><img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"></a> |
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a> |
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"></a> |
  <a href="README.tr.md"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"></a> |
  <a href="README.fr.md"><img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"></a>
</p>

<!-- bilingual-welcome:start -->
<table>
  <tr>
    <td width="50%" valign="top">
      <h3><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"> English welcome</h3>
      <p><strong>Codex Chef is a Windows-first Codex setup kit.</strong> It installs a reviewable baseline for agents, MCPs, skills, plugins, safety rules, and verification without turning on risky account or database access by default.</p>
      <p><strong>Start here:</strong> run the safe preview, then use the interactive installer only after you see what will change.</p>
    </td>
    <td width="50%" valign="top">
      <h3><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"> Türkçe karşılama</h3>
      <p><strong>Codex Chef, Windows odaklı bir Codex kurulum kitidir.</strong> Ajanlar, MCP'ler, skill'ler, plugin akışları, güvenlik kuralları ve doğrulamayı tek yerde toplar; riskli hesap/database bağlantılarını kendiliğinden açmaz.</p>
      <p><strong>Buradan başla:</strong> önce safe preview çalıştır, sonra değişiklikleri gördükten sonra interactive install kullan.</p>
    </td>
  </tr>
</table>
<!-- bilingual-welcome:end -->

This is an unofficial community starter, not an OpenAI product. It is mapped to current official Codex documentation and keeps destructive, credentialed, publishing, deployment, database, and broad filesystem actions approval-gated.

The multilingual README entry points and six-language deep docs coverage are part of the release surface. English and Turkish keep the most complete operator flow; Deutsch, Español, Português (Brasil), and Français provide concise local entry points and links into the same deep docs.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Copy-Paste Install

Preview first:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
node scripts/plan-install.mjs --all --json --redact-paths
```

Install after reviewing the preview:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Bash or WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --interactive
```

Repair an existing Codex Chef setup without deleting user skills:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> CLI Without The Noise

Use `npm run chef` for the menu. Keep these commands handy:

| Need | Command |
| --- | --- |
| Fast local health check | `npm run chef -- --status --repo-only --no-log` |
| Full status board | `npm run codex:status` |
| Install preview | `npm run chef -- --preview` |
| Routing profile map | `npm run chef -- --routing --profile starter-health` |
| Diagnostics hub | `npm run chef -- --diagnostics --no-log` |
| Process audit only | `npm run chef -- --processes --no-log` |
| Repair preview/apply | `npm run chef -- --repair` then `npm run chef -- --repair --apply` |

Rules of thumb:

- `--status`, `--preview`, `--skills`, `--mcp`, `--routing`, `--diagnostics`, `--processes`, `--auth`, and `--logs` are inspection-first surfaces.
- Write paths require `--apply` or typed confirmation. The menu labels the write boundary before doing anything risky.
- Add `--no-log` when you want a strict no-log audit. Normal CLI logs are repo-local, ignored, and redacted.
- Do not use `npx run`; use `npm run chef` or `npm --prefix <repo> run chef`.

Detailed CLI behavior lives in [Install](docs/install.md), [Expected output](docs/expected-output.md), and [Troubleshooting](docs/troubleshooting.md).

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> What You Get

Codex Chef installs a reviewed Codex baseline, not a hidden copy of someone else's machine.

| Surface | What lands on your machine |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Agent team | 21 Codex subagent role files under `~/.codex/agents/*.toml`, including readable `nickname_candidates`. They are role definitions, not always-on services. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Durable guidance | Global `~/.codex/AGENTS.md` with routing, verification, safety, and approval rules. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP defaults | 7 useful MCP entries enabled for docs, code navigation, browser evidence, reasoning, and non-secret memory; 8 account/database/high-risk connectors disabled. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Plugin + skills | Local `codex-chef-workflows` plugin, three bundled skills, and sixteen reviewed optional global skills. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Safety gates | Dry runs, backups, validation, secret scanning, and approval gates before risky actions. |

Installed skills do not execute by themselves. They enter context when named by the user or when a task clearly matches their description. Codex subagents also do not spawn from every prompt; current Codex releases require the user to explicitly ask for subagents or parallel agent work.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Installed Agent Team

These are the visible specialist names Codex Chef installs. They are role files for explicit, visible delegation; they are not always-on background services.

| Map and plan | Build and review | Verify and ship |
| --- | --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="18"> **Code Mapper** (`code_mapper`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="18"> **Design Reviewer** (`design_reviewer`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="18"> **QA Lead** (`qa_lead`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="18"> **Docs Researcher** (`docs_researcher`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="18"> **DevEx Auditor** (`devex_auditor`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="18"> **Performance Auditor** (`performance_auditor`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="18"> **Context Architect** (`context_architect`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f575.svg" alt="" aria-hidden="true" width="18"> **Root-Cause Debugger** (`root_cause_debugger`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="18"> **Google SEO Auditor** (`google_seo_auditor`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="18"> **Prompt Architect** (`prompt_architect`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4dd.svg" alt="" aria-hidden="true" width="18"> **Docs Author** (`docs_author`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="18"> **Security Auditor** (`security_auditor`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="18"> **MCP Integrator** (`mcp_integrator`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cb.svg" alt="" aria-hidden="true" width="18"> **Spec Author** (`spec_author`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="18"> **Test Verifier** (`test_verifier`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3af.svg" alt="" aria-hidden="true" width="18"> **Product Strategist** (`product_strategist`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50d.svg" alt="" aria-hidden="true" width="18"> **Code Reviewer** (`code_reviewer`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a2.svg" alt="" aria-hidden="true" width="18"> **Release Verifier** (`release_verifier`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3d7.svg" alt="" aria-hidden="true" width="18"> **Engineering Planner** (`engineering_planner`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ad.svg" alt="" aria-hidden="true" width="18"> **Frontend Verifier** (`frontend_verifier`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="18"> **Codex Doctor** (`codex_doctor`) |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skills Included

| Set | Skills |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> Local plugin | `codex-chef-operator`, `offline-diagram-triplet`, `context-budget-planner` |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> Reviewed global catalog | `dependency-upgrade`, `gh-fix-ci`, `systematic-debugging`, `request-refactor-plan`, `security-best-practices`, `frontend-skill`, `webapp-testing`, `web-quality-audit`, `seo`, `accessibility`, `test-driven-development`, `documentation-and-adrs`, `mcp-builder`, `ai-project-starter`, `prompt-architect`, `ai-skill-create` |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP Defaults

| Status | MCPs | Boundary |
| --- | --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Enabled by default | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="18"> OpenAI Docs · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="18"> Context7 · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="18"> Sequential Thinking · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ad.svg" alt="" aria-hidden="true" width="18"> Playwright · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="18"> Chrome DevTools · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="18"> Serena · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="18"> Memory | Research, code navigation, browser evidence, and non-secret local context. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f512.svg" alt="" aria-hidden="true" width="20"> Disabled until opt-in | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="18"> Filesystem · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f419.svg" alt="" aria-hidden="true" width="18"> GitHub · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="18"> Figma · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cc.svg" alt="" aria-hidden="true" width="18"> Linear · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5d2.svg" alt="" aria-hidden="true" width="18"> Notion · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a8.svg" alt="" aria-hidden="true" width="18"> Sentry · ▲ Vercel · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5c4.svg" alt="" aria-hidden="true" width="18"> Supabase | These can expose private files, accounts, deployments, telemetry, or databases. |

Run `npm run codex:status` after install to see MCP setup notes, effective controls, routing profiles, and installed-runtime drift without mutating global Codex state.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> What It Does Not Do

- It does not store tokens, cookies, auth files, private keys, sessions, memories, or local project state.
- It does not enable authenticated account, database, production, or broad filesystem MCP connectors by default.
- It does not commit, push, tag, release, publish packages, deploy, rotate secrets, or change GitHub settings.
- It does not delete user data as a cleanup shortcut; repair and force flows are previewed and backup-backed.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ac.svg" alt="" aria-hidden="true" width="20"> Visual Overview

<p align="center">
  <img src="assets/workflow-overview.svg" alt="Workflow overview showing install, route, research, implement, and verify steps" width="100%" />
</p>

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Trust Signals

| Signal | Evidence |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> Real validation | `npm run check` runs repo, docs, install-plan, installer smoke, agent drift, MCP drift, token-surface, skill-source, supply-chain, package-surface, release-readiness, and security checks. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> Multilingual surface | Six root READMEs plus six-language deep docs are validated. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> Conservative connectors | Account, database, production, and broad filesystem connectors stay disabled until a task explicitly needs them. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install plan | `manifests/install-plan.json` and `schemas/install-plan.schema.json` define the managed write surface. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ee.svg" alt="" aria-hidden="true" width="20"> Context budget | `npm run token:audit` reports the largest context surfaces; `token-safe.config.toml` lowers verbosity and tool-output budgets without disabling skills, MCPs, memory, hooks, or automatic agent model/reasoning selection. |
| Agent-readable index | `llms.txt` gives agents a compact map of install targets, docs, safety boundaries, and comparison sources. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> Repository Layout

```text
.github/                 CI workflow plus issue and PR templates
assets/                  Public-safe README visuals
catalog/                 Agent, skill, MCP, and routing metadata
README*.md               Multilingual public entry points
docs/                    Six-language setup and verification guides
manifests/               No-write install plan metadata
plugins/                 Bundled local Codex plugin and skills
schemas/                 Lightweight validation schemas
scripts/                 Install, doctor, status, CLI, and validation scripts
templates/codex/         Files copied into ~/.codex
templates/git/           Optional global Git hygiene files
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Verify Locally

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Optional online skill-source check:

```bash
npm run verify:skills:online
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Documentation

Use the README for orientation; use the docs for operator detail:

- [Install](docs/install.md)
- [Expected output](docs/expected-output.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Upgrade guide](docs/upgrade.md)
- [Codex capability map](docs/codex-capability-map.md)
- [Workflow surface map](docs/workflow-surface-map.md)
- [Codex surfaces](docs/codex-surfaces.md)
- [Codex flags](docs/codex-flags.md)
- [Skills and agents](docs/skills-and-agents.md)
- [MCP catalog](docs/mcp-catalog.md)
- [Security model](docs/security-model.md)
- [Verification](docs/verification.md)
- [Public readiness](docs/public-readiness.md)
- [ECC compatibility](docs/ecc-compatibility.md)
- [SEO and discoverability](docs/seo.md)
- [Research notes](docs/research-notes.md)
- [Advisory sources](docs/advisory-sources.md)
- [Publishing](docs/publish.md)
- [Agent-readable index](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Official Codex References

- Codex manual: https://developers.openai.com/codex/codex-manual.md
- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins
- MCP and connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- Windows: https://developers.openai.com/codex/windows
- Config, permissions, rules, hooks, and `AGENTS.md` mapping: [Research notes](docs/research-notes.md)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Publishing Boundary

This repo is built to be public-ready after validation, but the installer is local-only. Commit, push, tag, release, package publishing, deployments, and GitHub settings changes must be explicit human decisions after local verification.
