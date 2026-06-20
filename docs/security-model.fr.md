# Modèle De Sécurité

[Deutsch](security-model.de.md) | [Español](security-model.es.md) | [English](security-model.md) | [Português (Brasil)](security-model.pt-BR.md) | [Türkçe](security-model.tr.md) | [Français](security-model.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `security-model.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

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
- Utiliser `git diff --check` pour détecter les problèmes de whitespace et Markdown.
- Utiliser `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks est disponible.

## Sections source

Ce fichier localisé suit les sections du fichier source anglais. Source: [security-model.md](security-model.md).

- Security Model
- Defaults
- MCP Boundaries
- Skill Sources
- Specialist Agent Boundaries
- Install Planning And Collision Policy
- Repair Mode
- Update Mode
- Rules
- Hooks
- Git Hygiene
- What Must Never Be Included
- External Account Actions

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
