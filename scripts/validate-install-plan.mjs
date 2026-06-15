#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const manifestPath = path.join(root, "manifests", "install-plan.json");
const schemaPath = path.join(root, "schemas", "install-plan.schema.json");
const failures = [];

const allowedKinds = new Set(["copy-file", "copy-directory", "copy-glob", "write-marketplace", "git-config", "skill-install"]);
const allowedFlags = new Set(["InstallSkills", "InstallGitGuards"]);
const allowedPlatforms = new Set(["windows", "unix"]);
const allowedRisks = new Set(["low", "medium", "high"]);

function fail(message) {
  failures.push(message);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${label}: ${error.message}`);
    return null;
  }
}

function existsRelative(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function validateSourcePath(operation, key, relativePath) {
  if (!relativePath || typeof relativePath !== "string") {
    fail(`Operation ${operation.id} must declare ${key}`);
    return;
  }
  if (path.isAbsolute(relativePath) || relativePath.includes("..")) {
    fail(`Operation ${operation.id} ${key} must be a repo-relative path without traversal`);
    return;
  }
  if (!existsRelative(relativePath)) {
    fail(`Operation ${operation.id} references missing ${key}: ${relativePath}`);
  }
}

function validateGlob(operation) {
  const glob = operation.sourceGlob;
  if (!glob || typeof glob !== "string" || !glob.includes("*")) {
    fail(`Operation ${operation.id} must declare a sourceGlob with *`);
    return;
  }
  const normalized = glob.replace(/\\/g, "/");
  const dir = normalized.slice(0, normalized.lastIndexOf("/*"));
  if (!dir || !existsRelative(dir)) {
    fail(`Operation ${operation.id} sourceGlob directory is missing: ${glob}`);
  }
}

function validateDestinationPath(operation, key, value) {
  if (!value || typeof value !== "string") {
    fail(`Operation ${operation.id} must declare ${key}`);
    return;
  }
  const normalized = value.replace(/\\/g, "/");
  const deniedHomes = [
    "${HOME}/.claude",
    "${HOME}/.cursor",
    "${HOME}/.opencode",
    "${HOME}/.kiro",
    "${HOME}/.vscode",
    "${HOME}/.zed",
    "${HOME}/.gemini",
    "${HOME}/.qwen"
  ];
  if (deniedHomes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    fail(`Operation ${operation.id} must not target adjacent harness home path: ${value}`);
  }

  if (operation.requiresFlag === "InstallGitGuards") {
    const allowedGitGuardTargets = [
      "${HOME}/.gitignore_global",
      "${HOME}/.githooks",
      "${HOME}/.githooks/pre-commit"
    ];
    if (!allowedGitGuardTargets.some((target) => normalized === target || normalized.startsWith(`${target}/`))) {
      fail(`Operation ${operation.id} InstallGitGuards destination must stay within reviewed Git guard targets: ${value}`);
    }
    return;
  }

  if (operation.requiresFlag && operation.requiresFlag !== "InstallGitGuards") {
    return;
  }

  if (!["${CODEX_HOME}", "${AGENTS_HOME}"].includes(normalized)
    && !normalized.startsWith("${CODEX_HOME}/")
    && !normalized.startsWith("${AGENTS_HOME}/")) {
    fail(`Operation ${operation.id} default destination must stay within CODEX_HOME or AGENTS_HOME: ${value}`);
  }
}

function runPlan(args, label) {
  const result = spawnSync(process.execPath, ["scripts/plan-install.mjs", ...args], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    fail(`${label} failed: ${result.stderr || result.stdout}`);
    return null;
  }
  return result.stdout;
}

function parsePlan(output, label) {
  try {
    return JSON.parse(output);
  } catch (error) {
    fail(`${label} did not emit parseable JSON: ${error.message}`);
    return null;
  }
}

function validatePlanOutputSmoke() {
  const jsonOutput = runPlan(["--all", "--json"], "Install plan JSON smoke");
  if (jsonOutput) {
    const plan = parsePlan(jsonOutput, "Install plan JSON smoke");
    if (plan) {
      if (plan.schemaVersion !== "codex-chef.install-state-preview.v1") {
        fail("Install plan JSON smoke returned unexpected schemaVersion");
      }
      if (!Array.isArray(plan.operations) || plan.operations.length === 0) {
        fail("Install plan JSON smoke returned no operations");
      }
    }
  }

  const noBackupOutput = runPlan(["--no-backup", "--json"], "Install plan no-backup smoke");
  if (noBackupOutput) {
    const plan = parsePlan(noBackupOutput, "Install plan no-backup smoke");
    const backupManaged = plan?.operations?.filter((operation) => operation.collision.includes("backup")) || [];
    if (plan && backupManaged.some((operation) => operation.backup !== false)) {
      fail("Install plan --no-backup smoke must mark backup-managed operations as backup=false");
    }
  }

  const forceOutput = runPlan(["--force", "--json"], "Install plan force smoke");
  if (forceOutput) {
    const plan = parsePlan(forceOutput, "Install plan force smoke");
    if (plan?.operations?.some((operation) => operation.force !== true)) {
      fail("Install plan --force smoke must mark operations as force=true");
    }
  }

  const uncOutput = runPlan([
    "--platform",
    "windows",
    "--codex-home",
    "\\\\server\\share\\.codex",
    "--agents-home",
    "\\\\server\\share\\.agents",
    "--home",
    "\\\\server\\share",
    "--json"
  ], "Install plan UNC path smoke");
  if (uncOutput) {
    const plan = parsePlan(uncOutput, "Install plan UNC path smoke");
    const firstDestination = plan?.operations?.find((operation) => operation.destination)?.destination || "";
    if (plan && !firstDestination.startsWith("\\\\server\\share\\.codex\\")) {
      fail("Install plan UNC path smoke must preserve leading UNC double backslashes");
    }
  }

  const extendedOutput = runPlan([
    "--platform",
    "windows",
    "--codex-home",
    "\\\\?\\C:\\Temp\\.codex",
    "--agents-home",
    "\\\\?\\C:\\Temp\\.agents",
    "--home",
    "\\\\?\\C:\\Temp",
    "--json"
  ], "Install plan extended path smoke");
  if (extendedOutput) {
    const plan = parsePlan(extendedOutput, "Install plan extended path smoke");
    const firstDestination = plan?.operations?.find((operation) => operation.destination)?.destination || "";
    if (plan && !firstDestination.startsWith("\\\\?\\C:\\Temp\\.codex\\")) {
      fail("Install plan extended path smoke must preserve leading extended-length path prefix");
    }
  }
}

const manifest = readJson(manifestPath, "manifests/install-plan.json");
const schema = readJson(schemaPath, "schemas/install-plan.schema.json");

if (!manifest) {
  process.exit(1);
}

if (!schema) {
  fail("Missing or invalid schemas/install-plan.schema.json");
}

if (manifest.schemaVersion !== "codex-chef.install-plan.v1") {
  fail("Install plan manifest has unexpected schemaVersion");
}

if (!manifest.profiles || typeof manifest.profiles !== "object" || Array.isArray(manifest.profiles)) {
  fail("Install plan manifest must declare profiles object");
}

if (!Array.isArray(manifest.operations) || manifest.operations.length === 0) {
  fail("Install plan manifest must declare operations array");
}

const operationIds = new Set();
for (const operation of manifest.operations || []) {
  if (!operation || typeof operation !== "object" || Array.isArray(operation)) {
    fail("Install plan operation must be an object");
    continue;
  }

  if (!operation.id || !/^[a-z0-9-]+$/.test(operation.id)) {
    fail(`Install plan operation has invalid id: ${operation.id}`);
    continue;
  }
  if (operationIds.has(operation.id)) {
    fail(`Duplicate install plan operation id: ${operation.id}`);
  }
  operationIds.add(operation.id);

  if (!allowedKinds.has(operation.kind)) fail(`Operation ${operation.id} has invalid kind: ${operation.kind}`);
  if (!operation.summary) fail(`Operation ${operation.id} must declare summary`);
  if (!operation.collision) fail(`Operation ${operation.id} must declare collision`);
  if (typeof operation.backup !== "boolean") fail(`Operation ${operation.id} must declare boolean backup`);
  if (!allowedRisks.has(operation.risk)) fail(`Operation ${operation.id} has invalid risk: ${operation.risk}`);
  if (!operation.conflictPolicy) fail(`Operation ${operation.id} must declare conflictPolicy`);
  if (operation.requiresFlag && !allowedFlags.has(operation.requiresFlag)) {
    fail(`Operation ${operation.id} has invalid requiresFlag: ${operation.requiresFlag}`);
  }

  if (!Array.isArray(operation.platforms) || operation.platforms.length === 0) {
    fail(`Operation ${operation.id} must declare platforms`);
  } else {
    for (const platform of operation.platforms) {
      if (!allowedPlatforms.has(platform)) fail(`Operation ${operation.id} has invalid platform: ${platform}`);
    }
  }

  if (operation.kind === "copy-file" || operation.kind === "copy-directory") {
    if (operation.sourceByPlatform) {
      for (const platform of operation.platforms || []) {
        validateSourcePath(operation, `sourceByPlatform.${platform}`, operation.sourceByPlatform[platform]);
      }
    } else {
      validateSourcePath(operation, "source", operation.source);
    }
    validateDestinationPath(operation, "destination", operation.destination);
  }

  if (operation.kind === "copy-glob") {
    validateGlob(operation);
    validateDestinationPath(operation, "destinationDir", operation.destinationDir);
  }

  if (operation.kind === "skill-install") {
    validateSourcePath(operation, "catalog", operation.catalog);
    validateSourcePath(operation, "lock", operation.lock);
  }

  if (operation.kind === "write-marketplace") {
    validateDestinationPath(operation, "destination", operation.destination);
  }

  if (operation.kind === "git-config") {
    if (!operation.key || !operation.value) {
      fail(`Operation ${operation.id} must declare git config key and value`);
    } else {
      validateDestinationPath(operation, "value", operation.value);
    }
  }
}

for (const [profileId, operationIdsForProfile] of Object.entries(manifest.profiles || {})) {
  if (!Array.isArray(operationIdsForProfile)) {
    fail(`Profile ${profileId} must be an array`);
    continue;
  }
  const seen = new Set();
  for (const operationId of operationIdsForProfile) {
    if (!operationIds.has(operationId)) fail(`Profile ${profileId} references unknown operation: ${operationId}`);
    if (seen.has(operationId)) fail(`Profile ${profileId} repeats operation: ${operationId}`);
    seen.add(operationId);
  }
}

if (!manifest.profiles?.default || !manifest.profiles?.all) {
  fail("Install plan manifest must declare default and all profiles");
}

validatePlanOutputSmoke();

if (failures.length > 0) {
  console.error("Install plan validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Install plan validation passed. Checked ${operationIds.size} operations.`);
