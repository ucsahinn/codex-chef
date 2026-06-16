[CmdletBinding(SupportsShouldProcess, ConfirmImpact="Medium")]
param(
  [switch]$All,
  [switch]$InstallSkills,
  [switch]$InstallGitGuards,
  [switch]$Force,
  [switch]$NoBackup,
  [switch]$Interactive,
  [switch]$PlainOutput
)

$ErrorActionPreference = "Stop"
$ScriptCmdlet = $PSCmdlet
$IconChef = [System.Char]::ConvertFromUtf32(0x1F373)
$IconCheck = [char]0x2713
$IconBullet = [char]0x2022
$SkippedExistingCount = 0

if ($All) {
  $InstallSkills = $true
}

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$CodexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
$AgentsHome = if ($env:AGENTS_HOME) { $env:AGENTS_HOME } else { Join-Path $HOME ".agents" }

function Use-DecoratedOutput {
  if ($PlainOutput) { return $false }
  if ($env:NO_COLOR -or $env:TERM -eq "dumb") { return $false }
  return $true
}

function Get-Icon {
  param(
    [Parameter(Mandatory=$true)][string]$Emoji,
    [Parameter(Mandatory=$true)][string]$Fallback
  )
  if (Use-DecoratedOutput) { return $Emoji }
  return $Fallback
}

function Write-DecoratedHost {
  param(
    [Parameter(Mandatory=$true)][string]$Message,
    [string]$Color = "Gray"
  )
  if (Use-DecoratedOutput) {
    Write-Host $Message -ForegroundColor $Color
    return
  }
  Write-Host $Message
}

function Write-Section {
  param([Parameter(Mandatory=$true)][string]$Title)
  Write-Host ""
  Write-DecoratedHost -Message "$(Get-Icon $Script:IconChef "[*]") $Title" -Color "Cyan"
}

function Write-Action {
  param(
    [Parameter(Mandatory=$true)][string]$Status,
    [Parameter(Mandatory=$true)][string]$Message
  )
  Write-DecoratedHost -Message "  $(Get-Icon $Script:IconCheck "-") ${Status}: $Message" -Color "Green"
}

function Write-Note {
  param([Parameter(Mandatory=$true)][string]$Message)
  Write-DecoratedHost -Message "  $(Get-Icon $Script:IconBullet "-") $Message" -Color "DarkGray"
}

function Write-NameList {
  param(
    [Parameter(Mandatory=$true)][string]$Label,
    [Parameter(Mandatory=$true)][object[]]$Names,
    [string]$Color = "Gray"
  )
  Write-Note "$Label ($($Names.Count)):"
  Write-DecoratedHost -Message "    $($Names -join ', ')" -Color $Color
}

function Read-OptionalPath {
  param(
    [Parameter(Mandatory=$true)][string]$Label,
    [Parameter(Mandatory=$true)][string]$CurrentValue
  )
  if (-not $Interactive) {
    return $CurrentValue
  }
  $Answer = Read-Host "$Label [$CurrentValue]"
  if ([string]::IsNullOrWhiteSpace($Answer)) {
    return $CurrentValue
  }
  return $Answer.Trim()
}

function Read-YesNo {
  param(
    [Parameter(Mandatory=$true)][string]$Prompt,
    [bool]$Default = $false
  )
  if (-not $Interactive) {
    return $false
  }
  $Suffix = if ($Default) { "[Y/n]" } else { "[y/N]" }
  $Answer = Read-Host "$Prompt $Suffix"
  if ([string]::IsNullOrWhiteSpace($Answer)) {
    return $Default
  }
  return $Answer.Trim().ToLowerInvariant().StartsWith("y")
}

function Test-AnyManagedTargetExists {
  $managedTargets = @(
    (Join-Path $CodexHome "AGENTS.md"),
    (Join-Path $CodexHome "config.toml"),
    (Join-Path $CodexHome "rules\default.rules"),
    (Join-Path $CodexHome "plugins\codex-chef-workflows"),
    (Join-Path $AgentsHome "plugins\marketplace.json")
  )
  foreach ($target in $managedTargets) {
    if (Test-Path -LiteralPath $target) {
      return $true
    }
  }
  return $false
}

if ($Interactive) {
  Write-Section "Guided setup"
  Write-Note "Press Enter to accept the safe default shown in brackets."
  Write-Note "No tokens, secrets, cookies, sessions, or credentials are requested."
}

$CodexHome = Read-OptionalPath -Label "Codex home" -CurrentValue $CodexHome
$AgentsHome = Read-OptionalPath -Label "Agents home" -CurrentValue $AgentsHome

if ($Interactive -and $All -and $InstallSkills) {
  if (-not (Read-YesNo -Prompt "Install or reconcile the 16 reviewed global Codex skills now?" -Default $true)) {
    $InstallSkills = $false
  }
}

if ($Interactive -and (Test-AnyManagedTargetExists) -and -not $Force) {
  if (Read-YesNo -Prompt "Replace existing managed Codex Chef files after backup instead of preserving/merging?" -Default $false) {
    $Force = $true
  }
}

if ($Interactive -and -not $InstallGitGuards) {
  if (Read-YesNo -Prompt "Install optional global Git guards for this Windows user?" -Default $false) {
    $InstallGitGuards = $true
  }
}

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
    $Script:SkippedExistingCount += 1
    return
  }

  Ensure-Dir (Split-Path -Parent $Destination)
  Backup-Target $Destination
  $changed = Invoke-Change -Target $Destination -Action "Install file from $Source" -ScriptBlock {
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
  }
  if ($changed) {
    Write-Action -Status "installed" -Message $Destination
  }
}

function Install-CodexConfig {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
  )

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    Ensure-Dir (Split-Path -Parent $Destination)
    Backup-Target $Destination
    $MergeScript = Join-Path $RepoRoot "scripts\merge-codex-config.mjs"
    $Action = "Merge missing Codex Chef config blocks from $Source"
    if ($WhatIfPreference) {
      Invoke-Change -Target $Destination -Action $Action -ScriptBlock {
        & node $MergeScript $Source $Destination --dry-run
      } | Out-Null
      return
    }
    $changed = Invoke-Change -Target $Destination -Action $Action -ScriptBlock {
      & node $MergeScript $Source $Destination
      if ($LASTEXITCODE -ne 0) {
        throw "Codex config merge failed with code $LASTEXITCODE"
      }
    }
    if ($changed) {
      Write-Action -Status "merged config" -Message $Destination
    }
    return
  }

  Install-File -Source $Source -Destination $Destination
}

function Install-Directory {
  param(
    [Parameter(Mandatory=$true)][string]$Source,
    [Parameter(Mandatory=$true)][string]$Destination
  )

  if ((Test-Path -LiteralPath $Destination) -and -not $Force) {
    $Script:SkippedExistingCount += 1
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
    Write-Action -Status "installed" -Message $Destination
  }
}

Write-Section "Codex Chef installer"
Write-Note "Codex home: $CodexHome"
Write-Note "Agents home: $AgentsHome"
if ($Force) {
  Write-Note "Mode: replace managed targets after backup"
} else {
  Write-Note "Mode: preserve existing files; merge missing config blocks"
}
if ($InstallSkills) {
  Write-Note "Skills: install reviewed catalog entries with --agent codex"
} else {
  Write-Note "Skills: skipped unless -All or -InstallSkills is used"
}
if ($InstallGitGuards) {
  Write-Note "Git guards: enabled for this user"
} else {
  Write-Note "Git guards: disabled by default"
}
if ($WhatIfPreference) {
  Write-Note "Dry run: no files, Git settings, or skills will be changed"
}
if ($Interactive) {
  Write-Note "Existing config policy: backup + merge missing Codex Chef blocks unless Force is enabled"
  Write-Note "Authenticated/account MCP connectors remain disabled by default"
  if (-not (Read-YesNo -Prompt "Continue with this plan?" -Default $true)) {
    throw "Codex Chef install cancelled by user."
  }
}

Write-Section "Managed Codex files"
Ensure-Dir $CodexHome
Ensure-Dir (Join-Path $CodexHome "agents")
Ensure-Dir (Join-Path $CodexHome "rules")
Ensure-Dir $AgentsHome

$TemplateRoot = Join-Path $RepoRoot "templates\codex"

Install-File -Source (Join-Path $TemplateRoot "AGENTS.md") -Destination (Join-Path $CodexHome "AGENTS.md")
Install-CodexConfig -Source (Join-Path $TemplateRoot "config.windows.toml") -Destination (Join-Path $CodexHome "config.toml")
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
  $Script:SkippedExistingCount += 1
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
    Write-Action -Status "installed" -Message $MarketplacePath
  }
}

if ($InstallGitGuards) {
  Write-Section "Optional Git guards"
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
    Write-Action -Status "configured" -Message "global Git excludesfile and hooksPath"
  }
}

if ($InstallSkills) {
  Write-Section "Curated skills"
  if ($WhatIfPreference) {
    $CatalogPath = Join-Path $RepoRoot "catalog\skills.json"
    $Catalog = Get-Content -Path $CatalogPath -Raw | ConvertFrom-Json
    foreach ($Skill in $Catalog.skills | Where-Object { $_.install -eq $true }) {
      $DepthFlag = if ($Skill.fullDepth -eq $true) { " --full-depth" } else { "" }
      Write-Action -Status "would install skill" -Message "$($Skill.name) from $($Skill.package) --skill $($Skill.skill)$DepthFlag"
    }
    Write-Note "Skipped skill installation because -WhatIf is active"
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
    if (-not $env:npm_config_cache) {
      $env:npm_config_cache = Join-Path $RepoRoot "tmp\npm-cache"
    }
    if (-not $env:NPM_CONFIG_CACHE) {
      $env:NPM_CONFIG_CACHE = $env:npm_config_cache
    }
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
        Write-Action -Status "already installed" -Message $Skill.name
        continue
      }

      $SkillArgs = @("skills", "add", $Skill.package, "--skill", $Skill.skill)
      if ($Skill.fullDepth -eq $true) {
        $SkillArgs += "--full-depth"
      }
      $SkillArgs += @("--agent", "codex", "--yes", "--global")
      $DepthFlag = if ($Skill.fullDepth -eq $true) { " --full-depth" } else { "" }
      Write-Action -Status "installing skill" -Message "$($Skill.name) from $($Skill.package) --skill $($Skill.skill)$DepthFlag"
      $Output = & npx.cmd @SkillArgs 2>&1
      $ExitCode = $LASTEXITCODE
      $OutputText = ($Output -join [Environment]::NewLine)
      if ($ExitCode -ne 0 -or $OutputText -match "Failed to install|Installation failed|Failed to clone") {
        $Output | ForEach-Object { Write-Host $_ }
        throw "Skill install failed for $($Skill.name)"
      }
      Write-Action -Status "installed skill" -Message $Skill.name
    }
  }
}

Write-Section "Capability board"
try {
  $AgentCatalog = Get-Content -Path (Join-Path $RepoRoot "catalog\agents.json") -Raw | ConvertFrom-Json
  $McpCatalog = Get-Content -Path (Join-Path $RepoRoot "catalog\mcp-servers.json") -Raw | ConvertFrom-Json
  $SkillCatalog = Get-Content -Path (Join-Path $RepoRoot "catalog\skills.json") -Raw | ConvertFrom-Json
  $PluginSkillRoot = Join-Path $RepoRoot "plugins\codex-chef-workflows\skills"
  $AgentNames = @($AgentCatalog.agents | ForEach-Object { $_.name })
  $McpReady = @($McpCatalog.servers | Where-Object { $_.defaultEnabled -eq $true } | ForEach-Object { $_.name })
  $McpOptIn = @($McpCatalog.servers | Where-Object { $_.defaultEnabled -ne $true } | ForEach-Object { $_.name })
  $PluginSkills = @(Get-ChildItem -Path $PluginSkillRoot -Directory | ForEach-Object { $_.Name })
  $ReviewedSkills = @($SkillCatalog.skills | Where-Object { $_.install -eq $true } | ForEach-Object { $_.name })
  Write-NameList -Label "Agents ready" -Names $AgentNames -Color "White"
  Write-NameList -Label "MCP ready by default" -Names $McpReady -Color "White"
  Write-NameList -Label "MCP opt-in / disabled by default" -Names $McpOptIn -Color "DarkYellow"
  Write-NameList -Label "Local plugin skills" -Names $PluginSkills -Color "White"
  Write-NameList -Label "Reviewed global skills" -Names $ReviewedSkills -Color "White"
  Write-Note "Account, database, production, and broad filesystem connectors stay disabled until explicitly enabled."
} catch {
  Write-Warning "Could not render capability board: $($_.Exception.Message)"
}

Write-Section "Next steps"
if ($SkippedExistingCount -gt 0) {
  Write-Note "$SkippedExistingCount existing managed target(s) were preserved; use -Force only for a deliberate backup-backed replacement"
}
if ($WhatIfPreference) {
  Write-Action -Status "completed" -Message "Codex Chef dry run"
} else {
  Write-Action -Status "completed" -Message "Codex Chef install"
  Write-Note "Restart Codex, then run:"
  Write-Host "    codex doctor --summary"
  Write-Host "    npm run codex:status"
  Write-Host "    npm run verify:install:runtime"
  Write-Host "    codex --strict-config `"Summarize the active Codex setup.`""
}
if (-not $NoBackup -and (Test-Path -LiteralPath $BackupRoot)) {
  Write-Note "Backup: $BackupRoot"
}
