# Güvenlik Modeli

Bu setup, Codex'i güçlendirirken temel Codex güvenlik modelini zayıflatmamak
için tasarlandı.

## Varsayılanlar

- `sandbox_mode = "workspace-write"` yazma erişimini varsayılan olarak workspace
  içinde tutar.
- `approval_policy = "on-request"` yetki yükseltmelerini interaktif bırakır.
- Workspace-write sandbox içinde network erişimi kapalı kalır.
- `shell_environment_policy`, `inherit = "core"` kullanır ve default secret
  exclusion'ları açık tutar. Böylece subprocess'ler geniş lokal token
  environment'ını varsayılan olarak devralmaz.
- Auth isteyen remote connector'lar disabled örnekler olarak bulunur.
- Global command rule'ları dar kapsamlıdır ve read-only discovery ile lokal
  verification komutlarına ağırlık verir.
- Delete, cleanup, prune, uninstall, overwrite, database drop/truncate ve benzer
  destructive işlemler açık kullanıcı onayı ister.

## MCP Sınırları

MCP server'ları shell sandbox dışında tool sağlayabilir. Bu yüzden onları zararsız
dokümantasyon helper'ı gibi değil, güçlü connector boundary'leri gibi ele al.

Bu starter'ın kuralları:

- OpenAI Docs ve Context7 dokümantasyon odaklı default'lardır.
- Playwright ve Chrome DevTools lokal browser verification içindir.
- GitHub, Figma, Linear, Notion, Sentry, Vercel ve Supabase kullanıcı bilinçli
  olarak açana kadar disabled kalır.
- Token değerleri repo dosyalarından değil environment variable'lardan gelmelidir.
- External write-capable tool'lar prompt approval kullanmalıdır.
- Read-only documentation MCP'leri `default_tools_approval_mode = "approve"`
  kullanabilir; browser, account, filesystem, database, production ve mutating
  tool'lar `"prompt"` kullanmalıdır.
- Yeni MCP server eklerken `enabled_tools`, `disabled_tools`,
  `startup_timeout_sec` ve `tool_timeout_sec` gibi dar config flag'leri prose-only
  talimatlara tercih edilmelidir.
- `catalog/mcp-servers.json` her starter connector için source URL, auth mode,
  risk, approval mode ve default-enable gerekçesi tutar.

Resmi kaynak: https://developers.openai.com/codex/mcp

## Skill Kaynakları

Installable skill'ler hem `catalog/skills.json` hem de
`catalog/skills-lock.json` içinde temsil edilmelidir. Lock dosyası installer'ın
kullandığı exact package/skill çiftini ve install command'ı kaydeder. Default
gate bunu offline kontrol eder; maintainer publish hazırlığında
`npm run verify:skills:online` ile network-backed resolution çalıştırır.

## Rules

`templates/codex/rules/default.rules` hızlı read-only discovery ve project-native
verification komutlarına izin verir. Şunları prompt'a bağlar:

- destructive file operations
- deletion, cleanup, pruning, overwrite ve uninstall
- broad shell wrapper'ları
- dependency installation
- package publishing
- GitHub API operations
- git commit, push, reset, checkout ve restore
- exact allowlist dışındaki ad-hoc `npx` package execution

Resmi kaynak: https://developers.openai.com/codex/rules

## Hooks

Hooks lifecycle check için faydalıdır ama primary security boundary değildir.
Non-managed hook'lar çalışmadan önce kullanıcı tarafından review ve trust
edilmelidir.

Resmi kaynak: https://developers.openai.com/codex/hooks

## Git Hijyeni

Global Git guard'ları opsiyoneldir çünkü kullanıcının global Git default'larını
değiştirir. Kurulursa:

- bariz local secret ve build-output path'lerini ignore eder
- Gitleaks varsa çalıştırır
- `.env`, `.pem`, `.key`, `.pfx` gibi staged secret dosyalarını engeller

Hook konservatiftir ve dosya silmez.

## Asla Eklenmemesi Gerekenler

- Codex sessions veya memories
- `.env` dosyaları
- private key veya signing material
- auth files, cookies, token caches
- local database dump'ları
- installers ve release archive'ları
- generated screenshots, logs, reports ve build output

## External Account Actions

Repo GitHub, Supabase, Vercel veya Sentry için güvenli setup dokümante edebilir,
ama account-level aksiyonları otomatik yapmamalıdır. Repository protection açmak,
key rotate etmek, billing değiştirmek, deploy etmek veya publish yapmak ayrı
kullanıcı onayı ve account context'i gerektirir.
