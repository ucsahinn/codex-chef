# Windows Notları

Resmi kaynak:

https://developers.openai.com/codex/windows

## Önerilen Duruş

- Windows repo'larında çalışırken native Windows sandbox'ı tercih et.
- Yönetici onaylı kurulum yapılabiliyorsa `elevated` sandbox en iyi yoldur.
- Toolchain Linux-native ise veya native Windows sandbox kurum politikasıyla
  engelleniyorsa WSL2 kullan.
- Repoları kullandığın ortamın native dosya sistemi altında tut. WSL için daha
  iyi I/O amacıyla repolar Linux home dizini altında olmalıdır.

## Starter Varsayılanları

Windows template şunu ayarlar:

```toml
[windows]
sandbox = "elevated"
sandbox_private_desktop = true
```

Makinen `elevated` sandbox kullanamıyorsa şuna düşebilirsin:

```toml
[windows]
sandbox = "unelevated"
```

Rutin çözüm olarak unrestricted erişime geçme. Sandbox'ı düzelt veya daha dar
bir profil kullan.

## Kullanışlı Kontroller

```powershell
codex doctor --summary
codex --strict-config "Summarize the active setup."
```

Bir oturum içinde geçici ek okuma izni gerekiyorsa:

```text
/sandbox-add-read-dir C:\absolute\directory\path
```
