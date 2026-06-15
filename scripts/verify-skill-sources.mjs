#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const catalogPath = path.join(root, "catalog", "skills.json");
const lockPath = path.join(root, "catalog", "skills-lock.json");
const onlineCacheDir = path.join(root, "tmp", "npm-cache");
const onlineWorkDir = path.join(root, "tmp", "skill-source-check");
const windowsNpxWrapper = path.join(onlineCacheDir, "npx-openssl.cmd");
const online = process.argv.includes("--online");
const timeoutArg = process.argv.find((arg) => arg.startsWith("--timeout-ms="));
const onlineTimeoutMs = timeoutArg ? Number(timeoutArg.split("=")[1]) : 90000;
const failures = [];

function fail(message) {
  failures.push(message);
}

function ensureWindowsNpxWrapper() {
  if (process.platform !== "win32") return null;
  fs.mkdirSync(onlineCacheDir, { recursive: true });
  // npm can drop GIT_CONFIG_* before the Skills CLI invokes git. Keep the
  // TLS override in a repo-local wrapper and pass catalog values as argv.
  fs.writeFileSync(windowsNpxWrapper, [
    "@echo off",
    "set \"GIT_CONFIG_COUNT=1\"",
    "set \"GIT_CONFIG_KEY_0=http.sslBackend\"",
    "set \"GIT_CONFIG_VALUE_0=openssl\"",
    "set \"GIT_SSL_BACKEND=openssl\"",
    "call npx.cmd %*",
    ""
  ].join("\r\n"), "utf8");
  return windowsNpxWrapper;
}

function safePathSegment(value) {
  return String(value).replace(/[^A-Za-z0-9_.-]/g, "_");
}

function prepareOnlineWorkDir(entry) {
  const dir = path.join(onlineWorkDir, safePathSegment(entry.name));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function runSkillsUse(entry) {
  const executable = process.platform === "win32" ? "cmd.exe" : "npx";
  const cwd = prepareOnlineWorkDir(entry);
  const skillArgs = entry.fullDepth
    ? [entry.package, "--skill", entry.skill, "--full-depth"]
    : [entry.package, "--skill", entry.skill];
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", ensureWindowsNpxWrapper(), "--yes", "skills", "use", ...skillArgs]
    : ["--yes", "skills", "use", ...skillArgs];
  const result = spawnSync(executable, args, {
    cwd,
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
    stdio: ["ignore", "pipe", "pipe"],
    timeout: onlineTimeoutMs,
    windowsHide: true
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

  if (catalog.lockSemantics !== "source-allowlist") {
    fail("catalog/skills.json must declare lockSemantics=source-allowlist.");
  }
  if (!String(catalog.immutability || "").includes("not a commit-pinned lock")) {
    fail("catalog/skills.json must state that Skills CLI sources are not commit-pinned locks.");
  }

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
        if (!entry.package || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(entry.package)) {
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
          if (Boolean(locked.fullDepth) !== Boolean(entry.fullDepth)) {
            fail(`Skill lock mismatch for ${entry.name}: fullDepth`);
          }
          const expectedInstallCommand = entry.fullDepth
            ? `npx skills add ${entry.package} --skill ${entry.skill} --full-depth --agent codex --yes --global`
            : `npx skills add ${entry.package} --skill ${entry.skill} --agent codex --yes --global`;
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
  } else {
    if (lock.lockSemantics !== "source-allowlist") {
      fail("catalog/skills-lock.json must declare lockSemantics=source-allowlist.");
    }
    if (!String(lock.immutability || "").includes("does not pin upstream commits")) {
      fail("catalog/skills-lock.json must state that it does not pin upstream commits.");
    }
  }

  if (online && failures.length === 0) {
    fs.mkdirSync(onlineCacheDir, { recursive: true });
    installable.forEach((entry, index) => {
      console.log(`Checking installable skill ${index + 1}/${installable.length}: ${entry.name}`);
      runSkillsUse(entry);
    });
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
