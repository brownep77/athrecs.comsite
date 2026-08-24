import { createServerFn } from "@tanstack/react-start";
import { dbSource } from "@/lib/db";
import { staffMiddleware } from "@/lib/auth/staff-middleware";

function requirePersistentDatabase(): void {
  if (dbSource !== "neon") {
    throw new Error("Persistent Neon Postgres is required for the staff source workflow");
  }
}

export const getSourceManagement = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { getSourceManagementDashboard } = await import("./source-management.server");
    return getSourceManagementDashboard();
  });

export const previewSourceImportCsv = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { csv: string }) => ({ csv: input?.csv ?? "" }))
  .handler(async ({ data }) => {
    const { previewManagedSourceCsv } = await import("./source-management.server");
    return previewManagedSourceCsv(data.csv);
  });

export const importSourceCsv = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { csv: string }) => ({ csv: input?.csv ?? "" }))
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { importManagedSourceCsv } = await import("./source-management.server");
    return importManagedSourceCsv(data.csv, context.staffEmail);
  });

export const reviewManagedSourceNow = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(
    (input: {
      sourceId: string;
      decision: "approved" | "manual_only" | "rejected";
      duplicateStatus?: "new" | "update";
      note: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { reviewManagedSource } = await import("./source-management.server");
    return reviewManagedSource(data, context.staffEmail);
  });

export const queueManagedCrawlsNow = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { sourceIds?: string[] } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { queueManagedSourceCrawls } = await import("./source-management.server");
    return queueManagedSourceCrawls(data, context.staffEmail);
  });

export const processManagedCrawlQueueNow = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { batchSize?: number } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    requirePersistentDatabase();
    const { processManagedCrawlQueue } = await import("./source-management.server");
    return processManagedCrawlQueue(data, context.staffEmail);
  });
