import { getSportPage } from "./sport-pages";

export type ResultsSearch = {
  q: string;
  sport: string;
  category: string;
  year: string;
  distance: string;
  page: number;
};

/** Shared by URL validation and server functions; no identity matching or writes. */
export function normalizeResultsSearch(input: unknown): ResultsSearch {
  const raw = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
  const text = (key: string, limit: number) =>
    typeof raw[key] === "string" ? raw[key].trim().slice(0, limit) : "";
  const rawPage = typeof raw.page === "number" || typeof raw.page === "string"
    ? Number(raw.page)
    : 1;
  const year = text("year", 4);
  return {
    q: text("q", 120),
    sport: text("sport", 60),
    category: getSportPage(raw.category)?.slug ?? "",
    year: /^\d{4}$/.test(year) && Number(year) >= 1800 && Number(year) <= 9998 ? year : "",
    distance: text("distance", 40),
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 1000) : 1,
  };
}

// Accept legacy numeric URLs as well as descriptive result slugs.
export { resultEditionId as parseResultsEditionId } from "./result-slug.ts";
