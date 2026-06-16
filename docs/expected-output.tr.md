# Beklenen Çıktı

Installer başarılı olduğunda bilinçli olarak sessiz ve okunabilir kalır; hata
olduğunda debug için daha fazla detay gösterir.

## Install Plan Ön İzleme

Discovery ciktisi no-write ve okunabilir kalir:

```text
Codex Chef install profiles
Package: codex-chef@0.5.7
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

[file] codex-agents-md
  source: templates/codex/AGENTS.md
  target: .../.codex/AGENTS.md
  collision: skip-unless-force-backup-before-replace
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
Codex home: ...
Agents home: ...
Dry run: no files, Git settings, or skills will be changed.
What if: Performing the operation ...
Codex Chef dry run completed.
```

## PowerShell Başarılı Kurulum

```text
Codex home: ...
Agents home: ...
Installed ...
Codex Chef installed.
Restart Codex, then run:
  codex doctor --summary
  codex --strict-config "Summarize the active Codex setup."
Backup: ...
```

Var olan dosyalar `-Force` verilmedikçe atlanır.

## Bash Dry Run

```text
Codex home: ...
Agents home: ...
Dry run: no files, Git settings, or skills will be changed.
Would install file from ...
Codex Chef dry run completed.
```

## Bash Başarılı Kurulum

```text
Codex home: ...
Agents home: ...
Installed ...
Codex Chef installed.
Restart Codex, then run:
  codex doctor --summary
  codex --strict-config "Summarize the active Codex setup."
Backup: ...
```

## Skill Kurulumu

Başarılı skill kurulumları kısa status satırları basar:

```text
Skill already installed: ...
Installed skill: ...
```

Raw Skills CLI çıktısı yalnızca install hatasında gösterilir. Böylece başarılı
Windows setup'ı gürültülü olmaz ama hata olduğunda debug yapılabilir.
