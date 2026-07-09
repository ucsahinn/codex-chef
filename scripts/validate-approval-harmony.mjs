#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { findProblemRules } from "./lib/approval-rules.mjs";

const root = path.resolve(process.cwd());
const failures = [];
const warnings = [];

const rulesPath = path.join(root, "templates", "codex", "rules", "default.rules");
const rulesText = fs.readFileSync(rulesPath, "utf8");

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function run(command, args) {
  const executable = process.platform === "win32" && command.endsWith(".cmd") ? "cmd.exe" : command;
  const commandArgs = process.platform === "win32" && command.endsWith(".cmd")
    ? ["/d", "/s", "/c", command, ...args]
    : args;
  return spawnSync(executable, commandArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 60000,
    windowsHide: true
  });
}

function codexCommand() {
  return process.platform === "win32" ? "codex.cmd" : "codex";
}

function envPath() {
  const key = Object.keys(process.env).find((name) => name.toLowerCase() === "path");
  return key ? process.env[key] || "" : "";
}

function candidateCommandNames(command) {
  if (process.platform !== "win32" || path.extname(command)) return [command];
  const pathExt = process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD";
  return pathExt
    .split(";")
    .filter(Boolean)
    .map((extension) => `${command}${extension.toLowerCase()}`);
}

function commandExistsOnPath(command) {
  if (/[\\/]/.test(command)) return fs.existsSync(command);
  const pathEntries = envPath().split(path.delimiter).filter(Boolean);
  const candidates = candidateCommandNames(command);
  return pathEntries.some((entry) => {
    for (const candidate of candidates) {
      if (fs.existsSync(path.join(entry, candidate))) return true;
    }
    return false;
  });
}

function inspectTemplateRules() {
  for (const issue of findProblemRules(rulesText)) {
    fail(`templates/codex/rules/default.rules:${issue.lineNumber} ${issue.reason}: ${issue.line}`);
  }
}

function assertContains(label, needle) {
  if (!rulesText.includes(needle)) fail(`default.rules missing ${label}: ${needle}`);
}

function assertExecDecision(label, commandTokens, expectedDecision) {
  const result = run(codexCommand(), ["execpolicy", "check", "--rules", rulesPath, ...commandTokens]);
  if (result.error) {
    warn(`Skipped execpolicy matrix because Codex CLI could not run: ${result.error.message}`);
    return false;
  }
  if (result.status !== 0) {
    fail(`${label} execpolicy check exited ${result.status}: ${[result.stdout, result.stderr].filter(Boolean).join("\n").trim()}`);
    return true;
  }

  let parsed;
  try {
    parsed = JSON.parse(result.stdout || "{}");
  } catch (error) {
    fail(`${label} execpolicy check did not emit JSON: ${error.message}`);
    return true;
  }

  const actual = parsed.decision || "no-match";
  if (actual !== expectedDecision) {
    fail(`${label} expected ${expectedDecision}, got ${actual}: ${commandTokens.join(" ")}`);
  }
  return true;
}

inspectTemplateRules();

for (const script of [
  "test",
  "lint",
  "typecheck",
  "build",
  "check",
  "validate",
  "dev",
  "start",
  "serve",
  "watch",
  "preview",
  "ui:smoke",
  "codex:status",
  "codex:status:all",
  "chef:status",
  "chef:diagnostics",
  "chef:processes",
  "plan:install",
  "token:audit"
]) {
  assertContains(`npm.cmd run ${script} allow`, `prefix_rule(pattern = ["npm.cmd", "run", "${script}"], decision = "allow")`);
  assertContains(`npm run ${script} allow`, `prefix_rule(pattern = ["npm", "run", "${script}"], decision = "allow")`);
}

for (const script of [
  "validate:docs",
  "validate:doc-locales",
  "validate:locales",
  "validate:workflow",
  "validate:content",
  "validate:install-plan",
  "validate:install-state",
  "validate:installer",
  "validate:installer-smoke",
  "validate:agents",
  "validate:agent-corpus",
  "validate:mcp",
  "validate:approval-harmony",
  "validate:doctor",
  "validate:status",
  "validate:routing",
  "validate:repair",
  "validate:diagram",
  "validate:plugin-skills",
  "validate:chef-cli",
  "validate:tokens",
  "validate:package-surface",
  "validate:release",
  "release:notes:check",
  "verify:skills",
  "verify:skills:online",
  "verify:install:runtime",
  "scan:supply-chain",
  "audit:security",
  "codex:doctor",
  "codex:routing",
  "chef:backups"
]) {
  assertContains(`npm.cmd run ${script} allow`, `prefix_rule(pattern = ["npm.cmd", "run", "${script}"], decision = "allow")`);
  assertContains(`npm run ${script} allow`, `prefix_rule(pattern = ["npm", "run", "${script}"], decision = "allow")`);
}

for (const script of [
  "clean",
  "reset",
  "delete",
  "remove",
  "prune",
  "wipe",
  "destroy",
  "drop",
  "truncate",
  "deploy",
  "publish",
  "release",
  "ship",
  "migrate",
  "seed",
  "db:drop",
  "db:migrate"
]) {
  assertContains(`npm.cmd run ${script} prompt`, `prefix_rule(pattern = ["npm.cmd", "run", "${script}"], decision = "prompt"`);
  assertContains(`npm run ${script} prompt`, `prefix_rule(pattern = ["npm", "run", "${script}"], decision = "prompt"`);
}

const matrix = [
  ["read-only PowerShell wrapper", ["powershell.exe", "-Command", "Get-Content", "-LiteralPath", "package.json"], "allow"],
  ["git rev-parse", ["git", "rev-parse", "HEAD"], "allow"],
  ["git cat-file", ["git", "cat-file", "-t", "HEAD"], "allow"],
  ["npm pack dry-run", ["npm.cmd", "pack", "--dry-run", "--json", "--ignore-scripts"], "allow"],
  ["npm build", ["npm.cmd", "run", "build"], "allow"],
  ["npm check", ["npm.cmd", "run", "check"], "allow"],
  ["npm package-surface", ["npm.cmd", "run", "validate:package-surface"], "allow"],
  ["npm release notes check", ["npm.cmd", "run", "release:notes:check"], "allow"],
  ["npm online skill verify", ["npm.cmd", "run", "verify:skills:online"], "allow"],
  ["npm runtime verify", ["npm.cmd", "run", "verify:install:runtime"], "allow"],
  ["npm security audit script", ["npm.cmd", "run", "audit:security"], "allow"],
  ["npm repair preview", ["npm.cmd", "run", "repair:install", "--", "--preview", "--json", "--redact-paths"], "allow"],
  ["npm clean", ["npm.cmd", "run", "clean"], "prompt"],
  ["npm deploy", ["npm.cmd", "run", "deploy"], "prompt"],
  ["npm repair apply", ["npm.cmd", "run", "repair:install", "--", "--apply"], "prompt"],
  ["npm repair prune", ["npm.cmd", "run", "repair:install", "--", "--prune-managed-plugin-extras"], "prompt"],
  ["npm arbitrary script", ["npm.cmd", "run", "postinstall"], "no-match"],
  ["codex mcp list", ["codex.cmd", "mcp", "list"], "allow"],
  ["codex doctor json", ["codex.cmd", "doctor", "--json"], "allow"],
  ["codex execpolicy check", ["codex.cmd", "execpolicy", "check", "--rules", "templates/codex/rules/default.rules", "git", "status"], "allow"],
  ["exact Context7 MCP startup", ["npx.cmd", "-y", "@upstash/context7-mcp@3.2.1"], "allow"],
  ["ad-hoc npx package", ["npx.cmd", "-y", "left-pad@1.3.0"], "no-match"],
  ["read-only GitHub PR view", ["gh", "pr", "view", "1"], "allow"],
  ["read-only GitHub run watch", ["gh", "run", "watch", "1"], "allow"],
  ["GitHub release create", ["gh", "release", "create", "v0.0.0"], "prompt"],
  ["GitHub auth status", ["gh", "auth", "status"], "prompt"],
  ["GitHub auth show token", ["gh", "auth", "status", "--show-token"], "prompt"],
  ["GitHub auth show token json", ["gh", "auth", "status", "--json", "hosts", "--show-token"], "prompt"],
  ["GitHub auth token", ["gh", "auth", "token"], "prompt"],
  ["GitHub auth refresh", ["gh", "auth", "refresh"], "prompt"],
  ["GitHub auth setup git", ["gh", "auth", "setup-git"], "prompt"],
  ["GitHub auth switch", ["gh", "auth", "switch"], "prompt"],
  ["read-only git config", ["git", "config", "--get", "user.name"], "allow"],
  ["read-only git config core excludes", ["git", "config", "--get", "core.excludesfile"], "allow"],
  ["read-only git safe directory", ["git", "config", "--get-all", "safe.directory"], "allow"],
  ["git config list", ["git", "config", "--list"], "no-match"],
  ["git config show origin list", ["git", "config", "--show-origin", "--list"], "no-match"],
  ["git config credential dump", ["git", "config", "--get-all", "http.https://github.com/.extraheader"], "no-match"],
  ["mutating git config", ["git", "config", "--unset", "user.name"], "prompt"],
  ["direct deletion", ["Remove-Item", "foo", "-Recurse", "-Force"], "prompt"],
  ["PowerShell deletion wrapper", ["powershell.exe", "-Command", "Remove-Item", "foo", "-Recurse", "-Force"], "prompt"]
];

let matrixRan = false;
if (!commandExistsOnPath(codexCommand())) {
  warn(`Skipped execpolicy matrix because Codex CLI could not run: ${codexCommand()} was not found on PATH.`);
} else {
  matrixRan = matrix.some(([label, commandTokens, expected]) => assertExecDecision(label, commandTokens, expected));
}

if (!matrixRan && process.env.CODEX_CHEF_REQUIRE_CODEX === "1") {
  fail("Codex CLI is required by CODEX_CHEF_REQUIRE_CODEX=1 but execpolicy matrix could not run.");
}

if (failures.length > 0) {
  console.error("Approval harmony validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  for (const warning of warnings) console.error(`Warning: ${warning}`);
  process.exit(1);
}

for (const warning of warnings) console.error(`Warning: ${warning}`);
console.log("Approval harmony validation passed.");
