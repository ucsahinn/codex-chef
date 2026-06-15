# Release Notları

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
