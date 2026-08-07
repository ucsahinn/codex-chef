import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120000,
    windowsHide: true,
    ...options
  });
}

function installFixture(codexHome, agentsHome) {
  const env = { ...process.env, CODEX_HOME: codexHome, AGENTS_HOME: agentsHome, NO_COLOR: "1", FORCE_COLOR: "0" };
  const result = process.platform === "win32"
    ? run("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ".\\scripts\\install.ps1", "-PlainOutput"], { env })
    : run("bash", ["scripts/install.sh", "--plain-output"], { env });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function writeEmptyMcpCodex(binDir, codexHome) {
  const escapedHome = fs.realpathSync.native(codexHome).replaceAll("\\", "\\\\");
  if (process.platform === "win32") {
    const command = path.join(binDir, "codex.cmd");
    fs.writeFileSync(command, [
      "@echo off",
      `if \"%1\"==\"doctor\" echo {\"checks\":{\"config.load\":{\"details\":{\"CODEX_HOME\":\"${escapedHome}\",\"config.toml\":\"${escapedHome}\\\\config.toml\"}}}} & exit /b 0`,
      "if \"%1\"==\"mcp\" echo [] & exit /b 0",
      "if \"%1\"==\"plugin\" echo {\"installed\":[],\"available\":[]} & exit /b 0",
      "exit /b 1",
      ""
    ].join("\r\n"), "utf8");
    return;
  }
  const command = path.join(binDir, "codex");
  fs.writeFileSync(command, [
    "#!/bin/sh",
    `if [ \"$1\" = \"doctor\" ]; then printf '%s\\n' '{\"checks\":{\"config.load\":{\"details\":{\"CODEX_HOME\":\"${escapedHome}\",\"config.toml\":\"${escapedHome}/config.toml\"}}}}'; exit 0; fi`,
    "if [ \"$1\" = \"mcp\" ]; then printf '[]\\n'; exit 0; fi",
    "if [ \"$1\" = \"plugin\" ]; then printf '{\"installed\":[],\"available\":[]}\\n'; exit 0; fi",
    "exit 1",
    ""
  ].join("\n"), "utf8");
  fs.chmodSync(command, 0o755);
}

test("runtime verifier treats an empty live MCP list as ambiguous when managed config is present", () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-runtime-verifier-"));
  try {
    const codexHome = path.join(fixtureRoot, ".codex");
    const agentsHome = path.join(fixtureRoot, ".agents");
    const binDir = path.join(fixtureRoot, "bin");
    fs.mkdirSync(binDir);
    installFixture(codexHome, agentsHome);
    writeEmptyMcpCodex(binDir, codexHome);

    const probeEnv = { ...process.env, CODEX_HOME: codexHome, AGENTS_HOME: agentsHome };
    for (const key of Object.keys(probeEnv)) {
      if (key.toLowerCase() === "path") delete probeEnv[key];
    }
    probeEnv[process.platform === "win32" ? "Path" : "PATH"] = `${binDir}${path.delimiter}${process.env.Path || process.env.PATH || ""}`;
    const result = run(process.execPath, [
      "scripts/verify-install-runtime.mjs",
      "--json",
      "--require-live-runtime",
      "--codex-home", codexHome,
      "--agents-home", agentsHome
    ], {
      env: probeEnv
    });

    const report = JSON.parse(result.stdout);
    assert.deepEqual(report.runtime.mcpList.missing, []);
    assert.equal(
      report.failures.some((failure) => failure.startsWith("codex mcp list with installed CODEX_HOME is missing:")),
      false
    );
    assert.match(report.warnings.join("\n"), /returned no MCP servers despite a managed installed configuration/i);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("installed profile launcher applies MCP enablement through Codex config overrides", () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-profile-launcher-"));
  try {
    const codexHome = path.join(fixtureRoot, ".codex");
    const agentsHome = path.join(fixtureRoot, ".agents");
    const binDir = path.join(fixtureRoot, "bin");
    fs.mkdirSync(binDir);
    installFixture(codexHome, agentsHome);
    const capturePath = path.join(fixtureRoot, "captured-args.json");
    if (process.platform === "win32") {
      fs.writeFileSync(path.join(binDir, "codex.cmd"), [
        "@echo off",
        `node -e \"require('fs').writeFileSync(process.env.CAPTURE_PATH, JSON.stringify(process.argv.slice(1)))\" -- %*`,
        ""
      ].join("\r\n"), "utf8");
    } else {
      fs.writeFileSync(path.join(binDir, "codex"), [
        "#!/bin/sh",
        "node -e 'require(\"fs\").writeFileSync(process.env.CAPTURE_PATH, JSON.stringify(process.argv.slice(1)))' -- \"$@\"",
        ""
      ].join("\n"), "utf8");
      fs.chmodSync(path.join(binDir, "codex"), 0o755);
    }
    const env = { ...process.env, CODEX_HOME: codexHome, AGENTS_HOME: agentsHome, CAPTURE_PATH: capturePath };
    const testPath = `${binDir}${path.delimiter}${process.env.Path || process.env.PATH || ""}`;
    env.PATH = testPath;
    env.Path = testPath;
    const result = run(process.execPath, [path.join(codexHome, "codex-profile.mjs"), "full", "exec", "hello"], { env });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const captured = JSON.parse(fs.readFileSync(capturePath, "utf8"));
    const normalized = captured.map((arg) => arg.replace(/^"|"$/g, ""));
    assert.deepEqual(normalized.slice(-2), ["exec", "hello"]);
    assert.ok(normalized.includes("mcp_servers.codebase-memory.enabled=true"));
    assert.ok(normalized.includes("mcp_servers.sequential-thinking.enabled=true"));
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
