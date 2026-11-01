type Row = Record<string, unknown>;
const record = (value: unknown): value is Row =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Present explicitly completed, publicly populated editions on race day.
 * Only the already-public race DTO is used. No result or profile is published.
 * A link to our archive is not an assertion of independent source verification.
 */
export function completedRacePresentation(value: Row, referenceDate?: string): Row {
  if (!record(value.event) || !Array.isArray(value.upcoming) || !Array.isArray(value.past))
    return value;
  const today = referenceDate ?? new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const completed = value.upcoming.filter((edition): edition is Row =>
    record(edition) && edition.status === "Finished" &&
    typeof edition.event_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(edition.event_date) &&
    edition.event_date <= today && typeof edition.result_count === "number" &&
    edition.result_count > 0 && typeof edition.id === "number" &&
    Number.isSafeInteger(edition.id) && edition.id > 0,
  );
  if (!completed.length) return value;
  const ids = new Set(completed.map((edition) => edition.id));
  const moved = completed.map((edition) => {
    const url = `https://www.athrecs.com/results/${edition.id}`;
    const links = Array.isArray(edition.result_links) ? edition.result_links : [];
    return {
      ...edition,
      result_links: links.some((link) => record(link) && link.results_url === url) ? links : [
        ...links,
        { provider_code: "athrecs-archive", provider_name: "AthRecs full results",
          results_url: url, canonical_url: url, is_verified: false },
      ],
    };
  });
  return {
    ...value,
    upcoming: value.upcoming.filter((edition) => !record(edition) || !ids.has(edition.id)),
    past: [...value.past.filter((edition) => !record(edition) || !ids.has(edition.id)), ...moved]
      .sort((left, right) => String(record(right) ? right.event_date ?? "" : "")
        .localeCompare(String(record(left) ? left.event_date ?? "" : ""))),
  };
}
