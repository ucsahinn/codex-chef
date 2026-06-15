# Changelog

## Unreleased

- No changes yet.

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
