#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const failures = [];

function fail(message) {
  failures.push(message);
}

function run(args) {
  return spawnSync(process.execPath, ["scripts/codex-status.mjs", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120000,
    windowsHide: true
  });
}

const jsonResult = run(["--json", "--redact-paths", "--skip-runtime", "--skip-codex-doctor-checks"]);
if (jsonResult.error) {
  fail(`codex status JSON validation could not run: ${jsonResult.error.message}`);
} else if (jsonResult.status !== 0) {
  fail(`codex status JSON validation exited ${jsonResult.status}: ${(jsonResult.stderr || jsonResult.stdout).trim()}`);
}

let report;
if (failures.length === 0) {
  try {
    report = JSON.parse(jsonResult.stdout);
  } catch (error) {
    fail(`codex status did not emit parseable JSON: ${error.message}`);
  }
}

if (report) {
  if (report.schemaVersion !== "codex-chef.status.v1") {
    fail("codex status schemaVersion drifted.");
  }
  if (!["ok", "attention", "fail"].includes(report.status)) {
    fail(`codex status has unexpected status: ${report.status}`);
  }
  if (report.repoDoctor?.status !== "ok") {
    fail(`codex status repoDoctor must be ok in repo-only validation, got ${report.repoDoctor?.status}.`);
  }
  if (report.runtime?.status !== "skipped") {
    fail("codex status validation should skip installed runtime checks.");
  }
  if (report.codexDoctor?.status !== "skipped") {
    fail("codex status validation should skip direct Codex doctor checks.");
  }
  if (report.skillsContext?.documentedBudget?.includes("2%") !== true) {
    fail("codex status must explain the documented skills context budget.");
  }
  if (!Array.isArray(report.nextActions) || report.nextActions.length === 0) {
    fail("codex status must include nextActions.");
  }
}

const textResult = run(["--redact-paths", "--skip-runtime", "--skip-codex-doctor-checks"]);
if (textResult.error) {
  fail(`codex status text validation could not run: ${textResult.error.message}`);
} else if (textResult.status !== 0) {
  fail(`codex status text validation exited ${textResult.status}: ${(textResult.stderr || textResult.stdout).trim()}`);
} else {
  for (const required of ["Codex Chef status", "Repo starter:", "Installed runtime:", "Skills context:"]) {
    if (!textResult.stdout.includes(required)) fail(`codex status text output missing: ${required}`);
  }
}

if (failures.length > 0) {
  console.error("Codex status validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Codex status validation passed.");
