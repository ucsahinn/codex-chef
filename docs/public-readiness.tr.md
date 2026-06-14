# Public Hazırlık

Bu repo public kullanıma uygun olacak şekilde hazırlanır, ama kapsamını dürüst
anlatmalıdır.

## Konumlandırma

- Community starter'dır, resmi OpenAI ürünü değildir.
- Güncel resmi Codex dokümantasyonuna dayalıdır.
- Lokal setup kitidir; managed enterprise policy ürünü değildir.
- Önce güvenli varsayılanlar gelir; hesap connector'larını kullanıcı bilinçli
  olarak açar.
- README ilk ekranında İngilizce ve Türkçe giriş noktaları, gerçek badge'ler,
  emoji aksanları ve public-safe animasyonlu SVG görseller bulunur.
- Senior çalışma standartları [docs/best-practices.tr.md](best-practices.tr.md)
  içinde dokümante edilir.

## Public Kullanıcı Gereksinimleri

- Clone-and-run komutları herhangi bir klasörden çalışır.
- Windows PowerShell ve Bash/WSL installer vardır.
- Installer'lar non-mutating preview destekler: PowerShell `-WhatIf`, Bash
  `--dry-run`.
- Installer managed dosyaları replace etmeden önce backup alır.
- Directory replacement sadece yönetilen Codex/Agents target'larıyla sınırlıdır.
- Kullanıcı geçici `CODEX_HOME` ve `AGENTS_HOME` ile smoke test yapabilir.
- Local state, auth, session, memory, project trust veya private path
  yayınlanmaz.
- Authenticated MCP'ler kullanıcı bilinçli açana kadar disabled kalır.
- `package.json` içinde `private: true` kalır; yanlışlıkla npm publish engellenir.
- README görselleri `assets/` altında tutulur, accessible SVG metadata'sı ve
  reduced-motion fallback'li hafif motion içerir; private screenshot, sahte
  metrik veya lisanssız medya kullanılmaz.
- GitHub issue ve pull request template'leri public-safe hatırlatmalar içerir.
- Dependabot, GitHub Actions ve npm manifest update PR'ları için ayarlıdır.
- Installable skill kaynakları `npm run verify:skills` ile offline kontrol
  edilir, `catalog/skills-lock.json` içinde kilitlenir ve publication öncesi
  `npm run verify:skills:online` ile online çözdürülebilir.

## Maintainer Gereksinimleri

Push öncesi:

```bash
npm run check
git status --short
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Push sonrası:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

Hash'ler aynı olmalı ve release notes oluşturmadan önce GitHub Actions run
başarılı olmalıdır.
