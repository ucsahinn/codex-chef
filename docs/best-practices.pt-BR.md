# Boas Práticas Senior Para Codex

[Deutsch](best-practices.de.md) | [Español](best-practices.es.md) | [English](best-practices.md) | [Português (Brasil)](best-practices.pt-BR.md) | [Türkçe](best-practices.tr.md) | [Français](best-practices.fr.md)

> Este guia em português do Brasil faz parte do conjunto de documentação em seis idiomas para `best-practices.md`. Ele mantém o mesmo limite de segurança: prever primeiro, não armazenar segredos e verificar localmente cada mudança de setup.

## O que esta página cobre

- Limites public-safe para segredos, credenciais, estado local e contas externas.
- Defaults de menor privilégio para MCPs, skills, plugins, hooks e rules.
- Validação que bloqueia drift arriscado antes da publicação.

## Comandos úteis

```bash
npm run check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
node scripts/security-audit.mjs
node scripts/scan-supply-chain-iocs.mjs
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

Este arquivo localizado acompanha as seções do arquivo fonte em inglês. Source: [best-practices.md](best-practices.md).

- Senior Codex Best Practices
- Start Fast
- Source Quality
- Surface Map
- Senior Operating Loop
- Skill And Package Rules
- Specialist Agent Rules
- External Starter And ECC Import Rules
- Verification Gate
- Public-Safe Rules
- UI And Frontend Quality
- Maintenance Checklist

## Manter sincronizado

Quando um comportamento ou comando mudar, atualize os seis arquivos de idioma e execute as verificações.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Português (Brasil)](../README.pt-BR.md).
