# Troubleshooting

Use this guide when setup or verification fails. Keep diagnostics read-only until
you intentionally run an installer or authenticated connector.

## Windows Installer

Run a preview first:

```powershell
.\scripts\install.ps1 -All -WhatIf
```

Common checks:

```powershell
Get-Command codex
Get-Command git
Get-Command node
Get-Command npx
```

If PowerShell blocks script execution, use a process-local policy:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
```

This does not change the machine or user execution policy permanently.

## Bash, WSL, Or Git Bash

The Bash installer needs a real Bash environment:

```bash
bash -n scripts/install.sh
./scripts/install.sh --all --dry-run
```

If `bash` is unavailable on Windows, use PowerShell or run the Bash path in WSL
or Git Bash.

## Skills CLI

The Windows-safe install pattern is:

```powershell
npx.cmd skills list --global --json
npx.cmd skills add <package> --skill <skill> --agent codex --yes --global
```

This repo validates installable sources offline by default:

```bash
npm run verify:skills
```

The online check uses the network and Skills CLI resolution:

```bash
npm run verify:skills:online
```

It writes only to the ignored workspace cache `tmp/npm-cache`. If online
verification fails with npm cache permissions under `%LOCALAPPDATA%`, rerun with
the current repo version so the check does not depend on the user-global npm
cache.

If Git on Windows reports `SEC_E_NO_CREDENTIALS`, retry only the affected
network verification with a process-local OpenSSL override. Do not commit global
credential or TLS workarounds into this repo.

## MCP Connectors

Authenticated MCP connectors are disabled by default. Enable one only for a
task that needs it, then restart Codex and check active servers with `/mcp`.

First confirm Codex is reading the same home the installer wrote:

```bash
npm run codex:status
npm run verify:install:runtime
```

If `npm run codex:status` reports skills context attention, that is a capacity
warning rather than an install failure. Codex may shorten skill descriptions in
the initial list when many skills are installed, but selected skills still load
their full `SKILL.md` instructions. Disable unused skills or plugins if
implicit skill discovery becomes noisy.

If the verifier reports an ambient `CODEX_HOME` warning, the installed config
may still be correct while the current shell is reading a sandbox, offline, or
alternate home. The verifier reruns Codex CLI checks with `CODEX_HOME`
explicitly set to the installed target before judging MCP availability.

If it reports managed file drift, the installed copy is stale even when the
agent and MCP counts look right. Re-run the installer with an intentional
backup-backed replacement, or copy only the reported managed files after taking
a backup.

If a server starts but shows no tools:

1. Confirm the package or URL in `catalog/mcp-servers.json`.
2. Confirm `enabled = true` only for the connector you need.
3. Restart Codex.
4. Re-run `/mcp`.
5. Disable the connector again when the task is done.

## Windows Sandbox

Current Codex Windows modes include native elevated sandbox, native unelevated
sandbox, and WSL2. For the most reliable Windows path, use the native elevated
sandbox on a current Windows build. If tool calls report sandbox setup failures,
try:

```powershell
codex doctor --summary
codex --strict-config "Summarize the active Codex setup."
```

If a PATH binary appears missing only inside the sandbox, verify the binary from
the same shell and document the discrepancy before changing config.

## Secret Scan Findings

Run:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

If a real secret appears in current files or history, treat it as compromised.
Rotate or revoke the credential first, then plan cleanup.
