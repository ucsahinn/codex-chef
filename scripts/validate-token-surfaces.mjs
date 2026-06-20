#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readTomlString(block, key) {
  const match = block.match(new RegExp(`^${key}\\s*=\\s*"([^"]*)"\\s*$`, "m"));
  return match ? match[1] : null;
}

for (const rel of [
  "scripts/analyze-token-surfaces.mjs",
  "scripts/validate-token-surfaces.mjs",
  "templates/codex/profiles/token-safe.config.toml"
]) {
  if (!exists(rel)) fail(`Missing token optimization surface: ${rel}`);
}

if (exists("package.json")) {
  const packageJson = JSON.parse(read("package.json"));
  const scripts = packageJson.scripts || {};
  if (scripts["token:audit"] !== "node scripts/analyze-token-surfaces.mjs") {
    fail("package.json must expose token:audit as node scripts/analyze-token-surfaces.mjs.");
  }
  if (scripts["token:audit:json"] !== "node scripts/analyze-token-surfaces.mjs --json") {
    fail("package.json must expose token:audit:json as node scripts/analyze-token-surfaces.mjs --json.");
  }
  if (scripts["validate:tokens"] !== "node scripts/validate-token-surfaces.mjs") {
    fail("package.json must expose validate:tokens as node scripts/validate-token-surfaces.mjs.");
  }
  if (!String(scripts.check || "").includes("node scripts/validate-token-surfaces.mjs")) {
    fail("package.json check script must include node scripts/validate-token-surfaces.mjs.");
  }
}

if (exists(".github/workflows/validate.yml")) {
  const workflow = read(".github/workflows/validate.yml");
  for (const required of [
    "node --check scripts/analyze-token-surfaces.mjs",
    "node --check scripts/validate-token-surfaces.mjs"
  ]) {
    if (!workflow.includes(required)) fail(`validate workflow must include ${required}.`);
  }
}

if (exists("templates/codex/profiles/token-safe.config.toml")) {
  const profile = read("templates/codex/profiles/token-safe.config.toml");
  for (const required of [
    'model_reasoning_effort = "low"',
    'model_reasoning_summary = "none"',
    'model_verbosity = "low"',
    "model_auto_compact_token_limit = 64000",
    "tool_output_token_limit = 6000"
  ]) {
    if (!profile.includes(required)) fail(`token-safe profile must include ${required}`);
  }
  for (const forbidden of [
    /approval_policy\s*=\s*"never"/,
    /sandbox_mode\s*=\s*"danger-full-access"/,
    /multi_agent\s*=\s*false/,
    /apps\s*=\s*false/,
    /memories\s*=\s*false/,
    /hooks\s*=\s*false/,
    /\[mcp_servers\.[^\]]+\][\s\S]*?enabled\s*=\s*false/
  ]) {
    if (forbidden.test(profile)) fail(`token-safe profile must not disable core capability: ${forbidden}`);
  }
}

if (exists("templates/codex/AGENTS.md")) {
  const agents = read("templates/codex/AGENTS.md");
  for (const required of [
    "## Token Budget Discipline",
    "context-budget-planner",
    "Do not disable skills, MCP servers, subagents, memory, hooks, or app support",
    "Close completed subagent threads"
  ]) {
    if (!agents.includes(required)) fail(`templates/codex/AGENTS.md missing token guidance: ${required}`);
  }
}

if (exists("plugins/codex-chef-workflows/skills/context-budget-planner/references/context-strategy.md")) {
  const strategy = read("plugins/codex-chef-workflows/skills/context-budget-planner/references/context-strategy.md");
  for (const required of ["npm run token:audit", "token-safe.config.toml", "model/reasoning pin"]) {
    if (!strategy.includes(required)) fail(`context-budget strategy missing: ${required}`);
  }
}

for (const rel of [
  "README.md",
  "README.tr.md",
  "README.de.md",
  "README.es.md",
  "README.fr.md",
  "README.pt-BR.md",
  "docs/verification.md",
  "docs/verification.tr.md"
]) {
  if (exists(rel) && !read(rel).includes("npm run token:audit")) {
    fail(`${rel} must document npm run token:audit.`);
  }
}

for (const rel of [
  "README.md",
  "README.tr.md",
  "README.de.md",
  "README.es.md",
  "README.fr.md",
  "README.pt-BR.md"
]) {
  const text = exists(rel) ? read(rel) : "";
  if (!text.includes("token-safe.config.toml")) {
    fail(`${rel} must document token-safe.config.toml.`);
  }
  if (!text.includes("model/reasoning")) {
    fail(`${rel} must document automatic agent model/reasoning selection.`);
  }
}

for (const rel of ["docs/verification.md", "docs/verification.tr.md"]) {
  if (exists(rel) && !read(rel).includes("scripts/validate-token-surfaces.mjs")) {
    fail(`${rel} must document scripts/validate-token-surfaces.mjs.`);
  }
}

for (const rel of [
  "docs/how-to.md",
  "docs/how-to.tr.md",
  "docs/install.md",
  "docs/install.tr.md",
  "docs/security-model.md",
  "docs/security-model.tr.md",
  "docs/upgrade.md",
  "docs/upgrade.tr.md"
]) {
  if (exists(rel) && !read(rel).includes("token-safe.config.toml")) {
    fail(`${rel} must document token-safe.config.toml.`);
  }
}

for (const rel of ["docs/how-to.md", "docs/how-to.tr.md", "docs/install.md", "docs/install.tr.md"]) {
  const text = exists(rel) ? read(rel) : "";
  if (!text.includes("model/reasoning")) {
    fail(`${rel} must document automatic agent model/reasoning selection.`);
  }
}

for (const rel of ["docs/install.md", "docs/install.tr.md"]) {
  const text = exists(rel) ? read(rel) : "";
  if (!text.includes("npm run chef -- --backups --backup <id> --restore --apply")) {
    fail(`${rel} must document backup restore through the Chef CLI.`);
  }
}

if (exists("catalog/agents.json")) {
  const catalog = JSON.parse(read("catalog/agents.json"));
  for (const agent of catalog.agents || []) {
    if (agent.modelSelection !== "auto") fail(`Agent ${agent.name} must declare modelSelection auto.`);
    if (agent.modelReasoningEffort !== "auto") fail(`Agent ${agent.name} must declare modelReasoningEffort auto.`);
    const templatePath = `templates/codex/${agent.configFile}`;
    if (!exists(templatePath)) continue;
    const template = read(templatePath);
    if (readTomlString(template, "model")) fail(`Agent template must not pin model when catalog modelSelection is auto: ${agent.name}`);
    if (readTomlString(template, "model_reasoning_effort")) {
      fail(`Agent template must not pin model_reasoning_effort when catalog modelReasoningEffort is auto: ${agent.name}`);
    }
  }
}

if (exists("scripts/analyze-token-surfaces.mjs")) {
  const analyzer = read("scripts/analyze-token-surfaces.mjs");
  for (const required of ["runtime-startup", "agent-role", "skill-trigger", "skill-deferred", "chars/4"]) {
    if (!analyzer.includes(required)) fail(`Token analyzer missing expected category or note: ${required}`);
  }
}

if (failures.length > 0) {
  console.error("Token surface validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Token surface validation passed.");
