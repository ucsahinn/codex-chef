# GitHub Repo Ayarları

Bu ayarlar projenin public ilk izlenimini belirler. Yalnız source tree doğrulandıktan ve account-level değişiklik açıkça onaylandıktan sonra manuel uygula.

Güncel yayınlanmış temel sürüm: **v0.5.55**.

## Açıklama

```text
Cross-platform Codex setup kit with specialist agents, curated skills, conservative MCP defaults, preview-first installers, and release-grade validation.
```

## Topic’ler

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
macos
linux
powershell
developer-tools
security
setup
```

## Website Ve Social Preview

Stabil bir public proje sayfası yoksa website alanını boş bırak. Lokal path, geçici preview URL veya private workspace linki kullanma.

GitHub social preview için `assets/social-preview.png` kullan. Düzenlenebilir kaynak olarak `assets/social-preview.svg` kalsın.

## Repo Özellikleri

- Issues: açık.
- Discussions: maintainer’lar community sorularını gerçekten yanıtlayacaksa aç.
- Wiki: bu repodaki version-controlled docs kanonik olduğu sürece kapalı.
- Projects: opsiyonel.
- Packages ve sponsorships: aktif bakım yapılmayacaksa kapalı.

## Branch Ve Actions

- Default branch: `main`.
- Release iddiasından önce validation workflow tamamen geçmeli.
- Workflow permission’ları read-only, action referansları full commit SHA ile pinned kalmalı.
- Release yayını manuel kalmalı; validation workflow push, tag veya publish yapmamalı.

## Release Metadata

v0.5.55 için:

```text
Title: Codex Chef v0.5.55
Tag: v0.5.55
Notes: tmp/release-notes-current.md
```

Gelecekteki bir release öncesinde `npm run check`, `npm run verify:skills:online`, `npm run release:notes`, `gitleaks detect --redact --no-banner --no-git --verbose` ve [Yayın kontrol listesinde](publish.tr.md) anlatılan lokal/remote commit eşitliği kontrolünü çalıştır.
