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

## v0.5.46 - 2026-07-09

Diese Version reduziert unnoetige Approval Prompts fuer sichere Codex Chef
Verifikation und Release-Readiness. Granulare Validatoren, Skill- und Runtime
Checks, Package Dry-Runs, GitHub Run Watching und Codex Read-only Diagnostics
sind enger allowlisted; Repair Apply, Cleanup, Publish, Deploy, Release,
Credentials, Dependency-Aenderungen und ad-hoc Package Execution bleiben
prompt-gated.

## v0.5.45 - 2026-07-09

Diese Version staerkt alle 21 Specialist Agents mit einem validator-erzwungenen
`World-class specialist upgrade` Block. Jeder Agent benennt jetzt den
fachlichen Failure Mode, nutzt Evidence Grading, fuehrt einen Senior Challenge
Check aus, respektiert seine Role Boundary und routet angrenzende Arbeit an den
passenden Spezialisten. Die Package-Surface-Pruefung blockiert ausserdem
untracked, ignored, lokale State-, verschachtelte `tmp`-, Build-, Coverage- und
Dependency-Artefakte im npm Pack.

## v0.5.44 - 2026-07-09

Diese Version fuegt `codebase-memory` als standardmaessig aktivierten, aber
werkzeug-eingegrenzten MCP fuer graph-basierte Codebase-Analyse hinzu.
Read/query-Tools sind allowlisted, Indexing und riskantere Projekt-State-Tools
bleiben prompt-gated oder deaktiviert, und generierte `.codebase-memory/`
Artefakte bleiben aus dem Source Control. Das Status Board zeigt jetzt auch
Context-Budget Controls und den `token-safe` Profilhinweis fuer lange
repo-weite Arbeiten.

## v0.5.43 - 2026-06-25

Dieser Patch bringt die CLI Operator Experience auf die gesamte Menue- und
Untermenue-Oberflaeche. Skills, MCP, Backups, Diagnostics, Process Audit, Auth
und Preview-Screens nutzen jetzt dieselbe zusammenfassende Struktur,
natuerliche Sprache und sichere Write-Boundary-Hinweise wie das Hauptmenue.

### Verification

```bash
npm run validate:chef-cli
npm run check
git diff --check
```

## v0.5.42 - 2026-06-25

Dieser Patch stuft nicht kuratierte globale User-Skills im Repair-Report als
Hinweis statt als Attention-Grund ein. Ein sauberer Runtime-Zustand bleibt
dadurch `Overall: ok`, waehrend fehlende kuratierte Skills, Duplikate und echte
Drift weiterhin sichtbar bleiben.

### Verification

```bash
npm run check
npm run validate:repair
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
```

## v0.5.41 - 2026-06-24

Dieser Patch aktualisiert die aktuelle Release-Spitze fuer die deutsche
Release-Notes-Seite. Er dokumentiert den interaktiven CLI readline Fix, die
gemeinsame Menu-Fragefunktion fuer verschachtelte Prompts und die Regressionen
gegen AbortError-Stacks sowie unsettled top-level-await Warnungen.

### Verification

```bash
npm run check
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
```

## v0.5.14 - 2026-06-16

Diese Version schliesst die letzten Connector- und Dokumentationsluecken aus
dem finalen Codex Chef Audit. App/connectors bleiben mit
`apps._default.enabled = false` standardmaessig geparkt, repair mode migriert
aeltere Defaults zurueck in den sicheren Zustand, und die englische sowie
tuerkische README dokumentieren die Installer-Parameter vollstaendig.

### Highlights

- App/connectors bleiben opt-in wie authentifizierte MCP connectors.
- Repair, security und status validation verlangen
  `apps._default.enabled = false`,
  `apps._default.destructive_enabled = false` und
  `apps._default.open_world_enabled = false`.
- README dokumentiert `-All`, `-Interactive`, `-WhatIf`, `-Repair`, `-Force`,
  `-NoBackup`, `-InstallSkills`, `-InstallGitGuards` und `-PlainOutput`.

### Verifikation

```bash
npm run check
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.13 - 2026-06-16

Diese Version haertet die Runtime-Kompatibilitaet fuer aktuelle Codex
Installationen. Sie entfernt das veraltete
`apps._default.default_tools_enabled` Feld, bewahrt lokale Approval Rules in
`rules/default.rules`, zeigt Routing-Profile und MCP-Setup-Hinweise im Status
Board und behandelt WebSocket-Fallback-Warnungen als nicht blockierend, wenn
die restliche Codex-Pruefung gesund ist.

### Highlights

- Enterprise Routing Board mit `catalog/routing-profiles.json` und
  `npm run codex:routing`.
- MCP Setup-Hinweise fuer Tooling, OAuth, Filesystem-Pfade und
  `SUPABASE_DB_URL`.
- Effective-controls Zusammenfassung in `npm run codex:status`.
- Aktualisierte Skill-Namen: `ai-project-starter`, `prompt-architect` und
  `ai-skill-create`.

### Verifikation

```bash
npm run check
npm run codex:status:all
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## Quellabschnitte

Diese lokalisierte Datei folgt den Abschnitten der englischen Quelldatei. Source: [release-notes.md](release-notes.md).

- Release Notes
- Unreleased
- v0.5.42 - 2026-06-25
- Verification
- v0.5.41 - 2026-06-24
- Verification
- v0.5.14 - 2026-06-16
- Highlights
- Verification
- v0.5.13 - 2026-06-16
- Highlights
- Verification
- v0.5.12 - 2026-06-16
- Highlights
- Verification
- v0.5.11 - 2026-06-16
- Highlights
- Upgrade Notes
- Verification
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
