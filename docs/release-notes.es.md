# Notas De Release

[Deutsch](release-notes.de.md) | [Español](release-notes.es.md) | [English](release-notes.md) | [Português (Brasil)](release-notes.pt-BR.md) | [Türkçe](release-notes.tr.md) | [Français](release-notes.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `release-notes.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

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
- Usar `git diff --check` para detectar problemas de whitespace y Markdown.
- Usar `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks está disponible.

## v0.5.44 - 2026-07-09

Esta version agrega `codebase-memory` como MCP habilitado por defecto pero
restringido por herramientas para analisis de codebase con grafo local. Las
herramientas read/query estan allowlisted, indexing y las herramientas de
project-state mas riesgosas quedan prompt-gated o deshabilitadas, y los
artefactos generados `.codebase-memory/` quedan fuera del control de fuente. El
status board ahora tambien muestra controles de context-budget y el
recordatorio del perfil `token-safe` para trabajos largos a nivel de
repositorio.

## v0.5.43 - 2026-06-25

Este patch lleva la experiencia de operador de la CLI al menu completo y sus
submenus. Skills, MCP, backups, diagnostics, process audit, auth y pantallas de
preview ahora usan la misma estructura de resumen, lenguaje natural y limites
de escritura seguros que el menu principal.

### Verification

```bash
npm run validate:chef-cli
npm run check
git diff --check
```

## v0.5.42 - 2026-06-25

Este patch clasifica los skills globales no curados del usuario como nota en el
reporte de repair, no como motivo de attention. Un runtime limpio conserva
`Overall: ok`, mientras los skills curados faltantes, duplicados y drift real
siguen visibles.

### Verification

```bash
npm run check
npm run validate:repair
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
```

## v0.5.41 - 2026-06-24

Este patch actualiza la version actual en las notas de version en espanol.
Documenta el arreglo del ciclo readline en la CLI interactiva, la misma funcion
de pregunta del menu para prompts anidados y las regresiones contra stacks de
AbortError y warnings de unsettled top-level-await.

### Verification

```bash
npm run check
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
```

## v0.5.14 - 2026-06-16

Esta version cierra los ultimos huecos de connectors y documentacion del audit
final de Codex Chef. App/connectors quedan aparcados por defecto con
`apps._default.enabled = false`, repair mode migra defaults antiguos al estado
seguro, y las README en ingles y turco documentan los parametros del installer.

### Highlights

- App/connectors siguen siendo opt-in como los MCP connectors autenticados.
- Repair, security y status validation exigen
  `apps._default.enabled = false`,
  `apps._default.destructive_enabled = false` y
  `apps._default.open_world_enabled = false`.
- README documenta `-All`, `-Interactive`, `-WhatIf`, `-Repair`, `-Force`,
  `-NoBackup`, `-InstallSkills`, `-InstallGitGuards` y `-PlainOutput`.

### Verificacion

```bash
npm run check
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.13 - 2026-06-16

Esta version endurece la compatibilidad runtime para instalaciones actuales de
Codex. Quita el campo obsoleto `apps._default.default_tools_enabled`, conserva
approval rules locales en `rules/default.rules`, muestra routing profiles y
notas de setup MCP en el status board, y trata el warning de WebSocket fallback
como no bloqueante cuando el resto de Codex doctor esta sano.

### Highlights

- Enterprise routing board con `catalog/routing-profiles.json` y
  `npm run codex:routing`.
- Notas de setup MCP para tooling, OAuth, rutas filesystem y
  `SUPABASE_DB_URL`.
- Resumen de effective controls en `npm run codex:status`.
- Nombres de skills actualizados: `ai-project-starter`, `prompt-architect` y
  `ai-skill-create`.

### Verificacion

```bash
npm run check
npm run codex:status:all
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## Secciones fuente

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [release-notes.md](release-notes.md).

- Release Notes
- Unreleased
- v0.5.42 - 2026-06-25
- Verification
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

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
