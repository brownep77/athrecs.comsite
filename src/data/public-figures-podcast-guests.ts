import type { AthleteSeed } from "./types";

// Podcast guests without an existing AthRecs profile (Podcasts section, October 2026).
// Profiles only: no race results are created here. Every achievement cites the page that
// states it; facts that sources disagree on (e.g. honours counts, nationality) are omitted.
// Minors are deliberately excluded.
const CHECKED_AT = "2026-10-30";

const SOURCES = {
  neitaWa: "https://worldathletics.org/athletes/great-britain-&-n.i./daryll-neita-14476603",
  neitaTeamGb: "https://www.teamgb.com/athlete/daryll-neita/3kTRnX0ayKwzFZ25NPSDCI",
  neitaOlympics: "https://www.olympics.com/en/athletes/daryll-neita",
  mebWa: "https://worldathletics.org/athletes/united-states/mebrahtom-keflezighi-14242705",
  mebNyrr: "https://www.nyrr.org/hall-of-fame/meb-keflezighi",
  mebBoston:
    "https://worldathletics.org/competitions/world-athletics-label-road-races/news/boston-marathon-2014-jeptoo-keflezighi",
  mebOlympics: "https://www.olympics.com/en/athletes/mebrahtom-keflezighi",
  ritzOlympics: "https://www.olympics.com/en/athletes/dathan-ritzenhein",
  ritzTeamUsa: "https://www.teamusa.com/profiles/dathan-ritzenhein",
  ritzWaNews: "https://worldathletics.org/news/news/ritzenhein-set-for-new-york-return",
  ritzOn: "https://www.on.com/en-us/explore/athletes/dathan-ritzenhein",
  goodgeSbs:
    "https://www.sbs.com.au/news/article/william-goodge-becomes-fastest-runner-to-cross-australia-on-foot/dx2p8pjx7",
  goodgeWlos:
    "https://wlos.com/news/local/story/marathon-america-cancer-awareness-record-asheville-william-goodge-north-carolina-states-50-grief-hawaii-australia",
  goodgeTribune:
    "https://tribune.net.ph/2026/10/24/running-50-marathons-in-50-us-states-in-24-days",
  brauerSailWorld:
    "https://www.sail-world.com/news/272381/Cole-Brauer-finishes-the-Global-Solo-Challenge",
  brauerStar: "https://easthamptonstar.com/sports-villages/2024314/cole-brauer-has-made-her-mark",
  bradshawHof: "https://www.profootballhof.com/players/terry-bradshaw",
  bradshawPfr: "https://www.pro-football-reference.com/players/B/BradTe00.htm",
  kaepernickPfr: "https://www.pro-football-reference.com/players/K/KaepCo00.htm",
  kaepernickBritannica: "https://www.britannica.com/biography/Colin-Kaepernick",
} as const;

const base = {
  club_slug: "unattached",
  source_club_name: "Unattached",
  profile_type: "Public figure" as const,
  profile_source_checked_at: CHECKED_AT,
};

export const podcastGuestAthletes: AthleteSeed[] = [
  {
    ...base,
    slug: "daryll-neita",
    display_name: "Daryll Neita",
    given_name: "Daryll",
    family_name: "Neita",
    gender: "F",
    city: "",
    county: "England",
    country: "United Kingdom",
    nationality: "British",
    nation: "Great Britain & N.I.",
    continent: "Europe",
    commonwealth: true,
    bio: "British sprinter specialising in the 100 and 200 metres, and a three-time Olympic 4x100 metres relay medallist.",
    preferred_distance: "100 metres",
    athrecs_id: "ATH-GB-PF-0061",
    source_url: SOURCES.neitaWa,
    profile_roles: ["Professional athlete", "100 metres", "200 metres", "4x100 metres relay"],
    profile_links: [
      { label: "World Athletics records & results", url: SOURCES.neitaWa },
      { label: "Team GB profile", url: SOURCES.neitaTeamGb },
      { label: "Olympics.com profile", url: SOURCES.neitaOlympics },
    ],
    notable_achievements: [
      {
        year: 2016,
        title: "Olympic 4x100m bronze, Rio",
        detail: "Member of the British 4x100 metres relay squad that won bronze at Rio 2016.",
        source_url: SOURCES.neitaTeamGb,
      },
      {
        year: 2021,
        title: "Olympic 4x100m bronze, Tokyo",
        detail:
          "Won 4x100 metres relay bronze at Tokyo 2020, with the quartet setting a British record of 41.55.",
        source_url: SOURCES.neitaTeamGb,
      },
      {
        year: 2024,
        title: "Olympic 4x100m silver, Paris",
        detail:
          "Won 4x100 metres relay silver at Paris 2024 and finished fourth in the individual 100 metres final.",
        source_url: SOURCES.neitaTeamGb,
      },
    ],
  },
  {
    ...base,
    slug: "meb-keflezighi",
    display_name: "Meb Keflezighi",
    given_name: "Mebrahtom",
    family_name: "Keflezighi",
    aliases: ["Mebrahtom Keflezighi"],
    gender: "M",
    city: "",
    county: "United States",
    country: "United States",
    nationality: "American",
    nation: "United States",
    continent: "North America",
    bio: "Retired American distance runner and four-time Olympian: Olympic marathon silver medallist in 2004 and winner of the New York City and Boston Marathons.",
    preferred_distance: "Marathon",
    athrecs_id: "ATH-US-PF-0062",
    source_url: SOURCES.mebWa,
    profile_roles: ["Professional athlete (retired)", "Marathon", "10,000 metres"],
    profile_links: [
      { label: "World Athletics records & results", url: SOURCES.mebWa },
      { label: "NYRR Hall of Fame", url: SOURCES.mebNyrr },
      { label: "Olympics.com profile", url: SOURCES.mebOlympics },
    ],
    notable_achievements: [
      {
        year: 2004,
        title: "Olympic marathon silver, Athens",
        detail: "Finished second in the Athens 2004 Olympic marathon in 2:11:29.",
        source_url: SOURCES.mebNyrr,
      },
      {
        year: 2009,
        title: "New York City Marathon champion",
        detail: "Won the 2009 New York City Marathon in 2:09:15.",
        source_url: SOURCES.mebNyrr,
      },
      {
        year: 2014,
        title: "Boston Marathon champion",
        detail:
          "Won the 2014 Boston Marathon in 2:08:37, the first US man to win Boston since 1983.",
        source_url: SOURCES.mebBoston,
      },
    ],
  },
  {
    ...base,
    slug: "dathan-ritzenhein",
    display_name: "Dathan Ritzenhein",
    given_name: "Dathan",
    family_name: "Ritzenhein",
    gender: "M",
    city: "",
    county: "United States",
    country: "United States",
    nationality: "American",
    nation: "United States",
    continent: "North America",
    bio: "Three-time US Olympian in distance running and head coach of On Athletics Club Global in Boulder, Colorado.",
    preferred_distance: "Marathon",
    athrecs_id: "ATH-US-PF-0063",
    source_url: SOURCES.ritzOlympics,
    profile_roles: ["Coach", "Former professional athlete", "Marathon", "10,000 metres"],
    profile_links: [
      { label: "Olympics.com profile", url: SOURCES.ritzOlympics },
      { label: "Team USA profile", url: SOURCES.ritzTeamUsa },
      { label: "On Athletics Club coach profile", url: SOURCES.ritzOn },
    ],
    notable_achievements: [
      {
        year: 2003,
        title: "NCAA Cross Country champion",
        detail:
          "Won the NCAA cross country title with the University of Colorado during an unbeaten 2003 season.",
        source_url: SOURCES.ritzTeamUsa,
      },
      {
        year: 2008,
        title: "Olympic marathon, Beijing",
        detail:
          "Placed second at the US Olympic Trials marathon, then ninth in the Beijing Olympic marathon.",
        source_url: SOURCES.ritzWaNews,
      },
      {
        year: 2009,
        title: "World Half Marathon bronze",
        detail: "Won bronze at the World Half Marathon Championships in 60 minutes.",
        source_url: SOURCES.ritzWaNews,
      },
    ],
  },
  {
    ...base,
    slug: "william-goodge",
    display_name: "William Goodge",
    given_name: "William",
    family_name: "Goodge",
    aliases: ["Will Goodge"],
    gender: "M",
    city: "",
    county: "Bedfordshire",
    country: "England",
    nationality: "British",
    nation: "England",
    continent: "Europe",
    commonwealth: true,
    bio: "British ultra-endurance runner who took up running after losing his mother to cancer and raises money for cancer charities through multi-week runs across the USA and Australia.",
    preferred_distance: "Marathon",
    athrecs_id: "ATH-GB-PF-0064",
    notes:
      "Challenge records are shown as reported by the cited outlets; no Guinness ratification was confirmed when this profile was checked.",
    source_url: SOURCES.goodgeSbs,
    profile_roles: ["Ultra runner", "Charity fundraiser"],
    profile_links: [
      { label: "Run across Australia report", url: SOURCES.goodgeSbs },
      { label: "Mission America report", url: SOURCES.goodgeWlos },
    ],
    notable_achievements: [
      {
        year: 2025,
        title: "Run across Australia",
        detail:
          "Ran about 3,800 km from Perth to Sydney between 15 April and 19 May 2025, reported as a 35-day crossing.",
        source_url: SOURCES.goodgeSbs,
      },
      {
        year: 2026,
        title: "Mission America",
        detail:
          "Began an attempt in Honolulu on 9 October 2026 to run a marathon in all 50 US states in 24 days, fundraising for Stand Up To Cancer.",
        source_url: SOURCES.goodgeTribune,
      },
    ],
  },
  {
    ...base,
    slug: "cole-brauer",
    display_name: "Cole Brauer",
    given_name: "Cole",
    family_name: "Brauer",
    gender: "F",
    city: "",
    county: "United States",
    country: "United States",
    nationality: "American",
    nation: "United States",
    continent: "North America",
    bio: "American offshore solo sailor and the first American woman to race solo, nonstop and unassisted around the world.",
    athrecs_id: "ATH-US-PF-0065",
    source_url: SOURCES.brauerSailWorld,
    profile_roles: ["Sailor", "Ocean racer", "Solo circumnavigator"],
    profile_links: [
      { label: "Global Solo Challenge finish report", url: SOURCES.brauerSailWorld },
      { label: "East Hampton Star profile", url: SOURCES.brauerStar },
    ],
    notable_achievements: [
      {
        year: 2024,
        title: "Global Solo Challenge, second place",
        detail:
          "Finished second in the Global Solo Challenge at A Coruña on 7 March 2024 aboard First Light.",
        source_url: SOURCES.brauerSailWorld,
      },
      {
        year: 2024,
        title: "Solo nonstop circumnavigation",
        detail:
          "Sailed around the world solo and nonstop in 130 days, 2 hours, 45 minutes and 38 seconds.",
        source_url: SOURCES.brauerStar,
      },
    ],
  },
  {
    ...base,
    slug: "terry-bradshaw",
    display_name: "Terry Bradshaw",
    given_name: "Terry",
    family_name: "Bradshaw",
    gender: "M",
    city: "",
    county: "United States",
    country: "United States",
    place_of_birth: "Shreveport, Louisiana",
    country_of_birth: "United States",
    nation: "United States",
    continent: "North America",
    bio: "American football quarterback who spent his 14-season NFL career with the Pittsburgh Steelers, winning four Super Bowls, and a Pro Football Hall of Fame inductee.",
    athrecs_id: "ATH-US-PF-0066",
    source_url: SOURCES.bradshawHof,
    profile_roles: ["American football", "Quarterback", "Broadcaster"],
    profile_links: [
      { label: "Pro Football Hall of Fame", url: SOURCES.bradshawHof },
      { label: "Pro Football Reference career stats", url: SOURCES.bradshawPfr },
    ],
    notable_achievements: [
      {
        year: 1970,
        title: "First overall draft pick",
        detail: "Selected first overall by the Pittsburgh Steelers in the 1970 NFL Draft.",
        source_url: SOURCES.bradshawHof,
      },
      {
        year: 1979,
        title: "Four Super Bowl titles",
        detail:
          "Led the Steelers to victory in Super Bowls IX, X, XIII and XIV, and was MVP of Super Bowls XIII and XIV.",
        source_url: SOURCES.bradshawHof,
      },
      {
        year: 1989,
        title: "Pro Football Hall of Fame",
        detail: "Enshrined in the Pro Football Hall of Fame as part of the Class of 1989.",
        source_url: SOURCES.bradshawHof,
      },
    ],
  },
  {
    ...base,
    slug: "colin-kaepernick",
    display_name: "Colin Kaepernick",
    given_name: "Colin",
    family_name: "Kaepernick",
    gender: "M",
    city: "",
    county: "United States",
    country: "United States",
    nationality: "American",
    place_of_birth: "Milwaukee, Wisconsin",
    country_of_birth: "United States",
    nation: "United States",
    continent: "North America",
    bio: "American football quarterback who played for the San Francisco 49ers from 2011 to 2016 and started the 2016 national-anthem protests against racial injustice.",
    athrecs_id: "ATH-US-PF-0067",
    source_url: SOURCES.kaepernickPfr,
    profile_roles: ["American football", "Quarterback", "Activist"],
    profile_links: [
      { label: "Pro Football Reference career stats", url: SOURCES.kaepernickPfr },
      { label: "Britannica biography", url: SOURCES.kaepernickBritannica },
    ],
    notable_achievements: [
      {
        year: 2011,
        title: "NFL Draft",
        detail:
          "Selected by the San Francisco 49ers in the second round, 36th overall, of the 2011 NFL Draft.",
        source_url: SOURCES.kaepernickPfr,
      },
      {
        year: 2013,
        title: "Super Bowl XLVII",
        detail:
          "Became the 49ers' starter in the 2012 season and led them to Super Bowl XLVII, passing for 302 yards in a 34–31 defeat by Baltimore.",
        source_url: SOURCES.kaepernickBritannica,
      },
    ],
  },
];
