#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];

const requiredFiles = [
  "README.md",
  "README.de.md",
  "README.es.md",
  "README.fr.md",
  "README.pt-BR.md",
  "README.tr.md",
  "SECURITY.md",
  "llms.txt",
  "PRIVACY.md",
  "SUPPORT.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "AGENTS.md",
  "package.json",
  "docs/how-to.md",
  "docs/how-to.tr.md",
  "docs/troubleshooting.md",
  "docs/troubleshooting.tr.md",
  "docs/github-settings.md",
  "docs/github-settings.tr.md",
  "docs/upgrade.md",
  "docs/upgrade.tr.md",
  "docs/release-notes.md",
  "docs/release-notes.tr.md",
  "docs/seo.md",
  "docs/seo.tr.md",
  "docs/expected-output.md",
  "docs/expected-output.tr.md",
  "docs/ecc-compatibility.md",
  "docs/ecc-compatibility.tr.md",
  "docs/advisory-sources.md",
  "docs/advisory-sources.tr.md",
  "docs/best-practices.md",
  "docs/best-practices.tr.md",
  "docs/completion-audit.md",
  "docs/completion-audit.tr.md",
  "assets/icon.svg",
  "assets/banner.svg",
  "assets/social-preview.svg",
  "assets/workflow-overview.svg",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/docs_improvement.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/question.yml",
  ".github/pull_request_template.md",
  ".github/CODEOWNERS",
  ".github/dependabot.yml",
  ".github/workflows/validate.yml",
  ".gitleaks.toml",
  "catalog/mcp-servers.json",
  "catalog/routing-profiles.json",
  "catalog/agent-research-corpus.json",
  "catalog/agents.json",
  "catalog/skills.json",
  "catalog/skills-lock.json",
  "manifests/install-plan.json",
  "schemas/install-plan.schema.json",
  "schemas/install-state-preview.schema.json",
  "templates/codex/config.windows.toml",
  "templates/codex/config.unix.toml",
  "templates/codex/AGENTS.md",
  "templates/codex/rules/default.rules",
  "scripts/install.ps1",
  "scripts/install.sh",
  "scripts/plan-install.mjs",
  "scripts/codex-doctor.mjs",
  "scripts/codex-routing-board.mjs",
  "scripts/codex-status.mjs",
  "scripts/repair-install.mjs",
  "scripts/sync-doc-locales.mjs",
  "scripts/validate-doc-locales.mjs",
  "scripts/validate-readme-locales.mjs",
  "scripts/validate-workflow-security.mjs",
  "scripts/validate-install-plan.mjs",
  "scripts/validate-install-state-preview.mjs",
  "scripts/validate-installer-alignment.mjs",
  "scripts/validate-agent-config.mjs",
  "scripts/validate-agent-research-corpus.mjs",
  "scripts/validate-mcp-config.mjs",
  "scripts/validate-codex-doctor.mjs",
  "scripts/validate-codex-status.mjs",
  "scripts/validate-routing-profiles.mjs",
  "scripts/validate-repair-install.mjs",
  "scripts/validate-diagram-triplet.mjs",
  "scripts/validate-plugin-skills.mjs",
  "scripts/validate-package-surface.mjs",
  "scripts/validate-release-readiness.mjs",
  "scripts/verify-skill-sources.mjs",
  "scripts/scan-supply-chain-iocs.mjs",
  "scripts/security-audit.mjs",
  "plugins/codex-chef-workflows/.codex-plugin/plugin.json",
  "plugins/codex-chef-workflows/skills/codex-chef-operator/SKILL.md",
  "plugins/codex-chef-workflows/skills/codex-chef-operator/references/repo-maintenance.md",
  "plugins/codex-chef-workflows/skills/codex-chef-operator/agents/openai.yaml",
  "plugins/codex-chef-workflows/skills/offline-diagram-triplet/SKILL.md",
  "plugins/codex-chef-workflows/skills/offline-diagram-triplet/references/diagram-contract.md",
  "plugins/codex-chef-workflows/skills/offline-diagram-triplet/agents/openai.yaml",
  "plugins/codex-chef-workflows/skills/offline-diagram-triplet/scripts/render-diagram-triplet.mjs",
  "plugins/codex-chef-workflows/skills/context-budget-planner/SKILL.md",
  "plugins/codex-chef-workflows/skills/context-budget-planner/references/context-strategy.md",
  "plugins/codex-chef-workflows/skills/context-budget-planner/agents/openai.yaml",
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

const issueConfigPath = path.join(root, ".github/ISSUE_TEMPLATE/config.yml");
if (fs.existsSync(issueConfigPath)) {
  const issueConfig = fs.readFileSync(issueConfigPath, "utf8");
  if (!/blank_issues_enabled:\s*false/.test(issueConfig)) {
    failures.push(".github/ISSUE_TEMPLATE/config.yml must keep blank issues disabled so reporters use public-safe templates.");
  }
}

const codeownersPath = path.join(root, ".github/CODEOWNERS");
if (fs.existsSync(codeownersPath) && !fs.readFileSync(codeownersPath, "utf8").includes("@ucsahinn")) {
  failures.push(".github/CODEOWNERS must include the public repository owner @ucsahinn.");
}

const files = walk(root);
const mojibakePattern = new RegExp("[\\u00c3\\u00c4\\u00c5][^\\s/]|\\u00f0\\u0178|\\u00e2[\\u20ac\\u0153\\u201e\\u2122\\u0161\\u017e\\u0178]");

const docsDir = path.join(root, "docs");
if (fs.existsSync(docsDir)) {
  const docFiles = fs.readdirSync(docsDir).filter((file) => file.endsWith(".md"));
  const docSet = new Set(docFiles);
  const docLocaleSuffixes = ["de", "es", "pt-BR", "tr", "fr"];
  const localePattern = /\.(?:de|es|pt-BR|tr|fr)\.md$/;
  for (const file of docFiles) {
    if (localePattern.test(file)) {
      const english = file.replace(localePattern, ".md");
      if (!docSet.has(english)) {
        failures.push(`Missing English doc pair for docs/${file}: docs/${english}`);
      }
    } else {
      const slug = file.replace(/\.md$/, "");
      for (const locale of docLocaleSuffixes) {
        const localized = `${slug}.${locale}.md`;
        if (!docSet.has(localized)) {
          failures.push(`Missing localized doc pair for docs/${file}: docs/${localized}`);
        }
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

  if (mojibakePattern.test(text)) {
    failures.push(`Likely mojibake or corrupted UTF-8 text in ${rel}`);
  }

  const forbiddenLocalPaths = [
    /C:\\Users\\ulasc/i,
    /C:\/Users\/ulasc/i,
    /[A-Za-z]:[\\/]Users[\\/](?!user\b|username\b|you\b|yourname\b|yourusername\b)[A-Za-z0-9._-]+/i,
    /C:\\Users\\(?!user\b|username\b|you\b|yourname\b|yourusername\b)[A-Za-z0-9._-]+/i,
    /\/Users\/(?!user\b|username\b|you\b|yourname\b|yourusername\b)[A-Za-z0-9._-]+/i,
    /\/home\/(?!user\b|username\b|you\b|yourname\b|yourusername\b|runner\b)[A-Za-z0-9._-]+/i,
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

const installPlanPath = path.join(root, "manifests/install-plan.json");
if (fs.existsSync(installPlanPath)) {
  const installPlan = JSON.parse(fs.readFileSync(installPlanPath, "utf8"));
  const operationIds = new Set((installPlan.operations || []).map((operation) => operation.id));
  for (const profileName of ["default", "all"]) {
    const profile = installPlan.profiles?.[profileName];
    if (!Array.isArray(profile)) {
      failures.push(`Install plan missing ${profileName} profile.`);
      continue;
    }
    for (const operationId of profile) {
      if (!operationIds.has(operationId)) {
        failures.push(`Install plan profile ${profileName} references unknown operation: ${operationId}`);
      }
    }
  }
}

const packageJsonPath = path.join(root, "package.json");
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  if (!/^\d+\.\d+\.\d+$/.test(packageJson.version || "")) {
    failures.push("package.json version must be a plain semver release version.");
  } else {
    const version = packageJson.version;
    const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
    const releaseNotes = fs.readFileSync(path.join(root, "docs/release-notes.md"), "utf8");
    const releaseNotesTr = fs.readFileSync(path.join(root, "docs/release-notes.tr.md"), "utf8");
    if (!changelog.includes(`## ${version} - `)) {
      failures.push(`CHANGELOG.md must include a dated section for ${version}.`);
    }
    if (!releaseNotes.includes(`## v${version} - `)) {
      failures.push(`docs/release-notes.md must include a dated section for v${version}.`);
    }
    if (!releaseNotesTr.includes(`## v${version} - `)) {
      failures.push(`docs/release-notes.tr.md must include a dated section for v${version}.`);
    }
  }
}

const readmeText = [
  "README.md",
  "README.de.md",
  "README.es.md",
  "README.fr.md",
  "README.pt-BR.md",
  "README.tr.md"
].map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
for (const requiredPattern of [
  /README\.de\.md/,
  /README\.es\.md/,
  /README\.fr\.md/,
  /README\.pt-BR\.md/,
  /README\.tr\.md/,
  /Deutsch/,
  /Espa/,
  /Portugu/,
  /Fran/,
  /Türkçe/,
  /docs-6%20languages/,
  /six-language deep docs/i,
  /assets\/banner\.svg/,
  /assets\/workflow-overview\.svg/,
  /Trust Signals/,
  /Güven Sinyalleri/,
  /Advisory sources/,
  /Advisory kaynakları/
]) {
  if (!requiredPattern.test(readmeText)) {
    failures.push(`README.md missing required storefront signal: ${requiredPattern}`);
  }
}

const marketplacePath = path.join(root, ".agents/plugins/marketplace.json");
let marketplacePlugins = [];
if (fs.existsSync(marketplacePath)) {
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
  marketplacePlugins = marketplace.plugins || [];
  for (const plugin of marketplacePlugins) {
    const pluginPath = plugin?.source?.path;
    if (!pluginPath || !pluginPath.startsWith("./")) {
      failures.push(`Marketplace plugin ${plugin.name} must use a repo-relative ./ path`);
      continue;
    }
    if (!pluginPath.startsWith("./plugins/")) {
      failures.push(`Marketplace plugin ${plugin.name} must point at a concrete ./plugins/ subdirectory`);
    }
    const resolved = path.join(root, pluginPath.slice(2));
    if (!fs.existsSync(resolved)) {
      failures.push(`Marketplace plugin path does not exist: ${pluginPath}`);
    }
    if (!plugin?.interface?.displayName || !plugin?.interface?.shortDescription) {
      failures.push(`Marketplace plugin ${plugin.name} must include displayName and shortDescription metadata`);
    }
    if (plugin?.policy?.authentication !== "NONE") {
      failures.push(`Marketplace plugin ${plugin.name} must keep authentication NONE by default`);
    }
  }
}

const pluginManifest = path.join(root, "plugins/codex-chef-workflows/.codex-plugin/plugin.json");
if (fs.existsSync(pluginManifest)) {
  const plugin = JSON.parse(fs.readFileSync(pluginManifest, "utf8"));
  for (const forbiddenKey of ["hooks", "mcpServers", "apps"]) {
    if (Object.prototype.hasOwnProperty.call(plugin, forbiddenKey)) {
      failures.push(`Plugin manifest must not declare ${forbiddenKey}; authenticated or lifecycle surfaces stay disabled by default.`);
    }
  }
  const capabilities = plugin?.interface?.capabilities;
  if (Array.isArray(capabilities) && capabilities.some((capability) => String(capability).toLowerCase() === "write")) {
    failures.push("Plugin manifest must not declare Write interface capability by default.");
  }
  for (const key of ["name", "version", "description", "skills"]) {
    if (!plugin[key]) {
      failures.push(`Plugin manifest missing key: ${key}`);
    }
  }
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  if (plugin.version !== packageJson.version) {
    failures.push(`Plugin manifest version must match package.json version: ${plugin.version} !== ${packageJson.version}`);
  }
  if (typeof plugin.skills !== "string") {
    failures.push("Plugin manifest skills entry must be a string path.");
  } else {
    const skillsPath = path.resolve(path.dirname(pluginManifest), "..", plugin.skills);
    if (!fs.existsSync(skillsPath)) {
      failures.push(`Plugin manifest skills path does not exist: ${plugin.skills}`);
    }
  }
  const marketplacePlugin = marketplacePlugins.find((entry) => entry.name === plugin.name);
  if (!marketplacePlugin) {
    failures.push(`Plugin manifest ${plugin.name} must be listed in .agents/plugins/marketplace.json`);
  } else if (marketplacePlugin.source?.path !== "./plugins/codex-chef-workflows") {
    failures.push(`Marketplace path for ${plugin.name} must stay ./plugins/codex-chef-workflows`);
  }
}

const skillCatalog = path.join(root, "catalog/skills.json");
if (fs.existsSync(skillCatalog)) {
  const catalog = JSON.parse(fs.readFileSync(skillCatalog, "utf8"));
  for (const skill of catalog.skills || []) {
    if (skill.install === true) {
      if (!skill.package || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(skill.package)) {
        failures.push(`Installable skill must declare package as owner/repo: ${skill.name}`);
      }
      if (!skill.skill || /\s/.test(skill.skill)) {
        failures.push(`Installable skill must declare a single skill name: ${skill.name}`);
      }
      if (skill.source !== `${skill.package}@${skill.skill}`) {
        failures.push(`Installable skill source must equal package@skill for ${skill.name}`);
      }
      for (const key of ["sourceUrl", "license", "risk", "lastChecked"]) {
        if (!skill[key]) {
          failures.push(`Installable skill ${skill.name} must declare ${key}`);
        }
      }
    }
  }
}

const mcpCatalog = path.join(root, "catalog/mcp-servers.json");
if (fs.existsSync(mcpCatalog)) {
  const catalog = JSON.parse(fs.readFileSync(mcpCatalog, "utf8"));
  for (const server of catalog.servers || []) {
    for (const key of ["sourceUrl", "risk", "defaultReason"]) {
      if (!server[key]) {
        failures.push(`MCP server ${server.name} must declare ${key}`);
      }
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
