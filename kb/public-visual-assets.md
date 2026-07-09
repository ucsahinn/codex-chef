# Public Visual Assets

Use this article before adding screenshots, diagrams, social previews, or
README visuals.

## Current Public Assets

- `assets/icon.svg`
- `assets/banner.svg`
- `assets/workflow-overview.svg`
- `assets/social-preview.svg`
- `assets/social-preview.png`

The PNG social preview is validated as `1280x640` and must stay under 1 MB.
SVG assets need a title, description, lightweight motion, and reduced-motion
fallback.

## Screenshot Rule

Only commit screenshots when they are deliberate public documentation assets.
They must not contain:

- real usernames, local paths, tokens, logs, sessions, or memory content
- private browser tabs, accounts, tenant names, or repository secrets
- raw failing traces or terminal output with machine-specific state

Generated screenshots, Playwright reports, local traces, and review scratch
artifacts should stay ignored unless a maintainer explicitly approves a public
asset.

## Verification

```bash
npm run validate
git diff --check
gitleaks detect --redact --no-banner --no-git --verbose
```
