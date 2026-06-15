# Workflow Surface Map

[Deutsch](workflow-surface-map.de.md) | [Español](workflow-surface-map.es.md) | [English](workflow-surface-map.md) | [Português (Brasil)](workflow-surface-map.pt-BR.md) | [Türkçe](workflow-surface-map.tr.md) | [Français](workflow-surface-map.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `workflow-surface-map.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

## Was diese Seite abdeckt

- Welche Codex-Oberfläche, Config, Skill, Agent- oder MCP-Fläche wofür genutzt wird.
- Konservative Defaults für Sandbox, Approvals und externe Connectoren.
- Routing-Entscheidungen, die im Repo dokumentiert und verifizierbar bleiben.

## Nützliche Befehle

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

## Sicherheitsgrenze

- Keine Tokens, Cookies, Sessions, Memories oder privaten lokalen Pfade in die Dokumentation aufnehmen.
- Reale globale Writes nur über den expliziten Installer-Flow ausführen.
- Riskante Aktionen wie Commit, Push, Release, Publish oder GitHub-Settings bleiben menschliche Entscheidungen.

## Verifikation

- `npm run check` vor einer Veröffentlichung ausführen.
- `git diff --check` nutzen, um Whitespace- und Markdown-Probleme zu erkennen.
- `gitleaks detect --redact --no-banner --no-git --verbose` nutzen, wenn Gitleaks verfügbar ist.

## Quellabschnitte

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [workflow-surface-map.md](workflow-surface-map.md).

- Workflow Surface Map
- Surface Rule
- GStack-Style Workflow Mapping
- ECC Pattern Mapping
- Evidence-Based Exclusions
- Recommended Starter Chain

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
