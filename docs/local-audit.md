# Local Audit - 2026-06-10

This normalized audit explains where previous global Codex work landed.

## Desktop Search

Only one matching Desktop directory was found before this repo was created:

```text
~/Desktop/codex-cli-best-practice-main
```

No existing `codex-chef` repo was present.

## Global Codex Boundary

The previous workstation had existing global Codex files, role files, rules,
skills, MCP configuration, hooks, and private operational notes. Those details
belong to the user's local setup, not to a public starter repository.

This starter therefore keeps only reusable, reviewed templates and validators.
It must not copy private runbooks, exact local model defaults, enabled account
connectors, project trust entries, hook state, auth files, tokens, sessions,
memories, or machine-specific paths into the public package.

## Current Skill Locations

Skills were found under both:

```text
~/.codex/skills
~/.agents/skills
```

This starter does not vendor those folders wholesale. It provides a catalog and
optional installer because copying third-party/local skill directories can
create licensing, freshness, and secret-leak risk.

## Security Artifacts

The previous setup also used:

```text
~/.gitignore_global
~/.githooks/pre-commit
```

This starter includes sanitized equivalents under `templates/git/`.

## Decision

The new repository should be a clean distribution package, not a raw copy of
the user home directory. Therefore it includes:

- generalized templates
- installer scripts with backups
- catalogs
- docs
- validation

It excludes:

- Codex session/memory state
- auth files
- project trust state
- hook trust hashes
- machine-specific project paths
- third-party skill directories copied without review
