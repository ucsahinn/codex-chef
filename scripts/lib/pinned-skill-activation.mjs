import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  assertManagedTargetPath,
  isPathInside
} from "./managed-path-safety.mjs";
import {
  inspectPinnedSkillOwnership,
  inspectPinnedSkillTarget,
  inspectSkillTree,
  writePinnedSkillProvenance
} from "./skill-provenance.mjs";

const BACKUP_MANIFEST_NAME = ".codex-chef-backup.json";

function removeRealDirectory(target, managedRoots) {
  if (!fs.existsSync(target)) return;
  assertManagedTargetPath(target, managedRoots);
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`Refusing to remove a non-directory pinned skill target: ${target}`);
  }
  fs.rmSync(target, { recursive: true, force: false });
}

function hashFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function createPinnedSkillBackup(target, backupRoot, skill, expected, managedRoots) {
  const backupTarget = path.join(backupRoot, "agents", "skills", skill);
  assertManagedTargetPath(backupRoot, managedRoots);
  assertManagedTargetPath(backupTarget, managedRoots);
  fs.mkdirSync(path.dirname(backupTarget), { recursive: true });
  fs.cpSync(target, backupTarget, {
    recursive: true,
    errorOnExist: true,
    dereference: false
  });

  const entries = [];
  const pending = [backupTarget];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        throw new Error(`Refusing to back up linked pinned skill content: ${absolute}`);
      }
      if (stat.isDirectory()) {
        pending.push(absolute);
        continue;
      }
      if (!stat.isFile()) {
        throw new Error(`Pinned skill backup contains an unsupported entry: ${absolute}`);
      }
      entries.push({
        backupRelativePath: path.relative(backupRoot, absolute).replaceAll(path.sep, "/"),
        size: stat.size,
        sha256: hashFile(absolute)
      });
    }
  }
  entries.sort((a, b) => a.backupRelativePath.localeCompare(b.backupRelativePath));
  fs.writeFileSync(
    path.join(backupRoot, BACKUP_MANIFEST_NAME),
    `${JSON.stringify({
      schemaVersion: "codex-chef.backup.v1",
      createdAt: new Date().toISOString(),
      operation: "pinned-skill-replacement",
      skill,
      sourcePackage: expected.package,
      replacedByCommit: expected.commit,
      entries
    }, null, 2)}\n`,
    "utf8"
  );
  return backupTarget;
}

export function activatePinnedSkill({
  source,
  target,
  backupRoot,
  managedRoots,
  expected,
  allowAdopt = false,
  testHooks = {}
}) {
  const sourceState = inspectSkillTree(source, expected.skill, expected.sourceTreeSha256);
  if (!sourceState.valid) {
    throw new Error(`Pinned skill source is invalid: ${sourceState.reason}.`);
  }
  if (fs.existsSync(target)) {
    const ownership = inspectPinnedSkillOwnership(target, expected);
    if (!ownership.valid && !allowAdopt) {
      throw new Error(
        `Refusing to replace an unowned pinned skill target without explicit adoption: ${expected.skill} (${ownership.reason}).`
      );
    }
  }

  const targetParent = path.dirname(target);
  assertManagedTargetPath(targetParent, managedRoots);
  const targetState = assertManagedTargetPath(target, managedRoots);
  const backupState = assertManagedTargetPath(backupRoot, managedRoots);
  if (
    isPathInside(backupState.canonicalTarget, targetState.canonicalTarget)
    || isPathInside(targetState.canonicalTarget, backupState.canonicalTarget)
  ) {
    throw new Error(
      `Refusing overlapping pinned skill target and backup root: ${expected.skill}.`
    );
  }
  fs.mkdirSync(targetParent, { recursive: true });
  assertManagedTargetPath(targetParent, managedRoots);

  const staging = fs.mkdtempSync(path.join(targetParent, `.codex-chef-${expected.skill}-`));
  let backedUp = false;
  let activated = false;
  let backupTarget = null;
  try {
    assertManagedTargetPath(staging, managedRoots);
    fs.cpSync(source, staging, {
      recursive: true,
      errorOnExist: false,
      force: false,
      dereference: false
    });
    const staged = inspectSkillTree(staging, expected.skill, expected.sourceTreeSha256);
    if (!staged.valid) {
      throw new Error(
        `Pinned skill staging content mismatch: ${staged.reason} (${staged.actualHash || "no hash"}).`
      );
    }
    writePinnedSkillProvenance(staging, expected);
    const stagedWithProvenance = inspectPinnedSkillTarget(staging, expected);
    if (!stagedWithProvenance.valid) {
      throw new Error(`Pinned skill staging provenance mismatch: ${stagedWithProvenance.reason}.`);
    }
    testHooks.afterStage?.({ staging, target, backupRoot });

    if (fs.existsSync(target)) {
      fs.mkdirSync(path.dirname(backupRoot), { recursive: true });
      assertManagedTargetPath(target, managedRoots);
      assertManagedTargetPath(backupRoot, managedRoots);
      backupTarget = createPinnedSkillBackup(
        target,
        backupRoot,
        expected.skill,
        expected,
        managedRoots
      );
      backedUp = true;
      removeRealDirectory(target, managedRoots);
    }

    assertManagedTargetPath(staging, managedRoots);
    assertManagedTargetPath(target, managedRoots);
    fs.renameSync(staging, target);
    activated = true;
    testHooks.afterActivate?.({ target, backupRoot });

    const installed = inspectPinnedSkillTarget(target, expected);
    if (!installed.valid) {
      throw new Error(`Pinned skill activation verification failed: ${installed.reason}.`);
    }
    return { installed, backedUp, backupRoot: backedUp ? backupRoot : null };
  } catch (error) {
    if (fs.existsSync(staging)) removeRealDirectory(staging, managedRoots);
    if (activated && fs.existsSync(target)) removeRealDirectory(target, managedRoots);
    if (backedUp) {
      assertManagedTargetPath(backupTarget, managedRoots);
      assertManagedTargetPath(target, managedRoots);
      fs.cpSync(backupTarget, target, {
        recursive: true,
        errorOnExist: true,
        dereference: false
      });
    } else if (fs.existsSync(backupRoot)) {
      removeRealDirectory(backupRoot, managedRoots);
    }
    throw error;
  }
}
