import { placingAward, type ProfileAwardKind } from "./profile-awards.ts";
import type { ProfileResult } from "./profile-records";
import type { SourcePerformance } from "./source-performance-history";
import {
  hasHistoryFinish,
  hasRecordedFinish,
  resultVerification,
} from "./profile-result-presentation.ts";

/** AthRecs presentation categories, not governing-body ranking points. */
export const COMPETITION_TIERS = {
  olympic: { label: "Olympic Games", rank: 1, emblem: "olympic" },
  paralympic: { label: "Paralympic Games", rank: 1, emblem: "paralympic" },
  world: { label: "World Championships", rank: 2, emblem: "world" },
  continental: { label: "Continental / major Games", rank: 3, emblem: "continental" },
  major: { label: "Major marathon", rank: 3, emblem: "major" },
  international: { label: "International competition", rank: 4, emblem: "international" },
  national: { label: "National championships", rank: 5, emblem: "national" },
  regional: { label: "Regional / county championships", rank: 6, emblem: "regional" },
  local: { label: "Club competition", rank: 7, emblem: "local" },
  community: { label: "Community event", rank: 8, emblem: "community" },
  race: { label: "Race", rank: 9, emblem: "race" },
} as const;
export type CompetitionTier = keyof typeof COMPETITION_TIERS;
export type CompetitionRound = "final" | "heat" | "semi-final" | "qualifying" | "unknown";
export type AwardScope = "overall" | "gender" | "category";
export type CompetitionContext = {
  tier: CompetitionTier;
  round: CompetitionRound;
  division: string;
};
type CompetitionInput = {
  event: string;
  eventSlug?: string;
  date?: string;
  discipline?: string;
  labels?: readonly string[];
  verified: boolean;
};

const majorMarathons = [
  { name: "Chicago", since: 1977, slugs: ["chicago-marathon"] },
  { name: "London", since: 1981, slugs: ["london-marathon"] },
  { name: "Boston", since: 1897, slugs: ["boston-marathon"] },
  { name: "Berlin", since: 1974, slugs: ["berlin-marathon", "bmw-berlin-marathon"] },
  { name: "New York City", since: 1970, slugs: ["new-york-city-marathon"] },
  { name: "Tokyo", since: 2007, slugs: ["tokyo-marathon"] },
  { name: "Sydney", since: 2025, slugs: ["sydney-marathon"] },
] as const;

export function competitionRound(labels: readonly string[]): CompetitionRound {
  const roundLabels = labels.filter((label) => /^round:/i.test(label));
  const parseRound = (roundText: string): CompetitionRound =>
    /^(?:sf\d*|semi[- ]?final(?:\s*\d+)?)$/i.test(roundText)
      ? "semi-final"
      : /^(?:h\d*|heat(?:\s*\d+)?)$/i.test(roundText)
        ? "heat"
        : /^(?:q\d*|qualification|qualifying(?:\s*\d+)?)$/i.test(roundText)
          ? "qualifying"
          : /^(?:f|final|finals|final a|a final)$/i.test(roundText)
            ? "final"
            : "unknown";
  const rounds = new Set(roundLabels.map((label) => parseRound(label.replace(/^round:\s*/i, ""))));
  return rounds.size === 1 ? [...rounds][0] : "unknown";
}

/** Anchored championship identities only. An overseas venue, a fast time or a
 * provider's brand never establishes the prestige of an otherwise unknown race. */
export function competitionContext(input: CompetitionInput): CompetitionContext {
  const event = input.event
    .trim()
    .replace(/^The\s+/i, "")
    .replace(/^\d+(?:st|nd|rd|th)?\s+/i, "");
  const roundLabels = (input.labels ?? []).filter((label) => /^round:/i.test(label));
  const round = competitionRound(roundLabels);
  let tier: CompetitionTier = "race";
  if (/^(?:[IVXLCDM]+\s+)?Olympic Games(?:\s*[,–—-]|$)/i.test(event)) tier = "olympic";
  else if (/^(?:[IVXLCDM]+\s+)?Paralympic Games(?:\s*[,–—-]|$)/i.test(event)) tier = "paralympic";
  else if (
    /^(?:(?:IAAF|World Athletics)\s+)?World\s+(?:(?:Indoor|Outdoor|Road Running|Cross Country|Half Marathon|Marathon|Mountain and Trail Running|Masters|U20|U23|Junior|Para Athletics|Athletics|Triathlon|Cycling)\s+)*Championships\b/i.test(
      event,
    ) ||
    /^(?:IAAF World|World Athletics|World Para Athletics|World Masters Athletics|World Triathlon|UCI World)\s+(?:(?:Indoor|Outdoor|Road Running|Cross Country|Half Marathon|Marathon|Mountain and Trail Running|Masters|U20|U23|Junior|Athletics|Road)\s+)*Championships\b/i.test(
      event,
    )
  )
    tier = "world";
  else if (
    /^(?:(?:European|African|Asian|Oceania|Pan American)\s+(?:(?:Athletics|Indoor|Outdoor|Cross Country|Masters|U20|U23)\s+)*Championships|(?:Commonwealth|Pan American|Asian|African|European) Games)\b/i.test(
      event,
    )
  )
    tier = "continental";
  else if (
    /^(?:(?:British|UK|English|Scottish|Welsh|Irish|US|USA|Canadian|Australian|New Zealand|South African|National)\s+(?:(?:Athletics|Indoor|Outdoor|Masters|Half Marathon|Marathon|Cross Country|10,?000m|5,?000m)\s+)*Championships|AAA Championships)\b/i.test(
      event,
    )
  )
    tier = "national";
  else if (/^[A-Za-z &'’-]+\s+(?:County|Regional|District)\s+Championships\b/i.test(event))
    tier = "regional";
  else if (/^[A-Za-z &'’-]+\s+Club\s+Championships\b/i.test(event)) tier = "local";
  else if (/\bparkrun\b/i.test(event)) tier = "community";
  else if (/^(?:Wanda )?Diamond League(?: Final)?(?:\s*[,–—-]|$)/i.test(event))
    tier = "international";
  else if (
    /^(?:full )?marathon$/i.test(input.discipline ?? "") &&
    majorMarathons.some((race) => {
      const year = Number(input.date?.match(/\b\d{4}\b/)?.[0]);
      return (
        year >= race.since &&
        (race.slugs.some((slug) => slug === input.eventSlug) ||
          new RegExp(
            `^(?:(?:BMW|TCS|Bank of America|LaSalle Bank|Flora|Virgin Money) )?${race.name} Marathon(?:,|$)`,
            "i",
          ).test(event))
      );
    })
  )
    tier = "major";
  const division = /\bmasters\b/i.test(event)
    ? "Masters"
    : (event.match(/\bU(?:18|20|23)\b/i)?.[0].toUpperCase() ??
      (/\bjunior\b/i.test(event) ? "Junior" : ""));
  // These are single-race championship disciplines; track/field needs an explicit final.
  const singleRace =
    /^(?:Marathon|Half(?: Marathon)?|Cross Country(?: Long| Short)? Race|\d+ (?:Kilometres|Kilometers) Race Walk)$/i.test(
      input.discipline ?? "",
    );
  return { tier, division, round: !roundLabels.length && singleRace ? "final" : round };
}

export type PerformanceAward = {
  kind: ProfileAwardKind;
  context: CompetitionContext;
  scope: AwardScope;
  category: string;
  label: string;
  podium: boolean;
  verified: boolean;
};
export function performanceAwards(input: {
  context: CompetitionContext;
  finished: boolean;
  verified: boolean;
  overall?: string | number | null;
  genderPlace?: number | null;
  categoryPlace?: number | null;
  category?: string | null;
  gender?: string | null;
}): PerformanceAward[] {
  if (!input.finished) return [];
  const { context } = input;
  const championship = [
    "olympic",
    "paralympic",
    "world",
    "continental",
    "national",
    "regional",
    "local",
  ].includes(context.tier);
  const final = context.round === "final";
  const level = COMPETITION_TIERS[context.tier].label;
  const base =
    context.tier === "race" ? "" : `${level}${context.division ? ` · ${context.division}` : ""} · `;
  const make = (
    place: string | number | null | undefined,
    scope: AwardScope,
    category = "",
  ): PerformanceAward => {
    const placing = placingAward(place);
    const podium =
      placing !== "finisher" &&
      !["heat", "semi-final", "qualifying"].includes(context.round) &&
      (!championship || final);
    const kind = podium ? placing : "finisher";
    const scopeLabel =
      scope === "category"
        ? `${category} age/category`
        : scope === "gender"
          ? /^(?:f|female|women|w)$/i.test(input.gender ?? "")
            ? "Women’s race"
            : /^(?:m|male|men|m)$/i.test(input.gender ?? "")
              ? "Men’s race"
              : "Gender classification"
          : "Overall";
    const medal =
      kind === "gold"
        ? "Gold · 1st"
        : kind === "silver"
          ? "Silver · 2nd"
          : kind === "bronze"
            ? "Bronze · 3rd"
            : "Finisher";
    const round =
      !final && championship
        ? ` · ${context.round === "unknown" ? "Round not recorded" : context.round}`
        : "";
    return {
      kind,
      context,
      scope,
      category,
      podium,
      verified: input.verified,
      label: `${base}${medal}${podium ? ` · ${scopeLabel}` : ""}${round}`,
    };
  };
  const awards = [make(input.overall, "overall")];
  if (input.genderPlace != null && input.genderPlace <= 3)
    awards.push(make(input.genderPlace, "gender"));
  if (input.categoryPlace != null && input.categoryPlace <= 3 && input.category?.trim())
    awards.push(make(input.categoryPlace, "category", input.category.trim()));
  // Category and gender awards always name their classification; never substitute it for overall.
  return awards.filter((award, index) => index === 0 || award.podium);
}

export function recordedCompetition(result: ProfileResult): CompetitionContext {
  return competitionContext({
    event: result.eventName,
    eventSlug: result.eventSlug,
    date: result.eventDate,
    discipline: result.distanceCode,
    labels: result.displayRound ? [`Round: ${result.displayRound}`] : [],
    verified: resultVerification(
      result.details?.verificationStatus,
      result.resultSource,
      result.conflicting,
    ).verified,
  });
}
export function historyCompetition(row: SourcePerformance): CompetitionContext {
  // An explicit racing year can identify a major without inventing a race day.
  // Season ranges must not be reduced to their first year.
  const year = row.yearLabel?.trim() || String(row.year);
  return competitionContext({
    event: row.meeting,
    eventSlug: row.eventSlug,
    date: row.date || (/^\d{4}$/.test(year) ? year : undefined),
    discipline: row.discipline,
    labels: row.labels,
    verified: resultVerification(row.verificationStatus, row.providerName).verified,
  });
}
export function recordedAwards(result: ProfileResult): PerformanceAward[] {
  return performanceAwards({
    context: recordedCompetition(result),
    finished: hasRecordedFinish(result),
    verified:
      resultVerification(
        result.details?.verificationStatus,
        result.resultSource,
        result.conflicting,
      ).verified && result.displayAwardVerified !== false,
    overall: result.conflicting ? null : (result.overallPlace ?? result.displayOverallPlace),
    genderPlace: result.conflicting ? null : result.genderPlace,
    categoryPlace: result.conflicting ? null : result.categoryPlace,
    category: result.category,
    gender: result.resultGender,
  });
}
function classificationPlace(
  explicit: number | null | undefined,
  labels: string[],
  kind: "Overall" | "Gender" | "Category",
): number | null {
  const values = new Set<number>(explicit != null ? [explicit] : []);
  const pattern = new RegExp(
    `^(?:${kind === "Category" ? "Cat|Category" : kind}) (?:Pos|Position):\\s*(\\d+)(?:\\s*\\([^)]*\\))?$`,
    "i",
  );
  for (const label of labels) {
    const match = label.match(pattern);
    if (match) values.add(Number(match[1]));
  }
  const value = [...values][0];
  return values.size === 1 && Number.isInteger(value) && value > 0 ? value : null;
}
export function historyAwards(row: SourcePerformance, gender = ""): PerformanceAward[] {
  const context = historyCompetition(row);
  return performanceAwards({
    context,
    finished:
      !/conflicting (?:source|details|result)|disputed placing/i.test(row.notes ?? "") &&
      hasHistoryFinish(row),
    verified: resultVerification(row.verificationStatus, row.providerName).verified,
    overall:
      row.places || row.labels.some((label) => /^Overall (?:Pos|Position):/i.test(label))
        ? classificationPlace(row.places?.overall, row.labels, "Overall")
        : context.division === "Masters"
          ? null
          : row.place,
    genderPlace: classificationPlace(row.places?.gender, row.labels, "Gender"),
    categoryPlace: classificationPlace(row.places?.category, row.labels, "Category"),
    category: row.ageGroup,
    gender,
  });
}
