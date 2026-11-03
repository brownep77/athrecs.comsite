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

/** The event's name is kept intact. Qualify multi-distance meetings by edition. */
export function resultEditionLabel(edition: {
  event_name: string;
  event_date: string;
  distance_code: string;
}) {
  const { event_name: name, distance_code: code } = edition;
  const distance = code.trim() === "Half" ? "Half marathon" : code.trim();
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/(\d+)\s*(?:km|kilometres?|kilometers?)\b/g, "$1k")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  const words = " " + normalise(name) + " ";
  const discipline = normalise(distance);
  // A half marathon is a separate discipline from the full marathon.
  const alreadyNamed = (
    discipline === "marathon" ? words.replaceAll("half marathon", "half") : words
  ).includes(" " + discipline + " ");
  const multiple = new Set(words.match(/\b(?:half marathon|marathon|\d+(?:k|mi|m))\b/g)).size > 1;
  const qualifier =
    discipline &&
    !/^(?:other|unknown|tbc|tbd|unspecified|n a)$/.test(discipline) &&
    (!alreadyNamed || multiple)
      ? " · " + distance
      : "";
  const year = edition.event_date.slice(0, 4);
  const yearLabel = /^\d{4}$/.test(year) && !words.includes(" " + year + " ") ? " " + year : "";
  return name + qualifier + yearLabel + " results";
}
