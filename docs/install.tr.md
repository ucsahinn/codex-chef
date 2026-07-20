# Kurulum Rehberi

Bu rehber starter paketini mevcut kullanıcının Codex home dizinine kurar.
Varsayılan konum `~/.codex` dizinidir. `CODEX_HOME` tanımlıysa installer o
dizini kullanır.

## Gereksinimler

- Codex CLI veya Codex app.
- Git.
- Doğrulama ve isteğe bağlı skill kurulumu için Node.js 18 veya üzeri.
- Varsayilan stdio MCP sunuculari ve skill kurulumu icin `npx`.
- İsteğe bağlı: daha güçlü secret taraması için Gitleaks.
- Windows için isteğe bağlı: en iyi native sandbox deneyimi için `winget` ve
  güncel Windows 11.
- Varsayilan Serena semantic-code MCP acik kalacaksa `uvx`. `uvx` yoksa
  Serena'yi disable et veya status panosunda setup notu gormeyi bekle.

## PowerShell Kurulumu

Yazmadan önce ön izle:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Installer'lari cagirmadan manifest-backed operasyon planini incele:

```bash
node scripts/plan-install.mjs --all --summary --redact-paths
node scripts/plan-install.mjs --all --json
```

Tam JSON'i incelemeden once manifest profil ve operasyonlarini listele:

```bash
node scripts/plan-install.mjs --list-profiles
node scripts/plan-install.mjs --list-operations
```

Summary normal preview'i kisa tutar; JSON ve full human plan managed
target'lari, opsiyonel global Git degisikliklerini, curated skill komutlarini,
collision policy'yi, backup davranisini ve risk seviyesini listeler.
Profile copy operation `development.config.toml`, `review.config.toml`,
`ci.config.toml` ve `token-safe.config.toml` dosyalarini kapsar.

Varsayilan acik MCP'lerin de launcher onkosullari vardir. Node/npx tabanli
MCP'ler, Node pinned package'lari indirebildiginde baslar. Serena semantic code
navigation icin default aciktir ama `uvx` ve pinned git source ister. Fresh
machine'de bu launcher yoksa `/mcp` icinde live gorunmesini beklemeden once
`uvx` kur veya `mcp_servers.serena.enabled = false` yap.

Ön izleme doğruysa kur:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -Interactive
```

Soru sormayan otomasyon dostu kurulum:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All
```

Mevcut global Codex kurulumunu onar:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair
```

Repair modu, zaten Codex setup'i olan makineler icindir. Codex Chef'in
yonettigi global guidance, rule, agent/profile dosyalari, bundled plugin, eksik
config bloklari ve local plugin marketplace kaydi icin once no-write plan
verir, sonra istenirse backup alarak onarir. Baska marketplace plugin'lerini
korur ve user skill'lerini silmez; fazla veya duplicate global skill'leri
cleanup adayi olarak raporlar.

Mevcut checkout ve managed setup'i guided CLI ile guncelle:

```powershell
npm run chef -- --update
npm run chef -- --update --verbose-plan
npm run chef -- --update --apply
```

`--apply` olmadan update modu managed/global dosyalari degistirmez; normal CLI
loglari `--no-log` yoksa repo-local kalir. Varsayilan preview kisadir;
`npm run chef -- --update --verbose-plan` tam install dry-run kanitini basar.
Apply modunda clean worktree ister ve `git pull --ff-only` calistirir. Pull repo HEAD'ini ilerletirse CLI fresh preview basip durur; bu updated preview'i
inceledikten sonra `npm run chef -- --update --apply` tekrar calistir. Repo zaten guncelse managed dosyalari backup alan installer uzerinden yeniler.
Update curated global skill veya opsiyonel global Git guard kurmaz; bunlar icin
`--install --apply` veya `--skills --apply` yuzeylerini acikca kullan.

Codex Chef backup archive'larini ayni CLI ile incele veya geri yukle:

```powershell
npm run chef -- --backups
npm run chef:backups
npm run chef -- --backups --backup <id>
npm run chef -- --backups --backup <id> --restore
npm run chef -- --backups --backup <id> --delete
npm run chef -- --backups --backup <id> --restore --apply
npm run chef -- --backups --backup <id> --delete --apply
```

List ve inspect komutlari metadata-only calisir: backup archive konumunu,
manifest durumunu, restorable dosya sayisini, size ve hash bilgilerini gosterir
ama file content basmaz. Restore, `--apply` verilmedikce preview'dir. Apply
path'i selected archive'dan bilinen Codex Chef managed dosyalarini geri
kopyalamadan once mevcut target'lar icin yeni rollback backup olusturur. Delete
de preview-first calisir: `--delete` resolved archive path'ini gosterir ama
silmez; `--delete --apply` yalniz canonical backup root altindaki secili Codex
Chef backup archive'ini kaldirir.

## Codex Chef CLI Referansi

Root README ilk kurulumu kisa tutar. Tam operator referansi gerektiginde bu
bolumu kullan.

```powershell
npm run chef
npm run chef -- --status
npm run chef -- --status --repo-only
npm run chef -- --preview
npm run chef -- --preview --verbose-plan
npm run chef -- --update
npm run chef -- --update --verbose-plan
npm run chef -- --backups
npm run chef:backups
npm run chef -- --backups --backup <id> --delete
npm run chef -- --reset --apply
npm run chef -- --repair --apply
npm run chef -- --install --apply
npm run chef -- --skills
npm run chef -- --mcp
npm run chef -- --routing
npm run chef -- --diagnostics
npm run chef -- --processes
npm run chef -- --auth
npm run chef -- --logs
npm run chef -- --help --lang tr
npm run chef -- --status --repo-only --no-log
```

`--routing` task-shape haritasini, beklenen skill ve MCP yuzeylerini ve operator
raporlama sozlesmesini gosterir. Tamamlanan agent thread'lerini incelemek ve kapatmak
icin `/agent`; current Codex session tarafindan baslatilan terminal
isleri icin `/ps` ve `/stop` kullan. `--diagnostics` Serena/MCP surec audit
komutunu ve diger read-only kanit komutlarini gosterir, ama surec durdurmaz ve
global dosya degistirmez.

Kurulu skill'ler kendiliginden calismaz. Kullanici skill adini yazdiginda veya
is skill aciklamasina net uydugunda Codex context'ine girer; canli aktivasyon
asistanin `Skill selected` yazmasi ve aksiyondan once ilgili `SKILL.md`
dosyasini okumasiyla kanitlanir.

GitHub release, push veya workflow check'leri lokal GitHub authentication bayat
oldugu icin fail ederse GitHub CLI veya Git Credential Manager'i kendi kurum politikaniza
gore yenile. Account-scoped credential repair'i bu reponun disinda
tut; token'lari repo dosyalarina, loglara, promptlara, skill'lere, rule'lara
veya shell history'ye yapistirma.

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
  Chef bloklarını alır; mevcut ajan dosyaları ve rule dosyaları atlanır.
  Kisisel plugin marketplace dosyasi komple degistirilmez; sadece Codex Chef
  kaydi backup sonrasi eklenir veya guncellenir, ilgisiz plugin kayitlari
  korunur.
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
./scripts/install.sh --all --interactive
```

Kullanışlı flagler:

- `--all`: global Git config'i değiştirmeyen önerilen tam Codex Chef kurulumu.
- `--install-skills`
- `--install-git-guards`: global Git ignore ve hook ayarlarına ayrıca opt-in.
- `--force`: backup aldıktan sonra managed hedefleri değiştirir; vermezsen
  mevcut `config.toml` merge edilir ve diğer mevcut managed dosyalar atlanır.
  Kisisel plugin marketplace dosyasi komple degistirilmez; sadece Codex Chef
  kaydi backup sonrasi eklenir veya guncellenir, ilgisiz plugin kayitlari
  korunur.
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
path secimi, broad/destructive graph-indexing ve `SUPABASE_DB_URL` gibi
gereksinimleri connector'a ihtiyac duymadan once gosterir. Account, database,
production, genis filesystem ve broad/destructive graph-indexing connector'lari
sen acikca enable edene kadar kapali kalir. Lokal codebase graph okumalari
yalniz destructive/admin graph tool'lari kapaliyken acik olur.
Agent role dosyalari agent bazli model/reasoning pinlemeden kurulur. Aktif
profil ve Codex runtime task'a uygun dengeyi secebilir; broad veya uzun islerde
skill, agent ya da MCP kapatmadan daha dusuk verbosity ve daha dar tool-output
limitleri icin `token-safe.config.toml` kullan.

## Neler Yedeklenir?

Mevcut dosyalar şu klasöre kopyalanır:

```text
~/.codex/backups/codex-chef-YYYYMMDD-HHMMSS/
```

Yeni backup'lar ayrica `.codex-chef-backup.json` manifest'i tasir. Bu kucuk
dosya operation, package version, platform, backup-relative path, size, hash ve
metadata yazilirken gorulen archive issue'larini kaydeder.

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
managed dosyalar `-Force` / `--force` vermediğin sürece atlanır. Kisisel
plugin marketplace ilgisiz kayitlari korur ve sadece Codex Chef kaydini backup
sonrasi upsert eder. Managed drift varsa `-Repair` / `--repair` force'tan daha
guvenli ilk adımdır.

## Geri Dönüş

1. Codex'i kapat.
2. Backup archive'larini `npm run chef -- --backups` ile listele.
3. Secilen archive'dan restore preview al:
   `npm run chef -- --backups --backup <id> --restore`.
4. Preview dogruysa apply et:
   `npm run chef -- --backups --backup <id> --restore --apply`.
5. Codex'i yeniden başlat.
6. `codex doctor --summary` çalıştır.

Restore once mevcut managed target'lar icin rollback backup olusturur.
Installer ve CLI, preview-first backup delete akisinda acikca `--apply`
vermedikce backup dosyalarini silmez.
