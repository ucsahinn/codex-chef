# Carte Des Capacites Codex

[Deutsch](codex-capability-map.de.md) | [Español](codex-capability-map.es.md) | [English](codex-capability-map.md) | [Português (Brasil)](codex-capability-map.pt-BR.md) | [Türkçe](codex-capability-map.tr.md) | [Français](codex-capability-map.fr.md)

> Ce guide en français fait partie du jeu de documentation en six langues pour `codex-capability-map.md`. Il garde la même frontière de sécurité: prévisualiser d'abord, ne pas stocker de secrets et vérifier localement chaque changement de setup.

## Ce que cette page couvre

- Quelle surface Codex, config, skill, agent ou MCP utiliser selon le besoin.
- `token-safe.config.toml` comme profil optionnel pour reduire les budgets reasoning et output.
- Les roles d'agents ne fixent pas model/reasoning par agent; le profil actif decide.
- Defaults conservateurs pour sandbox, approvals et connecteurs externes.
- Décisions de routing documentées et vérifiables dans le repo.

## Commandes utiles

```bash
npm run token:audit
```

```bash
codex doctor --summary
codex exec --strict-config "Summarize the active Codex setup."
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
- Utiliser `npm run token:audit` pour voir les principales surfaces de contexte et tokens.
- Utiliser `git diff --check` pour détecter les problèmes de whitespace et Markdown.
- Utiliser `gitleaks detect --redact --no-banner --no-git --verbose` si Gitleaks est disponible.

## Sections source

Ce fichier localisé suit les sections du fichier source anglais. Source: [codex-capability-map.md](codex-capability-map.md).

- Codex Capability Map
- Capability Layers
- Specialist Agent Set
- Doctor Commands
- MCP And Connector Policy
- Skill And Plugin Policy
- What This Does Not Import
- Verification

## Garder synchronisé

Quand un comportement ou une commande change, mettez à jour les six fichiers de langue et exécutez les contrôles.

```bash
npm run check
npm run validate:doc-locales
```

Back to the localized entry point: [Français](../README.fr.md).
