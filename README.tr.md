# Codex Enterprise Starter

Windows ağırlıklı çalışan güçlü kullanıcılar ve küçük ekipler için güvenlik
öncelikli Codex kurulum paketi.

Amaç: mevcut olgun global Codex kurulumunu temiz, paylaşılabilir ve tek komutla
kurulabilir bir repo haline getirmek. Bu repo global talimatları, MCP
varsayılanlarını, uzman ajanları, onay kurallarını, skill kataloglarını, plugin
paketini, doğrulama scriptlerini ve iki dilli kullanım dokümanlarını içerir.

Bu repo token, auth dosyası, memory, session, yerel proje yolu, private key,
cookie veya makineye özel gizli durum içermez.

## Ne Kurar?

- `~/.codex/AGENTS.md` kalıcı çalışma anlaşmaları.
- `~/.codex/config.toml` güvenli varsayılanlar, MCP sunucuları, feature flagler
  ve uzman ajan kayıtları.
- `~/.codex/agents/*.toml` kod haritalama, doküman araştırma, review, frontend
  doğrulama, güvenlik audit, test doğrulama ve release doğrulama ajanları.
- `~/.codex/rules/default.rules` dar kapsamlı komut onay kuralları.
- İsteğe bağlı global Git hijyeni: global ignore ve secret engelleyen
  pre-commit hook.
- İsteğe bağlı skill kurulumu: `catalog/skills.json`.
- Yerel plugin marketplace kaydı: `codex-enterprise-workflows`.

## Hızlı Kurulum

PowerShell:

```powershell
cd "$env:USERPROFILE\Desktop\codex-enterprise-starter"
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -InstallSkills -InstallGitGuards -Force
```

Bash veya WSL:

```bash
cd ~/Desktop/codex-enterprise-starter
chmod +x scripts/install.sh
./scripts/install.sh --install-skills --install-git-guards --force
```

Kurulumdan sonra Codex'i yeniden başlat ve şunları çalıştır:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

## Güvenli Varsayılanlar

- Sandbox açık kalır.
- Onay politikası interaktif kalır.
- Agent internet erişimi varsayılan olarak kapalıdır.
- Kimlik doğrulama isteyen uzak connector'lar varsayılan olarak kapalıdır.
- Dış sistemlere dokunabilecek MCP araçlarında onay tercih edilir.
- GitHub push, release, deploy, secret rotation, package publish, yıkıcı dosya
  işlemleri ve credential erişimi açık kullanıcı onayına bağlıdır.

## Repo Yapısı

```text
catalog/                 MCP ve skill katalogları
docs/                    İngilizce ve Türkçe kurulum dokümanları
plugins/                 İsteğe bağlı yerel Codex plugin paketi
scripts/                 Kurulum ve doğrulama scriptleri
templates/codex/         ~/.codex içine kopyalanan dosyalar
templates/git/           İsteğe bağlı global Git hijyen dosyaları
```

## Önceki Çalışmada Nereler Değişmiş?

Önceki global Codex çalışması yeni bir Masaüstü repo oluşturmamış. Canlı global
kurulum tarafında değişiklik yapmış. Önemli güncel konumlar:

- `~/.codex/AGENTS.md`
- `~/.codex/config.toml`
- `~/.codex/SECURITY_OPERATIONS.md`
- `~/.codex/agents/*.toml`
- `~/.codex/rules/default.rules`
- `~/.agents/skills/*`
- `~/.gitignore_global`
- `~/.githooks/pre-commit`

Normalize edilmiş denetim için [docs/local-audit.md](docs/local-audit.md)
dosyasına bak.

## GitHub'a Pushlamadan Önce

Bu repo pushlanabilir olacak şekilde hazırlanmıştır, fakat installer commit,
push, release, deploy veya remote oluşturma yapmaz.

Push öncesi:

```bash
npm run validate
git status --short
git diff --cached
```

Gitleaks kuruluysa:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

## Resmi Codex Kaynakları

Bu repodaki dokümanlar 2026-06-10 tarihinde fetch edilen güncel Codex manual'ı
ve yerel kurulum kanıtları baz alınarak hazırlandı.

- CLI reference: https://developers.openai.com/codex/cli/reference
- AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- Skills: https://developers.openai.com/codex/skills
- MCP: https://developers.openai.com/codex/mcp
- Rules: https://developers.openai.com/codex/rules
- Hooks: https://developers.openai.com/codex/hooks
- Permissions: https://developers.openai.com/codex/permissions
- Plugins: https://developers.openai.com/codex/plugins
- Windows: https://developers.openai.com/codex/windows
