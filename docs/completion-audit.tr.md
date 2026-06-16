# Tamamlanma Denetimi

Tarih: 2026-06-11

Bu denetim istenen final durumu mevcut repo kanıtlarıyla eşleştirir.

## Gereksinimler

| Gereksinim | Kanıt | Durum |
| --- | --- | --- |
| İngilizce ve Türkçe içerik eksiksiz olmalı. | Her `docs/*.md` dosyasının `.tr.md` karşılığı var. `scripts/validate-repo.mjs` ve `scripts/security-audit.mjs` bu eşleşmeyi otomatik zorunlu tutuyor. | Tamam |
| GitHub ana ekranında Türkçe ve daha geniş dil girişleri görünür olmalı. | `README.md` içinde Deutsch, Español, English, Português (Brasil), Türkçe ve Français için görünür switcher var. Linklenen her dil için kök README dosyası bulunur ve `scripts/validate-repo.mjs` bu storefront sinyalini zorunlu tutar. | Tamam |
| Repo amacına uygun ikon ve görseller kullanmalı. | `README.md` ve `README.tr.md` gerçek badge'ler, emoji aksanları, `assets/banner.svg` ve `assets/workflow-overview.svg` görsellerini içeriyor; SVG validasyonu title, description, hafif animasyon ve reduced-motion fallback zorunlu tutuyor. | Tamam |
| GitHub community akışları public-safe olmalı. | `.github/ISSUE_TEMPLATE/*`, `.github/CODEOWNERS` ve `.github/pull_request_template.md` bug, feature, soru, doküman önerisi ve PR akışlarını secret ve private local state paylaşımından uzak tutuyor; blank issue kapalı. | Tamam |
| README güven sinyallerini hızlı göstermeli. | `README.md` ve `README.tr.md` public-safe kapsam, validasyon, çok dilli docs, erişilebilir görseller, connector varsayılanları ve community akışını anlatan güven sinyalleri tablosu içeriyor. | Tamam |
| Senior çalışma standartları açık olmalı. | `docs/best-practices.md` ve `docs/best-practices.tr.md` kaynak kalitesi, yüzey routing'i, çalışma döngüsü, skill/package kuralları, public-safe kurallar, UI doğrulaması ve bakım kontrollerini tanımlar. | Tamam |
| Skill kurulum kaynakları kullanıcı installer hatasına düşmeden yakalanmalı. | `catalog/skills-lock.json` incelenmiş kaynak allowlist'ini kaydeder, `scripts/verify-skill-sources.mjs` kurulabilir package/skill çiftlerini offline doğrular, `npm run verify:skills:online` bunları Skills CLI üzerinden çözdürür ve `npm run check` offline gate'i içerir. | Tamam |
| Tam setup idempotent olmalı ve hata olursa fail etmelidir. | `scripts/install.ps1` ve `scripts/install.sh` zaten kurulu global skill'leri atlar, yalnız Codex agent hedefini kurar, başarıda ham Skills CLI progress çıktısını bastırır, skill clone işlemlerinde OpenSSL Git override kullanır ve Skills CLI clone/install/write hatası bildirirse fail eder. | Tamam |
| Dependency güncelleme hijyeni görünür olmalı. | `.github/dependabot.yml` GitHub Actions ve npm manifest güncellemelerini haftalık takip eder. | Tamam |
| Kurulumun net bir how-to rehberi olmalı. | `docs/how-to.md` ve `docs/how-to.tr.md` tek seferlik kurulum, doğrulama, çalışma modeli, MCP varsayılanları, profiller, hazır promptlar ve güvenlik kurallarını anlatıyor. | Tamam |
| Tek komutlu kurulum Codex'i güçlü uzman setup'a çevirmeli ama global Git ayarlarını sürpriz şekilde değiştirmemeli. | `scripts/install.ps1 -All` ve `scripts/install.sh --all` Codex template'lerini, doğrulanmış public/first-party skill package'larını, uzman ajanları, profilleri, kuralları ve yerel plugin'i kuruyor; mevcut `config.toml` var olan tabloları ezmeden merge ediliyor, global Git guard'ları açıkça `-InstallGitGuards` / `--install-git-guards` flag'inin arkasında kalıyor. | Tamam |
| Setup, yazılım ekibi gibi çalışan subagent'lar içermeli. | `templates/codex/config.*.toml` içinde `code_mapper`, `docs_researcher`, `code_reviewer`, `frontend_verifier`, `security_auditor`, `test_verifier` ve `release_verifier` kayıtlı. | Tamam |
| Araştırma ve güncel doküman erişimi hazır olmalı. | OpenAI Docs MCP ve Context7 varsayılan açık; `docs/research-notes.md` ve `docs/research-notes.tr.md` kullanılan resmi Codex manual başlıklarını kaydediyor. | Tamam |
| `--seq` tarzı parçalama desteği olmalı. | `sequential-thinking` MCP Windows ve Unix template'lerinde varsayılan açık ve MCP kataloglarında dokümante. | Tamam |
| Tarayıcı/UI doğrulaması hazır olmalı. | Playwright ve Chrome DevTools MCP'leri varsayılan açık; `frontend_verifier` kayıtlı ve dokümante. | Tamam |
| Güvenlik güçlü kalmalı. | Sandbox ve onay varsayılanları konservatif, dış hesap/database/filesystem MCP'leri kapalı, Git guard'ları opsiyonel, Gitleaks release doğrulamasının parçası. | Tamam |
| Public repo yerel state veya secret içermemeli. | Validasyon yerel kullanıcı yollarını, Codex session/memory yollarını, private key marker'larını, yaygın token pattern'lerini, yasak secret dosya adlarını, database'leri ve paket artifact'lerini engelliyor. | Tamam |
| Release notları source-controlled ve public release duruşuyla hizalı olmalı. | `docs/release-notes.md` ve `docs/release-notes.tr.md` v0.5.0 Codex Chef değişiklik setini dokümante eder ve repo/security validation tarafından zorunlu tutulur. | Tamam |
| GitHub metadata public release iddiasından önce hazır olmalı. | `docs/github-settings.md` ve `docs/github-settings.tr.md` önerilen açıklama, topic'ler, feature toggle'ları, branch/actions duruşu ve v0.5.0 release metadata'sını tanımlar. | Tamam |
| Advisory girdileri release öncesi incelenebilir olmalı. | `docs/advisory-sources.md` ve `docs/advisory-sources.tr.md`, maintainer'ların publish öncesi tekrar kontrol etmesi gereken resmi Codex, OpenAI skill, MCP security, GitHub, PowerShell ve ECC karşılaştırma kaynaklarını listeler. | Tamam |
| Kodlama ajanlari icin kisa public indeks olmali. | `llms.txt`, `package.json`, `scripts/validate-repo.mjs` ve `scripts/validate-package-surface.mjs`, agent-readable repo haritasini kontrol edilen public source yuzeyinin parcasi yapar. | Tamam |
| Sonraki bakım aynı hizada kalmalı. | Paketlenen `codex-chef-operator` skill'i README/install/how-to doküman hizasını ve iki dilli docs eşleşmesini zorunlu tutuyor. | Tamam |

## Doğrulama Kanıtı

Repo kökünden çalıştır:

```bash
npm run check
```

Beklenen sonuç:

```text
Validation passed.
Skill source verification passed.
Security audit passed.
```

Release hazırlığı için kullanılan ek kontroller:

```bash
node --check scripts/validate-repo.mjs
node --check scripts/verify-skill-sources.mjs
node --check scripts/security-audit.mjs
```

PowerShell parser kontrolü:

```powershell
powershell.exe -NoProfile -Command "`$errors = `$null; [System.Management.Automation.PSParser]::Tokenize((Get-Content -Raw -LiteralPath scripts\install.ps1), [ref]`$errors) | Out-Null; if (`$errors) { exit 1 }; 'PowerShell parse OK'"
```

Bash syntax kontrolü:

```bash
bash -n scripts/install.sh
```

TOML parse kontrolü:

```bash
python -c "import pathlib,tomllib; [tomllib.loads(p.read_text(encoding='utf-8')) for p in pathlib.Path('templates/codex').rglob('*.toml')]; print('TOML parse OK')"
```

Gitleaks kuruluysa secret scan:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

## Yayın Notu

Installer tasarım gereği sadece yerel kurulum yapar. Commit, push, publish,
deploy, secret rotation veya dış hesap değişikliği yapmaz. Bu aksiyonlar açık
kullanıcı kararı olarak kalır.

## 2026-06-16 Agent Research Freshness Ek Kapsam

| Gereksinim | Kanit | Durum |
| --- | --- | --- |
| Specialist-agent authority kaynaklari research expansion sonrasi sessizce bayatlamamali. | `catalog/agent-research-corpus.json` her reviewed authority source icin `reviewCadenceDays` kaydeder; `scripts/validate-agent-research-corpus.mjs`, source staleness risk'e gore fazla gevsek cadence degerlerini veya en siki cadence'den eski corpus `dateChecked` degerini reddeder. | Tamam |
| Specialist-agent bilgisi sadece bibliyografya degil operasyonel kalmali. | `catalog/agent-research-corpus.json` her bundled ajan icin `expertiseSignals` kaydeder, her role TOML `Expertise signal contract` tasir ve validatorlar her rol icin decision heuristic, failure mode, verification signal ve tam bir runtime contract kopyasini zorunlu tutar. | Tamam |
| Daha genis repo, skill, command ve research-paper kaynaklari default runtime authority olmadan izlenmeli. | `catalog/agent-research-corpus.json` 24 destekleyici kaynak icin `supplementalResearchRefs` kaydeder; `scripts/validate-agent-research-corpus.mjs` her supplemental ref'in freshness-checked, agent-scoped, reviewed authority ref'lere bagli ve `runtimeAuthority: false` kalmasini zorunlu tutar. | Tamam |

## 2026-06-11 Routing Ek Kapsam

| Gereksinim | Kanit | Durum |
| --- | --- | --- |
| Global talimatlar subagent routing'i daha net yapmali ama otomasyonu abartmamali. | `~/.codex/AGENTS.md` ve `templates/codex/AGENTS.md`, task-shape routing icin uzman ajanin bilerek spawn edilmesini ve ozetin beklenmesini soyluyor; docs subagent'in acik delegasyon oldugunu netlestiriyor. | Tamam |
| Skill routing resmi progressive disclosure davranisiyla uyumlu olmali. | Global/template `AGENTS.md` ve `docs/skills-and-agents.md`, explicit/implicit skill secimini, tam `SKILL.md` okuma kuralini, odakli reference yuklemeyi ve plugin paketleme sinirlarini anlatiyor. | Tamam |
| MCP flagleri dokumante edilmeli ve template'lere islenmeli. | `templates/codex/config.*.toml` artik `max_depth`, `job_max_runtime_seconds` ve MCP startup/tool timeout alanlarini iceriyor; `docs/mcp-catalog.md`, `docs/codex-flags.md` ve `docs/security-model.md` approval mode, allow/deny list, timeout ve env-backed auth alanlarini anlatiyor. | Tamam |
| Eslesen skill, ajan, MCP ve flagler uygulanabilir oldugunda zorunlu olmali. | `~/.codex/AGENTS.md`, `templates/codex/AGENTS.md`, `docs/skills-and-agents.md`, `docs/mcp-catalog.md` ve `docs/codex-flags.md` eslesen yuzeyin kullanilmasini ve atlanan bariz routing yuzeyinin gerekcesini ister. | Tamam |
| Silme veya cleanup aksiyonlari acik onay beklemeli, guvenli isler devam edebilmeli. | `~/.codex/AGENTS.md`, `templates/codex/AGENTS.md`, root `AGENTS.md`, `docs/security-model.md` ve `templates/codex/rules/default.rules` deletion, cleanup, prune, uninstall, overwrite ve benzer destructive isler icin onay ister. | Tamam |

## 2026-06-14 ECC Kaynakli Ek Kapsam

| Gereksinim | Kanit | Durum |
| --- | --- | --- |
| ECC toptan import veya config cakismasi yaratmadan incelenmeli. | `docs/ecc-compatibility.md`, `docs/ecc-compatibility.tr.md` ve `docs/research-notes.md` alinan ECC desenlerini ve disarida birakilan genis global sync, implicit dependency install, enabled authenticated connector ve telemetry hook desenlerini kaydeder. | Tamam |
| Kullanicilar installer yazmadan once tum install yuzeyini gorebilmeli. | `manifests/install-plan.json` managed operation, risk, collision policy, backup davranisi, platform ve required flag bilgilerini tutar; `node scripts/plan-install.mjs --list-profiles`, `node scripts/plan-install.mjs --list-operations` ve `node scripts/plan-install.mjs --all --json` no-write install kesif ve preview ciktisi uretir. | Tamam |
| Makine okunur plan ciktisinin stabil sozlesmesi olmali. | `schemas/install-state-preview.schema.json`, `scripts/plan-install.mjs` tarafindan uretilen JSON seklini dokumante eder; `scripts/validate-install-state-preview.mjs` source version hizasi, selected/skipped component'ler, operation metadata'si ve high-risk selection davranisini dogrular. | Tamam |
| Install-plan metadata'si lokal ve CI gate'lerinde dogrulanmali. | `scripts/validate-install-plan.mjs` ve `scripts/validate-install-state-preview.mjs` `npm run check` icindedir; install-plan destination'lari review edilmis Codex, Agents ve opsiyonel Git-guard hedefleriyle sinirlanir; `.github/workflows/validate.yml` plan, state-preview ve planner script'leri icin syntax check calistirir. | Tamam |
| Installer uygulamasi install manifest ile ayni hizada kalmali. | `scripts/validate-installer-alignment.mjs`, PowerShell ve Bash installer flag'lerini, core copy target'larini, plugin marketplace handling'i, Git guard wiring'i, skill install komutlarini ve optional flag sinirlarini `manifests/install-plan.json` ile karsilastirir. | Tamam |
| Uzman ajan metadata'si config template'leriyle ayni hizada kalmali. | `catalog/agents.json` incelenmis yirmi bir uzman ajani kaydeder; `scripts/validate-agent-config.mjs` hem Windows hem Unix `[agents.<name>]` bloklarini ve her `templates/codex/agents/*.toml` role dosyasini kontrol eder. | Tamam |
| MCP catalog ve config birbirinden sapmamali. | `scripts/validate-mcp-config.mjs` catalog entry'lerinin Windows ve Unix Codex config bloklari, enabled default'lari, approval mode'lari, URL'leri, package spec'leri, pinned git source ref'leri ve plugin `.mcp.json` yuzeyleriyle eslesmesini kontrol eder. | Tamam |
| Supply-chain risk sinyalleri publish oncesi yakalanmali. | `scripts/scan-supply-chain-iocs.mjs` `npm run check` icindedir ve remote shell pipe, PowerShell download-execute, encoded command, unsafe root removal, world-writable chmod, active `@latest` ve implicit installer dependency install desenlerini tarar. | Tamam |
| Security gate'leri guvensiz ECC-style drift'i reddetmeli. | `scripts/security-audit.mjs` installer icinde implicit `npm install`/`npm ci`, `approval_policy = "never"`, `profiles.yolo`, active `@latest` package spec, explicit flag'siz high-risk install-plan operation, idempotent olmayan skill collision policy, genis hook runtime path'leri, plugin-bundled hook/MCP/app yuzeyleri, write-capable plugin manifest'leri ve marketplace auth zorunlulugunu reddeder. | Tamam |
| Global skill kurulumu sessizce onaylanmamali. | `templates/codex/rules/default.rules` `npx.cmd skills add` ve genis `npx.cmd skills` cagrilari icin prompt ister; `scripts/security-audit.mjs` bunlar tekrar auto-allow olursa fail eder. | Tamam |
| Online skill verification PowerShell interpolation kullanmamali. | `scripts/verify-skill-sources.mjs` argv tabanli cagri, Git TLS config icin gecici Windows wrapper ve installable package adlari icin konservatif GitHub slug pattern'i kullanir. | Tamam |
| Skill kaynak lock semantigi dürüst kalmali. | `catalog/skills.json`, `catalog/skills-lock.json`, `scripts/verify-skill-sources.mjs`, `docs/security-model.tr.md` ve `docs/skills-and-agents.tr.md`, skill lock'unun degistirilemez upstream commit lock'u degil incelenmis kaynak allowlist'i oldugunu belirtir. | Tamam |
| MCP default'lari kullanisli kalirken floating package drift kullanmamali. | `templates/codex/config.windows.toml`, `templates/codex/config.unix.toml`, `catalog/mcp-servers.json`, `scripts/validate-mcp-config.mjs` ve `scripts/security-audit.mjs` npm tabanli MCP spec'leri icin exact npm package version, git-based MCP launcher'lar icin full commit SHA zorunlu tutar. | Tamam |
| Cleanup script'leri auto-approved olmamali. | `templates/codex/rules/default.rules` `npm.cmd run clean` icin prompt ister; `scripts/security-audit.mjs` cleanup script'leri tekrar auto-allow olursa fail eder. | Tamam |
| Secret scanning current tree'i kapsamali ama lokal scratch clone/cache dizinlerini disarida birakmali. | `.gitleaks.toml` default Gitleaks kurallarini extend eder ve yalnizca `tmp/`, `node_modules/`, `dist/`, `.next/` gibi ignored local scratch, dependency, build ve cache dizinlerini haric tutar. | Tamam |
| Release readiness makine gate'iyle kanitlanmali. | `scripts/validate-release-readiness.mjs` `npm run check` icindedir ve release notes, GitHub settings docs, workflow hardening, Gitleaks gate dokumantasyonu, tag metadata'si ve artifact hygiene kontrol eder. | Tamam |
| Public triage sahipli ve güvenli kalmalı. | `scripts/validate-repo.mjs`, `scripts/security-audit.mjs` ve `scripts/validate-release-readiness.mjs` CODEOWNERS, feature/question template'leri, advisory-source docs ve kapalı blank issue davranışını zorunlu tutar. | Tamam |
| Cok dilli README girisleri drift etmemeli. | `scripts/validate-readme-locales.mjs` `npm run check` icindedir ve alti kok README dosyasini, dil switcher linklerini, install/verification sinyallerini ve placeholder'siz localization'i dogrular. | Tamam |
| Text source dosyalari invisible-control smuggling'i reddetmeli. | `scripts/validate-content-safety.mjs` `npm run check` icindedir ve normal Unicode ile README emoji'lerini korurken bidi control, zero-width control ve BOM disi zero-width no-break space karakterlerini reddeder. | Tamam |
| GitHub Actions hardening makine gate'iyle kanitlanmali. | `scripts/validate-workflow-security.mjs` `npm run check` icindedir ve tag-based action ref'lerini, eksik `persist-credentials: false`, genis write permission, `pull_request_target`, implicit dependency install ve workflow icinden push/release/auth komutlarini reddeder. | Tamam |
| Personal path leak kontrolu tek maintainer'a bagli olmamali. | `scripts/validate-repo.mjs` ve `scripts/security-audit.mjs`, tracked source dosyalarinda non-placeholder Windows drive, macOS ve Linux home path'lerini reddeder. | Tamam |
| ECC hook runtime import'u varsayilan olarak bloklu kalmali. | `scripts/security-audit.mjs`, gelecekte acik review ile eklenmedikce Codex lifecycle hook runtime dosyalarini ve templates/plugins altinda otomatik session/additional-context injection desenlerini reddeder. | Tamam |
| Source package handoff makine gate'iyle kanitlanmali. | `package.json` explicit source package allowlist tanimlar; `scripts/validate-package-surface.mjs` `npm run check` icindedir ve repo-local cache ile `npm pack --json --ignore-scripts` dry-run eder; scratch output, local agent state, auth file ve archive'lari reddeder. | Tamam |
| Online skill verification bounded olmali. | `scripts/verify-skill-sources.mjs --online`, repo-local npm cache ve per-skill timeout kullanir; release verification sonsuza kadar hang etmek yerine deterministik sonuc uretir. | Tamam |

## 2026-06-15 Skill Ve Context-Budget Ek Kapsam

| Gereksinim | Kanit | Durum |
| --- | --- | --- |
| Token/context butcesi riskli bir external default eklemeden hazir olmali. | `plugins/codex-chef-workflows/skills/context-budget-planner/SKILL.md`, token/context butcesi, kaynak onceligi, compaction handoff'u ve verification gate'leri icin yerel plugin skill'i olarak gelir. | Tamam |
| Ek tasarim, Vercel, prompt, context, memory ve token-related kabiliyetler kaybolmamali. | `catalog/skills.json`, `README.md`, `README.tr.md`, `docs/skills-and-agents.md` ve `docs/skills-and-agents.tr.md`; `impeccable`, design-taste, Vercel, prompt, context, memory ve token-related skill'leri manuel opt-in referansi olarak gorunur tutar. | Tamam |
| First-party ekosistem skill'leri tek komutlu skill setup'inda gelmeli. | `catalog/skills.json`, `catalog/skills-lock.json`, `README.md`, `README.tr.md`, `docs/skills-and-agents.md` ve `docs/skills-and-agents.tr.md`; `ai-project-starter`, `prompt-architect` ve `ai-skill-create` skill'lerini incelenmis `-All` / `-InstallSkills` setine ekler. | Tamam |
| Default skill kurulumu sinirli ve dogrulanabilir kalmali. | `catalog/skills-lock.json` on alti kurulabilir global skill icerir; dis kaynakli cakisan design, Vercel, memory, token, prompt ve context referanslari manual kalir ve `-All` kurulum operasyonlarina dahil edilmez. | Tamam |
| Bundled local skill'ler eksiksiz ve drift'e karsi dayanali olmali. | Her local plugin skill'inde `SKILL.md`, `references/*.md` ve `agents/openai.yaml` var; `scripts/validate-plugin-skills.mjs` ve `npm run validate:plugin-skills` plugin manifesti ile catalog hizasini zorunlu tutar. | Tamam |
| Offline diagram iddialari gercek renderer ile ayni hizada olmali. | `offline-diagram-triplet/references/diagram-contract.md` desteklenen Mermaid flowchart subset'ini, Excalidraw scene sozlesmesini, unsupported feature'lari, safety kurallarini ve validation komutunu dokumante eder. | Tamam |
| GStack/ECC arastirmasi riskli yuzeyleri import etmeden starter'i iyilestirmeli. | `docs/workflow-surface-map.tr.md`, `docs/ecc-compatibility.tr.md`, `docs/research-notes.tr.md` ve Codex template'leri alinan role/manifest/doctor/diagram desenlerini; disarida birakilan cookie, tunnel, deploy, raw-CDP, hook-injection ve genis cross-harness sync davranislarini kaydeder. | Tamam |
| App connector guvenligi config ve validation icinde acik olmali. | `templates/codex/config.windows.toml`, `templates/codex/config.unix.toml` ve `scripts/security-audit.mjs`; `apps._default.destructive_enabled = false` ve `apps._default.open_world_enabled = false` alanlarini zorunlu tutar. | Tamam |
| Mojibake regresyonlari manuel screenshot kaygisi degil, makine gate'i olmali. | `scripts/validate-content-safety.mjs` normal Unicode ve README emoji'lerini korurken tracked text dosyalarinda muhtemel UTF-8/Windows-1252 mojibake dizilerini reddeder. | Tamam |
| Disaridaki yuksek star'li starter fikirleri kopyalanmamali, sentezlenmeli. | Yirmi bir `templates/codex/agents/*.toml` rol dosyasi artik role ozel authority metadata, source-refresh, research-synthesis, adversarial-validation, source-currency, corpus-expansion ve expert-calibration kurallari tasir. `catalog/agent-research-corpus.json` her rolun research domain, source type, authority metadata, refresh trigger ve handoff kaydini tutar; validatorlar her runtime contract ve guardrail blogundan bir tane bulunmasini, rol basina en az 100 source-backed instruction item'i ve en az 20 distinct source marker bulunmasini, ayrica authority key'lerinin role TOML source marker'lariyla eslesmesini zorunlu tutar. `docs/workflow-surface-map.md` ECC/GStack pattern'lerinin hangi Codex-native yuzeye veya explicit exclusion'a gittigini kaydeder. | Tamam |
