# Advisory Sources

This starter does not auto-enable external security feeds, authenticated
connectors, or scheduled scanners. It keeps advisory input reviewable and
human-gated.

## What To Check

| Area | Source | Use |
| --- | --- | --- |
| Codex behavior | https://developers.openai.com/codex/codex-manual.md | Confirm config, skills, MCP, hooks, rules, permissions, Windows, and noninteractive behavior. |
| Codex config reference | https://developers.openai.com/codex/config-reference#configtoml | Re-check config keys, agent role blocks, config_file paths, and safety boundaries. |
| OpenAI skills examples | https://github.com/openai/skills | Compare skill structure and progressive disclosure patterns. |
| MCP security | https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices | Review connector consent, auth, SSRF, and confused-deputy risks. |
| GitHub secret scanning | https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning | Validate current-tree and history-secret guidance. |
| GitHub Actions security | https://docs.github.com/en/actions/reference/security/secure-use | Keep workflow permissions and token exposure minimal. |
| Windows PowerShell safety | https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-shouldprocess | Preserve `-WhatIf` and `SupportsShouldProcess` installer behavior. |
| PowerShell execution policy | https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies | Keep install guidance process-scoped and avoid permanent policy relaxation by default. |
| Git global config | https://git-scm.com/docs/git-config | Re-check optional global Git guard behavior and `safe.directory` guidance. |
| GitHub supply chain | https://docs.github.com/en/code-security/concepts/supply-chain-security/about-supply-chain-security | Review dependency graph, dependency review, Dependabot, immutable release, and attestation guidance. |
| SLSA provenance | https://slsa.dev/spec/v1.2/ | Review source/build provenance and artifact verification expectations. |
| npm provenance and trusted publishing | https://docs.npmjs.com/generating-provenance-statements/ and https://docs.npmjs.com/trusted-publishers/ | Prefer provenance and tokenless OIDC publishing guidance over long-lived publish-token workflows. |
| Sigstore | https://docs.sigstore.dev/ | Review keyless signing, identity binding, and transparency-log verification claims. |
| Public starter comparison | https://github.com/affaan-m/ecc | Borrow manifest, validation, docs, and release-gate patterns only when they fit this Codex-only scope. |

## What Not To Automate By Default

- Credential or token discovery.
- Private account connector setup.
- GitHub repository settings changes.
- Package publication, release creation, or deployment.
- History rewriting or destructive cleanup.
- Global skill installation without explicit user approval.

## Release Use

Before tagging a release, rerun:

```bash
npm run check
npm run verify:skills:online
gitleaks detect --redact --no-banner --no-git --verbose
```

Then compare the current release notes and GitHub settings guidance with the
sources above. If a source changed materially, update the relevant docs,
templates, and validation before publishing.
