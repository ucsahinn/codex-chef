# Runtime Verification

Use this article after install, repair, or a release candidate update. The goal
is to prove that the files in this repository match the installed Codex runtime
without leaking private local state.

## Fast Checks

```bash
npm run validate
npm run codex:doctor
npm run codex:status
```

For a stricter installed-runtime check:

```bash
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run codex:status:all -- --plain --no-log
```

Use `--no-log` when you want an inspection path that does not write a repo-local
diagnostic log.

## What Counts As Evidence

- The validator exits successfully.
- Doctor/status output reports managed files, profiles, agents, skills, MCP
  defaults, and Git guard expectations clearly.
- Missing managed files, stale plugin files, MCP drift, skill drift, or Git guard
  drift are reported as failures rather than hidden warnings.
- Redacted output does not expose local usernames, auth files, tokens, session
  state, memory contents, or private paths.

## Common Failure Decisions

| Symptom | Decision |
| --- | --- |
| Validator fails on docs or package surface | Fix the repo before install or release work. |
| Runtime verifier reports managed-file drift | Run a repair preview before applying repair. |
| MCP catalog mismatch appears | Compare `catalog/mcp-servers.json` with both Codex config templates. |
| Skill source check fails online | Keep the release local until the source is reachable or intentionally updated. |
| Gitleaks reports a real secret | Rotate or revoke first, then plan cleanup. |

## Related Docs

- [Verification guide](../docs/verification.md)
- [Expected output](../docs/expected-output.md)
- [Local audit](../docs/local-audit.md)
- [Security model](../docs/security-model.md)
