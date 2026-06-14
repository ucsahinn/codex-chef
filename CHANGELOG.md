# Changelog

## Unreleased

## 0.2.0 - 2026-06-14

- Added PowerShell `-WhatIf` and Bash `--dry-run` installer previews, including
  safer managed-directory assertions and no-write skill previews.
- Added a locked installable skill catalog and online source verification that
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
