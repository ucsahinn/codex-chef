# MCP Kataloğu

Makine tarafından okunabilir liste için `catalog/mcp-servers.json` dosyasına bak.

Resmi kaynak:

https://developers.openai.com/codex/mcp

## Varsayılan Açık

| Server | Amaç | Not |
| --- | --- | --- |
| `openaiDeveloperDocs` | Resmi OpenAI developer docs | Streamable HTTP |
| `context7` | Güncel library/framework dokümanları | `npx` üzerinden stdio |
| `sequential-thinking` | Yapılandırılmış düşünme/decomposition | Lokal stdio helper |
| `playwright` | Browser otomasyonu ve UI doğrulama | Lokal browser kontrolü |
| `chrome-devtools` | Chrome inspection ve audit | Isolated, network header redacted |
| `serena` | Semantic code navigation | `uvx` gerekir |
| `memory` | Lokal memory graph | Secret yazma |

## Gerektiğinde Aç

| Server | Amaç | Neden disabled |
| --- | --- | --- |
| `github` | GitHub issue/PR/repo | Dış hesap erişimi |
| `figma` | Figma design context | Workspace auth gerekir |
| `linear` | Linear issue/project | Dış workspace aksiyonları |
| `notion` | Notion docs/database | Private workspace verisi |
| `sentry` | Production error data | Hassas operasyonel veri |
| `vercel` | Deploy/project yönetimi | Production/billing etkisi olabilir |
| `supabase` | Database erişimi | Credential ve veri erişimi |

Kural: Dokümantasyon MCP'leri iyi varsayılandır. Auth isteyen MCP'ler görev
gerektirmeden ve kullanıcı onayı olmadan açılmamalıdır.
