#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];
const warnings = [];

const ignoredDirs = new Set([".git", ".serena", "node_modules", "dist", "build", "coverage", ".next", "tmp", "temp"]);
const requiredPublicFiles = [
  "README.md",
  "README.tr.md",
  "SECURITY.md",
  "PRIVACY.md",
  "SUPPORT.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "CHANGELOG.md",
  "docs/how-to.md",
  "docs/how-to.tr.md",
  "docs/completion-audit.md",
  "docs/completion-audit.tr.md",
  "assets/banner.svg",
  "assets/workflow-overview.svg",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/docs_improvement.yml",
  ".github/pull_request_template.md",
  ".github/dependabot.yml",
  ".github/workflows/validate.yml"
];

const externalMcpServers = ["github", "figma", "linear", "notion", "sentry", "vercel", "supabase", "filesystem"];

function posix(filePath) {
  return filePath.split(path.sep).join("/");
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

for (const file of requiredPublicFiles) {
  if (!exists(file)) failures.push(`Missing public-readiness file: ${file}`);
}

const docsDir = path.join(root, "docs");
if (fs.existsSync(docsDir)) {
  const docFiles = fs.readdirSync(docsDir).filter((file) => file.endsWith(".md"));
  const docSet = new Set(docFiles);
  for (const file of docFiles) {
    if (file.endsWith(".tr.md")) {
      const english = file.replace(/\.tr\.md$/, ".md");
      if (!docSet.has(english)) failures.push(`Missing English doc pair for docs/${file}: docs/${english}`);
    } else {
      const turkish = file.replace(/\.md$/, ".tr.md");
      if (!docSet.has(turkish)) failures.push(`Missing Turkish doc pair for docs/${file}: docs/${turkish}`);
    }
  }
} else {
  failures.push("Missing docs directory.");
}

const files = walk(root);

const secretPatterns = [
  { name: "OpenAI/API key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { name: "GitHub token", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/ },
  { name: "GitHub fine-grained token", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: "Slack token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: "AWS access key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Private key marker", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { name: "Long secret assignment", pattern: /\b(?:api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*["'][^"']{16,}["']/i }
];

const forbiddenStatePatterns = [
  { name: "local Windows user path", pattern: /C:\\Users\\ulasc|C:\/Users\/ulasc/i },
  { name: "Codex sessions", pattern: /(?:^|[\\/])\.codex[\\/]sessions[\\/]/i },
  { name: "Codex memories", pattern: /(?:^|[\\/])\.codex[\\/]memories[\\/]/i },
  { name: "auth file", pattern: /(?:^|[\\/])(?:auth|credentials|cookies)\.(?:json|toml|txt)$/i }
];

for (const file of files) {
  const rel = posix(path.relative(root, file));
  const text = fs.readFileSync(file, "utf8");

  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(text)) failures.push(`${name} pattern found in ${rel}`);
  }

  for (const { name, pattern } of forbiddenStatePatterns) {
    if (pattern.test(rel) || pattern.test(text)) failures.push(`${name} pattern found in ${rel}`);
  }
}

const readme = read("README.md");
if (!/unofficial community starter/i.test(readme)) {
  failures.push("README.md must clearly state this is an unofficial community starter.");
}
if (!/official Codex documentation/i.test(readme)) {
  failures.push("README.md must state that guidance is based on official Codex documentation.");
}

for (const configFile of ["templates/codex/config.windows.toml", "templates/codex/config.unix.toml"]) {
  const config = read(configFile);
  if (!/approval_policy\s*=\s*"on-request"/.test(config)) {
    failures.push(`${configFile} must keep approval_policy = "on-request"`);
  }
  if (!/sandbox_mode\s*=\s*"workspace-write"/.test(config)) {
    failures.push(`${configFile} must keep sandbox_mode = "workspace-write"`);
  }
  if (!/network_access\s*=\s*false/.test(config)) {
    failures.push(`${configFile} must keep workspace network access disabled`);
  }
  for (const server of externalMcpServers) {
    const block = config.match(new RegExp(`\\[mcp_servers\\.${server}\\]([\\s\\S]*?)(?=\\n\\[|$)`));
    if (!block) {
      failures.push(`${configFile} missing MCP block for ${server}`);
      continue;
    }
    if (!/enabled\s*=\s*false/.test(block[1])) {
      failures.push(`${configFile} must keep ${server} disabled by default`);
    }
  }
}

const catalog = JSON.parse(read("catalog/mcp-servers.json"));
for (const server of catalog.servers || []) {
  if (["external-account", "database", "filesystem"].includes(server.category) && server.defaultEnabled !== false) {
    failures.push(`MCP catalog must keep ${server.name} disabled by default`);
  }
  if (server.auth && server.auth !== "none" && server.defaultEnabled !== false) {
    failures.push(`Authenticated MCP ${server.name} must not be enabled by default`);
  }
}

const packageJson = JSON.parse(read("package.json"));
if (packageJson.private !== true) {
  failures.push("package.json must keep private=true to prevent accidental npm publish.");
}

if (!read(".gitignore").includes("tmp/")) warnings.push(".gitignore should ignore tmp/ smoke-test output.");

if (failures.length > 0) {
  console.error("Security audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const warning of warnings) console.warn(`Warning: ${warning}`);
console.log(`Security audit passed. Checked ${files.length} files, ${catalog.servers.length} MCP entries.`);
