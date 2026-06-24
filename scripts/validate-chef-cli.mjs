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
  if (extra.forbiddenSnippets) {
    for (const snippet of extra.forbiddenSnippets) {
      if (output.includes(snippet)) fail(`chef-cli smoke ${name} must not include output snippet: ${snippet}`);
    }
  }
  if (extra.maxLines) {
    const lineCount = output.split(/\r?\n/).filter((line) => line.trim()).length;
    if (lineCount > extra.maxLines) fail(`chef-cli smoke ${name} should be <= ${extra.maxLines} non-empty lines, got ${lineCount}`);
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

function runCliSmokeRaw(name, cliArgs, extra = {}) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/chef-cli.mjs"), ...cliArgs], {
    cwd: extra.cwd || root,
    encoding: "utf8",
    input: extra.input,
    stdio: [extra.input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
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
    return { ok: false, output, stdout: result.stdout || "", stderr: result.stderr || "" };
  }
  if (result.status !== 0) {
    fail(`chef-cli smoke ${name} exited ${result.status}: ${output.trim()}`);
    return { ok: false, output, stdout: result.stdout || "", stderr: result.stderr || "" };
  }
  return { ok: true, output, stdout: result.stdout || "", stderr: result.stderr || "" };
}

function countOccurrences(value, needle) {
  return String(value || "").split(needle).length - 1;
}

function runMenuTranscriptSmoke() {
  const baseEnv = {
    CODEX_CHEF_TEST_MENU: "1",
    FORCE_COLOR: "0",
    NO_COLOR: "1"
  };
  const invalid = runCliSmokeRaw("menu-invalid-input-transcript", ["--plain", "--no-log"], {
    env: baseEnv,
    input: "\nabc\n999\nq\n",
    timeout: 30000
  });
  if (invalid.ok) {
    if (!invalid.output.includes("Operator menu")) fail("chef-cli menu transcript must render the operator menu");
    if (!invalid.output.includes("Shortcuts: l = language, q = quit")) fail("chef-cli menu transcript must show language and quit shortcuts");
    if (countOccurrences(invalid.output, "Operator menu") !== 1) {
      fail("chef-cli menu transcript must not repaint the full menu for empty or invalid input");
    }
    if (countOccurrences(invalid.output, "Choose 1-") < 3) {
      fail("chef-cli menu transcript must give compact validation for empty and invalid input");
    }
  }

  const language = runCliSmokeRaw("menu-language-toggle-transcript", ["--plain", "--no-log"], {
    env: baseEnv,
    input: "l\nq\n",
    timeout: 30000
  });
  if (language.ok) {
    for (const snippet of ["Running: Language", "Dil Turkce olarak ayarlandi", "Dil: tamam", "Operator menusu"]) {
      if (!language.output.includes(snippet)) fail(`chef-cli menu language transcript missing output snippet: ${snippet}`);
    }
  }

  const action = runCliSmokeRaw("menu-action-return-transcript", ["--plain", "--no-log"], {
    env: baseEnv,
    input: "2\n\nq\n",
    timeout: 180000
  });
  if (action.ok) {
    for (const snippet of ["Running: Repo-only status", "Press Enter to return to the menu.", "Repo-only status:"]) {
      if (!action.output.includes(snippet)) fail(`chef-cli menu action transcript missing output snippet: ${snippet}`);
    }
    if (countOccurrences(action.output, "Operator menu") !== 2) {
      fail("chef-cli menu action transcript must render one menu before action and one menu after explicit return");
    }
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

function runNpmSilentJsonSmoke(name, npmArgs, expectedPath = []) {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", "npm.cmd", "run", "--silent", ...npmArgs]
    : ["run", "--silent", ...npmArgs];
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    timeout: 180000
  });
  if (result.error) {
    fail(`npm silent JSON smoke ${name} failed: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    fail(`npm silent JSON smoke ${name} exited ${result.status}: ${(result.stdout || "")}${(result.stderr || "")}`.trim());
    return;
  }
  let parsed = null;
  try {
    parsed = JSON.parse(String(result.stdout || "").trim());
  } catch (error) {
    fail(`npm silent JSON smoke ${name} did not emit parseable JSON: ${error.message}`);
    return;
  }
  let cursor = parsed;
  for (const key of expectedPath) {
    cursor = cursor?.[key];
    if (cursor === undefined) {
      fail(`npm silent JSON smoke ${name} missing JSON path: ${expectedPath.join(".")}`);
      return;
    }
  }
}

function runBackupsFixtureSmokes() {
  const fixtureRoot = fs.mkdtempSync(path.join(root, "tmp", "chef-cli-backups-smoke-"));
  const codexHome = path.join(fixtureRoot, "codex-home");
  const agentsHome = path.join(fixtureRoot, "agents-home");
  const backupId = "codex-chef-20990101-000000";
  const backupRoot = path.join(codexHome, "backups", backupId);

  fs.mkdirSync(path.join(backupRoot, "rules"), { recursive: true });
  fs.mkdirSync(path.join(backupRoot, "agents"), { recursive: true });
  fs.writeFileSync(path.join(backupRoot, "AGENTS.md"), "# restored agents\n", "utf8");
  fs.writeFileSync(path.join(backupRoot, "config.toml"), "sandbox_mode = \"workspace-write\"\n", "utf8");
  fs.writeFileSync(path.join(backupRoot, "rules", "default.rules"), "allow [\"rg\"]\n", "utf8");
  fs.writeFileSync(path.join(backupRoot, "marketplace.json"), "{\"name\":\"codex-chef\"}\n", "utf8");

  fs.mkdirSync(path.join(codexHome, "rules"), { recursive: true });
  fs.mkdirSync(path.join(agentsHome, "plugins"), { recursive: true });
  fs.writeFileSync(path.join(codexHome, "AGENTS.md"), "# current agents\n", "utf8");
  fs.writeFileSync(path.join(codexHome, "rules", "default.rules"), "allow [\"git\", \"status\"]\n", "utf8");
  fs.writeFileSync(path.join(agentsHome, "plugins", "marketplace.json"), "{\"name\":\"current\"}\n", "utf8");

  const env = { CODEX_HOME: codexHome, AGENTS_HOME: agentsHome };
  const list = runCliSmokeRaw("backups-list-fixture", ["--backups", "--plain", "--no-log"], { env });
  if (list.ok) {
    for (const snippet of ["Codex Chef backups", backupId, "Backup root"]) {
      if (!list.output.includes(snippet)) fail(`chef-cli smoke backups-list-fixture missing output snippet: ${snippet}`);
    }
  }
  const listTr = runCliSmokeRaw("backups-list-tr-fixture", ["--backups", "--tr", "--plain", "--no-log"], { env });
  if (listTr.ok) {
    for (const snippet of ["Codex Chef yedekleri", backupId, "Yedek kok dizini", "read-only envanter"]) {
      if (!listTr.output.includes(snippet)) fail(`chef-cli smoke backups-list-tr-fixture missing output snippet: ${snippet}`);
    }
  }

  const inspect = runCliSmokeRaw("backups-inspect-fixture", ["--backups", "--backup", backupId, "--plain", "--no-log"], { env });
  if (inspect.ok) {
    for (const snippet of ["Backup archive", "AGENTS.md", "rules/default.rules", "marketplace.json"]) {
      if (!inspect.output.includes(snippet)) fail(`chef-cli smoke backups-inspect-fixture missing output snippet: ${snippet}`);
    }
  }

  const preview = runCliSmokeRaw("backups-restore-preview-fixture", ["--backups", "--backup", backupId, "--restore", "--plain", "--no-log"], { env });
  if (preview.ok) {
    for (const snippet of ["Restore preview", "No files restored", "Rerun with --apply"]) {
      if (!preview.output.includes(snippet)) fail(`chef-cli smoke backups-restore-preview-fixture missing output snippet: ${snippet}`);
    }
  }
  const previewTr = runCliSmokeRaw("backups-restore-preview-tr-fixture", ["--backups", "--backup", backupId, "--restore", "--tr", "--plain", "--no-log"], { env });
  if (previewTr.ok) {
    for (const snippet of ["Geri yukleme preview", "Dosya geri yuklenmedi", "--apply"]) {
      if (!previewTr.output.includes(snippet)) fail(`chef-cli smoke backups-restore-preview-tr-fixture missing output snippet: ${snippet}`);
    }
  }
  const currentAfterPreview = fs.readFileSync(path.join(codexHome, "AGENTS.md"), "utf8");
  if (!currentAfterPreview.includes("current agents")) {
    fail("chef-cli backup restore preview must not modify CODEX_HOME files");
  }

  const apply = runCliSmokeRaw("backups-restore-apply-fixture", ["--backups", "--backup", backupId, "--restore", "--apply", "--plain", "--no-log"], { env });
  if (apply.ok) {
    for (const snippet of ["Restore applied", "Rollback backup"]) {
      if (!apply.output.includes(snippet)) fail(`chef-cli smoke backups-restore-apply-fixture missing output snippet: ${snippet}`);
    }
  }
  const restoredAgents = fs.readFileSync(path.join(codexHome, "AGENTS.md"), "utf8");
  const restoredMarketplace = fs.readFileSync(path.join(agentsHome, "plugins", "marketplace.json"), "utf8");
  if (!restoredAgents.includes("restored agents")) {
    fail("chef-cli backup restore apply did not restore CODEX_HOME/AGENTS.md from the archive");
  }
  if (!restoredMarketplace.includes("codex-chef")) {
    fail("chef-cli backup restore apply did not restore AGENTS_HOME/plugins/marketplace.json from legacy marketplace backup");
  }
  const rollbackArchives = fs.readdirSync(path.join(codexHome, "backups"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("codex-chef-restore-"));
  if (rollbackArchives.length === 0) {
    fail("chef-cli backup restore apply must create a rollback backup before overwriting current targets");
  }

  const json = runCliSmokeRaw("backups-json-fixture", ["--backups", "--json", "--no-log"], { env });
  if (json.ok) {
    try {
      const parsed = JSON.parse(json.stdout);
      if (parsed.schemaVersion !== 1) fail("chef-cli backups JSON must include schemaVersion 1");
      if (!Array.isArray(parsed.backups) || !parsed.backups.some((backup) => backup.id === backupId)) {
        fail("chef-cli backups JSON must include fixture backup id");
      }
    } catch (error) {
      fail(`chef-cli backups JSON fixture did not emit parseable JSON: ${error.message}`);
    }
  }

  const deletePreview = runCliSmokeRaw("backups-delete-preview-fixture", ["--backups", "--backup", backupId, "--delete", "--plain", "--no-log"], { env });
  if (deletePreview.ok) {
    for (const snippet of ["Backup delete preview", "No backup archive deleted", "Rerun with --apply"]) {
      if (!deletePreview.output.includes(snippet)) fail(`chef-cli smoke backups-delete-preview-fixture missing output snippet: ${snippet}`);
    }
  }
  if (!fs.existsSync(backupRoot)) {
    fail("chef-cli backup delete preview must not remove the archive");
  }

  const deleteApply = runCliSmokeRaw("backups-delete-apply-fixture", ["--backups", "--backup", backupId, "--delete", "--apply", "--plain", "--no-log"], { env });
  if (deleteApply.ok) {
    for (const snippet of ["Backup archive deleted", backupId]) {
      if (!deleteApply.output.includes(snippet)) fail(`chef-cli smoke backups-delete-apply-fixture missing output snippet: ${snippet}`);
    }
  }
  if (fs.existsSync(backupRoot)) {
    fail("chef-cli backup delete apply must remove only the selected backup archive");
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
    "--lang",
    "--tr",
    "--verbose-plan",
    "--plain",
    "--no-log",
    "--repo-only",
    "--profile",
    "--status",
    "--doctor",
    "--preview",
    "--reset",
    "--repair",
    "--backups",
    "--backup",
    "--restore",
    "--delete",
    "--install",
    "--update",
    "--skills",
    "--mcp",
    "--routing",
    "--diagnostics",
    "--diagnose",
    "--processes",
    "--auth",
    "--logs",
    "--apply",
    "tmp/chef-cli/logs",
    "CODEX_HOME/plugins/codex-chef-workflows",
    "codex-status.mjs",
    "codex-doctor.mjs",
    "plan-install.mjs",
    "repair-install.mjs",
    "verify-install-runtime.mjs",
    "verify-skill-sources.mjs",
    "codex-routing-board.mjs",
    "runDiagnostics",
    "runProcesses",
    "processAuditPayload",
    "recentCliLogs",
    "Diagnostic evidence commands",
    "Tanilama kanit komutlari",
    "install.ps1",
    "install.sh",
    "GitHub authentication boundary",
    "GitHub kimlik dogrulama siniri",
    "CODEX_CHEF_LANG",
    "languageFromEnvironment",
    "localText",
    "printManagedRefreshSummary",
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
    "runBackups",
    "listBackupArchives",
    "resolveBackupArchive",
    "restoreBackupArchive",
    "deleteBackupArchive",
    "createRollbackBackup",
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

  for (const requiredMenuUx of [
    "printMenu",
    "printDivider",
    "printActionStart",
    "printActionEnd",
    "pauseBeforeMenu",
    "toggleLanguage",
    "Operator menu",
    "Operator menusu",
    "Press Enter to return to the menu",
    "Menuye donmek icin Enter'a basin",
    "Shortcuts: l = language, q = quit",
    "Kisayollar: l = dil, q = cikis",
    "CODEX_CHEF_TEST_MENU",
    "Language switched to English",
    "Dil Turkce olarak ayarlandi"
  ]) {
    if (!cli.includes(requiredMenuUx)) fail(`${cliPath} missing interactive menu UX surface: ${requiredMenuUx}`);
  }

  if (/update-install",\s*"\\.\\scripts\\install\.ps1",\s*\[[^\]]*"-All"/s.test(cli)) {
    fail(`${cliPath} update-install must not use -All because update is scoped to managed files, not curated skills`);
  }
  if (/update-install",\s*"scripts\/install\.sh",\s*\[[^\]]*"--all"/s.test(cli)) {
    fail(`${cliPath} update-install must not use --all because update is scoped to managed files, not curated skills`);
  }
  if (cli.includes("AGENTS_HOME/plugins/codex-chef-workflows")) {
    fail(`${cliPath} must describe the Codex Chef plugin target under CODEX_HOME, not AGENTS_HOME`);
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
    "Backups",
    "Skills",
    "MCP",
    "Routing",
    "Diagnostics",
    "Processes",
    "Auth",
    "Logs",
    "Language",
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
  "chef:backups": "node scripts/chef-cli.mjs --backups",
  "chef:diagnostics": "node scripts/chef-cli.mjs --diagnostics",
  "chef:processes": "node scripts/chef-cli.mjs --processes",
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
  "--backups [--backup ID] [--restore|--delete --apply]",
  "--diagnostics",
  "--processes",
  "--lang tr",
  "--tr",
  "--verbose-plan",
  "Allow write actions for update",
  "--reset [--apply]",
  "tmp/chef-cli/logs"
], { forbidAnsi: true });
runCliSmoke("help-tr", ["--help", "--lang", "tr", "--plain", "--no-log"], [
  "Codex Chef CLI",
  "Kullanim:",
  "Secenekler:",
  "--diagnostics",
  "--processes",
  "--lang tr",
  "--verbose-plan",
  "tmp/chef-cli/logs"
], { forbidAnsi: true });
runCliSmoke("help-tr-alias", ["--help", "--tr", "--plain", "--no-log"], [
  "Kullanim:",
  "Secenekler:",
  "Guncelle"
], { forbidAnsi: true });
runCliSmoke("help-tr-env", ["--help", "--plain", "--no-log"], [
  "Kullanim:",
  "Secenekler:"
], {
  env: {
    CODEX_CHEF_LANG: "tr"
  },
  forbidAnsi: true
});
runMenuTranscriptSmoke();
runBackupsFixtureSmokes();
runCliErrorSmoke("unknown-option", ["--bad-flag", "--plain", "--no-log"], [
  "Codex Chef CLI error: Unknown option --bad-flag",
  "npm run chef -- --help"
]);
runCliErrorSmoke("unknown-option-tr", ["--bad-flag", "--tr", "--plain", "--no-log"], [
  "Codex Chef CLI hatasi: Bilinmeyen secenek --bad-flag",
  "npm run chef -- --help"
]);
runCliErrorSmoke("missing-lang-value", ["--lang", "--plain", "--no-log"], [
  "Codex Chef CLI error:",
  "--lang requires"
]);
runCliErrorSmoke("unsupported-lang", ["--lang", "de", "--plain", "--no-log"], [
  "Codex Chef CLI error:",
  "Supported languages"
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
runCliSmoke("mcp-tr", ["--mcp", "--tr", "--plain", "--no-log"], [
  "MCP server'lari: 15",
  "Kimlik bilgisi veya ek girdi gerekmez.",
  "Ilk calismada npm/npx ag erisimi gerekir",
  "GitHub/Copilot hesap yetkilendirmesi gerekir",
  "Auth isteyen hesap, database ve genis filesystem MCP connector'lari varsayilan olarak kapali kalir."
], {
  forbidAnsi: true,
  forbiddenSnippets: [
    "No credential or extra input is required.",
    "Requires npm/npx network access on first startup",
    "Requires GitHub/Copilot account authorization"
  ]
});
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
  "Lifecycle hygiene",
  "Agent plan",
  "Skill selected",
  "MCP selected",
  "Surfaces used",
  "Use /agent in Codex CLI"
]);
runCliSmoke("diagnostics", ["--diagnostics", "--plain", "--no-log"], [
  "Codex Chef diagnostics",
  "Current health",
  "Next safe actions",
  "Diagnostic evidence commands",
  "npm run chef -- --status --repo-only --no-log",
  "npm run chef -- --update --no-log",
  "npm run chef -- --repair --no-log",
  "npm run chef -- --logs --no-log",
  "npm run chef -- --processes --no-log",
  "npm run verify:install:runtime -- --expect-skills --redact-paths",
  "Serena/MCP process audit",
  "Historical log signal scan",
  "These counts are historical log evidence",
  "Recent historical log signals",
  "Recent CLI logs",
  "Log root"
], { forbidAnsi: true });
runCliSmoke("diagnostics-tr", ["--diagnostics", "--tr", "--plain", "--no-log"], [
  "Codex Chef tanilama",
  "Canli saglik",
  "Sonraki guvenli adimlar",
  "Tanilama kanit komutlari",
  "npm run chef -- --status --repo-only --no-log",
  "npm run chef -- --update --no-log",
  "npm run chef -- --repair --no-log",
  "npm run chef -- --logs --no-log",
  "npm run chef -- --processes --no-log",
  "npm run verify:install:runtime -- --expect-skills --redact-paths",
  "Serena/MCP surec denetimi",
  "Gecmis log sinyal taramasi",
  "Bu sayilar gecmis log kanitidir",
  "Son gecmis log sinyalleri",
  "Son CLI loglari",
  "Log kok dizini"
], { forbidAnsi: true });
runCliJsonSmoke("diagnostics-json", ["--diagnostics", "--json", "--no-log"]);
runNpmSilentJsonSmoke("diagnostics-npm-silent-json", ["chef", "--", "--diagnostics", "--json", "--no-log"], ["status", "overall"]);
runCliSmoke("processes", ["--processes", "--plain", "--no-log"], [
  "Codex Chef process audit",
  "read-only count",
  "Total matching processes",
  "Tunnel processes",
  "MCP/runtime processes",
  "No process is stopped"
], { forbidAnsi: true });
runCliSmoke("processes-tr", ["--processes", "--tr", "--plain", "--no-log"], [
  "Codex Chef surec denetimi",
  "read-only sayim",
  "Eslesen toplam surec",
  "Tunel surecleri",
  "MCP/runtime surecleri",
  "hicbir surec durdurulmaz"
], { forbidAnsi: true });
runCliJsonSmoke("processes-json", ["--processes", "--json", "--no-log"]);
runNpmSilentJsonSmoke("status-npm-silent-json", ["chef", "--", "--status", "--repo-only", "--json", "--no-log"], ["cliQuickStart", "readOnlyCommands"]);
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
  "excludes curated global skill installs",
  "Would affect",
  "Full evidence"
], {
  forbiddenSnippets: ["What if:"],
  maxLines: 80
});
runCliSmoke("update-preview-tr", ["--update", "--tr", "--plain", "--no-log"], [
  "Guncelleme preview",
  "Managed veya global dosya degismedi",
  "npm run chef -- --update --apply",
  "Etkilenecek alanlar",
  "Tam kanit"
], {
  forbiddenSnippets: ["What if:"],
  maxLines: 80
});
runCliSmoke("update-preview-verbose", ["--update", "--verbose-plan", "--plain", "--no-log"], [
  "Update preview",
  "npm run chef -- --update --apply",
  "--force"
]);
runCliJsonSmoke("status-repo-only-json", ["--status", "--repo-only", "--json", "--no-log"]);
runCliJsonSmoke("status-repo-only-json-tr", ["--status", "--repo-only", "--json", "--lang", "tr", "--no-log"]);
runCliSmoke("status-repo-only", ["--status", "--repo-only", "--plain", "--no-log"], [
  "Codex Chef status",
  "Codex CLI: skipped",
  "MCP probe skipped",
  "Installed runtime: skipped by this mode",
  "Skills: skipped",
  "MCP quick view:",
  "managed hooks=not inspected",
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
runCliSmoke("auth-tr", ["--auth", "--tr", "--plain", "--no-log"], [
  "GitHub kimlik dogrulama siniri",
  "token",
  "kurum politikaniza",
  "git ls-remote origin HEAD"
], { forbidAnsi: true });

for (const [file, snippets] of Object.entries({
  "README.md": [
    "npm run chef",
    "npm run chef -- --status",
    "npm run chef -- --status --repo-only",
    "npm run chef -- --preview",
    "npm run chef -- --update",
    "npm run chef -- --backups",
    "npm run chef:backups",
    "npm run chef -- --backups --backup <id> --delete",
    "npm run chef -- --reset --apply",
    "npm run chef -- --repair --apply",
    "npm run chef -- --install --apply",
    "npm run chef -- --skills",
    "npm run chef -- --mcp",
    "npm run chef -- --routing",
    "npm run chef -- --diagnostics",
    "npm run chef -- --processes",
    "npm run chef -- --auth",
    "npm run chef -- --logs",
    "npm run chef -- --help --lang tr",
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --status --repo-only --no-log",
    "completed agent threads",
    "Serena/MCP process-audit",
    "/agent",
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
    "npm run chef -- --backups",
    "npm run chef:backups",
    "npm run chef -- --backups --backup <id> --delete",
    "npm run chef -- --reset --apply",
    "npm run chef -- --repair --apply",
    "npm run chef -- --install --apply",
    "npm run chef -- --skills",
    "npm run chef -- --mcp",
    "npm run chef -- --routing",
    "npm run chef -- --diagnostics",
    "npm run chef -- --processes",
    "npm run chef -- --auth",
    "npm run chef -- --logs",
    "npm run chef -- --help --lang tr",
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --status --repo-only --no-log",
    "tamamlanan agent thread",
    "Serena/MCP surec",
    "/agent",
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
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --backups",
    "npm run chef -- --diagnostics",
    "npm run chef -- --processes",
    "backup delete",
    "backup archive",
    "Skill activation has two evidence levels"
  ],
  "docs/verification.tr.md": [
    "npm run validate:chef-cli",
    "npm run chef -- --status",
    "npm run chef -- --status --repo-only",
    "npm run chef -- --preview",
    "npm run chef -- --update",
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --backups",
    "npm run chef -- --diagnostics",
    "npm run chef -- --processes",
    "backup delete",
    "backup archive",
    "Skill aktivasyonunda iki kanit seviyesi"
  ],
  "docs/install.md": [
    "npm run chef -- --update",
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --backups",
    "does not change managed/global files",
    "If the pull advances",
    "repo is already current",
    "does not install curated global skills"
  ],
  "docs/install.tr.md": [
    "npm run chef -- --update",
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --backups",
    "managed/global dosyalari degistirmez",
    "Pull repo HEAD'ini ilerletirse",
    "Repo zaten guncelse",
    "curated global skill"
  ],
  "docs/upgrade.md": [
    "npm run chef -- --update",
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --backups",
    "does not change managed/global files",
    "If the pull advances the repo",
    "repo is already"
  ],
  "docs/upgrade.tr.md": [
    "npm run chef -- --update",
    "npm run chef -- --update --verbose-plan",
    "npm run chef -- --backups",
    "managed/global dosyalari degistirmez",
    "Pull repo HEAD'ini ilerletirse",
    "Repo zaten guncelse"
  ],
  "docs/security-model.md": [
    "npm run chef -- --update",
    "npm run chef -- --backups",
    "repo-local CLI logs",
    "prints a fresh preview",
    "local validation before the managed refresh",
    "may backup",
    "perform unscoped",
    "delete user skills"
  ],
  "docs/security-model.tr.md": [
    "npm run chef -- --update",
    "npm run chef -- --backups",
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
