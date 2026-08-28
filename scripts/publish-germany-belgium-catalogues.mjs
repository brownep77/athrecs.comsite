#!/usr/bin/env node
import { createServer } from "vite";

const ACTOR = "athrecs-production-deployment@athrecs.com";
const GERMANY_SOURCE_KEY = "athrecs-code:germany-endurance-calendar:2026-08-28";
const BELGIUM_SOURCE_KEYS = [
  "athrecs-code:belgium-restricted-competitions:a:2026-08-28",
  "athrecs-code:belgium-restricted-competitions:b:2026-08-28",
];
const GERMANY_SOURCE_URL =
  "https://github.com/brownep77/athrecs.comsite/blob/main/src/data/germany-endurance-races.ts";
const BELGIUM_SOURCE_URL =
  "https://github.com/brownep77/athrecs.comsite/blob/main/src/data/belgium-elite-youth-competitions.ts";

const isProduction = process.env.VERCEL_ENV === "production";
const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim();
if (!isProduction || (branch && branch !== "main")) {
  console.log(
    `[germany-belgium] skipping database publication (environment=${process.env.VERCEL_ENV || "local"}, branch=${branch || "unknown"})`,
  );
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required to publish the Germany and Belgium catalogues");
}

function eventInput(series) {
  return {
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
  };
}

function editionInput(edition) {
  return {
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
  };
}

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [germany, belgium, publishing, db] = await Promise.all([
    vite.ssrLoadModule("/src/data/germany-endurance-races.ts"),
    vite.ssrLoadModule("/src/data/belgium-elite-youth-competitions.ts"),
    vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts"),
    vite.ssrLoadModule("/src/lib/db.ts"),
  ]);
  const sql = await db.getSql();

  const belgiumSeries = belgium.belgiumEliteYouthCompetitionSeries;
  const belgiumEditions = belgium.belgiumEliteYouthCompetitionEditions;
  if (belgiumSeries.length !== 100 || belgiumEditions.length !== 100) {
    throw new Error(
      `Belgium restricted catalogue changed unexpectedly: ${belgiumSeries.length} series, ${belgiumEditions.length} editions`,
    );
  }

  const batches = [
    {
      label: "germany-endurance",
      sourceKey: GERMANY_SOURCE_KEY,
      sourceUrl: GERMANY_SOURCE_URL,
      events: germany.germanyEnduranceRaceSeries.map(eventInput),
      editions: germany.germanyEnduranceRaceEditions.map(editionInput),
    },
    ...BELGIUM_SOURCE_KEYS.map((sourceKey, index) => {
      const start = index * 50;
      const selectedSeries = belgiumSeries.slice(start, start + 50);
      const selectedSlugs = new Set(selectedSeries.map((series) => series.slug));
      return {
        label: `belgium-restricted-${index === 0 ? "a" : "b"}`,
        sourceKey,
        sourceUrl: BELGIUM_SOURCE_URL,
        events: selectedSeries.map(eventInput),
        editions: belgiumEditions
          .filter((edition) => selectedSlugs.has(edition.seriesSlug))
          .map(editionInput),
      };
    }),
  ];

  for (const batch of batches) {
    if (!batch.events.length || !batch.editions.length) {
      throw new Error(`${batch.label} is unexpectedly empty`);
    }
    if (batch.events.length > 75 || batch.editions.length > 200) {
      throw new Error(
        `${batch.label} exceeds publisher limits: ${batch.events.length} events, ${batch.editions.length} editions`,
      );
    }
  }

  async function batchStatus(batchId) {
    const rows = await sql.query(
      `select status, error
       from catalogue_import_batches
       where id = $1
       limit 1`,
      [batchId],
    );
    if (!rows[0]) throw new Error(`Catalogue batch not found: ${batchId}`);
    return rows[0];
  }

  async function publishBatch(batch) {
    const staged = await publishing.stageCatalogueBatch(
      {
        sourceKey: batch.sourceKey,
        sourceUrl: batch.sourceUrl,
        events: batch.events,
        editions: batch.editions,
      },
      ACTOR,
    );
    let state = await batchStatus(staged.batchId);
    if (state.status === "published") {
      console.log(
        `[germany-belgium] ${batch.label} batch ${staged.batchId} was already published; no database change needed`,
      );
      return;
    }
    if (["staged", "invalid", "failed"].includes(state.status)) {
      const validation = await publishing.validateCatalogueBatch(staged.batchId);
      if (validation.status !== "ready") {
        throw new Error(
          `${batch.label} failed validation: ${JSON.stringify(validation.errors || validation)}`,
        );
      }
    }
    state = await batchStatus(staged.batchId);
    if (state.status !== "ready") {
      throw new Error(
        `${batch.label} is not publishable after validation: ${state.status}${state.error ? ` — ${state.error}` : ""}`,
      );
    }
    const result = await publishing.publishCatalogueBatch(staged.batchId, ACTOR);
    console.log(
      `[germany-belgium] published ${batch.label} revision ${result.revisionId}: ${result.eventsUpserted} events, ${result.editionsUpserted} editions, ${result.entryOptionsUpserted} entry options`,
    );
  }

  for (const batch of batches) await publishBatch(batch);
} finally {
  await vite.close();
}
