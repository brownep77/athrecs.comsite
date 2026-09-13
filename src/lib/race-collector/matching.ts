import type { Candidate, Edition, Identity } from "./core.ts";

export function normalizedName(v: string) {
  return v
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
export function normalizedUrl(v: string | null | undefined) {
  try {
    const u = new URL(v ?? "");
    if (!["https:", "http:"].includes(u.protocol)) return "";
    u.hash = "";
    u.hostname = u.hostname.replace(/^www\./, "");
    u.pathname = u.pathname.replace(/\/+$/, "") || "/";
    for (const k of [...u.searchParams.keys()])
      if (/^(utm_|fbclid$|gclid$)/i.test(k)) u.searchParams.delete(k);
    u.searchParams.sort();
    return u.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}
const generic = new Set(
  "the and at of for run running race races road trail marathon half quarter ultra km kilometre kilometres kilometer kilometers mile miles mi k january february march april may june july august september october november december edition".split(
    " ",
  ),
);
function tokens(name: string) {
  return new Set(
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b\d+(?:[.,]\d+)?\s*(?:km|k|mi|miles?)\b/g, " ")
      .split(/[^\p{L}\p{N}]+/u)
      .filter((t) => t.length > 1 && !generic.has(t) && !/^\d+$/.test(t)),
  );
}
export function sameCountry(c: Candidate, country: string) {
  return (
    normalizedName(country) === normalizedName(c.country) ||
    (c.countryCode === "GB" &&
      ["United Kingdom", "England", "Wales", "Scotland", "Northern Ireland"].includes(country))
  );
}
type Page = { value: string; origin: string; path: string };
function page(value: string): Page {
  const u = value ? new URL(value) : null;
  return { value, origin: u?.origin ?? "", path: u?.pathname ?? "/" };
}
function specific(url: Page) {
  return Boolean(url.value && url.path !== "/");
}
function relatedPage(a: Page, b: Page) {
  return (
    specific(a) &&
    specific(b) &&
    a.origin === b.origin &&
    (a.path.startsWith(b.path + "/") || b.path.startsWith(a.path + "/"))
  );
}
export type CatalogueMatch = {
  event: Identity;
  confidence: "identity" | "possible";
  reasons: string[];
  differences: string[];
  editions: Edition[];
  editionCount: number;
  equivalent: boolean;
  score: number;
};
/** Prepare once per catalogue snapshot, not once per finding on a 100-row page. */
export function createMatchIndex(events: Identity[], editions: Edition[]) {
  const byEvent = new Map<number, Edition[]>();
  for (const d of editions) {
    const rows = byEvent.get(d.eventId) ?? [];
    rows.push(d);
    byEvent.set(d.eventId, rows);
  }
  const prepared = events.map((event) => ({
    event,
    name: normalizedName(event.name),
    words: tokens(event.name),
    aliases: (event.aliases ?? []).map((a) => normalizedName(a.replace(/-/g, " "))),
    website: page(normalizedUrl(event.website)),
    city: normalizedName(event.city ?? ""),
    country: normalizedName(event.country),
    homeNation: ["United Kingdom", "England", "Wales", "Scotland", "Northern Ireland"].includes(
      event.country,
    ),
    editions: (byEvent.get(event.id) ?? []).map((edition) => ({
      edition,
      urls: [edition.source, edition.entryUrl].map(normalizedUrl).filter(Boolean).map(page),
    })),
  }));
  return (c: Candidate): CatalogueMatch[] => {
    const name = normalizedName(c.name),
      words = tokens(c.name);
    const urls = [c.sourceUrl, c.entryUrl].map(normalizedUrl).filter(Boolean).map(page);
    const city = normalizedName(c.city),
      countryName = normalizedName(c.country);
    const wordList = [...words];
    const matches: CatalogueMatch[] = [];
    for (const p of prepared) {
      const common = wordList.filter((t) => p.words.has(t)).length;
      const sameCity = Boolean(city && p.city && city === p.city);
      const country = p.country === countryName || (c.countryCode === "GB" && p.homeNation);
      const dated = p.editions.filter((d) => d.edition.date === c.date);
      const equivalent = dated.some((d) => Math.abs(d.edition.distanceKm - c.distanceKm) <= 0.025);
      const exactName = p.name === name;
      const alias = p.aliases.includes(name);
      const website = urls.some((u) => specific(u) && u.value === p.website.value);
      // A shared organiser homepage alone is never an event identity.
      const editionUrl = dated.some((d) =>
        d.urls.some(
          (u) => urls.some((v) => v.value === u.value) && (specific(u) || common > 0 || exactName),
        ),
      );
      const identity = exactName || alias || website || editionUrl;
      const contained =
        name.length > 8 && p.name.length > 8 && (name.includes(p.name) || p.name.includes(name));
      const similar =
        common >= 2 &&
        (common / Math.min(words.size, p.words.size) >= 0.85 ||
          (2 * common) / (words.size + p.words.size) >= 0.65);
      const venueName = common > 0 && sameCity && country && equivalent;
      const childPage = urls.some(
        (u) =>
          relatedPage(u, p.website) || dated.some((d) => d.urls.some((v) => relatedPage(u, v))),
      );
      if (!identity && !contained && !similar && !venueName && !childPage) continue;
      const reasons = [
        exactName && "Same event name (year, punctuation and accents normalised)",
        alias && "Matches a recorded former event slug",
        website && "Same specific organiser or entry page as the catalogue event",
        editionUrl && "Same source or entry page as a dated catalogue fixture",
        !exactName &&
          (contained || similar || venueName) &&
          "Similar event name, allowing sponsor and distance wording",
        childPage && "Related event page path; requires source comparison",
        sameCity && "Same start town/city",
        dated.length > 0 && "Same date",
        equivalent && "Same numeric distance (within 25 metres, including miles/km conversion)",
      ].filter((s): s is string => Boolean(s));
      const differences = [
        !country && `Country differs: ${p.event.country}`,
        c.city && p.event.city && !sameCity && `Town/city differs: ${p.event.city}`,
        !exactName && `Catalogue name: ${p.event.name}`,
        !dated.length && "No catalogue fixture on this exact date in the checked period",
        dated.length > 0 && !equivalent && "This numeric distance is not listed on this date",
      ].filter((s): s is string => Boolean(s));
      const sorted = p.editions
        .map((d) => d.edition)
        .sort((a, b) => {
          const rank = (d: Edition) =>
            (d.date === c.date ? 0 : 10000) + Math.abs(d.distanceKm - c.distanceKm);
          return rank(a) - rank(b) || a.date.localeCompare(b.date);
        });
      matches.push({
        event: p.event,
        confidence: identity ? "identity" : "possible",
        reasons,
        differences,
        editions: sorted.slice(0, 5),
        editionCount: sorted.length,
        equivalent,
        score:
          (identity ? 1000 : 0) +
          (equivalent ? 100 : dated.length ? 50 : 0) +
          (country ? 20 : 0) +
          (sameCity ? 20 : 0) +
          common,
      });
    }
    return matches.sort((a, b) => b.score - a.score || a.event.id - b.event.id);
  };
}
export type PendingEdition = {
  eventSlug: string;
  date: string;
  batchId?: string;
  name?: string;
  country?: string;
  city?: string;
  source?: string;
  entryUrl?: string;
  distanceKm?: number;
};
export function sharesProgramme(a: Candidate, b: Candidate) {
  if (
    a.date !== b.date ||
    a.countryCode !== b.countryCode ||
    normalizedName(a.city) !== normalizedName(b.city)
  )
    return false;
  const urls = [a.sourceUrl, a.entryUrl].map(normalizedUrl).filter(Boolean);
  return [b.sourceUrl, b.entryUrl]
    .map(normalizedUrl)
    .some((u) => u && specific(page(u)) && urls.includes(u));
}
export function findPendingMatches(c: Candidate, slug: string, pending: PendingEdition[]) {
  const dated = pending.filter((p) => p.date === c.date);
  const index = createMatchIndex(
    dated.map((p, i) => ({
      id: i,
      slug: p.eventSlug,
      name: p.name ?? p.eventSlug.replace(/-/g, " "),
      country: p.country ?? "",
      city: p.city,
      website: p.source ?? null,
    })),
    dated.map((p, i) => ({
      eventId: i,
      date: p.date,
      distance: "",
      distanceKm: p.distanceKm ?? c.distanceKm,
      source: p.source ?? null,
      entryUrl: p.entryUrl,
    })),
  );
  const possible = new Set(index(c).map((m) => m.event.id));
  return dated.filter((p, i) => {
    const sameDistance = p.distanceKm == null || Math.abs(p.distanceKm - c.distanceKm) <= 0.025;
    // A second distance under one identity is safe. Another identity for the same programme
    // needs review even when its distance differs.
    return p.eventSlug === slug ? sameDistance : possible.has(i);
  });
}
