# Codex Chef SEO And Discoverability

This page keeps the public positioning honest and discoverable. The target is
not a false "rank first overnight" promise. Google says there are no automatic
secrets that guarantee first place, and changes can take from hours to months to
show impact. The practical goal is to help search engines, GitHub search, and
real users understand what Codex Chef is.

Date checked: 2026-06-15

Primary references:

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google title links guidance: https://developers.google.com/search/docs/appearance/title-link
- Google helpful content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- GitHub repository topics: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics

## Target Query Cluster

Use these terms naturally in README, docs, release notes, and GitHub metadata:

- Codex Chef
- Codex setup kit
- Codex starter
- Windows Codex setup
- OpenAI Codex CLI setup
- Codex agents
- Codex skills
- MCP connectors
- Windows PowerShell Codex installer
- safe Codex installer

Do not keyword-stuff. The README should still read like a useful setup guide.

## Recommended GitHub Metadata

Description:

```text
Codex Chef: Windows-first Codex setup kit with agents, skills, MCP connectors, safe installers, validation gates, and multilingual docs.
```

Topics, within GitHub's 20-topic limit:

```text
codex
codex-chef
openai
codex-cli
ai-agents
agent-skills
mcp
model-context-protocol
windows
powershell
developer-tools
security
starter-template
setup
automation
```

Social preview:

```text
assets/social-preview.png
```

## README Requirements

- H1 must be the brand: `Codex Chef`.
- The first paragraph must include the phrase `Windows-first Codex setup kit`.
- The repo must state it is an unofficial community starter and not an OpenAI
  product.
- Quickstart commands must be near the top and copy-pasteable.
- The install surface must list what writes to `~/.codex`, `~/.agents`, and
  optional Git global config.
- The docs list must expose install, verification, security, capability map,
  workflow surface map, knowledge base, and SEO/discoverability.
- Claims must be specific and verified: agent count, skill count, docs language
  count, validation gates, and release state.

## Search-Safe Claims

Good:

- "Windows-first Codex setup kit"
- "21 reviewed specialist agents"
- "safe installers with dry-run and backup behavior"
- "MCP connectors are least-privilege and authenticated connectors stay disabled by default"
- "six-language docs"

Avoid:

- "official OpenAI starter"
- "guaranteed first place on Google"
- "fully enterprise platform"
- "automatic deployment and production monitoring"
- "all external tools connected by default"

## Measurement

After publication:

1. Search GitHub for `topic:codex-chef`, `codex chef`, and `windows codex setup`.
2. Search Google with `site:github.com/vaultekbilisim/codex-chef Codex Chef`.
3. Check whether the README title, description, and social preview render as expected.
4. Update repository topics if a stronger exact-match topic emerges.
5. Do not rewrite the README repeatedly only for ranking; improve it when user
   questions or install friction reveal missing information.
