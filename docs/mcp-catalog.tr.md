# MCP Kataloğu

[English](mcp-catalog.md) | [Türkçe](mcp-catalog.tr.md)

MCP'ler Codex'e ek araç veya canlı bağlam verir: güncel dokümantasyon, browser
kanıtı, semantic code navigation, özel hesap verileri ya da veritabanı erişimi
gibi. Bu yüzden çok kullanışlılar ama her birinin sınırı açık olmalı.

Codex Chef toplam 16 MCP tanıyor. Okuma ağırlıklı sekiz yardımcı starter
config'inde açık gelir. Hesap, veritabanı veya geniş dosya sistemi erişimi
isteyen diğer sekiz connector ise gerçekten ihtiyacın olana kadar kapalı kalır.

> **Config'de görünmesi çalıştığı anlamına gelmez.** Bir MCP template'te yer
> aldığı hâlde launcher, ilk açılışta paket indirme, browser, hesap onayı veya
> Codex restart'ı bekliyor olabilir. Kullanmadan önce `codex mcp list` ya da
> `/mcp` ile kontrol et.

[Resmî Codex MCP rehberi](https://developers.openai.com/codex/mcp) ·
[MCP spesifikasyonu](https://modelcontextprotocol.io/specification) ·
[Makine tarafından okunan katalog](../catalog/mcp-servers.json)

## Starter Config'inde Hazır Gelenler

| MCP | Ne için kullanıyorum? | Neye ihtiyaç duyuyor? |
| --- | --- | --- |
| [`openaiDeveloperDocs`](https://developers.openai.com/mcp) | Güncel OpenAI geliştirici dokümantasyonu | Ek bir şeye ihtiyaç duymaz |
| [`context7`](https://github.com/upstash/context7) | Güncel kütüphane ve framework dokümantasyonu | Node/npx ve ilk açılışta internet |
| [`sequential-thinking`](https://github.com/modelcontextprotocol/servers) | Karmaşık işi anlaşılır adımlara ayırmak | Node/npx ve ilk açılışta internet |
| [`playwright`](https://github.com/microsoft/playwright-mcp) | Browser snapshot, screenshot, console ve network kanıtı | Node/npx ve yerel browser kontrolü |
| [`chrome-devtools`](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Chrome incelemesi ve UI teşhisi | Node/npx ve izole Chrome köprüsü |
| [`serena`](https://github.com/oraios/serena) | Bilmediğin repoda sembol seviyesinde kod gezintisi | `uvx` ve sabitlenmiş Serena kaynağı |
| [`memory`](https://github.com/modelcontextprotocol/servers) | Küçük ve gizli olmayan yerel hafıza grafiği | Node/npx; secret saklama |
| [`codebase-memory`](https://github.com/DeusData/codebase-memory-mcp) | Mimari, graph search, akış ve değişiklik etkisi | Node/npx; index ve admin araçları kontrollü kalır |

Bir MCP'nin açık olması browser etkileşimi, memory write, indexleme veya sembol
düzenleme gibi bütün araçlarının sessizce onaylandığı anlamına gelmez.
Template'ler incelenmiş okuma araçlarını sınırlar; daha geniş işlemleri onaya
bırakır veya kapalı tutar.

Makinede `uvx` yoksa Serena açılmaz. Bu yerel bir ön koşuldur; kurulumun geri
kalanını gevşetmek yerine ihtiyacın olduğunda ön koşulu ayrıca kurabilir ya da
Serena'yı o zamana kadar kapatabilirsin.

## İhtiyacın Olana Kadar Kapalı Kalanlar

| MCP | Neye erişebilir? | Neden kapalı başlıyor? |
| --- | --- | --- |
| [`filesystem`](https://github.com/modelcontextprotocol/servers) | Yerel bir klasör ağacı | İzin verilen kökü bilinçli seçmek gerekir |
| [`github`](https://docs.github.com/en/copilot) | Repo, issue ve PR bağlamı | GitHub/Copilot hesap onayı gerekir |
| [`figma`](https://help.figma.com) | Özel tasarım dosyaları ve workspace bağlamı | Figma hesap onayı gerekir |
| [`linear`](https://linear.app/docs) | Özel issue ve projeler | Linear workspace onayı gerekir |
| [`notion`](https://developers.notion.com) | Özel doküman ve veritabanları | Notion workspace onayı gerekir |
| [`sentry`](https://docs.sentry.io) | Production hata ve telemetri verileri | Sentry organizasyon onayı gerekir |
| [`vercel`](https://vercel.com/docs) | Proje ve deployment verileri | Vercel hesap veya takım onayı gerekir |
| [`supabase`](https://github.com/modelcontextprotocol/servers) | Bir veritabanı bağlantısı | Göreve özel bağlantı adresi ve açık onay gerekir |

Sadece işin gerçekten istediği connector'ı aç. Örneğin:

```toml
[mcp_servers.github]
enabled = true
default_tools_approval_mode = "approve"
```

Filesystem için erişilecek yeri mümkün olan en dar workspace olarak belirle:

```toml
[mcp_servers.filesystem]
enabled = true
args = ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem@2026.1.14", "."]
default_tools_approval_mode = "prompt"
```

Buradaki `.` Codex işleminin çalışma klasörüdür. Görev bütün workspace'i
görmemeliyse daha dar ve açık bir absolute path kullanmak daha güvenlidir.

Supabase credential'ı bu repoya veya commit edilen bir launcher'a değil, shell
ortamına aittir:

```powershell
$env:SUPABASE_DB_URL = "<repo dışında ayarla; commit etme>"
```

## Koruduğum Sınır

- Dokümantasyon ve salt-okunur reasoning yardımcıları kullanışlı varsayılanlar
  olabilir.
- Browser etkileşimi, memory write, kod düzenleme ve graph indexleme onaylı ya
  da dar allowlist'li kalır.
- Hesap, veritabanı, production ve geniş dosya sistemi erişimi; görev gerçekten
  isteyip kullanıcı onay verene kadar kapalıdır.
- Credential'lar commit edilen config'e değil, environment variable'a veya
  connector'ın kendi OAuth akışına gider.
- Config değişince Codex'i yeniden başlatıp `/mcp` veya `codex mcp list` ile
  sonucu kontrol et.

Büyük resmi görmek için [agent kataloğuna](agents.tr.md), [skill
kataloğuna](skills.tr.md) ve [workflow yüzey
haritasına](workflow-surface-map.tr.md) geçebilirsin.
