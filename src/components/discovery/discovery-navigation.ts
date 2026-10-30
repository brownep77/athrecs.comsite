import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import { getSportPage, SPORT_PAGES, type SportPage } from "@/lib/athrecs/sport-pages";
import { countrySlug } from "@/lib/athrecs/country-sites";
import { HYBRID_FITNESS_SPORTS } from "@/lib/athrecs/public-sports";

// These are the English-speaking countries with published road-marathon guides.
const featuredGuideIds = [
  "uk",
  "ireland",
  "usa",
  "canada",
  "australia",
  "new-zealand",
  "south-africa",
];
export const DISCOVERY_COUNTRIES = featuredGuideIds.flatMap((id) => {
  const country = MARATHON_COUNTRIES.find((entry) => entry.id === id);
  return country
    ? [
        {
          name: country.name,
          slug: countrySlug(country.name),
          guidePath: `/running/${country.guide}`,
          path: `/running?country=${countrySlug(country.name)}`,
        },
      ]
    : [];
});

export const QUICK_SPORTS = [
  { label: "Running", slug: null, sport: "Running", path: "/" },
  {
    label: "Athletics",
    slug: "track-and-field",
    sport: "Athletics",
    path: "/sports/track-and-field",
  },
  { label: "Triathlon", slug: "triathlon", sport: "Triathlon", path: "/sports/triathlon" },
  { label: "Cycling", slug: "road-cycling", sport: "Cycling", path: "/sports/road-cycling" },
  { label: "Swimming", slug: "swimming", sport: "Swimming", path: "/sports/swimming" },
  { label: "Duathlon", slug: "duathlon", sport: "Duathlon", path: "/sports/duathlon" },
  { label: "parkrun", slug: "parkrun", sport: "Parkrun", path: "/sports/parkrun" },
  {
    label: "Hybrid & Fitness",
    slug: "hybrid-fitness",
    sport: "Functional Fitness",
    path: "/sports/hybrid-fitness",
  },
] as const;

export const MORE_SPORTS = SPORT_PAGES.filter(
  (page) => !QUICK_SPORTS.some((item) => item.slug === page.slug),
);

export function isHybridFitnessSport(sport: string | undefined) {
  return !!sport && (HYBRID_FITNESS_SPORTS as readonly string[]).includes(sport);
}

export function activeDiscoverySport(pathname: string) {
  return pathname === "/" ? "Running" : getSportPage(pathname.split("/")[2])?.sport;
}

export function discoverySportLinks(sport?: SportPage) {
  if (!sport || sport.sport === "Running")
    return [
      { label: "All running", path: "/" },
      { label: "Road running", path: "/sports/road-running" },
      { label: "Trail running", path: "/sports/trail-running" },
      { label: "Cross country", path: "/running/cross-country" },
      { label: "Fell running", path: "/running/fell" },
      { label: "Ultramarathons", path: "/?distance=Ultra" },
    ];
  if (sport.sport === "Cycling" || isHybridFitnessSport(sport.sport))
    return SPORT_PAGES.filter((page) =>
      sport.sport === "Cycling" ? page.sport === "Cycling" : isHybridFitnessSport(page.sport),
    ).map((page) => ({
      label: page.label,
      path: `/sports/${page.slug}`,
    }));
  return [
    {
      label: `${sport.sport === "Athletics" ? "Track & field" : sport.label} fixtures`,
      path: `/sports/${sport.slug}`,
    },
    { label: "Results", path: `/results?category=${sport.slug}` },
    { label: "Athletes", path: `/athletes?sport=${encodeURIComponent(sport.sport)}` },
    { label: "Clubs & federations", path: `/directory?sport=${sport.slug}` },
    { label: "News", path: `/news?sport=${sport.slug}` },
    { label: "Race reports", path: `/race-reports?sport=${sport.slug}` },
  ];
}

export function fixtureFilterLabel(sport?: SportPage) {
  if (sport?.sport === "Athletics") return "Event / distance";
  if (isHybridFitnessSport(sport?.sport)) return "Competition / format";
  if (
    ["Triathlon", "Duathlon", "Aquathlon", "Aquabike", "Swimrun", "Adventure Racing"].includes(
      sport?.sport ?? "",
    )
  )
    return "Format / distance";
  return "Distance";
}

export function fixturePageTitle(sport?: SportPage) {
  if (!sport) return "Find your next running race";
  if (sport.sport === "Athletics") return "Your next track & field meeting";
  if (sport.sport === "Swimming") return "Find your next swimming event";
  if (sport.sport === "Parkrun") return "Find your next parkrun";
  return `Find your next ${sport.label.toLowerCase()} event`;
}
