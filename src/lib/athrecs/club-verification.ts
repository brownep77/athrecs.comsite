/**
 * Running-club verification tiers for Athrecs.
 *
 * V1–V2 = verified (badge + full trust for club aggregation)
 * V3–V4 = listed but not verified
 * V5 = disputed / merge candidate
 */

export type ClubVerificationTier = "V1" | "V2" | "V3" | "V4" | "V5" | "NA";

export type ClubVerificationInfo = {
  tier: ClubVerificationTier;
  /** Short label for badges */
  label: string;
  /** Whether the club counts as "verified" for product features */
  verified: boolean;
  /** One-line reason shown on club cards / detail */
  reason: string;
};

/** Full criteria copy used on /clubs/verification */
export const CLUB_VERIFICATION_CRITERIA = {
  title: "Running club verification",
  intro:
    "Athrecs lists many club and team names from race results. Verification means we have independent evidence that a club is a real, ongoing organisation — not that one club is “better” than another.",
  tiers: [
    {
      tier: "V1" as const,
      name: "Confirmed affiliated",
      badge: "Verified",
      criteria:
        "England Athletics / UK Athletics (or clear official club site) matches the name and town, and the club appears on timed results under a stable name.",
      treatAs: "Full club page, filters, verified badge.",
    },
    {
      tier: "V2" as const,
      name: "Confirmed by results",
      badge: "Verified (results)",
      criteria:
        "No EA listing found, but the same club name appears on two or more independent timed races in the region with a coherent location.",
      treatAs: "Club page OK; labelled verified via race results.",
    },
    {
      tier: "V3" as const,
      name: "Supported",
      badge: "Listed",
      criteria:
        "Only a website or social presence, or a single race appearance, or an unstable name spelling.",
      treatAs: "Listed with caveat; limited weight in club rankings.",
    },
    {
      tier: "V4" as const,
      name: "Unverified",
      badge: "Unverified",
      criteria:
        "Only present in our seed or scrape; no live official page or independent results source yet.",
      treatAs: "Provisional listing; not shown as verified.",
    },
    {
      tier: "V5" as const,
      name: "Disputed / merge candidate",
      badge: "Needs review",
      criteria:
        "Conflicting names, two slugs for one club, or an impossible location.",
      treatAs: "Not used for stats until resolved.",
    },
  ],
  clubTypes: [
    {
      name: "EA-affiliated athletics / running club",
      description:
        "Formal club, usually England Athletics affiliated; road, track, XC, or mixed.",
    },
    {
      name: "Road running club (affiliated)",
      description:
        "Same formal structure, mainly road and endurance racing.",
    },
    {
      name: "Unofficial / social run group",
      description:
        "Regular meet-ups without EA affiliation; rarely a stable chip-timed club name.",
    },
    {
      name: "Shop / brand / gym run club",
      description: "Retailer or gym-backed group runs; may appear under a brand team name.",
    },
    {
      name: "Corporate / workplace group",
      description: "Company staff runs or charity race teams.",
    },
    {
      name: "Virtual / app-only club",
      description: "Strava or app clubs; weak evidence for real-world race identity.",
    },
    {
      name: "Event team / one-off crew",
      description: "Ad-hoc team for a single relay or charity race.",
    },
    {
      name: "Historic / defunct club",
      description: "Appears on older results; should be marked historic when known.",
    },
    {
      name: "Duplicate / alias name",
      description:
        "Same real club under slightly different result-sheet strings — merge, don’t double-count.",
    },
  ],
  minimumBar: [
    {
      entity: "Club",
      bar: "Official or EA listing, or the same club name on ≥2 independent timed race results in the region.",
    },
    {
      entity: "Race series",
      bar: "Organiser or timer page for that event name.",
    },
    {
      entity: "Edition",
      bar: "Dated results or entry page matching date and distance.",
    },
    {
      entity: "Athlete",
      bar: "≥1 official result line with name and event date, stored with a source URL.",
    },
    {
      entity: "Result",
      bar: "Row present on that edition’s source list (place and time agree).",
    },
  ],
  benefitsPlatform: [
    "Cleaner club filters and athlete-by-club pages",
    "Safer merging of result-sheet name variants into one club",
    "Source trail for every verified claim",
    "Higher trust that the directory is a reference, not only a scrape",
    "Lower moderation load from “is this real?” questions",
    "Path to club claim pages or official feeds later",
  ],
  benefitsPublic: [
    "Find a real local club, not a dead or one-off team name",
    "Trust the club string on a result when it matches a verified club",
    "Compare club standings among verified clubs only",
    "A join or contact path when an official website exists",
    "EA-affiliated (V1) clubs operate under affiliation rules — not a quality rating, but an organisational bar",
  ],
  policy:
    "Verified badge only for V1 or V2. Everyone else stays listed as unverified or as a group/team name from results until sources appear. Aliases merge into one verified club where possible.",
} as const;

/** Known merge pairs — prefer the canonical slug. */
const MERGE_CANDIDATES = new Set([
  "bungay-black-dog",
  "bungay-black-dog-rc",
  "cambridge-and-coleridge-ac",
  "cambridge-coleridge-ac",
  "city-of-norwich-ac",
  "city-of-norwich",
  "norfolk-gazelles",
  "norfolk-gazelles-ac",
]);

/**
 * Curated V1 (affiliated / official site known) for common Norfolk & nearby clubs.
 * Expand over time as EA/official checks are completed.
 */
const TIER_OVERRIDES: Record<string, ClubVerificationTier> = {
  unattached: "NA",
  "city-of-norwich-ac": "V1",
  "norfolk-gazelles": "V1",
  "norfolk-gazelles-ac": "V1",
  "norwich-road-runners": "V1",
  "wymondham-ac": "V1",
  "great-yarmouth-road-runners": "V1",
  "great-yarmouth-district-ac": "V1",
  "north-norfolk-beach-runners": "V1",
  "dereham-runners": "V1",
  "coltishall-jaguars": "V1",
  "tri-anglia": "V1",
  "bure-valley-harriers": "V2",
  "aylsham-runners": "V2",
  "reepham-runners": "V2",
  "bungay-black-dog-rc": "V2",
  "lowestoft-road-runners": "V2",
  "ryston-runners": "V2",
  "the-tcr": "V2",
  "west-norfolk-ac": "V2",
  "cambridge-and-coleridge-ac": "V1",
  "cambridge-coleridge-ac": "V5",
  "bungay-black-dog": "V5",
};

const TIER_META: Record<
  ClubVerificationTier,
  Pick<ClubVerificationInfo, "label" | "verified" | "reason">
> = {
  V1: {
    label: "Verified",
    verified: true,
    reason: "Confirmed affiliated / official club identity",
  },
  V2: {
    label: "Verified (results)",
    verified: true,
    reason: "Confirmed via repeated timed race results",
  },
  V3: {
    label: "Listed",
    verified: false,
    reason: "Supported by limited public sources — not fully verified",
  },
  V4: {
    label: "Unverified",
    verified: false,
    reason: "No independent official or multi-race source yet",
  },
  V5: {
    label: "Needs review",
    verified: false,
    reason: "Possible duplicate or conflicting club identity",
  },
  NA: {
    label: "Not a club",
    verified: false,
    reason: "Unattached / no club affiliation",
  },
};

export function resolveClubVerification(input: {
  slug: string;
  website?: string | null;
  member_count?: number;
  name?: string;
}): ClubVerificationInfo {
  const slug = input.slug.toLowerCase();

  if (slug === "unattached") {
    return { tier: "NA", ...TIER_META.NA };
  }

  const overridden = TIER_OVERRIDES[slug];
  if (overridden) {
    return { tier: overridden, ...TIER_META[overridden] };
  }

  if (MERGE_CANDIDATES.has(slug)) {
    return { tier: "V5", ...TIER_META.V5 };
  }

  const hasWebsite = Boolean(input.website?.trim());
  const members = input.member_count ?? 0;

  if (hasWebsite && members >= 2) {
    return { tier: "V2", ...TIER_META.V2 };
  }
  if (hasWebsite || members >= 2) {
    return { tier: "V3", ...TIER_META.V3 };
  }
  return { tier: "V4", ...TIER_META.V4 };
}
