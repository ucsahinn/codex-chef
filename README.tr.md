# Codex Chef

<p align="center">
  <img src="assets/icon.svg" alt="Codex Chef ikonu" width="120" />
  <br />
  <img src="assets/banner.svg" alt="Uzman ajanlar, MCP kaynakları, skill'ler, doğrulama ve çok dilli dokümanları gösteren Codex Chef banner görseli" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-chef/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/ucsahinn/codex-chef?color=0f766e" /></a>
  <a href="README.md"><img alt="Dokümantasyon dilleri" src="https://img.shields.io/badge/docs-6%20languages-0f766e" /></a>
  <img alt="Windows ve WSL hazır" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> <strong>Dokümantasyon:</strong>
  <a href="README.de.md"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch" width="20"></a> |
  <a href="README.es.md"><img src="https://flagcdn.com/w20/es.png" alt="Español" width="20"></a> |
  <a href="README.md"><img src="https://flagcdn.com/w20/gb.png" alt="English" width="20"></a> |
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/w20/br.png" alt="Português (Brasil)" width="20"></a> |
  <a href="README.tr.md"><img src="https://flagcdn.com/w20/tr.png" alt="Türkçe" width="20"></a> |
  <a href="README.fr.md"><img src="https://flagcdn.com/w20/fr.png" alt="Français" width="20"></a>
</p>

Codex Chef, Windows tarafında güçlü ama kontrollü bir Codex zemini isteyenler için hazırlanmış kurulum kitidir. Ajan rolleri, MCP varsayılanları, seçilmiş skill'ler, yerel plugin akışları, kalıcı talimatlar ve doğrulama kapıları tek yerde durur; riskli hesap, database, deploy veya geniş filesystem erişimleri kendiliğinden açılmaz.

Bu repo resmi olmayan bir community starter'dır; OpenAI ürünü değildir. Güncel resmi Codex dokümantasyonuyla eşlenir ve destructive, credential, publish, deploy, database ve geniş filesystem aksiyonlarını onay kapısında tutar.

Çok dilli README girişleri ve altı dilde derin dokümantasyon release yüzeyinin parçasıdır. Türkçe ve İngilizce en detaylı operatör akışını taşır; Deutsch, Español, Português (Brasil) ve Français kısa girişler ve aynı derin rehberlere bağlantılar sunar.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Hızlı Kurulum

Paste etmeden once lokal gereksinimleri dogrula; boylece setup hatasi repo mu
makine mi daha net gorunur:

```powershell
Get-Command git
Get-Command node
Get-Command npx
Get-Command codex
node -v
```

Node.js 18 veya daha yeni surum gerekir. Bu komutlardan biri eksikse repoyu
bozuk saymadan once [Sorun giderme](docs/troubleshooting.tr.md) rehberine bak.

Önce preview al:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
node scripts/plan-install.mjs --all --json --redact-paths
```

Preview temiz görünüyorsa kur:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -Interactive
```

Bash veya WSL:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --interactive
```

Mevcut Codex Chef kurulumunu user skill'lerini silmeden onar:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair -WhatIf
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Repair
```

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="20"> CLI Kısa Yol Haritası

Menü için `npm run chef` kullan. Ezberlenecek komutlar şunlar:

| İhtiyaç | Komut |
| --- | --- |
| Hızlı lokal sağlık kontrolü | `npm run chef -- --status --repo-only --no-log` |
| Tam status panosu | `npm run codex:status` |
| Kurulum preview | `npm run chef -- --preview` |
| Routing profil haritası | `npm run chef -- --routing --profile starter-health` |
| Tanılama ekranı | `npm run chef -- --diagnostics --no-log` |
| Sadece süreç denetimi | `npm run chef -- --processes --no-log` |
| Repair preview/apply | `npm run chef -- --repair` sonra `npm run chef -- --repair --apply` |

Kısa kurallar:

- `--status`, `--preview`, `--skills`, `--mcp`, `--routing`, `--diagnostics`, `--processes`, `--auth` ve `--logs` önce inceleme yüzeyidir.
- Yazma yapan yollar `--apply` veya yazılı onay ister. Menü risk sınırını aksiyondan önce gösterir.
- Hiç log yazılmasın istiyorsan `--no-log` ekle. Normal CLI logları repo içinde, ignored ve redacted tutulur.
- `npx run` kullanma; doğru şekil `npm run chef` veya `npm --prefix <repo> run chef`.

Detaylı CLI davranışı [Kurulum](docs/install.tr.md), [Beklenen çıktı](docs/expected-output.tr.md) ve [Sorun giderme](docs/troubleshooting.tr.md) rehberlerinde.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> Kurulumdan Sonra Ne Gelir?

Codex Chef başka bir makinenin ayarlarını gizlice kopyalamaz; kaynağı bu repodaki template, catalog, manifest ve plugin dosyalarıdır.

| Yüzey | Makineye ne kurulur? |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Ajan ekibi | `~/.codex/agents/*.toml` altında 21 Codex subagent rol dosyası ve okunabilir `nickname_candidates`. Bunlar servis değil, role tanımıdır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e0.svg" alt="" aria-hidden="true" width="20"> Kalıcı talimatlar | Routing, doğrulama, güvenlik ve onay kuralları içeren global `~/.codex/AGENTS.md`. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP varsayılanları | Dokümantasyon, code navigation, browser evidence, reasoning, secret içermeyen memory ve lokal codebase graph okumalari için 8 MCP açık; mutating tool'lar prompt-gated veya disabled, hesap/database/high-risk 8 connector kapalı. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Plugin + skill'ler | Yerel `codex-chef-workflows` plugin'i, üç bundled skill ve on altı reviewed opsiyonel global skill. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="20"> Güvenlik kapıları | Dry run, backup, validation, secret scan ve riskli aksiyonlar için approval gate. |

Skill'ler kendiliğinden çalışmaz. Kullanıcı skill adını yazdığında veya iş skill açıklamasına net uyduğunda context'e girer. Codex subagent'leri de her promptta otomatik spawn olmaz; bu starter, mevcut Codex runtime izin verdiğinde bounded ve geri alınabilir lokal uzman delegasyonu için kalıcı izin kaydeder.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f916.svg" alt="" aria-hidden="true" width="20"> Kurulan Ajan Ekibi

Bunlar Codex Chef'in kurduğu görünür uzman isimleridir. Ayrı servis değil, açık ve görünür delegasyon için rol dosyalarıdır.

| Harita ve plan | Uygulama ve review | Doğrulama ve yayın |
| --- | --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5fa.svg" alt="" aria-hidden="true" width="18"> **Code Mapper** (`code_mapper`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="18"> **Design Reviewer** (`design_reviewer`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="18"> **QA Lead** (`qa_lead`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="18"> **Docs Researcher** (`docs_researcher`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="18"> **DevEx Auditor** (`devex_auditor`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg" alt="" aria-hidden="true" width="18"> **Performance Auditor** (`performance_auditor`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ed.svg" alt="" aria-hidden="true" width="18"> **Context Architect** (`context_architect`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f575.svg" alt="" aria-hidden="true" width="18"> **Root-Cause Debugger** (`root_cause_debugger`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50e.svg" alt="" aria-hidden="true" width="18"> **Google SEO Auditor** (`google_seo_auditor`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270d.svg" alt="" aria-hidden="true" width="18"> **Prompt Architect** (`prompt_architect`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4dd.svg" alt="" aria-hidden="true" width="18"> **Docs Author** (`docs_author`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6e1.svg" alt="" aria-hidden="true" width="18"> **Security Auditor** (`security_auditor`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="18"> **MCP Integrator** (`mcp_integrator`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cb.svg" alt="" aria-hidden="true" width="18"> **Spec Author** (`spec_author`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="18"> **Test Verifier** (`test_verifier`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3af.svg" alt="" aria-hidden="true" width="18"> **Product Strategist** (`product_strategist`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50d.svg" alt="" aria-hidden="true" width="18"> **Code Reviewer** (`code_reviewer`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a2.svg" alt="" aria-hidden="true" width="18"> **Release Verifier** (`release_verifier`) |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3d7.svg" alt="" aria-hidden="true" width="18"> **Engineering Planner** (`engineering_planner`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ad.svg" alt="" aria-hidden="true" width="18"> **Frontend Verifier** (`frontend_verifier`) | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1fa7a.svg" alt="" aria-hidden="true" width="18"> **Codex Doctor** (`codex_doctor`) |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9e9.svg" alt="" aria-hidden="true" width="20"> Skill'ler

| Set | Skill'ler |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f373.svg" alt="" aria-hidden="true" width="20"> Yerel plugin | `codex-chef-operator`, `offline-diagram-triplet`, `context-budget-planner` |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9f0.svg" alt="" aria-hidden="true" width="20"> Reviewed global katalog | `dependency-upgrade`, `gh-fix-ci`, `systematic-debugging`, `request-refactor-plan`, `security-best-practices`, `frontend-skill`, `webapp-testing`, `web-quality-audit`, `seo`, `accessibility`, `test-driven-development`, `documentation-and-adrs`, `mcp-builder`, `ai-project-starter`, `prompt-architect`, `ai-skill-create` |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> MCP Varsayılanları

| Durum | MCP'ler | Sınır |
| --- | --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Varsayılan açık daraltılmış tool'lar | OpenAI Docs · Context7 · Sequential Thinking · Playwright · Chrome DevTools · Serena · Memory · `codebase-memory` | Docs ve reasoning akıcı çalışır; browser evidence, semantic navigation, local memory reads ve lokal graph okumalari allowlist edilir. Interaction, symbol edit, graph indexing ve write tool'lari prompt-gated veya disabled kalır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f512.svg" alt="" aria-hidden="true" width="20"> Opt-in bekler | <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="18"> Filesystem · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f419.svg" alt="" aria-hidden="true" width="18"> GitHub · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3a8.svg" alt="" aria-hidden="true" width="18"> Figma · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4cc.svg" alt="" aria-hidden="true" width="18"> Linear · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5d2.svg" alt="" aria-hidden="true" width="18"> Notion · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6a8.svg" alt="" aria-hidden="true" width="18"> Sentry · ▲ Vercel · <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f5c4.svg" alt="" aria-hidden="true" width="18"> Supabase | Özel dosya, hesap, deploy, telemetry veya database verisi açabileceği için kapalı başlar. |

Kurulumdan sonra `npm run codex:status` çalıştırarak MCP setup notlarını, effective controls bilgisini, routing profillerini ve installed-runtime drift durumunu global Codex state'ini değiştirmeden görebilirsin.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6ab.svg" alt="" aria-hidden="true" width="20"> Ne Yapmaz?

- Secret saklamaz, private memory state'i kopyalamaz ve mevcut session'lari import etmez; Memory MCP yalnizca bilincli kullandiginda secret icermeyen lokal context icindir.
- Auth isteyen account, database, production veya geniş filesystem MCP connector'larını varsayılan olarak açmaz.
- Commit, push, tag, release, package publish, deploy, secret rotation veya GitHub settings değişikliği yapmaz.
- User datasını cleanup kısayolu olarak silmez; repair ve force akışları preview ve backup üstünden ilerler.

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3ac.svg" alt="" aria-hidden="true" width="20"> Görsel Akış

<p align="center">
  <img src="assets/workflow-overview.svg" alt="Kurulum, routing, araştırma, uygulama ve doğrulama adımlarını gösteren workflow diyagramı" width="100%" />
</p>

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2705.svg" alt="" aria-hidden="true" width="20"> Güven Sinyalleri

| Sinyal | Kanıt |
| --- | --- |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ea.svg" alt="" aria-hidden="true" width="20"> Gerçek doğrulama | `npm run check` repo, docs, install-plan, installer smoke, agent drift, MCP drift, token-surface, skill-source, supply-chain, package-surface, release-readiness ve security kontrollerini çalıştırır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f310.svg" alt="" aria-hidden="true" width="20"> Çok dilli yüzey | Altı root README ve altı dilde derin dokümantasyon validation ile korunur. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f50c.svg" alt="" aria-hidden="true" width="20"> Konservatif connector'lar | Account, database, production ve geniş filesystem connector'ları görev açıkça istemedikçe disabled kalır. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9fe.svg" alt="" aria-hidden="true" width="20"> Install plan | `manifests/install-plan.json` ve `schemas/install-plan.schema.json` managed write yüzeyini tanımlar. |
| <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9ee.svg" alt="" aria-hidden="true" width="20"> Context budget | `npm run token:audit` en büyük context yüzeylerini gösterir; `token-safe.config.toml` skill, MCP, memory, hook veya otomatik agent model/reasoning seçimini kapatmadan verbosity ve tool-output budget'ını düşürür. |
| Ajan-okunur indeks | `llms.txt`, ajanlara install hedeflerini, docs haritasını, güvenlik sınırlarını ve karşılaştırma kaynaklarını kısa verir. |

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4c1.svg" alt="" aria-hidden="true" width="20"> Repo Yapısı

```text
.github/                 CI workflow, issue ve PR template'leri
assets/                  Public-safe README görselleri
catalog/                 Agent, skill, MCP ve routing metadata'sı
README*.md               Çok dilli public girişler
docs/                    Altı dilli kurulum ve doğrulama rehberleri
manifests/               No-write install plan metadata'sı
plugins/                 Bundled lokal Codex plugin ve skill'ler
schemas/                 Hafif validation schema'ları
scripts/                 Install, doctor, status, CLI ve validation scriptleri
templates/codex/         ~/.codex altına kopyalanan dosyalar
templates/git/           Opsiyonel global Git hygiene dosyaları
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

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Dokümantasyon

README yön bulmak içindir; operatör detayı docs altında:

- [Kurulum](docs/install.tr.md)
- [Beklenen çıktı](docs/expected-output.tr.md)
- [Sorun giderme](docs/troubleshooting.tr.md)
- [Upgrade rehberi](docs/upgrade.tr.md)
- [Codex capability map](docs/codex-capability-map.tr.md)
- [Workflow surface map](docs/workflow-surface-map.tr.md)
- [Codex surfaces](docs/codex-surfaces.tr.md)
- [Codex flag'leri](docs/codex-flags.tr.md)
- [Skills ve ajanlar](docs/skills-and-agents.tr.md)
- [MCP kataloğu](docs/mcp-catalog.tr.md)
- [Security model](docs/security-model.tr.md)
- [Verification](docs/verification.tr.md)
- [Public readiness](docs/public-readiness.tr.md)
- [ECC compatibility](docs/ecc-compatibility.tr.md)
- [SEO ve discoverability](docs/seo.tr.md)
- [Research notes](docs/research-notes.tr.md)
- [Advisory kaynakları](docs/advisory-sources.tr.md)
- [Publishing](docs/publish.tr.md)
- [Ajan-okunur indeks](llms.txt)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4da.svg" alt="" aria-hidden="true" width="20"> Resmi Codex Kaynakları

- Codex manual: https://developers.openai.com/codex/codex-manual.md
- Skills: https://developers.openai.com/codex/skills
- Plugins: https://developers.openai.com/codex/plugins
- MCP ve connectors: https://developers.openai.com/api/docs/guides/tools-connectors-mcp
- Windows: https://developers.openai.com/codex/windows
- Config, permissions, rules, hooks ve `AGENTS.md` eşlemesi: [Research notes](docs/research-notes.tr.md)

## <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg" alt="" aria-hidden="true" width="20"> Yayınlama Sınırı

Bu repo validation sonrası public-ready olacak şekilde hazırlanır, fakat installer sadece lokal setup yapar. Commit, push, tag, release, package publish, deploy ve GitHub settings değişiklikleri local verification sonrası açık insan kararı olmalıdır.
