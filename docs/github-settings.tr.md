# GitHub Repository Ayarları

Kaynak ağaç doğrulandıktan ve kullanıcı GitHub settings değişikliklerini açıkça
onayladıktan sonra bu checklist'i kullan. Bunlar repo metadata önerileridir;
installer bunları otomatik uygulamamalıdır.

## Önerilen Açıklama

```text
Codex Chef: Windows-first Codex setup kit with agents, skills, MCP connectors, safe installers, validation gates, and multilingual docs.
```

## Önerilen Topic'ler

```text
codex
codex-chef
openai
codex-cli
ai-agents
mcp
model-context-protocol
agent-skills
windows
powershell
developer-tools
security
starter-template
setup
automation
```

## Website

Stabil bir proje sayfası yoksa boş bırak. Lokal dosya yolu, geçici preview URL
veya private workspace URL kullanma.

## Social Preview

GitHub social preview image olarak `assets/social-preview.svg` kullan.

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

v0.5.36 icin:

```text
Title: Codex Chef v0.5.36
Tag: v0.5.36
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
