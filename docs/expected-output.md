# Expected Output

Installer output is intentionally concise on success and detailed on failure.
PowerShell uses readable icons by default and supports `-PlainOutput` for
ASCII-only terminals.

## Install Plan Preview

Discovery output stays no-write and human-readable:

```text
Codex Chef install profiles
Package: codex-chef@0.5.9
Platform: windows

Profile | Operations | High risk | Optional flags
--- | ---: | ---: | ---
all | 8 | 1 | InstallSkills
default | 7 | 0 | none
```

```text
Codex Chef install plan
Platform: windows
Operations: ...

[file] codex-config
  source: templates/codex/config.windows.toml
  target: .../.codex/config.toml
  collision: merge-missing-blocks-unless-force-backup-before-replace
  backup: yes
  force: no
  risk: medium
```

JSON output uses `schemaVersion:
codex-chef.install-state-preview.v1` and does not write to global
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
🍳 Codex Chef installer
  • Codex home: ...
  • Agents home: ...
  • Mode: preserve existing files; merge missing config blocks
  • Dry run: no files, Git settings, or skills will be changed

🍳 Managed Codex files
What if: Performing the operation ...

🍳 Next steps
  ✓ completed: Codex Chef dry run
```

## PowerShell Success

```text
🍳 Codex Chef installer
  • Codex home: ...
  • Agents home: ...
  • Mode: preserve existing files; merge missing config blocks

🍳 Managed Codex files
  ✓ installed: ...

🍳 Next steps
  • 28 existing managed target(s) were preserved; use -Force only for a deliberate backup-backed replacement
  ✓ completed: Codex Chef install
  • Restart Codex, then run:
    codex doctor --summary
    npm run verify:install:runtime
    codex --strict-config "Summarize the active Codex setup."
  • Backup: ...
```

Existing `config.toml` is backed up and merged unless `-Force` is used; other
existing managed files are skipped unless `-Force` is used.

## Bash Dry Run

```text
[*] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks
  - Dry run: no files, Git settings, or skills will be changed

[*] Managed Codex files
Would install file from ...

[*] Next steps
  - completed: Codex Chef dry run
```

## Bash Success

```text
[*] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks

[*] Managed Codex files
  - installed: ...

[*] Next steps
  - 28 existing managed target(s) were preserved; use --force only for a deliberate backup-backed replacement
  - completed: Codex Chef install
  - Restart Codex, then run:
    codex doctor --summary
    npm run verify:install:runtime
    codex --strict-config "Summarize the active Codex setup."
  - Backup: ...
```

## Skill Installation

Successful skill installs print concise status lines:

```text
Skill already installed: ...
Installed skill: ...
```

Raw Skills CLI output is shown only when an install fails, so failures remain
debuggable without making successful Windows setup noisy.
