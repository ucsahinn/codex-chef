# Codex Capability Map

This page explains how the starter turns Codex into a safer operating setup
after installation. It is not another install guide. It maps each Codex surface
to the job it should handle, the guardrail that keeps it safe, and the local
checks that prove the starter still matches that model.

Official references:

- Codex customization order: https://developers.openai.com/codex/concepts/customization
- Subagents: https://developers.openai.com/codex/subagents
- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins/build
- MCP and connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- MCP specification: https://modelcontextprotocol.io/specification

## Capability Layers

| Layer | What it is for | Starter default | Verification |
| --- | --- | --- | --- |
| Prompt/thread context | One-off task constraints | User prompt stays highest-signal for current task | Human review |
| `AGENTS.md` | Durable repo/global working agreements | Installed as reviewed global guidance with repo-local precedence | `npm run validate` |
| `config.toml` | Models, sandbox, approvals, MCP, features, profiles | Conservative workspace-write sandbox and on-request approvals | `npm run validate:mcp` |
| Rules | Narrow command approval defaults | Verification commands only; destructive/publish actions stay gated | `npm run validate:content` |
| Skills | Reusable workflows with progressive disclosure | Curated installable allowlist plus local enterprise operator and offline diagram skills | `npm run verify:skills` |
| Plugins | Shareable packages for skills and future bundled surfaces | One local plugin, no default hooks/MCP/apps | `npm run validate` |
| MCP/connectors | Live docs, browser, code navigation, external systems | Docs/code/browser helpers enabled; authenticated connectors disabled | `npm run validate:mcp` |
| Subagents | Delegated evidence-heavy specialist work | Twenty reviewed specialist agents with sandboxed role files | `npm run validate:agents` |
| Doctor/status | No-write health and drift summary | Repo-only by default; optional global existence checks | `npm run codex:doctor` |

## Specialist Agent Set

The starter now ships twenty specialist agents:

- `code_mapper`: read-only repository mapping before broad changes.
- `docs_researcher`: official/current documentation and version-sensitive facts.
- `context_architect`: placement of prompt, AGENTS.md, skill, plugin, MCP, hook,
  memory, rule, and config guidance.
- `prompt_architect`: reliable briefs, success criteria, instruction contracts,
  and reusable prompt systems.
- `mcp_integrator`: least-privilege MCP and connector planning.
- `product_strategist`: product framing, forcing questions, scope decisions,
  and smallest-useful-version alternatives.
- `engineering_planner`: architecture, data flow, edge cases, diagrams, and
  test strategy before broad changes.
- `design_reviewer`: UX quality, accessibility, design-system fit, and
  AI-slop detection.
- `devex_auditor`: onboarding friction, docs clarity, first-run flows, and
  time-to-hello-world checks.
- `root_cause_debugger`: reproduction, data-flow tracing, and hypothesis
  testing before fixes.
- `qa_lead`: end-to-end workflow testing, regression coverage, and
  re-verification plans.
- `performance_auditor`: page speed, Core Web Vitals, resource budgets, traces,
  and post-change regression evidence.
- `docs_author`: Diataxis coverage, stale-doc detection, release docs, and
  missing-guide generation.
- `spec_author`: scoped executable specs with non-goals, evidence, edge cases,
  and quality gates.
- `code_reviewer`: fresh-context correctness, regression, security, and test review.
- `frontend_verifier`: browser, screenshot, responsive layout, and console evidence.
- `security_auditor`: read-only auth, secrets, permissions, data, and abuse-path review.
- `test_verifier`: lint, typecheck, test, build, smoke, and CI evidence.
- `release_verifier`: git hygiene, artifacts, secret scans, changelog/version, and publish gates.
- `codex_doctor`: starter health, catalog drift, install-plan, docs, and MCP checks.

The agent catalog is intentionally smaller than broad public marketplaces. High
star repos such as ECC and wshobson/agents show that large agent/skill catalogs
work best when they are cataloged, isolated, and composable. This starter adopts
that catalog discipline, but keeps Codex-only defaults and does not import broad
cross-harness fleets, hidden hooks, automatic memory injection, or authenticated
connector defaults.

## Doctor Commands

Run a no-write local health summary:

```bash
npm run codex:doctor
```

Machine-readable output:

```bash
node scripts/codex-doctor.mjs --json --redact-paths
```

No-write existence checks for global targets:

```bash
node scripts/codex-doctor.mjs --include-global --redact-paths
```

The global check only reports whether expected files exist. It does not read
their contents, install skills, change Git config, or write to `~/.codex` or
`~/.agents`.

## MCP And Connector Policy

OpenAI's connector guidance and the MCP specification both treat MCP servers as
capability boundaries. This starter follows four rules:

- Prefer official or high-signal servers.
- Pin local package versions or git source refs.
- Keep account, filesystem, database, production, and billing-adjacent
  connectors disabled until a task needs them.
- Use prompt-based approval and narrow tool exposure for anything that can
  access private data or take action.

Use `mcp_integrator` when adding a new connector. It should return the proposed
server, risk, auth boundary, approval mode, tool allowlist, verification steps,
and rollback notes before any config change.

## Skill And Plugin Policy

Official plugin guidance says to start with local skills while iterating and use
plugins when sharing reusable workflows or bundling MCP, apps, hooks, or assets.
This repo follows that split:

- Curated public skills stay in `catalog/skills.json`.
- Installable skills must have reviewed `package`, `skill`, `sourceUrl`,
  `license`, `risk`, and `lastChecked` fields.
- The local plugin exposes the enterprise operator skill and a zero-network
  offline diagram triplet skill by default.
- Plugin hooks, MCP servers, and apps remain absent from the default manifest
  until separately reviewed.

Run the local diagram renderer directly when you need `/diagram`-style output:

```bash
npm run diagram:triplet -- --mermaid path/to/diagram.mmd --out-dir artifacts/diagrams --name diagram-name
```

It emits `.mmd`, `.excalidraw`, `.svg`, `.png`, and `.md` files without network
or package installation.

## What This Does Not Import

The starter deliberately avoids these patterns unless a future change reviews
and documents them:

- Cross-harness global config sync.
- Broad skill marketplace imports.
- Enabled-by-default authenticated connectors.
- Plugin-bundled lifecycle hooks.
- Automatic memory/session injection.
- Destructive cleanup, push, release, publish, or deploy automation.

## Verification

Use the focused gates first:

```bash
npm run validate:agents
npm run validate:mcp
npm run validate:doctor
npm run validate:diagram
npm run codex:doctor
```

Before public release:

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Online skill-source verification remains separate:

```bash
npm run verify:skills:online
```
