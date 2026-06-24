#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];

function fail(message) {
  failures.push(message);
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function read(target) {
  return fs.readFileSync(target, "utf8");
}

function runInstaller(codexHome, agentsHome) {
  const env = {
    ...process.env,
    CODEX_HOME: codexHome,
    AGENTS_HOME: agentsHome,
    FORCE_COLOR: "0",
    NO_COLOR: "1"
  };

  if (process.platform === "win32") {
    return spawnSync("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      ".\\scripts\\install.ps1",
      "-PlainOutput"
    ], {
      cwd: root,
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      timeout: 180000
    });
  }

  return spawnSync("bash", [
    "scripts/install.sh",
    "--plain-output"
  ], {
    cwd: root,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180000
  });
}

function runInstallerPreview(codexHome, agentsHome) {
  const env = {
    ...process.env,
    CODEX_HOME: codexHome,
    AGENTS_HOME: agentsHome,
    FORCE_COLOR: "0",
    NO_COLOR: "1"
  };

  if (process.platform === "win32") {
    return spawnSync("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      ".\\scripts\\install.ps1",
      "-All",
      "-WhatIf",
      "-PlainOutput"
    ], {
      cwd: root,
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      timeout: 180000
    });
  }

  return spawnSync("bash", [
    "scripts/install.sh",
    "--all",
    "--dry-run",
    "--plain-output"
  ], {
    cwd: root,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180000
  });
}

function assertIncludes(text, snippet, label) {
  if (!text.includes(snippet)) fail(`${label} missing snippet: ${snippet}`);
}

function assertRootAssignment(text, key, expectedValue, label) {
  const firstTableIndex = text.search(/^\s*\[/m);
  const rootText = firstTableIndex >= 0 ? text.slice(0, firstTableIndex) : text;
  const pattern = new RegExp(`^${key}\\s*=\\s*${expectedValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m");
  if (!pattern.test(rootText)) {
    fail(`${label} must define root-level ${key} = ${expectedValue}.`);
  }
}

function assertFileExists(target, label) {
  if (!fs.existsSync(target)) fail(`${label} missing expected file: ${target}`);
}

function canonicalPathForCompare(target) {
  const resolved = path.resolve(target || "");
  const real = fs.existsSync(resolved)
    ? fs.realpathSync.native(resolved)
    : resolved;
  const normalized = real.replace(/[\\/]+/g, "/").replace(/\/+$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function assertInstalledBaseline(codexHome, agentsHome, label) {
  const configPath = path.join(codexHome, "config.toml");
  const agentsPath = path.join(codexHome, "AGENTS.md");
  const rulesPath = path.join(codexHome, "rules", "default.rules");
  const marketplacePath = path.join(agentsHome, "plugins", "marketplace.json");
  const pluginManifestPath = path.join(codexHome, "plugins", "codex-chef-workflows", ".codex-plugin", "plugin.json");
  const expectedProfiles = [
    "ci.config.toml",
    "development.config.toml",
    "review.config.toml",
    "token-safe.config.toml"
  ];
  const expectedAgents = JSON.parse(read(path.join(root, "catalog", "agents.json"))).agents.map((agent) => `${agent.name}.toml`);

  assertFileExists(configPath, `${label} explicit CODEX_HOME`);
  assertFileExists(agentsPath, `${label} explicit CODEX_HOME`);
  assertFileExists(rulesPath, `${label} explicit CODEX_HOME`);
  assertFileExists(pluginManifestPath, `${label} explicit CODEX_HOME`);
  assertFileExists(marketplacePath, `${label} explicit AGENTS_HOME`);
  for (const profile of expectedProfiles) {
    assertFileExists(path.join(codexHome, profile), `${label} profile install`);
  }
  for (const agent of expectedAgents) {
    assertFileExists(path.join(codexHome, "agents", agent), `${label} specialist agent install`);
  }

  if (fs.existsSync(configPath)) {
    const config = read(configPath);
    assertIncludes(config, 'approval_policy = "on-request"', `${label} config`);
    assertIncludes(config, 'sandbox_mode = "workspace-write"', `${label} config`);
    assertIncludes(config, 'model_reasoning_effort = "medium"', `${label} config`);
    assertIncludes(config, "multi_agent = true", `${label} config`);
    assertIncludes(config, '[agents.code_mapper]', `${label} config`);
    assertIncludes(config, '[agents.codex_doctor]', `${label} config`);
    assertRootAssignment(config, "approval_policy", '"on-request"', `${label} config`);
    assertRootAssignment(config, "sandbox_mode", '"workspace-write"', `${label} config`);
    assertRootAssignment(config, "model_reasoning_effort", '"medium"', `${label} config`);
    assertIncludes(config, "[mcp_servers.openaiDeveloperDocs]", `${label} config`);
    assertIncludes(config, "[mcp_servers.context7]", `${label} config`);
    assertIncludes(config, "[mcp_servers.sequential-thinking]", `${label} config`);
    assertIncludes(config, "[mcp_servers.serena]", `${label} config`);
    assertIncludes(config, "[mcp_servers.supabase]", `${label} config`);
    assertIncludes(config, 'env_vars = ["SUPABASE_DB_URL"]', `${label} config`);
    if (/%SUPABASE_DB_URL%|\$SUPABASE_DB_URL/.test(config)) {
      fail(`${label} config must not commit direct SUPABASE_DB_URL launcher args.`);
    }
  }

  if (fs.existsSync(marketplacePath)) {
    try {
      const marketplace = JSON.parse(read(marketplacePath));
      const chefEntries = (marketplace.plugins || []).filter((plugin) => plugin?.name === "codex-chef-workflows");
      if (chefEntries.length !== 1) fail(`${label} marketplace must contain exactly one Codex Chef plugin entry.`);
      const chef = chefEntries[0];
      if (chef && canonicalPathForCompare(chef.source?.path || "") !== canonicalPathForCompare(path.join(codexHome, "plugins", "codex-chef-workflows"))) {
        fail(`${label} marketplace Codex Chef plugin path does not point at CODEX_HOME.`);
      }
    } catch (error) {
      fail(`${label} marketplace is not parseable JSON: ${error.message}`);
    }
  }
}

function assertDefaultBoundaries(output, label) {
  if (!output.includes("Skills: skipped unless")) {
    fail(`${label} default install must not install curated skills unless -All or skill flag is used.`);
  }
  if (!output.includes("Git guards: disabled by default")) {
    fail(`${label} default install must keep Git guards disabled by default.`);
  }
  if (!output.includes("Account, database, production, and broad filesystem connectors stay disabled until explicitly enabled.")) {
    fail(`${label} must print the account/database connector approval boundary.`);
  }
}

function assertRunOk(result, label) {
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.error) {
    fail(`${label} could not run: ${result.error.message}`);
  } else if (result.status !== 0) {
    fail(`${label} exited ${result.status}: ${output.trim()}`);
  }
  return output;
}

const zeroRoot = fs.mkdtempSync(path.join(os.tmpdir(), "Codex Chef Install Smoke [zero] #-"));
const zeroCodexHome = path.join(zeroRoot, ".codex");
const zeroAgentsHome = path.join(zeroRoot, ".agents");
const previewRoot = fs.mkdtempSync(path.join(os.tmpdir(), "Codex Chef Install Smoke [preview] #-"));
const previewCodexHome = path.join(previewRoot, ".codex");
const previewAgentsHome = path.join(previewRoot, ".agents");
const previewOutput = assertRunOk(runInstallerPreview(previewCodexHome, previewAgentsHome), "Installer full preview smoke");
if (!previewOutput.includes("Dry run: no files") && !previewOutput.includes("Dry run: no files, Git settings, or skills will be changed")) {
  fail("Installer full preview smoke must clearly state that no files, Git settings, or skills are changed.");
}
if (fs.existsSync(path.join(previewCodexHome, "config.toml")) || fs.existsSync(path.join(previewAgentsHome, "plugins", "marketplace.json"))) {
  fail("Installer full preview smoke must not write Codex or Agents files.");
}

const zeroOutput = assertRunOk(runInstaller(zeroCodexHome, zeroAgentsHome), "Installer zero-config smoke");
assertInstalledBaseline(zeroCodexHome, zeroAgentsHome, "Installer zero-config smoke");
assertDefaultBoundaries(zeroOutput, "Installer zero-config smoke");

const existingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "Codex Chef Install Smoke [existing] #-"));
const codexHome = path.join(existingRoot, ".codex");
const agentsHome = path.join(existingRoot, ".agents");
ensureDir(codexHome);
ensureDir(agentsHome);

fs.writeFileSync(
  path.join(codexHome, "config.toml"),
  [
    "# user config must survive install",
    "model = \"local-custom-model\"",
    "",
    "[mcp_servers.user-local]",
    "command = \"node\"",
    "args = [\"server.js\"]",
    ""
  ].join("\n"),
  "utf8"
);

const firstExistingOutput = assertRunOk(runInstaller(codexHome, agentsHome), "Installer existing-config smoke");
assertInstalledBaseline(codexHome, agentsHome, "Installer existing-config smoke");
assertDefaultBoundaries(firstExistingOutput, "Installer existing-config smoke");

const configPath = path.join(codexHome, "config.toml");
const pluginManifestPath = path.join(codexHome, "plugins", "codex-chef-workflows", ".codex-plugin", "plugin.json");
const pluginExtraPath = path.join(codexHome, "plugins", "codex-chef-workflows", "user-extra.txt");
if (fs.existsSync(configPath)) {
  const config = read(configPath);
  assertIncludes(config, 'model = "local-custom-model"', "Installer smoke config");
  assertIncludes(config, "[mcp_servers.user-local]", "Installer smoke config");
}

if (fs.existsSync(pluginManifestPath)) {
  fs.writeFileSync(pluginManifestPath, "{\"name\":\"stale-plugin\"}\n", "utf8");
}
if (fs.existsSync(path.dirname(pluginExtraPath))) {
  fs.writeFileSync(pluginExtraPath, "user extra file must survive default reinstall\n", "utf8");
} else {
  fail("Installer existing-config smoke did not create the managed plugin directory before idempotent refresh.");
}

const secondExistingOutput = assertRunOk(runInstaller(codexHome, agentsHome), "Installer idempotent smoke");
assertInstalledBaseline(codexHome, agentsHome, "Installer idempotent smoke");
assertDefaultBoundaries(secondExistingOutput, "Installer idempotent smoke");
if (fs.existsSync(pluginManifestPath)) {
  const sourcePluginManifest = read(path.join(root, "plugins", "codex-chef-workflows", ".codex-plugin", "plugin.json"));
  if (read(pluginManifestPath) !== sourcePluginManifest) {
    fail("Installer idempotent smoke must refresh stale managed plugin files on reinstall.");
  }
}
if (!fs.existsSync(pluginExtraPath)) {
  fail("Installer idempotent smoke must preserve extra files in the managed plugin directory unless prune is explicit.");
}

if (failures.length > 0) {
  console.error("Installer smoke validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Installer smoke validation passed with temp targets: ${previewRoot}, ${zeroRoot}, ${existingRoot}`);
