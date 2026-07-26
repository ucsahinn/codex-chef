# Codex Chef

<p align="center">
  <img src="assets/icon.svg" alt="Codex Chef icon" width="120" />
  <br />
  <img src="assets/banner.svg" alt="Codex Chef banner showing agents, MCPs, skills, verification, and multilingual docs" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Six README languages" src="https://img.shields.io/badge/readme-6%20languages-0f766e" /></a>
  <img alt="Windows, macOS, Linux, and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-164e63" />
</p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> <strong>Docs:</strong>
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.md">English</a> |
  <a href="README.pt-BR.md">Português (Brasil)</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.fr.md">Français</a>
</p>

<!-- bilingual-welcome:start -->
<table>
  <tr>
    <td width="50%" valign="top">
      <h3>English</h3>
      <p><strong>Codex Chef gives Codex a strong local operating setup without copying someone else’s machine.</strong> You get specialist agents, reviewed skills, conservative MCP defaults, preview-first installers, and checks you can run yourself.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Türkçe</h3>
      <p><strong>Codex Chef, başkasının makinesini kopyalamadan Codex’e güçlü bir lokal çalışma düzeni kazandırır.</strong> Uzman ajanlar, incelenmiş skill’ler, temkinli MCP varsayılanları, ön izleme öncelikli installer’lar ve kendi çalıştırabileceğin kontroller sunar.</p>
    </td>
  </tr>
</table>
<!-- bilingual-welcome:end -->

Codex Chef is an unofficial community starter, not an OpenAI product. Its Codex guidance is based on official Codex documentation and is checked against the repository's current contracts. It supports Windows, macOS, Linux, and WSL, and keeps destructive, credentialed, database, publishing, deployment, and broad-filesystem actions behind explicit approval.

There are six README entry points for orientation. English and Turkish deep docs contain the complete operator guidance; the other language pages are concise, human-written routes into those canonical guides.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Start With A Preview

Check the local prerequisites first:

```powershell
Get-Command git
Get-Command node
Get-Command npx
Get-Command codex
node -v
```

Node.js 18 or newer is required. If a command is missing, start with [Troubleshooting](docs/troubleshooting.md).

Clone and preview without changing your Codex home:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
npm run chef -- --install
```

Install only after the preview looks right:

```powershell
npm run chef -- --install --apply
```

macOS, Linux, or WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
npm run chef -- --install
npm run chef -- --install --apply
```

The installer backs up managed targets before replacement. Normal install and repair do not prune user-owned skills, MCPs, profiles, or unrelated plugin files.
The colorful CLI is the recommended public entry point. Advanced/manual automation can call
`scripts\install.ps1` on Windows or `scripts/install.sh` on Bash systems; the manifest-backed
operation contract is available through `node scripts/plan-install.mjs --all --json --redact-paths`.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Use The CLI Without Guessing

Run `npm run chef` for the numbered command center.

| Need | Command |
| --- | --- |
| Fast repository health | `npm run chef -- --status --repo-only --no-log` |
| Full status board | `npm run codex:status` |
| Install preview | `npm run chef -- --preview` |
| Routing map | `npm run chef -- --routing --profile starter-health` |
| Diagnostics | `npm run chef -- --diagnostics --no-log` |
| Process audit | `npm run chef -- --processes` |
| Repair managed files | `npm run chef -- --repair`, then `npm run chef -- --repair --apply` |
| Update preview | `npm run chef -- --update --plain --no-log` |
| Update and verify | `npm run chef -- --update --apply` |

Inspection commands stay read-only. Write-capable commands require `--apply` or an action-specific typed confirmation. Use `--no-log` when you do not want the CLI to create its normal redacted, repo-local diagnostic record.

Detailed CLI behavior lives in [Installation](docs/install.md), [Expected
output](docs/expected-output.md), and [Troubleshooting](docs/troubleshooting.md).

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> What Lands On Your Machine

| Surface | What you get |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Agents | 21 named specialist role files. They are available for bounded delegation, not always-running background services. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skills | Six bundled plugin workflows, including the project-scoped Codex Chef Brain, and sixteen reviewed optional global skills. Skills load when the task matches; they do not execute by themselves. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCPs | Eight useful defaults for official docs, current library docs, reasoning, browser evidence, semantic navigation, memory reads, and local codebase graph reads through `codebase-memory`. Eight account, database, production, and broad-filesystem connectors stay off. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Guidance | A durable `~/.codex/AGENTS.md`, routing profiles, approval rules, and token-safe profile choices that do not pin every agent to one model. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Safety | Dry runs, manifest-backed install plans, backup-first replacement, secret scanning, package-surface checks, and runtime verification. |

Installed skills do not execute by themselves; Codex loads them when a request
matches their description or the user names one. Agent role selection is
automatic, but spawning is conditional: delegation is reserved for independent
parallel work, noisy research isolation, or an explicit user request.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> What It Deliberately Does Not Do

- It does not store secrets, import browser sessions, copy private memories, or send telemetry to a maintainer service.
- It does not enable GitHub, Figma, Linear, Notion, Sentry, Vercel, Supabase, or broad filesystem access by default.
- It does not commit, push, tag, release, deploy, publish packages, rotate credentials, or change GitHub settings.
- It does not delete user data to make validation pass.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ac.svg" alt="" aria-hidden="true" width="20"> See The Workflow

<p align="center">
  <img src="assets/workflow-overview.svg" alt="Workflow overview showing install, route, research, implement, and verify steps" width="100%" />
</p>

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Trust Signals

- `npm run check` validates docs, installers, agents, MCPs, skills, routing, package contents, release metadata, supply-chain indicators, and security boundaries.
- CI covers the Windows installer, Ubuntu with Node.js 18, and macOS with Node.js 24.
- `manifests/install-plan.json` describes the managed write surface before an installer runs.
- Authenticated and high-risk connectors remain opt-in.
- The repository is `private: true` in npm metadata, so this source-first project cannot be published to npm by accident.

Verify locally:

```bash
npm run check
npm run token:audit
npm run verify:skills:online
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

For long or repository-wide sessions, `npm run token:audit` shows which context surfaces carry the most weight. The optional `token-safe.config.toml` profile lowers verbosity and tool-output limits without disabling agents, skills, MCPs, memory, hooks, or apps. Agent roles do not pin a model; automatic `model/reasoning` selection follows the active user profile.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Documentation

- [Documentation map](docs/README.md)
- [Türkçe dokümantasyon haritası](docs/README.tr.md)
- [Installation](docs/install.md)
- [Security model](docs/security-model.md)
- [Skills and agents](docs/skills-and-agents.md)
- [MCP catalog](docs/mcp-catalog.md)
- [Public readiness](docs/public-readiness.md)
- [Advisory sources](docs/advisory-sources.md)
- [Knowledge base](kb/README.md)
- [Türkçe bilgi bankası](kb/README.tr.md)
- [Agent-readable index](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f91d.svg" alt="" aria-hidden="true" width="20"> Contributing And Support

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change and [SUPPORT.md](SUPPORT.md) before sharing diagnostics. Security reports belong in the private route described by [SECURITY.md](SECURITY.md).

MIT licensed. Community maintained.
