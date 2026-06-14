#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];
const ignoredDirs = new Set([".git", ".serena", "node_modules", "dist", "build", "coverage", ".next", "tmp", "temp"]);

function posix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
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

function stripAnchor(target) {
  return target.split("#")[0];
}

function stripTitle(target) {
  const trimmed = target.trim();
  if (trimmed.startsWith("<") && trimmed.includes(">")) {
    return trimmed.slice(1, trimmed.indexOf(">"));
  }
  return trimmed.split(/\s+["']/)[0];
}

function isExternal(target) {
  return /^(?:https?:|mailto:|tel:)/i.test(target);
}

function validateMarkdownLinks(file) {
  const rel = posix(path.relative(root, file));
  const text = fs.readFileSync(file, "utf8");
  const linkPattern = /!?\[[^\]\n]+\]\(([^)\n]+)\)/g;
  let match;
  while ((match = linkPattern.exec(text)) !== null) {
    const rawTarget = match[1].trim();
    if (!rawTarget || rawTarget.startsWith("#") || isExternal(rawTarget)) continue;
    const withoutTitle = stripTitle(rawTarget);
    const withoutAnchor = stripAnchor(withoutTitle);
    if (!withoutAnchor) continue;
    const decoded = decodeURI(withoutAnchor);
    const resolved = decoded.startsWith("/")
      ? path.join(root, decoded.slice(1))
      : path.resolve(path.dirname(file), decoded);
    if (!resolved.startsWith(root)) {
      failures.push(`Markdown link leaves repository in ${rel}: ${rawTarget}`);
      continue;
    }
    if (!fs.existsSync(resolved)) {
      failures.push(`Broken markdown link in ${rel}: ${rawTarget}`);
    }
  }
}

function validateWorkflow(file) {
  const rel = posix(path.relative(root, file));
  const text = fs.readFileSync(file, "utf8");
  if (/\t/.test(text)) failures.push(`YAML workflow contains tab indentation: ${rel}`);
  if (/permissions:\s*write-all/.test(text)) failures.push(`Workflow uses broad write-all permissions: ${rel}`);
  if (rel === ".github/workflows/validate.yml") {
    for (const required of ["permissions:", "contents: read", "npm run check", "bash -n scripts/install.sh"]) {
      if (!text.includes(required)) failures.push(`validate workflow missing ${required}`);
    }
  }
}

for (const file of walk(root)) {
  const rel = posix(path.relative(root, file));
  if (rel.endsWith(".md")) validateMarkdownLinks(file);
  if (rel.endsWith(".yml") || rel.endsWith(".yaml")) validateWorkflow(file);
}

if (failures.length > 0) {
  console.error("Documentation validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Documentation validation passed.");
