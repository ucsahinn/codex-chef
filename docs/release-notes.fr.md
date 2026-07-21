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

## v0.5.50 - 2026-07-21

Cette version transforme le menu opérateur en un flux interactif complet : les actions d’écriture affichent leur plan, demandent une confirmation propre à l’action et se terminent dans la même session sans relancer de commande paramétrée. Les sauvegardes peuvent être sélectionnées, inspectées, restaurées ou supprimées avec une confirmation liée à la cible, et la nouvelle grande signature `U.C.Ş` conserve les icônes et tableaux existants.

## v0.5.49 - 2026-07-21

Cette version rend la sélection des agents adaptative : les spécialistes ne sont lancés que pour un travail parallèle indépendant, une recherche bruyante à isoler ou une demande explicite. Le profil actif garde le contrôle du modèle et du raisonnement, tandis que la référence de routing complète reste disponible dans un skill intégré.

## v0.5.48 - 2026-07-09

Cette version renforce la surface publique du repo avec une knowledge base
bilingue, un nouveau validateur de locales KB, des exemples install-plan
rediges et une image social preview actualisee.

## v0.5.47 - 2026-07-09

Cette version corrige un faux `fail` de `codex:status:all` trouve apres la
verification de v0.5.46. Les sondes Codex/MCP plus lentes sous Windows ont plus
de temps pour la verification runtime, mais une vraie derive des managed files,
skills, Git guards ou MCP echoue toujours.

## v0.5.46 - 2026-07-09

Cette version reduit les approval prompts inutiles pour la verification sure et
la release-readiness de Codex Chef. Les validateurs granulaires, checks skills
et runtime, package dry-runs, GitHub run watching et diagnostics read-only
Codex sont allowlisted; repair apply, cleanup, publish, deploy, release,
credentials, changements de dependances et package execution ad-hoc restent
prompt-gated.

## v0.5.45 - 2026-07-09

Cette version renforce les 21 agents specialistes avec un bloc
`World-class specialist upgrade` impose par les validateurs. Chaque agent nomme
le failure mode de son domaine, applique l'evidence grading, lance un senior
challenge, respecte sa role boundary et route le travail adjacent vers le bon
specialiste. La validation de package surface bloque aussi les fichiers
untracked, ignored, local-state, `tmp` imbrique, build, coverage et artefacts de
dependances dans npm pack.

## v0.5.44 - 2026-07-09

Cette version ajoute `codebase-memory` comme MCP active par defaut mais limite
par liste d'outils pour l'analyse de codebase avec graphe local. Les outils
read/query sont allowlisted, l'indexing et les outils project-state plus
risques restent prompt-gated ou desactives, et les artefacts generes
`.codebase-memory/` restent hors du source control. Le status board affiche
aussi les controles de context-budget et le rappel du profil `token-safe` pour
les longs travaux sur tout le repo.

## v0.5.43 - 2026-06-25

Ce patch etend l'experience operateur de la CLI a tout le menu et aux
sous-menus. Skills, MCP, backups, diagnostics, process audit, auth et ecrans de
preview utilisent maintenant la meme structure orientee resume, le meme langage
naturel et les memes limites d'ecriture sures que le menu principal.

### Verification

```bash
npm run validate:chef-cli
npm run check
git diff --check
```

## v0.5.42 - 2026-06-25

Ce patch classe les skills globaux non verifies de l'utilisateur comme note dans
le rapport repair, pas comme raison d'attention. Un runtime propre reste
`Overall: ok`, tandis que les skills curates manquants, les doublons et le drift
reel restent visibles.

### Verification

```bash
npm run check
npm run validate:repair
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
```

## v0.5.41 - 2026-06-24

Ce patch met a jour la version actuelle dans les notes de publication
francaises. Il couvre le correctif readline de la CLI interactive, la meme
fonction de question du menu pour les prompts imbriques et les regressions
contre les stacks AbortError ainsi que les avertissements unsettled
top-level-await.

### Verification

```bash
npm run check
npm run release:notes
gitleaks detect --redact --no-banner --no-git --verbose
```

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

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
