import moreThreeMonthStarts from "./three-month-starts-more-2026-10-25.json" with { type: "json" };
import countyExpansion from "./county-expansion-2026-10-21.json" with { type: "json" };
import countyExpansionMore from "./county-expansion-more-2026-10-21.json" with { type: "json" };
import countyExpansionChecked from "./county-expansion-checked-2026-10-21.json" with { type: "json" };
import countyTbcReview from "./county-tbc-review-2026-10-21.json" with { type: "json" };
import batch6ThreeMonthStarts from "./three-month-starts-batch6-2026-10-25.json" with { type: "json" };

import countyDeepReview from "./county-deep-recheck-2026-10-21.json" with { type: "json" };
import countyExpansionDeep from "./county-expansion-deep-2026-10-21.json" with { type: "json" };
import marriottsConfirmation from "./marriotts-organiser-confirmation-2026-10-23.json" with { type: "json" };
import timingDirectoryStarts from "./timing-directory-starts-2026-10-23.json" with { type: "json" };
import timingDirectoryStarts20261024 from "./timing-directory-starts-2026-10-24.json" with { type: "json" };
import accraStart from "./accra-start-2026-10-25.json" with { type: "json" };
import imminentStarts from "./imminent-starts-2026-10-25.json" with { type: "json" };
import urgentStarts from "./urgent-starts-followup-2026-10-25.json" with { type: "json" };
import { isUrgentReviewedPlaceholder } from "./urgent-starts-followup-2026-10-25.ts";
import threeMonthStarts from "./three-month-starts-2026-10-25.json" with { type: "json" };
import thirdUrgentStarts from "./urgent-starts-third-2026-10-25.json" with { type: "json" };
import { isThirdUrgentPlaceholder } from "./urgent-starts-third-2026-10-25.ts";
import nextUrgentStarts from "./urgent-starts-next-2026-10-25.json" with { type: "json" };
import { isNextUrgentPlaceholder } from "./urgent-starts-next-2026-10-25.ts";

/** Edition-specific organiser checks. Never carry a start time into another edition. */
export type FixtureDetail = {
  /** Reviewed race-day name; the canonical event and edition IDs stay unchanged. */
  displayName?: string;
  /** Shared event-page heading when one weekend contains different race days. */
  eventPageName?: string;
  place?: { town?: string; city?: string; county?: string; state?: string };
  summary: string;
  timeZone: string;
  sourceUrl: string;
  checkedAt: string;
  eventStartTime?: string;
  starts: Record<
    string,
    { time: string | null; note?: string; publicNote?: string; sourceUrl?: string; label?: string }
  >;
};

export const FIXTURE_DETAILS: Record<string, FixtureDetail> = {
  "bucharest-half-marathon|2027-05-08": {
    displayName: "Bucharest 10K",
    eventPageName: "OMV Petrom Bucharest Half Marathon & 10K",
    summary:
      "Part of the OMV Petrom Bucharest Half Marathon weekend: 10K on Saturday 8 May; half marathon on Sunday 9 May 2027. Both start at 09:00 local time.",
    timeZone: "Europe/Bucharest",
    sourceUrl: "https://www.bucuresti21km.ro/en/schedule/",
    checkedAt: "2026-10-25",
    starts: {
      "10K": {
        time: "09:00",
        sourceUrl: "https://www.bucuresti21km.ro/en/cursa-10km-10k-bucharest-race/",
        publicNote:
          "Saturday's 10K is part of the OMV Petrom Bucharest Half Marathon weekend. The half marathon takes place on Sunday 9 May. The separate wheelchair 10K starts at 08:45.",
      },
    },
  },
  "bucharest-half-marathon|2027-05-09": {
    displayName: "Bucharest Half Marathon",
    eventPageName: "OMV Petrom Bucharest Half Marathon & 10K",
    summary:
      "Part of the OMV Petrom Bucharest Half Marathon weekend: 10K on Saturday 8 May; half marathon on Sunday 9 May 2027. Both start at 09:00 local time.",
    timeZone: "Europe/Bucharest",
    sourceUrl: "https://www.bucuresti21km.ro/en/schedule/",
    checkedAt: "2026-10-25",
    starts: {
      Half: {
        time: "09:00",
        sourceUrl: "https://www.bucuresti21km.ro/en/cursa-21km-half-marathon-bucharest/",
        publicNote:
          "Sunday's half marathon is part of the OMV Petrom Bucharest Half Marathon weekend. The companion 10K takes place on Saturday 8 May.",
      },
    },
  },
  ...threeMonthStarts,
  ...imminentStarts,
  ...urgentStarts,
  ...nextUrgentStarts,
  ...thirdUrgentStarts,
  ...accraStart,
  "wa-32-hella-hamburg-half-marathon-7238156|2026-10-25": {
    place: { city: "Hamburg" },
    summary: "A half marathon from the Reeperbahn to Hamburg Messe.",
    timeZone: "Europe/Berlin",
    sourceUrl: "https://www.hamburg-halbmarathon.de/faq_0726/",
    checkedAt: "2026-10-25",
    starts: {
      Half: {
        time: "09:30",
        label: "First wave 09:30 CET · waves until 11:00",
        note: "Half marathon: block A 09:30, B 09:45, C 10:00, D 10:15, E 10:30, F 10:45, G 11:00. All times are local to Hamburg (CET, UTC+1). Follow the start block assigned by the organiser.",
        publicNote:
          "Half marathon: block A 09:30, B 09:45, C 10:00, D 10:15, E 10:30, F 10:45, G 11:00. All times are local to Hamburg (CET, UTC+1). Follow the start block assigned by the organiser.",
      },
    },
  },
  "ea-runevents-fenland-10-wisbech|2026-10-25": {
    summary: "Fenland Running Club's ten-mile road race in the Wisbech area.",
    timeZone: "Europe/London",
    sourceUrl: "https://fenlandrunningclub.co.uk/home/fen10",
    checkedAt: "2026-10-23",
    starts: {
      "10mi": {
        time: "11:00",
        note: "Main race at 11:00. An optional 10:45 early start is available for runners expecting to take more than two hours; arrange it with the organiser.",
      },
    },
  },
  ...countyExpansion.details,
  ...countyExpansionMore.details,
  ...countyExpansionChecked.details,
  ...countyTbcReview.details,
  ...countyDeepReview.details,
  ...countyExpansionDeep.details,
  "chase-the-train|2026-11-01": {
    summary: "A point-to-point trail run beside the Bure Valley Railway from Aylsham to Wroxham.",
    timeZone: "Europe/London",
    sourceUrl: "https://entries.sublimetiming.com/race/59",
    checkedAt: "2026-10-20",
    starts: {
      "9mi": { time: "10:30", note: "Organiser describes the route as approximately 8.9 miles." },
    },
  },
  "east-coast-10k|2026-11-01": {
    summary: "A road 10K on Great Yarmouth’s seafront, starting and finishing at Anchor Gardens.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/721",
    checkedAt: "2026-10-20",
    starts: { "10K": { time: "10:00" } },
  },
  "eama-10k|2026-11-22": {
    summary: "A 10K from Lady’s Lane in Wymondham through the countryside near Morley.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/711",
    checkedAt: "2026-10-20",
    starts: {
      "10K": { time: "10:00", note: "Waves at 10:00 and 10:10; follow your assigned wave." },
    },
  },
  "run-luminate-5k|2026-11-25": {
    place: { city: "Sandringham" },
    summary: "An evening 5K through the Luminate attraction at Sandringham Estate.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/691",
    checkedAt: "2026-10-20",
    starts: {
      "5K": {
        time: "19:00",
        note: "Separate 19:00 and 20:00 waves; check the wave on your booking.",
      },
    },
  },
  "santa-dash-lingwood|2026-12-13": {
    summary:
      "A festive 5K and 2K fun run from Lingwood Village Hall supporting Miniature Donkeys for Wellbeing.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/701",
    checkedAt: "2026-10-20",
    starts: { "5K": { time: "11:00" }, "2K": { time: "11:00" } },
  },
  "lingwood-santa-dash|2026-12-13": {
    summary: "A festive 5K from Lingwood Village Hall supporting Miniature Donkeys for Wellbeing.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/701",
    checkedAt: "2026-10-20",
    starts: { "5K": { time: "11:00" } },
  },
  "marham-flyers-nye-10k|2026-12-31": {
    summary: "A New Year’s Eve 10K around the Marham airfield.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/710",
    checkedAt: "2026-10-20",
    starts: {
      "10K": {
        time: "11:00",
        note: "Main start 11:00; 10:30 start for runners expecting to take over one hour.",
      },
    },
  },
  "wymondham-nyd-10k|2027-01-01": {
    summary: "An undulating rural-road 10K from Lady’s Lane in Wymondham on New Year’s Day.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/713",
    checkedAt: "2026-10-20",
    starts: { "10K": { time: "10:00" } },
  },
  "reepham-cross-country|2027-01-31": {
    summary: "One- and two-lap cross-country races from Whitwell Station near Reepham.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/746",
    checkedAt: "2026-10-21",
    starts: {
      "5K": {
        time: "10:15",
        note: "Adult one-lap 5K starts 10:15; juniors start 10:00. Owner clarification on 21 October 2026 distinguishes the adult 5K from the two-lap 10K at 10:30. The provider wording remains inconsistent; this correction records the owner's clarification, not a new organiser reply.",
        publicNote: "Adult one lap (approximately 5K): 10:15. Juniors start 10:00.",
      },
      "10K": {
        time: "10:30",
        note: "Adult two-lap 10K starts 10:30. Owner clarification on 21 October 2026 distinguishes this from the adult one-lap 5K at 10:15. The provider wording remains inconsistent; this correction records the owner's clarification, not a new organiser reply.",
        publicNote: "Adult two laps (approximately 10K): 10:30.",
      },
    },
  },
  ...marriottsConfirmation,
  ...timingDirectoryStarts,
  ...timingDirectoryStarts20261024,
  "larking-gowen-norwich-half|2027-04-04": {
    summary:
      "A closed-road half marathon from Norfolk Showground through the surrounding villages.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/704",
    checkedAt: "2026-10-20",
    starts: { Half: { time: "10:00" } },
  },
  "gear-10k-kings-lynn|2027-05-02": {
    summary: "A 10K through King’s Lynn, starting in Tuesday Market Place.",
    timeZone: "Europe/London",
    sourceUrl: "https://www.runforall.com/events/10k/gear-10k/",
    checkedAt: "2026-10-20",
    starts: { "10K": { time: "09:30" } },
  },
  "round-norfolk-epic|2027-06-13": {
    place: { city: "Great Yarmouth" },
    summary: "A 250 km / 155 mile road ride starting and finishing at Great Yarmouth Racecourse.",
    timeZone: "Europe/London",
    sourceUrl: "https://www.norfolkcyclingevents.co.uk/round-norfolk-epic",
    checkedAt: "2026-10-20",
    starts: { "155mi": { time: "06:00" } },
  },
  "marriotts-way-10k|2027-09-19": {
    summary: "A trail 10K along Marriott’s Way from Aylsham to Reepham.",
    timeZone: "Europe/London",
    sourceUrl: "https://www.southnorfolkandbroadland.gov.uk/leisure/marriotts-way-10k",
    checkedAt: "2026-10-20",
    starts: {
      "10K": {
        time: "10:00",
        note: "Five waves: 10:00, 10:10, 10:20, 10:30 and 10:40; check your allocated wave.",
      },
    },
  },
  "gothenburg-marathon|2026-10-10": {
    place: { city: "Gothenburg" },
    summary: "A flat coastal marathon from Slottsskogsvallen in Gothenburg, Sweden.",
    timeZone: "Europe/Stockholm",
    sourceUrl: "https://goteborgmarathon.se/information",
    checkedAt: "2026-10-08",
    starts: { Marathon: { time: "10:00" } },
  },
  "cal-tri-charlotte-triathlon|2026-10-10": {
    place: { city: "Statesville", state: "North Carolina" },
    summary: "Sprint and Olympic triathlons with an open-water swim at Lake Norman State Park.",
    timeZone: "America/New_York",
    sourceUrl: "https://charlotte.californiatriathlon.org/Race/CalTriCharlotte/Page/Schedule",
    checkedAt: "2026-10-07",
    starts: { Sprint: { time: "08:00" }, Olympic: { time: "08:20" } },
  },
  "cal-tri-los-angeles-triathlon|2026-10-18": {
    place: { town: "Playa del Rey", city: "Los Angeles", state: "California" },
    summary: "Sprint and Olympic swim-bike-run races from Dockweiler State Beach.",
    timeZone: "America/Los_Angeles",
    sourceUrl: "https://losangeles.californiatriathlon.org/Race/2019TrickorTri/Page/Schedule",
    checkedAt: "2026-10-07",
    starts: { Sprint: { time: "08:00" }, Olympic: { time: "08:20" } },
  },
  "moris-ride-run-cycling|2026-10-11": {
    place: { town: "Cascavelle" },
    summary:
      "Timed 69 km and 89 km road rides from SPARC, with coastal roads and climbs towards Chamarel.",
    timeZone: "Indian/Mauritius",
    sourceUrl: "https://mauritiusrace.com/journee/route/",
    checkedAt: "2026-10-07",
    starts: { "69K": { time: "07:00" }, "89K": { time: "07:00" } },
  },
  "la-grande-traversee-de-l-ouest|2026-11-01": {
    summary:
      "A 10 km open-water swim between Le Morne and La Preneuse, with solo and relay formats.",
    timeZone: "Indian/Mauritius",
    sourceUrl: "https://ipn.sportevents.mu/en/events/72/la-grande-traversee-de-louest",
    checkedAt: "2026-10-07",
    starts: { "10K": { time: "05:30" } },
  },
  "la-iguanera-maraton-mtb|2026-11-15": {
    place: { city: "San Pedro Pochutla", state: "Oaxaca" },
    summary:
      "Mountain-bike racing in Pochutla, with competitive categories and a recreational 25 km ride.",
    timeZone: "America/Mexico_City",
    sourceUrl: "https://www.chronostart.com.mx/registrate/categorias_disponibles/526",
    checkedAt: "2026-10-07",
    // The registration page's event time is not a confirmed start for each race.
    starts: {},
  },
  "be-uec-track-junior-u23-championships-heusden-zolder-2027|2027-07-13": {
    summary: "European junior and under-23 track cycling championships, running from 13–18 July.",
    timeZone: "Europe/Brussels",
    sourceUrl: "https://www.belgiancycling.be/belgian-cycling-team/toegekende-os-wk-en-ek/",
    checkedAt: "2026-10-07",
    starts: {},
  },
  "be-uec-bmx-racing-championships-heusden-zolder-2027|2027-07-09": {
    summary: "European BMX Racing Championships in Heusden-Zolder, running from 9–11 July.",
    timeZone: "Europe/Brussels",
    sourceUrl: "https://www.belgiancycling.be/belgian-cycling-team/toegekende-os-wk-en-ek/",
    checkedAt: "2026-10-07",
    starts: {},
  },
  "chase-the-moon-battersea-5k-10k-october|2026-10-07": {
    summary: "Flat evening laps of Battersea Park, starting and finishing at the bandstand.",
    timeZone: "Europe/London",
    sourceUrl:
      "https://www.runthrough.co.uk/event/chase-the-moon-battersea-park-5k-10k-october-2026",
    checkedAt: "2026-10-07",
    starts: { "5K": { time: "19:00" }, "10K": { time: "19:04" } },
  },
  "ea-runevents-even-splits-york-5k-series-york|2026-10-09": {
    summary: "A chip-timed evening 5K on the University of York Sport Village cycle circuit.",
    timeZone: "Europe/London",
    sourceUrl: "https://evensplits.events/york5k",
    checkedAt: "2026-10-07",
    starts: { "5K": { time: "19:30" } },
  },
  "ea-runevents-even-splits-york-5k-series-york|2026-11-13": {
    summary: "A chip-timed evening 5K on the University of York Sport Village cycle circuit.",
    timeZone: "Europe/London",
    sourceUrl: "https://evensplits.events/york5k",
    checkedAt: "2026-10-07",
    starts: { "5K": { time: "19:30" } },
  },
  "eindhoven-marathon|2026-10-10": {
    summary: "Children’s races and the 5K City Run open Eindhoven’s marathon weekend.",
    timeZone: "Europe/Amsterdam",
    sourceUrl: "https://asmlmarathoneindhoven.nl/event-info/",
    checkedAt: "2026-10-07",
    starts: {
      "1.5K": { time: "14:00" },
      "2.5K": { time: "15:00" },
      "5K": { time: "16:00" },
    },
  },
  "eindhoven-marathon|2026-10-11": {
    summary: "City road races through Eindhoven, finishing on the Vestdijk.",
    timeZone: "Europe/Amsterdam",
    sourceUrl: "https://asmlmarathoneindhoven.nl/event-info/",
    checkedAt: "2026-10-07",
    starts: {
      "Quarter Marathon": { time: "08:30", note: "First wave; check your assigned wave" },
      Half: { time: "11:30", note: "First wave; check your assigned wave" },
      Marathon: { time: "09:30", note: "First wave; check your assigned wave" },
    },
  },
  "eversource-hartford-marathon|2026-10-10": {
    place: { city: "Hartford", state: "Connecticut" },
    summary: "A Connecticut road marathon from the State Capitol to Hartford’s Memorial Arch.",
    timeZone: "America/New_York",
    sourceUrl: "https://www.hartfordmarathon.com/eversource-hartford-marathon/",
    checkedAt: "2026-10-07",
    starts: {
      Marathon: { time: "08:00", note: "Main field; wheelchair start 07:57 EDT (UTC−4)" },
      Half: { time: "08:00", note: "Main field; wheelchair start 07:57 EDT (UTC−4)" },
      "5K": { time: "08:10" },
    },
  },
  ...moreThreeMonthStarts,
};

/** Keep legacy generic rows in the audit, but show the reviewed distance programme. */
export function isReviewedFixturePlaceholder(slug: string, date: string, distance: string) {
  if (isThirdUrgentPlaceholder(slug, date, distance)) return true;
  if (isNextUrgentPlaceholder(slug, date, distance)) return true;
  if (isUrgentReviewedPlaceholder(slug, date, distance)) return true;
  // The federation import is the same half marathon, not another race distance.
  if (
    slug === "wa-32-hella-hamburg-half-marathon-7238156" &&
    date === "2026-10-25" &&
    distance === "Other"
  )
    return true;
  // These imported 50km Ultra placeholders are superseded by the opened
  // organiser programmes: Beyond NCL 25/55km and The Priory 100km.
  if (
    distance === "Ultra" &&
    ((slug === "beyond-ncl" && date === "2027-04-24") ||
      (slug === "the-priory-100k" && date === "2027-05-29"))
  )
    return true;
  return (
    distance === "Other" &&
    (Object.hasOwn(countyExpansion.details, `${slug}|${date}`) ||
      Object.hasOwn(countyExpansionMore.details, `${slug}|${date}`))
  );
}

// Apply this exact-edition review without replacing other checked distances.
for (const [key, reviewed] of Object.entries(batch6ThreeMonthStarts)) {
  const existing = FIXTURE_DETAILS[key];
  FIXTURE_DETAILS[key] = {
    ...existing,
    ...reviewed,
    starts: { ...existing?.starts, ...reviewed.starts },
  };
}

/** Explicit start of a confirmed multi-distance programme; all other events keep their fallback. */
export function checkedFixtureEventStart(
  slug: string,
  date: string | undefined,
  fallback: string | null,
) {
  return (date && FIXTURE_DETAILS[`${slug}|${date}`]?.eventStartTime) || fallback;
}

/** Never carry checked starts across dates; an explicit conflict also hides stored times. */
export function checkedFixtureStart(
  slug: string,
  date: string,
  distanceCodes: string,
  fallback: string | null,
): string | null {
  const detail = FIXTURE_DETAILS[`${slug}|${date}`];
  if (!detail) return fallback;
  const starts = distanceCodes.split(" · ").map((distance) => detail.starts[distance.trim()]);
  if (starts.some((start) => start?.time === null)) return null;
  if (starts.every((start) => start?.time)) {
    return starts.map((start) => start.time!).sort()[0] ?? fallback;
  }
  return fallback;
}

/** A published window/estimate is distinct from an exact machine-readable start. */
export function checkedFixtureStartLabel(
  slug: string,
  date: string | null,
  distanceCodes: string | null,
): string | null {
  if (!date || !distanceCodes) return null;
  const detail = FIXTURE_DETAILS[`${slug}|${date}`];
  if (!detail) return null;
  const codes = distanceCodes
    .split(" · ")
    .map((code) => code.trim())
    .filter((code) => !isReviewedFixturePlaceholder(slug, date, code));
  const labels = codes.map((code) => detail.starts[code]?.label ?? null);
  if (labels.every((label) => label === labels[0])) return labels[0] ?? null;
  if (labels.some(Boolean))
    return codes
      .map((code, index) => `${code}: ${labels[index] ?? "see distance programme"}`)
      .join("; ");
  return null;
}
