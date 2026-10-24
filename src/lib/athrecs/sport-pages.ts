import type { Sport } from "./types";

// One registry drives navigation, fixture scope, results links and page metadata.
export const SPORT_PAGES = [
  {
    slug: "road-running",
    label: "Road Running",
    sport: "Running",
    sports: ["Running", "Athletics"],
    surfaces: ["Road"],
  },
  {
    slug: "trail-running",
    label: "Trail Running",
    sport: "Running",
    sports: ["Running", "Athletics"],
    surfaces: ["Trail"],
  },
  {
    slug: "parkrun",
    label: "Parkrun",
    sport: "Parkrun",
    sports: ["Parkrun"],
    surfaces: null,
  },
  {
    slug: "track-and-field",
    label: "Track and Field",
    sport: "Athletics",
    sports: ["Athletics", "Running"],
    surfaces: ["Track"],
  },
  {
    slug: "triathlon",
    label: "Triathlon",
    sport: "Triathlon",
    sports: ["Triathlon"],
    surfaces: null,
  },
  {
    slug: "road-cycling",
    label: "Road Cycling",
    sport: "Cycling",
    sports: ["Cycling"],
    surfaces: ["Road"],
  },
  {
    slug: "mountain-biking",
    label: "Mountain Biking",
    sport: "Cycling",
    sports: ["Cycling"],
    // Generic Trail can also mean gravel; only explicit MTB / XC categories belong here.
    surfaces: ["MTB", "MTB / Gravel", "XC", "Mountain Bike", "Mountain Biking"],
  },
  {
    slug: "track-cycling",
    label: "Track Cycling",
    sport: "Cycling",
    sports: ["Cycling"],
    surfaces: ["Track", "Velodrome"],
  },
  {
    slug: "bmx",
    label: "BMX",
    sport: "Cycling",
    sports: ["Cycling"],
    surfaces: ["BMX Track", "BMX", "BMX Freestyle"],
  },
  { slug: "swimming", label: "Swimming", sport: "Swimming", sports: ["Swimming"], surfaces: null },
  { slug: "duathlon", label: "Duathlon", sport: "Duathlon", sports: ["Duathlon"], surfaces: null },
] as const satisfies readonly {
  slug: string;
  label: string;
  sport: Sport;
  sports: readonly Sport[];
  surfaces: readonly string[] | null;
}[];

export type SportPage = (typeof SPORT_PAGES)[number];

export type SportFixtureScope = {
  sports: readonly Sport[];
  surfaces: readonly string[] | null;
  broadRunning?: boolean;
};

// Running's homepage includes every Running terrain and the non-track running
// fixtures also catalogued as Athletics. This is a data scope, not a new route:
// the existing /sports/running alias must continue to resolve to Road Running.
export const RUNNING_FIXTURE_SCOPE = {
  sports: ["Running", "Athletics"],
  surfaces: null,
  broadRunning: true,
} as const satisfies SportFixtureScope;

// The running terrain taxonomy, plus the explicit cross-country/mixed aliases
// already present in the catalogue. Track/field Athletics stays on its own hub.
export const ATHLETICS_RUNNING_SURFACES = [
  "Road",
  "Trail",
  "Fell",
  "XC",
  "Cross Country",
  "Mixed",
  "Park / mixed",
] as const;

export const UK_FIXTURE_COUNTRIES = [
  "United Kingdom",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "UK",
  "GB",
  "Great Britain",
] as const;

export type SportFixtureSearch = {
  q?: string;
  country?: string;
  month?: string;
  distance?: string;
  page?: number;
};

/** Collapse explicit distance aliases without guessing from an event's name. */
export function fixtureDistanceCode(value: string): string {
  const code = value.trim();
  const named = code.toLowerCase().replace(/[\s-]+/g, "");
  if (named === "half" || named === "halfmarathon") return "Half";
  if (named === "quarter" || named === "quartermarathon") return "Quarter";
  if (named === "marathon") return "Marathon";
  if (named === "ultra" || named === "ultramarathon") return "Ultra";
  const kilometres = code.match(/^(\d+(?:\.\d+)?)\s*k(?:m)?$/i);
  if (kilometres) return `${Number(kilometres[1])}K`;
  const miles = code.match(/^(\d+(?:\.\d+)?)\s*mi(?:le)?s?$/i);
  if (miles) return `${Number(miles[1])}mi`;
  return code;
}

export function getSportPage(slug: unknown): SportPage | undefined {
  const canonicalSlug =
    slug === "running" ? "road-running" : slug === "biking" ? "road-cycling" : slug;
  return SPORT_PAGES.find((page) => page.slug === canonicalSlug);
}

export function parseSportFixtureSearch(raw: Record<string, unknown>): SportFixtureSearch {
  const page = typeof raw.page === "number" || typeof raw.page === "string" ? Number(raw.page) : 1;
  const month = typeof raw.month === "string" ? raw.month.trim() : "";
  const filter = (value: unknown) =>
    typeof value === "string" && value.trim() !== "All"
      ? value.trim().slice(0, 120) || undefined
      : undefined;
  return {
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 120) || undefined : undefined,
    country: filter(raw.country),
    month: /^\d{4}-(0[1-9]|1[0-2])$/.test(month) && !month.startsWith("0000-") ? month : undefined,
    distance: filter(raw.distance) ? fixtureDistanceCode(filter(raw.distance)!) : undefined,
    page: Number.isSafeInteger(page) && page > 1 ? Math.min(page, 400) : undefined,
  };
}

export function publicHttpUrl(value: string | null | undefined): string | null {
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
