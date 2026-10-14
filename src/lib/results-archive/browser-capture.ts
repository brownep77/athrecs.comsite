import { z } from "zod";
import { httpsSource } from "./core";

const captureSchema = z.object({
  format: z.literal("athrecs-browser-results-v1"),
  scope: z.literal("loaded-page-only"),
  capturedAt: z.string().datetime(),
  page: z.object({ url: httpsSource, title: z.string().max(500) }).strict(),
  table: z.object({
    label: z.string().max(100),
    headers: z.array(z.string().min(1).max(160)).min(1).max(80),
    rows: z.array(z.array(z.string().max(4000)).min(1).max(80)).min(1).max(5000),
    rowLinks: z.array(z.array(httpsSource).max(100)).max(5000),
  }).strict(),
  warnings: z.array(z.string().max(1000)).max(100),
}).strict();

/** A browser capture is untrusted source evidence, never an identity/verification approval. */
export function parseBrowserCapture(input: string) {
  if (new TextEncoder().encode(input).length > 25 * 1024 * 1024)
    throw new Error("Browser capture exceeds 25 MB.");
  const capture = captureSchema.parse(JSON.parse(input));
  const { headers, rows, rowLinks } = capture.table;
  const extra = ["_capture_source_url", "_capture_page_title", "_capture_checked_at", "_capture_scope", "_capture_row_links"];
  if (new Set(headers).size !== headers.length || headers.some(h => h !== h.trim() || extra.includes(h)))
    throw new Error("Browser capture contains duplicate or reserved column headings.");
  if (rows.some(r => r.length !== headers.length) || rowLinks.length !== rows.length)
    throw new Error("Browser capture columns or row links do not match the captured rows.");
  if (rowLinks.some(links => links.join("\n").length > 4000))
    throw new Error("Browser capture contains too many links in a row.");
  return {
    sourceUrl: capture.page.url,
    capturedAt: capture.capturedAt,
    warnings: capture.warnings,
    table: {
      headers: [...headers, ...extra],
      rows: rows.map((row, i) => [...row, capture.page.url, capture.page.title, capture.capturedAt,
        capture.scope, rowLinks[i].join("\n")]),
    },
  };
}
