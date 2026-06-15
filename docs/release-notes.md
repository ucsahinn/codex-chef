# Release Notes

## v0.5.3 - 2026-06-15

This patch publishes the final README render fix so the release/tag view matches
the current main branch README.

## Highlights

- Replaced the older long agent table text with short bullet-style agent
  summaries in English and Turkish.
- Replaced the skill tables with short bullet-style skill summaries in English
  and Turkish.
- Kept behavior unchanged: installer, templates, MCP defaults, skill sources,
  validation, and security gates are identical to the verified setup model.

## Upgrade Notes

No installer behavior changed in this patch. Existing users only need to pull
the latest docs if they already installed Codex Chef.

## Verification

Release readiness for this patch should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.2 - 2026-06-15

This patch is the final README polish pass after reviewing the rendered first
screen. It keeps the install behavior unchanged.

## Highlights

- Removed repeated first-screen messaging by keeping the install outcome summary
  short and moving agent/skill detail into dedicated catalogs.
- Reworked the English and Turkish agent tables so icon, friendly role name,
  config ID, and use case are separate columns.
- Reworked the English and Turkish skill tables so skill name, ID, install mode,
  and use case are separate columns.
- Clarified that Codex Chef installs Codex subagent role definitions; it does
  not spawn separate background services or copy the maintainer's global state.

## Upgrade Notes

No installer behavior changed in this patch. Existing users can use the same
preview commands before any global write:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

## Verification

Release readiness for this patch should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.1 - 2026-06-15

This patch aligns the public README storefront and CI workflow with the final
Codex Chef release posture. It does not change installer behavior.

## Highlights

- Polished README onboarding so users can see the one-shot install path,
  installed agent team, bundled skills, optional global skills, and MCP
  defaults at a glance.
- Reworked the English and Turkish agent/skill tables with icons, friendly role
  names, and clearer use-case language while keeping the actual Codex config IDs
  visible.
- Added natural-language install-outcome summaries to the German, Spanish,
  Brazilian Portuguese, and French README entry points.
- Removed the duplicate language tagline from all six root README entry points:
  German, Spanish, English, Brazilian Portuguese, Turkish, and French.
- Documented the installed 20-agent Codex team from the actual setup source:
  `templates/codex/agents/*.toml` and the platform Codex config templates.
- Documented the plugin-local skills and optional global skills without
  implying that broad external skill catalogs are imported by default.
- Updated the validation workflow to Node 24-era pinned GitHub Actions:
  `actions/checkout` v6.0.3 and `actions/setup-node` v6.4.0.
- Kept security posture unchanged: no default authenticated connectors, no
  automatic publish/deploy automation, and no hidden global writes.

## Upgrade Notes

No installer behavior changed in this patch. Existing users can pull `main` or
use the release source archive, then preview before replacing any global files:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

The agent list shown in the README is the installable Codex Chef agent set, not
the maintainer's current global agent state.

## Verification

Release readiness for this patch should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.0 - 2026-06-15

This release rebrands the project as Codex Chef and improves public
discoverability without weakening the safe installer model.

## Highlights

- Renamed the public product and package surface to Codex Chef / `codex-chef`.
- Added Codex Chef visual identity assets: `assets/icon.svg` and
  `assets/social-preview.svg`.
- Reworked the README hero and public metadata around the source-backed phrase
  `Windows-first Codex setup kit`.
- Added SEO and discoverability guidance for GitHub description, topics,
  social preview, search-safe claims, and post-publication measurement.
- Renamed the local plugin surface to `codex-chef-workflows` and the bundled
  maintenance skill to `codex-chef-operator`.
- Kept safety posture unchanged: authenticated connectors stay disabled by
  default, installers still preview/backup, and release/publish actions remain
  explicit approval gates.

## Upgrade Notes

Existing users should run a dry-run before installing the renamed plugin path:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

The new managed plugin target is `codex-chef-workflows`. If an older checkout
was installed under the former plugin name, review the dry-run output before
deciding whether to remove old global plugin copies.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.4.0 - 2026-06-15

This release expands the starter from a safe installer/docs kit into a fuller
Codex operating setup with stronger specialist routing, local diagnostics, and
offline workflow tooling.

## Highlights

- Expanded the bundled specialist set to 20 Codex agents, including product
  strategy, engineering planning, design review, DevEx audit, root-cause
  debugging, QA, performance, docs authoring, and spec authoring roles.
- Added `npm run codex:doctor` for no-write starter health, catalog drift, docs
  matrix, MCP, skills, and install-plan diagnostics.
- Added a six-language Codex capability map and workflow surface map so users
  can see where prompts, `AGENTS.md`, skills, plugins, MCP, subagents, rules,
  hooks, and release gates belong.
- Added the bundled `offline-diagram-triplet` skill with a zero-network
  renderer that emits Mermaid, editable Excalidraw, SVG, PNG, and Markdown.
- Hardened diagram validation with cyclic-graph rejection, graph size limits,
  pixel budget checks, PNG generation coverage, and temp cleanup.
- Kept the installer conservative: no default authenticated connectors, no
  broad hooks, no hidden global writes, and no publish/deploy automation.

## Upgrade Notes

Existing users should preview before replacing any global files:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

The new agents and local diagram skill are installed only through the reviewed
starter install flow. The doctor command is repo-only by default and does not
read user-global file contents:

```bash
npm run codex:doctor
```

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.3.1 - 2026-06-15

This patch completes the multilingual documentation surface that was introduced
in v0.3.0. Root README files and deep `docs/` guides now have a consistent
six-language file matrix.

## Highlights

- Added German, Spanish, Brazilian Portuguese, and French deep-doc files for
  every English guide under `docs/`.
- Added `npm run sync:doc-locales` to regenerate the additional localized
  deep-doc files from the reviewed English guide structure.
- Added `npm run validate:doc-locales` and included it in `npm run check` so
  missing locale files fail locally and in CI.
- Updated repo, security, workflow, and release-readiness validators so they
  understand `de`, `es`, `pt-BR`, `tr`, and `fr` doc pairs instead of assuming
  only English/Turkish.
- Updated README positioning and links so the public surface no longer implies
  that deep docs are only English/Turkish.

## Upgrade Notes

No installer behavior changed in this patch. Existing users can pull the repo
and use the same dry-run and verification commands:

```bash
npm run check
node scripts/plan-install.mjs --all --json
```

## Verification

Release readiness for this patch should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.3.0 - 2026-06-14

This release makes the starter more transparent and harder to drift by adapting
the safe parts of ECC's manifest and release-gate approach without importing
ECC's global config, hooks, MCP catalogs, skills, or account connectors.

## Highlights

- Added a manifest-backed no-write install plan:
  `node scripts/plan-install.mjs --all --json`.
- Added no-write install discovery commands:
  `node scripts/plan-install.mjs --list-profiles` and
  `node scripts/plan-install.mjs --list-operations`.
- Added dependency-free install-plan validation with JSON smoke coverage,
  Windows UNC path coverage, Windows extended-length path coverage, `--force`,
  and `--no-backup` checks.
- Added an install-state preview schema and validator for the machine-readable
  no-write plan output.
- Added `--redact-paths` for publish-safe install-state preview evidence.
- Added installer alignment validation so PowerShell and Bash setup behavior
  stays synchronized with `manifests/install-plan.json`.
- Added a specialist-agent catalog and config validator so bundled agent
  metadata, Windows/Unix config blocks, and role TOML files stay synchronized.
- Added MCP catalog/config drift validation across Windows and Unix Codex
  templates.
- Added supply-chain IOC scanning for remote shell pipes, PowerShell
  download-execute patterns, encoded commands, unsafe root removal,
  world-writable chmod, active `@latest` package specs, and implicit installer
  dependency installs.
- Added release-readiness validation for release notes, GitHub settings docs,
  workflow hardening, Gitleaks gates, and source artifact hygiene.
- Pinned all npm-based MCP package specs in Codex config templates and MCP
  catalog metadata instead of allowing unversioned or floating package
  resolution.
- Tightened command-approval rules so cleanup scripts prompt instead of being
  auto-allowed.
- Tightened command-approval rules so global skill installation and broad Skills
  CLI commands prompt instead of being auto-allowed.
- Hardened online skill-source verification to use argv-based invocation and a
  temporary Windows wrapper instead of interpolating package values into a
  PowerShell command string.
- Clarified that `catalog/skills-lock.json` is a reviewed source allowlist, not
  an immutable upstream commit lock, and made online skill resolution part of
  release preparation.
- Added `.gitleaks.toml` that keeps default Gitleaks rules enabled while
  excluding ignored local scratch, dependency, build, and cache directories.
- Documented ECC compatibility boundaries in English and Turkish.
- Added CODEOWNERS, feature/question issue templates, disabled blank issues, and
  advisory-source docs so public triage stays owned, scoped, and public-safe.
- Added German, Spanish, Brazilian Portuguese, and French root README entry
  points, with a six-language switcher validated by the default check pipeline.
- Added README locale validation and workflow-security validation inspired by
  ECC's public-surface and CI-hardening gates.
- Pinned GitHub Actions workflow dependencies to full commit SHAs and extended
  workflow validation so tag-based action refs fail before publication.
- Extended ECC drift gates to reject plugin-bundled hooks, MCP/apps surfaces,
  write-capable plugin manifests, marketplace auth requirements, broad hook
  runtime paths, workflow write permissions, unpinned git MCP launchers, plugin
  `.mcp.json` drift, and install-plan destinations outside reviewed
  Codex/Agents/Git-guard targets.
- Added dangerous invisible Unicode character validation for text source files
  while preserving legitimate README emoji/icon usage.
- Expanded local-path leak detection to catch non-placeholder Windows, macOS,
  and Linux home paths before publication.
- Added security validation that blocks imported ECC-style lifecycle hook
  runtimes and automatic session/additional-context injection patterns unless a
  future change explicitly reviews and documents them.
- Added package-surface dry-run validation with a repo-local npm cache and
  `--ignore-scripts`, plus bounded online skill-source resolution timeouts.
- Added an explicit `package.json` source package allowlist and validation so
  package dry-runs remain deterministic while excluding local agent state,
  scratch folders, archives, and auth material.

## Upgrade Notes

Before running an installer, inspect the plan:

```bash
npm run check
node scripts/plan-install.mjs --all --json
```

Then run the existing dry-run path for your shell:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

```bash
./scripts/install.sh --all --force --dry-run
```

The real installer still writes only after you run it intentionally. Managed
global files are backed up before replacement unless `-NoBackup` or
`--no-backup` is explicitly used.

## Verification

Release readiness was checked with:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

Bash syntax validation is covered by GitHub Actions on Ubuntu. On the local
Windows workstation used for this release prep, Bash was not installed.
