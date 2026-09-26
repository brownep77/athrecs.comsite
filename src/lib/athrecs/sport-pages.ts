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
    surfaces: ["MTB", "MTB / Gravel", "Trail", "XC", "Mountain Bike", "Mountain Biking"],
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
] as const satisfies readonly {
  slug: string;
  label: string;
  sport: Sport;
  sports: readonly Sport[];
  surfaces: readonly string[] | null;
}[];

export type SportPage = (typeof SPORT_PAGES)[number];

export function getSportPage(slug: unknown): SportPage | undefined {
  const canonicalSlug =
    slug === "running" ? "road-running" : slug === "biking" ? "road-cycling" : slug;
  return SPORT_PAGES.find((page) => page.slug === canonicalSlug);
}

export function parseSportFixtureSearch(raw: Record<string, unknown>): {
  q?: string;
  page?: number;
} {
  const page = typeof raw.page === "number" || typeof raw.page === "string" ? Number(raw.page) : 1;
  return {
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 120) || undefined : undefined,
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
