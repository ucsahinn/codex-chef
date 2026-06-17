#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const failures = [];
const fixtureCodexHome = path.resolve("tmp/nonexistent-codex-status-codex-home");
const fixtureAgentsHome = path.resolve("tmp/nonexistent-codex-status-agents-home");

function fail(message) {
  failures.push(message);
}

function run(args, extra = {}) {
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
    windowsHide: true,
    env: extra.env || process.env
  });
}

function writeFakeCodexCommand() {
  const fixtureDir = path.resolve("tmp/validate-codex-status");
  fs.mkdirSync(fixtureDir, { recursive: true });
  if (process.platform === "win32") {
    const commandPath = path.join(fixtureDir, "fake-codex.cmd");
    fs.writeFileSync(commandPath, [
      "@echo off",
      "if \"%1\"==\"--strict-config\" echo codex-cli 0.140.0 C:\\\\Users\\\\codex-status-private\\\\AppData && exit /b 0",
      "if \"%1\"==\"login\" echo logged in from C:\\\\Users\\\\codex-status-private\\\\auth && exit /b 0",
      "if \"%1\"==\"mcp\" echo [{\"name\":\"fakeMcp\"}] && exit /b 0",
      "echo unexpected fake codex args %*",
      "exit /b 1",
      ""
    ].join("\r\n"), "utf8");
    return commandPath;
  }

  const commandPath = path.join(fixtureDir, "fake-codex.sh");
  fs.writeFileSync(commandPath, [
    "#!/bin/sh",
    "if [ \"$1\" = \"--strict-config\" ]; then printf 'codex-cli 0.140.0 C:\\\\Users\\\\codex-status-private\\\\AppData\\n'; exit 0; fi",
    "if [ \"$1\" = \"login\" ]; then printf 'logged in from C:\\\\Users\\\\codex-status-private\\\\auth\\n'; exit 0; fi",
    "if [ \"$1\" = \"mcp\" ]; then printf '[{\"name\":\"fakeMcp\"}]\\n'; exit 0; fi",
    "printf 'unexpected fake codex args %s\\n' \"$*\"",
    "exit 1",
    ""
  ].join("\n"), "utf8");
  fs.chmodSync(commandPath, 0o755);
  return commandPath;
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
  if (report.effectiveControls?.appsDefault?.enabled !== false) {
    fail("codex status effective controls must report app connectors disabled by default.");
  }
  if (report.effectiveControls?.appsDefault?.destructiveEnabled !== false) {
    fail("codex status effective controls must report destructive app tools disabled by default.");
  }
  if (!Array.isArray(report.nextActions) || report.nextActions.length === 0) {
    fail("codex status must include nextActions.");
  }
  if (report.cliQuickStart?.interactiveMenu !== "npm run chef") {
    fail("codex status must include the interactive Chef CLI entrypoint.");
  }
  if (!report.codexCliRuntime?.target?.codexHome) {
    fail("codex status must include the explicit target CODEX_HOME under test.");
  }
  if (!report.codexCliRuntime?.ambient?.inspected) {
    fail("codex status must include ambient Codex CLI status so shell drift is visible.");
  }
  if (!["same", "different", "unknown"].includes(report.codexCliRuntime?.ambient?.relationshipToTarget)) {
    fail("codex status ambient relationship must be same, different, or unknown.");
  }
  for (const command of [
    "npm run chef -- --status",
    "npm run chef -- --doctor",
    "npm run chef -- --mcp",
    "npm run chef -- --logs"
  ]) {
    if (!report.cliQuickStart?.readOnlyCommands?.includes(command)) {
      fail(`codex status quick start missing read-only command: ${command}`);
    }
  }
  if (report.cliQuickStart?.numberedActions !== true) {
    fail("codex status must document numbered interactive actions.");
  }
  if (!report.gitRepository?.inspected) {
    fail("codex status must inspect Git repository health.");
  }
  if (!["ok", "attention", "fail"].includes(report.gitRepository?.status)) {
    fail(`codex status Git repository health has unexpected status: ${report.gitRepository?.status}`);
  }
  if ((report.gitRepository?.dirtyLineCount || 0) > 0 && report.gitRepository.status === "ok") {
    fail("codex status must report dirty Git worktrees as attention, not ok.");
  }
  if ((report.gitRepository?.dirtyLineCount || 0) > 0 && report.status === "ok") {
    fail("codex status overall status must not be ok while the Git worktree is dirty.");
  }
  if (!report.logSummary?.inspected) {
    fail("codex status must include a log summary.");
  }
  if (!Array.isArray(report.logSummary?.repoCliLogs?.recent)) {
    fail("codex status log summary must include recent repo CLI logs.");
  }
  if (report.logSummary?.repoCliLogs?.contentInspected !== false) {
    fail("codex status must not inspect repo CLI log contents.");
  }
  if (!Array.isArray(report.logSummary?.codexLogs?.recent)) {
    fail("codex status log summary must include recent Codex log metadata.");
  }
  if (report.logSummary?.codexLogs?.contentInspected !== false) {
    fail("codex status must not inspect Codex log contents.");
  }
}

const fakeCodexCommand = writeFakeCodexCommand();
const fakeCodexResult = run([
  "--json",
  "--redact-paths",
  "--skip-runtime",
  "--skip-codex-doctor-checks"
], {
  env: {
    ...process.env,
    CODEX_STATUS_CODEX_COMMAND: fakeCodexCommand
  }
});
if (fakeCodexResult.error) {
  fail(`codex status fake Codex validation could not run: ${fakeCodexResult.error.message}`);
} else if (fakeCodexResult.status !== 0 && fakeCodexResult.status !== 1) {
  fail(`codex status fake Codex validation exited ${fakeCodexResult.status}: ${(fakeCodexResult.stderr || fakeCodexResult.stdout).trim()}`);
} else {
  const serialized = fakeCodexResult.stdout;
  try {
    const fakeReport = JSON.parse(fakeCodexResult.stdout);
    if (!fakeReport.codexCliRuntime?.mcp?.configuredServers?.includes("fakeMcp")) {
      fail("codex status fake Codex validation must use CODEX_STATUS_CODEX_COMMAND.");
    }
  } catch (error) {
    fail(`codex status fake Codex validation did not emit parseable JSON: ${error.message}`);
  }
  if (serialized.includes("codex-status-private") || serialized.includes("C:\\\\Users\\\\codex-status-private")) {
    fail("codex status --redact-paths must redact escaped Windows user profile paths in command previews.");
  }
}

const missingCodexCommand = path.join(path.resolve("tmp/validate-codex-status"), process.platform === "win32" ? "missing-codex.cmd" : "missing-codex");
const missingCodexResult = run([
  "--json",
  "--redact-paths",
  "--skip-runtime",
  "--skip-codex-doctor-checks"
], {
  env: {
    ...process.env,
    CODEX_STATUS_CODEX_COMMAND: missingCodexCommand
  }
});
if (missingCodexResult.error) {
  fail(`codex status missing Codex validation could not run: ${missingCodexResult.error.message}`);
} else if (missingCodexResult.status !== 0) {
  fail(`codex status missing Codex validation exited ${missingCodexResult.status}: ${(missingCodexResult.stderr || missingCodexResult.stdout).trim()}`);
} else {
  try {
    const missingReport = JSON.parse(missingCodexResult.stdout);
    if (missingReport.codexCliRuntime?.status !== "attention") {
      fail("codex status missing Codex validation must report Codex CLI attention.");
    }
    if (missingReport.codexCliRuntime?.ambient?.inspected !== true) {
      fail("codex status missing Codex validation must keep ambient status visible.");
    }
    if (!["same", "unknown"].includes(missingReport.codexCliRuntime?.ambient?.relationshipToTarget)) {
      fail("codex status missing Codex validation must not report a target/ambient drift when the configured Codex command is unavailable.");
    }
    if (missingReport.codexCliRuntime?.ambient?.login?.status !== "attention") {
      fail("codex status missing Codex validation must surface ambient login attention.");
    }
  } catch (error) {
    fail(`codex status missing Codex validation did not emit parseable JSON: ${error.message}`);
  }
}

const textResult = run(["--redact-paths", "--skip-runtime", "--skip-codex-doctor-checks"]);
if (textResult.error) {
  fail(`codex status text validation could not run: ${textResult.error.message}`);
} else if (textResult.status !== 0) {
  fail(`codex status text validation exited ${textResult.status}: ${(textResult.stderr || textResult.stdout).trim()}`);
} else {
  for (const required of ["Codex Chef status", "Use:", "Numbered menu:", "Target Codex home:", "Ambient Codex:", "Repo Git:", "Logs:", "Repo starter:", "Installed runtime:", "Skills context:", "Enterprise routing:", "Effective controls:", "MCP setup:", "MCP setup note: serena", "MCP setup note: supabase"]) {
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
