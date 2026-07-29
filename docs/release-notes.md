# Release Notes

This page follows the release users should install now. Older engineering history remains available in [CHANGELOG.md](../CHANGELOG.md), so the public release guide stays useful instead of becoming an ever-growing archive.

## v0.5.59 - 2026-07-29

Codex Chef 0.5.59 keeps five or six concurrent Codex sessions practical by
reducing eager local MCP startup without removing capabilities. It also adds an
ownership-aware audit and a fail-closed cleanup path for stale MCP trees.

### What Changed

- Changes the balanced base to three complementary MCPs:
  `openaiDeveloperDocs`, `context7`, and `serena`. The five overlapping local
  stdio helpers remain configured but disabled.
- Adds `full.config.toml` for one capability-heavy primary session and
  `multi-session.config.toml` for low-process secondary sessions. Agents,
  skills, remote OpenAI docs, built-in memories, hooks, and apps remain
  available.
- Replaces flat Node/Python counts with a schema-v2 process audit that separates
  active Codex owners, logical MCP instances, helper trees, grace-period trees,
  old unowned candidates, and unrelated runtimes.
- Adds preview-first stale cleanup. Immediately before termination it rechecks
  the exact PID, creation time, MCP signature, and absence of an active Codex
  owner; missing metadata and PID reuse fail closed.
- Adds one trust-gated plugin `SessionEnd` hook. It captures only the ending
  Codex owner's MCP descendants, waits 45 seconds, and stops exact survivors
  only after the owner chain disappears.
- Adds focused regression tests, security allowlists, installer/package checks,
  ADR-003, and complete English/Turkish operator guidance for the new boundary.

### Install Or Upgrade

First installation:

```bash
npm run chef -- --install
npm run chef -- --install --apply
```

Existing installation:

```bash
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
```

Use the state-aware status screens before and after installation:

```bash
npm run chef -- --skills
npm run chef -- --mcp
npm run chef -- --processes --no-log
npm run chef -- --status --details
```

Then restart Codex, inspect and trust the exact process-hygiene source in
`/hooks`, and verify the installed runtime:

```bash
npm run verify:install:runtime
npm run codex:status
```

For concurrent work, keep one normal or `full` primary session and start
secondary windows with:

```bash
codex --profile multi-session
```

### Compatibility

- Node.js 18 or newer
- Windows PowerShell, macOS, Linux, and WSL
- Existing user-owned skills, MCPs, profile choices, custom config tables, and unrelated plugin files remain outside normal prune behavior
