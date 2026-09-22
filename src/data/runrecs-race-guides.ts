/** Edition-specific practical facts checked against the linked organisers on 22 September 2026.
 * These supplement missing catalogue fields; they never replace a conflicting stored value.
 */
export type RaceGuide = {
  slugs?: string[];
  website: string;
  date: string;
  checked: string;
  starts: Record<string, string>;
  venue: string;
  postcode?: string;
  facts: Array<{ label: string; text: string }>;
  links?: Array<{ label: string; url: string }>;
};

export const runRecsRaceGuides: RaceGuide[] = [
  {
    slugs: ["bure-valley-10-miles"],
    website: "https://totalracetiming.co.uk/race/695",
    date: "2026-09-27",
    checked: "2026-09-22",
    starts: { "10mi": "09:30" },
    venue: "Banningham village green, Norfolk",
    facts: [
      {
        label: "Course",
        text: "A 10-mile route on open country roads around Banningham, finishing on the village green opposite the Banningham Crown.",
      },
      { label: "Time limit", text: "Two-hour cut-off. Minimum age 16." },
      {
        label: "Race rules",
        text: "Headphones, including bone-conduction models, are not permitted. No dogs, following cycles or wheeled vehicles; the course is not suitable for wheelchair athletes.",
      },
    ],
  },
  {
    slugs: ["cawston-trail"],
    website: "https://totalracetiming.co.uk/race/660",
    date: "2026-10-04",
    checked: "2026-09-22",
    starts: { "5mi": "10:00" },
    venue: "Cawston Park estate, Norfolk",
    postcode: "NR10 4JD",
    facts: [
      {
        label: "Course",
        text: "Five miles on forest paths within Cawston Park. Minimum age 15; race briefing at the start five minutes before the race.",
      },
      {
        label: "Arrival and parking",
        text: "Registration opens at 08:45. The unsigned entrance is on the B1145 between Cawston and Aylsham (what3words: insisting.oasis.published). On-site parking costs £2, cash only.",
      },
      {
        label: "Facilities",
        text: "Toilets at HQ, but no changing facilities or bag drop. Water at approximately halfway and at the finish; refreshments for sale.",
      },
      {
        label: "Race rules",
        text: "No headphones, including bone-conduction models. Dogs, buggies and wheelchairs are not permitted.",
      },
    ],
  },
  {
    slugs: ["rugeley-10-mile-road-race"],
    website: "https://www.entrycentral.com/Rugeley-10-miler",
    date: "2027-02-14",
    checked: "2026-09-22",
    starts: { "10mi": "10:00" },
    venue: "Redbrook Hayes School, Rugeley",
    postcode: "WS15 1AU",
    facts: [
      {
        label: "Start and finish",
        text: "Registration and finish are at the school. The start on Brereton Road is a 5–10 minute walk away.",
      },
      {
        label: "Parking",
        text: "No participant parking at race HQ. Use the organiser’s designated car parks; marshals are present 08:00–09:15. Car sharing is encouraged.",
      },
      {
        label: "Facilities",
        text: "Toilets, bag drop and refreshments at HQ; water stations at 3.5 and 7 miles.",
      },
      {
        label: "Course",
        text: "The start road is closed temporarily; the remainder uses open roads. Follow marshals and watch for traffic.",
      },
    ],
  },
  {
    slugs: ["shakespeare-marathon-half"],
    website: "https://www.runthrough.co.uk/event/shakespeare-marathon-half-marathon-april-2027",
    date: "2027-04-25",
    checked: "2026-09-22",
    starts: { Half: "09:00", Marathon: "09:00" },
    venue: "The Recreation Ground, Stratford-upon-Avon",
    postcode: "CV37 7LS",
    facts: [
      {
        label: "Course",
        text: "One lap for the half marathon and two for the marathon, including roads and the compacted Stratford Greenway. Both finish at the Recreation Ground.",
      },
      {
        label: "Included",
        text: "Chip timing, finisher medal, event photographs and finish refreshments. A T-shirt is an optional extra.",
      },
      {
        label: "Race-day schedule",
        text: "Both distances start at 09:00; the advertised event finish is 15:00. Check the final race instructions for arrival details.",
      },
    ],
  },
  {
    website: "https://www.runbournemouth.com/halfmarathon",
    date: "2026-10-11",
    checked: "2026-09-22",
    starts: { Half: "11:00" },
    venue: "Hengistbury Head, Bournemouth",
    facts: [
      {
        label: "Route",
        text: "The coastal half marathon starts at Hengistbury Head and takes in Boscombe and Bournemouth Piers. The finish is at Bournemouth Pier Approach.",
      },
    ],
    links: [
      { label: "Course map", url: "https://www.runbournemouth.com/halfmarathon/route-map" },
      {
        label: "Event information",
        url: "https://www.runbournemouth.com/halfmarathon/event-information",
      },
      {
        label: "Transport and event buses",
        url: "https://www.runbournemouth.com/halfmarathon/transport-info",
      },
    ],
  },
  {
    website: "https://www.runbournemouth.com/supersonic10k",
    date: "2026-10-11",
    checked: "2026-09-22",
    starts: { "10K": "09:00" },
    venue: "Bournemouth seafront",
    facts: [{ label: "Course", text: "A coastal 10K taking in Boscombe and Bournemouth Piers." }],
  },
  {
    website: "https://www.runbournemouth.com/supernova5k",
    date: "2026-10-10",
    checked: "2026-09-22",
    starts: { "5K": "19:00" },
    venue: "Bournemouth Promenade",
    facts: [
      {
        label: "Start and finish",
        text: "Starts on Bournemouth Promenade at dusk, includes Bournemouth Pier and finishes near the event hub in the Lower Gardens.",
      },
    ],
  },
  {
    website: "https://www.runbournemouth.com/junior2k",
    date: "2026-10-10",
    checked: "2026-09-22",
    starts: { "2K": "14:00" },
    venue: "Bournemouth Promenade",
    facts: [
      {
        label: "Junior race",
        text: "For ages 9–12. Starts on the promenade and finishes near the event hub in the Lower Gardens.",
      },
    ],
  },
  {
    website: "https://www.runbournemouth.com/junior1-5k",
    date: "2026-10-10",
    checked: "2026-09-22",
    starts: { "1.5K": "14:45" },
    venue: "Bournemouth Promenade",
    facts: [
      {
        label: "Junior race",
        text: "For ages 6–8. Starts on the promenade and finishes near the event hub in the Lower Gardens.",
      },
    ],
  },
  {
    website: "https://www.runbournemouth.com/kidskilometre",
    date: "2026-10-10",
    checked: "2026-09-22",
    starts: { "1K": "15:30" },
    venue: "Bournemouth seafront",
    facts: [
      {
        label: "Children’s race",
        text: "For ages 3–6, including Bournemouth Pier. An adult must accompany each child; accompanying adults do not need an entry.",
      },
    ],
  },
];

function pageKey(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, "").toLowerCase()}${url.pathname.replace(/\/$/, "").toLowerCase()}`;
  } catch {
    return "";
  }
}

export function raceGuideFor(
  event: { slug: string; website?: string | null },
  date?: string | null,
) {
  if (!date) return undefined;
  const key = pageKey(event.website ?? "");
  return runRecsRaceGuides.find(
    (guide) =>
      guide.date === date &&
      (guide.slugs?.includes(event.slug) || (key && key === pageKey(guide.website))),
  );
}

export function supplementedStart(
  event: { slug: string; website?: string | null },
  date: string | null,
  distance: string | null,
  stored: string | null,
) {
  if (stored?.trim()) return stored;
  return (distance && raceGuideFor(event, date)?.starts[distance]) || null;
}
