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
  <a href="README.de.md">🇩🇪 Deutsch</a> |
  <a href="README.es.md">🇪🇸 Español</a> |
  <a href="README.md">🇬🇧 English</a> |
  <a href="README.pt-BR.md">🇧🇷 Português (Brasil)</a> |
  <a href="README.tr.md">🇹🇷 Türkçe</a> |
  <a href="README.fr.md">🇫🇷 French / Français</a>
</p>

Codex Chef, Windows agirlikli calisan guclu kullanicilar ve kucuk ekipler icin guvenlik oncelikli Codex setup kitidir. Tekrar edilebilir bir yerel Codex temeli kurar: kalici talimatlar, konservatif config, uzman ajanlar, onay kurallari, MCP varsayilanlari, secilmis skill metadata'lari, plugin paketi, dogrulama scriptleri ve alti dilli dokumantasyon.

Bu resmi OpenAI ürünü değildir; community starter paketidir. Güncel resmi Codex dokümanlarıyla eşleştirilmiştir ve riskli aksiyonlar varsayılan olarak onaya bağlı kalır.

## 🚀 Tek Seferde İndir Ve Kur

Windows PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Önce güvenli ön izleme:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
node scripts/plan-install.mjs --all --json --redact-paths
```

## 🍳 Kurulumdan Sonra Ne Gelir?

Codex Chef sadece doküman koymaz; gerçek bir Codex çalışma mutfağı kurar.
Aşağıdaki ajan listesi `templates/codex/config.windows.toml`,
`templates/codex/config.unix.toml` ve `templates/codex/agents/*.toml`
dosyalarından gelir. Yani installer bu kayıtları `~/.codex` içine kopyalar.

| Yüzey | Makineye ne kurulur? |
| --- | --- |
| 🤖 Uzman ajanlar | `~/.codex/agents/*.toml` altında 20 kayıtlı Codex subagent. |
| 🧠 Kalıcı rehberlik | Güvenli routing, doğrulama ve onay kuralları içeren global `~/.codex/AGENTS.md`. |
| 🔌 MCP varsayılanları | 7 faydalı MCP açık, 8 auth/high-risk connector kapalı bekler. |
| 🧩 Yerel plugin | Kişisel plugin marketplace'e kayıtlı `codex-chef-workflows`. |
| 🛠️ Yerel skill'ler | Dış auth istemeyen `codex-chef-operator` ve `offline-diagram-triplet`. |
| 🎨 Opsiyonel skill'ler | `-All` veya `-InstallSkills` ile kurulabilen 9 seçilmiş public skill. |
| 🛡️ Güvenlik kapıları | Backup, dry-run plan, secret scan, validation ve onaylı riskli aksiyon modeli. |

## 🤖 Kurulan Ajan Ekibi

Codex Chef'in Codex config içine kaydettiği ve role dosyası olarak kurduğu
ajanlar:

| Ajan | Ne işe yarar? |
| --- | --- |
| `code_mapper` | Bilinmeyen repoyu, dosyaları, ownership sınırlarını ve data flow'u haritalar. |
| `docs_researcher` | Güncel resmi dokümanları, standartları, API'leri ve sürüm hassas bilgileri kontrol eder. |
| `context_architect` | Davranışın prompt, `AGENTS.md`, skill, plugin, MCP, hook, rule, memory veya config tarafına mı ait olduğunu belirler. |
| `prompt_architect` | Güvenilir prompt, görev brief'i, başarı kriteri ve reusable instruction sistemi tasarlar. |
| `mcp_integrator` | Least-privilege MCP connector setup'ı, auth sınırları ve troubleshooting planlar. |
| `product_strategist` | Ürün framing'i, scope, alternatifler ve en küçük faydalı sürüm kararlarını sorgular. |
| `engineering_planner` | Mimari, data flow, diagram, edge case ve test stratejisini netleştirir. |
| `design_reviewer` | UX kalitesi, accessibility, görsel polish, design-system uyumu ve AI-slop risklerini inceler. |
| `devex_auditor` | Onboarding friction, docs netliği, first-run flow ve time-to-hello-world deneyimini test eder. |
| `root_cause_debugger` | Fix öncesi hatayı reproduce eder, data flow izler, hipotez test eder ve root cause bulur. |
| `qa_lead` | Kullanıcı akışlarını dener, regresyon arar, coverage planlar ve fix'i tekrar doğrular. |
| `performance_auditor` | Page speed, Core Web Vitals, trace, resource budget ve regression ölçer. |
| `docs_author` | Docs coverage, stale claim, release notes ve eksik rehberleri denetler. |
| `spec_author` | Belirsiz isteği non-goal, edge case ve quality gate içeren uygulanabilir spec'e çevirir. |
| `code_reviewer` | Fresh-context doğruluk, regresyon, güvenlik, maintainability ve eksik test review'u yapar. |
| `frontend_verifier` | Render edilmiş UI, screenshot, responsive layout, interaction state ve console error kontrol eder. |
| `security_auditor` | Auth, secret, permission, API route, data access, dependency ve abuse path inceler. |
| `test_verifier` | Lint, typecheck, test, build, smoke check ve failure evidence toplar. |
| `release_verifier` | Git hijyeni, changelog/version, artifact, secret scan ve publish gate kontrol eder. |
| `codex_doctor` | Starter sağlığı, catalog drift, install-plan coverage, docs, MCP default'ları ve güvenli sonraki kontrolleri teşhis eder. |

## 🧩 Skill'ler

Codex Chef iki yerel plugin skill'iyle gelir; ayrıca incelenmiş katalogdan dokuz
opsiyonel global skill kurabilir.

| Skill | Varsayılan kurulum | Ne işe yarar? |
| --- | --- | --- |
| `codex-chef-operator` | Plugin-local | Bu starter'ı güvenlik ve install safety kapılarını zayıflatmadan bakımda tutar. |
| `offline-diagram-triplet` | Plugin-local | Mermaid'i zero-network şekilde editable Excalidraw, SVG, PNG ve Markdown'a çevirir. |
| `dependency-upgrade` | Opsiyonel global | Dependency upgrade işlerini daha güvenli yapar. |
| `frontend-skill` | Opsiyonel global | Görsel olarak güçlü frontend deneyimleri üretir. |
| `impeccable` | Opsiyonel global | Frontend arayüzlerini audit, polish ve harden eder. |
| `design-taste-frontend` | Opsiyonel global | Senior UI/UX taste uygular, generic AI çıktısını azaltır. |
| `image-to-code` | Opsiyonel global | Görsel referansları frontend koda çevirir. |
| `high-end-visual-design` | Opsiyonel global | Görsel yön, hierarchy, spacing ve polish kalitesini yükseltir. |
| `web-design-guidelines` | Opsiyonel global | Accessibility, UX kalitesi ve interface standartlarını review eder. |
| `vercel-react-best-practices` | Opsiyonel global | React ve Next.js implementation pattern'lerini optimize eder. |
| `vercel-optimize` | Opsiyonel global | Vercel cost, performance ve platform kullanımını inceler. |

## 🔌 MCP Varsayılanları

Varsayılan açık gelenler: OpenAI Developer Docs, Context7, sequential thinking,
Playwright, Chrome DevTools, Serena ve memory. Açıkça ihtiyaç olana kadar kapalı
bekleyenler: filesystem, GitHub, Figma, Linear, Notion, Sentry, Vercel ve
Supabase.

## &#127760; Dil Girişleri

| Dil | README |
| --- | --- |
| &#127465;&#127466; Deutsch | [README.de.md](README.de.md) |
| &#127466;&#127480; Español | [README.es.md](README.es.md) |
| &#127468;&#127463; English | [README.md](README.md) |
| &#127463;&#127479; Português (Brasil) | [README.pt-BR.md](README.pt-BR.md) |
| &#127481;&#127479; Türkçe | [README.tr.md](README.tr.md) |
| &#127467;&#127479; French / Français | [README.fr.md](README.fr.md) |

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
.\scripts\install.ps1 -All -Force -WhatIf
```

Bash veya WSL:

```bash
./scripts/install.sh --all --force --dry-run
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
.\scripts\install.ps1 -All -Force
```

Bash veya WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Kurulumdan sonra Codex'i yeniden başlat ve şunları çalıştır:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Sadece tek bir parça istiyorsan `-InstallSkills` / `--install-skills` veya `-InstallGitGuards` / `--install-git-guards` kullan.

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
| 📐 Offline diagram | Bundled `offline-diagram-triplet` Mermaid, editable Excalidraw, SVG, PNG ve Markdown çıktısını network kullanmadan üretir. |
| 🤖 Agent drift gate'i | `catalog/agents.json` Windows/Unix config bloklari ve role TOML dosyalariyla karsilastirilir. |
| 🩺 Doctor gate'i | `npm run codex:doctor` global write yapmadan repo-only Codex starter sagligini ozetler. |
| 🧾 Install plan gate'i | `manifests/install-plan.json` ve install-state preview schema installer çalışmadan önce doğrulanır. |
| 🔌 Konservatif MCP'ler | Auth isteyen hesap, database ve geniş filesystem connector'ları disabled kalır. |
| 🧭 Kaynaklı rehberlik | Research notes kaynak tipi, confidence, neyi desteklediği ve outdated-risk içerir. |
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
