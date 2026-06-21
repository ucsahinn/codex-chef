# MCP Katalogu

Makine tarafindan okunabilir liste icin `catalog/mcp-servers.json` dosyasina
bak. `npm run check`, bu katalog ile Windows/Unix Codex config template'lerinin
ayni hizada kaldigini dogrular.

Katalog `setupKind` ve `setupHint` alanlarini da tutar. Installer,
`npm run codex:status` ve `npm run chef -- --mcp`, lokal tooling, OAuth,
filesystem path veya environment variable isteyen MCP'leri bu notlarla
gosterir.

Status kaniti bilincli olarak ayrilir:

- `cataloged`: `catalog/mcp-servers.json` icinde var.
- `installed config`: kurulu veya template Codex config icinde var.
- `live codex mcp list`: `codex mcp list --json` ile dogrulandi.
- `/mcp session visible`: aktif Codex oturumunda `/mcp` ile gorunur.

Bir connector'u sadece catalog'da var diye live kabul etme; live komut veya
`/mcp` bunu dogrulamalidir.

Varsayilan acik olmak, Codex Chef'in server config'ini yazdigi ve launcher'in
makinede olmasini bekledigi anlamina gelir; mevcut makinede live MCP session
oldugunun kaniti degildir. Node/npx tabanli default'lar pinned package'lar icin
Node ve ilk calismada network ister. Serena ayrica `uvx` ister; fresh machine'de
`uvx` yoksa Serena'yi disable et veya status notunu repo hatasi degil setup
onkosulu olarak ele al.

Resmi kaynak:

https://developers.openai.com/codex/mcp

Resmi MCP specification:

https://modelcontextprotocol.io/specification

MCP server'lar tool, resource ve prompt sunabilir. Her server'i bir capability
boundary olarak dusun: dokumantasyon server'lari dusuk riskli context saglar;
browser, filesystem, database, hesap, production, billing veya deploy
server'lari daha guclu approval default'u ve daha dar tool exposure ister.

Npm tabanli tum MCP package spec'leri hem `catalog/mcp-servers.json` hem de
`templates/codex/config.*.toml` icinde exact version ile pinlenir. Floating
`@latest` spec'leri ve unversioned `npx -y` MCP package'lari `npm run check`
tarafindan reddedilir. Serena gibi `uvx --from` kullanan git-based MCP
launcher'lar full commit SHA ve matching catalog `sourceRef` icermelidir.

## Varsayilan Acik

| Server | Amac | Startup onkosulu |
| --- | --- | --- |
| `openaiDeveloperDocs` | Resmi OpenAI developer docs | Streamable HTTP; lokal launcher yok |
| `context7` | Guncel library/framework dokumanlari | Node/npx first-run package download |
| `sequential-thinking` | Yapilandirilmis dusunme/decomposition | Node/npx first-run package download |
| `playwright` | Browser otomasyonu ve UI dogrulama | Node/npx ve lokal browser kontrolu |
| `chrome-devtools` | Chrome inspection ve audit | Node/npx ve isolated Chrome/DevTools bridge |
| `serena` | Semantic code navigation | `uvx` ve pinned git source ref; yoksa disable et |
| `memory` | Lokal memory graph | Node/npx; secret yazma |

## Gerektiginde Ac

| Server | Amac | Acmadan once gereken setup |
| --- | --- | --- |
| `filesystem` | Lokal filesystem erisimi | Config args icinde bilincli ve dar bir root path sec. |
| `github` | GitHub issue/PR/repo | GitHub/Copilot OAuth hesap yetkilendirmesi. |
| `figma` | Figma design context | Figma hesap veya workspace yetkilendirmesi. |
| `linear` | Linear issue/project | Linear workspace yetkilendirmesi. |
| `notion` | Notion docs/database | Notion workspace yetkilendirmesi. |
| `sentry` | Production error data | Sentry organization yetkilendirmesi. |
| `vercel` | Deploy/project yonetimi | Vercel account veya team yetkilendirmesi. |
| `supabase` | Database erisimi | Acmadan once `SUPABASE_DB_URL` degerini repo disinda ayarla. |

## Opt-In Connector Tarifleri

OAuth isteyen account connector'lari icin once gorevin private account context'e
ihtiyaci oldugunu dogrula, sonra sadece gereken connector'u ac:

```toml
[mcp_servers.github]
enabled = true
default_tools_approval_mode = "prompt"
```

Rollback icin `enabled = false` yap ve Codex'i yeniden baslat.

Filesystem icin template path'i acmadan once en dar local root ile degistir:

```toml
[mcp_servers.filesystem]
enabled = true
args = ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem@2026.1.14", "C:\\Users\\you\\project"]
default_tools_approval_mode = "prompt"
```

Supabase icin database URL'ini repo disinda ayarla ve approval'i prompt tut:

```powershell
$env:SUPABASE_DB_URL = "<repo disinda ayarla; commit etme>"
```

Sonra sadece database inspection gereken task icin ac. Kalici workflow olarak
bilerek secmedikce is bitince tekrar disabled hale getir.

Kural: Dokumantasyon MCP'leri iyi varsayilandir. Auth isteyen MCP'ler gorev
gerektirmeden ve kullanici onayi olmadan acilmamalidir. Gorev enabled bir MCP
server ile eslesiyorsa stale memory veya tahmin yerine o server kullanilir.
Eslesen server disabled veya unavailable ise nedeni soylenir ve en guvenli
fallback ile devam edilir.

Connector state degismeden once `mcp_integrator` uzmani kullanilmalidir. Bu
uzman server adini, auth sinirini, approval mode'u, tool allowlist veya
denylist'ini, startup/tool timeout'unu, dogrulama komutunu ve rollback notunu
config degismeden once netlestirmelidir.

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
