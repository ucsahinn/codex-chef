# Doğrulama

Commit, push veya başka bir kullanıcıya kurulum önermeden önce tam lokal gate'i
çalıştır:

```bash
npm run check
```

Bu komut şunları çalıştırır:

- `scripts/validate-repo.mjs`: repo yapısı, JSON/TOML heuristics, plugin
  manifest, skill metadata, MCP metadata, README sinyalleri, SVG
  erişilebilirliği ve temel leak-pattern kontrolleri.
- `scripts/validate-docs.mjs`: Markdown relative link kontrolleri ve GitHub
  workflow shape kontrolleri.
- `scripts/verify-skill-sources.mjs`: offline skill catalog validation ve
  `catalog/skills-lock.json` drift kontrolleri.
- `scripts/security-audit.mjs`: public-readiness dosyaları, iki dilli docs,
  güvenli Codex default'ları, shell environment policy, disabled authenticated
  MCP'ler ve secret/state kontrolleri.

Ek release kontrolleri:

```bash
git status --short
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Installable skill'ler değiştiğinde network-backed resolver kontrolünü de çalıştır:

```bash
npm run verify:skills:online
```

Online dogrulayici, Windows kontrollerini kullanicinin global npm cache
izinlerine baglamamak icin yok sayilan `tmp/npm-cache` calisma alani cache'ini
kullanir.

## Syntax Kontrolleri

Lokal ortamda mümkün olan parser kontrolleri:

```bash
node --check scripts/validate-repo.mjs
node --check scripts/validate-docs.mjs
node --check scripts/verify-skill-sources.mjs
node --check scripts/security-audit.mjs
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
.\scripts\install.ps1 -All -Force -WhatIf
```

Bash dry run:

```bash
./scripts/install.sh --all --force --dry-run
```

Temporary-home smoke testleri sadece bilerek ignored `tmp/` path'leri altında
dosya oluşturmak istediğinde kullanılmalı:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
.\scripts\install.ps1 -Force
```

Oluşan `tmp/` klasörü ignored durumdadır ve commit edilmemelidir.

## Gerçek Install Doğrulaması

Gerçek installer yalnızca kullanıcı mevcut Codex/Git setup'ına yazmayı açıkça
onayladıktan sonra çalıştırılır:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -Force
```

Beklenen skill davranışı idempotent ve sessizdir: kurulu skill'ler `Skill
already installed`, başarılı yeni kurulumlar `Installed skill` olarak görünür;
raw Skills CLI çıktısı yalnızca clone, installation veya write hatasında basılır.

## Remote Doğrulama

Onaylı push sonrası:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

İki hash aynı olmalıdır. Ardından release notes yayınlamadan önce GitHub Actions
run durumunu doğrula.
