# Codex Chef

<p align="center">
  <img src="assets/icon.svg" alt="Codex Chef ikon" width="120" />
  <br />
  <img src="assets/banner.svg" alt="Uzman ajanlar, MCP kaynakları, skill'ler, doğrulama ve iki dilli dokümanları gösteren Codex Chef banner görseli" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT lisansı" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Dokumantasyon dilleri" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows ve WSL uyumlu" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> <strong>Doküman dilleri:</strong>
  <a href="README.de.md"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"></a> |
  <a href="README.es.md"><img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"></a> |
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a> |
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"></a> |
  <a href="README.tr.md"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"></a> |
  <a href="README.fr.md"><img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"></a>
</p>

Codex Chef, Windows tarafında güçlü ama güvenli bir Codex başlangıcı isteyenler için hazırlanmış bir setup kitidir. Sana tek tek uğraşmadan kurulabilen bir temel verir: kalıcı talimatlar, kontrollü config, isimlendirilmiş uzman ajanlar, MCP varsayılanları, seçilmiş skill'ler, yerel plugin akışları ve kurulmadan önce doğrulanabilen güvenlik kapıları.

Bu resmi OpenAI ürünü değildir; community starter paketidir. Güncel resmi Codex dokümanlarıyla eşleştirilmiştir ve riskli aksiyonlar varsayılan olarak onaya bağlı kalır.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Tek Seferde İndir Ve Kur

Çok dilli README girişleri ve six-language deep docs coverage release yüzeyinin
parçasıdır. İngilizce ve Türkçe install, beklenen çıktı ve release notlarında
tam operatör detayını taşır; Deutsch, Español, Português (Brasil) ve Français
dosyaları güvenlik özeti ve kaynak bölüm indeksi vererek tam detayın hangi
otoritatif dosyada olduğunu gösterir.

Windows PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Önce güvenli ön izleme:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
node scripts/plan-install.mjs --all --json --redact-paths
```

Mevcut global Codex kurulumunu user skill'lerini silmeden onar:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair
```

Codex Chef CLI ayni guvenli scriptleri tek Windows dostu menude toplar:

```powershell
npm run chef
npm run chef -- --status
npm run chef -- --status --repo-only
npm run chef -- --preview
npm run chef -- --update
npm run chef -- --reset --apply
npm run chef -- --repair --apply
npm run chef -- --install --apply
npm run chef -- --skills
npm run chef -- --mcp
npm run chef -- --routing
npm run chef -- --routing --profile starter-health
npm run chef -- --auth
npm run chef -- --logs
npm run chef -- --status --repo-only --no-log
```

Menu her aksiyonun write sinirini gosterir. `--status`, `--doctor`,
`--preview`, `--skills`, `--mcp`, `--routing`, `--auth` ve `--logs` varsayilan olarak
global/user state icin read-only rehberlik veya dogrulama akislari olur.
Normalde `tmp/chef-cli/logs` altina ignored lokal audit log'u yazarlar; strict
audit icin `--no-log` ekle. Hızlı lokal repo kontrolü için
`--status --repo-only` kullan; bu mod kurulu runtime'i, global skill-root
envanterini, Codex log metadata'sini ve live Codex CLI probe'larini atlar.
`--update`, `--apply` eklenmedikce managed/global no-write
preview yapar; apply modunda clean worktree ister ve `git pull --ff-only`
calistirir. Pull repo HEAD'ini ilerletirse CLI yeni tree icin fresh preview
basip durur; preview'i inceleyip `--update --apply` tekrar calistirirsin. Repo
zaten guncelse lokal validation calistirip managed dosyalari backup alan
installer uzerinden yeniler; curated global skill veya opsiyonel global Git
guard kurmaz.
`--reset --apply`, `--repair --apply` ve `--install --apply` diger write
path'leridir; user state silmek yerine backup alan installer/repair
scriptlerine giderler. Interactive
terminalde `--skills` numarayla tek reviewed skill sectirir ve sadece `--apply`
ile kurar. `--mcp` numarayla connector sectirip transport, endpoint veya
package, setup, auth, dogrulama, source ve rollback notlarini gosterir; account
connector'larini kendiliginden acmaz. `--routing` task-shape haritasini, agent
bekleme politikasini, skill trigger'larini, MCP secimlerini ve final "Surfaces
used" raporlama sozlesmesini gosterir. CLI loglari ignored kalir ve source
package'a girmez.

PowerShell baska bir dizinde `Could not read package.json` hatasi verirse
komutu repo icinden calistir veya npm prefix formunu kullan:

```powershell
cd C:\Users\you\Desktop\codex-chef
npm run chef -- --status
npm --prefix C:\Users\you\Desktop\codex-chef run chef -- --status
```

`npx run` kullanma; bu repo lokal npm script'leri expose eder ve npm'deki
`run` paketi ilgisiz bir filesystem watcher baslatir.
`npm run chefg` ayni menuye giden compatibility typo alias olarak kalir; yeni
dokumanlarda `npm run chef` kullan.

GitHub release, push veya workflow kontrolleri lokal GitHub auth eskidigi icin
fail ederse GitHub CLI veya Git Credential Manager'i kendi kurum politikaniza
gore yenileyin. Account-scoped credential repair bu public repo disinda kalmali;
token'lari repo dosyalarina, loglara, promptlara, skill'lere, rule'lara veya
shell history'ye yapistirmayin.

Soru sormayan otomasyon dostu tek komut:

```powershell
.\scripts\install.ps1 -All
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> Kurulumdan Sonra Ne Gelir?

Codex Chef başka bir makinenin global ayarlarını kopyalamaz. Kurulum kaynağı bu
repo içindeki `templates/codex/config.*.toml`, `templates/codex/agents/*.toml`,
`plugins/codex-chef-workflows` ve manifest-backed install planıdır.

| Yüzey | Makineye ne kurulur? |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Ajan ekibi | `~/.codex/agents/*.toml` altında 21 kayıtlı Codex subagent rol dosyası. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Kalıcı rehberlik | Güvenli routing, doğrulama ve onay kuralları içeren global `~/.codex/AGENTS.md`. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP varsayılanları | 7 faydalı MCP açık, 8 auth/high-risk connector kapalı bekler. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Plugin + skill'ler | Yerel `codex-chef-workflows` plugin'i, üç bundled skill ve on altı opsiyonel global skill. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Güvenlik kapıları | Backup, dry-run plan, secret scan, validation ve onaylı riskli aksiyon modeli. |

Installer en sonda bir capability board basar: ajan ekibi, varsayilan hazir
MCP'ler, disabled/opt-in MCP'ler, local plugin skill'leri ve reviewed global
skill'ler tek ekranda gorunur. Tooling, OAuth, filesystem path ve
`SUPABASE_DB_URL` isteyen MCP'ler icin setup notlarini da basar; yani kurulum
bittiginde "bana ne geldi ve ne eksik input ister?" sorusunun cevabini direkt
gorursun.

### <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP Panosu

Codex Chef MCP'leri gizli hesap senkronizasyonu gibi kullanmaz; hepsi açık
yüzeylerdir. Lokal/araştırma odaklı olanlar hazır gelir. Hesap, database,
production ve geniş filesystem tarafı ise sen gerçekten istemeden kapalı kalır.

| Durum | MCP'ler | Neden |
| --- | --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Varsayılan hazır | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> OpenAI Docs · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> Context7 · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Sequential Thinking · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ad.svg" alt="" aria-hidden="true" width="20"> Playwright · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> Chrome DevTools · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="20"> Serena · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Memory | Güvenli araştırma, kod gezme, browser kanıtı ve secret içermeyen lokal context. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f512.svg" alt="" aria-hidden="true" width="20"> Varsayılan kapalı | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> Filesystem · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f419.svg" alt="" aria-hidden="true" width="20"> GitHub · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> Figma · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cc.svg" alt="" aria-hidden="true" width="20"> Linear · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5d2.svg" alt="" aria-hidden="true" width="20"> Notion · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a8.svg" alt="" aria-hidden="true" width="20"> Sentry · ▲ Vercel · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5c4.svg" alt="" aria-hidden="true" width="20"> Supabase | Private dosya, hesap, telemetry, deploy veya database açabileceği için sadece ihtiyaç olunca açılır. |

Kurulumdan sonra `npm run codex:status` calistirarak canli MCP setup panosunu,
etkili routing kontrollerini ve global Codex state'ini degistirmeden runtime
drift durumunu gorebilirsin.

`~/.codex/config.toml` zaten varsa installer önce backup alır ve sadece eksik
Codex Chef agent/MCP/safety tablolarını ekler. Mevcut MCP kayıtların,
token'ların, profile'ların ve kendi ayarların `-Force` / `--force` vermediğin
sürece korunur.

### Enterprise Routing Panosu

Codex Chef artik `catalog/routing-profiles.json` dosyasini da kurulum yuzeyinin
bir parcasi olarak tasir. Bu dosya Codex'e yaygin enterprise is sekillerinde
hangi subagent, skill, MCP ve config/profile flag'inin kullanilacagini soyler:
guncel dokuman arastirmasi, context'in nereye yazilacagi, bug root-cause,
frontend dogrulama, guvenlik review'u, MCP connector degisikligi, release
hazirligi, SEO, docs ve starter sagligi.

```bash
npm run codex:routing
npm run codex:status
npm run chef -- --routing --profile starter-health
```

Bu guvenli otonomidir; gizli calisan bir auto-executor degildir. Task shape
uydugunda dogru ajan, skill, MCP ve flag zorunlu hale gelir; ama destructive,
credential, publish, deploy, database ve genis filesystem aksiyonlari yine
onay kapisinda kalir. Pano `Agent plan`, `Agent started`, `Agent result`,
`Skill selected`, `MCP selected` ve
`Surfaces used: agents=..., skills=..., mcp=..., commands=..., skipped=...`
satirlarini da gosterir; hangi yuzeyin kullanildigi final raporda kaybolmaz.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Kurulan Ajan Ekibi

Codex Chef'in kurduğu ajanlar ayrı arka plan servisleri değildir. Bunlar Codex'in
task routing sırasında kullanacağı isim, açıklama ve TOML rol dosyalarıdır.

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="20"> **Kod Haritacısı** (`code_mapper`) - repo haritası
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> **Doküman Araştırmacısı** (`docs_researcher`) - resmi docs
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> **Context Mimarı** (`context_architect`) - routing yüzeyi
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="20"> **Prompt Mimarı** (`prompt_architect`) - prompt sistemi
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> **MCP Entegratörü** (`mcp_integrator`) - connector'lar
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3af.svg" alt="" aria-hidden="true" width="20"> **Ürün Stratejisti** (`product_strategist`) - scope
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3d7.svg" alt="" aria-hidden="true" width="20"> **Mühendislik Planlayıcısı** (`engineering_planner`) - mimari
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> **Tasarım İnceleyicisi** (`design_reviewer`) - UX polish
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> **DevEx Denetçisi** (`devex_auditor`) - onboarding
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f575.svg" alt="" aria-hidden="true" width="20"> **Kök Neden Dedektifi** (`root_cause_debugger`) - araştırma
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> **QA Lideri** (`qa_lead`) - kullanıcı akışları
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> **Performans Denetçisi** (`performance_auditor`) - hız
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> **Google SEO Denetçisi** (`google_seo_auditor`) - arama görünürlüğü
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4dd.svg" alt="" aria-hidden="true" width="20"> **Doküman Yazarı** (`docs_author`) - docs coverage
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> **Spec Yazarı** (`spec_author`) - uygulanabilir spec
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50d.svg" alt="" aria-hidden="true" width="20"> **Kod İnceleyicisi** (`code_reviewer`) - fresh review
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5a5.svg" alt="" aria-hidden="true" width="20"> **Frontend Doğrulayıcısı** (`frontend_verifier`) - render UI
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> **Güvenlik Denetçisi** (`security_auditor`) - threat path
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> **Test Doğrulayıcısı** (`test_verifier`) - test kanıtı
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a2.svg" alt="" aria-hidden="true" width="20"> **Release Doğrulayıcısı** (`release_verifier`) - publish gate
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="20"> **Codex Doktoru** (`codex_doctor`) - setup sağlığı

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skill'ler

Kurulu skill'ler kendiliginden calismaz. Bir skill, kullanici adini yazdiginda,
ornegin `$security-best-practices`, ya da is acikca description ile eslestiginde
Codex context'ine girer. `npm run chef -- --skills --plain --no-log` katalogu,
kaynak gate'ini ve activation contract'i kanitlar; canli aktivasyon ise oturum
icinde asistanin `Skill selected` yazmasi ve aksiyondan once ilgili
`SKILL.md` dosyasini okumasiyla kanitlanir.

Codex Chef üç yerel plugin skill'iyle gelir. Bunlar `codex-chef-workflows`
plugin'iyle birlikte gelir ve `npm run validate:plugin-skills` ile kontrol
edilir; yani repo içinde sessizce kaybolamaz veya katalogdan kopamaz. `-All`
veya `-InstallSkills` verirsen bakım, debug, refactor planlama, güvenlik, test,
browser doğrulama, SEO, web quality, docs, MCP geliştirme, context engineering,
prompt mimarisi, skill üretimi ve tek bir geniş frontend workflow'u için
seçilmiş on altı public/first-party skill'i de global Codex skill'i olarak
kurabilir.

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> **Chef Operatörü** (`codex-chef-operator`) - plugin-local
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> **Offline Diagram Triplet** (`offline-diagram-triplet`) - plugin-local
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ee.svg" alt="" aria-hidden="true" width="20"> **Context Budget Planner** (`context-budget-planner`) - plugin-local
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2b06.svg" alt="" aria-hidden="true" width="20"> **Dependency Upgrade** (`dependency-upgrade`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5bc.svg" alt="" aria-hidden="true" width="20"> **Frontend Builder** (`frontend-skill`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> **Security Best Practices** (`security-best-practices`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ef.svg" alt="" aria-hidden="true" width="20"> **GitHub CI Fixer** (`gh-fix-ci`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f575.svg" alt="" aria-hidden="true" width="20"> **Systematic Debugging** (`systematic-debugging`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f1.svg" alt="" aria-hidden="true" width="20"> **Refactor Planner** (`request-refactor-plan`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> **Webapp Testing** (`webapp-testing`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> **Test-Driven Development** (`test-driven-development`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> **SEO** (`seo`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/267f.svg" alt="" aria-hidden="true" width="20"> **Accessibility** (`accessibility`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4ca.svg" alt="" aria-hidden="true" width="20"> **Web Quality Audit** (`web-quality-audit`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4dd.svg" alt="" aria-hidden="true" width="20"> **Documentation And ADRs** (`documentation-and-adrs`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> **MCP Builder** (`mcp-builder`) - opsiyonel global
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f1.svg" alt="" aria-hidden="true" width="20"> **Context Starter** (`ai-project-starter`) - opsiyonel global, first-party
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="20"> **Prompt Architect Skill** (`prompt-architect`) - opsiyonel global, first-party
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e0.svg" alt="" aria-hidden="true" width="20"> **Skill Forge** (`ai-skill-create`) - opsiyonel global, first-party

Ek tasarım, React/Vercel, prompt, memory, token ve context skill'leri
`catalog/skills.json` içinde manuel opt-in olarak durur; default kurulumun içine
bilerek eklenmez. Böylece `impeccable`, `design-taste-frontend`,
`image-to-code`, `high-end-visual-design`, `web-design-guidelines`,
`vercel-react-best-practices`, `vercel-optimize`, `vercel-cli-with-tokens`,
`context-map` ve `what-context-needed` gibi yetenekler kaybolmaz, ama ilk
kurulum gereksiz trigger gürültüsüyle şişmez.

Önemli ayrım şu: LLM token/context planlamasını yerel bundled
`context-budget-planner` çözer. Deployment-token veya vendor-auth tarafındaki
skill'ler ise hesaplara dokunabildiği ya da mevcut tetikleri çoğalttığı için
manual opt-in kalır.

Bizim first-party ekosistem skill'leri artık gözden geçirilmiş `-All` /
`-InstallSkills` setinin içinde gelir:

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f1.svg" alt="" aria-hidden="true" width="20"> `ai-project-starter` - proje context temeli, starter docs,
  ajan instruction dosyaları ve vibe-coding guardrail'leri.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="20"> `prompt-architect` - plan-first, onay kapılı Codex prompt
  paketleri ve prompt audit'leri.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e0.svg" alt="" aria-hidden="true" width="20"> `ai-skill-create` - Codex skill/plugin oluşturma, doğrulama,
  forward-test ve paketleme.

Manuel kurulum örneği:

```bash
npx skills add pbakaus/impeccable --skill impeccable --agent codex --yes --global
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP Varsayılanları

Codex Chef MCP config kayıtları kurar; gizli hesap bağlantısı açmaz. Lokal ve
araştırma odaklı kaynaklar açık gelir. Auth, database, production ve geniş
filesystem connector'ları ise gerçekten ihtiyaç olana kadar kapalı kalır.

Varsayılan açık:

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> **OpenAI Developer Docs** (`openaiDeveloperDocs`) - resmi OpenAI/Codex dokümanları.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> **Context7** (`context7`) - güncel kütüphane ve framework dokümanları.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> **Sequential Thinking** (`sequential-thinking`) - karmaşık işleri parçalara ayırma.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ad.svg" alt="" aria-hidden="true" width="20"> **Playwright** (`playwright`) - browser snapshot, console/network kanıtı ve UI kontrolü.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> **Chrome DevTools** (`chrome-devtools`) - izole Chrome inceleme ve redacted network headers.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="20"> **Serena** (`serena`) - semantic code navigation ve repo symbol araması.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> **Memory** (`memory`) - secret içermeyen lokal proje context hafızası.

İhtiyaç olana kadar kapalı:

- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> **Filesystem** (`filesystem`) - geniş lokal dosya erişimi; açmadan önce bilinçli path seç.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f419.svg" alt="" aria-hidden="true" width="20"> **GitHub** (`github`) - auth isteyen private repo/PR context'i.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="20"> **Figma** (`figma`) - private tasarım dosyaları ve workspace context'i.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cc.svg" alt="" aria-hidden="true" width="20"> **Linear** (`linear`) - issue, proje ve takım planlama context'i.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5d2.svg" alt="" aria-hidden="true" width="20"> **Notion** (`notion`) - private docs ve database'ler.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a8.svg" alt="" aria-hidden="true" width="20"> **Sentry** (`sentry`) - production hata ve telemetry context'i.
- ▲ **Vercel** (`vercel`) - proje ve deployment platform context'i.
- <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5c4.svg" alt="" aria-hidden="true" width="20"> **Supabase** (`supabase`) - `SUPABASE_DB_URL` üzerinden database erişimi.

Kullanıcıda zaten `~/.codex/config.toml` varsa installer artık onu korur ve
sadece eksik Codex Chef agent/MCP/safety tablolarını ekler. Mevcut MCP
kayıtları, token'lar, profile'lar ve kullanıcı ayarları `-Force` / `--force`
ile preview ve backup sonrası bilinçli replace seçilmedikçe değiştirilmez.

## &#127760; Dil Girişleri

| Dil | README |
| --- | --- |
| <img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"> | [README.de.md](README.de.md) |
| <img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"> | [README.es.md](README.es.md) |
| <img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"> | [README.md](README.md) |
| <img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"> | [README.pt-BR.md](README.pt-BR.md) |
| <img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"> | [README.tr.md](README.tr.md) |
| <img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"> | [README.fr.md](README.fr.md) |
## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Buradan Başla

| Hedef | Link |
| --- | --- |
| Güvenli kurulum yapmak | [Hızlı Kurulum](#-hızlı-kurulum) |
| Yazmadan önce ön izleme almak | [Önce Dry Run](#-önce-dry-run) |
| Tüm install planını incelemek | [Install Planı](#-install-planı) |
| Nelerin kurulduğunu görmek | [Kurulum Yüzeyi](#-kurulum-yüzeyi) |
| Codex kapasitesini anlamak | [Kapasite Haritası](docs/codex-capability-map.tr.md) |
| ECC/GStack workflow yuzeylerini anlamak | [Workflow Yuzey Haritasi](docs/workflow-surface-map.tr.md) |
| Publish öncesi doğrulamak | [Doğrulama](docs/verification.tr.md) |
| Release notlarını okumak | [Release Notları](docs/release-notes.tr.md) |
| GitHub metadata hazırlamak | [GitHub Ayarları](docs/github-settings.tr.md) |
| Advisory girdilerini incelemek | [Advisory Kaynakları](docs/advisory-sources.tr.md) |
| Windows/Codex sorunlarını çözmek | [Troubleshooting](docs/troubleshooting.tr.md) |
| Mevcut setup'ı yükseltmek | [Upgrade Rehberi](docs/upgrade.tr.md) |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> Bu Repo Ne?

Codex Chef, dağınık yerel setup bilgisini public, okunabilir ve doğrulanabilir bir starter repoya çevirir. Şu sorulara net cevap verir:

- Ne `AGENTS.md` içinde olmalı, ne config/skill/plugin/MCP/rule/hook tarafına gitmeli?
- Hangi connector'lar varsayılan olarak güvenli?
- Setup hangi global dosyalara dokunur?
- Bu repoya güvenmeden önce nasıl doğrularım?
- Güvenliği zayıflatmadan nasıl genişletirim?

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Kurulum Yüzeyi

Installer şu yönetilen template'leri kopyalar:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.codex/plugins/codex-chef-workflows`
- `~/.agents/plugins/marketplace.json`

Opsiyonel switch'lerle şunlar da kurulabilir:

- Global Git ignore: `~/.gitignore_global`
- Global Git pre-commit hook: `~/.githooks`
- `catalog/skills.json` içindeki seçilmiş public Codex skill'leri

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> Ne Yapmaz?

Installer şunları yapmaz:

- Token, cookie, auth dosyası, private key, memory, session veya yerel proje state'i saklamaz.
- Auth isteyen hesap, database, production veya geniş filesystem MCP connector'larını varsayılan olarak açmaz.
- Commit, push, release, deploy, package publish, secret rotation veya GitHub settings değişikliği yapmaz.
- Kullanıcı açıkça `-NoBackup` veya `--no-backup` seçmedikçe yönetilen hedefleri backup almadan değiştirmez.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="20"> Önce Dry Run

PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
```

Bash veya WSL:

```bash
./scripts/install.sh --all --dry-run
```

Dry run gerçek dosyalara, Git ayarlarına veya global skill'lere dokunmadan hedef Codex/Agents klasörlerini ve yapılacak değişiklikleri gösterir.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install Planı

Makine-okunur no-write plan için:

```bash
node scripts/plan-install.mjs --all --json
```

Tam JSON okumadan önce hızlı keşif için:

```bash
node scripts/plan-install.mjs --list-profiles
node scripts/plan-install.mjs --list-operations
```

Plan `manifests/install-plan.json` tarafından beslenir ve her managed operation
için collision policy, backup davranışı, risk seviyesi ve gerekli flag bilgisini
tutar. Bu fikir ECC'nin manifest tabanlı install mimarisinden esinlenir, ama
Codex-only kalır ve ECC'nin global config, hook, MCP veya skill kataloglarını
import etmez. Bkz. [ECC Uyumluluk](docs/ecc-compatibility.tr.md).

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> Hızlı Kurulum

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Bash veya WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all
```

### Kurulum Parametreleri

| PowerShell | Bash/WSL | Amac |
| --- | --- | --- |
| `-All` | `--all` | Incelenmis Codex Chef yuzeyini kurar: managed Codex dosyalari, plugin workflow'lari ve curated skill'ler. |
| `-Interactive` | `--interactive` | Opsiyonel secimler icin sorar ve uygulamadan once planı gosterir. |
| `-WhatIf` | `--dry-run` | Dosya, Git ayari veya skill yazmadan preview alir. |
| `-Repair` | `--repair` | Mevcut global Codex setup'ini backup alarak hizalar; user skill'lerini ve lokal approval rule'larini korur. |
| `-Force` | `--force` | Mevcut managed Codex Chef hedeflerini backup sonrasinda replace eder. Sadece dry-run'i inceledikten sonra kullan. |
| `-NoBackup` | `--no-backup` | Managed hedef degisikliklerinde backup olusturmayi atlar. Normal kullanim icin risklidir; varsayilan backup davranisini tercih et. |
| `-InstallSkills` | `--install-skills` | Sadece incelenmis global skill katalogunu kurar veya hizalar. |
| `-InstallGitGuards` | `--install-git-guards` | Bu Windows kullanicisi icin global Git ignore ve pre-commit guard'larini opt-in kurar. |
| `-PlainOutput` | `--plain-output` | Eski terminal ve CI log'lari icin ASCII dostu cikti kullanir. |

Faydali dogrulama komutlari:

| Komut | Neyi kanitlar |
| --- | --- |
| `npm run codex:status` | Repo sagligini, kurulu runtime drift'ini, MCP setup notlarini, routing profillerini ve effective controls ozetini gosterir. |
| `npm run codex:status:all` | Ayni status panosuna beklenen curated skill ve opsiyonel Git guard kontrollerini ekler. |
| `npm run verify:install:runtime -- --expect-skills --expect-git-guards` | Kurulu `CODEX_HOME` icinde 21 ajan, 15 MCP girdisi, managed dosyalar ve curated skill'ler oldugunu read-only kanitlar. |
| `npm run verify:skills:online -- --timeout-ms=90000` | 16 incelenmis skill kaynaginin hala cozuldugunu network-backed kanitlar. |
| `codex exec --strict-config "Summarize the active Codex setup in three short bullets."` | Gercek Codex startup, strict config uyumlulugu, auth ve model-call smoke testidir. |

Kurulumdan sonra Codex'i yeniden başlat ve şunları çalıştır:

```bash
codex doctor --summary
npm run codex:status
npm run verify:install:runtime
codex exec --strict-config "Summarize the active Codex setup."
```

Sadece tek bir parça istiyorsan `-InstallSkills` / `--install-skills` veya `-InstallGitGuards` / `--install-git-guards` kullan.
`-All` incelenmiş skill setini dahil eder, ama ayrıca Git guard'a opt-in
vermediğin sürece global Git config'i değiştirmez.

Mevcut kullanıcı config'i varsayılan olarak korunur: `~/.codex/config.toml`
zaten varsa installer önce backup alır, sonra sadece eksik Codex Chef
agent/MCP/safety tablolarını merge eder. Var olan tablolar korunur. `AGENTS.md`,
ajan dosyaları, rule dosyaları ve plugin marketplace gibi diğer managed
hedefler `-Force` / `--force` verilmedikçe atlanır. Bilerek upgrade etmek
istiyorsan önce preview'i incele; managed hedefler replace edilmeden önce backup
alınır.

Mevcut global Codex kullananlarda force'tan önce repair kullan. `-Repair` /
`--repair`, Codex Chef'in yönettiği dosyalardaki drift'i yedekli onarır,
eksik config bloklarını merge eder, plugin marketplace kaydını başka plugin'leri
düşürmeden yeniler ve fazla ya da duplicate global skill'leri silmeden cleanup
adayı olarak raporlar.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Çalışma Modeli

1. Bilmediğin kodu önce `code_mapper` ile haritalat.
2. Davranış prompt, `AGENTS.md`, skill, plugin, MCP, hook, memory, rule veya config tarafına mı ait karar vermek için `context_architect` kullan.
3. Güncel API ve ürün davranışını `docs_researcher` ile doğrulat; tekrar kullanılabilir prompt, brief ve instruction sistemi için `prompt_architect` kullan.
4. Connector veya MCP tool exposure açmadan ya da debug etmeden önce `mcp_integrator` kullan.
5. Ana thread içinde repo talimatları ve doğru skill'lerle uygula.
6. İşin şekline göre `test_verifier`, `frontend_verifier` veya `security_auditor` ile kanıtı güçlendir.
7. Starter sağlığı ve drift kontrolü için `codex_doctor` kullan.
8. Push, tag, release, paket, deploy veya yayın öncesi `release_verifier` kullan.

Böylece Codex tek bir sohbet gibi değil, uzman rolleri olan küçük bir yazılım ekibi gibi çalışır; ana thread karar, uygulama ve final kanıtına odaklanır.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ac.svg" alt="" aria-hidden="true" width="20"> Görsel Akış

<p align="center">
  <img src="assets/workflow-overview.svg" alt="Kurulum, routing, araştırma, uygulama ve doğrulama adımlarını gösteren workflow diyagramı" width="100%" />
</p>

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Güvenli Varsayılanlar

- Sandbox açık kalır.
- Onay politikası interaktif kalır.
- Workspace komutlarında network erişimi kapalı kalır.
- Shell subprocess'leri sadece daraltılmış environment alır ve secret filtreleri açık kalır.
- Auth isteyen remote connector'lar ihtiyaç olana kadar disabled kalır.
- Dış sistemlere dokunabilecek MCP tool'ları riskli aksiyonlarda onay ister.
- Skill kurulumu sadece catalog ve lock dosyasındaki package/skill çiftlerinden yapılır.
- Delete, cleanup, overwrite, credential access, publish, push ve release aksiyonları onay ister.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Güven Sinyalleri

| Sinyal | Kanıt |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Public-safe tasarım | Token, auth dosyası, session, memory, cookie, private key veya makineye özel state içermez. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> Gerçek doğrulama | `npm run check` repo, docs, install-plan, agent drift, MCP drift, skill-source, supply-chain ve security kontrollerini çalıştırır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f510.svg" alt="" aria-hidden="true" width="20"> Secret scan hazır | Gitleaks komutu dokümante edilir; Git hook varsa Gitleaks çalıştırır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> Çok dilli docs | Deutsch, Español, English, Português (Brasil), Türkçe ve Français README ve derin dokümantasyon dosyaları bulunur; altı dilli deep docs validation ile zorunlu tutulur. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ac.svg" alt="" aria-hidden="true" width="20"> Erişilebilir görseller | SVG'lerde title, description, motion, reduced-motion fallback ve README alt text vardır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skill kaynak gate'i | `catalog/skills-lock.json` installable skill metadata'sıyla karşılaştırılır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Yerel skill gate'i | `npm run validate:plugin-skills` bundled skill'leri, reference dosyalarını, UI metadata'sını ve catalog kaydını kontrol eder. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d0.svg" alt="" aria-hidden="true" width="20"> Offline diagram | Bundled `offline-diagram-triplet` Mermaid, editable Excalidraw, SVG, PNG ve Markdown çıktısını network kullanmadan üretir. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ee.svg" alt="" aria-hidden="true" width="20"> Context bütçesi | Bundled `context-budget-planner` büyük işleri kaynak önceliği, token bütçesi ve compaction handoff'u ile odaklı tutar. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Agent drift gate'i | `catalog/agents.json` ve `catalog/agent-research-corpus.json` Windows/Unix config bloklari, role TOML dosyalari, zorunlu guardrail bloklari ve source-backed item sayilariyla karsilastirilir. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="20"> Doctor gate'i | `npm run codex:doctor` global write yapmadan repo-only Codex starter sagligini ozetler. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4df.svg" alt="" aria-hidden="true" width="20"> Status panosu | `npm run codex:status` repo sagligini, kurulu runtime drift'ini, Codex doctor check'lerini ve skill context-budget warning'lerini tek yerde toplar. |
| Repair modu | `npm run repair:install -- --apply` ve installer `-Repair` / `--repair`, managed drift'i backup sonrası düzeltir; başka marketplace plugin'lerini ve user skill'lerini silmez. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install plan gate'i | `manifests/install-plan.json` ve install-state preview schema installer çalışmadan önce doğrulanır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> Konservatif MCP'ler | Auth isteyen hesap, database ve geniş filesystem connector'ları disabled kalır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="20"> Kaynaklı rehberlik | Research notes kaynak tipi, confidence, neyi desteklediği ve outdated-risk içerir. |
| Ajan-okunur indeks | `llms.txt`, kodlama ajanlari icin kurulum hedeflerini, docs haritasini, guvenlik sinirlarini ve yuksek sinyalli karsilastirma kaynaklarini kisa anlatir. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e3.svg" alt="" aria-hidden="true" width="20"> Public-safe triage | CODEOWNERS ve issue template'leri bug, feature, soru ve güvenlik raporlarını private data paylaşmadan yönlendirir. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/267b.svg" alt="" aria-hidden="true" width="20"> CI eşleşmesi | GitHub Actions aynı `npm run check` yolunu ve shell parser kontrollerini çalıştırır. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> Repo Yapısı

```text
.github/                 CI workflow, issue ve PR template'leri
assets/                  Public-safe README görselleri
catalog/                 Skill ve MCP kaynak metadata'ları
README*.md               Çok dilli public giriş dosyaları
docs/                    Altı dilli kurulum ve doğrulama rehberleri
manifests/               No-write install plan metadata'sı
plugins/                 Bundled yerel Codex plugin'i
schemas/                 Hafif validation schema'ları
scripts/                 Kurulum, doctor ve doğrulama scriptleri
templates/codex/         ~/.codex içine kopyalanan dosyalar
templates/git/           Opsiyonel global Git hijyen dosyaları
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Lokal Doğrulama

```bash
npm run check
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Opsiyonel online skill-source kontrolü:

```bash
npm run verify:skills:online
```

Online skill doğrulaması network ve Skills CLI kullanır. Bu yüzden default offline gate'ten ayrı tutulur.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Dokümantasyon

Her derin rehberin İngilizce, Almanca, İspanyolca, Brezilya Portekizcesi, Türkçe ve Fransızca dosyası vardır. Örneğin `docs/install.md`, `docs/install.de.md`, `docs/install.es.md`, `docs/install.pt-BR.md`, `docs/install.tr.md` ve `docs/install.fr.md` ile eşleşir.

- [Kurulum](docs/install.tr.md)
- [Troubleshooting](docs/troubleshooting.tr.md)
- [Beklenen çıktı](docs/expected-output.tr.md)
- [Upgrade rehberi](docs/upgrade.tr.md)
- [Codex kapasite haritası](docs/codex-capability-map.tr.md)
- [Workflow yuzey haritasi](docs/workflow-surface-map.tr.md)
- [Codex yüzeyleri](docs/codex-surfaces.tr.md)
- [Skills ve ajanlar](docs/skills-and-agents.tr.md)
- [MCP kataloğu](docs/mcp-catalog.tr.md)
- [Güvenlik modeli](docs/security-model.tr.md)
- [Doğrulama](docs/verification.tr.md)
- [Public hazırlık](docs/public-readiness.tr.md)
- [SEO ve keşfedilebilirlik](docs/seo.tr.md)
- [Araştırma notları](docs/research-notes.tr.md)
- [Advisory kaynakları](docs/advisory-sources.tr.md)
- [Publish](docs/publish.tr.md)
- [Ajan-okunur indeks](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Resmi Codex Kaynakları

Ana kaynak: https://developers.openai.com/codex/codex-manual.md

Odaklı dokümanlar:

- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins
- MCP ve connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- Windows: https://developers.openai.com/codex/windows
- Config, permissions, rules, hooks ve AGENTS.md eşlemesi için [docs/research-notes.tr.md](docs/research-notes.tr.md).

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Yayınlama Sınırı

Bu repo validation sonrası public-ready olacak şekilde hazırlanır, fakat installer sadece lokal setup yapar. Commit, push, tag, release, package publish, deploy ve GitHub settings değişiklikleri local verification sonrası açık insan kararı olmalıdır.
