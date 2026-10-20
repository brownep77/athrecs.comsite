/** Edition-specific organiser checks. Never carry a start time into another edition. */
export type FixtureDetail = {
  place?: { town?: string; city?: string; county?: string; state?: string };
  summary: string;
  timeZone: string;
  sourceUrl: string;
  checkedAt: string;
  starts: Record<string, { time: string | null; note?: string }>;
};

export const FIXTURE_DETAILS: Record<string, FixtureDetail> = {
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
    checkedAt: "2026-10-20",
    starts: {
      "5K": {
        time: null,
        note: "Junior start 10:00. Adult times conflict: 10:15 in the programme and 10:30 in the entry table; confirm with the organiser.",
      },
      "10K": {
        time: null,
        note: "Adult times conflict: 10:15 in the programme and 10:30 in the entry table; confirm with the organiser.",
      },
    },
  },
  "marriotts-way-races|2027-02-21": {
    summary:
      "Point-to-point marathon and half-marathon trail routes along Marriott’s Way, finishing in Aylsham.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/693",
    checkedAt: "2026-10-20",
    starts: {
      Marathon: {
        time: null,
        note: "Programme says 08:30; entry table says 09:00. Start time awaits organiser clarification.",
      },
      Half: {
        time: null,
        note: "Programme says 10:00; entry table says 10:30. Start time awaits organiser clarification.",
      },
    },
  },
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
};

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
