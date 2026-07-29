#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertManagedTargetPath } from "./lib/managed-path-safety.mjs";

function main() {
  const [baseRoot, ...targets] = process.argv.slice(2);
  if (!baseRoot || targets.length === 0) {
    console.error("Usage: node scripts/assert-managed-target.mjs <managed-root> <target> [target...]");
    process.exit(2);
  }

  try {
    for (const target of targets) {
      assertManagedTargetPath(path.resolve(target), [path.resolve(baseRoot)]);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  main();
}
