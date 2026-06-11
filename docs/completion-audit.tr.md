# Tamamlanma Denetimi

Tarih: 2026-06-11

Bu denetim istenen final durumu mevcut repo kanıtlarıyla eşleştirir.

## Gereksinimler

| Gereksinim | Kanıt | Durum |
| --- | --- | --- |
| İngilizce ve Türkçe içerik eksiksiz olmalı. | Her `docs/*.md` dosyasının `.tr.md` karşılığı var. `scripts/validate-repo.mjs` ve `scripts/security-audit.mjs` bu eşleşmeyi otomatik zorunlu tutuyor. | Tamam |
| GitHub ana ekranında Türkçe görünür olmalı. | `README.md` içinde `README.tr.md` dil geçişi ve ilk ana bölümden önce Türkçe kısa özet var. `scripts/validate-repo.mjs` bu storefront sinyalini zorunlu tutuyor. | Tamam |
| Repo amacına uygun ikon ve görseller kullanmalı. | `README.md` ve `README.tr.md` gerçek badge'ler, emoji aksanları, `assets/banner.svg` ve `assets/workflow-overview.svg` görsellerini içeriyor; SVG validasyonu title, description, hafif animasyon ve reduced-motion fallback zorunlu tutuyor. | Tamam |
| GitHub community akışları public-safe olmalı. | `.github/ISSUE_TEMPLATE/*` ve `.github/pull_request_template.md` bug bildirimi, doküman önerisi ve PR akışlarını secret ve private local state paylaşımından uzak tutuyor. | Tamam |
| README güven sinyallerini hızlı göstermeli. | `README.md` ve `README.tr.md` public-safe kapsam, validasyon, iki dilli docs, erişilebilir görseller, connector varsayılanları ve community akışını anlatan güven sinyalleri tablosu içeriyor. | Tamam |
| Senior çalışma standartları açık olmalı. | `docs/best-practices.md` ve `docs/best-practices.tr.md` kaynak kalitesi, yüzey routing'i, çalışma döngüsü, skill/package kuralları, public-safe kurallar, UI doğrulaması ve bakım kontrollerini tanımlar. | Tamam |
| Skill kurulum kaynakları kullanıcı installer hatasına düşmeden yakalanmalı. | `scripts/verify-skill-sources.mjs` kurulabilir package/skill çiftlerini offline doğrular, `npm run verify:skills:online` bunları Skills CLI üzerinden çözdürür ve `npm run check` offline gate'i içerir. | Tamam |
| Tam setup idempotent olmalı ve hata olursa fail etmelidir. | `scripts/install.ps1` ve `scripts/install.sh` zaten kurulu global skill'leri atlar, yalnız Codex agent hedefini kurar, başarıda ham Skills CLI progress çıktısını bastırır, skill clone işlemlerinde OpenSSL Git override kullanır ve Skills CLI clone/install/write hatası bildirirse fail eder. | Tamam |
| Dependency güncelleme hijyeni görünür olmalı. | `.github/dependabot.yml` GitHub Actions ve npm manifest güncellemelerini haftalık takip eder. | Tamam |
| Kurulumun net bir how-to rehberi olmalı. | `docs/how-to.md` ve `docs/how-to.tr.md` tek seferlik kurulum, doğrulama, çalışma modeli, MCP varsayılanları, profiller, hazır promptlar ve güvenlik kurallarını anlatıyor. | Tamam |
| Tek komutlu kurulum Codex'i güçlü uzman setup'a çevirmeli. | `scripts/install.ps1 -All -Force` ve `scripts/install.sh --all --force` Codex template'lerini, doğrulanmış public skill package'larını, Git guard'larını, uzman ajanları, profilleri, kuralları ve yerel plugin'i kuruyor. | Tamam |
| Setup, yazılım ekibi gibi çalışan subagent'lar içermeli. | `templates/codex/config.*.toml` içinde `code_mapper`, `docs_researcher`, `code_reviewer`, `frontend_verifier`, `security_auditor`, `test_verifier` ve `release_verifier` kayıtlı. | Tamam |
| Araştırma ve güncel doküman erişimi hazır olmalı. | OpenAI Docs MCP ve Context7 varsayılan açık; `docs/research-notes.md` ve `docs/research-notes.tr.md` kullanılan resmi Codex manual başlıklarını kaydediyor. | Tamam |
| `--seq` tarzı parçalama desteği olmalı. | `sequential-thinking` MCP Windows ve Unix template'lerinde varsayılan açık ve MCP kataloglarında dokümante. | Tamam |
| Tarayıcı/UI doğrulaması hazır olmalı. | Playwright ve Chrome DevTools MCP'leri varsayılan açık; `frontend_verifier` kayıtlı ve dokümante. | Tamam |
| Güvenlik güçlü kalmalı. | Sandbox ve onay varsayılanları konservatif, dış hesap/database/filesystem MCP'leri kapalı, Git guard'ları opsiyonel, Gitleaks release doğrulamasının parçası. | Tamam |
| Public repo yerel state veya secret içermemeli. | Validasyon yerel kullanıcı yollarını, Codex session/memory yollarını, private key marker'larını, yaygın token pattern'lerini, yasak secret dosya adlarını, database'leri ve paket artifact'lerini engelliyor. | Tamam |
| Sonraki bakım aynı hizada kalmalı. | Paketlenen `enterprise-codex-operator` skill'i README/install/how-to doküman hizasını ve iki dilli docs eşleşmesini zorunlu tutuyor. | Tamam |

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

## 2026-06-11 Routing Ek Kapsam

| Gereksinim | Kanit | Durum |
| --- | --- | --- |
| Global talimatlar subagent routing'i daha net yapmali ama otomasyonu abartmamali. | `~/.codex/AGENTS.md` ve `templates/codex/AGENTS.md`, task-shape routing icin uzman ajanin bilerek spawn edilmesini ve ozetin beklenmesini soyluyor; docs subagent'in acik delegasyon oldugunu netlestiriyor. | Tamam |
| Skill routing resmi progressive disclosure davranisiyla uyumlu olmali. | Global/template `AGENTS.md` ve `docs/skills-and-agents.md`, explicit/implicit skill secimini, tam `SKILL.md` okuma kuralini, odakli reference yuklemeyi ve plugin paketleme sinirlarini anlatiyor. | Tamam |
| MCP flagleri dokumante edilmeli ve template'lere islenmeli. | `templates/codex/config.*.toml` artik `max_depth`, `job_max_runtime_seconds` ve MCP startup/tool timeout alanlarini iceriyor; `docs/mcp-catalog.md`, `docs/codex-flags.md` ve `docs/security-model.md` approval mode, allow/deny list, timeout ve env-backed auth alanlarini anlatiyor. | Tamam |
| Eslesen skill, ajan, MCP ve flagler uygulanabilir oldugunda zorunlu olmali. | `~/.codex/AGENTS.md`, `templates/codex/AGENTS.md`, `docs/skills-and-agents.md`, `docs/mcp-catalog.md` ve `docs/codex-flags.md` eslesen yuzeyin kullanilmasini ve atlanan bariz routing yuzeyinin gerekcesini ister. | Tamam |
| Silme veya cleanup aksiyonlari acik onay beklemeli, guvenli isler devam edebilmeli. | `~/.codex/AGENTS.md`, `templates/codex/AGENTS.md`, root `AGENTS.md`, `docs/security-model.md` ve `templates/codex/rules/default.rules` deletion, cleanup, prune, uninstall, overwrite ve benzer destructive isler icin onay ister. | Tamam |
