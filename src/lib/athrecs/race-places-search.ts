export function racePlaceSearch(search: Record<string, unknown>): {
  page?: number;
  view?: "archive";
  month?: string;
  city?: string;
} {
  const page = Number(search.page);
  return {
    page: Number.isSafeInteger(page) && page > 1 ? page : undefined,
    view: search.view === "archive" ? "archive" : undefined,
    month:
      typeof search.month === "string" &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(search.month) &&
      search.view !== "archive"
        ? search.month
        : undefined,
    city:
      typeof search.city === "string" ? search.city.trim().slice(0, 100) || undefined : undefined,
  };
}
