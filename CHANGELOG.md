# Changelog

## Unreleased

## 0.5.10 - 2026-06-16

- Made the recommended Windows path a guided `.\scripts\install.ps1 -All
  -Interactive` setup so first-time users see the decisions before anything
  real is installed.
- Expanded `-Interactive` / `--interactive` to ask about reviewed skill
  installation, backup-backed force replacement, optional Git guards, and final
  continue/cancel confirmation while never asking for credentials.
- Added a post-install capability board to PowerShell and Bash installers that
  lists installed specialist agents, default-ready MCP servers, opt-in MCP
  connectors, local plugin skills, and reviewed global skills.
- Kept automation simple with the unchanged noninteractive `-All` / `--all`
  path for CI, scripts, and users who already know the defaults.
- Updated installer alignment validation, expected-output docs, install guides,
  release notes, and package/plugin metadata for the richer guided setup.
- Tightened specialist-agent validator coverage for the operational research
  blocks that were added to the agent corpus.

## 0.5.9 - 2026-06-16

- Reworked the README first screen with a more prominent MCP connector board
  so enabled local/research servers and disabled account/database connectors
  are visible beside agents and skills.
- Replaced the Codex Chef icon with a more polished animated badge while
  preserving title, description, motion, and reduced-motion accessibility.
- Updated the banner install command to show the safe default `-All` path
  instead of implying force should be used on first install.
- Added PowerShell `-Interactive` and `-PlainOutput` switches so Windows users
  can choose guided path/Git-guard prompts or ASCII-only output without
  weakening the default noninteractive installer.
- Added Bash `--plain-output` and aligned installer section/status output
  across PowerShell and Bash while preserving backup-first merge behavior.
- Updated install and expected-output docs for the guided install path, config
  merge behavior, runtime verification command, and current patch version.

## 0.5.8 - 2026-06-16

- Added `scripts/merge-codex-config.mjs` so existing `config.toml` files are
  preserved by default while missing Codex Chef agent, MCP, and safety tables
  are merged in after backup.
- Updated PowerShell and Bash installers to use safe config merge when
  `config.toml` already exists and `-Force` / `--force` was not requested.
- Corrected the install-plan collision policy for `codex-config` to advertise
  merge-missing-blocks behavior instead of skip-only behavior.
- Expanded the English and Turkish README MCP sections into icon-rich enabled
  and opt-in connector lists so MCPs are as visible as agents and skills.
- Added installer-alignment validation for the config merge helper.

## 0.5.7 - 2026-06-16

- Added `scripts/verify-install-runtime.mjs` and
  `npm run verify:install:runtime` for read-only post-install verification of
  installed Codex Chef files, MCP blocks, specialist agents, optional skills,
  optional Git guards, and active Codex CLI `CODEX_HOME` drift.
- Updated the default README and install-guide commands to omit force on first
  install so existing user config, MCP settings, agents, rules, and marketplace
  files are skipped unless the user explicitly chooses a backup-backed
  upgrade.
- Clarified that `-Force` / `--force` is an upgrade path, not the safe default
  first-run path.
- Added runtime-verifier guidance to install, troubleshooting, verification,
  and upgrade docs so sandbox/offline Codex homes are diagnosed without
  mutating user-global config.
- Updated installer success output to include the read-only runtime verifier.

## 0.5.6 - 2026-06-16

- Added reviewed per-tool MCP approval overrides for read-only browser,
  repository-indexing, and memory lookup tools so common evidence gathering is
  smoother while interactive, account, filesystem, and mutating tools still
  prompt.
- Tightened MCP config parsing in `scripts/codex-doctor.mjs` and
  `scripts/validate-mcp-config.mjs` so nested tool override tables are not
  counted as separate MCP servers.
- Expanded conservative command-approval rules for read-only PowerShell, Git,
  GitHub CLI, Gitleaks, and local validation commands without allowing
  deletion, publishing, credential access, or broad shell execution.
- Updated release metadata, plugin version, and expected-output examples for
  the new patch release.

## 0.5.5 - 2026-06-16

- Added a root `llms.txt` agent-readable index inspired by high-signal
  catalog repositories such as Awesome Copilot, while keeping Codex Chef's
  installer and connector defaults unchanged.
- Made `llms.txt` part of the required public source surface through
  `package.json`, `scripts/validate-repo.mjs`, and
  `scripts/validate-package-surface.mjs`.
- Linked the agent-readable index from all six README entry points and the
  completion audit so future agents can find install targets, safety
  boundaries, verification commands, and high-signal comparison sources quickly.
- Added per-agent expertise-signal metadata and validation so each specialist
  has machine-checkable decision heuristics, failure modes, and verification
  signals, not just source references.
- Added an `Expertise signal contract` to every specialist role file so the
  reviewed expertise signals change runtime behavior instead of living only in
  the corpus manifest.
- Added `supplementalResearchRefs` to the agent research corpus so repo
  patterns, skill examples, command snapshots, and research papers are
  machine-checkable without becoming default runtime authority.
- Added authority-reference source freshness cadence metadata and validation so
  stale official docs, standards, vendor guidance, and tool-source references
  fail `validate-agent-research-corpus.mjs` before specialist role prompts
  drift.

## 0.5.4 - 2026-06-15

- Added a read-only `google_seo_auditor` specialist for Google Search
  visibility, crawlability, metadata, structured data, Core Web Vitals, and
  Search Console-ready checks.
- Rebalanced the optional installable skill catalog away from Vercel/design
  overlap toward maintenance, security, testing, SEO, accessibility, web
  quality, docs, CI, and one broad frontend workflow.
- Expanded the optional installable skill allowlist from nine to sixteen
  verified sources by adding `systematic-debugging`,
  `request-refactor-plan`, `webapp-testing`, `mcp-builder`, and the
  first-party `context-engineering-project-starter`,
  `codex-enterprise-prompt-architect`, and `codex-skill-forge` skills.
- Added the bundled local `context-budget-planner` skill for token/context
  budgeting, source prioritization, compaction handoff, and verification gates.
- Added reference-backed bundled skill guidance with `references/*.md`,
  `agents/openai.yaml`, and `npm run validate:plugin-skills` so local plugin
  skills cannot silently lose instructions, UI metadata, or catalog coverage.
- Documented the exact offline diagram contract for the supported Mermaid
  subset, editable Excalidraw scene shape, and SVG/PNG/Markdown outputs.
- Moved the first-party ecosystem skills
  `context-engineering-project-starter`, `codex-enterprise-prompt-architect`,
  and `codex-skill-forge` into the reviewed `-All` / `-InstallSkills` set.
- Kept global Git ignore, hook, and Git config changes out of `-All`; they now
  require the explicit `-InstallGitGuards` / `--install-git-guards` opt-in.
- Kept `impeccable`, extra design-taste, Vercel, prompt, context, memory, and
  token-related skills visible as manual opt-in catalog references without
  adding duplicate default triggers.
- Fixed Codex Chef doctor skill lock counting and added a guard that keeps
  lock entries aligned with installable skills.
- Added agent-template validation against Google credential environment names.
- Added explicit app/connector safety defaults that keep destructive and
  open-world connector tools disabled unless a reviewed override changes them.
- Added content-safety validation for likely UTF-8/Windows-1252 mojibake
  regressions in tracked text files.
- Sandboxed online skill-source checks under ignored `tmp/skill-source-check`
  so `npm run verify:skills:online` cannot treat the repo root as its working
  project and mutate tracked templates.
- Expanded GStack/ECC research notes to document adopted role, manifest,
  doctor, and diagram patterns while excluding default cookie, tunnel, deploy,
  raw-CDP, hook-injection, and cross-harness sync behavior.
- Added role-specific research-synthesis and adversarial-validation guidance to
  all twenty-one specialist agent templates so external starter patterns become
  compact evidence-backed decisions instead of copied hidden behavior.
- Added role-specific source-refresh, source-currency, and corpus-expansion
  guidance to all twenty-one specialist agent templates so stale evidence is
  refreshed and broader local, official, standards, vendor, and specialist
  sources become compact operating rules.
- Added role-specific expert-calibration guidance to all twenty-one specialist
  agent templates so each role checks its output against senior-quality gates
  before handing work back.
- Strengthened `validate-agent-config.mjs` so every specialist agent template
  must keep exactly one copy of each required guardrail block, at least 100
  source-backed instruction items, and at least 20 distinct source markers.
- Added `catalog/agent-research-corpus.json` plus
  `validate-agent-research-corpus.mjs` so each specialist agent's research
  domains, source types, refresh triggers, and handoffs are machine-checkable.
- Added reviewed authority-reference metadata to the agent research corpus so
  specialist source families, URLs, source types, staleness risk, and source
  markers are centralized instead of repeated differently across roles. The
  corpus validator now ties those keys back to source markers in each role TOML
  file.
- Added an `Authority metadata contract` block to every specialist TOML so the
  reviewed corpus metadata changes agent runtime behavior when the role is
  invoked, not only offline validation.
- Mapped cross-model review workflows explicitly to `code_reviewer` and manual
  Codex CLI use while keeping automatic external-agent launch out of the
  default setup.

## 0.5.3 - 2026-06-15

- Published the final README render fix so release/tag views no longer show the
  older long agent table text.
- Converted the English and Turkish agent/skill catalogs to short bullet-style
  summaries that stay readable in GitHub's narrow README layout.
- Kept install behavior, agent templates, MCP defaults, skill sources, and
  security gates unchanged.

## 0.5.2 - 2026-06-15

- Removed duplicated first-screen README messaging by keeping the install
  outcome summary short and moving detailed agent/skill descriptions into
  dedicated catalogs.
- Reworked the English and Turkish agent/skill tables so friendly names, icons,
  config IDs, install modes, and use cases live in separate columns instead of
  stacked duplicate labels.
- Clarified that Codex Chef installs Codex subagent role definitions, not
  separate background services.

## 0.5.1 - 2026-06-15

- Polished root README onboarding so users can see install commands, the
  bundled agent team, skills, and MCP defaults at a glance.
- Reworked the English and Turkish agent/skill tables with icons, friendly role
  names, and clearer explanations while keeping the actual Codex config IDs
  visible.
- Added natural-language install-outcome summaries to the German, Spanish,
  Brazilian Portuguese, and French README entry points.
- Removed the duplicate language tagline from all six root README entry
  points.
- Updated the validation workflow to Node 24-era pinned GitHub Actions:
  `actions/checkout` v6.0.3 and `actions/setup-node` v6.4.0.
- Kept installer behavior, global-write boundaries, skill allowlists, and
  disabled-by-default authenticated connectors unchanged.

## 0.5.0 - 2026-06-15

- Rebranded the project as Codex Chef with the public package slug
  `codex-chef`.
- Added Codex Chef visual identity assets: `assets/icon.svg` and
  `assets/social-preview.svg`.
- Added SEO/discoverability guidance for GitHub description, topics, social
  preview, search-safe claims, and post-publication measurement.
- Renamed the local plugin surface to `codex-chef-workflows` and the bundled
  maintenance skill to `codex-chef-operator`.
- Updated README, GitHub metadata guidance, release notes, install paths,
  validators, and package metadata for the rebrand.

## 0.4.0 - 2026-06-15

- Added four Codex specialist agents: `context_architect`,
  `prompt_architect`, `mcp_integrator`, and `codex_doctor`.
- Expanded the bundled specialist set to twenty agents with product strategy,
  engineering planning, design review, DevEx audit, root-cause debugging, QA,
  performance, docs authoring, and spec authoring roles.
- Added `npm run codex:doctor` and `npm run validate:doctor` for no-write
  starter health, catalog drift, docs matrix, MCP, skills, and install-plan
  diagnostics.
- Added a six-language Codex capability map documenting prompts, AGENTS.md,
  config, rules, skills, plugins, MCP, subagents, and doctor/status boundaries.
- Added a six-language workflow surface map that converts ECC/GStack-style
  slash workflows into Codex-native skills, subagents, MCP, plugins, and
  approval gates.
- Added a bundled `offline-diagram-triplet` skill plus a zero-network renderer
  that emits Mermaid, editable Excalidraw, SVG, PNG, and Markdown artifacts.
- Added `npm run diagram:triplet` and `npm run validate:diagram` so the diagram
  workflow is executable and smoke-tested locally.
- Hardened the offline diagram renderer with cyclic-graph rejection, graph size
  limits, pixel budget checks, PNG initialization ordering, and temp cleanup in
  validation.
- Expanded README and setup docs so the starter presents a fuller Codex
  operating model without enabling broad connectors, hooks, or global writes.

## 0.3.1 - 2026-06-15

- Added German, Spanish, Brazilian Portuguese, and French deep documentation
  files for every English guide, bringing the docs matrix to six languages.
- Added `npm run validate:doc-locales` and `npm run sync:doc-locales` so deep
  doc locale coverage is generated, checked, and included in `npm run check`.
- Updated multilingual README positioning so root README files no longer imply
  that deep documentation is only English/Turkish.

## 0.3.0 - 2026-06-14

- Added an ECC-informed manifest-backed install plan with a dependency-free
  `npm run plan:install` preview command.
- Added no-write install discovery commands for profiles and operations:
  `node scripts/plan-install.mjs --list-profiles` and
  `node scripts/plan-install.mjs --list-operations`.
- Added install-plan schema documentation and validation so managed files,
  collision policies, backups, platforms, risk levels, and explicit flags stay
  reviewable before installer execution.
- Added an install-state preview schema and validator so machine-readable plan
  output has a stable, dependency-free contract.
- Added `--redact-paths` for publish-safe install-state preview evidence.
- Documented ECC compatibility boundaries in English and Turkish: adapt
  manifest/plan/state patterns, but do not import broad global sync, implicit
  dependency installation, or enabled-by-default authenticated connectors.
- Expanded security and public-readiness gates to reject unsafe install-plan
  operations, implicit installer dependency installs, yolo Codex profiles, and
  active `@latest` package specs.
- Pinned all npm-based MCP package specs in Codex config templates and MCP
  catalog metadata instead of allowing unversioned or floating package
  resolution.
- Tightened command-approval rules so cleanup scripts prompt instead of being
  auto-allowed.
- Tightened command-approval rules so global skill installation and broad Skills
  CLI commands prompt instead of being auto-allowed.
- Hardened online skill-source verification to use argv-based invocation and a
  temporary Windows wrapper instead of an interpolated PowerShell command
  string.
- Clarified that the skill lock file is a reviewed source allowlist rather than
  an immutable upstream commit lock, and made this expectation machine-gated.
- Added MCP catalog/config drift validation and supply-chain IOC scanning to
  the default check pipeline.
- Added release-readiness validation for source-controlled release notes,
  GitHub metadata docs, workflow hardening, Gitleaks gates, and artifact hygiene.
- Added manifest-to-installer alignment validation so PowerShell and Bash setup
  surfaces stay synchronized with the install plan.
- Added a specialist-agent catalog and validator so bundled agent metadata,
  Windows/Unix config blocks, and role TOML files stay synchronized.
- Added install-plan output smoke coverage for parseable JSON, Windows UNC and
  extended-length paths, `--force`, and `--no-backup`.
- Added versioned release notes and GitHub repository settings guidance for the
  v0.3.0 publication path.
- Added CODEOWNERS, feature/question issue templates, disabled blank issues,
  and advisory-source docs so public triage stays owned and public-safe.
- Added German, Spanish, Brazilian Portuguese, and French root README entry
  points, plus a six-language README switcher and validation gate.
- Added README locale validation and workflow-security validation so language
  links, checkout credential persistence, workflow permissions, and
  no-publish/no-auth workflow boundaries stay machine-gated.
- Pinned GitHub Actions workflow dependencies to full commit SHAs and extended
  workflow validation so future tag-based action refs fail locally and in CI.
- Extended ECC drift gates to reject plugin-bundled hooks, MCP/apps surfaces,
  write-capable plugin manifests, marketplace auth requirements, broad hook
  runtime paths, workflow write permissions, unpinned git MCP launchers, plugin
  `.mcp.json` drift, and install-plan destinations outside reviewed
  Codex/Agents/Git-guard targets.
- Added dangerous invisible Unicode character validation for text source files
  while preserving legitimate README emoji/icon usage.
- Expanded local-path leak detection to catch non-placeholder Windows, macOS,
  and Linux home paths, not only one maintainer machine path.
- Added security validation that blocks imported ECC-style lifecycle hook
  runtimes and automatic session/additional-context injection patterns unless a
  future change explicitly reviews and documents them.
- Added package-surface dry-run validation with a repo-local npm cache and
  `--ignore-scripts`, plus bounded online skill-source resolution timeouts.
- Added an explicit `package.json` source package allowlist and validation so
  package dry-runs stay deterministic and exclude local agent state, scratch
  folders, archives, and auth material.

## 0.2.0 - 2026-06-14

- Added PowerShell `-WhatIf` and Bash `--dry-run` installer previews, including
  safer managed-directory assertions and no-write skill previews.
- Added a reviewed installable skill catalog and online source verification that
  uses an ignored workspace-local npm cache for Windows-safe checks.
- Added Markdown/workflow validation, expanded security validation, and CI
  coverage for Node, PowerShell, Bash, and repo checks.
- Rebuilt the English and Turkish README experience with icon-rich quick starts,
  setup boundaries, trust signals, and official reference links.
- Added bilingual troubleshooting, upgrade, and expected-output docs.
- Added shell environment policy defaults to Codex config templates so common
  token, password, key, and secret environment names stay excluded.
- Clarified global and template subagent routing so task-shape automation uses
  deliberate specialist delegation instead of implying hidden background
  spawning.
- Added stronger skill-routing guidance for implicit triggers, full `SKILL.md`
  loading, and plugin packaging boundaries.
- Added MCP routing and config-flag guidance covering approval modes, tool
  allow/deny lists, startup/tool timeouts, and environment-backed credentials.
- Added explicit subagent depth and MCP timeout defaults to the Windows, Unix,
  and live global Codex config templates.
- Made matching skill, specialist-agent, MCP, and config-flag routing mandatory
  when the task shape calls for it.
- Strengthened deletion and cleanup approval rules while allowing safe
  non-destructive work to continue.

## 0.1.0 - 2026-06-10

- Initial Windows-first Codex enterprise setup starter.
- Added bilingual documentation.
- Added safe Codex templates for AGENTS, config, rules, agents, and profiles.
- Added MCP and skill catalogs.
- Added install scripts for PowerShell and Bash.
- Added validation script and GitHub Actions workflow.
- Added optional local plugin marketplace package.
- Added public-readiness, verification, privacy, support, and conduct docs.
- Added security audit script covering safe defaults, disabled authenticated MCPs, and leak patterns.
- Added one-shot installer flags and complete English/Turkish docs pairing.
- Added completion audit docs that map requirements to repository evidence.
- Added README storefront visuals, real badges, Turkish first-screen signal, and SVG asset validation.
- Added bilingual public-safe issue templates and a pull request template.
- Added README trust-signal tables and expanded repository map entries.
- Added Dependabot configuration for GitHub Actions and npm manifest updates.
- Added icon-rich README polish, animated SVG visuals, emoji accents, and reduced-motion validation.
- Ignored local Serena state in Git and repository scans.
- Fixed optional skill installation to use verified packages with
  `--skill`, `--yes`, and `--global` instead of cloning plain skill names.
- Added senior best-practice operating docs and a skill-source verification
  script so installable packages are checked before users run the installer.
- Hardened full installer skill handling so existing global skills are skipped,
  new installs target Codex only, GitHub clone uses an OpenSSL override, and
  reported skill install failures stop the installer.
- Suppressed raw Skills CLI progress output on successful installs so Windows
  PowerShell users see short ASCII status lines instead of mojibake blocks.
