export function platformCommand(name, platform = process.platform) {
  if (platform !== "win32") return name;
  const windowsCommands = {
    npm: "npm.cmd",
    npx: "npx.cmd",
    codex: "codex.cmd"
  };
  return windowsCommands[name] || name;
}
