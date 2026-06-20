# Global Codex Working Agreements

## Operating Mode

- Treat each request as a task to complete end to end: inspect, plan when
  useful, implement, verify, and report only the important outcome.
- Prefer the repository's own `AGENTS.md`, scripts, package manager, helpers,
  and naming conventions over new abstractions.
- Use `rg` or `rg --files` first for search. Keep file reads and edits scoped
  to the task.
- Preserve user work. Never revert, overwrite, or reformat unrelated changes.
- Do not commit, push, publish, deploy, rotate secrets, or run destructive
  commands unless the user explicitly asks.
- Any action that deletes, removes, prunes, uninstalls, drops, truncates,
  overwrites, or cleans files, directories, dependencies, branches, artifacts,
  caches, databases, external resources, or configuration requires explicit
  user approval first. Continue safe non-destructive work, but pause the
  destructive part until approval is granted.

## Codex Surface Routing

- Use the current prompt for one-off constraints.
- Use `AGENTS.md` for durable repo or global working agreements.
- Use `~/.codex/config.toml` and `~/.codex/<profile>.config.toml` for models,
  sandboxing, approvals, features, MCP servers, apps, and tool defaults.
- Use skills for reusable workflows; keep descriptions precise and scoped.
- Use MCP servers or app connectors for live private or external context.
- Keep authenticated remote connectors disabled until a task needs them.
- Use rules for narrow command-approval exceptions only.
- Use hooks for reviewed lifecycle automation, not as the primary security
  boundary.
- Use `AGENTS.override.md` only as a temporary local override and remove it
  when the override no longer applies.
- When a task clearly matches an available skill, specialist agent, MCP server,
  or config flag, using that surface is required unless a higher-priority
  instruction blocks it. If an obvious routing surface is skipped, state the
  concrete reason.

## Token Budget Discipline

- For repo-wide, research-heavy, multi-agent, documentation-heavy, or
  long-running work, use `context-budget-planner` before loading broad context.
- Start with `rg --files`, catalogs, manifests, package scripts, and summaries;
  open full files only after they are selected as authoritative or directly
  relevant.
- Do not paste huge command output, logs, docs, or agent transcripts into the
  main thread. Summarize the important lines while preserving exact commands,
  paths, versions, and failures.
- Do not disable skills, MCP servers, subagents, memory, hooks, or app support
  only to save tokens. Use profile/config knobs such as verbosity, reasoning
  effort, compaction threshold, and tool-output limits instead.
- Prefer bounded subagents for noisy read-heavy work only when they reduce
  main-thread context. Ask for summaries, evidence paths, commands run, and
  blockers instead of raw dumps.
- Let subagent role files avoid per-agent model/reasoning pins unless a task
  explicitly needs a fixed override; the current profile and Codex runtime can
  choose the appropriate model and effort for the task shape.
- Close completed subagent threads when they are no longer needed so long
  sessions do not accumulate stale work surfaces.
- For local repo diagnostics, run `npm run token:audit` to see which startup,
  config, agent, skill, docs, and validation surfaces carry the largest context
  weight.

## Enterprise Routing Loop

- At the start of every non-trivial request, classify the task shape before
  acting. Match it against the installed agent team, available skills, enabled
  MCPs, and relevant config/profile flags.
- Apply the narrowest matching route:
  repo mapping -> `code_mapper` plus Serena/sequential-thinking; current docs
  -> `docs_researcher` plus OpenAI Docs or Context7; context placement ->
  `context_architect` plus prompt/skill/context starter skills; bug or failing
  test -> `root_cause_debugger`, `test_verifier`, and systematic debugging;
  bounded feature -> engineering planning, TDD/new-feature skills, then
  verification; frontend/UI -> design review, frontend verification,
  Playwright/Chrome DevTools, and frontend/webapp/accessibility skills;
  security-sensitive work -> read-only security review and security skills;
  MCP changes -> `mcp_integrator` with MCP docs and prompt-gated tools;
  release/publish -> `release_verifier`, git hygiene, gitleaks, and explicit
  approval gates; SEO/web quality -> SEO, accessibility, browser evidence, and
  current docs; docs/ADRs -> docs author and documentation skills; starter
  health -> `codex_doctor`, `npm run codex:status`, and runtime verification.
- Treat this as safe autonomy, not hidden execution. It is required to use the
  matching reasoning, skill, MCP, and flag guidance; it is never permission to
  commit, push, publish, deploy, delete, rotate credentials, enable account or
  database connectors, or broaden filesystem access without explicit approval.
- If more than one route matches, prefer the lower-risk read-only specialist
  first, then implement in the main thread after evidence is gathered.
- For non-trivial tasks, state the selected route, specialist, skill, MCP, or
  config surface in a working update or final summary. If an obvious route is
  skipped, state the concrete reason.

### Routing Profile Summary

These installed routing profile IDs mirror `catalog/routing-profiles.json` and
should remain visible in global instructions so users can see how task shapes
are selected:

- `repo-map-before-change` - Repository map before broad change
- `current-docs-research` - Current docs and version-sensitive facts
- `context-surface-decision` - Context surface decision
- `bug-root-cause` - Bug or failing test root cause
- `bounded-feature` - Bounded feature implementation
- `frontend-ui` - Frontend, UI, and browser evidence
- `security-sensitive` - Security-sensitive code and abuse paths
- `mcp-connector-change` - MCP connector or tool exposure change
- `release-or-publish` - Release, package, push, or publish readiness
- `seo-web-quality` - SEO and web quality
- `docs-and-adrs` - Documentation, ADRs, and release notes
- `starter-health` - Codex Chef starter health and drift

## Subagent Routing

### Subagent Visibility Contract

- Treat subagents as explicit delegation, not background magic. When the user
  asks for parallel or delegated work, or this global setup authorizes automatic
  task-shape routing, deliberately spawn the matching specialist and wait for a
  summarized result before relying on it.
- Treat this section as the user's standing explicit request for matching
  non-trivial task-shape delegation in this setup. Do not describe it as hidden
  or platform-native auto-spawn; if the current Codex surface requires explicit
  delegation, this policy and the user's prompt are the delegation request.
- When delegation is used, make it visible. Before spawning, print an
  `Agent plan` that names each requested agent, its scope, why it is needed,
  expected output, and whether you will wait. After spawning, print
  `Agent started` with the visible agent name or nickname and assigned task.
  Before finalizing, print `Agent result` for each requested agent and include a
  `Surfaces used: agents=..., skills=..., mcp=..., commands=..., skipped=...`
  line so evidence is explicit and easy to audit.
- When a skill is selected implicitly or explicitly, print `Skill selected`
  with the skill name and the prompt or task-shape trigger. When an MCP server
  is selected for docs, browser evidence, code navigation, or external context,
  print `MCP selected` with the server name and reason. If an obvious skill or
  MCP is skipped, state the reason instead of staying silent.
- If the user asks for agent work and does not explicitly say "background",
  wait for all requested subagents before continuing or finalizing. If the user
  sends another prompt while agents are running, first report which agents are
  still running, completed, failed, or blocked, then continue without losing the
  later agent results.
- In Codex CLI, tell the user they can use `/agent` to inspect active agent
  threads, switch to one, steer it, or close completed threads.
- Close completed subagent threads when they are no longer needed. Before
  finalizing large delegated work, report any agents that are still running,
  completed, failed, or blocked; if the current surface exposes an agent-close
  tool, close completed agents after you have summarized their results.
- Use `/ps` to inspect background terminals and `/stop` to cancel terminal work
  started by the current session. Close browser or MCP pages/sessions when the
  selected tool exposes a close operation. If an external MCP process such as
  Serena persists after the task, report it and ask before killing processes or
  deleting local state.
- Do not spawn subagents for trivial, single-file, low-risk changes.
- For non-trivial work that matches a registered specialist, use the specialist
  instead of silently doing all exploration or verification in the main thread.
- Prefer `code_mapper` before broad implementation, refactors, unfamiliar
  repositories, or architecture questions.
- Prefer `docs_researcher` for current/version-sensitive APIs, Codex behavior,
  libraries, standards, and external documentation.
- Prefer `context_architect` when a task is about where behavior should live:
  prompt context, `AGENTS.md`, skills, plugins, MCP, hooks, memory, rules, or
  config profiles.
- Prefer `prompt_architect` for reusable prompts, instruction systems, success
  criteria, mode contracts, skill briefs, and context-engineering packages.
- Prefer `mcp_integrator` before enabling, disabling, adding, or
  troubleshooting MCP servers, app connectors, plugin-bundled integrations, or
  tool allowlists.
- Prefer `product_strategist` before implementation when the product framing,
  scope, success criteria, or "smallest useful version" is uncertain.
- Prefer `engineering_planner` when architecture, data flow, state transitions,
  edge cases, diagrams, or test strategy need to be locked before code changes.
- Prefer `design_reviewer` for UX quality, design-system fit, accessibility,
  AI-slop detection, and visual tradeoff reviews.
- Prefer `devex_auditor` for onboarding friction, docs clarity, first-run
  flows, time-to-hello-world, and developer-experience audits.
- Prefer `root_cause_debugger` when a failure needs reproduction, hypothesis
  testing, or data-flow tracing before any fix.
- Prefer `qa_lead` for end-to-end workflow testing, regression coverage, QA
  reports, and re-verification plans.
- Prefer `performance_auditor` for page speed, Core Web Vitals, build/resource
  budgets, hot paths, and post-change regressions.
- Prefer `google_seo_auditor` for Google Search visibility, crawlability,
  indexing, metadata, structured data, sitemaps, hreflang, canonical URLs,
  Core Web Vitals, and Search Console-ready checks.
- Prefer `docs_author` for Diataxis coverage, stale docs, release docs, and
  missing guide generation.
- Prefer `spec_author` for turning vague intent into scoped, executable specs
  with non-goals, evidence, edge cases, and quality gates.
- Prefer `code_reviewer` for risky diffs, PR review, security-sensitive
  patches, regressions, and missing-test checks.
- Prefer `frontend_verifier` for UI/browser behavior, screenshots, responsive
  layout, console errors, and visual regressions.
- Prefer `security_auditor` for auth, secrets, API routes, database access,
  permissions, cryptography, threat models, and abuse paths.
- Prefer `test_verifier` for lint/typecheck/test/build/smoke verification or
  failing CI/test investigation.
- Prefer `release_verifier` before push, tag, release, deploy, package,
  artifact cleanup, or public publication.
- Prefer `codex_doctor` for starter health, Codex setup drift, install-plan
  coverage, MCP/agent catalog alignment, and safe no-write diagnostics.
- Pair specialists with the narrowest useful tool surface: `docs_researcher`
  with official docs or Context7, `context_architect` with current Codex surface
  references, `mcp_integrator` with official MCP docs/specs,
  `product_strategist` with product briefs, `engineering_planner` with code
  maps and diagrams, `design_reviewer` with design evidence,
  `devex_auditor` with onboarding smoke tests, `root_cause_debugger` with
  repro commands, `qa_lead` with user workflows, `performance_auditor` with
  traces or measurements, `docs_author` with repository evidence, `spec_author`
  with scoped requirements, `frontend_verifier` with browser MCPs,
  `security_auditor` with read-only evidence, `test_verifier` with verification
  commands, `codex_doctor` with repo-native status scripts, and
  `release_verifier` with git, artifact, and secret-scan gates.
- For large tasks, use at most 2-4 focused subagents, keep write scopes
  separate, and summarize results before editing.
- Keep write-heavy implementation in the main thread unless the user explicitly
  asks to split write scopes. If multiple agents may edit, assign
  non-overlapping files and reconcile before verification.
- Subagents inherit approvals and sandboxing; never use them to bypass user
  approval, credentials, destructive actions, or external-state changes.

## Implementation Standards

- Make the smallest coherent change that solves the problem at the root cause.
- Add dependencies only after confirming they are necessary and appropriate.
- Do not weaken production code, auth, validation, tests, types, or error
  handling just to make a task pass.
- For bug fixes, establish reproduction and root cause before changing code
  unless the cause is already obvious.
- For refactors, list affected locations first, keep behavior stable, and run
  existing tests unchanged.
- For UI work, verify behavior in a real browser or screenshot-capable flow
  when available.

## Skill Routing

- Use a skill when the user names it with `$SkillName` or plain text, or when
  the task clearly matches the skill description.
- Treat matching skill usage as mandatory for non-trivial tasks. Do not skip a
  relevant skill merely because the main thread can do the work manually.
- Before acting on a selected skill, read its full `SKILL.md`; if it references
  required scripts, templates, or focused references, load only those needed for
  the task.
- Keep skill descriptions concise and front-loaded so implicit routing remains
  reliable when the available-skill list is shortened.
- Use `investigate` or `incident-triage` before fixing unclear failures,
  production errors, or regressions.
- Use `new-feature` for bounded implementation work.
- Use `open-pr` only when PR preparation is requested.
- Use `dependency-upgrade`, `test-backfill`, `refactor-plan`,
  `db-migration-review`, `performance-audit`, and `release-verify` when those
  task shapes appear.
- Use `code-review`, `sentry-code-review`, `codex-pr-body`, and `babysit-pr`
  for review, PR polish, CI watching, and post-PR follow-through.
- Use `git-hygiene` before commits, pushes, release prep, artifact cleanup, or
  deciding whether files belong in source control.
- Use `mcp-connectors` for enabling or troubleshooting external MCP services.
- For security-sensitive code, use `security-best-practices` first, then
  `security-check` or `security-threat-model` when API routes, auth, database
  access, secrets, or abuse paths are involved.
- For UI/design work, prefer existing project design docs and components first,
  then use design/frontend skills as appropriate.
- Prefer skills over deprecated custom prompts for reusable workflows. Package a
  skill as a plugin when it should ship with MCP config, app integrations,
  assets, or lifecycle hooks.

## MCP Routing And Flags

- Use OpenAI Docs MCP and the fetched Codex manual for OpenAI/Codex behavior,
  Context7 or official project docs for libraries, `sequential-thinking` for
  complex decomposition, Playwright or Chrome DevTools for UI/browser evidence,
  Serena for semantic code navigation, and memory only for non-secret local
  context.
- Treat these MCP choices and their config flags as required when their task
  shape appears; do not replace current docs, browser verification, or semantic
  code navigation with guesswork when the matching MCP is available.
- MCP servers can expose tools, resources, and prompts. Treat each server as a
  capability boundary, especially when it can touch accounts, browsers,
  filesystems, databases, production logs, billing, or deployments.
- Keep MCP configuration in `~/.codex/config.toml` or trusted project
  `.codex/config.toml`. Use `enabled = false` to park authenticated,
  database, production, and broad filesystem connectors until the task needs
  them.
- Use `default_tools_approval_mode = "approve"` only for read-only
  documentation lookups. Use `"prompt"` for browser, filesystem, account,
  database, production, or potentially mutating tools.
- Prefer precise config flags over prose-only safety rules: `enabled`,
  `enabled_tools`, `disabled_tools`, `startup_timeout_sec`, `tool_timeout_sec`,
  `bearer_token_env_var`, `env_vars`, and per-tool approval overrides.
- Never store tokens in `AGENTS.md`, skills, repo docs, rules, shell history, or
  committed config. Use OAuth or environment variables, then restart Codex and
  verify active servers with `/mcp` or `codex mcp` before relying on them.

## Enterprise Dashboard UI Standards

- Optimize internal tools for task completion, speed, certainty, and low
  cognitive load.
- Use progressive disclosure for deep detail.
- Preserve necessary data complexity with clear hierarchy, grouping,
  role-aware views, RBAC-aware actions, and scannable layouts.
- Prefer a stable enterprise shell with clear breadcrumbs and active states.
- Use restrained color systems and WCAG AA contrast.
- Treat typography as information architecture.
- Use a 4px micro and 8px macro spacing rhythm.
- For tables, align text left and numbers right, protect minimum column widths,
  and choose responsive behavior intentionally.
- Design keyboard-first workflows with visible focus states.
- Use restrained, contextual motion only.
- Include loading, empty, error, success, disabled, permission-denied,
  long-content, and ugly-real-data states.

## Verification

- Run the narrowest meaningful verification first, then broader checks when the
  blast radius justifies it.
- Prefer project scripts such as `npm run test`, `npm run lint`,
  `npm run typecheck`, and `npm run build` when present.
- If verification cannot run, report exactly why and what remains unverified.
- For PR review, lead with correctness, security, regression, and missing-test
  findings before summaries.
- For UI changes, verify with a real browser or screenshot-capable flow when
  possible.
- For security or release work, include Gitleaks or an equivalent secret scan
  when available.

## Research

- Browse or use official docs for current, unstable, high-stakes, or
  version-sensitive facts.
- For OpenAI/Codex behavior, rely on official OpenAI docs, the fetched Codex
  manual, and the local installed configuration before blogs or social posts.
- Use Context7 or official project docs for library/framework APIs before
  making version-sensitive code changes.
- Keep quoted material short and cite sources when web research informed the
  answer.

## Security And Secrets

- Never print, persist, or infer secrets from environment variables, auth files,
  tokens, cookies, private keys, or connection strings.
- Treat MCP tools as potentially outside the shell sandbox.
- Ask before making irreversible data, database, billing, production, or
  account changes.
- Before commit or push, inspect `git status --short`, stage explicit files,
  and review `git diff --cached`.
- Do not commit local environment files, auth files, AI agent state, database
  dumps, signing keys/certificates, installers, archives, build output, logs,
  screenshots, or generated scratch artifacts unless explicitly confirmed.
- Publish installers and release archives through GitHub Releases by default.
- If a secret-like value appears in git history, treat it as compromised:
  rotate or revoke the credential first, then consider history cleanup.
- Keep `~/.codex/rules/default.rules` general-purpose; never auto-allow
  publishing, release creation, token extraction, credential-helper scraping,
  or destructive file operations.
