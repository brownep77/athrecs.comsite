/** Edition-specific official calendar, reviewed 30 October 2026. */
export const DIAMOND_LEAGUE_CALENDAR_SOURCE =
  "https://www.diamondleague.com/wanda-diamond-league-publishes-2027-calendar/";
export const DIAMOND_LEAGUE_WATCH_URL = "https://www.diamondleague.com/where-to-watch/";
export const DIAMOND_LEAGUE_CHECKED_AT = "2026-10-30";

export type DiamondLeagueMeeting = {
  id: string;
  slug: string;
  publicSlug?: string;
  name: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  note?: string;
  sourceUrl: string;
};

export const DIAMOND_LEAGUE_2027: readonly DiamondLeagueMeeting[] = [
  ["doha", "wa-doha-meeting-7220873", "Doha Meeting", "Doha", "Qatar", "2027-05-07", "Asia/Qatar"],
  [
    "shanghai",
    "wa-wanda-diamond-league-shanghai-7220874",
    "Shanghai / Keqiao",
    "Shanghai / Keqiao",
    "China",
    "2027-05-15",
    "Asia/Shanghai",
  ],
  [
    "xiamen",
    "wa-wanda-diamond-league-xiamen-7220875",
    "Xiamen Diamond League",
    "Xiamen",
    "China",
    "2027-05-22",
    "Asia/Shanghai",
  ],
  ["rome", "wa-golden-gala-7220877", "Golden Gala", "Rome", "Italy", "2027-05-27", "Europe/Rome"],
  [
    "rabat",
    "wa-meeting-international-mohammed-vi-d-athletisme-de-rabat-7220876",
    "Meeting Mohammed VI",
    "Rabat",
    "Morocco",
    "2027-05-30",
    "Africa/Casablanca",
  ],
  [
    "oslo",
    "wa-olso-bislett-games-7220879",
    "Bislett Games",
    "Oslo",
    "Norway",
    "2027-06-03",
    "Europe/Oslo",
  ],
  [
    "stockholm",
    "wa-bauhaus-galan-7220880",
    "BAUHAUS-Galan",
    "Stockholm",
    "Sweden",
    "2027-06-06",
    "Europe/Stockholm",
  ],
  [
    "paris",
    "wa-meeting-de-paris-7220881",
    "Meeting de Paris",
    "Paris",
    "France",
    "2027-06-25",
    "Europe/Paris",
  ],
  [
    "eugene",
    "wa-prefontaine-classic-7220878",
    "Prefontaine Classic",
    "Eugene",
    "United States",
    "2027-07-03",
    "America/Los_Angeles",
  ],
  [
    "monaco",
    "wa-meeting-international-d-athletisme-herculis-ebs-7220882",
    "Herculis EBS",
    "Monaco",
    "Monaco",
    "2027-07-09",
    "Europe/Monaco",
  ],
  [
    "lausanne",
    "wa-athletissima-lausanne-7220885",
    "Athletissima",
    "Lausanne",
    "Switzerland",
    "2027-07-13",
    "Europe/Zurich",
  ],
  [
    "london",
    "wa-london-athletics-meet-7220883",
    "London Athletics Meet",
    "London",
    "England",
    "2027-07-17",
    "Europe/London",
  ],
  [
    "silesia",
    "wa-silesia-kamila-skolimowska-memorial-7220884",
    "Kamila Skolimowska Memorial",
    "Silesia",
    "Poland",
    "2027-08-14",
    "Europe/Warsaw",
  ],
  [
    "brussels",
    "wa-memorial-van-damme-7220886",
    "Memorial Van Damme",
    "Brussels",
    "Belgium",
    "2027-08-20",
    "Europe/Brussels",
  ],
  [
    "zurich",
    "wa-weltklasse-zurich-7220887",
    "Weltklasse Zürich · Final",
    "Zurich",
    "Switzerland",
    "2027-08-25",
    "Europe/Zurich",
  ],
].map(([id, slug, name, city, country, startDate, timeZone]) => ({
  id,
  slug,
  name,
  city,
  country,
  startDate,
  timeZone,
  publicSlug:
    id === "monaco"
      ? "wa-meeting-international-d-athl-tisme-herculis-ebs-7220882"
      : id === "zurich"
        ? "wa-weltklasse-z-rich-7220887"
        : undefined,
  endDate: id === "zurich" ? "2027-08-26" : id === "silesia" ? "2027-08-15" : startDate,
  note: id === "silesia" ? "14 August: city event. 15 August: main meeting." : undefined,
  sourceUrl: id === "silesia" ? "https://memorialkamili.pl/en/" : DIAMOND_LEAGUE_CALENDAR_SOURCE,
}));

export type DiamondLeagueBroadcaster = {
  country: string;
  broadcaster: string;
  status: "rights-confirmed" | "previous-season" | "deal-announced";
  detail: string;
  sourceUrl: string;
};

const distribution2026 =
  "https://www.infront.sport/news/sports-media-rights/infront-strengthens-wanda-diamond-league-global-broadcast-network-through-spate-of-new-agreement";
const agreements2025 =
  "https://www.infront.sport/news/sports-media-rights/infront-strike-key-broadcast-agreements-for-wanda-diamond-league-from-2025";

// Prior-season distribution is useful context, never a confirmed 2027 TV listing.
// No exact TV channel, broadcast clock or unrestricted YouTube access is inferred.
export const DIAMOND_LEAGUE_BROADCASTERS: readonly DiamondLeagueBroadcaster[] = [
  ...["England", "Scotland", "Wales", "Northern Ireland"].map(
    (country): DiamondLeagueBroadcaster => ({
      country,
      broadcaster: "BBC",
      status: "rights-confirmed",
      detail: "UK rights cover 2027. Channel and broadcast time to be announced.",
      sourceUrl: "https://www.bbc.co.uk/sport/athletics/articles/c62dnrjpg5yo",
    }),
  ),
  {
    country: "United States",
    broadcaster: "FloTrack",
    status: "deal-announced" as const,
    detail:
      "Multi-year streaming deal from 2025 excludes Eugene. Subscription required; 2027 listings unconfirmed.",
    sourceUrl:
      "https://www.flotrack.org/articles/12428819-the-diamond-league-is-streaming-on-flotrack-starting-in-2025",
  },
  ...[
    ["Brazil", "Globo"],
    ["Canada", "CBC"],
    ["China", "CCTV"],
    ["Denmark", "TV2"],
    ["France", "L’Équipe"],
    ["Indonesia", "SPOTV"],
    ["Macau", "SPOTV"],
    ["Norway", "NRK"],
    ["Philippines", "SPOTV"],
    ["Singapore", "SPOTV"],
    ["Sweden", "SVT"],
  ].map(([country, broadcaster]): DiamondLeagueBroadcaster => ({
    country,
    broadcaster,
    status: "previous-season",
    detail: "2026 broadcaster; 2027 coverage not yet confirmed.",
    sourceUrl: distribution2026,
  })),
  ...[
    [
      "Germany",
      "ARD / ZDF",
      "Deal announced from 2025: up to five live meetings plus highlights. 2027 selection unconfirmed.",
    ],
    ["Hungary", "MTVA"],
    ["Latvia", "LTV"],
    ["Netherlands", "Ziggo Sport"],
    ["Poland", "Polsat"],
    ["Portugal", "Sport TV"],
    ["Russia", "Match TV"],
    ["Switzerland", "SRG"],
  ].map(([country, broadcaster, detail]): DiamondLeagueBroadcaster => ({
    country,
    broadcaster,
    status: "deal-announced",
    detail: detail ?? "Agreement announced from 2025; 2027 meeting coverage unconfirmed.",
    sourceUrl: agreements2025,
  })),
].sort((a, b) => a.country.localeCompare(b.country));

export function diamondLeagueCoverage(country: string, meetingId?: string) {
  const row = DIAMOND_LEAGUE_BROADCASTERS.find((item) => item.country === country);
  if (!row) return undefined;
  if (country === "United States" && meetingId === "eugene") {
    return {
      ...row,
      broadcaster: "2027 broadcaster not yet confirmed",
      status: "deal-announced" as const,
      detail:
        "Eugene is excluded from FloTrack’s announced US deal. Check the official guide for this meeting.",
    };
  }
  return row;
}

export function diamondLeagueMeetingForSlug(slug: string) {
  return DIAMOND_LEAGUE_2027.find(
    (meeting) => meeting.slug === slug || meeting.publicSlug === slug,
  );
}
