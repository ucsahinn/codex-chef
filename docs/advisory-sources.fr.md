# Sources Advisory

[Deutsch](advisory-sources.de.md) | [Español](advisory-sources.es.md) | [English](advisory-sources.md) | [Português (Brasil)](advisory-sources.pt-BR.md) | [Türkçe](advisory-sources.tr.md) | [Français](advisory-sources.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `advisory-sources.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

## Ce que cette page couvre

- Frontières public-safe pour secrets, credentials, état local et comptes externes.
- Defaults least-privilege pour MCPs, skills, plugins, hooks et rules.
- Validation qui bloque la dérive risquée avant publication.

## Commandes utiles

```bash
npm run check
gitleaks detect --redact --no-banner --no-git --verbose
```

```bash
node scripts/security-audit.mjs
node scripts/scan-supply-chain-iocs.mjs
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

Ce fichier localisé suit les sections du fichier source anglais. Source: [advisory-sources.md](advisory-sources.md).

- Advisory Sources
- What To Check
- What Not To Automate By Default
- Release Use

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
