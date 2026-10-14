export const PUBLIC_PROFILE_RESULT_LIMIT = 5;

// Keep route validation aligned with the preview API, including ATH-number
// aliases and established slugs. Invalid addresses must stop before API calls.
export function isValidPublicAthleteLookup(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 300;
}

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
    !isValidPublicAthleteLookup(value.slug)
  ) {
    throw new Error("An athlete profile is required");
  }
  return {
    slug: value.slug,
    resultPage: publicAthleteResultPage("resultPage" in value ? value.resultPage : 1),
  };
}
