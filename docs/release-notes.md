# Release Notes

This page follows the release users should install now. Older engineering history remains available in [CHANGELOG.md](../CHANGELOG.md), so the public release guide stays useful instead of becoming an ever-growing archive.

## v0.5.58 - 2026-07-29

Codex Chef 0.5.58 adds security-bounded Fetch, SEO, and Evidence Research workflows, strengthens managed skill installation and CLI error contracts, and restores a clean Ubuntu/Node.js 18 portability gate without weakening Windows or macOS behavior.

### What Changed

- Adds the explicit-only `$fetch` workflow for authorized, browser-evidenced website reconstruction with public-passive defaults, inert authentication, prompt-injection and SSRF boundaries, lawful asset handling, zero-egress local output, and deterministic report validation.
- Replaces the upstream SEO reference with a Chef-owned `$seo` workflow that separates local, rendered, deployed, field, and account evidence while validating claim-safe technical, content, international, and local SEO reports.
- Adds `$evidence-research` for scoped search, screening, source appraisal, claim-level traceability, disagreement and uncertainty synthesis, reproducibility, and ethics-aware decision packages.
- Installs Fetch, SEO, and Evidence Research from the canonical plugin source as managed direct skills with fail-closed collision checks, explicit per-skill adoption, backup-backed replacement, rollback verification, and runtime parity checks.
- Refreshes an already-installed Codex Chef plugin's stale versioned cache during installer, update, and repair applies, verifies the active version, and leaves never-installed plugins untouched.
- Hardens commit-pinned skill installation with exact native-tree hashing, provenance-aware managed upgrades, foreign-target preservation, mandatory backups, and functional full-history fetch support.
- Adds a shared sanitized plain/JSON error contract and truthful result receipts across Chef, status, routing, doctor, Brain, external-review, release-note, and pinned-skill CLIs.
- Tightens token-budget diagnostics, external-review containment, credential-path screening, MCP/runtime catalog alignment, approval boundaries, installer checks, and supply-chain verification.
- Removes contradictory `NO_COLOR` inheritance from forced-color smoke tests so Node.js 18 no longer emits a warning that breaks the Ubuntu 72-column portability gate.

### Install Or Upgrade

First installation:

```bash
npm run chef -- --install
npm run chef -- --install --apply
```

Existing installation:

```bash
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
```

Use the state-aware status screens before and after installation:

```bash
npm run chef -- --skills
npm run chef -- --mcp
npm run chef -- --status --details
```

Then restart Codex and verify the installed runtime:

```bash
npm run verify:install:runtime
npm run codex:status
```

### Compatibility

- Node.js 18 or newer
- Windows PowerShell, macOS, Linux, and WSL
- Existing user-owned skills, MCPs, profile choices, custom config tables, and unrelated plugin files remain outside normal prune behavior
