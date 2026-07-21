#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
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

function listOrFallback(values, fallback) {
  return values.length ? values.join(", ") : fallback;
}

const routing = readJson("catalog/routing-profiles.json");
const profiles = options.profile
  ? routing.profiles.filter((profile) => profile.id === options.profile)
  : routing.profiles;

if (options.profile && profiles.length === 0) {
  throw new Error(`Unknown routing profile: ${options.profile}`);
}

const report = {
  schemaVersion: "codex-chef.routing.v2",
  generatedAt: new Date().toISOString(),
  sourcePolicy: routing.sourcePolicy,
  delegationPolicy: routing.delegationPolicy,
  agentRuntimePolicy: routing.agentRuntimePolicy,
  visibilityContract: {
    routingPlan: "Routing plan: one compact initial line with selected agents, skills, MCPs, commands, and skips.",
    routingResult: "Routing result: one compact final table or line with state and evidence for each selected surface.",
    cli: "Use /agent in Codex CLI to inspect active agent threads, switch to one, or steer/close it.",
    lifecycle: [
      "Close completed subagent threads when the task no longer needs them.",
      "Use /agent to inspect, switch, steer, or close agent threads before finalizing large work.",
      "Use /ps to inspect background terminals and /stop to cancel terminal work started by the current session.",
      "Close browser/MCP pages or sessions when the selected tool exposes a close operation.",
      "If an external MCP process such as Serena persists after the task, report it and ask before killing processes or deleting state."
    ],
    boundary: "A route match recommends a specialist but spawns only for independent parallel work, noisy isolation, or explicit user-requested delegation."
  },
  profileCount: profiles.length,
  profiles
};

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Codex Chef enterprise routing board");
  console.log(`Profiles: ${profiles.length}`);
  console.log("Policy: route matches are recommendations; delegation is conditional and inherits the active user profile.");
  console.log("");
  console.log("Routing visibility contract:");
  console.log("- Routing plan: selected agents, skills, MCPs, commands, and skips in one initial line.");
  console.log("- Routing result: completion state and evidence in one final table or line.");
  console.log("- Use /agent in Codex CLI to inspect active agent threads, switch to one, or steer/close it.");
  console.log("- Boundary: routing profiles make specialists visible, not hidden permission to spawn agents or enable risky tools.");
  console.log("");
  console.log("Lifecycle hygiene:");
  console.log("- Close completed subagent threads when they are no longer needed.");
  console.log("- Use /agent before finalizing large work to inspect, switch, steer, or close agent threads.");
  console.log("- Use /ps for background terminals and /stop to cancel terminal work started by the current session.");
  console.log("- Close browser/MCP pages or sessions when the selected tool exposes a close operation.");
  console.log("- If an external MCP process such as Serena persists after the task, report it and ask before killing processes or deleting state.");
  for (const profile of profiles) {
    console.log("");
    console.log(`- ${profile.title} (${profile.id})`);
    console.log(`  Trigger: ${profile.trigger}`);
    console.log(`  Agents: ${listOrFallback(profile.agents, "No specialist agent route")}`);
    console.log(`  Skills: ${listOrFallback(profile.skills, "No matching skill route")}`);
    console.log(`  MCP: ${listOrFallback(profile.mcp, "No MCP route")}`);
    console.log(`  Flags/checks: ${listOrFallback(profile.flags, "No extra flags/checks")}`);
    console.log(`  Delegation mode: ${profile.delegationMode}`);
    console.log(`  Skill mode: ${profile.skillMode}`);
    console.log(`  MCP mode: ${profile.mcpMode}`);
    console.log(`  Owner: ${profile.owner}`);
    console.log(`  Surface: ${profile.primarySurface}`);
    console.log(`  Durability: ${profile.durability}`);
    console.log(`  Privilege delta: ${profile.privilegeDelta}`);
    console.log(`  Validation: ${profile.validationGate}`);
    console.log(`  Rollback: ${profile.rollback}`);
    console.log(`  Boundary: ${profile.boundary}`);
  }
}
