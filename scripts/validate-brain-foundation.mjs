#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];
const requiredFiles = [
  "templates/brain/.codex-chef-brain.json",
  "templates/brain/.gitignore",
  "templates/brain/AGENTS.md",
  "templates/brain/README.md",
  "templates/brain/brain.config.json",
  "templates/brain/00-inbox/README.md",
  "templates/brain/10-command-center/dashboard.md",
  "templates/brain/20-goals/README.md",
  "templates/brain/30-projects/README.md",
  "templates/brain/40-knowledge/README.md",
  "templates/brain/50-research/README.md",
  "templates/brain/60-decisions/README.md",
  "templates/brain/70-personal/README.md",
  "templates/brain/80-memory/profile.md",
  "templates/brain/80-memory/current-context.md",
  "templates/brain/80-memory/active-threads.md",
  "templates/brain/80-memory/decisions.md",
  "templates/brain/80-memory/session-index.md",
  "templates/brain/90-archive/README.md",
  "templates/brain/templates/note.md",
  "schemas/brain-config.schema.json",
  "schemas/brain-candidate.schema.json",
  "schemas/brain-context-pack.schema.json",
  "schemas/brain-note.schema.json",
  "schemas/brain-operation-plan.schema.json",
  "manifests/brain-vault.json",
  "scripts/lib/brain-foundation.mjs",
  "scripts/lib/brain-permissions-windows.mjs",
  "scripts/brain-cli.mjs",
  "scripts/tests/brain-permissions-windows.test.mjs",
  "plugins/codex-chef-workflows/skills/codex-chef-brain/SKILL.md",
  "plugins/codex-chef-workflows/skills/codex-chef-brain/references/brain-protocol.md",
  "plugins/codex-chef-workflows/skills/codex-chef-brain/agents/openai.yaml",
  "docs/brain/README.md",
  "docs/brain/README.tr.md",
  "docs/decisions/002-brain-content-and-windows-acl-status.md"
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) failures.push(`Missing ${relativePath}`);
}

for (const relativePath of requiredFiles.filter((file) => file.endsWith(".json"))) {
  if (!fs.existsSync(path.join(root, relativePath))) continue;
  try {
    JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    failures.push(`Invalid JSON in ${relativePath}: ${error.message}`);
  }
}

for (const relativePath of [
  "plugins/codex-chef-workflows/skills/codex-chef-brain/SKILL.md",
  "plugins/codex-chef-workflows/skills/codex-chef-brain/references/brain-protocol.md",
  "docs/brain/README.md",
  "docs/brain/README.tr.md"
]) {
  const absolute = path.join(root, relativePath);
  if (fs.existsSync(absolute) && /\b(?:TODO|TBD|lorem ipsum)\b/i.test(fs.readFileSync(absolute, "utf8"))) {
    failures.push(`Unresolved authoring marker in ${relativePath}`);
  }
}

const templateRoot = path.join(root, "templates/brain");
if (fs.existsSync(templateRoot)) {
  const stack = [templateRoot];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolute);
        continue;
      }
      const text = fs.readFileSync(absolute, "utf8");
      if (/\{\{[^}]+\}\}/.test(text)) failures.push(`Unresolved placeholder in ${path.relative(root, absolute)}`);
      if (/\b(?:MEM0_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY)\s*[:=]\s*[^\s]+/i.test(text)) {
        failures.push(`Secret-like value in ${path.relative(root, absolute)}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Brain foundation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Brain foundation validation passed.");
