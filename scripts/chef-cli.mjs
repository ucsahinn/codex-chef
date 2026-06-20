#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const logRoot = path.join(root, "tmp", "chef-cli", "logs");
const args = process.argv.slice(2);

const options = {
  help: false,
  json: false,
  plain: false,
  noLog: false,
  repoOnly: false,
  apply: false,
  action: null,
  profile: null
};

const ACTION_FLAGS = new Map([
  ["--status", "status"],
  ["--doctor", "doctor"],
  ["--preview", "preview"],
  ["--update", "update"],
  ["--reset", "reset"],
  ["--repair", "repair"],
  ["--install", "install"],
  ["--skills", "skills"],
  ["--mcp", "mcp"],
  ["--routing", "routing"],
  ["--auth", "auth"],
  ["--logs", "logs"]
]);

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") options.help = true;
  else if (arg === "--json") options.json = true;
  else if (arg === "--plain") options.plain = true;
  else if (arg === "--no-log") options.noLog = true;
  else if (arg === "--repo-only") options.repoOnly = true;
  else if (arg === "--apply") options.apply = true;
  else if (arg === "--profile") {
    options.profile = args[index + 1] || null;
    index += 1;
  }
  else if (ACTION_FLAGS.has(arg)) options.action = ACTION_FLAGS.get(arg);
  else {
    console.error(`Codex Chef CLI error: Unknown option ${arg}. Run npm run chef -- --help for supported commands.`);
    process.exit(2);
  }
}

const ASCII_ICONS = {
  chef: "[chef]",
  ok: "[ok]",
  info: "[info]",
  warn: "[warn]",
  run: "[run]",
  update: "[update]",
  lock: "[auth]",
  docs: "[docs]",
  logs: "[logs]"
};

const COLOR_CODES = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

const ICON_COLORS = {
  chef: "cyan",
  ok: "green",
  info: "blue",
  warn: "yellow",
  run: "magenta",
  update: "green",
  lock: "yellow",
  docs: "cyan",
  logs: "dim"
};

function supportsColor() {
  if (options.plain) return false;
  if (Object.hasOwn(process.env, "NO_COLOR") && process.env.NO_COLOR !== "") return false;
  const force = String(process.env.FORCE_COLOR || "").toLowerCase();
  if (force === "0" || force === "false") return false;
  if (force || process.env.CLICOLOR_FORCE === "1") return true;
  return Boolean(process.stdout.isTTY);
}

function colorize(value, color) {
  if (!supportsColor()) return String(value);
  const code = COLOR_CODES[color];
  if (!code) return String(value);
  return `${code}${value}${COLOR_CODES.reset}`;
}

function styleAction(action) {
  return colorize(action, "cyan");
}

function styleHeading(value) {
  return colorize(value, "bold");
}

function styleLabel(value) {
  return colorize(value, "cyan");
}

function styleMuted(value) {
  return colorize(value, "dim");
}

function styleWriteBoundary(boundary) {
  if (boundary === "none") return colorize(boundary, "green");
  if (boundary.includes("optional") || boundary.includes("guidance")) return colorize(boundary, "yellow");
  return colorize(boundary, "red");
}

function makeIcons() {
  return Object.fromEntries(
    Object.entries(ASCII_ICONS).map(([name, icon]) => [name, colorize(icon, ICON_COLORS[name])])
  );
}

const ICONS = makeIcons();

const MENU_ITEMS = [
  {
    id: "status",
    label: "Status",
    writes: "none",
    description: "Read-only installed runtime and repo status board."
  },
  {
    id: "status:repo-only",
    label: "Repo-only status",
    writes: "none",
    description: "Fast local repo checks without installed runtime or Codex CLI probes."
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
    id: "update",
    label: "Update",
    writes: "repo/global/network",
    description: "Preview or apply a Git fast-forward plus backup-backed managed refresh."
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
    id: "routing",
    label: "Routing",
    writes: "none",
    description: "Show task-shape routing, agent wait policy, skills, and MCP usage contract."
  },
  {
    id: "auth",
    label: "Auth",
    writes: "none/account guidance",
    description: "Show public-safe GitHub auth boundaries and verification notes."
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
  console.log(`${colorize("Codex Chef CLI", "cyan")}

Usage:
  npm run chef
  npm run chef -- --status
  npm run chef -- --doctor
  npm run chef -- --preview
  npm run chef -- --update [--apply]
  npm run chef -- --status --repo-only
  npm run chef -- --reset [--apply]
  npm run chef -- --repair [--apply]
  npm run chef -- --install [--apply]
  npm run chef -- --skills
  npm run chef -- --mcp
  npm run chef -- --routing
  npm run chef -- --routing --profile starter-health
  npm run chef -- --auth
  npm run chef -- --logs

Options:
  --json       Emit JSON where supported
  --plain      Use ASCII labels instead of icons
  --no-log     Do not create repo-local CLI log files for strict audits
  --repo-only  Skip installed runtime, global skill roots, Codex logs, and Codex CLI probes for status
  --profile ID Show one routing profile when used with --routing
  --apply      Allow write actions for update, install, reset, repair, or selected skill install
  --help       Show this help

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
  if (!options.json) console.log(`${ICONS.run} ${commandForDisplay(command, commandArgs)}`);
  if (extra.waitNote && !options.json) console.log(`${ICONS.info} ${extra.waitNote}`);

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
  if (logPath && !options.json) console.log(`${ICONS.ok} Log: ${toPosix(path.relative(root, logPath))}`);
  else if (!options.json) console.log(`${ICONS.ok} Log disabled by --no-log`);
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
  console.log(styleMuted("One menu for install, update, repair, diagnostics, skills, MCP notes, auth, and logs."));
  console.log("");
}

function runStatus(overrides = {}) {
  const repoOnly = Boolean(overrides.repoOnly || options.repoOnly);
  return runNode(repoOnly ? "status-repo-only" : "status", "scripts/codex-status.mjs", [
    "--redact-paths",
    ...(repoOnly ? ["--skip-runtime", "--skip-codex-doctor-checks", "--skip-codex-cli"] : []),
    ...(options.json ? ["--json"] : [])
  ], {
    waitNote: repoOnly
      ? "Collecting local repo checks only; installed runtime, global skill roots, Codex logs, and Codex CLI probes are skipped."
      : "Collecting Codex runtime, MCP, Git, and log metadata checks; this can take 30-60 seconds."
  });
}

function runDoctor() {
  const first = runNode("doctor", "scripts/codex-doctor.mjs", [
    "--redact-paths",
    ...(options.json ? ["--json"] : [])
  ], {
    waitNote: "Running repo doctor checks."
  });
  if (!first.ok) return first;
  return runNode("runtime", "scripts/verify-install-runtime.mjs", [
    "--redact-paths",
    "--expect-skills",
    "--expect-git-guards",
    ...(options.json ? ["--json"] : [])
  ], {
    waitNote: "Verifying installed Codex Chef runtime; this can take 30-60 seconds."
  });
}

function runPreview(force = false, includeSkills = true) {
  const plan = runNode("preview-plan", "scripts/plan-install.mjs", [
    ...(includeSkills ? ["--all"] : []),
    ...(force ? ["--force"] : []),
    ...(options.json ? ["--json"] : []),
    "--redact-paths"
  ]);
  if (!plan.ok) return plan;
  if (process.platform === "win32") {
    return runPowerShell("preview-installer", ".\\scripts\\install.ps1", [
      ...(includeSkills ? ["-All"] : []),
      ...(force ? ["-Force"] : []),
      "-WhatIf",
      "-PlainOutput"
    ]);
  }
  return runBash("preview-installer", "scripts/install.sh", [
    ...(includeSkills ? ["--all"] : []),
    ...(force ? ["--force"] : []),
    "--dry-run",
    "--plain-output"
  ]);
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function runPackageScript(action, scriptName, extra = {}) {
  return runLoggedCommand(action, npmCommand(), ["run", scriptName], extra);
}

function runUpdateValidation() {
  console.log(`${ICONS.info} Running local validation before managed refresh.`);
  const validate = runPackageScript("update-validate", "validate", {
    timeout: 300000,
    waitNote: "Checking repository structure before global managed files are refreshed."
  });
  if (!validate.ok) return validate;
  return runPackageScript("update-security-audit", "audit:security", {
    timeout: 300000,
    waitNote: "Checking tracked release/security surfaces before global managed files are refreshed."
  });
}

function inspectGitDirty() {
  const result = spawnSync("git", ["status", "--short"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 30000,
    windowsHide: true
  });
  if (result.error) {
    return { ok: false, message: result.error.message, output: "" };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      message: `git status exited ${result.status}`,
      output: redactSensitiveOutput([result.stdout, result.stderr].filter(Boolean).join("\n"))
    };
  }
  return { ok: true, dirty: Boolean(String(result.stdout || "").trim()), output: redactLocalPaths(result.stdout || "") };
}

function gitHead() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 30000,
    windowsHide: true
  });
  if (result.error) {
    return { ok: false, message: result.error.message, value: null };
  }
  if (result.status !== 0) {
    return {
      ok: false,
      message: `git rev-parse exited ${result.status}`,
      value: null
    };
  }
  return { ok: true, message: null, value: String(result.stdout || "").trim() };
}

async function runUpdate() {
  if (!options.apply) {
    console.log(`${ICONS.update} Update preview first. No managed or global files changed.`);
    console.log(`${ICONS.info} Use npm run chef -- --update --apply to pull the latest Codex Chef and refresh managed files after backup.`);
    console.log(`${ICONS.info} Update preview excludes curated global skill installs; use --install or --skills for that explicit surface.`);
    return runPreview(true, false);
  }
  const dirty = inspectGitDirty();
  if (!dirty.ok) {
    console.log(`${ICONS.warn} Cannot inspect Git worktree: ${dirty.message}`);
    if (dirty.output.trim()) process.stdout.write(dirty.output.endsWith("\n") ? dirty.output : `${dirty.output}\n`);
    return { ok: false };
  }
  if (dirty.dirty) {
    console.log(`${ICONS.warn} Update apply requires a clean worktree so local edits are not overwritten.`);
    process.stdout.write(dirty.output.endsWith("\n") ? dirty.output : `${dirty.output}\n`);
    console.log(`${ICONS.info} Commit, stash, or move local changes, then rerun npm run chef -- --update --apply.`);
    return { ok: false };
  }
  const beforeHead = gitHead();
  if (!beforeHead.ok) {
    console.log(`${ICONS.warn} Cannot inspect current Git HEAD: ${beforeHead.message}`);
    return { ok: false };
  }
  const allowed = await confirmWriteAction(
    "Update",
    "Update pulls latest Codex Chef changes with git pull --ff-only, then refreshes managed Codex files after a same-tree preview."
  );
  if (!allowed) return { ok: false, skipped: true };
  const pull = runLoggedCommand("update-pull", "git", ["pull", "--ff-only"], {
    timeout: 300000,
    waitNote: "Fetching and fast-forwarding the Codex Chef repository."
  });
  if (!pull.ok) return pull;
  const afterHead = gitHead();
  if (!afterHead.ok) {
    console.log(`${ICONS.warn} Cannot inspect updated Git HEAD: ${afterHead.message}`);
    return { ok: false };
  }
  if (beforeHead.value !== afterHead.value) {
    console.log(`${ICONS.update} Repository updated from ${beforeHead.value.slice(0, 7)} to ${afterHead.value.slice(0, 7)}.`);
    console.log(`${ICONS.info} Running a fresh preview from the updated tree. Review it, then rerun npm run chef -- --update --apply to refresh managed files.`);
    const preview = runPreview(true, false);
    if (!preview.ok) return preview;
    return { ok: true, skipped: true };
  }
  console.log(`${ICONS.ok} Repository already up to date; applying the reviewed managed refresh.`);
  const validation = runUpdateValidation();
  if (!validation.ok) return validation;
  if (process.platform === "win32") {
    return runPowerShell("update-install", ".\\scripts\\install.ps1", ["-Force", "-PlainOutput"]);
  }
  return runBash("update-install", "scripts/install.sh", ["--force", "--plain-output"]);
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
  console.log(styleHeading("Skill selection:"));
  installable.forEach((skill, index) => {
    console.log(`${index + 1}. ${styleAction(skill.name)} - ${styleMuted(skill.source)}`);
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
  const routing = readJson("catalog/routing-profiles.json");
  const installable = (catalog.skills || []).filter((skill) => skill.install === true);
  const profileCount = (routing.profiles || []).length;
  console.log(`${ICONS.docs} Curated installable skills: ${installable.length}`);
  console.table(installable.map((skill) => ({
    name: skill.name,
    source: skill.source,
    risk: skill.risk,
    auth: skill.authRequired ? "yes" : "no",
    checked: skill.lastChecked
  })));
  console.log("");
  console.log(styleHeading("Skill activation contract"));
  console.log("- Installed skills do not run by themselves or grant hidden permissions.");
  console.log("- A skill enters context when the user names it, for example $SkillName, or when the task clearly matches its description.");
  console.log("- Codex reads the selected skill's SKILL.md before acting, then loads only referenced files needed for the task.");
  console.log(`- ${profileCount} routing profiles map task shapes to recommended skills; inspect them with npm run chef -- --routing.`);
  console.log(`${ICONS.info} Offline verification runs by default. Online resolution: npm run verify:skills:online -- --timeout-ms=90000`);
  const verification = runNode("skills", "scripts/verify-skill-sources.mjs");
  if (!verification.ok || !process.stdin.isTTY) return verification;
  return selectSkill(installable);
}

function explainMcpServer(server) {
  console.log("");
  console.log(styleHeading(server.name));
  console.log(`- ${styleLabel("status")}: ${server.defaultEnabled ? colorize("ready_by_default", "green") : colorize("disabled_by_default", "yellow")}`);
  console.log(`- ${styleLabel("transport")}: ${server.transport}`);
  console.log(`- ${styleLabel("target")}: ${mcpTarget(server)}`);
  console.log(`- ${styleLabel("auth")}: ${server.auth}`);
  console.log(`- ${styleLabel("approval")}: ${server.approval}`);
  console.log(`- ${styleLabel("risk")}: ${server.risk}`);
  console.log(`- ${styleLabel("setup")}: ${server.setupKind} - ${server.setupHint}`);
  console.log(`- ${styleLabel("reason")}: ${server.defaultReason}`);
  console.log(`- ${styleLabel("source")}: ${server.sourceUrl}`);
  console.log(`- ${styleLabel("config details")}: see templates/codex/config.windows.toml and templates/codex/config.unix.toml for timeouts and per-tool exposure.`);
  console.log(`- ${styleLabel("verified")}: not_checked until /mcp, codex mcp, or a safe read-only probe succeeds.`);
  console.log(`- ${styleLabel("rollback")}: set this connector's enabled flag to false and restart Codex.`);
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
  console.log(styleMuted("Evidence levels: documented=catalog, configured=template/installed config, verified=only after /mcp or codex mcp live check."));
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
  console.log(styleMuted("Timeouts and per-tool exposure live in templates/codex/config.windows.toml and templates/codex/config.unix.toml."));
  for (const server of servers.filter((item) => item.setupHint)) {
    console.log(`- ${styleAction(server.name)}: ${server.setupHint}`);
  }
  console.log("");
  console.log(colorize("Authenticated account, database, and broad filesystem MCP connectors stay disabled by default.", "yellow"));
  console.log(styleMuted("Enable them only for a concrete task in ~/.codex/config.toml, restart Codex, then verify with /mcp or codex mcp."));
  console.log(styleMuted("Rollback: set the connector's enabled flag back to false and restart Codex."));
  if (process.stdin.isTTY) {
    console.log("");
    servers.forEach((server, index) => {
      console.log(`${index + 1}. ${styleAction(server.name)}`);
    });
    const selected = await askSelection(servers, "\nSelect an MCP number to explain, or press Enter to skip: ");
    if (selected) explainMcpServer(selected);
  }
  return { ok: true };
}

function runRouting() {
  return runNode("routing", "scripts/codex-routing-board.mjs", [
    ...(options.profile ? ["--profile", options.profile] : []),
    ...(options.json ? ["--json"] : [])
  ], {
    waitNote: "Showing the agent, skill, MCP, and wait-policy routing contract."
  });
}

function runAuth() {
  console.log(`${ICONS.lock} GitHub authentication boundary`);
  console.log("");
  console.log(styleMuted("This public CLI does not print account-scoped re-auth or global Git credential-helper commands."));
  console.log(styleMuted("If GitHub release, push, or workflow checks fail because local auth is stale, refresh GitHub CLI or Git Credential Manager according to your organization policy."));
  console.log(styleMuted("After refresh, use a read-only remote check such as `git ls-remote origin HEAD` from the target repository before retrying a publish step."));
  console.log("");
  console.log(styleHeading("Notes:"));
  console.log(`- ${colorize("Do not paste tokens", "yellow")} into repo files, AGENTS.md, skills, rules, or shell history.`);
  console.log("- Keep personal account repair, token scope decisions, and global Git credential configuration outside this public repo.");
  console.log("- Do not store workflow or release tokens in Codex Chef templates, examples, logs, or docs.");
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
    case "status:repo-only":
      return runStatus({ repoOnly: true });
    case "doctor":
      return runDoctor();
    case "preview":
      return runPreview();
    case "update":
      return runUpdate();
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
    case "routing":
      return runRouting();
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
        const label = item.id === "exit" ? colorize(item.label, "dim") : styleAction(item.label);
        console.log(`${index + 1}. ${label} [writes: ${styleWriteBoundary(item.writes)}] - ${styleMuted(item.description)}`);
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
