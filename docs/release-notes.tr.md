# Sürüm Notları

Bu sayfa, kullanıcıların şu anda kurması gereken sürümü anlatır. Eski mühendislik geçmişi [CHANGELOG.md](../CHANGELOG.md) içinde korunur; böylece public sürüm rehberi büyüyen bir arşive dönüşmeden güncel kalır.

## v0.5.53 - 2026-07-26

Codex Chef artık projeyi değerli kılan workflow’ları, güvenlik sınırlarını ve teknik geçmişi kaybetmeden daha küçük ve daha anlaşılır bir public yüzeye sahip.

### Neler Değişti?

- İngilizce, Türkçe, Almanca, İspanyolca, Fransızca ve Brezilya Portekizcesi için altı kısa, insan eliyle yazılmış README giriş noktası var.
- Tam operatör dokümantasyonu İngilizce ve Türkçe tutuluyor; üretilmiş çeviri kabukları artık tam rehbermiş gibi yayımlanmıyor.
- Eski completion-audit, local-audit ve SEO dokümanları kaldırıldı; faydalı bilgiler güncel dokümanlarda, bilgi tabanında, ajan corpus’unda ve changelog’da korunuyor.
- Public README, yönetim, gizlilik, destek, yayın, GitHub ayarları ve hazırlık rehberleri doğrudan ve doğal bir dille yeniden yazıldı.
- Dil, güvenlik, paket, token, workflow, doctor ve release validator’ları daha küçük dokümantasyon sözleşmesini güvenlik kapılarını zayıflatmadan uyguluyor.
- Token bütçesi denetimi, temel yetenekleri koruyan isteğe bağlı `token-safe.config.toml` profili ve otomatik ajan `model/reasoning` mirası public giriş noktalarında açıklanıyor.
- GitHub Releases desteklenen sürüm çizgisinde toplandı; geçmişteki tüm Git tag’leri ve commit’ler korundu.

### Güncelleme

Ön izleme öncelikli akışı kullan:

```bash
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
```

Ardından Codex’i yeniden başlat ve kurulu runtime’ı doğrula:

```bash
npm run verify:install:runtime
npm run codex:status
```

### Uyumluluk

- Node.js 18 veya üzeri
- Windows PowerShell, macOS, Linux ve WSL
- Kullanıcıya ait mevcut skill, MCP, profil tercihleri ve ilgisiz plugin dosyaları normal akışta prune edilmez
