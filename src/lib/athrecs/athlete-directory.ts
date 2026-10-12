export type AthleteDirectorySearch = {
  q?: string;
  country?: string;
  sport?: string;
  page?: number;
  letter?: string;
};

export function parseAthleteDirectorySearch(
  search: Record<string, unknown>,
): AthleteDirectorySearch {
  const text = (value: unknown) =>
    typeof value === "string" ? value.trim().slice(0, 120) || undefined : undefined;
  const page = Number(search.page);
  return {
    q: text(search.q),
    country: text(search.country),
    sport: text(search.sport),
    letter:
      typeof search.letter === "string" && /^[A-Z]$/i.test(search.letter)
        ? search.letter.toUpperCase()
        : undefined,
    page: Number.isSafeInteger(page) && page > 1 && page <= 100000 ? page : undefined,
  };
}

export type DirectoryAthlete = {
  id: number;
  athlete_number: string;
  slug: string;
  display_name: string;
  country: string;
  nationality?: string | null;
  city: string | null;
  club: string | null;
  profile_roles: string;
  sports: string[];
  result_count: number;
};

export type AthleteDirectory = {
  athletes: DirectoryAthlete[];
  /** Exact only when the last page is reached; normal browsing avoids a recount. */
  total: number | null;
  hasMore?: boolean;
  page: number;
  pageSize: number;
  publicAthletes: number | null;
  /** Full-catalogue total is omitted by the bounded public browse query. */
  publicResults: number | null;
  countries: string[];
  sports: string[];
};
