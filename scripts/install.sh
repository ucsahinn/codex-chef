#!/usr/bin/env bash
set -euo pipefail

INSTALL_SKILLS=0
INSTALL_GIT_GUARDS=0
FORCE=0
NO_BACKUP=0

for arg in "$@"; do
  case "$arg" in
    --install-skills) INSTALL_SKILLS=1 ;;
    --install-git-guards) INSTALL_GIT_GUARDS=1 ;;
    --force) FORCE=1 ;;
    --no-backup) NO_BACKUP=1 ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODEX_HOME_DIR="${CODEX_HOME:-$HOME/.codex}"
AGENTS_HOME_DIR="${AGENTS_HOME:-$HOME/.agents}"
BACKUP_ROOT="$CODEX_HOME_DIR/backups/codex-enterprise-starter-$(date +%Y%m%d-%H%M%S)"

ensure_dir() {
  mkdir -p "$1"
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
  cp -R "$target" "$BACKUP_ROOT/$rel"
}

install_file() {
  local source="$1"
  local destination="$2"
  if [ -e "$destination" ] && [ "$FORCE" -ne 1 ]; then
    echo "Skipped existing file: $destination (use --force to replace after backup)" >&2
    return
  fi
  ensure_dir "$(dirname "$destination")"
  backup_target "$destination"
  cp "$source" "$destination"
  echo "Installed $destination"
}

install_directory() {
  local source="$1"
  local destination="$2"
  if [ -e "$destination" ] && [ "$FORCE" -ne 1 ]; then
    echo "Skipped existing directory: $destination (use --force to replace after backup)" >&2
    return
  fi
  ensure_dir "$(dirname "$destination")"
  backup_target "$destination"
  rm -rf "$destination"
  cp -R "$source" "$destination"
  echo "Installed $destination"
}

ensure_dir "$CODEX_HOME_DIR"
ensure_dir "$CODEX_HOME_DIR/agents"
ensure_dir "$CODEX_HOME_DIR/rules"
ensure_dir "$AGENTS_HOME_DIR"

TEMPLATE_ROOT="$REPO_ROOT/templates/codex"

install_file "$TEMPLATE_ROOT/AGENTS.md" "$CODEX_HOME_DIR/AGENTS.md"
install_file "$TEMPLATE_ROOT/config.unix.toml" "$CODEX_HOME_DIR/config.toml"
install_file "$TEMPLATE_ROOT/rules/default.rules" "$CODEX_HOME_DIR/rules/default.rules"

for file in "$TEMPLATE_ROOT"/agents/*.toml; do
  install_file "$file" "$CODEX_HOME_DIR/agents/$(basename "$file")"
done

for file in "$TEMPLATE_ROOT"/profiles/*.toml; do
  install_file "$file" "$CODEX_HOME_DIR/$(basename "$file")"
done

PLUGIN_SOURCE="$REPO_ROOT/plugins/codex-enterprise-workflows"
PLUGIN_TARGET="$CODEX_HOME_DIR/plugins/codex-enterprise-workflows"
install_directory "$PLUGIN_SOURCE" "$PLUGIN_TARGET"

MARKETPLACE_DIR="$AGENTS_HOME_DIR/plugins"
MARKETPLACE_PATH="$MARKETPLACE_DIR/marketplace.json"
ensure_dir "$MARKETPLACE_DIR"
if [ -e "$MARKETPLACE_PATH" ] && [ "$FORCE" -ne 1 ]; then
  echo "Skipped existing marketplace: $MARKETPLACE_PATH (use --force to replace after backup)" >&2
else
  backup_target "$MARKETPLACE_PATH"
  cat > "$MARKETPLACE_PATH" <<JSON
{
  "name": "codex-enterprise-starter",
  "plugins": [
    {
      "name": "codex-enterprise-workflows",
      "source": {
        "source": "local",
        "path": "$PLUGIN_TARGET"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "NONE"
      },
      "category": "Productivity"
    }
  ]
}
JSON
  echo "Installed $MARKETPLACE_PATH"
fi

if [ "$INSTALL_GIT_GUARDS" -eq 1 ]; then
  GITIGNORE_TARGET="$HOME/.gitignore_global"
  HOOKS_DIR="$HOME/.githooks"
  install_file "$REPO_ROOT/templates/git/.gitignore_global" "$GITIGNORE_TARGET"
  ensure_dir "$HOOKS_DIR"
  install_file "$REPO_ROOT/templates/git/pre-commit" "$HOOKS_DIR/pre-commit"
  chmod +x "$HOOKS_DIR/pre-commit"
  git config --global core.excludesfile "$GITIGNORE_TARGET"
  git config --global core.hooksPath "$HOOKS_DIR"
  echo "Configured global Git excludesfile and hooksPath."
fi

if [ "$INSTALL_SKILLS" -eq 1 ]; then
  node - "$REPO_ROOT/catalog/skills.json" <<'NODE'
const fs = require("fs");
const { spawnSync } = require("child_process");
const catalog = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
for (const skill of catalog.skills.filter((item) => item.install)) {
  console.log(`Installing skill: ${skill.name}`);
  const result = spawnSync("npx", ["skills", "add", skill.name], { stdio: "inherit" });
  if (result.status !== 0) {
    console.warn(`Skill install failed for ${skill.name}`);
  }
}
NODE
fi

echo ""
echo "Codex Enterprise Starter installed."
echo "Restart Codex, then run:"
echo "  codex doctor --summary"
echo '  codex --strict-config "Summarize the active Codex setup."'
if [ "$NO_BACKUP" -ne 1 ] && [ -d "$BACKUP_ROOT" ]; then
  echo "Backup: $BACKUP_ROOT"
fi
