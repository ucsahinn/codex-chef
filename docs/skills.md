# Codex Chef Skills

[English](skills.md) | [Türkçe](skills.tr.md)

A skill is the **how** in a Codex workflow. It packages focused instructions,
references, and optional scripts so Codex can repeat a job without rebuilding
the process from scratch.

Codex uses progressive disclosure: it starts with a skill's name and
description, then reads the full `SKILL.md` only when the task matches or you
invoke the skill directly. That is why this catalog distinguishes what is
bundled, what the full install profile can add, and what remains an optional
reference.

Official Codex reference: [Build skills](https://developers.openai.com/codex/skills)

## 🍱 Six Bundled Workflows

These live in the Codex Chef plugin and travel with the repository.

| Skill | Use it for |
| --- | --- |
| [`codex-chef-operator`](../plugins/codex-chef-workflows/skills/codex-chef-operator/SKILL.md) | Keep this starter aligned without weakening installer or security boundaries. |
| [`codex-chef-brain`](../plugins/codex-chef-workflows/skills/codex-chef-brain/SKILL.md) | Preview, capture, retrieve, back up, and restore selected project knowledge in a user-owned Markdown vault. |
| [`context-budget-planner`](../plugins/codex-chef-workflows/skills/context-budget-planner/SKILL.md) | Plan sources, token use, compaction handoff, and verification for broad work. |
| [`adaptive-agent-routing`](../plugins/codex-chef-workflows/skills/adaptive-agent-routing/SKILL.md) | Select the narrowest useful agent, skill, MCP, and wait policy without spawning by default. |
| [`external-review-workflow`](../plugins/codex-chef-workflows/skills/external-review-workflow/SKILL.md) | Prepare a secret-safe, hash-pinned manual review handoff without uploading anything automatically. |
| [`offline-diagram-triplet`](../plugins/codex-chef-workflows/skills/offline-diagram-triplet/SKILL.md) | Turn Mermaid source into editable Excalidraw, SVG, PNG, and Markdown assets without network access. |

## ✅ Sixteen Reviewed Full-Install Skills

These entries have `install: true` in the catalog. They are eligible for the
full install profile; the catalog pins the package/skill pair and the online
verification checks that the pair still resolves.

| Skill | What it adds | Source |
| --- | --- | --- |
| `dependency-upgrade` | Staged dependency upgrades with compatibility checks. | [wshobson/agents](https://github.com/wshobson/agents) |
| `gh-fix-ci` | Official OpenAI workflow for investigating failed GitHub Actions checks. | [openai/skills](https://github.com/openai/skills) |
| `systematic-debugging` | Root-cause investigation before changing code. | [obra/superpowers](https://github.com/obra/superpowers) |
| `request-refactor-plan` | Small, working steps for broad refactors. | [mattpocock/skills](https://github.com/mattpocock/skills) |
| `security-best-practices` | Official OpenAI secure-default guidance for supported stacks. | [openai/skills](https://github.com/openai/skills) |
| `frontend-skill` | A broad frontend production workflow. | [nexu-io/open-design](https://github.com/nexu-io/open-design) |
| `webapp-testing` | Browser evidence, screenshots, and logs for local web apps. | [anthropics/skills](https://github.com/anthropics/skills) |
| `web-quality-audit` | Performance, accessibility, SEO, and best-practice checks. | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) |
| `seo` | Crawlability, metadata, structured data, sitemaps, and discoverability. | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) |
| `accessibility` | Keyboard, focus, forms, ARIA, semantics, and WCAG-oriented review. | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills) |
| `test-driven-development` | Focused behavior tests before implementation. | [obra/superpowers](https://github.com/obra/superpowers) |
| `documentation-and-adrs` | README, ADR, and durable project documentation work. | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) |
| `mcp-builder` | MCP tool, schema, transport, and evaluation design. | [anthropics/skills](https://github.com/anthropics/skills) |
| `ai-project-starter` | AI-coding-ready project context, starter docs, and guardrails. | [ucsahinn/ai-project-starter](https://github.com/ucsahinn/ai-project-starter) |
| `prompt-architect` | Plan-first, approval-aware Codex prompts and prompt audits. | [ucsahinn/prompt-architect](https://github.com/ucsahinn/prompt-architect) |
| `ai-skill-create` | Create, validate, forward-test, and package Codex skills and plugins. | [ucsahinn/ai-skill-create](https://github.com/ucsahinn/ai-skill-create) |

## 🧰 Other Cataloged Workflows

The following names remain discoverable, but Codex Chef does not automatically
install them. Some are local compatibility names; others are specialized
upstream options intentionally kept out of the default skill list.

<details>
<summary><strong>Debugging, implementation, review, and release</strong></summary>

- `investigate`, `incident-triage`, `new-feature`, `refactor-plan`,
  `test-backfill`, `performance-audit`, `db-migration-review`,
  `release-verify`, `code-review`, `sentry-code-review`, `codex-pr-body`,
  `babysit-pr`, and `open-pr`
- `git-hygiene`, `security-check`, and `security-threat-model`

</details>

<details>
<summary><strong>Frontend, browser, and hosting references</strong></summary>

- `impeccable`, `design-taste-frontend`, `image-to-code`,
  `high-end-visual-design`, and `web-design-guidelines`
- `vercel-react-best-practices`, `vercel-optimize`,
  `vercel-cli-with-tokens`, and `playwright`

</details>

<details>
<summary><strong>Context, prompts, memory, and MCP setup</strong></summary>

- `mcp-connectors`, `context-map`, `what-context-needed`,
  `prompt-engineering-patterns`, `ai-prompt-engineering-safety-review`, and
  `memory-safety-patterns`

</details>

## What “Cataloged” Does And Does Not Mean

- A catalog entry is reviewed metadata, not proof that the skill is installed.
- A bundled skill lives in this repository's plugin.
- An `install: true` entry is eligible for the full install profile.
- A manual reference may overlap with a default skill or require credentials,
  vendor setup, or a more specialized task.
- Skills do not execute by themselves. Codex selects one when the task matches
  or when you explicitly invoke it.

The machine-readable source is
[`catalog/skills.json`](../catalog/skills.json). Reviewed install targets are
mirrored in [`catalog/skills-lock.json`](../catalog/skills-lock.json).

Return to [the README](../README.md) or continue with
[agents](agents.md) and [MCPs](mcp-catalog.md).
