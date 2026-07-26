# Sürüm Notları

Bu sayfa kullanıcıların şimdi kurması gereken sürümü anlatır. Eski mühendislik geçmişi [CHANGELOG.md](../CHANGELOG.md) içinde korunur; böylece public sürüm rehberi büyüyen bir arşive dönüşmeden güncel kalır.

## v0.5.57 - 2026-07-26

Codex Chef 0.5.57; kurulum, skill, MCP ve durum ekranlarını makinede gerçekten bulunan kurulumla uyumlu hâle getirir. Ayrıca proje, hedef, bilgi, karar ve memory koordinasyonu için canonical Brain control workspace'i ekler.

### Neler Değişti?

- Etkileşimli tam kurulumdan önce sıfırdan, eksik, güncel, drift içeren ve geçersiz skill bulunan kurulum durumlarını ayırır.
- Sıfırdan kurulumu yazılı `APPLY` onayından önce gösterir, eksiksiz ve güncel kurulumda yeniden kurmadan başarılı biçimde sonlanır, managed drift'i yedekli onarım akışına yönlendirir.
- Curated skill'leri gerçek bir `SKILL.md` ile doğrulayıp hazır, eksik veya geçersiz olarak etiketler; kullanıcının ayrıca kurduğu skill'leri korur.
- Kurulu MCP config durumunu katalog varsayımlarından ayırır; açık, kapalı, yapılandırılmamış ve kullanıcı tarafından eklenmiş bağlayıcıları canlı sağlık iddiasında bulunmadan gösterir.
- Normal durum panosunu kısa tutar; MCP kayıtlarının tamamı, yönlendirme, context bütçesi, kurulum notları, hedef/ortam ve log kanıtları `--details` ile açılır.
- Onay/hesap rehberi sayılarını düzeltir ve Chef yazılı onayı aldıktan sonra force refresh içinde açılan ikinci onayı kaldırır.
- İki dilli canonical Brain workspace'i; Obsidian control canvas'larını, dashboard'u ve yapılandırılmış proje, hedef, bilgi, karar, kişisel, memory ve arşiv yüzeylerini ekler.
- Windows/Bash geçici home, idempotence, CLI transcript, Türkçe, dokümantasyon, paket, güvenlik ve release regression kapsamını genişletir.

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

Kurulumdan önce ve sonra durumu dikkate alan ekranları kullan:

```bash
npm run chef -- --skills
npm run chef -- --mcp
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
