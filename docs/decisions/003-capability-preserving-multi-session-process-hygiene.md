# ADR-003: Preserve MCP capability while bounding multi-session process cost

## Status

Accepted

## Date

2026-07-29

## Context

Codex starts local stdio MCP servers per session. One logical server launched
through `npx` or `uvx` can create several Node, Python, shell, and browser helper
processes. When five or six Codex windows each eagerly start all seven bundled
local MCP servers, process count and working-set cost multiply by session even
when most windows do not use those tools.

A name-only process count cannot distinguish an active Codex-owned MCP tree from
an old unowned tree or an unrelated development runtime. Killing every
`node.exe` or `python.exe` process would risk user work. Lowering
`agents.max_threads` would not solve per-window MCP startup and would remove
useful multi-window capacity.

Codex supports profile overlays that can set an MCP server's `enabled` field
without removing its definition. Plugin hooks also have an explicit trust
review and can receive `SessionEnd`, which runs on normal session close but not
for subagents.

## Decision

Codex Chef separates capability definition from eager startup:

- The balanced base enables remote `openaiDeveloperDocs` and the complementary
  local `context7` and `serena` servers.
- The other five local stdio MCP definitions remain present but disabled.
- `full.config.toml` enables every bundled local stdio MCP for one primary
  capability-heavy session.
- `multi-session.config.toml` disables all local stdio MCPs for secondary
  concurrent sessions while preserving agents, skills, remote OpenAI docs,
  built-in memories, hooks, and apps.
- `agents.max_threads = 10` remains a capacity ceiling; conditional delegation
  remains the ordinary fan-out control.

Process cleanup uses ownership evidence:

- The CLI process audit schema is version 2 and reports Codex sessions, logical
  MCP instances, helper processes, active ownership, grace-period trees, old
  unowned candidates, and unrelated runtimes separately.
- Missing process metadata fails closed. Flat name counts may be shown as
  attention evidence but never create cleanup candidates.
- Manual cleanup is preview-first and requires the exact command
  `--processes --cleanup-stale --apply`.
- Active Codex descendants are excluded. Candidate identity and creation time
  are checked again before a tree is stopped.
- The bundled plugin declares one reviewed `SessionEnd` hook. It snapshots only
  MCP descendants of the exact ending Codex owner, waits 45 seconds, and stops
  only exact survivors after the owner chain disappears. PID reuse, a live
  owner, missing metadata, or a recent tree fails closed.
- Hook trust is not bypassed. The user reviews and trusts the exact source/hash
  through `/hooks`.

## Alternatives Considered

### Keep all local MCP servers enabled in every session

Rejected because process and memory cost scales with concurrent sessions rather
than actual tool use.

### Remove overlapping MCP definitions

Rejected because it saves startup cost by deleting useful capabilities. Profile
overlays retain those capabilities without eager startup.

### Kill processes by executable name

Rejected because Node and Python are shared runtimes. Name-based cleanup cannot
prove Codex ownership and can destroy unrelated user work.

### Stop every descendant immediately on SessionEnd

Rejected because close events and process teardown can race. The grace period,
owner-chain check, and exact PID/creation-time snapshot provide a safer
fail-closed boundary.

### Reduce the global agent thread ceiling

Rejected because it does not address per-session MCP startup and unnecessarily
constrains users who intentionally run several Codex windows.

## Consequences

- Ordinary new sessions start fewer local helper trees while all bundled MCP
  capabilities remain one profile away.
- Operators need to choose which session is primary when they want `full`.
- Existing sessions are unaffected until restarted.
- Plugin refresh requires a new session plus one explicit `/hooks` trust review
  when the hook source hash changes.
- Validators and tests must keep balanced/full/multi-session profile parity,
  the exact hook contract, schema-v2 output, grace behavior, active-owner
  exclusion, and PID-reuse failure closed.
- Future changes that broaden cleanup targets, remove exact ownership checks,
  inject session context, or bypass hook trust require a superseding ADR.
