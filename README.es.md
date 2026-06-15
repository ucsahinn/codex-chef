# Codex Chef

<p align="center">
  <img src="assets/banner.svg" alt="Banner de Codex Chef con agents, MCPs, skills, verificacion y documentacion multilingue" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Idiomas de documentacion" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  🌐 <strong>Documentación:</strong>
  <a href="README.de.md">🇩🇪 Deutsch</a> |
  <a href="README.es.md">🇪🇸 Español</a> |
  <a href="README.md">🇬🇧 English</a> |
  <a href="README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="README.tr.md">🇹🇷 Türkçe</a> |
  <a href="README.fr.md">🇫🇷 French / Français</a>
</p>

Setup de Codex con prioridad en seguridad para usuarios avanzados Windows-first y equipos pequenos. Empaqueta una base local repetible para Codex: instrucciones duraderas, configuracion conservadora, agents especializados, reglas de aprobacion, defaults de MCP, metadata de skills curadas, plugin local, scripts de validacion y entradas multilingues.

Este es un starter comunitario no oficial, no un producto de OpenAI. Los README y la documentación profunda existen en seis idiomas; esta página es la entrada en español.

## ⚡ Inicio Rapido

| Objetivo | Link |
| --- | --- |
| Instalar de forma segura | [Quick Start](#-quick-start) |
| Previsualizar sin escribir | [Dry Run](#-dry-run-first) |
| Ver el plan completo | [Install Plan](#-install-plan) |
| Entender capacidades de Codex | [Capability Map](docs/codex-capability-map.es.md) |
| Revisar seguridad | [Modelo de seguridad](docs/security-model.es.md) |
| Preparar publicacion | [Publishing](docs/publish.es.md) |

## 🧩 Superficie De Instalacion

Los installers gestionan:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

Opcionalmente pueden instalar Git guards globales y skills de Codex curadas.

## 🚫 Lo Que No Hace

- No guarda tokens, cookies, auth files, memories, sessions ni rutas locales privadas.
- No activa por defecto conectores de cuenta, base de datos, produccion o filesystem amplio.
- No hace commit, push, release, deploy, package publish ni secret rotation.

## 🔎 Dry Run First

PowerShell:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

Bash o WSL:

```bash
./scripts/install.sh --all --force --dry-run
```

## 🧾 Install Plan

```bash
node scripts/plan-install.mjs --all --json
```

El plan viene de `manifests/install-plan.json` y describe cada operacion, politica de colision, backup, riesgo y flag requerido. ECC inspiro el patron de manifests, pero este repo sigue siendo Codex-only.

## 🚀 Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Bash o WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Despues de instalar, reinicia Codex y ejecuta:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

## ✅ Senales De Confianza

| Senal | Evidencia |
| --- | --- |
| 🛡️ Public-safe | Sin secretos, auth files, sessions, memories ni estado especifico de maquina. |
| 🧪 Validacion real | `npm run check` cubre repo, docs, install-plan, MCP drift, skills, supply-chain y security. |
| 🔌 MCPs conservadores | Los conectores autenticados quedan desactivados por defecto. |
| 🩺 Doctor | `npm run codex:doctor` resume health repo-only sin escrituras globales. |
| 📐 Diagramas offline | `offline-diagram-triplet` emite Mermaid, Excalidraw editable, SVG, PNG y Markdown sin red. |
| 📣 Triage public-safe | CODEOWNERS e issue templates enrutan bugs, features, preguntas y security reports sin datos privados. |

## 📚 Documentacion

- [Install](docs/install.es.md)
- [Verification](docs/verification.es.md)
- [Codex capability map](docs/codex-capability-map.es.md)
- [Workflow surface map](docs/workflow-surface-map.es.md)
- [Security model](docs/security-model.es.md)
- [Public readiness](docs/public-readiness.es.md)
- [ECC compatibility](docs/ecc-compatibility.es.md)
- [SEO y descubrimiento](docs/seo.es.md)
- [Advisory sources](docs/advisory-sources.es.md)

## 🚀 Limite De Publicacion

El repo queda public-ready despues de validacion, pero el installer solo hace setup local. Commit, push, tag, release, deploy y GitHub settings siguen siendo decisiones humanas explicitas.
