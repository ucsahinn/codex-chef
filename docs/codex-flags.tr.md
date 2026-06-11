# Codex CLI Flagleri

Güncel kaynak:

https://developers.openai.com/codex/cli/reference

## Önemli Global Flagler

| Flag | Kullanım |
| --- | --- |
| `--cd`, `-C` | Codex'i belirli çalışma klasöründe başlatır. |
| `--model`, `-m` | Tek çalıştırma için modeli override eder. |
| `--ask-for-approval`, `-a` | Onay davranışını seçer: örnek `on-request`, `never`. |
| `--sandbox`, `-s` | `read-only`, `workspace-write`, `danger-full-access` seçer. |
| `--config`, `-c` | Tek invocation için config key override eder. |
| `--profile`, `-p` | `~/.codex/<profile>.config.toml` dosyasını base config üstüne bindirir. |
| `--add-dir` | Ek klasöre workspace yanında yazma erişimi verir. |
| `--image`, `-i` | İlk prompt'a görsel ekler. |
| `--search` | Live web search açar. |
| `--strict-config` | Bilinmeyen config alanında hata verir; template değişince iyi kontroldür. |
| `--enable` / `--disable` | Feature flag'i tek run için açar/kapatır. |
| `--oss` | Konfigüre edilmiş local open-source model provider'ı kullanır. |
| `--remote` | TUI'yi app-server endpoint'e bağlar. |
| `--remote-auth-token-env` | Remote bearer token'ı env var üzerinden okur. |
| `--dangerously-bypass-approvals-and-sandbox` | Normal lokal geliştirme için kullanma. |
| `--dangerously-bypass-hook-trust` | Sadece hook source dışarıda ayrıca doğrulanıyorsa. |

## Güvenli Başlangıçlar

İnteraktif çalışma:

```bash
codex --sandbox workspace-write --ask-for-approval on-request
```

Sadece review:

```bash
codex --sandbox read-only --ask-for-approval never
```

Config kontrolü:

```bash
codex --strict-config "Summarize the active setup."
```

`danger-full-access` ve bypass flagleri standart çözüm değildir. Sadece dışarıdan
izole edilmiş, atılabilir ortamda kullan.

## MCP Config Alanlari

MCP davranisi genelde tek seferlik CLI flaglerinden degil `config.toml`
alanlarindan yonetilir.
Gorev bu alanlardan birine denk geliyorsa alan bilerek kullanilir. Approval
policy, tool exposure, timeout veya auth source sadece prose'a birakilmaz.

| Alan | Kullanim |
| --- | --- |
| `enabled` | Server block'unu silmeden ac/kapat. |
| `default_tools_approval_mode` | Server geneli tool onayi: `approve`, `prompt` veya `auto`. |
| `enabled_tools` / `disabled_tools` | Belirli server icin allow-list veya deny-list. |
| `startup_timeout_sec` | Server baslama suresini sinirlar. |
| `tool_timeout_sec` | Tek tool cagrisinin suresini sinirlar. |
| `required` | Enabled server baslamazsa Codex startup'i fail eder; opsiyonel lokal tool'larda dikkatli kullan. |
| `bearer_token_env_var`, `env_vars`, `env_http_headers` | Secret'lari dosyadan degil environment variable'dan okur. |
| `mcp_oauth_callback_port`, `mcp_oauth_callback_url` | OAuth provider sabit callback istediginde kullan. |
