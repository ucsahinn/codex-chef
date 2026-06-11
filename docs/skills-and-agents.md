# Skills, Plugins, And Specialist Agents

## Skills

Skills are reusable workflows. Codex loads their full instructions only when
the skill is selected, so descriptions should be precise and front-loaded.

Official reference: https://developers.openai.com/codex/skills

Routing rule:

- Explicit skill calls win when the user names `$skill` or a skill name.
- Implicit skill calls work through the skill `description`; keep trigger words
  at the front because Codex may shorten long skill lists in the initial
  context.
- Matching skill usage is mandatory for non-trivial tasks. Do not skip a
  relevant skill just because the main thread can do the same work manually.
- After a skill is selected, Codex should read the full `SKILL.md` and then only
  load the references, templates, scripts, or assets needed for the task.
- Use skills for reusable workflows. Use plugins when the workflow should be
  distributed with MCP configuration, app mappings, assets, or lifecycle hooks.

This repo includes:

- `catalog/skills.json`: curated skill references, categories, and verified
  public `package` plus `skill` install targets where available.
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

The installer only calls the Skills CLI for catalog entries with `install: true`,
a verified `package` value such as `owner/repo`, and a matching `skill` name. It
uses `npx skills add <package> --skill <skill> --yes --global`, which avoids
treating a plain skill name as a Git repository.

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

Routing rule:

- Subagents are explicit delegation. Codex should deliberately spawn them when
  the user asks for parallel/delegated work or the active global setup
  authorizes task-shape routing.
- For non-trivial work that maps to a registered specialist, use that specialist
  and summarize the result before relying on it.
- Use them for noisy, read-heavy, or evidence-heavy side work: exploration,
  current docs, review, UI verification, security audit, test/build evidence,
  and release readiness.
- Keep write-heavy implementation in the main thread unless the user explicitly
  asks to split write scopes. If multiple agents edit, assign non-overlapping
  files and reconcile before verification.
- Subagents inherit approvals, sandboxing, and connector auth. They must never
  be used to bypass user approval, credentials, destructive actions, or
  external-state controls.
