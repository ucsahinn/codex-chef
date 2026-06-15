# GitHub Repository Ayarları

Kaynak ağaç doğrulandıktan ve kullanıcı GitHub settings değişikliklerini açıkça
onayladıktan sonra bu checklist'i kullan. Bunlar repo metadata önerileridir;
installer bunları otomatik uygulamamalıdır.

## Önerilen Açıklama

```text
Windows-first Codex setup starter with safe installers, MCP/skill catalogs, validation gates, and multilingual docs.
```

## Önerilen Topic'ler

```text
codex
openai
codex-cli
ai-agents
mcp
agent-skills
windows
powershell
developer-tools
security
starter-template
```

## Website

Stabil bir proje sayfası yoksa boş bırak. Lokal dosya yolu, geçici preview URL
veya private workspace URL kullanma.

## Özellikler

- Issues: açık.
- Discussions: opsiyonel; maintainer community sorularını cevaplayacaksa aç.
- Wiki: docs bilinçli olarak oraya taşınmadıkça kapalı.
- Projects: opsiyonel.
- Sponsorship/packages: bilinçli bakım yapılmayacaksa kapalı.

## Branch Ve Actions

- Default branch: `main`.
- Release iddiası yapmadan önce GitHub Actions validation başarılı olmalı.
- Workflow permissions least-privilege kalmalı; bu repo'nun validation workflow'u
  `contents: read` kullanır.
- Release artifact'larını source klasörlerinden yayınlama. İleride archive veya
  installer üretilirse GitHub Releases kullan.

## Release Metadata

v0.4.0 için:

```text
Title: Codex Enterprise Starter v0.4.0
Tag: v0.4.0
Notes: docs/release-notes.md
```

Release oluşturmadan önce doğrula:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

Release yayınlanmadan önce local ve remote hash aynı olmalı.
