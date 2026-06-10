# Kurulum Rehberi

Bu rehber starter paketini mevcut kullanıcının Codex home dizinine kurar.
Varsayılan konum `~/.codex` dizinidir. `CODEX_HOME` tanımlıysa installer bu
dizini kullanır.

## Gereksinimler

- Codex CLI veya Codex app.
- Git.
- Doğrulama ve isteğe bağlı skill kurulumu için Node.js 18 veya üzeri.
- Stdio MCP sunucuları veya skill kurulumu için `npx`.
- İsteğe bağlı: daha güçlü secret taraması için Gitleaks.
- Windows için isteğe bağlı: en iyi native sandbox deneyimi için `winget`,
  `uvx` ve güncel Windows 11.

## PowerShell Kurulumu

```powershell
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Kullanışlı parametreler:

- `-All`: Codex template'lerini, seçilmiş skill'leri ve global Git guard'larını
  birlikte kurar.
- `-InstallSkills`: `catalog/skills.json` içindeki skill'leri kurmayı dener.
- `-InstallGitGuards`: global Git ignore ve pre-commit hook kurar.
- `-Force`: yedek aldıktan sonra yönetilen Codex dosyalarının üzerine yazar.
- `-NoBackup`: yedeklemeyi kapatır. Tavsiye edilmez.

## Bash veya WSL Kurulumu

```bash
git clone https://github.com/ucsahinn/codex-enterprise-starter.git
cd codex-enterprise-starter
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Kullanışlı flagler:

- `--all`
- `--install-skills`
- `--install-git-guards`
- `--force`
- `--no-backup`

## Neler Yedeklenir?

Mevcut dosyalar şu klasöre kopyalanır:

```text
~/.codex/backups/codex-enterprise-starter-YYYYMMDD-HHMMSS/
```

Yedeklenen başlıca dosyalar:

- `AGENTS.md`
- `config.toml`
- `rules/default.rules`
- `agents/*.toml`
- kişisel plugin marketplace dosyası

## Kurulum Sonrası Kontrol

Codex'i yeniden başlat ve çalıştır:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Codex içinde:

```text
/mcp
/skills
/plugins
/hooks
```

## Gerçek Kuruluma Dokunmadan Test

PowerShell:

```powershell
$env:CODEX_HOME = "$PWD\tmp\codex-home"
$env:AGENTS_HOME = "$PWD\tmp\agents-home"
.\scripts\install.ps1 -Force
```

Bash:

```bash
CODEX_HOME="$PWD/tmp/codex-home" AGENTS_HOME="$PWD/tmp/agents-home" \
  ./scripts/install.sh --force
```

Testten sonra `tmp/` klasörünü silebilirsin.

## Geri Dönüş

1. Codex'i kapat.
2. Timestamp içeren backup klasöründen dosyaları geri kopyala.
3. Codex'i yeniden başlat.
4. `codex doctor --summary` çalıştır.

Installer backup dosyalarını silmez.
