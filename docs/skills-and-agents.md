# Skills, Plugins, And Specialist Agents

## Skills

Skills are reusable workflows. Codex loads their full instructions only when
the skill is selected, so descriptions should be precise and front-loaded.

Official reference: https://developers.openai.com/codex/skills

This repo includes:

- `catalog/skills.json`: curated skill install targets and categories.
- `plugins/codex-enterprise-workflows/skills/enterprise-codex-operator`: a
  small local skill for maintaining this setup.

## Plugins

Plugins are the distribution package when a workflow should be shared beyond a
single local folder. They can bundle skills, MCP config, app integrations, and
lifecycle config.

Official reference: https://developers.openai.com/codex/plugins

This repo includes:

- `plugins/codex-enterprise-workflows/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

The installer registers the local marketplace. Restart Codex, then open
`/plugins` to inspect or install the plugin.

## Specialist Agents

This starter registers focused agents:

- `code_mapper`: read-only project mapping before broad changes.
- `docs_researcher`: current official docs and version-sensitive facts.
- `code_reviewer`: fresh-context correctness, regression, and test review.
- `frontend_verifier`: browser, screenshot, layout, and interaction checks.
- `security_auditor`: read-only security risk and abuse-path review.
- `test_verifier`: lint, typecheck, test, build, and smoke evidence.
- `release_verifier`: git hygiene, artifacts, secret scan, and publish gates.

Official reference: https://developers.openai.com/codex/subagents

Security note: subagents do not bypass approvals, sandboxing, or connector auth.
They are useful for focused side work, especially read-heavy exploration and
verification.
