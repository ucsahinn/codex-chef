# Checklist De Publicação

[Deutsch](publish.de.md) | [Español](publish.es.md) | [English](publish.md) | [Português (Brasil)](publish.pt-BR.md) | [Türkçe](publish.tr.md) | [Français](publish.fr.md)

> Este guia em português do Brasil faz parte do conjunto de documentação em seis idiomas para `publish.md`. Ele mantém o mesmo limite de segurança: prever primeiro, não armazenar segredos e verificar localmente cada mudança de setup.

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

## Seções de origem

Este arquivo localizado acompanha as seções do arquivo fonte em inglês. Source: [publish.md](publish.md).

- Publishing Checklist
- Before Push Or Release
- Create A Repository
- Existing Repository Release Flow
- Do Not Publish
- Release Artifacts

## Manter sincronizado

Quando um comportamento ou comando mudar, atualize os seis arquivos de idioma e execute as verificações.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Português (Brasil)](../README.pt-BR.md).
