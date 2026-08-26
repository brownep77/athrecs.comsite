export type PotentialResultMatchConfidence = "exact" | "strong" | "possible";

export type PotentialResultMatchContext = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  clubOrTeam?: string | null;
};

export type PotentialResultCandidateContext = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  clubName?: string | null;
};

export type PotentialNameMatch = {
  score: number;
  confidence: PotentialResultMatchConfidence;
  matchedName: string;
  reasons: string[];
};

const TITLE_TOKENS = new Set(["mr", "mrs", "ms", "miss", "mx", "dr", "sir", "dame"]);
const SUFFIX_TOKENS = new Set(["jr", "sr", "ii", "iii", "iv"]);

function withoutDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function comparableText(value: string | null | undefined): string {
  return withoutDiacritics(value ?? "")
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function personNameTokens(value: string | null | undefined): string[] {
  const tokens = comparableText(value).split(" ").filter(Boolean);
  while (tokens.length && TITLE_TOKENS.has(tokens[0])) tokens.shift();
  while (tokens.length && SUFFIX_TOKENS.has(tokens[tokens.length - 1])) tokens.pop();
  return tokens;
}

export function normalizePersonName(value: string | null | undefined): string {
  return personNameTokens(value).join(" ");
}

export function uniquePotentialMatchNames(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const display = value?.trim();
    const normalized = normalizePersonName(display);
    if (!display || normalized.split(" ").length < 2 || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(display);
  }
  return result;
}

function rawNameTokens(value: string): string[] {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter(Boolean) ?? [];
}

/**
 * Build bounded SQL LIKE patterns. The application still performs the final,
 * stricter name and contextual scoring after the database returns candidates.
 */
export function buildPotentialMatchSearchPatterns(names: string[]): {
  normalizedPatterns: string[];
  rawPatterns: string[];
} {
  const normalizedPatterns = new Set<string>();
  const rawPatterns = new Set<string>();

  for (const name of names) {
    const normalized = personNameTokens(name);
    const raw = rawNameTokens(name);
    if (normalized.length >= 2) {
      const first = normalized[0];
      const last = normalized[normalized.length - 1];
      normalizedPatterns.add(`%${first}%${last}%`);
      normalizedPatterns.add(`%${first.charAt(0)}%${last}%`);
      normalizedPatterns.add(`%${last}%${first}%`);
    }
    if (raw.length >= 2) {
      const first = raw[0];
      const last = raw[raw.length - 1];
      rawPatterns.add(`%${first}%${last}%`);
      rawPatterns.add(`%${first.charAt(0)}%${last}%`);
      rawPatterns.add(`%${last}%${first}%`);
    }
  }

  return {
    normalizedPatterns: [...normalizedPatterns],
    rawPatterns: [...rawPatterns],
  };
}

function sameTokenSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  return [...left].sort().join("|") === [...right].sort().join("|");
}

function middleInitials(tokens: string[]): string {
  return tokens
    .slice(1, -1)
    .map((token) => token.charAt(0))
    .join("");
}

function nameScore(accountName: string, candidateName: string): {
  score: number;
  reason: string;
} | null {
  const account = personNameTokens(accountName);
  const candidate = personNameTokens(candidateName);
  if (account.length < 2 || candidate.length < 2) return null;

  const accountNormalized = account.join(" ");
  const candidateNormalized = candidate.join(" ");
  if (accountNormalized === candidateNormalized) {
    return { score: 100, reason: "Exact account-name match" };
  }
  if (sameTokenSet(account, candidate)) {
    return { score: 98, reason: "Same name tokens in a different order" };
  }

  const accountFirst = account[0];
  const accountLast = account[account.length - 1];
  const candidateFirst = candidate[0];
  const candidateLast = candidate[candidate.length - 1];
  if (accountLast !== candidateLast) return null;

  if (accountFirst === candidateFirst) {
    const accountMiddle = middleInitials(account);
    const candidateMiddle = middleInitials(candidate);
    if (accountMiddle && candidateMiddle && accountMiddle === candidateMiddle) {
      return { score: 95, reason: "First name, surname and middle initials match" };
    }
    return { score: 92, reason: "First name and surname match" };
  }

  if (accountFirst.charAt(0) === candidateFirst.charAt(0)) {
    return { score: 72, reason: "First initial and surname match" };
  }

  return null;
}

function contextualBoost(
  account: PotentialResultMatchContext,
  candidate: PotentialResultCandidateContext,
): { boost: number; reasons: string[] } {
  let boost = 0;
  const reasons: string[] = [];
  const accountClub = comparableText(account.clubOrTeam);
  const candidateClub = comparableText(candidate.clubName);
  if (
    accountClub &&
    candidateClub &&
    (accountClub === candidateClub ||
      (accountClub.length >= 5 && candidateClub.includes(accountClub)) ||
      (candidateClub.length >= 5 && accountClub.includes(candidateClub)))
  ) {
    boost += 12;
    reasons.push("Club or team matches");
  }

  const accountCity = comparableText(account.city);
  const candidateCity = comparableText(candidate.city);
  if (accountCity && candidateCity && accountCity === candidateCity) {
    boost += 8;
    reasons.push("City or town matches");
  }

  const accountRegion = comparableText(account.region);
  const candidateRegion = comparableText(candidate.region);
  if (accountRegion && candidateRegion && accountRegion === candidateRegion) {
    boost += 6;
    reasons.push("Region or county matches");
  }

  const accountCountry = comparableText(account.country);
  const candidateCountry = comparableText(candidate.country);
  if (accountCountry && candidateCountry && accountCountry === candidateCountry) {
    boost += 3;
    reasons.push("Country matches");
  }

  return { boost, reasons };
}

/**
 * Return only conservative suggestions. Exact or same first/surname matches are
 * shown on name evidence alone; initial-only matches need corroborating account
 * context such as club, city or region.
 */
export function scorePotentialResultNameMatch(
  accountNames: string[],
  candidateName: string,
  accountContext: PotentialResultMatchContext,
  candidateContext: PotentialResultCandidateContext,
): PotentialNameMatch | null {
  let best: { score: number; reason: string; matchedName: string } | null = null;
  for (const accountName of accountNames) {
    const score = nameScore(accountName, candidateName);
    if (!score || (best && score.score <= best.score)) continue;
    best = { ...score, matchedName: accountName };
  }
  if (!best) return null;

  const context = contextualBoost(accountContext, candidateContext);
  if (best.score < 90 && context.boost < 8) return null;

  const score = Math.min(100, best.score + context.boost);
  const confidence: PotentialResultMatchConfidence =
    best.score >= 98 ? "exact" : score >= 90 ? "strong" : "possible";

  return {
    score,
    confidence,
    matchedName: best.matchedName,
    reasons: [best.reason, ...context.reasons],
  };
}
