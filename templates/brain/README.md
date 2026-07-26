# Codex Chef Brain

Codex Chef Brain is a user-owned local Markdown vault for curated project knowledge, decisions, research, goals, and continuity. Obsidian is optional: every file remains readable and editable without it.

Start at `10-command-center/dashboard.md`. Use `00-inbox` for unprocessed captures, project-specific context under `30-projects`, formal decisions under `60-decisions`, and compact continuity notes under `80-memory`.

The vault must not contain credentials, raw environment dumps, runtime databases, or unbounded transcripts. Permanent writes require preview and user review.

On Windows, run `codex-brain status --json` after setup and permission changes.
A safe result requires both content and ACL security status to pass. The
CodexSandboxUsers read-only policy protects integrity but does not hide vault
files from Codex; keep confidential material in a separate owner-only location.
