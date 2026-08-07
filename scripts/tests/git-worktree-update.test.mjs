import assert from "node:assert/strict";
import test from "node:test";
import { classifyGitStatus } from "../lib/git-worktree.mjs";

test("update can proceed with unrelated untracked files", () => {
  const result = classifyGitStatus("?? GUNLUK_KODEX_KILAVUZU.md\n");

  assert.equal(result.blocking, false);
  assert.deepEqual(result.untracked, ["GUNLUK_KODEX_KILAVUZU.md"]);
});

test("update still blocks tracked edits and staged changes", () => {
  const result = classifyGitStatus(" M scripts/chef-cli.mjs\nM  package.json\n");

  assert.equal(result.blocking, true);
  assert.deepEqual(result.blockingLines, [" M scripts/chef-cli.mjs", "M  package.json"]);
});
