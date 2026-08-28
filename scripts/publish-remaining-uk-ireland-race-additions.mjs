#!/usr/bin/env node
import { createServer } from "vite";

const ACTOR = "athrecs-production-deployment@athrecs.com";
const NON_STANDARD_SOURCE_KEY =
  "athrecs-code:uk-ireland-non-standard-distances:2026-08-28";
const HALF_TEN_SOURCE_KEY =
  "athrecs-code:uk-ireland-half-ten-mile-and-10k-checkpoints:2026-08-28";
const NON_STANDARD_SOURCE_URL =
  "https://github.com/brownep77/athrecs.comsite/blob/main/src/data/non-standard-races-uk-ireland.ts";
const HALF_TEN_SOURCE_URL =
  "https://github.com/brownep77/athrecs.comsite/blob/main/src/data/half-ten-mile-races-uk-ireland-daily-followup.ts";

const CHECKPOINT_KEYS = [
  "fleet-10k5k-peter-driver-memorial|2026-10-25|10K",
  "fleet-10k5k-peter-driver-memorial|2026-10-25|5K",
  "haltemprice-10k|2026-10-25|10K",
  "jedburgh-half-marathon|2026-10-25|10K",
  "jedburgh-half-marathon|2026-10-25|Half",
  "kernow-killer-october|2026-10-25|10K",
  "monsal-trail-half-marathon-autumn-sunday|2026-10-25|10K",
  "monsal-trail-half-marathon-autumn-sunday|2026-10-25|Half",
  "polesden-lacey-10k|2026-10-25|10K",
];

const isProduction = process.env.VERCEL_ENV === "production";
const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim();
if (!isProduction || (branch && branch !== "main")) {
  console.log(
    `[remaining-races] skipping database publication (environment=${process.env.VERCEL_ENV || "local"}, branch=${branch || "unknown"})`,
  );
  process.exit(0);
}
if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required to publish the remaining reviewed race additions");
}

function parseEditionKey(key) {
  const first = key.indexOf("|");
  const second = key.indexOf("|", first + 1);
  if (first < 1 || second < 0) throw new Error(`Invalid edition key: ${key}`);
  return {
    slug: key.slice(0, first),
    date: key.slice(first + 1, second),
    distance: key.slice(second + 1),
  };
}

function editionKey(edition) {
  return `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
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
  };
}

function dedupeBy(items, keyFor) {
  return [...new Map(items.map((item) => [keyFor(item), item])).values()];
}

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const [catalogue, coreData, nonStandard, daily, entryData, publishing, db] =
    await Promise.all([
      vite.ssrLoadModule("/src/data/catalogue.ts"),
      vite.ssrLoadModule("/src/data/editions.ts"),
      vite.ssrLoadModule("/src/data/non-standard-races-uk-ireland.ts"),
      vite.ssrLoadModule("/src/data/half-ten-mile-races-uk-ireland-daily-followup.ts"),
      vite.ssrLoadModule("/src/data/entry-options.ts"),
      vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts"),
      vite.ssrLoadModule("/src/lib/db.ts"),
    ]);

  const sql = await db.getSql();
  const seriesBySlug = new Map(catalogue.seriesList.map((series) => [series.slug, series]));
  const coreEditions = coreData.editions ?? [];

  function canonicalSlug(slug) {
    return entryData.canonicalEventSlug?.(slug) ?? entryData.eventSlugAliases?.[slug] ?? slug;
  }

  function resolveSeriesSlug(slug) {
    const canonical = canonicalSlug(slug);
    if (seriesBySlug.has(canonical)) return canonical;
    if (seriesBySlug.has(slug)) return slug;
    throw new Error(`Reviewed race series is missing from the merged catalogue: ${slug}`);
  }

  function resolveProvidedEdition(sourceEdition) {
    const sourceKey = editionKey(sourceEdition);
    const override = entryData.editionOverrides?.[sourceKey] ?? {};
    const effective = { ...sourceEdition, ...override };
    const options = entryData.entryOptions?.[sourceKey] ?? effective.entryOptions;
    const seriesSlug = resolveSeriesSlug(effective.seriesSlug);
    return {
      ...effective,
      seriesSlug,
      ...(options?.length ? { entryOptions: options } : {}),
    };
  }

  function resolveEditionFromSourceKey(sourceKey) {
    const parsed = parseEditionKey(sourceKey);
    const override = entryData.editionOverrides?.[sourceKey] ?? {};
    const effectiveDate = override.date ?? parsed.date;
    const effectiveDistance = override.distance ?? parsed.distance;
    const resolvedSlug = resolveSeriesSlug(parsed.slug);
    const base =
      coreEditions.find(
        (edition) =>
          edition.seriesSlug === parsed.slug &&
          edition.date === parsed.date &&
          edition.distance === parsed.distance,
      ) ??
      catalogue.editions.find(
        (edition) =>
          (edition.seriesSlug === parsed.slug || edition.seriesSlug === resolvedSlug) &&
          edition.date === effectiveDate &&
          edition.distance === effectiveDistance,
      );
    if (!base) throw new Error(`Reviewed source edition is missing: ${sourceKey}`);
    const effective = {
      ...base,
      ...override,
      seriesSlug: resolvedSlug,
      date: effectiveDate,
      distance: effectiveDistance,
    };
    const options = entryData.entryOptions?.[sourceKey] ?? effective.entryOptions;
    return {
      ...effective,
      ...(options?.length ? { entryOptions: options } : {}),
    };
  }

  function eventsFor(slugs) {
    return dedupeBy(
      [...slugs].map((slug) => {
        const resolved = resolveSeriesSlug(slug);
        return eventInput(seriesBySlug.get(resolved));
      }),
      (event) => event.slug,
    );
  }

  const nonStandardEditions = dedupeBy(
    [
      ...nonStandard.verifiedNonStandardDistanceEditions.map(resolveProvidedEdition),
      ...Object.keys(nonStandard.nonStandardDistanceEditionOverrides).map(
        resolveEditionFromSourceKey,
      ),
    ],
    editionKey,
  );
  const nonStandardSlugs = new Set([
    ...nonStandard.verifiedNonStandardDistanceSeries.map((series) => series.slug),
    ...Object.keys(nonStandard.nonStandardDistanceSeriesOverrides),
    ...nonStandardEditions.map((edition) => edition.seriesSlug),
  ]);

  const halfTenEditions = dedupeBy(
    [
      ...daily.dailyHalfTenMileEditions.map(resolveProvidedEdition),
      ...daily.dailyHalfTenMileExistingSeriesEditions.map(resolveProvidedEdition),
      ...Object.keys(daily.dailyHalfTenMileEditionOverrides).map(resolveEditionFromSourceKey),
      ...CHECKPOINT_KEYS.map(resolveEditionFromSourceKey),
    ],
    editionKey,
  );
  const halfTenSlugs = new Set([
    ...daily.dailyHalfTenMileSeries.map((series) => series.slug),
    ...Object.keys(daily.dailyHalfTenMileSeriesOverrides),
    ...CHECKPOINT_KEYS.map((key) => parseEditionKey(key).slug),
    ...halfTenEditions.map((edition) => edition.seriesSlug),
  ]);

  const batches = [
    {
      label: "non-standard-distances",
      sourceKey: NON_STANDARD_SOURCE_KEY,
      sourceUrl: NON_STANDARD_SOURCE_URL,
      events: eventsFor(nonStandardSlugs),
      editions: nonStandardEditions.map(editionInput),
    },
    {
      label: "half-ten-mile-and-10k-checkpoints",
      sourceKey: HALF_TEN_SOURCE_KEY,
      sourceUrl: HALF_TEN_SOURCE_URL,
      events: eventsFor(halfTenSlugs),
      editions: halfTenEditions.map(editionInput),
    },
  ];

  for (const batch of batches) {
    if (batch.events.length > 75 || batch.editions.length > 200) {
      throw new Error(
        `${batch.label} exceeds publisher limits: ${batch.events.length} events, ${batch.editions.length} editions`,
      );
    }
  }

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
    let status = await loadBatchStatus(staged.batchId);
    if (status.status === "published") {
      console.log(
        `[remaining-races] ${batch.label} batch ${staged.batchId} was already published; no database change needed`,
      );
      return;
    }
    if (["staged", "invalid", "failed"].includes(status.status)) {
      const validation = await publishing.validateCatalogueBatch(staged.batchId);
      if (validation.status !== "ready") {
        throw new Error(
          `${batch.label} failed validation: ${JSON.stringify(validation.errors || validation)}`,
        );
      }
    }
    status = await loadBatchStatus(staged.batchId);
    if (status.status !== "ready") {
      throw new Error(
        `${batch.label} is not publishable after validation: ${status.status}${status.error ? ` — ${status.error}` : ""}`,
      );
    }
    const result = await publishing.publishCatalogueBatch(staged.batchId, ACTOR);
    console.log(
      `[remaining-races] published ${batch.label} revision ${result.revisionId}: ${result.eventsUpserted} events, ${result.editionsUpserted} editions, ${result.entryOptionsUpserted} entry options`,
    );
  }

  async function applyEditionReplacements(tx) {
    const eventRows = await tx.query("select id, slug from events");
    const eventIds = new Map(eventRows.map((row) => [row.slug, row.id]));
    for (const replacement of nonStandard.nonStandardDistanceEditionReplacements) {
      const resolvedSlug = canonicalSlug(replacement.seriesSlug);
      const eventId = eventIds.get(resolvedSlug) ?? eventIds.get(replacement.seriesSlug);
      if (!eventId) continue;
      const targetDistance = replacement.toDistance ?? replacement.distance;
      await tx.query(
        `update editions old_edition
         set event_date = $4::date,
             distance_code = $5::text
         where old_edition.event_id = $1::int
           and old_edition.event_date = $2::date
           and old_edition.distance_code = $3::text
           and not exists (select 1 from results where edition_id = old_edition.id)
           and not exists (
             select 1 from editions corrected_edition
             where corrected_edition.event_id = old_edition.event_id
               and corrected_edition.event_date = $4::date
               and corrected_edition.distance_code = $5::text
           )`,
        [eventId, replacement.fromDate, replacement.distance, replacement.toDate, targetDistance],
      );
      await tx.query(
        `delete from editions old_edition
         where old_edition.event_id = $1::int
           and old_edition.event_date = $2::date
           and old_edition.distance_code = $3::text
           and not exists (select 1 from results where edition_id = old_edition.id)
           and exists (
             select 1 from editions corrected_edition
             where corrected_edition.event_id = old_edition.event_id
               and corrected_edition.event_date = $4::date
               and corrected_edition.distance_code = $5::text
           )`,
        [eventId, replacement.fromDate, replacement.distance, replacement.toDate, targetDistance],
      );
    }
  }

  async function retireSafeAliases(tx) {
    let retired = 0;
    for (const [aliasSlug, canonicalSlugValue] of Object.entries(
      nonStandard.nonStandardDistanceSlugAliases,
    )) {
      const rows = await tx.query(
        "select id, slug from events where slug = any($1::text[])",
        [[aliasSlug, canonicalSlugValue]],
      );
      const alias = rows.find((row) => row.slug === aliasSlug);
      const canonical = rows.find((row) => row.slug === canonicalSlugValue);
      if (!alias) continue;
      if (!canonical) throw new Error(`Cannot retire ${aliasSlug}: ${canonicalSlugValue} is missing`);
      const dependencies = await tx.query(
        `select
           (select count(*)::int from results r join editions e on e.id = r.edition_id where e.event_id = $1) as results,
           (select count(*)::int from edition_result_links l join editions e on e.id = l.edition_id where e.event_id = $1) as result_links`,
        [alias.id],
      );
      if ((dependencies[0]?.results ?? 0) > 0 || (dependencies[0]?.result_links ?? 0) > 0) {
        console.log(`[remaining-races] retained alias ${aliasSlug}: stored result dependencies exist`);
        continue;
      }
      await tx.query(
        `insert into event_distances (event_id, distance_code)
         select $2, distance_code from event_distances where event_id = $1
         on conflict do nothing`,
        [alias.id, canonical.id],
      );
      await tx.query(
        `insert into event_groups (event_id, group_code, label, level, source_url, checked_at, note)
         select $2, group_code, label, level, source_url, checked_at, note
         from event_groups where event_id = $1
         on conflict do nothing`,
        [alias.id, canonical.id],
      );
      const aliasEditions = await tx.query(
        "select id, event_date::text as event_date, distance_code from editions where event_id = $1",
        [alias.id],
      );
      for (const edition of aliasEditions) {
        const duplicate = await tx.query(
          `select id from editions
           where event_id = $1 and event_date = $2::date and distance_code = $3
           limit 1`,
          [canonical.id, edition.event_date, edition.distance_code],
        );
        if (duplicate[0]) {
          await tx.query("delete from editions where id = $1", [edition.id]);
        } else {
          await tx.query("update editions set event_id = $2 where id = $1", [edition.id, canonical.id]);
        }
      }
      await tx.query("delete from events where id = $1", [alias.id]);
      retired += 1;
    }
    if (retired) console.log(`[remaining-races] retired ${retired} duplicate event aliases`);
  }

  await sql.transaction(async (tx) => applyEditionReplacements(tx));
  for (const batch of batches) await publishBatch(batch);
  await sql.transaction(async (tx) => {
    await applyEditionReplacements(tx);
    await retireSafeAliases(tx);
  });
} finally {
  await vite.close();
}
