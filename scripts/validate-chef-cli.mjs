#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function runNodeCheck(relativePath) {
  const result = spawnSync(process.execPath, ["--check", relativePath], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  if (result.error) {
    fail(`node --check failed for ${relativePath}: ${result.error.message}`);
  } else if (result.status !== 0) {
    fail(`node --check failed for ${relativePath}: ${result.stderr || result.stdout || `exit ${result.status}`}`);
  }
}

function runCliSmoke(name, cliArgs, expectedSnippets, extra = {}) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/chef-cli.mjs"), ...cliArgs], {
    cwd: extra.cwd || root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      ...(extra.env || {})
    },
    windowsHide: true,
    timeout: extra.timeout || 180000
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.error) {
    fail(`chef-cli smoke ${name} failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail(`chef-cli smoke ${name} exited ${result.status}: ${output.trim()}`);
    return;
  }
  for (const snippet of expectedSnippets) {
    if (!output.includes(snippet)) fail(`chef-cli smoke ${name} missing output snippet: ${snippet}`);
  }
  if (output.includes("Log: tmp/chef-cli/logs")) {
    fail(`chef-cli smoke ${name} should not create logs when --no-log is used`);
  }
  const hasAnsi = /\x1b\[[0-9;]*m/.test(output);
  if (extra.expectAnsi && !hasAnsi) {
    fail(`chef-cli smoke ${name} should include ANSI color when color is forced`);
  }
  if (extra.forbidAnsi && hasAnsi) {
    fail(`chef-cli smoke ${name} should not include ANSI color`);
  }
}

function runCliJsonSmoke(name, cliArgs) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/chef-cli.mjs"), ...cliArgs], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    timeout: 180000
  });
  if (result.error) {
    fail(`chef-cli JSON smoke ${name} failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail(`chef-cli JSON smoke ${name} exited ${result.status}: ${(result.stdout || "")}${(result.stderr || "")}`.trim());
    return;
  }
  const stdout = String(result.stdout || "").trim();
  if (stdout.includes("[run]") || stdout.includes("[ok]")) {
    fail(`chef-cli JSON smoke ${name} must not wrap JSON with CLI status lines`);
  }
  try {
    JSON.parse(stdout);
  } catch (error) {
    fail(`chef-cli JSON smoke ${name} did not emit parseable JSON: ${error.message}`);
  }
}

function runCliErrorSmoke(name, cliArgs, expectedSnippets) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/chef-cli.mjs"), ...cliArgs], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    timeout: 30000
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.error) {
    fail(`chef-cli error smoke ${name} failed: ${result.error.message}`);
    return;
  }
  if (result.status === 0) {
    fail(`chef-cli error smoke ${name} should exit non-zero`);
  }
  if (/(?:^|\n)\s*at\s+file:|(?:^|\n)Error:\s|node:internal/i.test(output)) {
    fail(`chef-cli error smoke ${name} must not print a Node stack trace`);
  }
  for (const snippet of expectedSnippets) {
    if (!output.includes(snippet)) fail(`chef-cli error smoke ${name} missing output snippet: ${snippet}`);
  }
}

const cliPath = "scripts/chef-cli.mjs";
if (!exists(cliPath)) {
  fail(`Missing ${cliPath}`);
} else {
  const cli = read(cliPath);
  runNodeCheck(cliPath);

  for (const required of [
    "--help",
    "--json",
    "--plain",
    "--no-log",
    "--repo-only",
    "--profile",
    "--status",
    "--doctor",
    "--preview",
    "--reset",
    "--repair",
    "--install",
    "--update",
    "--skills",
    "--mcp",
    "--routing",
    "--auth",
    "--logs",
    "--apply",
    "tmp/chef-cli/logs",
    "codex-status.mjs",
    "codex-doctor.mjs",
    "plan-install.mjs",
    "repair-install.mjs",
    "verify-install-runtime.mjs",
    "verify-skill-sources.mjs",
    "codex-routing-board.mjs",
    "install.ps1",
    "install.sh",
    "GitHub authentication boundary",
    "does not print account-scoped re-auth",
    "organization policy",
    "git ls-remote origin HEAD",
    "MENU_ITEMS",
    "supportsColor",
    "colorize",
    "styleHeading",
    "styleLabel",
    "styleMuted",
    "runLoggedCommand",
    "confirmWriteAction",
    "runUpdate",
    "runUpdateValidation",
    "update-validate",
    "update-security-audit",
    "gitHead",
    "Repository updated from",
    "same-tree preview",
    "selectSkill",
    "installSelectedSkill",
    "explainMcpServer",
    "mcpTarget",
    "redactLocalPaths",
    "redactSensitiveOutput",
    "[REDACTED_GITHUB_TOKEN]",
    "[REDACTED_CONNECTION_STRING]",
    "fileURLToPath",
    "const ICONS = makeIcons()"
  ]) {
    if (!cli.includes(required)) fail(`${cliPath} missing required CLI surface: ${required}`);
  }

  if (/update-install",\s*"\\.\\scripts\\install\.ps1",\s*\[[^\]]*"-All"/s.test(cli)) {
    fail(`${cliPath} update-install must not use -All because update is scoped to managed files, not curated skills`);
  }
  if (/update-install",\s*"scripts\/install\.sh",\s*\[[^\]]*"--all"/s.test(cli)) {
    fail(`${cliPath} update-install must not use --all because update is scoped to managed files, not curated skills`);
  }

  if (/TERM:\s*"dumb"/.test(cli)) {
    fail(`${cliPath} must not force TERM=dumb because codex doctor treats that as a terminal health issue.`);
  }

  for (const requiredLabel of [
    "Status",
    "Doctor",
    "Preview",
    "Install",
    "Reset",
    "Repair",
    "Skills",
    "MCP",
    "Routing",
    "Auth",
    "Logs",
    "Update"
  ]) {
    if (!new RegExp(`\\b${requiredLabel}\\b`).test(cli)) fail(`${cliPath} missing menu label: ${requiredLabel}`);
  }

  for (const forbidden of [
    /\bRemove-Item\b/i,
    /\bdel\s+/i,
    /\brm\s+-rf\b/i,
    /\bgit\s+reset\b/i,
    /\bgit\s+clean\b/i,
    /\bgit\s+push\b/i,
    /\bgh\s+auth\s+token\b/i,
    /\bgit\s+credential-manager\s+get\b/i,
    /\bgh\s+release\s+create\b/i,
    /\bnpm\s+publish\b/i,
    /\bSet-Content\b/i,
    /\bOut-File\b/i
  ]) {
    if (forbidden.test(cli)) fail(`${cliPath} must not contain destructive or publishing command pattern: ${forbidden}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts || {};
const requiredScripts = {
  chef: "node scripts/chef-cli.mjs",
  chefg: "node scripts/chef-cli.mjs",
  "chef:status": "node scripts/chef-cli.mjs --status",
  "chef:update": "node scripts/chef-cli.mjs --update",
  "validate:chef-cli": "node scripts/validate-chef-cli.mjs"
};
for (const [name, command] of Object.entries(requiredScripts)) {
  if (scripts[name] !== command) fail(`package.json script ${name} must be exactly: ${command}`);
}
if (!String(scripts.check || "").includes("node scripts/validate-chef-cli.mjs")) {
  fail("package.json check script must include validate-chef-cli.mjs");
}

runCliSmoke("help", ["--help", "--plain", "--no-log"], [
  "Codex Chef CLI",
  "--no-log",
  "--update [--apply]",
  "Allow write actions for update",
  "--reset [--apply]",
  "tmp/chef-cli/logs"
], { forbidAnsi: true });
runCliErrorSmoke("unknown-option", ["--bad-flag", "--plain", "--no-log"], [
  "Codex Chef CLI error: Unknown option --bad-flag",
  "npm run chef -- --help"
]);
runCliSmoke("forced-color", ["--help", "--no-log"], [
  "Codex Chef CLI"
], {
  env: {
    FORCE_COLOR: "1",
    NO_COLOR: ""
  },
  expectAnsi: true
});
runCliSmoke("mcp", ["--mcp", "--plain", "--no-log"], [
  "MCP servers: 15",
  "transport",
  "target",
  "Timeouts and per-tool exposure live in templates/codex/config.windows.toml",
  "Authenticated account, database, and broad filesystem MCP connectors stay disabled by default."
], { forbidAnsi: true });
runCliSmoke("mcp-forced-color", ["--mcp", "--no-log"], [
  "MCP servers: 15",
  "Authenticated account, database, and broad filesystem MCP connectors stay disabled by default."
], {
  env: {
    FORCE_COLOR: "1",
    NO_COLOR: ""
  },
  expectAnsi: true
});
runCliSmoke("skills", ["--skills", "--plain", "--no-log"], [
  "Curated installable skills: 16",
  "Skill activation contract",
  "Installed skills do not run by themselves",
  "A skill enters context when the user names it",
  "Codex reads the selected skill's SKILL.md before acting",
  "routing profiles map task shapes to recommended skills",
  "Skill source verification passed",
  "Log disabled by --no-log"
]);
runCliSmoke("routing", ["--routing", "--plain", "--no-log"], [
  "Codex Chef enterprise routing board",
  "Subagent visibility contract",
  "Agent plan",
  "Skill selected",
  "MCP selected",
  "Surfaces used",
  "Use /agent in Codex CLI"
]);
runCliSmoke("routing-profile-wrong-cwd", ["--routing", "--profile", "starter-health", "--plain", "--no-log"], [
  "Codex Chef enterprise routing board",
  "Profiles: 1",
  "starter-health",
  "Owner:",
  "Validation:"
], { cwd: path.dirname(root) });
runCliSmoke("update-preview", ["--update", "--plain", "--no-log"], [
  "Update preview",
  "No managed or global files changed",
  "npm run chef -- --update --apply",
  "excludes curated global skill installs"
]);
runCliJsonSmoke("status-repo-only-json", ["--status", "--repo-only", "--json", "--no-log"]);
runCliSmoke("status-repo-only", ["--status", "--repo-only", "--plain", "--no-log"], [
  "Codex Chef status",
  "Codex CLI: skipped",
  "Installed runtime: skipped/skipped",
  "Skills: skipped",
  "Codex skipped",
  "Log disabled by --no-log"
], { timeout: 180000 });
runCliSmoke("reset-preview", ["--reset", "--plain", "--no-log"], [
  "Reset preview first",
  "--force",
  "completed: Codex Chef dry run",
  "Log disabled by --no-log"
]);
runCliSmoke("auth", ["--auth", "--plain", "--no-log"], [
  "GitHub authentication boundary",
  "does not print account-scoped re-auth",
  "organization policy",
  "git ls-remote origin HEAD"
], { forbidAnsi: true });

for (const [file, snippets] of Object.entries({
  "README.md": [
    "npm run chef",
    "npm run chef -- --status",
    "npm run chef -- --status --repo-only",
    "npm run chef -- --preview",
    "npm run chef -- --update",
    "npm run chef -- --reset --apply",
    "npm run chef -- --repair --apply",
    "npm run chef -- --install --apply",
    "npm run chef -- --skills",
    "npm run chef -- --mcp",
    "npm run chef -- --routing",
    "npm run chef -- --auth",
    "npm run chef -- --logs",
    "npm run chef -- --status --repo-only --no-log",
    "Installed skills do not execute by themselves",
    "live activation is",
    "GitHub CLI or Git Credential Manager",
    "organization policy"
  ],
  "README.tr.md": [
    "npm run chef",
    "npm run chef -- --status",
    "npm run chef -- --status --repo-only",
    "npm run chef -- --preview",
    "npm run chef -- --update",
    "npm run chef -- --reset --apply",
    "npm run chef -- --repair --apply",
    "npm run chef -- --install --apply",
    "npm run chef -- --skills",
    "npm run chef -- --mcp",
    "npm run chef -- --routing",
    "npm run chef -- --auth",
    "npm run chef -- --logs",
    "npm run chef -- --status --repo-only --no-log",
    "Kurulu skill'ler kendiliginden calismaz",
    "canli aktivasyon",
    "GitHub CLI veya Git Credential Manager",
    "kendi kurum politikaniza"
  ],
  "docs/verification.md": [
    "npm run validate:chef-cli",
    "npm run chef -- --status",
    "npm run chef -- --status --repo-only",
    "npm run chef -- --preview",
    "npm run chef -- --update",
    "Skill activation has two evidence levels"
  ],
  "docs/verification.tr.md": [
    "npm run validate:chef-cli",
    "npm run chef -- --status",
    "npm run chef -- --status --repo-only",
    "npm run chef -- --preview",
    "npm run chef -- --update",
    "Skill aktivasyonunda iki kanit seviyesi"
  ],
  "docs/install.md": [
    "npm run chef -- --update",
    "does not change managed/global files",
    "If the pull advances",
    "repo is already current",
    "does not install curated global skills"
  ],
  "docs/install.tr.md": [
    "npm run chef -- --update",
    "managed/global dosyalari degistirmez",
    "Pull repo HEAD'ini ilerletirse",
    "Repo zaten guncelse",
    "curated global skill"
  ],
  "docs/upgrade.md": [
    "npm run chef -- --update",
    "does not change managed/global files",
    "If the pull advances the repo",
    "repo is already"
  ],
  "docs/upgrade.tr.md": [
    "npm run chef -- --update",
    "managed/global dosyalari degistirmez",
    "Pull repo HEAD'ini ilerletirse",
    "Repo zaten guncelse"
  ],
  "docs/security-model.md": [
    "npm run chef -- --update",
    "repo-local CLI logs",
    "prints a fresh preview",
    "local validation before the managed refresh",
    "may backup",
    "perform unscoped",
    "delete user skills"
  ],
  "docs/security-model.tr.md": [
    "npm run chef -- --update",
    "normal repo-local CLI loglari",
    "fresh preview basar",
    "managed refresh oncesi lokal validation",
    "backup alip replace",
    "Publish, unscoped",
    "user skill silme"
  ]
})) {
  const text = read(file);
  for (const snippet of snippets) {
    if (!text.includes(snippet)) fail(`${file} missing Codex Chef CLI documentation snippet: ${snippet}`);
  }
}

runNodeCheck("scripts/validate-chef-cli.mjs");

if (failures.length > 0) {
  console.error("Codex Chef CLI validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Codex Chef CLI validation passed.");
