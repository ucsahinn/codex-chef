# Expected Output

Installer output is intentionally concise on success and detailed on failure.
PowerShell uses readable icons by default and supports `-PlainOutput` for
ASCII-only terminals.

## Install Plan Preview

Discovery output stays no-write and human-readable:

```text
Codex Chef install profiles
Package: codex-chef@0.5.47
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

## Routing Board

```text
Codex Chef enterprise routing board
Profiles: 12
Policy: task-shape routing names matching specialists, selects matching skills when applicable, and may spawn bounded local subagents when the current runtime permits delegation; risky actions remain approval-gated.

Subagent visibility contract:
- Agent plan: name each requested agent, scope, reason, expected output, and wait policy before spawning.
- Agent started: show the visible agent name or nickname and assigned task after spawning.
- Agent result: wait for requested subagent results before continuing unless the user explicitly asks for background work.
- Skill selected: name every selected skill and why it matches the task before acting on it.
- MCP selected: name every selected MCP/tool surface, why it is needed, and whether it is read-only or approval-gated.
- Surfaces used: agents=..., skills=..., mcp=..., commands=..., skipped=...
```

For one profile:

```bash
npm run chef -- --routing --profile starter-health --plain --no-log
```

## PowerShell Non-Interactive Dry Run

```text
[*] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks
  - Skills: install reviewed catalog entries with --agent codex
  - Git guards: disabled by default
  - Dry run: no files, Git settings, or skills will be changed

[*] Managed Codex files
What if: Performing the operation ...

[*] Curated skills
  - would install skill: dependency-upgrade from wshobson/agents --skill dependency-upgrade
  - ...
  - Skipped skill installation because -WhatIf is active

[*] Capability board
  - Agents ready (21):
    code_mapper, docs_researcher, ...
  - MCP ready by default (7):
    sequential-thinking, context7, ...
  - MCP opt-in / disabled by default (9):
    github, figma, ...
  - MCP setup notes (14):
    context7 [tooling]: Requires npm/npx network access on first startup; no credential is required., ...
  - Local plugin skills (3):
    codex-chef-operator, context-budget-planner, ...
  - Reviewed global skills (16):
    dependency-upgrade, gh-fix-ci, ...
  - Enterprise routing profiles (12):
    repo-map-before-change, current-docs-research, ...
  - Account, database, production, broad filesystem, and broad/destructive graph-indexing connectors stay disabled until explicitly enabled.

[*] Next steps
  - completed: Codex Chef dry run
```

## PowerShell Interactive Dry Run

```text
[chef] Guided setup
  - Press Enter to accept the safe default shown in brackets.
  - No tokens, secrets, cookies, sessions, or credentials are requested.
Codex home [...]:
Agents home [...]:
Install or reconcile the 16 reviewed global Codex skills now? [Y/n]:
Replace existing managed Codex Chef files after backup instead of preserving/merging? [y/N]:
Install optional global Git guards for this Windows user? [y/N]:

[chef] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks
  - Skills: install reviewed catalog entries with --agent codex
  - Git guards: disabled by default
  - Dry run: no files, Git settings, or skills will be changed
  - Existing config policy: backup + merge missing Codex Chef blocks unless Force is enabled
  - Account, database, production, broad filesystem, and broad/destructive graph-indexing connectors stay disabled until explicitly enabled.
Continue with this plan? [Y/n]:
```

## PowerShell Success

```text
[chef] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks

[chef] Managed Codex files
  [ok] installed: ...

[chef] Capability board
  - Agents ready (21):
    code_mapper, docs_researcher, ...
  - MCP ready by default (7):
    sequential-thinking, context7, ...
  - MCP opt-in / disabled by default (9):
    github, figma, ...
  - MCP setup notes (14):
    context7 [tooling]: Requires npm/npx network access on first startup; no credential is required., ...
  - Local plugin skills (3):
    codex-chef-operator, context-budget-planner, ...
  - Reviewed global skills (16):
    dependency-upgrade, gh-fix-ci, ...
  - Enterprise routing profiles (12):
    repo-map-before-change, current-docs-research, ...
  - Account, database, production, broad filesystem, and broad/destructive graph-indexing connectors stay disabled until explicitly enabled.

[chef] Next steps
  - 28 existing managed target(s) were preserved; use -Force only for a deliberate backup-backed replacement
  [ok] completed: Codex Chef install
  - Restart Codex, then run:
    codex doctor --summary
    npm run codex:routing
    npm run codex:status
    npm run verify:install:runtime
    codex exec --strict-config "Summarize the active Codex setup."
  - Backup: ...
```

Existing `config.toml` is backed up and merged unless `-Force` is used; other
existing managed files are skipped unless `-Force` is used.

## Repair Preview

```text
Codex Chef repair
Mode: plan
Overall: attention
Codex home: ...
Agents home: ...
Managed files: 36/37 current, 1 planned, 0 applied
Config: current
Marketplace: planned
Skills: 94 unique installed (16 curated expected, 0 missing, 78 non-curated, 3 duplicate names)
Action: planned copy-file .../.codex/rules/default.rules
Action: planned update-marketplace-entry .../.agents/plugins/marketplace.json
Warning: 78 non-curated global skill(s) are installed; repair reports them but does not delete user skills.
```

JSON output uses `schemaVersion: codex-chef.repair.v1`. `-Repair -WhatIf` and
`npm run repair:install -- --json` stay no-write. `-Repair` and
`npm run repair:install -- --apply` create backups before fixing managed drift.

## Status Board

```text
Codex Chef status
Overall: attention
Use: npm run chef (or npm run chef -- --status --repo-only --no-log for no repo-local log)
Numbered menu: yes; write actions require --apply or typed confirmation.

Effective controls: multi_agent=true, max_depth=1, approval=on-request, sandbox=workspace-write, network=restricted, hooks=true, managed hooks=advisory_only, apps default=false/destructive=false/open_world=false
Context budget: reasoning=medium, summary=auto, verbosity=medium, compact=not inspected, tool_output=not inspected
Token-safe profile: available=yes, active=no, target=low/none/low/64000/6000. For repo-wide or long-running work, run Codex with --profile token-safe or merge token-safe.config.toml; this lowers verbosity, default reasoning, compaction, and tool-output ceilings without disabling skills, agents, MCPs, memory, hooks, or apps.

MCP setup:
MCP setup note: codebase-memory [local-state] - Requires Node/npx first-run package download; keeps local repository graph state on this machine. Indexing, destructive graph, and admin tools stay prompt-gated or disabled.
```

## Bash Dry Run

```text
[*] Codex Chef installer
  - Codex home: ...
  - Agents home: ...
  - Mode: preserve existing files; merge missing config blocks
  - Dry run: no files, Git settings, or skills will be changed

[*] Managed Codex files
Would install file from ...

[*] Capability board
  - Agents ready (21):
    code_mapper, docs_researcher, ...
  - MCP ready by default (7):
    sequential-thinking, context7, ...
  - MCP opt-in / disabled by default (9):
    github, figma, ...
  - MCP setup notes (14):
    context7 [tooling]: Requires npm/npx network access on first startup; no credential is required., ...
  - Local plugin skills (3):
    codex-chef-operator, context-budget-planner, ...
  - Reviewed global skills (16):
    dependency-upgrade, gh-fix-ci, ...
  - Enterprise routing profiles (12):
    repo-map-before-change, current-docs-research, ...
  - Account, database, production, broad filesystem, and broad/destructive graph-indexing connectors stay disabled until explicitly enabled.

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

[*] Capability board
  - Agents ready (21):
    code_mapper, docs_researcher, ...
  - MCP ready by default (7):
    sequential-thinking, context7, ...
  - MCP opt-in / disabled by default (9):
    github, figma, ...
  - MCP setup notes (14):
    context7 [tooling]: Requires npm/npx network access on first startup; no credential is required., ...
  - Local plugin skills (3):
    codex-chef-operator, context-budget-planner, ...
  - Reviewed global skills (16):
    dependency-upgrade, gh-fix-ci, ...
  - Enterprise routing profiles (12):
    repo-map-before-change, current-docs-research, ...
  - Account, database, production, broad filesystem, and broad/destructive graph-indexing connectors stay disabled until explicitly enabled.

[*] Next steps
  - 28 existing managed target(s) were preserved; use --force only for a deliberate backup-backed replacement
  - completed: Codex Chef install
  - Restart Codex, then run:
    codex doctor --summary
    npm run codex:routing
    npm run codex:status
    npm run verify:install:runtime
    codex exec --strict-config "Summarize the active Codex setup."
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
