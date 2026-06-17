# Release Notes

## Unreleased

## v0.5.23 - 2026-06-17

This patch improves the end-user command experience for long runtime checks.
Status and install verification now print an immediate progress message before
they collect Codex CLI, MCP, Git, skill, and log metadata evidence.

## Highlights

- `npm run chef -- --status` now tells the user that Codex runtime, MCP, Git,
  and log metadata checks are being collected and may take 30-60 seconds.
- `npm run codex:status:all` prints an immediate status preamble before the
  heavier runtime probes run.
- `npm run verify:install:runtime -- --expect-skills --expect-git-guards`
  prints an immediate verification preamble before installed-runtime checks run.
- JSON outputs remain machine-readable; progress text is only printed in human
  text mode.

## Verification

Release readiness for this version should include:

```bash
npm run validate
npm run check
npm run validate:release
npm run chef -- --status --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.22 - 2026-06-17

This patch fixes the release CI validation path for environments that do not
have the Codex CLI installed yet. The status board still reports Codex CLI
availability as an attention item, but validation no longer fails before a new
user installs Codex.

## Highlights

- Ambient Codex status stays visible even when the configured `codex` command
  is unavailable.
- `npm run validate:status` now includes a missing-Codex fixture so Ubuntu CI
  and fresh machines keep this behavior covered.
- The release keeps the v0.5.21 premium status board work intact while making
  it safe for public CI and first-run validation.

## Verification

Release readiness for this version should include:

```bash
npm run validate
npm run check
npm run validate:release
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.21 - 2026-06-17

This patch completes the premium operator status pass for Codex Chef. The
status board now shows a clearer end-user handoff, live Codex runtime evidence,
safe log metadata, and Git/release attention signals without exposing local
file contents.

## Highlights

- `npm run codex:status:all` now includes a quick-start section, target and
  ambient Codex runtime probes, version/login/MCP checks, Git health, routing
  profile visibility, and effective-control summaries.
- Recent log reporting is metadata-only: names, timestamps, and sizes are shown,
  but log contents are not inspected or printed.
- CLI validation now blocks icon/mojibake regressions, escaped Windows path
  leaks, false clean states for dirty Git worktrees, and fake Codex probe
  regressions.
- `npm run chef -- --status` no longer forces `TERM=dumb`, avoiding false
  `codex doctor` terminal-health failures on real Windows terminals.

## Verification

Release readiness for this version should include:

```bash
npm run validate
npm run check
npm run validate:release
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.20 - 2026-06-17

This patch keeps the latest public documentation cleanup inside the released
history by removing remaining machine-specific local-audit path details from
verification docs.

## Highlights

- Local audit docs now describe the verification boundary without exposing
  workstation-specific path details.
- The release tag is aligned with the latest validated `main` commit after the
  final documentation cleanup.

## Verification

Release readiness for this version should include:

```bash
npm run validate
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --auth --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.19 - 2026-06-17

This patch keeps Codex Chef's public auth guidance safer by treating GitHub
account repair as an operator boundary instead of printing account-scoped
re-auth commands in the public CLI and README.

## Highlights

- `npm run chef -- --auth` now explains the GitHub authentication boundary,
  points operators to organization policy, and keeps token/scope decisions out
  of repo files, logs, prompts, skills, rules, and examples.
- README and Turkish README now describe stale GitHub auth recovery without
  embedding account-scoped `gh auth login` or global credential-helper commands.
- `npm run validate:chef-cli` now smoke-tests the public-safe `--auth` output.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --auth --plain --no-log
npm run chef -- --mcp --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.18 - 2026-06-17

This patch fixes the cross-platform CI assertion for the Codex Chef CLI
reset-preview smoke test. Windows emits PowerShell `-WhatIf` lines, while Linux
CI exercises the Bash dry-run branch; the validator now checks the shared
`completed: Codex Chef dry run` signal instead of a Windows-only string.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --preview --plain --no-log
npm run chef -- --reset --plain --no-log
npm run chef -- --skills --plain --no-log
npm run chef -- --mcp --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.17 - 2026-06-17

This patch closes the final audit findings on the Codex Chef operator CLI.

## Highlights

- Added `npm run chef -- --status --no-log` and the general `--no-log` flag for
  strict audits that should not create ignored repo-local CLI logs.
- Expanded `npm run chef -- --mcp` output with transport, endpoint/package,
  source, and config-detail guidance for safer connector selection.
- Strengthened `npm run validate:chef-cli` with real no-log CLI smoke checks for
  help, MCP, skills, and reset preview paths.
- Repaired the Turkish MCP catalog encoding.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --preview --plain --no-log
npm run chef -- --reset --plain --no-log
npm run chef -- --skills --plain --no-log
npm run chef -- --mcp --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.16 - 2026-06-16

This patch closes the remaining CLI completion gaps from the original Codex
Chef operator goal: safe reset/reinstall, skill selection, and MCP selection are
now first-class menu flows.

## Highlights

- Added `npm run chef -- --reset` for backup-backed managed refresh/reinstall
  preview, plus `npm run chef -- --reset --apply` for explicit apply-gated
  execution.
- `npm run chef -- --skills` now shows the reviewed skill table and, in an
  interactive terminal, lets the user select one skill by number. Installation
  still requires `--apply`.
- `npm run chef -- --mcp` now lets interactive users select one connector by
  number and prints setup, auth, verification, source, risk, and rollback notes
  without enabling account/database/filesystem connectors.
- CLI validation now requires the reset, skill selection, MCP explanation,
  redaction, auth guidance, and log surfaces before release.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run chef -- --status --plain
npm run chef -- --preview --plain
npm run chef -- --reset --plain
npm run chef -- --skills --plain
npm run chef -- --mcp --plain
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.15 - 2026-06-16

This patch adds the Codex Chef operator CLI so Windows-first users can run the
whole setup, repair, status, MCP, skill, auth, and log workflow from one
numbered menu while keeping write actions explicit.

## Highlights

- Added `npm run chef` with a numbered menu for status, doctor, preview,
  install, repair, skills, MCP guidance, GitHub auth guidance, and recent logs.
- Added noninteractive flags such as `--status`, `--preview`, `--repair
  --apply`, `--install --apply`, `--skills`, `--mcp`, `--auth`, and `--logs`.
- Write paths are labeled in the menu and require `--apply` or an explicit
  confirmation before they call the backup-backed installer or repair script.
- CLI child-process output is redacted for local paths and common secret-shaped
  values before it reaches the terminal or `tmp/chef-cli/logs`.
- Added `npm run validate:chef-cli` and wired it into `npm run check`,
  security audit, package surface, repo shape, and release readiness gates.
- Replaced concrete GitHub CLI and Git Credential Manager recovery commands with
  public-safe auth boundary guidance for release and HTTPS Git auth failures.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run chef -- --status --plain
npm run chef -- --preview --plain
npm run chef -- --repair --plain
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.14 - 2026-06-16

This patch closes the remaining connector and documentation gaps found during
the final Codex Chef audit. App connector browsing is now parked by default,
repair mode migrates older installs safely, and the README documents the
installer parameters operators actually need.

## Highlights

- Disabled app/connectors by default with `apps._default.enabled = false` so
  app connector browsing stays opt-in like authenticated MCP connectors.
- `npm run repair:install` now removes the deprecated
  `apps._default.default_tools_enabled` key and rewrites older
  `apps._default.enabled = true` managed defaults back to the safe parked state.
- Security, status, and repair validation now require
  `apps._default.enabled = false`,
  `apps._default.destructive_enabled = false`, and
  `apps._default.open_world_enabled = false`.
- Added README install-parameter tables for `-All`, `-Interactive`, `-WhatIf`,
  `-Repair`, `-Force`, `-NoBackup`, `-InstallSkills`, `-InstallGitGuards`, and
  `-PlainOutput`.
- Clarified the documentation model: English and Turkish carry full operator
  detail, while German, Spanish, Brazilian Portuguese, and French pages remain
  safety summaries and source indexes.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.13 - 2026-06-16

This patch finishes the runtime compatibility hardening for current Codex
installs. It keeps strict config clean, prevents normal local approval rules
from looking like managed-file drift, and makes the status board clearer about
non-blocking WebSocket fallback warnings.

## Highlights

- Added an enterprise routing board with `catalog/routing-profiles.json` and
  `npm run codex:routing`. The board maps common task shapes to the expected
  subagents, skills, MCPs, and config/profile flags while keeping risky actions
  approval-gated.
- `npm run codex:status` now includes the routing board summary, and the
  PowerShell/Bash installers show enterprise routing profiles in the capability
  board printed after setup.
- Added MCP setup hints to the machine-readable catalog, installer capability
  board, status board, and MCP docs so tooling, OAuth, filesystem-path, and
  `SUPABASE_DB_URL` requirements are visible before connector opt-in.
- Added an effective-controls summary to `npm run codex:status` and a routing
  profile visibility gate for the global `AGENTS.md` template.
- Removed the deprecated `apps._default.default_tools_enabled` config key from
  shipped templates and repair handling so `codex exec --strict-config` can start
  cleanly on Codex v0.140.0.
- Runtime verification now checks that `rules/default.rules` contains the
  managed Codex Chef safety baseline while allowing local approval rules added
  by normal Codex use.
- Repair mode merges the managed rules baseline without deleting local approval
  rules.
- `npm run codex:status` keeps provider, MCP, and config issues actionable
  while treating the WebSocket timeout as a non-blocking warning when the rest
  of Codex doctor is healthy and HTTPS fallback is available.
- Updated first-party Skills CLI mappings to the current upstream skill names
  `ai-project-starter`, `prompt-architect`, and `ai-skill-create`.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run codex:status:all
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.12 - 2026-06-16

This patch tightens the new end-user status board. It keeps the status command
useful for real installs while avoiding unnecessary disclosure of user-installed
extra skill names in machine-readable output.

## Highlights

- `npm run codex:status` now reports total installed skills, Codex Chef curated
  baseline count, missing curated count, and other/user-installed count.
- The report keeps extra skill details count-only, which is enough for context
  pressure diagnosis without exposing a user's broader global skill inventory.
- `npm run repair:install` plus installer `-Repair` / `--repair` give existing
  global Codex users a backup-backed repair path before force replacement. It
  reconciles managed drift, preserves unrelated marketplace plugins, and
  reports extra or duplicate user skills without deleting them.
- No MCP defaults, global Git guard behavior, or curated skill sources changed
  in this patch.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.11 - 2026-06-16

This patch raises the enterprise-readiness bar without changing the safe
installer defaults. The main improvement is source-backed operating knowledge:
the bundled specialist agents now know when to use official PowerShell, Git,
GitHub supply-chain, SLSA, npm provenance, npm trusted publishing, and Sigstore
guidance instead of relying on generic best-practice memory.

## Highlights

- Added official PowerShell execution-policy and Git config sources to the
  research corpus so Windows setup and optional global Git guards stay explicit,
  process-scoped, and reversible.
- Added GitHub supply-chain security and dependency-review sources so package
  manifest, lockfile, workflow, and dependency-review changes are treated as
  release/security evidence.
- Added SLSA, npm provenance, npm trusted publishing, and Sigstore sources so
  release verification can distinguish source/build traceability, tokenless npm
  publishing, signing, transparency-log evidence, and residual risk.
- Updated the DevEx, doctor, security, release, and code-review specialist
  agents with runtime source markers for those areas.
- Preserved the existing install safety model: `-All` still avoids global Git
  config changes, existing `config.toml` is merged instead of overwritten, and
  authenticated MCP connectors remain opt-in.
- Expanded the runtime verifier so it checks installed managed file drift
  against the current repo templates while reporting ambient `CODEX_HOME` drift
  separately from the explicit install target.

## Upgrade Notes

Recommended guided Windows install:

```powershell
.\scripts\install.ps1 -All -Interactive
```

Automation-friendly install without questions:

```powershell
.\scripts\install.ps1 -All
```

Read-only runtime verification after install:

```bash
npm run verify:install:runtime -- --expect-skills
```

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.10 - 2026-06-16

This patch turns the installer into a clearer guided onboarding flow while
preserving the quiet automation path. New users can see exactly what Codex Chef
will install, which optional switches are risky, and which agents, MCPs, and
skills are available after the run.

## Highlights

- Changed the recommended Windows quickstart to
  `.\scripts\install.ps1 -All -Interactive` so the first real install asks for
  Codex/Agents homes, reviewed skill installation, backup-backed replacement,
  optional Git guards, and final confirmation.
- Kept `.\scripts\install.ps1 -All` as the noninteractive automation path for
  scripted installs and repeatable smoke tests.
- Added the same guided mode to Bash/WSL with `./scripts/install.sh --all
  --interactive`.
- Added a post-install capability board to both installers. It prints the
  installed specialist agents, default-ready MCP servers, disabled opt-in MCP
  connectors, local plugin skills, and reviewed global skills.
- Kept account, database, production, and broad filesystem connectors disabled
  by default and called that out directly in the installer output.
- Expanded installer validation so guided prompts and the capability board
  cannot silently drift out of PowerShell or Bash.

## Upgrade Notes

Recommended guided Windows install:

```powershell
.\scripts\install.ps1 -All -Interactive
```

Automation-friendly install without questions:

```powershell
.\scripts\install.ps1 -All
```

Bash/WSL guided install:

```bash
./scripts/install.sh --all --interactive
```

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.9 - 2026-06-16

This patch finishes the install polish pass: the first screen now presents
agents, skills, and MCPs at the same level, and the Windows installer can be
run as a clean one-shot install or a guided setup without clobbering existing
Codex config.

## Highlights

- Added a prominent README MCP connector board with default-enabled
  local/research servers and disabled-by-default account, database, production,
  and broad filesystem connectors.
- Replaced the Codex Chef icon with a more polished animated badge and updated
  the banner command to show the safe default `.\scripts\install.ps1 -All`
  path.
- Added PowerShell `-Interactive` for guided Codex/Agents home selection and
  optional Git-guard opt-in. It does not ask for tokens, secrets, or
  credentials.
- Added PowerShell `-PlainOutput` and Bash `--plain-output` for older Windows
  consoles, CI logs, and terminals that render Unicode poorly.
- Aligned installer section/status output across PowerShell and Bash while
  preserving the safe default: existing `config.toml` is backed up and merged,
  not overwritten, unless the user deliberately chooses force.
- Updated install and expected-output docs to match the richer installer UX and
  runtime verification handoff.

## Upgrade Notes

Safe first install or existing-user merge:

```powershell
.\scripts\install.ps1 -All
```

Guided Windows install:

```powershell
.\scripts\install.ps1 -All -Interactive
```

Plain ASCII output:

```powershell
.\scripts\install.ps1 -All -PlainOutput
```

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.8 - 2026-06-16

This patch makes first-run and existing-user installs line up with the promise
in the README: Codex Chef can now enrich an existing Codex config without
clobbering it.

## Highlights

- Added `scripts/merge-codex-config.mjs`, a dependency-free helper that appends
  only missing managed Codex Chef tables from the template.
- Updated PowerShell and Bash installers so an existing `config.toml` is backed
  up and then safely merged when force is not used.
- Existing user-defined tables are preserved. Existing MCP entries, tokens,
  profiles, model settings, and custom tool settings are not overwritten unless
  the user deliberately chooses `-Force` / `--force`.
- Skill installation now uses an ignored repo-local npm cache by default to
  avoid Windows `%LOCALAPPDATA%` npm cache permission failures during `npx`
  resolution.
- Corrected the install-plan collision policy for `codex-config` so previews
  show `merge-missing-blocks-unless-force-backup-before-replace`.
- Expanded the README MCP section into an icon-rich catalog of default-enabled
  servers and disabled-by-default opt-in connectors.
- Added installer-alignment validation so both install surfaces must keep the
  config merge helper wired in.

## Upgrade Notes

First install:

```powershell
.\\scripts\\install.ps1 -All
npm run verify:install:runtime -- --expect-skills
```

Existing install, preserve user config and merge missing Codex Chef blocks:

```powershell
.\\scripts\\install.ps1 -All
```

Deliberate template replacement after preview and backup:

```powershell
.\\scripts\\install.ps1 -All -Force -WhatIf
.\\scripts\\install.ps1 -All -Force
```

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.7 - 2026-06-16

This patch tightens the real install handoff: Codex Chef now has a read-only
runtime verifier that separates "the files are installed" from "this Codex CLI
process is reading the same home."

## Highlights

- Added `npm run verify:install:runtime`, backed by
  `scripts/verify-install-runtime.mjs`.
- The verifier checks installed Codex Chef files, MCP config blocks, specialist
  agent files, the plugin marketplace, optional skills, optional Git guards,
  and installed-target Codex runtime visibility without writing to user config.
- Ambient sandbox/offline `CODEX_HOME` drift is now reported as a warning while
  the verifier reruns Codex CLI checks against the explicit installed target.
- Managed file drift is now detected for installed agent, rule, profile, and
  plugin files so stale installs cannot pass by name count alone.
- Added `npm run codex:status` and `npm run codex:status:all` as an end-user
  status board for repo health, installed runtime drift, Codex doctor checks,
  and skills context-budget warnings.
- Changed first-install README and guide commands to omit `-Force` /
  `--force`, protecting existing user config by default.
- Clarified that force is for deliberate upgrades after preview and backup, not
  for the normal first-run path.
- Added troubleshooting guidance for the case where `codex doctor --json` or
  `codex mcp list` reads a sandbox/offline Codex home instead of the installed
  `~/.codex`.
- Installer success output now points users at the runtime verifier.

## Upgrade Notes

Existing users should preview before replacing managed files. Use force only
when you intentionally want the newer templates to replace installed managed
targets after backup:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
```

```powershell
.\\scripts\\install.ps1 -All -Force -WhatIf
.\\scripts\\install.ps1 -All -Force
npm run verify:install:runtime -- --expect-skills
```

For a first install on a machine that may already have Codex config, omit force:

```powershell
.\\scripts\\install.ps1 -All
npm run verify:install:runtime -- --expect-skills
```

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.6 - 2026-06-16

This patch makes the installed Codex Chef setup more ergonomic after a real
Windows install, without broadening default write access.

## Highlights

- Added per-tool MCP approval overrides for read-only browser evidence,
  repository indexing, diagnostics, and memory lookup commands.
- Kept interactive browser actions, account-backed connectors, filesystem
  connectors, production services, and mutating tools prompt-gated or disabled
  by default.
- Tightened MCP block parsing in the doctor and MCP validators so nested tool
  override tables are validated without being miscounted as separate servers.
- Expanded conservative command rules for read-only PowerShell, Git, GitHub CLI,
  Gitleaks, and local validation commands.
- Updated plugin metadata and expected-output examples to match the patch
  version.

## Upgrade Notes

Users who already installed v0.5.5 can preview and re-run the normal install
flow to apply the updated config and rules. Existing global files are backed up
before replacement when `-Force` is used.

```bash
node scripts/plan-install.mjs --all --json --redact-paths
```

```powershell
.\\scripts\\install.ps1 -All -Force -WhatIf
.\\scripts\\install.ps1 -All -Force
```

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.5 - 2026-06-16

- Added a root `llms.txt` file so coding agents can quickly discover the
  install surface, docs map, safety boundaries, verification commands, and
  high-signal comparison sources without scraping the full README first.
- Made `llms.txt` part of the package and validation surface through
  `package.json`, `scripts/validate-repo.mjs`, and
  `scripts/validate-package-surface.mjs`.
- Linked the agent-readable index from all six README entry points and the
  completion audit.
- Agent research corpus entries now include per-agent `expertiseSignals` for
  decision heuristics, failure modes, and verification signals. The corpus
  validator requires every bundled specialist to keep all three groups.
- Every specialist role file now includes an `Expertise signal contract`, and
  validation requires exactly one copy so the structured expertise metadata is
  consumed at runtime.
- The corpus now carries `supplementalResearchRefs` for repo patterns, skill
  examples, local command snapshots, official project docs, and agent research
  papers. Validation keeps these sources freshness-checked and explicitly
  outside default runtime authority unless they are promoted into
  `authorityRefs`.
- Agent research corpus authority references now include source freshness
  cadence metadata. `scripts/validate-agent-research-corpus.mjs` rejects
  cadence values that are too loose for the source staleness risk and fails
  when `dateChecked` is older than the strictest cadence.

## Upgrade Notes

No installer behavior changed in this patch. Existing users can pull the new
source and inspect `llms.txt`; real global writes still require the normal
installer path and dry-run preview.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.4 - 2026-06-15

This patch finishes the Codex Chef hardening pass after v0.5.3. It keeps the
installer safety model intact while adding explicit app connector guardrails,
mojibake validation, stronger bundled skill documentation, and a clearer
GStack/ECC comparison for users who want agent-like workflows without unsafe
default automation.

## Highlights

- Added the bundled local `context-budget-planner` skill for token/context
  budgeting, source prioritization, compaction handoff, and verification gates.
- Kept `impeccable`, extra design-taste, Vercel, prompt, context, memory, and
  token-related skills visible as manual opt-in catalog references while
  expanding the reviewed install set to sixteen public/first-party global
  skills.
- Documented that public `token` skill search results skew toward
  auth/deployment/crypto-token workflows, so LLM context budgeting is handled
  by the local bundled skill instead of an external default install.
- Made all bundled local plugin skills reference-backed with `references/*.md`
  and `agents/openai.yaml`, then added `npm run validate:plugin-skills` to keep
  `SKILL.md`, references, UI metadata, and catalog entries aligned.
- Documented the exact offline diagram contract so Mermaid, Excalidraw, SVG,
  PNG, and Markdown claims match the deterministic local renderer.
- Added the first-party ecosystem skills
  `ai-project-starter`, `prompt-architect`, and `ai-skill-create` to the
  reviewed `-All` / `-InstallSkills` set in
  `catalog/skills.json`, `catalog/skills-lock.json`, and the skills docs.
- Kept global Git ignore, hook, and Git config changes out of `-All`; users
  must opt in with `-InstallGitGuards` / `--install-git-guards`.
- Added explicit app/connector safety defaults:
  `apps._default.destructive_enabled = false` and
  `apps._default.open_world_enabled = false`.
- Added a content-safety gate for likely mojibake so localized READMEs and docs
  do not regress silently.
- Sandboxed online skill-source checks under ignored `tmp/skill-source-check`
  so source validation can resolve public skills without letting Skills CLI
  side effects touch tracked templates.
- Expanded the GStack/ECC comparison notes to document which workflow ideas were
  adopted and which were kept out of default install for safety.
- Added research-synthesis and adversarial-validation guidance to all
  twenty-one specialist agent role files so high-signal external repos can
  inform work without becoming hidden prompt bulk or unsafe copied automation.
- Added source-refresh, source-currency, and corpus-expansion guidance to all
  twenty-one specialist agent role files so each agent refreshes stale evidence
  and knows how to widen domain knowledge into compact operating rules.
- Added expert-calibration guidance to all twenty-one specialist agent role
  files so each agent checks its output against a role-specific senior-quality
  bar before handing work back.
- Strengthened agent validation so each specialist role file must keep exactly
  one copy of each required guardrail block, at least 100 source-backed
  instruction items, and at least 20 distinct source markers.
- Added `catalog/agent-research-corpus.json` and
  `scripts/validate-agent-research-corpus.mjs` so specialist-agent research
  domains, source types, refresh triggers, and handoffs are machine-checkable.
- Added reviewed `authorityRefs` metadata to the agent research corpus so each
  specialist can point at stable official, vendor, standard, and tool-source
  families with URL, source type, staleness risk, and source markers; the
  validator now confirms those keys are represented in the matching agent TOML
  source markers.
- Added an `Authority metadata contract` block to every specialist TOML so
  invoked agents use source markers as runtime guidance.
- Added explicit workflow mapping for cross-model review patterns: Codex Chef
  can support them through `code_reviewer` and manual Codex CLI use, but it does
  not auto-launch another agent or external review flow.

## Upgrade Notes

- `-All` still installs the core Codex Chef setup and reviewed skill set, but
  global Git guard changes remain opt-in through `-InstallGitGuards` /
  `--install-git-guards`.
- Existing global Codex files are backed up before replacement when users run a
  real install with force.
- Authenticated MCP/app connectors remain disabled or least-privilege by
  default; destructive and open-world connector tools require a reviewed
  override.

## Verification

Release readiness for this version should include:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

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
- Documented the then-current Codex Chef agent team from the actual setup source:
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
