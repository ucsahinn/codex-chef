# Skills, Plugins Und Spezialisten-Agents

[Deutsch](skills-and-agents.de.md) | [Español](skills-and-agents.es.md) | [English](skills-and-agents.md) | [Português (Brasil)](skills-and-agents.pt-BR.md) | [Türkçe](skills-and-agents.tr.md) | [Français](skills-and-agents.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `skills-and-agents.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

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

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [skills-and-agents.md](skills-and-agents.md).

- Skills, Plugins, And Specialist Agents
- Skills
- Plugins
- Specialist Agents
- Enterprise Routing Profiles

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
