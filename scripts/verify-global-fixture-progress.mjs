import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  verifiedGlobalEditions,
  verifiedGlobalSeries,
} from "../src/data/verified-global-fixtures.ts";

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (inQuotes) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  assert.equal(inQuotes, false, "Source registry contains an unterminated quoted field");
  if (field.length || row.length) {
    row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
    rows.push(row);
  }
  return rows;
}

const registryText = await fs.readFile(
  new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url),
  "utf8",
);
const parsed = parseCsv(registryText.replace(/^\uFEFF/, ""));
const headers = parsed[0];
const registry = parsed
  .slice(1)
  .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]])));
const progress = JSON.parse(
  await fs.readFile(new URL("../docs/global-fixtures/progress.json", import.meta.url), "utf8"),
);

const sourceIds = new Set(registry.map((source) => source.source_id));
const regions = [...new Set(registry.map((source) => source.region_scope))].sort();
const countryFocusLabels = [
  ...new Set(
    registry.flatMap((source) =>
      source.country_focus
        .split("|")
        .map((country) => country.trim())
        .filter(Boolean),
    ),
  ),
].sort();
const enabled = registry.filter((source) => source.enabled === "1");

assert.equal(registry.length, progress.registry_source_count, "Registry source count drifted");
assert.equal(enabled.length, progress.enabled_source_count, "Enabled source count drifted");
assert.equal(
  registry.length - enabled.length,
  progress.rights_or_technical_review_queue,
  "Review queue count drifted",
);
assert.deepEqual(regions, progress.regions_in_scope, "A registry region is missing from scope");
assert.equal(
  countryFocusLabels.length,
  progress.country_focus_labels_in_scope,
  "A country-focus label is missing from scope",
);
assert.equal(progress.participant_result_rows, "excluded");

const checkpoints = new Set();
const checkpointSlugs = [];
const verifiedAtBySlug = new Map();
for (const checkpoint of progress.checkpoints) {
  assert(!checkpoints.has(checkpoint.id), `Duplicate checkpoint ID: ${checkpoint.id}`);
  checkpoints.add(checkpoint.id);
  assert.equal(checkpoint.events_imported, 3, `${checkpoint.id} is not a three-race checkpoint`);
  assert.equal(checkpoint.editions_imported, 3, `${checkpoint.id} has an edition count mismatch`);
  for (const sourceId of checkpoint.source_ids) {
    assert(sourceIds.has(sourceId), `${checkpoint.id} references an unknown source: ${sourceId}`);
  }
  for (const slug of checkpoint.series_slugs) {
    verifiedAtBySlug.set(slug, checkpoint.verified_at);
  }
  checkpointSlugs.push(...checkpoint.series_slugs);
}

for (const source of progress.source_progress) {
  assert(
    sourceIds.has(source.source_id),
    `Progress references an unknown source: ${source.source_id}`,
  );
  assert(checkpoints.has(source.last_checkpoint), `${source.source_id} has no valid checkpoint`);
  assert(["in_progress", "complete", "blocked"].includes(source.status));
}

const globalSlugs = verifiedGlobalSeries.map((series) => series.slug).sort();
assert.deepEqual([...checkpointSlugs].sort(), globalSlugs, "Checkpoint series do not match data");
const checkpointEventCount = progress.checkpoints.reduce(
  (total, checkpoint) => total + checkpoint.events_imported,
  0,
);
const checkpointEditionCount = progress.checkpoints.reduce(
  (total, checkpoint) => total + checkpoint.editions_imported,
  0,
);
assert.equal(
  verifiedGlobalSeries.length,
  checkpointEventCount,
  "Global event total does not match checkpoints",
);
assert.equal(
  verifiedGlobalEditions.length,
  checkpointEditionCount,
  "Global edition total does not match checkpoints",
);

const seriesBySlug = new Map(verifiedGlobalSeries.map((series) => [series.slug, series]));
for (const edition of verifiedGlobalEditions) {
  const series = seriesBySlug.get(edition.seriesSlug);
  assert(series, `${edition.seriesSlug} has no event`);
  assert(edition.date >= progress.checked_at, `${edition.seriesSlug} is not a future fixture`);
  assert(series.country, `${edition.seriesSlug} has no country`);
  assert(series.county, `${edition.seriesSlug} has no county or region`);
  assert(series.city, `${edition.seriesSlug} has no city`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${edition.seriesSlug} needs a source`);
  assert.equal(edition.entryOptions?.length, 1, `${edition.seriesSlug} needs one entry route`);
  assert.equal(
    edition.entryOptions[0].isVerified,
    true,
    `${edition.seriesSlug} entry is unverified`,
  );
  assert.equal(
    edition.entryOptions[0].checkedAt,
    verifiedAtBySlug.get(edition.seriesSlug),
    `${edition.seriesSlug} entry check date does not match its checkpoint`,
  );
}

process.stdout.write(
  JSON.stringify(
    {
      registry_sources: registry.length,
      regions_in_scope: regions.length,
      country_focus_labels_in_scope: countryFocusLabels.length,
      enabled_sources: enabled.length,
      review_queue: registry.length - enabled.length,
      checkpoints: progress.checkpoints.length,
      events_imported: verifiedGlobalSeries.length,
      countries_started: [...new Set(verifiedGlobalSeries.map((series) => series.country))],
      participant_result_rows: progress.participant_result_rows,
    },
    null,
    2,
  ) + "\n",
);
