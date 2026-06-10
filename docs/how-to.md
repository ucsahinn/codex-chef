# How To Run The Setup

This starter is designed for a Codex user who wants a ready operating model,
not just a copied config file. After installation, Codex should have durable
instructions, safe MCP defaults, curated skills, specialist agents, profiles,
rules, a local plugin, and Git hygiene guardrails.

## One-Shot Setup

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Bash or WSL:

```bash
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Use the narrower flags only when you intentionally want a partial setup:

- `-InstallSkills` / `--install-skills`
- `-InstallGitGuards` / `--install-git-guards`

## First Verification

Restart Codex after installing, then run:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Inside Codex, inspect:

```text
/mcp
/skills
/plugins
/hooks
```

## Operating Model

Use the setup as a specialist team:

1. Start with `code_mapper` for unfamiliar repositories, large changes, or
   architecture questions.
2. Use `docs_researcher` for current Codex, API, library, framework, or cloud
   behavior.
3. Keep implementation in the main thread so decisions and edits stay coherent.
4. Use `test_verifier` for lint, typecheck, test, build, smoke, or failing CI.
5. Use `frontend_verifier` for real-browser UI checks, screenshots, responsive
   layout, console errors, and interaction states.
6. Use `security_auditor` for auth, secrets, permissions, data access, API
   routes, cryptography, or abuse paths.
7. Use `release_verifier` before push, tag, release, package, deploy, or public
   publication.

Official Codex docs describe subagents as explicitly triggered parallel
workflows. This starter gives you the agent files and routing language for that
workflow, but it keeps approvals, sandboxing, and connector auth intact.

## MCP Defaults

Enabled by default:

- OpenAI Docs MCP for official OpenAI documentation.
- Context7 for current library and framework docs.
- Sequential Thinking for structured decomposition.
- Playwright and Chrome DevTools for browser verification.
- Serena for semantic code navigation.
- Memory for local non-secret recall.

Disabled until needed:

- GitHub
- Figma
- Linear
- Notion
- Sentry
- Vercel
- Supabase
- Filesystem

Enable authenticated or data-bearing connectors only for a concrete task and
only after approving the account scope.

## Profiles

The installer copies profile configs into `~/.codex`:

- `development.config.toml`: normal implementation profile.
- `review.config.toml`: read-only, high-reasoning review profile.
- `ci.config.toml`: read-only verification profile with hooks disabled.

Use profiles when a task needs a different safety posture without rewriting the
main config.

## Common Prompts

Repository audit:

```text
Use code_mapper and test_verifier. Map this repository, identify the highest-risk
areas, run the narrowest meaningful checks, and report blockers with file
references before editing.
```

UI/UX polish without adding content:

```text
Act as a senior UX/UI specialist. Do not add new marketing sections or unrelated
copy. Improve the existing interface so users can understand the offer faster,
contact the business with fewer steps, and use the site comfortably on mobile.
Keep the existing content and brand intent, but make hierarchy, spacing,
responsive behavior, performance, accessibility, and visual polish feel
professional. Verify mobile width, text overflow, focus states, loading/error
states, and the primary contact flow before calling it done.
```

Release readiness:

```text
Use release_verifier and git-hygiene. Inspect git status, validate docs/scripts,
run secret scanning when available, check public-readiness files, and summarize
whether this is safe to push or publish. Do not push unless I explicitly approve.
```

## Safety Rules

- Do not store tokens, auth files, sessions, memories, cookies, private keys, or
  machine-specific state in the repository.
- Keep sandboxing enabled.
- Keep approval prompts interactive.
- Keep authenticated remote connectors disabled by default.
- Treat Gitleaks findings as real until reviewed.
- Commit, push, publish, deploy, rotate secrets, and destructive file operations
  still need explicit user approval.
