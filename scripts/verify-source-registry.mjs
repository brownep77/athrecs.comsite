import assert from "node:assert/strict";
import fs from "node:fs";

const registryUrl = new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url);

const expectedHeaders = [
  "source_id",
  "source_name",
  "start_url",
  "source_type",
  "enabled",
  "source_section",
  "region_scope",
  "country_focus",
  "coverage_scope",
  "coverage_start_year",
  "coverage_end_year",
  "surface_scope",
  "timing_scope",
  "chip_timed_status",
  "permission_url",
  "allowed_domains",
  "race_link_include_regex",
  "race_link_exclude_regex",
  "profile",
  "follow_history_links",
  "max_pages",
  "rate_limit_seconds",
  "rights_status",
  "notes",
];

const enabledRightsStatuses = new Set([
  "No published crawl restriction found",
  "Permitted by published crawl rules",
  "Permitted subject to published crawl delay",
  "Reference metadata permitted by published crawl signal",
]);

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
      continue;
    }

    if (char === '"') {
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
  if (field.length > 0 || row.length > 0) {
    row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
    rows.push(row);
  }
  return rows;
}

function countBy(rows, field) {
  return Object.fromEntries(
    [
      ...rows.reduce((counts, row) => {
        counts.set(row[field], (counts.get(row[field]) ?? 0) + 1);
        return counts;
      }, new Map()),
    ].sort(([left], [right]) => left.localeCompare(right)),
  );
}

const parsed = parseCsv(fs.readFileSync(registryUrl, "utf8").replace(/^\uFEFF/, ""));
assert(parsed.length > 1, "Source registry is empty");
assert.deepEqual(parsed[0], expectedHeaders, "Source registry headers changed unexpectedly");

const rows = parsed.slice(1).map((values, index) => {
  assert.equal(
    values.length,
    expectedHeaders.length,
    "Source registry row " + (index + 2) + " has the wrong number of columns",
  );
  return Object.fromEntries(expectedHeaders.map((header, column) => [header, values[column]]));
});

assert.equal(rows.length, 271, "Source registry row count changed unexpectedly");
assert.equal(
  new Set(rows.map((row) => row.source_id)).size,
  rows.length,
  "Source registry contains duplicate source IDs",
);

for (const [index, row] of rows.entries()) {
  const label = "Source registry row " + (index + 2) + " (" + row.source_id + ")";
  assert.match(row.source_id, /^[a-z0-9_]+$/, label + " has an invalid source ID");
  assert(row.source_name.trim(), label + " has no source name");
  assert(
    ["directory", "results", "sitemap"].includes(row.source_type),
    label + " has an invalid source type",
  );
  assert(["0", "1"].includes(row.enabled), label + " has an invalid enabled flag");
  assert(["0", "1"].includes(row.follow_history_links), label + " has an invalid history flag");
  assert(row.profile.trim(), label + " has no extraction profile");
  assert(row.rights_status.trim(), label + " has no rights status");
  assert(row.notes.trim(), label + " has no safety note");

  const startUrl = new URL(row.start_url);
  assert(["http:", "https:"].includes(startUrl.protocol), label + " has an invalid start URL");
  if (row.permission_url) {
    const permissionUrl = new URL(row.permission_url);
    assert(
      ["http:", "https:"].includes(permissionUrl.protocol),
      label + " has an invalid permission URL",
    );
  }

  const domains = row.allowed_domains.split("|").map((domain) => domain.trim().toLowerCase());
  assert(domains.every(Boolean), label + " has an empty allowed domain");
  assert(
    domains.includes(startUrl.hostname.toLowerCase()),
    label + " does not allow its own start URL hostname",
  );

  const maxPages = Number(row.max_pages);
  const rateLimit = Number(row.rate_limit_seconds);
  assert(Number.isInteger(maxPages) && maxPages > 0, label + " has an invalid max_pages value");
  assert(Number.isFinite(rateLimit) && rateLimit > 0, label + " has an invalid rate limit");

  const hasStartYear = row.coverage_start_year !== "";
  const hasEndYear = row.coverage_end_year !== "";
  assert.equal(hasStartYear, hasEndYear, label + " has only one coverage year");
  if (hasStartYear) {
    const startYear = Number(row.coverage_start_year);
    const endYear = Number(row.coverage_end_year);
    assert(
      Number.isInteger(startYear) && Number.isInteger(endYear),
      label + " has an invalid coverage year",
    );
    assert(startYear <= endYear, label + " has a reversed coverage range");
  }

  for (const [name, pattern] of [
    ["include", row.race_link_include_regex],
    ["exclude", row.race_link_exclude_regex],
  ]) {
    if (!pattern) continue;
    assert.doesNotThrow(() => new RegExp(pattern), label + " has an invalid " + name + " regex");
  }

  if (row.enabled === "1") {
    assert(
      enabledRightsStatuses.has(row.rights_status),
      label + " is enabled without an approved rights status",
    );
    assert(
      !/runner-level|participant result rows|athlete result tables/i.test(row.notes) ||
        /excluded|never opened|do not ingest/i.test(row.notes),
      label + " does not clearly exclude participant-level result ingestion",
    );
  }
}

const enabledRows = rows.filter((row) => row.enabled === "1");
const futureRows = enabledRows.filter((row) => row.coverage_scope.includes("Future"));
const runningOnlyRows = enabledRows.filter((row) =>
  /road|trail|fell|cross country|track|mixed terrain|beach/i.test(row.surface_scope),
);

assert.equal(enabledRows.length, 36, "Enabled source count changed unexpectedly");
assert.equal(
  runningOnlyRows.length,
  enabledRows.length,
  "An enabled source needs an explicit sport-specific review before joining this running registry",
);

process.stdout.write(
  JSON.stringify(
    {
      registry: "docs/source-registry/fixture-result-sources.csv",
      sources: rows.length,
      enabled: enabledRows.length,
      disabled: rows.length - enabledRows.length,
      enabled_future_capable: futureRows.length,
      scope: "running-and-athletics-event-metadata",
      participant_result_rows: "excluded",
      by_region: countBy(rows, "region_scope"),
      enabled_by_section: countBy(enabledRows, "source_section"),
    },
    null,
    2,
  ) + "\n",
);
