# Codex Chef

<p align="center">
  <img src="assets/banner.svg" alt="Banner do Codex Chef com agents, MCPs, skills, verificacao e documentacao multilingue" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/vaultekbilisim/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/vaultekbilisim/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/vaultekbilisim/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Idiomas da documentacao" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows and WSL ready" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> <strong>Documentação:</strong>
  <a href="README.de.md"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"></a> |
  <a href="README.es.md"><img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"></a> |
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a> |
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"></a> |
  <a href="README.tr.md"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"></a> |
  <a href="README.fr.md"><img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"></a>
</p>

Codex Chef dá ao seu setup de Codex no Windows um ponto de partida claro: defaults seguros, um time de agentes com nome, skills curadas, MCPs preconfigurados, workflows locais de plugin e validação que você consegue revisar antes de mudar a máquina.

Este é um starter comunitário não oficial, não um produto da OpenAI. Os READMEs e a documentação profunda existem em seis idiomas; esta página é a entrada em português do Brasil.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> O que fica pronto depois da instalação

Codex Chef não tenta despejar configuração na sua máquina. Ele entrega uma base
local de Codex que dá para entender, validar e evoluir:

| Área | Resultado |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Time de agentes | 21 papéis nomeados, como Code Mapper, Docs Researcher, Google SEO Auditor, Security Auditor e Release Verifier; model/reasoning nao fica fixado por agent e o perfil ativo decide. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skills locais | `codex-chef-operator`, `offline-diagram-triplet` e `context-budget-planner` vêm dentro do plugin local. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> Skills opcionais | 16 skills globais public/first-party revisadas para manutenção, debugging, planejamento de refactor, segurança, testes, verificação no navegador, SEO, qualidade web, docs, CI, MCP, context engineering, prompt architecture, skill authoring e um workflow amplo de frontend podem ser instaladas com `-All`. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP por padrão | MCPs locais e de pesquisa ficam prontos; conectores autenticados continuam desativados até você precisar deles. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Rede de segurança | Dry-run, backups, secret scan, validação e approval gates continuam no fluxo normal. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Comece Aqui

| Objetivo | Link |
| --- | --- |
| Instalar com seguranca | [Quick Start](#-quick-start) |
| Prever sem escrever | [Dry Run](#-dry-run-first) |
| Ver o plano completo | [Install Plan](#-install-plan) |
| Entender capacidades do Codex | [Capability Map](docs/codex-capability-map.pt-BR.md) |
| Revisar seguranca | [Modelo de segurança](docs/security-model.pt-BR.md) |
| Preparar publicacao | [Publishing](docs/publish.pt-BR.md) |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Superficie De Instalacao

Os installers gerenciam:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/*.config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

`-All` instala as skills Codex curadas, mas nao muda a configuracao global do Git. Git guards globais ficam como opt-in separado com `-InstallGitGuards` ou `--install-git-guards`.

`token-safe.config.toml` e copiado como perfil. `npm run token:audit` mostra as principais superficies de contexto e tokens sem desativar skills, MCPs, agents, hooks ou memories.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> O Que Nao Faz

- Nao guarda segredos, nao copia memory state privado nem importa sessions existentes; Memory MCP e apenas para contexto local sem segredos quando usado deliberadamente.
- Nao ativa por padrao conectores de conta, banco de dados, producao ou filesystem amplo.
- Nao faz commit, push, release, deploy, package publish ou secret rotation.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> Dry Run First

PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Bash ou WSL:

```bash
./scripts/install.sh --all --dry-run
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install Plan

```bash
node scripts/plan-install.mjs --all --json --redact-paths
```

O plano vem de `manifests/install-plan.json` e descreve cada operacao, politica de colisao, backup, risco e flag necessaria. ECC inspirou o padrao de manifests, mas este repo continua Codex-only.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Quick Start

PowerShell:

```powershell
git clone https://github.com/vaultekbilisim/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Bash ou WSL:

```bash
git clone https://github.com/vaultekbilisim/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --interactive
```

No final, o installer mostra um capability board com o time de agents, MCPs,
skills locais do plugin e skills globais revisadas.

Depois da instalacao, reinicie o Codex e rode:

```bash
codex doctor --summary
npm run verify:install:runtime
codex exec --strict-config "Summarize the active Codex setup."
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Sinais De Confianca

| Sinal | Evidencia |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Public-safe | Sem secrets, auth files, sessions privadas ou estado especifico de maquina; Memory MCP so para contexto local sem segredo. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> Validacao real | `npm run check` cobre repo, docs, install-plan, MCP drift, skills, token surfaces, supply-chain e security; `npm run token:audit` entrega o diagnostico de tokens. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCPs conservadores | Conectores autenticados ficam desativados por padrao. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="20"> Doctor | `npm run codex:doctor` resume health repo-only sem escritas globais. |
| Indice para agents | `llms.txt` resume alvos de instalacao, docs, limites de seguranca e fontes comparadas para coding agents. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> Diagramas offline | `offline-diagram-triplet` emite Mermaid, Excalidraw editavel, SVG, PNG e Markdown sem rede. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e3.svg" alt="" aria-hidden="true" width="20"> Triage public-safe | CODEOWNERS e issue templates roteiam bugs, features, perguntas e security reports sem dados privados. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Documentacao

- [Install](docs/install.pt-BR.md)
- [How to run the setup](docs/how-to.pt-BR.md)
- [Verification](docs/verification.pt-BR.md)
- [Codex capability map](docs/codex-capability-map.pt-BR.md)
- [Workflow surface map](docs/workflow-surface-map.pt-BR.md)
- [Security model](docs/security-model.pt-BR.md)
- [Public readiness](docs/public-readiness.pt-BR.md)
- [ECC compatibility](docs/ecc-compatibility.pt-BR.md)
- [SEO e descoberta](docs/seo.pt-BR.md)
- [Advisory sources](docs/advisory-sources.pt-BR.md)
- [Knowledge base](kb/README.md)
- [Turkish knowledge base](kb/README.tr.md)
- [Indice para agents](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Limite De Publicacao

O repo fica public-ready apos validacao, mas o installer e local-only. Commit, push, tag, release, deploy e GitHub settings continuam decisoes humanas explicitas.
