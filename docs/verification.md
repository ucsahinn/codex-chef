# Verification

Run the full local gate before committing, pushing, or telling another user to
install the setup.

```bash
npm run check
```

This runs:

- `scripts/validate-repo.mjs`: structure, JSON, TOML, plugin, skill, and basic
  leak-pattern checks.
- `scripts/security-audit.mjs`: public-readiness files, bilingual docs, safe
  Codex defaults, disabled authenticated MCPs, and stronger secret/state
  checks.

Additional release checks:

```bash
git status --short
git diff --cached --check
gitleaks detect --redact --no-banner --no-git --verbose
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
