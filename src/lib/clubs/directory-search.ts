export const CLUB_PAGE_SIZE = 48;

export type ClubDirectorySearch = { q?: string; country?: string; sport?: string; page?: number };

export function parseClubDirectorySearch(input: Record<string, unknown>): ClubDirectorySearch {
  const text = (value: unknown, limit: number) =>
    typeof value === "string" ? value.trim().slice(0, limit) || undefined : undefined;
  const sport = text(input.sport, 60);
  const page = Number(input.page);
  return {
    q: text(input.q, 120),
    country: text(input.country, 100),
    sport: sport === "All" || sport === "All sports" ? undefined : sport,
    page: Number.isSafeInteger(page) && page > 1 ? Math.min(page, 100000) : undefined,
  };
}
