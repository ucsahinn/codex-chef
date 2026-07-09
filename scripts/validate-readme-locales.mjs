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

const requiredSignalGroups = [
  ["assets/banner.svg"],
  ["docs-6%20languages"],
  ["install.ps1"],
  ["install.sh"],
  ["scripts/plan-install.mjs"],
  ["npm run check"],
  [
    "docs/security-model.md",
    "docs/security-model.de.md",
    "docs/security-model.es.md",
    "docs/security-model.pt-BR.md",
    "docs/security-model.tr.md",
    "docs/security-model.fr.md"
  ],
  [
    "docs/public-readiness.md",
    "docs/public-readiness.de.md",
    "docs/public-readiness.es.md",
    "docs/public-readiness.pt-BR.md",
    "docs/public-readiness.tr.md",
    "docs/public-readiness.fr.md"
  ],
  [
    "docs/ecc-compatibility.md",
    "docs/ecc-compatibility.de.md",
    "docs/ecc-compatibility.es.md",
    "docs/ecc-compatibility.pt-BR.md",
    "docs/ecc-compatibility.tr.md",
    "docs/ecc-compatibility.fr.md"
  ],
  [
    "docs/advisory-sources.md",
    "docs/advisory-sources.de.md",
    "docs/advisory-sources.es.md",
    "docs/advisory-sources.pt-BR.md",
    "docs/advisory-sources.tr.md",
    "docs/advisory-sources.fr.md"
  ]
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

for (const { file } of locales) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing localized README entry point: ${file}`);
  }
}

for (const { file } of locales) {
  if (!fs.existsSync(path.join(root, file))) continue;
  const text = read(file);

  for (const { file: linkedFile, label } of locales) {
    if (!text.includes(`href="${linkedFile}"`)) {
      failures.push(`${file} missing language switch link to ${linkedFile}`);
    }
    if (!text.includes(label)) {
      failures.push(`${file} missing language label: ${label}`);
    }
  }

  for (const signals of requiredSignalGroups) {
    if (!signals.some((signal) => text.includes(signal))) {
      failures.push(`${file} missing required README signal: ${signals.join(" or ")}`);
    }
  }

  if (!/unofficial|inoffizieller|no oficial|comunit[aá]rio n(?:a|ã)o oficial|communautaire non officiel|resmi olmayan|resmi OpenAI ürünü değildir|community starter/i.test(text)) {
    failures.push(`${file} must state that the starter is unofficial/community maintained.`);
  }
  if (!/OpenAI/.test(text) || !/Codex/.test(text)) {
    failures.push(`${file} must name OpenAI and Codex clearly.`);
  }
  if (/(?:TODO|TBD|translation needed|lorem ipsum)/i.test(text)) {
    failures.push(`${file} contains placeholder localization text.`);
  }
}

const english = read("README.md");
if (!english.includes("multilingual README entry points")) {
  failures.push("README.md must describe the multilingual README entry points.");
}
if (!english.includes("six-language deep docs")) {
  failures.push("README.md must describe six-language deep docs coverage.");
}
for (const [file, text] of [
  ["README.md", english],
  ["README.tr.md", read("README.tr.md")]
]) {
  for (const required of ["Get-Command git", "Get-Command node", "Get-Command npx", "Get-Command codex", "node -v", "docs/troubleshooting"]) {
    if (!text.includes(required)) failures.push(`${file} must show first-run prerequisite checks before copy-paste install.`);
  }
  if (!text.includes("codebase-memory") || !/local codebase graph reads|lokal codebase graph okumalari/i.test(text)) {
    failures.push(`${file} must list codebase-memory in the default-enabled local codebase graph read boundary.`);
  }
}

if (failures.length > 0) {
  console.error("README locale validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`README locale validation passed. Checked ${locales.length} root README files.`);
