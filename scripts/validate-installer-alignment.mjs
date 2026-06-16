#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifests", "install-plan.json"), "utf8"));
const ps = fs.readFileSync(path.join(root, "scripts", "install.ps1"), "utf8");
const sh = fs.readFileSync(path.join(root, "scripts", "install.sh"), "utf8");

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
requireText(ps, "[switch]$NoBackup", "PowerShell installer");
requireText(ps, "[switch]$Interactive", "PowerShell installer");
requireText(ps, "[switch]$PlainOutput", "PowerShell installer");
requireText(ps, "SupportsShouldProcess", "PowerShell installer");
requireText(ps, "CODEX_HOME", "PowerShell installer");
requireText(ps, "AGENTS_HOME", "PowerShell installer");
requireText(ps, "Backup-Target", "PowerShell installer");
requireText(ps, "Assert-ManagedDirectoryTarget", "PowerShell installer");
requireText(ps, "Install-CodexConfig", "PowerShell installer");
requireText(ps, "merge-codex-config.mjs", "PowerShell installer");
requireText(ps, "Read-OptionalPath", "PowerShell installer");
requireText(ps, "Read-YesNo", "PowerShell installer");
requireText(ps, "Write-Section", "PowerShell installer");
requireText(ps, "Write-NameList", "PowerShell installer");
requireText(ps, "Capability board", "PowerShell installer");
requireText(ps, "npm run codex:status", "PowerShell installer");
requireText(ps, "templates\\codex", "PowerShell installer");
requireText(ps, "AGENTS.md", "PowerShell installer");
requireText(ps, "config.windows.toml", "PowerShell installer");
requireText(ps, "rules\\default.rules", "PowerShell installer");
requireText(ps, "agents", "PowerShell installer");
requireText(ps, "profiles", "PowerShell installer");
requireText(ps, "plugins\\codex-chef-workflows", "PowerShell installer");
requireText(ps, "marketplace.json", "PowerShell installer");
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
requireText(sh, "NO_BACKUP=0", "Bash installer");
requireText(sh, "DRY_RUN=0", "Bash installer");
requireText(sh, "PLAIN_OUTPUT=0", "Bash installer");
requireText(sh, "--plain-output", "Bash installer");
requireText(sh, "INTERACTIVE=0", "Bash installer");
requireText(sh, "--interactive", "Bash installer");
requireText(sh, "CODEX_HOME_DIR", "Bash installer");
requireText(sh, "AGENTS_HOME_DIR", "Bash installer");
requireText(sh, "backup_target", "Bash installer");
requireText(sh, "assert_managed_directory_target", "Bash installer");
requireText(sh, "install_codex_config", "Bash installer");
requireText(sh, "merge-codex-config.mjs", "Bash installer");
requireText(sh, "section()", "Bash installer");
requireText(sh, "action()", "Bash installer");
requireText(sh, "yes_no()", "Bash installer");
requireText(sh, "optional_path()", "Bash installer");
requireText(sh, "Capability board", "Bash installer");
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

if (failures.length > 0) {
  console.error("Installer alignment validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Installer alignment validation passed.");
