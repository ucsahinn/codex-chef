# Public Hazırlık

Bu repo public kullanıma uygun olacak şekilde hazırlanır, ama kapsamı dürüst
şekilde anlatılmalıdır.

## Konumlandırma

- Community starter'dır, resmi OpenAI ürünü değildir.
- Resmi Codex dokümantasyonuna dayalıdır.
- Lokal setup kitidir; managed enterprise policy ürünü değildir.
- Önce güvenli varsayılanlar gelir; hesap connector'larını kullanıcı bilinçli
  olarak açar.
- README ilk ekranında İngilizce ve Türkçe giriş noktaları, gerçek badge'ler,
  emoji aksanları ve public-safe animasyonlu SVG görseller bulunur.

## Public Kullanıcı Gereksinimleri

- Clone edip herhangi bir klasörden çalıştırılabilir.
- Windows PowerShell ve Bash/WSL installer vardır.
- Installer yönetilen dosyaları değiştirmeden önce backup alır.
- Kullanıcı gerçek setup'a dokunmadan geçici `CODEX_HOME` ve `AGENTS_HOME` ile
  smoke test yapabilir.
- Lokal state, auth, session, memory, project trust veya private path
  yayınlanmaz.
- Authenticated MCP'ler kullanıcı açana kadar disabled kalır.
- `package.json` içinde `private: true` kalır; yanlışlıkla npm publish
  engellenir.
- README görselleri `assets/` altında tutulur, erişilebilir SVG metadata'sı ve
  reduced-motion fallback'li hafif motion içerir; private screenshot, sahte
  metrik veya lisanssız medya kullanmaz.
- GitHub issue ve pull request template'leri public-safe hatırlatmalar içerir;
  faydalı yerlerde iki dilli bağlam verir.
- Dependabot, GitHub Actions ve npm manifest güncelleme PR'ları için ayarlıdır.

## Maintainer Gereksinimleri

Push öncesi:

```bash
npm run check
git status --short
git diff --cached --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Push sonrası:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
```

İki hash aynı olmalıdır.
