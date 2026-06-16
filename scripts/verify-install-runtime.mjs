#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(process.cwd());
const args = process.argv.slice(2);

const options = {
  json: false,
  redactPaths: false,
  expectSkills: false,
  expectGitGuards: false,
  skipCodexCli: false,
  codexHome: process.env.CODEX_HOME || path.join(os.homedir(), ".codex"),
  agentsHome: process.env.AGENTS_HOME || path.join(os.homedir(), ".agents")
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--json") options.json = true;
  else if (arg === "--redact-paths") options.redactPaths = true;
  else if (arg === "--expect-skills") options.expectSkills = true;
  else if (arg === "--expect-git-guards") options.expectGitGuards = true;
  else if (arg === "--skip-codex-cli") options.skipCodexCli = true;
  else if (arg === "--codex-home") {
    options.codexHome = path.resolve(args[index + 1]);
    index += 1;
  } else if (arg === "--agents-home") {
    options.agentsHome = path.resolve(args[index + 1]);
    index += 1;
  } else if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

function printHelp() {
  console.log(`Usage: node scripts/verify-install-runtime.mjs [options]

Read-only runtime verification for an installed Codex Chef setup.

Options:
  --codex-home <path>     Installed Codex home to inspect
  --agents-home <path>    Installed Agents home to inspect
  --expect-skills         Fail if installable curated skills are missing
  --expect-git-guards     Fail if optional global Git guard files/settings are missing
  --skip-codex-cli        Do not call codex doctor or codex mcp list
  --redact-paths          Redact home/repo paths in output
  --json                  Emit machine-readable JSON
`);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function redact(value) {
  if (!options.redactPaths || typeof value !== "string") return value;
  const home = os.homedir();
  return value
    .replaceAll(home, "${HOME}")
    .replaceAll(home.replaceAll("\\", "/"), "${HOME}")
    .replaceAll(root, "${REPO}")
    .replaceAll(root.replaceAll("\\", "/"), "${REPO}")
    .replace(/[A-Za-z]:\\Users\\[^\\/]+/g, "${OTHER_USERPROFILE}")
    .replace(/[A-Za-z]:\/Users\/[^\\/]+/g, "${OTHER_USERPROFILE}");
}

function parseBlocks(text, pattern) {
  const values = new Set();
  for (const match of text.matchAll(pattern)) values.add(match[1]);
  return values;
}

function normalizePath(filePath) {
  return path.resolve(filePath || "");
}

function run(command, commandArgs, extra = {}) {
  const executable = process.platform === "win32" && command.endsWith(".cmd") ? "cmd.exe" : command;
  const args = process.platform === "win32" && command.endsWith(".cmd")
    ? ["/d", "/s", "/c", command, ...commandArgs]
    : commandArgs;
  return spawnSync(executable, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: extra.timeout || 60000,
    windowsHide: true,
    env: extra.env || process.env
  });
}

function codexCommand() {
  return process.platform === "win32" ? "codex.cmd" : "codex";
}

function pushMissing(failures, label, expected, actual) {
  const missing = expected.filter((value) => !actual.has(value));
  if (missing.length > 0) failures.push(`${label} missing: ${missing.join(", ")}`);
  return missing;
}

function inspectInstalledFiles(failures) {
  const agentsCatalog = readJson("catalog/agents.json");
  const mcpCatalog = readJson("catalog/mcp-servers.json");
  const expectedAgents = agentsCatalog.agents.map((agent) => agent.name).sort();
  const expectedMcp = mcpCatalog.servers.map((server) => server.name).sort();

  const configPath = path.join(options.codexHome, "config.toml");
  const agentsDir = path.join(options.codexHome, "agents");
  const rulesPath = path.join(options.codexHome, "rules", "default.rules");
  const globalAgentsPath = path.join(options.codexHome, "AGENTS.md");
  const marketplacePath = path.join(options.agentsHome, "plugins", "marketplace.json");
  const pluginPath = path.join(options.codexHome, "plugins", "codex-chef-workflows");

  const requiredFiles = [
    globalAgentsPath,
    configPath,
    rulesPath,
    marketplacePath
  ];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) failures.push(`Required installed file is missing: ${redact(file)}`);
  }
  if (!fs.existsSync(pluginPath)) failures.push(`Installed plugin directory is missing: ${redact(pluginPath)}`);

  let installedMcp = new Set();
  if (fs.existsSync(configPath)) {
    const configText = readText(configPath);
    installedMcp = parseBlocks(configText, /^\[mcp_servers\.([A-Za-z0-9_-]+)\]\s*$/gm);
    pushMissing(failures, "Installed config MCP servers", expectedMcp, installedMcp);
  }

  let installedAgents = new Set();
  if (fs.existsSync(agentsDir)) {
    installedAgents = new Set(
      fs.readdirSync(agentsDir)
        .filter((file) => file.endsWith(".toml"))
        .map((file) => path.basename(file, ".toml"))
    );
    pushMissing(failures, "Installed specialist agents", expectedAgents, installedAgents);
  } else {
    failures.push(`Installed agents directory is missing: ${redact(agentsDir)}`);
  }

  return {
    codexHome: redact(options.codexHome),
    agentsHome: redact(options.agentsHome),
    requiredFiles: requiredFiles.map((file) => ({ path: redact(file), exists: fs.existsSync(file) })),
    plugin: { path: redact(pluginPath), exists: fs.existsSync(pluginPath) },
    agents: {
      expected: expectedAgents.length,
      installed: installedAgents.size,
      missing: expectedAgents.filter((agent) => !installedAgents.has(agent))
    },
    mcp: {
      expected: expectedMcp.length,
      installed: installedMcp.size,
      missing: expectedMcp.filter((server) => !installedMcp.has(server))
    }
  };
}

function inspectCodexRuntime(failures, warnings) {
  if (options.skipCodexCli) {
    return { inspected: false, note: "Skipped by --skip-codex-cli." };
  }

  const doctor = run(codexCommand(), ["doctor", "--json"]);
  if (doctor.error) {
    warnings.push(`Could not run codex doctor --json: ${doctor.error.message}`);
    return { inspected: false, error: doctor.error.message };
  }

  let activeCodexHome = null;
  let activeConfig = null;
  let doctorStatus = doctor.status;
  try {
    const parsed = JSON.parse(doctor.stdout || "{}");
    const rootSection = parsed.root || parsed.config || parsed;
    const configDetails = parsed.checks?.["config.load"]?.details || {};
    activeCodexHome = rootSection.codex_home
      || rootSection.codexHome
      || parsed.codex_home
      || parsed.codexHome
      || configDetails.CODEX_HOME
      || null;
    activeConfig = rootSection.config_file
      || rootSection.configFile
      || parsed.config_file
      || parsed.configFile
      || configDetails["config.toml"]
      || null;
  } catch {
    warnings.push("codex doctor --json did not emit parseable JSON.");
  }

  const runtime = {
    inspected: true,
    doctorExitCode: doctorStatus,
    activeCodexHome: redact(activeCodexHome),
    activeConfig: redact(activeConfig),
    activeHomeMatchesInstall: activeCodexHome
      ? normalizePath(activeCodexHome).toLowerCase() === normalizePath(options.codexHome).toLowerCase()
      : null
  };

  if (runtime.activeHomeMatchesInstall === false) {
    failures.push(
      `Active Codex runtime home differs from installed Codex home: active=${redact(activeCodexHome)} installed=${redact(options.codexHome)}`
    );
  }

  const mcpList = run(codexCommand(), ["mcp", "list", "--json"], {
    env: { ...process.env, CODEX_HOME: options.codexHome }
  });
  if (mcpList.error) {
    warnings.push(`Could not run codex mcp list --json with installed CODEX_HOME: ${mcpList.error.message}`);
    runtime.mcpList = { inspected: false, error: mcpList.error.message };
    return runtime;
  }

  try {
    const parsed = JSON.parse(mcpList.stdout || "[]");
    const servers = Array.isArray(parsed) ? parsed.map((server) => server.name).filter(Boolean).sort() : [];
    const expected = readJson("catalog/mcp-servers.json").servers.map((server) => server.name).sort();
    const actual = new Set(servers);
    const missing = expected.filter((server) => !actual.has(server));
    if (missing.length > 0) {
      failures.push(`codex mcp list with installed CODEX_HOME is missing: ${missing.join(", ")}`);
    }
    runtime.mcpList = {
      inspected: true,
      exitCode: mcpList.status,
      servers: servers.length,
      missing
    };
  } catch {
    warnings.push("codex mcp list --json with installed CODEX_HOME did not emit parseable JSON.");
    runtime.mcpList = { inspected: false, exitCode: mcpList.status };
  }

  return runtime;
}

function inspectSkills(failures, warnings) {
  const expected = readJson("catalog/skills.json")
    .skills
    .filter((skill) => skill.install === true)
    .map((skill) => skill.name)
    .sort();

  if (!options.expectSkills) {
    return {
      inspected: false,
      expected: expected.length,
      note: "Use --expect-skills after running -All or -InstallSkills."
    };
  }

  const skillRoots = [
    path.join(options.codexHome, "skills"),
    path.join(options.agentsHome, "skills")
  ];
  const actual = new Set();
  for (const skillRoot of skillRoots) {
    if (!fs.existsSync(skillRoot)) continue;
    for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) actual.add(entry.name);
    }
  }
  const missing = expected.filter((skill) => !actual.has(skill));
  if (missing.length > 0) failures.push(`Curated global skills missing: ${missing.join(", ")}`);
  return {
    inspected: true,
    expected: expected.length,
    installed: actual.size,
    missing,
    roots: skillRoots.map((skillRoot) => ({ path: redact(skillRoot), exists: fs.existsSync(skillRoot) }))
  };
}

function inspectGitGuards(failures) {
  if (!options.expectGitGuards) {
    return { inspected: false, note: "Use --expect-git-guards only after installing optional Git guards." };
  }

  const ignorePath = path.join(os.homedir(), ".gitignore_global");
  const hooksPath = path.join(os.homedir(), ".githooks");
  const hookPath = path.join(hooksPath, "pre-commit");
  for (const file of [ignorePath, hookPath]) {
    if (!fs.existsSync(file)) failures.push(`Optional Git guard file is missing: ${redact(file)}`);
  }

  const excludes = run("git", ["config", "--global", "--get", "core.excludesfile"]);
  const hooks = run("git", ["config", "--global", "--get", "core.hooksPath"]);
  const configuredExcludes = (excludes.stdout || "").trim();
  const configuredHooks = (hooks.stdout || "").trim();
  if (normalizePath(configuredExcludes).toLowerCase() !== normalizePath(ignorePath).toLowerCase()) {
    failures.push("Global Git core.excludesfile does not point at the Codex Chef guard file.");
  }
  if (normalizePath(configuredHooks).toLowerCase() !== normalizePath(hooksPath).toLowerCase()) {
    failures.push("Global Git core.hooksPath does not point at the Codex Chef hooks directory.");
  }

  return {
    inspected: true,
    excludesfile: redact(configuredExcludes),
    hooksPath: redact(configuredHooks)
  };
}

const failures = [];
const warnings = [];

const report = {
  schemaVersion: "codex-chef.install-runtime.v1",
  generatedAt: new Date().toISOString(),
  installed: inspectInstalledFiles(failures),
  runtime: inspectCodexRuntime(failures, warnings),
  skills: inspectSkills(failures, warnings),
  gitGuards: inspectGitGuards(failures),
  warnings,
  failures
};

report.status = failures.length === 0 ? "ok" : "fail";

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Codex Chef install runtime verification");
  console.log(`Status: ${report.status}`);
  console.log(`Codex home: ${report.installed.codexHome}`);
  console.log(`Agents home: ${report.installed.agentsHome}`);
  console.log(`Agents: ${report.installed.agents.installed}/${report.installed.agents.expected}`);
  console.log(`MCP config: ${report.installed.mcp.installed}/${report.installed.mcp.expected}`);
  if (report.runtime.inspected) {
    console.log(`Active Codex home: ${report.runtime.activeCodexHome || "unknown"}`);
    console.log(`Active home matches install: ${report.runtime.activeHomeMatchesInstall}`);
    if (report.runtime.mcpList?.inspected) {
      console.log(`Runtime MCP list with installed CODEX_HOME: ${report.runtime.mcpList.servers} servers`);
    }
  }
  if (report.skills.inspected) {
    console.log(`Skills: ${report.skills.installed} listed, ${report.skills.missing.length} missing from curated install set`);
  }
  for (const warning of warnings) console.log(`Warning: ${warning}`);
  for (const failure of failures) console.error(`Failure: ${failure}`);
}

if (failures.length > 0) process.exit(1);
