#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const args = process.argv.slice(2);
const options = {
  json: false,
  profile: null
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--json") options.json = true;
  else if (arg === "--profile") {
    options.profile = args[index + 1];
    index += 1;
  } else if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

function printHelp() {
  console.log(`Usage: node scripts/codex-routing-board.mjs [options]

Show the Codex Chef enterprise routing board.

Options:
  --json                Emit machine-readable JSON
  --profile <id>        Show one routing profile by id
`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const routing = readJson("catalog/routing-profiles.json");
const profiles = options.profile
  ? routing.profiles.filter((profile) => profile.id === options.profile)
  : routing.profiles;

if (options.profile && profiles.length === 0) {
  throw new Error(`Unknown routing profile: ${options.profile}`);
}

const report = {
  schemaVersion: "codex-chef.routing.v1",
  generatedAt: new Date().toISOString(),
  sourcePolicy: routing.sourcePolicy,
  profileCount: profiles.length,
  profiles
};

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Codex Chef enterprise routing board");
  console.log(`Profiles: ${profiles.length}`);
  console.log("Policy: task-shape routing is required when applicable, but risky actions remain approval-gated.");
  for (const profile of profiles) {
    console.log("");
    console.log(`- ${profile.title} (${profile.id})`);
    console.log(`  Trigger: ${profile.trigger}`);
    console.log(`  Agents: ${profile.agents.join(", ")}`);
    console.log(`  Skills: ${profile.skills.length ? profile.skills.join(", ") : "none"}`);
    console.log(`  MCP: ${profile.mcp.length ? profile.mcp.join(", ") : "none"}`);
    console.log(`  Flags/checks: ${profile.flags.join(", ")}`);
    console.log(`  Boundary: ${profile.boundary}`);
  }
}
