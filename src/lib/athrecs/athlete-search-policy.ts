export const INDEXABLE_ATHLETE_ROBOTS = "index, follow";
export const PRIVATE_ATHLETE_ROBOTS = "noindex, nofollow, noarchive";

// Internal response marker, set only from the server-validated route loader.
// Request middleware consumes it and removes it before sending the response.
export const ATHLETE_INDEXING_HEADER = "X-Athrecs-Profile-Indexable";

export function isIndexableAthletePage(
  data: { kind: string; searchIndexable?: boolean } | undefined,
): boolean {
  return data?.kind === "published-history" && data.searchIndexable === true;
}
