# Security Model

The setup is designed for high-leverage local work without weakening the core
Codex safety model.

## Defaults

- `sandbox_mode = "workspace-write"` keeps writes inside the workspace by
  default.
- `approval_policy = "on-request"` keeps escalations interactive.
- Network access stays disabled in the workspace-write sandbox unless a trusted
  profile or explicit approval changes that.
- `shell_environment_policy` uses `inherit = "core"` and keeps default secret
  exclusions active so subprocesses do not inherit broad local token variables
  by default.
- Authenticated remote connectors are present as disabled examples.
- App/connector defaults keep destructive and open-world tools disabled unless
  a reviewed app-specific override changes them.
- Global command rules are narrow and biased toward read-only discovery and
  local verification.
- Deletion, cleanup, pruning, uninstall, overwrite, database drop/truncate, and
  other destructive operations require explicit user approval. Safe
  non-destructive work can continue while the destructive part waits.

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
- Read-only documentation MCPs may use `default_tools_approval_mode =
  "approve"`; browser, account, filesystem, database, production, and mutating
  tools should use `"prompt"`.
- Apps/connectors also have a separate `[apps._default]` gate:
  `destructive_enabled = false` and `open_world_enabled = false` are part of
  the reviewed templates.
- New MCP servers should prefer narrow config flags such as `enabled_tools`,
  `disabled_tools`, `startup_timeout_sec`, and `tool_timeout_sec` over broad
  prose-only instructions.
- `catalog/mcp-servers.json` records source URL, auth mode, risk, approval mode,
  and default-enable rationale for each starter connector.

Official reference: https://developers.openai.com/codex/mcp

## Skill Sources

Installable skills must be represented in both `catalog/skills.json` and
`catalog/skills-lock.json`. The lock file records the exact package/skill pair
and install command used by the installer. It is a reviewed source allowlist,
not an immutable upstream commit lock, because the current Skills CLI install
flow resolves owner/repo plus skill name. The default gate checks this offline;
`npm run verify:skills:online` performs network-backed resolution when a
maintainer is preparing publication or changing skill sources.

Default command approval rules do not auto-allow global skill installation.
Read-only Skills CLI discovery can be allowlisted, but `skills add` and broad
Skills CLI invocations prompt because they change the agent instruction supply
chain.

## Specialist Agent Boundaries

Specialist agents are tracked in `catalog/agents.json` and validated against
both Codex config templates and the role TOML files under
`templates/codex/agents/`.

Agent templates must not use `danger-full-access`,
`approval_policy = "never"`, or embedded token environment variable names.
Read-only specialists stay read-only, while verifier/release roles can use
`workspace-write` only for local evidence such as smoke-test output.

## Install Planning And Collision Policy

`manifests/install-plan.json` records the managed install surface, risk level,
backup expectation, required flags, and collision policy for each operation.
`node scripts/plan-install.mjs --all --json` prints this plan without invoking
installers or mutating global state.

The manifest intentionally keeps ECC-inspired improvements narrow: plan/apply
separation and collision metadata are allowed; broad external config, MCP,
hook, telemetry, or skill catalogs are not imported by default.
`scripts/validate-install-plan.mjs` also keeps destinations inside reviewed
Codex, Agents, and optional Git-guard targets so adjacent harness homes such as
`.claude`, `.cursor`, `.opencode`, `.zed`, and `.vscode` cannot drift into the
install surface silently.

## Repair Mode

`scripts/repair-install.mjs` is the repair/reconcile path for users who already
have a global Codex setup. Without `--apply`, it is read-only and reports
managed drift, missing config blocks, marketplace drift, extra managed plugin
files, non-curated skills, and duplicate skill names. With `--apply`, it backs
up and repairs only Codex Chef-managed files, merges missing config blocks, and
updates the Codex Chef marketplace entry while preserving unrelated marketplace
plugins.

Repair mode does not delete user skills. Extra global skills and duplicate
skill names are cleanup candidates because they can pressure Codex's initial
skill-list budget, but they may have been installed intentionally. Deleting
extra files inside the managed Codex Chef plugin directory requires the
explicit `--prune-managed-plugin-extras` flag and still stays scoped to that
single managed plugin target after backup.

## Rules

`templates/codex/rules/default.rules` allows fast read-only discovery and
project-native verification commands. It prompts for:

- destructive file operations
- deletion, cleanup, pruning, overwrite, and uninstall actions
- broad shell wrappers
- dependency installation
- global skill installation
- package publishing
- GitHub API operations
- git commit, push, reset, checkout, and restore
- ad-hoc `npx` package execution outside exact allowlisted helpers

Official reference: https://developers.openai.com/codex/rules

## Hooks

Hooks are useful for lifecycle checks, but they are not a primary security
boundary. Non-managed hooks should be reviewed and trusted by the user before
they run.

This starter does not import ECC-style lifecycle hook runtimes, automatic
`SessionStart` context injection, or `hookSpecificOutput.additionalContext`
patterns. `scripts/security-audit.mjs` fails if hook runtimes appear through
root hook folders, nested `hooks/` paths, `scripts/hooks`, `.cursor/hooks`,
`.kiro/hooks`, `.opencode` hook plugins, templates, or plugin bundles without
an explicit reviewed change.

Plugin manifests are also kept narrow by default. Repo validation rejects
plugin-bundled `hooks`, `mcpServers`, `apps`, `Write` capabilities, and
marketplace authentication modes other than `NONE`.

Official reference: https://developers.openai.com/codex/hooks

## Git Hygiene

Global Git guards are optional because they modify the user's Git defaults.
When installed, they:

- keep obvious local secret and build-output paths ignored
- run Gitleaks when available
- block staged secret-like files such as `.env`, `.pem`, `.key`, `.pfx`

The repository `.gitleaks.toml` extends the default Gitleaks rules and only
excludes local scratch, dependency, build, and cache directories such as `tmp/`,
`node_modules/`, `dist/`, and `.next/`.

The hook is intentionally conservative and does not delete files.

Security validation also fails if tracked source files appear under ignored
scratch, dependency, build, coverage, or release-output directories.

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
