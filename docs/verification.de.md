# Verifikation

[Deutsch](verification.de.md) | [Español](verification.es.md) | [English](verification.md) | [Português (Brasil)](verification.pt-BR.md) | [Türkçe](verification.tr.md) | [Français](verification.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `verification.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

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

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [verification.md](verification.md).

- Verification
- Syntax Checks
- Installer Smoke Tests
- Real Install Verification
- Remote Verification

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
