#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const catalogPath = path.join(root, "catalog", "skills.json");
const online = process.argv.includes("--online");
const failures = [];

function fail(message) {
  failures.push(message);
}

function runSkillsUse(entry) {
  const executable = process.platform === "win32" ? "powershell.exe" : "npx";
  const args = process.platform === "win32"
    ? [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        [
          "$env:GIT_CONFIG_COUNT='1'",
          "$env:GIT_CONFIG_KEY_0='http.sslBackend'",
          "$env:GIT_CONFIG_VALUE_0='openssl'",
          `npx.cmd skills use ${entry.package} --skill ${entry.skill}`
        ].join("; ")
      ]
    : ["skills", "use", entry.package, "--skill", entry.skill];
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_COUNT: process.env.GIT_CONFIG_COUNT || "1",
      GIT_CONFIG_KEY_0: process.env.GIT_CONFIG_KEY_0 || "http.sslBackend",
      GIT_CONFIG_VALUE_0: process.env.GIT_CONFIG_VALUE_0 || "openssl",
      GIT_SSL_BACKEND: process.env.GIT_SSL_BACKEND || "openssl"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.error) {
    fail(`Online skill resolution failed for ${entry.name}: ${result.error.message}`);
    return;
  }

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    fail(`Online skill resolution failed for ${entry.name}: ${output || `exit ${result.status}`}`);
  }
}

if (!fs.existsSync(catalogPath)) {
  fail("Missing catalog/skills.json");
} else {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const names = new Set();
  const installable = [];

  if (!Array.isArray(catalog.skills)) {
    fail("catalog/skills.json must contain a skills array");
  } else {
    for (const entry of catalog.skills) {
      if (!entry.name || typeof entry.name !== "string") {
        fail("Every skill entry must have a string name");
        continue;
      }

      if (names.has(entry.name)) {
        fail(`Duplicate skill name: ${entry.name}`);
      }
      names.add(entry.name);

      if (!entry.category || typeof entry.category !== "string") {
        fail(`Skill ${entry.name} must declare a category`);
      }
      if (!entry.reason || typeof entry.reason !== "string") {
        fail(`Skill ${entry.name} must declare a reason`);
      }

      if (entry.install === true) {
        if (!entry.package || !/^[^/\s]+\/[^@\s]+$/.test(entry.package)) {
          fail(`Installable skill ${entry.name} must declare package as owner/repo`);
        }
        if (!entry.skill || typeof entry.skill !== "string" || !/^[A-Za-z0-9._-]+$/.test(entry.skill)) {
          fail(`Installable skill ${entry.name} must declare a single skill name`);
        }
        if (entry.source !== `${entry.package}@${entry.skill}`) {
          fail(`Installable skill ${entry.name} source must equal package@skill`);
        }
        installable.push(entry);
      }
    }
  }

  if (online && failures.length === 0) {
    for (const entry of installable) {
      runSkillsUse(entry);
    }
  }

  if (failures.length === 0) {
    const mode = online ? "offline schema + online resolution" : "offline schema";
    console.log(`Skill source verification passed (${mode}). Checked ${installable.length} installable skills.`);
  }
}

if (failures.length > 0) {
  console.error("Skill source verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}
