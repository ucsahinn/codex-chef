#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertManagedTargetPath } from "./lib/managed-path-safety.mjs";
import { markerFileName } from "./manage-direct-skill-target.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");

function listSourceFiles(directory) {
  const files = [];
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error(`Install source must be a real directory: ${directory}`);
  }
  const pending = [directory];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      const entryStat = fs.lstatSync(absolute);
      if (entryStat.isSymbolicLink()) {
        throw new Error(`Install source tree must not contain links: ${absolute}`);
      }
      if (entryStat.isDirectory()) pending.push(absolute);
      else if (entryStat.isFile()) files.push(path.relative(directory, absolute));
      else throw new Error(`Install source tree contains an unsupported entry: ${absolute}`);
    }
  }
  return files.sort();
}

export function assertInstallSurface(codexHome, agentsHome) {
  const codexRoot = path.resolve(codexHome);
  const agentsRoot = path.resolve(agentsHome);
  const codexTargets = [
    path.join(codexRoot, "AGENTS.md"),
    path.join(codexRoot, "config.toml"),
    path.join(codexRoot, "rules", "default.rules")
  ];

  for (const file of listSourceFiles(path.join(root, "templates", "codex", "agents"))) {
    codexTargets.push(path.join(codexRoot, "agents", file));
  }
  for (const file of listSourceFiles(path.join(root, "templates", "codex", "profiles"))) {
    codexTargets.push(path.join(codexRoot, file));
  }

  const pluginSource = path.join(root, "plugins", "codex-chef-workflows");
  const pluginFiles = listSourceFiles(pluginSource);
  for (const file of pluginFiles) {
    codexTargets.push(path.join(codexRoot, "plugins", "codex-chef-workflows", file));
  }

  const agentsTargets = [
    path.join(agentsRoot, "plugins", "marketplace.json")
  ];
  for (const file of pluginFiles) {
    agentsTargets.push(path.join(agentsRoot, "plugins", "sources", "codex-chef-workflows", file));
  }

  const skills = JSON.parse(fs.readFileSync(path.join(root, "catalog", "skills.json"), "utf8"))
    .skills
    .filter((skill) => skill.directInstall === true);
  for (const skill of skills) {
    const source = path.join(pluginSource, "skills", skill.name);
    for (const file of listSourceFiles(source)) {
      agentsTargets.push(path.join(agentsRoot, "skills", skill.name, file));
    }
    agentsTargets.push(path.join(agentsRoot, "skills", skill.name, markerFileName));
  }

  for (const target of codexTargets) assertManagedTargetPath(target, [codexRoot]);
  for (const target of agentsTargets) assertManagedTargetPath(target, [agentsRoot]);
  return { codexTargets: codexTargets.length, agentsTargets: agentsTargets.length };
}

function main() {
  const args = process.argv.slice(2);
  const codexIndex = args.indexOf("--codex-home");
  const agentsIndex = args.indexOf("--agents-home");
  const codexHome = codexIndex >= 0 ? args[codexIndex + 1] : null;
  const agentsHome = agentsIndex >= 0 ? args[agentsIndex + 1] : null;
  const known = new Set(["--codex-home", "--agents-home"]);
  const unknown = args.filter((arg, index) => !known.has(arg) && !known.has(args[index - 1]));
  if (!codexHome || !agentsHome || unknown.length > 0) {
    console.error("Usage: node scripts/assert-install-surface.mjs --codex-home <path> --agents-home <path>");
    process.exit(2);
  }
  try {
    console.log(JSON.stringify(assertInstallSurface(codexHome, agentsHome)));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  main();
}
