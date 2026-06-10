---
name: enterprise-codex-operator
description: Maintain, audit, and improve this Codex enterprise starter setup without weakening security, leaking local state, or changing external systems.
---

# Enterprise Codex Operator

Use this skill when maintaining the Codex Enterprise Starter repository or a
derived local setup.

## Workflow

1. Inspect current files before changing anything.
2. Preserve security defaults:
   - sandbox stays enabled
   - approvals stay interactive
   - authenticated connectors stay disabled until needed
   - no secrets, sessions, memories, auth files, or local project paths are
     added to source
3. Keep docs and templates aligned:
   - `README.md`
   - `README.tr.md`
   - `docs/how-to.md`
   - `docs/how-to.tr.md`
   - `docs/completion-audit.md`
   - `docs/completion-audit.tr.md`
   - `docs/install.md`
   - `docs/install.tr.md`
   - `docs/security-model.md`
   - every English doc in `docs/` should have a matching `.tr.md` pair
   - public README visuals under `assets/` should stay purposeful, accessible,
     lightly animated with reduced-motion fallback, and public-safe
4. Validate after edits:
   - `npm run validate`
   - `git status --short`
   - Gitleaks when available
5. Do not commit, push, tag, release, deploy, publish, rotate credentials, or
   perform account-level changes unless the user explicitly approves the exact
   action.

## Output

Report:

- changed files
- validation commands and status
- remaining security or publishing risk
