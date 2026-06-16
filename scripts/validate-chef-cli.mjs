#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function runNodeCheck(relativePath) {
  const result = spawnSync(process.execPath, ["--check", relativePath], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  if (result.error) {
    fail(`node --check failed for ${relativePath}: ${result.error.message}`);
  } else if (result.status !== 0) {
    fail(`node --check failed for ${relativePath}: ${result.stderr || result.stdout || `exit ${result.status}`}`);
  }
}

const cliPath = "scripts/chef-cli.mjs";
if (!exists(cliPath)) {
  fail(`Missing ${cliPath}`);
} else {
  const cli = read(cliPath);
  runNodeCheck(cliPath);

  for (const required of [
    "--help",
    "--json",
    "--plain",
    "--status",
    "--doctor",
    "--preview",
    "--reset",
    "--repair",
    "--install",
    "--skills",
    "--mcp",
    "--auth",
    "--logs",
    "--apply",
    "tmp/chef-cli/logs",
    "codex-status.mjs",
    "codex-doctor.mjs",
    "plan-install.mjs",
    "repair-install.mjs",
    "verify-install-runtime.mjs",
    "verify-skill-sources.mjs",
    "install.ps1",
    "install.sh",
    "Git Credential Manager",
    "gh auth login",
    "gh auth setup-git",
    "repo,workflow",
    "MENU_ITEMS",
    "runLoggedCommand",
    "confirmWriteAction",
    "selectSkill",
    "installSelectedSkill",
    "explainMcpServer",
    "redactLocalPaths",
    "redactSensitiveOutput",
    "[REDACTED_GITHUB_TOKEN]",
    "[REDACTED_CONNECTION_STRING]"
  ]) {
    if (!cli.includes(required)) fail(`${cliPath} missing required CLI surface: ${required}`);
  }

  for (const requiredLabel of [
    "Status",
    "Doctor",
    "Preview",
    "Install",
    "Reset",
    "Repair",
    "Skills",
    "MCP",
    "Auth",
    "Logs"
  ]) {
    if (!new RegExp(`\\b${requiredLabel}\\b`).test(cli)) fail(`${cliPath} missing menu label: ${requiredLabel}`);
  }

  for (const forbidden of [
    /\bRemove-Item\b/i,
    /\bdel\s+/i,
    /\brm\s+-rf\b/i,
    /\bgit\s+reset\b/i,
    /\bgit\s+clean\b/i,
    /\bgit\s+push\b/i,
    /\bgh\s+auth\s+token\b/i,
    /\bgit\s+credential-manager\s+get\b/i,
    /\bgh\s+release\s+create\b/i,
    /\bnpm\s+publish\b/i,
    /\bSet-Content\b/i,
    /\bOut-File\b/i
  ]) {
    if (forbidden.test(cli)) fail(`${cliPath} must not contain destructive or publishing command pattern: ${forbidden}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts || {};
const requiredScripts = {
  chef: "node scripts/chef-cli.mjs",
  "chef:status": "node scripts/chef-cli.mjs --status",
  "validate:chef-cli": "node scripts/validate-chef-cli.mjs"
};
for (const [name, command] of Object.entries(requiredScripts)) {
  if (scripts[name] !== command) fail(`package.json script ${name} must be exactly: ${command}`);
}
if (!String(scripts.check || "").includes("node scripts/validate-chef-cli.mjs")) {
  fail("package.json check script must include validate-chef-cli.mjs");
}

for (const [file, snippets] of Object.entries({
  "README.md": [
    "npm run chef",
    "npm run chef -- --status",
    "npm run chef -- --preview",
    "npm run chef -- --reset --apply",
    "npm run chef -- --repair --apply",
    "npm run chef -- --install --apply",
    "npm run chef -- --skills",
    "npm run chef -- --mcp",
    "npm run chef -- --auth",
    "npm run chef -- --logs",
    "gh auth login --hostname github.com --git-protocol https --web --scopes repo,workflow",
    "gh auth setup-git --hostname github.com"
  ],
  "README.tr.md": [
    "npm run chef",
    "npm run chef -- --status",
    "npm run chef -- --preview",
    "npm run chef -- --reset --apply",
    "npm run chef -- --repair --apply",
    "npm run chef -- --install --apply",
    "npm run chef -- --skills",
    "npm run chef -- --mcp",
    "npm run chef -- --auth",
    "npm run chef -- --logs",
    "gh auth login --hostname github.com --git-protocol https --web --scopes repo,workflow",
    "gh auth setup-git --hostname github.com"
  ],
  "docs/verification.md": [
    "npm run validate:chef-cli",
    "npm run chef -- --status",
    "npm run chef -- --preview"
  ],
  "docs/verification.tr.md": [
    "npm run validate:chef-cli",
    "npm run chef -- --status",
    "npm run chef -- --preview"
  ]
})) {
  const text = read(file);
  for (const snippet of snippets) {
    if (!text.includes(snippet)) fail(`${file} missing Codex Chef CLI documentation snippet: ${snippet}`);
  }
}

runNodeCheck("scripts/validate-chef-cli.mjs");

if (failures.length > 0) {
  console.error("Codex Chef CLI validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Codex Chef CLI validation passed.");
