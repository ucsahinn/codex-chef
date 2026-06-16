# Mapa De Superficies De Workflow

[Deutsch](workflow-surface-map.de.md) | [Español](workflow-surface-map.es.md) | [English](workflow-surface-map.md) | [Português (Brasil)](workflow-surface-map.pt-BR.md) | [Türkçe](workflow-surface-map.tr.md) | [Français](workflow-surface-map.fr.md)

> Este guia em português do Brasil faz parte do conjunto de documentação em seis idiomas para `workflow-surface-map.md`. Ele mantém o mesmo limite de segurança: prever primeiro, não armazenar segredos e verificar localmente cada mudança de setup.

## O que esta página cobre

- Qual superfície Codex, config, skill, agent ou MCP usar em cada caso.
- Defaults conservadores para sandbox, aprovações e conectores externos.
- Decisões de routing documentadas e verificáveis dentro do repo.

## Comandos úteis

```bash
codex doctor --summary
codex exec --strict-config "Summarize the active Codex setup."
```

```text
/mcp
/skills
/plugins
/hooks
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

Este arquivo localizado acompanha as seções do arquivo fonte em inglês. Source: [workflow-surface-map.md](workflow-surface-map.md).

- Workflow Surface Map
- Surface Rule
- GStack-Style Workflow Mapping
- ECC Pattern Mapping
- Evidence-Based Exclusions
- Recommended Starter Chain

## Manter sincronizado

Quando um comportamento ou comando mudar, atualize os seis arquivos de idioma e execute as verificações.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Português (Brasil)](../README.pt-BR.md).
