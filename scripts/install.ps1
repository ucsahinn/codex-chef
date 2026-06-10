[CmdletBinding()]
param(
  [switch]$All,
  [switch]$InstallSkills,
  [switch]$InstallGitGuards,
  [switch]$Force,
  [switch]$NoBackup
)

$ErrorActionPreference = "Stop"

if ($All) {
  $InstallSkills = $true
  $InstallGitGuards = $true
}

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$CodexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$AgentsHome = if ($env:AGENTS_HOME) { $env:AGENTS_HOME } else { Join-Path $HOME ".agents" }
$BackupRoot = Join-Path $CodexHome ("backups\codex-enterprise-starter-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

function Ensure-Dir {
  param([Parameter(Mandatory=$true)][string]$Path)
  New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

function Get-RelativePathSafe {
  param(
    [Parameter(Mandatory=$true)][string]$Base,
    [Parameter(Mandatory=$true)][string]$Path
  )
  $baseFull = [System.IO.Path]::GetFullPath($Base).TrimEnd('\', '/')
  $pathFull = [System.IO.Path]::GetFullPath($Path)
  if ($pathFull.StartsWith($baseFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $pathFull.Substring($baseFull.Length).TrimStart('\', '/')
  }
  return Split-Path -Leaf $Path
}

function Backup-Target {
  param([Parameter(Mandatory=$true)][string]$Path)
  if ($NoBackup -or -not (Test-Path -LiteralPath $Path)) {
    return
  }

  Ensure-Dir $BackupRoot
  $relative = Get-RelativePathSafe -Base $CodexHome -Path $Path
  if ($relative.StartsWith("..")) {
    $relative = Split-Path -Leaf $Path
  }
  $destination = Join-Path $BackupRoot $relative
  Ensure-Dir (Split-Path -Parent $destination)
  Copy-Item -LiteralPath $Path -Destination $destination -Recurse -Force
}

function Install-File {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
  )

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    Write-Warning "Skipped existing file: $Destination (use -Force to replace after backup)"
    return
  }

  Ensure-Dir (Split-Path -Parent $Destination)
  Backup-Target $Destination
  Copy-Item -LiteralPath $Source -Destination $Destination -Force
  Write-Host "Installed $Destination"
}

function Install-Directory {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
  )

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    Write-Warning "Skipped existing directory: $Destination (use -Force to replace after backup)"
    return
  }

  Ensure-Dir (Split-Path -Parent $Destination)
  Backup-Target $Destination
  if (Test-Path -LiteralPath $Destination) {
    Remove-Item -LiteralPath $Destination -Recurse -Force
  }
  Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
  Write-Host "Installed $Destination"
}

Ensure-Dir $CodexHome
Ensure-Dir (Join-Path $CodexHome "agents")
Ensure-Dir (Join-Path $CodexHome "rules")
Ensure-Dir $AgentsHome

$TemplateRoot = Join-Path $RepoRoot "templates\codex"

Install-File -Source (Join-Path $TemplateRoot "AGENTS.md") -Destination (Join-Path $CodexHome "AGENTS.md")
Install-File -Source (Join-Path $TemplateRoot "config.windows.toml") -Destination (Join-Path $CodexHome "config.toml")
Install-File -Source (Join-Path $TemplateRoot "rules\default.rules") -Destination (Join-Path $CodexHome "rules\default.rules")

Get-ChildItem -Path (Join-Path $TemplateRoot "agents") -Filter "*.toml" | ForEach-Object {
  Install-File -Source $_.FullName -Destination (Join-Path (Join-Path $CodexHome "agents") $_.Name)
}

Get-ChildItem -Path (Join-Path $TemplateRoot "profiles") -Filter "*.toml" | ForEach-Object {
  Install-File -Source $_.FullName -Destination (Join-Path $CodexHome $_.Name)
}

$PluginSource = Join-Path $RepoRoot "plugins\codex-enterprise-workflows"
$PluginTarget = Join-Path $CodexHome "plugins\codex-enterprise-workflows"
Install-Directory -Source $PluginSource -Destination $PluginTarget

$MarketplaceDir = Join-Path $AgentsHome "plugins"
Ensure-Dir $MarketplaceDir
$MarketplacePath = Join-Path $MarketplaceDir "marketplace.json"
if ((Test-Path -LiteralPath $MarketplacePath) -and -not $Force) {
  Write-Warning "Skipped existing marketplace: $MarketplacePath (use -Force to replace after backup)"
} else {
  Backup-Target $MarketplacePath
  $marketplace = [ordered]@{
    name = "codex-enterprise-starter"
    plugins = @(
      [ordered]@{
        name = "codex-enterprise-workflows"
        source = [ordered]@{
          source = "local"
          path = $PluginTarget
        }
        policy = [ordered]@{
          installation = "AVAILABLE"
          authentication = "NONE"
        }
        category = "Productivity"
      }
    )
  }
  $json = $marketplace | ConvertTo-Json -Depth 10
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($MarketplacePath, $json + [Environment]::NewLine, $utf8NoBom)
  Write-Host "Installed $MarketplacePath"
}

if ($InstallGitGuards) {
  $GitIgnoreSource = Join-Path $RepoRoot "templates\git\.gitignore_global"
  $GitIgnoreTarget = Join-Path $HOME ".gitignore_global"
  $HooksDir = Join-Path $HOME ".githooks"
  $HookTarget = Join-Path $HooksDir "pre-commit"

  Install-File -Source $GitIgnoreSource -Destination $GitIgnoreTarget
  Ensure-Dir $HooksDir
  Install-File -Source (Join-Path $RepoRoot "templates\git\pre-commit") -Destination $HookTarget

  git config --global core.excludesfile $GitIgnoreTarget
  git config --global core.hooksPath $HooksDir
  Write-Host "Configured global Git excludesfile and hooksPath."
}

if ($InstallSkills) {
  $CatalogPath = Join-Path $RepoRoot "catalog\skills.json"
  $Catalog = Get-Content -Path $CatalogPath -Raw | ConvertFrom-Json
  foreach ($Skill in $Catalog.skills | Where-Object { $_.install -eq $true }) {
    Write-Host "Installing skill: $($Skill.name)"
    try {
      & npx skills add $Skill.name
    } catch {
      Write-Warning "Skill install failed for $($Skill.name): $($_.Exception.Message)"
    }
  }
}

Write-Host ""
Write-Host "Codex Enterprise Starter installed."
Write-Host "Restart Codex, then run:"
Write-Host "  codex doctor --summary"
Write-Host "  codex --strict-config `"Summarize the active Codex setup.`""
if (-not $NoBackup -and (Test-Path -LiteralPath $BackupRoot)) {
  Write-Host "Backup: $BackupRoot"
}
