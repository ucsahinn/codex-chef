#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];

const requiredFiles = [
  "README.md",
  "README.tr.md",
  "SECURITY.md",
  "PRIVACY.md",
  "SUPPORT.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "AGENTS.md",
  "package.json",
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
  "catalog/mcp-servers.json",
  "catalog/skills.json",
  "templates/codex/config.windows.toml",
  "templates/codex/config.unix.toml",
  "templates/codex/AGENTS.md",
  "templates/codex/rules/default.rules",
  "scripts/install.ps1",
  "scripts/install.sh",
  "scripts/security-audit.mjs",
  "plugins/codex-enterprise-workflows/.codex-plugin/plugin.json",
  ".agents/plugins/marketplace.json"
];

const deniedFileNames = new Set([
  ".env",
  ".env.local",
  "id_rsa",
  "id_ed25519",
  "credentials.json",
  "auth.json"
]);

const deniedExtensions = new Set([
  ".pem",
  ".p12",
  ".pfx",
  ".kdbx",
  ".sqlite",
  ".sqlite3",
  ".db",
  ".dump",
  ".msi",
  ".exe",
  ".dmg",
  ".zip",
  ".tgz"
]);

const ignoredDirs = new Set([".git", ".serena", "node_modules", "dist", "build", "coverage", ".next", "tmp", "temp"]);

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
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

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
}

const files = walk(root);

const docsDir = path.join(root, "docs");
if (fs.existsSync(docsDir)) {
  const docFiles = fs.readdirSync(docsDir).filter((file) => file.endsWith(".md"));
  const docSet = new Set(docFiles);
  for (const file of docFiles) {
    if (file.endsWith(".tr.md")) {
      const english = file.replace(/\.tr\.md$/, ".md");
      if (!docSet.has(english)) {
        failures.push(`Missing English doc pair for docs/${file}: docs/${english}`);
      }
    } else {
      const turkish = file.replace(/\.md$/, ".tr.md");
      if (!docSet.has(turkish)) {
        failures.push(`Missing Turkish doc pair for docs/${file}: docs/${turkish}`);
      }
    }
  }
} else {
  failures.push("Missing docs directory.");
}

for (const file of files) {
  const rel = toPosix(path.relative(root, file));
  const base = path.basename(file);
  const ext = path.extname(file).toLowerCase();

  if (deniedFileNames.has(base) || deniedExtensions.has(ext)) {
    failures.push(`Denied file should not be versioned: ${rel}`);
  }

  const text = fs.readFileSync(file, "utf8");

  const forbiddenLocalPaths = [
    /C:\\Users\\ulasc/i,
    /C:\/Users\/ulasc/i,
    /\\\.codex\\sessions\\/i,
    /\/\.codex\/sessions\//i,
    /\\\.codex\\memories\\/i,
    /\/\.codex\/memories\//i
  ];
  for (const pattern of forbiddenLocalPaths) {
    if (pattern.test(text)) {
      failures.push(`Forbidden local state/path pattern in ${rel}: ${pattern}`);
    }
  }

  const riskyAssignments = [
    /(api[_-]?key|secret|token|password|private[_-]?key)\s*=\s*["'][^"']{12,}["']/i,
    /(api[_-]?key|secret|token|password|private[_-]?key)\s*:\s*["'][^"']{12,}["']/i,
    /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/
  ];
  for (const pattern of riskyAssignments) {
    if (pattern.test(text)) {
      failures.push(`Secret-like assignment or private key marker in ${rel}`);
    }
  }

  if (rel.endsWith(".toml")) {
    const tripleQuoteCount = (text.match(/"""/g) || []).length;
    if (tripleQuoteCount % 2 !== 0) {
      failures.push(`Unbalanced TOML triple-quoted string in ${rel}`);
    }
    if (/\[[^\]\r\n]*$/.test(text)) {
      failures.push(`Suspicious TOML table header in ${rel}`);
    }
  }

  if (rel.endsWith(".json")) {
    try {
      JSON.parse(text);
    } catch (error) {
      failures.push(`Invalid JSON in ${rel}: ${error.message}`);
    }
  }

  if (rel.endsWith("SKILL.md")) {
    if (!text.startsWith("---\n") || !/\nname:\s*[a-z0-9-]+/i.test(text) || !/\ndescription:\s*/i.test(text)) {
      failures.push(`Invalid skill front matter in ${rel}`);
    }
  }

  if (rel.startsWith("assets/") && rel.endsWith(".svg")) {
    if (!/<title[\s>]/.test(text) || !/<desc[\s>]/.test(text)) {
      failures.push(`SVG asset must include title and desc for accessibility: ${rel}`);
    }
    if (!/(?:@keyframes|<animate(?:Transform)?[\s>])/.test(text)) {
      failures.push(`SVG asset must include lightweight animation: ${rel}`);
    }
    if (!/prefers-reduced-motion/.test(text)) {
      failures.push(`SVG asset must include reduced-motion fallback: ${rel}`);
    }
  }
}

const readmeText = [
  fs.readFileSync(path.join(root, "README.md"), "utf8"),
  fs.readFileSync(path.join(root, "README.tr.md"), "utf8")
].join("\n");
for (const requiredPattern of [
  /README\.tr\.md/,
  /Türkçe/,
  /assets\/banner\.svg/,
  /assets\/workflow-overview\.svg/,
  /Trust Signals/,
  /Güven Sinyalleri/
]) {
  if (!requiredPattern.test(readmeText)) {
    failures.push(`README.md missing required storefront signal: ${requiredPattern}`);
  }
}

const marketplacePath = path.join(root, ".agents/plugins/marketplace.json");
if (fs.existsSync(marketplacePath)) {
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
  for (const plugin of marketplace.plugins || []) {
    const pluginPath = plugin?.source?.path;
    if (!pluginPath || !pluginPath.startsWith("./")) {
      failures.push(`Marketplace plugin ${plugin.name} must use a repo-relative ./ path`);
      continue;
    }
    const resolved = path.join(root, pluginPath.slice(2));
    if (!fs.existsSync(resolved)) {
      failures.push(`Marketplace plugin path does not exist: ${pluginPath}`);
    }
  }
}

const pluginManifest = path.join(root, "plugins/codex-enterprise-workflows/.codex-plugin/plugin.json");
if (fs.existsSync(pluginManifest)) {
  const plugin = JSON.parse(fs.readFileSync(pluginManifest, "utf8"));
  for (const key of ["name", "version", "description", "skills"]) {
    if (!plugin[key]) {
      failures.push(`Plugin manifest missing key: ${key}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validation passed. Checked ${files.length} files.`);
