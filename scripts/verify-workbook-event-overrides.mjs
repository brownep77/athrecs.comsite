#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";

const overridesUrl = new URL(
  "../docs/source-registry/workbook-event-overrides.json",
  import.meta.url,
);
const document = JSON.parse(fs.readFileSync(overridesUrl, "utf8"));

assert.match(document.checkedAt, /^\d{4}-\d{2}-\d{2}$/, "Overrides need an ISO checked date");
assert.match(
  document.scope,
  /event-level metadata only/i,
  "Overrides must explicitly exclude participant-level data",
);

const entries = Object.entries(document.overrides ?? {});
assert.equal(entries.length, 26, "Expected the 26 independently verified enrichments");

for (const [editionId, override] of entries) {
  const label = `Override ${editionId}`;
  assert.match(editionId, /^edition_[a-z0-9]+$/, `${label} has an invalid edition ID`);
  assert.match(override.sourceId, /^[a-z0-9_]+$/, `${label} has an invalid source ID`);
  assert(override.eventName.trim(), `${label} has no event name`);
  assert.match(override.eventDate, /^\d{4}-\d{2}-\d{2}$/, `${label} has an invalid event date`);
  const evidenceUrl = new URL(override.evidenceUrl);
  assert.equal(evidenceUrl.protocol, "https:", `${label} evidence must use HTTPS`);
  assert(override.note.trim(), `${label} has no audit note`);
  assert(
    Array.isArray(override.resolvedIssueFields) && override.resolvedIssueFields.length > 0,
    `${label} must name the resolved review fields`,
  );
  assert(override.fields && typeof override.fields === "object", `${label} has no field changes`);
  assert(
    !/participant|entrant|runner|athlete/i.test(JSON.stringify(override.fields)),
    `${label} attempts to retain participant-level data`,
  );

  if (override.resolvedIssueFields.includes("city")) {
    assert(override.fields.city?.trim(), `${label} clears city without providing a city`);
  }
  if (override.resolvedIssueFields.includes("official_website_url")) {
    const website = new URL(override.fields.website);
    assert.equal(website.protocol, "https:", `${label} clears website without an HTTPS URL`);
  }
  if (override.fields.distances) {
    assert(override.fields.distances.length > 0, `${label} has an empty distance list`);
    for (const distance of override.fields.distances) {
      assert(distance.code.trim(), `${label} has a distance without a code`);
      assert(Number.isFinite(distance.km) && distance.km > 0, `${label} has an invalid distance`);
      assert(new URL(distance.sourceUrl), `${label} has an invalid distance source URL`);
    }
  }
}

process.stdout.write(
  JSON.stringify(
    {
      file: "docs/source-registry/workbook-event-overrides.json",
      checked_at: document.checkedAt,
      independently_verified_enrichments: entries.length,
      participant_level_data: "excluded",
    },
    null,
    2,
  ) + "\n",
);
