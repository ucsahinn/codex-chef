# Audit De Complétude

[Deutsch](completion-audit.de.md) | [Español](completion-audit.es.md) | [English](completion-audit.md) | [Português (Brasil)](completion-audit.pt-BR.md) | [Türkçe](completion-audit.tr.md) | [Français](completion-audit.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `completion-audit.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

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

## Sections source

Ce fichier localisé suit les sections du fichier source anglais. Source: [completion-audit.md](completion-audit.md).

- Completion Audit
- Requirements
- Verification Evidence
- Publication Note
- 2026-06-11 Routing Addendum
- 2026-06-14 ECC-Informed Addendum
- 2026-06-15 Skill And Context-Budget Addendum

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
