# Completion Audit

Date: 2026-06-11

This audit maps the requested end state to current repository evidence.

## Requirements

| Requirement | Evidence | Status |
| --- | --- | --- |
| English and Turkish content must be complete. | Every `docs/*.md` file has a matching `.tr.md` pair. `scripts/validate-repo.mjs` and `scripts/security-audit.mjs` enforce the pairing automatically. | Complete |
| The GitHub main screen must show Turkish and broader language entry points. | `README.md` includes a visible switcher for Deutsch, Español, English, Português (Brasil), Türkçe, and Français. Root README entry files exist for each linked language, and `scripts/validate-repo.mjs` enforces this storefront signal. | Complete |
| The repository should use purposeful visuals and icons. | `README.md` and `README.tr.md` include real badges, emoji accents, and `assets/banner.svg` plus `assets/workflow-overview.svg`; SVG validation requires title, description, lightweight animation, and reduced-motion fallback. | Complete |
| GitHub community flows should be public-safe. | `.github/ISSUE_TEMPLATE/*`, `.github/CODEOWNERS`, and `.github/pull_request_template.md` guide bugs, features, questions, docs suggestions, and PRs away from secrets and private local state; blank issues are disabled. | Complete |
| README should expose trust quickly. | `README.md` and `README.tr.md` include a trust-signal table covering public-safe scope, validation, multilingual docs, accessible visuals, connector defaults, and community flow. | Complete |
| Senior operating standards should be explicit. | `docs/best-practices.md` and `docs/best-practices.tr.md` define source quality, surface routing, the operating loop, skill/package rules, public-safe rules, UI verification, and maintenance checks. | Complete |
| Skill install sources should fail before users hit installer errors. | `catalog/skills-lock.json` records the reviewed source allowlist, `scripts/verify-skill-sources.mjs` validates installable package/skill pairs offline, `npm run verify:skills:online` resolves them through the Skills CLI, and `npm run check` includes the offline gate. | Complete |
| Full setup should be idempotent and fail closed. | `scripts/install.ps1` and `scripts/install.sh` skip already installed global skills, install only to the Codex agent target, suppress raw Skills CLI progress output on success, use an OpenSSL Git override for skill clones, and fail if the Skills CLI reports clone/install/write failures. | Complete |
| Dependency update hygiene should be visible. | `.github/dependabot.yml` tracks GitHub Actions and npm manifest updates on a weekly cadence. | Complete |
| The setup must have a clear how-to. | `docs/how-to.md` and `docs/how-to.tr.md` describe one-shot install, verification, operating model, MCP defaults, profiles, common prompts, and safety rules. | Complete |
| One-shot install should turn Codex into a strong specialist setup. | `scripts/install.ps1 -All -Force` and `scripts/install.sh --all --force` install Codex templates, verified public skill packages, Git guards, specialist agents, profiles, rules, and the local plugin. | Complete |
| The setup should include subagents like a software team. | `templates/codex/config.*.toml` registers `code_mapper`, `docs_researcher`, `code_reviewer`, `frontend_verifier`, `security_auditor`, `test_verifier`, and `release_verifier`. | Complete |
| Research and current docs should be available. | OpenAI Docs MCP and Context7 are enabled by default; `docs/research-notes.md` and `docs/research-notes.tr.md` record official Codex manual topics used. | Complete |
| `--seq` style decomposition should be available. | `sequential-thinking` MCP is enabled by default in Windows and Unix templates and documented in the MCP catalog. | Complete |
| Browser/UI verification should be available. | Playwright and Chrome DevTools MCPs are enabled by default; `frontend_verifier` is registered and documented. | Complete |
| Security must remain strong. | Sandbox and approval defaults stay conservative, external account/database/filesystem MCPs stay disabled, Git guards are optional, and Gitleaks is part of release verification. | Complete |
| Public repository must not include local state or secrets. | Validation blocks local user paths, Codex session/memory paths, private key markers, common token patterns, denied secret filenames, databases, and packaged artifacts. | Complete |
| Release notes should be source-controlled and aligned with public release posture. | `docs/release-notes.md` and `docs/release-notes.tr.md` document the v0.3.0 change set and are required by repository and security validation. | Complete |
| GitHub metadata should be ready before public release claims. | `docs/github-settings.md` and `docs/github-settings.tr.md` define the recommended description, topics, feature toggles, branch/actions posture, and v0.3.0 release metadata. | Complete |
| Advisory inputs should be reviewable before release. | `docs/advisory-sources.md` and `docs/advisory-sources.tr.md` list the official Codex, OpenAI skill, MCP security, GitHub, PowerShell, and ECC comparison sources maintainers should re-check before publishing. | Complete |
| Maintenance should stay aligned later. | The bundled `enterprise-codex-operator` skill requires README/install/how-to docs alignment and bilingual doc pairing. | Complete |

## Verification Evidence

Run from the repository root:

```bash
npm run check
```

Expected result:

```text
Validation passed.
Skill source verification passed.
Security audit passed.
```

Additional checks used for release readiness:

```bash
node --check scripts/validate-repo.mjs
node --check scripts/verify-skill-sources.mjs
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

## 2026-06-11 Routing Addendum

| Requirement | Evidence | Status |
| --- | --- | --- |
| Global instructions should make subagent routing sharper without overstating automation. | `~/.codex/AGENTS.md` and `templates/codex/AGENTS.md` now state that task-shape routing must deliberately spawn specialists and wait for summaries; docs clarify that subagents are explicit delegation. | Complete |
| Skill routing should reflect official progressive disclosure behavior. | Global/template `AGENTS.md` and `docs/skills-and-agents.md` document explicit and implicit skill invocation, full `SKILL.md` loading, focused references, and plugin packaging boundaries. | Complete |
| MCP flags should be documented and encoded in templates. | `templates/codex/config.*.toml` include `max_depth`, `job_max_runtime_seconds`, and MCP startup/tool timeouts; `docs/mcp-catalog.md`, `docs/codex-flags.md`, and `docs/security-model.md` document approval modes, allow/deny lists, timeouts, and environment-backed auth. | Complete |
| Matching skills, agents, MCPs, and flags should be treated as required when applicable. | `~/.codex/AGENTS.md`, `templates/codex/AGENTS.md`, `docs/skills-and-agents.md`, `docs/mcp-catalog.md`, and `docs/codex-flags.md` now say to use the matching surface and explain any skipped obvious routing surface. | Complete |
| Delete or cleanup actions must pause for explicit approval while safe work continues. | `~/.codex/AGENTS.md`, `templates/codex/AGENTS.md`, root `AGENTS.md`, `docs/security-model.md`, and `templates/codex/rules/default.rules` require approval for deletion, cleanup, prune, uninstall, overwrite, and similar destructive work. | Complete |

## 2026-06-14 ECC-Informed Addendum

| Requirement | Evidence | Status |
| --- | --- | --- |
| ECC should be studied without wholesale import or config collision. | `docs/ecc-compatibility.md`, `docs/ecc-compatibility.tr.md`, and `docs/research-notes.md` record the adopted ECC patterns and the blocked patterns: broad global sync, implicit dependency install, enabled authenticated connectors, and telemetry-style hooks. | Complete |
| Users should be able to inspect the full install surface before installer writes. | `manifests/install-plan.json` records managed operations, risk, collision policy, backup behavior, platforms, and required flags; `node scripts/plan-install.mjs --list-profiles`, `node scripts/plan-install.mjs --list-operations`, and `node scripts/plan-install.mjs --all --json` emit no-write install discovery and preview output. | Complete |
| Machine-readable plan output should have a stable contract. | `schemas/install-state-preview.schema.json` documents the JSON shape emitted by `scripts/plan-install.mjs`, and `scripts/validate-install-state-preview.mjs` validates source version alignment, selected/skipped components, operation metadata, and high-risk selection behavior. | Complete |
| Install-plan metadata should be validated in local and CI gates. | `scripts/validate-install-plan.mjs` and `scripts/validate-install-state-preview.mjs` are included in `npm run check`; install-plan destinations are constrained to reviewed Codex, Agents, and optional Git-guard targets; `.github/workflows/validate.yml` runs syntax checks for the plan, state-preview, and planner scripts before `npm run check`. | Complete |
| Installer implementation should stay aligned with the install manifest. | `scripts/validate-installer-alignment.mjs` checks PowerShell and Bash installer flags, core copy targets, plugin marketplace handling, Git guard wiring, skill install commands, and optional flag boundaries against `manifests/install-plan.json`. | Complete |
| Specialist agent metadata should stay aligned with config templates. | `catalog/agents.json` records the twenty reviewed specialist agents, and `scripts/validate-agent-config.mjs` checks both Windows and Unix `[agents.<name>]` blocks plus each `templates/codex/agents/*.toml` role file. | Complete |
| MCP catalog and config should not drift apart. | `scripts/validate-mcp-config.mjs` checks that catalog entries match both Windows and Unix Codex config blocks, enabled defaults, approval modes, URLs, package specs, pinned git source refs, and plugin `.mcp.json` surfaces. | Complete |
| Supply-chain risk indicators should be caught before publication. | `scripts/scan-supply-chain-iocs.mjs` is included in `npm run check` and scans for remote shell pipes, PowerShell download-execute patterns, encoded commands, unsafe root removal, world-writable chmod, active `@latest`, and implicit installer dependency installs. | Complete |
| Security gates should reject unsafe ECC-style drift. | `scripts/security-audit.mjs` rejects implicit `npm install`/`npm ci` in installers, `approval_policy = "never"`, `profiles.yolo`, active `@latest` package specs, high-risk install-plan operations without explicit flags, non-idempotent skill collision policy, broad hook runtime paths, plugin-bundled hook/MCP/app surfaces, write-capable plugin manifests, and marketplace auth requirements. | Complete |
| Global skill installation should not be silently approved. | `templates/codex/rules/default.rules` prompts for `npx.cmd skills add` and broad `npx.cmd skills` invocations; `scripts/security-audit.mjs` fails if those become auto-allowed again. | Complete |
| Online skill verification should avoid PowerShell interpolation. | `scripts/verify-skill-sources.mjs` uses argv-based invocation, a temporary Windows wrapper for Git TLS config, and a conservative GitHub slug pattern for installable package names. | Complete |
| Skill source lock semantics should stay honest. | `catalog/skills.json`, `catalog/skills-lock.json`, `scripts/verify-skill-sources.mjs`, `docs/security-model.md`, and `docs/skills-and-agents.md` state that the skill lock is a reviewed source allowlist rather than an immutable upstream commit lock. | Complete |
| MCP defaults should stay useful without floating package drift. | `templates/codex/config.windows.toml`, `templates/codex/config.unix.toml`, `catalog/mcp-servers.json`, `scripts/validate-mcp-config.mjs`, and `scripts/security-audit.mjs` require exact npm package versions for npm-based MCP specs and full commit SHAs for git-based MCP launchers. | Complete |
| Cleanup scripts should not be auto-approved. | `templates/codex/rules/default.rules` prompts for `npm.cmd run clean`, and `scripts/security-audit.mjs` fails if cleanup scripts become auto-allowed again. | Complete |
| Secret scanning should cover current tree while ignoring local scratch clones and caches. | `.gitleaks.toml` extends default Gitleaks rules and excludes only ignored local scratch, dependency, build, and cache directories such as `tmp/`, `node_modules/`, `dist/`, and `.next/`. | Complete |
| Release readiness should be machine-gated. | `scripts/validate-release-readiness.mjs` is included in `npm run check` and verifies release notes, GitHub settings docs, workflow hardening, Gitleaks gate documentation, tag metadata, and artifact hygiene. | Complete |
| Public triage should stay owned and safe. | `scripts/validate-repo.mjs`, `scripts/security-audit.mjs`, and `scripts/validate-release-readiness.mjs` require CODEOWNERS, feature/question templates, advisory-source docs, and disabled blank issues. | Complete |
| Multilingual README entry points should not drift. | `scripts/validate-readme-locales.mjs` is included in `npm run check` and verifies all six root README files, language switcher links, install/verification signals, and placeholder-free localization. | Complete |
| Text sources should reject invisible-control smuggling. | `scripts/validate-content-safety.mjs` is included in `npm run check` and rejects bidi controls, zero-width controls, and non-BOM zero-width no-break spaces while preserving normal Unicode and README emoji. | Complete |
| GitHub Actions hardening should be machine-gated. | `scripts/validate-workflow-security.mjs` is included in `npm run check` and rejects tag-based action refs, missing `persist-credentials: false`, broad write permissions, `pull_request_target`, implicit dependency installs, and workflow-level push/release/auth commands. | Complete |
| Personal path leak detection should be maintainer-agnostic. | `scripts/validate-repo.mjs` and `scripts/security-audit.mjs` reject non-placeholder Windows drive, macOS, and Linux home paths in tracked source files. | Complete |
| ECC hook runtime import should stay blocked by default. | `scripts/security-audit.mjs` rejects Codex lifecycle hook runtime files and automatic session/additional-context injection patterns under templates and plugins unless a future reviewed change explicitly introduces them. | Complete |
| Source package handoff should be machine-gated. | `package.json` defines an explicit source package allowlist; `scripts/validate-package-surface.mjs` is included in `npm run check` and dry-runs `npm pack --json --ignore-scripts` with a repo-local cache while rejecting scratch output, local agent state, auth files, and archives. | Complete |
| Online skill verification should be bounded. | `scripts/verify-skill-sources.mjs --online` uses a repo-local npm cache and per-skill timeout so release verification returns a deterministic result instead of hanging indefinitely. | Complete |
