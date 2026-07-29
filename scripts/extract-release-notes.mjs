#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  CliUsageError,
  emitCliError,
  requireCliValue
} from "./lib/cli-error-contract.mjs";
import { assertManagedTargetPath } from "./lib/managed-path-safety.mjs";

const root = path.resolve(process.cwd());
const args = process.argv.slice(2);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function samePath(left, right) {
  const normalize = (value) => {
    const resolved = path.resolve(value);
    return process.platform === "win32" ? resolved.toLowerCase() : resolved;
  };
  return normalize(left) === normalize(right);
}

function usage() {
  console.error("Usage: node scripts/extract-release-notes.mjs [--check] [--file docs/release-notes.md] [--tag vX.Y.Z] [--out tmp/release-notes-current.md]");
}

function parseArgs(argv) {
  const parsed = {
    checkOnly: false,
    sourceFile: "docs/release-notes.md",
    tag: null,
    outFile: null,
    help: false
  };
  const seen = new Set();
  const valueOptions = new Map([
    ["--file", "sourceFile"],
    ["--tag", "tag"],
    ["--out", "outFile"]
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const rawArg = argv[index];
    const equalsIndex = rawArg.indexOf("=");
    const arg = equalsIndex > 0 ? rawArg.slice(0, equalsIndex) : rawArg;
    const inlineValue = equalsIndex > 0 ? rawArg.slice(equalsIndex + 1) : null;

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }
    if (arg === "--check") {
      if (inlineValue !== null) throw new CliUsageError("--check does not accept a value.");
      if (seen.has(arg)) throw new CliUsageError("Duplicate option: --check");
      seen.add(arg);
      parsed.checkOnly = true;
      continue;
    }
    if (valueOptions.has(arg)) {
      if (seen.has(arg)) throw new CliUsageError(`Duplicate option: ${arg}`);
      const value = inlineValue === null ? requireCliValue(argv, index, arg) : inlineValue;
      if (!value || value.startsWith("-")) throw new CliUsageError(`${arg} requires a value.`);
      parsed[valueOptions.get(arg)] = value;
      seen.add(arg);
      if (inlineValue === null) index += 1;
      continue;
    }
    throw new CliUsageError(`Unknown argument: ${rawArg}`);
  }
  return parsed;
}

try {
  const options = parseArgs(args);
  if (options.help) {
    usage();
    process.exit(0);
  }
  const packageJson = readJson("package.json");
  const tag = options.tag || `v${packageJson.version}`;
  const sourcePath = path.resolve(root, options.sourceFile);
  assertManagedTargetPath(sourcePath, [root]);

  if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
    throw new CliUsageError(`Invalid release tag: ${tag}`);
  }
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Release notes source not found: ${options.sourceFile}`);
  }

  const text = fs.readFileSync(sourcePath, "utf8");
  const headingPattern = new RegExp(`^## ${tag.replace(/\./g, "\\.")} - .*$`, "m");
  const match = headingPattern.exec(text);
  if (!match) {
    throw new Error(`${options.sourceFile} does not contain a section for ${tag}`);
  }

  const start = match.index;
  const rest = text.slice(start + match[0].length);
  const nextHeading = /\n## v\d+\.\d+\.\d+ - /.exec(rest);
  const end = nextHeading ? start + match[0].length + nextHeading.index : text.length;
  const section = text.slice(start, end).trim() + "\n";

  if (options.checkOnly) {
    console.log(`Release notes extraction validation passed for ${tag}.`);
  } else if (options.outFile) {
    const resolvedOut = path.resolve(root, options.outFile);
    const outputRoot = path.join(root, "tmp");
    if (samePath(resolvedOut, sourcePath)) {
      throw new CliUsageError("--out must not overwrite the release notes source.");
    }
    assertManagedTargetPath(resolvedOut, [outputRoot]);
    fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
    fs.writeFileSync(resolvedOut, section, "utf8");
    console.log(`Wrote ${tag} release notes to ${options.outFile}`);
  } else {
    process.stdout.write(section);
  }
} catch (error) {
  process.exitCode = emitCliError({
    tool: "extract-release-notes",
    error,
    argv: args,
    root,
    prefix: "Release notes extraction failed"
  });
}
