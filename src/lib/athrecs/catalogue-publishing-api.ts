import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import type { CatalogueBatchInput } from "./catalogue-publishing.server";

function batchIdInput(input: { batchId: string }) {
  const batchId = input?.batchId?.trim();
  if (!batchId) throw new Error("batchId is required");
  return { batchId };
}

function revisionInput(input: { revisionId: number }) {
  const revisionId = Number(input?.revisionId);
  if (!Number.isInteger(revisionId) || revisionId <= 0) {
    throw new Error("revisionId must be a positive integer");
  }
  return { revisionId };
}

export const getCataloguePublishing = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { getCataloguePublishingDashboard } = await import("./catalogue-publishing.server");
    return JSON.parse(JSON.stringify(await getCataloguePublishingDashboard()));
  });

export const stageCatalogueImport = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: CatalogueBatchInput) => input)
  .handler(async ({ data, context }) => {
    const { stageCatalogueBatch } = await import("./catalogue-publishing.server");
    return stageCatalogueBatch(data, context.staffEmail);
  });

export const validateCatalogueImport = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(batchIdInput)
  .handler(async ({ data }) => {
    const { validateCatalogueBatch } = await import("./catalogue-publishing.server");
    return validateCatalogueBatch(data.batchId);
  });

export const publishCatalogueImport = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(batchIdInput)
  .handler(async ({ data, context }) => {
    const { publishCatalogueBatch } = await import("./catalogue-publishing.server");
    return publishCatalogueBatch(data.batchId, context.staffEmail);
  });

export const rollbackCatalogueImport = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(revisionInput)
  .handler(async ({ data, context }) => {
    const { rollbackCatalogueRevision } = await import("./catalogue-publishing.server");
    return rollbackCatalogueRevision(data.revisionId, context.staffEmail);
  });
