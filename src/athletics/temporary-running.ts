/** Paul requested UK/Ireland 5K and 10K fixtures on AthRecs through January 2027. */
export const SHORT_RACE_FROM = "2026-09-10";
export const SHORT_RACE_TO = "2027-01-31";
export const SHORT_RACE_COUNTRIES = [
  "United Kingdom",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "Ireland",
] as const;
export function isTemporaryRunningEdition(edition: {
  event_date: string;
  distance_code: string;
}): boolean {
  return (
    edition.event_date >= SHORT_RACE_FROM &&
    edition.event_date <= SHORT_RACE_TO &&
    (edition.distance_code === "5K" || edition.distance_code === "10K")
  );
}
export function isTemporaryRunningEvent(event: { sport: string; country: string }): boolean {
  return (
    event.sport === "Running" && (SHORT_RACE_COUNTRIES as readonly string[]).includes(event.country)
  );
}
