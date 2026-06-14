# Verification

Run the full local gate before committing, pushing, or telling another user to
install the setup.

```bash
npm run check
```

This runs:

- `scripts/validate-repo.mjs`: repository shape, JSON/TOML heuristics, plugin
  manifest, skill metadata, MCP metadata, README signals, SVG accessibility, and
  basic leak-pattern checks.
- `scripts/validate-docs.mjs`: Markdown relative link checks and GitHub workflow
  shape checks.
- `scripts/verify-skill-sources.mjs`: offline skill catalog validation and
  `catalog/skills-lock.json` drift checks.
- `scripts/security-audit.mjs`: public-readiness files, bilingual docs, safe
  Codex defaults, shell environment policy, disabled authenticated MCPs, and
  secret/state checks.

Additional release checks:

```bash
git status --short
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

When installable skills change, also run the network-backed resolver check:

```bash
npm run verify:skills:online
```

The online verifier uses an ignored workspace-local npm cache at
`tmp/npm-cache` so Windows checks do not depend on the current user's global npm
cache permissions.

## Syntax Checks

Run available parser checks locally:

```bash
node --check scripts/validate-repo.mjs
node --check scripts/validate-docs.mjs
node --check scripts/verify-skill-sources.mjs
node --check scripts/security-audit.mjs
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
.\scripts\install.ps1 -All -Force -WhatIf
```

Bash dry run:

```bash
./scripts/install.sh --all --force --dry-run
```

Temporary-home smoke tests are allowed when you intentionally want files written
under ignored `tmp/` paths:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
.\scripts\install.ps1 -Force
```

The generated `tmp/` folder is ignored and must not be committed.

## Real Install Verification

Run the real installer only after the user explicitly approves writes to the
current user's Codex/Git setup:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -Force
```

Expected skill behavior is idempotent and quiet: already installed skills are
reported as `Skill already installed`, successful new installs are reported as
`Installed skill`, and raw Skills CLI output is shown only when clone,
installation, or write failures need diagnosis.

## Remote Verification

After an approved push:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

The two hashes should match. Then verify the GitHub Actions run status before
publishing release notes.
