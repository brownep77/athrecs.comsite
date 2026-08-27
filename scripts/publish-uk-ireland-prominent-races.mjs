#!/usr/bin/env node
import { createServer } from "vite";

const SOURCE_KEY = "athrecs-code:uk-ireland-prominent-races:2026-08-27";
const SOURCE_URL =
  "https://github.com/brownep77/athrecs.comsite/blob/main/src/data/uk-ireland-prominent-races-2026-2027.ts";
const ACTOR = "athrecs-production-deployment@athrecs.com";

const isProduction = process.env.VERCEL_ENV === "production";
const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim();
if (!isProduction || (branch && branch !== "main")) {
  console.log(
    `[prominent-races] skipping database publication (environment=${process.env.VERCEL_ENV || "local"}, branch=${branch || "unknown"})`,
  );
  process.exit(0);
}

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required to publish the reviewed UK and Ireland race batch");
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
    ...(edition.entryOptions ? { entryOptions: edition.entryOptions } : {}),
    ...(edition.source ? { source: edition.source } : {}),
  };
}

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const data = await vite.ssrLoadModule(
    "/src/data/uk-ireland-prominent-races-2026-2027.ts",
  );
  const publishing = await vite.ssrLoadModule(
    "/src/lib/athrecs/catalogue-publishing.server.ts",
  );
  const { getSql } = await vite.ssrLoadModule("/src/lib/db.ts");
  const sql = await getSql();

  async function loadBatchStatus(batchId) {
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

  const existingEventInputs = Object.entries(data.prominentUkIrelandSeriesOverrides).map(
    ([slug, override]) =>
      eventInput({
        slug,
        name: override.name || slug,
        sport: "Running",
        country: override.country || "Ireland",
        county: override.county || "",
        city: override.city || "",
        area: override.area || "",
        surface: override.surface || "Road",
        distances: override.distances || ["Other"],
        summary: override.summary || override.name || slug,
        description: override.description || "",
        organiser: override.organiser || "",
        website: override.website || SOURCE_URL,
      }),
  );

  const existingEditionInputs = [
    {
      eventSlug: "dingle-marathon-half-2026",
      date: "2026-09-05",
      distance: "Half",
      distanceKm: 21.0975,
      status: "Closed",
      entryUrl: "https://dinglemarathon.ie/",
      entryOptions:
        data.prominentUkIrelandEntryOptions[
          "dingle-marathon-half-2026|2026-09-05|Half"
        ],
      source: "https://dinglemarathon.ie/",
    },
    {
      eventSlug: "connemara-international-marathon",
      date: "2027-04-25",
      distance: "Marathon",
      distanceKm: 42.195,
      status: "Open",
      entryUrl: "https://www.connemarathon.com/international/",
      entryOptions:
        data.prominentUkIrelandEntryOptions[
          "connemara-international-marathon|2027-04-25|Marathon"
        ],
      source: "https://www.connemarathon.com/international/",
    },
    {
      eventSlug: "the-village-run-5k-2026",
      date: "2026-09-27",
      distance: "5K",
      distanceKm: 5,
      status: "Open",
      entryUrl: "https://www.popupraces.ie/race/the-village-run-2026/",
      entryOptions:
        data.prominentUkIrelandEntryOptions[
          "the-village-run-5k-2026|2026-09-27|5K"
        ],
      source: "https://www.popupraces.ie/race/the-village-run-2026/",
    },
  ];

  const payload = {
    sourceKey: SOURCE_KEY,
    sourceUrl: SOURCE_URL,
    events: [
      ...data.prominentUkIrelandSeries.map(eventInput),
      ...existingEventInputs,
    ],
    editions: [
      ...data.prominentUkIrelandEditions.map(editionInput),
      ...existingEditionInputs,
    ],
  };

  if (payload.events.length > 75 || payload.editions.length > 200) {
    throw new Error(
      `Reviewed race batch exceeds publisher limits: ${payload.events.length} events, ${payload.editions.length} editions`,
    );
  }

  const staged = await publishing.stageCatalogueBatch(payload, ACTOR);
  let batch = await loadBatchStatus(staged.batchId);

  if (batch.status === "published") {
    console.log(
      `[prominent-races] batch ${staged.batchId} was already published; no database change needed`,
    );
  } else {
    if (["staged", "invalid", "failed"].includes(batch.status)) {
      const validation = await publishing.validateCatalogueBatch(staged.batchId);
      if (validation.status !== "ready") {
        throw new Error(
          `Reviewed race batch failed validation: ${JSON.stringify(validation.errors || validation)}`,
        );
      }
    }

    batch = await loadBatchStatus(staged.batchId);
    if (batch.status !== "ready") {
      throw new Error(
        `Catalogue batch is not publishable after validation: ${batch.status}${batch.error ? ` — ${batch.error}` : ""}`,
      );
    }

    const result = await publishing.publishCatalogueBatch(staged.batchId, ACTOR);
    console.log(
      `[prominent-races] published revision ${result.revisionId}: ${result.eventsUpserted} events, ${result.editionsUpserted} editions, ${result.entryOptionsUpserted} entry options`,
    );
  }
} finally {
  await vite.close();
}
