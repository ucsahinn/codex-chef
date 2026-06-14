# Expected Output

Installer output is intentionally quiet on success and detailed on failure.

## Install Plan Preview

Discovery output stays no-write and human-readable:

```text
Codex Enterprise Starter install profiles
Package: codex-enterprise-starter@0.3.0
Platform: windows

Profile | Operations | High risk | Optional flags
--- | ---: | ---: | ---
all | 12 | 4 | InstallGitGuards, InstallSkills
default | 7 | 0 | none
```

```text
Codex Enterprise Starter install plan
Platform: windows
Operations: ...

[file] codex-agents-md
  source: templates/codex/AGENTS.md
  target: .../.codex/AGENTS.md
  collision: skip-unless-force-backup-before-replace
  backup: yes
  force: no
  risk: medium
```

JSON output uses `schemaVersion:
codex-enterprise-starter.install-state-preview.v1` and does not write to global
Codex, Agents, or Git locations.

The JSON contract is documented in
`schemas/install-state-preview.schema.json` and verified by
`scripts/validate-install-state-preview.mjs`.

For publish-safe evidence, add `--redact-paths` so local home paths are shown as
placeholders:

```bash
node scripts/plan-install.mjs --all --json --redact-paths
```

## PowerShell Dry Run

```text
Codex home: ...
Agents home: ...
Dry run: no files, Git settings, or skills will be changed.
What if: Performing the operation ...
Codex Enterprise Starter dry run completed.
```

## PowerShell Success

```text
Codex home: ...
Agents home: ...
Installed ...
Codex Enterprise Starter installed.
Restart Codex, then run:
  codex doctor --summary
  codex --strict-config "Summarize the active Codex setup."
Backup: ...
```

Existing files are skipped unless `-Force` is used.

## Bash Dry Run

```text
Codex home: ...
Agents home: ...
Dry run: no files, Git settings, or skills will be changed.
Would install file from ...
Codex Enterprise Starter dry run completed.
```

## Bash Success

```text
Codex home: ...
Agents home: ...
Installed ...
Codex Enterprise Starter installed.
Restart Codex, then run:
  codex doctor --summary
  codex --strict-config "Summarize the active Codex setup."
Backup: ...
```

## Skill Installation

Successful skill installs print concise status lines:

```text
Skill already installed: ...
Installed skill: ...
```

Raw Skills CLI output is shown only when an install fails, so failures remain
debuggable without making successful Windows setup noisy.
