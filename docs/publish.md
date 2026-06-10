# Publishing Checklist

The repository is designed to be public, but publishing is a separate user
decision.

## Before First Push

```bash
npm run validate
git status --short
git diff --cached
```

If Gitleaks is installed:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

## Create A Repository

Using GitHub CLI, after review and explicit approval:

```bash
gh repo create codex-enterprise-starter --public --source . --remote origin
git push -u origin main
```

Manual remote setup:

```bash
git remote add origin https://github.com/<owner>/codex-enterprise-starter.git
git push -u origin main
```

## Do Not Publish

- real credentials
- auth files
- generated Codex memory/session state
- user-specific `.codex` backups
- local project paths
- installers and release archives

## Release Artifacts

This setup kit is source-first. If you later create zip archives or installers,
publish those through GitHub Releases, not as regular source files.
