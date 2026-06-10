# Security Policy

## Security Model

This repository is a setup kit. It should contain only public templates,
documentation, scripts, and catalogs. It must not contain:

- API keys, tokens, cookies, passwords, private keys, certificates, signing keys
- `.env`, `.env.*`, auth files, local databases, dumps, backups, logs
- Codex memories, sessions, transcripts, thread state, screenshots, cache
- Machine-specific project trust state or private local paths
- Generated installers, archives, build output, dependency folders

## Installer Boundaries

Install scripts may copy files into `~/.codex`, `~/.agents`, `~/.githooks`, and
the global Git config only when the user runs them. They must not:

- Authenticate to GitHub or any third-party service
- Read or print credential stores
- Rotate, create, or delete secrets
- Push, tag, create releases, deploy, or publish packages
- Delete existing user files without creating a timestamped backup

## Reporting A Vulnerability

Open a private security report or contact the repository maintainer. Do not
include real secrets in issue text, screenshots, logs, or reproduction steps.

## Pre-Push Checklist

Run:

```bash
npm run validate
git status --short
git diff --cached
```

If available:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

Treat any real secret found in git history as compromised. Rotate or revoke it
before discussing history cleanup.
