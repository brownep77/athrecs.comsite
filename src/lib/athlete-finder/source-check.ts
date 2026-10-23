import { z } from "zod";

const racingName = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .refine(
    (value) => /[\p{L}\p{N}].*[\p{L}\p{N}]/u.test(value),
    "Enter a racing name containing at least two letters or numbers.",
  );

export const sourceCheckSchema = z
  .object({
    url: z
      .string()
      .trim()
      .url()
      .max(1500)
      .refine((value) => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" && !url.username && !url.password;
        } catch {
          return false;
        }
      }, "Use the real HTTPS results link, without login credentials."),
    name: racingName,
    aliases: z.array(racingName).max(8).default([]),
    club: z.string().trim().max(160).default(""),
  })
  .strict();

export type SourceCheckInput = z.input<typeof sourceCheckSchema>;

export type SourceCheckRow = {
  key: string;
  name: string;
  club: string;
  bib: string;
  date: string | null;
  distance: string;
  table: number;
  row: number;
  sourceUrl: string;
  original: Record<string, string>;
  matchReason: string;
  issues: string[];
};

export type SourceReviewCapture = {
  table: number;
  label: string;
  matchedRows: number;
  json: string;
};

export type SourceCheckResponse = {
  status: "checked" | "blocked" | "unavailable" | "rate_limited";
  provider: string;
  sourceUrl: string;
  eventName: string;
  checkedAt: string;
  fetchedAt: string | null;
  robotsCheckedAt: string | null;
  cacheStatus: "live" | "not_fetched";
  sourceRows: number | null;
  matchedRows: number | null;
  returnedRows: number;
  truncated: boolean;
  rows: SourceCheckRow[];
  reviewCaptures: SourceReviewCapture[];
  issues: string[];
  retryAfterSeconds: number | null;
  coverage: { pagesChecked: 0 | 1; scope: "single_results_page" };
};

/** Match racing-name variants without erasing non-Latin names. Never proves identity. */
export function sourceNameKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-GB")
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Only observed/supplied public result-page IDs; no generated routes or index crawl. */
export function trtResultUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== "totalracetiming.co.uk" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    !/^\/raceresults\/[1-9]\d{0,11}\/?$/.test(url.pathname) ||
    (url.hash && !/^#sr\d+$/.test(url.hash))
  )
    return null;
  return `https://totalracetiming.co.uk${url.pathname.replace(/\/$/, "")}`;
}
