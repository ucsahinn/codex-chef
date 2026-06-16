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
- `catalog/agents.json`: reviewed specialist-agent metadata, risk notes,
  intended use, and drift expectations for the Codex config templates.
- `plugins/codex-chef-workflows/skills/codex-chef-operator`: a
  small local skill for maintaining this setup.
- `plugins/codex-chef-workflows/skills/offline-diagram-triplet`: a local
  zero-network diagram workflow that emits Mermaid, editable Excalidraw, SVG,
  PNG, and a Markdown snippet.
- `plugins/codex-chef-workflows/skills/context-budget-planner`: a local
  token/context planning workflow for broad tasks, source prioritization,
  compaction handoff, and verification gates.

Each bundled skill follows the same shape:

- `SKILL.md`: short trigger and workflow instructions.
- `references/*.md`: detailed domain guidance loaded only when needed.
- `agents/openai.yaml`: UI metadata and a default prompt for Codex skill lists.

`npm run validate:plugin-skills` checks that this structure, the plugin
manifest, and `catalog/skills.json` stay aligned.

## Plugins

Plugins are the distribution package when a workflow should be shared beyond a
single local folder. They can bundle skills, MCP config, app integrations, and
lifecycle config.

Official reference: https://developers.openai.com/codex/plugins

This repo includes:

- `plugins/codex-chef-workflows/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

The installer registers the local marketplace. Restart Codex, then open
`/plugins` to inspect or install the plugin.

The bundled plugin currently exposes three local skills:

- `codex-chef-operator`: maintain this starter without weakening safety
  boundaries.
- `offline-diagram-triplet`: turn Mermaid source into an editable diagram
  triplet with no network access.
- `context-budget-planner`: plan token/context usage before broad repo,
  research, multi-agent, documentation, or long-running Codex work.

The installer only calls the Skills CLI for catalog entries with `install: true`,
a verified `package` value such as `owner/repo`, and a matching `skill` name. It
uses `npx skills add <package> --skill <skill> --agent codex --yes --global`,
which avoids treating a plain skill name as a Git repository and keeps the
install target explicit.

`catalog/skills-lock.json` mirrors the reviewed installable entries and their
installer command, but it is a source allowlist rather than an immutable
upstream commit lock. Run `npm run verify:skills:online` before releases and
after any source change so the current Skills CLI can resolve every package and
skill pair.

Default installable public and first-party skills:

- `dependency-upgrade`: safe dependency maintenance.
- `gh-fix-ci`: official OpenAI GitHub Actions failure repair workflow.
- `security-best-practices`: official OpenAI secure-defaults workflow.
- `systematic-debugging`: root-cause investigation before fixes.
- `request-refactor-plan`: small-step refactor planning before broad rewrites.
- `frontend-skill`: one broad frontend build workflow.
- `webapp-testing`: local web-app verification with Playwright evidence.
- `web-quality-audit`: Lighthouse-style web quality umbrella checks.
- `seo`: technical SEO and search discoverability.
- `accessibility`: keyboard, focus, forms, ARIA, and semantic HTML checks.
- `test-driven-development`: behavior-first implementation workflow.
- `documentation-and-adrs`: README, ADR, and durable docs workflow.
- `mcp-builder`: high-quality MCP server design, tool schemas, transports, and
  evaluations.
- `context-engineering-project-starter`: first-party project context
  foundations, starter docs, agent instruction files, and vibe-coding
  guardrails.
- `codex-enterprise-prompt-architect`: first-party plan-first,
  approval-gated, security-aware Codex prompt packages and prompt audits.
- `codex-skill-forge`: first-party skill authoring, validation,
  forward-testing, plugin packaging, and marketplace preparation.

Manual opt-in catalog references remain visible for users who want more
specialized workflows:

- `impeccable`, `design-taste-frontend`, `image-to-code`, and
  `high-end-visual-design`: extra design-polish and image-to-code workflows.
- `web-design-guidelines`, `vercel-react-best-practices`, `vercel-optimize`,
  and `vercel-cli-with-tokens`: Vercel, React/Next.js, hosting, and
  deployment-token workflows.
- `context-map` and `what-context-needed`: extra context-selection patterns.
- `prompt-engineering-patterns` and
  `ai-prompt-engineering-safety-review`: extra prompt design and prompt-safety
  reviews.
- `memory-safety-patterns`: memory workflow safety guidance.

The token/context distinction matters: the bundled `context-budget-planner`
handles LLM context budgets and compaction handoffs. Deployment-token or
vendor-auth skills such as `vercel-cli-with-tokens` remain manual because they
can involve account credentials and deployment-specific behavior.

Manual opt-in example:

```bash
npx skills add pbakaus/impeccable --skill impeccable --agent codex --yes --global
```

Offline diagram smoke validation is separate from online skill-source
resolution:

```bash
npm run validate:diagram
```

Bundled local skill validation is separate from public skill-source resolution:

```bash
npm run validate:plugin-skills
```

## Specialist Agents

This starter registers focused agents:

- `code_mapper`: read-only project mapping before broad changes.
- `docs_researcher`: current official docs and version-sensitive facts.
- `context_architect`: decide whether durable behavior belongs in a prompt,
  `AGENTS.md`, skill, plugin, MCP, hook, memory, rule, or config profile.
- `prompt_architect`: design reliable briefs, success criteria, prompt systems,
  and reusable instruction contracts.
- `mcp_integrator`: plan least-privilege MCP and connector changes before
  enabling or troubleshooting external tool access.
- `product_strategist`: challenge product framing, scope, success criteria, and
  smallest-useful-version choices before implementation.
- `engineering_planner`: lock architecture, data flow, diagrams, edge cases,
  invariants, and test strategy before broad code changes.
- `design_reviewer`: review UX quality, accessibility, design-system fit,
  visual tradeoffs, and AI-slop risks.
- `devex_auditor`: test onboarding friction, docs clarity, first-run flows, and
  time-to-hello-world.
- `root_cause_debugger`: reproduce failures, trace data flow, test hypotheses,
  and identify root cause before fixes.
- `qa_lead`: run end-to-end workflow testing, regression planning, and
  re-verification.
- `performance_auditor`: measure page speed, Core Web Vitals, resource budgets,
  traces, and post-change regressions.
- `google_seo_auditor`: audit crawlability, indexing, metadata, structured
  data, Core Web Vitals, and Search Console-ready fixes using Google Search
  Central and Lighthouse evidence.
- `docs_author`: audit Diataxis coverage, stale docs, release docs, and missing
  guide generation.
- `spec_author`: turn vague intent into scoped executable specs with non-goals,
  evidence, edge cases, and quality gates.
- `code_reviewer`: fresh-context correctness, regression, and test review.
- `frontend_verifier`: browser, screenshot, layout, and interaction checks.
- `security_auditor`: read-only security risk and abuse-path review.
- `test_verifier`: lint, typecheck, test, build, and smoke evidence.
- `release_verifier`: git hygiene, artifacts, secret scan, and publish gates.
- `codex_doctor`: no-write starter health, catalog drift, install-plan, docs,
  and MCP diagnostics.

Official reference: https://developers.openai.com/codex/subagents

Agent catalog rule:

- `catalog/agents.json` is the reviewed source for the twenty-one bundled
  specialist agents.
- `catalog/agent-research-corpus.json` records each specialist agent's domain
  focus, primary source types, refresh triggers, handoff targets, and reviewed
  authority-reference metadata.
- Every agent role file must include explicit source-refresh, cross-repo
  transfer, research-synthesis, adversarial-validation, source-currency, and
  corpus-expansion guidance plus expert-calibration gates so borrowed patterns
  become evidence-backed actions and role outputs meet a senior-quality bar,
  not hidden global behavior.
- Every role file also carries `Authority metadata contract` and
  `Expertise signal contract` blocks so the agent uses its own source markers
  and expertise signals as runtime forms of the reviewed corpus metadata when
  it is called.
- Every authority reference also carries `reviewCadenceDays`; the corpus
  validator fails when the global `dateChecked` value is older than the
  strictest cadence across official docs, standards, vendor guides, and tool
  sources.
- Broader repository, skill-example, local command, official project-doc, and
  research-paper sources live in `supplementalResearchRefs`. They can sharpen
  heuristics and validator design, but they stay outside default runtime
  authority until promoted into `authorityRefs`.
- Every agent also has `expertiseSignals` for `decisionHeuristics`,
  `failureModes`, and `verificationSignals`. These are compact, runtime-useful
  summaries of what the source corpus should change in the agent's behavior.
- `scripts/validate-agent-config.mjs` checks that every cataloged agent exists
  in both Windows and Unix config templates and that each `config_file` points
  at a matching `templates/codex/agents/*.toml` role file. It also enforces one
  copy of each required runtime contract and guardrail block, plus at least 100
  source-backed instruction items and 20 distinct source markers per role file.
- `scripts/validate-agent-research-corpus.mjs` checks the machine-readable
  corpus index against `catalog/agents.json`, reviewed authority metadata, and
  the role TOML files. It also requires each per-agent authority key to match a
  source marker in that agent's TOML prompt, validates each source freshness
  cadence against its staleness-risk class, rejects stale corpus `dateChecked`
  values, requires at least three expertise signals in each reviewed group for
  every bundled agent, and validates supplemental research refs as freshness
  checked but non-authoritative inputs.
- The gate also keeps dangerous defaults out of agent templates: no
  `danger-full-access`, no `approval_policy = "never"`, and no token variable
  names embedded in role files.

Routing rule:

- Subagents are explicit delegation. Codex should deliberately spawn them when
  the user asks for parallel/delegated work or the active global setup
  authorizes task-shape routing.
- For non-trivial work that maps to a registered specialist, use that specialist
  and summarize the result before relying on it.
- Use them for noisy, read-heavy, or evidence-heavy side work: exploration,
  current docs, context placement, prompt design, MCP planning, review, UI
  verification, security audit, test/build evidence, setup diagnostics, and
  release readiness.
- Keep write-heavy implementation in the main thread unless the user explicitly
  asks to split write scopes. If multiple agents edit, assign non-overlapping
  files and reconcile before verification.
- Subagents inherit approvals, sandboxing, and connector auth. They must never
  be used to bypass user approval, credentials, destructive actions, or
  external-state controls.
