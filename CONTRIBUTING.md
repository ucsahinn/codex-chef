# Contributing

Keep changes small, auditable, and security-first.

## Rules

- Do not commit secrets, auth files, memories, sessions, logs, or local caches.
- Do not add broad approval rules that allow publishing, credential access, or
  destructive file operations.
- Keep MCP connectors that require authentication disabled by default.
- Prefer environment variable placeholders over static credentials.
- Update both `README.md` and `README.tr.md` when install behavior changes.
- Run `npm run validate` before proposing changes.

## Commit Hygiene

Before commit:

```bash
git status --short
git diff --cached
npm run validate
```

Stage explicit files. Avoid `git add .` unless every changed path has been
reviewed.
