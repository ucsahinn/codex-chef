# Research Notes

Date checked: 2026-06-14.

Facts below come from official docs, standards, mature public repos, research
papers, and practitioner issue signals. Practitioner feedback is used only as a
risk pattern, not as the source of truth.

## Sources

| Title | URL | Type | Confidence | Supports | Outdated risk |
| --- | --- | --- | --- | --- | --- |
| Codex Manual | https://developers.openai.com/codex/codex-manual.md | Official OpenAI docs | High | surfaces, config, AGENTS.md, skills, plugins, MCP, hooks, rules, approvals, sandboxing, auth, Windows, noninteractive use, subagents | Medium |
| Agent Skills - Codex | https://developers.openai.com/codex/skills | Official OpenAI docs | High | skill discovery, progressive disclosure, skill locations, plugin distribution | Medium |
| Agent Skills Specification | https://agentskills.io/specification | Open specification | High | `SKILL.md` fields, optional directories, metadata, validation | Medium |
| openai/skills | https://github.com/openai/skills | Official public repo | High | curated skill examples and installation expectations | Medium |
| Plugins - Codex | https://developers.openai.com/codex/plugins | Official OpenAI docs | High | plugin distribution for skills, apps, and MCP metadata | Medium |
| MCP Security Best Practices | https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices | Official MCP guidance | High | user consent, token/audience validation, SSRF, connector risk | Medium |
| GitHub Secret Scanning | https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning | Official GitHub docs | High | current-tree and history secret scanning | Low/Medium |
| GitHub Actions Secure Use | https://docs.github.com/en/actions/reference/security/secure-use | Official GitHub docs | High | least-privilege workflow tokens and secret handling | Low/Medium |
| GitHub README guidance | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes | Official GitHub docs | High | README content, help links, contribution expectations, relative links | Low |
| PowerShell ShouldProcess | https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-shouldprocess | Official Microsoft Learn | High | `-WhatIf`, `-Confirm`, safer mutating scripts | Low/Medium |
| OpenSSF Scorecard | https://github.com/ossf/scorecard | Mature public security project | Medium/High | public repo security-health gate ideas | Medium |
| ReAct | https://arxiv.org/abs/2210.03629 | Research paper | Medium/High | interleaved reasoning and tool use | Low/Medium |
| Reflexion | https://arxiv.org/abs/2303.11366 | Research paper | Medium/High | feedback, retry, and reflection loops | Medium |
| Lost in the Middle | https://arxiv.org/abs/2307.03172 | Research paper | Medium/High | progressive disclosure and context placement discipline | Medium |
| SWE-agent | https://arxiv.org/abs/2405.15793 | Research paper | Medium/High | agent-oriented repository navigation, edit, and test interfaces | Medium |
| openai/codex issues | https://github.com/openai/codex/issues | Practitioner issue tracker | Medium | Windows sandbox, PowerShell, MCP config, and AGENTS.md failure patterns | High |

## Source-Backed Decisions

- Keep `workspace-write`, `on-request`, and network-off defaults.
- Keep authenticated account, database, and broad filesystem MCP connectors
  disabled by default.
- Add `shell_environment_policy` so subprocesses do not inherit broad secret
  environment variables by default.
- Add installer dry-run behavior through PowerShell `-WhatIf` and Bash
  `--dry-run`.
- Preserve Windows-safe Skills CLI calls using `--agent codex`.
- Keep online skill validation separate from offline validation because it uses
  network and external package resolution.
- Add `catalog/skills-lock.json` and richer catalog metadata so third-party
  skill sources are reviewable.
- Treat MCP configuration as a trust boundary with explicit source, risk, auth,
  and approval metadata.
- Keep README concise and move deep troubleshooting, upgrade, and expected
  output details into focused docs.
- Use public issue tracker signals to improve troubleshooting, not to override
  official Codex documentation.
