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

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
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
const templateTables = parseTables(template);
const destinationTables = parseTables(destination);
const missing = [];
const removedDeprecatedFields = [];

function removeDeprecatedManagedFields(text) {
  const lines = normalizeNewlines(text).split("\n");
  let currentTable = null;
  const next = [];

  for (const line of lines) {
    const tableMatch = /^\s*\[([^\]]+)\]\s*$/.exec(line);
    if (tableMatch) currentTable = tableMatch[1].trim();
    if (currentTable === "apps._default" && /^\s*default_tools_enabled\s*=/.test(line)) {
      removedDeprecatedFields.push("apps._default.default_tools_enabled");
      continue;
    }
    next.push(line);
  }

  return next.join("\n");
}

for (const [tableName, tableText] of templateTables.entries()) {
  if (!isManagedTable(tableName)) continue;
  if (destinationTables.has(tableName)) continue;
  missing.push({ tableName, tableText });
}

const sanitizedDestination = removeDeprecatedManagedFields(destination);

const report = {
  schemaVersion: "codex-chef.config-merge.v1",
  template: path.resolve(templatePath),
  destination: path.resolve(destinationPath),
  destinationExists,
  dryRun: options.dryRun,
  addedTables: missing.map((entry) => entry.tableName),
  addedTableCount: missing.length,
  removedDeprecatedFields
};

if ((missing.length > 0 || removedDeprecatedFields.length > 0) && !options.dryRun) {
  const prefix = sanitizedDestination.trimEnd();
  const addition = missing.map((entry) => entry.tableText).join("\n\n");
  const next = missing.length > 0
    ? `${prefix}${prefix ? "\n\n" : ""}# Codex Chef merged config blocks. Existing user-defined tables were preserved.\n${addition}\n`
    : `${prefix}\n`;
  fs.writeFileSync(destinationPath, next, "utf8");
}

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else if (missing.length === 0 && removedDeprecatedFields.length === 0) {
  console.log("Codex config already contains all managed Codex Chef blocks.");
} else if (options.dryRun) {
  const parts = [];
  if (missing.length > 0) parts.push(`merge ${missing.length} missing Codex Chef config block(s): ${missing.map((entry) => entry.tableName).join(", ")}`);
  if (removedDeprecatedFields.length > 0) parts.push(`remove deprecated managed field(s): ${removedDeprecatedFields.join(", ")}`);
  console.log(`Would ${parts.join("; ")}`);
} else {
  const parts = [];
  if (missing.length > 0) parts.push(`merged ${missing.length} missing Codex Chef config block(s): ${missing.map((entry) => entry.tableName).join(", ")}`);
  if (removedDeprecatedFields.length > 0) parts.push(`removed deprecated managed field(s): ${removedDeprecatedFields.join(", ")}`);
  console.log(parts.join("; "));
}
