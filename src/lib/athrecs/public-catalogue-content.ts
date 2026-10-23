/** Owner's publication policy. Original source evidence stays in server storage. */
export function hasWithheldCatalogueReference(value: unknown): boolean {
  return typeof value === "string" && /run\s*abc/i.test(value);
}

export function publicCatalogueText(value: string): string {
  if (!hasWithheldCatalogueReference(value)) return value;
  // Remove the attribution sentence, not just its name: otherwise a directory
  // link or placeholder can misleadingly appear to be official organiser advice.
  return value
    .split(/(?<=[.!?])\s+|\n+/)
    .filter((sentence) => !hasWithheldCatalogueReference(sentence))
    .join(" ")
    .trim();
}

function withheldLink(item: unknown): boolean {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  const row = item as Record<string, unknown>;
  // An edition also has an entry_url: retain that race/date and clear its link.
  // Only standalone provider/link cards may disappear from their arrays.
  const providerOption = "provider_code" in row || "provider_name" in row || "results_url" in row;
  return [
    "url",
    "href",
    ...(providerOption
      ? ["entry_url", "entryUrl", "results_url", "provider_code", "provider_name"]
      : []),
  ].some((key) => hasWithheldCatalogueReference(row[key]));
}

/**
 * Project JSON catalogue DTOs before SSR/RPC serialization. Never call this on
 * ingestion or audit writes. Work on copies so provenance and verification
 * decisions continue to use the original data. Drop withheld link options
 * entirely rather than returning clickable cards with empty destinations.
 */
export function publicCatalogueContent<T>(value: T): T {
  if (typeof value === "string") return publicCatalogueText(value) as T;
  if (Array.isArray(value))
    return value.filter((item) => !withheldLink(item)).map(publicCatalogueContent) as T;
  if (!value || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype)
    return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !hasWithheldCatalogueReference(key))
      .map(([key, item]) => [key, publicCatalogueContent(item)]),
  ) as T;
}
