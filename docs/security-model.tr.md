# Güvenlik Modeli

Bu starter, Codex'i güçlendirirken temel güvenlik modelini zayıflatmamak için
hazırlandı.

## Varsayılanlar

- `sandbox_mode = "workspace-write"` ile yazma erişimi çalışma alanıyla sınırlı
  kalır.
- `approval_policy = "on-request"` ile yetki yükseltmeleri kullanıcı onayına
  bağlıdır.
- Agent internet erişimi varsayılan olarak kapalıdır.
- Kimlik doğrulama isteyen remote connector'lar örnek olarak durur ama disabled
  gelir.
- Komut kuralları dar kapsamlıdır: ağırlık read-only keşif ve lokal doğrulama
  komutlarındadır.

## Silme Onayi

Silme, cleanup, prune, uninstall, overwrite, database drop/truncate ve benzer
destructive islemler acik kullanici onayi ister. Destructive kisim beklerken
guvenli non-destructive isler devam edebilir.

## MCP Sınırları

MCP sunucuları shell sandbox dışında araçlar sunabilir. Bu yüzden özellikle
private account, production veri veya database erişimi veren connector'lar
dikkatli kullanılmalıdır.

Bu starter'ın yaklaşımı:

- OpenAI Docs ve Context7 dokümantasyon odaklı varsayılanlardır.
- Playwright ve Chrome DevTools lokal browser doğrulaması içindir.
- GitHub, Figma, Linear, Notion, Sentry, Vercel ve Supabase kullanıcı bilinçli
  olarak etkinleştirene kadar disabled kalır.
- Token ve credential değerleri repo dosyalarına değil environment variable
  olarak verilmelidir.
- Dış sistemlere yazabilecek araçlarda onay tercih edilmelidir.

Ek MCP flag kurali:

- Read-only dokumantasyon MCP'leri `default_tools_approval_mode = "approve"`
  kullanabilir; browser, account, filesystem, database, production ve mutating
  tool'lar `"prompt"` kullanmalidir.
- Yeni MCP server eklenirken sadece prose'a guvenme; `enabled_tools`,
  `disabled_tools`, `startup_timeout_sec` ve `tool_timeout_sec` gibi dar config
  flagleri tercih edilmelidir.

Resmi kaynak: https://developers.openai.com/codex/mcp

## Rules

`templates/codex/rules/default.rules` şu işlemleri prompt'a bağlı bırakır:

- yıkıcı dosya işlemleri
- geniş shell wrapper'ları
- dependency install
- package publish
- GitHub API işlemleri
- git commit, push, reset, checkout ve restore
- allowlist dışındaki ad-hoc `npx` çalıştırmaları

Resmi kaynak: https://developers.openai.com/codex/rules

## Hooks

Hooks faydalı lifecycle guardrail sağlar ama tek güvenlik sınırı olarak
görülmemelidir. Non-managed hook'lar çalışmadan önce kullanıcı tarafından
review/trust edilmelidir.

Resmi kaynak: https://developers.openai.com/codex/hooks

## Git Hijyeni

Global Git guard kurulumu opsiyoneldir çünkü kullanıcının global Git ayarlarını
değiştirir. Kurulursa:

- bariz secret ve build-output pathlerini ignore eder
- Gitleaks varsa çalıştırır
- `.env`, `.pem`, `.key`, `.pfx` gibi dosyaların staged olmasını engeller

Hook dosya silmez; sadece commit'i durdurur.

## Asla Eklenmemesi Gerekenler

- Codex sessions veya memories
- `.env` dosyaları
- private key veya signing material
- auth dosyaları, cookie'ler, token cache'leri
- lokal database dump'ları
- installer ve release archive'ları
- screenshot, log, report ve build output

## Dış Hesap İşlemleri

Bu repo GitHub, Supabase, Vercel veya Sentry gibi servisler için güvenli setup
dokümante edebilir. Ancak repository protection açmak, key rotate etmek,
billing/deploy/publish gibi işlemler ayrı açık kullanıcı onayı ve hesap context'i
gerektirir.
