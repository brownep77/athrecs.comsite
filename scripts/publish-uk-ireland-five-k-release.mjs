#!/usr/bin/env node
import { createServer } from "vite";

const ACTOR = "athrecs-production-deployment@athrecs.com";
const SOURCE_KEY = "athrecs-code:uk-ireland-five-k-release:2026-08-28";
const SOURCE_URL =
  "https://github.com/brownep77/athrecs.comsite/blob/main/src/data/uk-ireland-five-k-release-2026-08-28.ts";

const isProduction = process.env.VERCEL_ENV === "production";
const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim();
if (!isProduction || (branch && branch !== "main")) {
  console.log(
    `[uk-ireland-five-k] skipping database publication (environment=${process.env.VERCEL_ENV || "local"}, branch=${branch || "unknown"})`,
  );
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required to publish the UK and Ireland 5K release");
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
  const [release, catalogue, publishing, db] = await Promise.all([
    vite.ssrLoadModule("/src/data/uk-ireland-five-k-release-2026-08-28.ts"),
    vite.ssrLoadModule("/src/data/catalogue.ts"),
    vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts"),
    vite.ssrLoadModule("/src/lib/db.ts"),
  ]);
  const sql = await db.getSql();

  for (const replacement of release.ukIrelandFiveKReleaseEditionReplacements) {
    const eventRows = await sql.query(`select id from events where slug = $1 limit 1`, [
      replacement.seriesSlug,
    ]);
    const eventId = eventRows[0]?.id;
    if (!eventId) continue;
    const oldRows = await sql.query(
      `select ed.id,
              exists(select 1 from results where edition_id = ed.id) as has_results
       from editions ed
       where ed.event_id = $1
         and ed.event_date = $2::date
         and ed.distance_code = $3
       limit 1`,
      [eventId, replacement.fromDate, replacement.distance],
    );
    const oldEdition = oldRows[0];
    if (!oldEdition) continue;
    if (oldEdition.has_results) {
      throw new Error(
        `Refusing to migrate ${replacement.seriesSlug}|${replacement.fromDate}|${replacement.distance}: results are attached`,
      );
    }
    const targetRows = await sql.query(
      `select id
       from editions
       where event_id = $1 and event_date = $2::date and distance_code = $3
       limit 1`,
      [eventId, replacement.toDate, replacement.toDistance ?? replacement.distance],
    );
    if (targetRows[0]) {
      await sql.query(`delete from editions where id = $1`, [oldEdition.id]);
    } else {
      await sql.query(
        `update editions
         set event_date = $2::date, distance_code = $3
         where id = $1`,
        [oldEdition.id, replacement.toDate, replacement.toDistance ?? replacement.distance],
      );
    }
  }

  const newSeries = release.ukIrelandFiveKReleaseSeries;
  const newEditions = release.ukIrelandFiveKReleaseEditions;
  const existingEditions = release.ukIrelandFiveKExistingSeriesEditions;
  const correctionKeys = new Set([
    "lifford-strabane-5k-2026|2026-09-20|5K",
    "ruthin-evening-5k|2026-09-02|5K",
    "fountains-abbey-wild-trail-runs|2027-02-28|10K",
    "culzean-castle-trail-runs|2027-03-07|10K",
    "bramham-park-trail-runs|2027-04-04|10K",
    "high-lodge-wild-trail-runs|2027-04-11|10K",
    "gibside-national-trust-trail-10k|2027-05-05|5K",
    "margam-wild-trail-runs|2027-05-23|10K",
    "wentworth-castle-trail-runs|2027-06-16|10K",
  ]);
  const correctedEditions = catalogue.editions.filter((edition) =>
    correctionKeys.has(`${edition.seriesSlug}|${edition.date}|${edition.distance}`),
  );
  if (correctedEditions.length !== correctionKeys.size) {
    const correctedEditionKeys = new Set(
      correctedEditions.map(
        (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`,
      ),
    );
    const missingKeys = [...correctionKeys].filter((key) => !correctedEditionKeys.has(key));
    throw new Error(
      `Expected ${correctionKeys.size} corrected editions, found ${correctedEditions.length}; missing: ${missingKeys.join(", ")}`,
    );
  }

  const editionsByKey = new Map();
  for (const edition of [...newEditions, ...existingEditions, ...correctedEditions]) {
    editionsByKey.set(`${edition.seriesSlug}|${edition.date}|${edition.distance}`, edition);
  }
  const selectedEditions = [...editionsByKey.values()];
  const selectedSlugs = new Set(selectedEditions.map((edition) => edition.seriesSlug));
  const newSeriesBySlug = new Map(newSeries.map((series) => [series.slug, series]));
  const seriesBySlug = new Map(catalogue.seriesList.map((series) => [series.slug, series]));
  const selectedSeries = [...selectedSlugs].map((slug) => {
    const series = newSeriesBySlug.get(slug) ?? seriesBySlug.get(slug);
    if (!series) throw new Error(`Published 5K edition has no event series: ${slug}`);
    return series;
  });

  if (newSeries.length !== 52 || newEditions.length !== 54) {
    throw new Error(
      `New 5K release changed unexpectedly: ${newSeries.length} series, ${newEditions.length} editions`,
    );
  }
  if (selectedSeries.length > 75 || selectedEditions.length > 200) {
    throw new Error(
      `5K release exceeds publisher limits: ${selectedSeries.length} events, ${selectedEditions.length} editions`,
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
      `[uk-ireland-five-k] batch ${staged.batchId} was already published; no database change needed`,
    );
    process.exit(0);
  }
  if (["staged", "invalid", "failed"].includes(state?.status)) {
    const validation = await publishing.validateCatalogueBatch(staged.batchId);
    if (validation.status !== "ready") {
      throw new Error(
        `UK and Ireland 5K release failed validation: ${JSON.stringify(validation.errors || validation)}`,
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
      `UK and Ireland 5K release is not publishable after validation: ${state?.status}${state?.error ? ` — ${state.error}` : ""}`,
    );
  }
  const result = await publishing.publishCatalogueBatch(staged.batchId, ACTOR);
  console.log(
    `[uk-ireland-five-k] published revision ${result.revisionId}: ${result.eventsUpserted} events, ${result.editionsUpserted} editions, ${result.entryOptionsUpserted} entry options`,
  );
} finally {
  await vite.close();
}
