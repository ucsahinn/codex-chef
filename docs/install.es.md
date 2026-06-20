# Guía De Instalación

[Deutsch](install.de.md) | [Español](install.es.md) | [English](install.md) | [Português (Brasil)](install.pt-BR.md) | [Türkçe](install.tr.md) | [Français](install.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `install.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

## Qué cubre esta página

- Instalación Windows-first con PowerShell y una ruta equivalente para Bash/WSL.
- Dry-run y preview del plan antes de escrituras globales reales.
- Backups y expectativas de rollback para targets Codex gestionados.

## Comandos útiles

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

## Límite de seguridad

- No documentar tokens, cookies, sesiones, memories ni rutas locales privadas.
- Ejecutar escrituras globales reales solo mediante el flujo explícito del installer.
- Acciones como commit, push, release, publish o cambios de GitHub settings siguen siendo decisiones humanas.

## Verificación

- Ejecutar `npm run check` antes de publicar.
- Usar `git diff --check` para detectar problemas de whitespace y Markdown.
- Usar `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks está disponible.

## Secciones fuente

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [install.md](install.md).

- Installation Guide
- Prerequisites
- PowerShell Install
- Bash Or WSL Install
- What Gets Backed Up
- Post-Install Checks
- Test Without Touching Your Real Setup
- Rollback

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
