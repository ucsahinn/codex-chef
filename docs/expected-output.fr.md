# Sortie Attendue

[Deutsch](expected-output.de.md) | [Español](expected-output.es.md) | [English](expected-output.md) | [Português (Brasil)](expected-output.pt-BR.md) | [Türkçe](expected-output.tr.md) | [Français](expected-output.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `expected-output.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

## Ce que cette page couvre

- Installation Windows-first avec PowerShell et chemin équivalent pour Bash/WSL.
- Dry-run et preview du plan avant toute écriture globale réelle.
- Backups et attentes de rollback pour les cibles Codex gérées.

## Commandes utiles

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

## Frontière de sécurité

- Ne pas documenter de tokens, cookies, sessions, memories ou chemins locaux privés.
- Exécuter les écritures globales réelles uniquement via le flux explicite de l'installer.
- Les actions comme commit, push, release, publish ou GitHub settings restent des décisions humaines.

## Vérification

- Exécuter `npm run check` avant publication.
- Utiliser `npm run token:audit` pour voir les principales surfaces de contexte et tokens.
- Utiliser `git diff --check` pour détecter les problèmes de whitespace et Markdown.
- Utiliser `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks est disponible.

## Sections source

Ce fichier localisé suit les sections du fichier source anglais. Source: [expected-output.md](expected-output.md).

- Expected Output
- Install Plan Preview
- Routing Board
- PowerShell Dry Run
- PowerShell Success
- Repair Preview
- Bash Dry Run
- Bash Success
- Skill Installation

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
