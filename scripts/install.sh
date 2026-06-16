#!/usr/bin/env bash
set -euo pipefail

INSTALL_SKILLS=0
INSTALL_GIT_GUARDS=0
ALL=0
FORCE=0
NO_BACKUP=0
DRY_RUN=0
PLAIN_OUTPUT=0
INTERACTIVE=0
SKIPPED_EXISTING_COUNT=0

for arg in "$@"; do
  case "$arg" in
    --all) ALL=1 ;;
    --install-skills) INSTALL_SKILLS=1 ;;
    --install-git-guards) INSTALL_GIT_GUARDS=1 ;;
    --force) FORCE=1 ;;
    --no-backup) NO_BACKUP=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --plain-output) PLAIN_OUTPUT=1 ;;
    --interactive) INTERACTIVE=1 ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

if [ "$ALL" -eq 1 ]; then
  INSTALL_SKILLS=1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
AGENTS_HOME_DIR="${AGENTS_HOME:-$HOME/.agents}"

icon() {
  if [ "$PLAIN_OUTPUT" -eq 1 ] || [ "${NO_COLOR:-}" != "" ] || [ "${TERM:-}" = "dumb" ]; then
    printf "%s" "$2"
  else
    printf "%s" "$1"
  fi
}

section() {
  echo ""
  printf "%s %s\n" "$(icon "🍳" "[*]")" "$1"
}

action() {
  printf "  %s %s: %s\n" "$(icon "✓" "-")" "$1" "$2"
}

note() {
  printf "  %s %s\n" "$(icon "•" "-")" "$1"
}

yes_no() {
  local prompt="$1"
  local default="$2"
  local suffix="[y/N]"
  if [ "$default" = "yes" ]; then
    suffix="[Y/n]"
  fi
  printf "%s %s " "$prompt" "$suffix"
  read -r answer
  if [ "$answer" = "" ]; then
    [ "$default" = "yes" ]
    return
  fi
  case "$(printf "%s" "$answer" | tr '[:upper:]' '[:lower:]')" in
    y|yes) return 0 ;;
    *) return 1 ;;
  esac
}

optional_path() {
  local label="$1"
  local current="$2"
  if [ "$INTERACTIVE" -ne 1 ]; then
    printf "%s" "$current"
    return
  fi
  printf "%s [%s] " "$label" "$current" >&2
  read -r answer
  if [ "$answer" = "" ]; then
    printf "%s" "$current"
  else
    printf "%s" "$answer"
  fi
}

any_managed_target_exists() {
  [ -e "$CODEX_HOME_DIR/AGENTS.md" ] ||
  [ -e "$CODEX_HOME_DIR/config.toml" ] ||
  [ -e "$CODEX_HOME_DIR/rules/default.rules" ] ||
  [ -e "$CODEX_HOME_DIR/plugins/codex-chef-workflows" ] ||
  [ -e "$AGENTS_HOME_DIR/plugins/marketplace.json" ]
}

if [ "$INTERACTIVE" -eq 1 ]; then
  section "Guided setup"
  note "Press Enter to accept the safe default shown in brackets."
  note "No tokens, secrets, cookies, sessions, or credentials are requested."
fi

CODEX_HOME_DIR="$(optional_path "Codex home" "$CODEX_HOME_DIR")"
AGENTS_HOME_DIR="$(optional_path "Agents home" "$AGENTS_HOME_DIR")"

if [ "$INTERACTIVE" -eq 1 ] && [ "$ALL" -eq 1 ] && [ "$INSTALL_SKILLS" -eq 1 ]; then
  if ! yes_no "Install or reconcile the 16 reviewed global Codex skills now?" "yes"; then
    INSTALL_SKILLS=0
  fi
fi

if [ "$INTERACTIVE" -eq 1 ] && [ "$FORCE" -ne 1 ] && any_managed_target_exists; then
  if yes_no "Replace existing managed Codex Chef files after backup instead of preserving/merging?" "no"; then
    FORCE=1
  fi
fi

if [ "$INTERACTIVE" -eq 1 ] && [ "$INSTALL_GIT_GUARDS" -ne 1 ]; then
  if yes_no "Install optional global Git guards for this user?" "no"; then
    INSTALL_GIT_GUARDS=1
  fi
fi

BACKUP_ROOT="$CODEX_HOME_DIR/backups/codex-chef-$(date +%Y%m%d-%H%M%S)"

run_change() {
  local target="$1"
  local action="$2"
  shift 2
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "Would $action: $target"
    return 1
  fi
  "$@"
}

ensure_dir() {
  run_change "$1" "ensure directory exists" mkdir -p "$1" || true
}

assert_managed_directory_target() {
  local target="$1"
  case "$target" in
    "$CODEX_HOME_DIR"/*|"$AGENTS_HOME_DIR"/*) return 0 ;;
    *)
      echo "Refusing to replace unmanaged directory target: $target" >&2
      exit 1
      ;;
  esac
}

backup_target() {
  local target="$1"
  if [ "$NO_BACKUP" -eq 1 ] || [ ! -e "$target" ]; then
    return
  fi
  ensure_dir "$BACKUP_ROOT"
  local rel
  case "$target" in
    "$CODEX_HOME_DIR"/*) rel="${target#"$CODEX_HOME_DIR"/}" ;;
    *) rel="$(basename "$target")" ;;
  esac
  ensure_dir "$(dirname "$BACKUP_ROOT/$rel")"
  run_change "$BACKUP_ROOT/$rel" "back up $target" cp -R "$target" "$BACKUP_ROOT/$rel" || true
}

install_file() {
  local source="$1"
  local destination="$2"
  if [ -e "$destination" ] && [ "$FORCE" -ne 1 ]; then
    SKIPPED_EXISTING_COUNT=$((SKIPPED_EXISTING_COUNT + 1))
    return
  fi
  ensure_dir "$(dirname "$destination")"
  backup_target "$destination"
  if run_change "$destination" "install file from $source" cp "$source" "$destination"; then
    action "installed" "$destination"
  fi
}

install_codex_config() {
  local source="$1"
  local destination="$2"
  if [ -e "$destination" ] && [ "$FORCE" -ne 1 ]; then
    ensure_dir "$(dirname "$destination")"
    backup_target "$destination"
    if [ "$DRY_RUN" -eq 1 ]; then
      run_change "$destination" "merge missing Codex Chef config blocks from $source" true || true
      node "$REPO_ROOT/scripts/merge-codex-config.mjs" "$source" "$destination" --dry-run
      return
    fi
    if run_change "$destination" "merge missing Codex Chef config blocks from $source" \
      node "$REPO_ROOT/scripts/merge-codex-config.mjs" "$source" "$destination"; then
      action "merged config" "$destination"
    fi
    return
  fi

  install_file "$source" "$destination"
}

install_directory() {
  local source="$1"
  local destination="$2"
  if [ -e "$destination" ] && [ "$FORCE" -ne 1 ]; then
    SKIPPED_EXISTING_COUNT=$((SKIPPED_EXISTING_COUNT + 1))
    return
  fi
  ensure_dir "$(dirname "$destination")"
  backup_target "$destination"
  assert_managed_directory_target "$destination"
  if [ -e "$destination" ]; then
    run_change "$destination" "replace existing managed directory" rm -rf "$destination" || true
  fi
  if run_change "$destination" "install directory from $source" cp -R "$source" "$destination"; then
    action "installed" "$destination"
  fi
}

section "Codex Chef installer"
note "Codex home: $CODEX_HOME_DIR"
note "Agents home: $AGENTS_HOME_DIR"
if [ "$FORCE" -eq 1 ]; then
  note "Mode: replace managed targets after backup"
else
  note "Mode: preserve existing files; merge missing config blocks"
fi
if [ "$INSTALL_SKILLS" -eq 1 ]; then
  note "Skills: install reviewed catalog entries with --agent codex"
else
  note "Skills: skipped unless --all or --install-skills is used"
fi
if [ "$INSTALL_GIT_GUARDS" -eq 1 ]; then
  note "Git guards: enabled for this user"
else
  note "Git guards: disabled by default"
fi
if [ "$DRY_RUN" -eq 1 ]; then
  note "Dry run: no files, Git settings, or skills will be changed"
fi
if [ "$INTERACTIVE" -eq 1 ]; then
  note "Existing config policy: backup + merge missing Codex Chef blocks unless force is enabled"
  note "Authenticated/account MCP connectors remain disabled by default"
  if ! yes_no "Continue with this plan?" "yes"; then
    echo "Codex Chef install cancelled by user." >&2
    exit 1
  fi
fi

section "Managed Codex files"
ensure_dir "$CODEX_HOME_DIR"
ensure_dir "$CODEX_HOME_DIR/agents"
ensure_dir "$CODEX_HOME_DIR/rules"
ensure_dir "$AGENTS_HOME_DIR"

TEMPLATE_ROOT="$REPO_ROOT/templates/codex"

install_file "$TEMPLATE_ROOT/AGENTS.md" "$CODEX_HOME_DIR/AGENTS.md"
install_codex_config "$TEMPLATE_ROOT/config.unix.toml" "$CODEX_HOME_DIR/config.toml"
install_file "$TEMPLATE_ROOT/rules/default.rules" "$CODEX_HOME_DIR/rules/default.rules"

for file in "$TEMPLATE_ROOT"/agents/*.toml; do
  install_file "$file" "$CODEX_HOME_DIR/agents/$(basename "$file")"
done

for file in "$TEMPLATE_ROOT"/profiles/*.toml; do
  install_file "$file" "$CODEX_HOME_DIR/$(basename "$file")"
done

PLUGIN_SOURCE="$REPO_ROOT/plugins/codex-chef-workflows"
PLUGIN_TARGET="$CODEX_HOME_DIR/plugins/codex-chef-workflows"
install_directory "$PLUGIN_SOURCE" "$PLUGIN_TARGET"

MARKETPLACE_DIR="$AGENTS_HOME_DIR/plugins"
MARKETPLACE_PATH="$MARKETPLACE_DIR/marketplace.json"
ensure_dir "$MARKETPLACE_DIR"
if [ -e "$MARKETPLACE_PATH" ] && [ "$FORCE" -ne 1 ]; then
  SKIPPED_EXISTING_COUNT=$((SKIPPED_EXISTING_COUNT + 1))
else
  backup_target "$MARKETPLACE_PATH"
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "Would install plugin marketplace: $MARKETPLACE_PATH"
  else
    node - "$MARKETPLACE_PATH" "$PLUGIN_TARGET" <<'NODE'
const fs = require("fs");
const [marketplacePath, pluginTarget] = process.argv.slice(2);
const marketplace = {
  name: "codex-chef",
  plugins: [
    {
      name: "codex-chef-workflows",
      source: {
        source: "local",
        path: pluginTarget
      },
      policy: {
        installation: "AVAILABLE",
        authentication: "NONE"
      },
      category: "Productivity"
    }
  ]
};
fs.writeFileSync(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`, "utf8");
NODE
    action "installed" "$MARKETPLACE_PATH"
  fi
fi

if [ "$INSTALL_GIT_GUARDS" -eq 1 ]; then
  section "Optional Git guards"
  GITIGNORE_TARGET="$HOME/.gitignore_global"
  HOOKS_DIR="$HOME/.githooks"
  install_file "$REPO_ROOT/templates/git/.gitignore_global" "$GITIGNORE_TARGET"
  ensure_dir "$HOOKS_DIR"
  install_file "$REPO_ROOT/templates/git/pre-commit" "$HOOKS_DIR/pre-commit"
  run_change "$HOOKS_DIR/pre-commit" "mark hook executable" chmod +x "$HOOKS_DIR/pre-commit" || true
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "Would set global Git config core.excludesfile: $GITIGNORE_TARGET"
    echo "Would set global Git config core.hooksPath: $HOOKS_DIR"
  else
    git config --global core.excludesfile "$GITIGNORE_TARGET"
    git config --global core.hooksPath "$HOOKS_DIR"
    action "configured" "global Git excludesfile and hooksPath"
  fi
fi

if [ "$INSTALL_SKILLS" -eq 1 ]; then
  section "Curated skills"
  if [ "$DRY_RUN" -eq 1 ]; then
    node - "$REPO_ROOT/catalog/skills.json" <<'NODE'
const fs = require("fs");
const catalog = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
for (const skill of catalog.skills.filter((item) => item.install)) {
  const depthFlag = skill.fullDepth ? " --full-depth" : "";
  console.log(`Would install skill: ${skill.name} from ${skill.package} --skill ${skill.skill}${depthFlag}`);
}
NODE
    echo "Skipped skill installation because --dry-run is active."
  else
  node - "$REPO_ROOT/catalog/skills.json" <<'NODE'
const fs = require("fs");
const { spawnSync } = require("child_process");
const catalog = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const env = {
  ...process.env,
  GIT_CONFIG_COUNT: process.env.GIT_CONFIG_COUNT || "1",
  GIT_CONFIG_KEY_0: process.env.GIT_CONFIG_KEY_0 || "http.sslBackend",
  GIT_CONFIG_VALUE_0: process.env.GIT_CONFIG_VALUE_0 || "openssl",
  CI: process.env.CI || "1",
  NO_COLOR: process.env.NO_COLOR || "1",
  FORCE_COLOR: process.env.FORCE_COLOR || "0",
  TERM: process.env.TERM || "dumb",
  npm_config_cache: process.env.npm_config_cache || `${process.cwd()}/tmp/npm-cache`,
  NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE || process.env.npm_config_cache || `${process.cwd()}/tmp/npm-cache`
};
const installed = new Set();
const listResult = spawnSync("npx", ["skills", "list", "--global", "--json"], {
  encoding: "utf8",
  env
});
if (listResult.status === 0 && listResult.stdout.trim()) {
  for (const skill of JSON.parse(listResult.stdout)) {
    installed.add(skill.name);
  }
}

for (const skill of catalog.skills.filter((item) => item.install)) {
  if (!skill.package || !skill.skill) {
    console.warn(`Skipped skill without verified package and skill fields: ${skill.name}`);
    continue;
  }
  if (installed.has(skill.name)) {
    console.log(`Skill already installed: ${skill.name}`);
    continue;
  }

  const depthFlag = skill.fullDepth ? " --full-depth" : "";
  console.log(`Installing skill: ${skill.name} from ${skill.package} --skill ${skill.skill}${depthFlag}`);
  const args = ["skills", "add", skill.package, "--skill", skill.skill];
  if (skill.fullDepth) args.push("--full-depth");
  args.push("--agent", "codex", "--yes", "--global");
  const result = spawnSync(
    "npx",
    args,
    { encoding: "utf8", env }
  );
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.status !== 0 || /Failed to install|Installation failed|Failed to clone/.test(output)) {
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    console.error(`Skill install failed for ${skill.name}`);
    process.exit(1);
  }
  console.log(`Installed skill: ${skill.name}`);
}
NODE
  fi
fi

section "Capability board"
node - "$REPO_ROOT" <<'NODE'
const fs = require("fs");
const path = require("path");

const root = process.argv[2];
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const agentCatalog = readJson("catalog/agents.json");
const mcpCatalog = readJson("catalog/mcp-servers.json");
const skillCatalog = readJson("catalog/skills.json");
const pluginSkillRoot = path.join(root, "plugins/codex-chef-workflows/skills");

const agents = agentCatalog.agents.map((agent) => agent.name);
const readyMcps = mcpCatalog.servers
  .filter((server) => server.defaultEnabled === true)
  .map((server) => server.name);
const optInMcps = mcpCatalog.servers
  .filter((server) => server.defaultEnabled !== true)
  .map((server) => server.name);
const pluginSkills = fs
  .readdirSync(pluginSkillRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const reviewedSkills = skillCatalog.skills
  .filter((skill) => skill.install === true)
  .map((skill) => skill.name);

for (const [label, names] of [
  ["Agents ready", agents],
  ["MCP ready by default", readyMcps],
  ["MCP opt-in / disabled by default", optInMcps],
  ["Local plugin skills", pluginSkills],
  ["Reviewed global skills", reviewedSkills]
]) {
  console.log(`  - ${label} (${names.length}):`);
  console.log(`    ${names.join(", ")}`);
}
console.log("  - Account, database, production, and broad filesystem connectors stay disabled until explicitly enabled.");
NODE

section "Next steps"
if [ "$SKIPPED_EXISTING_COUNT" -gt 0 ]; then
  note "$SKIPPED_EXISTING_COUNT existing managed target(s) were preserved; use --force only for a deliberate backup-backed replacement"
fi
if [ "$DRY_RUN" -eq 1 ]; then
  action "completed" "Codex Chef dry run"
else
  action "completed" "Codex Chef install"
  note "Restart Codex, then run:"
  echo "    codex doctor --summary"
  echo "    npm run verify:install:runtime"
  echo '    codex --strict-config "Summarize the active Codex setup."'
fi
if [ "$NO_BACKUP" -ne 1 ] && [ -d "$BACKUP_ROOT" ]; then
  note "Backup: $BACKUP_ROOT"
fi
