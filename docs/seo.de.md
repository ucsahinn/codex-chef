# Codex Chef SEO Und Discoverability

[Deutsch](seo.de.md) | [Español](seo.es.md) | [English](seo.md) | [Português (Brasil)](seo.pt-BR.md) | [Türkçe](seo.tr.md) | [Français](seo.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `seo.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

## Was diese Seite abdeckt

- Release- und Public-Readiness-Schritte, die vor Push oder Tag sichtbar sein müssen.
- CI-, Gitleaks-, Docs- und Installer-Gates als überprüfbare Nachweise.
- Was lokal beweisbar ist und was erst nach ausdrücklicher Freigabe remote geprüft wird.

## Nützliche Befehle

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
npm run verify:skills:online
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

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [seo.md](seo.md).

- Codex Chef SEO And Discoverability
- Target Query Cluster
- Recommended GitHub Metadata
- README Requirements
- Search-Safe Claims
- Measurement

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
