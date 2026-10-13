export const PUBLIC_PROFILE_RESULT_LIMIT = 5;

export function publicAthleteResultPage(value: unknown): number {
  const text = typeof value === "number" ? String(value) : value;
  if (typeof text !== "string" || !/^[1-9]\d{0,5}$/.test(text)) return 1;
  return Number(text);
}

export function parsePublicAthleteResultSearch(search: Record<string, unknown>): {
  resultsPage?: number;
} {
  const page = publicAthleteResultPage(search.resultsPage);
  return page > 1 ? { resultsPage: page } : {};
}

export function publicAthleteResultPath(slug: string, page = 1): string {
  const base = `/athletes/${encodeURIComponent(slug)}`;
  return page > 1 ? `${base}?resultsPage=${page}` : base;
}

export function parsePublicAthletePreviewInput(input: unknown): {
  slug: string;
  resultPage: number;
} {
  const value = typeof input === "string" ? { slug: input } : input;
  if (
    !value ||
    typeof value !== "object" ||
    !("slug" in value) ||
    typeof value.slug !== "string" ||
    !value.slug.trim() ||
    value.slug.length > 300
  ) {
    throw new Error("An athlete profile is required");
  }
  return {
    slug: value.slug,
    resultPage: publicAthleteResultPage("resultPage" in value ? value.resultPage : 1),
  };
}
