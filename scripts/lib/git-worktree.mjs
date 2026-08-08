export function classifyGitStatus(statusOutput = "") {
  const lines = String(statusOutput)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
  const untracked = [];
  const blockingLines = [];

  for (const line of lines) {
    if (line.startsWith("?? ")) {
      untracked.push(line.slice(3));
    } else {
      blockingLines.push(line);
    }
  }

  return {
    dirty: lines.length > 0,
    blocking: blockingLines.length > 0,
    blockingLines,
    untracked,
    untrackedOnly: lines.length > 0 && blockingLines.length === 0
  };
}

export function summarizeGitStatus(statusOutput = "") {
  const worktree = classifyGitStatus(statusOutput);
  const blockingLineCount = worktree.blockingLines.length;
  const untrackedCount = worktree.untracked.length;
  return {
    status: blockingLineCount === 0 ? "ok" : "attention",
    dirtyLineCount: blockingLineCount,
    untrackedCount,
    untrackedOnly: worktree.untrackedOnly,
    summary: blockingLineCount > 0
      ? `git status --short reports ${blockingLineCount} changed line(s).`
      : untrackedCount > 0
        ? `No tracked or staged changes; ${untrackedCount} unrelated untracked file(s) are preserved by update.`
        : "git status --short is clean."
  };
}
