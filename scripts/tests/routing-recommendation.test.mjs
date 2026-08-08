import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const board = path.join(root, "scripts", "codex-routing-board.mjs");

function run(...args) {
  return JSON.parse(execFileSync(process.execPath, [board, ...args], { cwd: root, encoding: "utf8" }));
}

test("task routing is deterministic, weighted, bounded, and advisory-only", () => {
  const first = run("--task", "MCP connector OAuth tool allowlist güvenlik", "--json");
  const second = run("--task", "MCP connector OAuth tool allowlist güvenlik", "--json");
  assert.deepEqual(first.taskRecommendation.recommendations, second.taskRecommendation.recommendations);
  assert.equal(first.taskRecommendation.algorithm, "weighted-catalog-v1");
  assert.equal(first.taskRecommendation.recommendations[0].id, "mcp-connector-change");
  assert.equal(first.taskRecommendation.recommendations[0].confidence, "high");
  assert.ok(first.taskRecommendation.recommendations[0].matchedPhrases.includes("mcp connector"));
  assert.ok(first.taskRecommendation.recommendations.length > 0);
  assert.ok(first.taskRecommendation.recommendations.length <= 3);
  assert.ok(first.taskRecommendation.recommendations.every((entry) => entry.advisory === true));
});

test("release and Turkish security signals select their high-priority routes", () => {
  const release = run("--task", "GitHub Release tag oluştur ve origin main push", "--json");
  const security = run("--task", "kimlik yetki parola güvenlik incelemesi", "--json");
  assert.equal(release.taskRecommendation.recommendations[0].id, "release-or-publish");
  assert.equal(security.taskRecommendation.recommendations[0].id, "security-sensitive");
});

test("unmatched task returns no advisory route", () => {
  const report = run("--task", "zzzxqv unmatched token", "--json");
  assert.deepEqual(report.taskRecommendation.recommendations, []);
  assert.deepEqual(report.profiles, []);
});
