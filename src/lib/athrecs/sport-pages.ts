import type { Sport } from "./types";

// One registry drives navigation, fixture scope, results links and page metadata.
export const SPORT_PAGES = [
  {
    slug: "road-running",
    label: "Road Running",
    sport: "Running",
    sports: ["Running", "Athletics"],
    surface: "Road",
  },
  {
    slug: "trail-running",
    label: "Trail Running",
    sport: "Running",
    sports: ["Running", "Athletics"],
    surface: "Trail",
  },
  {
    slug: "track-and-field",
    label: "Track and Field",
    sport: "Athletics",
    sports: ["Athletics", "Running"],
    surface: "Track",
  },
  {
    slug: "triathlon",
    label: "Triathlon",
    sport: "Triathlon",
    sports: ["Triathlon"],
    surface: null,
  },
  { slug: "biking", label: "Biking", sport: "Cycling", sports: ["Cycling"], surface: null },
  { slug: "swimming", label: "Swimming", sport: "Swimming", sports: ["Swimming"], surface: null },
] as const satisfies readonly {
  slug: string;
  label: string;
  sport: Sport;
  sports: readonly Sport[];
  surface: string | null;
}[];

export type SportPage = (typeof SPORT_PAGES)[number];

export function getSportPage(slug: unknown): SportPage | undefined {
  return SPORT_PAGES.find((page) => page.slug === (slug === "running" ? "road-running" : slug));
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
