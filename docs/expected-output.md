# Expected Output

Installer output is intentionally quiet on success and detailed on failure.

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
