# Repository Working Agreements

## Scope

This repository packages a safe Codex setup starter. Keep edits focused on
installable templates, docs, validation, and security guardrails.

## Security

- Never commit secrets, auth files, memory files, sessions, local caches, or
  machine-specific private paths.
- Keep authenticated MCP connectors disabled by default.
- Do not add approval rules that auto-allow destructive commands, credential
  access, publishing, deployments, releases, or broad shell execution.
- Do not delete, prune, uninstall, drop, truncate, overwrite, or clean files,
  directories, dependencies, artifacts, local state, or configuration without
  explicit user approval. Non-destructive edits and validation may continue.
- Install scripts must back up overwritten files and must not delete user data.
- Run `npm run validate` before reporting the repo as push-ready.

## Documentation

- Keep `README.md` and `README.tr.md` aligned.
- Cite official Codex documentation for current behavior.
- Prefer concise, copy-pasteable commands.
- When install behavior changes, update `docs/install.md`,
  `docs/install.tr.md`, and `docs/security-model.md`.

## Verification

Use the narrowest meaningful check first:

```bash
npm run validate
```

Before commit or push:

```bash
git status --short
git diff --cached
```

Use Gitleaks when available:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```
