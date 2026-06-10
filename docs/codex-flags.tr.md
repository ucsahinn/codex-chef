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
