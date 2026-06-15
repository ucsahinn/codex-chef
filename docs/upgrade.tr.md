# Upgrade Rehberi

Zaten çalışan bir Codex setup'ın varsa ve bu starter'ın yeni sürümüne geçmek
istiyorsan bu rehberi kullan.

## Güvenli Upgrade Akışı

1. Repo güncellemesini çek.
2. Diff'i incele.
3. Installer değişikliklerini ön izle.
4. Ön izleme doğru görünüyorsa installer'ı çalıştır.
5. Codex'i yeniden başlat.
6. Aktif config ve skill'leri doğrula.

PowerShell:

```powershell
git pull
npm run check
node scripts/plan-install.mjs --all --json
.\scripts\install.ps1 -All -Force -WhatIf
.\scripts\install.ps1 -All -Force
```

Bash veya WSL:

```bash
git pull
npm run check
node scripts/plan-install.mjs --all --json
./scripts/install.sh --all --force --dry-run
./scripts/install.sh --all --force
```

## Backup'lar

Varsayılan olarak overwrite edilen yönetilen dosyalar şuraya yedeklenir:

```text
~/.codex/backups/codex-chef-YYYYMMDD-HHMMSS/
```

Başka backup'ın yoksa `-NoBackup` veya `--no-backup` kullanma.

## Neyi Karşılaştırmalı?

Upgrade öncesi şu dosyaları incele:

- `templates/codex/AGENTS.md`
- `templates/codex/config.windows.toml`
- `templates/codex/config.unix.toml`
- `templates/codex/rules/default.rules`
- `catalog/skills.json`
- `catalog/skills-lock.json`
- `catalog/agents.json`
- `catalog/mcp-servers.json`
- `manifests/install-plan.json`
- `schemas/install-plan.schema.json`

## Upgrade Sonrası

Çalıştır:

```bash
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Codex içinde kontrol et:

```text
/mcp
/skills
/plugins
/hooks
```

## Rollback

1. Codex'i kapat.
2. Önceki dosyaları timestamp'li backup klasöründen geri kopyala.
3. Codex'i yeniden başlat.
4. `codex doctor --summary` komutunu tekrar çalıştır.
