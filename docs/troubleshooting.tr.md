# Troubleshooting

Setup veya doğrulama hata verdiğinde bu rehberi kullan. Installer veya auth
isteyen connector çalıştırmadan önce tanı komutlarını read-only tut.

## Windows Installer

Önce ön izleme al:

```powershell
.\scripts\install.ps1 -All -WhatIf
```

Temel kontroller:

```powershell
Get-Command codex
Get-Command git
Get-Command node
Get-Command npx
```

PowerShell script çalıştırmayı engellerse process-local policy kullan:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
```

Bu komut makine veya kullanıcı execution policy'sini kalıcı değiştirmez.

## Bash, WSL Veya Git Bash

Bash installer gerçek Bash ortamı ister:

```bash
bash -n scripts/install.sh
./scripts/install.sh --all --dry-run
```

Windows'ta `bash` yoksa PowerShell kullan veya Bash yolunu WSL/Git Bash içinde
çalıştır.

## Skills CLI

Windows-safe install pattern:

```powershell
npx.cmd skills list --global --json
npx.cmd skills add <package> --skill <skill> --agent codex --yes --global
```

Bu repo installable kaynakları default olarak offline doğrular:

```bash
npm run verify:skills
```

Online kontrol network ve Skills CLI resolution kullanır:

```bash
npm run verify:skills:online
```

Bu kontrol yalnizca yok sayilan `tmp/npm-cache` calisma alani cache'ine yazar.
Online dogrulama `%LOCALAPPDATA%` altindaki npm cache izinleri yuzunden
basarisiz olursa repo guncel halindeyken tekrar calistirin.

Git for Windows `SEC_E_NO_CREDENTIALS` döndürürse sadece ilgili network
doğrulamasını process-local OpenSSL override ile tekrar dene. Global credential
veya TLS workaround'larını repoya commit etme.

## MCP Connector'ları

Auth isteyen MCP connector'ları varsayılan olarak disabled kalır. Sadece görev
ihtiyaç duyuyorsa aç, Codex'i yeniden başlat ve `/mcp` ile aktif server'ları
kontrol et.

Önce Codex'in installer'ın yazdığı aynı home'u okuduğunu doğrula:

```bash
npm run verify:install:runtime
```

Verifier aktif `CODEX_HOME` farkı raporlarsa kurulu config doğru olabilir ama
mevcut Codex CLI süreci sandbox, offline veya alternatif bir home okuyor
demektir. MCP durumuna karar vermeden önce Codex'i doğru shell'den başlat veya
o oturum için `CODEX_HOME` değerini kurulu `~/.codex` path'ine ayarla.

Bir server açılıyor ama tool göstermiyorsa:

1. `catalog/mcp-servers.json` içindeki package veya URL'yi kontrol et.
2. Sadece ihtiyacın olan connector için `enabled = true` olduğundan emin ol.
3. Codex'i yeniden başlat.
4. `/mcp` komutunu tekrar çalıştır.
5. İş bitince connector'ı yeniden disabled yap.

## Windows Sandbox

Güncel Codex Windows modları native elevated sandbox, native unelevated sandbox
ve WSL2'dir. En güvenilir Windows yolu için güncel Windows üzerinde native
elevated sandbox kullan.

Sandbox setup hatası alırsan:

```powershell
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

Bir PATH binary'si sadece sandbox içinde kayboluyorsa config değiştirmeden önce
aynı shell içinde binary'yi doğrula ve farkı not et.

## Secret Scan Bulguları

Çalıştır:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

Gerçek bir secret current tree veya history içinde görünüyorsa credential
compromised kabul edilir. Önce rotate veya revoke et, sonra cleanup planla.
