# Sürüm Notları

Bu sayfa kullanıcıların şimdi kurması gereken sürümü anlatır. Eski mühendislik geçmişi [CHANGELOG.md](../CHANGELOG.md) içinde korunur; böylece public sürüm rehberi büyüyen bir arşive dönüşmeden güncel kalır.

## v0.5.62 - 2026-08-07

Codex Chef 0.5.62, ilgisiz untracked lokal dosyalar varken normal update
akışını tek onaylı çalışmada tamamlar.

### Neler Degisti?

- İlgisiz untracked dosyalar update sırasında korunur; üzerine yazılabilecek
  tracked veya staged worktree değişiklikleri ise hâlâ engellenir.
- Progress bar, kaynak fast-forward, tam validation, backup'lı managed refresh
  ve kurulu runtime doğrulaması aynı akışta kalır.
- Worktree kararı için regression testi eklenir ve repo check zincirine alınır.

## v0.5.61 - 2026-08-07

Codex Chef 0.5.61, tasinabilir profil baslaticisi test fixture'inin Linux
dogrulama yolunu geri yukler.

### Neler Degisti?

- Unix sahte launcher fixture'inda Codex config override'larini Node option
  terminator'undan sonra iletir; boylece GitHub Actions dogrulamasinda `-c`,
  Node `--check` bayragi olarak yorumlanmaz.

## v0.5.60 - 2026-08-07

Codex Chef 0.5.60, yerel connector veya surec kontrol yetkisini genisletmeden
farkli PC'lerdeki runtime yolunu guclendirir.

### Neler Degisti?

- Codebase Memory baslangicini ayrilmis cache ile onarir; full ve multi-session
  MCP durumlari icin allowlist kullanan tasinabilir profil baslaticisi ekler.
- Codebase Memory paketi dogrudan calistirilsa bile prompt-gated sinirini korur;
  beklenmeyen Chef CLI hatalarini ortak redakte hata sozlesmesine yonlendirir.
- Forge edilebilir SessionEnd worker snapshotlarini tek kullanimlik yerel state
  dosyalariyla degistirir; tam kimlik ve owner-chain kontrollerini korur.
- Control-managed routing icin ayri kurulu router skill'i ve etkin Control MCP'yi
  birlikte zorunlu tutar.

### Uyumluluk

- Node.js 18 veya yeni
- Windows PowerShell, macOS, Linux ve WSL
- Kullaniciya ait config, skill, connector ve plugin dosyalari normal prune
  davranisinin disinda kalir.

## v0.5.59 - 2026-07-29

Codex Chef 0.5.59, yetenekleri kaldırmadan gereksiz lokal MCP başlangıçlarını
azaltır; böylece beş veya altı eşzamanlı Codex oturumu daha kontrollü çalışır.
Ayrıca stale MCP ağaçları için sahiplik farkındalıklı denetim ve fail-closed
temizlik yolu ekler.

### Neler Değişti?

- Dengeli ana config'i üç tamamlayıcı MCP'ye indirir:
  `openaiDeveloperDocs`, `context7` ve `serena`. Örtüşen beş lokal stdio
  yardımcısı tanımlı ama kapalı kalır.
- Yetenek ağırlıklı tek ana oturum için `full.config.toml`, düşük süreçli ikincil
  oturumlar için `multi-session.config.toml` ekler. Agent, skill, uzak OpenAI
  docs, built-in memory, hook ve app yüzeyleri kullanılabilir kalır.
- Düz Node/Python sayımı yerine aktif Codex sahibini, mantıksal MCP
  instance'ını, yardımcı ağacı, bekleme süresini, eski sahipsiz adayı ve ilgisiz
  runtime'ı ayıran schema-v2 denetim getirir.
- Ön izleme öncelikli stale cleanup ekler. Durdurmadan hemen önce tam PID,
  oluşturulma zamanı, MCP imzası ve aktif Codex sahibi bulunmadığını yeniden
  doğrular; eksik metadata ve PID yeniden kullanımı fail-closed kalır.
- Trust-gated tek bir plugin `SessionEnd` hook'u ekler. Yalnız biten Codex
  sahibinin MCP alt süreçlerini yakalar, 45 saniye bekler ve sahip zinciri
  kaybolduktan sonra tam eşleşen süreçleri durdurur.
- Yeni sınır için odaklı regresyon testleri, security allowlist'leri,
  installer/package kontrolleri, ADR-003 ve eksiksiz İngilizce/Türkçe operatör
  rehberi ekler.

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
npm run chef -- --processes --no-log
npm run chef -- --status --details
```

Ardından Codex'i yeniden başlat, `/hooks` ekranında tam process-hygiene
kaynağını inceleyip güven ve kurulu runtime'ı doğrula:

```bash
npm run verify:install:runtime
npm run codex:status
```

Eşzamanlı çalışmada tek normal veya `full` ana oturum bırak; ikincil pencereleri
şöyle başlat:

```bash
codex --profile multi-session
```

### Uyumluluk

- Node.js 18 veya üzeri
- Windows PowerShell, macOS, Linux ve WSL
- Kullanıcıya ait mevcut skill, MCP, profil tercihi, özel config tablosu ve ilgisiz plugin dosyaları normal prune davranışının dışında kalır
