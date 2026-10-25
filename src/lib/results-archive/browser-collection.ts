import { z } from "zod";
import {
  httpsSource,
  mapArchiveRows,
  type ArchiveRow,
  type BatchReceipt,
  type ColumnMapping,
} from "./core";
import { parseBrowserCapture } from "./browser-capture";
import { resultCollectionScope } from "./collection-provider";

export const collectionScope = resultCollectionScope;
export const collectionSchema = z
  .object({
    version: z.literal(1),
    firstUrl: httpsSource,
    totalPages: z.number().int().min(1).max(500),
    totalRows: z.number().int().min(1).max(1000000),
    pageSize: z.number().int().min(1).max(5000),
    filterLabel: z.string().min(1).max(500),
  })
  .strict()
  .superRefine((v, ctx) => {
    try {
      collectionScope(v.firstUrl);
      if (
        new URL(v.firstUrl).searchParams.get("page") !== "1" ||
        Number(new URL(v.firstUrl).searchParams.get("num_results")) !== v.pageSize ||
        Math.ceil(v.totalRows / v.pageSize) !== v.totalPages
      )
        throw new Error("Page totals do not match.");
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid supported collection scope or totals" });
    }
  });
export type BrowserCollection = z.infer<typeof collectionSchema>;
export function validateCollectionPage(json: string, collection: BrowserCollection, page: number) {
  const parsed = parseBrowserCapture(json);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > collection.totalPages ||
    collectionScope(parsed.sourceUrl) !== collectionScope(collection.firstUrl) ||
    Number(new URL(parsed.sourceUrl).searchParams.get("page")) !== page ||
    parsed.table.rows.length !==
      Math.min(collection.pageSize, collection.totalRows - (page - 1) * collection.pageSize)
  )
    throw new Error("Page, filters or row count changed. The collection was stopped.");
  return parsed;
}
export function archiveChunks(rows: ArchiveRow[]) {
  const chunks: { requestId: string; rows: ArchiveRow[] }[] = [];
  let batch: ArchiveRow[] = [],
    bytes = 0;
  for (const row of rows) {
    const size = new TextEncoder().encode(JSON.stringify(row)).length;
    if (batch.length && (batch.length >= 500 || bytes + size > 1000000)) {
      chunks.push({ requestId: crypto.randomUUID(), rows: batch });
      batch = [];
      bytes = 0;
    }
    batch.push(row);
    bytes += size;
  }
  if (batch.length) chunks.push({ requestId: crypto.randomUUID(), rows: batch });
  return chunks;
}
export type CollectionProgress = {
  pages: number;
  rows: number;
  inserted: number;
  revised: number;
  unchanged: number;
  message: string;
  complete: boolean;
  paused: boolean;
};

/** All writes use the existing authenticated API. Only one bounded page is in flight. */
export function receiveBrowserCollection(options: {
  source: Window;
  token: string;
  collection: BrowserCollection;
  firstJson: string;
  datasetId: string;
  mapping: ColumnMapping;
  firstReceipt: { inserted: number; revised: number; unchanged: number };
  save: (batch: {
    datasetId: string;
    requestId: string;
    rows: ArchiveRow[];
  }) => Promise<BatchReceipt>;
  report: (progress: CollectionProgress) => void;
}) {
  const { collection, source, token } = options;
  const first = validateCollectionPage(options.firstJson, collection, 1);
  const firstRows = mapArchiveRows(first.table, options.mapping);
  const headers = JSON.stringify(first.table.headers),
    scopeOrigin = new URL(collection.firstUrl).origin;
  const keys = new Set(firstRows.map((r) => r.sourceKey));
  let progress: CollectionProgress = {
    pages: 1,
    rows: firstRows.length,
    ...options.firstReceipt,
    message: "First page saved. Collecting the remaining pages…",
    complete: false,
    paused: false,
  };
  let lastContact = Date.now();
  let busy = false,
    closed = false;
  let pending: {
    page: number;
    json: string;
    chunks: ReturnType<typeof archiveChunks>;
    next: number;
    keys: string[];
  } | null = null;
  let last: { page: number; json: string } | null = null;
  const send = (type: string, values = {}) => {
    if (!source.closed) source.postMessage({ type, token, ...values }, scopeOrigin);
  };
  const report = () => options.report({ ...progress });
  const handle = async (event: MessageEvent) => {
    if (
      closed ||
      event.source !== source ||
      event.origin !== scopeOrigin ||
      event.data?.token !== token
    )
      return;
    lastContact = Date.now();
    const data = event.data;
    if (data.type === "athrecs-collection-status") {
      progress = {
        ...progress,
        paused: true,
        message:
          typeof data.message === "string" ? data.message.slice(0, 1000) : "Collection paused.",
      };
      report();
      return;
    }
    if (data.type === "athrecs-collection-complete") {
      if (
        progress.pages === collection.totalPages &&
        progress.rows === collection.totalRows &&
        data.pages === progress.pages &&
        data.rows === progress.rows
      ) {
        progress = {
          ...progress,
          complete: true,
          paused: false,
          message: `Saved all ${progress.pages} pages (${progress.rows.toLocaleString()} source rows) for ${collection.filterLabel}.`,
        };
        report();
      } else {
        progress = {
          ...progress,
          paused: true,
          message:
            "The source finished before the expected total was saved. Review the partial collection.",
        };
        report();
      }
      return;
    }
    if (
      data.type !== "athrecs-collection-page" ||
      busy ||
      progress.complete ||
      typeof data.json !== "string"
    )
      return;
    busy = true;
    try {
      if (last && last.page === data.page && last.json === data.json) {
        send("athrecs-collection-saved", { page: data.page });
        return;
      }
      if (data.page !== progress.pages + 1)
        throw new Error("The source skipped or repeated a page.");
      if (pending && (pending.page !== data.page || pending.json !== data.json))
        throw new Error("A partially saved page changed. Restart the collection to recheck it.");
      if (!pending) {
        const parsed = validateCollectionPage(data.json, collection, data.page);
        if (JSON.stringify(parsed.table.headers) !== headers)
          throw new Error("Column headings changed between pages.");
        const rows = mapArchiveRows(parsed.table, options.mapping);
        if (rows.some((r) => keys.has(r.sourceKey)))
          throw new Error("A runner was repeated across pages. Review the partial collection.");
        pending = {
          page: data.page,
          json: data.json,
          chunks: archiveChunks(rows),
          next: 0,
          keys: rows.map((r) => r.sourceKey),
        };
      }
      const page = pending;
      progress = {
        ...progress,
        paused: false,
        message: `Saving page ${page.page} of ${collection.totalPages}…`,
      };
      report();
      for (; page.next < page.chunks.length; page.next++) {
        if (closed) return;
        const receipt = await options.save({
          datasetId: options.datasetId,
          ...page.chunks[page.next],
        });
        progress.inserted += receipt.inserted;
        progress.revised += receipt.revised;
        progress.unchanged += receipt.unchanged;
      }
      page.keys.forEach((key) => keys.add(key));
      progress = {
        ...progress,
        pages: page.page,
        rows: keys.size,
        message: `Saved ${page.page} of ${collection.totalPages} pages · ${keys.size.toLocaleString()} source rows.`,
      };
      last = { page: page.page, json: page.json };
      pending = null;
      report();
      send("athrecs-collection-saved", { page: page.page });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Page save failed.";
      progress = {
        ...progress,
        paused: true,
        message: `${message} Saved batches are retained. Use Resume collection in the results tab to retry.`,
      };
      report();
      send("athrecs-collection-error", { page: data.page, message });
    } finally {
      busy = false;
    }
  };
  const monitor = window.setInterval(() => {
    if (progress.complete) {
      window.clearInterval(monitor);
      return;
    }
    if (!busy && !progress.paused && Date.now() - lastContact > 45000) {
      progress = {
        ...progress,
        paused: true,
        message:
          "No next page arrived. Check the results tab and use Resume collection there. Saved batches are retained.",
      };
      send("athrecs-collection-stop");
      report();
    }
    if (source.closed) {
      window.clearInterval(monitor);
      progress = {
        ...progress,
        paused: true,
        message:
          "The results tab was closed. Restart from page 1 when ready; already saved rows are checked for duplicates.",
      };
      report();
    }
  }, 3000);
  const leaving = () => send("athrecs-collection-stop");
  window.addEventListener("beforeunload", leaving);
  window.addEventListener("message", handle);
  report();
  send("athrecs-collection-start");
  return () => {
    closed = true;
    send("athrecs-collection-stop");
    window.clearInterval(monitor);
    window.removeEventListener("beforeunload", leaving);
    window.removeEventListener("message", handle);
  };
}
