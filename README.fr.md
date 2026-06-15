# Codex Chef

<p align="center">
  <img src="assets/banner.svg" alt="Banniere Codex Chef avec agents, MCPs, skills, verification et documentation multilingue" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Langues de documentation" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  🌐 <strong>Documentation:</strong>
  <a href="README.de.md">🇩🇪 Deutsch</a> |
  <a href="README.es.md">🇪🇸 Español</a> |
  <a href="README.md">🇬🇧 English</a> |
  <a href="README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="README.tr.md">🇹🇷 Türkçe</a> |
  <a href="README.fr.md">🇫🇷 French / Français</a>
</p>

Setup Codex oriente securite pour les utilisateurs Windows-first et les petites equipes. Il fournit une base locale repetable pour Codex: instructions durables, configuration conservative, agents specialises, regles d'approbation, defaults MCP, metadata de skills curates, plugin local, scripts de validation et entrees multilingues.

Ceci est un starter communautaire non officiel, pas un produit OpenAI. Les README et la documentation profonde existent en six langues; cette page est l'entrée française.

## ⚡ Demarrage Rapide

| Objectif | Link |
| --- | --- |
| Installer en securite | [Quick Start](#-quick-start) |
| Previsualiser sans ecrire | [Dry Run](#-dry-run-first) |
| Voir le plan complet | [Install Plan](#-install-plan) |
| Comprendre les capacites Codex | [Capability Map](docs/codex-capability-map.fr.md) |
| Lire le modele de securite | [Modèle de sécurité](docs/security-model.fr.md) |
| Preparer la publication | [Publishing](docs/publish.fr.md) |

## 🧩 Surface D'installation

Les installers gerent:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

Ils peuvent aussi installer des Git guards globaux et des skills Codex curates.

## 🚫 Ce Que Cela Ne Fait Pas

- Aucun token, cookie, auth file, memory, session ou chemin local prive.
- Aucun connecteur de compte, base de donnees, production ou filesystem large active par defaut.
- Aucun commit, push, release, deploy, package publish ou secret rotation par l'installer.

## 🔎 Dry Run First

PowerShell:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

Bash ou WSL:

```bash
./scripts/install.sh --all --force --dry-run
```

## 🧾 Install Plan

```bash
node scripts/plan-install.mjs --all --json
```

Le plan vient de `manifests/install-plan.json` et decrit chaque operation, politique de collision, backup, risque et flag requis. ECC a inspire le pattern de manifests, mais ce repo reste Codex-only.

## 🚀 Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Bash ou WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Apres installation, redemarrez Codex puis lancez:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

## ✅ Signaux De Confiance

| Signal | Preuve |
| --- | --- |
| 🛡️ Public-safe | Aucun secret, auth file, session, memory ou etat specifique machine. |
| 🧪 Validation reelle | `npm run check` couvre repo, docs, install-plan, MCP drift, skills, supply-chain et security. |
| 🔌 MCPs conservateurs | Les connecteurs authentifies restent desactives par defaut. |
| 🩺 Doctor | `npm run codex:doctor` resume la health repo-only sans ecritures globales. |
| 📐 Diagrammes offline | `offline-diagram-triplet` emet Mermaid, Excalidraw editable, SVG, PNG et Markdown sans reseau. |
| 📣 Triage public-safe | CODEOWNERS et issue templates routent bugs, features, questions et security reports sans donnees privees. |

## 📚 Documentation

- [Install](docs/install.fr.md)
- [Verification](docs/verification.fr.md)
- [Codex capability map](docs/codex-capability-map.fr.md)
- [Workflow surface map](docs/workflow-surface-map.fr.md)
- [Security model](docs/security-model.fr.md)
- [Public readiness](docs/public-readiness.fr.md)
- [ECC compatibility](docs/ecc-compatibility.fr.md)
- [SEO et decouvrabilite](docs/seo.fr.md)
- [Advisory sources](docs/advisory-sources.fr.md)

## 🚀 Limite De Publication

Le repo est public-ready apres validation, mais l'installer reste local-only. Commit, push, tag, release, deploy et GitHub settings restent des decisions humaines explicites.
