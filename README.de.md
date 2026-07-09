# Codex Chef

<p align="center">
  <img src="assets/banner.svg" alt="Codex Chef Banner mit Agents, MCPs, Skills, Verifikation und mehrsprachiger Dokumentation" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Dokumentationssprachen" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> <strong>Dokumentation:</strong>
  <a href="README.de.md"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"></a> |
  <a href="README.es.md"><img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"></a> |
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a> |
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"></a> |
  <a href="README.tr.md"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"></a> |
  <a href="README.fr.md"><img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"></a>
</p>

Codex Chef gibt deinem Windows-first Codex-Setup einen klaren Startpunkt: sichere Defaults, ein benanntes Agent-Team, kuratierte Skills, MCP-Vorgaben, lokale Plugin-Workflows und Validierung, die du vor echten Aenderungen pruefen kannst.

Dies ist ein inoffizieller Community-Starter, kein OpenAI-Produkt. README und tiefe Dokumentationsdateien sind in sechs Sprachen vorhanden; diese Seite ist der deutsche Einstieg.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> Was nach der Installation bereitsteht

Codex Chef soll sich nicht wie ein Konfigurations-Dump anfuehlen. Nach der
Installation liegt eine kleine, nachvollziehbare Codex-Arbeitsumgebung bereit:

| Bereich | Ergebnis |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Agent-Team | 21 benannte Codex-Rollen wie Code Mapper, Docs Researcher, Google SEO Auditor, Security Auditor und Release Verifier; model/reasoning bleibt pro Agent ungepinnt, damit das aktive Profil entscheidet. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Lokale Skills | `codex-chef-operator`, `offline-diagram-triplet` und `context-budget-planner` kommen direkt mit dem Plugin. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> Optionale Skills | 16 gepruefte globale Public/First-Party Skills fuer Maintenance, Debugging, Refactor Planning, Security, Testing, Browser-Verifikation, SEO, Web Quality, Docs, CI, MCP Building, Context Engineering, Prompt Architecture, Skill Authoring und einen breiten Frontend-Workflow koennen mit `-All` installiert werden. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP-Defaults | Lokale und Recherche-MCPs sind nutzbar; authentifizierte Connectoren bleiben deaktiviert, bis du sie bewusst brauchst. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Sicherheitsnetz | Dry-run, Backups, Secret Scan, Validierung und Approval Gates bleiben Teil des normalen Flows. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Schnellstart

| Ziel | Link |
| --- | --- |
| Sicher installieren | [Quick Start](#-quick-start) |
| Vor dem Schreiben pruefen | [Dry Run](#-dry-run-first) |
| Vollstaendigen Installationsplan sehen | [Install Plan](#-install-plan) |
| Codex-Faehigkeiten verstehen | [Capability Map](docs/codex-capability-map.de.md) |
| Sicherheitsmodell pruefen | [Sicherheitsmodell](docs/security-model.de.md) |
| Veroeffentlichung vorbereiten | [Publishing](docs/publish.de.md) |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Installationsumfang

Die Installer verwalten:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/*.config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

`-All` installiert die kuratierten Codex-Skills, aendert aber keine globale Git-Config. Globale Git-Guards bleiben ein separater Opt-in ueber `-InstallGitGuards` oder `--install-git-guards`.

`token-safe.config.toml` wird als Profil mitkopiert. `npm run token:audit` zeigt die groessten Context- und Token-Flaechen, ohne Skills, MCPs, Agents, Hooks oder Memories zu deaktivieren.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> Was nicht passiert

- Keine Tokens, Cookies, Auth-Dateien, Memories, Sessions oder privaten lokalen Pfade.
- Keine standardmaessig aktivierten Account-, Datenbank-, Production- oder breiten Filesystem-Connectoren.
- Kein Commit, Push, Release, Deploy, Package Publish oder Secret Rotation durch den Installer.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> Dry Run First

PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Bash oder WSL:

```bash
./scripts/install.sh --all --dry-run
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install Plan

```bash
node scripts/plan-install.mjs --all --json --redact-paths
```

Der Plan kommt aus `manifests/install-plan.json` und beschreibt jede Operation, Kollisionsregel, Backup-Strategie, Risikostufe und benoetigte Flag. ECC hat die Manifest-Idee inspiriert; dieses Repo bleibt aber Codex-only.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Bash oder WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --interactive
```

Am Ende zeigt der Installer ein Capability Board mit Agent-Team, MCPs,
lokalen Plugin-Skills und geprueften globalen Skills.

Nach der Installation Codex neu starten und ausfuehren:

```bash
codex doctor --summary
npm run verify:install:runtime
codex exec --strict-config "Summarize the active Codex setup."
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Trust Signals

| Signal | Nachweis |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Public-safe | Keine Secrets, Auth-Dateien, Sessions, Memories oder Maschinen-State im Repo. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> Validierung | `npm run check` prueft Repo, Docs, Install-Plan, MCP-Drift, Skill-Quellen, Token-Surfaces, Supply-Chain und Security; `npm run token:audit` liefert die Token-Diagnose. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> Konservative MCPs | Authentifizierte Connectoren bleiben standardmaessig deaktiviert. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="20"> Doctor | `npm run codex:doctor` zeigt repo-only Starter-Health ohne globale Writes. |
| Agent-readable index | `llms.txt` zeigt Installationsziele, Docs, Sicherheitsgrenzen und Vergleichsquellen fuer Coding Agents. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> Offline Diagrams | `offline-diagram-triplet` erzeugt Mermaid, editierbares Excalidraw, SVG, PNG und Markdown ohne Netzwerk. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e3.svg" alt="" aria-hidden="true" width="20"> Public-safe Triage | CODEOWNERS und Issue Templates lenken Bugs, Features, Fragen und Security Reports ohne private Daten. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Dokumentation

- [Install](docs/install.de.md)
- [How to run the setup](docs/how-to.de.md)
- [Verification](docs/verification.de.md)
- [Codex capability map](docs/codex-capability-map.de.md)
- [Workflow surface map](docs/workflow-surface-map.de.md)
- [Security model](docs/security-model.de.md)
- [Public readiness](docs/public-readiness.de.md)
- [ECC compatibility](docs/ecc-compatibility.de.md)
- [SEO und Discoverability](docs/seo.de.md)
- [Advisory sources](docs/advisory-sources.de.md)
- [Knowledge base](kb/README.md)
- [Turkish knowledge base](kb/README.tr.md)
- [Agent-readable index](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Publishing Boundary

Dieses Repo ist nach Validierung public-ready, aber der Installer ist lokal-only. Commit, Push, Tag, Release, Deploy und GitHub-Settings bleiben bewusste menschliche Entscheidungen.
