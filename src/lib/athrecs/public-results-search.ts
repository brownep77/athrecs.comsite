export type ResultsSearch = {
  q: string;
  sport: string;
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
    year: /^\d{4}$/.test(year) && Number(year) >= 1800 && Number(year) <= 9998 ? year : "",
    distance: text("distance", 40),
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 1000) : 1,
  };
}

export function parseResultsEditionId(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("Invalid race edition");
  }
  if (!/^\d+$/.test(String(value))) throw new Error("Invalid race edition");
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) {
    throw new Error("Invalid race edition");
  }
  return id;
}
