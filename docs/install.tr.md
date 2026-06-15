# Kurulum Rehberi

Bu rehber starter paketini mevcut kullanıcının Codex home dizinine kurar.
Varsayılan konum `~/.codex` dizinidir. `CODEX_HOME` tanımlıysa installer o
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

Yazmadan önce ön izle:

```powershell
.\scripts\install.ps1 -All -Force -WhatIf
```

Installer'lari cagirmadan manifest-backed operasyon planini incele:

```bash
node scripts/plan-install.mjs --all --json
```

Tam JSON'i incelemeden once manifest profil ve operasyonlarini listele:

```bash
node scripts/plan-install.mjs --list-profiles
node scripts/plan-install.mjs --list-operations
```

Plan managed target'lari, opsiyonel global Git degisikliklerini, curated skill
komutlarini, collision policy'yi, backup davranisini ve risk seviyesini listeler.

Ön izleme doğruysa kur:

```powershell
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
Set-ExecutionPolicy -Scope Process Bypass -Force
.\scripts\install.ps1 -All -Force
```

Kullanışlı parametreler:

- `-All`: Codex template'lerini, doğrulanmış public skill'leri ve global Git
  guard'larını birlikte kurar.
- `-InstallSkills`: `catalog/skills.json` içinde `install: true` olan,
  `owner/repo` formatında doğrulanmış `package` ve eşleşen `skill` adı taşıyan
  kayıtları kurar. Installer `npx.cmd skills add <package> --skill <skill>
  --agent codex --yes --global` çağırır.
- `-InstallGitGuards`: global Git ignore ve pre-commit hook kurar.
- `-Force`: yedek aldıktan sonra yönetilen Codex dosyalarının üzerine yazar.
- `-NoBackup`: yedeklemeyi kapatır. Tavsiye edilmez.
- `-WhatIf`: gerçek setup'a dokunmadan dosya, Git ve skill operasyonlarını ön
  izler.

## Bash Veya WSL Kurulumu

Yazmadan önce ön izle:

```bash
./scripts/install.sh --all --force --dry-run
```

Ön izleme doğruysa kur:

```bash
git clone https://github.com/ucsahinn/codex-chef.git
cd codex-chef
chmod +x scripts/install.sh
./scripts/install.sh --all --force
```

Kullanışlı flagler:

- `--all`
- `--install-skills`
- `--install-git-guards`
- `--force`
- `--no-backup`
- `--dry-run`

## Neler Yedeklenir?

Mevcut dosyalar şu klasöre kopyalanır:

```text
~/.codex/backups/codex-chef-YYYYMMDD-HHMMSS/
```

Installer şu managed target'ları replace etmeden önce yedekler:

- `AGENTS.md`
- `config.toml`
- `rules/default.rules`
- `agents/*.toml`
- kişisel plugin marketplace dosyası
- bundled local plugin dizini

Dizin replacement sadece yönetilen Codex veya Agents home altında yapılır.
Installer unmanaged directory target'larını reddeder.

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
.\scripts\install.ps1 -Force -WhatIf
```

Bash:

```bash
CODEX_HOME="$PWD/tmp/codex-home" AGENTS_HOME="$PWD/tmp/agents-home" \
  ./scripts/install.sh --force --dry-run
```

Non-dry-run temp home'ları yalnızca bilerek smoke install yapmak istiyorsan
kullan. `tmp/` klasörünü de sadece bilerek oluşturduysan temizle.

## Geri Dönüş

1. Codex'i kapat.
2. Timestamp içeren backup klasöründen dosyaları geri kopyala.
3. Codex'i yeniden başlat.
4. `codex doctor --summary` çalıştır.

Installer backup dosyalarını silmez.
