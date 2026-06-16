# Beklenen Çıktı

Installer başarılı olduğunda kısa, bölümlü ve okunabilir kalır; hata olduğunda
debug için daha fazla detay gösterir. PowerShell varsayılan olarak okunabilir
ikonlar kullanır; eski terminal veya CI logları için `-PlainOutput` ile
ASCII-only çıktı alabilirsin.

## Install Plan Ön İzleme

Discovery ciktisi no-write ve okunabilir kalir:

```text
Codex Chef install profiles
Package: codex-chef@0.5.9
Platform: windows

Profile | Operations | High risk | Optional flags
--- | ---: | ---: | ---
all | 8 | 1 | InstallSkills
default | 7 | 0 | none
```

```text
Codex Chef install plan
Platform: windows
Operations: ...

[file] codex-config
  source: templates/codex/config.windows.toml
  target: .../.codex/config.toml
  collision: merge-missing-blocks-unless-force-backup-before-replace
  backup: yes
  force: no
  risk: medium
```

JSON çıktı `schemaVersion:
codex-chef.install-state-preview.v1` kullanır ve global Codex,
Agents veya Git lokasyonlarına yazmaz.

JSON sozlesmesi `schemas/install-state-preview.schema.json` icinde dokumante
edilir ve `scripts/validate-install-state-preview.mjs` ile dogrulanir.

Publish-safe kanit icin `--redact-paths` ekle; boylece lokal home path'leri
placeholder olarak gorunur:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
```

## PowerShell Dry Run

```text
🍳 Codex Chef installer
  • Codex home: ...
  • Agents home: ...
  • Mode: preserve existing files; merge missing config blocks
  • Dry run: no files, Git settings, or skills will be changed

🍳 Managed Codex files
What if: Performing the operation ...

🍳 Next steps
  ✓ completed: Codex Chef dry run
```

## PowerShell Başarılı Kurulum

```text
🍳 Codex Chef installer
  • Codex home: ...
  • Agents home: ...
  • Mode: preserve existing files; merge missing config blocks

🍳 Managed Codex files
  ✓ installed: ...

🍳 Next steps
  • 28 existing managed target(s) were preserved; use -Force only for a deliberate backup-backed replacement
  ✓ completed: Codex Chef install
  • Restart Codex, then run:
    codex doctor --summary
    npm run verify:install:runtime
    codex --strict-config "Summarize the active Codex setup."
  • Backup: ...
```

Mevcut `config.toml` `-Force` verilmedikçe backup alınıp merge edilir; diğer
mevcut managed dosyalar `-Force` verilmedikçe atlanır.

## Bash Dry Run

```text
[*] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks
  - Dry run: no files, Git settings, or skills will be changed

[*] Managed Codex files
Would install file from ...

[*] Next steps
  - completed: Codex Chef dry run
```

## Bash Başarılı Kurulum

```text
[*] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks

[*] Managed Codex files
  - installed: ...

[*] Next steps
  - 28 existing managed target(s) were preserved; use --force only for a deliberate backup-backed replacement
  - completed: Codex Chef install
  - Restart Codex, then run:
    codex doctor --summary
    npm run verify:install:runtime
    codex --strict-config "Summarize the active Codex setup."
  - Backup: ...
```

## Skill Kurulumu

Başarılı skill kurulumları kısa status satırları basar:

```text
Skill already installed: ...
Installed skill: ...
```

Raw Skills CLI çıktısı yalnızca install hatasında gösterilir. Böylece başarılı
Windows setup'ı gürültülü olmaz ama hata olduğunda debug yapılabilir.
