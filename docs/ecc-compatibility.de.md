# ECC-Kompatibilität Und Import-Policy

[Deutsch](ecc-compatibility.de.md) | [Español](ecc-compatibility.es.md) | [English](ecc-compatibility.md) | [Português (Brasil)](ecc-compatibility.pt-BR.md) | [Türkçe](ecc-compatibility.tr.md) | [Français](ecc-compatibility.fr.md)

> Diese deutsche Anleitung ist Teil des sechssprachigen Dokumentationssatzes fuer `ecc-compatibility.md`. Sie behält dieselbe Sicherheitsgrenze bei: zuerst eine Vorschau ausführen, keine Secrets speichern und jede Setup-Aenderung lokal verifizieren.

## Was diese Seite abdeckt

- Public-safe Grenzen für Secrets, Credentials, lokale Zustände und externe Accounts.
- Least-privilege Defaults für MCPs, Skills, Plugins, Hooks und Rules.
- Validierung, die riskante Drift vor Veröffentlichung stoppt.

## Nützliche Befehle

```bash
npm run check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
node scripts/security-audit.mjs
node scripts/scan-supply-chain-iocs.mjs
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

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [ecc-compatibility.md](ecc-compatibility.md).

- ECC Compatibility And Import Policy
- What ECC Does Well
- What This Starter Must Not Copy
- Safe Adaptation Rules
- Current ECC-Informed Adaptations
- Official Codex Alignment

## Synchron halten

Wenn sich das Verhalten oder ein Befehl ändert, aktualisiere alle sechs Sprachdateien und führe die Prüfungen aus.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Deutsch](../README.de.md).
