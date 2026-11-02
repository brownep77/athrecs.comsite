import { createServerFn } from "@tanstack/react-start";
import type { ResultsSearch } from "./public-results-search";

export const merseaPath = "/results/mersea-10";

export interface MerseaResult {
  name: string | null;
  finishTime: string | null;
  position?: number | null;
  sourcePosition?: number | null;
  bib?: string | null;
  club?: string | null;
  sex?: string | null;
  category?: string | null;
  sourceAward?: string | null;
  genderPosition?: number | null;
  categoryPosition?: number | null;
  age?: number | null;
  sourceUrl?: string | null;
}

export interface MerseaEdition {
  year: number;
  date: string | null;
  coverage: "full" | "partial" | "unavailable";
  sources: { name: string; url: string }[];
  note: string;
  rows: MerseaResult[];
}

export function matchesMerseaText(text: string, query: string) {
  const words = (value: string) =>
    value
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);
  const haystack = words(text);
  return words(query).every((part) => haystack.some((word) => word.startsWith(part)));
}

// A directory search for one year only needs its coverage, not the entire archive in the directory bundle.
export const getMerseaCoverage = createServerFn({ method: "GET" })
  .validator((year: string) => year)
  .handler(async ({ data: year }) => {
    const { default: archive } = await import("@/data/mersea-10/archive.json");
    return archive.editions.find((edition) => edition.year === Number(year))?.coverage ?? null;
  });

export function merseaSearch(raw: Record<string, unknown>): { year?: number; q?: string } {
  const year = /^\d{4}$/.test(String(raw.year)) ? Number(raw.year) : undefined;
  const q =
    typeof raw.q === "string" || typeof raw.q === "number"
      ? String(raw.q).trim().slice(0, 120)
      : "";
  return { year, q: q || undefined };
}

export const getMerseaArchive = createServerFn({ method: "GET" })
  .validator(merseaSearch)
  .handler(async ({ data: { year, q } }) => {
    const { default: archive } = await import("@/data/mersea-10/archive.json");
    const source = [...(archive.editions as MerseaEdition[])].sort((a, b) => b.year - a.year);
    const editions = source.map(({ year, date, coverage, rows }) => ({
      year,
      date,
      coverage,
      count: rows.length,
    }));
    const results = source
      .filter((edition) => (year ? edition.year === year : Boolean(q)))
      .map((edition) => {
        const rows = q
          ? edition.rows.filter((row) =>
              matchesMerseaText([row.name, row.club, row.bib].join(" "), q),
            )
          : edition.rows;
        return { ...edition, count: edition.rows.length, rows };
      })
      .filter((edition) => year || edition.rows.length);
    return { editions, results };
  });

export function matchesMerseaDirectory(search: ResultsSearch) {
  const title =
    "Mersea Island Lions 10 10M 10mi ten Mile Miles Miler Road Race West Mersea Colchester Essex England UK United Kingdom";
  return (
    search.page === 1 &&
    matchesMerseaText(title, search.q) &&
    (!search.sport || search.sport.toLowerCase() === "running") &&
    (!search.category || ["road-running", "all-running"].includes(search.category)) &&
    (!search.distance || /^10(?:m|mi|miles?)$/i.test(search.distance.replace(/[\s-]/g, "")))
  );
}
