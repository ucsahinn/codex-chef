#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const modulePath = path.join(root, "scripts/lib/brain-foundation.mjs");
const templateRoot = path.join(root, "templates/brain");

async function loadFoundation() {
  assert.equal(
    fs.existsSync(modulePath),
    true,
    "Brain foundation module must exist before behavior can be verified."
  );
  return import(pathToFileURL(modulePath).href);
}

test("preview plans a complete vault without writing the target", async () => {
  const { buildBrainPlan } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-preview-"));
  const target = path.join(sandbox, "CodexChefBrain");

  const plan = buildBrainPlan({ templateRoot, target });

  assert.equal(fs.existsSync(target), false);
  assert.equal(plan.conflicts.length, 0);
  assert.ok(plan.operations.some((entry) => entry.relativePath === "AGENTS.md"));
  assert.ok(plan.operations.some((entry) => entry.relativePath === "brain.config.json"));
  assert.ok(plan.operations.some((entry) => entry.relativePath === "80-memory/current-context.md"));
});

test("apply creates missing files and never overwrites a conflicting file", async () => {
  const { applyBrainPlan, buildBrainPlan } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-apply-"));
  const target = path.join(sandbox, "CodexChefBrain");

  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, "AGENTS.md"), "user-owned\n", "utf8");

  const plan = buildBrainPlan({ templateRoot, target });
  assert.deepEqual(plan.conflicts.map((entry) => entry.relativePath), ["AGENTS.md"]);

  const result = applyBrainPlan(plan);

  assert.equal(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), "user-owned\n");
  assert.equal(result.overwritten.length, 0);
  assert.ok(result.created.includes("brain.config.json"));
});

test("validation reports missing required files", async () => {
  const { validateBrainVault } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-invalid-"));

  const result = validateBrainVault(sandbox);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((message) => message.includes("AGENTS.md")));
  assert.ok(result.errors.some((message) => message.includes("brain.config.json")));
});

test("validation ignores Obsidian session state and validates canonical note frontmatter", async () => {
  const { applyBrainPlan, buildBrainPlan, validateBrainVault } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-note-validation-"));
  const target = path.join(sandbox, "CodexChefBrain");
  applyBrainPlan(buildBrainPlan({ templateRoot, target }));
  fs.mkdirSync(path.join(target, ".obsidian"));
  fs.writeFileSync(path.join(target, ".obsidian", "workspace.json"), '{"session":"OPENAI_API_KEY=not-canonical"}', "utf8");
  assert.equal(validateBrainVault(target).ok, true);

  fs.writeFileSync(path.join(target, "30-projects", "invalid.md"), `---
brain_schema: "codex-chef.brain-note.v1"
type: "project"
title: "Invalid note"
project_id: "brain"
status: "active"
privacy: "local"
confidence: "confirmed"
retention: "project"
created: "2026-07-22T10:00:00.000Z"
updated: "2026-07-22T10:00:00.000Z"
source_refs: ["local:test"]
---

Missing an ID.
`, "utf8");
  const invalid = validateBrainVault(target);
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some((message) => /invalid\.md.*id/i.test(message)));
});

test("unsafe broad targets are rejected", async () => {
  const { assertSafeBrainTarget, validateBrainVault } = await loadFoundation();

  assert.throws(() => assertSafeBrainTarget(path.parse(process.cwd()).root), /filesystem root/i);
  assert.throws(() => assertSafeBrainTarget(os.homedir()), /user profile root/i);
  assert.throws(() => assertSafeBrainTarget("\\\\server\\share\\Brain"), /network|UNC/i);
  assert.throws(() => validateBrainVault(path.parse(process.cwd()).root), /filesystem root/i);
  assert.throws(() => validateBrainVault(os.homedir()), /user profile root/i);
});

test("a second apply is idempotent and creates nothing", async () => {
  const { applyBrainPlan, buildBrainPlan } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-idempotent-"));
  const target = path.join(sandbox, "CodexChefBrain");

  applyBrainPlan(buildBrainPlan({ templateRoot, target }));
  const result = applyBrainPlan(buildBrainPlan({ templateRoot, target }));

  assert.equal(result.created.length, 0);
  assert.equal(result.conflicts.length, 0);
  assert.ok(result.identical.includes("AGENTS.md"));
});

test("apply re-resolves every planned destination inside the vault", async () => {
  const { applyBrainPlan, buildBrainPlan } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-plan-tamper-"));
  const target = path.join(sandbox, "CodexChefBrain");
  const outside = path.join(sandbox, "outside.md");
  const plan = buildBrainPlan({ templateRoot, target });
  plan.operations[0].destinationPath = outside;

  assert.throws(() => applyBrainPlan(plan), /plan|destination|vault/i);
  assert.equal(fs.existsSync(outside), false);
});

test("capture is preview-first, rejects secrets, and retrieve stays project-scoped", async () => {
  const {
    applyBrainPlan,
    applyCapturePlan,
    buildBrainPlan,
    buildCapturePlan,
    retrieveBrainNotes
  } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-capture-"));
  const target = path.join(sandbox, "CodexChefBrain");
  applyBrainPlan(buildBrainPlan({ templateRoot, target }));

  const candidate = {
    schemaVersion: "codex-chef.brain-candidate.v1",
    candidateId: "11111111-1111-4111-8111-111111111111",
    type: "decision",
    title: "VaultPilot lisans kararı",
    projectId: "vaultpilot",
    bodyMarkdown: "Lisanslar çevrimdışı imzalı olacak.",
    privacy: "local",
    confidence: "confirmed",
    retention: "permanent",
    sourceRefs: ["user:2026-07-22"]
  };
  const plan = buildCapturePlan({ target, candidate, now: "2026-07-22T12:00:00.000Z" });
  assert.equal(fs.existsSync(plan.destinationPath), false);
  applyCapturePlan(plan);

  const context = retrieveBrainNotes({ target, projectId: "vaultpilot", query: "lisans" });
  assert.equal(context.notes.length, 1);
  assert.equal(context.notes[0].title, candidate.title);
  assert.equal(context.notes[0].projectId, "vaultpilot");
  assert.equal(retrieveBrainNotes({ target, projectId: "başka", query: "lisans" }).notes.length, 0);

  assert.throws(() => buildCapturePlan({
    target,
    candidate: { ...candidate, candidateId: "22222222-2222-4222-8222-222222222222", bodyMarkdown: "password = super-secret-value-123456" },
    now: "2026-07-22T12:00:00.000Z"
  }), /secret/i);
});

test("identical capture is rechecked at apply time", async () => {
  const { applyBrainPlan, applyCapturePlan, buildBrainPlan, buildCapturePlan } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-identical-race-"));
  const target = path.join(sandbox, "CodexChefBrain");
  applyBrainPlan(buildBrainPlan({ templateRoot, target }));
  const candidate = {
    schemaVersion: "codex-chef.brain-candidate.v1",
    candidateId: "44444444-4444-4444-8444-444444444444",
    type: "knowledge",
    title: "Idempotent capture",
    projectId: "codex-chef",
    bodyMarkdown: "Same candidate must remain identical.",
    privacy: "local",
    confidence: "confirmed",
    retention: "project",
    sourceRefs: ["user:2026-07-22"]
  };
  const now = "2026-07-22T12:00:00.000Z";
  applyCapturePlan(buildCapturePlan({ target, candidate, now }));
  const identicalPlan = buildCapturePlan({ target, candidate, now });
  assert.equal(identicalPlan.status, "identical");
  fs.writeFileSync(identicalPlan.destinationPath, "changed after preview\n", "utf8");
  assert.throws(() => applyCapturePlan(identicalPlan), /changed|identical|conflict/i);
});

test("backup and restore are explicit plans and round-trip Markdown", async () => {
  const {
    applyBackupPlan,
    applyBrainPlan,
    applyRestorePlan,
    buildBackupPlan,
    buildBrainPlan,
    buildRestorePlan
  } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-backup-"));
  const target = path.join(sandbox, "CodexChefBrain");
  applyBrainPlan(buildBrainPlan({ templateRoot, target }));
  const file = path.join(target, "80-memory", "current-context.md");
  fs.writeFileSync(file, "original context\n", "utf8");

  const backup = applyBackupPlan(buildBackupPlan({ target, backupId: "backup-test" }));
  fs.writeFileSync(file, "changed context\n", "utf8");
  const restorePlan = buildRestorePlan({ target, backupId: backup.backupId });
  assert.ok(restorePlan.operations.some((entry) => entry.relativePath === "80-memory/current-context.md"));
  applyRestorePlan(restorePlan);

  assert.equal(fs.readFileSync(file, "utf8"), "original context\n");
});

test("restore preflights every file before changing any vault content", async () => {
  const {
    applyBackupPlan,
    applyBrainPlan,
    applyRestorePlan,
    buildBackupPlan,
    buildBrainPlan,
    buildRestorePlan
  } = await loadFoundation();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-brain-restore-race-"));
  const target = path.join(sandbox, "CodexChefBrain");
  applyBrainPlan(buildBrainPlan({ templateRoot, target }));
  const first = path.join(target, "80-memory", "current-context.md");
  const second = path.join(target, "80-memory", "decisions.md");
  applyBackupPlan(buildBackupPlan({ target, backupId: "preflight-test" }));
  fs.writeFileSync(first, "first changed\n", "utf8");
  fs.writeFileSync(second, "second changed\n", "utf8");
  const restorePlan = buildRestorePlan({ target, backupId: "preflight-test" });
  fs.writeFileSync(second, "second changed after preview\n", "utf8");

  assert.throws(() => applyRestorePlan(restorePlan), /changed after restore preview/i);
  assert.equal(fs.readFileSync(first, "utf8"), "first changed\n");
  assert.equal(fs.readFileSync(second, "utf8"), "second changed after preview\n");
});
