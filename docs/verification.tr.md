# Doğrulama

Commit, push veya başka bir kullanıcıya kurulum önermeden önce tam lokal gate'i
çalıştır:

```bash
npm run check
```

Bu komut şunları çalıştırır:

- `scripts/validate-repo.mjs`: repo yapısı, JSON/TOML heuristics, plugin
  manifest, skill metadata, MCP metadata, README sinyalleri, SVG
  erişilebilirliği ve temel leak-pattern kontrolleri. Ayrıca `package.json`,
  `CHANGELOG.md` ve release notes dosyalarının current version için aynı hizada
  olduğunu kontrol eder.
- `scripts/validate-docs.mjs`: Markdown relative link kontrolleri ve GitHub
  workflow shape kontrolleri.
- `scripts/validate-readme-locales.mjs`: kok README dil switcher'i, lokalize
  giris dosyalari, ortak install/verification sinyalleri ve placeholder
  localization kontrolleri.
- `scripts/validate-workflow-security.mjs`: GitHub Actions icin
  least-privilege permissions, `actions/checkout` credential persistence,
  publish/auth komutu sinirlari ve implicit dependency install kontrolleri.
- `scripts/validate-install-plan.mjs`: install manifest, collision policy,
  required flag'ler, source path'ler ve high-risk operation kontrolleri.
- `scripts/validate-install-state-preview.mjs`: makine okunur no-write plan
  cikti sozlesmesi, selected/skipped component ID'leri, operation sekli, source
  version hizasi ve high-risk selection kontrolleri.
- `scripts/validate-installer-alignment.mjs`: PowerShell ve Bash install
  yuzeyleri icin manifest-to-installer drift kontrolleri.
- `scripts/validate-agent-config.mjs`: Windows ve Unix Codex template'leri icin
  uzman ajan catalog/config drift kontrolleri.
- `scripts/validate-agent-research-corpus.mjs`: uzman ajan research corpus
  drift'i, authority-reference source marker'lari, source freshness cadence ve
  stale `dateChecked` kontrolleri ile agent basina expertise signal coverage.
- `scripts/validate-mcp-config.mjs`: Windows ve Unix Codex template'leri icin
  MCP catalog/config drift kontrolleri.
- `scripts/verify-skill-sources.mjs`: offline skill catalog validation ve
  `catalog/skills-lock.json` kaynak allowlist drift kontrolleri.
- `scripts/scan-supply-chain-iocs.mjs`: remote execution, tehlikeli shell,
  floating package ve implicit installer dependency kontrolleri.
- `scripts/security-audit.mjs`: public-readiness dosyaları, iki dilli docs,
  güvenli Codex default'ları, shell environment policy, disabled authenticated
  MCP'ler ve secret/state kontrolleri.
- `scripts/validate-package-surface.mjs`: repo-local npm cache ile `npm pack
  --dry-run --json --ignore-scripts` kullanarak source package dry-run
  validation yapar; scratch output, local agent state, auth file, archive ve
  release artifact'larini reddeder.
- `scripts/validate-release-readiness.mjs`: release notes, GitHub settings docs,
  workflow hardening, Gitleaks gate dokumantasyonu ve source artifact hygiene.
- `scripts/verify-install-runtime.mjs`: opsiyonel read-only post-install
  runtime kontrolü. Kurulu Codex Chef hedeflerini aktif Codex CLI `CODEX_HOME`
  ile karşılaştırır.

Ek release kontrolleri:

```bash
git status --short
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Repo `.gitleaks.toml` default Gitleaks kurallarını açık tutar; yalnızca ignored
local scratch, dependency, build ve cache dizinlerini kapsam dışı bırakır.

Installable skill'ler değiştiğinde network-backed resolver kontrolünü de çalıştır:

```bash
npm run verify:skills:online
```

Online dogrulayici, Windows kontrollerini kullanicinin global npm cache
izinlerine baglamamak icin yok sayilan `tmp/npm-cache` calisma alani cache'ini
kullanir. Her installable skill resolution per-skill timeout ile sinirlanir; bu
sayede release verification hang etmek yerine somut pass/fail uretir.

## Syntax Kontrolleri

Lokal ortamda mümkün olan parser kontrolleri:

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

Bash olan sistemlerde:

```bash
bash -n scripts/install.sh
```

Windows'ta:

```powershell
$errors = $null
$tokens = $null
[System.Management.Automation.Language.Parser]::ParseFile("scripts/install.ps1", [ref]$tokens, [ref]$errors) | Out-Null
$errors
```

## Installer Smoke Testleri

PowerShell dry run:

```powershell
.\scripts\install.ps1 -All -WhatIf
```

Bash dry run:

```bash
./scripts/install.sh --all --dry-run
```

CI ayrica temporary home path'leriyle Bash dry-run ve PowerShell `-WhatIf`
smoke check calistirir; boylece installer runtime branch'leri global write
yapmadan denenir.

Temporary-home smoke testleri sadece bilerek ignored `tmp/` path'leri altında
dosya oluşturmak istediğinde kullanılmalı:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
.\scripts\install.ps1
```

Oluşan `tmp/` klasörü ignored durumdadır ve commit edilmemelidir.

## Gerçek Install Doğrulaması

Gerçek installer yalnızca kullanıcı mevcut Codex/Git setup'ına yazmayı açıkça
onayladıktan sonra çalıştırılır:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -Interactive
```

Beklenen skill davranışı idempotent ve sessizdir: kurulu skill'ler `Skill
already installed`, başarılı yeni kurulumlar `Installed skill` olarak görünür;
raw Skills CLI çıktısı yalnızca clone, installation veya write hatasında basılır.

Gerçek kurulum veya upgrade sonrası read-only runtime verifier çalıştır:

```bash
npm run verify:install:runtime -- --expect-skills
```

`--expect-skills` flag'ini sadece gerçek kurulumda `-All` veya `-InstallSkills`
kullandıysan ver. Verifier aktif Codex CLI'ın kurulan hedeften farklı bir
`CODEX_HOME` okuduğunu görürse fail eder; böylece sandbox/offline home drift'i
kullanıcı config'ini değiştirmeden yakalanır.

## Remote Doğrulama

Onaylı push sonrası:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

İki hash aynı olmalıdır. Ardından release notes yayınlamadan önce GitHub Actions
run durumunu doğrula.
