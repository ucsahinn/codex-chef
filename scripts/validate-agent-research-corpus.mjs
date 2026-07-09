#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const failures = [];
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const maxReviewCadenceDaysByRisk = {
  low: 180,
  medium: 45,
  high: 14
};
const supplementalConfidenceLevels = new Set(["high", "medium_high", "medium"]);
const supplementalAdoptionStatuses = new Set([
  "supplemental_only",
  "first_party_supplemental",
  "snapshot_only",
  "heuristic_only",
  "support_signal_only"
]);
const supplementalRuntimeUses = new Set([
  "supplemental_pattern",
  "design_input",
  "local_discovery_evidence",
  "support_signal",
  "heuristic_evidence",
  "syntax_contract",
  "validation_design",
  "safety_pattern"
]);

const corpusPath = path.join(root, "catalog", "agent-research-corpus.json");
const catalogPath = path.join(root, "catalog", "agents.json");
const agentDir = path.join(root, "templates", "codex", "agents");

function fail(message) {
  failures.push(message);
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${label}: ${path.relative(root, filePath)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} must be parseable JSON: ${error.message}`);
    return null;
  }
}

function countOccurrences(text, needle) {
  return text.split(needle).length - 1;
}

function collectSourceMarkers(text) {
  const markers = new Set();
  for (const match of text.matchAll(/\[Source: ([^\]]+)\]/g)) {
    for (const marker of match[1].split(";").map((item) => item.trim()).filter(Boolean)) {
      markers.add(marker);
    }
  }
  return markers;
}

function requireArray(value, label, minLength = 1) {
  if (!Array.isArray(value)) {
    fail(`${label} must be an array.`);
    return [];
  }
  if (value.length < minLength) {
    fail(`${label} must contain at least ${minLength} item(s).`);
  }
  for (const item of value) {
    if (typeof item !== "string" || item.trim() === "") {
      fail(`${label} must contain only non-empty strings.`);
      break;
    }
  }
  return value;
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function addOwnedSourceMarker(owners, marker, owner) {
  if (owners.has(marker)) {
    fail(`Source marker "${marker}" is owned by both ${owners.get(marker)} and ${owner}.`);
    return;
  }
  owners.set(marker, owner);
}

function validateAuthorityUrl(key, value) {
  if (typeof value !== "string" || value.trim() !== value || /[\u0000-\u001f\u007f]/.test(value)) {
    fail(`authorityRefs.${key} must be a clean string URL.`);
    return;
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail(`authorityRefs.${key} must be parseable as a URL.`);
    return;
  }
  if (parsed.protocol !== "https:" || !parsed.hostname.includes(".")) {
    fail(`authorityRefs.${key} must be an https URL with a hostname.`);
  }
  if (parsed.username || parsed.password || parsed.search) {
    fail(`authorityRefs.${key} must not include credentials or query strings.`);
  }
  if (/token|credential|cookie/i.test(value)) {
    fail(`authorityRefs.${key} must not point at credential-bearing material.`);
  }
}

function validateSupplementalUrl(key, value) {
  if (typeof value !== "string" || value.trim() !== value || /[\u0000-\u001f\u007f]/.test(value)) {
    fail(`supplementalResearchRefs.${key}.url must be a clean string URL.`);
    return;
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    fail(`supplementalResearchRefs.${key}.url must be parseable as a URL.`);
    return;
  }
  if (parsed.protocol !== "https:" || !parsed.hostname.includes(".")) {
    fail(`supplementalResearchRefs.${key}.url must be an https URL with a hostname.`);
  }
  if (parsed.username || parsed.password || parsed.search) {
    fail(`supplementalResearchRefs.${key}.url must not include credentials or query strings.`);
  }
  if (/token|credential|cookie/i.test(value)) {
    fail(`supplementalResearchRefs.${key}.url must not point at credential-bearing material.`);
  }
}

function validateSourceLocation(key, value) {
  if (typeof value !== "string" || value.trim() !== value || /[\u0000-\u001f\u007f]/.test(value)) {
    fail(`supplementalResearchRefs.${key}.sourceLocation must be a clean string.`);
    return;
  }
  const match = value.match(/^([^:]+\.md):(\d+)$/);
  if (!match) {
    fail(`supplementalResearchRefs.${key}.sourceLocation must look like docs/file.md:12.`);
    return;
  }
  const filePath = path.resolve(root, match[1]);
  const line = Number(match[2]);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
    fail(`supplementalResearchRefs.${key}.sourceLocation must point at an existing repository markdown file.`);
    return;
  }
  if (!Number.isInteger(line) || line <= 0) {
    fail(`supplementalResearchRefs.${key}.sourceLocation line must be a positive integer.`);
    return;
  }
  const lineCount = fs.readFileSync(filePath, "utf8").split(/\r?\n/).length;
  if (line > lineCount) {
    fail(`supplementalResearchRefs.${key}.sourceLocation line ${line} exceeds ${path.relative(root, filePath)} length.`);
  }
}

function parseDateOnly(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    fail(`${label} must use YYYY-MM-DD.`);
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    fail(`${label} must be a valid calendar date.`);
    return null;
  }
  return parsed;
}

function todayUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const corpus = readJson(corpusPath, "agent research corpus");
const catalog = readJson(catalogPath, "agent catalog");

if (corpus && catalog) {
  if (corpus.schemaVersion !== 1) fail("agent-research-corpus.json schemaVersion must be 1.");
  const dateChecked = parseDateOnly(corpus.dateChecked, "agent-research-corpus.json dateChecked");
  if (corpus.minimumSourceBackedItems !== 100) {
    fail("agent-research-corpus.json minimumSourceBackedItems must stay 100.");
  }
  if (corpus.minimumDistinctSourceMarkers !== 20) {
    fail("agent-research-corpus.json minimumDistinctSourceMarkers must stay 20.");
  }

  const expectedBlocks = [
    "Source refresh protocol:",
    "Cross-repo transfer protocol:",
    "Research synthesis protocol:",
    "Adversarial validation protocol:",
    "Source currency protocol:",
    "Corpus expansion protocol:",
    "Expert calibration protocol:"
  ];
  const expectedOperationalBlocks = [
    "World-class specialist upgrade:",
    "Evidence output contract:",
    "Tool and delegation routing:",
    "Verification checklist:",
    "Escalation and refusal guardrails:",
    "Primary reference anchors:",
    "Senior blind-spot checks:",
    "Decision thresholds:",
    "Handoff payload contract:",
    "Evidence grading rubric:",
    "Invocation intake checklist:",
    "Corpus acquisition map:"
  ];
  const manifestBlocks = requireArray(corpus.requiredGuardrailBlocks, "requiredGuardrailBlocks", expectedBlocks.length);
  if (JSON.stringify(manifestBlocks) !== JSON.stringify(expectedBlocks)) {
    fail("agent-research-corpus.json requiredGuardrailBlocks must match the reviewed guardrail block order.");
  }
  const expectedRuntimeContracts = ["Authority metadata contract:", "Expertise signal contract:"];
  const runtimeContracts = requireArray(corpus.requiredRuntimeContracts, "requiredRuntimeContracts", expectedRuntimeContracts.length);
  if (JSON.stringify(runtimeContracts) !== JSON.stringify(expectedRuntimeContracts)) {
    fail("agent-research-corpus.json requiredRuntimeContracts must match the reviewed runtime contract order.");
  }
  const operationalBlocks = requireArray(corpus.requiredOperationalBlocks, "requiredOperationalBlocks", expectedOperationalBlocks.length);
  if (JSON.stringify(operationalBlocks) !== JSON.stringify(expectedOperationalBlocks)) {
    fail("agent-research-corpus.json requiredOperationalBlocks must match the reviewed operational block order.");
  }
  const expectedExpertiseSignalGroups = ["decisionHeuristics", "failureModes", "verificationSignals"];
  const expertiseSignalGroups = requireArray(corpus.requiredExpertiseSignalGroups, "requiredExpertiseSignalGroups", expectedExpertiseSignalGroups.length);
  if (JSON.stringify(expertiseSignalGroups) !== JSON.stringify(expectedExpertiseSignalGroups)) {
    fail("agent-research-corpus.json requiredExpertiseSignalGroups must match the reviewed expertise signal group order.");
  }
  if (corpus.minimumExpertiseSignalsPerGroup !== 3) {
    fail("agent-research-corpus.json minimumExpertiseSignalsPerGroup must stay 3.");
  }
  if (corpus.minimumSupplementalResearchRefs !== 20) {
    fail("agent-research-corpus.json minimumSupplementalResearchRefs must stay 20.");
  }

  const sourceTiers = requireArray(corpus.sourceTiers, "sourceTiers", 6);
  for (const requiredTier of [
    "local repo evidence",
    "official docs",
    "Context7 or official library docs",
    "standards and vendor guidance",
    "open specifications",
    "official project docs",
    "primary project repositories",
    "research papers and evaluations",
    "local command evidence"
  ]) {
    if (!sourceTiers.includes(requiredTier)) fail(`sourceTiers must include: ${requiredTier}`);
  }

  const authorityRefs = corpus.authorityRefs && typeof corpus.authorityRefs === "object" && !Array.isArray(corpus.authorityRefs)
    ? corpus.authorityRefs
    : null;
  if (!authorityRefs) {
    fail("agent-research-corpus.json authorityRefs must be an object.");
  }
  const authorityKeys = new Set(Object.keys(authorityRefs || {}));
  if (authorityKeys.size < 20) {
    fail(`authorityRefs must include at least 20 reviewed references; found ${authorityKeys.size}.`);
  }
  let strictestReviewCadenceDays = Number.POSITIVE_INFINITY;
  for (const [key, ref] of Object.entries(authorityRefs || {})) {
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      fail(`authorityRefs key must be snake_case: ${key}`);
    }
    if (!ref || typeof ref !== "object" || Array.isArray(ref)) {
      fail(`authorityRefs.${key} must be an object with url, sourceType, stalenessRisk, and sourceMarkers.`);
      continue;
    }
    validateAuthorityUrl(key, ref.url);
    if (typeof ref.sourceType !== "string" || !sourceTiers.includes(ref.sourceType)) {
      fail(`authorityRefs.${key}.sourceType must match a sourceTiers entry.`);
    }
    if (!["low", "medium", "high"].includes(ref.stalenessRisk)) {
      fail(`authorityRefs.${key}.stalenessRisk must be low, medium, or high.`);
    }
    if (!Number.isInteger(ref.reviewCadenceDays) || ref.reviewCadenceDays <= 0) {
      fail(`authorityRefs.${key}.reviewCadenceDays must be a positive integer.`);
    } else {
      const maxReviewCadenceDays = maxReviewCadenceDaysByRisk[ref.stalenessRisk];
      if (maxReviewCadenceDays && ref.reviewCadenceDays > maxReviewCadenceDays) {
        fail(`authorityRefs.${key}.reviewCadenceDays must be <= ${maxReviewCadenceDays} for ${ref.stalenessRisk} staleness risk.`);
      }
      strictestReviewCadenceDays = Math.min(strictestReviewCadenceDays, ref.reviewCadenceDays);
    }
    const sourceMarkers = requireArray(ref.sourceMarkers, `authorityRefs.${key}.sourceMarkers`, 1);
    if (hasDuplicates(sourceMarkers)) {
      fail(`authorityRefs.${key}.sourceMarkers must not contain duplicates.`);
    }
  }
  if (dateChecked && Number.isFinite(strictestReviewCadenceDays)) {
    const ageDays = Math.floor((todayUtcMidnight().getTime() - dateChecked.getTime()) / MS_PER_DAY);
    if (ageDays < 0) {
      fail("agent-research-corpus.json dateChecked must not be in the future.");
    }
    if (ageDays > strictestReviewCadenceDays) {
      fail(`agent-research-corpus.json dateChecked is ${ageDays} day(s) old; refresh reviewed sources within ${strictestReviewCadenceDays} day(s).`);
    }
  }

  const catalogNames = new Set((catalog.agents || []).map((agent) => agent.name));
  const supplementalResearchRefs = corpus.supplementalResearchRefs &&
    typeof corpus.supplementalResearchRefs === "object" &&
    !Array.isArray(corpus.supplementalResearchRefs)
    ? corpus.supplementalResearchRefs
    : null;
  if (!supplementalResearchRefs) {
    fail("agent-research-corpus.json supplementalResearchRefs must be an object.");
  }
  const supplementalKeys = new Set(Object.keys(supplementalResearchRefs || {}));
  if (supplementalKeys.size < corpus.minimumSupplementalResearchRefs) {
    fail(`supplementalResearchRefs must include at least ${corpus.minimumSupplementalResearchRefs} reviewed references; found ${supplementalKeys.size}.`);
  }
  let strictestSupplementalReviewCadenceDays = Number.POSITIVE_INFINITY;
  for (const [key, ref] of Object.entries(supplementalResearchRefs || {})) {
    if (!/^[a-z][a-z0-9_]*$/.test(key)) {
      fail(`supplementalResearchRefs key must be snake_case: ${key}`);
    }
    if (authorityKeys.has(key)) {
      fail(`supplementalResearchRefs.${key} must not collide with authorityRefs.`);
    }
    if (!ref || typeof ref !== "object" || Array.isArray(ref)) {
      fail(`supplementalResearchRefs.${key} must be an object.`);
      continue;
    }
    if (ref.url !== undefined) {
      validateSupplementalUrl(key, ref.url);
    } else if (ref.sourceType !== "local command evidence") {
      fail(`supplementalResearchRefs.${key}.url is required unless sourceType is local command evidence.`);
    }
    validateSourceLocation(key, ref.sourceLocation);
    if (typeof ref.sourceType !== "string" || !sourceTiers.includes(ref.sourceType)) {
      fail(`supplementalResearchRefs.${key}.sourceType must match a sourceTiers entry.`);
    }
    if (!supplementalConfidenceLevels.has(ref.confidence)) {
      fail(`supplementalResearchRefs.${key}.confidence must be high, medium_high, or medium.`);
    }
    if (!["low", "medium", "high"].includes(ref.stalenessRisk)) {
      fail(`supplementalResearchRefs.${key}.stalenessRisk must be low, medium, or high.`);
    }
    if (!Number.isInteger(ref.reviewCadenceDays) || ref.reviewCadenceDays <= 0) {
      fail(`supplementalResearchRefs.${key}.reviewCadenceDays must be a positive integer.`);
    } else {
      const maxReviewCadenceDays = maxReviewCadenceDaysByRisk[ref.stalenessRisk];
      if (maxReviewCadenceDays && ref.reviewCadenceDays > maxReviewCadenceDays) {
        fail(`supplementalResearchRefs.${key}.reviewCadenceDays must be <= ${maxReviewCadenceDays} for ${ref.stalenessRisk} staleness risk.`);
      }
      strictestSupplementalReviewCadenceDays = Math.min(strictestSupplementalReviewCadenceDays, ref.reviewCadenceDays);
    }
    if (!supplementalAdoptionStatuses.has(ref.adoptionStatus)) {
      fail(`supplementalResearchRefs.${key}.adoptionStatus is not a reviewed supplemental status.`);
    }
    if (!supplementalRuntimeUses.has(ref.runtimeUse)) {
      fail(`supplementalResearchRefs.${key}.runtimeUse is not a reviewed supplemental runtime-use value.`);
    }
    if (ref.runtimeAuthority !== false) {
      fail(`supplementalResearchRefs.${key}.runtimeAuthority must be false; promote the source to authorityRefs before runtime use.`);
    }
    if (typeof ref.defaultRuntimeAuthorityWarning !== "string" || ref.defaultRuntimeAuthorityWarning.trim().length < 40) {
      fail(`supplementalResearchRefs.${key}.defaultRuntimeAuthorityWarning must explain the runtime-authority boundary.`);
    }
    const relatedRefs = requireArray(ref.relatedAuthorityRefs, `supplementalResearchRefs.${key}.relatedAuthorityRefs`, 1);
    if (hasDuplicates(relatedRefs)) fail(`supplementalResearchRefs.${key}.relatedAuthorityRefs must not contain duplicates.`);
    for (const relatedRef of relatedRefs) {
      if (!authorityKeys.has(relatedRef)) {
        fail(`supplementalResearchRefs.${key}.relatedAuthorityRefs contains unknown authority reference: ${relatedRef}`);
      }
    }
    const sourceMarkers = requireArray(ref.sourceMarkers, `supplementalResearchRefs.${key}.sourceMarkers`, 1);
    if (hasDuplicates(sourceMarkers)) fail(`supplementalResearchRefs.${key}.sourceMarkers must not contain duplicates.`);
    const adoptedFor = requireArray(ref.adoptedFor, `supplementalResearchRefs.${key}.adoptedFor`, 1);
    if (hasDuplicates(adoptedFor)) fail(`supplementalResearchRefs.${key}.adoptedFor must not contain duplicates.`);
    const appliesToAgents = requireArray(ref.appliesToAgents, `supplementalResearchRefs.${key}.appliesToAgents`, 1);
    if (hasDuplicates(appliesToAgents)) fail(`supplementalResearchRefs.${key}.appliesToAgents must not contain duplicates.`);
    for (const agentName of appliesToAgents) {
      if (!catalogNames.has(agentName)) {
        fail(`supplementalResearchRefs.${key}.appliesToAgents contains unknown agent: ${agentName}`);
      }
    }
    if (/(cookie|tunnel|raw CDP|deploy automation|implicit installs|auto-checkpoint)/i.test(ref.runtimeUse)) {
      fail(`supplementalResearchRefs.${key}.runtimeUse must not encode excluded behavior as a runtime mode.`);
    }
  }
  if (dateChecked && Number.isFinite(strictestSupplementalReviewCadenceDays)) {
    const ageDays = Math.floor((todayUtcMidnight().getTime() - dateChecked.getTime()) / MS_PER_DAY);
    if (ageDays > strictestSupplementalReviewCadenceDays) {
      fail(`agent-research-corpus.json dateChecked is ${ageDays} day(s) old; refresh supplemental sources within ${strictestSupplementalReviewCadenceDays} day(s).`);
    }
  }

  const sourceMarkerOwners = new Map();
  for (const [key, ref] of Object.entries(authorityRefs || {})) {
    for (const marker of ref.sourceMarkers || []) {
      addOwnedSourceMarker(sourceMarkerOwners, marker, `authorityRefs.${key}`);
    }
  }
  for (const [key, ref] of Object.entries(supplementalResearchRefs || {})) {
    for (const marker of ref.sourceMarkers || []) {
      addOwnedSourceMarker(sourceMarkerOwners, marker, `supplementalResearchRefs.${key}`);
    }
  }

  const sourceMarkerAliases = corpus.sourceMarkerAliases &&
    typeof corpus.sourceMarkerAliases === "object" &&
    !Array.isArray(corpus.sourceMarkerAliases)
    ? corpus.sourceMarkerAliases
    : null;
  if (!sourceMarkerAliases) {
    fail("agent-research-corpus.json sourceMarkerAliases must be an object keyed by authority or supplemental reference.");
  }
  for (const [targetRef, aliases] of Object.entries(sourceMarkerAliases || {})) {
    if (!authorityKeys.has(targetRef) && !supplementalKeys.has(targetRef)) {
      fail(`sourceMarkerAliases.${targetRef} must target an existing authorityRefs or supplementalResearchRefs key.`);
    }
    const aliasList = requireArray(aliases, `sourceMarkerAliases.${targetRef}`, 1);
    if (hasDuplicates(aliasList)) fail(`sourceMarkerAliases.${targetRef} must not contain duplicates.`);
    for (const alias of aliasList) {
      addOwnedSourceMarker(sourceMarkerOwners, alias, `sourceMarkerAliases.${targetRef}`);
    }
  }

  const expertiseSignals = corpus.expertiseSignals && typeof corpus.expertiseSignals === "object" && !Array.isArray(corpus.expertiseSignals)
    ? corpus.expertiseSignals
    : null;
  if (!expertiseSignals) {
    fail("agent-research-corpus.json expertiseSignals must be an object keyed by agent name.");
  }
  for (const name of Object.keys(expertiseSignals || {})) {
    if (!catalogNames.has(name)) fail(`expertiseSignals contains unknown agent: ${name}`);
  }
  const corpusAgents = Array.isArray(corpus.agents) ? corpus.agents : [];
  if (!Array.isArray(corpus.agents)) fail("agent-research-corpus.json agents must be an array.");
  if (corpusAgents.length !== catalogNames.size) {
    fail(`agent-research-corpus.json must define exactly ${catalogNames.size} agents; found ${corpusAgents.length}.`);
  }

  const seen = new Set();
  for (const agent of corpusAgents) {
    if (!agent || typeof agent !== "object") {
      fail("Each agent research corpus entry must be an object.");
      continue;
    }
    if (!catalogNames.has(agent.name)) fail(`Research corpus references unknown agent: ${agent.name}`);
    if (seen.has(agent.name)) fail(`Duplicate research corpus entry: ${agent.name}`);
    seen.add(agent.name);

    const expertise = expertiseSignals?.[agent.name];
    if (!expertise || typeof expertise !== "object" || Array.isArray(expertise)) {
      fail(`${agent.name}.expertiseSignals must be an object.`);
    } else {
      const expertiseKeys = Object.keys(expertise).sort();
      const expectedExpertiseKeys = [...expectedExpertiseSignalGroups].sort();
      if (JSON.stringify(expertiseKeys) !== JSON.stringify(expectedExpertiseKeys)) {
        fail(`${agent.name}.expertiseSignals must contain exactly: ${expectedExpertiseSignalGroups.join(", ")}.`);
      }
      for (const group of expectedExpertiseSignalGroups) {
        const signals = requireArray(expertise[group], `${agent.name}.expertiseSignals.${group}`, corpus.minimumExpertiseSignalsPerGroup);
        if (hasDuplicates(signals)) fail(`${agent.name}.expertiseSignals.${group} must not contain duplicates.`);
      }
    }

    requireArray(agent.domainFocus, `${agent.name}.domainFocus`, 3);
    requireArray(agent.primarySourceTypes, `${agent.name}.primarySourceTypes`, 4);
    const refs = requireArray(agent.authorityRefs, `${agent.name}.authorityRefs`, 4);
    if (hasDuplicates(refs)) fail(`${agent.name}.authorityRefs must not contain duplicates.`);
    for (const ref of refs) {
      if (!authorityKeys.has(ref)) fail(`${agent.name}.authorityRefs contains unknown reference: ${ref}`);
    }
    requireArray(agent.refreshTriggers, `${agent.name}.refreshTriggers`, 3);
    const handoffs = requireArray(agent.handoffTargets, `${agent.name}.handoffTargets`, 1);
    for (const target of handoffs) {
      if (!catalogNames.has(target)) fail(`${agent.name}.handoffTargets contains unknown agent: ${target}`);
      if (target === agent.name) fail(`${agent.name}.handoffTargets must not point to itself.`);
    }

    const templatePath = path.join(agentDir, `${agent.name}.toml`);
    if (!fs.existsSync(templatePath)) {
      fail(`Missing agent template for research corpus entry: ${agent.name}`);
      continue;
    }
    const template = fs.readFileSync(templatePath, "utf8");
    for (const ref of refs) {
      const markers = authorityRefs?.[ref]?.sourceMarkers || [];
      if (!markers.some((marker) => template.includes(marker))) {
        fail(`${agent.name}.authorityRefs contains ${ref}, but ${agent.name}.toml has no matching source marker.`);
      }
    }
    for (const block of expectedBlocks) {
      const occurrences = countOccurrences(template, block);
      if (occurrences !== 1) {
        fail(`${agent.name} must include exactly one ${block} found ${occurrences}.`);
      }
    }
    for (const block of expectedOperationalBlocks) {
      const occurrences = countOccurrences(template, block);
      if (occurrences !== 1) {
        fail(`${agent.name} must include exactly one ${block} found ${occurrences}.`);
      }
    }
    for (const contract of expectedRuntimeContracts) {
      const occurrences = countOccurrences(template, contract);
      if (occurrences !== 1) {
        fail(`${agent.name} must include exactly one ${contract} found ${occurrences}.`);
      }
    }
    const sourceBackedItems = countOccurrences(template, "[Source:");
    if (sourceBackedItems < corpus.minimumSourceBackedItems) {
      fail(`${agent.name} has ${sourceBackedItems} source-backed items; expected at least ${corpus.minimumSourceBackedItems}.`);
    }
    const distinctSourceMarkers = collectSourceMarkers(template);
    if (distinctSourceMarkers.size < corpus.minimumDistinctSourceMarkers) {
      fail(`${agent.name} has ${distinctSourceMarkers.size} distinct source markers; expected at least ${corpus.minimumDistinctSourceMarkers}.`);
    }
    for (const marker of distinctSourceMarkers) {
      if (!sourceMarkerOwners.has(marker)) {
        fail(`${agent.name} uses unknown source marker "${marker}"; add it to authorityRefs, supplementalResearchRefs, or sourceMarkerAliases.`);
      }
    }
  }

  for (const name of catalogNames) {
    if (!seen.has(name)) fail(`Agent missing from research corpus: ${name}`);
  }
}

if (failures.length > 0) {
  console.error("Agent research corpus validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Agent research corpus validation passed.");
