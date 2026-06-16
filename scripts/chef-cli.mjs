#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

const root = path.resolve(process.cwd());
const logRoot = path.join(root, "tmp", "chef-cli", "logs");
const args = process.argv.slice(2);

const options = {
  help: false,
  json: false,
  plain: false,
  noLog: false,
  apply: false,
  action: null
};

const ACTION_FLAGS = new Map([
  ["--status", "status"],
  ["--doctor", "doctor"],
  ["--preview", "preview"],
  ["--reset", "reset"],
  ["--repair", "repair"],
  ["--install", "install"],
  ["--skills", "skills"],
  ["--mcp", "mcp"],
  ["--auth", "auth"],
  ["--logs", "logs"]
]);

for (const arg of args) {
  if (arg === "--help" || arg === "-h") options.help = true;
  else if (arg === "--json") options.json = true;
  else if (arg === "--plain") options.plain = true;
  else if (arg === "--no-log") options.noLog = true;
  else if (arg === "--apply") options.apply = true;
  else if (ACTION_FLAGS.has(arg)) options.action = ACTION_FLAGS.get(arg);
  else throw new Error(`Unknown argument: ${arg}`);
}

const ICONS = options.plain
  ? {
      chef: "[chef]",
      ok: "[ok]",
      info: "[info]",
      warn: "[warn]",
      run: "[run]",
      lock: "[auth]",
      docs: "[docs]",
      logs: "[logs]"
    }
  : {
      chef: "🍳",
      ok: "✅",
      info: "ℹ️",
      warn: "⚠️",
      run: "▶️",
      lock: "🔐",
      docs: "📘",
      logs: "🧾"
    };

const MENU_ITEMS = [
  {
    id: "status",
    label: "Status",
    writes: "none",
    description: "Read-only installed runtime and repo status board."
  },
  {
    id: "doctor",
    label: "Doctor",
    writes: "none",
    description: "Repo doctor plus full installed runtime expectations."
  },
  {
    id: "preview",
    label: "Preview",
    writes: "none",
    description: "No-write install plan and PowerShell/Bash dry run."
  },
  {
    id: "install",
    label: "Install",
    writes: "global/network",
    description: "Full install. Requires --apply or confirmation."
  },
  {
    id: "reset",
    label: "Reset",
    writes: "global/network",
    description: "Backup-backed managed refresh/reinstall. Requires --apply or confirmation."
  },
  {
    id: "repair",
    label: "Repair",
    writes: "global",
    description: "Repair managed drift after backup. Requires --apply or confirmation."
  },
  {
    id: "skills",
    label: "Skills",
    writes: "network optional",
    description: "Show curated skill catalog and verify sources."
  },
  {
    id: "mcp",
    label: "MCP",
    writes: "none/account guidance",
    description: "Show MCP defaults, disabled account connectors, and setup notes."
  },
  {
    id: "auth",
    label: "Auth",
    writes: "none/account guidance",
    description: "Show durable GitHub CLI and Git Credential Manager login commands."
  },
  {
    id: "logs",
    label: "Logs",
    writes: "none",
    description: "List recent Codex Chef CLI log files."
  },
  {
    id: "exit",
    label: "Exit",
    writes: "none",
    description: "Close the menu."
  }
];

function printHelp() {
  console.log(`Codex Chef CLI

Usage:
  npm run chef
  npm run chef -- --status
  npm run chef -- --doctor
  npm run chef -- --preview
  npm run chef -- --reset [--apply]
  npm run chef -- --repair [--apply]
  npm run chef -- --install [--apply]
  npm run chef -- --skills
  npm run chef -- --mcp
  npm run chef -- --auth
  npm run chef -- --logs

Options:
  --json     Emit JSON where supported
  --plain    Use ASCII labels instead of icons
  --no-log   Do not create repo-local CLI log files for strict audits
  --apply    Allow write actions for install, reset, repair, or selected skill install
  --help     Show this help

Logs:
  tmp/chef-cli/logs
`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function ensureLogRoot() {
  fs.mkdirSync(logRoot, { recursive: true });
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function makeLogPath(action) {
  if (options.noLog) return null;
  ensureLogRoot();
  return path.join(logRoot, `${timestamp()}-${action}.log`);
}

function commandForDisplay(command, commandArgs) {
  return [command, ...commandArgs].join(" ");
}

function redactLocalPaths(output) {
  const home = os.homedir();
  return String(output)
    .replaceAll(root, "${REPO}")
    .replaceAll(root.replaceAll("\\", "/"), "${REPO}")
    .replaceAll(home, "${HOME}")
    .replaceAll(home.replaceAll("\\", "/"), "${HOME}");
}

function redactSensitiveOutput(output) {
  return redactLocalPaths(output)
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/github_pat_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "[REDACTED_API_KEY]")
    .replace(/xox[baprs]-[A-Za-z0-9-]{20,}/g, "[REDACTED_SLACK_TOKEN]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]")
    .replace(/\b(?:api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]\s*["']?[^"'\s]{12,}/gi, (match) => {
      const key = match.split(/[:=]/)[0].trim();
      return `${key}=[REDACTED_SECRET]`;
    })
    .replace(/\b(?:postgres|postgresql|mysql|mongodb):\/\/[^\s"'`]+/gi, "[REDACTED_CONNECTION_STRING]")
    .replace(/\bSUPABASE_DB_URL\s*=\s*[^\s"'`]+/gi, "SUPABASE_DB_URL=[REDACTED_CONNECTION_STRING]");
}

function runLoggedCommand(action, command, commandArgs, extra = {}) {
  const logPath = makeLogPath(action);
  const executable = process.platform === "win32" && command.endsWith(".cmd") ? "cmd.exe" : command;
  const argsForSpawn = process.platform === "win32" && command.endsWith(".cmd")
    ? ["/d", "/s", "/c", command, ...commandArgs]
    : commandArgs;
  const startedAt = new Date().toISOString();
  const header = [
    `Codex Chef CLI log`,
    `action=${action}`,
    `startedAt=${startedAt}`,
    `cwd=${redactLocalPaths(root)}`,
    `command=${commandForDisplay(command, commandArgs)}`,
    ""
  ].join("\n");
  if (logPath) fs.appendFileSync(logPath, header, "utf8");
  console.log(`${ICONS.run} ${commandForDisplay(command, commandArgs)}`);

  const result = spawnSync(executable, argsForSpawn, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: extra.timeout || 180000,
    windowsHide: true,
    env: {
      ...process.env,
      FORCE_COLOR: "0",
      NO_COLOR: "1",
      TERM: "dumb",
      ...(extra.env || {})
    }
  });

  const output = redactSensitiveOutput([result.stdout, result.stderr].filter(Boolean).join("\n"));
  if (output.trim()) process.stdout.write(output.endsWith("\n") ? output : `${output}\n`);
  if (logPath) {
    fs.appendFileSync(logPath, output, "utf8");
    fs.appendFileSync(logPath, `\nexitCode=${result.status ?? "error"}\n`, "utf8");
  }

  if (result.error) {
    console.error(`${ICONS.warn} ${result.error.message}`);
    return { ok: false, status: null, logPath, error: result.error.message };
  }
  if (result.status !== 0) {
    const logNote = logPath ? ` Log: ${toPosix(path.relative(root, logPath))}` : " Logging disabled by --no-log.";
    console.error(`${ICONS.warn} Command failed with exit ${result.status}.${logNote}`);
    return { ok: false, status: result.status, logPath };
  }
  if (logPath) console.log(`${ICONS.ok} Log: ${toPosix(path.relative(root, logPath))}`);
  else console.log(`${ICONS.ok} Log disabled by --no-log`);
  return { ok: true, status: result.status, logPath };
}

function runNode(action, script, scriptArgs = [], extra = {}) {
  return runLoggedCommand(action, process.execPath, [script, ...scriptArgs], extra);
}

function runPowerShell(action, script, scriptArgs = []) {
  return runLoggedCommand(action, "powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    script,
    ...scriptArgs
  ], { timeout: 300000 });
}

function runBash(action, script, scriptArgs = []) {
  return runLoggedCommand(action, "bash", [script, ...scriptArgs], { timeout: 300000 });
}

async function confirmWriteAction(action, detail) {
  if (options.apply) return true;
  if (!process.stdin.isTTY) {
    console.log(`${ICONS.warn} ${action} is a write action. Re-run with --apply to execute it.`);
    return false;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${ICONS.warn} ${detail} Type APPLY to continue: `);
  rl.close();
  return answer.trim() === "APPLY";
}

function printHeader() {
  console.log(`${ICONS.chef} Codex Chef`);
  console.log("One menu for install, repair, diagnostics, skills, MCP notes, auth, and logs.");
  console.log("");
}

function runStatus() {
  return runNode("status", "scripts/codex-status.mjs", [
    "--redact-paths",
    ...(options.json ? ["--json"] : [])
  ]);
}

function runDoctor() {
  const first = runNode("doctor", "scripts/codex-doctor.mjs", [
    "--redact-paths",
    ...(options.json ? ["--json"] : [])
  ]);
  if (!first.ok) return first;
  return runNode("runtime", "scripts/verify-install-runtime.mjs", [
    "--redact-paths",
    "--expect-skills",
    "--expect-git-guards",
    ...(options.json ? ["--json"] : [])
  ]);
}

function runPreview(force = false) {
  const plan = runNode("preview-plan", "scripts/plan-install.mjs", [
    "--all",
    ...(force ? ["--force"] : []),
    "--json",
    "--redact-paths"
  ]);
  if (!plan.ok) return plan;
  if (process.platform === "win32") {
    return runPowerShell("preview-installer", ".\\scripts\\install.ps1", [
      "-All",
      ...(force ? ["-Force"] : []),
      "-WhatIf",
      "-PlainOutput"
    ]);
  }
  return runBash("preview-installer", "scripts/install.sh", [
    "--all",
    ...(force ? ["--force"] : []),
    "--dry-run",
    "--plain-output"
  ]);
}

async function runInstall() {
  const allowed = await confirmWriteAction(
    "Install",
    "Full install can write managed Codex files after backup and can install curated global skills."
  );
  if (!allowed) return { ok: false, skipped: true };
  if (process.platform === "win32") {
    return runPowerShell("install", ".\\scripts\\install.ps1", ["-All", "-Interactive", "-PlainOutput"]);
  }
  return runBash("install", "scripts/install.sh", ["--all", "--interactive", "--plain-output"]);
}

async function runReset() {
  if (!options.apply) {
    console.log(`${ICONS.info} Reset preview first. Use npm run chef -- --reset --apply for a backup-backed managed refresh.`);
    return runPreview(true);
  }
  const allowed = await confirmWriteAction(
    "Reset",
    "Reset refreshes managed Codex Chef files after backup with installer force mode; unrelated user files remain out of scope."
  );
  if (!allowed) return { ok: false, skipped: true };
  if (process.platform === "win32") {
    return runPowerShell("reset-apply", ".\\scripts\\install.ps1", ["-All", "-Force", "-Interactive", "-PlainOutput"]);
  }
  return runBash("reset-apply", "scripts/install.sh", ["--all", "--force", "--interactive", "--plain-output"]);
}

async function runRepair() {
  if (!options.apply) {
    console.log(`${ICONS.info} Repair preview first. Use npm run chef -- --repair --apply to modify managed files after backup.`);
    return runNode("repair-preview", "scripts/repair-install.mjs", ["--redact-paths"]);
  }
  const allowed = await confirmWriteAction(
    "Repair",
    "Repair can update managed Codex Chef files after backup while preserving unrelated user files."
  );
  if (!allowed) return { ok: false, skipped: true };
  return runNode("repair-apply", "scripts/repair-install.mjs", ["--redact-paths", "--apply"]);
}

function npxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

async function askSelection(items, prompt) {
  if (!process.stdin.isTTY) return null;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(prompt);
    const index = Number(answer.trim());
    if (!Number.isInteger(index) || index < 1 || index > items.length) return null;
    return items[index - 1];
  } finally {
    rl.close();
  }
}

async function installSelectedSkill(skill) {
  const allowed = await confirmWriteAction(
    "Skill install",
    `Install selected global skill ${skill.name} from ${skill.source}.`
  );
  if (!allowed) return { ok: false, skipped: true };
  return runLoggedCommand("skill-install", npxCommand(), [
    "skills",
    "add",
    skill.package,
    "--skill",
    skill.skill,
    ...(skill.fullDepth ? ["--full-depth"] : []),
    "--agent",
    "codex",
    "--yes",
    "--global"
  ], { timeout: 300000 });
}

async function selectSkill(installable) {
  console.log("");
  console.log("Skill selection:");
  installable.forEach((skill, index) => {
    console.log(`${index + 1}. ${skill.name} - ${skill.source}`);
  });
  const selected = await askSelection(
    installable,
    "\nSelect a skill number to install with --apply, or press Enter to skip: "
  );
  if (!selected) {
    console.log(`${ICONS.info} No skill selected.`);
    return { ok: true };
  }
  if (!options.apply) {
    console.log(`${ICONS.warn} Selected ${selected.name}. Re-run npm run chef -- --skills --apply and choose it to install.`);
    return { ok: false, skipped: true };
  }
  return installSelectedSkill(selected);
}

async function runSkills() {
  const catalog = readJson("catalog/skills.json");
  const installable = (catalog.skills || []).filter((skill) => skill.install === true);
  console.log(`${ICONS.docs} Curated installable skills: ${installable.length}`);
  console.table(installable.map((skill) => ({
    name: skill.name,
    source: skill.source,
    risk: skill.risk,
    auth: skill.authRequired ? "yes" : "no",
    checked: skill.lastChecked
  })));
  console.log(`${ICONS.info} Offline verification runs by default. Online resolution: npm run verify:skills:online -- --timeout-ms=90000`);
  const verification = runNode("skills", "scripts/verify-skill-sources.mjs");
  if (!verification.ok || !process.stdin.isTTY) return verification;
  return selectSkill(installable);
}

function explainMcpServer(server) {
  console.log("");
  console.log(`${server.name}`);
  console.log(`- status: ${server.defaultEnabled ? "ready_by_default" : "disabled_by_default"}`);
  console.log(`- transport: ${server.transport}`);
  console.log(`- target: ${mcpTarget(server)}`);
  console.log(`- auth: ${server.auth}`);
  console.log(`- approval: ${server.approval}`);
  console.log(`- risk: ${server.risk}`);
  console.log(`- setup: ${server.setupKind} - ${server.setupHint}`);
  console.log(`- reason: ${server.defaultReason}`);
  console.log(`- source: ${server.sourceUrl}`);
  console.log("- config details: see templates/codex/config.windows.toml and templates/codex/config.unix.toml for timeouts and per-tool exposure.");
  console.log("- verified: not_checked until /mcp, codex mcp, or a safe read-only probe succeeds.");
  console.log("- rollback: set this connector's enabled flag to false and restart Codex.");
}

function mcpTarget(server) {
  if (server.url) return server.url;
  if (server.package) return server.package;
  if (server.command) return server.sourceRef ? `${server.command} @ ${server.sourceRef}` : server.command;
  return "configured in template";
}

async function runMcp() {
  const catalog = readJson("catalog/mcp-servers.json");
  const servers = catalog.servers || [];
  console.log(`${ICONS.docs} MCP servers: ${servers.length}`);
  console.log("Evidence levels: documented=catalog, configured=template/installed config, verified=only after /mcp or codex mcp live check.");
  console.table(servers.map((server) => ({
    name: server.name,
    category: server.category,
    documented: server.defaultEnabled ? "ready_by_default" : "disabled_by_default",
    configured: "configured_unverified",
    verified: "not_checked",
    transport: server.transport,
    target: mcpTarget(server),
    auth: server.auth,
    approval: server.approval,
    setup: server.setupKind,
    source: server.sourceUrl
  })));
  console.log("Timeouts and per-tool exposure live in templates/codex/config.windows.toml and templates/codex/config.unix.toml.");
  for (const server of servers.filter((item) => item.setupHint)) {
    console.log(`- ${server.name}: ${server.setupHint}`);
  }
  console.log("");
  console.log("Authenticated account, database, and broad filesystem MCP connectors stay disabled by default.");
  console.log("Enable them only for a concrete task in ~/.codex/config.toml, restart Codex, then verify with /mcp or codex mcp.");
  console.log("Rollback: set the connector's enabled flag back to false and restart Codex.");
  if (process.stdin.isTTY) {
    console.log("");
    servers.forEach((server, index) => {
      console.log(`${index + 1}. ${server.name}`);
    });
    const selected = await askSelection(servers, "\nSelect an MCP number to explain, or press Enter to skip: ");
    if (selected) explainMcpServer(selected);
  }
  return { ok: true };
}

function runAuth() {
  console.log(`${ICONS.lock} Durable GitHub CLI and Git Credential Manager login`);
  console.log("");
  console.log("Use these commands when gh reports 401, release creation fails, or HTTPS Git operations lack workflow scope:");
  console.log("");
  console.log("gh auth login --hostname github.com --git-protocol https --web --scopes repo,workflow");
  console.log("gh auth setup-git --hostname github.com");
  console.log("gh auth status --hostname github.com");
  console.log("git config --global credential.helper manager");
  console.log("git ls-remote origin HEAD");
  console.log("");
  console.log("Notes:");
  console.log("- Do not paste tokens into repo files, AGENTS.md, skills, rules, or shell history.");
  console.log("- `repo,workflow` is required when a release flow may touch GitHub Actions workflow files or create releases.");
  console.log("- Git Credential Manager keeps HTTPS push durable after browser login.");
  console.log("- Authenticated MCP connectors still remain disabled until a task needs them.");
  return { ok: true };
}

function runLogs() {
  if (!fs.existsSync(logRoot)) {
    console.log(`${ICONS.info} No logs yet.`);
    return { ok: true };
  }
  const logs = fs.readdirSync(logRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".log"))
    .map((entry) => {
      const fullPath = path.join(logRoot, entry.name);
      const stat = fs.statSync(fullPath);
      return {
        file: toPosix(path.relative(root, fullPath)),
        size: stat.size,
        modified: stat.mtime.toISOString()
      };
    })
    .sort((a, b) => b.modified.localeCompare(a.modified))
    .slice(0, 12);
  if (logs.length === 0) console.log(`${ICONS.info} No logs yet.`);
  else console.table(logs);
  return { ok: true };
}

async function runAction(action) {
  switch (action) {
    case "status":
      return runStatus();
    case "doctor":
      return runDoctor();
    case "preview":
      return runPreview();
    case "reset":
      return runReset();
    case "install":
      return runInstall();
    case "repair":
      return runRepair();
    case "skills":
      return runSkills();
    case "mcp":
      return runMcp();
    case "auth":
      return runAuth();
    case "logs":
      return runLogs();
    case "exit":
      return { ok: true };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function runMenu() {
  printHeader();
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      for (let index = 0; index < MENU_ITEMS.length; index += 1) {
        const item = MENU_ITEMS[index];
        console.log(`${index + 1}. ${item.label} [writes: ${item.writes}] - ${item.description}`);
      }
      const answer = await rl.question(`\nSelect 1-${MENU_ITEMS.length}: `);
      const index = Number(answer.trim());
      const item = MENU_ITEMS[index - 1];
      if (!item) {
        console.log(`${ICONS.warn} Choose a number from 1 to ${MENU_ITEMS.length}.`);
        continue;
      }
      console.log("");
      if (item.id === "exit") break;
      await runAction(item.id);
      console.log("");
    }
  } finally {
    rl.close();
  }
}

if (options.help) {
  printHelp();
} else if (options.action) {
  const result = await runAction(options.action);
  if (result?.ok === false && !result.skipped) process.exit(1);
} else if (!process.stdin.isTTY) {
  printHelp();
} else {
  await runMenu();
}
