export type AthleteDirectorySearch = {
  q?: string;
  country?: string;
  sport?: string;
  page?: number;
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
    page: Number.isSafeInteger(page) && page > 1 && page <= 100000 ? page : undefined,
  };
}

export type DirectoryAthlete = {
  id: number;
  athlete_number: string;
  slug: string;
  display_name: string;
  country: string;
  city: string | null;
  club: string | null;
  profile_roles: string;
  sports: string[];
  result_count: number;
};

export type AthleteDirectory = {
  athletes: DirectoryAthlete[];
  total: number;
  page: number;
  pageSize: number;
  publicAthletes: number;
  publicResults: number;
  countries: string[];
  sports: string[];
};
