# Codex Chef

<p align="center">
  <img src="assets/banner.svg" alt="Banniere Codex Chef avec agents, MCPs, skills, verification et documentation multilingue" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  🌐 <strong>Documentation:</strong>
  <a href="README.de.md"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"></a> |
  <a href="README.es.md"><img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"></a> |
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a> |
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"></a> |
  <a href="README.tr.md"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"></a> |
  <a href="README.fr.md"><img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"></a>
</p>

Codex Chef donne à ton setup Codex sur Windows un point de départ clair: des defaults prudents, une équipe d'agents nommés, des skills vérifiées, des MCP préconfigurés, des workflows de plugin locaux et une validation lisible avant toute modification.

Ceci est un starter communautaire non officiel, pas un produit OpenAI. Les README et la documentation profonde existent en six langues; cette page est l'entrée française.

## 🍳 Ce qui est prêt après l'installation

Codex Chef n'est pas un simple dump de configuration. Il prépare une base locale
Codex lisible, vérifiable et facile à faire évoluer:

| Surface | Résultat |
| --- | --- |
| 🤖 Équipe d'agents | 21 rôles nommés, dont Code Mapper, Docs Researcher, Google SEO Auditor, Security Auditor et Release Verifier. |
| 🧩 Skills locales | `codex-chef-operator`, `offline-diagram-triplet` et `context-budget-planner` sont livrées avec le plugin local. |
| 🎨 Skills optionnelles | 16 skills globales public/first-party vérifiées pour maintenance, debugging, planification de refactor, sécurité, tests, vérification navigateur, SEO, qualité web, docs, CI, MCP, context engineering, prompt architecture, skill authoring et un workflow frontend large peuvent être installées avec `-All`. |
| 🔌 MCP par défaut | Les MCP locaux et de recherche sont prêts; les connecteurs authentifiés restent désactivés jusqu'à besoin explicite. |
| 🛡️ Filet de sécurité | Dry-run, backups, secret scan, validation et approval gates restent dans le flux normal. |

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

`-All` installe les skills Codex vérifiées, mais ne change pas la configuration Git globale. Les Git guards globaux restent un opt-in séparé avec `-InstallGitGuards` ou `--install-git-guards`.

## 🚫 Ce Que Cela Ne Fait Pas

- Aucun token, cookie, auth file, memory, session ou chemin local prive.
- Aucun connecteur de compte, base de donnees, production ou filesystem large active par defaut.
- Aucun commit, push, release, deploy, package publish ou secret rotation par l'installer.

## 🔎 Dry Run First

PowerShell:

```powershell
.\scripts\install.ps1 -All -WhatIf
```

Bash ou WSL:

```bash
./scripts/install.sh --all --dry-run
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
.\scripts\install.ps1 -All -Interactive
```

Bash ou WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --interactive
```

A la fin, l'installer affiche un capability board avec l'equipe d'agents, les
MCPs, les skills locales du plugin et les skills globales verifiees.

Apres installation, redemarrez Codex puis lancez:

```bash
codex doctor --summary
npm run verify:install:runtime
codex --strict-config "Summarize the active Codex setup."
```

## ✅ Signaux De Confiance

| Signal | Preuve |
| --- | --- |
| 🛡️ Public-safe | Aucun secret, auth file, session, memory ou etat specifique machine. |
| 🧪 Validation reelle | `npm run check` couvre repo, docs, install-plan, MCP drift, skills, supply-chain et security. |
| 🔌 MCPs conservateurs | Les connecteurs authentifies restent desactives par defaut. |
| 🩺 Doctor | `npm run codex:doctor` resume la health repo-only sans ecritures globales. |
| Index pour agents | `llms.txt` resume les cibles d'installation, docs, frontieres de securite et sources comparees pour coding agents. |
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
- [Index pour agents](llms.txt)

## 🚀 Limite De Publication

Le repo est public-ready apres validation, mais l'installer reste local-only. Commit, push, tag, release, deploy et GitHub settings restent des decisions humaines explicites.
