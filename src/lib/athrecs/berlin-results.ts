import type { BerlinResult, BerlinSnapshot } from "./berlin-snapshot.server";
export type { BerlinResult, BerlinSnapshot } from "./berlin-snapshot.server";

export const BERLIN_PATH = "/results/berlin-marathon-2026";
export const BERLIN_URL = `https://www.athrecs.com${BERLIN_PATH}`;
export type BerlinView = "men" | "women" | "age" | "all";
export type BerlinSearch = {
  view: BerlinView;
  ageGender: "men" | "women" | "other";
  category: string;
  q: string;
  page: number;
};
export function berlinSearch(raw: Record<string, unknown>): BerlinSearch {
  return {
    view: ["men", "women", "age", "all"].includes(String(raw.view))
      ? (raw.view as BerlinView)
      : "all",
    category: typeof raw.category === "string" ? raw.category.slice(0, 50) : "",
    ageGender: raw.ageGender === "women" || raw.ageGender === "other" ? raw.ageGender : "men",
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 120) : "",
    page:
      Number.isSafeInteger(Number(raw.page)) && Number(raw.page) > 0
        ? Math.min(10000, Number(raw.page))
        : 1,
  };
}
export function berlinPlace(row: BerlinResult, view: BerlinView): number | null {
  return view === "age" ? row.categoryPlace : view === "all" ? row.overallPlace : row.genderPlace;
}
export function berlinSelection(data: BerlinSnapshot, search: BerlinSearch): BerlinResult[] {
  if (search.view === "age" && !search.category) return [];
  const query = search.q.toLocaleLowerCase("en-GB");
  return data.results
    .filter(
      (row) =>
        ((search.view !== "men" && search.view !== "women") || row.gender === search.view) &&
        (search.view !== "age" ||
          (row.category === search.category && row.gender === search.ageGender)) &&
        (!query ||
          [row.name, row.bib, row.club ?? ""].some((value) =>
            value.toLocaleLowerCase("en-GB").includes(query),
          )),
    )
    .sort(
      (a, b) =>
        (berlinPlace(a, search.view) ?? Infinity) - (berlinPlace(b, search.view) ?? Infinity) ||
        a.name.localeCompare(b.name),
    );
}
export function berlinTitle(search: BerlinSearch): string {
  if (search.view === "age")
    return `${search.ageGender === "women" ? "Women" : search.ageGender === "other" ? "Other classifications" : "Men"} · ${search.category ? `Age category ${search.category}` : "Age categories"}`;
  return search.view === "men"
    ? "Men"
    : search.view === "women"
      ? "Women"
      : "All published results";
}
export function berlinShareUrl(search: BerlinSearch): string {
  const params = new URLSearchParams({ view: search.view });
  if (search.view === "age" && search.category) params.set("category", search.category);
  if (search.view === "age") params.set("ageGender", search.ageGender);
  if (search.q) params.set("q", search.q);
  return `${BERLIN_URL}?${params}`;
}
export function berlinCaption(data: BerlinSnapshot, search: BerlinSearch): string {
  const rows = berlinSelection(data, search);
  const status = !rows.length
    ? data.results.length
      ? "No published results in this selection."
      : "Awaiting verified results."
    : `${data.status === "official" ? "Official" : "Provisional"} results · ${data.coverage} coverage.`;
  return `Berlin Marathon 2026 · ${berlinTitle(search)}\n27 September · 42.195 km\n${status}\n${berlinShareUrl(search)}\n#BerlinMarathon #AthRecs`;
}
