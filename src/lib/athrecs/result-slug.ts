/** The edition ID prevents collisions; earlier names and numeric URLs can redirect. */
export function resultSlug(edition: {
  edition_id: number;
  event_name: string;
  event_date: string;
  distance_code: string;
}): string {
  const label = `${edition.event_name}-${edition.event_date.slice(0, 10)}-${edition.distance_code}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160)
    .replace(/-$/, "");
  return `${label || "race"}-${edition.edition_id}`;
}

export function resultEditionId(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number")
    throw new Error("Invalid race edition");
  const match = /^(?:[a-z0-9]+(?:-[a-z0-9]+)*-)?([0-9]+)$/.exec(String(value));
  const id = match ? Number(match[1]) : NaN;
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647)
    throw new Error("Invalid race edition");
  return id;
}
