#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const workflowsDir = path.join(root, ".github", "workflows");
const failures = [];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function workflowFiles() {
  if (!fs.existsSync(workflowsDir)) return [];
  return fs.readdirSync(workflowsDir)
    .filter((file) => /\.(?:ya?ml)$/i.test(file))
    .map((file) => path.join(workflowsDir, file));
}

function hasPersistCredentialsFalse(lines, checkoutLineIndex) {
  const stepIndent = lines[checkoutLineIndex].match(/^(\s*)-/)?.[1]?.length ?? 0;
  for (let i = checkoutLineIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const nextStep = line.match(/^(\s*)-/);
    if (nextStep && nextStep[1].length <= stepIndent) return false;
    if (/persist-credentials:\s*false\b/.test(line)) return true;
  }
  return false;
}

for (const file of workflowFiles()) {
  const rel = toPosix(path.relative(root, file));
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  if (/\t/.test(text)) failures.push(`${rel} must not use tab indentation.`);
  if (/pull_request_target\s*:/.test(text)) failures.push(`${rel} must not use pull_request_target.`);
  if (/workflow_run\s*:/.test(text) && /github\.event\.workflow_run\.(?:head_branch|head_repository\.full_name)/.test(text)) {
    failures.push(`${rel} must not checkout workflow_run head refs or repositories.`);
  }
  if (/github\.event\.pull_request\.head\.(?:ref|sha|repo\.full_name)/.test(text)) {
    failures.push(`${rel} must not checkout pull request head refs in privileged workflows.`);
  }
  if (/permissions:\s*write-all/.test(text)) failures.push(`${rel} must not use permissions: write-all.`);
  if (/contents:\s*write/.test(text)) failures.push(`${rel} must not grant contents: write.`);
  if (/id-token:\s*write/.test(text)) failures.push(`${rel} must not grant id-token: write in validation workflows.`);
  if (/id-token:\s*write/.test(text) && /uses:\s*actions\/cache@/.test(text)) {
    failures.push(`${rel} must not combine OIDC write credentials with cache restore/save behavior.`);
  }
  if (/\bnpm\s+install\b/i.test(text)) failures.push(`${rel} must not run implicit npm install.`);
  if (/\bnpm\s+ci\b(?![^\r\n]*--ignore-scripts)/i.test(text)) {
    failures.push(`${rel} must use npm ci --ignore-scripts when dependency installation is required.`);
  }

  const dangerousPatterns = [
    { label: "remote shell pipe", pattern: /\b(?:curl|wget)\b[^\r\n|;]*(?:\||>\s*\&?\d?)[^\r\n]*(?:bash|sh|pwsh|powershell)\b/i },
    { label: "PowerShell download-execute", pattern: /\b(?:iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b[^\r\n|;]*(?:\||;)[^\r\n]*(?:iex|Invoke-Expression)\b/i },
    { label: "GitHub auth mutation", pattern: /\bgh\s+auth\b/i },
    { label: "Git push", pattern: /\bgit\s+push\b/i },
    { label: "Release creation", pattern: /\bgh\s+release\s+create\b/i }
  ];

  lines.forEach((line, index) => {
    const actionReference = line.match(/\buses:\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@([^\s#]+)/);
    if (actionReference && !/^[a-f0-9]{40}$/i.test(actionReference[2])) {
      failures.push(`${rel}:${index + 1} GitHub action ${actionReference[1]} must be pinned to a full commit SHA, not ${actionReference[2]}.`);
    }
    const writePermission = line.match(/^\s*([A-Za-z-]+):\s*write\b/);
    if (writePermission) {
      failures.push(`${rel}:${index + 1} validation workflows must not request write permission: ${writePermission[1]}.`);
    }
  });

  for (const { label, pattern } of dangerousPatterns) {
    if (pattern.test(text)) failures.push(`${rel} contains ${label}; release/publish actions must stay manual.`);
  }

  lines.forEach((line, index) => {
    if (/uses:\s*actions\/checkout@/.test(line) && !hasPersistCredentialsFalse(lines, index)) {
      failures.push(`${rel}:${index + 1} actions/checkout must set persist-credentials: false.`);
    }
  });
}

const validateWorkflow = path.join(workflowsDir, "validate.yml");
if (!fs.existsSync(validateWorkflow)) {
  failures.push("Missing .github/workflows/validate.yml");
} else {
  const text = fs.readFileSync(validateWorkflow, "utf8");
  for (const required of [
    "permissions:",
    "contents: read",
    "persist-credentials: false",
    "node --check scripts/validate-workflow-security.mjs",
    "node --check scripts/validate-doc-locales.mjs",
    "node --check scripts/sync-doc-locales.mjs",
    "node --check scripts/validate-readme-locales.mjs",
    "node --check scripts/validate-content-safety.mjs",
    "node --check scripts/validate-agent-config.mjs",
    "bash scripts/install.sh --all --dry-run",
    "./scripts/install.ps1 -All -WhatIf",
    "npm run check"
  ]) {
    if (!text.includes(required)) failures.push(`validate workflow missing security gate signal: ${required}`);
  }
}

if (failures.length > 0) {
  console.error("Workflow security validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Workflow security validation passed. Checked ${workflowFiles().length} workflow file(s).`);
