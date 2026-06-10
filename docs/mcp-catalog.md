# MCP Catalog

This starter keeps high-signal MCP servers documented and mostly safe by
default. See `catalog/mcp-servers.json` for machine-readable metadata.

Official Codex MCP reference:

https://developers.openai.com/codex/mcp

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
