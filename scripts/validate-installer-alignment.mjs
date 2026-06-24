#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspectMarketplaceEntry, writeMarketplaceEntry } from "./upsert-marketplace-entry.mjs";

const root = path.resolve(process.cwd());
const failures = [];

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifests", "install-plan.json"), "utf8"));
const ps = fs.readFileSync(path.join(root, "scripts", "install.ps1"), "utf8");
const sh = fs.readFileSync(path.join(root, "scripts", "install.sh"), "utf8");
const marketplaceHelper = fs.readFileSync(path.join(root, "scripts", "upsert-marketplace-entry.mjs"), "utf8");

function fail(message) {
  failures.push(message);
}

function requireText(text, snippet, label) {
  if (!text.includes(snippet)) fail(`${label} missing snippet: ${snippet}`);
}

function requireRegex(text, pattern, label) {
  if (!pattern.test(text)) fail(`${label} missing pattern: ${pattern}`);
}

function operation(id) {
  return manifest.operations.find((item) => item.id === id);
}

function runMarketplaceHelperSmokes() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-marketplace-"));
  const marketplacePath = path.join(fixtureRoot, "agents", "plugins", "marketplace.json");
  const pluginTarget = path.join(fixtureRoot, "codex", "plugins", "codex-chef-workflows");
  fs.mkdirSync(path.dirname(marketplacePath), { recursive: true });

  fs.writeFileSync(
    marketplacePath,
    `${JSON.stringify(
      {
        name: "personal",
        plugins: [
          {
            name: "other-plugin",
            source: { source: "local", path: "C:/other/plugin" },
            policy: { installation: "AVAILABLE", authentication: "NONE" },
            category: "Testing",
            interface: { displayName: "Other Plugin", shortDescription: "Must survive." }
          },
          {
            name: "codex-chef-workflows",
            source: { source: "local", path: "C:/old/plugin" },
            policy: { installation: "AVAILABLE", authentication: "NONE" },
            category: "Productivity",
            interface: { displayName: "Codex Chef Workflows", shortDescription: "Security-first Codex setup maintenance workflow." }
          }
        ]
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  const before = inspectMarketplaceEntry(marketplacePath, pluginTarget);
  if (!before.changed) fail("Marketplace helper smoke must detect stale Codex Chef plugin path.");

  writeMarketplaceEntry(marketplacePath, pluginTarget);
  const written = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
  const other = written.plugins.find((plugin) => plugin.name === "other-plugin");
  const chef = written.plugins.find((plugin) => plugin.name === "codex-chef-workflows");
  if (!other || other.interface?.displayName !== "Other Plugin") {
    fail("Marketplace helper smoke must preserve unrelated plugin entries and interface metadata.");
  }
  if (!chef || chef.source?.path !== pluginTarget) {
    fail("Marketplace helper smoke must update the Codex Chef plugin path.");
  }
  if (chef.interface?.shortDescription !== "Security-first Codex setup maintenance workflow.") {
    fail("Marketplace helper smoke must preserve Codex Chef interface metadata.");
  }
  const after = inspectMarketplaceEntry(marketplacePath, pluginTarget);
  if (after.changed) fail("Marketplace helper smoke must report current after write.");

  const invalidPath = path.join(fixtureRoot, "invalid-marketplace.json");
  fs.writeFileSync(invalidPath, "{not-json", "utf8");
  try {
    inspectMarketplaceEntry(invalidPath, pluginTarget);
    fail("Marketplace helper smoke must fail closed on invalid JSON.");
  } catch {
    // Expected.
  }

  const badShapePath = path.join(fixtureRoot, "bad-shape-marketplace.json");
  fs.writeFileSync(badShapePath, JSON.stringify({ name: "bad", plugins: "not-an-array" }), "utf8");
  try {
    inspectMarketplaceEntry(badShapePath, pluginTarget);
    fail("Marketplace helper smoke must fail closed when plugins is not an array.");
  } catch {
    // Expected.
  }

  const bomPath = path.join(fixtureRoot, "bom-marketplace.json");
  fs.writeFileSync(bomPath, `\uFEFF${JSON.stringify({ name: "bom", plugins: [] })}`, "utf8");
  try {
    inspectMarketplaceEntry(bomPath, pluginTarget);
  } catch {
    fail("Marketplace helper smoke must accept valid UTF-8 JSON with a BOM.");
  }
}

for (const id of manifest.profiles.default || []) {
  if (!operation(id)) fail(`Default profile references missing operation: ${id}`);
}

for (const id of manifest.profiles.all || []) {
  if (!operation(id)) fail(`All profile references missing operation: ${id}`);
}

const requiredOperations = [
  "codex-agents-md",
  "codex-config",
  "codex-rules",
  "codex-agents",
  "codex-profiles",
  "codex-plugin",
  "plugin-marketplace",
  "git-ignore-global",
  "git-pre-commit-hook",
  "git-config-excludesfile",
  "git-config-hooks-path",
  "curated-skills"
];

for (const id of requiredOperations) {
  if (!operation(id)) fail(`Manifest missing installer-covered operation: ${id}`);
}

requireText(ps, "[switch]$All", "PowerShell installer");
requireText(ps, "[switch]$InstallSkills", "PowerShell installer");
requireText(ps, "[switch]$InstallGitGuards", "PowerShell installer");
requireText(ps, "[switch]$Force", "PowerShell installer");
requireText(ps, "[switch]$Repair", "PowerShell installer");
requireText(ps, "[switch]$NoBackup", "PowerShell installer");
requireText(ps, "[switch]$Interactive", "PowerShell installer");
requireText(ps, "[switch]$PlainOutput", "PowerShell installer");
requireText(ps, "SupportsShouldProcess", "PowerShell installer");
requireText(ps, "CODEX_HOME", "PowerShell installer");
requireText(ps, "AGENTS_HOME", "PowerShell installer");
requireText(ps, "Backup-Target", "PowerShell installer");
requireText(ps, "Assert-ManagedDirectoryTarget", "PowerShell installer");
requireText(ps, "Sync managed directory files from", "PowerShell installer");
requireText(ps, "synced directory", "PowerShell installer");
requireText(ps, "Install-CodexConfig", "PowerShell installer");
requireText(ps, "merge-codex-config.mjs", "PowerShell installer");
requireText(ps, "repair-install.mjs", "PowerShell installer");
requireText(ps, "Read-OptionalPath", "PowerShell installer");
requireText(ps, "Resolve-InstallPath", "PowerShell installer");
requireText(ps, "Read-YesNo", "PowerShell installer");
requireText(ps, "Write-Section", "PowerShell installer");
requireText(ps, "Write-NameList", "PowerShell installer");
requireText(ps, "Capability board", "PowerShell installer");
requireText(ps, "catalog\\routing-profiles.json", "PowerShell installer");
requireText(ps, "Enterprise routing profiles", "PowerShell installer");
requireText(ps, "npm run codex:routing", "PowerShell installer");
requireText(ps, "npm run codex:status", "PowerShell installer");
requireText(ps, "templates\\codex", "PowerShell installer");
requireText(ps, "AGENTS.md", "PowerShell installer");
requireText(ps, "config.windows.toml", "PowerShell installer");
requireText(ps, "rules\\default.rules", "PowerShell installer");
requireText(ps, "agents", "PowerShell installer");
requireText(ps, "profiles", "PowerShell installer");
requireText(ps, "plugins\\codex-chef-workflows", "PowerShell installer");
requireText(ps, "marketplace.json", "PowerShell installer");
requireText(ps, "upsert-marketplace-entry.mjs", "PowerShell installer");
requireText(ps, "Upsert Codex Chef plugin marketplace entry", "PowerShell installer");
requireText(ps, "Cannot update plugin marketplace because it is invalid or unreadable", "PowerShell installer");
requireText(ps, "successful dry run or install", "PowerShell installer");
requireRegex(ps, /exit\s+0\s*$/m, "PowerShell installer");
requireText(ps, "templates\\git\\.gitignore_global", "PowerShell installer");
requireText(ps, "templates\\git\\pre-commit", "PowerShell installer");
requireText(ps, "core.excludesfile", "PowerShell installer");
requireText(ps, "core.hooksPath", "PowerShell installer");
requireText(ps, "catalog\\skills.json", "PowerShell installer");
requireText(ps, "skills list --global --json", "PowerShell installer");
requireText(ps, '"--agent", "codex", "--yes", "--global"', "PowerShell installer");
requireRegex(ps, /if\s*\(\$All\)\s*\{[\s\S]*\$InstallSkills\s*=\s*\$true[\s\S]*\}/, "PowerShell installer");
const psAllBlock = ps.match(/if\s*\(\$All\)\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body || "";
if (/\$InstallGitGuards\s*=\s*\$true/.test(psAllBlock)) {
  fail("PowerShell -All must not enable InstallGitGuards; global Git guards require the explicit InstallGitGuards flag.");
}
requireRegex(ps, /if\s*\(\$InstallGitGuards\)\s*\{[\s\S]*core\.excludesfile[\s\S]*core\.hooksPath[\s\S]*\}/, "PowerShell installer");
requireRegex(ps, /if\s*\(\$InstallSkills\)\s*\{[\s\S]*"skills",\s*"add"[\s\S]*"--agent",\s*"codex"[\s\S]*"--yes"[\s\S]*"--global"[\s\S]*\}/, "PowerShell installer");

requireText(sh, "INSTALL_SKILLS=0", "Bash installer");
requireText(sh, "INSTALL_GIT_GUARDS=0", "Bash installer");
requireText(sh, "ALL=0", "Bash installer");
requireText(sh, "FORCE=0", "Bash installer");
requireText(sh, "REPAIR=0", "Bash installer");
requireText(sh, "NO_BACKUP=0", "Bash installer");
requireText(sh, "DRY_RUN=0", "Bash installer");
requireText(sh, "PLAIN_OUTPUT=0", "Bash installer");
requireText(sh, "--plain-output", "Bash installer");
requireText(sh, "--repair", "Bash installer");
requireText(sh, "INTERACTIVE=0", "Bash installer");
requireText(sh, "--interactive", "Bash installer");
requireText(sh, "require_command()", "Bash installer");
requireText(sh, "Required command not found for Codex Chef Bash install", "Bash installer");
requireText(sh, "CODEX_HOME_DIR", "Bash installer");
requireText(sh, "AGENTS_HOME_DIR", "Bash installer");
requireText(sh, "backup_target", "Bash installer");
requireText(sh, "assert_managed_directory_target", "Bash installer");
requireText(sh, "sync managed directory files from", "Bash installer");
requireText(sh, "synced directory", "Bash installer");
requireText(sh, "install_codex_config", "Bash installer");
requireText(sh, "merge-codex-config.mjs", "Bash installer");
requireText(sh, "repair-install.mjs", "Bash installer");
requireText(sh, "section()", "Bash installer");
requireText(sh, "action()", "Bash installer");
requireText(sh, "yes_no()", "Bash installer");
requireText(sh, "optional_path()", "Bash installer");
requireText(sh, "normalize_install_path()", "Bash installer");
requireText(sh, "Capability board", "Bash installer");
requireText(sh, "catalog/routing-profiles.json", "Bash installer");
requireText(sh, "Enterprise routing profiles", "Bash installer");
requireText(sh, "npm run codex:routing", "Bash installer");
requireText(sh, "npm run codex:status", "Bash installer");
requireText(sh, "catalog/mcp-servers.json", "Bash installer");
requireText(sh, "templates/codex", "Bash installer");
requireText(sh, "AGENTS.md", "Bash installer");
requireText(sh, "config.unix.toml", "Bash installer");
requireText(sh, "rules/default.rules", "Bash installer");
requireText(sh, "/agents", "Bash installer");
requireText(sh, "/profiles", "Bash installer");
requireText(sh, "plugins/codex-chef-workflows", "Bash installer");
requireText(sh, "marketplace.json", "Bash installer");
requireText(sh, "upsert-marketplace-entry.mjs", "Bash installer");
requireText(sh, "Would upsert Codex Chef plugin marketplace entry", "Bash installer");
requireText(sh, "Cannot update plugin marketplace because it is invalid or unreadable", "Bash installer");
requireText(sh, "Backup failed; refusing to replace managed target without a backup", "Bash installer");
requireText(sh, "Failed to replace existing managed directory", "Bash installer");
requireText(sh, "templates/git/.gitignore_global", "Bash installer");
requireText(sh, "templates/git/pre-commit", "Bash installer");
requireText(sh, "core.excludesfile", "Bash installer");
requireText(sh, "core.hooksPath", "Bash installer");
requireText(sh, "catalog/skills.json", "Bash installer");
requireText(sh, "\"skills\", \"list\", \"--global\", \"--json\"", "Bash installer");
requireText(sh, "\"--agent\", \"codex\", \"--yes\", \"--global\"", "Bash installer");
requireRegex(sh, /if \[ "\$ALL" -eq 1 \]; then[\s\S]*INSTALL_SKILLS=1[\s\S]*fi/, "Bash installer");
const shAllBlock = sh.match(/if \[ "\$ALL" -eq 1 \]; then(?<body>[\s\S]*?)\nfi/)?.groups?.body || "";
if (/INSTALL_GIT_GUARDS=1/.test(shAllBlock)) {
  fail("Bash --all must not enable INSTALL_GIT_GUARDS; global Git guards require the explicit --install-git-guards flag.");
}
requireRegex(sh, /if \[ "\$INSTALL_GIT_GUARDS" -eq 1 \]; then[\s\S]*core\.excludesfile[\s\S]*core\.hooksPath[\s\S]*fi/, "Bash installer");
requireRegex(sh, /if \[ "\$INSTALL_SKILLS" -eq 1 \]; then[\s\S]*"skills", "add"[\s\S]*"--agent", "codex"[\s\S]*"--yes", "--global"[\s\S]*fi/, "Bash installer");

const allProfile = new Set(manifest.profiles.all || []);
for (const id of ["git-ignore-global", "git-pre-commit-hook", "git-config-excludesfile", "git-config-hooks-path"]) {
  if (allProfile.has(id)) {
    fail(`All profile must not include ${id}; global Git guards require the explicit InstallGitGuards flag.`);
  }
}

for (const op of manifest.operations) {
  if (op.requiresFlag === "InstallSkills" && op.id !== "curated-skills") {
    fail(`Only curated-skills should require InstallSkills: ${op.id}`);
  }
  if (op.requiresFlag === "InstallGitGuards" && !op.id.startsWith("git-")) {
    fail(`Only git operations should require InstallGitGuards: ${op.id}`);
  }
}

const marketplaceOperation = operation("plugin-marketplace");
if (marketplaceOperation?.collision !== "upsert-entry-with-backup") {
  fail("plugin-marketplace collision must be upsert-entry-with-backup.");
}
if (!/unrelated marketplace plugins are preserved/i.test(marketplaceOperation?.conflictPolicy || "")) {
  fail("plugin-marketplace conflictPolicy must promise unrelated marketplace plugins are preserved.");
}
const pluginOperation = operation("codex-plugin");
if (pluginOperation?.collision !== "sync-managed-files-preserve-extras-backup-before-sync") {
  fail("codex-plugin collision must sync managed files while preserving extras.");
}
if (!/extra files are preserved/i.test(pluginOperation?.conflictPolicy || "")) {
  fail("codex-plugin conflictPolicy must promise extra files are preserved by default.");
}
requireText(marketplaceHelper, ".agents", "Marketplace upsert helper");
requireText(marketplaceHelper, "sourceMarketplacePath", "Marketplace upsert helper");
requireText(marketplaceHelper, "--check", "Marketplace upsert helper");
requireText(marketplaceHelper, "--write", "Marketplace upsert helper");
requireText(marketplaceHelper, "stableJson", "Marketplace upsert helper");
runMarketplaceHelperSmokes();

if (failures.length > 0) {
  console.error("Installer alignment validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Installer alignment validation passed.");
