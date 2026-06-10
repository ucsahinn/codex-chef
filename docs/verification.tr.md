# Doğrulama

Commit, push veya başka bir kullanıcıya kurulum önermeden önce tam lokal gate'i
çalıştır:

```bash
npm run check
```

Bu komut şunları çalıştırır:

- `scripts/validate-repo.mjs`: yapı, JSON, TOML, plugin, skill ve temel
  sızıntı pattern kontrolleri; README storefront sinyalleri ve SVG
  erişilebilirlik metadata'sı, hafif animasyon, reduced-motion fallback ve
  kurulabilir skill package ve skill adı formatı dahil.
- `scripts/verify-skill-sources.mjs`: duplicate adlar, kategoriler, nedenler ve
  kurulabilir `package` + `skill` çiftleri için offline skill katalog
  doğrulaması.
- `scripts/security-audit.mjs`: public repo dosyaları, iki dilli docs, güvenli
  Codex varsayılanları, disabled authenticated MCP'ler ve daha güçlü
  secret/state kontrolleri.
- `.github/dependabot.yml`: GitHub Actions ve npm manifest için dependency
  güncelleme hijyeni.

Ek release kontrolleri:

```bash
git status --short
git diff --cached --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Kurulabilir skill'ler değiştiğinde network destekli resolver kontrolünü de
çalıştır:

```bash
npm run verify:skills:online
```

Tam lokal setup smoke testi için, mevcut kullanıcının Codex ve Git guard
dosyalarını güncellemenin güvenli olduğunu doğruladıktan sonra installer'ı
çalıştır:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -Force
```

Beklenen skill davranışı idempotent ve sessizdir: kurulu skill'ler `Skill
already installed`, başarılı yeni kurulumlar `Installed skill` olarak görünür;
ham Skills CLI çıktısı yalnız clone, installation veya write hatasını teşhis
etmek gerektiğinde basılır.

Push sonrası remote doğrulama:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

İki hash aynı olmalı.

## Installer Smoke Test

Gerçek kullanıcı setup'ına dokunmadan PowerShell testi:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Force
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('tmp/agents-home/plugins/marketplace.json','utf8')); console.log('marketplace ok')"
```

Üretilen `tmp/` klasörü ignore edilir ve commit edilmemelidir.
