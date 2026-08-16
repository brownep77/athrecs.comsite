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
        "A recognised governing-body directory (or clear official club site) matches the name and location, and the club has a stable identity.",
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
      criteria: "Conflicting names, two slugs for one club, or an impossible location.",
      treatAs: "Not used for stats until resolved.",
    },
  ],
  clubTypes: [
    {
      name: "Governing-body affiliated athletics / running club",
      description:
        "Formal club affiliated to its national or regional athletics governing body; road, track, XC, or mixed.",
    },
    {
      name: "Road running club (affiliated)",
      description: "Same formal structure, mainly road and endurance racing.",
    },
    {
      name: "Unofficial / social run group",
      description: "Regular meet-ups without EA affiliation; rarely a stable chip-timed club name.",
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
      bar: "Official governing-body listing, or the same club name on ≥2 independent timed race results in the region.",
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
    "Affiliated (V1) clubs operate under governing-body rules — not a quality rating, but an organisational bar",
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
 * Curated V1 (affiliated / official identity known) clubs.
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
  "athletics-ireland-beechmount-harriers-a-c": "V1",
  "athletics-ni-albertville-harriers": "V1",
  "athletics-ni-annadale-striders": "V1",
  "athletics-ni-barf-ni": "V1",
  "athletics-ni-belfast-running-club": "V1",
  "athletics-ni-dub-running-club": "V1",
  "athletics-ni-lagan-valley-ac": "V1",
  "athletics-ni-mallusk-harriers": "V1",
  "athletics-ni-north-belfast-harriers": "V1",
  "athletics-ni-orangegrove-ac": "V1",
  "athletics-ni-queens-university-ac": "V1",
  "athletics-ni-st-annes-ac": "V1",
  "athletics-ni-st-malachys-ac": "V1",
  "athletics-ni-victoria-park-and-connswater-ac": "V1",
  "athletics-ni-west-belfast-coolers": "V1",
  "athletics-ni-willowfield-harriers": "V1",
  "special-olympics-newtownabbey-racers": "V1",
  // Current Welsh Athletics All Clubs directory (checked 2026-08-16).
  "fairwater-runners-cwmbran": "V1",
  "gog-triathlon-club": "V1",
  "oswestry-olympians": "V1",
  "sospan-road-runners": "V1",
  "swansea-harriers": "V1",
  "welsh-athletics-3m-gorseinon-road-runners": "V1",
  "welsh-athletics-aberdare-valley-aac": "V1",
  "welsh-athletics-abergele-harriers": "V1",
  "welsh-athletics-aberystwyth-ac": "V1",
  "welsh-athletics-afan-nedd-tawe-schools-district": "V1",
  "welsh-athletics-afan-valley-swimming-club": "V1",
  "welsh-athletics-albany-road-run-club": "V1",
  "welsh-athletics-amman-valley-harriers": "V1",
  "welsh-athletics-barry-and-vale-harriers": "V1",
  "welsh-athletics-betsi-runaways": "V1",
  "welsh-athletics-blaenau-gwent-athletics": "V1",
  "welsh-athletics-brackla-harriers": "V1",
  "welsh-athletics-brav-performance": "V1",
  "welsh-athletics-brecon-athletic-club": "V1",
  "welsh-athletics-bridgend-athletics": "V1",
  "welsh-athletics-buckley-rc": "V1",
  "welsh-athletics-builth-and-district-running-club": "V1",
  "welsh-athletics-caerleon-rc": "V1",
  "welsh-athletics-caerphilly-runners": "V1",
  "welsh-athletics-caldicot-running-club": "V1",
  "welsh-athletics-cardiff-and-vale-schools-district": "V1",
  "welsh-athletics-cardiff-archers": "V1",
  "welsh-athletics-cardiff-athletics": "V1",
  "welsh-athletics-cardiff-harlequins-trail-running-club-clwb-rhedeg-llwybr-harlequins-caerdydd":
    "V1",
  "welsh-athletics-cardigan-rc": "V1",
  "welsh-athletics-carmarthen-and-district-harriers": "V1",
  "welsh-athletics-cdf-runners": "V1",
  "welsh-athletics-celtic-tri": "V1",
  "welsh-athletics-chepstow-harriers": "V1",
  "welsh-athletics-clwb-rhedeg-bro-dysynni-rc": "V1",
  "welsh-athletics-clwb-rhedeg-pontardawe-rc": "V1",
  "welsh-athletics-clwb-run-wales": "V1",
  "welsh-athletics-colwyn-bay-ac": "V1",
  "welsh-athletics-cornelly-striders-ac": "V1",
  "welsh-athletics-crickhowell-running-club": "V1",
  "welsh-athletics-cwmbran-harriers": "V1",
  "welsh-athletics-cybi-striders": "V1",
  "welsh-athletics-deeside-aac": "V1",
  "welsh-athletics-deestriders-b-s-rc": "V1",
  "welsh-athletics-denbigh-harriers": "V1",
  "welsh-athletics-dolly-mixtures": "V1",
  "welsh-athletics-dragons-running-club-aberdare": "V1",
  "welsh-athletics-dyfed-schools-district": "V1",
  "welsh-athletics-emlyn-runners": "V1",
  "welsh-athletics-eryri-harriers": "V1",
  "welsh-athletics-eryri-schools-district": "V1",
  "welsh-athletics-glamorgan-valleys-schools-district": "V1",
  "welsh-athletics-griffithstown-harriers": "V1",
  "welsh-athletics-heath-massive-rc": "V1",
  "welsh-athletics-hengoed-harriers": "V1",
  "welsh-athletics-islwyn-rc": "V1",
  "welsh-athletics-les-croupiers-rc": "V1",
  "welsh-athletics-llanelli-aac": "V1",
  "welsh-athletics-llangollen-running-club": "V1",
  "welsh-athletics-lliswerry-runners": "V1",
  "welsh-athletics-maldwyn-harriers": "V1",
  "welsh-athletics-meirionnydd-running-club": "V1",
  "welsh-athletics-menai-track-and-field": "V1",
  "welsh-athletics-merthyr-running-club": "V1",
  "welsh-athletics-micky-morris-racing-team": "V1",
  "welsh-athletics-monross-trailblazers": "V1",
  "welsh-athletics-mynydd-du-mountain-runners": "V1",
  "welsh-athletics-mynyddwyr-de-cymru": "V1",
  "welsh-athletics-neath-harriers": "V1",
  "welsh-athletics-newport-harriers": "V1",
  "welsh-athletics-north-east-wales-schools-districts": "V1",
  "welsh-athletics-north-wales-road-runners": "V1",
  "welsh-athletics-ogmore-phoenix-runners": "V1",
  "welsh-athletics-outdoor-fitness": "V1",
  "welsh-athletics-parc-bryn-bach-running-club": "V1",
  "welsh-athletics-paul-popham-running-club": "V1",
  "welsh-athletics-pegasus-running-club": "V1",
  "welsh-athletics-pembrokeshire-harriers": "V1",
  "welsh-athletics-penarth-and-dinas-runners": "V1",
  "welsh-athletics-pencoed-panthers": "V1",
  "welsh-athletics-penyffordd-run-club": "V1",
  "welsh-athletics-pont-y-pwl-and-district-runners": "V1",
  "welsh-athletics-pontyclun-athletics-club": "V1",
  "welsh-athletics-pontyclun-road-runners": "V1",
  "welsh-athletics-pontypridd-roadents-ac": "V1",
  "welsh-athletics-port-talbot-harriers": "V1",
  "welsh-athletics-porthcawl-runners": "V1",
  "welsh-athletics-powys-schools-district": "V1",
  "welsh-athletics-prestatyn-rc": "V1",
  "welsh-athletics-refail-runners": "V1",
  "welsh-athletics-rhayader-rc": "V1",
  "welsh-athletics-rhedwyr-hebog-runners": "V1",
  "welsh-athletics-rhondda-ac": "V1",
  "welsh-athletics-rhondda-valley-runners": "V1",
  "welsh-athletics-rhymney-valley-ac": "V1",
  "welsh-athletics-run-free-fell-runners": "V1",
  "welsh-athletics-run4all-neath": "V1",
  "welsh-athletics-san-domenico-rc": "V1",
  "welsh-athletics-sarn-helen": "V1",
  "welsh-athletics-south-east-wales-schools-district": "V1",
  "welsh-athletics-spirit-of-monmouth": "V1",
  "welsh-athletics-team-gje": "V1",
  "welsh-athletics-trg-runners": "V1",
  "welsh-athletics-tri-hard-harriers": "V1",
  "welsh-athletics-tri-potential": "V1",
  "welsh-athletics-trots": "V1",
  "welsh-athletics-welsh-schools-and-universities": "V1",
  "welsh-athletics-welshpool-athletics-club": "V1",
  "welsh-athletics-white-rock-runners": "V1",
  "welsh-athletics-women-running-penarth": "V1",
  "welsh-athletics-wrecsam-tri": "V1",
  "welsh-athletics-wrexham-amateur-athletic-club": "V1",
  "welsh-athletics-ystrad-mynach-running-club": "V1",
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
  official_source?: string | null;
  member_count?: number;
  name?: string;
}): ClubVerificationInfo {
  const slug = input.slug.toLowerCase();

  if (slug === "unattached") {
    return { tier: "NA", ...TIER_META.NA };
  }

  if (input.official_source && input.official_source !== "Prior ATHRECS catalogue") {
    return { tier: "V1", ...TIER_META.V1 };
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
