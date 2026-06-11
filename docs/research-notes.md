# Research Notes

Research was based on:

1. Current local Codex configuration evidence.
2. The official Codex manual fetched on 2026-06-11.
3. The official MCP specification queried through Context7 on 2026-06-11.
4. The existing local global Codex security checklist and specialist agents.

## Official Topics Used

- CLI command reference and global flags.
- AGENTS.md discovery and precedence.
- Skill structure, invocation, and distribution.
- MCP transport and configuration.
- MCP server capabilities: tools, resources, and prompts.
- Rules and command approval behavior.
- Hooks, trust review, and supported events.
- Permissions and sandbox profiles.
- Plugins and marketplace distribution.
- Subagents and their explicit-trigger tradeoffs.
- Windows native sandbox and WSL guidance.

## Core Conclusions

- `AGENTS.md` is the right place for durable human working agreements.
- `config.toml` is the right place for model, sandbox, approval, feature, MCP,
  profile, and agent settings.
- Skills are the right shape for reusable workflows.
- Plugins are the safer shareable distribution unit when bundling skills,
  MCP metadata, or app integrations.
- MCP servers should be treated as tool boundaries, especially when they can
  access private accounts or production data.
- MCP configuration should use precise flags such as `enabled`,
  `default_tools_approval_mode`, tool allow/deny lists, startup/tool timeouts,
  and environment-backed auth fields instead of relying only on prose.
- Subagents are powerful for delegated work, but official Codex behavior still
  treats spawning as an explicit delegation step.
- Rules should stay narrow and should not turn dangerous actions into silent
  defaults.
- Hooks are useful guardrails, but they still need trust review and should not
  be the only security control.
- Native Windows sandboxing is a first-class path; WSL2 is best when the
  workflow is Linux-native.
