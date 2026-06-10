# Senior Codex Best Practices

This guide is the operating standard for keeping this starter useful after the
first install. It combines the official Codex surface model, the repository's
local validation gates, and lessons from adjacent prompt-engineering and
best-practice repositories.

Use it when you add a new skill, MCP, agent, profile, hook, installer option,
or public-facing document.

## Start Fast

| Goal | Use |
| --- | --- |
| Install the full starter | `./scripts/install.sh --all --force` or `.\scripts\install.ps1 -All -Force` |
| Understand what belongs where | The surface map below and [docs/codex-surfaces.md](codex-surfaces.md) |
| Add a reusable workflow | A skill first; package it as a plugin only when it should be installed as a bundle |
| Add live external context | An MCP server or connector, disabled by default when it needs auth |
| Add mechanical enforcement | A hook or validation script, not prose alone |
| Prepare for push or release | [docs/verification.md](verification.md), then the release gate |

## Source Quality

Prefer sources in this order:

1. Current official Codex documentation or the fetched Codex manual.
2. Repository evidence: scripts, templates, catalogs, CI, and installer output.
3. Closely related local repositories that already solved the same packaging or
   prompt-architecture problem.
4. External articles only for general engineering context, never as authority for
   Codex product behavior.

If a claim changes install behavior, security posture, connector access, or
release flow, it needs a repo-level verification step.

## Surface Map

| Need | Put it in |
| --- | --- |
| One-off task constraint | Current prompt |
| Durable repo convention | `AGENTS.md` |
| Personal/global Codex default | `~/.codex/AGENTS.md` or global config |
| Project sandbox, model, MCP, profile, hook, or tool default | `templates/codex/config.*.toml` |
| Repeatable task workflow | A skill with `SKILL.md`, optional scripts, references, and assets |
| Installable bundle | A plugin with `.codex-plugin/plugin.json` |
| Live private or external data | MCP server or app connector |
| Deterministic lifecycle check | Hook, validation script, or CI workflow |
| Push, release, package, or deploy proof | Verification docs, changelog, and release gate output |

Do not force every behavior into `AGENTS.md`. If a rule needs deterministic
enforcement, encode it in a script or hook. If a workflow needs reusable context,
make it a skill. If it needs tools or distribution, package it as a plugin.

## Senior Operating Loop

1. Inspect the real repository state before changing files.
2. Map unfamiliar areas before broad implementation.
3. Verify current APIs and product behavior from official or primary sources.
4. Implement the smallest coherent change that fixes the root problem.
5. Run the narrowest meaningful check first, then broader gates when the blast
   radius justifies it.
6. Review the diff for secrets, local state, generated artifacts, and unrelated
   churn.
7. Commit, push, publish, deploy, or tag only when the user explicitly asked.

## Skill And Package Rules

- `catalog/skills.json` is not a wishlist. Installable entries must be known
  package/skill pairs.
- Every installable skill must declare `package`, `skill`, and
  `source = package@skill`.
- The installer must call `npx skills add <package> --skill <skill> --yes --global`.
- Default checks stay offline and deterministic. Network checks are explicit:
  `npm run verify:skills:online`.
- Skills that are already local and not safely installable from a public package
  should remain `install: false` with a clear reason.

## Verification Gate

Before a maintainer tells another user that the setup is ready:

```bash
npm run check
git status --short
git diff --cached --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Before changing installable skill sources:

```bash
npm run verify:skills
npm run verify:skills:online
```

`verify:skills` is offline and safe for CI. `verify:skills:online` asks the
Skills CLI to resolve each installable package/skill pair without relying on
plain skill names that can be mistaken for repositories.

## Public-Safe Rules

- Never publish tokens, auth files, cookies, private keys, memories, sessions,
  machine-specific paths, local trust state, installers, archives, or build
  outputs.
- Keep authenticated MCPs disabled by default.
- Keep `package.json` private unless the repo is intentionally turned into an npm
  package.
- Public docs must say this is a community starter, not an official OpenAI
  product.
- English and Turkish docs stay paired.

## UI And Frontend Quality

When a task involves a website, app, dashboard, visual asset, or screenshot:

- Preserve existing content and brand first; improve hierarchy, spacing,
  responsiveness, states, and conversion clarity before adding new copy.
- Verify in a real browser or screenshot-capable flow when available.
- Check mobile width, long text, focus states, loading/empty/error states, and
  console errors.
- Use purposeful motion: short transform/opacity transitions, reduced-motion
  fallback, and no blocking decorative animation.

## Maintenance Checklist

- New docs have English and Turkish pairs.
- README first screen links to the correct operating docs.
- New catalog entries are validated by script, not just manually reviewed.
- Installer behavior is smoke-tested with temporary `CODEX_HOME` and
  `AGENTS_HOME`.
- Changelog records user-facing changes.
- Git status is inspected before staging, and only intentional files are staged.
