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

const riskPatterns = [
  {
    name: "remote shell pipe",
    pattern: /\b(?:curl|wget)\b[^\n|;]*(?:\||>)\s*(?:sh|bash|powershell|pwsh)\b/i
  },
  {
    name: "PowerShell download execute",
    pattern: /\b(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^\n|;]*(?:\||;)\s*(?:iex|Invoke-Expression)\b/i
  },
  {
    name: "PowerShell encoded command",
    pattern: /\b(?:powershell|pwsh)(?:\.exe)?\b[^\n]*-(?:enc|encodedcommand)\b/i
  },
  {
    name: "unsafe root removal",
    pattern: /\brm\s+-rf\s+\/(?:\s|$)/i
  },
  {
    name: "world-writable chmod",
    pattern: /\bchmod\s+777\b/i
  },
  {
    name: "floating active package spec",
    pattern: /(?:args\s*=\s*\[[^\]]*|command\s*[:=][^\n]*)@latest/i
  },
  {
    name: "unpinned git package source",
    pattern: /git\+https:\/\/[^"'\s@]+(?=["'\s])/i
  }
];

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
  const rel = posix(path.relative(root, filePath));
  if (rel === "scripts/scan-supply-chain-iocs.mjs") return false;
  return textExtensions.has(path.extname(filePath)) || path.basename(filePath).startsWith(".");
}

for (const file of walk(root).filter(isTextFile)) {
  const rel = posix(path.relative(root, file));
  const text = fs.readFileSync(file, "utf8");
  for (const { name, pattern } of riskPatterns) {
    if (pattern.test(text)) {
      failures.push(`${name} pattern found in ${rel}`);
    }
  }
}

for (const installer of ["scripts/install.ps1", "scripts/install.sh"]) {
  const text = fs.readFileSync(path.join(root, installer), "utf8");
  if (/\bnpm(?:\.cmd)?\s+(?:install|ci)\b/i.test(text)) {
    failures.push(`${installer} must not install npm dependencies implicitly`);
  }
}

if (failures.length > 0) {
  console.error("Supply-chain IOC scan failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Supply-chain IOC scan passed.");
