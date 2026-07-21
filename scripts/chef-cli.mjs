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

class UserInterrupt extends Error {
  constructor() {
    super("User interrupted");
    this.name = "UserInterrupt";
    this.code = "CODEX_CHEF_USER_INTERRUPT";
  }
}

function isQuestionAbort(error) {
  return error?.name === "AbortError" || error?.code === "ABORT_ERR";
}

function isUserInterrupt(error) {
  return error instanceof UserInterrupt || error?.code === "CODEX_CHEF_USER_INTERRUPT";
}

function questionAbortError() {
  const error = new Error("Aborted");
  error.name = "AbortError";
  error.code = "ABORT_ERR";
  return error;
}

async function normalizeQuestionAbort(task) {
  try {
    return await task();
  } catch (error) {
    if (isQuestionAbort(error)) throw new UserInterrupt();
    throw error;
  }
}

async function readQuestion(rl, prompt) {
  return normalizeQuestionAbort(() => rl.question(prompt));
}

async function askInteractive(prompt, interaction = {}) {
  if (interaction.question) return interaction.question(prompt);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await readQuestion(rl, prompt);
  } finally {
    rl.close();
  }
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
      cliError("--lang requires a language code (en or tr). Run npm run chef -- --help for supported commands.", "--lang dil kodu ister (en veya tr). Desteklenen komutlar için npm run chef -- --help çalıştırın.");
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
      cliError("--backup requires a backup id. Run npm run chef -- --backups to list available backups.", "--backup bir yedek id'si ister. Uygun yedekleri listelemek için npm run chef -- --backups çalıştırın.");
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
    cliError(`Unknown option ${arg}. Run npm run chef -- --help for supported commands.`, `Bilinmeyen seçenek ${arg}. Desteklenen komutlar için npm run chef -- --help çalıştırın.`);
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

const RICH_ICONS = {
  chef: "🍳",
  ok: "✅",
  info: "ℹ️",
  warn: "⚠️",
  run: "▶️",
  update: "⬆️",
  lock: "🔐",
  docs: "📚",
  logs: "🧾"
};

const MENU_ASCII_ICONS = {
  status: "ST",
  "status:repo-only": "RP",
  doctor: "DR",
  preview: "PV",
  update: "UP",
  install: "IN",
  reset: "RS",
  repair: "FX",
  backups: "BK",
  skills: "SK",
  mcp: "MC",
  routing: "RT",
  diagnostics: "DG",
  processes: "PS",
  auth: "AU",
  logs: "LG",
  language: "LN",
  exit: "QT"
};

const MENU_RICH_ICONS = {
  status: "📊",
  "status:repo-only": "📁",
  doctor: "🩺",
  preview: "👁️",
  update: "⬆️",
  install: "📦",
  reset: "♻️",
  repair: "🛠️",
  backups: "💾",
  skills: "🧠",
  mcp: "🔌",
  routing: "🧭",
  diagnostics: "🔎",
  processes: "⚙️",
  auth: "🔐",
  logs: "🧾",
  language: "🌐",
  exit: "⏹️"
};

const MENU_LEGEND_SOURCE_MARKER = "Legend: SAFE | APPLY-GATED | ACCOUNT-GUIDED";

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
  const width = Number(process.stdout.columns || process.env.COLUMNS || 96);
  return Math.max(72, Math.min(120, Number.isFinite(width) ? width : 96));
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

function printBrandSignature() {
  const lines = [
    "██╗   ██╗   ██████╗   ███████╗",
    "██║   ██║  ██╔════╝   ██╔════╝",
    "██║   ██║  ██║        ███████╗",
    "██║   ██║  ██║        ╚════██║",
    "╚██████╔╝  ╚██████╗   ███████║",
    " ╚═════╝    ╚═════╝   ╚══════╝"
  ];
  console.log("");
  for (const line of lines) console.log(colorize(line, "cyan"));
  console.log("");
}

function writeBoundaryKind(boundary) {
  const normalized = stripAnsi(String(boundary || "")).toLowerCase();
  if (
    normalized === "none" ||
    normalized === "read-only" ||
    normalized === "yazmaz" ||
    normalized.includes("read-only") ||
    normalized.includes("no writes") ||
    normalized.includes("yazmasiz") ||
    normalized.includes("yazmaz")
  ) {
    return "safe";
  }
  if (
    normalized.includes("optional") ||
    normalized.includes("guidance") ||
    normalized.includes("opsiyonel") ||
    normalized.includes("rehberi")
  ) {
    return "guidance";
  }
  return "write";
}

function styleWriteBoundary(boundary) {
  const kind = writeBoundaryKind(boundary);
  if (kind === "safe") return colorize(boundary, "green");
  if (kind === "guidance") return colorize(boundary, "yellow");
  return colorize(boundary, "red");
}

function displayValue(value, column = {}) {
  if (value === undefined || value === null || value === "") return localText("Not set", "Belirtilmedi");
  const text = String(value);
  const normalized = text.trim().toLowerCase();
  const key = String(column.key || "").toLowerCase();
  const label = String(column.label || "").toLowerCase();
  const isWrites = key === "writes" || label === "writes" || label === "impact" || label === "yazar" || label === "etki";
  const isSetup = key === "setup" || label === "setup";
  const replacements = {
    none: isWrites
      ? localText("Read-only", "Yazmaz")
      : isSetup
        ? localText("No setup required", "Kurulum gerekmez")
        : localText("Not applicable", "Uygulanmaz"),
    "network optional": localText("Optional network if you install", "Kurulum seçilirse ağ kullanabilir"),
    "none/account guidance": localText("No writes; account guidance only", "Yazmaz; yalnız hesap rehberi"),
    "none/global with --restore --apply": localText("No writes here; restore/delete needs --apply", "Bu ekranda yazmaz; geri yükleme/silme --apply ister"),
    "none without --apply": localText("No writes until --apply", "--apply yoksa yazmaz"),
    "ready_by_default": localText("Ready by default", "Varsayılan hazır"),
    "disabled_by_default": localText("Disabled by default", "Varsayılan kapalı"),
    "configured_unverified": localText("Configured, not live-checked", "Config var, canlı kontrol yok"),
    "not_checked": localText("Not live-checked", "Canlı kontrol yok"),
    "yes": localText("Yes", "Evet"),
    "no": localText("No", "Hayır"),
    "missing": localText("Missing", "Eksik"),
    "present": localText("Present", "Var"),
    "skipped": localText("Skipped", "Atlandı")
  };
  return replacements[normalized] || text;
}

function makeIcons() {
  const source = supportsColor() ? RICH_ICONS : ASCII_ICONS;
  return Object.fromEntries(
    Object.entries(source).map(([name, icon]) => [name, colorize(icon, ICON_COLORS[name])])
  );
}

const ICONS = makeIcons();

const MENU_ITEMS = [
  {
    id: "status",
    label: "System status",
    writes: "No writes",
    description: "Check installed runtime, repo health, login, MCP, skills, and logs."
  },
  {
    id: "status:repo-only",
    label: "Repo health",
    writes: "No writes",
    description: "Fast local checks without touching installed runtime or Codex CLI probes."
  },
  {
    id: "doctor",
    label: "Full checkup",
    writes: "No writes",
    description: "Run repo doctor plus installed-runtime expectation checks."
  },
  {
    id: "preview",
    label: "Install preview",
    writes: "No writes",
    description: "Show the install plan and platform dry run before changing anything."
  },
  {
    id: "update",
    label: "Update Codex Chef",
    writes: "Typed confirmation: repo/global/network",
    description: "Check, confirm, fast-forward, validate, and refresh managed files in one flow."
  },
  {
    id: "install",
    label: "Full install",
    writes: "Typed confirmation: global/network",
    description: "Install managed Codex files and curated skills after explicit approval."
  },
  {
    id: "reset",
    label: "Refresh setup",
    writes: "Typed confirmation: global/network",
    description: "Reinstall managed files from a backup-backed force refresh."
  },
  {
    id: "repair",
    label: "Repair setup",
    writes: "Typed confirmation: global",
    description: "Fix managed-file drift after backing up anything that changes."
  },
  {
    id: "backups",
    label: "Backups",
    writes: "Restore/delete: typed confirmation",
    description: "Choose a backup, inspect it, then restore or delete in the same session."
  },
  {
    id: "skills",
    label: "Skills catalog",
    writes: "Install: typed confirmation",
    description: "Review curated skills, choose one, and confirm installation in the same session."
  },
  {
    id: "mcp",
    label: "MCP connectors",
    writes: "No writes; account guidance only",
    description: "Review default MCPs, disabled account connectors, and setup notes."
  },
  {
    id: "routing",
    label: "Routing guide",
    writes: "No writes",
    description: "Show how task shapes map to agents, skills, MCPs, and wait policy."
  },
  {
    id: "diagnostics",
    label: "Diagnostics hub",
    writes: "No writes",
    description: "Collect safe evidence commands, log metadata, backups, and cleanup notes."
  },
  {
    id: "processes",
    label: "Process audit",
    writes: "No writes",
    description: "Count Serena, MCP, browser, Python, and Node processes without stopping them."
  },
  {
    id: "auth",
    label: "Auth notes",
    writes: "No writes; account guidance only",
    description: "Show public-safe GitHub auth boundaries and read-only verification notes."
  },
  {
    id: "logs",
    label: "Recent logs",
    writes: "No writes",
    description: "List recent Chef log metadata without printing raw log contents."
  },
  {
    id: "language",
    label: "Language",
    writes: "No writes",
    description: "Switch the interactive CLI between English and Turkish."
  },
  {
    id: "exit",
    label: "Exit",
    writes: "No writes",
    description: "Close the operator board."
  }
];

const MENU_GROUPS = [
  {
    id: "check",
    label: "Check",
    labelTr: "Kontrol",
    itemIds: ["status", "status:repo-only", "doctor"]
  },
  {
    id: "plan",
    label: "Plan first",
    labelTr: "Önce planla",
    itemIds: ["preview", "update"]
  },
  {
    id: "apply-gated",
    label: "Apply-gated setup",
    labelTr: "Onaylı kurulum",
    itemIds: ["install", "reset", "repair"]
  },
  {
    id: "catalogs",
    label: "Catalogs and routing",
    labelTr: "Kataloglar ve yönlendirme",
    itemIds: ["backups", "skills", "mcp", "routing"]
  },
  {
    id: "evidence",
    label: "Evidence and account notes",
    labelTr: "Kanıt ve hesap notları",
    itemIds: ["diagnostics", "processes", "auth", "logs"]
  },
  {
    id: "preferences",
    label: "Preferences",
    labelTr: "Tercihler",
    itemIds: ["language", "exit"]
  }
];

const MENU_TEXT_TR = {
  status: {
    label: "Sistem durumu",
    description: "Kurulu çalışma ortamını, repo sağlığını, oturumu, MCP'leri, skill'leri ve logları kontrol eder.",
    writes: "Yazmaz"
  },
  "status:repo-only": {
    label: "Repo sağlığı",
    description: "Kurulu ortam veya Codex CLI probu olmadan hızlı yerel kontroller yapar.",
    writes: "Yazmaz"
  },
  doctor: {
    label: "Tam kontrol",
    description: "Repo doctor ve kurulu çalışma ortamı beklentilerini birlikte çalıştırır.",
    writes: "Yazmaz"
  },
  preview: {
    label: "Kurulum ön izlemesi",
    description: "Herhangi bir değişiklik yapmadan kurulum planını ve platform provasını gösterir.",
    writes: "Yazmaz"
  },
  update: {
    label: "Codex Chef'i güncelle",
    description: "Kontrol, onay, Git fast-forward, doğrulama ve yönetilen dosya yenilemeyi tek akışta tamamlar.",
    writes: "Yazılı onay: repo/global/ağ"
  },
  install: {
    label: "Tam kurulum",
    description: "Açık onaydan sonra yönetilen Codex dosyalarını ve seçili skill'leri kurar.",
    writes: "Yazılı onay: global/ağ"
  },
  reset: {
    label: "Kurulumu yenile",
    description: "Yedekli yenileme ile yönetilen dosyaları yeniden kurar.",
    writes: "Yazılı onay: global/ağ"
  },
  repair: {
    label: "Kurulumu onar",
    description: "Değişecek dosyaları yedekleyip yönetilen dosya farklarını onarır.",
    writes: "Yazılı onay: global"
  },
  backups: {
    label: "Yedekler",
    description: "Yedeği seçer ve inceler; geri yükleme veya silmeyi aynı oturumda onayla tamamlar.",
    writes: "Geri yükleme/silme: yazılı onay"
  },
  skills: {
    label: "Skill kataloğu",
    description: "Skill'leri inceler; seçilen skill kurulumunu aynı oturumda onayla tamamlar.",
    writes: "Kurulum: yazılı onay"
  },
  mcp: {
    label: "MCP bağlayıcıları",
    description: "Varsayılan MCP'leri, kapalı hesap bağlayıcılarını ve kurulum notlarını gösterir.",
    writes: "Yazmaz; yalnız hesap rehberi"
  },
  routing: {
    label: "Yönlendirme rehberi",
    description: "Görev tiplerinin agent, skill, MCP ve bekleme politikasına nasıl bağlandığını gösterir.",
    writes: "Yazmaz"
  },
  diagnostics: {
    label: "Tanılama merkezi",
    description: "Güvenli kanıt komutlarını, log bilgisini, yedekleri ve temizlik notlarını toplar.",
    writes: "Yazmaz"
  },
  processes: {
    label: "Süreç denetimi",
    description: "Serena, MCP, tarayıcı, tünel, Python ve Node süreçlerini durdurmadan sayar.",
    writes: "Yazmaz"
  },
  auth: {
    label: "Kimlik notlari",
    description: "Public-safe GitHub kimlik sınırlarını ve yazmasız doğrulama notlarını gösterir.",
    writes: "Yazmaz; yalnız hesap rehberi"
  },
  logs: {
    label: "Son loglar",
    description: "Ham log içeriğini basmadan son Chef log bilgisini listeler.",
    writes: "Yazmaz"
  },
  language: {
    label: "Dil",
    description: "İnteraktif CLI dilini Türkçe ve İngilizce arasında değiştirir.",
    writes: "Yazmaz"
  },
  exit: {
    label: "Çıkış",
    description: "Operatör panelini kapat.",
    writes: "Yazmaz"
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

function menuGroups() {
  return MENU_GROUPS.map((group) => ({
    ...group,
    labelText: isTr() ? group.labelTr : group.label,
    items: group.itemIds
      .map((id) => MENU_ITEMS.find((item) => item.id === id))
      .filter(Boolean)
  })).filter((group) => group.items.length > 0);
}

function menuItemNumber(item) {
  return MENU_ITEMS.findIndex((candidate) => candidate.id === item.id) + 1;
}

function menuItemColor(item) {
  if (item.id === "exit") return "dim";
  if (item.id === "language") return "magenta";
  return "cyan";
}

function menuIcon(item) {
  const icons = supportsColor() ? MENU_RICH_ICONS : MENU_ASCII_ICONS;
  return icons[item.id] || (supportsColor() ? "•" : "--");
}

function tableBorder(widths) {
  return colorize(`+${widths.map((width) => "-".repeat(width + 2)).join("+")}+`, "dim");
}

function tableRow(cells, widths, muted = false) {
  const row = cells.map((cell, index) => ` ${padVisual(truncateVisual(cell, widths[index]), widths[index])} `).join("|");
  const line = `|${row}|`;
  return muted ? styleMuted(line) : line;
}

function printSurfaceHeader(title, subtitle = "", icon = ICONS.info) {
  console.log("");
  const rawTitle = String(title || "");
  const dividerTitle = isTr()
    ? rawTitle.toLocaleUpperCase("tr-TR").replace(/\bSKİLL\b/g, "SKILL")
    : rawTitle.toUpperCase();
  printDivider(dividerTitle);
  console.log(`${icon} ${styleHeading(title)}`);
  if (subtitle) console.log(styleMuted(subtitle));
}

function printSurfaceNote(label, value) {
  console.log(`${styleLabel(label)}: ${value}`);
}

function operatorPrompt() {
  return `\n${styleLabel(localText(`Choose action 1-${MENU_ITEMS.length}`, `İşlem seç 1-${MENU_ITEMS.length}`))}${styleMuted(localText(" / l language / q quit:", " / l dil / q çıkış:"))} `;
}

function printOperatorStatusStrip() {
  const head = gitHead();
  const commit = head.ok && head.value ? head.value.slice(0, 7) : localText("unknown", "bilinmiyor");
  const legendLabel = isTr() ? "Lejant" : MENU_LEGEND_SOURCE_MARKER.split(":")[0];
  console.log(`${styleLabel(localText("Mode", "Mod"))}: ${localText("Local operator", "Yerel operatör")} | ${styleLabel(localText("Version", "Versiyon"))}: ${currentPackageVersion()} | ${styleLabel("Git")}: ${gitBranch()}@${commit}`);
  console.log(`${styleLabel(localText("Safety", "Güvenlik"))}: ${localText("menu writes use typed confirmation; direct CLI writes require --apply", "menüde yazan işlemler yazılı onay; doğrudan CLI işlemleri --apply ister")}`);
  console.log(`${styleLabel(legendLabel)}: ${colorize("SAFE", "green")}=${localText("read-only", "yazmaz")} | ${colorize("APPLY-GATED", "red")}=${localText("backup/confirmation required", "yedek/onay gerekir")} | ${colorize("ACCOUNT-GUIDED", "yellow")}=${localText("guidance only", "yalnız rehberlik")}`);
}

function printStackedMenu(width) {
  const indent = "     ";
  for (const group of menuGroups()) {
    console.log("");
    console.log(styleHeading(group.labelText));
    for (const item of group.items) {
      const number = `${menuItemNumber(item)}.`;
      const icon = colorize(menuIcon(item), menuItemColor(item));
      const label = colorize(menuLabel(item), menuItemColor(item));
      console.log(`${padVisual(number, 4)} ${icon} ${label}`);
      console.log(`${indent}${styleLabel(localText("Impact", "Etki"))}: ${styleWriteBoundary(menuWrites(item))}`);
      console.log(`${indent}${styleMuted(truncateVisual(menuDescription(item), Math.max(24, width - indent.length)))}`);
    }
  }
}

function printTableMenu(width) {
  const iconWidth = Math.max(localText("Icon", "Ikon").length, ...MENU_ITEMS.map((item) => visualLength(menuIcon(item))));
  const numberWidth = Math.max(String(MENU_ITEMS.length).length + 1, 2);
  const labelWidth = Math.min(
    Math.max(...MENU_ITEMS.map((item) => menuLabel(item).length), localText("Action", "Islem").length),
    22
  );
  const desiredWritesWidth = Math.min(
    Math.max(...MENU_ITEMS.map((item) => menuWrites(item).length), localText("Impact", "Etki").length),
    40
  );
  const minPurposeWidth = 20;
  const tableOverhead = 15;
  const fixedWithoutWrites = iconWidth + numberWidth + labelWidth + tableOverhead;
  const writesWidth = Math.max(
    localText("Impact", "Etki").length,
    Math.min(desiredWritesWidth, width - fixedWithoutWrites - minPurposeWidth)
  );
  const purposeWidth = Math.max(minPurposeWidth, width - fixedWithoutWrites - writesWidth);
  const widths = [iconWidth, numberWidth, labelWidth, writesWidth, purposeWidth];
  for (const group of menuGroups()) {
    console.log("");
    console.log(styleHeading(group.labelText));
    console.log(tableBorder(widths));
    console.log(tableRow([
      styleMuted(localText("Icon", "Ikon")),
      styleMuted("#"),
      styleMuted(localText("Action", "Islem")),
      styleMuted(localText("Impact", "Etki")),
      styleMuted(localText("What it does", "Ne yapar"))
    ], widths));
    console.log(tableBorder(widths));
    for (const item of group.items) {
      const icon = colorize(menuIcon(item), menuItemColor(item));
      const number = `${menuItemNumber(item)}.`;
      const label = colorize(truncateVisual(menuLabel(item), labelWidth), menuItemColor(item));
      const writes = styleWriteBoundary(truncateVisual(menuWrites(item), writesWidth));
      const purpose = styleMuted(truncateVisual(menuDescription(item), purposeWidth));
      console.log(tableRow([icon, number, label, writes, purpose], widths));
    }
    console.log(tableBorder(widths));
  }
}

function printHelp() {
  if (isTr()) {
    console.log(`${colorize("Codex Chef CLI", "cyan")}

Kullanım:
  npm run chef
  npm run chef -- --status --repo-only
  npm run chef -- --preview
  npm run chef -- --diagnostics

Komut kısayolları:
  Yazmasız ekranlar: --status, --doctor, --preview, --skills, --mcp, --routing, --diagnostics, --processes, --auth, --logs
  Onaylı yazan işlemler: --update [--apply], --reset [--apply], --repair [--apply], --install [--apply]
  Yedekler: --backups [--backup ID] [--restore|--delete --apply]
  Yönlendirme profili: --routing --profile starter-health
  Ayrıntılı preview kanıtı: --preview --verbose-plan

Seçenekler:
  --json          Desteklenen yerlerde JSON çıktı verir
  --lang tr      Operatör metinlerini Türkçe yapar (en veya tr)
  --tr           --lang tr kısa yolu
  --plain        İkon yerine ASCII etiketleri kullanır
  --no-log       Sıkı audit için repo-local CLI log dosyası oluşturmaz
  --repo-only    Status için kurulu runtime, global skill kökleri, Codex logları ve Codex CLI problarını atlar
  --profile ID   --routing ile tek routing profilini gösterir
  --diagnose     --diagnostics kısa yolu
  --backup ID    Belirli Codex Chef yedek arşivini inceler veya geri yükler
  --restore      --backup ID için geri yükleme preview'i; dosya kopyalamak için --apply ekle
  --delete       --backup ID için silme preview'i; arşivi silmek için --apply ekle
  --verbose-plan Preview ekranlarında tam install dry-run kanıtını basar
  --apply        Update, install, reset, repair veya seçili skill install için write action izni verir
  --help         Bu yardımı gösterir

Ekranlar:
  Sistem durumu, Repo sağlığı, Tam kontrol, Kurulum ön izlemesi, Codex Chef'i güncelle,
  Tam kurulum, Kurulumu yenile, Kurulumu onar, Yedekler, Skill kataloğu,
  MCP bağlayıcıları, Yönlendirme rehberi, Tanılama merkezi, Süreç denetimi,
  Kimlik notları, Son loglar

Detay:
  README hızlı yolu gösterir; tam CLI referansı docs/install.tr.md içindedir.

Loglar:
  tmp/chef-cli/logs
`);
    return;
  }
  console.log(`${colorize("Codex Chef CLI", "cyan")}

Usage:
  npm run chef
  npm run chef -- --status --repo-only
  npm run chef -- --preview
  npm run chef -- --diagnostics

Reference actions:
  Read-only: --status, --doctor, --preview, --skills, --mcp, --routing, --diagnostics, --processes, --auth, --logs
  Write gated: --update [--apply], --reset [--apply], --repair [--apply], --install [--apply]
  Backups: --backups [--backup ID] [--restore|--delete --apply]
  Routing: --routing --profile starter-health
  Verbose preview: --preview --verbose-plan

Operator screens:
  System status, Repo health, Full checkup, Install preview, Update Codex Chef,
  Full install, Refresh setup, Repair setup, Backups, Skills catalog,
  MCP connectors, Routing guide, Diagnostics hub, Process audit,
  Auth notes, Recent logs

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
  --verbose-plan Print the full install dry-run evidence for preview screens
  --apply        Allow write actions for update, install, reset, repair, or selected skill install
  --help         Show this help

Details:
  README shows the short path; the full CLI reference lives in docs/install.md.

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
  else if (!options.json) console.log(`${ICONS.ok} ${localText("Log disabled by --no-log", "Log --no-log ile kapali")}`);
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

function isMenuInteraction(interaction = {}) {
  return interaction.fromMenu === true;
}

function writeFlowRequested(interaction = {}) {
  return options.apply || isMenuInteraction(interaction);
}

async function confirmWriteAction(action, detail, interaction = {}) {
  if (!interaction.fromMenu && options.apply) return true;
  if (!process.stdin.isTTY && !interaction.question) {
    console.log(`${ICONS.warn} ${localText(`${action} needs --apply before it can change files or global state.`, `${action} dosya veya global durum değiştirmeden önce --apply ister.`)}`);
    return false;
  }
  const answer = await askInteractive(
    `${ICONS.warn} ${detail} ${localText("Type APPLY to continue, or press Enter to cancel:", "Devam etmek icin APPLY yazin; vazgecmek icin Enter'a basin:")} `,
    interaction
  );
  return answer.trim() === "APPLY";
}

function printHeader() {
  printBrandSignature();
  printDivider("Codex Chef");
  console.log(`${ICONS.chef} Codex Chef`);
  console.log(styleMuted(localText(
    "One operator board for status, setup, backups, skills, MCP connectors, diagnostics, auth notes, and logs.",
    "Durum, kurulum, yedekler, skill'ler, MCP bağlayıcıları, tanılama, kimlik notları ve loglar için tek operatör paneli."
  )));
  console.log(styleMuted(localText(
    `Language: English | Safety: menu writes ask for APPLY; direct CLI writes require --apply.`,
    `Dil: Türkçe | Güvenlik: menü işlemleri APPLY onayı; doğrudan CLI işlemleri --apply ister.`
  )));
  console.log("");
}

function printMenu() {
  printDivider("OPERATOR BOARD");
  console.log(styleHeading(localText("Operator menu", "Operatör menüsü")));
  printOperatorStatusStrip();
  console.log("");
  const width = terminalWidth();
  if (width < 110) printStackedMenu(width);
  else printTableMenu(width);
  console.log("");
  console.log(styleMuted(localText(
    "Shortcuts: l = language, q = quit. Empty input repeats this prompt without repainting the menu.",
    "Kısayollar: l = dil, q = çıkış. Boş giriş menüyü yeniden basmadan promptu tekrarlar."
  )));
}

function printActionStart(item) {
  const label = menuLabel(item) || item.label || item.id;
  printSurfaceHeader(
    localText(`Opening: ${label}`, `Aciliyor: ${label}`),
    menuDescription(item),
    ICONS.run
  );
}

function printActionEnd(item, result) {
  const label = menuLabel(item) || item.label || item.id;
  const status = result?.ok === false && !result.skipped
    ? localText("attention", "dikkat")
    : localText("ready", "hazir");
  printDivider(localText(`${label}: ${status}`, `${label}: ${status}`));
}

async function pauseBeforeMenu(question) {
  await question(`\n${styleMuted(localText("Press Enter to return to the operator board.", "Operatör paneline dönmek için Enter'a basın."))} `);
  console.log("");
}

function toggleLanguage() {
  options.lang = isTr() ? "en" : "tr";
  console.log(`${ICONS.ok} ${localText("Language switched to English.", "Dil Türkçe olarak ayarlandı.")}`);
  return { ok: true };
}

function runStatus(overrides = {}) {
  const repoOnly = Boolean(overrides.repoOnly || options.repoOnly);
  return runNode(repoOnly ? "status-repo-only" : "status", "scripts/codex-status.mjs", [
    "--redact-paths",
    "--lang",
    options.lang,
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

function runPreview(force = false, includeSkills = true, compact = !options.verbosePlan) {
  const plan = runNode("preview-plan", "scripts/plan-install.mjs", [
    ...(includeSkills ? ["--all"] : []),
    ...(force ? ["--force"] : []),
    ...(compact ? ["--summary"] : []),
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
  console.log(`${ICONS.info} ${localText("Checking the repo before managed files are refreshed.", "Yonetilen dosyalar yenilenmeden once repo kontrol ediliyor.")}`);
  return runPackageScript("update-check", "check", {
    timeout: 300000,
    waitNote: localText(
      "Running the full repo check before global managed files are refreshed.",
      "Global managed dosyalar yenilenmeden once tam repo check calistiriliyor."
    )
  });
}

const MANAGED_REFRESH_TARGETS = [
  "CODEX_HOME/AGENTS.md",
  "CODEX_HOME/config.toml",
  "CODEX_HOME/rules/default.rules",
  "CODEX_HOME/*.config.toml profiles",
  "CODEX_HOME/agents/*.toml role files",
  "CODEX_HOME/plugins/codex-chef-workflows",
  "AGENTS_HOME/plugins/marketplace.json"
];

function printManagedRefreshSummary(interaction = {}) {
  console.log("");
  console.log(styleHeading(localText("Managed targets", "Yönetilen hedefler")));
  for (const target of MANAGED_REFRESH_TARGETS) console.log(`- ${target}`);
  console.log(styleMuted(localText(
    "Apply backs up replaced managed files first; it does not delete, prune, or clean user data.",
    "Apply önce değişecek managed dosyaları yedekler; user data silmez, prune/clean yapmaz."
  )));
  console.log(styleMuted(localText(
    "Update excludes curated global skill installs and optional global Git guards; use --install or --skills for those explicit surfaces.",
    "Update curated global skill kurulumlarını ve opsiyonel global Git guard'larını dışarıda tutar; bu yüzeyler için --install veya --skills kullanın."
  )));
  console.log("");
  console.log(styleHeading(localText("Next safe step", "Sonraki güvenli adım")));
  if (isMenuInteraction(interaction)) {
    console.log(`- ${localText("Continue here after reviewing the plan; the menu will ask for typed APPLY confirmation.", "Planı inceledikten sonra burada devam edin; menü yazılı APPLY onayı isteyecek.")}`);
  } else {
    console.log(`- ${localText("Apply after review", "İncelemeden sonra uygula")}: npm run chef -- --update --apply`);
    console.log(`- ${localText("Full evidence", "Tam kanıt")}: npm run chef -- --update --verbose-plan`);
  }
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

function gitBranch() {
  const result = spawnSync("git", ["branch", "--show-current"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 30000,
    windowsHide: true
  });
  if (result.error || result.status !== 0) return localText("unknown branch", "branch bilinmiyor");
  return String(result.stdout || "").trim() || localText("detached HEAD", "detached HEAD");
}

function latestReleaseNoteTitle() {
  const notesPath = path.join(root, "docs", isTr() ? "release-notes.tr.md" : "release-notes.md");
  if (!fs.existsSync(notesPath)) return localText("release notes not found", "release note bulunamadi");
  const version = currentPackageVersion();
  const lines = fs.readFileSync(notesPath, "utf8")
    .split(/\r?\n/)
    .map((item) => item.trim());
  const line = lines.find((item) => item.startsWith(`## v${version}`))
    || lines.find((item) => /^##\s+v\d+\.\d+\.\d+/.test(item));
  return line ? line.replace(/^#+\s+/, "").trim() : localText("release notes available", "release note var");
}

function currentPackageVersion() {
  return readJson("package.json").version;
}

function printUpdateContext() {
  const head = gitHead();
  console.log(styleHeading(localText("Current repository", "Mevcut repo")));
  console.log(`- ${localText("Version", "Versiyon")}: ${currentPackageVersion()}`);
  console.log(`- ${localText("Branch", "Dal")}: ${gitBranch()}`);
  console.log(`- ${localText("Commit", "Commit")}: ${head.ok && head.value ? head.value.slice(0, 12) : localText("not inspected", "kontrol edilmedi")}`);
  console.log(`- ${localText("Release notes", "Release notu")}: ${latestReleaseNoteTitle()}`);
  console.log(styleMuted(localText(
    "Preview does not contact the remote. Apply uses git pull --ff-only first, then refreshes managed files only after backup and validation.",
    "Preview remote'a bağlanmaz. Apply önce git pull --ff-only kullanır, sonra validation ve yedekten sonra sadece managed dosyaları yeniler."
  )));
}

async function runUpdate(interaction = {}) {
  if (!writeFlowRequested(interaction)) {
    printSurfaceHeader(
      localText("Update preview", "Güncelleme ön izlemesi"),
      localText("No remote pull or managed file refresh happens in preview mode.", "Ön izleme modunda remote pull veya managed dosya yenileme yapılmaz."),
      ICONS.update
    );
    console.log(styleHeading(localText("Result", "Sonuç")));
    console.log(`${ICONS.ok} ${localText("No managed or global files changed.", "Managed veya global dosya değişmedi.")}`);
    console.log(styleMuted(localText(
      "Use apply only after reviewing the target list and backup behavior.",
      "Apply'i yalnız hedef listesini ve yedek davranışını inceledikten sonra kullanın."
    )));
    printUpdateContext();
    printManagedRefreshSummary(interaction);
    if (options.verbosePlan) return runPreview(true, false);
    return { ok: true };
  }
  if (isMenuInteraction(interaction)) {
    printSurfaceHeader(
      localText("Update plan", "Güncelleme planı"),
      localText("Reviewing the current tree before any remote or managed write.", "Remote veya managed yazma işleminden önce mevcut ağaç inceleniyor."),
      ICONS.update
    );
    printUpdateContext();
    printManagedRefreshSummary(interaction);
    const currentPreview = runPreview(true, false);
    if (!currentPreview.ok) return currentPreview;
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
    console.log(`${ICONS.info} ${localText(
      isMenuInteraction(interaction)
        ? "Commit, stash, or move local changes, then choose Update Codex Chef again from this menu."
        : "Commit, stash, or move local changes, then rerun npm run chef -- --update --apply.",
      isMenuInteraction(interaction)
        ? "Lokal değişiklikleri commit/stash/move yapın, ardından bu menüden Codex Chef'i güncelle seçeneğini yeniden seçin."
        : "Lokal değişiklikleri commit/stash/move yapın, sonra npm run chef -- --update --apply tekrar çalıştırın."
    )}`);
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
      "Güncelleme git pull --ff-only ile son Codex Chef değişikliklerini çeker, sonra aynı ağaç preview'inden sonra managed Codex dosyalarını yeniler."
    ),
    interaction
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
    console.log(`${ICONS.update} ${localText(`Repository updated from ${beforeHead.value.slice(0, 7)} to ${afterHead.value.slice(0, 7)}.`, `Repo ${beforeHead.value.slice(0, 7)} -> ${afterHead.value.slice(0, 7)} güncellendi.`)}`);
    console.log(`${ICONS.info} ${localText(
      isMenuInteraction(interaction)
        ? "Running a fresh preview from the updated tree, then continuing validation and managed refresh in this session."
        : "Running a fresh preview from the updated tree. Review it, then rerun npm run chef -- --update --apply to refresh managed files.",
      isMenuInteraction(interaction)
        ? "Güncel ağaçtan yeni ön izleme çalıştırılıyor; ardından doğrulama ve managed yenileme bu oturumda sürecek."
        : "Güncel ağaçtan fresh preview basılıyor. İnceleyip managed dosyaları yenilemek için npm run chef -- --update --apply tekrar çalıştırın."
    )}`);
    const preview = runPreview(true, false);
    if (!preview.ok) return preview;
    if (!isMenuInteraction(interaction)) return { ok: true, skipped: true };
  } else {
    console.log(`${ICONS.ok} ${localText("Repository already up to date; applying the reviewed managed refresh.", "Repo zaten güncel; incelenmiş managed refresh uygulanıyor.")}`);
  }
  const validation = runUpdateValidation();
  if (!validation.ok) return validation;
  if (process.platform === "win32") {
    return runPowerShell("update-install", ".\\scripts\\install.ps1", ["-Force", "-PlainOutput"]);
  }
  return runBash("update-install", "scripts/install.sh", ["--force", "--plain-output"]);
}

async function runInstall(interaction = {}) {
  const allowed = await confirmWriteAction(
    "Install",
    "Full install can write managed Codex files after backup and can install curated global skills.",
    interaction
  );
  if (!allowed) return { ok: false, skipped: true };
  if (process.platform === "win32") {
    return runPowerShell("install", ".\\scripts\\install.ps1", ["-All", "-Interactive", "-PlainOutput"]);
  }
  return runBash("install", "scripts/install.sh", ["--all", "--interactive", "--plain-output"]);
}

async function runReset(interaction = {}) {
  if (!writeFlowRequested(interaction)) {
    printSurfaceHeader(
      localText("Refresh preview", "Yenileme ön izlemesi"),
      localText("No files are replaced in preview. Add --apply only after reviewing the backup-backed plan.", "Ön izlemede dosya değişmez. Yedekli planı inceledikten sonra --apply ekleyin."),
      ICONS.info
    );
    return runPreview(true);
  }
  if (isMenuInteraction(interaction)) {
    printSurfaceHeader(
      localText("Refresh plan", "Yenileme planı"),
      localText("Reviewing the backup-backed managed-file refresh before confirmation.", "Yedekli managed dosya yenilemesi onaydan önce inceleniyor."),
      ICONS.info
    );
    const preview = runPreview(true);
    if (!preview.ok) return preview;
  }
  const allowed = await confirmWriteAction(
    "Reset",
    "Reset refreshes managed Codex Chef files after backup with installer force mode; unrelated user files remain out of scope.",
    interaction
  );
  if (!allowed) return { ok: false, skipped: true };
  if (process.platform === "win32") {
    return runPowerShell("reset-apply", ".\\scripts\\install.ps1", ["-All", "-Force", "-Interactive", "-PlainOutput"]);
  }
  return runBash("reset-apply", "scripts/install.sh", ["--all", "--force", "--interactive", "--plain-output"]);
}

async function runRepair(interaction = {}) {
  if (!writeFlowRequested(interaction)) {
    printSurfaceHeader(
      localText("Repair preview", "Onarım ön izlemesi"),
      localText("Shows managed drift without changing files. Add --apply only after review.", "Dosya değiştirmeden managed drift'i gösterir. Yalnız incelemeden sonra --apply ekleyin."),
      ICONS.info
    );
    return runNode("repair-preview", "scripts/repair-install.mjs", ["--redact-paths"]);
  }
  if (isMenuInteraction(interaction)) {
    printSurfaceHeader(
      localText("Repair plan", "Onarım planı"),
      localText("Reviewing managed-file drift before confirmation.", "Managed dosya farkları onaydan önce inceleniyor."),
      ICONS.info
    );
    const preview = runNode("repair-preview", "scripts/repair-install.mjs", ["--redact-paths"]);
    if (!preview.ok) return preview;
  }
  const allowed = await confirmWriteAction(
    "Repair",
    "Repair can update managed Codex Chef files after backup while preserving unrelated user files.",
    interaction
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

function createRollbackBackup(plan, restoredFrom = "") {
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
      restoredFrom: path.basename(restoredFrom),
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
  const rollbackPath = createRollbackBackup(plan, archivePath);
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
  const width = terminalWidth();
  const compactRows = rows.map((row) => Object.fromEntries(
    columns.map((column) => [column.key, displayValue(row[column.key], column)])
  ));
  const primary = columns[0];
  const secondary = columns.slice(1);
  const primaryWidth = Math.min(
    Math.max(primary.label.length, ...compactRows.map((row) => visualLength(row[primary.key]))) + 5,
    Math.max(width < 90 ? 18 : 22, Math.floor(width * 0.34))
  );
  const detailWidth = Math.max(20, width - primaryWidth - 7);
  const widths = [primaryWidth, detailWidth];
  console.log(tableBorder(widths));
  console.log(tableRow([
    styleMuted(primary.label),
    styleMuted(localText("Details", "Ayrıntı"))
  ], widths));
  console.log(tableBorder(widths));
  compactRows.forEach((row, index) => {
    const primaryValue = `${index + 1}. ${row[primary.key]}`;
    const details = secondary.length > 0
      ? secondary.map((column) => `${styleMuted(`${column.label}:`)} ${row[column.key]}`)
      : [""];
    console.log(tableRow([primaryValue, details[0]], widths));
    for (const detail of details.slice(1)) {
      console.log(tableRow(["", detail], widths));
    }
    console.log(tableBorder(widths));
  });
}

function printBackupTable(backups, interaction = {}) {
  printSurfaceHeader(
    localText("Backup library", "Yedek kütüphanesi"),
    localText("Read-only backup inventory. Menu restore and delete use scoped typed confirmation.", "Yazmasız yedek envanteri. Menüde geri yükleme ve silme hedefe bağlı yazılı onay kullanır."),
    ICONS.logs
  );
  printSurfaceNote(localText("Backup root", "Yedek kök dizini"), redactLocalPaths(backupRootPath()));
  console.log(`${ICONS.info} ${localText(
    "No files are changed from this list screen.",
    "Bu liste ekranında dosya değişmez."
  )}`);
  if (backups.length === 0) {
    console.log(`${ICONS.info} ${localText("No backup archives found.", "Yedek arsivi bulunamadi.")}`);
    return;
  }
  const latestRestorable = backups.find((backup) => backup.restorableCount > 0);
  if (latestRestorable) {
    console.log(`${ICONS.info} ${localText(
      `Latest restorable backup: ${latestRestorable.id} (${latestRestorable.restorableCount} managed files).`,
      `Son geri yüklenebilir yedek: ${latestRestorable.id} (${latestRestorable.restorableCount} managed dosya).`
    )}`);
  }
  const visibleBackups = options.plain ? backups.slice(0, 10) : backups;
  if (options.plain && backups.length > visibleBackups.length) {
    console.log(`${ICONS.info} ${localText(
      `Showing latest ${visibleBackups.length} of ${backups.length}; use --json for the full machine-readable list.`,
      `${backups.length} yedeğin son ${visibleBackups.length} girdisi gösteriliyor; tam liste için --json kullan.`
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
          { key: "kind", label: "Tür" },
          { key: "files", label: "Dosya" },
          { key: "restorable", label: "Geri yüklenir" },
          { key: "bytes", label: "Boyut" },
          { key: "manifest", label: "Manifest" },
          { key: "modified", label: "Güncellendi" }
        ]
      : [
          { key: "id", label: "Archive" },
          { key: "kind", label: "Type" },
          { key: "files", label: "Files" },
          { key: "restorable", label: "Can restore" },
          { key: "bytes", label: "Size" },
          { key: "manifest", label: "Manifest" },
          { key: "modified", label: "Updated" }
        ]
  );
  if (!isMenuInteraction(interaction)) {
    console.log(`${ICONS.info} ${localText(
      "Inspect one archive: npm run chef -- --backups --backup <id>",
      "Bir arşivi incele: npm run chef -- --backups --backup <id>"
    )}`);
    console.log(`${ICONS.info} ${localText(
      "Preview a restore: npm run chef -- --backups --backup <id> --restore",
      "Geri yüklemeyi ön izle: npm run chef -- --backups --backup <id> --restore"
    )}`);
    console.log(`${ICONS.info} ${localText(
      "Preview a delete: npm run chef -- --backups --backup <id> --delete",
      "Silmeyi ön izle: npm run chef -- --backups --backup <id> --delete"
    )}`);
  }
}

function printBackupInspect(archivePath, plan, interaction = {}) {
  printSurfaceHeader(
    localText("Backup details", "Yedek ayrıntısı"),
    path.basename(archivePath),
    ICONS.logs
  );
  printSurfaceNote(localText("Location", "Konum"), redactLocalPaths(archivePath));
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
      archiveFile: toPosix(file.relative),
      target: redactLocalPaths(file.target),
      exists: file.targetExists ? localText("yes", "evet") : localText("no", "hayir"),
      bytes: file.size,
      sha256: file.sha256.slice(0, 12)
    })),
    isTr()
      ? [
          { key: "archiveFile", label: "Arşiv dosyası" },
          { key: "target", label: "Hedef" },
          { key: "exists", label: "Hedef var" },
          { key: "bytes", label: "Boyut" },
          { key: "sha256", label: "sha256" }
        ]
      : [
          { key: "archiveFile", label: "Archive file" },
          { key: "target", label: "Target" },
          { key: "exists", label: "Target exists" },
          { key: "bytes", label: "Size" },
          { key: "sha256", label: "sha256" }
        ]
  );
  if (!isMenuInteraction(interaction)) {
    console.log(`${ICONS.info} ${localText(
      `Preview restore: npm run chef -- --backups --backup ${path.basename(archivePath)} --restore`,
      `Geri yüklemeyi ön izle: npm run chef -- --backups --backup ${path.basename(archivePath)} --restore`
    )}`);
    console.log(`${ICONS.info} ${localText(
      `Preview delete: npm run chef -- --backups --backup ${path.basename(archivePath)} --delete`,
      `Silmeyi ön izle: npm run chef -- --backups --backup ${path.basename(archivePath)} --delete`
    )}`);
  }
}

async function runBackups(interaction = {}, requested = {}) {
  try {
    const backupId = requested.backupId || options.backupId;
    const restore = requested.restore ?? options.restore;
    const deleteBackup = requested.deleteBackup ?? options.deleteBackup;
    if (!backupId) {
      if (restore || deleteBackup) {
        console.error(`${ICONS.warn} ${localText("--restore and --delete require --backup ID.", "--restore ve --delete icin --backup ID gerekir.")}`);
        return { ok: false };
      }
      const backups = listBackupArchives();
      if (options.json) {
        console.log(JSON.stringify(backupJsonPayload(backups), null, 2));
      } else {
        printBackupTable(backups, interaction);
      }
      if (isMenuInteraction(interaction) && backups.length > 0) {
        const selectableBackups = options.plain ? backups.slice(0, 10) : backups;
        const selected = await askSelection(
          selectableBackups,
          localText("\nChoose a backup number, or press Enter to return: ", "\nBir yedek numarası seçin veya dönmek için Enter'a basın: "),
          interaction
        );
        if (!selected) return { ok: true, skipped: true };
        console.log("");
        console.log(styleHeading(localText("Backup action", "Yedek işlemi")));
        console.log(`1. ${localText("Inspect", "İncele")} (${localText("read-only", "yazmaz")})`);
        console.log(`2. ${localText("Restore", "Geri yükle")} (${localText("typed APPLY confirmation", "yazılı APPLY onayı")})`);
        console.log(`3. ${localText("Delete archive", "Arşivi sil")} (${localText(`type DELETE ${selected.id}`, `DELETE ${selected.id} yaz`)})`);
        const action = await askInteractive(
          localText("Choose 1-3, or press Enter to return: ", "1-3 seçin veya dönmek için Enter'a basın: "),
          interaction
        );
        if (action.trim() === "1") return runBackups(interaction, { backupId: selected.id });
        if (action.trim() === "2") return runBackups(interaction, { backupId: selected.id, restore: true });
        if (action.trim() === "3") return runBackups(interaction, { backupId: selected.id, deleteBackup: true });
        console.log(`${ICONS.info} ${localText("No backup action selected; nothing changed.", "Yedek işlemi seçilmedi; hiçbir şey değişmedi.")}`);
        return { ok: true, skipped: true };
      }
      return { ok: true };
    }

    const archivePath = resolveBackupArchive(backupId);
    const plan = restoreBackupPlan(archivePath);
    if (restore && deleteBackup) {
      console.error(`${ICONS.warn} ${localText("Choose either --restore or --delete for one backup archive.", "Tek yedek arşivi için --restore veya --delete seçin; ikisini birlikte kullanmayın.")}`);
      return { ok: false };
    }
    if (options.json) {
      console.log(JSON.stringify({
        schemaVersion: 1,
        backup: path.basename(archivePath),
        backupPath: redactLocalPaths(archivePath),
        restore,
        delete: deleteBackup,
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

    if (deleteBackup) {
      printSurfaceHeader(
        localText("Backup delete preview", "Yedek silme ön izlemesi"),
        path.basename(archivePath),
        ICONS.warn
      );
      printSurfaceNote(localText("Location", "Konum"), redactLocalPaths(archivePath));
      console.log(`${ICONS.info} ${localText(
        "Deletion is limited to this resolved Codex Chef backup archive under the canonical backup root.",
        "Silme yalnız canonical backup root altında resolve edilen bu Codex Chef yedek arşiviyle sınırlıdır."
      )}`);
      if (!writeFlowRequested(interaction)) {
        console.log(`${ICONS.info} ${localText("No backup archive deleted. Rerun with --apply to delete this archive.", "Yedek arşivi silinmedi. Bu arşivi silmek için --apply ile tekrar çalıştırın.")}`);
        return { ok: true };
      }
      const allowed = isMenuInteraction(interaction)
        ? (await askInteractive(
          `${ICONS.warn} ${localText(
            `Delete permanently removes only ${path.basename(archivePath)}. Type DELETE ${path.basename(archivePath)} to continue, or press Enter to cancel:`,
            `Silme yalnız ${path.basename(archivePath)} arşivini kalıcı kaldırır. Devam etmek için DELETE ${path.basename(archivePath)} yazın veya iptal için Enter'a basın:`
          )} `,
          interaction
        )).trim() === `DELETE ${path.basename(archivePath)}`
        : await confirmWriteAction(
          localText("Backup delete", "Yedek silme"),
          localText(
            "Delete removes the selected Codex Chef backup archive. This does not touch live managed files, but the deleted archive cannot be restored unless you have another copy.",
            "Silme seçili Codex Chef yedek arşivini kaldırır. Live managed dosyalara dokunmaz, ama başka kopya yoksa bu arşivden geri dönemezsiniz."
          ),
          interaction
        );
      if (!allowed) return { ok: false, skipped: true };
      deleteBackupArchive(archivePath);
      console.log(`${ICONS.ok} ${localText(`Backup archive deleted: ${path.basename(archivePath)}.`, `Yedek arsivi silindi: ${path.basename(archivePath)}.`)}`);
      return { ok: true };
    }

    if (!restore) {
      printBackupInspect(archivePath, plan, interaction);
      return { ok: true };
    }

    printSurfaceHeader(
      localText("Backup restore preview", "Yedek geri yükleme ön izlemesi"),
      path.basename(archivePath),
      ICONS.info
    );
    printBackupInspect(archivePath, plan, interaction);
    if (plan.issues.length > 0) {
      console.error(`${ICONS.warn} ${localText("Restore blocked because the archive has unsafe entries.", "Arsiv guvensiz girdiler icerdigi icin geri yukleme bloklandi.")}`);
      return { ok: false };
    }
    if (!writeFlowRequested(interaction)) {
      console.log(`${ICONS.info} ${localText("No files restored. Rerun with --apply to restore this backup.", "Dosya geri yüklenmedi. Bu yedeği geri yüklemek için --apply ile tekrar çalıştırın.")}`);
      return { ok: true };
    }
    const allowed = await confirmWriteAction(
      localText("Backup restore", "Yedek geri yukleme"),
      localText(
        "Restore copies selected managed Codex Chef files from the backup archive after creating a rollback backup of current targets.",
        "Geri yukleme, mevcut hedeflerin rollback yedegini olusturduktan sonra secili managed Codex Chef dosyalarini arsivden kopyalar."
      ),
      interaction
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
    console.log(`${ICONS.info} ${localText("Restart Codex, then run npm run chef -- --status --repo-only --no-log.", "Codex'i yeniden başlatın, sonra npm run chef -- --status --repo-only --no-log çalıştırın.")}`);
    return { ok: true };
  } catch (error) {
    if (isUserInterrupt(error)) throw error;
    console.error(`${ICONS.warn} ${error.message}`);
    return { ok: false };
  }
}

function npxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

async function askSelection(items, prompt, interaction = {}) {
  if (!process.stdin.isTTY && !interaction.question) return null;
  const answer = await askInteractive(prompt, interaction);
  const index = Number(answer.trim());
  if (!Number.isInteger(index) || index < 1 || index > items.length) return null;
  return items[index - 1];
}

async function installSelectedSkill(skill, interaction = {}) {
  const allowed = await confirmWriteAction(
    "Skill install",
    `Install selected global skill ${skill.name} from ${skill.source}.`,
    interaction
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

function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.category || "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()].map(([category, entries]) => ({ category, entries }));
}

function summarizeNames(entries, limit = 3) {
  const names = entries.map((entry) => entry.name);
  const visible = names.slice(0, limit).join(", ");
  const hidden = names.length > limit ? ` +${names.length - limit}` : "";
  return `${visible}${hidden}`;
}

async function selectSkill(installable, interaction = {}) {
  printSurfaceHeader(
    localText("Choose a skill to install", "Kurulacak skill'i seç"),
    localText(
      isMenuInteraction(interaction)
        ? "Choose a skill, then confirm its installation with typed APPLY. Press Enter to keep everything unchanged."
        : "Selection only installs after --apply. Press Enter to keep everything unchanged.",
      isMenuInteraction(interaction)
        ? "Bir skill seçin, ardından kurulumu yazılı APPLY ile onaylayın. Her şeyi olduğu gibi bırakmak için Enter'a basın."
        : "Kurulum yalnız --apply ile yapılır. Her şeyi olduğu gibi bırakmak için Enter'a basın."
    ),
    ICONS.docs
  );
  installable.forEach((skill, index) => {
    console.log(`${index + 1}. ${styleAction(skill.name)} - ${styleMuted(skill.source)}`);
  });
  const selected = await askSelection(
    installable,
    localText(
      "\nSelect a skill number, or press Enter to leave everything unchanged: ",
      "\nSkill numarası seçin veya her şeyi olduğu gibi bırakmak için Enter'a basın: "
    ),
    interaction
  );
  if (!selected) {
    console.log(`${ICONS.info} ${localText("No skill selected; nothing changed.", "Skill seçilmedi; hiçbir şey değişmedi.")}`);
    return { ok: true };
  }
  if (!writeFlowRequested(interaction)) {
    console.log(`${ICONS.warn} ${localText(`Selected ${selected.name}. Re-run npm run chef -- --skills --apply and choose it to install.`, `${selected.name} seçildi. Kurmak için npm run chef -- --skills --apply çalıştırıp tekrar seçin.`)}`);
    return { ok: false, skipped: true };
  }
  return installSelectedSkill(selected, interaction);
}

async function runSkills(interaction = {}) {
  const catalog = readJson("catalog/skills.json");
  const routing = readJson("catalog/routing-profiles.json");
  const installable = (catalog.skills || []).filter((skill) => skill.install === true);
  const profileCount = (routing.profiles || []).length;
  printSurfaceHeader(
    localText("Skills catalog", "Skill kataloğu"),
    localText(`${installable.length} curated installable skills with source checks and activation rules.`, `Kaynak kontrolü ve aktivasyon kuralları olan ${installable.length} curated skill.`),
    ICONS.docs
  );
  printRows(
    groupByCategory(installable).map(({ category, entries }) => ({
      category,
      count: entries.length,
      examples: summarizeNames(entries),
      auth: entries.some((skill) => skill.authRequired) ? "yes" : "no",
      risk: entries.some((skill) => skill.risk === "high") ? "high" : "medium",
      checked: entries.map((skill) => skill.lastChecked).sort().at(-1)
    })),
    isTr()
      ? [
          { key: "category", label: "Akış" },
          { key: "count", label: "Skill sayısı" },
          { key: "examples", label: "Örnekler" },
          { key: "risk", label: "Risk" },
          { key: "auth", label: "Auth gerekir" },
          { key: "checked", label: "Son kontrol" }
        ]
      : [
          { key: "category", label: "Workflow" },
          { key: "count", label: "Skills" },
          { key: "examples", label: "Examples" },
          { key: "risk", label: "Risk" },
          { key: "auth", label: "Needs auth" },
          { key: "checked", label: "Last checked" }
        ]
  );
  console.log("");
  console.log(styleHeading(localText("How skill activation works", "Skill aktivasyonu nasıl çalışır")));
  console.log(`- ${localText("Installed skills do not run by themselves or grant hidden permissions.", "Kurulu skill'ler kendiliğinden çalışmaz ve gizli yetki vermez.")}`);
  console.log(`- ${localText("A skill enters context when the user names it, for example $SkillName, or when the task clearly matches its description.", "Skill, kullanıcı adını söylediğinde veya görev açıkça açıklamasına uyduğunda context'e girer.")}`);
  console.log(`- ${localText("Codex reads the selected skill's SKILL.md before acting, then loads only referenced files needed for the task.", "Codex harekete geçmeden önce seçilen skill'in SKILL.md dosyasını okur, sonra yalnız görev için gereken referansları yükler.")}`);
  console.log(`- ${localText(`${profileCount} routing profiles map task shapes to recommended skills; inspect them with npm run chef -- --routing.`, `${profileCount} routing profile'i görev tiplerini önerilen skill'lere bağlar; npm run chef -- --routing ile inceleyin.`)}`);
  console.log(`${ICONS.info} ${localText("Offline verification runs by default. Online resolution: npm run verify:skills:online -- --timeout-ms=90000", "Varsayılan doğrulama offline çalışır. Online çözümleme: npm run verify:skills:online -- --timeout-ms=90000")}`);
  const verification = runNode("skills", "scripts/verify-skill-sources.mjs");
  if (!verification.ok || (!process.stdin.isTTY && !interaction.question)) return verification;
  return selectSkill(installable, interaction);
}

function explainMcpServer(server) {
  printSurfaceHeader(
    localText("Connector details", "Bağlayıcı ayrıntısı"),
    server.name,
    ICONS.docs
  );
  const rows = [
    { field: localText("Catalog status", "Katalog durumu"), value: displayValue(server.defaultEnabled ? "ready_by_default" : "disabled_by_default") },
    { field: localText("Transport", "Tasima"), value: server.transport },
    { field: localText("Target", "Hedef"), value: mcpTarget(server) },
    { field: localText("Auth boundary", "Auth siniri"), value: displayValue(server.auth) },
    { field: localText("Approval mode", "Onay modu"), value: server.approval },
    { field: localText("Risk", "Risk"), value: server.risk },
    { field: localText("Setup", "Kurulum"), value: `${server.setupKind} - ${translateSetupHint(server.setupHint)}` },
    { field: localText("Why it exists", "Neden var"), value: server.defaultReason },
    { field: localText("Source", "Kaynak"), value: server.sourceUrl },
    {
      field: localText("Config reference", "Config referansi"),
      value: localText("See templates/codex/config.windows.toml and templates/codex/config.unix.toml for timeouts and per-tool exposure.", "Timeout ve tool bazli yetkiler icin templates/codex/config.windows.toml ve templates/codex/config.unix.toml dosyalarina bakin.")
    },
    {
      field: localText("Live verification", "Canlı doğrulama"),
      value: localText("Not live-checked until /mcp, codex mcp, or a safe read-only probe succeeds.", "/mcp, codex mcp veya guvenli read-only probe basarili olana kadar canli kontrol yok.")
    },
    {
      field: localText("Rollback", "Geri alma"),
      value: localText("Set this connector's enabled flag to false and restart Codex.", "Bu connector icin enabled flag'ini false yapin ve Codex'i yeniden baslatin.")
    }
  ];
  printRows(rows, [
    { key: "field", label: localText("Field", "Alan") },
    { key: "value", label: localText("Value", "Deger") }
  ]);
}

function mcpTarget(server) {
  if (server.url) return server.url;
  if (server.package) return server.package;
  if (server.command) return server.sourceRef ? `${server.command} @ ${server.sourceRef}` : server.command;
  return "configured in template";
}

async function runMcp(interaction = {}) {
  const catalog = readJson("catalog/mcp-servers.json");
  const servers = catalog.servers || [];
  printSurfaceHeader(
    localText("MCP connectors", "MCP bağlayıcıları"),
    localText(`${servers.length} connectors: default-safe tooling first, account connectors disabled until needed.`, `${servers.length} bağlayıcı: önce varsayılan güvenli tooling, hesap bağlayıcıları gerekene kadar kapalı.`),
    ICONS.docs
  );
  console.log(styleMuted(localText(
    "Evidence levels: documented=catalog, configured=template/installed config, verified=only after /mcp or codex mcp live check.",
    "Kanıt seviyeleri: doc=catalog, config=template/kurulu config, canlı=yalnız /mcp veya codex mcp live check başarılıysa."
  )));
  printRows(
    groupByCategory(servers).map(({ category, entries }) => ({
      category,
      connectors: summarizeNames(entries, 4),
      ready: entries.filter((server) => server.defaultEnabled).length,
      disabled: entries.filter((server) => !server.defaultEnabled).length,
      auth: entries.some((server) => server.auth !== "none") ? localText("Some need account/env auth", "Bazıları hesap/env auth ister") : localText("No credential needed", "Kimlik bilgisi gerekmez"),
      risk: entries.some((server) => server.risk === "critical") ? "critical" : entries.some((server) => server.risk === "high") ? "high" : entries.some((server) => server.risk === "medium") ? "medium" : "low"
    })),
    isTr()
      ? [
          { key: "category", label: "Kategori" },
          { key: "connectors", label: "Bağlayıcılar" },
          { key: "ready", label: "Varsayılan açık" },
          { key: "disabled", label: "Varsayılan kapalı" },
          { key: "auth", label: "Kimlik" },
          { key: "risk", label: "Risk" }
        ]
      : [
          { key: "category", label: "Category" },
          { key: "connectors", label: "Connectors" },
          { key: "ready", label: "Ready by default" },
          { key: "disabled", label: "Disabled by default" },
          { key: "auth", label: "Credential need" },
          { key: "risk", label: "Risk" }
        ]
  );
  console.log(styleMuted(localText(
    "Timeouts and per-tool exposure live in templates/codex/config.windows.toml and templates/codex/config.unix.toml.",
    "Timeout ve tool bazlı yetkiler templates/codex/config.windows.toml ve templates/codex/config.unix.toml içindedir."
  )));
  for (const server of servers.filter((item) => item.setupHint)) {
    console.log(`- ${styleAction(server.name)}: ${translateSetupHint(server.setupHint)}`);
  }
  console.log("");
  console.log(colorize(localText(
    "Authenticated account, database, production, broad filesystem, and graph-indexing MCP connectors stay disabled by default.",
    "Auth isteyen hesap, database, production, geniş filesystem ve graph-indexing MCP connector'ları varsayılan olarak kapalı kalır."
  ), "yellow"));
  console.log(styleMuted(localText(
    "Enable them only for a concrete task in ~/.codex/config.toml, restart Codex, then verify with /mcp or codex mcp.",
    "Yalnız somut bir görev için ~/.codex/config.toml içinde açın, Codex'i yeniden başlatın, sonra /mcp veya codex mcp ile doğrulayın."
  )));
  console.log(styleMuted(localText(
    "Rollback: set the connector's enabled flag back to false and restart Codex.",
    "Rollback: connector enabled flag'ini tekrar false yapın ve Codex'i yeniden başlatın."
  )));
  if (process.stdin.isTTY || interaction.question) {
    console.log("");
    servers.forEach((server, index) => {
      console.log(`${index + 1}. ${styleAction(server.name)}`);
    });
    const selected = await askSelection(servers, localText(
      "\nSelect a connector number for details, or press Enter to leave this screen unchanged: ",
      "\nAyrıntı için bağlayıcı numarası seçin veya ekranı değiştirmeden bırakmak için Enter'a basın: "
    ), interaction);
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
  printSurfaceHeader(
    localText("Authentication notes", "Kimlik doğrulama notları"),
    localText("Public-safe guidance only. This screen never prints account tokens or credential-helper commands.", "Yalnız public-safe rehberlik. Bu ekran account token'i veya credential-helper komutu basmaz."),
    ICONS.lock
  );
  console.log(styleMuted(localText(
    "This public CLI does not print account-scoped re-auth or global Git credential-helper commands.",
    "Bu public CLI account-scope re-auth veya global Git credential-helper komutları basmaz."
  )));
  console.log(styleMuted(localText(
    "If GitHub release, push, or workflow checks fail because local auth is stale, refresh GitHub CLI or Git Credential Manager according to your organization policy.",
    "GitHub release, push veya workflow kontrolleri lokal auth bayat olduğu için fail olursa GitHub CLI veya Git Credential Manager'i kendi kurum politikanıza göre yenileyin."
  )));
  console.log(styleMuted(localText(
    "After refresh, use a read-only remote check such as `git ls-remote origin HEAD` from the target repository before retrying a publish step.",
    "Yenilemeden sonra publish adımını tekrar denemeden önce hedef repoda `git ls-remote origin HEAD` gibi read-only remote check kullanın."
  )));
  console.log("");
  console.log(styleHeading(localText("Notes:", "Notlar:")));
  console.log(`- ${colorize(localText("Do not paste tokens", "Token yapıştırmayın"), "yellow")} ${localText("into repo files, AGENTS.md, skills, rules, or shell history.", "repo dosyalarına, AGENTS.md'ye, skill'lere, rule'lara veya shell history'ye.")}`);
  console.log(`- ${localText("Keep personal account repair, token scope decisions, and global Git credential configuration outside this public repo.", "Kişisel account repair, token scope kararları ve global Git credential config'i bu public repo dışında tutun.")}`);
  console.log(`- ${localText("Do not store workflow or release tokens in Codex Chef templates, examples, logs, or docs.", "Workflow veya release token'larını Codex Chef template, example, log veya docs içinde saklamayın.")}`);
  console.log(`- ${localText("Authenticated MCP connectors still remain disabled until a task needs them.", "Auth isteyen MCP connector'ları bir task gerek duyana kadar disabled kalır.")}`);
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
      { key: "modified", label: localText("modified", "değişti") }
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

function translateCliMessage(message) {
  let text = String(message || "");
  if (!isTr()) return text;
  return text
    .replace("No action needed.", "Ek aksiyon gerekmiyor.")
    .replace("Review attention items; they do not necessarily mean Codex Chef install is broken.", "Dikkat maddelerini inceleyin; bunlar her zaman Codex Chef kurulumunun bozuk olduğu anlamına gelmez.")
    .replace("git status --short is clean.", "git status --short temiz.")
    .replace(/git status --short reports (\d+) changed line\(s\)\./, "git status --short $1 değişen satır bildiriyor.")
    .replace("Runtime, MCP, Git, routing, and log metadata checks.", "Kurulu ortam, MCP, Git, yönlendirme ve log metadata kontrolleri.")
    .replace("Fast repo health without installed runtime probes.", "Kurulu ortam probu olmadan hızlı repo sağlığı.")
    .replace("Repo doctor plus install/runtime expectations.", "Repo doctor ve kurulum/kurulu ortam beklentileri.")
    .replace("Source/runtime managed file, agent, MCP, and skill parity.", "Kaynak/kurulu ortam yönetilen dosya, agent, MCP ve skill eşliği.")
    .replace("Read-only count before asking for any process stop.", "Herhangi bir süreç durdurma onayı istemeden önce yazmasız sayım.")
    .replace("Recent repo-local CLI log metadata; file contents are not printed.", "Son repo-local CLI log metadata'si; dosya içeriği basılmaz.")
    .replace("Backup archive inventory and restore/delete preview entry points.", "Yedek arşiv envanteri ve restore/delete preview girişleri.")
    .replace("Shows drift repair actions before any backup-backed write.", "Yedekli write öncesi drift onarım adımlarını gösterir.")
    .replace("Shows repo/global refresh plan and validation gates without changing managed files.", "Managed dosyaları değiştirmeden repo/global refresh planı ve validation gate'lerini gösterir.")
    .replace("Agent, skill, MCP, and wait-policy routing contract.", "Agent, skill, MCP ve bekleme politikası yönlendirme kontratı.");
}

function translateSetupHint(message) {
  if (!isTr()) return String(message || "");
  return String(message || "")
    .replace("No credential or extra input is required.", "Kimlik bilgisi veya ek girdi gerekmez.")
    .replace("Requires npm/npx network access on first startup; no credential is required.", "İlk çalışmada npm/npx ağ erişimi gerekir; kimlik bilgisi gerekmez.")
    .replace("Requires npm/npx network access and local browser control; no credential is required.", "npm/npx ağ erişimi ve lokal browser kontrolü gerekir; kimlik bilgisi gerekmez.")
    .replace("Requires npm/npx network access and starts an isolated Chrome/DevTools bridge; no credential is required.", "npm/npx ağ erişimi gerekir ve izole Chrome/DevTools köprüsü başlatır; kimlik bilgisi gerekmez.")
    .replace("Requires uvx and the pinned Serena git source; disable if uvx is unavailable.", "uvx ve pinlenmiş Serena git kaynağı gerekir; uvx yoksa kapalı tutun.")
    .replace("No credential is required; use only for non-secret local memory.", "Kimlik bilgisi gerekmez; yalnız gizli olmayan lokal memory için kullanın.")
    .replace("Requires Node/npx first-run package download; keeps local repository graph state on this machine. Indexing, destructive graph, and admin tools stay prompt-gated or disabled.", "İlk çalışmada Node/npx paket indirmesi gerekir; lokal repo graph state'i bu makinede kalır. Indexing, destructive graph ve admin tool'ları prompt-gated veya disabled kalır.")
    .replace("Requires Node/npx first-run package download; indexes local repositories into a persistent graph. Enable only for tasks that need graph-backed code intelligence.", "İlk çalışmada Node/npx paket indirmesi gerekir; lokal repoları kalıcı bir grafa indexler. Yalnız graph destekli code intelligence gereken işlerde açın.")
    .replace("Choose a deliberate local root path in config args before enabling.", "Açmadan önce config argümanlarında bilinçli bir lokal kök path seçin.")
    .replace("Requires GitHub/Copilot account authorization; keep disabled until private GitHub context is needed.", "GitHub/Copilot hesap yetkilendirmesi gerekir; private GitHub context gerekene kadar kapalı tutun.")
    .replace("Requires Figma account or workspace authorization.", "Figma hesap veya workspace yetkilendirmesi gerekir.")
    .replace("Requires Linear workspace authorization.", "Linear workspace yetkilendirmesi gerekir.")
    .replace("Requires Notion workspace authorization.", "Notion workspace yetkilendirmesi gerekir.")
    .replace("Requires Sentry organization authorization and may expose production error data.", "Sentry organization yetkilendirmesi gerekir ve production hata verisini açığa çıkarabilir.")
    .replace("Requires Vercel account/team authorization and may expose project or deployment data.", "Vercel hesap/team yetkilendirmesi gerekir ve proje veya deployment verisini açığa çıkarabilir.")
    .replace("Set SUPABASE_DB_URL in the shell environment, then add a task-specific local launcher only after explicit database approval; never commit the value.", "Shell ortamında SUPABASE_DB_URL ayarlayın; task-specific lokal launcher'ı yalnızca açık database onayından sonra ekleyin ve değeri asla commit etmeyin.");
}

function scanRecentCliLogSignals(logs) {
  const patterns = [
    { kind: "failure", pattern: /^(?:Failure|Error|Hata):|Overall:\s*fail\b|Status:\s*fail\b|exitCode=(?!0\b)|\b(?:EPERM|ETIMEDOUT)\b|Command failed/i },
    { kind: "warning", pattern: /^(?:Warning|Uyari):|\[warn\]|Overall:\s*warning\b/i },
    { kind: "attention", pattern: /^(?:Attention|Dikkat):|Overall:\s*attention\b|Repo Git:\s*attention\b|Codex CLI:\s*attention\b|Codex doctor checks:\s*attention\b/i },
    { kind: "legacy-raw-value", pattern: /\b(none|null|not_checked|configured_unverified|skipped\/skipped|MCP 0)\b/i }
  ];
  const counts = Object.fromEntries(patterns.map((item) => [item.kind, 0]));
  const newest = [];
  for (const log of logs) {
    const filePath = path.join(root, log.file);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      for (const item of patterns) {
        if (!item.pattern.test(line)) continue;
        counts[item.kind] += 1;
        if (newest.length < 8) {
          newest.push({
            file: log.file,
            kind: item.kind,
            line: truncateVisual(redactSensitiveOutput(line.trim()), 120)
          });
        }
      }
    }
  }
  return {
    scannedFiles: logs.length,
    counts,
    newest,
    rawContentsPrinted: false
  };
}

function printLogSignalSummary(signalSummary) {
  console.log(`${styleLabel(localText("Historical log signal scan", "Geçmiş log sinyal taraması"))}: ${localText(
    `${signalSummary.scannedFiles} recent files; failures=${signalSummary.counts.failure}, warnings=${signalSummary.counts.warning}, attention=${signalSummary.counts.attention}, legacy raw values=${signalSummary.counts["legacy-raw-value"]}`,
    `${signalSummary.scannedFiles} son dosya; hata=${signalSummary.counts.failure}, uyarı=${signalSummary.counts.warning}, dikkat=${signalSummary.counts.attention}, eski ham değer=${signalSummary.counts["legacy-raw-value"]}`
  )}`);
  console.log(styleMuted(localText(
    "These counts are historical log evidence; current health is reported by Status and Doctor.",
    "Bu sayılar geçmiş log kanıtıdır; güncel sağlık Durum ve Doctor tarafından raporlanır."
  )));
}

function diagnosticCommandRows() {
  return [
    {
      area: localText("Repo status", "Repo durumu"),
      command: "npm run chef -- --status --repo-only --no-log",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Fast repo health without installed runtime probes.", "Kurulu runtime probu olmadan hızlı repo sağlığı.")
    },
    {
      area: localText("Full status", "Tam durum"),
      command: "npm run chef -- --status --no-log",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Runtime, MCP, Git, routing, and log metadata checks.", "Runtime, MCP, Git, routing ve log metadata kontrolleri.")
    },
    {
      area: "Doctor",
      command: "npm run chef -- --doctor --no-log",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Repo doctor plus install/runtime expectations.", "Repo doctor ve kurulum/runtime beklentileri.")
    },
    {
      area: localText("Routing", "Yönlendirme"),
      command: "npm run chef -- --routing --no-log",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Agent, skill, MCP, and wait-policy routing contract.", "Agent, skill, MCP ve bekleme politikası routing kontratı.")
    },
    {
      area: localText("Update preview", "Güncelleme preview"),
      command: "npm run chef -- --update --no-log",
      writes: localText("Read-only until --apply", "--apply yoksa yazmaz"),
      reason: localText("Shows repo/global refresh plan and validation gates without changing managed files.", "Managed dosyaları değiştirmeden repo/global refresh planı ve validation gate'lerini gösterir.")
    },
    {
      area: localText("Repair preview", "Onarım preview"),
      command: "npm run chef -- --repair --no-log",
      writes: localText("Read-only until --apply", "--apply yoksa yazmaz"),
      reason: localText("Shows drift repair actions before any backup-backed write.", "Yedekli write öncesi drift onarım adımlarını gösterir.")
    },
    {
      area: localText("Backups", "Yedekler"),
      command: "npm run chef -- --backups --no-log",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Backup archive inventory and restore/delete preview entry points.", "Yedek arşiv envanteri ve restore/delete preview girişleri.")
    },
    {
      area: localText("CLI logs", "CLI logları"),
      command: "npm run chef -- --logs --no-log",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Recent repo-local CLI log metadata; file contents are not printed.", "Son repo-local CLI log metadata'si; dosya içeriği basılmaz.")
    },
    {
      area: localText("Runtime parity", "Runtime eşliği"),
      command: "npm run verify:install:runtime -- --expect-skills --redact-paths",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Source/runtime managed file, agent, MCP, and skill parity.", "Source/runtime managed file, agent, MCP ve skill eşliği.")
    },
    {
      area: localText("Serena/MCP process audit", "Serena/MCP süreç denetimi"),
      command: "npm run chef -- --processes --no-log",
      writes: localText("Read-only", "Yazmaz"),
      reason: localText("Read-only count before asking for any process stop.", "Herhangi bir süreç durdurma onayı istemeden önce read-only sayım.")
    }
  ];
}

const PROCESS_AUDIT_GROUPS = {
  codex: new Set(["codex", "codex-command-runner", "codex-command-runner-0.141.0"]),
  mcp: new Set(["serena", "uvx", "python", "python3", "node"]),
  browser: new Set(["chrome", "chromium", "msedge"]),
  tunnel: new Set(["cloudflared", "ngrok", "ssh", "tailscale", "wstunnel", "lt", "localtunnel"])
};

const PROCESS_AUDIT_NAMES = new Set(Object.values(PROCESS_AUDIT_GROUPS).flatMap((group) => [...group]));

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
  const groupCounts = Object.fromEntries(Object.keys(PROCESS_AUDIT_GROUPS).map((group) => [group, 0]));
  if (collected.ok) {
    for (const name of collected.names) {
      if (!PROCESS_AUDIT_NAMES.has(name)) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
      for (const [group, names] of Object.entries(PROCESS_AUDIT_GROUPS)) {
        if (names.has(name)) groupCounts[group] += 1;
      }
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
    groupCounts,
    tunnelStatus: groupCounts.tunnel > 0 ? "open" : "closed",
    total: matches.reduce((sum, entry) => sum + entry.count, 0),
    error: collected.ok ? null : redactSensitiveOutput(collected.error || ""),
    safety: isTr()
      ? [
          "Yazmasız süreç sayımı.",
          "Hiçbir süreç durdurulmaz veya kill edilmez.",
          "Tünel süreçleri yalnız açık/kapalı kanıtı olarak raporlanır.",
          "Kalıcı MCP, browser, tünel, Serena, Python veya Node süreçlerini durdurmadan önce onay isteyin."
        ]
      : [
          "Read-only process count.",
          "No process is stopped or killed.",
          "Tunnel processes are reported as open/closed evidence only.",
          "Ask before stopping persistent MCP, browser, tunnel, Serena, Python, or Node processes."
        ]
  };
}

function runProcesses() {
  const payload = processAuditPayload();
  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return { ok: true };
  }

  printSurfaceHeader(
    localText("Process audit", "Süreç denetimi"),
    localText("Read-only count. No process is stopped, killed, or cleaned from this screen.", "Yazmasız sayım. Bu ekranda hiçbir süreç durdurulmaz, kill edilmez veya temizlenmez."),
    ICONS.docs
  );
  printSurfaceNote(localText("Command", "Komut"), payload.command);
  if (payload.error) {
    console.log(`${ICONS.warn} ${localText("Process audit could not run:", "Süreç denetimi çalışamadı:")} ${payload.error}`);
    return { ok: true };
  }
  console.log(`${styleLabel(localText("Total matching processes", "Eşleşen toplam süreç"))}: ${payload.total}`);
  console.log(`${styleLabel(localText("Tunnel processes", "Tünel süreçleri"))}: ${payload.groupCounts.tunnel} (${localText(payload.tunnelStatus === "open" ? "open" : "closed", payload.tunnelStatus === "open" ? "açık" : "kapalı")})`);
  console.log(`${styleLabel(localText("MCP/runtime processes", "MCP/runtime süreçleri"))}: ${payload.groupCounts.mcp}`);
  console.log(`${styleLabel(localText("Browser processes", "Browser süreçleri"))}: ${payload.groupCounts.browser}`);
  printRows(
    payload.matches,
    isTr()
      ? [
          { key: "name", label: "Süreç" },
          { key: "count", label: "Adet" }
        ]
      : [
          { key: "name", label: "Process" },
          { key: "count", label: "Count" }
        ],
    localText("No Codex, MCP, browser, tunnel, Python, or Node processes matched.", "Codex, MCP, browser, tünel, Python veya Node süreci eşleşmedi.")
  );
  console.log("");
  console.log(styleHeading(localText("Safety notes", "Güvenlik notları")));
  for (const item of payload.safety) console.log(`- ${item}`);
  return { ok: true };
}

function runDiagnostics() {
  const commands = diagnosticCommandRows();
  const logs = recentCliLogs(12);
  const logSignals = scanRecentCliLogSignals(logs);
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
    logSignals,
    commands,
    recentLogs: logs,
    safety: [
    localText("Read-only by default.", "Varsayılan olarak yazmasız."),
    localText("Use --apply only on explicit install, update, repair, restore, or delete flows.", "--apply yalnız açık install, update, repair, restore veya delete akışlarında kullanılır."),
    localText("Ask before stopping persistent MCP/browser/process state.", "Kalıcı MCP/browser/süreç durumunu durdurmadan önce onay isteyin.")
    ]
  };

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return { ok: true };
  }

  printSurfaceHeader(
    localText("Diagnostics hub", "Tanılama merkezi"),
    localText("Read-only evidence hub. It reports safe commands, log metadata, backups, and cleanup notes without changing global files.", "Yazmasız kanıt merkezi. Global dosya değiştirmeden güvenli komutları, log metadata bilgisini, yedekleri ve temizlik notlarını raporlar."),
    ICONS.docs
  );
  printSurfaceNote(localText("Log root", "Log kök dizini"), payload.logRoot);
  printSurfaceNote(localText("Backup root", "Yedek kök dizini"), payload.backupRoot);
  console.log("");
  console.log(styleHeading(localText("Current health", "Canlı sağlık")));
  console.log(`${styleLabel(localText("Overall", "Genel"))}: ${displayValue(payload.status.overall)}`);
  if (payload.status.git?.summary) {
    console.log(`${styleLabel("Git")}: ${translateCliMessage(payload.status.git.summary)}`);
  }
  if (payload.attentionReasons.length > 0) {
    console.log(`${ICONS.warn} ${localText("Attention reasons:", "Dikkat nedenleri:")}`);
    for (const reason of payload.attentionReasons) console.log(`- ${translateCliMessage(reason)}`);
  } else {
    console.log(`${ICONS.ok} ${localText("No repo-only attention reasons.", "Repo-only dikkat nedeni yok.")}`);
  }
  console.log(`${styleLabel(localText("Backups", "Yedekler"))}: ${payload.backupSummary.count}${payload.backupSummary.latestRestorable ? `; ${localText("latest restorable", "son geri yüklenebilir")}: ${payload.backupSummary.latestRestorable.id}` : ""}`);
  console.log(`${styleLabel(localText("CLI logs", "CLI logları"))}: ${payload.logSummary.count}${payload.logSummary.latest ? `; ${localText("latest", "son")}: ${payload.logSummary.latest.file}` : ""}`);
  printLogSignalSummary(payload.logSignals);
  console.log("");
  console.log(styleHeading(localText("Next safe actions", "Sonraki güvenli adımlar")));
  for (const action of payload.nextActions.slice(0, 6)) console.log(`- ${translateCliMessage(action)}`);
  console.log("");
  console.log(styleHeading(localText("Diagnostic evidence commands", "Tanılama kanıt komutları")));
  printRows(
    commands,
    isTr()
      ? [
          { key: "area", label: "Alan" },
          { key: "command", label: "Komut" },
          { key: "writes", label: "Etki" },
          { key: "reason", label: "Neden" }
        ]
      : [
          { key: "area", label: "Area" },
          { key: "command", label: "Command" },
          { key: "writes", label: "Impact" },
          { key: "reason", label: "Why" }
        ]
  );
  console.log("");
  console.log(styleHeading(localText("Recent historical log signals", "Son geçmiş log sinyalleri")));
  printRows(
    payload.logSignals.newest,
    isTr()
      ? [
          { key: "kind", label: "Tür" },
          { key: "file", label: "Dosya" },
          { key: "line", label: "Satır" }
        ]
      : [
          { key: "kind", label: "Signal" },
          { key: "file", label: "File" },
          { key: "line", label: "Line" }
        ],
    localText("No fail/warn/attention signals in scanned recent logs.", "Taranan son loglarda fail/warn/attention sinyali yok.")
  );
  console.log(styleMuted(localText(
    "Raw log contents stay local and are not printed by diagnostics.",
    "Raw log içeriği lokal kalır ve diagnostics tarafından basılmaz."
  )));
  console.log("");
  console.log(styleHeading(localText("Recent CLI logs", "Son CLI logları")));
  printRecentCliLogs(logs);
  console.log("");
  console.log(styleHeading(localText("Lifecycle cleanup notes", "Lifecycle temizlik notları")));
  console.log(`- ${localText("Use /agent to inspect and close completed agent threads.", "Tamamlanan agent thread'lerini incelemek ve kapatmak için /agent kullan.")}`);
  console.log(`- ${localText("Use /ps and /stop for live Codex tasks before starting another long operation.", "Yeni uzun işleme başlamadan önce live Codex task'ları için /ps ve /stop kullan.")}`);
  console.log(`- ${localText("If Serena, browser, or MCP processes persist, audit first and ask before stopping them.", "Serena, browser veya MCP süreçleri kalırsa önce denetle ve durdurmadan önce onay iste.")}`);
  console.log(`- ${localText("Do not paste raw logs publicly; redaction covers common tokens but local logs can still contain machine context.", "Raw logları public paylaşma; redaction yaygın tokenları kapsar ama lokal loglar makine bağlamı içerebilir.")}`);
  return { ok: true };
}

function runLogs() {
  const logs = recentCliLogs(12);
  printSurfaceHeader(
    localText("Recent logs", "Son loglar"),
    localText("Metadata and signal counts only. Raw log contents stay local.", "Yalnız metadata ve sinyal sayıları. Raw log içeriği lokal kalır."),
    ICONS.logs
  );
  printLogSignalSummary(scanRecentCliLogSignals(logs));
  console.log(styleMuted(localText(
    "Raw log contents stay local; this screen shows metadata and signal counts only.",
    "Raw log içeriği lokal kalır; bu ekran yalnız metadata ve sinyal sayılarını gösterir."
  )));
  console.log("");
  printRecentCliLogs(logs);
  return { ok: true };
}

async function runAction(action, interaction = {}) {
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
      return runUpdate(interaction);
    case "reset":
      return runReset(interaction);
    case "install":
      return runInstall(interaction);
    case "repair":
      return runRepair(interaction);
    case "backups":
      return runBackups(interaction);
    case "skills":
      return runSkills(interaction);
    case "mcp":
      return runMcp(interaction);
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
      return normalizeQuestionAbort(async () => {
        process.stdout.write(prompt);
        const answer = scriptedMenu.length > 0 ? scriptedMenu.shift() : "q";
        if (answer === "__ABORT__") throw questionAbortError();
        return answer;
      });
    }
    return readQuestion(rl, prompt);
  };
  const interaction = { question, fromMenu: true };
  try {
    let shouldRenderMenu = true;
    while (true) {
      if (shouldRenderMenu) {
        printMenu();
        shouldRenderMenu = false;
      }
      const answer = await question(operatorPrompt());
      const normalizedAnswer = answer.trim().toLowerCase();
      if (!normalizedAnswer) {
        console.log(`${ICONS.warn} ${localText(`Choose 1-${MENU_ITEMS.length}, l for language, or q to quit.`, `1-${MENU_ITEMS.length} arasında bir işlem seçin, dil için l, çıkış için q yazın.`)}`);
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
        console.log(`${ICONS.warn} ${localText(`Choose 1-${MENU_ITEMS.length}, l for language, or q to quit.`, `1-${MENU_ITEMS.length} arasında bir işlem seçin, dil için l, çıkış için q yazın.`)}`);
        continue;
      }
      if (item.id === "exit") break;
      printActionStart(item);
      const result = await runAction(item.id, interaction);
      printActionEnd(item, result);
      if (item.id !== "language") await pauseBeforeMenu(question);
      else console.log("");
      shouldRenderMenu = true;
    }
  } finally {
    if (rl) rl.close();
  }
}

try {
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
} catch (error) {
  if (!isUserInterrupt(error)) throw error;
  console.log("");
  console.log(`${ICONS.info} ${localText("Interrupted by user.", "Kullanici tarafindan kesildi.")}`);
  process.exitCode = 130;
}
