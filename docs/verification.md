# Verification

Run the full local gate before committing, pushing, or telling another user to
install the setup.

```bash
npm run check
```

This runs:

- `scripts/validate-repo.mjs`: structure, JSON, TOML, plugin, skill, and basic
  leak-pattern checks, including README storefront signals and SVG asset
  accessibility metadata, lightweight animation, reduced-motion fallback, and
  installable skill package and skill-name format.
- `scripts/verify-skill-sources.mjs`: offline skill catalog validation for
  duplicate names, categories, reasons, and installable `package` + `skill`
  pairs.
- `scripts/security-audit.mjs`: public-readiness files, bilingual docs, safe
  Codex defaults, disabled authenticated MCPs, and stronger secret/state
  checks.
- `.github/dependabot.yml`: dependency update hygiene for GitHub Actions and
  the npm manifest.

Additional release checks:

```bash
git status --short
git diff --cached --check
gitleaks detect --redact --no-banner --no-git --verbose
```

When installable skills change, also run the network-backed resolver check:

```bash
npm run verify:skills:online
```

Remote verification after push:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

The two hashes should match.

## Installer Smoke Test

PowerShell, without touching the real user setup:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Force
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('tmp/agents-home/plugins/marketplace.json','utf8')); console.log('marketplace ok')"
```

The generated `tmp/` folder is ignored and must not be committed.
