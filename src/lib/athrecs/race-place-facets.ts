/** Finite, editorially useful landing pages; arbitrary filters are never sitemap URLs. */
export const PLACE_SPORTS = [
  { slug: "running", sport: "Running", label: "Running", heading: "Running races" },
  { slug: "athletics", sport: "Athletics", label: "Athletics", heading: "Athletics events" },
  { slug: "triathlon", sport: "Triathlon", label: "Triathlon", heading: "Triathlons" },
] as const;
export const PLACE_DISTANCES = [
  { slug: "5k", label: "5K", heading: "5K races", codes: ["5K"] },
  { slug: "10k", label: "10K", heading: "10K races", codes: ["10K"] },
  { slug: "half-marathon", label: "Half marathon", heading: "Half marathons", codes: ["Half"] },
  { slug: "marathon", label: "Marathon", heading: "Marathons", codes: ["Marathon"] },
  { slug: "ultra", label: "Ultra", heading: "Ultramarathons", codes: ["Ultra", "50K", "100K"] },
  { slug: "5-mile", label: "5 mile", heading: "5 mile races", codes: ["5mi"] },
  { slug: "10-mile", label: "10 mile", heading: "10 mile races", codes: ["10mi"] },
  { slug: "20-mile", label: "20 mile", heading: "20 mile races", codes: ["20mi"] },
] as const;
export const PLACE_TERRAINS = [
  {
    slug: "road",
    surface: "Road",
    label: "Road running",
    heading: "Road running races",
    description: "Find road races from short distances to marathons and ultras.",
  },
  {
    slug: "trail",
    surface: "Trail",
    label: "Trail running",
    heading: "Trail running races",
    description: "Explore races recorded as trail events, then compare distance and location.",
  },
  {
    slug: "fell",
    surface: "Fell",
    label: "Fell running",
    heading: "Fell running races",
    description: "Browse fell races and check each organiser’s route and equipment requirements.",
  },
  {
    slug: "cross-country",
    surface: "XC",
    label: "Cross country",
    heading: "Cross-country races",
    description: "Find cross-country races and check the event’s entry and club requirements.",
  },
] as const;
export type PlaceTerrain = (typeof PLACE_TERRAINS)[number];
export type PlaceSport = (typeof PLACE_SPORTS)[number];
export type PlaceDistance = (typeof PLACE_DISTANCES)[number];
// Product threshold, not a claim about Google's ranking requirements.
export const MIN_PLACE_FACET_RACES = 3;
export function placeEntryUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function placeRaceDistanceCodes(race: {
  distanceCodes?: string[];
  editions: { distance: string; status: string }[];
}) {
  return (
    race.distanceCodes ?? [
      ...new Set(
        race.editions
          .filter((edition) => edition.status !== "Cancelled")
          .map((edition) => edition.distance),
      ),
    ]
  );
}
export const matchesPlaceDistance = (code: string, distance: PlaceDistance | null) =>
  !distance || (distance.codes as readonly string[]).includes(code);
export function placeFacetSuffix(
  sport: PlaceSport | null,
  distance: PlaceDistance | null,
  terrain: PlaceTerrain | null = null,
) {
  return sport
    ? `/${sport.slug}${terrain ? `/${terrain.slug}` : ""}${distance ? `/${distance.slug}` : ""}`
    : "";
}

export function resolvePlaceFacet(key: string, placeKeys: ReadonlySet<string>) {
  if (placeKeys.has(key)) return { key, sport: null, distance: null, terrain: null };
  const parts = key.split("/");
  const distance = PLACE_DISTANCES.find((item) => item.slug === parts.at(-1)) ?? null;
  if (distance) parts.pop();
  const terrain = PLACE_TERRAINS.find((item) => item.slug === parts.at(-1)) ?? null;
  if (terrain) parts.pop();
  const sport = PLACE_SPORTS.find((item) => item.slug === parts.at(-1)) ?? null;
  if (!sport || ((distance || terrain) && sport.slug !== "running")) return null;
  parts.pop();
  const placeKey = parts.join("/");
  return placeKeys.has(placeKey) ? { key: placeKey, sport, distance, terrain } : null;
}
