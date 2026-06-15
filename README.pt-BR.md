# Codex Chef

<p align="center">
  <img src="assets/banner.svg" alt="Banner do Codex Chef com agents, MCPs, skills, verificacao e documentacao multilingue" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Idiomas da documentacao" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  🌐 <strong>Documentação:</strong>
  <a href="README.de.md">🇩🇪 Deutsch</a> |
  <a href="README.es.md">🇪🇸 Español</a> |
  <a href="README.md">🇬🇧 English</a> |
  <a href="README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="README.tr.md">🇹🇷 Türkçe</a> |
  <a href="README.fr.md">🇫🇷 French / Français</a>
</p>

Codex Chef dá ao seu setup de Codex no Windows um ponto de partida claro: defaults seguros, um time de agentes com nome, skills curadas, MCPs preconfigurados, workflows locais de plugin e validação que você consegue revisar antes de mudar a máquina.

Este é um starter comunitário não oficial, não um produto da OpenAI. Os READMEs e a documentação profunda existem em seis idiomas; esta página é a entrada em português do Brasil.

## 🍳 O que fica pronto depois da instalação

Codex Chef não tenta despejar configuração na sua máquina. Ele entrega uma base
local de Codex que dá para entender, validar e evoluir:

| Área | Resultado |
| --- | --- |
| 🤖 Time de agentes | 21 papéis nomeados, como Code Mapper, Docs Researcher, Google SEO Auditor, Security Auditor e Release Verifier. |
| 🧩 Skills locais | `codex-chef-operator`, `offline-diagram-triplet` e `context-budget-planner` vêm dentro do plugin local. |
| 🎨 Skills opcionais | 16 skills globais public/first-party revisadas para manutenção, debugging, planejamento de refactor, segurança, testes, verificação no navegador, SEO, qualidade web, docs, CI, MCP, context engineering, prompt architecture, skill authoring e um workflow amplo de frontend podem ser instaladas com `-All`. |
| 🔌 MCP por padrão | MCPs locais e de pesquisa ficam prontos; conectores autenticados continuam desativados até você precisar deles. |
| 🛡️ Rede de segurança | Dry-run, backups, secret scan, validação e approval gates continuam no fluxo normal. |

## ⚡ Comece Aqui

| Objetivo | Link |
| --- | --- |
| Instalar com seguranca | [Quick Start](#-quick-start) |
| Prever sem escrever | [Dry Run](#-dry-run-first) |
| Ver o plano completo | [Install Plan](#-install-plan) |
| Entender capacidades do Codex | [Capability Map](docs/codex-capability-map.pt-BR.md) |
| Revisar seguranca | [Modelo de segurança](docs/security-model.pt-BR.md) |
| Preparar publicacao | [Publishing](docs/publish.pt-BR.md) |

## 🧩 Superficie De Instalacao

Os installers gerenciam:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

`-All` instala as skills Codex curadas, mas nao muda a configuracao global do Git. Git guards globais ficam como opt-in separado com `-InstallGitGuards` ou `--install-git-guards`.

## 🚫 O Que Nao Faz

- Nao guarda tokens, cookies, auth files, memories, sessions ou caminhos locais privados.
- Nao ativa por padrao conectores de conta, banco de dados, producao ou filesystem amplo.
- Nao faz commit, push, release, deploy, package publish ou secret rotation.

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

O plano vem de `manifests/install-plan.json` e descreve cada operacao, politica de colisao, backup, risco e flag necessaria. ECC inspirou o padrao de manifests, mas este repo continua Codex-only.

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

Depois da instalacao, reinicie o Codex e rode:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

## ✅ Sinais De Confianca

| Sinal | Evidencia |
| --- | --- |
| 🛡️ Public-safe | Sem secrets, auth files, sessions, memories ou estado especifico de maquina. |
| 🧪 Validacao real | `npm run check` cobre repo, docs, install-plan, MCP drift, skills, supply-chain e security. |
| 🔌 MCPs conservadores | Conectores autenticados ficam desativados por padrao. |
| 🩺 Doctor | `npm run codex:doctor` resume health repo-only sem escritas globais. |
| 📐 Diagramas offline | `offline-diagram-triplet` emite Mermaid, Excalidraw editavel, SVG, PNG e Markdown sem rede. |
| 📣 Triage public-safe | CODEOWNERS e issue templates roteiam bugs, features, perguntas e security reports sem dados privados. |

## 📚 Documentacao

- [Install](docs/install.pt-BR.md)
- [Verification](docs/verification.pt-BR.md)
- [Codex capability map](docs/codex-capability-map.pt-BR.md)
- [Workflow surface map](docs/workflow-surface-map.pt-BR.md)
- [Security model](docs/security-model.pt-BR.md)
- [Public readiness](docs/public-readiness.pt-BR.md)
- [ECC compatibility](docs/ecc-compatibility.pt-BR.md)
- [SEO e descoberta](docs/seo.pt-BR.md)
- [Advisory sources](docs/advisory-sources.pt-BR.md)

## 🚀 Limite De Publicacao

O repo fica public-ready apos validacao, mas o installer e local-only. Commit, push, tag, release, deploy e GitHub settings continuam decisoes humanas explicitas.
