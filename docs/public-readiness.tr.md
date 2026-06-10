# Public Hazırlık

Bu repo public kullanıma uygun olacak şekilde hazırlanır, ama kapsamı dürüst
şekilde anlatılmalıdır.

## Konumlandırma

- Community starter'dır, resmi OpenAI ürünü değildir.
- Resmi Codex dokümantasyonuna dayalıdır.
- Lokal setup kitidir; managed enterprise policy ürünü değildir.
- Önce güvenli varsayılanlar gelir; hesap connector'larını kullanıcı bilinçli
  olarak açar.

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
