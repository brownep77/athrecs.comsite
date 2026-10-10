import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
import { getSql, dbSource } from "../db";
import { batchSchema, datasetSchema, positiveId, reviewSchema } from "./core";
import * as service from "./service.server";

const actor = (context: { userId: string; staffEmail: string }) => ({
  userId: context.userId,
  staffEmail: context.staffEmail,
});
async function writableSql() {
  if (dbSource !== "neon") throw new Error("Connect persistent storage before saving an archive");
  if (process.env.VERCEL_ENV === "preview")
    throw new Error("Archive writes are disabled in deployment previews");
  return getSql();
}
const listing = z.object({
  q: z.string().trim().max(160).default(""),
  after: positiveId.optional(),
  datasetId: z.string().uuid().optional(),
  state: z.enum(["all", "unmatched", "linked", "changed", "held"]).default("all"),
});
export const getArchiveOverview = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => service.archiveOverview(await getSql()));
export const findArchiveEditions = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { q: string }) =>
    z.object({ q: z.string().trim().min(2).max(160) }).parse(input),
  )
  .handler(async ({ data }) => service.searchArchiveEditions(await getSql(), data.q));
export const createResultsDataset = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof datasetSchema>) => datasetSchema.parse(input))
  .handler(async ({ data, context }) =>
    service.createArchiveDataset(await writableSql(), data, actor(context)),
  );
export const saveArchiveBatch = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof batchSchema>) => batchSchema.parse(input))
  .handler(async ({ data, context }) =>
    service.ingestArchiveBatch(await writableSql(), data, actor(context)),
  );
export const getArchiveEntries = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof listing>) => listing.parse(input))
  .handler(async ({ data }) => service.listArchiveEntries(await getSql(), data));
export const getArchiveEntry = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { entryId: number; athleteId?: number }) =>
    z.object({ entryId: positiveId, athleteId: positiveId.optional() }).parse(input),
  )
  .handler(async ({ data }) =>
    service.archiveEntryDetail(await getSql(), data.entryId, data.athleteId),
  );
export const findArchiveAthletes = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { entryId: number; q?: string }) =>
    z.object({ entryId: positiveId, q: z.string().trim().max(160).default("") }).parse(input),
  )
  .handler(async ({ data }) => service.archiveCandidates(await getSql(), data.entryId, data.q));
export const reviewArchivedResult = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: z.input<typeof reviewSchema>) => reviewSchema.parse(input))
  .handler(async ({ data, context }) =>
    service.reviewArchiveEntry(await writableSql(), data, actor(context)),
  );
export const findCanonicalResults = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { q?: string; after?: number; editionId?: number }) =>
    z
      .object({
        q: z.string().trim().max(160).default(""),
        after: positiveId.optional(),
        editionId: positiveId.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => service.searchCanonicalResults(await getSql(), data));
