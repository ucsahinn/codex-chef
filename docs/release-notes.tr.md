# Sürüm Notları

Bu sayfa kullanıcıların şimdi kurması gereken sürümü anlatır. Eski mühendislik geçmişi [CHANGELOG.md](../CHANGELOG.md) içinde korunur; böylece public sürüm rehberi büyüyen bir arşive dönüşmeden güncel kalır.

## v0.5.56 - 2026-07-26

Codex Chef 0.5.56, read-only PowerShell wrapper komutlarını sınıflandırmayan eski Windows Codex CLI sürümlerinde installer preflight işleminin gereksiz yere durmasını önler.

### Neler Değişti?

- Approval doğrulamasında kullanılan exact read-only PowerShell wrapper probları için yalnız `allow` veya uyumluluk `no-match` sonucu kabul ediliyor.
- Doğrudan `Get-Content` komutunun `allow` dönmesi hâlâ zorunlu.
- `Remove-Item` gibi destructive PowerShell wrapper komutlarının `prompt` dönmesi hâlâ zorunlu.
- Eski wrapper sınıflandırma davranışı kurulumu durdurmak yerine görünür bir uyarı olarak raporlanıyor.
- İlk kurulum ve mevcut kurulumu uzlaştırma akışları, yazma, credential, publish ve destructive onay sınırlarını zayıflatmadan çalışıyor.

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
