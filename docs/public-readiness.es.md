# Preparación Pública

[Deutsch](public-readiness.de.md) | [Español](public-readiness.es.md) | [English](public-readiness.md) | [Português (Brasil)](public-readiness.pt-BR.md) | [Türkçe](public-readiness.tr.md) | [Français](public-readiness.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `public-readiness.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

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

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [public-readiness.md](public-readiness.md).

- Public Readiness
- Positioning
- Public User Requirements
- Maintainer Requirements

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
