# Completion Audit

Date: 2026-06-10

This audit maps the requested end state to current repository evidence.

## Requirements

| Requirement | Evidence | Status |
| --- | --- | --- |
| English and Turkish content must be complete. | Every `docs/*.md` file has a matching `.tr.md` pair. `scripts/validate-repo.mjs` and `scripts/security-audit.mjs` enforce the pairing automatically. | Complete |
| The setup must have a clear how-to. | `docs/how-to.md` and `docs/how-to.tr.md` describe one-shot install, verification, operating model, MCP defaults, profiles, common prompts, and safety rules. | Complete |
| One-shot install should turn Codex into a strong specialist setup. | `scripts/install.ps1 -All -Force` and `scripts/install.sh --all --force` install Codex templates, curated skills, Git guards, specialist agents, profiles, rules, and the local plugin. | Complete |
| The setup should include subagents like a software team. | `templates/codex/config.*.toml` registers `code_mapper`, `docs_researcher`, `code_reviewer`, `frontend_verifier`, `security_auditor`, `test_verifier`, and `release_verifier`. | Complete |
| Research and current docs should be available. | OpenAI Docs MCP and Context7 are enabled by default; `docs/research-notes.md` and `docs/research-notes.tr.md` record official Codex manual topics used. | Complete |
| `--seq` style decomposition should be available. | `sequential-thinking` MCP is enabled by default in Windows and Unix templates and documented in the MCP catalog. | Complete |
| Browser/UI verification should be available. | Playwright and Chrome DevTools MCPs are enabled by default; `frontend_verifier` is registered and documented. | Complete |
| Security must remain strong. | Sandbox and approval defaults stay conservative, external account/database/filesystem MCPs stay disabled, Git guards are optional, and Gitleaks is part of release verification. | Complete |
| Public repository must not include local state or secrets. | Validation blocks local user paths, Codex session/memory paths, private key markers, common token patterns, denied secret filenames, databases, and packaged artifacts. | Complete |
| Maintenance should stay aligned later. | The bundled `enterprise-codex-operator` skill requires README/install/how-to docs alignment and bilingual doc pairing. | Complete |

## Verification Evidence

Run from the repository root:

```bash
npm run check
```

Expected result:

```text
Validation passed.
Security audit passed.
```

Additional checks used for release readiness:

```bash
node --check scripts/validate-repo.mjs
node --check scripts/security-audit.mjs
```

PowerShell parser check:

```powershell
powershell.exe -NoProfile -Command "`$errors = `$null; [System.Management.Automation.PSParser]::Tokenize((Get-Content -Raw -LiteralPath scripts\install.ps1), [ref]`$errors) | Out-Null; if (`$errors) { exit 1 }; 'PowerShell parse OK'"
```

Bash syntax check:

```bash
bash -n scripts/install.sh
```

TOML parse check:

```bash
python -c "import pathlib,tomllib; [tomllib.loads(p.read_text(encoding='utf-8')) for p in pathlib.Path('templates/codex').rglob('*.toml')]; print('TOML parse OK')"
```

Secret scan when Gitleaks is installed:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

## Publication Note

The installer is local-only by design. It does not commit, push, publish,
deploy, rotate secrets, or change external accounts. Those actions remain
explicit user decisions.
