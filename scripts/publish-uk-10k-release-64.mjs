#!/usr/bin/env node
import { createServer } from "vite";

const ACTOR = "athrecs-production-deployment@athrecs.com";
const SOURCE_KEY = "athrecs-code:uk-10k-release-64:2026-08-29";
const SOURCE_URL =
  "https://github.com/brownep77/athrecs.comsite/blob/main/src/data/uk-10k-release-64.ts";

const isProduction = process.env.VERCEL_ENV === "production";
const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim();

if (!isProduction || (branch && branch !== "main")) {
  console.log(
    `[uk-10k-release-64] skipping database publication (environment=${process.env.VERCEL_ENV || "local"}, branch=${branch || "unknown"})`,
  );
} else {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required to publish UK 10K release 64");
  }

  const eventInput = (series) => ({
    slug: series.slug,
    name: series.name,
    sport: series.sport,
    country: series.country,
    county: series.county,
    city: series.city,
    area: series.area,
    surface: series.surface,
    summary: series.summary,
    description: series.description,
    organiser: series.organiser,
    website: series.website,
    distances: series.distances,
  });

  const editionInput = (edition) => ({
    eventSlug: edition.seriesSlug,
    date: edition.date,
    distance: edition.distance,
    distanceKm: edition.distanceKm,
    status: edition.status,
    ...(edition.startTime ? { startTime: edition.startTime } : {}),
    ...(edition.entryUrl ? { entryUrl: edition.entryUrl } : {}),
    ...(edition.entryOptions?.length ? { entryOptions: edition.entryOptions } : {}),
    ...(edition.source ? { source: edition.source } : {}),
    ...(edition.notes ? { notes: edition.notes } : {}),
  });

  const keyOf = (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  const vite = await createServer({
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true },
  });

  try {
    const [release, catalogue, publishing, db] = await Promise.all([
      vite.ssrLoadModule("/src/data/uk-10k-release-64.ts"),
      vite.ssrLoadModule("/src/data/catalogue.ts"),
      vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts"),
      vite.ssrLoadModule("/src/lib/db.ts"),
    ]);
    const sql = await db.getSql();
    const requestedKeys = [...release.ukTenKRelease64Keys];
    const requestedKeySet = new Set(requestedKeys);
    const editionsByKey = new Map(
      catalogue.editions
        .filter((edition) => requestedKeySet.has(keyOf(edition)))
        .map((edition) => [keyOf(edition), edition]),
    );
    const missingKeys = requestedKeys.filter((key) => !editionsByKey.has(key));
    if (missingKeys.length) {
      throw new Error(`UK 10K release 64 is missing catalogue editions: ${missingKeys.join(", ")}`);
    }

    const selectedEditions = requestedKeys.map((key) => editionsByKey.get(key));
    for (const edition of selectedEditions) {
      const primary = edition.entryOptions?.find(
        (option) => option.isPrimary && option.isVerified,
      );
      if (!primary) {
        throw new Error(`UK 10K release 64 has no verified primary entry option: ${keyOf(edition)}`);
      }
      const expected = release.ukTenKRelease64ExpectedPrimaryUrls[keyOf(edition)];
      if (primary.entryUrl !== expected) {
        throw new Error(
          `UK 10K release 64 primary URL mismatch for ${keyOf(edition)}: ${primary.entryUrl}`,
        );
      }
    }

    const selectedSlugs = new Set(selectedEditions.map((edition) => edition.seriesSlug));
    const seriesBySlug = new Map(catalogue.seriesList.map((series) => [series.slug, series]));
    const selectedSeries = [...selectedSlugs].map((slug) => {
      const series = seriesBySlug.get(slug);
      if (!series) throw new Error(`UK 10K release 64 has no event series: ${slug}`);
      return series;
    });

    if (selectedSeries.length !== 12 || selectedEditions.length !== 12) {
      throw new Error(
        `UK 10K release 64 changed unexpectedly: ${selectedSeries.length} events, ${selectedEditions.length} editions`,
      );
    }

    const staged = await publishing.stageCatalogueBatch(
      {
        sourceKey: SOURCE_KEY,
        sourceUrl: SOURCE_URL,
        events: selectedSeries.map(eventInput),
        editions: selectedEditions.map(editionInput),
      },
      ACTOR,
    );

    const batchRows = await sql.query(
      `select status, error from catalogue_import_batches where id = $1 limit 1`,
      [staged.batchId],
    );
    let state = batchRows[0];
    if (state?.status === "published") {
      console.log(
        `[uk-10k-release-64] batch ${staged.batchId} was already published; no database change needed`,
      );
    } else {
      if (["staged", "invalid", "failed"].includes(state?.status)) {
        const validation = await publishing.validateCatalogueBatch(staged.batchId);
        if (validation.status !== "ready") {
          throw new Error(
            `UK 10K release 64 failed validation: ${JSON.stringify(validation.errors || validation)}`,
          );
        }
      }

      const readyRows = await sql.query(
        `select status, error from catalogue_import_batches where id = $1 limit 1`,
        [staged.batchId],
      );
      state = readyRows[0];
      if (state?.status !== "ready") {
        throw new Error(
          `UK 10K release 64 is not publishable after validation: ${state?.status}${state?.error ? ` — ${state.error}` : ""}`,
        );
      }

      const result = await publishing.publishCatalogueBatch(staged.batchId, ACTOR);
      console.log(
        `[uk-10k-release-64] published revision ${result.revisionId}: ${result.eventsUpserted} events, ${result.editionsUpserted} editions, ${result.entryOptionsUpserted} entry options`,
      );
    }
  } finally {
    await vite.close();
  }
}
