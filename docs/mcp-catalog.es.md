# Catálogo MCP

[Deutsch](mcp-catalog.de.md) | [Español](mcp-catalog.es.md) | [English](mcp-catalog.md) | [Português (Brasil)](mcp-catalog.pt-BR.md) | [Türkçe](mcp-catalog.tr.md) | [Français](mcp-catalog.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `mcp-catalog.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

## Qué cubre esta página

- Qué superficie de Codex, config, skill, agent o MCP se usa para cada caso.
- Defaults conservadores para sandbox, aprobaciones y conectores externos.
- Decisiones de routing documentadas y verificables dentro del repo.

## Comandos útiles

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
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

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [mcp-catalog.md](mcp-catalog.md).

- MCP Catalog
- Enabled By Default
- Disabled Until Needed
- Rule
- Config Flags To Prefer

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
