# MCP-Katalog

[Deutsch](mcp-catalog.de.md) | [Español](mcp-catalog.es.md) | [English](mcp-catalog.md) | [Português (Brasil)](mcp-catalog.pt-BR.md) | [Türkçe](mcp-catalog.tr.md) | [Français](mcp-catalog.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `mcp-catalog.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

## Was diese Seite abdeckt

- Welche Codex-Oberfläche, Config, Skill, Agent- oder MCP-Fläche wofür genutzt wird.
- `token-safe.config.toml` als optionales Profil fuer niedrigere Reasoning- und Output-Budgets.
- Agent-Rollen bleiben ohne per-agent model/reasoning pins, damit das aktive Profil entscheidet.
- Konservative Defaults für Sandbox, Approvals und externe Connectoren.
- Routing-Entscheidungen, die im Repo dokumentiert und verifizierbar bleiben.

## Nützliche Befehle

```bash
npm run token:audit
```

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

## Sicherheitsgrenze

- Keine Tokens, Cookies, Sessions, Memories oder privaten lokalen Pfade in die Dokumentation aufnehmen.
- Reale globale Writes nur über den expliziten Installer-Flow ausführen.
- Riskante Aktionen wie Commit, Push, Release, Publish oder GitHub-Settings bleiben menschliche Entscheidungen.

## Verifikation

- `npm run check` vor einer Veröffentlichung ausführen.
- `npm run token:audit` nutzen, um die groessten Context- und Token-Flaechen sichtbar zu machen.
- `git diff --check` nutzen, um Whitespace- und Markdown-Probleme zu erkennen.
- `gitleaks detect --redact --no-banner --no-git --verbose` nutzen, wenn Gitleaks verfügbar ist.

## Quellabschnitte

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [mcp-catalog.md](mcp-catalog.md).

- MCP Catalog
- Enabled By Default
- Disabled Until Needed
- Opt-In Connector Recipes
- Rule
- Config Flags To Prefer

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
