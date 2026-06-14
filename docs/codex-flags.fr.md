# Flags Et Commandes Codex CLI

[Deutsch](codex-flags.de.md) | [Español](codex-flags.es.md) | [English](codex-flags.md) | [Português (Brasil)](codex-flags.pt-BR.md) | [Türkçe](codex-flags.tr.md) | [Français](codex-flags.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `codex-flags.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

## Ce que cette page couvre

- Quelle surface Codex, config, skill, agent ou MCP utiliser selon le besoin.
- Defaults conservateurs pour sandbox, approvals et connecteurs externes.
- Décisions de routing documentées et vérifiables dans le repo.

## Commandes utiles

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

```text
/mcp
/skills
/plugins
/hooks
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

Ce fichier localisé suit les sections du fichier source anglais. Source: [codex-flags.md](codex-flags.md).

- Codex CLI Flags And Commands
- Global Flags
- Common Commands
- MCP Config Fields
- Recommended Local Defaults

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
