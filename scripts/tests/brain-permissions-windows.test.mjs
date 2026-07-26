#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const modulePath = path.resolve(here, "../lib/brain-permissions-windows.mjs");

async function loadPermissions() {
  assert.equal(fs.existsSync(modulePath), true, "Windows Brain permission audit module must exist.");
  return import(pathToFileURL(modulePath).href);
}

const FULL_CONTROL = 0x1f01ff;
const READ_EXECUTE_SYNCHRONIZE = 0x1200a9;

function rule(role, rights) {
  return {
    role,
    accessType: "Allow",
    rights,
    inherited: false,
    inheritanceFlags: 3,
    propagationFlags: 0
  };
}

function safeSnapshot() {
  return {
    inheritanceProtected: true,
    rootRules: [
      rule("system", FULL_CONTROL),
      rule("administrators", FULL_CONTROL),
      rule("owner", FULL_CONTROL),
      rule("sandbox", READ_EXECUTE_SYNCHRONIZE)
    ],
    tree: {
      itemCount: 224,
      protectedDescendantCount: 0,
      explicitAccessDescendantCount: 0,
      sandboxReadOnlyItemCount: 224,
      sandboxWriteItemCount: 0,
      sandboxMissingItemCount: 0,
      sandboxOtherItemCount: 0,
      ownerMismatchItemCount: 0,
      canonicalAccessItemCount: 224,
      reparsePointCount: 0,
      scanErrorCount: 0
    }
  };
}

test("Windows Brain permission policy accepts only owner-mediated full control plus sandbox read access", async () => {
  const { evaluateWindowsBrainPermissions } = await loadPermissions();
  const result = evaluateWindowsBrainPermissions(safeSnapshot());

  assert.equal(result.schemaVersion, "codex-chef.brain-permissions-windows.v1");
  assert.equal(result.supported, true);
  assert.equal(result.ok, true);
  assert.equal(result.risk, "none");
  assert.deepEqual(result.errors, []);
  assert.equal(result.checks.sandboxReadOnlyEverywhere, true);
  assert.equal(result.metrics.itemCount, 224);
});

test("Windows Brain permission policy rejects incomplete inherited policy and reparse points", async () => {
  const { evaluateWindowsBrainPermissions } = await loadPermissions();
  const snapshot = safeSnapshot();
  snapshot.tree.canonicalAccessItemCount = 223;
  snapshot.tree.reparsePointCount = 1;

  const result = evaluateWindowsBrainPermissions(snapshot);

  assert.equal(result.ok, false);
  assert.equal(result.checks.canonicalAccessEverywhere, false);
  assert.equal(result.checks.noReparsePoints, false);
  assert.match(result.errors.join("\n"), /access policy/i);
  assert.match(result.errors.join("\n"), /reparse/i);
});

test("Windows Brain permission policy rejects a descendant owned outside the vault owner boundary", async () => {
  const { evaluateWindowsBrainPermissions } = await loadPermissions();
  const snapshot = safeSnapshot();
  snapshot.tree.ownerMismatchItemCount = 1;

  const result = evaluateWindowsBrainPermissions(snapshot);

  assert.equal(result.ok, false);
  assert.equal(result.checks.singleOwnerBoundary, false);
  assert.match(result.errors.join("\n"), /owner/i);
});

test("Windows Brain permission policy reports write-capable and unexpected access without retaining identities", async () => {
  const { evaluateWindowsBrainPermissions } = await loadPermissions();
  const snapshot = safeSnapshot();
  snapshot.rootRules[3].rights = 0x1301bf;
  snapshot.rootRules.push(rule("other", 0x1301bf));
  snapshot.tree.sandboxReadOnlyItemCount = 0;
  snapshot.tree.sandboxWriteItemCount = 224;

  const result = evaluateWindowsBrainPermissions(snapshot);

  assert.equal(result.ok, false);
  assert.equal(result.risk, "high");
  assert.equal(result.checks.sandboxRootReadOnly, false);
  assert.equal(result.checks.noUnexpectedRootAccess, false);
  assert.equal(result.checks.sandboxReadOnlyEverywhere, false);
  assert.match(result.errors.join("\n"), /write-capable/i);
  assert.match(result.errors.join("\n"), /unexpected root access/i);
  assert.equal(JSON.stringify(result).includes("S-1-5-21"), false);
});

test("Windows permission invocation is fixed, shell-free and transfers the target only through stdin", async () => {
  const { buildWindowsPermissionInvocation } = await loadPermissions();
  const executable = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
  const target = "C:\\Brain & echo unsafe";
  const invocation = buildWindowsPermissionInvocation({ executable, target });

  assert.equal(invocation.executable, executable);
  assert.equal(invocation.shell, false);
  assert.deepEqual(invocation.args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]);
  assert.equal(invocation.args.includes(target), false);
  assert.equal(invocation.input, target);
  assert.throws(() => buildWindowsPermissionInvocation({ executable: "powershell.exe", target }), /absolute/i);
});

test("permission inspection is explicitly unsupported off Windows and never spawns", async () => {
  const { inspectWindowsBrainPermissions } = await loadPermissions();
  let spawnCount = 0;
  const result = inspectWindowsBrainPermissions("/tmp/Brain", {
    platform: "linux",
    spawn() {
      spawnCount += 1;
      throw new Error("must not run");
    }
  });

  assert.deepEqual(result, {
    schemaVersion: "codex-chef.brain-permissions-windows.v1",
    supported: false,
    ok: null,
    risk: "unsupported",
    checks: {},
    metrics: {},
    errors: ["Windows ACL inspection is unavailable on this platform."]
  });
  assert.equal(spawnCount, 0);
  assert.equal(path.isAbsolute("/tmp/Brain"), true);
});

test("Windows Brain permission audit source contains no ACL or filesystem mutation primitive", async () => {
  await loadPermissions();
  const source = fs.readFileSync(modulePath, "utf8");
  assert.doesNotMatch(source, /\b(?:SetAccessControl|Set-Acl|icacls|Remove-Item|Move-Item|New-Item)\b/i);
  assert.doesNotMatch(source, /\bfs\.(?:writeFile|appendFile|rm|rename|mkdir|unlink|chmod|chown)Sync\b/);
});
