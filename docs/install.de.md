# Installationsleitfaden

[Deutsch](install.de.md) | [Español](install.es.md) | [English](install.md) | [Português (Brasil)](install.pt-BR.md) | [Türkçe](install.tr.md) | [Français](install.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `install.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

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

```powershell
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
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
- `npm run token:audit` nutzen, um die groessten Context- und Token-Flaechen sichtbar zu machen.
- `git diff --check` nutzen, um Whitespace- und Markdown-Probleme zu erkennen.
- `gitleaks detect --redact --no-banner --no-git --verbose` nutzen, wenn Gitleaks verfügbar ist.

## Quellabschnitte

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [install.md](install.md).

- Installation Guide
- Prerequisites
- PowerShell Install
- Bash Or WSL Install
- What Gets Backed Up
- Post-Install Checks
- Test Without Touching Your Real Setup
- Rollback

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
