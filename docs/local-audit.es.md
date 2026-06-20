# Auditoría Local

[Deutsch](local-audit.de.md) | [Español](local-audit.es.md) | [English](local-audit.md) | [Português (Brasil)](local-audit.pt-BR.md) | [Türkçe](local-audit.tr.md) | [Français](local-audit.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `local-audit.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

## Qué cubre esta página

- Pasos de release y public-readiness visibles antes de push o tag.
- CI, Gitleaks, docs e installer gates como evidencia verificable.
- Qué se puede probar localmente y qué se verifica remoto solo con aprobación explícita.

## Comandos útiles

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
npm run verify:skills:online
```

## Límite de seguridad

- No documentar tokens, cookies, sesiones, memories ni rutas locales privadas.
- Ejecutar escrituras globales reales solo mediante el flujo explícito del installer.
- Acciones como commit, push, release, publish o cambios de GitHub settings siguen siendo decisiones humanas.

## Verificación

- Ejecutar `npm run check` antes de publicar.
- Usar `npm run token:audit` para ver las superficies principales de contexto y tokens.
- Usar `git diff --check` para detectar problemas de whitespace y Markdown.
- Usar `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks está disponible.

## Secciones fuente

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [local-audit.md](local-audit.md).

- Local Audit - 2026-06-10
- Desktop Search
- Global Codex Boundary
- Current Skill Locations
- Security Artifacts
- Decision

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
