# Kurulum Rehberi

Bu rehber starter paketini mevcut kullanıcının Codex home dizinine kurar.
Varsayılan konum `~/.codex` dizinidir. `CODEX_HOME` tanımlıysa installer o
dizini kullanır.

## Gereksinimler

- Codex CLI veya Codex app.
- Git.
- Doğrulama ve isteğe bağlı skill kurulumu için Node.js 18 veya üzeri.
- Stdio MCP sunucuları veya skill kurulumu için `npx`.
- İsteğe bağlı: daha güçlü secret taraması için Gitleaks.
- Windows için isteğe bağlı: en iyi native sandbox deneyimi için `winget`,
  `uvx` ve güncel Windows 11.

## PowerShell Kurulumu

Yazmadan önce ön izle:

```powershell
.\scripts\install.ps1 -All -WhatIf
```

Installer'lari cagirmadan manifest-backed operasyon planini incele:

```bash
node scripts/plan-install.mjs --all --json
```

Tam JSON'i incelemeden once manifest profil ve operasyonlarini listele:

```bash
node scripts/plan-install.mjs --list-profiles
node scripts/plan-install.mjs --list-operations
```

Plan managed target'lari, opsiyonel global Git degisikliklerini, curated skill
komutlarini, collision policy'yi, backup davranisini ve risk seviyesini listeler.

Ön izleme doğruysa kur:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All
```

Rehberli Windows kurulumu:

```powershell
.\scripts\install.ps1 -All -Interactive
```

Kullanışlı parametreler:

- `-All`: Codex template'lerini, yerel Codex Chef plugin'ini, uzman ajanları,
  profilleri, kuralları ve doğrulanmış public/first-party skill'leri kurar.
  Global Git config'i değiştirmez.
- `-InstallSkills`: `catalog/skills.json` içinde `install: true` olan,
  `owner/repo` formatında doğrulanmış `package` ve eşleşen `skill` adı taşıyan
  kayıtları kurar. Installer `npx.cmd skills add <package> --skill <skill>
  --agent codex --yes --global` çağırır ve kullanıcı npm cache env'i
  tanımlamadıysa ignored `tmp/npm-cache` altında repo-local npm cache kullanır.
- `-InstallGitGuards`: global Git ignore, global pre-commit hook kurar ve
  `core.excludesfile` ile `core.hooksPath` ayarlar. Bunu ayrı tutuyoruz çünkü
  mevcut kullanıcıdaki bütün Git repolarını etkiler.
- `-Force`: yedek aldıktan sonra yönetilen Codex dosyalarının üzerine yazar.
  Bunu sadece bilinçli upgrade için, `-WhatIf` çıktısını inceledikten sonra
  kullan. Vermezsen mevcut `config.toml` önce yedeklenir ve sadece eksik Codex
  Chef bloklarını alır; mevcut ajan dosyaları, rule dosyaları ve marketplace
  dosyası atlanır.
- `-NoBackup`: yedeklemeyi kapatır. Tavsiye edilmez.
- `-WhatIf`: gerçek setup'a dokunmadan dosya, Git ve skill operasyonlarını ön
  izler.
- `-Interactive`: özel Codex/Agents home değerlerini ve opsiyonel global Git
  guard seçimini sorar. Token, secret veya credential istemez.
- `-PlainOutput`: eski Windows konsolları, CI logları veya Unicode'u kötü
  gösteren terminaller için emoji yerine ASCII status işaretleri kullanır.

## Bash Veya WSL Kurulumu

Yazmadan önce ön izle:

```bash
./scripts/install.sh --all --dry-run
```

Ön izleme doğruysa kur:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all
```

Kullanışlı flagler:

- `--all`: global Git config'i değiştirmeyen önerilen tam Codex Chef kurulumu.
- `--install-skills`
- `--install-git-guards`: global Git ignore ve hook ayarlarına ayrıca opt-in.
- `--force`: backup aldıktan sonra managed hedefleri değiştirir; vermezsen
  mevcut `config.toml` merge edilir ve diğer mevcut managed dosyalar atlanır.
- `--no-backup`
- `--dry-run`
- `--plain-output`: ASCII status işaretleri kullanır.

## Neler Yedeklenir?

Mevcut dosyalar şu klasöre kopyalanır:

```text
~/.codex/backups/codex-chef-YYYYMMDD-HHMMSS/
```

Installer şu managed target'ları replace etmeden önce yedekler:

- `AGENTS.md`
- `config.toml`
- `rules/default.rules`
- `agents/*.toml`
- kişisel plugin marketplace dosyası
- bundled local plugin dizini

Dizin replacement sadece yönetilen Codex veya Agents home altında yapılır.
Installer unmanaged directory target'larını reddeder.

## Kurulum Sonrası Kontrol

Codex'i yeniden başlat ve çalıştır:

```bash
codex doctor --summary
npm run verify:install:runtime
codex --strict-config "Summarize the active Codex setup."
```

`npm run verify:install:runtime` read-only çalışır. Kurulan `~/.codex` ve
`~/.agents` hedeflerini kontrol eder, sonra bunları `codex doctor --json`
tarafından bildirilen aktif Codex runtime home ile karşılaştırır. Codex bir
sandbox veya farklı `CODEX_HOME` okuyorsa MCP'ler yokmuş gibi davranmak yerine
bu farkı açıkça raporlar.

Codex içinde:

```text
/mcp
/skills
/plugins
/hooks
```

## Gerçek Kuruluma Dokunmadan Test

PowerShell:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
.\scripts\install.ps1 -Force -WhatIf
```

Bash:

```bash
CODEX_HOME="$PWD/tmp/codex-home" AGENTS_HOME="$PWD/tmp/agents-home" \
  ./scripts/install.sh --force --dry-run
```

Non-dry-run temp home'ları yalnızca bilerek smoke install yapmak istiyorsan
kullan. `tmp/` klasörünü de sadece bilerek oluşturduysan temizle.

Zaten bir Codex setup'ın varsa güvenli varsayılan yine normal install
komutudur. Mevcut `config.toml` backup alınarak merge edilir; kullanıcıya ait
tablolar korunur. Diğer mevcut managed dosyalar `-Force` / `--force` vermediğin
sürece atlanır.

## Geri Dönüş

1. Codex'i kapat.
2. Timestamp içeren backup klasöründen dosyaları geri kopyala.
3. Codex'i yeniden başlat.
4. `codex doctor --summary` çalıştır.

Installer backup dosyalarını silmez.
