# Verification

Run the full local gate before committing, pushing, or telling another user to
install the setup.

```bash
npm run check
```

This runs:

- `scripts/validate-repo.mjs`: repository shape, JSON/TOML heuristics, plugin
  manifest, skill metadata, MCP metadata, README signals, SVG accessibility, and
  basic leak-pattern checks. It also checks that `package.json`, `CHANGELOG.md`,
  and release notes agree on the current version.
- `scripts/validate-docs.mjs`: Markdown relative link checks and GitHub workflow
  shape checks.
- `scripts/validate-readme-locales.mjs`: root README language switcher,
  localized entry-point files, shared install/verification signals, and
  placeholder localization checks.
- `scripts/validate-workflow-security.mjs`: GitHub Actions hardening checks for
  least-privilege permissions, `actions/checkout` credential persistence,
  publish/auth command boundaries, and implicit dependency installs.
- `scripts/validate-install-plan.mjs`: install manifest, collision policy,
  required flags, source paths, and high-risk operation checks.
- `scripts/validate-install-state-preview.mjs`: machine-readable no-write plan
  output contract, selected/skipped component IDs, operation shape, source
  version alignment, and high-risk selection checks.
- `scripts/validate-installer-alignment.mjs`: manifest-to-installer drift
  checks for PowerShell and Bash install surfaces.
- `scripts/validate-repair-install.mjs`: fixture-based repair-mode validation
  for drift preview, backup-backed apply, marketplace preservation, config
  merge, skill cleanup reporting, and explicit managed-plugin pruning.
- `scripts/validate-agent-config.mjs`: specialist-agent catalog/config drift
  checks across Windows and Unix Codex templates.
- `scripts/validate-agent-research-corpus.mjs`: specialist-agent research
  corpus drift, authority-reference source markers, source freshness cadence,
  stale `dateChecked` checks, and per-agent expertise signal coverage.
- `scripts/validate-mcp-config.mjs`: MCP catalog/config drift checks across
  Windows and Unix Codex templates.
- `scripts/validate-chef-cli.mjs`: one-menu Codex Chef CLI contract, safe
  command routing, write-boundary labels, log location, README usage snippets,
  and public-safe GitHub auth boundary guidance.
- `scripts/verify-skill-sources.mjs`: offline skill catalog validation and
  `catalog/skills-lock.json` source-allowlist drift checks.
- `scripts/scan-supply-chain-iocs.mjs`: high-signal remote execution,
  dangerous shell, floating package, and implicit installer dependency checks.
- `scripts/security-audit.mjs`: public-readiness files, bilingual docs, safe
  Codex defaults, shell environment policy, disabled authenticated MCPs, and
  secret/state checks.
- `scripts/validate-package-surface.mjs`: source package dry-run validation
  using `npm pack --dry-run --json --ignore-scripts` with a repo-local npm
  cache, rejecting scratch output, local agent state, auth files, archives, and
  release artifacts.
- `scripts/validate-release-readiness.mjs`: release notes, GitHub settings docs,
  workflow hardening, Gitleaks gate documentation, and source artifact hygiene.
- `scripts/verify-install-runtime.mjs`: optional read-only post-install runtime
  verification that compares installed Codex Chef targets with the active
  Codex CLI `CODEX_HOME`.

Additional release checks:

```bash
git status --short
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

The repository `.gitleaks.toml` keeps default Gitleaks rules enabled while
excluding ignored local scratch, dependency, build, and cache directories.

When installable skills change, also run the network-backed resolver check:

```bash
npm run verify:skills:online
```

The online verifier uses an ignored workspace-local npm cache at
`tmp/npm-cache` so Windows checks do not depend on the current user's global npm
cache permissions. Each installable skill resolution is bounded by a per-skill
timeout so release verification returns a concrete pass/fail instead of hanging.

## Syntax Checks

Run available parser checks locally:

```bash
node --check scripts/validate-repo.mjs
node --check scripts/validate-docs.mjs
node --check scripts/validate-readme-locales.mjs
node --check scripts/validate-workflow-security.mjs
node --check scripts/validate-content-safety.mjs
node --check scripts/validate-install-plan.mjs
node --check scripts/validate-install-state-preview.mjs
node --check scripts/validate-installer-alignment.mjs
node --check scripts/plan-install.mjs
node --check scripts/validate-agent-config.mjs
node --check scripts/validate-agent-research-corpus.mjs
node --check scripts/validate-mcp-config.mjs
node --check scripts/chef-cli.mjs
node --check scripts/validate-chef-cli.mjs
node --check scripts/verify-skill-sources.mjs
node --check scripts/scan-supply-chain-iocs.mjs
node --check scripts/validate-package-surface.mjs
node --check scripts/validate-release-readiness.mjs
node --check scripts/security-audit.mjs
```

Install plan smoke:

```bash
node scripts/plan-install.mjs --list-profiles
node scripts/plan-install.mjs --list-operations
node scripts/plan-install.mjs --all --json
```

On systems with Bash:

```bash
bash -n scripts/install.sh
```

On Windows:

```powershell
$errors = $null
$tokens = $null
[System.Management.Automation.Language.Parser]::ParseFile("scripts/install.ps1", [ref]$tokens, [ref]$errors) | Out-Null
$errors
```

## Installer Smoke Tests

PowerShell dry run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Bash dry run:

```bash
./scripts/install.sh --all --dry-run
```

Codex Chef CLI smoke:

```bash
npm run validate:chef-cli
npm run chef -- --status
npm run chef -- --status --no-log
npm run chef -- --preview
npm run chef -- --reset
```

`npm run chef` opens the numbered operator menu. The noninteractive smoke
commands above do not write global/user state. They create ignored repo-local
CLI logs unless `--no-log` is supplied. Write paths require `--apply`:
`npm run chef -- --reset --apply` for backup-backed managed refresh,
`npm run chef -- --repair --apply` for backup-backed repair, and
`npm run chef -- --install --apply` for a full managed install. In an
interactive terminal, `npm run chef -- --skills` lets the user select one
reviewed skill by number, and `npm run chef -- --mcp` lets the user select one
connector by number for transport, endpoint/package, setup/auth/source/rollback
notes without enabling it.

CI also runs Bash dry-run and PowerShell `-WhatIf` smoke checks with temporary
homes so installer runtime branches are exercised without global writes.

Temporary-home smoke tests are allowed when you intentionally want files written
under ignored `tmp/` paths:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
.\scripts\install.ps1
```

The generated `tmp/` folder is ignored and must not be committed.

## Real Install Verification

Run the real installer only after the user explicitly approves writes to the
current user's Codex/Git setup:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -Interactive
```

Expected skill behavior is idempotent and quiet: already installed skills are
reported as `Skill already installed`, successful new installs are reported as
`Installed skill`, and raw Skills CLI output is shown only when clone,
installation, or write failures need diagnosis.

For a single end-user view of repo health, installed runtime drift, Codex
doctor checks, skills context-budget pressure, routing controls, and MCP setup
requirements, run:

```bash
npm run codex:status
```

Use `npm run codex:status:all` when the real install intentionally included
curated global skills and optional Git guards.

After a real install or upgrade, run the read-only runtime verifier:

```bash
npm run verify:install:runtime -- --expect-skills
```

Use `--expect-skills` only when the real install included `-All` or
`-InstallSkills`. The verifier checks managed files for source drift, runs
Codex CLI checks with `CODEX_HOME` explicitly set to the installed target,
reports ambient sandbox/offline home drift as a warning, and fails only when
the installed target itself cannot be verified.

## Remote Verification

After an approved push:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

The two hashes should match. Then verify the GitHub Actions run status before
publishing release notes.
