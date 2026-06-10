# Codex Surfaces

Use the smallest durable surface that matches the scope.

| Need | Surface | Why |
| --- | --- | --- |
| One-off constraint | Current prompt | Lowest persistence and safest scope |
| Repository conventions | `AGENTS.md` | Loaded automatically by scope and directory |
| User-wide defaults | `~/.codex/AGENTS.md` | Applies across repositories |
| Models, sandbox, MCP, profiles | `config.toml` | Machine-readable Codex runtime config |
| Reusable workflow | Skill | Triggered explicitly or by task description |
| Shareable package | Plugin | Bundles skills, MCP config, apps, and lifecycle config |
| Live external data or actions | MCP or app connector | Tool/context boundary with auth and approvals |
| Command approval exception | Rule | Narrow sandbox escalation policy |
| Lifecycle automation | Hook | Reviewed local automation around events |
| Parallel specialist work | Subagent | Useful for noisy read-heavy work or focused verification |
| Temporary override | `AGENTS.override.md` | Local short-lived override; remove when done |

Official references:

- AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- Skills: https://developers.openai.com/codex/skills
- MCP: https://developers.openai.com/codex/mcp
- Rules: https://developers.openai.com/codex/rules
- Hooks: https://developers.openai.com/codex/hooks
- Plugins: https://developers.openai.com/codex/plugins
- Subagents: https://developers.openai.com/codex/subagents

## Starter Opinion

This starter uses:

- `AGENTS.md` for behavior and routing.
- `config.toml` for feature flags, MCPs, agents, and sandbox defaults.
- Skills for repeatable workflows.
- A local plugin package for shareable workflow distribution.
- MCPs for docs, browser verification, and optional authenticated services.
- Rules for narrow approval exceptions.
- Hooks only as optional lifecycle guardrails.
