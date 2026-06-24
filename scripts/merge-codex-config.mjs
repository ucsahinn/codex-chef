#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const options = {
  dryRun: false,
  json: false
};

const positional = [];
for (const arg of args) {
  if (arg === "--dry-run") options.dryRun = true;
  else if (arg === "--json") options.json = true;
  else positional.push(arg);
}

const [templatePath, destinationPath] = positional;
if (!templatePath || !destinationPath) {
  console.error("Usage: node scripts/merge-codex-config.mjs <template.toml> <destination.toml> [--dry-run] [--json]");
  process.exit(2);
}

const managedTablePatterns = [
  /^features$/,
  /^shell_environment_policy$/,
  /^memories$/,
  /^apps\._default$/,
  /^agents$/,
  /^agents\.[A-Za-z0-9_.-]+$/,
  /^sandbox_workspace_write$/,
  /^windows$/,
  /^mcp_servers\.[A-Za-z0-9_-]+(?:\.tools\.[A-Za-z0-9_-]+)?$/
];
const managedRootKeys = new Set([
  "model",
  "review_model",
  "model_reasoning_effort",
  "model_reasoning_summary",
  "model_verbosity",
  "personality",
  "approval_policy",
  "sandbox_mode"
]);

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function parseRootAssignments(text) {
  const normalized = normalizeNewlines(text);
  const assignments = new Map();
  const lines = normalized.split("\n");
  for (const line of lines) {
    if (/^\s*\[/.test(line)) break;
    const match = /^\s*([A-Za-z0-9_.-]+)\s*=/.exec(line);
    if (match) assignments.set(match[1], line);
  }
  return assignments;
}

function insertBeforeFirstTable(text, insertion) {
  const normalized = normalizeNewlines(text).trimEnd();
  if (!insertion) return normalized;
  const firstTableMatch = /^\s*\[/m.exec(normalized);
  if (!firstTableMatch) {
    return `${normalized}${normalized ? "\n\n" : ""}${insertion}`;
  }

  const before = normalized.slice(0, firstTableMatch.index).trimEnd();
  const after = normalized.slice(firstTableMatch.index).trimStart();
  return `${before}${before ? "\n\n" : ""}${insertion}\n\n${after}`;
}

function parseTables(text) {
  const normalized = normalizeNewlines(text);
  const lines = normalized.split("\n");
  const tables = new Map();
  let current = null;
  let currentLines = [];

  function flush() {
    if (!current) return;
    tables.set(current, currentLines.join("\n").trimEnd());
  }

  for (const line of lines) {
    const match = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (match) {
      flush();
      current = match[1].trim();
      currentLines = [line];
      continue;
    }
    if (current) currentLines.push(line);
  }
  flush();
  return tables;
}

function isManagedTable(tableName) {
  return managedTablePatterns.some((pattern) => pattern.test(tableName));
}

const template = normalizeNewlines(fs.readFileSync(templatePath, "utf8"));
const destinationExists = fs.existsSync(destinationPath);
const destination = destinationExists ? normalizeNewlines(fs.readFileSync(destinationPath, "utf8")) : "";
const templateRootAssignments = parseRootAssignments(template);
const destinationRootAssignments = parseRootAssignments(destination);
const templateTables = parseTables(template);
const destinationTables = parseTables(destination);
const missing = [];
const missingRootAssignments = [];
const removedDeprecatedFields = [];
const updatedManagedFields = [];
const fullTemplateInstall = !destinationExists;

function addUnique(list, value) {
  if (!list.includes(value)) list.push(value);
}

function normalizeManagedFields(text) {
  const lines = normalizeNewlines(text).split("\n");
  let currentTable = null;
  let appsSeen = null;
  const next = [];

  function flushAppsDefaults() {
    if (!appsSeen) return;
    if (!appsSeen.enabled) {
      addUnique(updatedManagedFields, "apps._default.enabled");
      next.push("enabled = false");
    }
    if (!appsSeen.destructive_enabled) {
      addUnique(updatedManagedFields, "apps._default.destructive_enabled");
      next.push("destructive_enabled = false");
    }
    if (!appsSeen.open_world_enabled) {
      addUnique(updatedManagedFields, "apps._default.open_world_enabled");
      next.push("open_world_enabled = false");
    }
    appsSeen = null;
  }

  for (const line of lines) {
    const tableMatch = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (tableMatch) {
      flushAppsDefaults();
      currentTable = tableMatch[1].trim();
      if (currentTable === "apps._default") {
        appsSeen = {
          enabled: false,
          destructive_enabled: false,
          open_world_enabled: false
        };
      }
      next.push(line);
      continue;
    }
    if (appsSeen && /^\s*default_tools_enabled\s*=/.test(line)) {
      addUnique(removedDeprecatedFields, "apps._default.default_tools_enabled");
      continue;
    }
    const safetyMatch = /^(\s*)(enabled|destructive_enabled|open_world_enabled)(\s*=\s*)(true|false)(\s*(?:#.*)?)$/.exec(line);
    if (appsSeen && safetyMatch) {
      const [, indent, key, separator, value, suffix] = safetyMatch;
      appsSeen[key] = true;
      if (value === "true") {
        addUnique(updatedManagedFields, `apps._default.${key}`);
        next.push(`${indent}${key}${separator}false${suffix}`);
      } else {
        next.push(line);
      }
      continue;
    }
    next.push(line);
  }

  flushAppsDefaults();
  return next.join("\n");
}

for (const [tableName, tableText] of templateTables.entries()) {
  if (!isManagedTable(tableName)) continue;
  if (destinationTables.has(tableName)) continue;
  missing.push({ tableName, tableText });
}

for (const [key, line] of templateRootAssignments.entries()) {
  if (!managedRootKeys.has(key)) continue;
  if (destinationRootAssignments.has(key)) continue;
  missingRootAssignments.push({ key, line });
}

const sanitizedDestination = normalizeManagedFields(destination);

const report = {
  schemaVersion: "codex-chef.config-merge.v1",
  template: path.resolve(templatePath),
  destination: path.resolve(destinationPath),
  destinationExists,
  fullTemplateInstall,
  dryRun: options.dryRun,
  addedRootKeys: missingRootAssignments.map((entry) => entry.key),
  addedRootKeyCount: missingRootAssignments.length,
  addedTables: missing.map((entry) => entry.tableName),
  addedTableCount: missing.length,
  removedDeprecatedFields,
  updatedManagedFields
};

if (fullTemplateInstall && !options.dryRun) {
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.writeFileSync(destinationPath, `${template.trimEnd()}\n`, "utf8");
} else if ((missingRootAssignments.length > 0 || missing.length > 0 || removedDeprecatedFields.length > 0 || updatedManagedFields.length > 0) && !options.dryRun) {
  const base = sanitizedDestination.trimEnd();
  const rootAddition = missingRootAssignments.map((entry) => entry.line).join("\n");
  const addition = missing.map((entry) => entry.tableText).join("\n\n");
  const withRootDefaults = rootAddition
    ? insertBeforeFirstTable(
        base,
        `# Codex Chef merged root defaults. Existing user-defined root settings were preserved.\n${rootAddition}`
      )
    : base;
  const next = addition
    ? `${withRootDefaults}${withRootDefaults ? "\n\n" : ""}# Codex Chef merged config blocks. Existing user-defined tables were preserved.\n${addition}\n`
    : `${withRootDefaults}\n`;
  fs.writeFileSync(destinationPath, next, "utf8");
}

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else if (fullTemplateInstall && options.dryRun) {
  console.log("Would install full Codex Chef config template.");
} else if (fullTemplateInstall) {
  console.log("Installed full Codex Chef config template.");
} else if (missingRootAssignments.length === 0 && missing.length === 0 && removedDeprecatedFields.length === 0 && updatedManagedFields.length === 0) {
  console.log("Codex config already contains all managed Codex Chef blocks.");
} else if (options.dryRun) {
  const parts = [];
  if (missingRootAssignments.length > 0) parts.push(`merge ${missingRootAssignments.length} missing Codex Chef root default(s): ${missingRootAssignments.map((entry) => entry.key).join(", ")}`);
  if (missing.length > 0) parts.push(`merge ${missing.length} missing Codex Chef config block(s): ${missing.map((entry) => entry.tableName).join(", ")}`);
  if (removedDeprecatedFields.length > 0) parts.push(`remove deprecated managed field(s): ${removedDeprecatedFields.join(", ")}`);
  if (updatedManagedFields.length > 0) parts.push(`update managed field(s): ${updatedManagedFields.join(", ")}`);
  console.log(`Would ${parts.join("; ")}`);
} else {
  const parts = [];
  if (missingRootAssignments.length > 0) parts.push(`merged ${missingRootAssignments.length} missing Codex Chef root default(s): ${missingRootAssignments.map((entry) => entry.key).join(", ")}`);
  if (missing.length > 0) parts.push(`merged ${missing.length} missing Codex Chef config block(s): ${missing.map((entry) => entry.tableName).join(", ")}`);
  if (removedDeprecatedFields.length > 0) parts.push(`removed deprecated managed field(s): ${removedDeprecatedFields.join(", ")}`);
  if (updatedManagedFields.length > 0) parts.push(`updated managed field(s): ${updatedManagedFields.join(", ")}`);
  console.log(parts.join("; "));
}
