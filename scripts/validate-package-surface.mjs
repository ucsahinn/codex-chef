#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const failures = [];
const npmCacheDir = path.join(root, "tmp", "npm-cache");

function fail(message) {
  failures.push(message);
}

function posix(filePath) {
  return filePath.split(path.sep).join("/");
}

function runNpmPackDryRun() {
  fs.mkdirSync(npmCacheDir, { recursive: true });
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", "npm.cmd", "pack", "--dry-run", "--json", "--ignore-scripts"]
    : ["pack", "--dry-run", "--json", "--ignore-scripts"];
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
      NO_COLOR: "1",
      NPM_CONFIG_CACHE: npmCacheDir,
      TERM: "dumb",
      npm_config_cache: npmCacheDir,
      npm_config_loglevel: "error",
      npm_config_update_notifier: "false"
    },
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120000,
    windowsHide: true
  });
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.private !== true) {
  fail("package.json must keep private=true; this repo is source-first and must not be accidentally published.");
}
if (packageJson.publishConfig) {
  fail("package.json must not define publishConfig for this source-first starter.");
}
const requiredFileEntries = [
  ".agents/",
  ".github/",
  ".gitleaks.toml",
  "AGENTS.md",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "PRIVACY.md",
  "README.de.md",
  "README.es.md",
  "README.fr.md",
  "README.md",
  "README.pt-BR.md",
  "README.tr.md",
  "SECURITY.md",
  "SUPPORT.md",
  "assets/",
  "catalog/",
  "docs/",
  "manifests/",
  "plugins/",
  "schemas/",
  "scripts/",
  "templates/"
];
if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
  fail("package.json must define an explicit files allowlist for deterministic source package dry-runs.");
} else {
  const fileEntries = new Set(packageJson.files);
  for (const required of requiredFileEntries) {
    if (!fileEntries.has(required)) fail(`package.json files allowlist missing required entry: ${required}`);
  }
  for (const entry of packageJson.files) {
    const normalized = posix(entry).replace(/\/+$/, "");
    const absolute = path.join(root, normalized);
    if (!fs.existsSync(absolute)) fail(`package.json files allowlist references missing path: ${entry}`);
    if (/^(?:tmp|temp|node_modules|dist|build|coverage|\.next|out)(?:\/|$)/.test(normalized)) {
      fail(`package.json files allowlist must not include generated/scratch path: ${entry}`);
    }
    if (/^(?:\.serena|\.codex\/sessions|\.codex\/memories|\.codex\/cache|\.codex\/logs)(?:\/|$)/.test(normalized)) {
      fail(`package.json files allowlist must not include local agent state: ${entry}`);
    }
    if (/\.(?:zip|tar\.gz|tgz|msi|exe|dmg)$/i.test(normalized)) {
      fail(`package.json files allowlist must not include release/archive artifact: ${entry}`);
    }
  }
}
if (packageJson.scripts) {
  for (const [name, command] of Object.entries(packageJson.scripts)) {
    if (/\bnpm\s+publish\b|\bgh\s+release\s+create\b|\bgit\s+push\b/i.test(command)) {
      fail(`package.json script must not publish, release, or push: ${name}`);
    }
  }
}

const result = runNpmPackDryRun();
if (result.error) {
  fail(`npm pack dry-run failed: ${result.error.message}`);
} else if (result.status !== 0) {
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  fail(`npm pack dry-run failed: ${output || `exit ${result.status}`}`);
} else {
  let packs = [];
  try {
    packs = JSON.parse(result.stdout);
  } catch (error) {
    fail(`npm pack dry-run did not return JSON: ${error.message}`);
  }

  const files = packs.flatMap((pack) => pack.files || []).map((file) => posix(file.path || ""));
  const fileSet = new Set(files);

  for (const required of [
    "README.md",
    "README.tr.md",
    "README.de.md",
    "README.es.md",
    "README.fr.md",
    "README.pt-BR.md",
    ".agents/plugins/marketplace.json",
    ".github/workflows/validate.yml",
    "catalog/agents.json",
    "scripts/validate-content-safety.mjs",
    "scripts/validate-agent-config.mjs",
    "scripts/validate-package-surface.mjs",
    "scripts/validate-readme-locales.mjs",
    "scripts/validate-workflow-security.mjs",
    "manifests/install-plan.json",
    "catalog/mcp-servers.json"
  ]) {
    if (!fileSet.has(required)) fail(`npm pack dry-run surface missing required source file: ${required}`);
  }

  const forbiddenPathPatterns = [
    /^(?:tmp|temp|node_modules|dist|build|coverage|\.next|out)\//,
    /^(?:\.serena|\.codex\/sessions|\.codex\/memories|\.codex\/cache|\.codex\/logs)\//,
    /\.(?:zip|tar\.gz|tgz|msi|exe|dmg)$/i,
    /(?:^|\/)(?:auth|credentials|cookies)\.(?:json|toml|txt)$/i,
    /(?:^|\/)\.env(?:\.|$)/i
  ];

  for (const file of files) {
    for (const pattern of forbiddenPathPatterns) {
      if (pattern.test(file)) fail(`npm pack dry-run includes forbidden source surface path: ${file}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Package surface validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Package surface validation passed.");
