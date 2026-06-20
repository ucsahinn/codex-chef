#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const args = process.argv.slice(2);
const options = {
  backupRoot: null,
  operation: "unknown",
  platform: process.platform
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--backup-root") {
    options.backupRoot = args[index + 1] || null;
    index += 1;
  } else if (arg === "--operation") {
    options.operation = args[index + 1] || "unknown";
    index += 1;
  } else if (arg === "--platform") {
    options.platform = args[index + 1] || process.platform;
    index += 1;
  } else if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

if (!options.backupRoot) throw new Error("--backup-root is required");

const manifestName = ".codex-chef-backup.json";
const backupRoot = path.resolve(options.backupRoot);
if (!fs.existsSync(backupRoot) || !fs.statSync(backupRoot).isDirectory()) {
  throw new Error(`Backup root does not exist: ${backupRoot}`);
}

function printHelp() {
  console.log(`Usage: node scripts/write-backup-manifest.mjs --backup-root <path> [--operation <name>] [--platform <name>]`);
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function validateRelativePath(relativePath) {
  if (!relativePath || relativePath.includes("\0")) return false;
  if (path.isAbsolute(relativePath) || path.win32.isAbsolute(relativePath) || path.posix.isAbsolute(relativePath)) return false;
  if (/^[A-Za-z]:/.test(relativePath) || relativePath.startsWith("\\\\") || relativePath.startsWith("//")) return false;
  const normalized = relativePath.replaceAll("\\", "/");
  if (normalized.startsWith("../") || normalized.includes("/../") || normalized.endsWith("/..")) return false;
  return normalized.split("/").filter(Boolean).every((part) => part !== "." && part !== "..");
}

function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function listEntries() {
  const entries = [];
  const issues = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relative = toPosix(path.relative(backupRoot, fullPath));
      if (relative === manifestName) continue;
      if (!validateRelativePath(relative)) {
        issues.push(`unsafe-relative-path:${relative}`);
        continue;
      }
      const stat = fs.lstatSync(fullPath);
      if (stat.isSymbolicLink()) {
        issues.push(`symlink:${relative}`);
        continue;
      }
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile()) {
        entries.push({
          backupRelativePath: relative,
          size: stat.size,
          sha256: hashFile(fullPath)
        });
      }
    }
  }

  walk(backupRoot);
  entries.sort((a, b) => a.backupRelativePath.localeCompare(b.backupRelativePath));
  return { entries, issues };
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const { entries, issues } = listEntries();
const manifest = {
  schemaVersion: "codex-chef.backup.v1",
  createdAt: new Date().toISOString(),
  packageName: packageJson.name,
  packageVersion: packageJson.version,
  operation: options.operation,
  platform: options.platform,
  entries,
  issues
};

fs.writeFileSync(path.join(backupRoot, manifestName), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
