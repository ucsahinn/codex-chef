# Release Notes

[Deutsch](release-notes.de.md) | [Español](release-notes.es.md) | [English](release-notes.md) | [Português (Brasil)](release-notes.pt-BR.md) | [Türkçe](release-notes.tr.md) | [Français](release-notes.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `release-notes.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

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

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [release-notes.md](release-notes.md).

- Release Notes
- Unreleased
- v0.5.10 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.9 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.8 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.7 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.6 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
- v0.5.5 - 2026-06-16
- Upgrade Notes
- Verification
- v0.5.4 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.3 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.2 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.1 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.5.0 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.4.0 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.3.1 - 2026-06-15
- Highlights
- Upgrade Notes
- Verification
- v0.3.0 - 2026-06-14
- Highlights
- Upgrade Notes
- Verification

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
