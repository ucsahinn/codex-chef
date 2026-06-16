# Flags Y Comandos De Codex CLI

[Deutsch](codex-flags.de.md) | [Español](codex-flags.es.md) | [English](codex-flags.md) | [Português (Brasil)](codex-flags.pt-BR.md) | [Türkçe](codex-flags.tr.md) | [Français](codex-flags.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `codex-flags.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

## Qué cubre esta página

- Qué superficie de Codex, config, skill, agent o MCP se usa para cada caso.
- Defaults conservadores para sandbox, aprobaciones y conectores externos.
- Decisiones de routing documentadas y verificables dentro del repo.

## Comandos útiles

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

## Límite de seguridad

- No documentar tokens, cookies, sesiones, memories ni rutas locales privadas.
- Ejecutar escrituras globales reales solo mediante el flujo explícito del installer.
- Acciones como commit, push, release, publish o cambios de GitHub settings siguen siendo decisiones humanas.

## Verificación

- Ejecutar `npm run check` antes de publicar.
- Usar `git diff --check` para detectar problemas de whitespace y Markdown.
- Usar `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks está disponible.

## Secciones fuente

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [codex-flags.md](codex-flags.md).

- Codex CLI Flags And Commands
- Global Flags
- Common Commands
- MCP Config Fields
- App And Connector Defaults
- Recommended Local Defaults
- Advanced Features To Keep Explicit

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
