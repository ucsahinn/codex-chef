# Sürüm Notları

Bu sayfa kullanıcıların şimdi kurması gereken sürümü anlatır. Eski mühendislik geçmişi [CHANGELOG.md](../CHANGELOG.md) içinde korunur; böylece public sürüm rehberi büyüyen bir arşive dönüşmeden güncel kalır.

## v0.5.55 - 2026-07-26

Codex Chef 0.5.55, renkli operatör CLI'ını daha kolay okunur hale getirir, aynı sürümün gereksiz yere yeniden kurulmasını önler ve Windows Codex CLI komut-token farklılıklarında installer preflight uyumluluğunu düzeltir.

### Neler Değişti?

- Temel CLI ekranları varsayılan olarak kısaltıldı; tam tablo, kurulum notu ve tanılama kanıtları için `--details` eklendi.
- Güncelleme akışına yerel ve uygun sürümü gösteren görünür ilerleme çubuğu eklendi.
- Sürümler aynıysa update artık onay, doğrulama, kurulum veya managed dosya yazımı yapmadan duruyor.
- Yeni sürüm varsa tek fetch yapılıyor, incelenen package sürümü karşılaştırılıyor ve aynı fetched commit fast-forward ediliyor.
- Başarılı alt komutların kalabalık çıktıları lokal loglarda tutuluyor; hata halinde tam sorun giderme çıktısı gösterilmeye devam ediyor.
- Preview, install, refresh, skills, MCP, routing, diagnostics, backup ve log ekranlarının yoğunluğu azaltıldı.
- Codex'in exact read-only PowerShell probunu tek komut tokenı olarak normalize ettiği PC'lerde installer preflight hatası düzeltildi.
- Kompakt ve ayrıntılı CLI görünümleriyle iki Windows PowerShell token biçimi için regresyon kapsamı eklendi.

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

Tam kanıt tabloları gerektiğinde `--details` kullan:

```bash
npm run chef -- --status --details
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
