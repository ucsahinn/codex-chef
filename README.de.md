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
  🌐 <strong>Dokumentation:</strong>
  <a href="README.de.md">🇩🇪 Deutsch</a> |
  <a href="README.es.md">🇪🇸 Español</a> |
  <a href="README.md">🇬🇧 English</a> |
  <a href="README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="README.tr.md">🇹🇷 Türkçe</a> |
  <a href="README.fr.md">🇫🇷 French / Français</a>
</p>

Codex Chef gibt deinem Windows-first Codex-Setup einen klaren Startpunkt: sichere Defaults, ein benanntes Agent-Team, kuratierte Skills, MCP-Vorgaben, lokale Plugin-Workflows und Validierung, die du vor echten Aenderungen pruefen kannst.

Dies ist ein inoffizieller Community-Starter, kein OpenAI-Produkt. README und tiefe Dokumentationsdateien sind in sechs Sprachen vorhanden; diese Seite ist der deutsche Einstieg.

## 🍳 Was nach der Installation bereitsteht

Codex Chef soll sich nicht wie ein Konfigurations-Dump anfuehlen. Nach der
Installation liegt eine kleine, nachvollziehbare Codex-Arbeitsumgebung bereit:

| Bereich | Ergebnis |
| --- | --- |
| 🤖 Agent-Team | 21 benannte Codex-Rollen wie Code Mapper, Docs Researcher, Google SEO Auditor, Security Auditor und Release Verifier. |
| 🧩 Lokale Skills | `codex-chef-operator`, `offline-diagram-triplet` und `context-budget-planner` kommen direkt mit dem Plugin. |
| 🎨 Optionale Skills | 16 gepruefte globale Public/First-Party Skills fuer Maintenance, Debugging, Refactor Planning, Security, Testing, Browser-Verifikation, SEO, Web Quality, Docs, CI, MCP Building, Context Engineering, Prompt Architecture, Skill Authoring und einen breiten Frontend-Workflow koennen mit `-All` installiert werden. |
| 🔌 MCP-Defaults | Lokale und Recherche-MCPs sind nutzbar; authentifizierte Connectoren bleiben deaktiviert, bis du sie bewusst brauchst. |
| 🛡️ Sicherheitsnetz | Dry-run, Backups, Secret Scan, Validierung und Approval Gates bleiben Teil des normalen Flows. |

## ⚡ Schnellstart

| Ziel | Link |
| --- | --- |
| Sicher installieren | [Quick Start](#-quick-start) |
| Vor dem Schreiben pruefen | [Dry Run](#-dry-run-first) |
| Vollstaendigen Installationsplan sehen | [Install Plan](#-install-plan) |
| Codex-Faehigkeiten verstehen | [Capability Map](docs/codex-capability-map.de.md) |
| Sicherheitsmodell pruefen | [Sicherheitsmodell](docs/security-model.de.md) |
| Veroeffentlichung vorbereiten | [Publishing](docs/publish.de.md) |

## 🧩 Installationsumfang

Die Installer verwalten:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

`-All` installiert die kuratierten Codex-Skills, aendert aber keine globale Git-Config. Globale Git-Guards bleiben ein separater Opt-in ueber `-InstallGitGuards` oder `--install-git-guards`.

## 🚫 Was nicht passiert

- Keine Tokens, Cookies, Auth-Dateien, Memories, Sessions oder privaten lokalen Pfade.
- Keine standardmaessig aktivierten Account-, Datenbank-, Production- oder breiten Filesystem-Connectoren.
- Kein Commit, Push, Release, Deploy, Package Publish oder Secret Rotation durch den Installer.

## 🔎 Dry Run First

PowerShell:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

Bash oder WSL:

```bash
./scripts/install.sh --all --force --dry-run
```

## 🧾 Install Plan

```bash
node scripts/plan-install.mjs --all --json
```

Der Plan kommt aus `manifests/install-plan.json` und beschreibt jede Operation, Kollisionsregel, Backup-Strategie, Risikostufe und benoetigte Flag. ECC hat die Manifest-Idee inspiriert; dieses Repo bleibt aber Codex-only.

## 🚀 Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Bash oder WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Nach der Installation Codex neu starten und ausfuehren:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

## ✅ Trust Signals

| Signal | Nachweis |
| --- | --- |
| 🛡️ Public-safe | Keine Secrets, Auth-Dateien, Sessions, Memories oder Maschinen-State im Repo. |
| 🧪 Validierung | `npm run check` prueft Repo, Docs, Install-Plan, MCP-Drift, Skill-Quellen, Supply-Chain und Security. |
| 🔌 Konservative MCPs | Authentifizierte Connectoren bleiben standardmaessig deaktiviert. |
| 🩺 Doctor | `npm run codex:doctor` zeigt repo-only Starter-Health ohne globale Writes. |
| 📐 Offline Diagrams | `offline-diagram-triplet` erzeugt Mermaid, editierbares Excalidraw, SVG, PNG und Markdown ohne Netzwerk. |
| 📣 Public-safe Triage | CODEOWNERS und Issue Templates lenken Bugs, Features, Fragen und Security Reports ohne private Daten. |

## 📚 Dokumentation

- [Install](docs/install.de.md)
- [Verification](docs/verification.de.md)
- [Codex capability map](docs/codex-capability-map.de.md)
- [Workflow surface map](docs/workflow-surface-map.de.md)
- [Security model](docs/security-model.de.md)
- [Public readiness](docs/public-readiness.de.md)
- [ECC compatibility](docs/ecc-compatibility.de.md)
- [SEO und Discoverability](docs/seo.de.md)
- [Advisory sources](docs/advisory-sources.de.md)

## 🚀 Publishing Boundary

Dieses Repo ist nach Validierung public-ready, aber der Installer ist lokal-only. Commit, Push, Tag, Release, Deploy und GitHub-Settings bleiben bewusste menschliche Entscheidungen.
