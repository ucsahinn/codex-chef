# MCP Catalog

[English](mcp-catalog.md) | [Türkçe](mcp-catalog.tr.md)

MCP servers give Codex extra tools or live context: current documentation,
browser evidence, semantic code navigation, private account data, or database
access. That makes them useful, but it also means each server needs a clear
boundary.

Codex Chef knows about 16 MCP servers. Eight read-heavy helpers are enabled in
the starter config. Eight account, database, or broad-filesystem connectors
stay off until you deliberately need them.

> **Configured is not the same as live.** A server can exist in the template
> and still need a launcher, first-run package download, browser, authorization,
> or Codex restart. Check `codex mcp list` or `/mcp` before relying on it.

[Official Codex MCP guide](https://developers.openai.com/codex/mcp) ·
[MCP specification](https://modelcontextprotocol.io/specification) ·
[Machine-readable catalog](../catalog/mcp-servers.json)

## Ready In The Starter Config

| MCP | What I use it for | What it needs |
| --- | --- | --- |
| [`openaiDeveloperDocs`](https://developers.openai.com/mcp) | Current OpenAI developer documentation | Nothing extra |
| [`context7`](https://github.com/upstash/context7) | Current library and framework docs | Node/npx and first-run network access |
| [`sequential-thinking`](https://github.com/modelcontextprotocol/servers) | Breaking a complex task into clear steps | Node/npx and first-run network access |
| [`playwright`](https://github.com/microsoft/playwright-mcp) | Browser snapshots, screenshots, console and network evidence | Node/npx and local browser control |
| [`chrome-devtools`](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Chrome inspection and UI diagnostics | Node/npx and an isolated Chrome bridge |
| [`serena`](https://github.com/oraios/serena) | Symbol-aware code navigation in unfamiliar repositories | `uvx` and the pinned Serena source |
| [`memory`](https://github.com/modelcontextprotocol/servers) | Small, non-secret local memory graph | Node/npx; never store secrets |
| [`codebase-memory`](https://github.com/DeusData/codebase-memory-mcp) | Architecture, graph search, paths, and change impact | Node/npx; indexing and admin tools stay gated |

Browser navigation, memory writes, indexing, symbol edits, and similar actions
are not silently approved just because the server is enabled. The templates
allowlist reviewed read tools and keep the wider actions prompted or disabled.

If `uvx` is missing, Serena will not start. That is a local prerequisite, not a
reason to weaken the rest of the setup; install the prerequisite separately or
disable Serena until you need it.

## Off Until You Need Them

| MCP | What it can open | Why it starts off |
| --- | --- | --- |
| [`filesystem`](https://github.com/modelcontextprotocol/servers) | A local directory tree | The allowed root must be chosen deliberately |
| [`github`](https://docs.github.com/en/copilot) | Repository, issue, and PR context | Requires GitHub/Copilot authorization |
| [`figma`](https://help.figma.com) | Private design files and workspace context | Requires Figma authorization |
| [`linear`](https://linear.app/docs) | Private issues and projects | Requires Linear workspace authorization |
| [`notion`](https://developers.notion.com) | Private docs and databases | Requires Notion workspace authorization |
| [`sentry`](https://docs.sentry.io) | Production error and telemetry data | Requires Sentry organization authorization |
| [`vercel`](https://vercel.com/docs) | Project and deployment data | Requires Vercel account or team authorization |
| [`supabase`](https://github.com/modelcontextprotocol/servers) | A database connection | Needs a task-specific database URL and explicit approval |

Enable only the connector the task actually needs. For example:

```toml
[mcp_servers.github]
enabled = true
default_tools_approval_mode = "approve"
```

For filesystem access, replace the path with the narrowest workspace you mean
to expose:

```toml
[mcp_servers.filesystem]
enabled = true
args = ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem@2026.1.14", "."]
default_tools_approval_mode = "prompt"
```

`.` means the Codex process working directory. An explicit, narrower absolute
path is safer when the task should not see the whole current workspace.

Supabase credentials belong in the shell environment, never in this repository
or a committed launcher:

```powershell
$env:SUPABASE_DB_URL = "<set outside the repo; do not commit>"
```

## The Boundary I Keep

- Documentation and read-only reasoning helpers can be convenient defaults.
- Browser interaction, memory writes, code edits, and graph indexing remain
  prompted or narrowly allowlisted.
- Authenticated accounts, databases, production systems, and broad filesystem
  access stay disabled until the task needs them and the user approves.
- Credentials come from environment variables or the connector's own OAuth
  flow, never from committed config.
- After a config change, restart Codex and confirm the server with `/mcp` or
  `codex mcp list`.

For the bigger picture, see the [agent catalog](agents.md), [skill
catalog](skills.md), and [workflow surface map](workflow-surface-map.md).
