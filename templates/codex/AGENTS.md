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

## Subagent Routing

- Use subagents when the user asks for parallel or delegated agent work, or
  when the active environment has explicitly authorized automatic routing.
- Do not spawn subagents for trivial, single-file, low-risk changes.
- Prefer `code_mapper` before broad implementation, refactors, unfamiliar
  repositories, or architecture questions.
- Prefer `docs_researcher` for current/version-sensitive APIs, Codex behavior,
  libraries, standards, and external documentation.
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
- For large tasks, use at most 2-4 focused subagents, keep write scopes
  separate, and summarize results before editing.
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
