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
  skipRuntime: false,
  skipCodexDoctorChecks: false,
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
  else if (arg === "--skip-runtime") options.skipRuntime = true;
  else if (arg === "--skip-codex-doctor-checks") options.skipCodexDoctorChecks = true;
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
  --skip-runtime               Skip installed runtime verification
  --skip-codex-doctor-checks   Skip direct Codex CLI doctor check summary
  --codex-home <path>          Installed Codex home to inspect
  --agents-home <path>         Installed Agents home to inspect
  --redact-paths               Redact home and repository paths in output
`);
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

function redactDeep(value) {
  if (typeof value === "string") return redact(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactDeep(item)]));
  }
  return value;
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

function codexCommand() {
  return process.platform === "win32" ? "codex.cmd" : "codex";
}

function inspectSkillInventory() {
  const expected = readJson("catalog/skills.json")
    .skills
    .filter((skill) => skill.install === true)
    .map((skill) => skill.name)
    .sort();
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

function summarizeCodexDoctor() {
  if (options.skipCodexDoctorChecks) {
    return { inspected: false, status: "skipped", note: "Skipped by --skip-codex-doctor-checks." };
  }

  const result = run(codexCommand(), ["doctor", "--json"], {
    env: { ...process.env, CODEX_HOME: options.codexHome },
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

  return {
    inspected: true,
    status: counts.fail > 0 || counts.warning > 0 ? "attention" : "ok",
    exitCode: result.status,
    overallStatus: parsed.overallStatus || null,
    codexVersion: parsed.codexVersion || null,
    counts,
    failedChecks: redactDeep(failedChecks),
    warningChecks: redactDeep(warningChecks)
  };
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
      : "Installed skill count is unlikely to pressure the initial skills list.",
    recommendation: warningLikely
      ? "Disable unused global skills or plugins when implicit skill discovery feels noisy; explicit skill names still work."
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
  "codex:doctor"
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
const skillInventory = inspectSkillInventory();
const skillsContext = summarizeSkillContext(runtime.report, skillInventory);

const failures = [
  ...repoDoctor.failures.map((failure) => `repo: ${failure}`),
  ...runtime.failures.map((failure) => `runtime: ${failure}`)
];
const warnings = [
  ...(runtime.report?.warnings || []),
  ...(codexDoctor.warnings || [])
];

const attentionReasons = [
  ...(warnings.length > 0 ? warnings : []),
  ...(skillsContext.status === "attention" ? [skillsContext.impact] : []),
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
  codexDoctor,
  skillInventory,
  skillsContext,
  warnings,
  attentionReasons,
  failures,
  nextActions: status === "fail"
    ? ["Fix failed repo or runtime checks, then rerun npm run codex:status."]
    : attentionReasons.length > 0
      ? ["Review attention items; they do not necessarily mean Codex Chef install is broken."]
      : ["No action needed."]
};

writeOutput(report);

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Codex Chef status");
  console.log(`Overall: ${report.status}`);
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
      `Installed runtime: ${runtime.status} (agents ${installed.agents?.installed || 0}/${installed.agents?.expected || 0}, MCP ${installed.mcp?.installed || 0}/${installed.mcp?.expected || 0}, managed files ${managed.matched || 0}/${managed.expected || 0})`
    );
    if (runtime.report.skills?.inspected) {
      console.log(
        `Skills: ${runtime.report.skills.installed} installed, ${runtime.report.skills.missing.length} missing from curated set`
      );
    }
  } else {
    console.log(`Installed runtime: ${runtime.status}`);
  }
  if (!runtime.report?.skills?.inspected && skillInventory.inspected) {
    console.log(`Skills: ${skillInventory.installed} total installed across global roots (${skillInventory.expected} Codex Chef curated, ${skillInventory.missing.length} missing, ${skillInventory.extraCount} other/user-installed)`);
  }
  console.log(`Skills context: ${skillsContext.status} (${skillsContext.installed ?? "not inspected"} installed; curated baseline ${skillsContext.curatedExpected})`);
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
  for (const check of codexDoctor.warningChecks || []) console.log(`Attention: ${check.id} - ${check.summary}`);
  for (const failure of failures) console.error(`Failure: ${failure}`);
  if (options.output) console.log(`Report: ${redact(path.resolve(root, options.output))}`);
}

if (status === "fail") process.exit(1);
