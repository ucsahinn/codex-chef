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
  🌐 <strong>Doküman dilleri:</strong>
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.md">English</a> |
  <a href="README.pt-BR.md">Português (Brasil)</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.fr.md">Français</a>
</p>

Codex Chef, Windows tarafında güçlü ama güvenli bir Codex başlangıcı isteyenler için hazırlanmış bir setup kitidir. Sana tek tek uğraşmadan kurulabilen bir temel verir: kalıcı talimatlar, kontrollü config, isimlendirilmiş uzman ajanlar, MCP varsayılanları, seçilmiş skill'ler, yerel plugin akışları ve kurulmadan önce doğrulanabilen güvenlik kapıları.

Bu resmi OpenAI ürünü değildir; community starter paketidir. Güncel resmi Codex dokümanlarıyla eşleştirilmiştir ve riskli aksiyonlar varsayılan olarak onaya bağlı kalır.

## 🚀 Tek Seferde İndir Ve Kur

Windows PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Interactive
```

Önce güvenli ön izleme:

```powershell
.\scripts\install.ps1 -All -WhatIf
node scripts/plan-install.mjs --all --json --redact-paths
```

Mevcut global Codex kurulumunu user skill'lerini silmeden onar:

```powershell
.\scripts\install.ps1 -Repair -WhatIf
.\scripts\install.ps1 -Repair
```

Soru sormayan otomasyon dostu tek komut:

```powershell
.\scripts\install.ps1 -All
```

## 🍳 Kurulumdan Sonra Ne Gelir?

Codex Chef başka bir makinenin global ayarlarını kopyalamaz. Kurulum kaynağı bu
repo içindeki `templates/codex/config.*.toml`, `templates/codex/agents/*.toml`,
`plugins/codex-chef-workflows` ve manifest-backed install planıdır.

| Yüzey | Makineye ne kurulur? |
| --- | --- |
| 🤖 Ajan ekibi | `~/.codex/agents/*.toml` altında 21 kayıtlı Codex subagent rol dosyası. |
| 🧠 Kalıcı rehberlik | Güvenli routing, doğrulama ve onay kuralları içeren global `~/.codex/AGENTS.md`. |
| 🔌 MCP varsayılanları | 7 faydalı MCP açık, 8 auth/high-risk connector kapalı bekler. |
| 🧩 Plugin + skill'ler | Yerel `codex-chef-workflows` plugin'i, üç bundled skill ve on altı opsiyonel global skill. |
| 🛡️ Güvenlik kapıları | Backup, dry-run plan, secret scan, validation ve onaylı riskli aksiyon modeli. |

Installer en sonda bir capability board basar: ajan ekibi, varsayilan hazir
MCP'ler, disabled/opt-in MCP'ler, local plugin skill'leri ve reviewed global
skill'ler tek ekranda gorunur. Tooling, OAuth, filesystem path ve
`SUPABASE_DB_URL` isteyen MCP'ler icin setup notlarini da basar; yani kurulum
bittiginde "bana ne geldi ve ne eksik input ister?" sorusunun cevabini direkt
gorursun.

### 🔌 MCP Panosu

Codex Chef MCP'leri gizli hesap senkronizasyonu gibi kullanmaz; hepsi açık
yüzeylerdir. Lokal/araştırma odaklı olanlar hazır gelir. Hesap, database,
production ve geniş filesystem tarafı ise sen gerçekten istemeden kapalı kalır.

| Durum | MCP'ler | Neden |
| --- | --- | --- |
| ✅ Varsayılan hazır | 📚 OpenAI Docs · 🧭 Context7 · 🧠 Sequential Thinking · 🎭 Playwright · 🧰 Chrome DevTools · 🗺️ Serena · 🧩 Memory | Güvenli araştırma, kod gezme, browser kanıtı ve secret içermeyen lokal context. |
| 🔒 Varsayılan kapalı | 📁 Filesystem · 🐙 GitHub · 🎨 Figma · 📌 Linear · 🗒️ Notion · 🚨 Sentry · ▲ Vercel · 🗄️ Supabase | Private dosya, hesap, telemetry, deploy veya database açabileceği için sadece ihtiyaç olunca açılır. |

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
```

Bu guvenli otonomidir; gizli calisan bir auto-executor degildir. Task shape
uydugunda dogru ajan, skill, MCP ve flag zorunlu hale gelir; ama destructive,
credential, publish, deploy, database ve genis filesystem aksiyonlari yine
onay kapisinda kalir.

## 🤖 Kurulan Ajan Ekibi

Codex Chef'in kurduğu ajanlar ayrı arka plan servisleri değildir. Bunlar Codex'in
task routing sırasında kullanacağı isim, açıklama ve TOML rol dosyalarıdır.

- 🗺️ **Kod Haritacısı** (`code_mapper`) - repo haritası
- 📚 **Doküman Araştırmacısı** (`docs_researcher`) - resmi docs
- 🧭 **Context Mimarı** (`context_architect`) - routing yüzeyi
- ✍️ **Prompt Mimarı** (`prompt_architect`) - prompt sistemi
- 🔌 **MCP Entegratörü** (`mcp_integrator`) - connector'lar
- 🎯 **Ürün Stratejisti** (`product_strategist`) - scope
- 🏗️ **Mühendislik Planlayıcısı** (`engineering_planner`) - mimari
- 🎨 **Tasarım İnceleyicisi** (`design_reviewer`) - UX polish
- 🧰 **DevEx Denetçisi** (`devex_auditor`) - onboarding
- 🕵️ **Kök Neden Dedektifi** (`root_cause_debugger`) - araştırma
- ✅ **QA Lideri** (`qa_lead`) - kullanıcı akışları
- ⚡ **Performans Denetçisi** (`performance_auditor`) - hız
- 🔎 **Google SEO Denetçisi** (`google_seo_auditor`) - arama görünürlüğü
- 📝 **Doküman Yazarı** (`docs_author`) - docs coverage
- 📐 **Spec Yazarı** (`spec_author`) - uygulanabilir spec
- 🔍 **Kod İnceleyicisi** (`code_reviewer`) - fresh review
- 🖥️ **Frontend Doğrulayıcısı** (`frontend_verifier`) - render UI
- 🛡️ **Güvenlik Denetçisi** (`security_auditor`) - threat path
- 🧪 **Test Doğrulayıcısı** (`test_verifier`) - test kanıtı
- 🚢 **Release Doğrulayıcısı** (`release_verifier`) - publish gate
- 🩺 **Codex Doktoru** (`codex_doctor`) - setup sağlığı

## 🧩 Skill'ler

Codex Chef üç yerel plugin skill'iyle gelir. Bunlar `codex-chef-workflows`
plugin'iyle birlikte gelir ve `npm run validate:plugin-skills` ile kontrol
edilir; yani repo içinde sessizce kaybolamaz veya katalogdan kopamaz. `-All`
veya `-InstallSkills` verirsen bakım, debug, refactor planlama, güvenlik, test,
browser doğrulama, SEO, web quality, docs, MCP geliştirme, context engineering,
prompt mimarisi, skill üretimi ve tek bir geniş frontend workflow'u için
seçilmiş on altı public/first-party skill'i de global Codex skill'i olarak
kurabilir.

- 🍳 **Chef Operatörü** (`codex-chef-operator`) - plugin-local
- 📐 **Offline Diagram Triplet** (`offline-diagram-triplet`) - plugin-local
- 🧮 **Context Budget Planner** (`context-budget-planner`) - plugin-local
- ⬆️ **Dependency Upgrade** (`dependency-upgrade`) - opsiyonel global
- 🖼️ **Frontend Builder** (`frontend-skill`) - opsiyonel global
- 🛡️ **Security Best Practices** (`security-best-practices`) - opsiyonel global
- 🧯 **GitHub CI Fixer** (`gh-fix-ci`) - opsiyonel global
- 🕵️ **Systematic Debugging** (`systematic-debugging`) - opsiyonel global
- 🧱 **Refactor Planner** (`request-refactor-plan`) - opsiyonel global
- 🧭 **Webapp Testing** (`webapp-testing`) - opsiyonel global
- 🧪 **Test-Driven Development** (`test-driven-development`) - opsiyonel global
- 🔎 **SEO** (`seo`) - opsiyonel global
- ♿ **Accessibility** (`accessibility`) - opsiyonel global
- 📊 **Web Quality Audit** (`web-quality-audit`) - opsiyonel global
- 📝 **Documentation And ADRs** (`documentation-and-adrs`) - opsiyonel global
- 🔌 **MCP Builder** (`mcp-builder`) - opsiyonel global
- 🧱 **Context Starter** (`ai-project-starter`) - opsiyonel global, first-party
- ✍️ **Prompt Architect Skill** (`prompt-architect`) - opsiyonel global, first-party
- 🛠️ **Skill Forge** (`ai-skill-create`) - opsiyonel global, first-party

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

- 🧱 `ai-project-starter` - proje context temeli, starter docs,
  ajan instruction dosyaları ve vibe-coding guardrail'leri.
- ✍️ `prompt-architect` - plan-first, onay kapılı Codex prompt
  paketleri ve prompt audit'leri.
- 🛠️ `ai-skill-create` - Codex skill/plugin oluşturma, doğrulama,
  forward-test ve paketleme.

Manuel kurulum örneği:

```bash
npx skills add pbakaus/impeccable --skill impeccable --agent codex --yes --global
```

## 🔌 MCP Varsayılanları

Codex Chef MCP config kayıtları kurar; gizli hesap bağlantısı açmaz. Lokal ve
araştırma odaklı kaynaklar açık gelir. Auth, database, production ve geniş
filesystem connector'ları ise gerçekten ihtiyaç olana kadar kapalı kalır.

Varsayılan açık:

- 📚 **OpenAI Developer Docs** (`openaiDeveloperDocs`) - resmi OpenAI/Codex dokümanları.
- 🧭 **Context7** (`context7`) - güncel kütüphane ve framework dokümanları.
- 🧠 **Sequential Thinking** (`sequential-thinking`) - karmaşık işleri parçalara ayırma.
- 🎭 **Playwright** (`playwright`) - browser snapshot, console/network kanıtı ve UI kontrolü.
- 🧰 **Chrome DevTools** (`chrome-devtools`) - izole Chrome inceleme ve redacted network headers.
- 🗺️ **Serena** (`serena`) - semantic code navigation ve repo symbol araması.
- 🧩 **Memory** (`memory`) - secret içermeyen lokal proje context hafızası.

İhtiyaç olana kadar kapalı:

- 📁 **Filesystem** (`filesystem`) - geniş lokal dosya erişimi; açmadan önce bilinçli path seç.
- 🐙 **GitHub** (`github`) - auth isteyen private repo/PR context'i.
- 🎨 **Figma** (`figma`) - private tasarım dosyaları ve workspace context'i.
- 📌 **Linear** (`linear`) - issue, proje ve takım planlama context'i.
- 🗒️ **Notion** (`notion`) - private docs ve database'ler.
- 🚨 **Sentry** (`sentry`) - production hata ve telemetry context'i.
- ▲ **Vercel** (`vercel`) - proje ve deployment platform context'i.
- 🗄️ **Supabase** (`supabase`) - `SUPABASE_DB_URL` üzerinden database erişimi.

Kullanıcıda zaten `~/.codex/config.toml` varsa installer artık onu korur ve
sadece eksik Codex Chef agent/MCP/safety tablolarını ekler. Mevcut MCP
kayıtları, token'lar, profile'lar ve kullanıcı ayarları `-Force` / `--force`
ile preview ve backup sonrası bilinçli replace seçilmedikçe değiştirilmez.

## &#127760; Dil Girişleri

| Dil | README |
| --- | --- |
| 🇩🇪 | [README.de.md](README.de.md) |
| 🇪🇸 | [README.es.md](README.es.md) |
| 🇬🇧 | [README.md](README.md) |
| 🇧🇷 | [README.pt-BR.md](README.pt-BR.md) |
| 🇹🇷 | [README.tr.md](README.tr.md) |
| 🇫🇷 | [README.fr.md](README.fr.md) |

## ⚡ Buradan Başla

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

## 🧭 Bu Repo Ne?

Codex Chef, dağınık yerel setup bilgisini public, okunabilir ve doğrulanabilir bir starter repoya çevirir. Şu sorulara net cevap verir:

- Ne `AGENTS.md` içinde olmalı, ne config/skill/plugin/MCP/rule/hook tarafına gitmeli?
- Hangi connector'lar varsayılan olarak güvenli?
- Setup hangi global dosyalara dokunur?
- Bu repoya güvenmeden önce nasıl doğrularım?
- Güvenliği zayıflatmadan nasıl genişletirim?

## 🧩 Kurulum Yüzeyi

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

## 🚫 Ne Yapmaz?

Installer şunları yapmaz:

- Token, cookie, auth dosyası, private key, memory, session veya yerel proje state'i saklamaz.
- Auth isteyen hesap, database, production veya geniş filesystem MCP connector'larını varsayılan olarak açmaz.
- Commit, push, release, deploy, package publish, secret rotation veya GitHub settings değişikliği yapmaz.
- Kullanıcı açıkça `-NoBackup` veya `--no-backup` seçmedikçe yönetilen hedefleri backup almadan değiştirmez.

## 🔎 Önce Dry Run

PowerShell:

```powershell
.\scripts\install.ps1 -All -WhatIf
```

Bash veya WSL:

```bash
./scripts/install.sh --all --dry-run
```

Dry run gerçek dosyalara, Git ayarlarına veya global skill'lere dokunmadan hedef Codex/Agents klasörlerini ve yapılacak değişiklikleri gösterir.

## 🧾 Install Planı

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

## ⚡ Hızlı Kurulum

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

Kurulumdan sonra Codex'i yeniden başlat ve şunları çalıştır:

```bash
codex doctor --summary
npm run codex:status
npm run verify:install:runtime
codex --strict-config "Summarize the active Codex setup."
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

## 🧠 Çalışma Modeli

1. Bilmediğin kodu önce `code_mapper` ile haritalat.
2. Davranış prompt, `AGENTS.md`, skill, plugin, MCP, hook, memory, rule veya config tarafına mı ait karar vermek için `context_architect` kullan.
3. Güncel API ve ürün davranışını `docs_researcher` ile doğrulat; tekrar kullanılabilir prompt, brief ve instruction sistemi için `prompt_architect` kullan.
4. Connector veya MCP tool exposure açmadan ya da debug etmeden önce `mcp_integrator` kullan.
5. Ana thread içinde repo talimatları ve doğru skill'lerle uygula.
6. İşin şekline göre `test_verifier`, `frontend_verifier` veya `security_auditor` ile kanıtı güçlendir.
7. Starter sağlığı ve drift kontrolü için `codex_doctor` kullan.
8. Push, tag, release, paket, deploy veya yayın öncesi `release_verifier` kullan.

Böylece Codex tek bir sohbet gibi değil, uzman rolleri olan küçük bir yazılım ekibi gibi çalışır; ana thread karar, uygulama ve final kanıtına odaklanır.

## 🎬 Görsel Akış

<p align="center">
  <img src="assets/workflow-overview.svg" alt="Kurulum, routing, araştırma, uygulama ve doğrulama adımlarını gösteren workflow diyagramı" width="100%" />
</p>

## 🛡️ Güvenli Varsayılanlar

- Sandbox açık kalır.
- Onay politikası interaktif kalır.
- Workspace komutlarında network erişimi kapalı kalır.
- Shell subprocess'leri sadece daraltılmış environment alır ve secret filtreleri açık kalır.
- Auth isteyen remote connector'lar ihtiyaç olana kadar disabled kalır.
- Dış sistemlere dokunabilecek MCP tool'ları riskli aksiyonlarda onay ister.
- Skill kurulumu sadece catalog ve lock dosyasındaki package/skill çiftlerinden yapılır.
- Delete, cleanup, overwrite, credential access, publish, push ve release aksiyonları onay ister.

## ✅ Güven Sinyalleri

| Sinyal | Kanıt |
| --- | --- |
| 🛡️ Public-safe tasarım | Token, auth dosyası, session, memory, cookie, private key veya makineye özel state içermez. |
| 🧪 Gerçek doğrulama | `npm run check` repo, docs, install-plan, agent drift, MCP drift, skill-source, supply-chain ve security kontrollerini çalıştırır. |
| 🔐 Secret scan hazır | Gitleaks komutu dokümante edilir; Git hook varsa Gitleaks çalıştırır. |
| 🌐 Çok dilli docs | Deutsch, Español, English, Português (Brasil), Türkçe ve Français README ve derin dokümantasyon dosyaları bulunur; altı dilli deep docs validation ile zorunlu tutulur. |
| 🎬 Erişilebilir görseller | SVG'lerde title, description, motion, reduced-motion fallback ve README alt text vardır. |
| 🧩 Skill kaynak gate'i | `catalog/skills-lock.json` installable skill metadata'sıyla karşılaştırılır. |
| 🧩 Yerel skill gate'i | `npm run validate:plugin-skills` bundled skill'leri, reference dosyalarını, UI metadata'sını ve catalog kaydını kontrol eder. |
| 📐 Offline diagram | Bundled `offline-diagram-triplet` Mermaid, editable Excalidraw, SVG, PNG ve Markdown çıktısını network kullanmadan üretir. |
| 🧮 Context bütçesi | Bundled `context-budget-planner` büyük işleri kaynak önceliği, token bütçesi ve compaction handoff'u ile odaklı tutar. |
| 🤖 Agent drift gate'i | `catalog/agents.json` ve `catalog/agent-research-corpus.json` Windows/Unix config bloklari, role TOML dosyalari, zorunlu guardrail bloklari ve source-backed item sayilariyla karsilastirilir. |
| 🩺 Doctor gate'i | `npm run codex:doctor` global write yapmadan repo-only Codex starter sagligini ozetler. |
| 📟 Status panosu | `npm run codex:status` repo sagligini, kurulu runtime drift'ini, Codex doctor check'lerini ve skill context-budget warning'lerini tek yerde toplar. |
| Repair modu | `npm run repair:install -- --apply` ve installer `-Repair` / `--repair`, managed drift'i backup sonrası düzeltir; başka marketplace plugin'lerini ve user skill'lerini silmez. |
| 🧾 Install plan gate'i | `manifests/install-plan.json` ve install-state preview schema installer çalışmadan önce doğrulanır. |
| 🔌 Konservatif MCP'ler | Auth isteyen hesap, database ve geniş filesystem connector'ları disabled kalır. |
| 🧭 Kaynaklı rehberlik | Research notes kaynak tipi, confidence, neyi desteklediği ve outdated-risk içerir. |
| Ajan-okunur indeks | `llms.txt`, kodlama ajanlari icin kurulum hedeflerini, docs haritasini, guvenlik sinirlarini ve yuksek sinyalli karsilastirma kaynaklarini kisa anlatir. |
| 📣 Public-safe triage | CODEOWNERS ve issue template'leri bug, feature, soru ve güvenlik raporlarını private data paylaşmadan yönlendirir. |
| ♻️ CI eşleşmesi | GitHub Actions aynı `npm run check` yolunu ve shell parser kontrollerini çalıştırır. |

## 📁 Repo Yapısı

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

## 🧾 Lokal Doğrulama

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

## 📚 Dokümantasyon

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

## 📚 Resmi Codex Kaynakları

Ana kaynak: https://developers.openai.com/codex/codex-manual.md

Odaklı dokümanlar:

- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins
- MCP ve connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- Windows: https://developers.openai.com/codex/windows
- Config, permissions, rules, hooks ve AGENTS.md eşlemesi için [docs/research-notes.tr.md](docs/research-notes.tr.md).

## 🚀 Yayınlama Sınırı

Bu repo validation sonrası public-ready olacak şekilde hazırlanır, fakat installer sadece lokal setup yapar. Commit, push, tag, release, package publish, deploy ve GitHub settings değişiklikleri local verification sonrası açık insan kararı olmalıdır.
