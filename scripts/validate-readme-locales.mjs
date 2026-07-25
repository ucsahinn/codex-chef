#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];
const locales = [
  { file: "README.de.md", label: "Deutsch" },
  { file: "README.es.md", label: "Español" },
  { file: "README.md", label: "English" },
  { file: "README.pt-BR.md", label: "Português (Brasil)" },
  { file: "README.tr.md", label: "Türkçe" },
  { file: "README.fr.md", label: "Français" }
];
const sharedSignals = [
  "assets/banner.svg",
  "readme-6%20languages",
  "scripts\\install.ps1",
  "scripts/install.sh",
  "scripts/plan-install.mjs",
  "npm run check",
  "docs/README.md",
  "docs/README.tr.md",
  "kb/README.md"
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

for (const { file } of locales) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing localized README entry point: ${file}`);
    continue;
  }
  const text = read(file);
  for (const { file: peer, label } of locales) {
    if (!text.includes(`href="${peer}"`)) failures.push(`${file} missing language switch link to ${peer}`);
    if (!text.includes(label)) failures.push(`${file} missing language label: ${label}`);
  }
  for (const signal of sharedSignals) {
    if (!text.includes(signal)) failures.push(`${file} missing public entry signal: ${signal}`);
  }
  if (!/unofficial|inoffiziell|no oficial|não oficial|non officiel|resmi olmayan|resmi OpenAI ürünü değildir/i.test(text)) {
    failures.push(`${file} must state that Codex Chef is unofficial.`);
  }
  if (!text.includes("OpenAI") || !text.includes("Codex")) failures.push(`${file} must name OpenAI and Codex.`);
  if (/(?:TODO|TBD|translation needed|lorem ipsum)/i.test(text)) failures.push(`${file} contains placeholder text.`);
}

for (const file of ["README.md", "README.tr.md"]) {
  const text = read(file);
  for (const required of [
    "Get-Command git",
    "Get-Command node",
    "Get-Command npx",
    "Get-Command codex",
    "node -v",
    "codebase-memory"
  ]) {
    if (!text.includes(required)) failures.push(`${file} missing first-run or local graph signal: ${required}`);
  }
}

const english = read("README.md");
if (!english.includes("six README entry points")) failures.push("README.md must describe six README entry points.");
if (!english.includes("English and Turkish deep docs")) failures.push("README.md must describe canonical English and Turkish deep docs.");

if (failures.length > 0) {
  console.error("README locale validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`README locale validation passed. Checked ${locales.length} honest public entry points.`);
