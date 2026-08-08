function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokens(value) {
  return normalize(value).split(" ").filter(Boolean);
}

function includesPhrase(task, phrase) {
  return ` ${normalize(task)} `.includes(` ${normalize(phrase)} `);
}

function scoreProfile(profile, task, catalogIndex) {
  const taskTokens = new Set(tokens(task));
  const matchedTerms = [];
  const matchedPhrases = [];
  let score = 0;

  for (const [phrase, weight] of profile.match?.phrases || []) {
    if (includesPhrase(task, phrase)) {
      matchedPhrases.push(phrase);
      score += weight;
    }
  }
  for (const [term, weight] of profile.match?.terms || []) {
    if (taskTokens.has(normalize(term))) {
      matchedTerms.push(term);
      score += weight;
    }
  }

  const excludedTerms = (profile.match?.excludeTerms || []).filter((term) => taskTokens.has(normalize(term)));
  for (const term of excludedTerms) score -= 20;

  return { profile, catalogIndex, matchedTerms, matchedPhrases, excludedTerms, score: Math.max(0, score), priority: profile.match?.priority || 0 };
}

function confidenceFor(entry, next) {
  if (entry.score >= 12 && (!next || entry.score - next.score >= 3)) return "high";
  if (entry.score >= 6) return "medium";
  return "low";
}

export function recommendProfiles(profiles, task, limit = 3) {
  const entries = profiles
    .map((profile, catalogIndex) => scoreProfile(profile, task, catalogIndex))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || right.priority - left.priority || left.catalogIndex - right.catalogIndex)
    .slice(0, limit);

  return entries.map((entry, index) => ({ ...entry, confidence: confidenceFor(entry, entries[index + 1]) }));
}
