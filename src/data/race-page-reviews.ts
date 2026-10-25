import type { RaceGuide } from "./runrecs-race-guides.ts";

/** A single, edition-scoped search/page example. Source review: 25 October 2026. */
const hamburg = {
  slug: "wa-32-hella-hamburg-half-marathon-7238156",
  date: "2026-10-25",
  title: "hella Hamburg Half Marathon 2026 | Date & Entry | AthRecs",
  description:
    "hella Hamburg Half Marathon on Sunday 25 October 2026. First wave 09:30 CET; starts on Reeperbahn. See wave times, race-day details and official entry information.",
  biography: [
    "The hella Hamburg Half Marathon takes place on Sunday 25 October 2026 in Hamburg, Germany. Organised by BMS Die Laufgesellschaft mbH, the road race covers 21.0975 km.",
    "The first wave starts at 09:30 CET (UTC+1) on Reeperbahn / Glacischaussee. Later waves start every 15 minutes until 11:00; follow your assigned start block. The finish is on Karolinenstraße by Hamburg Messe.",
  ],
  organiser: "BMS Die Laufgesellschaft mbH",
  website: "https://www.hamburg-halbmarathon.com/information/",
  utcOffset: "+01:00",
  startLabel: "First wave 09:30 CET (UTC+1)",
  venue: {
    name: "Reeperbahn / Glacischaussee — half-marathon start",
    streetAddress: "Reeperbahn / Glacischaussee",
    countryCode: "DE",
  },
  guide: {
    slugs: ["wa-32-hella-hamburg-half-marathon-7238156"],
    date: "2026-10-25",
    checked: "2026-10-25",
    website:
      "https://www.hamburg-halbmarathon.de/2026/10/12/den-renntag-fest-im-blick-alle-infos-zur-teilnahme/",
    starts: { Half: "09:30" },
    venue: "Reeperbahn / Glacischaussee (race start), Hamburg",
    facts: [
      {
        label: "Start",
        text: "Wave A starts at 09:30, B at 09:45, C at 10:00, D at 10:15, E at 10:30, F at 10:45 and G at 11:00. Times are CET (UTC+1). Follow the block in your organiser email; clocks change on race morning.",
      },
      {
        label: "Finish",
        text: "Karolinenstraße by Hamburg Messe. The start and finish are in different places.",
      },
      {
        label: "Race headquarters",
        text: "Hamburg Messe, Eingang Mitte (Messeplatz), near the television tower. Race-number collection on Sunday is 08:00–10:00. Bag drop is in Hall A1.",
      },
      {
        label: "Arrival",
        text: "The start is about 1.3 km from race headquarters. The organiser recommends public transport because parking is limited; U2 Messehallen is about 450 m from headquarters.",
      },
    ],
  } as RaceGuide,
};

export function racePageReviewFor(slug?: string | null, date?: string | null) {
  return slug === hamburg.slug && date === hamburg.date ? hamburg : undefined;
}

type ReviewedPage = {
  event: {
    slug: string;
    organiser?: string | null;
    website?: string | null;
    description?: string | null;
  };
  upcoming: Array<{
    event_date: string;
    distance_code: string;
    status: string;
  }>;
};

/** Public page projection only; keep stored records and their source evidence intact. */
export function reviewedRacePage<T extends ReviewedPage>(data: T): T {
  const next = data.upcoming.find((edition) => edition.status !== "Cancelled");
  const review = racePageReviewFor(data.event.slug, next?.event_date);
  if (!review) return data;
  const hasHalf = data.upcoming.some(
    (edition) =>
      edition.event_date === review.date &&
      edition.distance_code === "Half" &&
      edition.status !== "Cancelled",
  );
  if (!hasHalf) return data;
  return {
    ...data,
    event: {
      ...data.event,
      sport: "Running",
      surface: "Road",
      organiser: review.organiser,
      website: review.website,
      description: review.description,
    },
  };
}
