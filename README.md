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
      <p>Windows-first Codex setup starter with safer defaults, named agents, MCP defaults, curated skills, plugin workflows, and validation before anything touches your machine.</p>
      <p><strong>Start here:</strong> <a href="#copy-paste-install">Copy-paste install</a> or run the safe preview first.</p>
    </td>
    <td width="50%" valign="top">
      <h3><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"> Türkçe karşılama</h3>
      <p>Codex'i Windows'ta temiz ve kontrollü bir zemine oturtmak için hazırladığım başlangıç paketi. Güvenli varsayılanlar, ajan rolleri, MCP ayarları, seçtiğim skill'ler ve işlemden önce bakabileceğin doğrulama adımları tek yerde.</p>
      <p><strong>Buradan başla:</strong> Türkçe akış için <a href="README.tr.md">README.tr.md</a>; hızlı denemek istersen önce <a href="#copy-paste-install">safe preview</a> komutunu çalıştır.</p>
    </td>
  </tr>
</table>
<!-- bilingual-welcome:end -->

Codex Chef gives a Windows-first Codex setup a clean starting point: safer defaults, a named specialist team, curated skills, MCP defaults, local plugin workflows, and validation that users can inspect before anything touches their machine.

This is an unofficial community starter, not an OpenAI product. It is mapped to current official Codex documentation and keeps risky actions approval-gated by default.

The multilingual README entry points and six-language deep docs coverage are part
of the release surface, so users do not have to start from English-only docs.
English and Turkish carry the full operator detail for install, expected output,
and release notes; Deutsch, Español, Português (Brasil), and Français keep
safety summaries plus source section indexes so users know where the
authoritative full-detail docs live.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Copy-Paste Install

Windows PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Safe preview first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
node scripts/plan-install.mjs --all --json --redact-paths
```

Repair an existing global Codex setup without deleting user skills:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair
```

Codex Chef CLI wraps the same safe scripts in one Windows-friendly menu:

```powershell
npm run chef
npm run chef -- --status
npm run chef -- --preview
npm run chef -- --reset --apply
npm run chef -- --repair --apply
npm run chef -- --install --apply
npm run chef -- --skills
npm run chef -- --mcp
npm run chef -- --auth
npm run chef -- --logs
npm run chef -- --status --no-log
```

The menu labels every action with its write boundary. `--status`,
`--doctor`, `--preview`, `--skills`, `--mcp`, `--auth`, and `--logs` are
read-only for global/user state by default. They normally create ignored
repo-local audit logs under `tmp/chef-cli/logs`; add `--no-log` for strict
no-filesystem-write audits. `--reset --apply`, `--repair --apply`, and
`--install --apply` are the write paths; they route to the backup-backed
installer or repair script instead of deleting user state.
In an interactive terminal, `--skills` lets you pick one reviewed skill by
number and installs it only when you rerun with `--apply`. `--mcp` lets you pick
one connector by number to see transport, endpoint or package, setup, auth,
verification, source, and rollback notes without enabling account connectors.
CLI logs are ignored and not part of the source package.

If GitHub release, push, or workflow checks fail because local GitHub
authentication is stale, refresh GitHub CLI or Git Credential Manager according
to your organization policy. Keep account-scoped credential repair outside this
repository and never paste tokens into repo files, logs, prompts, skills, rules,
or shell history.

Automation-friendly one-shot install without questions:

```powershell
.\scripts\install.ps1 -All
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> What You Get After Install

Codex Chef installs a reviewed Codex baseline, not a hidden sync from someone
else's machine. The install source is this repo: `templates/codex/config.*.toml`,
`templates/codex/agents/*.toml`, `plugins/codex-chef-workflows`, and the
manifest-backed install plan.

| Surface | What lands on your machine |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Agent team | 21 registered Codex subagent role files under `~/.codex/agents/*.toml`. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Durable guidance | Global `~/.codex/AGENTS.md` with safe routing, verification, and approval rules. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP defaults | 7 useful MCP servers enabled and 8 authenticated/high-risk connectors parked disabled. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Plugin + skills | Local `codex-chef-workflows` plugin, three bundled skills, and sixteen optional curated global skills. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Safety gates | Backups, dry-run planning, secret scanning, validation, and approval-gated risky actions. |

At the end of the installer, Codex Chef prints a capability board with the
agent team, default-ready MCPs, disabled opt-in MCPs, local plugin skills, and
reviewed global skills. It also prints MCP setup notes for tooling, OAuth,
filesystem-path, and `SUPABASE_DB_URL` requirements, so first-run gaps are
visible before a task needs the connector. That is the quick "what did I just
get?" screen after setup.

### Enterprise Routing Board

Codex Chef also ships `catalog/routing-profiles.json`, a machine-readable
task-shape routing contract. It tells Codex which subagents, skills, MCPs, and
config/profile flags should be used for common enterprise work such as current
docs research, context placement, bug root cause, frontend verification,
security review, MCP connector changes, release readiness, SEO, docs, and
starter health.

```bash
npm run codex:routing
npm run codex:status
```

This is safe autonomy, not hidden execution. Matching agents, skills, MCPs, and
flags are required when the task shape appears, but destructive, credentialed,
publishing, deployment, database, and broad filesystem actions stay
approval-gated.

### <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP Connector Board

Codex Chef treats MCPs as explicit capabilities, not hidden account sync. The
useful local/research connectors are ready; account, database, production, and
broad filesystem connectors stay parked until you opt in.

| Status | MCPs | Why |
| --- | --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Ready by default | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> OpenAI Docs · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> Context7 · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Sequential Thinking · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ad.svg" alt="" aria-hidden="true" width="20"> Playwright · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> Chrome DevTools · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="20"> Serena · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Memory | Safe research, code navigation, browser evidence, and local non-secret context. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f512.svg" alt="" aria-hidden="true" width="20"> Disabled by default | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> Filesystem · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f419.svg" alt="" aria-hidden="true" width="20"> GitHub · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> Figma · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cc.svg" alt="" aria-hidden="true" width="20"> Linear · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5d2.svg" alt="" aria-hidden="true" width="20"> Notion · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a8.svg" alt="" aria-hidden="true" width="20"> Sentry · ▲ Vercel · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5c4.svg" alt="" aria-hidden="true" width="20"> Supabase | These can expose private files, accounts, telemetry, deployments, or databases, so you enable them only when the task needs them. |

Run `npm run codex:status` after install to see the live MCP setup board,
effective routing controls, and any installed-runtime drift without mutating
global Codex state.

If `~/.codex/config.toml` already exists, the installer backs it up and merges
only missing Codex Chef agent/MCP/safety tables. Your existing MCP entries,
tokens, profiles, and tuned settings are preserved unless you deliberately use
`-Force` / `--force`.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Installed Agent Team

These are Codex subagent role definitions, not separate background services.
Codex uses their names, descriptions, and TOML role files when routing a task.

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="20"> **Code Mapper** (`code_mapper`) - repo map
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> **Docs Researcher** (`docs_researcher`) - official docs
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> **Context Architect** (`context_architect`) - routing surface
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="20"> **Prompt Architect** (`prompt_architect`) - prompt system
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> **MCP Integrator** (`mcp_integrator`) - connectors
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3af.svg" alt="" aria-hidden="true" width="20"> **Product Strategist** (`product_strategist`) - scope
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3d7.svg" alt="" aria-hidden="true" width="20"> **Engineering Planner** (`engineering_planner`) - architecture
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> **Design Reviewer** (`design_reviewer`) - UX polish
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> **DevEx Auditor** (`devex_auditor`) - onboarding
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f575.svg" alt="" aria-hidden="true" width="20"> **Root-Cause Debugger** (`root_cause_debugger`) - investigation
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> **QA Lead** (`qa_lead`) - user flows
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> **Performance Auditor** (`performance_auditor`) - speed
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> **Google SEO Auditor** (`google_seo_auditor`) - search visibility
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4dd.svg" alt="" aria-hidden="true" width="20"> **Docs Author** (`docs_author`) - docs coverage
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> **Spec Author** (`spec_author`) - executable specs
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50d.svg" alt="" aria-hidden="true" width="20"> **Code Reviewer** (`code_reviewer`) - fresh review
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5a5.svg" alt="" aria-hidden="true" width="20"> **Frontend Verifier** (`frontend_verifier`) - rendered UI
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> **Security Auditor** (`security_auditor`) - threat paths
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> **Test Verifier** (`test_verifier`) - test evidence
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a2.svg" alt="" aria-hidden="true" width="20"> **Release Verifier** (`release_verifier`) - publish gates
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="20"> **Codex Doctor** (`codex_doctor`) - setup health

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skills Included

Codex Chef ships three local plugin skills. They are bundled with the
`codex-chef-workflows` plugin and are checked by `npm run validate:plugin-skills`
so they cannot quietly drift out of the repo. With `-All` or `-InstallSkills`,
the installer can also add sixteen reviewed public and first-party skills for maintenance,
debugging, refactoring, security, testing, browser verification, SEO, web
quality, docs, MCP building, context engineering, prompt architecture, skill
authoring, and one broad frontend workflow.

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> **Chef Operator** (`codex-chef-operator`) - plugin-local
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> **Offline Diagram Triplet** (`offline-diagram-triplet`) - plugin-local
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ee.svg" alt="" aria-hidden="true" width="20"> **Context Budget Planner** (`context-budget-planner`) - plugin-local
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2b06.svg" alt="" aria-hidden="true" width="20"> **Dependency Upgrade** (`dependency-upgrade`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5bc.svg" alt="" aria-hidden="true" width="20"> **Frontend Builder** (`frontend-skill`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> **Security Best Practices** (`security-best-practices`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ef.svg" alt="" aria-hidden="true" width="20"> **GitHub CI Fixer** (`gh-fix-ci`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f575.svg" alt="" aria-hidden="true" width="20"> **Systematic Debugging** (`systematic-debugging`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f1.svg" alt="" aria-hidden="true" width="20"> **Refactor Planner** (`request-refactor-plan`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> **Webapp Testing** (`webapp-testing`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> **Test-Driven Development** (`test-driven-development`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> **SEO** (`seo`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/267f.svg" alt="" aria-hidden="true" width="20"> **Accessibility** (`accessibility`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4ca.svg" alt="" aria-hidden="true" width="20"> **Web Quality Audit** (`web-quality-audit`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4dd.svg" alt="" aria-hidden="true" width="20"> **Documentation And ADRs** (`documentation-and-adrs`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> **MCP Builder** (`mcp-builder`) - optional global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f1.svg" alt="" aria-hidden="true" width="20"> **Context Starter** (`ai-project-starter`) - optional global, first-party
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="20"> **Prompt Architect Skill** (`prompt-architect`) - optional global, first-party
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e0.svg" alt="" aria-hidden="true" width="20"> **Skill Forge** (`ai-skill-create`) - optional global, first-party

Extra design, React/Vercel, prompt, memory, token, and context skills stay in
`catalog/skills.json` as manual opt-ins instead of default installs. That keeps
the starter broad without losing references such as `impeccable`,
`design-taste-frontend`, `image-to-code`, `high-end-visual-design`,
`web-design-guidelines`, `vercel-react-best-practices`, `vercel-optimize`,
`vercel-cli-with-tokens`, `context-map`, and `what-context-needed`.

The key distinction: Codex Chef solves LLM token/context planning with the
bundled local `context-budget-planner`; deployment-token or vendor-auth skills
remain opt-in because they can touch accounts or duplicate existing triggers.

First-party ecosystem skills are part of the reviewed `-All` / `-InstallSkills`
set:

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f1.svg" alt="" aria-hidden="true" width="20"> `ai-project-starter` - project context foundations,
  starter docs, agent instruction files, and vibe-coding guardrails.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="20"> `prompt-architect` - plan-first, approval-gated Codex
  prompt packages and prompt audits.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e0.svg" alt="" aria-hidden="true" width="20"> `ai-skill-create` - create, validate, forward-test, and package Codex
  skills and plugins.

Manual opt-in example:

```bash
npx skills add pbakaus/impeccable --skill impeccable --agent codex --yes --global
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP Defaults

Codex Chef installs MCP config entries, not hidden account connections. Useful
local/research servers are enabled; authenticated, database, production, and
broad filesystem connectors stay disabled until a task explicitly needs them.

Default enabled:

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> **OpenAI Developer Docs** (`openaiDeveloperDocs`) - official OpenAI/Codex docs.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> **Context7** (`context7`) - current library and framework docs.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> **Sequential Thinking** (`sequential-thinking`) - structured decomposition for complex tasks.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ad.svg" alt="" aria-hidden="true" width="20"> **Playwright** (`playwright`) - browser snapshots, console/network evidence, and UI checks.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> **Chrome DevTools** (`chrome-devtools`) - isolated Chrome inspection with redacted network headers.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="20"> **Serena** (`serena`) - semantic code navigation and repo symbol search.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> **Memory** (`memory`) - local memory graph for non-secret project context.

Default disabled until opt-in:

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> **Filesystem** (`filesystem`) - broad local file access; set an intentional path before enabling.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f419.svg" alt="" aria-hidden="true" width="20"> **GitHub** (`github`) - private repo/PR context through account authorization.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> **Figma** (`figma`) - private design files and workspace context.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cc.svg" alt="" aria-hidden="true" width="20"> **Linear** (`linear`) - issues, projects, and team planning context.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5d2.svg" alt="" aria-hidden="true" width="20"> **Notion** (`notion`) - private docs and databases.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a8.svg" alt="" aria-hidden="true" width="20"> **Sentry** (`sentry`) - production error and telemetry context.
- ▲ **Vercel** (`vercel`) - project and deployment platform context.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5c4.svg" alt="" aria-hidden="true" width="20"> **Supabase** (`supabase`) - database access through `SUPABASE_DB_URL`.

If a user already has `~/.codex/config.toml`, the installer now preserves it and
adds only missing Codex Chef agent/MCP/safety tables. Existing MCP entries,
tokens, profiles, and user-tuned settings are not overwritten unless `-Force` /
`--force` is used after preview and backup.

## &#127760; Language Entry Points

| Language | README |
| --- | --- |
| <img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"> | [README.de.md](README.de.md) |
| <img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"> | [README.es.md](README.es.md) |
| <img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"> | [README.md](README.md) |
| <img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"> | [README.pt-BR.md](README.pt-BR.md) |
| <img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"> | [README.tr.md](README.tr.md) |
| <img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"> | [README.fr.md](README.fr.md) |
## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Start Here

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

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> What This Repo Is

Codex Chef turns scattered local setup knowledge into a public, reviewable starter repository. It helps users answer:

- What should live in `AGENTS.md`, config, skills, plugins, MCP, rules, or hooks?
- Which connectors are safe by default?
- Which global files are touched by setup?
- How do I verify this before trusting it?
- How do I extend it without leaking secrets or weakening approvals?

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Install Surface

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

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> What It Does Not Do

The installer does not:

- Store tokens, cookies, auth files, private keys, memories, sessions, or local project state.
- Enable authenticated account, database, production, or broad filesystem MCP connectors by default.
- Commit, push, create releases, deploy, publish packages, rotate secrets, or change GitHub settings.
- Delete user data without first backing up managed targets, unless the user explicitly chooses `-NoBackup` or `--no-backup`.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> Dry Run First

PowerShell safe preview:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Bash or WSL safe preview:

```bash
./scripts/install.sh --all --dry-run
```

Dry runs print the target Codex/Agents homes and the changes that would happen without touching real files, Git settings, or global skills.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install Plan

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

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Bash or WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all
```

### Install Parameters

| PowerShell | Bash/WSL | Purpose |
| --- | --- | --- |
| `-All` | `--all` | Install the reviewed Codex Chef surface: managed Codex files, plugin workflows, and curated skills. |
| `-Interactive` | `--interactive` | Ask before optional choices and show the plan before applying. |
| `-WhatIf` | `--dry-run` | Preview without writing files, Git settings, or skills. |
| `-Repair` | `--repair` | Reconcile an existing global Codex setup with backups; preserves user skills and local approval rules. |
| `-Force` | `--force` | Replace existing managed Codex Chef targets after backup. Use only after reviewing a dry run. |
| `-NoBackup` | `--no-backup` | Skip backup creation for managed target changes. This is unsafe for normal use; prefer the default backup behavior. |
| `-InstallSkills` | `--install-skills` | Install or reconcile only the reviewed global skill catalog. |
| `-InstallGitGuards` | `--install-git-guards` | Opt in to global Git ignore and pre-commit guards for this Windows user. |
| `-PlainOutput` | `--plain-output` | Use ASCII-friendly output for older terminals and CI logs. |

Useful verification commands:

| Command | What it proves |
| --- | --- |
| `npm run codex:status` | Repo health, installed runtime drift, MCP setup notes, routing profiles, and effective controls. |
| `npm run codex:status:all` | Same status board plus expected curated skills and optional Git guard checks. |
| `npm run verify:install:runtime -- --expect-skills --expect-git-guards` | Read-only proof that the installed `CODEX_HOME` has 21 agents, 15 MCP entries, managed files, and curated skills. |
| `npm run verify:skills:online -- --timeout-ms=90000` | Network-backed proof that all 16 reviewed skill sources still resolve. |
| `codex exec --strict-config "Summarize the active Codex setup in three short bullets."` | Real Codex startup, strict config compatibility, auth, and model-call smoke test. |

After installation, restart Codex and run:

```bash
codex doctor --summary
npm run codex:status
npm run verify:install:runtime
codex exec --strict-config "Summarize the active Codex setup."
```

Use `-InstallSkills` / `--install-skills` or `-InstallGitGuards` / `--install-git-guards` when you only want one optional part of the setup.
`-All` includes the reviewed skill set, but it does not change global Git
config unless you also opt in to Git guards.

Existing user config is protected by default: if `~/.codex/config.toml`
already exists, the installer backs it up and merges only missing Codex Chef
agent/MCP/safety tables. Existing tables are preserved. Other managed files
such as `AGENTS.md`, agent files, rules, and the plugin marketplace are skipped
unless you explicitly add `-Force` / `--force`. Use force only for a deliberate
upgrade after reviewing the preview; the installer backs up managed targets
first.

For existing global Codex users, prefer repair before force. `-Repair` /
`--repair` previews or applies backup-backed reconciliation for Codex
Chef-managed files, merges missing config blocks, refreshes the plugin
marketplace entry without dropping unrelated plugins, and reports extra or
duplicate global skills as cleanup candidates instead of deleting them.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Operating Model

1. Map unfamiliar code with `code_mapper`.
2. Use `context_architect` when you need to decide whether behavior belongs in prompts, `AGENTS.md`, skills, plugins, MCP, hooks, memory, rules, or config.
3. Verify current APIs and product behavior with `docs_researcher`; use `prompt_architect` for reusable prompts, briefs, and instruction systems.
4. Use `mcp_integrator` before enabling or troubleshooting connectors and MCP tool exposure.
5. Implement in the main thread with repo instructions and selected skills.
6. Use `test_verifier`, `frontend_verifier`, or `security_auditor` when the task needs deeper evidence.
7. Use `codex_doctor` for starter health and drift checks.
8. Use `release_verifier` before push, tag, release, package, deploy, or publication.

The result is a small specialist-team workflow inside Codex while the main thread stays focused on decisions, implementation, and final evidence.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ac.svg" alt="" aria-hidden="true" width="20"> Visual Overview

<p align="center">
  <img src="assets/workflow-overview.svg" alt="Workflow overview showing install, route, research, implement, and verify steps" width="100%" />
</p>

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Safe Defaults

- Sandbox stays enabled.
- Approval policy stays interactive.
- Workspace command network access stays off.
- Shell subprocesses inherit only a trimmed environment with default secret exclusions.
- Authenticated remote connectors stay disabled until a task needs them.
- MCP tools that can touch external systems prompt before risky actions.
- Skills are installed only from package/skill pairs in the catalog and lock file.
- Deletion, cleanup, overwrite, credential access, publish, push, and release operations remain approval-gated.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Trust Signals

| Signal | Evidence |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Public-safe by design | No tokens, auth files, sessions, memories, cookies, private keys, or machine-specific state are included. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> Real validation | `npm run check` runs repo, docs, install-plan, agent drift, MCP drift, skill-source, supply-chain, and security checks. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f510.svg" alt="" aria-hidden="true" width="20"> Secret scanning ready | Gitleaks command is documented and the Git hook runs it when available. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> Multilingual docs | Deutsch, Español, English, Português (Brasil), Türkçe, and Français README and deep documentation files are present; six-language deep docs are enforced by validation. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ac.svg" alt="" aria-hidden="true" width="20"> Accessible visuals | SVG assets include title, description, motion, reduced-motion fallback, and README alt text. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skill source gate | `catalog/skills-lock.json` is checked against installable skill metadata. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Local skill gate | `npm run validate:plugin-skills` checks every bundled skill, reference file, UI metadata file, and catalog entry. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> Offline diagrams | Bundled `offline-diagram-triplet` emits Mermaid, editable Excalidraw, SVG, PNG, and Markdown with zero network. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ee.svg" alt="" aria-hidden="true" width="20"> Context budget | Bundled `context-budget-planner` keeps large tasks focused with source priority, token budgeting, and compaction handoff. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Agent drift gate | `catalog/agents.json` and `catalog/agent-research-corpus.json` are checked against Windows/Unix config blocks, role TOML files, required guardrail blocks, and source-backed item counts. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="20"> Doctor gate | `npm run codex:doctor` summarizes repo-only Codex starter health without global writes. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4df.svg" alt="" aria-hidden="true" width="20"> Status board | `npm run codex:status` combines repo health, installed runtime drift, Codex doctor checks, and skill context-budget warnings. |
| Repair mode | `npm run repair:install -- --apply` and installer `-Repair` / `--repair` fix managed drift after backup while preserving unrelated marketplace plugins and user skills. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install plan gate | `manifests/install-plan.json` and the install-state preview schema are validated before installer execution. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> Conservative MCPs | Authenticated account, database, and broad filesystem connectors stay disabled. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> Source-backed guidance | Research notes record source type, confidence, support, and outdated-risk. |
| Agent-readable index | `llms.txt` gives coding agents a compact map of install targets, docs, safety boundaries, and high-signal comparison sources. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e3.svg" alt="" aria-hidden="true" width="20"> Public-safe triage | CODEOWNERS and issue templates route bugs, features, questions, and security reports without private data. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/267b.svg" alt="" aria-hidden="true" width="20"> CI alignment | GitHub Actions runs the same `npm run check` path plus shell parser checks. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> Repository Layout

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

Online skill verification uses the network and the Skills CLI. It is intentionally separate from the default offline gate.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Documentation

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
- [Agent-readable index](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Official Codex References

Primary source: https://developers.openai.com/codex/codex-manual.md

Focused docs:

- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins
- MCP and connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- Windows: https://developers.openai.com/codex/windows
- Config, permissions, rules, hooks, and AGENTS.md are mapped in [docs/research-notes.md](docs/research-notes.md).

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Publishing Boundary

This repo is built to be public-ready after validation, but the installer is local-only. Commit, push, tag, release, package publishing, deployments, and GitHub settings changes must be explicit human decisions after local verification.
