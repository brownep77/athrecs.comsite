import { z } from "zod";
import type { FixtureSource } from "../athrecs/source-registry";

export const FINDER_STORE_KINDS = ["canonical", "archive", "capture", "history"] as const;
export type FinderStoreKind = (typeof FINDER_STORE_KINDS)[number];
export const FINDER_PAGE_SIZE = 25;

const hasNameWord = (value: string) => /[\p{L}\p{N}]/u.test(value);
const name = z.string().trim().min(1).max(160).refine(hasNameWord, "Enter an athlete name");

export const finderSearchSchema = z
  .object({
    q: name,
    aliases: z.array(name).max(8).default([]),
    club: z.string().trim().max(200).default(""),
    yearFrom: z.number().int().min(1800).max(2200).optional(),
    yearTo: z.number().int().min(1800).max(2200).optional(),
    sourceId: z
      .string()
      .regex(/^[a-z0-9_]{1,120}$/)
      .optional(),
    kind: z.enum(["all", ...FINDER_STORE_KINDS]).default("all"),
    offset: z.number().int().min(0).max(10000).default(0),
  })
  .strict()
  .refine((input) => !input.yearFrom || !input.yearTo || input.yearFrom <= input.yearTo, {
    message: "The first year must be before or equal to the last year",
    path: ["yearTo"],
  });

export type FinderSearchInput = z.input<typeof finderSearchSchema>;
export type FinderSearchQuery = z.output<typeof finderSearchSchema>;

export type FinderRow = {
  key: string;
  kind: FinderStoreKind;
  name: string;
  club: string | null;
  event: string | null;
  date: string | null;
  distance: string | null;
  performance: string | null;
  finishSeconds: number | null;
  status: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  rowLocator: string;
  reviewState: string;
  athleteId: number | null;
  athleteSlug: string | null;
  resultId: number | null;
  archiveEntryId: number | null;
  datasetId: string | null;
  captureId: string | null;
  captureOrdinal: number | null;
  sourceHistoryId: string | null;
};

export type FinderStoreStatus = {
  kind: FinderStoreKind;
  status: "searched" | "unavailable" | "timed_out" | "error";
  returned: number;
  hasMore: boolean;
  nextOffset: number | null;
  message: string | null;
};

export type FinderSearchResponse = {
  rows: FinderRow[];
  stores: FinderStoreStatus[];
  hasMore: boolean;
  nextOffset: number | null;
  pageSize: number;
  completeForSelectedStores: boolean;
  notes: string[];
  searchedAt: string;
  query: {
    names: string[];
    club: string;
    yearFrom: number | null;
    yearTo: number | null;
    sourceId: string | null;
  };
};

/** Only literal Unicode name words reach to_tsquery; user search syntax is never evaluated. */
export function finderNameQuery(names: string[]): string {
  const queries = finderNameWords(names).map((words) =>
    words.map((word) => `'${word}':*`).join(" & "),
  );
  return [...new Set(queries.filter(Boolean))].map((query) => `(${query})`).join(" | ");
}

/** Candidate keys are short enough for a GIN array index even for a very large race. */
export function finderNameWords(names: string[]): string[][] {
  return names.map(
    (value) =>
      value
        .normalize("NFKC")
        .toLowerCase()
        .match(/[\p{L}\p{N}]+/gu) ?? [],
  );
}

export function sourceUrlHost(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    return url.hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
  } catch {
    return null;
  }
}

export function registrySourceHosts(
  source: Pick<FixtureSource, "start_url" | "allowed_domains">,
): string[] {
  const hosts = [sourceUrlHost(source.start_url)];
  for (const value of source.allowed_domains.split(/[|,;\s]+/).filter(Boolean)) {
    hosts.push(
      sourceUrlHost(value.includes("://") ? value : `https://${value.replace(/^\*\./, "")}`),
    );
  }
  return [...new Set(hosts.filter((host): host is string => Boolean(host)))];
}

export function finderNames(input: Pick<FinderSearchQuery, "q" | "aliases">): string[] {
  const seen = new Set<string>();
  return [input.q, ...input.aliases].filter((value) => {
    const key = value.normalize("NFKC").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
