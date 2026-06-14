#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const docsDir = path.join(root, "docs");
const failures = [];

const localeCodes = ["de", "es", "pt-BR", "tr", "fr"];
const languageLabels = ["Deutsch", "Español", "English", "Português (Brasil)", "Türkçe", "Français"];
const generatedLocaleCodes = ["de", "es", "pt-BR", "fr"];

function isLocalizedDoc(file) {
  return /\.(?:de|es|pt-BR|tr|fr)\.md$/.test(file);
}

function baseFor(file) {
  return file.replace(/\.(?:de|es|pt-BR|tr|fr)\.md$/, ".md");
}

if (!fs.existsSync(docsDir)) {
  failures.push("Missing docs directory.");
} else {
  const docFiles = fs.readdirSync(docsDir).filter((file) => file.endsWith(".md")).sort();
  const docSet = new Set(docFiles);
  const baseDocs = docFiles.filter((file) => !isLocalizedDoc(file));

  for (const file of baseDocs) {
    const slug = file.replace(/\.md$/, "");
    for (const code of localeCodes) {
      const localized = `${slug}.${code}.md`;
      if (!docSet.has(localized)) {
        failures.push(`Missing localized doc for docs/${file}: docs/${localized}`);
      }
    }
  }

  for (const file of docFiles.filter(isLocalizedDoc)) {
    const base = baseFor(file);
    if (!docSet.has(base)) {
      failures.push(`Localized doc has no English source pair: docs/${file}`);
    }
  }

  for (const file of docFiles.filter((entry) => /\.(?:de|es|pt-BR|fr)\.md$/.test(entry))) {
    const text = fs.readFileSync(path.join(docsDir, file), "utf8");
    const slug = file.replace(/\.(?:de|es|pt-BR|fr)\.md$/, "");
    for (const label of languageLabels) {
      if (!text.includes(label)) {
        failures.push(`Localized doc docs/${file} missing language switch label: ${label}`);
      }
    }
    for (const code of generatedLocaleCodes) {
      if (!text.includes(`${slug}.${code}.md`)) {
        failures.push(`Localized doc docs/${file} missing peer link: ${slug}.${code}.md`);
      }
    }
    for (const required of [`${slug}.md`, `${slug}.tr.md`, "npm run validate:doc-locales"]) {
      if (!text.includes(required)) {
        failures.push(`Localized doc docs/${file} missing required sync signal: ${required}`);
      }
    }
    if (/(?:TODO|TBD|translation needed|lorem ipsum)/i.test(text)) {
      failures.push(`Localized doc docs/${file} contains placeholder localization text.`);
    }
  }
}

if (failures.length > 0) {
  console.error("Doc locale validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Doc locale validation passed for ${localeCodes.length + 1} documentation languages.`);
