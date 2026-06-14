# Notas De Windows

[Deutsch](windows.de.md) | [Español](windows.es.md) | [English](windows.md) | [Português (Brasil)](windows.pt-BR.md) | [Türkçe](windows.tr.md) | [Français](windows.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `windows.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

## Qué cubre esta página

- Instalación Windows-first con PowerShell y una ruta equivalente para Bash/WSL.
- Dry-run y preview del plan antes de escrituras globales reales.
- Backups y expectativas de rollback para targets Codex gestionados.

## Comandos útiles

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

```bash
./scripts/install.sh --all --force --dry-run
```

```bash
node scripts/plan-install.mjs --all --json
```

## Límite de seguridad

- No documentar tokens, cookies, sesiones, memories ni rutas locales privadas.
- Ejecutar escrituras globales reales solo mediante el flujo explícito del installer.
- Acciones como commit, push, release, publish o cambios de GitHub settings siguen siendo decisiones humanas.

## Verificación

- Ejecutar `npm run check` antes de publicar.
- Usar `git diff --check` para detectar problemas de whitespace y Markdown.
- Usar `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks está disponible.

## Secciones fuente

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [windows.md](windows.md).

- Windows Notes
- Recommended Posture
- Starter Defaults
- Useful Checks

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
