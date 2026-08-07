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
