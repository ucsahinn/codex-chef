#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const topCount = Number.parseInt(process.argv.find((arg) => arg.startsWith("--top="))?.slice(6) || "12", 10);
const categoryBudgets = {
  "runtime-startup": 14000,
  "runtime-config": 18000,
  "agent-role": 130000,
  "skill-trigger": 6000,
  "skill-deferred": 30000,
  "catalog-index": 70000,
  "catalog-corpus": 30000,
  "docs": 180000,
  "docs-release": 50000,
  "script-large": 90000,
  "scripts-validators": 180000,
  "other-source": 20000
};
const ignoredDirs = new Set([
  ".git",
  ".serena",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  "out",
  "tmp",
  "temp"
]);

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function isProbablyBinary(buffer) {
  if (buffer.includes(0)) return true;
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
  let control = 0;
  for (const byte of sample) {
    if (byte < 9 || (byte > 13 && byte < 32)) control += 1;
  }
  return sample.length > 0 && control / sample.length > 0.05;
}

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function categoryFor(rel) {
  if (rel === "templates/codex/AGENTS.md") return "runtime-startup";
  if (/^templates\/codex\/(?:config\.(?:windows|unix)\.toml|profiles\/.*\.toml|rules\/.*)$/.test(rel)) return "runtime-config";
  if (/^templates\/codex\/agents\/.*\.toml$/.test(rel)) return "agent-role";
  if (/^plugins\/[^/]+\/skills\/[^/]+\/SKILL\.md$/.test(rel)) return "skill-trigger";
  if (/^plugins\/[^/]+\/skills\/[^/]+\/(?:references|scripts|agents)\//.test(rel)) return "skill-deferred";
  if (rel === "catalog/agent-research-corpus.json") return "catalog-corpus";
  if (/^(?:catalog|manifests|schemas)\//.test(rel) || rel === "llms.txt") return "catalog-index";
  if (/^(?:CHANGELOG\.md|docs\/release-notes(?:\.[A-Za-z-]+)?\.md)$/.test(rel)) return "docs-release";
  if (/^(?:README|CHANGELOG|docs\/|SECURITY|SUPPORT|PRIVACY|CONTRIBUTING|CODE_OF_CONDUCT)/.test(rel)) return "docs";
  if (/^scripts\/(?:chef-cli|codex-status)\.mjs$/.test(rel)) return "script-large";
  if (/^scripts\//.test(rel)) return "scripts-validators";
  return "other-source";
}

const files = [];
for (const file of walk(root)) {
  const rel = toPosix(path.relative(root, file));
  const buffer = fs.readFileSync(file);
  if (isProbablyBinary(buffer)) continue;
  const text = buffer.toString("utf8");
  files.push({
    path: rel,
    category: categoryFor(rel),
    chars: text.length,
    estimatedTokens: estimateTokens(text)
  });
}

const categories = new Map();
for (const file of files) {
  const entry = categories.get(file.category) || { category: file.category, files: 0, chars: 0, estimatedTokens: 0 };
  entry.files += 1;
  entry.chars += file.chars;
  entry.estimatedTokens += file.estimatedTokens;
  categories.set(file.category, entry);
}

const categoryRows = [...categories.values()].sort((a, b) => b.estimatedTokens - a.estimatedTokens);
const budgetFindings = categoryRows.map((category) => {
  const budget = categoryBudgets[category.category] || null;
  const ratio = budget ? category.estimatedTokens / budget : null;
  const status = !budget
    ? "unbudgeted"
    : ratio > 1.2
      ? "over"
      : ratio > 0.9
        ? "near"
        : "ok";
  return {
    category: category.category,
    estimatedTokens: category.estimatedTokens,
    budget,
    status,
    ratio: ratio === null ? null : Number(ratio.toFixed(2)),
    recommendation: status === "over"
      ? "Split or archive this deferred surface only if it improves selection; do not remove capabilities to reduce token estimates."
      : status === "near"
        ? "Watch this surface in release review and prefer summaries, generated indexes, or deferred references for future growth."
        : "No action needed."
  };
});

const report = {
  note: "Token estimates use a coarse chars/4 heuristic. Treat them as comparison signals, not provider billing counts.",
  generatedAt: new Date().toISOString(),
  totals: {
    files: files.length,
    chars: files.reduce((sum, file) => sum + file.chars, 0),
    estimatedTokens: files.reduce((sum, file) => sum + file.estimatedTokens, 0)
  },
  categoryBudgets,
  categories: categoryRows,
  budgetFindings,
  topFiles: [...files].sort((a, b) => b.estimatedTokens - a.estimatedTokens).slice(0, Number.isFinite(topCount) ? topCount : 12),
  guidance: [
    "Do not delete docs, skills, agents, or MCP definitions to save tokens; most are deferred surfaces until selected.",
    "Keep SKILL.md triggers concise and move heavy procedures into references or scripts.",
    "Use context-budget-planner for broad work, then load catalogs/manifests before full files.",
    "Use token-safe profile knobs for verbosity, compaction, and tool-output ceilings without disabling features.",
    "Leave subagent model and reasoning unpinned when the agent should adapt to task context."
  ]
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Codex Chef token surface audit");
  console.log(report.note);
  console.log("");
  console.log(`Total: ${report.totals.files} files, ~${report.totals.estimatedTokens.toLocaleString("en-US")} tokens`);
  console.log("");
  console.log("By category:");
  for (const category of report.categories) {
    const finding = report.budgetFindings.find((item) => item.category === category.category);
    const budgetText = finding?.budget ? ` / budget ~${finding.budget.toLocaleString("en-US")}` : "";
    const statusText = finding ? ` [${finding.status}]` : "";
    console.log(`- ${category.category}: ${category.files} files, ~${category.estimatedTokens.toLocaleString("en-US")} tokens${budgetText}${statusText}`);
  }
  console.log("");
  console.log("Budget findings:");
  for (const finding of report.budgetFindings.filter((item) => item.status !== "ok")) {
    console.log(`- ${finding.category}: ${finding.status}, ~${finding.estimatedTokens.toLocaleString("en-US")} tokens${finding.budget ? ` vs ~${finding.budget.toLocaleString("en-US")}` : ""}. ${finding.recommendation}`);
  }
  console.log("");
  console.log("Largest files:");
  for (const file of report.topFiles) {
    console.log(`- ${file.path}: ~${file.estimatedTokens.toLocaleString("en-US")} tokens (${file.category})`);
  }
  console.log("");
  console.log("Guidance:");
  for (const item of report.guidance) console.log(`- ${item}`);
}
