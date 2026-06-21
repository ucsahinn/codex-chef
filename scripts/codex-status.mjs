#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const args = process.argv.slice(2);

const options = {
  json: false,
  redactPaths: false,
  expectSkills: false,
  expectGitGuards: false,
  skipRuntime: false,
  skipCodexDoctorChecks: false,
  skipCodexCli: false,
  output: null,
  forceOutput: false,
  codexHome: process.env.CODEX_HOME || path.join(os.homedir(), ".codex"),
  agentsHome: process.env.AGENTS_HOME || path.join(os.homedir(), ".agents")
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--json") options.json = true;
  else if (arg === "--redact-paths") options.redactPaths = true;
  else if (arg === "--expect-skills") options.expectSkills = true;
  else if (arg === "--expect-git-guards") options.expectGitGuards = true;
  else if (arg === "--repo-only") {
    options.skipRuntime = true;
    options.skipCodexDoctorChecks = true;
    options.skipCodexCli = true;
  }
  else if (arg === "--skip-runtime") options.skipRuntime = true;
  else if (arg === "--skip-codex-doctor-checks") options.skipCodexDoctorChecks = true;
  else if (arg === "--skip-codex-cli") options.skipCodexCli = true;
  else if (arg === "--force-output") options.forceOutput = true;
  else if (arg === "--output") {
    options.output = args[index + 1];
    index += 1;
  } else if (arg === "--codex-home") {
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
  console.log(`Usage: node scripts/codex-status.mjs [options]

Read-only end-user status board for Codex Chef.

Options:
  --json                       Emit machine-readable JSON
  --output <path>              Write the JSON report inside this repository
  --force-output               Allow --output to replace an existing report
  --expect-skills              Fail runtime status if curated global skills are missing
  --expect-git-guards          Fail runtime status if optional Git guards are missing
  --repo-only                  Skip installed runtime, Codex doctor, and live Codex CLI probes
  --skip-runtime               Skip installed runtime verification
  --skip-codex-doctor-checks   Skip direct Codex CLI doctor check summary
  --skip-codex-cli             Skip Codex CLI version/login/MCP probes
  --codex-home <path>          Installed Codex home to inspect
  --agents-home <path>         Installed Agents home to inspect
  --redact-paths               Redact home and repository paths in output
`);
}

const progressEnabled = !options.json;
if (progressEnabled) {
  console.log("Codex Chef status");
  console.log(options.skipRuntime && options.skipCodexDoctorChecks && options.skipCodexCli
    ? "Collecting local repository checks; installed runtime, global skill-root inventory, Codex log metadata, and live Codex CLI probes are skipped."
    : "Collecting repo, runtime, Codex CLI, MCP, Git, and log metadata checks; this can take 30-60 seconds.");
}

function progress(message) {
  if (progressEnabled) console.log(`[status] ${message}`);
}

function skipInstalledRuntimeAndCliMetadata() {
  return options.skipRuntime && options.skipCodexCli;
}

function redact(value) {
  if (!options.redactPaths || typeof value !== "string") return value;
  const home = os.homedir();
  const escapedHome = home.replaceAll("\\", "\\\\");
  const escapedRoot = root.replaceAll("\\", "\\\\");
  return value
    .replaceAll(home, "${HOME}")
    .replaceAll(escapedHome, "${HOME}")
    .replaceAll(home.replaceAll("\\", "/"), "${HOME}")
    .replaceAll(root, "${REPO}")
    .replaceAll(escapedRoot, "${REPO}")
    .replaceAll(root.replaceAll("\\", "/"), "${REPO}")
    .replace(/[A-Za-z]:\\Users\\[^\\/]+/g, "${OTHER_USERPROFILE}")
    .replace(/[A-Za-z]:\\\\Users\\\\[^\\/]+/g, "${OTHER_USERPROFILE}")
    .replace(/[A-Za-z]:\/Users\/[^\\/]+/g, "${OTHER_USERPROFILE}");
}

function redactDeep(value) {
  if (typeof value === "string") return redact(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactDeep(item)]));
  }
  return value;
}

function humanStatusValue(value, context = "") {
  if (value === undefined || value === null || value === "") return "not inspected";
  const text = String(value);
  const normalized = text.trim().toLowerCase();
  const replacements = {
    none: context === "skillMode" ? "profile-specific; some profiles do not need skills" : "not applicable",
    "not_checked_here": "not checked in this status run",
    "not_inferred_from_catalog": "not inferred from catalog",
    skipped: "skipped by this mode",
    true: "enabled",
    false: "disabled"
  };
  return replacements[normalized] || text;
}

function humanList(values, context = "") {
  const list = (values || []).map((value) => humanStatusValue(value, context));
  return list.length ? list.join(", ") : "not configured";
}

function run(command, commandArgs, extra = {}) {
  const executable = process.platform === "win32" && command.endsWith(".cmd") ? "cmd.exe" : command;
  const argsForSpawn = process.platform === "win32" && command.endsWith(".cmd")
    ? ["/d", "/s", "/c", command, ...commandArgs]
    : commandArgs;
  return spawnSync(executable, argsForSpawn, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: extra.timeout || 120000,
    windowsHide: true,
    env: extra.env || process.env
  });
}

function runNodeScript(script, scriptArgs, label) {
  progress(`running ${label} (timeout 120s)`);
  const result = run(process.execPath, [script, ...scriptArgs], { timeout: 120000 });
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  if (result.error) {
    return { inspected: false, status: "fail", failures: [`${label} could not run: ${result.error.message}`] };
  }
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout || "{}");
  } catch (error) {
    return {
      inspected: false,
      status: "fail",
      failures: [`${label} did not emit parseable JSON: ${error.message}`],
      output: redact(output)
    };
  }
  return {
    inspected: true,
    exitCode: result.status,
    status: parsed.status || (result.status === 0 ? "ok" : "fail"),
    report: parsed,
    failures: parsed.failures || []
  };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function safeStat(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function listRecentFiles(dir, extensions = null, limit = 8) {
  if (!fs.existsSync(dir)) return { exists: false, recent: [] };
  const recent = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => {
      if (!extensions) return true;
      return extensions.some((extension) => entry.name.endsWith(extension));
    })
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      const stat = safeStat(fullPath);
      if (!stat) return null;
      return {
        file: redact(fullPath),
        name: entry.name,
        size: stat.size,
        modified: stat.mtime.toISOString()
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.modified.localeCompare(a.modified))
    .slice(0, limit);
  return { exists: true, recent };
}

function readInstalledOrTemplateConfig() {
  const installedPath = path.join(options.codexHome, "config.toml");
  const template = readTemplateConfig();
  const templatePath = template.rawPath;
  const configPath = fs.existsSync(installedPath) ? installedPath : templatePath;
  return {
    path: redact(configPath),
    source: fs.existsSync(installedPath) ? "installed" : "template",
    text: fs.readFileSync(configPath, "utf8")
  };
}

function readTemplateConfig() {
  const templatePath = process.platform === "win32"
    ? path.join(root, "templates/codex/config.windows.toml")
    : path.join(root, "templates/codex/config.unix.toml");
  return {
    rawPath: templatePath,
    path: redact(templatePath),
    source: "template",
    text: fs.readFileSync(templatePath, "utf8")
  };
}

function readTomlValue(text, dottedKey) {
  const parts = dottedKey.split(".");
  const key = parts.pop();
  const section = parts.length > 0 ? parts.join(".").replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null;
  const keyPattern = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const body = section
    ? text.match(new RegExp(`\\[${section}\\]\\s*([\\s\\S]*?)(?=\\n\\[|$)`))?.[1] || ""
    : text;
  const match = body.match(new RegExp(`^\\s*${keyPattern}\\s*=\\s*([^\\n#]+)`, "m"));
  if (!match) return null;
  const raw = match[1].trim().replace(/,$/, "");
  if (raw === "true") return true;
  if (raw === "false") return false;
  const quoted = raw.match(/^"([\s\S]*)"$/);
  if (quoted) return quoted[1];
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : raw;
}

function expandUserPath(value, fallback) {
  if (!value || typeof value !== "string") return fallback;
  let expanded = value
    .replaceAll("$CODEX_HOME", options.codexHome)
    .replaceAll("${CODEX_HOME}", options.codexHome)
    .replaceAll("%CODEX_HOME%", options.codexHome)
    .replaceAll("$HOME", os.homedir())
    .replaceAll("${HOME}", os.homedir())
    .replaceAll("%USERPROFILE%", os.homedir());
  if (expanded === "~" || expanded.startsWith(`~${path.sep}`) || expanded.startsWith("~/")) {
    expanded = path.join(os.homedir(), expanded.slice(2));
  }
  return path.resolve(expanded);
}

function codexCommand() {
  if (process.env.CODEX_STATUS_CODEX_COMMAND) return process.env.CODEX_STATUS_CODEX_COMMAND;
  return process.platform === "win32" ? "codex.cmd" : "codex";
}

function inspectSkillInventory(skipGlobal = false) {
  const expected = readJson("catalog/skills.json")
    .skills
    .filter((skill) => skill.install === true)
    .map((skill) => skill.name)
    .sort();
  if (skipGlobal) {
    return {
      inspected: false,
      status: "skipped",
      expected: expected.length,
      installed: null,
      missing: [],
      extraCount: null,
      roots: [],
      note: "Skipped installed/global skill roots because installed-runtime and live Codex CLI probes are disabled."
    };
  }
  const roots = [
    path.join(options.codexHome, "skills"),
    path.join(options.agentsHome, "skills")
  ];
  const expectedSet = new Set(expected);
  const actual = new Set();
  const rootCounts = [];
  for (const skillRoot of roots) {
    let count = 0;
    if (!fs.existsSync(skillRoot)) {
      rootCounts.push({ path: redact(skillRoot), exists: false, count });
      continue;
    }
    for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) actual.add(entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".")) count += 1;
    }
    rootCounts.push({ path: redact(skillRoot), exists: true, count });
  }
  const missing = expected.filter((skill) => !actual.has(skill));
  const extraCount = [...actual].filter((skill) => !expectedSet.has(skill)).length;
  return {
    inspected: true,
    expected: expected.length,
    installed: actual.size,
    missing,
    extraCount,
    roots: rootCounts
  };
}

function inspectRoutingBoard() {
  const catalog = readJson("catalog/routing-profiles.json");
  const profiles = catalog.profiles || [];
  return {
    inspected: true,
    sourcePolicy: catalog.sourcePolicy,
    profileCount: profiles.length,
    profileIds: profiles.map((profile) => profile.id),
    requiredSurfaces: {
      agents: [...new Set(profiles.flatMap((profile) => profile.agents || []))].sort(),
      skills: [...new Set(profiles.flatMap((profile) => profile.skills || []))].sort(),
      mcp: [...new Set(profiles.flatMap((profile) => profile.mcp || []))].sort(),
      flags: [...new Set(profiles.flatMap((profile) => profile.flags || []))].sort(),
      delegationModes: [...new Set(profiles.map((profile) => profile.delegationMode))].sort(),
      skillModes: [...new Set(profiles.map((profile) => profile.skillMode))].sort(),
      mcpModes: [...new Set(profiles.map((profile) => profile.mcpMode))].sort()
    },
    boundary: "Routing profiles are guidance and status evidence, not hidden execution hooks; destructive, credentialed, publishing, deployment, database, and broad filesystem actions remain approval-gated."
  };
}

function inspectMcpSetupBoard() {
  const catalog = readJson("catalog/mcp-servers.json");
  const servers = catalog.servers || [];
  const enabled = servers.filter((server) => server.defaultEnabled === true);
  const disabled = servers.filter((server) => server.defaultEnabled !== true);
  const setupRequired = servers.filter((server) => !["none", "local-state"].includes(server.setupKind));

  return {
    inspected: true,
    sourcePolicy: catalog.sourcePolicy,
    evidenceBoundary: {
      catalog: "cataloged in catalog/mcp-servers.json",
      installedConfig: "configured only after templates or installed config are inspected",
      live: "verified only after /mcp or `codex mcp list --json` succeeds",
      sessionVisible: "visible in the active Codex session only through /mcp or equivalent live tooling"
    },
    serverCount: servers.length,
    enabledByDefault: enabled.map((server) => server.name),
    disabledByDefault: disabled.map((server) => server.name),
    setupRequiredCount: setupRequired.length,
    servers: servers.map((server) => ({
      name: server.name,
      category: server.category,
      enabledByDefault: server.defaultEnabled === true,
      auth: server.auth,
      approval: server.approval,
      risk: server.risk,
      setupKind: server.setupKind,
      setupHint: server.setupHint,
      defaultReason: server.defaultReason,
      evidenceState: {
        cataloged: true,
        installedConfig: "not_inferred_from_catalog",
        liveCodexMcpList: "not_checked_here",
        sessionVisible: "not_checked_here"
      },
      rollback: "Set enabled=false for the connector in Codex config and restart Codex."
    }))
  };
}

function inspectEffectiveControls(skipInstalled = false) {
  const config = skipInstalled ? readTemplateConfig() : readInstalledOrTemplateConfig();
  const text = config.text;
  const managedHooks = skipInstalled
    ? null
    : fs.existsSync(path.join(options.codexHome, "hooks"))
    ? fs.readdirSync(path.join(options.codexHome, "hooks"), { withFileTypes: true }).filter((entry) => entry.isFile()).length
    : 0;

  return {
    inspected: true,
    configSource: config.source,
    configPath: config.path,
    approvalPolicy: readTomlValue(text, "approval_policy"),
    sandboxMode: readTomlValue(text, "sandbox_mode"),
    workspaceNetwork: readTomlValue(text, "sandbox_workspace_write.network_access"),
    features: {
      apps: readTomlValue(text, "features.apps"),
      memories: readTomlValue(text, "features.memories"),
      hooks: readTomlValue(text, "features.hooks"),
      multiAgent: readTomlValue(text, "features.multi_agent")
    },
    agents: {
      maxThreads: readTomlValue(text, "agents.max_threads"),
      maxDepth: readTomlValue(text, "agents.max_depth")
    },
    appsDefault: {
      enabled: readTomlValue(text, "apps._default.enabled"),
      destructiveEnabled: readTomlValue(text, "apps._default.destructive_enabled"),
      openWorldEnabled: readTomlValue(text, "apps._default.open_world_enabled")
    },
    managedHooks,
    hookNote: skipInstalled
      ? "Repo-only mode reports template controls and does not inspect installed hooks."
      : managedHooks === 0
      ? "Codex Chef enables hooks support but ships no lifecycle hook files; inspect /hooks before relying on user or project hooks."
      : "Managed hook files are present; inspect them before release-sensitive work."
  };
}

function parseJsonCommand(command, commandArgs, label, extra = {}) {
  progress(`running ${label} (timeout ${Math.round((extra.timeout || 120000) / 1000)}s)`);
  const result = run(command, commandArgs, { timeout: extra.timeout || 120000, env: extra.env || process.env });
  const output = redact([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  if (result.error) {
    return {
      inspected: false,
      status: "attention",
      label,
      exitCode: null,
      summary: `${label} could not run: ${result.error.message}`,
      outputPreview: null
    };
  }
  if (result.status !== 0) {
    return {
      inspected: true,
      status: "attention",
      label,
      exitCode: result.status,
      summary: `${label} exited ${result.status}.`,
      outputPreview: output.split(/\r?\n/).slice(0, 6)
    };
  }
  try {
    return {
      inspected: true,
      status: "ok",
      label,
      exitCode: result.status,
      parsed: JSON.parse(result.stdout || "{}")
    };
  } catch (error) {
    return {
      inspected: true,
      status: "attention",
      label,
      exitCode: result.status,
      summary: `${label} did not emit parseable JSON: ${error.message}`,
      outputPreview: output.split(/\r?\n/).slice(0, 6)
    };
  }
}

function parseTextCommand(command, commandArgs, label, extra = {}) {
  progress(`running ${label} (timeout ${Math.round((extra.timeout || 120000) / 1000)}s)`);
  const result = run(command, commandArgs, { timeout: extra.timeout || 120000, env: extra.env || process.env });
  const output = redact([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  if (result.error) {
    return {
      inspected: false,
      status: "attention",
      label,
      exitCode: null,
      summary: `${label} could not run: ${result.error.message}`,
      outputPreview: null
    };
  }
  return {
    inspected: true,
    status: result.status === 0 ? "ok" : "attention",
    label,
    exitCode: result.status,
    outputPreview: output.split(/\r?\n/).filter(Boolean).slice(0, 6)
  };
}

function mcpEntriesFromParsed(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.servers)) return parsed.servers;
  if (Array.isArray(parsed?.mcp_servers)) return parsed.mcp_servers;
  if (parsed?.servers && typeof parsed.servers === "object") {
    return Object.entries(parsed.servers).map(([id, value]) => ({
      id,
      ...(value && typeof value === "object" ? value : { value })
    }));
  }
  if (parsed?.mcp_servers && typeof parsed.mcp_servers === "object") {
    return Object.entries(parsed.mcp_servers).map(([id, value]) => ({
      id,
      ...(value && typeof value === "object" ? value : { value })
    }));
  }
  return [];
}

function inspectCodexCliRuntime() {
  if (options.skipCodexCli) {
    return {
      inspected: false,
      status: "skipped",
      target: {
        codexHome: redact(options.codexHome),
        agentsHome: redact(options.agentsHome)
      },
      version: { inspected: false, status: "skipped", exitCode: null, outputPreview: [] },
      login: { inspected: false, status: "skipped", exitCode: null, outputPreview: [] },
      mcp: {
        inspected: false,
        status: "skipped",
        exitCode: null,
        configuredCount: 0,
        configuredServers: [],
        outputPreview: null
      },
      ambient: {
        inspected: false,
        relationshipToTarget: "skipped",
        codexHomeEnv: process.env.CODEX_HOME ? redact(process.env.CODEX_HOME) : null,
        version: { inspected: false, status: "skipped", exitCode: null, outputPreview: [] },
        login: { inspected: false, status: "skipped", exitCode: null, outputPreview: [] },
        mcp: {
          inspected: false,
          status: "skipped",
          exitCode: null,
          configuredCount: 0,
          configuredServers: [],
          outputPreview: null
        }
      },
      issues: [],
      note: "Skipped by --skip-codex-cli; this also skips live `codex mcp list --json` evidence."
    };
  }

  function inspectWithEnv(env, labelPrefix) {
    const version = parseTextCommand(codexCommand(), ["--strict-config", "--version"], `${labelPrefix} codex --strict-config --version`, { env });
    const login = parseTextCommand(codexCommand(), ["login", "status"], `${labelPrefix} codex login status`, { env });
    const mcp = parseJsonCommand(codexCommand(), ["mcp", "list", "--json"], `${labelPrefix} codex mcp list --json`, { env });
    const mcpEntries = mcpEntriesFromParsed(mcp.parsed);
    const mcpNames = mcpEntries
      .map((server) => server.name || server.id)
      .filter(Boolean)
      .sort();

    return { version, login, mcp, mcpNames };
  }

  const targetEnv = { ...process.env, CODEX_HOME: options.codexHome };
  const targetProbe = inspectWithEnv(targetEnv, "target");
  const ambientProbe = inspectWithEnv(process.env, "ambient");
  const { version, login, mcp, mcpNames } = targetProbe;
  const ambientMcpNames = ambientProbe.mcpNames;
  const ambientSameAsTarget = ambientProbe.login.status === login.status
    && ambientMcpNames.length === mcpNames.length
    && ambientMcpNames.every((name, index) => name === mcpNames[index]);
  const ambientRelationship = ambientProbe.login.inspected || ambientProbe.mcp.inspected
    ? (ambientSameAsTarget ? "same" : "different")
    : "unknown";

  const issues = [
    ...(version.status === "ok" ? [] : [version.summary || `${version.label} needs attention.`]),
    ...(login.status === "ok" ? [] : ["Codex login is not confirmed by `codex login status`; refresh auth outside repo files if needed."]),
    ...(mcp.status === "ok" ? [] : [mcp.summary || "`codex mcp list --json` needs attention."]),
    ...(ambientRelationship === "different"
      ? ["Ambient Codex CLI status differs from the explicit Codex Chef target; restart Codex or set CODEX_HOME for direct shell diagnostics."]
      : [])
  ];

  return {
    inspected: true,
    status: issues.length === 0 ? "ok" : "attention",
    target: {
      codexHome: redact(options.codexHome),
      agentsHome: redact(options.agentsHome)
    },
    version,
    login: {
      inspected: login.inspected,
      status: login.status,
      exitCode: login.exitCode,
      outputPreview: login.outputPreview
    },
    mcp: {
      inspected: mcp.inspected,
      status: mcp.status,
      exitCode: mcp.exitCode,
      configuredCount: mcpNames.length,
      configuredServers: mcpNames,
      outputPreview: mcp.outputPreview || null
    },
    ambient: {
      inspected: true,
      relationshipToTarget: ambientRelationship,
      codexHomeEnv: process.env.CODEX_HOME ? redact(process.env.CODEX_HOME) : null,
      version: {
        inspected: ambientProbe.version.inspected,
        status: ambientProbe.version.status,
        exitCode: ambientProbe.version.exitCode,
        outputPreview: ambientProbe.version.outputPreview
      },
      login: {
        inspected: ambientProbe.login.inspected,
        status: ambientProbe.login.status,
        exitCode: ambientProbe.login.exitCode,
        outputPreview: ambientProbe.login.outputPreview
      },
      mcp: {
        inspected: ambientProbe.mcp.inspected,
        status: ambientProbe.mcp.status,
        exitCode: ambientProbe.mcp.exitCode,
        configuredCount: ambientMcpNames.length,
        configuredServers: ambientMcpNames,
        outputPreview: ambientProbe.mcp.outputPreview || null
      }
    },
    issues,
    note: "Auth and MCP status use official Codex CLI commands; this script does not read auth.json, keyrings, OAuth caches, or token values."
  };
}

function inspectCliQuickStart() {
  return {
    inspected: true,
    interactiveMenu: "npm run chef",
    numberedActions: true,
    readOnlyCommands: [
      "npm run chef -- --status",
      "npm run chef -- --status --repo-only",
      "npm run chef -- --doctor",
      "npm run chef -- --preview",
      "npm run chef -- --update",
      "npm run chef -- --diagnostics",
      "npm run chef:diagnostics",
      "npm run chef -- --skills",
      "npm run chef -- --mcp",
      "npm run chef -- --auth",
      "npm run chef -- --logs",
      "npm run codex:status",
      "npm run codex:status:all"
    ],
    writeActionsRequireApply: [
      "npm run chef -- --install --apply",
      "npm run chef -- --update --apply",
      "npm run chef -- --reset --apply",
      "npm run chef -- --repair --apply",
      "npm run chef -- --skills --apply"
    ],
    auditMode: "npm run chef -- --status --repo-only --no-log",
    plainOutput: "npm run chef -- --plain",
    boundary: "Update, install, reset, repair, selected skill install, publish, deploy, credential, database, and destructive work still require explicit approval or --apply where supported."
  };
}

function inspectGitRepository() {
  const result = run("git", ["status", "--short"], { timeout: 30000 });
  const output = redact([result.stdout, result.stderr].filter(Boolean).join("\n").trim());
  if (result.error) {
    return {
      inspected: true,
      status: "attention",
      issueId: "git.unavailable",
      summary: `git status could not run: ${result.error.message}`,
      dirtyLineCount: null,
      outputPreview: null
    };
  }

  if (result.status !== 0) {
    const safeDirectory = /dubious ownership|safe\.directory/i.test(output);
    return {
      inspected: true,
      status: safeDirectory ? "attention" : "fail",
      issueId: safeDirectory ? "git.safe_directory" : "git.status_failed",
      summary: safeDirectory
        ? "Git refuses this checkout because Windows ownership differs from the current user."
        : `git status --short exited ${result.status}.`,
      remediation: safeDirectory
        ? `If you trust this checkout, run: git config --global --add safe.directory ${redact(root)}`
        : "Read the git status stderr and fix the repository state before release or push work.",
      dirtyLineCount: null,
      outputPreview: output.split(/\r?\n/).slice(0, 4)
    };
  }

  const dirtyLineCount = result.stdout
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .length;
  return {
    inspected: true,
    status: dirtyLineCount === 0 ? "ok" : "attention",
    issueId: null,
    summary: dirtyLineCount === 0
      ? "git status --short is clean."
      : `git status --short reports ${dirtyLineCount} changed line(s).`,
    dirtyLineCount,
    outputPreview: dirtyLineCount === 0 ? [] : result.stdout.split(/\r?\n/).filter(Boolean).slice(0, 8)
  };
}

function inspectRepoCliLog(logFile) {
  return {
    contentInspected: false,
    note: "Content is not inspected by status because command logs can contain local context."
  };
}

function inspectLogSummary(skipCodexLogs = false) {
  const repoLogDir = path.join(root, "tmp", "chef-cli", "logs");
  const repoCliLogs = listRecentFiles(repoLogDir, [".log"], 12);
  repoCliLogs.recent = repoCliLogs.recent.map((entry) => ({
    ...entry,
    ...inspectRepoCliLog(path.join(repoLogDir, entry.name))
  }));

  const config = skipCodexLogs ? null : readInstalledOrTemplateConfig();
  const configuredLogDir = config ? readTomlValue(config.text, "log_dir") : null;
  const codexLogDir = config ? expandUserPath(configuredLogDir, path.join(options.codexHome, "log")) : null;
  const codexLogs = skipCodexLogs ? { exists: false, recent: [] } : listRecentFiles(codexLogDir, [".log", ".jsonl"], 8);

  return {
    inspected: true,
    repoCliLogs: {
      path: redact(repoLogDir),
      exists: repoCliLogs.exists,
      recent: repoCliLogs.recent,
      contentInspected: false,
      note: "Repo-local Chef CLI logs are generated by this wrapper and have command output redacted."
    },
    codexLogs: {
      inspected: !skipCodexLogs,
      path: codexLogDir ? redact(codexLogDir) : null,
      configSource: config?.source || "skipped",
      exists: codexLogs.exists,
      recent: codexLogs.recent,
      contentInspected: false,
      note: skipCodexLogs
        ? "Skipped Codex log metadata because installed-runtime and live Codex CLI probes are disabled."
        : "Codex log contents are not read here because they can contain prompts or local context; this status only reports file metadata."
    }
  };
}

function summarizeCodexDoctor() {
  if (options.skipCodexDoctorChecks) {
    return { inspected: false, status: "skipped", note: "Skipped by --skip-codex-doctor-checks." };
  }

  const doctorEnv = { ...process.env, CODEX_HOME: options.codexHome };

  function inspectOnce() {
    const result = run(codexCommand(), ["doctor", "--json"], {
      env: doctorEnv,
      timeout: 120000
    });
    if (result.error) {
      return {
        inspected: false,
        status: "attention",
        failures: [],
        warnings: [`codex doctor --json could not run: ${result.error.message}`]
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(result.stdout || "{}");
    } catch (error) {
      return {
        inspected: false,
        status: "attention",
        failures: [],
        warnings: [`codex doctor --json did not emit parseable JSON: ${error.message}`]
      };
    }

    const checks = Object.values(parsed.checks || {});
    const counts = { ok: 0, warning: 0, fail: 0, other: 0 };
    for (const check of checks) {
      if (check.status === "ok") counts.ok += 1;
      else if (check.status === "warning") counts.warning += 1;
      else if (check.status === "fail") counts.fail += 1;
      else counts.other += 1;
    }

    const failedChecks = checks
      .filter((check) => check.status === "fail")
      .map((check) => ({
        id: check.id,
        summary: check.summary,
        remediation: check.remediation || null
      }));
    const warningChecks = checks
      .filter((check) => check.status === "warning")
      .map((check) => ({
        id: check.id,
        summary: check.summary,
        remediation: check.remediation || null
      }));
    const nonBlockingWarningIds = new Set(["network.websocket_reachability"]);
    const blockingWarningChecks = warningChecks.filter((check) => !nonBlockingWarningIds.has(check.id));
    const nonBlockingWarningChecks = warningChecks.filter((check) => nonBlockingWarningIds.has(check.id));

    return {
      inspected: true,
      status: counts.fail > 0 || blockingWarningChecks.length > 0 ? "attention" : "ok",
      exitCode: result.status,
      overallStatus: parsed.overallStatus || null,
      codexVersion: parsed.codexVersion || null,
      counts,
      failedChecks: redactDeep(failedChecks),
      warningChecks: redactDeep(warningChecks),
      blockingWarningChecks: redactDeep(blockingWarningChecks),
      nonBlockingWarningChecks: redactDeep(nonBlockingWarningChecks)
    };
  }

  const first = inspectOnce();
  const retryableIds = new Set(["network.provider_reachability", "mcp.config"]);
  const shouldRetry = [
    ...(first.failedChecks || []),
    ...(first.warningChecks || [])
  ].some((check) => retryableIds.has(check.id));
  if (!shouldRetry) return first;

  const second = inspectOnce();
  if (!second.inspected) return first;
  const firstScore = (first.counts?.fail || 0) * 10 + (first.counts?.warning || 0);
  const secondScore = (second.counts?.fail || 0) * 10 + (second.counts?.warning || 0);
  if (secondScore < firstScore) {
    return {
      ...second,
      retried: true,
      retryReason: "Transient provider reachability or MCP config doctor result improved on retry."
    };
  }
  return first;
}

function summarizeSkillContext(runtimeReport, skillInventory) {
  const runtimeSkills = runtimeReport?.skills || {};
  const skills = runtimeSkills.inspected ? runtimeSkills : skillInventory;
  const installed = skills.inspected ? skills.installed : null;
  const curatedExpected = skills.expected || 0;
  const status = installed !== null && installed > Math.max(50, curatedExpected * 2) ? "attention" : "ok";
  const warningLikely = status === "attention";

  return {
    status,
    installed,
    curatedExpected,
    warningLikely,
    documentedBudget: "Codex caps the initial skills list at roughly 2% of the model context window, or 8,000 characters when the context window is unknown.",
    impact: warningLikely
      ? "Skill descriptions may be shortened in the initial list; selected skills still load their full SKILL.md instructions."
      : skills.inspected === false
        ? "Installed skill count was not inspected in repo-only mode; use npm run codex:status for runtime skill pressure."
        : "Installed skill count is unlikely to pressure the initial skills list.",
    recommendation: warningLikely
      ? "Disable unused global skills or plugins when implicit skill discovery feels noisy; explicit skill names still work."
      : skills.inspected === false
        ? "No action needed for repo-only audits."
        : "No action needed."
  };
}

function writeOutput(report) {
  if (!options.output) return;

  const outputPath = path.resolve(root, options.output);
  if (!outputPath.startsWith(root + path.sep)) {
    throw new Error(`Refusing to write status report outside repository: ${options.output}`);
  }
  if (fs.existsSync(outputPath) && !options.forceOutput) {
    throw new Error(`Refusing to overwrite existing report without --force-output: ${options.output}`);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

const repoDoctor = runNodeScript(
  "scripts/codex-doctor.mjs",
  ["--json", ...(options.redactPaths ? ["--redact-paths"] : [])],
  "repo:doctor"
);

const runtime = options.skipRuntime
  ? { inspected: false, status: "skipped", report: null, failures: [], note: "Skipped by --skip-runtime." }
  : runNodeScript(
      "scripts/verify-install-runtime.mjs",
      [
        "--json",
        ...(options.redactPaths ? ["--redact-paths"] : []),
        "--codex-home",
        options.codexHome,
        "--agents-home",
        options.agentsHome,
        ...(options.expectSkills ? ["--expect-skills"] : []),
        ...(options.expectGitGuards ? ["--expect-git-guards"] : [])
      ],
      "verify:install:runtime"
    );

const codexDoctor = summarizeCodexDoctor();
const skipGlobalMetadata = skipInstalledRuntimeAndCliMetadata();
const skillInventory = inspectSkillInventory(skipGlobalMetadata);
const skillsContext = summarizeSkillContext(runtime.report, skillInventory);
const routingBoard = inspectRoutingBoard();
const mcpSetupBoard = inspectMcpSetupBoard();
const effectiveControls = inspectEffectiveControls(skipGlobalMetadata);
const codexCliRuntime = inspectCodexCliRuntime();
const cliQuickStart = inspectCliQuickStart();
const gitRepository = inspectGitRepository();
const logSummary = inspectLogSummary(skipGlobalMetadata);

function classifyRuntimeInstallState(runtimeReport) {
  if (!runtimeReport) return options.skipRuntime ? "skipped" : "unknown";
  const managed = runtimeReport.managedFiles || {};
  const expected = Number(managed.expected || 0);
  const matched = Number(managed.matched || 0);
  const missing = Number(managed.missing || 0);
  const mismatched = Number(managed.mismatched || 0);
  if (expected > 0 && matched === 0 && missing >= Math.max(1, expected - mismatched)) return "not_installed";
  if (expected > 0 && matched < expected) return "drift";
  return runtimeReport.status === "ok" ? "installed" : "attention";
}

const runtimeInstallState = classifyRuntimeInstallState(runtime.report);
const runtimeFailures = runtimeInstallState === "not_installed"
  ? ["runtime: Codex Chef is not installed at the target Codex home; run `npm run chef -- --preview --no-log` before install or `npm run chef -- --install --apply` when ready."]
  : runtime.failures.map((failure) => `runtime: ${failure}`);

const failures = [
  ...repoDoctor.failures.map((failure) => `repo: ${failure}`),
  ...runtimeFailures
];
const warnings = [
  ...(runtime.report?.warnings || []),
  ...(codexDoctor.warnings || [])
];

const attentionReasons = [
  ...(warnings.length > 0 ? warnings : []),
  ...(skillsContext.status === "attention" ? [skillsContext.impact] : []),
  ...(codexCliRuntime.status === "attention" ? codexCliRuntime.issues : []),
  ...(gitRepository.status === "ok" ? [] : [gitRepository.summary]),
  ...(codexDoctor.status === "attention"
    ? [
        `codex doctor checks need attention: ${codexDoctor.counts?.fail || 0} fail, ${codexDoctor.counts?.warning || 0} warning`
      ]
    : [])
];

const status = failures.length > 0
  ? "fail"
  : attentionReasons.length > 0
    ? "attention"
    : "ok";

const report = {
  schemaVersion: "codex-chef.status.v1",
  generatedAt: new Date().toISOString(),
  status,
  repoDoctor,
  runtime,
  runtimeInstallState,
  codexDoctor,
  codexCliRuntime,
  skillInventory,
  skillsContext,
  routingBoard,
  mcpSetupBoard,
  effectiveControls,
  cliQuickStart,
  gitRepository,
  logSummary,
  warnings,
  attentionReasons,
  failures,
  nextActions: status === "fail"
    ? (runtimeInstallState === "not_installed"
        ? ["Run npm run chef -- --preview --no-log to inspect the install plan, then run npm run chef -- --install --apply when ready."]
        : ["Run npm run repair:install -- --apply to repair managed runtime drift, then rerun npm run codex:status."])
    : attentionReasons.length > 0
      ? ["Review attention items; they do not necessarily mean Codex Chef install is broken."]
      : ["No action needed."]
};

writeOutput(report);

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  if (!progressEnabled) console.log("Codex Chef status");
  console.log(`Overall: ${report.status}`);
  console.log(`Use: ${cliQuickStart.interactiveMenu} (or ${cliQuickStart.auditMode} for no repo-local log)`);
  console.log(`Numbered menu: ${cliQuickStart.numberedActions ? "yes" : "no"}; write actions require --apply or typed confirmation.`);
  console.log(`Target Codex home: ${codexCliRuntime.target.codexHome}`);
  const ambientMcpText = codexCliRuntime.ambient.mcp.inspected === false
    ? "MCP skipped"
    : `MCP ${codexCliRuntime.ambient.mcp.configuredCount}`;
  console.log(
    `Ambient Codex: ${codexCliRuntime.ambient.relationshipToTarget} (login ${codexCliRuntime.ambient.login.status}, ${ambientMcpText}; CODEX_HOME env ${codexCliRuntime.ambient.codexHomeEnv || "unset"})`
  );
  console.log(`Repo Git: ${gitRepository.status} - ${gitRepository.summary}`);
  if (gitRepository.remediation) console.log(`Repo Git remediation: ${gitRepository.remediation}`);
  const targetMcpText = codexCliRuntime.mcp.inspected === false
    ? "MCP probe skipped"
    : `MCP configured ${codexCliRuntime.mcp.configuredCount}`;
  console.log(
    codexCliRuntime.mcp.inspected === false
      ? `Codex CLI: ${codexCliRuntime.status} (strict config ${codexCliRuntime.version.status}, login ${codexCliRuntime.login.status}, ${targetMcpText})`
      : `Codex CLI: ${codexCliRuntime.status} (strict config ${codexCliRuntime.version.status}, login ${codexCliRuntime.login.status}, MCP ${codexCliRuntime.mcp.status}; ${targetMcpText})`
  );
  console.log(
    `Logs: Chef ${logSummary.repoCliLogs.recent.length} recent metadata record(s), content not inspected; ${logSummary.codexLogs.inspected === false ? "Codex skipped" : `Codex ${logSummary.codexLogs.recent.length} recent metadata record(s), content not inspected`}`
  );
  if (repoDoctor.report) {
    console.log(
      `Repo starter: ${repoDoctor.status} (${repoDoctor.report.agents?.count || 0} agents, ${repoDoctor.report.mcp?.count || 0} MCP, ${repoDoctor.report.docs?.baseGuides || 0} docs x ${repoDoctor.report.docs?.languages || 0})`
    );
  } else {
    console.log(`Repo starter: ${repoDoctor.status}`);
  }
  if (runtime.report) {
    const installed = runtime.report.installed || {};
    const managed = runtime.report.managedFiles || {};
    console.log(
      `Installed runtime: ${runtime.status}/${runtimeInstallState} (agents ${installed.agents?.installed || 0}/${installed.agents?.expected || 0}, MCP ${installed.mcp?.installed || 0}/${installed.mcp?.expected || 0}, managed files ${managed.matched || 0}/${managed.expected || 0})`
    );
    if (runtime.report.skills?.inspected) {
      console.log(
        `Skills: ${runtime.report.skills.installed} installed, ${runtime.report.skills.missing.length} missing from curated set`
      );
    }
  } else {
    const runtimeText = runtime.status === "skipped"
      ? "skipped by this mode"
      : `${runtime.status}/${runtimeInstallState}`;
    console.log(`Installed runtime: ${runtimeText}`);
  }
  if (!runtime.report?.skills?.inspected && skillInventory.inspected) {
    console.log(`Skills: ${skillInventory.installed} total installed across global roots (${skillInventory.expected} Codex Chef curated, ${skillInventory.missing.length} missing, ${skillInventory.extraCount} other/user-installed)`);
  } else if (!runtime.report?.skills?.inspected && skillInventory.inspected === false) {
    console.log(`Skills: skipped (${skillInventory.note})`);
  }
  const skillsInstalledText = skillsContext.installed === null || skillsContext.installed === undefined
    ? "installed not inspected"
    : `${skillsContext.installed} installed`;
  console.log(`Skills context: ${skillsContext.status} (${skillsInstalledText}; curated baseline ${skillsContext.curatedExpected})`);
  console.log(
    `Enterprise routing: ${routingBoard.profileCount} profiles (agents ${routingBoard.requiredSurfaces.agents.length}, skills ${routingBoard.requiredSurfaces.skills.length}, MCP ${routingBoard.requiredSurfaces.mcp.length}, flags/checks ${routingBoard.requiredSurfaces.flags.length})`
  );
  console.log(
    `Routing modes: delegation=${humanList(routingBoard.requiredSurfaces.delegationModes, "delegationMode")}, skills=${humanList(routingBoard.requiredSurfaces.skillModes, "skillMode")}, MCP=${humanList(routingBoard.requiredSurfaces.mcpModes, "mcpMode")}`
  );
  console.log(
    `MCP quick view: ready=${mcpSetupBoard.enabledByDefault.join(", ") || "not configured"}, opt-in=${mcpSetupBoard.disabledByDefault.join(", ") || "not configured"}`
  );
  console.log(
    `Effective controls: multi_agent=${humanStatusValue(effectiveControls.features.multiAgent)}, max_depth=${humanStatusValue(effectiveControls.agents.maxDepth)}, approval=${humanStatusValue(effectiveControls.approvalPolicy)}, sandbox=${humanStatusValue(effectiveControls.sandboxMode)}, network=${humanStatusValue(effectiveControls.workspaceNetwork)}, hooks=${humanStatusValue(effectiveControls.features.hooks)}, managed hooks=${humanStatusValue(effectiveControls.managedHooks)}, apps default=${humanStatusValue(effectiveControls.appsDefault.enabled)}/destructive=${humanStatusValue(effectiveControls.appsDefault.destructiveEnabled)}/open_world=${humanStatusValue(effectiveControls.appsDefault.openWorldEnabled)}`
  );
  console.log(
    `MCP setup: ${mcpSetupBoard.serverCount} servers (${mcpSetupBoard.enabledByDefault.length} enabled, ${mcpSetupBoard.disabledByDefault.length} disabled, ${mcpSetupBoard.setupRequiredCount} with setup notes)`
  );
  for (const server of mcpSetupBoard.servers.filter((item) => !["none", "local-state"].includes(item.setupKind))) {
    console.log(`MCP setup note: ${server.name} [${server.setupKind}] - ${server.setupHint}`);
  }
  if (codexDoctor.inspected) {
    console.log(
      `Codex doctor checks: ${codexDoctor.status} (${codexDoctor.counts.ok} ok, ${codexDoctor.counts.fail} fail, ${codexDoctor.counts.warning} warning)`
    );
  } else {
    console.log(`Codex doctor checks: ${codexDoctor.status}`);
  }
  for (const warning of warnings) console.log(`Warning: ${warning}`);
  if (skillsContext.status === "attention") console.log(`Attention: ${skillsContext.impact}`);
  for (const check of codexDoctor.failedChecks || []) console.log(`Attention: ${check.id} - ${check.summary}`);
  for (const check of codexDoctor.blockingWarningChecks || codexDoctor.warningChecks || []) console.log(`Attention: ${check.id} - ${check.summary}`);
  for (const check of codexDoctor.nonBlockingWarningChecks || []) console.log(`Warning: ${check.id} - ${check.summary}`);
  for (const failure of failures) console.error(`Failure: ${failure}`);
  if (options.output) console.log(`Report: ${redact(path.resolve(root, options.output))}`);
}

if (status === "fail") process.exit(1);
