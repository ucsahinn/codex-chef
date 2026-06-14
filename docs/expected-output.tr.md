# Beklenen Çıktı

Installer başarılı olduğunda bilinçli olarak sessiz ve okunabilir kalır; hata
olduğunda debug için daha fazla detay gösterir.

## PowerShell Dry Run

```text
Codex home: ...
Agents home: ...
Dry run: no files, Git settings, or skills will be changed.
What if: Performing the operation ...
Codex Enterprise Starter dry run completed.
```

## PowerShell Başarılı Kurulum

```text
Codex home: ...
Agents home: ...
Installed ...
Codex Enterprise Starter installed.
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
Codex Enterprise Starter dry run completed.
```

## Bash Başarılı Kurulum

```text
Codex home: ...
Agents home: ...
Installed ...
Codex Enterprise Starter installed.
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
