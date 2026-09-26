export const MARATHON_WINDOW_START = "2026-09-26";
export const MARATHON_WINDOW_END = "2027-12-31";
export const MARATHON_TIME_ZONE = "Europe/London";

export type MarathonEdition = {
  raceId: string;
  startDate: string;
  endDate?: string;
  sourceUrl: string;
  checkedAt: string;
};

const londonDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: MARATHON_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar comparisons deliberately use UK dates, never the visitor's timezone. */
export function currentLondonDate(now = new Date()): string {
  const parts = londonDate.formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function upcomingMarathonEditions(editions: readonly MarathonEdition[], today: string) {
  return editions
    .filter(
      (edition) =>
        edition.startDate >= MARATHON_WINDOW_START &&
        edition.startDate <= MARATHON_WINDOW_END &&
        (edition.endDate ?? edition.startDate) >= today &&
        today <= MARATHON_WINDOW_END,
    )
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.raceId.localeCompare(b.raceId));
}

/** At UTC midnight London is either 00:00 or 01:00, including clock-change dates. */
export function nextLondonMidnight(now = new Date()): Date {
  const tomorrowUtc = new Date(`${currentLondonDate(now)}T00:00:00Z`);
  tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: MARATHON_TIME_ZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(tomorrowUtc),
  );
  return new Date(tomorrowUtc.getTime() - hour * 60 * 60 * 1000);
}

export function formatMarathonDate(
  edition: Pick<MarathonEdition, "startDate" | "endDate">,
): string {
  const format = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T12:00:00Z`));
  return edition.endDate && edition.endDate !== edition.startDate
    ? `${format(edition.startDate)} – ${format(edition.endDate)}`
    : format(edition.startDate);
}
