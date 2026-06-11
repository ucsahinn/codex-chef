# MCP Catalog

This starter keeps high-signal MCP servers documented and mostly safe by
default. See `catalog/mcp-servers.json` for machine-readable metadata.

Official Codex MCP reference:

https://developers.openai.com/codex/mcp

Official MCP specification reference:

https://modelcontextprotocol.io/specification

MCP servers can expose tools, resources, and prompts. Treat each server as a
capability boundary: documentation servers are low-risk context providers, while
browser, filesystem, database, account, production, billing, or deployment
servers need stronger approval defaults and narrower tool exposure.

## Enabled By Default

| Server | Purpose | Notes |
| --- | --- | --- |
| `openaiDeveloperDocs` | Official OpenAI developer docs | Streamable HTTP, documentation-oriented |
| `context7` | Current library/framework docs | Stdio through `npx`; useful for version-sensitive APIs |
| `sequential-thinking` | Structured decomposition | Local stdio helper |
| `playwright` | Browser automation and UI verification | Local browser control |
| `chrome-devtools` | Chrome inspection and Lighthouse-style checks | Runs isolated and redacts network headers |
| `serena` | Semantic code navigation | Uses `uvx`; can be disabled if unavailable |
| `memory` | Local MCP memory graph | Optional; avoid storing secrets |

## Disabled Until Needed

| Server | Purpose | Why disabled |
| --- | --- | --- |
| `github` | GitHub issues, PRs, repositories | External account access |
| `figma` | Figma design access | Requires user/workspace auth |
| `linear` | Linear issue/project access | External workspace actions |
| `notion` | Notion docs and databases | Private workspace data |
| `sentry` | Production error data | Sensitive operational data |
| `vercel` | Deploy/project management | Production and billing-adjacent actions |
| `supabase` | Database inspection | Database credentials and data access |

## Rule

Documentation MCPs can be convenient defaults. Authenticated MCPs should remain
disabled until the task needs them and the user has approved the account scope.
When a task matches an enabled MCP server, use that server instead of guessing
from stale memory. If the matching server is disabled or unavailable, state the
reason and continue with the safest fallback.

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
