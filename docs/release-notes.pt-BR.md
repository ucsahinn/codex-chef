# Notas De Release

[Deutsch](release-notes.de.md) | [Español](release-notes.es.md) | [English](release-notes.md) | [Português (Brasil)](release-notes.pt-BR.md) | [Türkçe](release-notes.tr.md) | [Français](release-notes.fr.md)

> Este guia em português do Brasil faz parte do conjunto de documentação em seis idiomas para `release-notes.md`. Ele mantém o mesmo limite de segurança: prever primeiro, não armazenar segredos e verificar localmente cada mudança de setup.

## O que esta página cobre

- Passos de release e public-readiness visíveis antes de push ou tag.
- CI, Gitleaks, docs e installer gates como evidência verificável.
- O que é provado localmente e o que só é verificado remotamente com aprovação explícita.

## Comandos úteis

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
npm run verify:skills:online
```

## Limite de segurança

- Não documentar tokens, cookies, sessões, memories ou caminhos locais privados.
- Executar escritas globais reais somente pelo fluxo explícito do installer.
- Ações como commit, push, release, publish ou mudanças em GitHub settings continuam decisões humanas.

## Verificação

- Executar `npm run check` antes de publicar.
- Usar `git diff --check` para encontrar problemas de whitespace e Markdown.
- Usar `gitleaks detect --redact --no-banner --no-git --verbose` quando Gitleaks estiver disponível.

## v0.5.41 - 2026-06-24

Este patch atualiza a versao atual nas notas de release em portugues do Brasil.
Ele documenta o ajuste do ciclo readline na CLI interativa, a mesma funcao de
pergunta do menu para prompts aninhados e as regressoes contra stacks AbortError
e avisos de unsettled top-level-await.

### Verification

```bash
npm run check
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
```

## v0.5.14 - 2026-06-16

Esta versao fecha as ultimas lacunas de connectors e documentacao do audit
final do Codex Chef. App/connectors ficam estacionados por padrao com
`apps._default.enabled = false`, repair mode migra defaults antigos para o
estado seguro, e as READMEs em ingles e turco documentam os parametros do
installer.

### Highlights

- App/connectors continuam opt-in como MCP connectors autenticados.
- Repair, security e status validation exigem
  `apps._default.enabled = false`,
  `apps._default.destructive_enabled = false` e
  `apps._default.open_world_enabled = false`.
- README documenta `-All`, `-Interactive`, `-WhatIf`, `-Repair`, `-Force`,
  `-NoBackup`, `-InstallSkills`, `-InstallGitGuards` e `-PlainOutput`.

### Verificacao

```bash
npm run check
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.13 - 2026-06-16

Esta versao reforca a compatibilidade runtime para instalacoes atuais do Codex.
Ela remove o campo obsoleto `apps._default.default_tools_enabled`, preserva
approval rules locais em `rules/default.rules`, mostra routing profiles e notas
de setup MCP no status board e trata o aviso de WebSocket fallback como nao
bloqueante quando o restante do Codex doctor esta saudavel.

### Highlights

- Enterprise routing board com `catalog/routing-profiles.json` e
  `npm run codex:routing`.
- Notas de setup MCP para tooling, OAuth, caminhos filesystem e
  `SUPABASE_DB_URL`.
- Resumo de effective controls em `npm run codex:status`.
- Nomes de skills atualizados: `ai-project-starter`, `prompt-architect` e
  `ai-skill-create`.

### Verificacao

```bash
npm run check
npm run codex:status:all
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## Seções de origem

Este arquivo localizado acompanha as seções do arquivo fonte em inglês. Source: [release-notes.md](release-notes.md).

- Release Notes
- Unreleased
- v0.5.41 - 2026-06-24
- Verification
- v0.5.14 - 2026-06-16
- Highlights
- Verification
- v0.5.13 - 2026-06-16
- Highlights
- Verification
- v0.5.12 - 2026-06-16
- Highlights
- Verification
- v0.5.11 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.10 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.9 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.8 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.7 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.6 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.5 - 2026-06-16
- Upgrade Notes
- Verification
- v0.5.4 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.3 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.2 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.1 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.0 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.4.0 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.3.1 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.3.0 - 2026-06-14
- Highlights
- Upgrade Notes
- Verification

## Manter sincronizado

Quando um comportamento ou comando mudar, atualize os seis arquivos de idioma e execute as verificações.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Português (Brasil)](../README.pt-BR.md).
