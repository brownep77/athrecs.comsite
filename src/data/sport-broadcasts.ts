import type { SportPage } from "../lib/athrecs/sport-pages";

export type SportBroadcast = {
  id: string;
  sport: SportPage["sport"];
  surface?: string;
  name: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  location: string;
  broadcaster: string;
  availability: string;
  watchUrl: string;
  sourceUrl: string;
  scheduleSourceUrl?: string;
  checkedAt: string;
  eventStart?: string;
};

const swimmingSource =
  "https://www.worldaquatics.com/news/4579883/where-to-watch-world-aquatics-swimming-world-cup-2026";
const triathlonSource =
  "https://triathlon.org/news/new-triathlonlive-season-ready-to-roll-bumper-march-of-action-ahead";

// Dates and coverage are checked against the organiser/governing body.
// Race starts are separate from broadcast start times; never infer the latter.
export const SPORT_BROADCASTS: readonly SportBroadcast[] = [
  {
    id: "berlin-marathon-2026",
    sport: "Running",
    surface: "Road",
    name: "BMW Berlin Marathon",
    startDate: "2026-09-27",
    endDate: "2026-09-27",
    timeZone: "Europe/Berlin",
    location: "Berlin, Germany",
    broadcaster: "RTL / RTL+",
    availability: "Germany; see the organiser’s guide for international coverage.",
    watchUrl: "https://www.bmw-berlin-marathon.com/en/your-race/race-day-for-spectators",
    sourceUrl: "https://www.bmw-berlin-marathon.com/en/media-section",
    checkedAt: "2026-09-26",
  },
  {
    id: "pontevedra-women-2026",
    sport: "Triathlon",
    name: "World Triathlon Finals — elite women",
    startDate: "2026-09-26",
    endDate: "2026-09-26",
    eventStart: "2026-09-26T16:00:00Z",
    timeZone: "Europe/Madrid",
    location: "Pontevedra, Spain",
    broadcaster: "TriathlonLive",
    availability: "Online / TV app; subscription or race pass. Check availability in your country.",
    watchUrl: "https://www.triathlonlive.io/",
    sourceUrl: triathlonSource,
    scheduleSourceUrl: "https://triathlon.org/timing/650099",
    checkedAt: "2026-09-26",
  },
  {
    id: "pontevedra-men-2026",
    sport: "Triathlon",
    name: "World Triathlon Finals — elite men",
    startDate: "2026-09-27",
    endDate: "2026-09-27",
    eventStart: "2026-09-27T16:00:00Z",
    timeZone: "Europe/Madrid",
    location: "Pontevedra, Spain",
    broadcaster: "TriathlonLive",
    availability: "Online / TV app; subscription or race pass. Check availability in your country.",
    watchUrl: "https://www.triathlonlive.io/",
    sourceUrl: triathlonSource,
    scheduleSourceUrl: "https://triathlon.org/timing/650099",
    checkedAt: "2026-09-26",
  },
  {
    id: "uci-road-worlds-2026",
    sport: "Cycling",
    surface: "Road",
    name: "UCI Road World Championships",
    startDate: "2026-09-20",
    endDate: "2026-09-27",
    timeZone: "America/Toronto",
    location: "Montréal, Canada",
    broadcaster: "TV & streaming partners by country",
    availability: "Use the UCI guide to find your broadcaster and session schedule.",
    watchUrl:
      "https://www.uci.org/pressrelease/where-to-watch-the-2026-uci-road-world-championships/1HHCW3cJYj4gE6UM70aqvU",
    sourceUrl:
      "https://www.uci.org/pressrelease/where-to-watch-the-2026-uci-road-world-championships/1HHCW3cJYj4gE6UM70aqvU",
    scheduleSourceUrl:
      "https://assets.ctfassets.net/761l7gh5x5an/wmgNMqwdpy020sBstc8f1/dda3011dfa9b3194a75ceb3e80c4810d/2026_RWC_SPORT_COMPETITION_SCHEDULE_FINAL_ENG_03_DEC_2025.pdf",
    checkedAt: "2026-09-26",
  },
  ...[
    {
      id: "baku",
      location: "Baku, Azerbaijan",
      startDate: "2026-10-01",
      endDate: "2026-10-03",
      timeZone: "Asia/Baku",
    },
    {
      id: "tashkent",
      location: "Tashkent, Uzbekistan",
      startDate: "2026-10-08",
      endDate: "2026-10-10",
      timeZone: "Asia/Tashkent",
    },
    {
      id: "astana",
      location: "Astana, Kazakhstan",
      startDate: "2026-10-15",
      endDate: "2026-10-17",
      timeZone: "Asia/Almaty",
    },
  ].map((stop): SportBroadcast => ({
    ...stop,
    id: `swimming-world-cup-${stop.id}-2026`,
    sport: "Swimming",
    name: `Swimming World Cup — ${stop.location.split(",")[0]}`,
    broadcaster: "Eurovision Sport / regional broadcasters",
    availability: "UK & most of Europe: Eurovision Sport. Other countries: see the official guide.",
    watchUrl: swimmingSource,
    sourceUrl: swimmingSource,
    checkedAt: "2026-09-26",
  })),
];

export function upcomingBroadcasts(page: SportPage, now = new Date()) {
  return SPORT_BROADCASTS.filter((item) => {
    const localDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: item.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    return (
      item.sport === page.sport &&
      (!page.surfaces || (page.surfaces as readonly string[]).includes(item.surface ?? "")) &&
      item.endDate >= localDate
    );
  }).sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id));
}
