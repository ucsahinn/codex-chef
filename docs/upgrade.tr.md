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

Guided CLI guvenli yolu tek komutta toplar:

```powershell
npm run chef -- --update
npm run chef -- --update --apply
```

`--apply` olmadan update modu managed/global dosyalari degistirmez; normal CLI
loglari `--no-log` yoksa repo-local kalir. Apply modunda clean worktree ister
ve `git pull --ff-only` calistirir. Pull repo HEAD'ini ilerletirse CLI fresh
preview basip durur; bu updated preview'i inceledikten sonra
`npm run chef -- --update --apply` tekrar calistir. Repo zaten guncelse managed
dosyalari lokal validation sonrasi backup alan installer uzerinden yeniler;
curated global skill veya opsiyonel global Git guard kurmaz.

Manuel PowerShell:

```powershell
git pull
npm run check
node scripts/plan-install.mjs --all --json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -All -WhatIf
.\scripts\install.ps1 -All -Interactive
npm run verify:install:runtime -- --expect-skills
```

Bash veya WSL:

```bash
git pull
npm run check
node scripts/plan-install.mjs --all --json
./scripts/install.sh --all --dry-run
./scripts/install.sh --all --interactive
npm run verify:install:runtime -- --expect-skills
```

`-Force` / `--force` bilinçli replace upgrade içindir. Normal ilk kurulumda
veya mevcut kullanıcı refresh akışında force verme; böylece mevcut
`config.toml` merge edilir ve diğer mevcut managed dosyalar atlanır. Replace
upgrade sırasında force ancak preview'i inceledikten ve bu repo template'lerinin
managed hedefleri replace etmesini istediğinden emin olduktan sonra
kullanılmalı.

Managed hedefleri current repo template'leriyle bilerek replace etmek
istiyorsan preview'i inceledikten sonra aynı installer'ı `-Force` veya
`--force` ile tekrar çalıştır.

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
npm run verify:install:runtime -- --expect-skills
codex exec --strict-config "Summarize the active Codex setup."
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
