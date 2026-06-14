#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];

const ignoredDirs = new Set([".git", ".serena", "node_modules", "dist", "build", "coverage", ".next", "out", "tmp", "temp"]);
const textExtensions = new Set([
  ".md",
  ".json",
  ".toml",
  ".yml",
  ".yaml",
  ".ps1",
  ".sh",
  ".mjs",
  ".js",
  ".svg",
  ".rules",
  ".gitignore"
]);

const dangerousCodePoints = new Map([
  [0x200b, "ZERO WIDTH SPACE"],
  [0x200c, "ZERO WIDTH NON-JOINER"],
  [0x200d, "ZERO WIDTH JOINER"],
  [0x202a, "LEFT-TO-RIGHT EMBEDDING"],
  [0x202b, "RIGHT-TO-LEFT EMBEDDING"],
  [0x202c, "POP DIRECTIONAL FORMATTING"],
  [0x202d, "LEFT-TO-RIGHT OVERRIDE"],
  [0x202e, "RIGHT-TO-LEFT OVERRIDE"],
  [0x2066, "LEFT-TO-RIGHT ISOLATE"],
  [0x2067, "RIGHT-TO-LEFT ISOLATE"],
  [0x2068, "FIRST STRONG ISOLATE"],
  [0x2069, "POP DIRECTIONAL ISOLATE"],
  [0xfeff, "ZERO WIDTH NO-BREAK SPACE"]
]);

function posix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath)) || path.basename(filePath).startsWith(".");
}

function locationForIndex(text, index) {
  const before = text.slice(0, index);
  const lines = before.split(/\r?\n/);
  return {
    line: lines.length,
    column: [...lines.at(-1)].length + 1
  };
}

for (const file of walk(root).filter(isTextFile)) {
  const rel = posix(path.relative(root, file));
  const text = fs.readFileSync(file, "utf8");
  for (const [index, char] of [...text].entries()) {
    const codePoint = char.codePointAt(0);
    if (!dangerousCodePoints.has(codePoint)) continue;
    if (codePoint === 0xfeff && index === 0) continue;
    const location = locationForIndex(text, index);
    failures.push(`${rel}:${location.line}:${location.column} contains ${dangerousCodePoints.get(codePoint)} (U+${codePoint.toString(16).toUpperCase().padStart(4, "0")})`);
  }
}

if (failures.length > 0) {
  console.error("Content safety validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Content safety validation passed. Checked ${walk(root).filter(isTextFile).length} text files.`);
