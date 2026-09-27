import { z } from "zod";

export const BERLIN_PATH = "/results/berlin-marathon-2026";
export const BERLIN_URL = `https://www.athrecs.com${BERLIN_PATH}`;
export const BERLIN_OFFICIAL = "https://berlin.r.mikatiming.com/2026/?lang=EN_CAP";
const time = z.string().regex(/^\d{1,2}:[0-5]\d:[0-5]\d(?:\.\d{1,3})?$/);
const position = z.number().int().positive().nullable();
export const berlinResultSchema = z
  .object({
    id: z.string().min(1),
    bib: z.string().min(1),
    name: z.string().min(1).max(150),
    gender: z.enum(["men", "women", "other"]),
    country: z.string().max(80).nullable(),
    club: z.string().max(160).nullable(),
    category: z.string().min(1).max(50).nullable(),
    overallPlace: position,
    genderPlace: position,
    categoryPlace: position,
    gunTime: time.nullable(),
    chipTime: time.nullable(),
    status: z.literal("finished"),
    verified: z.literal(true),
    publicationApproved: z.literal(true),
    sourceUrl: z.url(),
    sourceLocator: z.string().min(1),
    checkedAt: z.iso.datetime({ offset: true }),
  })
  .refine((row) => row.gunTime || row.chipTime, "A finish time is required")
  .refine((row) => row.category || row.categoryPlace === null, "Category rank needs a category");
export type BerlinResult = z.infer<typeof berlinResultSchema>;
export const berlinSnapshotSchema = z
  .object({
    event: z.literal("Berlin Marathon"),
    eventDate: z.literal("2026-09-27"),
    distanceKm: z.literal(42.195),
    status: z.enum(["awaiting", "provisional", "official"]),
    coverage: z.enum(["none", "highlights", "partial", "complete"]),
    updatedAt: z.iso.datetime({ offset: true }).nullable(),
    results: z.array(berlinResultSchema),
  })
  .superRefine((data, ctx) => {
    const bibs = new Set<string>();
    const ids = new Set<string>();
    for (const row of data.results) {
      if (bibs.has(row.bib) || ids.has(row.id))
        ctx.addIssue({ code: "custom", message: "Duplicate result identity" });
      bibs.add(row.bib);
      ids.add(row.id);
    }
    if ((data.status === "awaiting" || data.coverage === "none") && data.results.length)
      ctx.addIssue({ code: "custom", message: "Awaiting/none must not contain results" });
    if (data.results.length && !data.updatedAt)
      ctx.addIssue({ code: "custom", message: "Published results need an update timestamp" });
  });
export type BerlinSnapshot = z.infer<typeof berlinSnapshotSchema>;
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
      : "men",
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
