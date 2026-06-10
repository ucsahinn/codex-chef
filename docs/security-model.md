# Security Model

The setup is designed for high-leverage local work without weakening the core
Codex safety model.

## Defaults

- `sandbox_mode = "workspace-write"` keeps writes inside the workspace by
  default.
- `approval_policy = "on-request"` keeps escalations interactive.
- Network access stays disabled in the workspace-write sandbox unless a trusted
  profile or explicit approval changes that.
- Authenticated remote connectors are present as disabled examples.
- Global command rules are narrow and biased toward read-only discovery and
  local verification.

## MCP Boundaries

MCP servers can expose tools outside the shell sandbox. Treat them as powerful
connectors, not harmless documentation helpers.

Rules used in this starter:

- OpenAI Docs and Context7 are documentation-oriented defaults.
- Playwright and Chrome DevTools are local browser verification tools.
- GitHub, Figma, Linear, Notion, Sentry, Vercel, and Supabase are disabled until
  the user intentionally enables and authenticates them.
- Token values must come from environment variables, not repo files.
- External write-capable tools should use prompt approval.

Official reference: https://developers.openai.com/codex/mcp

## Rules

`templates/codex/rules/default.rules` allows fast read-only discovery and
project-native verification commands. It prompts for:

- destructive file operations
- broad shell wrappers
- dependency installation
- package publishing
- GitHub API operations
- git commit, push, reset, checkout, and restore
- ad-hoc `npx` package execution outside exact allowlisted helpers

Official reference: https://developers.openai.com/codex/rules

## Hooks

Hooks are useful for lifecycle checks, but they are not a primary security
boundary. Non-managed hooks should be reviewed and trusted by the user before
they run.

Official reference: https://developers.openai.com/codex/hooks

## Git Hygiene

Global Git guards are optional because they modify the user's Git defaults.
When installed, they:

- keep obvious local secret and build-output paths ignored
- run Gitleaks when available
- block staged secret-like files such as `.env`, `.pem`, `.key`, `.pfx`

The hook is intentionally conservative and does not delete files.

## What Must Never Be Included

- Codex sessions or memories
- `.env` files
- private keys or signing material
- auth files, cookies, token caches
- local database dumps
- installers and release archives
- generated screenshots, logs, reports, and build output

## External Account Actions

The repo can document secure GitHub, Supabase, Vercel, or Sentry setup, but it
must not perform account-level actions automatically. Enabling repository
protections, rotating keys, changing billing, deploying, or publishing requires
separate user approval and account context.
