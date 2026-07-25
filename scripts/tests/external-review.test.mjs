import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { applyPack, buildPackPlan, checkFreshness, scanSecrets } from "../external-review-cli.mjs";

function git(cwd, args) {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-chef-review-"));
  const repo = path.join(root, "repo");
  fs.mkdirSync(repo);
  git(repo, ["init", "-q"]);
  fs.writeFileSync(path.join(repo, "app.js"), "export const answer = 42;\n");
  git(repo, ["add", "app.js"]);
  git(repo, ["-c", "user.name=Codex Chef", "-c", "user.email=chef@example.invalid", "commit", "-qm", "fixture"]);
  fs.writeFileSync(path.join(repo, ".env"), `${"TO"}${"KEN"}=not-packaged\n`);
  git(repo, ["add", "-f", ".env"]);
  return { root, repo, out: path.join(root, "review") };
}

test("pack preview is tracked-text-only and performs no write", () => {
  const { repo, out } = fixture();
  const plan = buildPackPlan({ target: repo, out });
  assert.equal(fs.existsSync(out), false);
  assert.deepEqual(plan.manifest.files.map((file) => file.path), ["app.js"]);
  assert.equal(plan.manifest.excluded.some((file) => file.path === ".env"), true);
  assert.equal(plan.manifest.policy.externalUploadPerformed, false);
});

test("pack apply writes manifest and parts outside the target", () => {
  const { repo, out } = fixture();
  const plan = buildPackPlan({ target: repo, out, maxPartBytes: 10_000 });
  const manifestPath = applyPack(plan);
  assert.equal(fs.existsSync(manifestPath), true);
  assert.equal(fs.existsSync(path.join(out, "review-bundle-part-001.txt")), true);
  assert.equal(checkFreshness(repo, plan.manifest).fresh, true);
  fs.writeFileSync(path.join(repo, "app.js"), "export const answer = 43;\n");
  assert.equal(checkFreshness(repo, plan.manifest).fresh, false);
});

test("secret-like tracked content fails closed", () => {
  const { repo, out } = fixture();
  fs.writeFileSync(path.join(repo, "leak.txt"), `token=${"gh"}${"p_"}abcdefghijklmnopqrstuvwxyz1234567890\n`);
  git(repo, ["add", "leak.txt"]);
  assert.throws(() => buildPackPlan({ target: repo, out }), /Secret-like content blocked/);
  assert.deepEqual(scanSecrets(`-----BEGIN ${"PRIVATE"} KEY-----`), ["private key"]);
});

test("output inside target is rejected", () => {
  const { repo } = fixture();
  assert.throws(() => buildPackPlan({ target: repo, out: path.join(repo, "review") }), /outside the target/);
});
