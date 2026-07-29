# Sürüm Notları

Bu sayfa kullanıcıların şimdi kurması gereken sürümü anlatır. Eski mühendislik geçmişi [CHANGELOG.md](../CHANGELOG.md) içinde korunur; böylece public sürüm rehberi büyüyen bir arşive dönüşmeden güncel kalır.

## v0.5.58 - 2026-07-29

Codex Chef 0.5.58; güvenlik sınırları net Fetch, SEO ve Evidence Research workflow'larını ekler, managed skill kurulumunu ve CLI hata sözleşmelerini güçlendirir, Windows ile macOS davranışını bozmadan Ubuntu/Node.js 18 taşınabilirlik kapısını yeniden yeşile taşır.

### Neler Değişti?

- Yalnız açıkça çağrılan `$fetch` workflow'uyla yetkili bir referans siteyi gerçek browser kanıtından yeniden kurar; public-passive varsayımlar, pasif authentication, prompt-injection ve SSRF sınırları, yasal asset kullanımı, sıfır-egress lokal çıktı ve deterministik rapor doğrulaması uygular.
- Upstream SEO referansının yerine lokal, rendered, deployed, field ve account kanıtlarını ayıran; teknik, içerik, uluslararası ve lokal SEO raporlarını iddia güvenliği açısından doğrulayan Chef-owned `$seo` workflow'unu getirir.
- Kapsamlı arama, eleme, kaynak değerlendirme, claim seviyesinde izlenebilirlik, görüş ayrılığı ve belirsizlik sentezi, tekrarlanabilirlik ve etik karar paketleri için `$evidence-research` ekler.
- Fetch, SEO ve Evidence Research'ü canonical plugin kaynağından managed direct skill olarak kurar; çakışmada fail-closed davranış, skill bazında açık sahiplenme, yedekli değiştirme, rollback doğrulaması ve runtime parity kontrolü uygular.
- Daha önce kurulmuş Codex Chef plugin'inin eski versioned cache'ini installer, update ve repair apply akışlarında yerinde yeniler, aktif sürümü doğrular ve hiç kurulmamış plugin'i kurmadan bırakır.
- Commit-pinned skill kurulumunu exact native-tree hash'i, provenance-aware managed upgrade, yabancı hedefi koruma, zorunlu yedek ve çalışan full-history fetch desteğiyle güçlendirir.
- Chef, status, routing, doctor, Brain, external-review, release-note ve pinned-skill CLI'ları boyunca sanitize edilmiş ortak plain/JSON hata sözleşmesi ve gerçeğe uygun sonuç makbuzları ekler.
- Token bütçesi tanılarını, external-review containment'ını, credential-path taramasını, MCP/runtime katalog uyumunu, onay sınırlarını, installer kontrollerini ve supply-chain doğrulamasını sıkılaştırır.
- Forced-color smoke testlerinden çelişkili `NO_COLOR` aktarımını kaldırır; böylece Node.js 18 uyarısı Ubuntu'daki 72 sütun taşınabilirlik kontrolünü artık bozmaz.

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
