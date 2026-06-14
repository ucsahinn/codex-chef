# Codex Enterprise Starter

<p align="center">
  <img src="assets/banner.svg" alt="Uzman ajanlar, MCP kaynakları, skill'ler, doğrulama ve iki dilli dokümanları gösteren Codex Enterprise Starter banner görseli" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/ucsahinn/codex-enterprise-starter/actions/workflows/validate.yml"><img alt="Validate workflow" src="https://github.com/ucsahinn/codex-enterprise-starter/actions/workflows/validate.yml/badge.svg" /></a>
  <a href="LICENSE"><img alt="MIT lisansı" src="https://img.shields.io/github/license/ucsahinn/codex-enterprise-starter?color=0f766e" /></a>
  <a href="README.tr.md"><img alt="English and Turkish docs" src="https://img.shields.io/badge/docs-English%20%2B%20T%C3%BCrk%C3%A7e-0f766e" /></a>
  <img alt="Windows ve WSL uyumlu" src="https://img.shields.io/badge/platform-Windows%20%2B%20WSL-164e63" />
</p>

<p align="center">
  <a href="README.md">🇬🇧 English</a> | <a href="README.tr.md">🇹🇷 Türkçe</a>
</p>

Windows ağırlıklı çalışan güçlü kullanıcılar ve küçük ekipler için güvenlik öncelikli Codex setup paketi. Tekrar edilebilir bir yerel Codex temeli kurar: kalıcı talimatlar, konservatif config, uzman ajanlar, onay kuralları, MCP varsayılanları, seçilmiş skill metadata'ları, plugin paketi, doğrulama scriptleri ve iki dilli dokümantasyon.

Bu resmi OpenAI ürünü değildir; community starter paketidir. Güncel resmi Codex dokümanlarıyla eşleştirilmiştir ve riskli aksiyonlar varsayılan olarak onaya bağlı kalır.

## ⚡ Buradan Başla

| Hedef | Link |
| --- | --- |
| Güvenli kurulum yapmak | [Hızlı Kurulum](#-hızlı-kurulum) |
| Yazmadan önce ön izleme almak | [Önce Dry Run](#-önce-dry-run) |
| Nelerin kurulduğunu görmek | [Kurulum Yüzeyi](#-kurulum-yüzeyi) |
| Publish öncesi doğrulamak | [Doğrulama](docs/verification.tr.md) |
| Windows/Codex sorunlarını çözmek | [Troubleshooting](docs/troubleshooting.tr.md) |
| Mevcut setup'ı yükseltmek | [Upgrade Rehberi](docs/upgrade.tr.md) |

## 🧭 Bu Repo Ne?

Codex Enterprise Starter, dağınık yerel setup bilgisini public, okunabilir ve doğrulanabilir bir starter repoya çevirir. Şu sorulara net cevap verir:

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
- `~/.codex/plugins/codex-enterprise-workflows`
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

## ⚡ Hızlı Kurulum

PowerShell:

```powershell
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Bash veya WSL:

```bash
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
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
2. Güncel API ve ürün davranışını `docs_researcher` ile doğrulat.
3. Ana thread içinde repo talimatları ve doğru skill'lerle uygula.
4. İşin şekline göre `test_verifier`, `frontend_verifier` veya `security_auditor` ile kanıtı güçlendir.
5. Push, tag, release, paket, deploy veya yayın öncesi `release_verifier` kullan.

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
| 🧪 Gerçek doğrulama | `npm run check` repo, docs, skill-source ve security kontrollerini çalıştırır. |
| 🔐 Secret scan hazır | Gitleaks komutu dokümante edilir; Git hook varsa Gitleaks çalıştırır. |
| 🌐 İki dilli doküman | İngilizce ve Türkçe doc çiftleri validation ile zorunlu tutulur. |
| 🎬 Erişilebilir görseller | SVG'lerde title, description, motion, reduced-motion fallback ve README alt text vardır. |
| 🧩 Skill kaynak gate'i | `catalog/skills-lock.json` installable skill metadata'sıyla karşılaştırılır. |
| 🔌 Konservatif MCP'ler | Auth isteyen hesap, database ve geniş filesystem connector'ları disabled kalır. |
| 🧭 Kaynaklı rehberlik | Research notes kaynak tipi, confidence, neyi desteklediği ve outdated-risk içerir. |
| ♻️ CI eşleşmesi | GitHub Actions aynı `npm run check` yolunu ve shell parser kontrollerini çalıştırır. |

## 📁 Repo Yapısı

```text
.github/                 CI workflow, issue ve PR template'leri
assets/                  Public-safe README görselleri
catalog/                 Skill ve MCP kaynak metadata'ları
docs/                    İngilizce ve Türkçe kurulum rehberleri
plugins/                 Bundled yerel Codex plugin'i
scripts/                 Kurulum ve doğrulama scriptleri
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

- [Kurulum](docs/install.tr.md)
- [Troubleshooting](docs/troubleshooting.tr.md)
- [Beklenen çıktı](docs/expected-output.tr.md)
- [Upgrade rehberi](docs/upgrade.tr.md)
- [Codex yüzeyleri](docs/codex-surfaces.tr.md)
- [Skills ve ajanlar](docs/skills-and-agents.tr.md)
- [MCP kataloğu](docs/mcp-catalog.tr.md)
- [Güvenlik modeli](docs/security-model.tr.md)
- [Doğrulama](docs/verification.tr.md)
- [Public hazırlık](docs/public-readiness.tr.md)
- [Araştırma notları](docs/research-notes.tr.md)
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
