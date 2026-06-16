# Notes De Release

[Deutsch](release-notes.de.md) | [Español](release-notes.es.md) | [English](release-notes.md) | [Português (Brasil)](release-notes.pt-BR.md) | [Türkçe](release-notes.tr.md) | [Français](release-notes.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `release-notes.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

## Ce que cette page couvre

- Étapes de release et public-readiness visibles avant push ou tag.
- CI, Gitleaks, docs et installer gates comme preuves vérifiables.
- Ce qui est prouvé localement et ce qui est vérifié à distance seulement après approbation explicite.

## Commandes utiles

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
npm run verify:skills:online
```

## Frontière de sécurité

- Ne pas documenter de tokens, cookies, sessions, memories ou chemins locaux privés.
- Exécuter les écritures globales réelles uniquement via le flux explicite de l'installer.
- Les actions comme commit, push, release, publish ou GitHub settings restent des décisions humaines.

## Vérification

- Exécuter `npm run check` avant publication.
- Utiliser `git diff --check` pour détecter les problèmes de whitespace et Markdown.
- Utiliser `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks est disponible.

## v0.5.14 - 2026-06-16

Cette version ferme les derniers ecarts de connectors et de documentation du
dernier audit Codex Chef. App/connectors restent parques par defaut avec
`apps._default.enabled = false`, repair mode migre les anciens defaults vers
l'etat sur, et les README anglaise et turque documentent les parametres de
l'installer.

### Highlights

- App/connectors restent opt-in comme les MCP connectors authentifies.
- Repair, security et status validation exigent
  `apps._default.enabled = false`,
  `apps._default.destructive_enabled = false` et
  `apps._default.open_world_enabled = false`.
- README documente `-All`, `-Interactive`, `-WhatIf`, `-Repair`, `-Force`,
  `-NoBackup`, `-InstallSkills`, `-InstallGitGuards` et `-PlainOutput`.

### Verification

```bash
npm run check
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.13 - 2026-06-16

Cette version durcit la compatibilite runtime pour les installations Codex
actuelles. Elle retire le champ obsolete
`apps._default.default_tools_enabled`, preserve les approval rules locales dans
`rules/default.rules`, affiche les routing profiles et les notes de setup MCP
dans le status board, et classe l'avertissement WebSocket fallback comme non
bloquant quand le reste de Codex doctor est sain.

### Highlights

- Enterprise routing board avec `catalog/routing-profiles.json` et
  `npm run codex:routing`.
- Notes de setup MCP pour tooling, OAuth, chemins filesystem et
  `SUPABASE_DB_URL`.
- Resume des effective controls dans `npm run codex:status`.
- Noms de skills mis a jour: `ai-project-starter`, `prompt-architect` et
  `ai-skill-create`.

### Verification

```bash
npm run check
npm run codex:status:all
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## Sections source

Ce fichier localisé suit les sections du fichier source anglais. Source: [release-notes.md](release-notes.md).

- Release Notes
- Unreleased
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

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
