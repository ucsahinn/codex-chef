# MCP Catalog

This starter keeps high-signal MCP servers documented and mostly safe by
default. See `catalog/mcp-servers.json` for machine-readable metadata.
`npm run check` validates that this catalog stays aligned with both Windows and
Unix Codex config templates.
The catalog also records `setupKind` and `setupHint`; installers and
`npm run codex:status` print those notes so required local tooling, OAuth,
filesystem-path, or environment-variable inputs are visible before enabling a
connector.

Status evidence is intentionally split:

- `cataloged`: present in `catalog/mcp-servers.json`.
- `installed config`: present in the installed or template Codex config.
- `live codex mcp list`: verified by `codex mcp list --json`.
- `/mcp session visible`: visible in the current Codex session.

Do not treat a cataloged connector as live until the live command or `/mcp`
confirms it.

Default-enabled means Codex Chef writes the server config and expects the
launcher to be present; it is not proof that the current machine already has a
live MCP session. Node/npx-backed defaults need Node and first-run network
access for pinned packages. Serena additionally needs `uvx`; if `uvx` is not
available on a fresh machine, disable Serena or treat its status note as a setup
prerequisite rather than a repo failure.

Official Codex MCP reference:

https://developers.openai.com/codex/mcp

Official MCP specification reference:

https://modelcontextprotocol.io/specification

MCP servers can expose tools, resources, and prompts. Treat each server as a
capability boundary: documentation servers are low-risk context providers, while
browser, filesystem, database, account, production, billing, or deployment
servers need stronger approval defaults and narrower tool exposure.

All npm-based MCP package specs are exact-version pinned in both
`catalog/mcp-servers.json` and `templates/codex/config.*.toml`. Floating
`@latest` specs and unversioned `npx -y` MCP packages are rejected by
`npm run check`. Git-based MCP launchers, such as Serena through `uvx --from`,
must include a full commit SHA and matching catalog `sourceRef`.

## Enabled By Default

| Server | Purpose | Startup prerequisite |
| --- | --- | --- |
| `openaiDeveloperDocs` | Official OpenAI developer docs | Streamable HTTP; no local launcher |
| `context7` | Current library/framework docs | Node/npx first-run package download |
| `sequential-thinking` | Structured decomposition | Node/npx first-run package download |
| `playwright` | Browser automation and UI verification | Node/npx plus local browser control |
| `chrome-devtools` | Chrome inspection and Lighthouse-style checks | Node/npx plus isolated Chrome/DevTools bridge |
| `serena` | Semantic code navigation | `uvx` plus pinned git source ref; disable if unavailable |
| `memory` | Local MCP memory graph | Node/npx; avoid storing secrets |

## Disabled Until Needed

| Server | Purpose | Setup required before enabling |
| --- | --- | --- |
| `filesystem` | Local filesystem access | Choose a deliberate local root path in config args. |
| `github` | GitHub issues, PRs, repositories | GitHub/Copilot OAuth account authorization. |
| `figma` | Figma design access | Figma account or workspace authorization. |
| `linear` | Linear issue/project access | Linear workspace authorization. |
| `notion` | Notion docs and databases | Notion workspace authorization. |
| `sentry` | Production error data | Sentry organization authorization. |
| `vercel` | Deploy/project management | Vercel account or team authorization. |
| `supabase` | Database inspection | Set `SUPABASE_DB_URL` outside the repo before enabling. |

## Opt-In Connector Recipes

For OAuth account connectors, first confirm the task needs private account
context, then change only that connector:

```toml
[mcp_servers.github]
enabled = true
default_tools_approval_mode = "prompt"
```

Rollback is `enabled = false` followed by a Codex restart.

For filesystem, replace the template path with the narrowest intended local
root before enabling:

```toml
[mcp_servers.filesystem]
enabled = true
args = ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem@2026.1.14", "C:\\Users\\you\\project"]
default_tools_approval_mode = "prompt"
```

For Supabase, set the database URL outside the repo and keep approval prompted:

```powershell
$env:SUPABASE_DB_URL = "<set outside the repo; do not commit>"
```

Then enable only for the task that needs database inspection. Disable it again
afterward unless it is a deliberate durable workflow.

## Rule

Documentation MCPs can be convenient defaults. Authenticated MCPs should remain
disabled until the task needs them and the user has approved the account scope.
When a task matches an enabled MCP server, use that server instead of guessing
from stale memory. If the matching server is disabled or unavailable, state the
reason and continue with the safest fallback.

Use the `mcp_integrator` specialist before changing connector state. It should
name the server, auth boundary, approval mode, tool allowlist or denylist,
startup/tool timeout, verification command, and rollback note before any config
change is made.

## Config Flags To Prefer

| Config field | Use |
| --- | --- |
| `enabled` | Disable authenticated, database, production, or broad filesystem servers until needed. |
| `default_tools_approval_mode` | Use `approve` for read-only docs; use `prompt` for browser, account, filesystem, database, production, or mutating tools. |
| `enabled_tools` / `disabled_tools` | Narrow a server to the specific tools a workflow needs. |
| `startup_timeout_sec` | Give stdio servers enough startup time without hanging Codex forever. |
| `tool_timeout_sec` | Bound slow browser, code-intelligence, docs, or external-account calls. |
| `bearer_token_env_var`, `env_vars`, `env_http_headers` | Pull credentials from environment variables instead of committed files. |
| `mcp_oauth_callback_port`, `mcp_oauth_callback_url` | Use only when an OAuth provider needs a fixed callback. |

After changing MCP config, restart Codex and verify active servers with `/mcp`
or `codex mcp` before relying on the tools.
