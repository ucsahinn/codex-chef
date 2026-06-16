[CmdletBinding(SupportsShouldProcess, ConfirmImpact="Medium")]
param(
  [switch]$All,
  [switch]$InstallSkills,
  [switch]$InstallGitGuards,
  [switch]$Force,
  [switch]$NoBackup
)

$ErrorActionPreference = "Stop"
$ScriptCmdlet = $PSCmdlet

if ($All) {
  $InstallSkills = $true
}

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$CodexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$AgentsHome = if ($env:AGENTS_HOME) { $env:AGENTS_HOME } else { Join-Path $HOME ".agents" }
$BackupRoot = Join-Path $CodexHome ("backups\codex-chef-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

function Invoke-Change {
  param(
    [Parameter(Mandatory=$true)][string]$Target,
    [Parameter(Mandatory=$true)][string]$Action,
    [Parameter(Mandatory=$true)][scriptblock]$ScriptBlock
  )
  if ($ScriptCmdlet.ShouldProcess($Target, $Action)) {
    & $ScriptBlock
    return $true
  }
  return $false
}

function Ensure-Dir {
  param([Parameter(Mandatory=$true)][string]$Path)
  Invoke-Change -Target $Path -Action "Ensure directory exists" -ScriptBlock {
    New-Item -ItemType Directory -Force -Path $Path | Out-Null
  } | Out-Null
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

function Assert-ManagedDirectoryTarget {
  param([Parameter(Mandatory=$true)][string]$Path)
  $targetFull = [System.IO.Path]::GetFullPath($Path).TrimEnd('\', '/')
  $codexFull = [System.IO.Path]::GetFullPath($CodexHome).TrimEnd('\', '/')
  $agentsFull = [System.IO.Path]::GetFullPath($AgentsHome).TrimEnd('\', '/')
  $allowedRoots = @($codexFull, $agentsFull)

  foreach ($root in $allowedRoots) {
    if ($targetFull.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
      return
    }
  }

  throw "Refusing to replace unmanaged directory target: $Path"
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
  Invoke-Change -Target $destination -Action "Back up $Path" -ScriptBlock {
    Copy-Item -LiteralPath $Path -Destination $destination -Recurse -Force
  } | Out-Null
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
  $changed = Invoke-Change -Target $Destination -Action "Install file from $Source" -ScriptBlock {
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
  }
  if ($changed) {
    Write-Host "Installed $Destination"
  }
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
  Assert-ManagedDirectoryTarget $Destination
  if (Test-Path -LiteralPath $Destination) {
    Invoke-Change -Target $Destination -Action "Replace existing managed directory" -ScriptBlock {
      Remove-Item -LiteralPath $Destination -Recurse -Force
    } | Out-Null
  }
  $changed = Invoke-Change -Target $Destination -Action "Install directory from $Source" -ScriptBlock {
    Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
  }
  if ($changed) {
    Write-Host "Installed $Destination"
  }
}

Write-Host "Codex home: $CodexHome"
Write-Host "Agents home: $AgentsHome"
if ($WhatIfPreference) {
  Write-Host "Dry run: no files, Git settings, or skills will be changed."
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

$PluginSource = Join-Path $RepoRoot "plugins\codex-chef-workflows"
$PluginTarget = Join-Path $CodexHome "plugins\codex-chef-workflows"
Install-Directory -Source $PluginSource -Destination $PluginTarget

$MarketplaceDir = Join-Path $AgentsHome "plugins"
Ensure-Dir $MarketplaceDir
$MarketplacePath = Join-Path $MarketplaceDir "marketplace.json"
if ((Test-Path -LiteralPath $MarketplacePath) -and -not $Force) {
  Write-Warning "Skipped existing marketplace: $MarketplacePath (use -Force to replace after backup)"
} else {
  Backup-Target $MarketplacePath
  $marketplace = [ordered]@{
    name = "codex-chef"
    plugins = @(
      [ordered]@{
        name = "codex-chef-workflows"
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
  $changed = Invoke-Change -Target $MarketplacePath -Action "Install plugin marketplace" -ScriptBlock {
    [System.IO.File]::WriteAllText($MarketplacePath, $json + [Environment]::NewLine, $utf8NoBom)
  }
  if ($changed) {
    Write-Host "Installed $MarketplacePath"
  }
}

if ($InstallGitGuards) {
  $GitIgnoreSource = Join-Path $RepoRoot "templates\git\.gitignore_global"
  $GitIgnoreTarget = Join-Path $HOME ".gitignore_global"
  $HooksDir = Join-Path $HOME ".githooks"
  $HookTarget = Join-Path $HooksDir "pre-commit"

  Install-File -Source $GitIgnoreSource -Destination $GitIgnoreTarget
  Ensure-Dir $HooksDir
  Install-File -Source (Join-Path $RepoRoot "templates\git\pre-commit") -Destination $HookTarget

  $configuredExcludes = Invoke-Change -Target "global Git config core.excludesfile" -Action "Set to $GitIgnoreTarget" -ScriptBlock {
      git config --global core.excludesfile $GitIgnoreTarget
    }
  if ($configuredExcludes) {
    if ($LASTEXITCODE -ne 0) {
      throw "git config core.excludesfile failed with code $LASTEXITCODE"
    }
  }
  $configuredHooks = Invoke-Change -Target "global Git config core.hooksPath" -Action "Set to $HooksDir" -ScriptBlock {
      git config --global core.hooksPath $HooksDir
    }
  if ($configuredHooks) {
    if ($LASTEXITCODE -ne 0) {
      throw "git config core.hooksPath failed with code $LASTEXITCODE"
    }
  }
  if ($configuredExcludes -and $configuredHooks) {
    Write-Host "Configured global Git excludesfile and hooksPath."
  }
}

if ($InstallSkills) {
  if ($WhatIfPreference) {
    $CatalogPath = Join-Path $RepoRoot "catalog\skills.json"
    $Catalog = Get-Content -Path $CatalogPath -Raw | ConvertFrom-Json
    foreach ($Skill in $Catalog.skills | Where-Object { $_.install -eq $true }) {
      $DepthFlag = if ($Skill.fullDepth -eq $true) { " --full-depth" } else { "" }
      Write-Host "Would install skill: $($Skill.name) from $($Skill.package) --skill $($Skill.skill)$DepthFlag"
    }
    Write-Host "Skipped skill installation because -WhatIf is active."
  } else {
    $CatalogPath = Join-Path $RepoRoot "catalog\skills.json"
    $Catalog = Get-Content -Path $CatalogPath -Raw | ConvertFrom-Json
    $env:GIT_CONFIG_COUNT = "1"
    $env:GIT_CONFIG_KEY_0 = "http.sslBackend"
    $env:GIT_CONFIG_VALUE_0 = "openssl"
    $env:CI = "1"
    $env:NO_COLOR = "1"
    $env:FORCE_COLOR = "0"
    $env:TERM = "dumb"
    $InstalledSkills = @{}
    try {
      $InstalledJson = & npx.cmd skills list --global --json 2>$null
      if ($LASTEXITCODE -eq 0 -and $InstalledJson) {
        foreach ($Installed in ($InstalledJson | ConvertFrom-Json)) {
          $InstalledSkills[$Installed.name] = $true
        }
      }
    } catch {
      Write-Warning "Could not list existing global skills; installer will attempt verified installs."
    }

    foreach ($Skill in $Catalog.skills | Where-Object { $_.install -eq $true }) {
      if (-not $Skill.package -or -not $Skill.skill) {
        Write-Warning "Skipped skill without verified package and skill fields: $($Skill.name)"
        continue
      }
      if ($InstalledSkills.ContainsKey($Skill.name)) {
        Write-Host "Skill already installed: $($Skill.name)"
        continue
      }

      $SkillArgs = @("skills", "add", $Skill.package, "--skill", $Skill.skill)
      if ($Skill.fullDepth -eq $true) {
        $SkillArgs += "--full-depth"
      }
      $SkillArgs += @("--agent", "codex", "--yes", "--global")
      $DepthFlag = if ($Skill.fullDepth -eq $true) { " --full-depth" } else { "" }
      Write-Host "Installing skill: $($Skill.name) from $($Skill.package) --skill $($Skill.skill)$DepthFlag"
      $Output = & npx.cmd @SkillArgs 2>&1
      $ExitCode = $LASTEXITCODE
      $OutputText = ($Output -join [Environment]::NewLine)
      if ($ExitCode -ne 0 -or $OutputText -match "Failed to install|Installation failed|Failed to clone") {
        $Output | ForEach-Object { Write-Host $_ }
        throw "Skill install failed for $($Skill.name)"
      }
      Write-Host "Installed skill: $($Skill.name)"
    }
  }
}

Write-Host ""
if ($WhatIfPreference) {
  Write-Host "Codex Chef dry run completed."
} else {
  Write-Host "Codex Chef installed."
  Write-Host "Restart Codex, then run:"
  Write-Host "  codex doctor --summary"
  Write-Host "  npm run verify:install:runtime"
  Write-Host "  codex --strict-config `"Summarize the active Codex setup.`""
}
if (-not $NoBackup -and (Test-Path -LiteralPath $BackupRoot)) {
  Write-Host "Backup: $BackupRoot"
}
