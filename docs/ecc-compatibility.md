# ECC Compatibility And Import Policy

This repo can learn from ECC without becoming ECC. The starter stays
Codex-only, Windows-friendly, conservative, and safe to preview before writes.

Date checked: 2026-06-14.

## What ECC Does Well

ECC is a broad cross-harness agent operating system. It packages many skills,
agents, commands, hooks, MCP conventions, install profiles, target adapters,
tests, and release gates for Codex, Claude Code, Cursor, OpenCode, Gemini, Zed,
and other harnesses.

High-signal ideas worth adapting:

- manifest-driven install planning
- plan/apply separation
- target-specific install adapters
- install-state previews
- manifest and skill-surface validation
- MCP config drift checks
- plugin README honesty about runtime limits
- release gates that check manifests, personal paths, Unicode safety, and
  supply-chain indicators

## What This Starter Must Not Copy

Do not wholesale import ECC files, config, hooks, MCP catalogs, skills, agents,
or marketplace metadata.

Avoid these patterns:

- installer-triggered dependency installation such as implicit `npm install`
- global `core.hooksPath` changes outside the starter's explicit Git guard flow
- permissive profiles such as `approval_policy = "never"` or `profiles.yolo`
- broad active MCP connector catalogs
- account, database, browser, filesystem, or production connectors enabled by
  default
- hook telemetry that records raw prompts, tool inputs, diffs, or outputs
- ECC lifecycle hook runtimes, `SessionStart` prompt injection,
  `hookSpecificOutput.additionalContext`, or learned-skill auto-injection
- plugin manifests that bundle `hooks`, `mcpServers`, `apps`, write-capable
  interfaces, or marketplace authentication requirements
- plugin `.mcp.json` files with floating package specs or unpinned git-based
  MCP launchers
- install-plan destinations outside reviewed Codex, Agents, and optional
  Git-guard targets
- unversioned or `@latest` npm package specs in generated active config
- imported credential-shaped examples that fail secret scans

## Safe Adaptation Rules

Every ECC-inspired change must answer these questions before it is committed:

| Question | Required answer |
| --- | --- |
| What is being adopted? | A small pattern, not a wholesale folder copy. |
| Where does it write? | Repo-scoped by default; global writes require explicit install flags. |
| What can it collide with? | Existing `~/.codex`, `~/.agents`, Git config, hooks, MCP, skills, or plugin marketplace state. |
| How is it previewed? | `npm run plan:install`, PowerShell `-WhatIf`, Bash `--dry-run`, or another no-write command. |
| How is it backed up? | Managed global file writes back up before replacement unless explicitly disabled. |
| How is it verified? | `npm run check`, `npm run verify:skills:online` when skill sources change, and Gitleaks before publication. |

## Current ECC-Informed Adaptations

This starter adopts the safe subset:

- `manifests/install-plan.json` records the Codex-only install surface,
  collision policy, risk, backup behavior, and explicit flags.
- `scripts/plan-install.mjs` prints a no-write install plan in human or JSON
  form.
- `scripts/validate-install-plan.mjs` validates the manifest without adding a
  runtime dependency.
- `schemas/install-state-preview.schema.json` and
  `scripts/validate-install-state-preview.mjs` give the generated JSON preview
  a stable contract without importing ECC's broader install-state lifecycle.
- `scripts/security-audit.mjs` rejects implicit npm install in installer
  scripts, permissive Codex profiles, `approval_policy = "never"`, unpinned
  npm MCP package specs, lifecycle hook runtimes, and automatic
  additional-context injection patterns.

## Official Codex Alignment

The policy follows current official Codex guidance:

- `AGENTS.md` is durable guidance with global, repo, and nested discovery
  order. External repos should own their repo-local instructions.
- Skills use progressive disclosure. Keep descriptions short and scoped.
- Plugins distribute reusable skills, apps, MCP servers, assets, and hooks, but
  a local plugin is not the same as official OpenAI publication.
- MCP servers belong in `config.toml` with `enabled`, approval modes, env-backed
  auth, timeouts, and tool allow/deny lists.
- Hooks are lifecycle guardrails and require trust review; they are not the
  primary security boundary.
- Legacy `sandbox_mode` settings and beta permission profiles should not be
  mixed in one template.

Sources:

- ECC repository: https://github.com/affaan-m/ECC
- Official Codex manual: https://developers.openai.com/codex/codex-manual.md
- Agent Skills: https://developers.openai.com/codex/skills
- Build plugins: https://developers.openai.com/codex/plugins/build
- MCP: https://developers.openai.com/codex/mcp
- Hooks: https://developers.openai.com/codex/hooks
- Permissions: https://developers.openai.com/codex/permissions
