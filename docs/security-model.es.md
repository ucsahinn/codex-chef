# Modelo De Seguridad

[Deutsch](security-model.de.md) | [Español](security-model.es.md) | [English](security-model.md) | [Português (Brasil)](security-model.pt-BR.md) | [Türkçe](security-model.tr.md) | [Français](security-model.fr.md)

> Esta guía en español forma parte del conjunto de documentación en seis idiomas para `security-model.md`. Mantiene el mismo límite de seguridad: previsualizar primero, no guardar secretos y verificar localmente cada cambio de setup.

## Qué cubre esta página

- Límites public-safe para secretos, credenciales, estado local y cuentas externas.
- Defaults de menor privilegio para MCPs, skills, plugins, hooks y rules.
- Validación que bloquea drift riesgoso antes de publicar.

## Comandos útiles

```bash
npm run check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
node scripts/security-audit.mjs
node scripts/scan-supply-chain-iocs.mjs
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

Este archivo localizado sigue las secciones del archivo fuente en inglés. Source: [security-model.md](security-model.md).

- Security Model
- Defaults
- MCP Boundaries
- Skill Sources
- Specialist Agent Boundaries
- Install Planning And Collision Policy
- Repair Mode
- Update Mode
- Rules
- Hooks
- Git Hygiene
- What Must Never Be Included
- External Account Actions

## Mantener sincronizado

Cuando cambie un comportamiento o comando, actualiza los seis archivos de idioma y ejecuta las comprobaciones.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Español](../README.es.md).
