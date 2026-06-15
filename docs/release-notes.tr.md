# Release Notları

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
- Kurulan 20 ajanlik Codex Chef ekibi gercek kurulum kaynagindan dokumante
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
