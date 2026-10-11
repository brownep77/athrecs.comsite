import type { CompetitionTier } from "./competition-awards";

export type ProfileAwardKind =
  | "gold"
  | "silver"
  | "bronze"
  | "finisher"
  | "trophy"
  | "personal-best"
  | "milestone"
  | "participation";

/** Presentation only: never establishes verification or contributes to achievement totals. */
export function placingAward(place?: string | number | null): ProfileAwardKind {
  const value = String(place ?? "").trim();
  // Accept explicit ties and the leading overall place in club overall/masters/age notation.
  // Heat letters, category-only text and uncertain placings must not become overall podiums.
  const overall = value.match(/^([1-9]\d*(?:st|nd|rd|th)?=?)(?:\/(?:[1-9]\d*)?){0,2}$/i)?.[1];
  if (/^1(?:st)?=?$/i.test(overall ?? "")) return "gold";
  if (/^2(?:nd)?=?$/i.test(overall ?? "")) return "silver";
  if (/^3(?:rd)?=?$/i.test(overall ?? "")) return "bronze";
  return "finisher";
}

/** Use explicit editorial outcomes; participation is never a championship medal. */
export function careerAward(highlight: {
  title: string;
  outcomes: readonly string[];
  awardKind?: ProfileAwardKind;
}): ProfileAwardKind {
  if (highlight.awardKind) return highlight.awardKind;
  if (/\b(?:competed|appearances?|participation|olympian)\b/i.test(highlight.title))
    return "participation";
  if (highlight.outcomes.length === 1) {
    const place = highlight.outcomes[0].match(/^(1st|2nd|3rd)(?:\s*[·:—-]|$)/i)?.[1];
    const award = placingAward(place);
    if (award === "gold") return "trophy";
    if (award === "silver" || award === "bronze") return award;
  }
  return "milestone";
}

export function careerTier(highlight: {
  title: string;
  competitionTier?: CompetitionTier;
}): CompetitionTier {
  if (highlight.competitionTier) return highlight.competitionTier;
  if (/\bParalympic\b/i.test(highlight.title)) return "paralympic";
  if (/\bOlympic\b/i.test(highlight.title)) return "olympic";
  if (/\bWorld Championships?\b/i.test(highlight.title)) return "world";
  return "race";
}
