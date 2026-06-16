#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];

const catalogPath = path.join(root, "catalog", "mcp-servers.json");
const configFiles = [
  "templates/codex/config.windows.toml",
  "templates/codex/config.unix.toml"
];
const ignoredDirs = new Set([".git", ".serena", "node_modules", "dist", "build", "coverage", ".next", "tmp", "temp"]);

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function parseMcpBlocks(text) {
  const blocks = new Map();
  const lines = text.split(/\r?\n/);
  let currentName = null;
  let currentLines = [];

  function flush() {
    if (currentName) {
      blocks.set(currentName, `${currentLines.join("\n")}\n`);
    }
  }

  for (const line of lines) {
    const heading = line.match(/^\[mcp_servers\.([A-Za-z0-9_-]+)\]\s*$/);
    if (heading) {
      flush();
      currentName = heading[1];
      currentLines = [];
      continue;
    }
    if (currentName && /^\[/.test(line)) {
      flush();
      currentName = null;
      currentLines = [];
      continue;
    }
    if (currentName) currentLines.push(line);
  }
  flush();

  return blocks;
}

function readTomlValue(block, key) {
  const match = block.match(new RegExp(`^${key}\\s*=\\s*(.+)$`, "m"));
  if (!match) return null;
  return match[1].trim();
}

function unquote(value) {
  if (!value) return value;
  return value.replace(/^"|"$/g, "");
}

function fail(message) {
  failures.push(message);
}

function isPinnedPackageSpec(spec) {
  return /^@[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[0-9][A-Za-z0-9_.+~-]*$/.test(spec)
    || /^[A-Za-z0-9_.-]+@[0-9][A-Za-z0-9_.+~-]*$/.test(spec);
}

function isPinnedGitSpec(spec) {
  return /^git\+https:\/\/[^@\s]+@[a-f0-9]{40}$/i.test(spec);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function validateLauncherArgs(label, args) {
  for (const value of args || []) {
    const arg = String(value);
    if (/@latest\b/.test(arg)) fail(`${label} must not use @latest MCP package specs: ${arg}`);
    if (arg.startsWith("git+https://") && !isPinnedGitSpec(arg)) {
      fail(`${label} git MCP launcher source must be pinned to a full commit SHA: ${arg}`);
    }
  }
  for (let index = 0; index < (args || []).length; index += 1) {
    if (args[index] === "-y") {
      const packageSpec = args[index + 1];
      if (!isPinnedPackageSpec(String(packageSpec || ""))) {
        fail(`${label} npx MCP package must be pinned to an exact npm version: ${packageSpec}`);
      }
    }
  }
}

function validateMcpJsonFile(filePath) {
  const rel = filePath.split(path.sep).join("/").replace(`${root.split(path.sep).join("/")}/`, "");
  let json;
  try {
    json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${rel} must be parseable JSON: ${error.message}`);
    return;
  }
  const servers = json.mcpServers || json.servers || {};
  if (!servers || typeof servers !== "object" || Array.isArray(servers)) {
    fail(`${rel} must define an object mcpServers or servers map`);
    return;
  }
  for (const [name, server] of Object.entries(servers)) {
    validateLauncherArgs(`${rel}:${name}`, Array.isArray(server?.args) ? server.args : []);
  }
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const catalogNames = new Set((catalog.servers || []).map((server) => server.name));

for (const server of catalog.servers || []) {
  if (server.package?.includes("@latest")) {
    fail(`MCP catalog package must not float on @latest: ${server.name}`);
  }
  if (server.package && !isPinnedPackageSpec(server.package)) {
    fail(`MCP catalog package must be pinned to an exact npm version: ${server.name} (${server.package})`);
  }
  if (server.command === "uvx" && !/^[a-f0-9]{40}$/i.test(String(server.sourceRef || ""))) {
    fail(`MCP catalog uvx/git server must declare sourceRef as a full commit SHA: ${server.name}`);
  }
  if (!["approve", "prompt", "auto"].includes(server.approval)) {
    fail(`MCP catalog has invalid approval mode for ${server.name}: ${server.approval}`);
  }
  if (server.auth && server.auth !== "none" && server.defaultEnabled !== false) {
    fail(`Authenticated MCP must be disabled by default in catalog: ${server.name}`);
  }
  if (["external-account", "database", "filesystem"].includes(server.category) && server.defaultEnabled !== false) {
    fail(`Sensitive MCP category must be disabled by default in catalog: ${server.name}`);
  }
}

for (const configFile of configFiles) {
  const text = read(configFile);
  const blocks = parseMcpBlocks(text);
  const configNames = new Set(blocks.keys());

  for (const match of text.matchAll(/"-y",\s*"([^"]+)"/g)) {
    const packageSpec = match[1];
    if (!isPinnedPackageSpec(packageSpec)) {
      fail(`${configFile} npx MCP package must be pinned to an exact npm version: ${packageSpec}`);
    }
  }

  for (const match of text.matchAll(/"git\+https:\/\/[^"]+"/g)) {
    const gitSpec = match[0].slice(1, -1);
    if (!isPinnedGitSpec(gitSpec)) {
      fail(`${configFile} git MCP launcher source must be pinned to a full commit SHA: ${gitSpec}`);
    }
  }

  for (const name of catalogNames) {
    if (!configNames.has(name)) fail(`${configFile} missing MCP config block for ${name}`);
  }

  for (const name of configNames) {
    if (!catalogNames.has(name)) fail(`${configFile} has MCP block not present in catalog: ${name}`);
  }

  for (const server of catalog.servers || []) {
    const block = blocks.get(server.name);
    if (!block) continue;

    const enabled = readTomlValue(block, "enabled");
    const approval = unquote(readTomlValue(block, "default_tools_approval_mode"));
    if (enabled !== String(server.defaultEnabled)) {
      fail(`${configFile} enabled drift for ${server.name}: expected ${server.defaultEnabled}, found ${enabled}`);
    }
    if (approval !== server.approval) {
      fail(`${configFile} approval drift for ${server.name}: expected ${server.approval}, found ${approval}`);
    }
    if (server.url && !block.includes(`url = "${server.url}"`)) {
      fail(`${configFile} URL drift for ${server.name}`);
    }
    if (server.package && !block.includes(server.package)) {
      fail(`${configFile} package drift for ${server.name}: expected ${server.package}`);
    }
    if (server.sourceRef && !block.includes(server.sourceRef)) {
      fail(`${configFile} sourceRef drift for ${server.name}: expected ${server.sourceRef}`);
    }
    if (server.risk === "critical" && enabled !== "false") {
      fail(`${configFile} must keep critical MCP disabled: ${server.name}`);
    }
  }
}

for (const file of walk(root)) {
  const rel = file.split(path.sep).join("/").replace(`${root.split(path.sep).join("/")}/`, "");
  if (/^plugins\/.*\/\.mcp\.json$/i.test(rel) || /^plugins\/.*\/\.codex-plugin\/.*\.mcp\.json$/i.test(rel)) {
    validateMcpJsonFile(file);
  }
}

if (failures.length > 0) {
  console.error("MCP config validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`MCP config validation passed. Checked ${catalog.servers.length} servers across ${configFiles.length} configs.`);
