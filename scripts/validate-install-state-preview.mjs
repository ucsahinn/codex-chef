#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const failures = [];

const manifest = readJson("manifests/install-plan.json");
const packageJson = readJson("package.json");
const schema = readJson("schemas/install-state-preview.schema.json");
const operationById = new Map((manifest.operations || []).map((operation) => [operation.id, operation]));
const allowedKinds = new Set(["copy-file", "copy-directory", "write-marketplace", "git-config", "skill-install"]);
const allowedManifestKinds = new Set([...allowedKinds, "copy-glob"]);
const allowedRisks = new Set(["low", "medium", "high"]);

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return {};
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function stringArray(value) {
  return Array.isArray(value) && value.every(nonEmptyString);
}

function booleanValue(value) {
  return typeof value === "boolean";
}

function assertNoExtraKeys(value, allowedKeys, label) {
  for (const key of Object.keys(value || {})) {
    if (!allowedKeys.includes(key)) fail(`${label} has unexpected key: ${key}`);
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
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    fail(`${label} did not emit parseable JSON: ${error.message}`);
    return null;
  }
}

function runPlanner(args, label) {
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

function runPlannerJson(args, label) {
  const output = runPlanner([...args, "--json"], label);
  if (!output) return null;
  try {
    return JSON.parse(output);
  } catch (error) {
    fail(`${label} did not emit parseable JSON: ${error.message}`);
    return null;
  }
}

function validateSchemaDocument() {
  if (schema.title !== "Codex Chef install-state preview") {
    fail("Install-state preview schema has unexpected title");
  }
  const required = new Set(schema.required || []);
  for (const key of [
    "schemaVersion",
    "generatedAt",
    "dryRunOnly",
    "source",
    "target",
    "options",
    "selectedComponentIds",
    "skippedComponentIds",
    "operations"
  ]) {
    if (!required.has(key)) fail(`Install-state preview schema missing required key: ${key}`);
  }
  if (schema.properties?.schemaVersion?.const !== "codex-chef.install-state-preview.v1") {
    fail("Install-state preview schema has unexpected schemaVersion const");
  }
  if (schema.properties?.dryRunOnly?.const !== true) {
    fail("Install-state preview schema must define dryRunOnly const true");
  }
}

function validateDiscovery(discovery, label) {
  if (!isObject(discovery)) {
    fail(`${label} must be an object`);
    return;
  }
  assertNoExtraKeys(discovery, [
    "schemaVersion",
    "generatedAt",
    "dryRunOnly",
    "source",
    "target",
    "profiles",
    "operations"
  ], label);
  if (discovery.schemaVersion !== "codex-chef.install-plan-discovery.v1") {
    fail(`${label} has unexpected schemaVersion`);
  }
  if (discovery.dryRunOnly !== true) fail(`${label} must be dryRunOnly=true`);
  validateSource(discovery.source, label);
  if (!isObject(discovery.target) || !["windows", "unix"].includes(discovery.target.platform)) {
    fail(`${label} target.platform must be windows or unix`);
  }

  if (!Array.isArray(discovery.profiles) || discovery.profiles.length === 0) {
    fail(`${label} profiles must be a non-empty array`);
  } else {
    const profileIds = new Set(discovery.profiles.map((profile) => profile.id));
    for (const profileName of Object.keys(manifest.profiles || {})) {
      if (!profileIds.has(profileName)) fail(`${label} missing profile: ${profileName}`);
    }
    for (const profile of discovery.profiles) {
      assertNoExtraKeys(profile, ["id", "operationIds", "operationCount", "optionalFlags", "highRiskOperationCount"], `${label} profile ${profile.id}`);
      if (!nonEmptyString(profile.id)) fail(`${label} profile id must be non-empty string`);
      if (!stringArray(profile.operationIds)) fail(`${label} profile ${profile.id} operationIds must be string array`);
      if (!Array.isArray(profile.optionalFlags)) fail(`${label} profile ${profile.id} optionalFlags must be array`);
      if (profile.operationCount !== profile.operationIds.length) fail(`${label} profile ${profile.id} operationCount must match operationIds`);
      for (const operationId of profile.operationIds) {
        if (!operationById.has(operationId)) fail(`${label} profile ${profile.id} references unknown operation: ${operationId}`);
      }
    }
  }

  if (!Array.isArray(discovery.operations) || discovery.operations.length === 0) {
    fail(`${label} operations must be a non-empty array`);
  } else {
    for (const operation of discovery.operations) {
      assertNoExtraKeys(operation, ["id", "kind", "summary", "platforms", "requiresFlag", "risk", "backup", "collision"], `${label} operation ${operation.id}`);
      if (!operationById.has(operation.id)) fail(`${label} operation references unknown id: ${operation.id}`);
      if (!allowedManifestKinds.has(operation.kind)) fail(`${label} operation ${operation.id} has invalid kind: ${operation.kind}`);
      if (!allowedRisks.has(operation.risk)) fail(`${label} operation ${operation.id} has invalid risk: ${operation.risk}`);
      if (!stringArray(operation.platforms)) fail(`${label} operation ${operation.id} platforms must be string array`);
      if (typeof operation.backup !== "boolean") fail(`${label} operation ${operation.id} backup must be boolean`);
    }
  }
}

function validatePlan(plan, label, expected = {}) {
  if (!isObject(plan)) {
    fail(`${label} must be an object`);
    return;
  }

  assertNoExtraKeys(plan, [
    "schemaVersion",
    "generatedAt",
    "dryRunOnly",
    "source",
    "target",
    "options",
    "selectedComponentIds",
    "skippedComponentIds",
    "operations"
  ], label);

  if (plan.schemaVersion !== "codex-chef.install-state-preview.v1") {
    fail(`${label} has unexpected schemaVersion`);
  }
  if (!nonEmptyString(plan.generatedAt) || Number.isNaN(Date.parse(plan.generatedAt))) {
    fail(`${label} generatedAt must be an ISO-like timestamp`);
  }
  if (plan.dryRunOnly !== true) {
    fail(`${label} must be dryRunOnly=true`);
  }

  validateSource(plan.source, label);
  validateTarget(plan.target, label, expected.platform);
  validateOptions(plan.options, label, expected);

  if (!stringArray(plan.selectedComponentIds)) fail(`${label} selectedComponentIds must be string array`);
  if (!stringArray(plan.skippedComponentIds)) fail(`${label} skippedComponentIds must be string array`);

  const selected = new Set(plan.selectedComponentIds || []);
  const skipped = new Set(plan.skippedComponentIds || []);
  for (const id of selected) {
    if (!operationById.has(id)) fail(`${label} selected unknown component: ${id}`);
    if (skipped.has(id)) fail(`${label} component cannot be both selected and skipped: ${id}`);
  }
  for (const id of skipped) {
    if (!operationById.has(id)) fail(`${label} skipped unknown component: ${id}`);
  }

  if (!Array.isArray(plan.operations) || plan.operations.length === 0) {
    fail(`${label} operations must be a non-empty array`);
    return;
  }

  const operationIds = new Set();
  for (const operation of plan.operations) {
    validateOperation(operation, label, selected);
    if (operationIds.has(operation.id)) fail(`${label} repeats operation id: ${operation.id}`);
    operationIds.add(operation.id);
  }

  if (expected.noHighRisk) {
    const highRisk = plan.operations.filter((operation) => operation.risk === "high");
    if (highRisk.length > 0) {
      fail(`${label} should not include high-risk operations without optional install flags`);
    }
  }
}

function validateSource(source, label) {
  if (!isObject(source)) {
    fail(`${label} source must be object`);
    return;
  }
  assertNoExtraKeys(source, ["packageName", "packageVersion", "manifest", "manifestVersion"], `${label} source`);
  if (source.packageName !== packageJson.name) fail(`${label} source packageName must match package.json`);
  if (source.packageVersion !== packageJson.version) fail(`${label} source packageVersion must match package.json`);
  if (source.manifest !== "manifests/install-plan.json") fail(`${label} source manifest must be manifests/install-plan.json`);
  if (source.manifestVersion !== manifest.schemaVersion) fail(`${label} source manifestVersion must match install manifest`);
}

function validateTarget(target, label, expectedPlatform) {
  if (!isObject(target)) {
    fail(`${label} target must be object`);
    return;
  }
  assertNoExtraKeys(target, ["platform", "codexHome", "agentsHome", "home"], `${label} target`);
  if (!["windows", "unix"].includes(target.platform)) fail(`${label} target platform must be windows or unix`);
  if (expectedPlatform && target.platform !== expectedPlatform) fail(`${label} target platform should be ${expectedPlatform}`);
  for (const key of ["codexHome", "agentsHome", "home"]) {
    if (!nonEmptyString(target[key])) fail(`${label} target ${key} must be non-empty string`);
  }
}

function validateOptions(options, label, expected) {
  if (!isObject(options)) {
    fail(`${label} options must be object`);
    return;
  }
  assertNoExtraKeys(options, ["all", "installSkills", "installGitGuards", "force", "noBackup", "redactPaths"], `${label} options`);
  for (const key of ["all", "installSkills", "installGitGuards", "force", "noBackup", "redactPaths"]) {
    if (!booleanValue(options[key])) fail(`${label} options.${key} must be boolean`);
  }
  for (const [key, value] of Object.entries(expected.options || {})) {
    if (options[key] !== value) fail(`${label} options.${key} should be ${value}`);
  }
}

function validateOperation(operation, label, selected) {
  if (!isObject(operation)) {
    fail(`${label} operation must be object`);
    return;
  }
  for (const key of ["id", "componentId", "kind", "summary", "risk", "collision", "conflictPolicy", "selectedBy"]) {
    if (!nonEmptyString(operation[key])) fail(`${label} operation ${operation.id || "(unknown)"} ${key} must be non-empty string`);
  }
  for (const key of ["backup", "force", "wouldMutateGlobalState"]) {
    if (!booleanValue(operation[key])) fail(`${label} operation ${operation.id || "(unknown)"} ${key} must be boolean`);
  }
  if (operation.wouldMutateGlobalState !== true) {
    fail(`${label} operation ${operation.id} must mark wouldMutateGlobalState=true`);
  }
  if (!allowedKinds.has(operation.kind)) fail(`${label} operation ${operation.id} has invalid kind: ${operation.kind}`);
  if (!allowedRisks.has(operation.risk)) fail(`${label} operation ${operation.id} has invalid risk: ${operation.risk}`);
  if (!operationById.has(operation.componentId)) fail(`${label} operation ${operation.id} references unknown componentId: ${operation.componentId}`);
  if (selected && !selected.has(operation.componentId)) fail(`${label} operation ${operation.id} componentId is not selected: ${operation.componentId}`);

  const manifestOperation = operationById.get(operation.componentId);
  if (operation.risk === "high") {
    if (!manifestOperation?.requiresFlag) {
      fail(`${label} high-risk operation ${operation.id} must map to a manifest operation with requiresFlag`);
    }
    if (!["--all", "--install-skills", "InstallGitGuards"].includes(operation.selectedBy)) {
      fail(`${label} high-risk operation ${operation.id} must be selected by an explicit optional flag`);
    }
  }

  if (operation.kind === "copy-file" || operation.kind === "copy-directory") {
    if (!nonEmptyString(operation.source)) fail(`${label} ${operation.id} must include source`);
    if (!nonEmptyString(operation.destination)) fail(`${label} ${operation.id} must include destination`);
  }
  if (operation.kind === "write-marketplace") {
    if (!nonEmptyString(operation.destination)) fail(`${label} ${operation.id} must include destination`);
    if (!nonEmptyString(operation.pluginTarget)) fail(`${label} ${operation.id} must include pluginTarget`);
  }
  if (operation.kind === "git-config") {
    if (!nonEmptyString(operation.key)) fail(`${label} ${operation.id} must include key`);
    if (!nonEmptyString(operation.value)) fail(`${label} ${operation.id} must include value`);
  }
  if (operation.kind === "skill-install") {
    if (!nonEmptyString(operation.command)) fail(`${label} ${operation.id} must include command`);
    if (!nonEmptyString(operation.source)) fail(`${label} ${operation.id} must include source`);
    if (!nonEmptyString(operation.sourceUrl)) fail(`${label} ${operation.id} must include sourceUrl`);
    if (!operation.command.includes("--agent codex --yes --global")) {
      fail(`${label} ${operation.id} must install skills for Codex globally with yes flag`);
    }
  }
}

validateSchemaDocument();

validateDiscovery(runPlannerJson(["--list-profiles"], "Profile discovery JSON"), "Profile discovery JSON");
validateDiscovery(runPlannerJson(["--list-operations"], "Operation discovery JSON"), "Operation discovery JSON");

const profileList = runPlanner(["--list-profiles"], "Profile discovery text");
if (profileList && (!profileList.includes("default") || !profileList.includes("all"))) {
  fail("Profile discovery text must list default and all profiles");
}

const operationList = runPlanner(["--list-components"], "Operation discovery text");
if (operationList && (!operationList.includes("codex-config") || !operationList.includes("curated-skills"))) {
  fail("Operation discovery text must list core and optional operations");
}

validatePlan(runPlan(["--json"], "Default plan"), "Default plan", {
  noHighRisk: true,
  options: {
    all: false,
    installSkills: false,
    installGitGuards: false,
    force: false,
    noBackup: false
  }
});

validatePlan(runPlan(["--all", "--json"], "All plan"), "All plan", {
  options: {
    all: true,
    installSkills: true,
    installGitGuards: true
  }
});

validatePlan(runPlan(["--all", "--force", "--no-backup", "--json"], "All force no-backup plan"), "All force no-backup plan", {
  options: {
    all: true,
    force: true,
    noBackup: true
  }
});

validatePlan(runPlan(["--platform", "unix", "--all", "--json"], "Unix all plan"), "Unix all plan", {
  platform: "unix",
  options: {
    all: true
  }
});

const redactedPlan = runPlan(["--all", "--redact-paths", "--json"], "Redacted all plan");
validatePlan(redactedPlan, "Redacted all plan", {
  options: {
    all: true,
    redactPaths: true
  }
});
if (redactedPlan) {
  const serialized = JSON.stringify(redactedPlan);
  if (/C:\\\\Users\\\\|C:\/Users\/|\/Users\//i.test(serialized)) {
    fail("Redacted all plan must not expose local user home paths");
  }
  for (const key of ["codexHome", "agentsHome", "home"]) {
    if (!String(redactedPlan.target?.[key] || "").startsWith("${HOME}")) {
      fail(`Redacted all plan target.${key} must use HOME placeholder`);
    }
  }
}

if (failures.length > 0) {
  console.error("Install-state preview validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Install-state preview validation passed.");
