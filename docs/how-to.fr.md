# Comment Exécuter Le Setup

[Deutsch](how-to.de.md) | [Español](how-to.es.md) | [English](how-to.md) | [Português (Brasil)](how-to.pt-BR.md) | [Türkçe](how-to.tr.md) | [Français](how-to.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `how-to.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

## Ce que cette page couvre

- Installation Windows-first avec PowerShell et chemin équivalent pour Bash/WSL.
- Dry-run et preview du plan avant toute écriture globale réelle.
- Backups et attentes de rollback pour les cibles Codex gérées.

## Commandes utiles

```powershell
.\scripts\install.ps1 -All -WhatIf
```

```bash
./scripts/install.sh --all --dry-run
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
- Utiliser `git diff --check` pour détecter les problèmes de whitespace et Markdown.
- Utiliser `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks est disponible.

## Sections source

Ce fichier localisé suit les sections du fichier source anglais. Source: [how-to.md](how-to.md).

- How To Run The Setup
- One-Shot Setup
- First Verification
- Operating Model
- MCP Defaults
- Profiles
- Common Prompts
- Safety Rules

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
