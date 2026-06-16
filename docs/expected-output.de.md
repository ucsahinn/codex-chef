# Erwartete Ausgabe

[Deutsch](expected-output.de.md) | [Español](expected-output.es.md) | [English](expected-output.md) | [Português (Brasil)](expected-output.pt-BR.md) | [Türkçe](expected-output.tr.md) | [Français](expected-output.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `expected-output.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

> Vollstaendige Ausgabe-Beispiele und Operator-Details stehen in
> [English](expected-output.md) und [Türkçe](expected-output.tr.md). Diese
> lokalisierte Seite ist eine Sicherheitszusammenfassung mit Quellenindex.

## Was diese Seite abdeckt

- Windows-first Installation mit PowerShell und ein passender Bash/WSL-Pfad.
- Dry-run und Plan-Preview vor echten globalen Writes.
- Backups und Rollback-Erwartungen für verwaltete Codex-Ziele.

## Nützliche Befehle

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

```powershell
.\scripts\install.ps1 -All -Interactive
```

```powershell
.\scripts\install.ps1 -All -PlainOutput
```

```bash
./scripts/install.sh --all --dry-run
```

```bash
./scripts/install.sh --all --interactive
```

```bash
./scripts/install.sh --all --plain-output
```

```bash
node scripts/plan-install.mjs --all --json
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

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [expected-output.md](expected-output.md).

- Expected Output
- Install Plan Preview
- PowerShell Dry Run
- PowerShell Success
- Bash Dry Run
- Bash Success
- Skill Installation

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
