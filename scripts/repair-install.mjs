#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(process.cwd());
const args = process.argv.slice(2);

const options = {
  apply: false,
  json: false,
  noBackup: false,
  pruneManagedPluginExtras: false,
  redactPaths: false,
  platform: process.platform === "win32" ? "windows" : "unix",
  codexHome: process.env.CODEX_HOME || path.join(os.homedir(), ".codex"),
  agentsHome: process.env.AGENTS_HOME || path.join(os.homedir(), ".agents")
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--apply") options.apply = true;
  else if (arg === "--json") options.json = true;
  else if (arg === "--no-backup") options.noBackup = true;
  else if (arg === "--prune-managed-plugin-extras") options.pruneManagedPluginExtras = true;
  else if (arg === "--redact-paths") options.redactPaths = true;
  else if (arg === "--platform") {
    options.platform = args[index + 1];
    index += 1;
  } else if (arg === "--codex-home") {
    options.codexHome = path.resolve(args[index + 1]);
    index += 1;
  } else if (arg === "--agents-home") {
    options.agentsHome = path.resolve(args[index + 1]);
    index += 1;
  } else if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

if (!["windows", "unix"].includes(options.platform)) {
  throw new Error(`Unsupported platform: ${options.platform}`);
}

function printHelp() {
  console.log(`Usage: node scripts/repair-install.mjs [options]

Repair or preview repair for an existing Codex Chef global install.

Options:
  --apply                         Write backup-backed repairs
  --no-backup                     Skip backups when --apply is used
  --prune-managed-plugin-extras   Delete extra files only inside the managed Codex Chef plugin directory
  --platform <windows|unix>       Select config template; defaults to current OS
  --codex-home <path>             Installed Codex home to inspect
  --agents-home <path>            Installed Agents home to inspect
  --redact-paths                  Redact home and repository paths in output
  --json                          Emit machine-readable JSON
`);
}

const backupRoot = path.join(
  options.codexHome,
  "backups",
  `codex-chef-repair-${timestamp()}`
);
const actions = [];
const warnings = [];
const failures = [];

function timestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("") + "-" + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function redact(value) {
  if (!options.redactPaths || typeof value !== "string") return value;
  const home = os.homedir();
  return value
    .replaceAll(home, "${HOME}")
    .replaceAll(home.replaceAll("\\", "/"), "${HOME}")
    .replaceAll(root, "${REPO}")
    .replaceAll(root.replaceAll("\\", "/"), "${REPO}")
    .replace(/[A-Za-z]:\\Users\\[^\\/]+/g, "${OTHER_USERPROFILE}")
    .replace(/[A-Za-z]:\/Users\/[^\\/]+/g, "${OTHER_USERPROFILE}");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function normalizePathForCompare(filePath) {
  return path.resolve(filePath || "").toLowerCase();
}

function isInside(child, parent) {
  const childPath = path.resolve(child);
  const parentPath = path.resolve(parent);
  const relative = path.relative(parentPath, childPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertManagedTarget(targetPath) {
  if (isInside(targetPath, options.codexHome) || isInside(targetPath, options.agentsHome)) return;
  throw new Error(`Refusing to repair unmanaged target outside Codex/Agents homes: ${targetPath}`);
}

function ensureDir(directory) {
  if (!options.apply) return;
  fs.mkdirSync(directory, { recursive: true });
}

function relativeBackupPath(targetPath) {
  const resolved = path.resolve(targetPath);
  for (const base of [options.codexHome, options.agentsHome]) {
    if (isInside(resolved, base)) {
      const prefix = base === options.codexHome ? "codex" : "agents";
      return path.join(prefix, path.relative(base, resolved));
    }
  }
  return path.basename(resolved);
}

function backupTarget(targetPath) {
  if (!options.apply || options.noBackup || !fs.existsSync(targetPath)) return null;
  assertManagedTarget(targetPath);
  const destination = path.join(backupRoot, relativeBackupPath(targetPath));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(targetPath, destination, { recursive: true, force: true });
  return destination;
}

function recordAction(action) {
  actions.push({
    ...action,
    source: action.source ? redact(action.source) : undefined,
    target: action.target ? redact(action.target) : undefined,
    backup: action.backup ? redact(action.backup) : undefined
  });
}

function listFilesRecursive(directory) {
  const files = [];
  if (!fs.existsSync(directory)) return files;

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(toPosix(path.relative(directory, full)));
    }
  }

  walk(directory);
  return files.sort();
}

function fileEquals(sourcePath, targetPath) {
  return fs.existsSync(sourcePath)
    && fs.existsSync(targetPath)
    && fs.readFileSync(sourcePath).equals(fs.readFileSync(targetPath));
}

function repairFile(sourceRel, targetPath, id) {
  const sourcePath = path.join(root, sourceRel);
  const exists = fs.existsSync(targetPath);
  const current = exists && fileEquals(sourcePath, targetPath);
  if (current) return { status: "current", source: sourceRel, target: redact(targetPath) };

  const action = {
    id,
    kind: "copy-file",
    source: sourceRel,
    target: targetPath,
    status: options.apply ? "applied" : "planned",
    reason: exists ? "drifted" : "missing"
  };

  if (options.apply) {
    assertManagedTarget(targetPath);
    ensureDir(path.dirname(targetPath));
    action.backup = backupTarget(targetPath);
    fs.copyFileSync(sourcePath, targetPath);
  }

  recordAction(action);
  return { status: action.status, source: sourceRel, target: redact(targetPath), reason: action.reason };
}

function significantRulesLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function repairRulesFile(sourceRel, targetPath, id) {
  const sourcePath = path.join(root, sourceRel);
  const exists = fs.existsSync(targetPath);
  const sourceText = fs.readFileSync(sourcePath, "utf8");
  const targetText = exists ? fs.readFileSync(targetPath, "utf8") : "";
  const targetLines = new Set(significantRulesLines(targetText));
  const missingLines = significantRulesLines(sourceText).filter((line) => !targetLines.has(line));
  if (exists && missingLines.length === 0) {
    return { status: "current", source: sourceRel, target: redact(targetPath) };
  }

  const action = {
    id,
    kind: "merge-rules-baseline",
    source: sourceRel,
    target: targetPath,
    status: options.apply ? "applied" : "planned",
    reason: exists ? `missing ${missingLines.length} managed rules baseline line(s)` : "missing"
  };

  if (options.apply) {
    assertManagedTarget(targetPath);
    ensureDir(path.dirname(targetPath));
    action.backup = backupTarget(targetPath);
    const extra = exists
      ? targetText.split(/\r?\n/).filter((line) => !significantRulesLines(sourceText).includes(line.trim())).join("\n").trim()
      : "";
    const next = extra ? `${sourceText.trimEnd()}\n\n# Local approval rules preserved by Codex Chef repair.\n${extra}\n` : sourceText;
    fs.writeFileSync(targetPath, next, "utf8");
  }

  recordAction(action);
  return { status: action.status, source: sourceRel, target: redact(targetPath), reason: action.reason };
}

function repairManagedFiles() {
  const entries = [];
  entries.push({
    id: "codex-agents-md",
    source: "templates/codex/AGENTS.md",
    target: path.join(options.codexHome, "AGENTS.md")
  });
  const rulesEntry = {
    id: "codex-rules",
    source: "templates/codex/rules/default.rules",
    target: path.join(options.codexHome, "rules", "default.rules")
  };

  for (const file of listFilesRecursive(path.join(root, "templates", "codex", "agents"))) {
    entries.push({
      id: `codex-agent:${file}`,
      source: toPosix(path.join("templates", "codex", "agents", file)),
      target: path.join(options.codexHome, "agents", file)
    });
  }

  for (const file of listFilesRecursive(path.join(root, "templates", "codex", "profiles"))) {
    entries.push({
      id: `codex-profile:${file}`,
      source: toPosix(path.join("templates", "codex", "profiles", file)),
      target: path.join(options.codexHome, file)
    });
  }

  const pluginSourceRoot = path.join(root, "plugins", "codex-chef-workflows");
  const pluginTargetRoot = path.join(options.codexHome, "plugins", "codex-chef-workflows");
  for (const file of listFilesRecursive(pluginSourceRoot)) {
    entries.push({
      id: `codex-plugin:${file}`,
      source: toPosix(path.join("plugins", "codex-chef-workflows", file)),
      target: path.join(pluginTargetRoot, file)
    });
  }

  let current = 0;
  let planned = 0;
  let applied = 0;
  const changed = [];
  for (const entry of entries) {
    const result = repairFile(entry.source, entry.target, entry.id);
    if (result.status === "current") current += 1;
    else if (result.status === "planned") planned += 1;
    else if (result.status === "applied") applied += 1;
    if (result.status !== "current") changed.push(result);
  }
  const rulesResult = repairRulesFile(rulesEntry.source, rulesEntry.target, rulesEntry.id);
  if (rulesResult.status === "current") current += 1;
  else if (rulesResult.status === "planned") planned += 1;
  else if (rulesResult.status === "applied") applied += 1;
  if (rulesResult.status !== "current") changed.push(rulesResult);

  const sourceFiles = new Set(listFilesRecursive(pluginSourceRoot));
  const targetFiles = listFilesRecursive(pluginTargetRoot);
  const extraPluginFiles = targetFiles
    .filter((file) => !sourceFiles.has(file))
    .map((file) => path.join(pluginTargetRoot, file));
  const pruned = [];

  for (const extraPath of extraPluginFiles) {
    if (!options.pruneManagedPluginExtras) {
      warnings.push(`Extra file in managed Codex Chef plugin directory requires explicit prune flag: ${redact(extraPath)}`);
      continue;
    }
    if (!options.apply) {
      recordAction({
        id: `prune-plugin-extra:${path.basename(extraPath)}`,
        kind: "delete-extra-managed-plugin-file",
        target: extraPath,
        status: "planned",
        reason: "extra-managed-plugin-file"
      });
      continue;
    }
    assertManagedTarget(extraPath);
    if (!isInside(extraPath, pluginTargetRoot)) {
      throw new Error(`Refusing to prune file outside managed plugin directory: ${extraPath}`);
    }
    const backup = backupTarget(extraPath);
    fs.rmSync(extraPath, { force: true });
    pruned.push(redact(extraPath));
    recordAction({
      id: `prune-plugin-extra:${path.basename(extraPath)}`,
      kind: "delete-extra-managed-plugin-file",
      target: extraPath,
      backup,
      status: "applied",
      reason: "extra-managed-plugin-file"
    });
  }

  return {
    expected: entries.length + 1,
    current,
    planned,
    applied,
    changed,
    extraPluginFiles: extraPluginFiles.map(redact),
    pruned
  };
}

function runConfigMerge() {
  const template = path.join(root, "templates", "codex", options.platform === "windows" ? "config.windows.toml" : "config.unix.toml");
  const destination = path.join(options.codexHome, "config.toml");
  const inspectArgs = [
    "scripts/merge-codex-config.mjs",
    template,
    destination,
    "--json",
    "--dry-run"
  ];

  const inspect = spawnSync(process.execPath, inspectArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    timeout: 60000
  });

  if (inspect.error) {
    failures.push(`Codex config repair could not run: ${inspect.error.message}`);
    return { inspected: false, status: "fail" };
  }
  if (inspect.status !== 0) {
    failures.push(`Codex config repair failed: ${[inspect.stdout, inspect.stderr].filter(Boolean).join("\n").trim()}`);
    return { inspected: true, status: "fail", exitCode: inspect.status };
  }

  let report;
  try {
    report = JSON.parse(inspect.stdout || "{}");
  } catch (error) {
    failures.push(`Codex config repair did not emit parseable JSON: ${error.message}`);
    return { inspected: true, status: "fail", exitCode: inspect.status };
  }

  const removedDeprecatedFields = report.removedDeprecatedFields || [];
  const configNeedsApply = report.addedTableCount > 0 || removedDeprecatedFields.length > 0;

  if (options.apply && configNeedsApply) {
    if (fs.existsSync(destination)) backupTarget(destination);
    ensureDir(path.dirname(destination));
    const apply = spawnSync(process.execPath, [
      "scripts/merge-codex-config.mjs",
      template,
      destination,
      "--json"
    ], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      timeout: 60000
    });

    if (apply.error) {
      failures.push(`Codex config repair apply could not run: ${apply.error.message}`);
      return { inspected: true, status: "fail" };
    }
    if (apply.status !== 0) {
      failures.push(`Codex config repair apply failed: ${[apply.stdout, apply.stderr].filter(Boolean).join("\n").trim()}`);
      return { inspected: true, status: "fail", exitCode: apply.status };
    }
  }

  if (configNeedsApply) {
    recordAction({
      id: "codex-config",
      kind: report.addedTableCount > 0 ? "merge-config" : "remove-deprecated-config",
      source: template,
      target: destination,
      status: options.apply ? "applied" : "planned",
      reason: [
        report.addedTableCount > 0 ? `missing ${report.addedTableCount} managed config table(s)` : null,
        removedDeprecatedFields.length > 0 ? `deprecated managed field(s): ${removedDeprecatedFields.join(", ")}` : null
      ].filter(Boolean).join("; ")
    });
  }

  return {
    inspected: true,
    status: configNeedsApply ? (options.apply ? "applied" : "planned") : "current",
    addedTables: report.addedTables || [],
    addedTableCount: report.addedTableCount || 0,
    removedDeprecatedFields
  };
}

function marketplaceEntry(pluginTarget) {
  return {
    name: "codex-chef-workflows",
    source: {
      source: "local",
      path: pluginTarget
    },
    policy: {
      installation: "AVAILABLE",
      authentication: "NONE"
    },
    category: "Productivity",
    interface: {
      displayName: "Codex Chef Workflows",
      shortDescription: "Security-first Codex setup maintenance workflow."
    }
  };
}

function stableJson(value) {
  return JSON.stringify(value);
}

function repairMarketplace() {
  const marketplacePath = path.join(options.agentsHome, "plugins", "marketplace.json");
  const pluginTarget = path.join(options.codexHome, "plugins", "codex-chef-workflows");
  const desired = marketplaceEntry(pluginTarget);
  let marketplace = { name: "codex-chef", plugins: [] };
  let parseError = null;

  if (fs.existsSync(marketplacePath)) {
    try {
      marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
    } catch (error) {
      parseError = error;
    }
  }

  if (parseError) {
    failures.push(`Cannot repair plugin marketplace because it is invalid JSON: ${redact(marketplacePath)} (${parseError.message})`);
    return { inspected: true, status: "fail", path: redact(marketplacePath) };
  }

  if (!Array.isArray(marketplace.plugins)) marketplace.plugins = [];
  const beforeCount = marketplace.plugins.length;
  const existingIndex = marketplace.plugins.findIndex((plugin) => plugin?.name === desired.name);
  const before = existingIndex >= 0 ? marketplace.plugins[existingIndex] : null;
  const needsUpdate = stableJson(before) !== stableJson(desired);

  if (!needsUpdate) {
    return {
      inspected: true,
      status: "current",
      path: redact(marketplacePath),
      preservedPlugins: beforeCount
    };
  }

  if (options.apply) {
    ensureDir(path.dirname(marketplacePath));
    const backup = backupTarget(marketplacePath);
    if (existingIndex >= 0) marketplace.plugins[existingIndex] = desired;
    else marketplace.plugins.push(desired);
    fs.writeFileSync(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`, "utf8");
    recordAction({
      id: "plugin-marketplace",
      kind: existingIndex >= 0 ? "update-marketplace-entry" : "add-marketplace-entry",
      target: marketplacePath,
      backup,
      status: "applied",
      reason: existingIndex >= 0 ? "stale Codex Chef plugin entry" : "missing Codex Chef plugin entry"
    });
  } else {
    recordAction({
      id: "plugin-marketplace",
      kind: existingIndex >= 0 ? "update-marketplace-entry" : "add-marketplace-entry",
      target: marketplacePath,
      status: "planned",
      reason: existingIndex >= 0 ? "stale Codex Chef plugin entry" : "missing Codex Chef plugin entry"
    });
  }

  return {
    inspected: true,
    status: options.apply ? "applied" : "planned",
    path: redact(marketplacePath),
    preservedPlugins: beforeCount,
    action: existingIndex >= 0 ? "update-entry" : "add-entry"
  };
}

function inspectSkills() {
  const expected = readJson("catalog/skills.json")
    .skills
    .filter((skill) => skill.install === true)
    .map((skill) => skill.name)
    .sort();
  const expectedSet = new Set(expected);
  const roots = [
    path.join(options.codexHome, "skills"),
    path.join(options.agentsHome, "skills")
  ];
  const locations = new Map();

  for (const skillRoot of roots) {
    if (!fs.existsSync(skillRoot)) continue;
    for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      const current = locations.get(entry.name) || [];
      current.push(skillRoot);
      locations.set(entry.name, current);
    }
  }

  const installed = [...locations.keys()].sort();
  const missing = expected.filter((skill) => !locations.has(skill));
  const extra = installed.filter((skill) => !expectedSet.has(skill));
  const duplicates = [...locations.entries()]
    .filter(([, skillRoots]) => skillRoots.length > 1)
    .map(([name, skillRoots]) => ({ name, roots: skillRoots.map(redact) }));

  if (extra.length > 0) {
    warnings.push(`${extra.length} non-curated global skill(s) are installed; repair reports them but does not delete user skills.`);
  }
  if (duplicates.length > 0) {
    warnings.push(`${duplicates.length} duplicate global skill name(s) are visible across skill roots.`);
  }

  return {
    inspected: true,
    expected: expected.length,
    installed: installed.length,
    missing,
    extraCount: extra.length,
    duplicateCount: duplicates.length,
    duplicates,
    cleanupCandidates: extra,
    roots: roots.map((skillRoot) => ({
      path: redact(skillRoot),
      exists: fs.existsSync(skillRoot),
      count: fs.existsSync(skillRoot)
        ? fs.readdirSync(skillRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).length
        : 0
    }))
  };
}

let managedFiles;
let config;
let marketplace;
let skills;

try {
  managedFiles = repairManagedFiles();
  config = runConfigMerge();
  marketplace = repairMarketplace();
  skills = inspectSkills();
} catch (error) {
  failures.push(error.message);
}

const plannedCount = actions.filter((action) => action.status === "planned").length;
const appliedCount = actions.filter((action) => action.status === "applied").length;
const destructivePlanned = actions.filter((action) => action.kind === "delete-extra-managed-plugin-file");

if (options.pruneManagedPluginExtras && !options.apply && destructivePlanned.length > 0) {
  warnings.push("--prune-managed-plugin-extras was requested in preview mode; no files were deleted.");
}

const attentionReasons = [
  ...warnings,
  ...(skills?.missing?.length > 0 ? [`${skills.missing.length} curated skill(s) are missing; run the installer with skill installation enabled.`] : []),
  ...(managedFiles?.extraPluginFiles?.length > 0 && !options.pruneManagedPluginExtras
    ? ["Managed plugin has extra files; rerun repair with --prune-managed-plugin-extras only after reviewing the backup/destructive scope."]
    : [])
];

const status = failures.length > 0
  ? "fail"
  : options.apply
    ? appliedCount > 0
      ? (attentionReasons.length > 0 ? "attention" : "repaired")
      : (attentionReasons.length > 0 ? "attention" : "ok")
    : plannedCount > 0 || attentionReasons.length > 0
      ? "attention"
      : "ok";

const report = {
  schemaVersion: "codex-chef.repair.v1",
  generatedAt: new Date().toISOString(),
  mode: options.apply ? "apply" : "plan",
  status,
  codexHome: redact(options.codexHome),
  agentsHome: redact(options.agentsHome),
  backupRoot: options.apply && !options.noBackup && fs.existsSync(backupRoot) ? redact(backupRoot) : null,
  managedFiles,
  config,
  marketplace,
  skills,
  actions,
  warnings,
  attentionReasons,
  failures,
  nextActions: status === "fail"
    ? ["Fix failed repair items, then rerun npm run repair:install -- --apply."]
    : options.apply
      ? ["Run npm run codex:status after restarting Codex."]
      : plannedCount > 0
        ? ["Review the planned actions, then rerun with --apply to repair managed drift."]
        : attentionReasons.length > 0
          ? ["Review attention items; non-curated or duplicate skills are reported but not deleted automatically."]
          : ["No repair action needed."]
};

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Codex Chef repair");
  console.log(`Mode: ${report.mode}`);
  console.log(`Overall: ${report.status}`);
  console.log(`Codex home: ${report.codexHome}`);
  console.log(`Agents home: ${report.agentsHome}`);
  if (managedFiles) {
    console.log(`Managed files: ${managedFiles.current}/${managedFiles.expected} current, ${managedFiles.planned} planned, ${managedFiles.applied} applied`);
  }
  if (config) {
    console.log(`Config: ${config.status}${config.addedTableCount ? ` (${config.addedTableCount} missing table(s))` : ""}`);
  }
  if (marketplace) {
    console.log(`Marketplace: ${marketplace.status}`);
  }
  if (skills) {
    console.log(`Skills: ${skills.installed} unique installed (${skills.expected} curated expected, ${skills.missing.length} missing, ${skills.extraCount} non-curated, ${skills.duplicateCount} duplicate names)`);
  }
  for (const action of actions) {
    console.log(`Action: ${action.status} ${action.kind} ${action.target || ""}`.trim());
  }
  for (const warning of warnings) console.log(`Warning: ${warning}`);
  for (const failure of failures) console.error(`Failure: ${failure}`);
  if (report.backupRoot) console.log(`Backup: ${report.backupRoot}`);
}

if (status === "fail") process.exit(1);
