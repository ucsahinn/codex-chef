#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
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

function normalizeLanguage(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (["tr", "tr-tr", "turkish"].includes(normalized)) return "tr";
  if (["en", "en-us", "en-gb", "english"].includes(normalized)) return "en";
  return null;
}

function languageFromEnvironment() {
  return normalizeLanguage(process.env.CODEX_CHEF_LANG || process.env.CHEF_LANG) || "en";
}

function languageFromArgs(argv, fallback) {
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--tr") return "tr";
    if (arg === "--lang") {
      const value = argv[index + 1];
      const parsed = value && !value.startsWith("--") ? normalizeLanguage(value) : null;
      if (parsed) return parsed;
    }
  }
  return fallback;
}

const options = {
  help: false,
  json: false,
  plain: false,
  noLog: false,
  repoOnly: false,
  apply: false,
  restore: false,
  deleteBackup: false,
  verbosePlan: false,
  lang: languageFromArgs(args, languageFromEnvironment()),
  action: null,
  backupId: null,
  profile: null
};

function isTr() {
  return options.lang === "tr";
}

function localText(en, tr) {
  return isTr() ? tr : en;
}

function cliError(en, tr = en) {
  const prefix = isTr() ? "Codex Chef CLI hatasi" : "Codex Chef CLI error";
  console.error(`${prefix}: ${localText(en, tr)}`);
  process.exit(2);
}

const ACTION_FLAGS = new Map([
  ["--status", "status"],
  ["--doctor", "doctor"],
  ["--preview", "preview"],
  ["--update", "update"],
  ["--reset", "reset"],
  ["--repair", "repair"],
  ["--backups", "backups"],
  ["--install", "install"],
  ["--skills", "skills"],
  ["--mcp", "mcp"],
  ["--routing", "routing"],
  ["--diagnostics", "diagnostics"],
  ["--diagnose", "diagnostics"],
  ["--processes", "processes"],
  ["--auth", "auth"],
  ["--logs", "logs"]
]);

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--help" || arg === "-h") options.help = true;
  else if (arg === "--json") options.json = true;
  else if (arg === "--lang") {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      cliError("--lang requires a language code (en or tr). Run npm run chef -- --help for supported commands.", "--lang dil kodu ister (en veya tr). Desteklenen komutlar icin npm run chef -- --help calistirin.");
    }
    const parsed = normalizeLanguage(value);
    if (!parsed) {
      cliError(`Unsupported language ${value}. Supported languages: en, tr.`, `Desteklenmeyen dil ${value}. Desteklenen diller: en, tr.`);
    }
    options.lang = parsed;
    index += 1;
  }
  else if (arg === "--tr") options.lang = "tr";
  else if (arg === "--plain") options.plain = true;
  else if (arg === "--no-log") options.noLog = true;
  else if (arg === "--repo-only") options.repoOnly = true;
  else if (arg === "--apply") options.apply = true;
  else if (arg === "--restore") options.restore = true;
  else if (arg === "--delete") options.deleteBackup = true;
  else if (arg === "--verbose-plan") options.verbosePlan = true;
  else if (arg === "--backup") {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      cliError("--backup requires a backup id. Run npm run chef -- --backups to list available backups.", "--backup bir yedek id'si ister. Uygun yedekleri listelemek icin npm run chef -- --backups calistirin.");
    }
    options.backupId = value;
    index += 1;
  }
  else if (arg === "--profile") {
    options.profile = args[index + 1] || null;
    index += 1;
  }
  else if (ACTION_FLAGS.has(arg)) options.action = ACTION_FLAGS.get(arg);
  else {
    cliError(`Unknown option ${arg}. Run npm run chef -- --help for supported commands.`, `Bilinmeyen secenek ${arg}. Desteklenen komutlar icin npm run chef -- --help calistirin.`);
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

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

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

function stripAnsi(value) {
  return String(value).replace(ANSI_PATTERN, "");
}

function visualLength(value) {
  return stripAnsi(value).length;
}

function padVisual(value, width) {
  const text = String(value);
  const missing = width - visualLength(text);
  return missing > 0 ? `${text}${" ".repeat(missing)}` : text;
}

function truncateVisual(value, width) {
  const text = String(value ?? "");
  if (visualLength(text) <= width) return text;
  if (width <= 3) return ".".repeat(Math.max(1, width));
  const plain = stripAnsi(text);
  return `${plain.slice(0, Math.max(0, width - 3))}...`;
}

function terminalWidth() {
  return Math.max(72, Math.min(120, Number(process.stdout.columns || 96)));
}

function divider(title = "") {
  const width = terminalWidth();
  if (!title) return colorize("-".repeat(width), "dim");
  const text = ` ${title} `;
  const side = Math.max(3, Math.floor((width - visualLength(text)) / 2));
  const line = `${"-".repeat(side)}${text}${"-".repeat(Math.max(3, width - side - visualLength(text)))}`;
  return colorize(line, "dim");
}

function printDivider(title = "") {
  console.log(divider(title));
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
    id: "backups",
    label: "Backups",
    writes: "none/global with --restore --apply",
    description: "List, inspect, or restore Codex Chef backup archives."
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
    id: "diagnostics",
    label: "Diagnostics",
    writes: "none",
    description: "Show read-only evidence commands, log locations, backups, and lifecycle cleanup notes."
  },
  {
    id: "processes",
    label: "Processes",
    writes: "none",
    description: "Read-only Serena, MCP, browser, Python, and Node process count."
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
    id: "language",
    label: "Language",
    writes: "none",
    description: "Switch the interactive CLI between English and Turkish."
  },
  {
    id: "exit",
    label: "Exit",
    writes: "none",
    description: "Close the menu."
  }
];

const MENU_TEXT_TR = {
  status: {
    label: "Durum",
    description: "Read-only kurulu runtime ve repo durum panosu.",
    writes: "yok"
  },
  "status:repo-only": {
    label: "Sadece repo durumu",
    description: "Kurulu runtime veya Codex CLI probu olmadan hizli lokal repo kontrolleri.",
    writes: "yok"
  },
  doctor: {
    label: "Doctor",
    description: "Repo doctor ve tam kurulu runtime beklentileri.",
    writes: "yok"
  },
  preview: {
    label: "On izleme",
    description: "Yazmasiz kurulum plani ve PowerShell/Bash dry run.",
    writes: "yok"
  },
  update: {
    label: "Guncelle",
    description: "Git fast-forward ve yedekli managed refresh on izlemesi ya da apply.",
    writes: "repo/global/ag"
  },
  install: {
    label: "Kur",
    description: "Tam kurulum. --apply veya onay ister.",
    writes: "global/ag"
  },
  reset: {
    label: "Reset",
    description: "Yedekli managed refresh/reinstall. --apply veya onay ister.",
    writes: "global/ag"
  },
  repair: {
    label: "Onar",
    description: "Yedekten sonra managed drift onarimi. --apply veya onay ister.",
    writes: "global"
  },
  backups: {
    label: "Yedekler",
    description: "Codex Chef yedek arsivlerini listele, incele veya geri yukle.",
    writes: "yok / --restore --apply ile global"
  },
  skills: {
    label: "Skill'ler",
    description: "Curated skill katalogunu goster ve kaynaklari dogrula.",
    writes: "ag opsiyonel"
  },
  mcp: {
    label: "MCP",
    description: "MCP varsayilanlari, kapali hesap connector'lari ve setup notlari.",
    writes: "yok / hesap rehberi"
  },
  routing: {
    label: "Yonlendirme",
    description: "Gorev tipi routing, agent bekleme politikalari, skill ve MCP kontrati.",
    writes: "yok"
  },
  diagnostics: {
    label: "Tanilama",
    description: "Read-only kanit komutlari, log konumlari, yedekler ve lifecycle temizlik notlari.",
    writes: "yok"
  },
  processes: {
    label: "Surecler",
    description: "Read-only Serena, MCP, browser, Python ve Node surec sayimi.",
    writes: "yok"
  },
  auth: {
    label: "Auth",
    description: "Public-safe GitHub auth sinirlari ve dogrulama notlari.",
    writes: "yok / hesap rehberi"
  },
  logs: {
    label: "Loglar",
    description: "Son Codex Chef CLI log dosyalarini listele.",
    writes: "yok"
  },
  language: {
    label: "Dil",
    description: "Interaktif CLI dilini Turkce ve Ingilizce arasinda degistir.",
    writes: "yok"
  },
  exit: {
    label: "Cikis",
    description: "Menuyu kapat.",
    writes: "yok"
  }
};

function menuLabel(item) {
  return isTr() ? MENU_TEXT_TR[item.id]?.label || item.label : item.label;
}

function menuDescription(item) {
  return isTr() ? MENU_TEXT_TR[item.id]?.description || item.description : item.description;
}

function menuWrites(item) {
  return isTr() ? MENU_TEXT_TR[item.id]?.writes || item.writes : item.writes;
}

function printHelp() {
  if (isTr()) {
    console.log(`${colorize("Codex Chef CLI", "cyan")}

Kullanim:
  npm run chef
  npm run chef -- --status
  npm run chef -- --doctor
  npm run chef -- --preview
  npm run chef -- --update [--apply]
  npm run chef -- --update --verbose-plan
  npm run chef -- --status --repo-only
  npm run chef -- --reset [--apply]
  npm run chef -- --repair [--apply]
  npm run chef -- --backups [--backup ID] [--restore|--delete --apply]
  npm run chef -- --install [--apply]
  npm run chef -- --skills
  npm run chef -- --mcp
  npm run chef -- --routing
  npm run chef -- --routing --profile starter-health
  npm run chef -- --diagnostics
  npm run chef -- --processes
  npm run chef -- --auth
  npm run chef -- --logs

Secenekler:
  --json          Desteklenen yerlerde JSON cikti verir
  --lang tr      Operator metinlerini Turkce yapar (en veya tr)
  --tr           --lang tr kisa yolu
  --plain        Ikon yerine ASCII etiketleri kullanir
  --no-log       Siki audit icin repo-local CLI log dosyasi olusturmaz
  --repo-only    Status icin kurulu runtime, global skill kokleri, Codex loglari ve Codex CLI problarini atlar
  --profile ID   --routing ile tek routing profilini gosterir
  --diagnose     --diagnostics kisa yolu
  --backup ID    Belirli Codex Chef yedek arsivini inceler veya geri yukler
  --restore      --backup ID icin geri yukleme preview'i; dosya kopyalamak icin --apply ekle
  --delete       --backup ID icin silme preview'i; arsivi silmek icin --apply ekle
  --verbose-plan --update preview'de tam install dry-run kanitini basar
  --apply        Update, install, reset, repair veya secili skill install icin write action izni verir
  --help         Bu yardimi gosterir

Aksiyonlar:
  Durum, Doctor, On izleme, Guncelle, Kur, Reset, Onar, Yedekler, Skill'ler, MCP, Yonlendirme, Tanilama, Surecler, Auth, Loglar

Loglar:
  tmp/chef-cli/logs
`);
    return;
  }
  console.log(`${colorize("Codex Chef CLI", "cyan")}

Usage:
  npm run chef
  npm run chef -- --status
  npm run chef -- --doctor
  npm run chef -- --preview
  npm run chef -- --update [--apply]
  npm run chef -- --update --verbose-plan
  npm run chef -- --status --repo-only
  npm run chef -- --reset [--apply]
  npm run chef -- --repair [--apply]
  npm run chef -- --backups [--backup ID] [--restore|--delete --apply]
  npm run chef -- --install [--apply]
  npm run chef -- --skills
  npm run chef -- --mcp
  npm run chef -- --routing
  npm run chef -- --routing --profile starter-health
  npm run chef -- --diagnostics
  npm run chef -- --processes
  npm run chef -- --auth
  npm run chef -- --logs

Options:
  --json          Emit JSON where supported
  --lang tr      Localize operator-facing wrapper text (en or tr)
  --tr           Shortcut for --lang tr
  --plain        Use ASCII labels instead of icons
  --no-log       Do not create repo-local CLI log files for strict audits
  --repo-only    Skip installed runtime, global skill roots, Codex logs, and Codex CLI probes for status
  --profile ID   Show one routing profile when used with --routing
  --diagnose     Alias for --diagnostics
  --backup ID    Inspect or restore a specific Codex Chef backup archive
  --restore      Preview restore for --backup ID; add --apply to copy files back
  --delete       Preview deletion for --backup ID; add --apply to remove the archive
  --verbose-plan Print the full install dry-run evidence for --update previews
  --apply        Allow write actions for update, install, reset, repair, or selected skill install
  --help         Show this help

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
    console.log(`${ICONS.warn} ${localText(`${action} is a write action. Re-run with --apply to execute it.`, `${action} write action'dir. Calistirmak icin --apply ile tekrar deneyin.`)}`);
    return false;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${ICONS.warn} ${detail} ${localText("Type APPLY to continue:", "Devam etmek icin APPLY yazin:")} `);
  rl.close();
  return answer.trim() === "APPLY";
}

function printHeader() {
  printDivider("Codex Chef");
  console.log(`${ICONS.chef} Codex Chef`);
  console.log(styleMuted(localText(
    "One menu for install, update, repair, diagnostics, skills, MCP notes, auth, and logs.",
    "Kurulum, guncelleme, onarim, diagnostic, skill, MCP notlari, auth ve loglar icin tek menu."
  )));
  console.log(styleMuted(localText(
    `Language: English | Safety: write actions require --apply or typed confirmation.`,
    `Dil: Turkce | Guvenlik: yazan islemler --apply veya yazili onay ister.`
  )));
  console.log("");
}

function printMenu() {
  printDivider(localText("Operator menu", "Operator menusu"));
  const numberWidth = String(MENU_ITEMS.length).length + 1;
  const labelWidth = Math.max(...MENU_ITEMS.map((item) => menuLabel(item).length), localText("Action", "Islem").length);
  const writesWidth = Math.max(
    ...MENU_ITEMS.map((item) => menuWrites(item).length),
    localText("Writes", "Yazar").length
  );
  const header = [
    padVisual(styleMuted("#"), numberWidth),
    padVisual(styleMuted(localText("Action", "Islem")), labelWidth),
    padVisual(styleMuted(localText("Writes", "Yazar")), writesWidth),
    styleMuted(localText("Purpose", "Amac"))
  ].join("  ");
  console.log(header);
  console.log(styleMuted("-".repeat(Math.min(terminalWidth(), visualLength(stripAnsi(header))))));
  for (let index = 0; index < MENU_ITEMS.length; index += 1) {
    const item = MENU_ITEMS[index];
    const number = padVisual(`${index + 1}.`, numberWidth);
    const labelText = menuLabel(item);
    const labelColor = item.id === "exit" ? "dim" : item.id === "language" ? "magenta" : "cyan";
    const label = padVisual(colorize(labelText, labelColor), labelWidth);
    const writes = padVisual(styleWriteBoundary(menuWrites(item)), writesWidth);
    console.log(`${number}  ${label}  ${writes}  ${styleMuted(menuDescription(item))}`);
  }
  console.log("");
  console.log(styleMuted(localText(
    "Shortcuts: l = language, q = quit. Empty input repeats this prompt without repainting the menu.",
    "Kisayollar: l = dil, q = cikis. Bos giris menuyu yeniden basmadan promptu tekrarlar."
  )));
}

function printActionStart(item) {
  const label = menuLabel(item) || item.label || item.id;
  console.log("");
  printDivider(localText(`Running: ${label}`, `Calisiyor: ${label}`));
}

function printActionEnd(item, result) {
  const label = menuLabel(item) || item.label || item.id;
  const status = result?.ok === false && !result.skipped
    ? localText("attention", "dikkat")
    : localText("done", "tamam");
  printDivider(localText(`${label}: ${status}`, `${label}: ${status}`));
}

async function pauseBeforeMenu(question) {
  await question(`\n${styleMuted(localText("Press Enter to return to the menu.", "Menuye donmek icin Enter'a basin."))} `);
  console.log("");
}

function toggleLanguage() {
  options.lang = isTr() ? "en" : "tr";
  console.log(`${ICONS.ok} ${localText("Language switched to English.", "Dil Turkce olarak ayarlandi.")}`);
  return { ok: true };
}

function runStatus(overrides = {}) {
  const repoOnly = Boolean(overrides.repoOnly || options.repoOnly);
  return runNode(repoOnly ? "status-repo-only" : "status", "scripts/codex-status.mjs", [
    "--redact-paths",
    ...(repoOnly ? ["--skip-runtime", "--skip-codex-doctor-checks", "--skip-codex-cli"] : []),
    ...(options.json ? ["--json"] : [])
  ], {
    waitNote: repoOnly
      ? localText(
          "Collecting local repo checks only; installed runtime, global skill roots, Codex logs, and Codex CLI probes are skipped.",
          "Yalnizca lokal repo kontrolleri toplaniyor; kurulu runtime, global skill kokleri, Codex loglari ve Codex CLI problari atlandi."
        )
      : localText(
          "Collecting Codex runtime, MCP, Git, and log metadata checks; this can take 30-60 seconds.",
          "Codex runtime, MCP, Git ve log metadata kontrolleri toplaniyor; 30-60 saniye surebilir."
        )
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
  console.log(`${ICONS.info} ${localText("Running local validation before managed refresh.", "Managed refresh oncesi lokal validation calisiyor.")}`);
  const validate = runPackageScript("update-validate", "validate", {
    timeout: 300000,
    waitNote: localText(
      "Checking repository structure before global managed files are refreshed.",
      "Global managed dosyalar yenilenmeden once repo yapisi kontrol ediliyor."
    )
  });
  if (!validate.ok) return validate;
  return runPackageScript("update-security-audit", "audit:security", {
    timeout: 300000,
    waitNote: localText(
      "Checking tracked release/security surfaces before global managed files are refreshed.",
      "Global managed dosyalar yenilenmeden once release/security yuzeyleri kontrol ediliyor."
    )
  });
}

const MANAGED_REFRESH_TARGETS = [
  "CODEX_HOME/AGENTS.md",
  "CODEX_HOME/config.toml",
  "CODEX_HOME/rules/default.rules",
  "CODEX_HOME/*.config.toml profiles",
  "CODEX_HOME/agents/*.toml role files",
  "AGENTS_HOME/plugins/codex-chef-workflows",
  "AGENTS_HOME/plugins/marketplace.json"
];

function printManagedRefreshSummary() {
  console.log("");
  console.log(styleHeading(localText("Would affect", "Etkilenecek alanlar")));
  for (const target of MANAGED_REFRESH_TARGETS) console.log(`- ${target}`);
  console.log(styleMuted(localText(
    "Apply backs up replaced managed files first; it does not delete, prune, or clean user data.",
    "Apply once degisecek managed dosyalari yedekler; user data silmez, prune/clean yapmaz."
  )));
  console.log(styleMuted(localText(
    "Update excludes curated global skill installs and optional global Git guards; use --install or --skills for those explicit surfaces.",
    "Update curated global skill kurulumlarini ve opsiyonel global Git guard'larini disarida tutar; bu yuzeyler icin --install veya --skills kullanin."
  )));
  console.log("");
  console.log(styleHeading(localText("Next", "Sonraki adim")));
  console.log(`- ${localText("Apply after review", "Incelemeden sonra uygula")}: npm run chef -- --update --apply`);
  console.log(`- ${localText("Full evidence", "Tam kanit")}: npm run chef -- --update --verbose-plan`);
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
    console.log(`${ICONS.update} ${localText("Update preview", "Guncelleme preview")}`);
    console.log("");
    console.log(styleHeading(localText("Result", "Sonuc")));
    console.log(`${ICONS.ok} ${localText("No managed or global files changed.", "Managed veya global dosya degismedi.")}`);
    console.log(styleMuted(localText(
      "Use apply only after reviewing the target list and backup behavior.",
      "Apply'i yalniz hedef listesini ve yedek davranisini inceledikten sonra kullanin."
    )));
    printManagedRefreshSummary();
    if (options.verbosePlan) return runPreview(true, false);
    return { ok: true };
  }
  const dirty = inspectGitDirty();
  if (!dirty.ok) {
    console.log(`${ICONS.warn} ${localText(`Cannot inspect Git worktree: ${dirty.message}`, `Git worktree incelenemedi: ${dirty.message}`)}`);
    if (dirty.output.trim()) process.stdout.write(dirty.output.endsWith("\n") ? dirty.output : `${dirty.output}\n`);
    return { ok: false };
  }
  if (dirty.dirty) {
    console.log(`${ICONS.warn} ${localText("Update apply requires a clean worktree so local edits are not overwritten.", "Update apply lokal editlerin ustune yazmamak icin temiz worktree ister.")}`);
    process.stdout.write(dirty.output.endsWith("\n") ? dirty.output : `${dirty.output}\n`);
    console.log(`${ICONS.info} ${localText("Commit, stash, or move local changes, then rerun npm run chef -- --update --apply.", "Lokal degisiklikleri commit/stash/move yapin, sonra npm run chef -- --update --apply tekrar calistirin.")}`);
    return { ok: false };
  }
  const beforeHead = gitHead();
  if (!beforeHead.ok) {
    console.log(`${ICONS.warn} ${localText(`Cannot inspect current Git HEAD: ${beforeHead.message}`, `Gecerli Git HEAD incelenemedi: ${beforeHead.message}`)}`);
    return { ok: false };
  }
  const allowed = await confirmWriteAction(
    localText("Update", "Guncelleme"),
    localText(
      "Update pulls latest Codex Chef changes with git pull --ff-only, then refreshes managed Codex files after a same-tree preview.",
      "Guncelleme git pull --ff-only ile son Codex Chef degisikliklerini ceker, sonra ayni agac preview'inden sonra managed Codex dosyalarini yeniler."
    )
  );
  if (!allowed) return { ok: false, skipped: true };
  const pull = runLoggedCommand("update-pull", "git", ["pull", "--ff-only"], {
    timeout: 300000,
    waitNote: "Fetching and fast-forwarding the Codex Chef repository."
  });
  if (!pull.ok) return pull;
  const afterHead = gitHead();
  if (!afterHead.ok) {
    console.log(`${ICONS.warn} ${localText(`Cannot inspect updated Git HEAD: ${afterHead.message}`, `Guncel Git HEAD incelenemedi: ${afterHead.message}`)}`);
    return { ok: false };
  }
  if (beforeHead.value !== afterHead.value) {
    console.log(`${ICONS.update} ${localText(`Repository updated from ${beforeHead.value.slice(0, 7)} to ${afterHead.value.slice(0, 7)}.`, `Repo ${beforeHead.value.slice(0, 7)} -> ${afterHead.value.slice(0, 7)} guncellendi.`)}`);
    console.log(`${ICONS.info} ${localText("Running a fresh preview from the updated tree. Review it, then rerun npm run chef -- --update --apply to refresh managed files.", "Guncel agactan fresh preview basiliyor. Inceleyip managed dosyalari yenilemek icin npm run chef -- --update --apply tekrar calistirin.")}`);
    const preview = runPreview(true, false);
    if (!preview.ok) return preview;
    return { ok: true, skipped: true };
  }
  console.log(`${ICONS.ok} ${localText("Repository already up to date; applying the reviewed managed refresh.", "Repo zaten guncel; incelenmis managed refresh uygulaniyor.")}`);
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

const BACKUP_MANIFEST_NAME = ".codex-chef-backup.json";
const BACKUP_ID_PATTERN = /^codex-chef-[A-Za-z0-9._-]+$/;

function codexHome() {
  return path.resolve(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"));
}

function agentsHome() {
  return path.resolve(process.env.AGENTS_HOME || path.join(os.homedir(), ".agents"));
}

function backupRootPath() {
  return path.join(codexHome(), "backups");
}

function compactTimestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("") + "-" + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function isInside(child, parent) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function safeRealpath(filePath) {
  try {
    return fs.realpathSync.native(filePath);
  } catch {
    return path.resolve(filePath);
  }
}

function assertInside(child, parent, label) {
  const childPath = path.resolve(child);
  const parentPath = path.resolve(parent);
  if (!isInside(childPath, parentPath)) {
    throw new Error(`Refusing ${label} outside expected root: ${redactLocalPaths(childPath)}`);
  }
}

function validateBackupId(id) {
  if (!id || !BACKUP_ID_PATTERN.test(id) || id.includes("/") || id.includes("\\")) {
    throw new Error(`Invalid backup id: ${id || "<missing>"}`);
  }
}

function validateArchiveRelativePath(relativePath) {
  if (!relativePath || relativePath.includes("\0")) return false;
  if (path.isAbsolute(relativePath) || path.win32.isAbsolute(relativePath) || path.posix.isAbsolute(relativePath)) return false;
  if (/^[A-Za-z]:/.test(relativePath) || relativePath.startsWith("\\\\") || relativePath.startsWith("//")) return false;
  const normalized = relativePath.replaceAll("\\", "/");
  if (normalized.startsWith("../") || normalized.includes("/../") || normalized.endsWith("/..")) return false;
  const parts = normalized.split("/").filter(Boolean);
  if (parts.some((part) => part === "." || part === "..")) return false;
  if (parts.some((part) => /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) return false;
  return true;
}

function hashFile(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function readBackupManifest(archivePath) {
  const manifestPath = path.join(archivePath, BACKUP_MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    return { invalid: true, error: error.message };
  }
}

function listArchiveFiles(archivePath, includeHashes = false) {
  const files = [];
  const issues = [];
  const archiveReal = safeRealpath(archivePath);

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      const relative = toPosix(path.relative(archivePath, fullPath));
      if (relative === BACKUP_MANIFEST_NAME) continue;
      if (!validateArchiveRelativePath(relative)) {
        issues.push(`Rejected unsafe backup path: ${relative}`);
        continue;
      }
      const stat = fs.lstatSync(fullPath);
      const real = safeRealpath(fullPath);
      if (!isInside(real, archiveReal)) {
        issues.push(`Rejected backup path escaping archive root: ${relative}`);
        continue;
      }
      if (stat.isSymbolicLink()) {
        issues.push(`Rejected symlink in backup archive: ${relative}`);
        continue;
      }
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile()) {
        files.push({
          relative,
          path: fullPath,
          size: stat.size,
          sha256: includeHashes ? hashFile(fullPath) : undefined
        });
      }
    }
  }

  walk(archivePath);
  files.sort((a, b) => a.relative.localeCompare(b.relative));
  return { files, issues };
}

function mapBackupRelativeToTarget(relative) {
  const normalized = relative.replaceAll("\\", "/");
  const ch = codexHome();
  const ah = agentsHome();
  if (normalized.startsWith("codex/")) {
    return path.join(ch, ...normalized.slice("codex/".length).split("/"));
  }
  if (normalized.startsWith("agents/plugins/")) {
    return path.join(ah, ...normalized.slice("agents/".length).split("/"));
  }
  if (normalized === "marketplace.json") {
    return path.join(ah, "plugins", "marketplace.json");
  }
  if (
    normalized === "AGENTS.md" ||
    normalized === "config.toml" ||
    normalized.startsWith("rules/") ||
    normalized.startsWith("agents/") ||
    normalized.startsWith("plugins/codex-chef-workflows/") ||
    /^[A-Za-z0-9._-]+\.config\.toml$/.test(normalized)
  ) {
    return path.join(ch, ...normalized.split("/"));
  }
  return null;
}

function assertNoSymlinkParents(targetPath) {
  const roots = [codexHome(), agentsHome()];
  const rootForTarget = roots.find((candidate) => isInside(targetPath, candidate));
  if (!rootForTarget) {
    throw new Error(`Refusing restore target outside Codex/Agents homes: ${redactLocalPaths(targetPath)}`);
  }

  const rootReal = safeRealpath(rootForTarget);
  let current = rootForTarget;
  const relativeParts = path.relative(rootForTarget, path.dirname(targetPath))
    .split(path.sep)
    .filter(Boolean);
  for (const part of relativeParts) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) continue;
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing restore through symlinked directory: ${redactLocalPaths(current)}`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`Refusing restore through non-directory path: ${redactLocalPaths(current)}`);
    }
    if (!isInside(safeRealpath(current), rootReal)) {
      throw new Error(`Refusing restore through directory outside canonical root: ${redactLocalPaths(current)}`);
    }
  }
}

function assertManagedRestoreTarget(targetPath) {
  const resolved = path.resolve(targetPath);
  if (!isInside(resolved, codexHome()) && !isInside(resolved, agentsHome())) {
    throw new Error(`Refusing restore target outside Codex/Agents homes: ${redactLocalPaths(resolved)}`);
  }
  assertNoSymlinkParents(resolved);
}

function restoreBackupPlan(archivePath) {
  const { files, issues } = listArchiveFiles(archivePath, true);
  const unsupported = [];
  const planned = [];
  const seenTargets = new Set();

  for (const file of files) {
    const target = mapBackupRelativeToTarget(file.relative);
    if (!target) {
      unsupported.push(file.relative);
      continue;
    }
    assertManagedRestoreTarget(target);
    const canonicalTarget = path.resolve(target).toLowerCase();
    if (seenTargets.has(canonicalTarget)) {
      throw new Error(`Backup archive maps multiple files to the same restore target: ${redactLocalPaths(target)}`);
    }
    seenTargets.add(canonicalTarget);
    planned.push({
      ...file,
      target,
      targetExists: fs.existsSync(target)
    });
  }

  return { files: planned, unsupported, issues };
}

function createRollbackBackup(plan) {
  const restoreId = `codex-chef-restore-${compactTimestamp()}-${process.pid}`;
  const rollbackPath = path.join(backupRootPath(), restoreId);
  const entries = [];
  for (const item of plan.files) {
    if (!fs.existsSync(item.target)) continue;
    assertManagedRestoreTarget(item.target);
    const targetStat = fs.lstatSync(item.target);
    if (targetStat.isSymbolicLink()) {
      throw new Error(`Refusing to back up symlink restore target: ${redactLocalPaths(item.target)}`);
    }
    const relative = isInside(item.target, codexHome())
      ? path.join("codex", path.relative(codexHome(), item.target))
      : path.join("agents", path.relative(agentsHome(), item.target));
    const destination = path.join(rollbackPath, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(item.target, destination, { recursive: true, force: true });
    entries.push({
      source: redactLocalPaths(item.target),
      backupRelativePath: toPosix(relative),
      size: targetStat.size
    });
  }
  if (entries.length > 0) {
    writeBackupManifest(rollbackPath, {
      operation: "restore-rollback",
      restoredFrom: path.basename(options.backupId || ""),
      entries
    });
  }
  return entries.length > 0 ? rollbackPath : null;
}

function writeBackupManifest(backupPath, extra = {}) {
  fs.mkdirSync(backupPath, { recursive: true });
  const packageJson = readJson("package.json");
  const manifest = {
    schemaVersion: "codex-chef.backup.v1",
    createdAt: new Date().toISOString(),
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    platform: process.platform,
    ...extra
  };
  fs.writeFileSync(path.join(backupPath, BACKUP_MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function restoreBackupArchive(archivePath, plan) {
  if (plan.files.length === 0) {
    throw new Error("Selected backup archive has no restorable managed Codex Chef files.");
  }
  for (const item of plan.files) {
    const sourceStat = fs.lstatSync(item.path);
    if (sourceStat.isSymbolicLink()) {
      throw new Error(`Refusing to restore symlink from backup archive: ${item.relative}`);
    }
    assertInside(safeRealpath(item.path), safeRealpath(archivePath), "restore source");
    assertManagedRestoreTarget(item.target);
  }
  const rollbackPath = createRollbackBackup(plan);
  for (const item of plan.files) {
    fs.mkdirSync(path.dirname(item.target), { recursive: true });
    fs.copyFileSync(item.path, item.target);
  }
  return { restored: plan.files.length, rollbackPath };
}

function deleteBackupArchive(archivePath) {
  const rootReal = safeRealpath(backupRootPath());
  const archiveReal = safeRealpath(archivePath);
  if (!isInside(archiveReal, rootReal)) {
    throw new Error(`Refusing backup archive deletion outside canonical backup root: ${path.basename(archivePath)}`);
  }
  fs.rmSync(archivePath, { recursive: true, force: false });
}

function summarizeBackupArchive(id, archivePath) {
  const stat = fs.statSync(archivePath);
  const manifest = readBackupManifest(archivePath);
  const { files, issues } = listArchiveFiles(archivePath);
  const restorableCount = files.filter((file) => mapBackupRelativeToTarget(file.relative)).length;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  return {
    id,
    kind: id.startsWith("codex-chef-repair-")
      ? "repair"
      : id.startsWith("codex-chef-restore-")
        ? "restore-rollback"
        : "install",
    path: archivePath,
    fileCount: files.length,
    restorableCount,
    totalBytes,
    modified: stat.mtime.toISOString(),
    manifest: manifest
      ? {
        present: true,
        schemaVersion: manifest.schemaVersion || null,
        operation: manifest.operation || null,
        packageVersion: manifest.packageVersion || null,
        invalid: manifest.invalid === true
      }
      : { present: false },
    issues
  };
}

function listBackupArchives() {
  const backupRoot = backupRootPath();
  if (!fs.existsSync(backupRoot)) return [];
  const rootReal = safeRealpath(backupRoot);
  return fs.readdirSync(backupRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && BACKUP_ID_PATTERN.test(entry.name))
    .map((entry) => {
      const archivePath = path.join(backupRoot, entry.name);
      const archiveReal = safeRealpath(archivePath);
      if (!isInside(archiveReal, rootReal)) {
        throw new Error(`Refusing backup archive outside backup root: ${entry.name}`);
      }
      return summarizeBackupArchive(entry.name, archivePath);
    })
    .sort((a, b) => b.modified.localeCompare(a.modified));
}

function resolveBackupArchive(id) {
  validateBackupId(id);
  const backupRoot = backupRootPath();
  const archivePath = path.join(backupRoot, id);
  assertInside(archivePath, backupRoot, "backup archive");
  if (!fs.existsSync(archivePath) || !fs.statSync(archivePath).isDirectory()) {
    throw new Error(`Backup archive not found: ${id}`);
  }
  const rootReal = safeRealpath(backupRoot);
  const archiveReal = safeRealpath(archivePath);
  if (!isInside(archiveReal, rootReal)) {
    throw new Error(`Refusing backup archive outside canonical backup root: ${id}`);
  }
  return archivePath;
}

function backupJsonPayload(backups) {
  return {
    schemaVersion: 1,
    backupRoot: redactLocalPaths(backupRootPath()),
    codexHome: redactLocalPaths(codexHome()),
    agentsHome: redactLocalPaths(agentsHome()),
    backups: backups.map((backup) => ({
      ...backup,
      path: redactLocalPaths(backup.path)
    }))
  };
}

function printRows(rows, columns, emptyMessage = null) {
  if (rows.length === 0) {
    if (emptyMessage) console.log(`${ICONS.info} ${emptyMessage}`);
    return;
  }
  if (options.plain) {
    rows.forEach((row, index) => {
      const primary = columns[0];
      console.log(`${index + 1}. ${row[primary.key] ?? ""}`);
      for (const column of columns.slice(1)) {
        console.log(`   ${column.label}: ${row[column.key] ?? ""}`);
      }
    });
    return;
  }
  const width = terminalWidth();
  const compactRows = rows.map((row) => Object.fromEntries(
    columns.map((column) => [column.key, String(row[column.key] ?? "")])
  ));
  const primary = columns[0];
  const secondary = columns.slice(1);
  const primaryWidth = Math.min(
    Math.max(primary.label.length, ...compactRows.map((row) => visualLength(row[primary.key]))) + 2,
    Math.max(18, Math.floor(width * 0.35))
  );
  const labelWidth = Math.max(...secondary.map((column) => column.label.length), 6);
  printDivider("");
  console.log(`${padVisual(styleMuted(primary.label), primaryWidth)}${secondary.length ? styleMuted(localText("details", "detaylar")) : ""}`);
  console.log(styleMuted("-".repeat(Math.min(width, primaryWidth + 64))));
  rows.forEach((row, index) => {
    const primaryValue = `${index + 1}. ${truncateVisual(row[primary.key] ?? "", primaryWidth - 4)}`;
    console.log(padVisual(primaryValue, primaryWidth));
    for (const column of secondary) {
      const valueWidth = Math.max(16, width - labelWidth - 8);
      console.log(`   ${padVisual(styleMuted(`${column.label}:`), labelWidth + 1)} ${truncateVisual(row[column.key] ?? "", valueWidth)}`);
    }
  });
}

function printBackupTable(backups) {
  console.log(`${ICONS.logs} ${localText("Codex Chef backups", "Codex Chef yedekleri")}`);
  console.log(`${styleLabel(localText("Backup root", "Yedek kok dizini"))}: ${redactLocalPaths(backupRootPath())}`);
  console.log(`${ICONS.info} ${localText(
    "Read-only inventory; no files restored.",
    "read-only envanter; dosya geri yuklenmedi."
  )}`);
  if (backups.length === 0) {
    console.log(`${ICONS.info} ${localText("No backup archives found.", "Yedek arsivi bulunamadi.")}`);
    return;
  }
  const latestRestorable = backups.find((backup) => backup.restorableCount > 0);
  if (latestRestorable) {
    console.log(`${ICONS.info} ${localText(
      `Latest restorable backup: ${latestRestorable.id} (${latestRestorable.restorableCount} managed files).`,
      `Son geri yuklenebilir yedek: ${latestRestorable.id} (${latestRestorable.restorableCount} managed dosya).`
    )}`);
  }
  const visibleBackups = options.plain ? backups.slice(0, 10) : backups;
  if (options.plain && backups.length > visibleBackups.length) {
    console.log(`${ICONS.info} ${localText(
      `Showing latest ${visibleBackups.length} of ${backups.length}; use --json for the full machine-readable list.`,
      `${backups.length} yedegin son ${visibleBackups.length} girdisi gosteriliyor; tam liste icin --json kullan.`
    )}`);
  }
  printRows(
    visibleBackups.map((backup) => ({
      id: backup.id,
      kind: backup.kind,
      files: backup.fileCount,
      restorable: backup.restorableCount,
      bytes: backup.totalBytes,
      manifest: backup.manifest.present ? backup.manifest.schemaVersion || "present" : localText("missing", "legacy/yok"),
      modified: backup.modified
    })),
    isTr()
      ? [
          { key: "id", label: "id" },
          { key: "kind", label: "tur" },
          { key: "files", label: "dosya" },
          { key: "restorable", label: "geriYuklenebilir" },
          { key: "bytes", label: "bayt" },
          { key: "manifest", label: "manifest" },
          { key: "modified", label: "degisti" }
        ]
      : [
          { key: "id", label: "id" },
          { key: "kind", label: "kind" },
          { key: "files", label: "files" },
          { key: "restorable", label: "restorable" },
          { key: "bytes", label: "bytes" },
          { key: "manifest", label: "manifest" },
          { key: "modified", label: "modified" }
        ]
  );
  console.log(`${ICONS.info} ${localText(
    "Inspect one archive: npm run chef -- --backups --backup <id>",
    "Bir arsivi incele: npm run chef -- --backups --backup <id>"
  )}`);
  console.log(`${ICONS.info} ${localText(
    "Restore preview: npm run chef -- --backups --backup <id> --restore",
    "Geri yukleme preview: npm run chef -- --backups --backup <id> --restore"
  )}`);
  console.log(`${ICONS.info} ${localText(
    "Delete preview: npm run chef -- --backups --backup <id> --delete",
    "Silme preview: npm run chef -- --backups --backup <id> --delete"
  )}`);
}

function printBackupInspect(archivePath, plan) {
  console.log(`${ICONS.logs} ${localText("Backup archive", "Yedek arsivi")}: ${path.basename(archivePath)}`);
  console.log(`${styleLabel(localText("Location", "Konum"))}: ${redactLocalPaths(archivePath)}`);
  if (plan.issues.length > 0) {
    console.log(`${ICONS.warn} ${localText("Archive issues:", "Arsiv sorunlari:")}`);
    for (const issue of plan.issues) console.log(`- ${issue}`);
  }
  if (plan.unsupported.length > 0) {
    console.log(`${ICONS.warn} ${localText(
      `Unsupported entries are not restorable by this CLI: ${plan.unsupported.join(", ")}`,
      `Bu CLI tarafindan geri yuklenemeyen girdiler: ${plan.unsupported.join(", ")}`
    )}`);
  }
  if (plan.files.length === 0) {
    console.log(`${ICONS.info} ${localText("No restorable managed Codex Chef files found.", "Geri yuklenebilir managed Codex Chef dosyasi bulunamadi.")}`);
    return;
  }
  printRows(
    plan.files.map((file) => ({
      archiveFile: file.relative,
      target: redactLocalPaths(file.target),
      exists: file.targetExists ? localText("yes", "evet") : localText("no", "hayir"),
      bytes: file.size,
      sha256: file.sha256.slice(0, 12)
    })),
    isTr()
      ? [
          { key: "archiveFile", label: "arsivDosyasi" },
          { key: "target", label: "hedef" },
          { key: "exists", label: "varMi" },
          { key: "bytes", label: "bayt" },
          { key: "sha256", label: "sha256" }
        ]
      : [
          { key: "archiveFile", label: "archiveFile" },
          { key: "target", label: "target" },
          { key: "exists", label: "exists" },
          { key: "bytes", label: "bytes" },
          { key: "sha256", label: "sha256" }
        ]
  );
  console.log(`${ICONS.info} ${localText(
    `Restore preview: npm run chef -- --backups --backup ${path.basename(archivePath)} --restore`,
    `Geri yukleme preview: npm run chef -- --backups --backup ${path.basename(archivePath)} --restore`
  )}`);
  console.log(`${ICONS.info} ${localText(
    `Delete preview: npm run chef -- --backups --backup ${path.basename(archivePath)} --delete`,
    `Silme preview: npm run chef -- --backups --backup ${path.basename(archivePath)} --delete`
  )}`);
}

async function runBackups() {
  try {
    if (!options.backupId) {
      if (options.restore || options.deleteBackup) {
        console.error(`${ICONS.warn} ${localText("--restore and --delete require --backup ID.", "--restore ve --delete icin --backup ID gerekir.")}`);
        return { ok: false };
      }
      const backups = listBackupArchives();
      if (options.json) {
        console.log(JSON.stringify(backupJsonPayload(backups), null, 2));
      } else {
        printBackupTable(backups);
      }
      return { ok: true };
    }

    const archivePath = resolveBackupArchive(options.backupId);
    const plan = restoreBackupPlan(archivePath);
    if (options.restore && options.deleteBackup) {
      console.error(`${ICONS.warn} ${localText("Choose either --restore or --delete for one backup archive.", "Tek yedek arsivi icin --restore veya --delete secin; ikisini birlikte kullanmayin.")}`);
      return { ok: false };
    }
    if (options.json) {
      console.log(JSON.stringify({
        schemaVersion: 1,
        backup: path.basename(archivePath),
        backupPath: redactLocalPaths(archivePath),
        restore: options.restore,
        delete: options.deleteBackup,
        apply: options.apply,
        restorableFiles: plan.files.map((file) => ({
          archiveFile: file.relative,
          target: redactLocalPaths(file.target),
          targetExists: file.targetExists,
          bytes: file.size,
          sha256: file.sha256
        })),
        unsupported: plan.unsupported,
        issues: plan.issues
      }, null, 2));
      return { ok: true };
    }

    if (options.deleteBackup) {
      console.log(`${ICONS.warn} ${localText(`Backup delete preview for archive ${path.basename(archivePath)}`, `Yedek silme preview: ${path.basename(archivePath)}`)}`);
      console.log(`${styleLabel(localText("Location", "Konum"))}: ${redactLocalPaths(archivePath)}`);
      console.log(`${ICONS.info} ${localText(
        "Deletion is limited to this resolved Codex Chef backup archive under the canonical backup root.",
        "Silme yalniz canonical backup root altinda resolve edilen bu Codex Chef yedek arsiviyle sinirlidir."
      )}`);
      if (!options.apply) {
        console.log(`${ICONS.info} ${localText("No backup archive deleted. Rerun with --apply to delete this archive.", "Yedek arsivi silinmedi. Bu arsivi silmek icin --apply ile tekrar calistirin.")}`);
        return { ok: true };
      }
      const allowed = await confirmWriteAction(
        localText("Backup delete", "Yedek silme"),
        localText(
          "Delete removes the selected Codex Chef backup archive. This does not touch live managed files, but the deleted archive cannot be restored unless you have another copy.",
          "Silme secili Codex Chef yedek arsivini kaldirir. Live managed dosyalara dokunmaz, ama baska kopya yoksa bu arsivden geri donemezsiniz."
        )
      );
      if (!allowed) return { ok: false, skipped: true };
      deleteBackupArchive(archivePath);
      console.log(`${ICONS.ok} ${localText(`Backup archive deleted: ${path.basename(archivePath)}.`, `Yedek arsivi silindi: ${path.basename(archivePath)}.`)}`);
      return { ok: true };
    }

    if (!options.restore) {
      printBackupInspect(archivePath, plan);
      return { ok: true };
    }

    console.log(`${ICONS.info} ${localText(`Restore preview for backup ${path.basename(archivePath)}`, `Geri yukleme preview: ${path.basename(archivePath)}`)}`);
    printBackupInspect(archivePath, plan);
    if (plan.issues.length > 0) {
      console.error(`${ICONS.warn} ${localText("Restore blocked because the archive has unsafe entries.", "Arsiv guvensiz girdiler icerdigi icin geri yukleme bloklandi.")}`);
      return { ok: false };
    }
    if (!options.apply) {
      console.log(`${ICONS.info} ${localText("No files restored. Rerun with --apply to restore this backup.", "Dosya geri yuklenmedi. Bu yedegi geri yuklemek icin --apply ile tekrar calistirin.")}`);
      return { ok: true };
    }
    const allowed = await confirmWriteAction(
      localText("Backup restore", "Yedek geri yukleme"),
      localText(
        "Restore copies selected managed Codex Chef files from the backup archive after creating a rollback backup of current targets.",
        "Geri yukleme, mevcut hedeflerin rollback yedegini olusturduktan sonra secili managed Codex Chef dosyalarini arsivden kopyalar."
      )
    );
    if (!allowed) return { ok: false, skipped: true };
    const result = restoreBackupArchive(archivePath, plan);
    console.log(`${ICONS.ok} ${localText(
      `Restore applied: ${result.restored} managed file(s) copied from ${path.basename(archivePath)}.`,
      `Geri yukleme uygulandi: ${path.basename(archivePath)} arsivinden ${result.restored} managed dosya kopyalandi.`
    )}`);
    if (result.rollbackPath) {
      console.log(`${ICONS.info} ${localText("Rollback backup", "Rollback yedegi")}: ${redactLocalPaths(result.rollbackPath)}`);
    } else {
      console.log(`${ICONS.info} ${localText(
        "Rollback backup: none needed because no current targets existed.",
        "Rollback yedegi: mevcut hedef olmadigi icin gerekmedi."
      )}`);
    }
    console.log(`${ICONS.info} ${localText("Restart Codex, then run npm run chef -- --status --repo-only --no-log.", "Codex'i yeniden baslatin, sonra npm run chef -- --status --repo-only --no-log calistirin.")}`);
    return { ok: true };
  } catch (error) {
    console.error(`${ICONS.warn} ${error.message}`);
    return { ok: false };
  }
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
  printRows(
    installable.map((skill) => ({
      name: skill.name,
      source: skill.source,
      risk: skill.risk,
      auth: skill.authRequired ? "yes" : "no",
      checked: skill.lastChecked
    })),
    isTr()
      ? [
          { key: "name", label: "skill" },
          { key: "source", label: "kaynak" },
          { key: "risk", label: "risk" },
          { key: "auth", label: "auth" },
          { key: "checked", label: "kontrol" }
        ]
      : [
          { key: "name", label: "skill" },
          { key: "source", label: "source" },
          { key: "risk", label: "risk" },
          { key: "auth", label: "auth" },
          { key: "checked", label: "checked" }
        ]
  );
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
  printRows(
    servers.map((server) => ({
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
    })),
    isTr()
      ? [
          { key: "name", label: "mcp" },
          { key: "category", label: "kategori" },
          { key: "documented", label: "doc" },
          { key: "configured", label: "config" },
          { key: "verified", label: "canli" },
          { key: "transport", label: "tasima" },
          { key: "target", label: "hedef" },
          { key: "auth", label: "auth" },
          { key: "approval", label: "onay" },
          { key: "setup", label: "setup" },
          { key: "source", label: "kaynak" }
        ]
      : [
          { key: "name", label: "mcp" },
          { key: "category", label: "category" },
          { key: "documented", label: "documented" },
          { key: "configured", label: "configured" },
          { key: "verified", label: "verified" },
          { key: "transport", label: "transport" },
          { key: "target", label: "target" },
          { key: "auth", label: "auth" },
          { key: "approval", label: "approval" },
          { key: "setup", label: "setup" },
          { key: "source", label: "source" }
        ]
  );
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
    waitNote: localText(
      "Showing the agent, skill, MCP, and wait-policy routing contract.",
      "Agent, skill, MCP ve bekleme politikasi routing kontrati gosteriliyor."
    )
  });
}

function runAuth() {
  console.log(`${ICONS.lock} ${localText("GitHub authentication boundary", "GitHub kimlik dogrulama siniri")}`);
  console.log("");
  console.log(styleMuted(localText(
    "This public CLI does not print account-scoped re-auth or global Git credential-helper commands.",
    "Bu public CLI account-scope re-auth veya global Git credential-helper komutlari basmaz."
  )));
  console.log(styleMuted(localText(
    "If GitHub release, push, or workflow checks fail because local auth is stale, refresh GitHub CLI or Git Credential Manager according to your organization policy.",
    "GitHub release, push veya workflow kontrolleri lokal auth bayat oldugu icin fail olursa GitHub CLI veya Git Credential Manager'i kendi kurum politikaniza gore yenileyin."
  )));
  console.log(styleMuted(localText(
    "After refresh, use a read-only remote check such as `git ls-remote origin HEAD` from the target repository before retrying a publish step.",
    "Yenilemeden sonra publish adimini tekrar denemeden once hedef repoda `git ls-remote origin HEAD` gibi read-only remote check kullanin."
  )));
  console.log("");
  console.log(styleHeading(localText("Notes:", "Notlar:")));
  console.log(`- ${colorize(localText("Do not paste tokens", "Token yapistirmayin"), "yellow")} ${localText("into repo files, AGENTS.md, skills, rules, or shell history.", "repo dosyalarina, AGENTS.md'ye, skill'lere, rule'lara veya shell history'ye.")}`);
  console.log(`- ${localText("Keep personal account repair, token scope decisions, and global Git credential configuration outside this public repo.", "Kisisel account repair, token scope kararlari ve global Git credential config'i bu public repo disinda tutun.")}`);
  console.log(`- ${localText("Do not store workflow or release tokens in Codex Chef templates, examples, logs, or docs.", "Workflow veya release token'larini Codex Chef template, example, log veya docs icinde saklamayin.")}`);
  console.log(`- ${localText("Authenticated MCP connectors still remain disabled until a task needs them.", "Auth isteyen MCP connector'lari bir task gerek duyana kadar disabled kalir.")}`);
  return { ok: true };
}

function recentCliLogs(limit = 12) {
  if (!fs.existsSync(logRoot)) {
    return [];
  }
  return fs.readdirSync(logRoot, { withFileTypes: true })
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
    .slice(0, limit);
}

function printRecentCliLogs(logs) {
  printRows(
    logs,
    [
      { key: "file", label: localText("file", "dosya") },
      { key: "size", label: localText("size", "boyut") },
      { key: "modified", label: localText("modified", "degisti") }
    ],
    localText("No logs yet.", "Henuz log yok.")
  );
}

function readRepoStatusSnapshot() {
  const result = spawnSync(process.execPath, [
    "scripts/codex-status.mjs",
    "--redact-paths",
    "--skip-runtime",
    "--skip-codex-doctor-checks",
    "--skip-codex-cli",
    "--json"
  ], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120000,
    windowsHide: true,
    env: {
      ...process.env,
      FORCE_COLOR: "0",
      NO_COLOR: "1"
    }
  });
  if (result.error) {
    return {
      ok: false,
      status: "attention",
      attentionReasons: [`Repo-only status could not run: ${result.error.message}`],
      nextActions: ["Run npm run chef -- --status --repo-only --no-log for details."]
    };
  }
  const output = redactSensitiveOutput([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  try {
    const parsed = JSON.parse(result.stdout || "{}");
    return {
      ok: result.status === 0,
      status: parsed.status || (result.status === 0 ? "ok" : "attention"),
      git: parsed.gitRepository || null,
      repoDoctor: parsed.repoDoctor ? {
        status: parsed.repoDoctor.status,
        failures: parsed.repoDoctor.failures || []
      } : null,
      attentionReasons: parsed.attentionReasons || [],
      failures: parsed.failures || [],
      nextActions: parsed.nextActions || [],
      generatedAt: parsed.generatedAt || null
    };
  } catch (error) {
    return {
      ok: false,
      status: "attention",
      attentionReasons: [`Repo-only status did not emit parseable JSON: ${error.message}`],
      nextActions: ["Run npm run chef -- --status --repo-only --no-log for text details."],
      outputPreview: output.split(/\r?\n/).slice(0, 6)
    };
  }
}

function backupSummary(backups) {
  const latest = backups[0] || null;
  const latestRestorable = backups.find((backup) => backup.restorableCount > 0) || null;
  return {
    count: backups.length,
    latest: latest ? {
      id: latest.id,
      kind: latest.kind,
      files: latest.fileCount,
      restorable: latest.restorableCount,
      modified: latest.modified
    } : null,
    latestRestorable: latestRestorable ? {
      id: latestRestorable.id,
      files: latestRestorable.fileCount,
      restorable: latestRestorable.restorableCount,
      modified: latestRestorable.modified
    } : null
  };
}

function logSummary(logs) {
  return {
    count: logs.length,
    latest: logs[0] || null,
    contentPrinted: false,
    note: "Only repo-local log metadata is shown; raw log contents are intentionally not printed."
  };
}

function diagnosticCommandRows() {
  return [
    {
      area: localText("Repo status", "Repo durumu"),
      command: "npm run chef -- --status --repo-only --no-log",
      writes: localText("none", "yok"),
      reason: localText("Fast repo health without installed runtime probes.", "Kurulu runtime probu olmadan hizli repo sagligi.")
    },
    {
      area: localText("Full status", "Tam durum"),
      command: "npm run chef -- --status --no-log",
      writes: localText("none", "yok"),
      reason: localText("Runtime, MCP, Git, routing, and log metadata checks.", "Runtime, MCP, Git, routing ve log metadata kontrolleri.")
    },
    {
      area: "Doctor",
      command: "npm run chef -- --doctor --no-log",
      writes: localText("none", "yok"),
      reason: localText("Repo doctor plus install/runtime expectations.", "Repo doctor ve kurulum/runtime beklentileri.")
    },
    {
      area: localText("Routing", "Yonlendirme"),
      command: "npm run chef -- --routing --no-log",
      writes: localText("none", "yok"),
      reason: localText("Agent, skill, MCP, and wait-policy routing contract.", "Agent, skill, MCP ve bekleme politikasi routing kontrati.")
    },
    {
      area: localText("Update preview", "Guncelleme preview"),
      command: "npm run chef -- --update --no-log",
      writes: localText("none without --apply", "--apply yoksa yok"),
      reason: localText("Shows repo/global refresh plan and validation gates without changing managed files.", "Managed dosyalari degistirmeden repo/global refresh plani ve validation gate'lerini gosterir.")
    },
    {
      area: localText("Repair preview", "Onarim preview"),
      command: "npm run chef -- --repair --no-log",
      writes: localText("none without --apply", "--apply yoksa yok"),
      reason: localText("Shows drift repair actions before any backup-backed write.", "Yedekli write oncesi drift onarim adimlarini gosterir.")
    },
    {
      area: localText("Backups", "Yedekler"),
      command: "npm run chef -- --backups --no-log",
      writes: localText("none", "yok"),
      reason: localText("Backup archive inventory and restore/delete preview entry points.", "Yedek arsiv envanteri ve restore/delete preview girisleri.")
    },
    {
      area: localText("CLI logs", "CLI loglari"),
      command: "npm run chef -- --logs --no-log",
      writes: localText("none", "yok"),
      reason: localText("Recent repo-local CLI log metadata; file contents are not printed.", "Son repo-local CLI log metadata'si; dosya icerigi basilmaz.")
    },
    {
      area: localText("Runtime parity", "Runtime esligi"),
      command: "npm run verify:install:runtime -- --expect-skills --redact-paths",
      writes: localText("none", "yok"),
      reason: localText("Source/runtime managed file, agent, MCP, and skill parity.", "Source/runtime managed file, agent, MCP ve skill esligi.")
    },
    {
      area: localText("Serena/MCP process audit", "Serena/MCP surec denetimi"),
      command: "npm run chef -- --processes --no-log",
      writes: localText("none", "yok"),
      reason: localText("Read-only count before asking for any process stop.", "Herhangi bir surec durdurma onayi istemeden once read-only sayim.")
    }
  ];
}

const PROCESS_AUDIT_NAMES = new Set(["serena", "uvx", "python", "python3", "chrome", "chromium", "msedge", "node"]);

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuote = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && inQuote && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      inQuote = !inQuote;
    } else if (char === "," && !inQuote) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function normalizeProcessName(value) {
  return String(value || "")
    .trim()
    .replace(/^.*[\\/]/, "")
    .replace(/\.exe$/i, "")
    .toLowerCase();
}

function processCommandNames() {
  const attempts = process.platform === "win32"
    ? [
        {
          command: "tasklist.exe",
          args: ["/fo", "csv", "/nh"],
          parse: (stdout) => String(stdout || "")
            .split(/\r?\n/)
            .filter((line) => line.trim())
            .map((line) => parseCsvLine(line)[0])
        },
        {
          command: "powershell.exe",
          args: ["-NoProfile", "-Command", "Get-Process | Select-Object -ExpandProperty ProcessName"],
          parse: (stdout) => String(stdout || "").split(/\r?\n/).filter((line) => line.trim())
        }
      ]
    : [
        {
          command: "ps",
          args: ["-axo", "comm="],
          parse: (stdout) => String(stdout || "").split(/\r?\n/).filter((line) => line.trim())
        }
      ];
  const errors = [];
  for (const attempt of attempts) {
    const result = spawnSync(attempt.command, attempt.args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    timeout: 30000
    });
    const display = commandForDisplay(attempt.command, attempt.args);
    if (result.error || result.status !== 0) {
      errors.push(`${display}: ${result.error?.message || String(result.stderr || result.stdout || `exit ${result.status}`).trim()}`);
      continue;
    }
    const names = attempt.parse(result.stdout);
    return {
      ok: true,
      command: display,
      names: names.map(normalizeProcessName).filter(Boolean)
    };
  }
  return {
    ok: false,
    command: attempts.map((attempt) => commandForDisplay(attempt.command, attempt.args)).join(" | "),
    error: errors.join("; ")
  };
}

function processAuditPayload() {
  const collected = processCommandNames();
  const counts = new Map();
  if (collected.ok) {
    for (const name of collected.names) {
      if (!PROCESS_AUDIT_NAMES.has(name)) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
  }
  const matches = Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, count]) => ({ name, count }));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    command: collected.command,
    status: collected.ok ? "ok" : "attention",
    matches,
    total: matches.reduce((sum, entry) => sum + entry.count, 0),
    error: collected.ok ? null : redactSensitiveOutput(collected.error || ""),
    safety: [
      "Read-only process count.",
      "No process is stopped or killed.",
      "Ask before stopping persistent MCP, browser, Serena, Python, or Node processes."
    ]
  };
}

function runProcesses() {
  const payload = processAuditPayload();
  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return { ok: true };
  }

  console.log(`${ICONS.docs} ${localText("Codex Chef process audit", "Codex Chef surec denetimi")}`);
  console.log(`${styleLabel(localText("Scope", "Kapsam"))}: ${localText("read-only count; no process is stopped.", "read-only sayim; hicbir surec durdurulmaz.")}`);
  console.log(`${styleLabel(localText("Command", "Komut"))}: ${payload.command}`);
  if (payload.error) {
    console.log(`${ICONS.warn} ${localText("Process audit could not run:", "Surec denetimi calisamadi:")} ${payload.error}`);
    return { ok: true };
  }
  console.log(`${styleLabel(localText("Total matching processes", "Eslesen toplam surec"))}: ${payload.total}`);
  printRows(
    payload.matches,
    isTr()
      ? [
          { key: "name", label: "surec" },
          { key: "count", label: "sayi" }
        ]
      : [
          { key: "name", label: "process" },
          { key: "count", label: "count" }
        ],
    localText("No Serena, uvx, browser, Python, or Node processes matched.", "Serena, uvx, browser, Python veya Node sureci eslesmedi.")
  );
  console.log("");
  console.log(styleHeading(localText("Safety", "Guvenlik")));
  for (const item of payload.safety) console.log(`- ${item}`);
  return { ok: true };
}

function runDiagnostics() {
  const commands = diagnosticCommandRows();
  const logs = recentCliLogs(12);
  const status = readRepoStatusSnapshot();
  const backups = listBackupArchives();
  const attentionReasons = [
    ...(status.attentionReasons || []),
    ...(status.failures || [])
  ];
  const nextActions = [
    ...(status.nextActions || []),
    "npm run chef -- --update --no-log",
    "npm run chef -- --repair --no-log",
    "npm run chef -- --backups --no-log",
    "npm run verify:install:runtime -- --expect-skills --redact-paths"
  ].filter((value, index, array) => array.indexOf(value) === index);
  const payload = {
    schemaVersion: 1,
    logRoot: redactLocalPaths(logRoot),
    backupRoot: redactLocalPaths(backupRootPath()),
    status: {
      source: "repo-only",
      overall: status.status,
      generatedAt: status.generatedAt,
      git: status.git,
      repoDoctor: status.repoDoctor
    },
    attentionReasons,
    nextActions,
    backupSummary: backupSummary(backups),
    logSummary: logSummary(logs),
    commands,
    recentLogs: logs,
    safety: [
      "Read-only by default.",
      "Use --apply only on explicit install, update, repair, restore, or delete flows.",
      "Ask before stopping persistent MCP/browser/process state."
    ]
  };

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return { ok: true };
  }

  console.log(`${ICONS.docs} ${localText("Codex Chef diagnostics", "Codex Chef tanilama")}`);
  console.log(`${styleLabel(localText("Scope", "Kapsam"))}: ${localText("read-only evidence hub; no global files changed.", "read-only kanit merkezi; global dosya degistirmez.")}`);
  console.log(`${styleLabel(localText("Log root", "Log kok dizini"))}: ${payload.logRoot}`);
  console.log(`${styleLabel(localText("Backup root", "Yedek kok dizini"))}: ${payload.backupRoot}`);
  console.log("");
  console.log(styleHeading(localText("Current health", "Canli saglik")));
  console.log(`${styleLabel(localText("Overall", "Genel"))}: ${payload.status.overall}`);
  if (payload.status.git?.summary) {
    console.log(`${styleLabel("Git")}: ${payload.status.git.summary}`);
  }
  if (payload.attentionReasons.length > 0) {
    console.log(`${ICONS.warn} ${localText("Attention reasons:", "Dikkat nedenleri:")}`);
    for (const reason of payload.attentionReasons) console.log(`- ${reason}`);
  } else {
    console.log(`${ICONS.ok} ${localText("No repo-only attention reasons.", "Repo-only dikkat nedeni yok.")}`);
  }
  console.log(`${styleLabel(localText("Backups", "Yedekler"))}: ${payload.backupSummary.count}${payload.backupSummary.latestRestorable ? `; ${localText("latest restorable", "son geri yuklenebilir")}: ${payload.backupSummary.latestRestorable.id}` : ""}`);
  console.log(`${styleLabel(localText("CLI logs", "CLI loglari"))}: ${payload.logSummary.count}${payload.logSummary.latest ? `; ${localText("latest", "son")}: ${payload.logSummary.latest.file}` : ""}`);
  console.log("");
  console.log(styleHeading(localText("Next safe actions", "Sonraki guvenli adimlar")));
  for (const action of payload.nextActions.slice(0, 6)) console.log(`- ${action}`);
  console.log("");
  console.log(styleHeading(localText("Diagnostic evidence commands", "Tanilama kanit komutlari")));
  printRows(
    commands,
    isTr()
      ? [
          { key: "area", label: "alan" },
          { key: "command", label: "komut" },
          { key: "writes", label: "yazar" },
          { key: "reason", label: "amac" }
        ]
      : [
          { key: "area", label: "area" },
          { key: "command", label: "command" },
          { key: "writes", label: "writes" },
          { key: "reason", label: "reason" }
        ]
  );
  console.log("");
  console.log(styleHeading(localText("Recent CLI logs", "Son CLI loglari")));
  printRecentCliLogs(logs);
  console.log("");
  console.log(styleHeading(localText("Lifecycle cleanup notes", "Lifecycle temizlik notlari")));
  console.log(`- ${localText("Use /agent to inspect and close completed agent threads.", "Tamamlanan agent thread'lerini incelemek ve kapatmak icin /agent kullan.")}`);
  console.log(`- ${localText("Use /ps and /stop for live Codex tasks before starting another long operation.", "Yeni uzun isleme baslamadan once live Codex task'lari icin /ps ve /stop kullan.")}`);
  console.log(`- ${localText("If Serena, browser, or MCP processes persist, audit first and ask before stopping them.", "Serena, browser veya MCP surecleri kalirsa once denetle ve durdurmadan once onay iste.")}`);
  console.log(`- ${localText("Do not paste raw logs publicly; redaction covers common tokens but local logs can still contain machine context.", "Raw loglari public paylasma; redaction yaygin tokenlari kapsar ama lokal loglar makine baglami icerebilir.")}`);
  return { ok: true };
}

function runLogs() {
  printRecentCliLogs(recentCliLogs(12));
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
    case "backups":
      return runBackups();
    case "skills":
      return runSkills();
    case "mcp":
      return runMcp();
    case "routing":
      return runRouting();
    case "diagnostics":
      return runDiagnostics();
    case "processes":
      return runProcesses();
    case "auth":
      return runAuth();
    case "logs":
      return runLogs();
    case "language":
      return toggleLanguage();
    case "exit":
      return { ok: true };
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function runMenu() {
  printHeader();
  const scriptedMenu = process.env.CODEX_CHEF_TEST_MENU === "1"
    ? fs.readFileSync(0, "utf8").split(/\r?\n/)
    : null;
  const rl = scriptedMenu ? null : createInterface({ input: process.stdin, output: process.stdout });
  const question = async (prompt) => {
    if (scriptedMenu) {
      process.stdout.write(prompt);
      return scriptedMenu.length > 0 ? scriptedMenu.shift() : "q";
    }
    return rl.question(prompt);
  };
  try {
    let shouldRenderMenu = true;
    while (true) {
      if (shouldRenderMenu) {
        printMenu();
        shouldRenderMenu = false;
      }
      const answer = await question(`\n${styleLabel(localText(`Select 1-${MENU_ITEMS.length}`, `Sec 1-${MENU_ITEMS.length}`))}${styleMuted(localText(" / l language / q quit:", " / l dil / q cikis:"))} `);
      const normalizedAnswer = answer.trim().toLowerCase();
      if (!normalizedAnswer) {
        console.log(`${ICONS.warn} ${localText(`Choose 1-${MENU_ITEMS.length}, l for language, or q to quit.`, `1-${MENU_ITEMS.length} secin, dil icin l, cikis icin q.`)}`);
        continue;
      }
      if (["q", "quit", "exit"].includes(normalizedAnswer)) break;
      if (["l", "lang", "language", "dil"].includes(normalizedAnswer)) {
        const languageItem = MENU_ITEMS.find((candidate) => candidate.id === "language");
        printActionStart(languageItem);
        const result = toggleLanguage();
        printActionEnd(languageItem, result);
        console.log("");
        shouldRenderMenu = true;
        continue;
      }
      const index = Number(normalizedAnswer);
      const item = MENU_ITEMS[index - 1];
      if (!item) {
        console.log(`${ICONS.warn} ${localText(`Choose 1-${MENU_ITEMS.length}, l for language, or q to quit.`, `1-${MENU_ITEMS.length} secin, dil icin l, cikis icin q.`)}`);
        continue;
      }
      if (item.id === "exit") break;
      printActionStart(item);
      const result = await runAction(item.id);
      printActionEnd(item, result);
      if (item.id !== "language") await pauseBeforeMenu(question);
      else console.log("");
      shouldRenderMenu = true;
    }
  } finally {
    if (rl) rl.close();
  }
}

if (options.help) {
  printHelp();
} else if (options.action) {
  const result = await runAction(options.action);
  if (result?.ok === false && !result.skipped) process.exit(1);
} else if (!process.stdin.isTTY && process.env.CODEX_CHEF_TEST_MENU !== "1") {
  printHelp();
} else {
  await runMenu();
}
