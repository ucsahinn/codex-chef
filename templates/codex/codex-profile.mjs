#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [profile, ...codexArgs] = process.argv.slice(2);
const allowedProfiles = new Set(["full", "multi-session"]);
const allowedMcpServers = new Set([
  "context7", "sequential-thinking", "playwright", "chrome-devtools", "serena", "memory", "codebase-memory"
]);
if (!profile || codexArgs.length === 0 || !allowedProfiles.has(profile)) {
  console.error("Usage: node codex-profile.mjs <profile-name> <codex arguments...>");
  process.exit(2);
}
if (process.platform === "win32" && codexArgs.some((arg) => /[&|<>()^%]/.test(arg))) {
  console.error("Unsafe Windows shell metacharacter in Codex argument. Invoke Codex directly for this command.");
  process.exit(2);
}

const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const profilePath = path.join(codexHome, `${profile}.config.toml`);
if (!fs.existsSync(profilePath)) {
  console.error(`Codex profile not found: ${profilePath}`);
  process.exit(2);
}

const overrides = [];
const text = fs.readFileSync(profilePath, "utf8");
for (const table of text.split(/(?=^\[)/m)) {
  const match = /^\[mcp_servers\.([A-Za-z0-9_-]+)\]\s*\r?\n([\s\S]*)$/.exec(table);
  if (!match) continue;
  if (!allowedMcpServers.has(match[1])) continue;
  const enabled = /^\s*enabled\s*=\s*(true|false)\s*$/m.exec(match[2]);
  if (enabled) overrides.push("-c", `mcp_servers.${match[1]}.enabled=${enabled[1]}`);
}
if (overrides.length === 0) {
  console.error(`No MCP enablement states found in: ${profilePath}`);
  process.exit(2);
}

const command = process.platform === "win32" ? "codex.cmd" : "codex";
const commandArgs = [...overrides, ...codexArgs];
const result = process.platform === "win32"
  ? spawnSync("cmd.exe", ["/d", "/s", "/c", command, ...commandArgs], { stdio: "inherit", windowsHide: true })
  : spawnSync(command, commandArgs, { stdio: "inherit" });
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
