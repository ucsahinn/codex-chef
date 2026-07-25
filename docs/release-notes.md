# Release Notes

This page follows the release users should install now. Older engineering history remains available in [CHANGELOG.md](../CHANGELOG.md), so the public release guide stays useful instead of becoming an ever-growing archive.

## v0.5.53 - 2026-07-26

Codex Chef now has a smaller, clearer public surface without losing the workflows, safety boundaries, or technical history that make the project useful.

### What Changed

- Six concise, human-written README entry points cover English, Turkish, German, Spanish, French, and Brazilian Portuguese.
- Complete operator documentation is maintained in English and Turkish instead of publishing generated translation shells as if they were full guides.
- Obsolete completion-audit, local-audit, and SEO documents were removed; useful guidance remains in the maintained docs, knowledge base, agent corpus, and changelog.
- Public README, governance, privacy, support, publishing, GitHub settings, and readiness guidance now use direct, natural language.
- Locale, security, package, token, workflow, doctor, and release validators enforce the smaller documentation contract without weakening safety gates.
- Token-budget diagnostics, the optional capability-preserving `token-safe.config.toml` profile, and automatic agent `model/reasoning` inheritance are documented across public entry points.
- GitHub Releases were consolidated to the supported line while all historical Git tags and commits were preserved.

### Upgrade

Use the preview-first update flow:

```bash
npm run chef -- --update --plain --no-log
npm run chef -- --update --apply
```

Then restart Codex and verify the installed runtime:

```bash
npm run verify:install:runtime
npm run codex:status
```

### Compatibility

- Node.js 18 or newer
- Windows PowerShell, macOS, Linux, and WSL
- Existing user-owned skills, MCPs, profile choices, and unrelated plugin files remain outside normal prune behavior
