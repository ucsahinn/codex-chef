# Release Notları

## Unreleased

## v0.5.41 - 2026-06-24

Bu patch yeni Node runtime'larinda interaktif menu davranisini duzeltir. CLI
artik nested action'lar follow-up soru sordugunda tek readline sahibini
kullanir; Skill ve MCP secim promptlari operator menusune `AbortError` stack'i
veya unsettled top-level-await uyarisi basmadan doner.

## One cikanlar

- Nested Skill, MCP, yedek ve write-confirmation promptlari icin ikinci bir
  readline interface acmak yerine aktif menu soru fonksiyonu yeniden kullanildi.
- Ctrl+C benzeri `readline/promises` abort'lari kontrollu user interrupt
  mesajina normalize edildi.
- Daha once Node internal'lari basan Skill skip akisi ve interrupt yolu icin CLI
  transcript regresyonlari eklendi.

## Verification

- `npm run validate:chef-cli`
- `npm run check`
- `git diff --check`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.40 - 2026-06-24

Bu patch v0.5.39 gorsel pano geri yuklemesinden sonra kalan audit bosluklarini
kapatir. Odak noktasi global Windows hook davranisi, release publish hijyeni,
MCP credential sinirlari, Memory metni ve GitHub uyumlu social preview
metadata'sidir.

## One cikanlar

- Opsiyonel global Git pre-commit hook'u Node tabanli hale geldi; Windows'ta
  `sh` veya `grep` gerektirmeden staged `.env`, key, database, dump ve lokal
  state dosya adlarini bloklar.
- `scripts/extract-release-notes.mjs` ve `npm run release:notes` eklendi; GitHub
  Releases artik full historical release notes dosyasi yerine yalnizca current
  version bolumunu kullanir.
- Current localized release note bolumleri, Windows-safe hook icerigi, GitHub
  social preview PNG boyutu ve high-risk MCP timeout/credential boundary
  default'lari validator kapsaminda.
- Mevcut lokal release gate'e ek olarak full-SHA pinli Gitleaks GitHub Actions
  adimi eklendi.
- Supabase MCP default block'u artik disabled starter config icinde
  `SUPABASE_DB_URL` degerini launcher argumanina genisletmez.
- Memory MCP'nin bilincli non-secret lokal context tutabilecegi, Codex Chef'in
  private memory/session state veya secret kopyalamadigi netlestirildi.

## Verification

- `npm run check`
- `npm run release:notes`
- `npm run verify:install:runtime -- --redact-paths --expect-skills --expect-git-guards`
- `git diff --check`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.39 - 2026-06-24

Bu patch, Codex Chef'in ilk bakista tam bir uzman setup'i gibi gorunmesini
saglayan gorsel capability panolarini geri getirir. README eski uzun referans
sayfasina donmez; ama emojili ajan ekibi, skill katalogu ve MCP connector
tablolari Ingilizce ve Turkce girislerde tekrar yer alir.

## One cikanlar

- 21 ajanlik ekip tablosu, gorunur rol adlari ve Codex routing kimlikleriyle
  geri geldi.
- Yerel plugin skill'leri ve reviewed global skill katalogu icin kompakt skill
  tablosu geri geldi.
- Varsayilan hazir lokal/arastirma MCP'leri ile opt-in bekleyen high-risk hesap,
  filesystem, deploy ve database connector'larini gosteren emojili MCP panosu
  geri geldi.
- v0.5.38'in daha net kurulum akisi korundu; agent, skill ve MCP connector'lari
  gizli background automation degil, gorunur capability olarak anlatilmaya devam
  eder.

## Verification

- `npm run check`
- `git diff --check`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.38 - 2026-06-24

Bu release public girisi daha sade, operator odakli ve ilk bakista anlasilir
hale getirir; tam Codex Chef referansi install rehberlerinde kalir. Agent,
skill, MCP ve routing dili de runtime'in kanitlayabildigi davranisla
hizalanir.

## One cikanlar

- Ingilizce ve Turkce README sayfalari daha kisa install yolu, daha net guvenlik
  siniri, kompakt CLI haritasi ve korunmus gorsel asset'lerle yeniden
  duzenlendi.
- Tam CLI komut envanteri README dosyalarindan alindi ve `docs/install.md` ile
  `docs/install.tr.md` icine tasindi.
- `npm run chef -- --help` ciktisi sadelestirildi; once kisa yolu, gerekirse
  tam referansi gosterir.
- Yeni dokuman sekli icin validator'lar guncellendi: routing/status dili, CLI
  referans kapsami ve release readiness kapilari tekrar kontrol edilir.
- Release oncesi asset diff'i, whitespace, token yuzeyleri, secret scan ve tum
  repo validation gate'i yeniden calistirildi.

## Verification

- `npm run check`
- `npm run validate`
- `npm run validate:tokens`
- `npm run token:audit`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.37 - 2026-06-24

Bu release installer hardening isini tam enterprise dogrulama kapisina tasir.
Codex Chef artik temiz home, mevcut user config, mevcut kurulum, stale managed
plugin dosyalari, garip Windows path'leri ve ambient `CODEX_HOME` drift'i
senaryolarinda ana setup vaadini release oncesi kanitlar.

## One cikanlar

- `validate:installer-smoke` eklendi. Gercek temp-home kurulumlariyla no-write
  full preview, explicit `CODEX_HOME` ve `AGENTS_HOME` hedefleme, root config
  default'lari, MCP config, specialist agent'lar, profile dosyalari, rules,
  bundled plugin ve personal marketplace entry dogrulanir.
- Mevcut `config.toml` dosyalari artik eksik managed root default'lari TOML
  root seviyesinde alir; kullanicinin root ayarlari ve custom MCP tabloları
  korunur.
- Reinstall akisinda managed Codex Chef plugin dosyalari backup sonrasi
  yenilenir; extra user dosyalari default olarak korunur.
- Ambient/sandbox Codex runtime drift'i, explicit kurulu hedef temiz
  dogrulandiginda hata degil warning olarak raporlanir.
- PowerShell ve Bash installer hedef path'leri normalize eder; Bash installer
  gerekli POSIX tooling eksikse erken ve acik prerequisite mesaji verir.
- GitHub Actions'a mevcut validation ve shell dry-run gate'lerinin yanina
  Windows installer job'u eklendi.

## Verification

- `npm run check`
- `npm run verify:install:runtime -- --redact-paths --expect-skills --expect-git-guards`
- `npm run verify:skills:online -- --timeout-ms=90000`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.36 - 2026-06-22

Bu patch v0.5.35'i dar bir PowerShell installer CI duzeltmesiyle supersede
eder. v0.5.35'te gelen prompt-shape agent ve skill routing davranisi aynen
korunur.

## One cikanlar

- `scripts/install.ps1 -All -WhatIf`, basarili dry-run sonunda artik exit code
  `0` dondurur; onceki native helper `$LASTEXITCODE` biraksa bile CI false
  failure uretmez.
- Installer alignment validation, PowerShell'in acik successful exit kontratini
  kontrol eder; CI dry-run smoke bu konuda sessizce gerileyemez.

## Verification

- `npm run validate:installer`
- `npm run check`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.35 - 2026-06-22

Bu patch Codex Chef'in guvenli otonomi kontratini temiz makinede beklenen
rehberlikle hizaladi: net prompt shape'leri dogru agent, skill, MCP ve flag
yuzeylerine yonlenebilir; fakat current Codex runtime'da gercek subagent spawn
icin explicit subagent/delegation destegi gerekir.

## One cikanlar

- Routing profilleri artik runtime-bounded visible delegation dilini kullanir.
  Boylece non-trivial prompt shape'leri uygun uzman agent'lari gorunur sekilde
  yuzeye cikarir; destructive, credential, account, database, deploy, publish,
  genis filesystem ve global mutation aksiyonlari yine approval gate'te kalir.
- Kurulan global `AGENTS.md` template'i, bounded non-destructive kanit isleri
  icin uygun uzmanlarin gorunur yuzeye cikmasini, runtime ve user request izin
  verdiginde de `Agent plan`, `Agent started`, `Agent result` ve `Surfaces used`
  kanit satirlarini artik acikca ister.
- Matching skill'ler tetiklendiginde zorunlu kalir; docs artik asistanin
  `Skill selected` basmasini, ilgili `SKILL.md` dosyasini okumasini ve
  aksiyondan once workflow'u izlemesini acikca soyler.
- 21 shipped custom agent role dosyasinin tamamina okunabilir
  `nickname_candidates` eklendi. Codex UI destekledigi yerde `Code Mapper` veya
  `Test Verifier` gibi etiketler gosterebilir; routing kimligi yine agent
  `name` alanidir.
- Routing, status, docs ve agent validator'lari prompt-shape routing ve
  nickname kontratini release oncesi zorunlu tutar.

## Verification

- `npm run validate:routing`
- `npm run validate:agents`
- `npm run validate:status`
- `npm run validate:chef-cli`
- `npm run check`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.34 - 2026-06-21

Bu patch menu/status polish isinden sonra CLI kanit ve localization sertlestirme
gecisini tamamlar.

## One cikanlar

- `npm run chef -- --diagnostics` ve `npm run chef -- --logs` artik gecmis log
  sinyal taramasi gosterir: hata/uyari/dikkat/eski ham deger sayilari ve en
  yeni eslesen log satirlari gorunur. Ekran, guncel sagligin hala Durum ve
  Doctor tarafindan raporlandigini acikca soyler.
- Log classifier daha sikidir; eski `0 fail` ozetleri ve connector rehber
  metinleri guncel hata gibi okunmaz.
- Turkce MCP ekrani default tooling, browser MCP'leri, Serena, memory,
  filesystem, account connector'lari ve Supabase icin setup notlarini artik
  Turkce gosterir.
- CLI validation Turkce MCP ekranini, gecmis log kanitini, diagnostics,
  surec/tunel denetimini, menu transcript'lerini ve install/update/reset/repair
  write-gated preview akislarini kapsar.

## Verification

- `npm run validate:chef-cli`
- `npm run check`
- `npm run validate:release`
- `npm run verify:install:runtime -- --expect-skills --expect-git-guards --redact-paths`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.33 - 2026-06-21

Bu patch Turkce CLI status polish gecisini tamamlar.

## One cikanlar

- Secili CLI dili artik status alt surecine de aktarilir; `npm run chef`,
  `Dil`, sonra `Durum` akisinda status govdesi Ingilizceye dusmez.
- Turkce status ciktisi progress satirlarini, durum etiketlerini, MCP kurulum
  notlarini, uyari ozetlerini ve no-log footer'ini Turkcelestirir.
- Turkce menu aciklamalari onarim, surec denetimi, tanilama, auth, skill ve
  guncelleme aksiyonlari icin daha dogal hale getirildi.

## Verification

- `npm run validate:chef-cli`
- `npm run check`
- `npm run validate:release`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.32 - 2026-06-21

Bu patch v0.5.31 release'inden sonra operator CLI polish gecisine odaklanir.

## One cikanlar

- `npm run chef` artik read-only, opsiyonel ag, hesap rehberi, canli kontrol
  ve atlanan prob durumlarini `none`, `null`, `not_checked` veya
  `configured_unverified` gibi internal sentinel degerleri sizdirmeden dogal
  dille gosterir.
- Update preview artik herhangi bir `--apply` oncesinde mevcut Codex Chef
  versiyonunu, branch'i, commit'i, release-note hedefini, etkilenecek managed
  yuzeyleri ve safety davranisini gosterir.
- Repo-only status yaniltici sifir sayilari yerine atlanan runtime/Codex
  problarini aciklar, kompakt MCP ready/opt-in gorunumu verir ve
  profile-specific skill routing'i daha net anlatir.

## Verification

- `npm run validate:chef-cli`
- `npm run check`
- `npm run validate:release`
- `gitleaks detect --redact --no-banner --no-git --verbose`

## v0.5.31 - 2026-06-21

Bu release Codex Chef'i guvenli oldugu yerde otonom tutar; ama delegation,
installer write ve hassas tool output sinirlarini daha acik hale getirir.

## One cikanlar

- Routing profile'lari, `AGENTS.md`, docs, status ciktisi ve validator'lar
  subagent delegation davranisini hidden platform-native auto-spawn gibi degil,
  acik kullanici/runtime yetkisi olarak anlatir.
- Repository-controlled `npm run ...`, genis `git config`, raw `gitleaks dir`
  ve browser request/response detail tool'lari shipped baseline icinde prompt
  ister.
- PowerShell ve Bash installer'lari ilgisiz plugin kayitlarini ezmeden yalniz
  Codex Chef marketplace kaydini upsert eder.
- `npm run chef` artik interaktif dil kontrolu, hizali kompakt menu satirlari,
  aksiyon baslangic/bitis ayraclari, uzun kanit ciktisindan sonra Enter ile
  menuye donus ve skill/MCP panolari icin genis `console.table` yerine
  terminal-safe kompakt tablolar kullanir.
- Ortak marketplace-entry helper'i installer ve repair ciktilarini canonical
  plugin UI metadata'siyle ayni tutar; Windows'ta valid UTF-8 BOM'lu JSON
  dosyalarini da kabul eder.
- Bash installer managed-directory replacement ve backup failure durumlarinda
  fail-closed davranir; dry-run yine full managed directory install preview'u
  basar.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:routing
npm run validate:mcp
npm run validate:installer
npm run audit:security
npm run verify:install:runtime -- --expect-skills --expect-git-guards --redact-paths
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.30 - 2026-06-20

Bu release token/context kontrolunu Codex Chef icinde birinci sinif yuzey yapar
ve enterprise setup'i kullanisli yapan skill, MCP, subagent, hook, app veya
memory ozelliklerini kapatmadan otonom akisi korur. Token rehberi artik profil,
audit komutu, validator, docs ve kurulu runtime yolunda bulunur; agent
model/reasoning secimi de role bazli pin yerine aktif profile birakilir.

## One cikanlar

- Daha dusuk reasoning verbosity, compact summary, auto compaction ve tool-output
  limitleri icin opsiyonel `token-safe.config.toml` profili eklendi.
- `npm run token:audit`, `npm run token:audit:json` ve
  `npm run validate:tokens` eklendi.
- CI ve docs, `scripts/analyze-token-surfaces.mjs` ile
  `scripts/validate-token-surfaces.mjs` dosyalarini acik `node --check`
  kapsaminda dogrular.
- 21 uzman agent role dosyasi, catalog otomatik secim dediginde agent bazli
  model/reasoning pinlemeyecek sekilde guncellendi.
- README'ler, Ingilizce/Turkce docs, generated locale docs ve
  `context-budget-planner` referansi token-safe ve agent-auto davranisini
  kurulum yuzeyi boyunca anlatir.
- `npm run chef -- --processes` ve `npm run chef:processes`, Serena, MCP,
  browser, Python ve Node sureclerini read-only sayar; hicbir sureci durdurmaz.
- Kurulu runtime backup-backed managed refresh ile esitlendi; runtime
  verification artik `38/38` managed dosyanin current oldugunu gosterir.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run token:audit
npm run chef -- --processes --plain --no-log
npm run chef -- --diagnostics --plain --no-log
npm run verify:install:runtime -- --redact-paths
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.29 - 2026-06-20

Bu release Chef CLI'a read-only tanilama merkezini ekler. Operator artik
repo-only canli saglik, attention nedenleri, sonraki guvenli adimlar, backup/log
ozetleri, update ve repair preview girisleri, runtime parity ve Serena/MCP surec
denetimi komutlarini tek komutta gorur; global dosya degismez ve surec
durdurulmaz.

## One cikanlar

- `npm run chef -- --diagnostics`, `npm run chef -- --diagnose` ve
  `npm run chef:diagnostics` eklendi.
- Tanilama gorunumu repo-only saglik, attention nedenleri, guvenli sonraki
  adimlar, repo-local log kok dizini, backup kok dizini, son CLI log
  metadata'si ve lifecycle temizlik notlarini log icerigi basmadan gosterir.
- Diagnostics kanit listesine update ve repair preview komutlari eklendi.
- `--tr` / `--lang tr` icin Turkce tanilama ciktisi eklendi.
- Parse edilebilir `npm run --silent ... --json` diagnostics ciktisi release
  gate kapsaminda dogrulaniyor.
- Tanilama yuzeyi read-only kalir; surec temizligi audit kaniti gorundukten
  sonra yine acik operator onayi ister.
- `npm run validate:chef-cli`, README, Turkce README ve verification docs
  genisletildi; tanilama menusu release gate'lerinde kalici olarak kontrol
  edilir.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run chef -- --diagnostics --plain --no-log
npm run chef -- --diagnostics --tr --plain --no-log
npm run chef -- --diagnose --plain --no-log
npm run verify:install:runtime -- --expect-skills --redact-paths
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.28 - 2026-06-20

Bu release enterprise orchestration yuzeyini sikilastirir. Chef CLI artik
Turkce operator metnine sahip, update preview varsayilan olarak kisa, routing
ciktisi ise subagent, background terminal, browser/MCP session ve Serena gibi
kalici MCP process'leri icin lifecycle hijyeni gosterir.

## One cikanlar

- `--lang tr`, `--tr` ve `CODEX_CHEF_LANG=tr` ile Chef CLI'in
  operator-facing metinleri Turkce oldu; JSON payload'lari ve Ingilizce flag'ler
  stabil kaldi.
- `npm run chef -- --update` artik no-write kisa ozet basar: managed overwrite
  hedefleri, backup davranisi, atlanan yuzeyler, apply komutu ve tam dry-run
  kaniti icin `npm run chef -- --update --verbose-plan`.
- `npm run chef -- --routing`, kurulan global `AGENTS.md` template'i, README ve
  skill/agent dokumanlari lifecycle hijyenini anlatir.
- Preview-first `npm run chef -- --backups --backup <id> --delete` destegi
  eklendi; secili archive kaldirilmadan once `--apply` gerekir.
- Repo-only status progress label'i `repo:doctor` oldu; direct Codex CLI doctor
  check'leri bilerek skipliyken calisiyor gibi gorunmez.
- Validation Turkce CLI smoke'larini, kisa update preview kontrolunu, Turkce
  backup cikti kapsamini, lifecycle routing kontrolunu ve repo-doctor label
  kontrolunu kapsar.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run chef -- --help --lang tr --plain --no-log
npm run chef -- --update --lang tr --plain --no-log
npm run chef -- --routing --plain --no-log
npm run chef -- --backups --backup <id> --delete --plain --no-log
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.27 - 2026-06-20

Bu release enterprise CLI icindeki backup recovery boslugunu kapatir. Backup
archive'lari artik `npm run chef` uzerinden gorulur, restore guvenli
preview/apply akisina sahiptir ve yeni backup archive'lari ilerideki recovery
kontrolleri icin machine-readable manifest tasir.

## One cikanlar

- `npm run chef -- --backups` ve `npm run chef:backups` read-only backup
  archive inventory icin eklendi.
- `npm run chef -- --backups --backup <id>`, file content basmadan backup
  archive metadata, size, hash, manifest durumu ve restorable target bilgisini
  gosterir.
- `npm run chef -- --backups --backup <id> --restore --apply`, once current
  target'lar icin rollback backup olusturur, sonra yalniz bilinen Codex Chef
  managed dosyalarini restore eder.
- Yeni installer, repair ve restore rollback backup archive'lari icin
  `.codex-chef-backup.json` manifest generation eklendi.
- `npm run validate:chef-cli`, list, inspect, restore preview, restore apply,
  rollback creation ve JSON icin temporary-home backup smoke'larini kapsar.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run chef -- --backups --plain --no-log
npm run chef:backups -- --plain --no-log
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.26 - 2026-06-20

Bu patch Windows ilk kullanim raporundaki son typo-entrypoint boslugunu
kapatir. `npm run chefg` artik compatibility alias olarak ayni Chef CLI'ini
acar; `npm run chef` ise dokuman ve orneklerde canonical komut olarak kalir.

## One cikanlar

- `npm run chefg` eklendi; yaygin typo artik npm'in missing-script hatasina
  dusmez.
- `npm run chef` canonical komut olarak kalir ve `npx run`'in ilgisiz npm
  watcher paketi oldugu dokumante edilir.
- `npm run validate:chef-cli`, alias'in `scripts/chef-cli.mjs` yuzeyine bagli
  kalmasini zorunlu tutar.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run chefg -- --help --plain --no-log
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.25 - 2026-06-20

Bu patch Codex Chef'in Windows-first update ve status bosluklarini kapatir.
Operator artik guvenli varsayilanla preview yapan, apply oncesi temiz Git
agaci isteyen ve yeni pull sonrasi tekrar inceleme icin duran belgeli
`chef:update` yuzeyine sahiptir; same-tree refresh oncesi lokal validation da
gecmek zorundadir.

## One cikanlar

- `npm run chef -- --update` ve `npm run chef:update`, kullaniciyi yanlislikla
  ilgisiz `npx run` watcher'ina sokmadan no-write update preview calistirir.
- `npm run chef -- --update --apply`, temiz Git worktree kontrolu yapar,
  `git pull --ff-only` calistirir, degisen pull sonrasi inceleme icin durur ve
  `npm run validate` ile `npm run audit:security` gectikten sonra yalnizca
  sonraki apply'da backup-backed managed install akisina devam eder.
- Update apply managed Codex Chef dosyalariyla sinirlidir; curated global skill
  veya opsiyonel global Git guard kurmaz.
- Repo-only status artik installed runtime, global skill inventory, Codex log
  metadata ve live Codex CLI probe'larinin bilerek atlandigini acik yazar.
- Chef CLI, terminal cikti polish'i plain/log-safe modu bozmadan kalabilsin
  diye forced-color ve `--plain` smoke coverage kazandi.
- Chef CLI JSON mode artik parse edilebilir kalir; bilinmeyen option Node stack
  trace yerine aksiyon alinabilir hata dondurur.
- README, install, security, upgrade, verification ve Turkish docs ayni update
  boundary'sini ve komut orneklerini tasir.
- Documentation validation artik stale `codex-chef@...` expected-output
  orneklerini ve yanlis `npx run` entrypoint'ini yakalar.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run chef -- --update --no-log --plain
npm run chef:update -- --no-log --plain
npm run chef -- --status --repo-only --no-log --plain
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.24 - 2026-06-18

Bu patch Codex Chef'in agent, skill ve MCP routing davranisini operator icin
gorunur hale getirir. CLI routing sozlesmesini dogrudan gosterir; kurulan
AGENTS template'i de Codex'e hangi agent, skill ve MCP'nin secildigini sessiz
arka plan isi gibi kaybetmeden raporlatir.

## One cikanlar

- `npm run chef -- --routing` enterprise routing board'u, subagent gorunurluk
  sozlesmesini, bekleme politikasini, skill trigger'larini, MCP secimlerini ve
  `/agent` inspection rehberini basar.
- AGENTS template'i artik ilgili yuzeyler kullanildiginda `Agent plan`,
  `Agent started`, `Agent result`, `Skill selected`, `MCP selected` ve final
  `Surfaces used` raporlamasini zorunlu tutar.
- Validation routing CLI'ini smoke-test eder ve kurulu gorunurluk sozlesmesinde
  drift olursa release oncesi yakalar.
- `npm run chef -- --status --repo-only`, strict audit icin kurulu runtime ve
  live Codex CLI probe'larini atlayan hizli lokal status path'i verir.
- Direct script execution artik repo kokunu script konumundan cozer; docs,
  repo disindan baslayan PowerShell kullanicilari icin `npm --prefix` formunu
  gosterir.
- Routing profilleri owner, durability, privilege, validation ve rollback
  metadata'si tasir; MCP kaniti cataloged, installed config, live
  `codex mcp list` ve `/mcp` session-visible hallerine ayrilir.
- Status ve runtime verification, array, `servers`, `mcp_servers` ve object-map
  MCP JSON ciktilarini ayni parser ile okur.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run chef -- --routing --no-log
npm run chef -- --status --repo-only --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.23 - 2026-06-17

Bu patch uzun runtime kontrolleri icin son kullanici komut deneyimini
iyilestirir. Status ve install verification komutlari artik Codex CLI, MCP,
Git, skill ve log metadata kanitlarini toplamadan once hemen progress mesaji
basar.

## One cikanlar

- `npm run chef -- --status` artik Codex runtime, MCP, Git ve log metadata
  kontrollerinin toplandigini ve 30-60 saniye surebilecegini kullaniciya hemen
  soyler.
- `npm run codex:status:all`, agir runtime probe'lari baslamadan once aninda
  status preamble'i basar.
- `npm run verify:install:runtime -- --expect-skills --expect-git-guards`,
  installed-runtime kontrollerinden once aninda verification preamble'i basar.
- JSON ciktilari makine okunur kalir; progress metni yalnizca human text mode'da
  basilir.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run chef -- --status --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.22 - 2026-06-17

Bu patch Codex CLI henuz kurulu olmayan CI ve temiz makinelerde release
validation akisini duzeltir. Status panosu Codex CLI erisilebilirligini yine
attention olarak gosterir, fakat yeni kullanici Codex'i kurmadan once validation
gereksiz yere fail etmez.

## One cikanlar

- Configured `codex` komutu yoksa bile ambient Codex status'u raporda gorunur
  kalir.
- `npm run validate:status` artik missing-Codex fixture'i icerir; Ubuntu CI ve
  temiz makinelerde bu davranis korunur.
- Release, v0.5.21 premium status board calismasini korurken public CI ve
  first-run validation icin guvenli hale getirir.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.21 - 2026-06-17

Bu patch Codex Chef icin premium operator status gecisini tamamlar. Status
panosu artik son kullaniciya daha net calisma adimlari, canli Codex runtime
kaniti, guvenli log metadata'si ve Git/release dikkat sinyalleri verir; lokal
dosya icerigini terminale basmaz.

## One cikanlar

- `npm run codex:status:all` artik quick-start bolumu, target ve ambient Codex
  runtime probe'lari, version/login/MCP kontrolleri, Git sagligi, routing
  profile gorunurlugu ve effective-control ozetleri gosterir.
- Recent log raporu metadata-only calisir: dosya adi, zaman ve boyut gorunur,
  fakat log icerigi okunmaz veya yazdirilmaz.
- CLI validation artik icon/mojibake regresyonlarini, escaped Windows path
  sizintilarini, dirty Git worktree icin yanlis temiz durumlarini ve fake Codex
  probe regresyonlarini engeller.
- `npm run chef -- --status` artik `TERM=dumb` zorlamaz; bu da gercek Windows
  terminallerinde false `codex doctor` terminal-health hatalarini engeller.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run validate:release
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.20 - 2026-06-17

Bu patch son public dokumantasyon temizligini release history icine alir ve
verification docs icinde kalan machine-specific local-audit path detaylarini
kaldirir.

## One cikanlar

- Local audit docs artik workstation'a ozel path detaylarini acmadan
  verification boundary'yi anlatir.
- Release tag final dokumantasyon temizliginden sonraki en guncel, dogrulanmis
  `main` commit'iyle hizalanir.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run validate
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --auth --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.19 - 2026-06-17

Bu patch GitHub account repair isini public CLI ve README icinde account-scoped
re-auth komutlari basmak yerine operator boundary olarak anlatarak Codex Chef'in
public auth rehberini daha guvenli hale getirir.

## One cikanlar

- `npm run chef -- --auth` artik GitHub authentication boundary'yi anlatir,
  operator'u kurum politikasina yonlendirir ve token/scope kararlarini repo
  dosyalari, loglar, promptlar, skill'ler, rule'lar ve orneklerin disinda tutar.
- README ve Turkce README stale GitHub auth recovery konusunu account-scoped
  `gh auth login` veya global credential-helper komutlarini gommeden anlatir.
- `npm run validate:chef-cli`, public-safe `--auth` ciktisini smoke-test eder.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --auth --plain --no-log
npm run chef -- --mcp --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.18 - 2026-06-17

Bu patch Codex Chef CLI reset-preview smoke testindeki cross-platform CI
assertion'ini duzeltir. Windows PowerShell `-WhatIf` satirlari uretirken Linux
CI Bash dry-run branch'ini calistirir; validator artik Windows'a ozel string
yerine ortak `completed: Codex Chef dry run` sinyalini kontrol eder.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --preview --plain --no-log
npm run chef -- --reset --plain --no-log
npm run chef -- --skills --plain --no-log
npm run chef -- --mcp --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.17 - 2026-06-17

Bu patch Codex Chef operator CLI icin son audit bulgularini kapatir.

## One cikanlar

- Strict audit calismalarinda ignored repo-local CLI log'u olusmasin diye
  `npm run chef -- --status --no-log` ve genel `--no-log` flag'i eklendi.
- Daha guvenli connector secimi icin `npm run chef -- --mcp` ciktisi transport,
  endpoint/package, source ve config-detail rehberiyle genisletildi.
- `npm run validate:chef-cli`, help, MCP, skills ve reset preview path'leri icin
  gercek no-log CLI smoke check'leriyle guclendirildi.
- Turkce MCP katalog encoding'i onarildi.

## Dogrulama

Bu surum icin release hazirligi sunlari icermelidir:

```bash
npm run check
npm run chef -- --status --plain --no-log
npm run chef -- --preview --plain --no-log
npm run chef -- --reset --plain --no-log
npm run chef -- --skills --plain --no-log
npm run chef -- --mcp --plain --no-log
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.16 - 2026-06-16

Bu patch orijinal Codex Chef operator hedefinde kalan CLI bosluklarini kapatir:
guvenli reset/reinstall, skill secimi ve MCP secimi artik birinci sinif menu
akisidir.

## One Cikanlar

- `npm run chef -- --reset` backup'li managed refresh/reinstall preview icin
  eklendi; `npm run chef -- --reset --apply` acik apply gate'iyle calisir.
- `npm run chef -- --skills` reviewed skill tablosunu gosterir ve interactive
  terminalde kullaniciya numarayla tek skill sectirir. Kurulum yine `--apply`
  ister.
- `npm run chef -- --mcp` interactive kullanicinin numarayla tek connector
  secmesini saglar; setup, auth, dogrulama, source, risk ve rollback notlarini
  basar ama account/database/filesystem connector'larini acmaz.
- CLI validation artik reset, skill selection, MCP explanation, redaction, auth
  guidance ve log yuzeylerini release oncesi zorunlu tutar.

## Dogrulama

Bu surum icin release oncesi su kontroller calismali:

```bash
npm run check
npm run chef -- --status --plain
npm run chef -- --preview --plain
npm run chef -- --reset --plain
npm run chef -- --skills --plain
npm run chef -- --mcp --plain
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.15 - 2026-06-16

Bu patch Codex Chef operator CLI'ini ekler. Windows-first kullanici kurulum,
repair, status, MCP, skill, auth ve log akislarini tek numarali menuden
yonetebilir; yazan aksiyonlar yine acik `--apply` sinirinda kalir.

## One Cikanlar

- `npm run chef` eklendi: status, doctor, preview, install, repair, skill, MCP
  rehberi, GitHub auth rehberi ve son loglar tek menude.
- `--status`, `--preview`, `--repair --apply`, `--install --apply`,
  `--skills`, `--mcp`, `--auth` ve `--logs` gibi noninteractive flag'ler
  eklendi.
- Write path'leri menude etiketlenir ve backup'li installer/repair scriptine
  gitmeden once `--apply` veya acik onay ister.
- CLI child-process output'u terminale veya `tmp/chef-cli/logs` altina yazmadan
  once lokal path ve yaygin secret bicimleri icin redakte edilir.
- `npm run validate:chef-cli` eklendi ve `npm run check`, security audit,
  package surface, repo shape ve release readiness gate'lerine baglandi.
- Release ve HTTPS Git auth hatalari icin concrete GitHub CLI / Git Credential
  Manager recovery komutlari yerine public-safe auth boundary rehberi kullanildi.

## Dogrulama

Bu surum icin release oncesi su kontroller calismali:

```bash
npm run check
npm run chef -- --status --plain
npm run chef -- --preview --plain
npm run chef -- --repair --plain
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.14 - 2026-06-16

Bu patch final Codex Chef audit'inde kalan connector ve dokumantasyon
bosluklarini kapatir. App connector browsing artik default kapali kalir, repair
mode eski kurulumlari guvenli default'a tasir ve README operatorlerin gercekten
kullanacagi installer parametrelerini acikca anlatir.

## One Cikanlar

- App/connectors default olarak `apps._default.enabled = false` ile kapatildi;
  app connector browsing authenticated MCP connector'lari gibi opt-in kalir.
- `npm run repair:install` artik deprecated
  `apps._default.default_tools_enabled` anahtarini kaldirir ve eski
  `apps._default.enabled = true` managed default'unu guvenli parked duruma geri
  yazar.
- Security, status ve repair validation artik
  `apps._default.enabled = false`,
  `apps._default.destructive_enabled = false` ve
  `apps._default.open_world_enabled = false` alanlarini zorunlu tutar.
- README'ye `-All`, `-Interactive`, `-WhatIf`, `-Repair`, `-Force`,
  `-NoBackup`, `-InstallSkills`, `-InstallGitGuards` ve `-PlainOutput` icin
  kurulum parametre tablolari eklendi.
- Dokumantasyon modeli netlestirildi: Ingilizce ve Turkce tam operator
  detayini tasir; Almanca, Ispanyolca, Brezilya Portekizcesi ve Fransizca
  sayfalar guvenlik ozeti ve kaynak indeksi olarak kalir.

## Dogrulama

Bu surum icin release oncesi su kontroller calismali:

```bash
npm run check
npm run codex:status:all
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.13 - 2026-06-16

Bu patch guncel Codex kurulumlari icin runtime uyumlulugunu tamamlar. Strict
config temiz kalir, normal lokal approval rule'lari managed-file drift gibi
gorunmez ve status panosu WebSocket fallback uyarisini daha dogru siniflandirir.

## One Cikanlar

- `catalog/routing-profiles.json` ve `npm run codex:routing` ile enterprise
  routing panosu eklendi. Pano yaygin task shape'leri beklenen subagent, skill,
  MCP ve config/profile flag'leriyle eslestirir; riskli aksiyonlar onay
  kapisinda kalir.
- `npm run codex:status` artik routing board ozetini de verir. PowerShell ve
  Bash installer capability board'u da kurulum sonunda enterprise routing
  profillerini gosterir.
- MCP setup hint'leri machine-readable catalog'a, installer capability
  board'una, status board'a ve MCP dokumanlarina eklendi; tooling, OAuth,
  filesystem path ve `SUPABASE_DB_URL` gereksinimleri connector opt-in'den once
  gorunur.
- `npm run codex:status` icin effective-controls ozeti ve global `AGENTS.md`
  template'i icin routing profile visibility gate'i eklendi.
- `apps._default.default_tools_enabled` config anahtari shipped template'lerden
  ve repair handling'den kaldirildi; boylece Codex v0.140.0 ile
  `codex exec --strict-config` temiz baslayabilir.
- Runtime verification artik `rules/default.rules` icinde Codex Chef'in managed
  guvenlik baseline'ini arar ama normal Codex kullanimiyla eklenen lokal
  approval rule'larini drift saymaz.
- Repair mode managed rules baseline'ini lokal approval rule'larini silmeden
  merge eder.
- `npm run codex:status`, provider, MCP ve config sorunlarini action item olarak
  tutar; Codex doctor'in kalani saglikliyken WebSocket timeout'u HTTPS fallback
  uyarisi olarak non-blocking gosterir.
- First-party Skills CLI mapping'leri guncel upstream skill adlarina tasindi:
  `ai-project-starter`, `prompt-architect` ve `ai-skill-create`.

## Dogrulama

Bu surum icin release oncesi su kontroller calismali:

```bash
npm run check
npm run codex:status:all
npm run verify:skills:online -- --timeout-ms=90000
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.12 - 2026-06-16

Bu patch yeni son kullanici status panosunu sikilastirir. Komut gercek
kurulumlarda faydali kalir ama kullanicinin globalde kurdugu ekstra skill
isimlerini gereksiz yere makine okunur ciktida paylasmaz.

## One Cikanlar

- `npm run codex:status` artik toplam kurulu skill sayisini, Codex Chef curated
  baseline sayisini, eksik curated skill sayisini ve diger/user-installed skill
  sayisini raporlar.
- Ekstra skill detaylari isim listesi olarak degil count-only kalir; bu context
  baskisini anlamak icin yeterli, kullanicinin daha genis global skill
  envanterini aciga cikarmamak icin daha dogrudur.
- `npm run repair:install` ve installer `-Repair` / `--repair`, mevcut global
  Codex kullanicilari icin force replacement'tan once backup'li repair yolu
  verir. Managed drift'i onarir, baska marketplace plugin'lerini korur ve ekstra
  ya da duplicate user skill'lerini silmeden raporlar.
- Bu patch MCP default'larini, global Git guard davranisini veya curated skill
  kaynaklarini degistirmez.

## Dogrulama

Bu surum icin release oncesi su kontroller calismali:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.11 - 2026-06-16

Bu patch installer'in guvenli varsayilanlarini degistirmeden enterprise
hazirlik seviyesini yukseltir. Ana kazanim kaynak destekli calisma hafizasi:
paketlenen uzman ajanlar artik PowerShell, Git, GitHub supply-chain, SLSA, npm
provenance, npm trusted publishing ve Sigstore konularinda genel best-practice
hafizasina degil resmi kaynaklara dayanan runtime talimatlari tasir.

## One Cikanlar

- PowerShell execution policy ve Git config kaynaklari research corpus'a
  eklendi; Windows setup ve opsiyonel global Git guard'lari process-scoped,
  acik ve geri alinabilir kalir.
- GitHub supply-chain security ve dependency review kaynaklari eklendi;
  package manifest, lockfile, workflow ve dependency-review degisiklikleri
  release/security kaniti olarak ele alinir.
- SLSA, npm provenance, npm trusted publishing ve Sigstore kaynaklari eklendi;
  release verification artik source/build traceability, tokenless npm publish,
  signing, transparency-log kaniti ve kalan riski ayirabilir.
- DevEx, doctor, security, release ve code-review uzman ajanlarina bu alanlar
  icin runtime source marker'lari eklendi.
- Mevcut install guvenligi korundu: `-All` global Git config degistirmez,
  mevcut `config.toml` ezilmez, eksik bloklar merge edilir ve authenticated MCP
  connector'lari opt-in kalir.
- Runtime verifier genisledi; kurulu managed dosyalari guncel repo template'leri
  ile karsilastirir ve ambient `CODEX_HOME` drift'ini explicit install target
  kontrolunden ayri raporlar.

## Upgrade Notlari

Onerilen rehberli Windows kurulumu:

```powershell
.\scripts\install.ps1 -All -Interactive
```

Soru sormayan otomasyon dostu kurulum:

```powershell
.\scripts\install.ps1 -All
```

Kurulumdan sonra read-only runtime dogrulama:

```bash
npm run verify:install:runtime -- --expect-skills
```

## Dogrulama

Bu surum icin release oncesi su kontroller calismali:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.10 - 2026-06-16

Bu patch installer'i daha anlasilir bir rehberli onboarding akisina cevirir
ama sessiz otomasyon yolunu da korur. Ilk kez kuran biri Codex Chef'in ne
kuracagini, hangi seceneklerin istege bagli ve riskli oldugunu, kurulum sonunda
hangi agent, MCP ve skill'lerin hazir olacagini tek ekranda gorur.

## One Cikanlar

- Onerilen Windows quickstart komutu `.\scripts\install.ps1 -All -Interactive`
  oldu. Ilk gercek kurulum Codex/Agents home, reviewed skill kurulumu,
  backup-backed replacement, opsiyonel Git guard ve son devam onayini sorar.
- `.\scripts\install.ps1 -All` soru sormayan otomasyon yolu olarak kaldi; CI,
  script ve tekrar smoke testleri icin ayni sekilde kullanilabilir.
- Bash/WSL tarafina da `./scripts/install.sh --all --interactive` ile ayni
  rehberli mod eklendi.
- PowerShell ve Bash installer sonunda capability board basar: kurulu
  specialist agent'lar, varsayilan hazir MCP server'lari, disabled/opt-in MCP
  connector'lari, local plugin skill'leri ve reviewed global skill'ler.
- Account, database, production ve broad filesystem connector'lari varsayilan
  olarak kapali kalir; installer bunu ciktida acikca soyler.
- Installer validation genisledi; guided prompt'lar ve capability board artik
  PowerShell veya Bash tarafinda sessizce drift edemez.

## Upgrade Notlari

Onerilen rehberli Windows kurulumu:

```powershell
.\scripts\install.ps1 -All -Interactive
```

Soru sormayan otomasyon dostu kurulum:

```powershell
.\scripts\install.ps1 -All
```

Bash/WSL rehberli kurulum:

```bash
./scripts/install.sh --all --interactive
```

## Dogrulama

Bu surum icin release oncesi su kontroller calismali:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.9 - 2026-06-16

Bu patch install polish turunu tamamlar: ilk ekranda ajanlar, skill'ler ve
MCP'ler ayni seviyede gorunur; Windows installer hem tek komutla hem de
rehberli modla calisir ve mevcut Codex config'ini ezmez.

## One Cikanlar

- README'ye default acik lokal/arastirma MCP'lerini ve default kapali hesap,
  database, production ve genis filesystem connector'larini gosteren belirgin
  bir MCP panosu eklendi.
- Codex Chef ikonu daha premium animasyonlu rozet olarak yenilendi ve banner
  komutu guvenli varsayilan `.\scripts\install.ps1 -All` yoluna cekildi.
- PowerShell `-Interactive` eklendi; Codex/Agents home secimini ve opsiyonel
  Git guard opt-in'ini sorar. Token, secret veya credential istemez.
- PowerShell `-PlainOutput` ve Bash `--plain-output` eklendi; eski Windows
  konsollari, CI loglari veya Unicode'u kotu gosteren terminaller icin ASCII
  cikti verir.
- PowerShell ve Bash installer section/status ciktilari esitlendi; guvenli
  varsayilan korunur: mevcut `config.toml` backup alinarak merge edilir,
  kullanici bilerek force secmedikce ezilmez.
- Install ve expected-output dokumanlari yeni installer UX'i ve runtime
  verification akisi ile esitlendi.

## Upgrade Notlari

Guvenli ilk kurulum veya mevcut kullanici merge'i:

```powershell
.\scripts\install.ps1 -All
```

Rehberli Windows kurulumu:

```powershell
.\scripts\install.ps1 -All -Interactive
```

Sade ASCII cikti:

```powershell
.\scripts\install.ps1 -All -PlainOutput
```

## Dogrulama

Bu surum icin release hazirligi sunlari icermeli:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.8 - 2026-06-16

Bu patch ilk kurulum ve mevcut kullanıcı senaryosunu README'deki sözle aynı
hizaya getirir: Codex Chef artık mevcut Codex config'ini ezmeden eksik parçaları
ekleyebilir.

## Öne Çıkanlar

- `scripts/merge-codex-config.mjs` eklendi. Bu helper template'teki eksik
  managed Codex Chef tablolarını dependency kullanmadan mevcut config'e ekler.
- PowerShell ve Bash installer'ları, `config.toml` zaten varsa ve force
  kullanılmadıysa önce backup alır, sonra eksik blokları güvenli şekilde merge
  eder.
- Kullanıcının mevcut tabloları korunur. Mevcut MCP kayıtları, token'lar,
  profile'lar, model ayarları ve custom tool ayarları ancak kullanıcı bilerek
  `-Force` / `--force` seçerse replace edilir.
- Skill kurulumu artık varsayılan olarak ignored repo-local `tmp/npm-cache`
  kullanır; böylece Windows `%LOCALAPPDATA%` npm cache izin hataları `npx`
  çözümlemesini düşürmez.
- Install plan `codex-config` collision policy'si
  `merge-missing-blocks-unless-force-backup-before-replace` olarak düzeltildi.
- README MCP bölümü agent ve skill listeleri gibi ikonlu, görünür bir katalog
  haline getirildi.
- Installer alignment validation artık iki install yüzeyinde de config merge
  helper'ın bağlı kalmasını kontrol eder.

## Upgrade Notları

İlk kurulum:

```powershell
.\\scripts\\install.ps1 -All
npm run verify:install:runtime -- --expect-skills
```

Mevcut kurulumda kullanıcı config'ini koruyarak eksikleri ekleme:

```powershell
.\\scripts\\install.ps1 -All
```

Template'i bilinçli şekilde replace etmek istersen önce preview ve backup:

```powershell
.\\scripts\\install.ps1 -All -Force -WhatIf
.\\scripts\\install.ps1 -All -Force
```

## Doğrulama

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.7 - 2026-06-16

Bu patch gerçek kurulum sonrası kontrolü netleştirir: dosyalar kuruldu mu ve
çalışan Codex CLI aynı `CODEX_HOME` değerini mi okuyor, bunu read-only şekilde
ayırt eder.

## Öne Çıkanlar

- `scripts/verify-install-runtime.mjs` ve `npm run verify:install:runtime`
  eklendi.
- Verifier kurulu Codex Chef dosyalarını, MCP config block'larını, uzman ajan
  dosyalarını, plugin marketplace'i, opsiyonel skill'leri, opsiyonel Git
  guard'larını ve kurulu hedefin Codex runtime tarafından görülebildiğini
  kullanıcı config'ine yazmadan kontrol eder.
- Ambient sandbox/offline `CODEX_HOME` drift'i artık warning olarak raporlanır;
  verifier Codex CLI kontrollerini explicit kurulu hedefe karşı tekrar koşturur.
- Managed file drift artık kurulu agent, rule, profile ve plugin dosyalarında
  yakalanır; stale install sadece isim sayısı doğru diye geçemez.
- Repo sagligi, kurulu runtime drift'i, Codex doctor check'leri ve skills
  context-budget warning'leri icin son kullanici status panosu olarak
  `npm run codex:status` ve `npm run codex:status:all` eklendi.
- İlk kurulum komutları artık `-Force` / `--force` kullanmaz; mevcut kullanıcı
  config'i varsayılan olarak korunur.
- Force akışının normal ilk kurulum değil, preview ve backup sonrası bilinçli
  upgrade yolu olduğu netleştirildi.
- `codex doctor --json` veya `codex mcp list` sandbox/offline Codex home
  okuyorsa bunun nasıl teşhis edileceği install ve troubleshooting docs'a
  eklendi.

## Upgrade Notları

Mevcut kullanıcılar managed dosyaları replace etmeden önce preview almalı:

```powershell
.\\scripts\\install.ps1 -All -Force -WhatIf
.\\scripts\\install.ps1 -All -Force
npm run verify:install:runtime -- --expect-skills
```

İlk kurulumda force kullanma:

```powershell
.\\scripts\\install.ps1 -All
npm run verify:install:runtime -- --expect-skills
```

## Doğrulama

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.6 - 2026-06-16

Bu patch, gercek Windows kurulumundan sonra Codex Chef setup'ini daha rahat
kullanilir hale getirir; default write yetkisini genisletmez.

## One Cikanlar

- Read-only browser kaniti, repo indeksleme, diagnostic ve memory lookup
  komutlari icin MCP tool bazli approval override'lari eklendi.
- Interactive browser aksiyonlari, account-backed connector'lar, filesystem
  connector'lari, production servisleri ve mutating tool'lar default olarak
  prompt-gated veya disabled kalir.
- Doctor ve MCP validator'larinda MCP block parsing sikilastirildi; nested tool
  override table'lari ayri server gibi sayilmaz.
- Read-only PowerShell, Git, GitHub CLI, Gitleaks ve lokal validation komutlari
  icin konservatif command rule seti genisletildi.
- Plugin metadata'si ve beklenen cikti ornekleri patch version ile hizalandi.

## Upgrade Notlari

v0.5.5 kurulu olan kullanicilar guncel config ve rule dosyalarini almak icin
normal preview ve install akislarini tekrar calistirabilir. `-Force`
kullanildiginda mevcut global dosyalar replace oncesi yedeklenir.

```bash
node scripts/plan-install.mjs --all --json --redact-paths
```

```powershell
.\\scripts\\install.ps1 -All -Force -WhatIf
.\\scripts\\install.ps1 -All -Force
```

## Dogrulama

Bu version icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.5 - 2026-06-16

- Kok dizine `llms.txt` dosyasi eklendi. Kodlama ajanlari boylece tum README'yi
  taramadan install yuzeyini, docs haritasini, guvenlik sinirlarini,
  verification komutlarini ve yuksek sinyalli karsilastirma kaynaklarini hizli
  okuyabilir.
- `llms.txt`, `package.json`, `scripts/validate-repo.mjs` ve
  `scripts/validate-package-surface.mjs` uzerinden package ve validation
  yuzeyinin parcasi yapildi.
- Agent-readable indeks alti README girisinden ve completion audit'ten linklendi.
- Agent research corpus kayitlari artik agent basina decision heuristic,
  failure mode ve verification signal iceren `expertiseSignals` tasir. Corpus
  validator her bundled specialist icin uc grubun da korunmasini zorunlu tutar.
- Her specialist role dosyasi artik `Expertise signal contract` tasir ve
  validation tam bir kopyayi zorunlu tutar; boylece structured expertise
  metadata runtime'da tuketilir.
- Corpus artik repo pattern'leri, skill ornekleri, local command snapshot'lari,
  resmi proje docs'lari ve agent research paper'lari icin
  `supplementalResearchRefs` tasir. Validation bu kaynaklari freshness-checked
  tutar ve `authorityRefs` icine terfi etmedikce default runtime authority
  olmadiklarini zorunlu kilar.
- Agent research corpus authority reference'lari artik source freshness cadence
  metadata'si tasir. `scripts/validate-agent-research-corpus.mjs`,
  staleness-risk icin fazla gevsek cadence degerlerini reddeder ve
  `dateChecked` en siki cadence'den eskiyse fail eder.

## Upgrade Notlari

Bu patch installer davranisini degistirmez. Mevcut kullanicilar yeni source'u
cekip `llms.txt` dosyasini inceleyebilir; gercek global write'lar halen normal
installer ve dry-run preview akisi uzerinden yapilir.

## Dogrulama

Bu version icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.4 - 2026-06-15

Bu patch, v0.5.3 sonrasindaki Codex Chef hardening gecisini tamamlar.
Installer'in guvenli davranisini korur; uzerine app connector guardrail'leri,
mojibake validation'i, daha guclu bundled skill dokumantasyonu ve GStack/ECC
karsilastirmasini ekler. Amac, agent benzeri workflow'lari guvenli default'lari
bozmadan sunmaktir.

## One Cikanlar

- Token/context butcesi, kaynak onceligi, compaction handoff'u ve verification
  gate'leri icin bundled yerel `context-budget-planner` skill'i eklendi.
- `impeccable`, ekstra design-taste, Vercel, prompt, context, memory ve
  token-related skill'ler manuel opt-in katalog referansi olarak gorunur kaldi;
  incelenmis kurulum seti on alti public/first-party global skill'e genisledi.
- Public `token` skill aramalarinin daha cok auth/deployment/crypto-token
  workflow'larina kaydigi dokumante edildi; bu nedenle LLM context butcesi
  external default kurulum yerine yerel bundled skill ile cozulur.
- Tum bundled yerel plugin skill'leri `references/*.md` ve
  `agents/openai.yaml` ile reference-backed hale getirildi; `SKILL.md`,
  reference, UI metadata ve catalog kaydi ayni hizada kalsin diye
  `npm run validate:plugin-skills` eklendi.
- Mermaid, Excalidraw, SVG, PNG ve Markdown iddialari deterministik yerel
  renderer ile ayni hizada kalsin diye offline diagram sozlesmesi dokumante
  edildi.
- First-party ekosistem skill'leri `ai-project-starter`, `prompt-architect`
  ve `ai-skill-create`, `catalog/skills.json`, `catalog/skills-lock.json`
  ve skill dokumantasyonunda incelenmis `-All` /
  `-InstallSkills` setine eklendi.
- Global Git ignore, hook ve Git config degisiklikleri `-All` disinda tutuldu;
  kullanici bunlari `-InstallGitGuards` / `--install-git-guards` ile ayrica acar.
- App/connector guvenligi acik default'larla netlestirildi:
  `apps._default.destructive_enabled = false` ve
  `apps._default.open_world_enabled = false`.
- Localized README ve docs dosyalarinda mojibake sessizce geri gelmesin diye
  content-safety gate'i eklendi.
- Online skill-source kontrolleri ignored `tmp/skill-source-check` altinda
  sandbox edildi; boylece source validation public skill'leri cozerken Skills
  CLI yan etkileri tracked template'lere dokunamaz.
- GStack/ECC karsilastirma notlari genisletildi; hangi workflow fikirlerinin
  alindigi ve hangilerinin guvenlik icin default kurulum disinda kaldigi
  dokumante edildi.
- Yirmi bir specialist agent rol dosyasina research-synthesis ve
  adversarial-validation guidance eklendi; boylece yuksek sinyalli dis repolar
  ise yarar karar uretebilir ama gizli prompt kalabaligina veya guvensiz kopya
  automation'a donusmez.
- Yirmi bir specialist agent rol dosyasina source-refresh, source-currency ve
  corpus-expansion guidance eklendi; boylece her ajan stale kaniti tazeler ve
  alan bilgisini kisa calisma kurallarina genisletmeyi bilir.
- Yirmi bir specialist agent rol dosyasina expert-calibration guidance
  eklendi; boylece her ajan ana thread'e donmeden once ciktisini role ozel
  senior-quality cizgisine vurur.
- Agent validation sikilastirildi; her specialist role dosyasi her zorunlu
  guardrail blogundan tam bir tane, en az 100 source-backed instruction item'i
  ve en az 20 distinct source marker tasimalidir.
- `catalog/agent-research-corpus.json` ve
  `scripts/validate-agent-research-corpus.mjs` eklendi; boylece specialist
  agent research domain, source type, refresh trigger ve handoff kayitlari
  makine tarafindan kontrol edilebilir.
- Agent research corpus'a reviewed `authorityRefs` metadata'si eklendi; her
  uzman ajan stable resmi, vendor, standart ve tool-source ailelerine URL,
  source type, staleness risk ve source marker ile isaret edebilir; validator bu
  key'lerin eslesen agent TOML source marker'larinda temsil edildigini de
  dogrular.
- Her specialist TOML'e `Authority metadata contract` blogu eklendi; boylece
  cagrilan ajanlar source marker'larini runtime guidance olarak kullanir.
- Cross-model review pattern'i acikca map edildi: Codex Chef bunu
  `code_reviewer` ve manuel Codex CLI kullanimi uzerinden destekleyebilir, ama
  baska agent veya external review flow'u otomatik baslatmaz.

## Upgrade Notlari

- `-All` halen core Codex Chef setup'ini ve incelenmis skill setini kurar;
  global Git guard degisiklikleri `-InstallGitGuards` /
  `--install-git-guards` ile ayri opt-in kalir.
- Kullanici gercek install'i force ile calistirirsa mevcut global Codex
  dosyalari degistirilmeden once backup alinir.
- Authenticated MCP/app connector'lari default olarak disabled veya
  least-privilege kalir; destructive ve open-world connector araclari reviewed
  override olmadan acilmaz.

## Dogrulama

Bu version icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.3 - 2026-06-15

Bu patch final README render duzeltmesini release/tag gorunumune de tasir.

## One Cikanlar

- Ingilizce ve Turkce README'de eski uzun ajan tablo metinleri kisa bullet
  listelere cevrildi.
- Skill tabloları da kisa bullet listelere cevrildi.
- Installer, template'ler, MCP default'lari, skill kaynaklari, validation ve
  security gate'leri degismedi.

## Upgrade Notlari

Installer davranisi degismedi. Codex Chef zaten kuruluysa sadece en guncel docs
icin repoyu cekmek yeterlidir.

## Dogrulama

Bu patch icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.2 - 2026-06-15

Bu patch render edilen ilk ekran incelendikten sonra yapilan final README polish
gecisidir. Installer davranisi degismez.

## One Cikanlar

- Ilk ekrandaki tekrar hissi azaltildi; kurulum ozeti kisa tutuldu, ajan ve
  skill detaylari kendi katalog bolumlerine tasindi.
- Ingilizce ve Turkce ajan tablolarinda ikon, okunur rol adi, config ID ve
  kullanim amaci ayri sutunlara ayrildi.
- Ingilizce ve Turkce skill tablolarinda skill adi, ID, kurulum sekli ve
  kullanim amaci ayri sutunlara ayrildi.
- Codex Chef'in ayri background servisleri degil, Codex subagent role
  definition'lari kurdugu netlestirildi.

## Upgrade Notlari

Bu patch installer davranisini degistirmez. Global write oncesi ayni preview
komutlari kullanilir:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

## Dogrulama

Bu patch icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.1 - 2026-06-15

Bu patch public README vitrini ve CI workflow'unu final Codex Chef release
durusu ile ayni hizaya getirir. Installer davranisi degismez.

## One Cikanlar

- README onboarding'i tek bakista okunacak hale getirildi: tek komutla kurulum,
  kurulan ajan takimi, paketlenen skill'ler, opsiyonel global skill'ler ve MCP
  varsayilanlari ayni yerde gorunur.
- Ingilizce ve Turkce ajan/skill tablolari ikonlu, isimli ve daha dogal use-case
  diliyle yeniden duzenlendi; gercek Codex config ID'leri gorunur kalir.
- Almanca, Ispanyolca, Brezilya Portekizcesi ve Fransizca README girislerine
  dogal "kurulumdan sonra ne hazir olur" ozeti eklendi.
- Alti kok README girisindeki tekrar eden dil satiri kaldirildi: German,
  Spanish, English, Brazilian Portuguese, Turkish ve French.
- O donemdeki Codex Chef ajan ekibi gercek kurulum kaynagindan dokumante
  edildi: `templates/codex/agents/*.toml` ve platform Codex config
  template'leri.
- Plugin-local skill'ler ve opsiyonel global skill'ler, genis external skill
  kataloglari default import ediliyormus gibi gostermeden anlatildi.
- Validation workflow Node 24 donemi icin pinned GitHub Actions'a guncellendi:
  `actions/checkout` v6.0.3 ve `actions/setup-node` v6.4.0.
- Guvenlik durusu degismedi: default auth connector yok, otomatik
  publish/deploy yok, gizli global write yok.

## Upgrade Notlari

Bu patch installer davranisini degistirmez. Mevcut kullanicilar `main`i cekip
veya release source archive'i kullanip global dosya degistirmeden once preview
calistirmali:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

README'de gorunen ajan listesi maintainer'in mevcut global agent state'i degil,
Codex Chef'in kurulabilir ajan setidir.

## Dogrulama

Bu patch icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.5.0 - 2026-06-15

Bu release projeyi Codex Chef olarak rebrand eder ve guvenli installer modelini
zayiflatmadan public kesfedilebilirligi guclendirir.

## One Cikanlar

- Public urun ve package yuzeyi Codex Chef / `codex-chef` olarak yenilendi.
- Codex Chef gorsel kimlik asset'leri eklendi: `assets/icon.svg` ve
  `assets/social-preview.svg`.
- README hero ve public metadata, source-backed `Windows-first Codex setup kit`
  ifadesi etrafinda yeniden duzenlendi.
- GitHub description, topics, social preview, search-safe claim ve yayin sonrasi
  olcum icin SEO/discoverability rehberi eklendi.
- Local plugin yuzeyi `codex-chef-workflows`, maintenance skill'i
  `codex-chef-operator` olarak yeniden adlandirildi.
- Guvenlik durusu degismedi: auth connector'lar default kapali, installer
  preview/backup davranisini korur, release/publish aksiyonlari acik onay ister.

## Upgrade Notlari

Rename edilen plugin path'i kurulmadan once dry-run calistir:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

Yeni managed plugin hedefi `codex-chef-workflows` adidir. Onceki checkout eski
isimle kurulmustuysa global plugin kopyalarini silmeye karar vermeden once
dry-run ciktisini incele.

## Dogrulama

Bu version icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.4.0 - 2026-06-15

Bu release starter'i sadece guvenli installer/docs kiti olmaktan cikarip daha
tam bir Codex calisma setup'ina yaklastirir: daha guclu uzman routing'i, lokal
diagnostic ve offline workflow araci ekler.

## One Cikanlar

- Paketlenen uzman seti 20 Codex agent'a genisledi: product strategy,
  engineering planning, design review, DevEx audit, root-cause debugging, QA,
  performance, docs authoring ve spec authoring rolleri eklendi.
- No-write starter health, catalog drift, docs matrix, MCP, skills ve
  install-plan diagnostic icin `npm run codex:doctor` eklendi.
- Prompt, `AGENTS.md`, skill, plugin, MCP, subagent, rule, hook ve release gate
  sinirlarini gosteren alti dilli Codex capability map ve workflow surface map
  eklendi.
- Zero-network `offline-diagram-triplet` skill'i eklendi; Mermaid, editable
  Excalidraw, SVG, PNG ve Markdown ciktisi uretir.
- Diagram validator cycle reject, graph size limit, pixel budget, PNG coverage
  ve temp cleanup ile sertlestirildi.
- Installer konservatif kalir: default auth connector yok, genis hook yok,
  gizli global write yok, publish/deploy otomasyonu yok.

## Upgrade Notlari

Mevcut kullanicilar global dosya degistirmeden once preview calistirmali:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
.\\scripts\\install.ps1 -All -Force -WhatIf
```

Yeni ajanlar ve local diagram skill sadece incelenmis starter install flow'u ile
kurulur. Doctor komutu default repo-only'dir ve user-global dosya iceriklerini
okumaz:

```bash
npm run codex:doctor
```

## Dogrulama

Bu version icin release readiness su kontrolleri icermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.3.1 - 2026-06-15

Bu patch, v0.3.0 ile eklenen çok dilli dokümantasyon yüzeyini tamamlar. Kök
README dosyaları ve `docs/` altındaki derin rehberler artık tutarlı altı dilli
dosya matrisine sahiptir.

## Öne Çıkanlar

- `docs/` altındaki her İngilizce rehber için Almanca, İspanyolca, Brezilya
  Portekizcesi ve Fransızca deep-doc dosyaları eklendi.
- Ek localized deep-doc dosyalarını gözden geçirilmiş İngilizce rehber
  yapısından yeniden üretmek için `npm run sync:doc-locales` eklendi.
- Eksik locale dosyaları lokal ve CI kontrollerinde fail etsin diye
  `npm run validate:doc-locales` eklendi ve `npm run check` içine bağlandı.
- Repo, security, workflow ve release-readiness validatorları `de`, `es`,
  `pt-BR`, `tr` ve `fr` doc çiftlerini anlayacak şekilde güncellendi; sadece
  İngilizce/Türkçe varsayımı kaldırıldı.
- Public yüzey artık deep docs sadece İngilizce/Türkçe gibi görünmesin diye
  README konumlandırması ve linkleri güncellendi.

## Upgrade Notları

Bu patch installer davranışını değiştirmez. Mevcut kullanıcılar repoyu çekip
aynı dry-run ve doğrulama komutlarını kullanabilir:

```bash
npm run check
node scripts/plan-install.mjs --all --json
```

## Doğrulama

Bu patch için release readiness şu kontrolleri içermelidir:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

## v0.3.0 - 2026-06-14

Bu release, ECC'nin manifest ve release-gate yaklaşımındaki güvenli fikirleri
Codex starter'a taşır. ECC'nin global config'leri, hook'ları, MCP katalogları,
skill setleri veya account connector'ları toptan import edilmez.

## Öne Çıkanlar

- Manifest tabanlı no-write install plan eklendi:
  `node scripts/plan-install.mjs --all --json`.
- No-write install kesif komutlari eklendi:
  `node scripts/plan-install.mjs --list-profiles` ve
  `node scripts/plan-install.mjs --list-operations`.
- Dependency-free install-plan validation eklendi; JSON smoke, Windows UNC path,
  Windows extended-length path, `--force` ve `--no-backup` davranışları
  doğrulanır.
- Makine okunur no-write plan ciktisi icin install-state preview schema ve
  validator eklendi.
- Publish-safe install-state preview kaniti icin `--redact-paths` eklendi.
- PowerShell ve Bash setup davranışı `manifests/install-plan.json` ile aynı
  hizada kalsın diye installer alignment validation eklendi.
- Paketlenen uzman ajan metadata'si, Windows/Unix config bloklari ve role TOML
  dosyalari senkron kalsin diye specialist-agent catalog ve config validator
  eklendi.
- Windows ve Unix Codex template'leri için MCP catalog/config drift validation
  eklendi.
- Remote shell pipe, PowerShell download-execute, encoded command, unsafe root
  removal, world-writable chmod, active `@latest` package spec ve implicit
  installer dependency install desenleri için supply-chain IOC scan eklendi.
- Release notes, GitHub settings docs, workflow hardening, Gitleaks gate'leri
  ve source artifact hygiene icin release-readiness validation eklendi.
- Npm tabanli tum MCP package spec'leri Codex config template'lerinde ve MCP
  catalog metadata'sinda exact version ile pinlendi; unversioned veya floating
  package resolution engellendi.
- Cleanup script'leri auto-allow yerine prompt isteyecek sekilde
  command-approval rules sikilastirildi.
- Global skill kurulumu ve genis Skills CLI komutlari auto-allow yerine prompt
  isteyecek sekilde command-approval rules sikilastirildi.
- Online skill-source verification, package degerlerini PowerShell command
  string icine gommek yerine argv tabanli cagri ve gecici Windows wrapper
  kullanacak sekilde harden edildi.
- `catalog/skills-lock.json` dosyasinin degistirilemez upstream commit lock'u
  degil, incelenmis kaynak allowlist'i oldugu netlestirildi; online skill
  resolution release hazirliginin parcasi yapildi.
- Default Gitleaks kurallarını açık tutan, yalnızca ignored local scratch,
  dependency, build ve cache dizinlerini dışarıda bırakan `.gitleaks.toml`
  eklendi.
- ECC compatibility sınırları İngilizce ve Türkçe dokümante edildi.
- CODEOWNERS, feature/question issue template'leri, kapalı blank issue akışı ve
  advisory-source docs eklendi; public triage sahipli, sınırlı ve public-safe
  kalır.
- Almanca, İspanyolca, Brezilya Portekizcesi ve Fransızca kök README girişleri
  eklendi; altı dilli switcher default check pipeline tarafından doğrulanır.
- ECC'nin public-surface ve CI-hardening gate'lerinden esinlenen README locale
  validation ve workflow-security validation eklendi.
- GitHub Actions workflow dependency'leri full commit SHA ile pinlendi ve
  workflow validation tag-based action ref'lerini publish oncesi fail edecek
  sekilde genisletildi.
- ECC drift gate'leri genisletildi: plugin-bundled hook, MCP/apps yuzeyi,
  write-capable plugin manifest, marketplace auth zorunlulugu, genis hook
  runtime path'leri, workflow write permission'lari, unpinned git MCP launcher,
  plugin `.mcp.json` drift'i ve review edilmemis Codex/Agents/Git-guard disi
  install-plan hedefleri reddedilir.
- Text source dosyalari icin dangerous invisible Unicode character validation
  eklendi; mesru README emoji/icon kullanimi korunur.
- Publish oncesi yalniz tek maintainer path'i degil, non-placeholder Windows,
  macOS ve Linux home path'leri de yakalanacak sekilde local-path leak
  kontrolleri genisletildi.
- Import edilen ECC-style lifecycle hook runtime'larini ve otomatik
  session/additional-context injection desenlerini, gelecekte acik review ve
  dokumantasyon olmadan, engelleyen security validation eklendi.
- Repo-local npm cache ve `--ignore-scripts` kullanan package-surface dry-run
  validation eklendi; online skill-source resolution artik bounded timeout ile
  calisir.
- `package.json` icin explicit source package allowlist ve validation eklendi;
  package dry-run'lari deterministic kalirken local agent state, scratch
  klasorleri, archive'lar ve auth materyali disarida tutulur.

## Upgrade Notları

Installer çalıştırmadan önce planı incele:

```bash
npm run check
node scripts/plan-install.mjs --all --json
```

Sonra kendi shell'in için dry-run yolunu çalıştır:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

```bash
./scripts/install.sh --all --force --dry-run
```

Gerçek installer hâlâ yalnızca bilinçli olarak çalıştırıldığında yazar. Managed
global dosyalar, `-NoBackup` veya `--no-backup` açıkça verilmedikçe replace
öncesi yedeklenir.

## Doğrulama

Release hazırlığı şu komutlarla kontrol edildi:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git diff --check
```

Bash syntax validation GitHub Actions üzerinde Ubuntu ile kapsanır. Bu release
hazırlığı yapılan lokal Windows ortamında Bash kurulu değildi.
