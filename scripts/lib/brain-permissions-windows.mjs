import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const BRAIN_PERMISSIONS_SCHEMA_VERSION = "codex-chef.brain-permissions-windows.v1";

const FULL_CONTROL = 0x1f01ff;
const READ_EXECUTE_SYNCHRONIZE = 0x1200a9;
const WRITE_CAPABLE_MASK = 0x0d0156;
const REQUIRED_INHERITANCE_FLAGS = 3;

const WINDOWS_ACL_PROBE = String.raw`
$ErrorActionPreference = 'Stop'
$target = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($target)) { throw 'Brain target is required.' }
$directory = [System.IO.DirectoryInfo]::new($target)
if (-not $directory.Exists) { throw 'Brain target must be an existing directory.' }

$accessSection = [System.Security.AccessControl.AccessControlSections]::Access
$ownerAndAccess = $accessSection -bor [System.Security.AccessControl.AccessControlSections]::Owner
$rootAcl = $directory.GetAccessControl($ownerAndAccess)
$ownerSid = $rootAcl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value
$systemSid = 'S-1-5-18'
$administratorsSid = 'S-1-5-32-544'
$sandboxSid = $null
try {
  $sandboxSid = [System.Security.Principal.NTAccount]::new(
    'CodexSandboxUsers'
  ).Translate([System.Security.Principal.SecurityIdentifier]).Value
} catch {
  $sandboxSid = $null
}

function Get-Role([string]$sid) {
  if ($sid -eq $systemSid) { return 'system' }
  if ($sid -eq $administratorsSid) { return 'administrators' }
  if ($sid -eq $ownerSid) { return 'owner' }
  if ($null -ne $sandboxSid -and $sid -eq $sandboxSid) { return 'sandbox' }
  return 'other'
}

$rootRules = @(
  $rootAcl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]) |
    ForEach-Object {
      [pscustomobject]@{
        role = Get-Role $_.IdentityReference.Value
        accessType = $_.AccessControlType.ToString()
        rights = [int64]$_.FileSystemRights
        inherited = [bool]$_.IsInherited
        inheritanceFlags = [int]$_.InheritanceFlags
        propagationFlags = [int]$_.PropagationFlags
      }
    }
)

$itemCount = 0
$protectedDescendantCount = 0
$explicitAccessDescendantCount = 0
$sandboxReadOnlyItemCount = 0
$sandboxWriteItemCount = 0
$sandboxMissingItemCount = 0
$sandboxOtherItemCount = 0
$ownerMismatchItemCount = 0
$canonicalAccessItemCount = 0
$reparsePointCount = 0
$scanErrorCount = 0
$expectedRead = [int64]0x1200a9
$writeMask = [int64]0x0d0156

$items = [System.Collections.Generic.List[System.IO.FileSystemInfo]]::new()
$directories = [System.Collections.Generic.Stack[System.IO.DirectoryInfo]]::new()
$directories.Push($directory)
while ($directories.Count -gt 0) {
  $current = $directories.Pop()
  $items.Add($current)
  try {
    foreach ($entry in $current.EnumerateFileSystemInfos()) {
      if ($entry -is [System.IO.DirectoryInfo]) {
        if (($entry.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
          $items.Add($entry)
        } else {
          $directories.Push($entry)
        }
      } else {
        $items.Add($entry)
      }
    }
  } catch {
    $scanErrorCount += 1
  }
}
foreach ($item in $items) {
  $itemCount += 1
  try {
    if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
      $reparsePointCount += 1
    }
    $acl = $item.GetAccessControl($ownerAndAccess)
    $rules = @($acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]))
    if ($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -ne $ownerSid) {
      $ownerMismatchItemCount += 1
    }
    if ($item.FullName -ne $directory.FullName) {
      if ($acl.AreAccessRulesProtected) { $protectedDescendantCount += 1 }
      if (@($rules | Where-Object { -not $_.IsInherited }).Count -gt 0) {
        $explicitAccessDescendantCount += 1
      }
    }
    $canonical = $null -ne $sandboxSid -and $rules.Count -eq 4
    foreach ($expectedRole in @('system', 'administrators', 'owner', 'sandbox')) {
      $roleRules = @($rules | Where-Object { (Get-Role $_.IdentityReference.Value) -eq $expectedRole })
      $expectedRights = if ($expectedRole -eq 'sandbox') { $expectedRead } else { [int64]0x1f01ff }
      $roleRuleValid = $roleRules.Count -eq 1
      if ($roleRuleValid) {
        $roleRuleValid = $roleRules[0].AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Allow
        $roleRuleValid = $roleRuleValid -and ([int64]($roleRules[0].FileSystemRights) -eq $expectedRights)
      }
      if (-not $roleRuleValid) {
        $canonical = $false
      }
    }
    if (@($rules | Where-Object { (Get-Role $_.IdentityReference.Value) -eq 'other' }).Count -gt 0) {
      $canonical = $false
    }
    if ($canonical) { $canonicalAccessItemCount += 1 }
    if ($null -eq $sandboxSid) {
      $sandboxMissingItemCount += 1
      continue
    }
    $sandboxRules = @($rules | Where-Object { $_.IdentityReference.Value -eq $sandboxSid })
    if ($sandboxRules.Count -eq 0) {
      $sandboxMissingItemCount += 1
      continue
    }
    $allowRights = [int64]0
    $hasDeny = $false
    foreach ($rule in $sandboxRules) {
      if ($rule.AccessControlType -eq [System.Security.AccessControl.AccessControlType]::Deny) {
        $hasDeny = $true
      } else {
        $allowRights = $allowRights -bor [int64]$rule.FileSystemRights
      }
    }
    if (-not $hasDeny -and $allowRights -eq $expectedRead) {
      $sandboxReadOnlyItemCount += 1
    } elseif (($allowRights -band $writeMask) -ne 0) {
      $sandboxWriteItemCount += 1
    } else {
      $sandboxOtherItemCount += 1
    }
  } catch {
    $scanErrorCount += 1
  }
}

[pscustomobject]@{
  inheritanceProtected = [bool]$rootAcl.AreAccessRulesProtected
  sandboxGroupAvailable = $null -ne $sandboxSid
  rootRules = $rootRules
  tree = [pscustomobject]@{
    itemCount = $itemCount
    protectedDescendantCount = $protectedDescendantCount
    explicitAccessDescendantCount = $explicitAccessDescendantCount
    sandboxReadOnlyItemCount = $sandboxReadOnlyItemCount
    sandboxWriteItemCount = $sandboxWriteItemCount
    sandboxMissingItemCount = $sandboxMissingItemCount
    sandboxOtherItemCount = $sandboxOtherItemCount
    ownerMismatchItemCount = $ownerMismatchItemCount
    canonicalAccessItemCount = $canonicalAccessItemCount
    reparsePointCount = $reparsePointCount
    scanErrorCount = $scanErrorCount
  }
} | ConvertTo-Json -Depth 6 -Compress
`.trim();

function fixedFailure(message, risk = "unknown") {
  return {
    schemaVersion: BRAIN_PERMISSIONS_SCHEMA_VERSION,
    supported: true,
    ok: false,
    risk,
    checks: {},
    metrics: {},
    errors: [message]
  };
}

function exactRule(rules, role, rights) {
  const matches = rules.filter((rule) => rule?.role === role);
  return matches.length === 1
    && matches[0].accessType === "Allow"
    && matches[0].rights === rights
    && matches[0].inherited === false
    && matches[0].inheritanceFlags === REQUIRED_INHERITANCE_FLAGS
    && matches[0].propagationFlags === 0;
}

function numberOrNull(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function evaluateWindowsBrainPermissions(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)
    || !Array.isArray(snapshot.rootRules) || !snapshot.tree || typeof snapshot.tree !== "object") {
    return fixedFailure("Windows ACL inspection returned an invalid result.");
  }
  const metrics = {
    itemCount: numberOrNull(snapshot.tree.itemCount),
    protectedDescendantCount: numberOrNull(snapshot.tree.protectedDescendantCount),
    explicitAccessDescendantCount: numberOrNull(snapshot.tree.explicitAccessDescendantCount),
    sandboxReadOnlyItemCount: numberOrNull(snapshot.tree.sandboxReadOnlyItemCount),
    sandboxWriteItemCount: numberOrNull(snapshot.tree.sandboxWriteItemCount),
    sandboxMissingItemCount: numberOrNull(snapshot.tree.sandboxMissingItemCount),
    sandboxOtherItemCount: numberOrNull(snapshot.tree.sandboxOtherItemCount ?? 0),
    ownerMismatchItemCount: numberOrNull(snapshot.tree.ownerMismatchItemCount ?? 0),
    canonicalAccessItemCount: numberOrNull(snapshot.tree.canonicalAccessItemCount ?? 0),
    reparsePointCount: numberOrNull(snapshot.tree.reparsePointCount ?? 0),
    scanErrorCount: numberOrNull(snapshot.tree.scanErrorCount)
  };
  if (Object.values(metrics).some((value) => value === null)) return fixedFailure("Windows ACL inspection returned invalid metrics.");

  const sandboxRules = snapshot.rootRules.filter((rule) => rule?.role === "sandbox");
  const sandboxRootWriteCapable = sandboxRules.some((rule) => Number.isSafeInteger(rule.rights) && (rule.rights & WRITE_CAPABLE_MASK) !== 0);
  const unexpectedRootAccessCount = snapshot.rootRules.filter((rule) => rule?.role === "other").length;
  const checks = {
    rootInheritanceProtected: snapshot.inheritanceProtected === true,
    sandboxGroupAvailable: snapshot.sandboxGroupAvailable !== false,
    systemFullControl: exactRule(snapshot.rootRules, "system", FULL_CONTROL),
    administratorsFullControl: exactRule(snapshot.rootRules, "administrators", FULL_CONTROL),
    ownerFullControl: exactRule(snapshot.rootRules, "owner", FULL_CONTROL),
    sandboxRootReadOnly: exactRule(snapshot.rootRules, "sandbox", READ_EXECUTE_SYNCHRONIZE),
    noUnexpectedRootAccess: unexpectedRootAccessCount === 0,
    descendantsInheritPolicy: metrics.protectedDescendantCount === 0 && metrics.explicitAccessDescendantCount === 0,
    singleOwnerBoundary: metrics.ownerMismatchItemCount === 0,
    canonicalAccessEverywhere: metrics.itemCount > 0 && metrics.canonicalAccessItemCount === metrics.itemCount,
    noReparsePoints: metrics.reparsePointCount === 0,
    sandboxReadOnlyEverywhere: metrics.itemCount > 0
      && metrics.sandboxReadOnlyItemCount === metrics.itemCount
      && metrics.sandboxWriteItemCount === 0
      && metrics.sandboxMissingItemCount === 0
      && metrics.sandboxOtherItemCount === 0,
    treeFullyScanned: metrics.scanErrorCount === 0
  };

  const errors = [];
  if (!checks.rootInheritanceProtected) errors.push("Brain root ACL inheritance is not protected.");
  if (!checks.sandboxGroupAvailable) errors.push("CodexSandboxUsers local group is unavailable.");
  if (!checks.systemFullControl || !checks.administratorsFullControl || !checks.ownerFullControl) {
    errors.push("Brain root administrative access does not match the owner-mediated policy.");
  }
  if (!checks.sandboxRootReadOnly) {
    errors.push(sandboxRootWriteCapable
      ? "Codex sandbox retains write-capable access at the Brain root."
      : "Codex sandbox root access is not the exact read-and-execute policy.");
  }
  if (!checks.noUnexpectedRootAccess) errors.push("Unexpected root access entries remain on the Brain vault.");
  if (!checks.descendantsInheritPolicy) errors.push("One or more Brain descendants override the root access policy.");
  if (!checks.singleOwnerBoundary) errors.push("One or more Brain items are owned outside the vault owner boundary.");
  if (!checks.canonicalAccessEverywhere) errors.push("The canonical Brain access policy is not present on every item.");
  if (!checks.noReparsePoints) errors.push("The Brain tree contains a reparse point and was rejected.");
  if (!checks.sandboxReadOnlyEverywhere) {
    errors.push(metrics.sandboxWriteItemCount > 0
      ? "Codex sandbox retains write-capable access within the Brain tree."
      : "Codex sandbox read access is inconsistent within the Brain tree.");
  }
  if (!checks.treeFullyScanned) errors.push("The complete Brain access tree could not be inspected.");

  const ok = Object.values(checks).every(Boolean);
  const highRisk = sandboxRootWriteCapable || metrics.sandboxWriteItemCount > 0 || unexpectedRootAccessCount > 0;
  return {
    schemaVersion: BRAIN_PERMISSIONS_SCHEMA_VERSION,
    supported: true,
    ok,
    risk: ok ? "none" : highRisk ? "high" : "warning",
    checks,
    metrics,
    errors
  };
}

export function buildWindowsPermissionInvocation({ executable, target }) {
  if (typeof executable !== "string" || !path.win32.isAbsolute(executable)
    || path.win32.basename(executable).toLowerCase() !== "powershell.exe") {
    throw new Error("Windows ACL inspection requires an absolute powershell.exe path.");
  }
  if (typeof target !== "string" || !path.win32.isAbsolute(target)) {
    throw new Error("Windows ACL inspection requires an absolute Brain target.");
  }
  if (/[\0\r\n]/.test(target)) throw new Error("Windows ACL inspection target contains an invalid character.");
  return {
    executable: path.win32.normalize(executable),
    args: ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", WINDOWS_ACL_PROBE],
    input: path.win32.normalize(target),
    shell: false
  };
}

function resolveWindowsPowerShell(env) {
  const systemRoot = env.SystemRoot || env.WINDIR;
  if (typeof systemRoot !== "string" || !path.win32.isAbsolute(systemRoot)) throw new Error("Windows system root is unavailable.");
  const executable = path.win32.join(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  if (!fs.existsSync(executable) || !fs.lstatSync(executable).isFile()) throw new Error("Windows PowerShell is unavailable.");
  return executable;
}

function sanitizedWindowsEnvironment(source) {
  const allowed = new Set(["systemroot", "windir", "comspec", "pathext", "path", "temp", "tmp", "userprofile"]);
  return Object.fromEntries(Object.entries(source || {}).filter(([key, value]) => allowed.has(key.toLowerCase()) && typeof value === "string"));
}

export function inspectWindowsBrainPermissions(target, {
  platform = process.platform,
  env = process.env,
  spawn = spawnSync
} = {}) {
  if (platform !== "win32") {
    return {
      schemaVersion: BRAIN_PERMISSIONS_SCHEMA_VERSION,
      supported: false,
      ok: null,
      risk: "unsupported",
      checks: {},
      metrics: {},
      errors: ["Windows ACL inspection is unavailable on this platform."]
    };
  }
  try {
    const executable = resolveWindowsPowerShell(env);
    const invocation = buildWindowsPermissionInvocation({ executable, target });
    const result = spawn(invocation.executable, invocation.args, {
      encoding: "utf8",
      env: sanitizedWindowsEnvironment(env),
      input: invocation.input,
      maxBuffer: 1024 * 1024,
      timeout: 30_000,
      windowsHide: true,
      shell: invocation.shell
    });
    if (result.error || result.status !== 0 || typeof result.stdout !== "string") {
      return fixedFailure("Windows ACL inspection failed.");
    }
    return evaluateWindowsBrainPermissions(JSON.parse(result.stdout.trim()));
  } catch {
    return fixedFailure("Windows ACL inspection failed.");
  }
}
