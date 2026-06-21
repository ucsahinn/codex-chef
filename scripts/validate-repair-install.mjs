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

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runRepair(args, codexHome, agentsHome) {
  return spawnSync(process.execPath, [
    "scripts/repair-install.mjs",
    "--json",
    "--platform",
    "windows",
    "--codex-home",
    codexHome,
    "--agents-home",
    agentsHome,
    ...args
  ], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120000,
    windowsHide: true
  });
}

function parseResult(result, label) {
  if (result.error) {
    fail(`${label} could not run: ${result.error.message}`);
    return null;
  }
  if (result.status !== 0) {
    fail(`${label} exited ${result.status}: ${(result.stderr || result.stdout).trim()}`);
    return null;
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    fail(`${label} did not emit parseable JSON: ${error.message}`);
    return null;
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(filePath, { recursive: true });
}

function write(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text, "utf8");
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-repair-"));
const codexHome = path.join(fixtureRoot, ".codex");
const agentsHome = path.join(fixtureRoot, ".agents");
const pluginTarget = path.join(codexHome, "plugins", "codex-chef-workflows");

write(path.join(codexHome, "AGENTS.md"), "# stale guidance\n");
write(
  path.join(codexHome, "config.toml"),
  "# user setting must stay\nmodel = \"gpt-5\"\n\n[apps._default]\nenabled = true\ndefault_tools_enabled = true\n"
);
write(
  path.join(codexHome, "rules", "default.rules"),
  `${read("templates/codex/rules/default.rules")}prefix_rule(pattern=["powershell.exe", "-NoProfile", "-Command"], decision="allow")\n`
);
write(path.join(codexHome, "agents", "code_mapper.toml"), "# stale agent\n");
write(path.join(codexHome, "development.config.toml"), "# stale profile\n");
write(
  path.join(pluginTarget, ".codex-plugin", "plugin.json"),
  "{\n  \"name\": \"codex-chef-workflows\",\n  \"version\": \"0.0.0\"\n}\n"
);
write(path.join(pluginTarget, "extra.txt"), "extra managed plugin file\n");
write(
  path.join(agentsHome, "plugins", "marketplace.json"),
  JSON.stringify({
    name: "personal",
    plugins: [
      {
        name: "other-plugin",
        source: { source: "local", path: "C:/other/plugin" },
        policy: { installation: "AVAILABLE", authentication: "NONE" }
      },
      {
        name: "codex-chef-workflows",
        source: { source: "local", path: "C:/stale/codex-chef-workflows" },
        policy: { installation: "AVAILABLE", authentication: "NONE" }
      }
    ]
  }, null, 2) + "\n",
  "utf8"
);
ensureDir(path.join(codexHome, "skills", "frontend-skill"));
ensureDir(path.join(agentsHome, "skills", "frontend-skill"));
ensureDir(path.join(agentsHome, "skills", "random-extra-skill"));

const plan = parseResult(runRepair([], codexHome, agentsHome), "repair plan");
if (plan) {
  if (plan.schemaVersion !== "codex-chef.repair.v1") fail("repair plan schemaVersion drifted.");
  if (plan.mode !== "plan") fail(`repair plan mode drifted: ${plan.mode}`);
  if (plan.status !== "attention") fail(`repair plan should need attention, got ${plan.status}.`);
  if (!Array.isArray(plan.actions) || plan.actions.length === 0) fail("repair plan must include planned actions.");
  if (!plan.managedFiles?.extraPluginFiles?.length) fail("repair plan must report extra managed plugin files.");
  if (!plan.config?.removedDeprecatedFields?.includes("apps._default.default_tools_enabled")) {
    fail("repair plan must report deprecated managed config fields.");
  }
  if (!plan.config?.updatedManagedFields?.includes("apps._default.enabled")) {
    fail("repair plan must report managed app connector default updates.");
  }
  if (!plan.config?.updatedManagedFields?.includes("apps._default.destructive_enabled")) {
    fail("repair plan must report missing destructive app connector guard backfill.");
  }
  if (!plan.config?.updatedManagedFields?.includes("apps._default.open_world_enabled")) {
    fail("repair plan must report missing open-world app connector guard backfill.");
  }
  if (!plan.skills || plan.skills.extraCount < 1 || plan.skills.duplicateCount < 1) {
    fail("repair plan must report non-curated and duplicate skill inventory.");
  }
}

if (!fs.readFileSync(path.join(codexHome, "rules", "default.rules"), "utf8").includes("powershell.exe")) {
  fail("repair preview must not mutate default.rules.");
}

const applied = parseResult(runRepair(["--apply"], codexHome, agentsHome), "repair apply");
if (applied) {
  if (applied.mode !== "apply") fail(`repair apply mode drifted: ${applied.mode}`);
  if (!["attention", "repaired"].includes(applied.status)) {
    fail(`repair apply should succeed with attention or repaired, got ${applied.status}.`);
  }
  if (!applied.backupRoot) fail("repair apply must create a backup root.");
  if (!applied.actions.some((action) => action.status === "applied")) {
    fail("repair apply must report applied actions.");
  }
}

const repairedRules = fs.readFileSync(path.join(codexHome, "rules", "default.rules"), "utf8");
if (!repairedRules.includes(read("templates/codex/rules/default.rules").trim())) {
  fail("repair apply must preserve the managed default.rules baseline.");
}
if (!repairedRules.includes("powershell.exe")) {
  fail("repair apply must preserve local approval rules in default.rules.");
}
if (fs.readFileSync(path.join(codexHome, "AGENTS.md"), "utf8") !== read("templates/codex/AGENTS.md")) {
  fail("repair apply must restore AGENTS.md from the managed template.");
}
if (
  fs.readFileSync(path.join(pluginTarget, ".codex-plugin", "plugin.json"), "utf8") !==
  read("plugins/codex-chef-workflows/.codex-plugin/plugin.json")
) {
  fail("repair apply must restore the plugin manifest from source.");
}
if (!fs.existsSync(path.join(pluginTarget, "extra.txt"))) {
  fail("repair apply must not delete extra plugin files without the explicit prune flag.");
}

const repairedMarketplace = readJson(path.join(agentsHome, "plugins", "marketplace.json"));
if (!repairedMarketplace.plugins.some((plugin) => plugin.name === "other-plugin")) {
  fail("repair apply must preserve unrelated marketplace plugins.");
}
const chefPlugin = repairedMarketplace.plugins.find((plugin) => plugin.name === "codex-chef-workflows");
if (!chefPlugin || chefPlugin.source?.path !== pluginTarget) {
  fail("repair apply must update the Codex Chef marketplace entry to the managed plugin target.");
}
if (chefPlugin?.interface?.shortDescription !== "Security-first Codex setup maintenance workflow.") {
  fail("repair apply must preserve Codex Chef marketplace interface metadata.");
}

const repairedConfig = fs.readFileSync(path.join(codexHome, "config.toml"), "utf8");
if (!repairedConfig.includes("# user setting must stay") || !repairedConfig.includes("[mcp_servers.")) {
  fail("repair apply must preserve user config text and merge missing managed blocks.");
}
if (repairedConfig.includes("default_tools_enabled")) {
  fail("repair apply must remove deprecated managed apps._default.default_tools_enabled.");
}
if (!/\[apps\._default\][\s\S]*?\nenabled\s*=\s*false/.test(repairedConfig)) {
  fail("repair apply must set apps._default.enabled = false.");
}
if (!/\[apps\._default\][\s\S]*?\ndestructive_enabled\s*=\s*false/.test(repairedConfig)) {
  fail("repair apply must backfill apps._default.destructive_enabled = false.");
}
if (!/\[apps\._default\][\s\S]*?\nopen_world_enabled\s*=\s*false/.test(repairedConfig)) {
  fail("repair apply must backfill apps._default.open_world_enabled = false.");
}

const missingConfigRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-repair-missing-config-"));
const missingConfigCodexHome = path.join(missingConfigRoot, ".codex");
const missingConfigAgentsHome = path.join(missingConfigRoot, ".agents");
ensureDir(missingConfigCodexHome);
ensureDir(missingConfigAgentsHome);
const missingConfigPlan = parseResult(runRepair([], missingConfigCodexHome, missingConfigAgentsHome), "repair missing config plan");
if (missingConfigPlan) {
  if (missingConfigPlan.config?.fullTemplateInstall !== true) {
    fail("repair plan must report full template install when config.toml is missing.");
  }
}
const missingConfigApplied = parseResult(runRepair(["--apply"], missingConfigCodexHome, missingConfigAgentsHome), "repair missing config apply");
if (missingConfigApplied) {
  const installedConfig = fs.readFileSync(path.join(missingConfigCodexHome, "config.toml"), "utf8");
  if (!/\nmodel\s*=\s*"[^"]+"/.test(`\n${installedConfig}`)) {
    fail("repair apply must install root-level model when config.toml is missing.");
  }
  if (!installedConfig.includes('approval_policy = "on-request"')) {
    fail("repair apply must install root-level approval policy when config.toml is missing.");
  }
  if (!installedConfig.includes('sandbox_mode = "workspace-write"')) {
    fail("repair apply must install root-level sandbox mode when config.toml is missing.");
  }
  if (!/\[apps\._default\][\s\S]*?\nenabled\s*=\s*false/.test(installedConfig)) {
    fail("repair apply must install app connector defaults when config.toml is missing.");
  }
}

const inlineCommentRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-repair-inline-apps-"));
const inlineCommentCodexHome = path.join(inlineCommentRoot, ".codex");
const inlineCommentAgentsHome = path.join(inlineCommentRoot, ".agents");
write(
  path.join(inlineCommentCodexHome, "config.toml"),
  [
    "# inline comments must survive repair",
    "",
    "[apps._default]",
    "enabled = true # local app connector testing",
    "destructive_enabled = true # must be parked",
    "open_world_enabled = true # must be parked",
    ""
  ].join("\n")
);
ensureDir(inlineCommentAgentsHome);
const inlineCommentApplied = parseResult(runRepair(["--apply"], inlineCommentCodexHome, inlineCommentAgentsHome), "repair inline app comments apply");
if (inlineCommentApplied) {
  const inlineConfig = fs.readFileSync(path.join(inlineCommentCodexHome, "config.toml"), "utf8");
  const appsBlock = /\[apps\._default\]([\s\S]*?)(?:\n\[|$)/.exec(inlineConfig)?.[1] || "";
  for (const key of ["enabled", "destructive_enabled", "open_world_enabled"]) {
    const matches = appsBlock.match(new RegExp(`^${key}\\s*=`, "gm")) || [];
    if (matches.length !== 1) {
      fail(`repair apply must not duplicate apps._default.${key} when inline comments are present.`);
    }
    if (!new RegExp(`${key}\\s*=\\s*false\\s*#`).test(appsBlock)) {
      fail(`repair apply must rewrite apps._default.${key} to false while preserving inline comments.`);
    }
  }
}

const pruned = parseResult(runRepair(["--apply", "--prune-managed-plugin-extras"], codexHome, agentsHome), "repair prune");
if (pruned) {
  if (fs.existsSync(path.join(pluginTarget, "extra.txt"))) {
    fail("repair prune must delete explicit extra managed plugin files.");
  }
}

if (failures.length > 0) {
  console.error("Repair install validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Repair install validation passed.");
