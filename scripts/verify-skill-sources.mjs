#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const catalogPath = path.join(root, "catalog", "skills.json");
const lockPath = path.join(root, "catalog", "skills-lock.json");
const onlineCacheDir = path.join(root, "tmp", "npm-cache");
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
          `npx.cmd --yes skills use ${entry.package} --skill ${entry.skill}`
        ].join("; ")
      ]
    : ["--yes", "skills", "use", entry.package, "--skill", entry.skill];
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
      GIT_CONFIG_COUNT: process.env.GIT_CONFIG_COUNT || "1",
      GIT_CONFIG_KEY_0: process.env.GIT_CONFIG_KEY_0 || "http.sslBackend",
      GIT_CONFIG_VALUE_0: process.env.GIT_CONFIG_VALUE_0 || "openssl",
      GIT_SSL_BACKEND: process.env.GIT_SSL_BACKEND || "openssl",
      NO_COLOR: "1",
      NPM_CONFIG_CACHE: onlineCacheDir,
      TERM: "dumb",
      npm_config_cache: onlineCacheDir,
      npm_config_loglevel: "error",
      npm_config_update_notifier: "false",
      npm_config_yes: "true"
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
  const lock = fs.existsSync(lockPath)
    ? JSON.parse(fs.readFileSync(lockPath, "utf8"))
    : null;
  const lockEntries = new Map((lock?.entries || []).map((entry) => [entry.name, entry]));
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
        for (const key of ["sourceUrl", "license", "risk", "lastChecked"]) {
          if (!entry[key]) {
            fail(`Installable skill ${entry.name} must declare ${key}`);
          }
        }
        const locked = lockEntries.get(entry.name);
        if (!locked) {
          fail(`catalog/skills-lock.json missing installable skill ${entry.name}`);
        } else {
          for (const key of ["package", "skill", "source", "sourceUrl"]) {
            if (locked[key] !== entry[key]) {
              fail(`Skill lock mismatch for ${entry.name}: ${key}`);
            }
          }
          const expectedInstallCommand = `npx skills add ${entry.package} --skill ${entry.skill} --agent codex --yes --global`;
          if (locked.installCommand !== expectedInstallCommand) {
            fail(`Skill lock installCommand mismatch for ${entry.name}`);
          }
        }
        installable.push(entry);
      }
    }
  }

  if (!lock) {
    fail("Missing catalog/skills-lock.json");
  }

  if (online && failures.length === 0) {
    fs.mkdirSync(onlineCacheDir, { recursive: true });
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
