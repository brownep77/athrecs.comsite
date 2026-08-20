import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { dbSource } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import type { FixtureReviewQueueInput } from "./scraper-workbook-import.server";

export const getPendingFixtureReview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: FixtureReviewQueueInput | undefined) => input ?? {})
  .handler(async ({ data }) => {
    await ensureAthrecsSeeded();
    const { getFixtureReviewQueue } = await import("./scraper-workbook-import.server");
    return getFixtureReviewQueue(data);
  });

export const refreshPendingFixtureReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    await ensureAthrecsSeeded();
    const { stageScraperWorkbookSnapshot } = await import("./scraper-workbook-import.server");
    return stageScraperWorkbookSnapshot();
  });

export const releasePendingFixtures = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { batchId: string; candidateIds: string[]; note?: string }) => input)
  .handler(async ({ data, context }) => {
    await ensureAthrecsSeeded();
    if (dbSource !== "neon") {
      throw new Error("Connect the persistent Neon database before releasing fixtures");
    }
    const { releaseFixtureReviewCandidates } = await import("./scraper-workbook-import.server");
    return releaseFixtureReviewCandidates({
      ...data,
      reviewerUserId: context.userId,
    });
  });
