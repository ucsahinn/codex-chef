# Solução De Problemas

[Deutsch](troubleshooting.de.md) | [Español](troubleshooting.es.md) | [English](troubleshooting.md) | [Português (Brasil)](troubleshooting.pt-BR.md) | [Türkçe](troubleshooting.tr.md) | [Français](troubleshooting.fr.md)

> Este guia em português do Brasil faz parte do conjunto de documentação em seis idiomas para `troubleshooting.md`. Ele mantém o mesmo limite de segurança: prever primeiro, não armazenar segredos e verificar localmente cada mudança de setup.

## O que esta página cobre

- Instalação Windows-first com PowerShell e caminho equivalente para Bash/WSL.
- Dry-run e preview do plano antes de escritas globais reais.
- Backups e expectativas de rollback para alvos Codex gerenciados.

## Comandos úteis

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

```powershell
.\scripts\install.ps1 -All -Interactive
```

```powershell
.\scripts\install.ps1 -All -PlainOutput
```

```powershell
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
```

```bash
./scripts/install.sh --all --dry-run
```

```bash
./scripts/install.sh --all --interactive
```

```bash
./scripts/install.sh --all --plain-output
```

```bash
node scripts/plan-install.mjs --all --json
```

## Limite de segurança

- Não documentar tokens, cookies, sessões, memories ou caminhos locais privados.
- Executar escritas globais reais somente pelo fluxo explícito do installer.
- Ações como commit, push, release, publish ou mudanças em GitHub settings continuam decisões humanas.

## Verificação

- Executar `npm run check` antes de publicar.
- Usar `npm run token:audit` para enxergar as principais superficies de contexto e tokens.
- Usar `git diff --check` para encontrar problemas de whitespace e Markdown.
- Usar `gitleaks detect --redact --no-banner --no-git --verbose` quando Gitleaks estiver disponível.

## Seções de origem

Este arquivo localizado acompanha as seções do arquivo fonte em inglês. Source: [troubleshooting.md](troubleshooting.md).

- Troubleshooting
- Windows Installer
- Bash, WSL, Or Git Bash
- Skills CLI
- MCP Connectors
- Windows Sandbox
- Secret Scan Findings

## Manter sincronizado

Quando um comportamento ou comando mudar, atualize os seis arquivos de idioma e execute as verificações.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Português (Brasil)](../README.pt-BR.md).
