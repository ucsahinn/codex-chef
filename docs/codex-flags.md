# Codex CLI Flags And Commands

This is a practical quick reference for the flags most relevant to this setup.
Use the official CLI reference as the source of truth:

https://developers.openai.com/codex/cli/reference

## Global Flags

| Flag | Use |
| --- | --- |
| `--cd`, `-C` | Start Codex in a specific working directory. |
| `--model`, `-m` | Override the configured model for one run. |
| `--ask-for-approval`, `-a` | Choose approval behavior such as `on-request` or `never`. |
| `--sandbox`, `-s` | Choose `read-only`, `workspace-write`, or `danger-full-access`. |
| `--config`, `-c` | Override a config key for one invocation. |
| `--profile`, `-p` | Layer `~/.codex/<profile>.config.toml` on top of the base config. |
| `--add-dir` | Grant an additional directory write access alongside the workspace. |
| `--image`, `-i` | Attach images to the initial prompt. |
| `--search` | Enable live web search for the run. |
| `--strict-config` | Fail on unrecognized config fields. Useful after template edits. |
| `--enable` / `--disable` | Toggle feature flags for one run. |
| `--oss` | Use the local open source model provider when configured. |
| `--remote` | Connect the TUI to an app-server endpoint. |
| `--remote-auth-token-env` | Read the remote bearer token from an environment variable. |
| `--dangerously-bypass-approvals-and-sandbox` | Do not use for normal local development. Use only inside a hardened throwaway environment. |
| `--dangerously-bypass-hook-trust` | Only for automation that already vets hook sources. |

## Common Commands

| Command | Use |
| --- | --- |
| `codex` | Launch the terminal UI. |
| `codex app` | Launch the desktop app. |
| `codex doctor --summary` | Diagnose install, config, auth, runtime, Git, and thread health. |
| `codex exec` | Run Codex non-interactively. |
| `codex features` | List and persist feature flags. |
| `codex mcp` | Manage MCP servers. |
| `codex plugin` | Install, list, and remove plugins. |
| `codex plugin marketplace` | Add, list, update, or remove plugin marketplaces. |
| `codex completion power-shell` | Generate PowerShell completions. |
| `codex debug models` | Inspect the model catalog Codex sees. |
| `codex execpolicy check` | Test rules against a command. |

## Recommended Local Defaults

Interactive work:

```bash
codex --sandbox workspace-write --ask-for-approval on-request
```

Review-only work:

```bash
codex --sandbox read-only --ask-for-approval never
```

Config validation:

```bash
codex --strict-config "Summarize the active setup."
```

Avoid `danger-full-access` and bypass flags unless the environment is
externally sandboxed and disposable.
