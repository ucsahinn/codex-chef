# Local Audit - 2026-06-10

This normalized audit explains where previous global Codex work landed.

## Desktop Search

Only one matching Desktop directory was found before this repo was created:

```text
~/Desktop/codex-cli-best-practice-main
```

No existing `codex-enterprise-starter` repo was present.

## Current Global Codex Files

The live setup already had substantial global configuration:

```text
~/.codex/AGENTS.md
~/.codex/config.toml
~/.codex/SECURITY_OPERATIONS.md
~/.codex/rules/default.rules
~/.codex/agents/code_mapper.toml
~/.codex/agents/code_reviewer.toml
~/.codex/agents/docs_researcher.toml
~/.codex/agents/frontend_verifier.toml
~/.codex/agents/security_auditor.toml
~/.codex/agents/test_verifier.toml
~/.codex/agents/release_verifier.toml
```

The config included:

- `model = "gpt-5.5"`
- `approval_policy = "on-request"`
- `sandbox_mode = "workspace-write"`
- feature tables for memories, hooks, and multi-agent behavior
- enabled MCPs for OpenAI docs, Context7, Playwright, Chrome DevTools, Serena,
  sequential thinking, memory, filesystem, and Supabase
- disabled connector presets for GitHub, Figma, Linear, Notion, Sentry, and
  Vercel
- project trust entries and hook state that should not be copied into a public
  starter repo

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
