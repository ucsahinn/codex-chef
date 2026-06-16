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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
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
.\scripts\install.ps1 -All -Interactive
```

Soru sormayan otomasyon dostu kurulum:

```powershell
.\scripts\install.ps1 -All
```

Mevcut global Codex kurulumunu onar:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
.\scripts\install.ps1 -Repair
```

Repair modu, zaten Codex setup'i olan makineler icindir. Codex Chef'in
yonettigi global guidance, rule, agent/profile dosyalari, bundled plugin, eksik
config bloklari ve local plugin marketplace kaydi icin once no-write plan
verir, sonra istenirse backup alarak onarir. Baska marketplace plugin'lerini
korur ve user skill'lerini silmez; fazla veya duplicate global skill'leri
cleanup adayi olarak raporlar.

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
- `-Repair`: ortak repair motoruyla mevcut setup'i onarir. `-WhatIf` ile
  no-write repair plani basar. `-WhatIf` olmadan managed drift'i backup alip
  duzeltir. User skill'lerini silmez.
- `-NoBackup`: yedeklemeyi kapatır. Tavsiye edilmez.
- `-WhatIf`: gerçek setup'a dokunmadan dosya, Git ve skill operasyonlarını ön
  izler.
- `-Interactive`: özel Codex/Agents home değerlerini ve opsiyonel global Git
  guard seçimini sorar. Ayrıca reviewed skill'leri kurup kurmayacağını,
  managed dosyaları backup sonrası force-replace etmek isteyip istemediğini ve
  plan özeti sonrası devam edip etmeyeceğini sorar. Token, secret veya
  credential istemez.
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
- `--repair`: mevcut global Codex setup'i icin backup'li repair uygular;
  `--dry-run` ile no-write plan verir.
- `--no-backup`
- `--dry-run`
- `--plain-output`: ASCII status işaretleri kullanır.
- `--interactive`: Bash/WSL tarafında aynı path, skill, force, Git guard ve
  devam onaylarını soran rehberli setup.

İki installer da en sonda capability board basar: specialist agent'lar,
varsayılan hazır MCP server'ları, disabled/opt-in MCP connector'ları, bundled
plugin skill'leri, reviewed global skill'ler, enterprise routing profile'lari
ve MCP setup notlari. Bu notlar local tooling, OAuth authorization, filesystem
path secimi ve `SUPABASE_DB_URL` gibi gereksinimleri connector'a ihtiyac
duymadan once gosterir. Account, database, production ve geniş filesystem
connector'ları sen açıkça enable edene kadar kapalı kalır.

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
npm run codex:routing
npm run codex:status
npm run verify:install:runtime
codex exec --strict-config "Summarize the active Codex setup."
```

`npm run codex:routing`, `catalog/routing-profiles.json` dosyasindan enterprise
routing panosunu basar: task shape, eslesen subagent, skill, MCP ve
config/profile flag'leri. Bu pano gorunur bir routing kontratidir; gizli hook
veya auto-executor degildir. Hesap, deploy, database, destructive ve genis
filesystem aksiyonlari acik onay gerektirir.

`npm run codex:status` son kullanici status panosudur. Repo-only starter
sagligini, kurulu runtime drift'ini, direkt Codex doctor check ozetlerini,
skill context-budget warning'lerini, routing board ozetini, effective control
ozetini ve MCP setup notlarini birlikte toplar.
Gercek kurulumda curated skill'ler ve opsiyonel Git guard'lar bilerek dahil edildiyse
`npm run codex:status:all` kullan.

`npm run verify:install:runtime` read-only çalışır. Kurulan `~/.codex` ve
`~/.agents` hedeflerini kontrol eder; managed agent, rule, profile ve plugin
dosyalarında source drift olup olmadığına bakar; sonra Codex CLI kontrollerini
`CODEX_HOME` açıkça kurulu hedefe ayarlanmış şekilde çalıştırır. Ambient shell
bir sandbox veya farklı `CODEX_HOME` okuyorsa bu drift warning olarak raporlanır;
verifier yine de kurulu hedefin beklenen MCP config'ini verdiğini kanıtlar.

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

Zaten bir Codex setup'ın varsa once repair planina bak:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
```

Repair temizse normal install komutuna gecebilirsin. Mevcut `config.toml`
backup alınarak merge edilir; kullanıcıya ait tablolar korunur. Diğer mevcut
managed dosyalar `-Force` / `--force` vermediğin sürece atlanır. Managed drift
varsa `-Repair` / `--repair` force'tan daha guvenli ilk adımdır.

## Geri Dönüş

1. Codex'i kapat.
2. Timestamp içeren backup klasöründen dosyaları geri kopyala.
3. Codex'i yeniden başlat.
4. `codex doctor --summary` çalıştır.

Installer backup dosyalarını silmez.
