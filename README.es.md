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
  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> <strong>Documentación:</strong>
  <a href="README.de.md"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"></a> |
  <a href="README.es.md"><img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"></a> |
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a> |
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"></a> |
  <a href="README.tr.md"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"></a> |
  <a href="README.fr.md"><img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"></a>
</p>

Codex Chef le da a tu setup de Codex en Windows un punto de partida claro: defaults seguros, un equipo de agentes con nombre, skills curadas, MCPs preconfigurados, workflows locales de plugin y validación que puedes revisar antes de tocar tu máquina.

Este es un starter comunitario no oficial, no un producto de OpenAI. Los README y la documentación profunda existen en seis idiomas; esta página es la entrada en español.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> Qué queda listo después de instalar

Codex Chef no intenta ser un volcado de configuración. La idea es dejarte una
base local de Codex que puedas entender, verificar y extender:

| Área | Resultado |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Equipo de agentes | 21 roles con nombre, como Code Mapper, Docs Researcher, Google SEO Auditor, Security Auditor y Release Verifier. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skills locales | `codex-chef-operator`, `offline-diagram-triplet` y `context-budget-planner` vienen dentro del plugin local. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> Skills opcionales | 16 skills globales public/first-party revisadas para mantenimiento, debugging, planificación de refactor, seguridad, testing, verificación de navegador, SEO, calidad web, docs, CI, MCP, context engineering, prompt architecture, skill authoring y un workflow amplio de frontend se pueden instalar con `-All`. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP por defecto | Los MCP locales y de investigación quedan listos; los conectores autenticados siguen desactivados hasta que los necesites. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Red de seguridad | Dry-run, backups, secret scan, validación y approval gates siguen dentro del flujo normal. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Inicio Rapido

| Objetivo | Link |
| --- | --- |
| Instalar de forma segura | [Quick Start](#-quick-start) |
| Previsualizar sin escribir | [Dry Run](#-dry-run-first) |
| Ver el plan completo | [Install Plan](#-install-plan) |
| Entender capacidades de Codex | [Capability Map](docs/codex-capability-map.es.md) |
| Revisar seguridad | [Modelo de seguridad](docs/security-model.es.md) |
| Preparar publicacion | [Publishing](docs/publish.es.md) |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Superficie De Instalacion

Los installers gestionan:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

`-All` instala las skills curadas de Codex, pero no cambia la configuración global de Git. Los Git guards globales quedan como opt-in separado con `-InstallGitGuards` o `--install-git-guards`.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> Lo Que No Hace

- No guarda tokens, cookies, auth files, memories, sessions ni rutas locales privadas.
- No activa por defecto conectores de cuenta, base de datos, produccion o filesystem amplio.
- No hace commit, push, release, deploy, package publish ni secret rotation.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> Dry Run First

PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Bash o WSL:

```bash
./scripts/install.sh --all --dry-run
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install Plan

```bash
node scripts/plan-install.mjs --all --json
```

El plan viene de `manifests/install-plan.json` y describe cada operacion, politica de colision, backup, riesgo y flag requerido. ECC inspiro el patron de manifests, pero este repo sigue siendo Codex-only.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Quick Start

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Bash o WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --interactive
```

Al final, el installer muestra un capability board con el equipo de agents,
MCPs, skills locales del plugin y skills globales revisadas.

Despues de instalar, reinicia Codex y ejecuta:

```bash
codex doctor --summary
npm run verify:install:runtime
codex exec --strict-config "Summarize the active Codex setup."
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Senales De Confianza

| Senal | Evidencia |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Public-safe | Sin secretos, auth files, sessions, memories ni estado especifico de maquina. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> Validacion real | `npm run check` cubre repo, docs, install-plan, MCP drift, skills, supply-chain y security. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCPs conservadores | Los conectores autenticados quedan desactivados por defecto. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="20"> Doctor | `npm run codex:doctor` resume health repo-only sin escrituras globales. |
| Indice para agents | `llms.txt` resume destinos de instalacion, docs, limites de seguridad y fuentes comparadas para coding agents. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> Diagramas offline | `offline-diagram-triplet` emite Mermaid, Excalidraw editable, SVG, PNG y Markdown sin red. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e3.svg" alt="" aria-hidden="true" width="20"> Triage public-safe | CODEOWNERS e issue templates enrutan bugs, features, preguntas y security reports sin datos privados. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Documentacion

- [Install](docs/install.es.md)
- [Verification](docs/verification.es.md)
- [Codex capability map](docs/codex-capability-map.es.md)
- [Workflow surface map](docs/workflow-surface-map.es.md)
- [Security model](docs/security-model.es.md)
- [Public readiness](docs/public-readiness.es.md)
- [ECC compatibility](docs/ecc-compatibility.es.md)
- [SEO y descubrimiento](docs/seo.es.md)
- [Advisory sources](docs/advisory-sources.es.md)
- [Indice para agents](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Limite De Publicacion

El repo queda public-ready despues de validacion, pero el installer solo hace setup local. Commit, push, tag, release, deploy y GitHub settings siguen siendo decisiones humanas explicitas.
