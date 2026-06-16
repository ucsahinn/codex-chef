#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const failures = [];
const fixtureCodexHome = path.resolve("tmp/nonexistent-codex-status-codex-home");
const fixtureAgentsHome = path.resolve("tmp/nonexistent-codex-status-agents-home");

function fail(message) {
  failures.push(message);
}

function run(args) {
  return spawnSync(process.execPath, [
    "scripts/codex-status.mjs",
    "--codex-home",
    fixtureCodexHome,
    "--agents-home",
    fixtureAgentsHome,
    ...args
  ], {
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
  if (report.routingBoard?.profileCount < 10) {
    fail("codex status must include the enterprise routing board profile count.");
  }
  if (!report.routingBoard?.requiredSurfaces?.agents?.includes("context_architect")) {
    fail("codex status routing board must include context_architect in required agent surfaces.");
  }
  if (!report.routingBoard?.requiredSurfaces?.mcp?.includes("openaiDeveloperDocs")) {
    fail("codex status routing board must include OpenAI Docs MCP in required MCP surfaces.");
  }
  if (!report.routingBoard?.boundary?.includes("not hidden execution hooks")) {
    fail("codex status routing board must preserve the no-hidden-hooks boundary.");
  }
  if (!report.mcpSetupBoard || report.mcpSetupBoard.serverCount !== 15) {
    fail("codex status must include the MCP setup board with all 15 servers.");
  }
  if (!Array.isArray(report.mcpSetupBoard.servers) || !report.mcpSetupBoard.servers.some((server) => server.name === "supabase" && server.setupKind === "env" && String(server.setupHint || "").includes("SUPABASE_DB_URL"))) {
    fail("codex status MCP setup board must explain Supabase SUPABASE_DB_URL setup.");
  }
  if (report.effectiveControls?.features?.multiAgent !== true) {
    fail("codex status must report that multi-agent routing is enabled in effective controls.");
  }
  if (report.effectiveControls?.agents?.maxDepth !== 1) {
    fail("codex status effective controls must report the bounded subagent depth.");
  }
  if (report.effectiveControls?.appsDefault?.destructiveEnabled !== false) {
    fail("codex status effective controls must report destructive app tools disabled by default.");
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
  for (const required of ["Codex Chef status", "Repo starter:", "Installed runtime:", "Skills context:", "Enterprise routing:", "Effective controls:", "MCP setup:", "MCP setup note: serena", "MCP setup note: supabase"]) {
    if (!textResult.stdout.includes(required)) fail(`codex status text output missing: ${required}`);
  }
}

const routingResult = spawnSync(process.execPath, ["scripts/codex-routing-board.mjs", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
  timeout: 120000,
  windowsHide: true
});
if (routingResult.error) {
  fail(`codex routing JSON validation could not run: ${routingResult.error.message}`);
} else if (routingResult.status !== 0) {
  fail(`codex routing JSON validation exited ${routingResult.status}: ${(routingResult.stderr || routingResult.stdout).trim()}`);
} else {
  try {
    const routing = JSON.parse(routingResult.stdout);
    if (routing.schemaVersion !== "codex-chef.routing.v1") fail("codex routing schemaVersion drifted.");
    if (routing.profileCount < 10) fail("codex routing must include at least 10 profiles.");
    if (!routing.sourcePolicy?.includes("not hidden execution hooks")) {
      fail("codex routing must preserve the no-hidden-hooks source policy.");
    }
  } catch (error) {
    fail(`codex routing did not emit parseable JSON: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error("Codex status validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Codex status validation passed.");
