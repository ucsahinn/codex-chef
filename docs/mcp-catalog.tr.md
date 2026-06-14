# MCP Kataloğu

Makine tarafından okunabilir liste için `catalog/mcp-servers.json` dosyasına bak.
`npm run check`, bu katalog ile Windows/Unix Codex config template'lerinin
aynı hizada kaldığını doğrular.

Resmi kaynak:

https://developers.openai.com/codex/mcp

Resmi MCP specification:

https://modelcontextprotocol.io/specification

MCP server'lar tool, resource ve prompt sunabilir. Her server'i bir capability
boundary olarak dusun: dokumantasyon server'lari dusuk riskli context saglar;
browser, filesystem, database, hesap, production, billing veya deploy server'lari
daha guclu approval default'u ve daha dar tool exposure ister.

Npm tabanli tum MCP package spec'leri hem `catalog/mcp-servers.json` hem de
`templates/codex/config.*.toml` icinde exact version ile pinlenir. Floating
`@latest` spec'leri ve unversioned `npx -y` MCP package'lari `npm run check`
tarafindan reddedilir. Serena gibi `uvx --from` kullanan git-based MCP
launcher'lar full commit SHA ve matching catalog `sourceRef` icermelidir.

## Varsayılan Açık

| Server | Amaç | Not |
| --- | --- | --- |
| `openaiDeveloperDocs` | Resmi OpenAI developer docs | Streamable HTTP |
| `context7` | Güncel library/framework dokümanları | `npx` üzerinden stdio |
| `sequential-thinking` | Yapılandırılmış düşünme/decomposition | Lokal stdio helper |
| `playwright` | Browser otomasyonu ve UI doğrulama | Lokal browser kontrolü |
| `chrome-devtools` | Chrome inspection ve audit | Isolated, network header redacted |
| `serena` | Semantic code navigation | Pinned git source ref ile `uvx` kullanir |
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
Gorev enabled bir MCP server ile eslesiyorsa stale memory veya tahmin yerine o
server kullanilir. Eslesen server disabled veya unavailable ise nedeni soylenir
ve en guvenli fallback ile devam edilir.

## Tercih Edilecek Config Flagleri

| Config alani | Kullanim |
| --- | --- |
| `enabled` | Auth, database, production veya genis filesystem server'larini gerekene kadar kapali tutar. |
| `default_tools_approval_mode` | Read-only docs icin `approve`; browser, account, filesystem, database, production veya mutating tool icin `prompt`. |
| `enabled_tools` / `disabled_tools` | Server'i workflow icin gereken spesifik tool'larla sinirlar. |
| `startup_timeout_sec` | Stdio server'a baslama suresi verir ama Codex'i sonsuza kadar bekletmez. |
| `tool_timeout_sec` | Yavas browser, code-intelligence, docs veya external-account cagrisini sinirlar. |
| `bearer_token_env_var`, `env_vars`, `env_http_headers` | Credential'i commit edilen dosya yerine environment variable'dan okur. |
| `mcp_oauth_callback_port`, `mcp_oauth_callback_url` | OAuth provider sabit callback istiyorsa kullanilir. |

MCP config degisince Codex'i yeniden baslat ve tool'lara guvenmeden once `/mcp`
veya `codex mcp` ile aktif server'lari dogrula.
