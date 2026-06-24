#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const args = process.argv.slice(2);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function argValue(name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  return args[index + 1] || "";
}

function hasFlag(name) {
  return args.includes(name);
}

function usage() {
  console.error("Usage: node scripts/extract-release-notes.mjs [--check] [--file docs/release-notes.md] [--tag vX.Y.Z] [--out tmp/release-notes-current.md]");
}

if (hasFlag("--help") || hasFlag("-h")) {
  usage();
  process.exit(0);
}

const packageJson = readJson("package.json");
const tag = argValue("--tag") || `v${packageJson.version}`;
const sourceFile = argValue("--file") || "docs/release-notes.md";
const outFile = argValue("--out");
const checkOnly = hasFlag("--check");
const sourcePath = path.join(root, sourceFile);

if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`Invalid release tag: ${tag}`);
  usage();
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Release notes source not found: ${sourceFile}`);
  process.exit(1);
}

const text = fs.readFileSync(sourcePath, "utf8");
const headingPattern = new RegExp(`^## ${tag.replace(/\./g, "\\.")} - .*$`, "m");
const match = headingPattern.exec(text);
if (!match) {
  console.error(`${sourceFile} does not contain a section for ${tag}`);
  process.exit(1);
}

const start = match.index;
const rest = text.slice(start + match[0].length);
const nextHeading = /\n## v\d+\.\d+\.\d+ - /.exec(rest);
const end = nextHeading ? start + match[0].length + nextHeading.index : text.length;
const section = text.slice(start, end).trim() + "\n";

if (checkOnly) {
  console.log(`Release notes extraction validation passed for ${tag}.`);
} else if (outFile) {
  const resolvedOut = path.resolve(root, outFile);
  if (!resolvedOut.startsWith(root + path.sep)) {
    console.error(`Output path must stay inside the repository: ${outFile}`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  fs.writeFileSync(resolvedOut, section, "utf8");
  console.log(`Wrote ${tag} release notes to ${outFile}`);
} else {
  process.stdout.write(section);
}
