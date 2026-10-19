export function racePlaceSearch(search: Record<string, unknown>): {
  page?: number;
  view?: "archive";
} {
  const page = Number(search.page);
  return {
    page: Number.isSafeInteger(page) && page > 1 ? page : undefined,
    view: search.view === "archive" ? "archive" : undefined,
  };
}
