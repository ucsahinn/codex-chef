#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const manifestPath = path.join(root, "manifests", "install-plan.json");

function parseArgs(argv) {
  const parsed = {
    all: false,
    installSkills: false,
    installGitGuards: false,
    json: false,
    listProfiles: false,
    listOperations: false,
    force: false,
    noBackup: false,
    redactPaths: false,
    platform: process.platform === "win32" ? "windows" : "unix",
    codexHome: process.env.CODEX_HOME || path.join(process.env.HOME || process.env.USERPROFILE || "~", ".codex"),
    agentsHome: process.env.AGENTS_HOME || path.join(process.env.HOME || process.env.USERPROFILE || "~", ".agents"),
    home: process.env.HOME || process.env.USERPROFILE || "~"
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--all") parsed.all = true;
    else if (arg === "--install-skills") parsed.installSkills = true;
    else if (arg === "--install-git-guards") parsed.installGitGuards = true;
    else if (arg === "--json") parsed.json = true;
    else if (arg === "--list-profiles") parsed.listProfiles = true;
    else if (arg === "--list-operations" || arg === "--list-components") parsed.listOperations = true;
    else if (arg === "--force") parsed.force = true;
    else if (arg === "--no-backup") parsed.noBackup = true;
    else if (arg === "--redact-paths") parsed.redactPaths = true;
    else if (arg === "--platform") {
      parsed.platform = argv[index + 1];
      index += 1;
    } else if (arg === "--codex-home") {
      parsed.codexHome = argv[index + 1];
      index += 1;
    } else if (arg === "--agents-home") {
      parsed.agentsHome = argv[index + 1];
      index += 1;
    } else if (arg === "--home") {
      parsed.home = argv[index + 1];
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["windows", "unix"].includes(parsed.platform)) {
    throw new Error("--platform must be windows or unix");
  }

  if (parsed.all) {
    parsed.installSkills = true;
    parsed.installGitGuards = true;
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage: node scripts/plan-install.mjs [options]

Options:
  --all                  Include optional Git guards and curated skills
  --install-skills       Include reviewed curated skill installation operations
  --install-git-guards   Include optional global Git guard operations
  --list-profiles        List manifest profiles without planning writes
  --list-operations      List manifest operations without planning writes
  --list-components      Alias for --list-operations
  --force                Reflect force/replace behavior in the plan metadata
  --no-backup            Reflect no-backup behavior in the plan metadata
  --redact-paths         Replace local home paths with placeholders in output
  --platform <name>      windows or unix (defaults to current platform)
  --codex-home <path>    Override CODEX_HOME for planning only
  --agents-home <path>   Override AGENTS_HOME for planning only
  --home <path>          Override HOME for planning only
  --json                 Emit machine-readable JSON
`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sortedUnique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function manifestOperations(manifest, options) {
  return manifest.operations
    .filter((operation) => operation.platforms.includes(options.platform))
    .sort((left, right) => left.id.localeCompare(right.id));
}

function createDiscovery(options) {
  const manifest = readJson(manifestPath);
  const packageJson = readJson(path.join(root, "package.json"));
  const operationsById = new Map(manifest.operations.map((operation) => [operation.id, operation]));
  const operations = manifestOperations(manifest, options).map((operation) => ({
    id: operation.id,
    kind: operation.kind,
    summary: operation.summary,
    platforms: operation.platforms,
    requiresFlag: operation.requiresFlag || null,
    risk: operation.risk,
    backup: Boolean(operation.backup),
    collision: operation.collision
  }));
  const profiles = Object.entries(manifest.profiles || {}).map(([id, operationIds]) => {
    const knownOperations = operationIds
      .map((operationId) => operationsById.get(operationId))
      .filter(Boolean)
      .filter((operation) => operation.platforms.includes(options.platform));
    return {
      id,
      operationIds: knownOperations.map((operation) => operation.id),
      operationCount: knownOperations.length,
      optionalFlags: sortedUnique(knownOperations.map((operation) => operation.requiresFlag)),
      highRiskOperationCount: knownOperations.filter((operation) => operation.risk === "high").length
    };
  }).sort((left, right) => left.id.localeCompare(right.id));

  return {
    schemaVersion: "codex-chef.install-plan-discovery.v1",
    generatedAt: new Date().toISOString(),
    dryRunOnly: true,
    source: {
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      manifest: "manifests/install-plan.json",
      manifestVersion: manifest.schemaVersion
    },
    target: {
      platform: options.platform
    },
    profiles,
    operations
  };
}

function normalizeTargetPath(value, platform) {
  let normalized = String(value);
  if (platform !== "windows") {
    return normalized.replace(/[\\/]+/g, "/");
  }

  normalized = normalized.replace(/\//g, "\\");
  if (normalized.startsWith("\\\\?\\")) {
    return `\\\\?\\${normalized.slice(4).replace(/\\+/g, "\\")}`;
  }
  if (normalized.startsWith("\\\\")) {
    return `\\\\${normalized.slice(2).replace(/\\+/g, "\\")}`;
  }
  return normalized.replace(/\\+/g, "\\");
}

function joinTargetPath(platform, ...segments) {
  return normalizeTargetPath(segments.filter(Boolean).join(platform === "windows" ? "\\" : "/"), platform);
}

function resolveVars(value, options) {
  return normalizeTargetPath(String(value)
    .replaceAll("${CODEX_HOME}", options.codexHome)
    .replaceAll("${AGENTS_HOME}", options.agentsHome)
    .replaceAll("${HOME}", options.home)
    .replaceAll("${REPO_ROOT}", root), options.platform);
}

function resolveSource(operation, options) {
  if (operation.sourceByPlatform) {
    return operation.sourceByPlatform[options.platform];
  }
  return operation.source;
}

function expandGlob(relativeGlob) {
  const normalized = relativeGlob.replace(/\\/g, "/");
  const marker = "/*";
  const markerIndex = normalized.lastIndexOf(marker);
  if (markerIndex === -1) {
    return [normalized];
  }

  const dir = normalized.slice(0, markerIndex);
  const suffix = normalized.slice(markerIndex + marker.length);
  const absoluteDir = path.join(root, dir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  return fs.readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => `${dir}/${entry.name}`)
    .sort();
}

function includeOperation(operation, options) {
  if (!operation.platforms.includes(options.platform)) return false;
  if (operation.requiresFlag === "InstallSkills") return options.installSkills;
  if (operation.requiresFlag === "InstallGitGuards") return options.installGitGuards;
  return true;
}

function skillOperations(operation, options) {
  const catalog = readJson(path.join(root, operation.catalog));
  return (catalog.skills || [])
    .filter((skill) => skill.install === true)
    .map((skill) => ({
      id: `${operation.id}:${skill.name}`,
      componentId: operation.id,
      kind: "skill-install",
      summary: `Install curated skill ${skill.name}`,
      command: `npx skills add ${skill.package} --skill ${skill.skill} --agent codex --yes --global`,
      source: skill.source,
      sourceUrl: skill.sourceUrl,
      risk: operation.risk,
      collision: operation.collision,
      conflictPolicy: operation.conflictPolicy,
      backup: operation.backup,
      force: options.force,
      wouldMutateGlobalState: true,
      selectedBy: options.all ? "--all" : "--install-skills"
    }));
}

function expandOperation(operation, options) {
  const common = {
    componentId: operation.id,
    summary: operation.summary,
    risk: operation.risk,
    collision: operation.collision,
    conflictPolicy: operation.conflictPolicy,
    backup: operation.backup && !options.noBackup,
    force: options.force,
    wouldMutateGlobalState: true,
    selectedBy: operation.requiresFlag || "default"
  };

  if (operation.kind === "skill-install") {
    return skillOperations(operation, options);
  }

  if (operation.kind === "copy-glob") {
    return expandGlob(operation.sourceGlob).map((source) => ({
      ...common,
      id: `${operation.id}:${path.basename(source)}`,
      kind: "copy-file",
      source,
      destination: joinTargetPath(options.platform, resolveVars(operation.destinationDir, options), path.basename(source))
    }));
  }

  if (operation.kind === "git-config") {
    return [{
      ...common,
      id: operation.id,
      kind: operation.kind,
      key: operation.key,
      value: resolveVars(operation.value, options)
    }];
  }

  if (operation.kind === "write-marketplace") {
    return [{
      ...common,
      id: operation.id,
      kind: operation.kind,
      destination: resolveVars(operation.destination, options),
      pluginTarget: resolveVars("${CODEX_HOME}/plugins/codex-chef-workflows", options)
    }];
  }

  const source = resolveSource(operation, options);
  return [{
    ...common,
    id: operation.id,
    kind: operation.kind,
    source,
    destination: resolveVars(operation.destination, options)
  }];
}

function createPlan(options) {
  const manifest = readJson(manifestPath);
  const packageJson = readJson(path.join(root, "package.json"));
  const outputOptions = options.redactPaths
    ? {
        ...options,
        codexHome: "${HOME}/.codex",
        agentsHome: "${HOME}/.agents",
        home: "${HOME}"
      }
    : options;
  const selected = manifest.operations.filter((operation) => includeOperation(operation, options));
  const skipped = manifest.operations.filter((operation) => !includeOperation(operation, options));
  const operations = selected.flatMap((operation) => expandOperation(operation, outputOptions));

  return {
    schemaVersion: "codex-chef.install-state-preview.v1",
    generatedAt: new Date().toISOString(),
    dryRunOnly: true,
    source: {
      packageName: packageJson.name,
      packageVersion: packageJson.version,
      manifest: "manifests/install-plan.json",
      manifestVersion: manifest.schemaVersion
    },
    target: {
      platform: options.platform,
      codexHome: outputOptions.codexHome,
      agentsHome: outputOptions.agentsHome,
      home: outputOptions.home
    },
    options: {
      all: options.all,
      installSkills: options.installSkills,
      installGitGuards: options.installGitGuards,
      force: options.force,
      noBackup: options.noBackup,
      redactPaths: options.redactPaths
    },
    selectedComponentIds: selected.map((operation) => operation.id),
    skippedComponentIds: skipped.map((operation) => operation.id),
    operations
  };
}

function printPlan(plan) {
  console.log("Codex Chef install plan\n");
  console.log(`Package: ${plan.source.packageName}@${plan.source.packageVersion}`);
  console.log(`Platform: ${plan.target.platform}`);
  console.log(`Codex home: ${plan.target.codexHome}`);
  console.log(`Agents home: ${plan.target.agentsHome}`);
  console.log(`Selected components: ${plan.selectedComponentIds.join(", ")}`);
  console.log(`Skipped components: ${plan.skippedComponentIds.join(", ") || "(none)"}`);
  console.log(`Operations: ${plan.operations.length}`);
  console.log("");

  for (const operation of plan.operations) {
    console.log(`[${operation.kind}] ${operation.id}`);
    if (operation.kind === "git-config") {
      console.log(`  command: git config --global ${operation.key} ${operation.value}`);
    } else if (operation.kind === "skill-install") {
      console.log(`  command: ${operation.command}`);
      console.log(`  source: ${operation.source}`);
    } else if (operation.kind === "write-marketplace") {
      console.log(`  target: ${operation.destination}`);
      console.log(`  plugin target: ${operation.pluginTarget}`);
    } else {
      console.log(`  source: ${operation.source}`);
      console.log(`  target: ${operation.destination}`);
    }
    console.log(`  collision: ${operation.collision}`);
    console.log(`  backup: ${operation.backup ? "yes" : "no"}`);
    console.log(`  force: ${operation.force ? "yes" : "no"}`);
    console.log(`  risk: ${operation.risk}`);
    console.log(`  selected by: ${operation.selectedBy}`);
    console.log("");
  }
}

function printProfiles(discovery) {
  console.log("Codex Chef install profiles\n");
  console.log(`Package: ${discovery.source.packageName}@${discovery.source.packageVersion}`);
  console.log(`Platform: ${discovery.target.platform}`);
  console.log("");
  console.log("Profile | Operations | High risk | Optional flags");
  console.log("--- | ---: | ---: | ---");
  for (const profile of discovery.profiles) {
    console.log(`${profile.id} | ${profile.operationCount} | ${profile.highRiskOperationCount} | ${profile.optionalFlags.join(", ") || "none"}`);
  }
}

function printOperations(discovery) {
  console.log("Codex Chef install operations\n");
  console.log(`Package: ${discovery.source.packageName}@${discovery.source.packageVersion}`);
  console.log(`Platform: ${discovery.target.platform}`);
  console.log("");
  console.log("Operation | Kind | Risk | Requires | Backup | Collision");
  console.log("--- | --- | --- | --- | --- | ---");
  for (const operation of discovery.operations) {
    console.log(`${operation.id} | ${operation.kind} | ${operation.risk} | ${operation.requiresFlag || "default"} | ${operation.backup ? "yes" : "no"} | ${operation.collision}`);
  }
}

try {
  const options = parseArgs(process.argv);
  if (options.listProfiles || options.listOperations) {
    const discovery = createDiscovery(options);
    if (options.json) {
      console.log(JSON.stringify(discovery, null, 2));
    } else {
      if (options.listProfiles) printProfiles(discovery);
      if (options.listProfiles && options.listOperations) console.log("");
      if (options.listOperations) printOperations(discovery);
    }
    process.exit(0);
  }
  const plan = createPlan(options);
  if (options.json) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    printPlan(plan);
  }
} catch (error) {
  console.error(`Install planning failed: ${error.message}`);
  process.exit(1);
}
