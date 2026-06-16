# Release Notları

## Unreleased

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
- Release ve HTTPS Git auth hatalari icin kalici `gh auth login --scopes
  repo,workflow` ve Git Credential Manager recovery komutlari dokumante edildi.

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
