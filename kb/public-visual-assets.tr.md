# Public Görsel Asset'ler

Screenshot, diagram, social preview veya README görseli eklemeden önce bu
makaleyi kullan.

## Mevcut Public Asset'ler

- `assets/icon.svg`
- `assets/banner.svg`
- `assets/workflow-overview.svg`
- `assets/social-preview.svg`
- `assets/social-preview.png`

PNG social preview `1280x640` olarak doğrulanır ve 1 MB altında kalmalıdır.
SVG asset'lerde title, description, hafif motion ve reduced-motion fallback
bulunmalıdır.

## Screenshot Kuralı

Screenshot sadece bilinçli public dokümantasyon asset'i ise commit edilir.
Şunları içermemelidir:

- gerçek kullanıcı adı, local path, token, log, session veya memory içeriği
- private browser tab'leri, account'lar, tenant adları veya repo secret'ları
- makineye özel state içeren raw failing trace veya terminal çıktısı

Generated screenshot, Playwright report, lokal trace ve review scratch
artifact'leri maintainer açıkça public asset olarak onaylamadıkça ignored
kalmalıdır.

## Doğrulama

```bash
npm run validate
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```
