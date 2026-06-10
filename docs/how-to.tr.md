# Kurulum Nasıl Kullanılır?

Bu starter sadece bir `config.toml` kopyası değildir. Kurulumdan sonra Codex'in
kalıcı talimatları, güvenli MCP varsayılanları, seçilmiş skill'leri, uzman
ajanları, profilleri, kuralları, yerel plugin'i ve Git hijyen guard'ları hazır
olmalıdır.

## Tek Seferlik Kurulum

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

Sadece belirli parçaları kurmak istiyorsan dar bayrakları kullan:

- `-InstallSkills` / `--install-skills`
- `-InstallGitGuards` / `--install-git-guards`

## İlk Doğrulama

Kurulumdan sonra Codex'i yeniden başlat ve çalıştır:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Codex içinde şunları kontrol et:

```text
/mcp
/skills
/plugins
/hooks
```

## Çalışma Modeli

Bu kurulumu uzman bir yazılım ekibi gibi kullan:

1. Bilmediğin repo, büyük değişiklik veya mimari soru varsa `code_mapper` ile
   başla.
2. Güncel Codex, API, kütüphane, framework veya cloud davranışı için
   `docs_researcher` kullan.
3. Kararlar ve dosya değişiklikleri dağılmasın diye uygulamayı ana thread'de
   tut.
4. Lint, typecheck, test, build, smoke veya CI sorunu için `test_verifier`
   kullan.
5. Tarayıcıda UI kontrolü, screenshot, responsive layout, console hatası ve
   etkileşim durumları için `frontend_verifier` kullan.
6. Auth, secret, izinler, veri erişimi, API route, kriptografi veya abuse path
   için `security_auditor` kullan.
7. Push, tag, release, paket, deploy veya public yayın öncesi
   `release_verifier` kullan.

Resmi Codex dokümanları subagent akışını açıkça tetiklenen paralel çalışma
olarak anlatır. Bu starter o akış için ajan dosyalarını ve routing dilini verir;
ama onayları, sandbox'ı ve connector auth sınırlarını kaldırmaz.

## MCP Varsayılanları

Varsayılan açık gelenler:

- Resmi OpenAI dokümanları için OpenAI Docs MCP.
- Güncel kütüphane ve framework dokümanları için Context7.
- Parçalama ve düşünce akışı için Sequential Thinking.
- Tarayıcı doğrulaması için Playwright ve Chrome DevTools.
- Semantik kod gezintisi için Serena.
- Gizli veri yazmamak şartıyla yerel Memory.

İhtiyaç olana kadar kapalı gelenler:

- GitHub
- Figma
- Linear
- Notion
- Sentry
- Vercel
- Supabase
- Filesystem

Kimlik doğrulama veya veri erişimi isteyen connector'ları sadece somut görev
için ve hesap kapsamını onayladıktan sonra aç.

## Profiller

Installer profilleri `~/.codex` içine kopyalar:

- `development.config.toml`: normal geliştirme profili.
- `review.config.toml`: read-only, yüksek reasoning review profili.
- `ci.config.toml`: hook'ları kapalı read-only doğrulama profili.

Ana config'i bozmak yerine farklı güvenlik duruşu gerektiğinde profil kullan.

## Kullanışlı Promptlar

Repo denetimi:

```text
Use code_mapper and test_verifier. Map this repository, identify the highest-risk
areas, run the narrowest meaningful checks, and report blockers with file
references before editing.
```

İçerik eklemeden UI/UX iyileştirme:

```text
Kıdemli bir UX/UI uzmanı gibi davran. Yeni marketing bölümü veya alakasız metin
ekleme. Mevcut arayüzü iyileştir: kullanıcı teklifin ne olduğunu daha hızlı
anlasın, işletmeyle daha az adımda iletişime geçsin ve siteyi mobilde rahat
kullansın. Mevcut içeriği ve marka niyetini koru; hiyerarşi, boşluk, responsive
davranış, performans, erişilebilirlik ve görsel kalite profesyonel hissetsin.
İşi bitti saymadan önce mobil genişlik, metin taşması, focus state'leri,
loading/error durumları ve ana iletişim akışını doğrula.
```

Release hazırlığı:

```text
Use release_verifier and git-hygiene. Inspect git status, validate docs/scripts,
run secret scanning when available, check public-readiness files, and summarize
whether this is safe to push or publish. Do not push unless I explicitly approve.
```

## Güvenlik Kuralları

- Repo içine token, auth dosyası, session, memory, cookie, private key veya
  makineye özel state koyma.
- Sandbox açık kalsın.
- Onaylar interaktif kalsın.
- Kimlik doğrulamalı uzak connector'lar varsayılan kapalı kalsın.
- Gitleaks bulgularını incelenene kadar gerçek kabul et.
- Commit, push, publish, deploy, secret rotation ve yıkıcı dosya işlemleri hâlâ
  açık kullanıcı onayı ister.
