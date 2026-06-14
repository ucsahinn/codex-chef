# Release Notes

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
