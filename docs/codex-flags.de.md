# Codex CLI Flags Und Commands

[Deutsch](codex-flags.de.md) | [Español](codex-flags.es.md) | [English](codex-flags.md) | [Português (Brasil)](codex-flags.pt-BR.md) | [Türkçe](codex-flags.tr.md) | [Français](codex-flags.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `codex-flags.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

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

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [codex-flags.md](codex-flags.md).

- Codex CLI Flags And Commands
- Global Flags
- Common Commands
- MCP Config Fields
- App And Connector Defaults
- Recommended Local Defaults
- Advanced Features To Keep Explicit

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
