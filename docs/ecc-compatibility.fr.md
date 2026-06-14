# Compatibilité ECC Et Politique D'import

[Deutsch](ecc-compatibility.de.md) | [Español](ecc-compatibility.es.md) | [English](ecc-compatibility.md) | [Português (Brasil)](ecc-compatibility.pt-BR.md) | [Türkçe](ecc-compatibility.tr.md) | [Français](ecc-compatibility.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `ecc-compatibility.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

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

Ce fichier localisé suit les sections du fichier source anglais. Source: [ecc-compatibility.md](ecc-compatibility.md).

- ECC Compatibility And Import Policy
- What ECC Does Well
- What This Starter Must Not Copy
- Safe Adaptation Rules
- Current ECC-Informed Adaptations
- Official Codex Alignment

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
