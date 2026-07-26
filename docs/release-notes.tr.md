# Sürüm Notları

Bu sayfa kullanıcıların şimdi kurması gereken sürümü anlatır. Eski mühendislik geçmişi [CHANGELOG.md](../CHANGELOG.md) içinde korunur; böylece public sürüm rehberi büyüyen bir arşive dönüşmeden güncel kalır.

## v0.5.54 - 2026-07-26

Codex Chef 0.5.54, proje kapsamlı Brain kasasını ekler ve kullanıcıya ait yapılandırma sınırlarını zayıflatmadan renkli CLI, kurulum, güncelleme, yenileme ve onarım deneyimini tamamlar.

### Neler Değişti?

- Preview-first capture, proje kapsamlı retrieval, Markdown vault depolaması, schema, template, backup ve restore planları, Windows ACL kanıtı, dokümantasyon ve regresyon testleriyle Codex Chef Brain eklendi.
- Renkli U.C.S. operatör arayüzü daha net menü önemi, işlem etkisi, operasyon makbuzu, sürüm/commit kanıtı ve yeşil üçüncü imza rengiyle tamamlandı.
- İlk kurulum, mevcut kurulumu güvenli uzlaştırma, managed update, force refresh ve drift repair davranışları platformlar arasında açıkça ayrıldı.
- Normal update artık backup sonrasında Codex Chef'e ait dosyaları yenilerken kullanıcıya ait `config.toml` ayarlarını koruyor ve yalnız managed tabloları senkronluyor.
- Full install için önerilen public yol renkli CLI oldu; CLI içindeki `APPLY` onayından sonra ikinci bir nested confirmation açılmıyor.
- Installer, CLI, Brain, locale, portability, package ve release doğrulamaları genişletildi.

### Kurulum Veya Güncelleme

İlk kurulum:

```bash
npm run chef -- --install
npm run chef -- --install --apply
```

Mevcut kurulum:

```bash
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
```

Ardından Codex'i yeniden başlat ve kurulu runtime'ı doğrula:

```bash
npm run verify:install:runtime
npm run codex:status
```

### Uyumluluk

- Node.js 18 veya üzeri
- Windows PowerShell, macOS, Linux ve WSL
- Kullanıcıya ait mevcut skill, MCP, profil tercihi, özel config tablosu ve ilgisiz plugin dosyaları normal prune davranışının dışında kalır
