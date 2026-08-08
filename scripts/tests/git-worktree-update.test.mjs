import assert from "node:assert/strict";
import test from "node:test";
import { classifyGitStatus, summarizeGitStatus } from "../lib/git-worktree.mjs";

test("update can proceed with unrelated untracked files", () => {
  const result = classifyGitStatus("?? GUNLUK_KODEX_KILAVUZU.md\n");

  assert.equal(result.blocking, false);
  assert.equal(result.untrackedOnly, true);
  assert.deepEqual(result.untracked, ["GUNLUK_KODEX_KILAVUZU.md"]);
});

test("status treats untracked-only worktrees as non-blocking while retaining the update-preservation notice", () => {
  const result = summarizeGitStatus("?? local-notes.md\n");
  assert.equal(result.status, "ok");
  assert.equal(result.dirtyLineCount, 0);
  assert.equal(result.untrackedCount, 1);
  assert.match(result.summary, /preserved by update/i);
});

test("update still blocks tracked edits and staged changes", () => {
  const result = classifyGitStatus(" M scripts/chef-cli.mjs\nM  package.json\n");

  assert.equal(result.blocking, true);
  assert.equal(result.untrackedOnly, false);
  assert.deepEqual(result.blockingLines, [" M scripts/chef-cli.mjs", "M  package.json"]);
});
