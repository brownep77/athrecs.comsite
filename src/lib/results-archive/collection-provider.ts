/**
 * Source recognition is not permission to crawl, publish or verify an athlete.
 * Keep this function self-contained: the browser bookmark embeds its source.
 */
export function resultCollectionProvider(address: string) {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !/^\/\d{4}\/$/.test(url.pathname)
  )
    return null;
  if (url.origin === "https://results.tcslondonmarathon.com")
    return {
      id: "london-mika-list",
      name: "London Marathon",
      automatic: true,
      nameFormat: "surname-given-nation",
      headings: [
        "Place (Overall)",
        "Place (Gender)",
        "Place (Category)",
        "Name",
        "Club",
        "Runner Number",
        "Category",
        "Event",
        "Half",
        "Finish",
      ],
      bibHeading: "Runner Number",
      note: "Automatic collection supports the inspected London results-list layout.",
    };
  if (
    ["https://results.chicagomarathon.com", "https://chicago-history.r.mikatiming.com"].includes(
      url.origin,
    )
  )
    return {
      id: "chicago-mika-review",
      name: "Chicago Marathon",
      automatic: false,
      nameFormat: "literal",
      headings: [] as string[],
      bibHeading: "",
      note: "Chicago automatic collection needs an inspected results-page sample. Use the single-page capture if its table is recognised, or supply a saved HTML page for adapter review.",
    };
  return null;
}

/** Shared by the source reader and the independently validating staff receiver. */
export function resultCollectionScope(address: string) {
  const provider = resultCollectionProvider(address);
  if (!provider?.automatic)
    throw new Error(
      provider?.note ?? "Automatic collection is not supported for this results source.",
    );
  const url = new URL(address);
  if (
    url.searchParams.get("pid") !== "list" ||
    url.searchParams.has("idp") ||
    url.searchParams.has("content") ||
    [...url.searchParams.keys()].some((key) => url.searchParams.getAll(key).length !== 1) ||
    !/^[1-9]\d*$/.test(url.searchParams.get("page") ?? "") ||
    !/^[1-9]\d*$/.test(url.searchParams.get("num_results") ?? "") ||
    Number(url.searchParams.get("page")) > 500 ||
    Number(url.searchParams.get("num_results")) > 5000
  )
    throw new Error("Use one unambiguous results listing, page number and page size.");
  url.searchParams.delete("page");
  url.searchParams.sort();
  url.hash = "";
  return url.href;
}

/** Suggestions only. Staff still selects the exact edition and authority to retain. */
export function collectionImportDefaults(address: string) {
  const provider = resultCollectionProvider(address);
  if (!provider) return null;
  const url = new URL(address);
  const stable = new URL(url.origin + url.pathname);
  stable.searchParams.set("pid", "list");
  // Keep the existing London dataset key compatible with previous imports.
  // Its exact edition is part of the dataset identity. Always reuse a saved race
  // for later pages. An unvalidated provider must retain its observed event ID.
  if (provider.id !== "london-mika-list" && url.searchParams.has("event"))
    stable.searchParams.set("event", url.searchParams.get("event")!);
  return { raceName: provider.name, sourceUrl: stable.href, sourceRaceKey: stable.href };
}
