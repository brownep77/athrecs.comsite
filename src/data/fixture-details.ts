/** Edition-specific organiser checks. Never carry a start time into another edition. */
export type FixtureDetail = {
  place?: { town?: string; city?: string; county?: string; state?: string };
  summary: string;
  timeZone: string;
  sourceUrl: string;
  checkedAt: string;
  starts: Record<string, { time: string; note?: string }>;
};

export const FIXTURE_DETAILS: Record<string, FixtureDetail> = {
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
    summary: "Timed 69 km and 89 km road rides from SPARC, with coastal roads and climbs towards Chamarel.",
    timeZone: "Indian/Mauritius",
    sourceUrl: "https://mauritiusrace.com/journee/route/",
    checkedAt: "2026-10-07",
    starts: { "69K": { time: "07:00" }, "89K": { time: "07:00" } },
  },
  "la-grande-traversee-de-l-ouest|2026-11-01": {
    summary: "A 10 km open-water swim between Le Morne and La Preneuse, with solo and relay formats.",
    timeZone: "Indian/Mauritius",
    sourceUrl: "https://ipn.sportevents.mu/en/events/72/la-grande-traversee-de-louest",
    checkedAt: "2026-10-07",
    starts: { "10K": { time: "05:30" } },
  },
  "la-iguanera-maraton-mtb|2026-11-15": {
    place: { city: "San Pedro Pochutla", state: "Oaxaca" },
    summary: "Mountain-bike racing in Pochutla, with competitive categories and a recreational 25 km ride.",
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
