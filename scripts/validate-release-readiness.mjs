#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const failures = [];
const warnings = [];

const requiredFiles = [
  "README.md",
  "README.de.md",
  "README.es.md",
  "README.fr.md",
  "README.pt-BR.md",
  "README.tr.md",
  "docs/release-notes.md",
  "docs/release-notes.tr.md",
  "docs/github-settings.md",
  "docs/github-settings.tr.md",
  "docs/publish.md",
  "docs/publish.tr.md",
  "docs/advisory-sources.md",
  "docs/advisory-sources.tr.md",
  "scripts/validate-readme-locales.mjs",
  "scripts/validate-workflow-security.mjs",
  "scripts/validate-agent-config.mjs",
  "scripts/validate-package-surface.mjs",
  ".github/CODEOWNERS",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/question.yml",
  ".gitleaks.toml",
  ".github/workflows/validate.yml"
];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true
  });
}

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Missing release-readiness file: ${file}`);
}

const packageJson = JSON.parse(read("package.json"));
const version = packageJson.version;
const expectedTag = `v${version}`;
if (!/^\d+\.\d+\.\d+$/.test(version)) fail("package.json version must be plain semver for release");
if (packageJson.private !== true) fail("package.json must keep private=true before public source release");

const changelog = read("CHANGELOG.md");
const releaseNotes = read("docs/release-notes.md");
const releaseNotesTr = read("docs/release-notes.tr.md");
const githubSettings = read("docs/github-settings.md");
const githubSettingsTr = read("docs/github-settings.tr.md");
const publish = read("docs/publish.md");
const publishTr = read("docs/publish.tr.md");
const workflow = read(".github/workflows/validate.yml");

if (!changelog.includes(`## ${version} - `)) fail(`CHANGELOG.md missing dated ${version} section`);
if (!releaseNotes.includes(`## ${expectedTag} - `)) fail(`docs/release-notes.md missing ${expectedTag} section`);
if (!releaseNotesTr.includes(`## ${expectedTag} - `)) fail(`docs/release-notes.tr.md missing ${expectedTag} section`);

for (const [label, text] of [
  ["docs/github-settings.md", githubSettings],
  ["docs/github-settings.tr.md", githubSettingsTr],
  ["docs/publish.md", publish],
  ["docs/publish.tr.md", publishTr]
]) {
  if (!text.includes(expectedTag)) fail(`${label} must mention ${expectedTag}`);
  if (!text.includes("npm run check")) fail(`${label} must include npm run check release gate`);
  if (!text.includes("gitleaks detect --redact --no-banner --no-git --verbose")) {
    fail(`${label} must include current-tree Gitleaks release gate`);
  }
}

for (const required of [
  "permissions:",
  "contents: read",
  "persist-credentials: false",
  "node --check scripts/validate-readme-locales.mjs",
  "node --check scripts/validate-workflow-security.mjs",
  "node --check scripts/validate-agent-config.mjs",
  "node --check scripts/validate-package-surface.mjs",
  "npm run check",
  "bash scripts/install.sh --all --force --dry-run",
  "./scripts/install.ps1 -All -Force -WhatIf"
]) {
  if (!workflow.includes(required)) fail(`validate workflow missing release gate signal: ${required}`);
}

if (!publish.includes("npm run verify:skills:online")) fail("docs/publish.md must include online skill verification before release");
if (!publishTr.includes("npm run verify:skills:online")) fail("docs/publish.tr.md must include online skill verification before release");
if (!publish.includes("node scripts/plan-install.mjs --all --json --redact-paths")) fail("docs/publish.md must include redacted install-state preview command");
if (!publishTr.includes("node scripts/plan-install.mjs --all --json --redact-paths")) fail("docs/publish.tr.md must include redacted install-state preview command");

const status = run("git", ["status", "--short"]);
if (status.status !== 0) {
  warn(`Could not inspect git status: ${status.stderr || status.stdout || "git status failed"}`);
} else {
  for (const line of status.stdout.split(/\r?\n/).filter(Boolean)) {
    const file = line.slice(3).replace(/\\/g, "/");
    if (/^(tmp|temp|node_modules|dist|build|coverage|\.next|out)\//.test(file)) {
      fail(`Release candidate includes scratch/build/dependency path in git status: ${file}`);
    }
    if (/^(?:\.serena|\.codex\/sessions|\.codex\/memories)\//.test(file)) {
      fail(`Release candidate includes local agent state in git status: ${file}`);
    }
  }
}

const tracked = run("git", ["ls-files"]);
if (tracked.status !== 0) {
  warn(`Could not inspect tracked files: ${tracked.stderr || tracked.stdout || "git ls-files failed"}`);
} else {
  for (const file of tracked.stdout.split(/\r?\n/).filter(Boolean)) {
    if (/^(tmp|temp|node_modules|dist|build|coverage|\.next|out)\//.test(file)) {
      fail(`Tracked release file must not live under ignored output path: ${file}`);
    }
    if (/\.(?:zip|tar\.gz|tgz|msi|exe|dmg)$/i.test(file)) {
      fail(`Release artifact must not be committed to source: ${file}`);
    }
  }
}

const currentTag = run("git", ["tag", "--list", expectedTag]);
if (currentTag.status !== 0) {
  warn(`Could not inspect existing tag ${expectedTag}: ${currentTag.stderr || currentTag.stdout || "git tag failed"}`);
} else if (currentTag.stdout.trim() === expectedTag) {
  warn(`Tag ${expectedTag} already exists locally; verify it points at the intended release commit before publishing`);
}

if (failures.length > 0) {
  console.error("Release readiness validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

for (const message of warnings) console.warn(`Warning: ${message}`);
console.log(`Release readiness validation passed for ${expectedTag}.`);
