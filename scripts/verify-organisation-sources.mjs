import assert from "node:assert/strict";
import fs from "node:fs";
import { SPORTS_ORGANISATIONS } from "../src/data/sports-organisations.ts";
import {
  parseFixtureSourceRegistry,
  buildBulkSourceJobManifest,
} from "../src/lib/athrecs/source-registry.ts";
import {
  attachSourceOrganisations,
  missingOrganisationSources,
  organisationSourceKey,
} from "../src/lib/athrecs/organisation-sources.ts";
import { publishedSourceProfileDetails } from "../src/lib/athrecs/profile-details.ts";

const sources = parseFixtureSourceRegistry(
  fs.readFileSync(
    new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url),
    "utf8",
  ),
);
assert.deepEqual(
  missingOrganisationSources(sources, SPORTS_ORGANISATIONS),
  [],
  "Every organisation needs a registered source page",
);
const linked = attachSourceOrganisations(sources, SPORTS_ORGANISATIONS);
const slugs = new Set(linked.flatMap((source) => source.organisations.map((body) => body.slug)));
assert.equal(slugs.size, SPORTS_ORGANISATIONS.length);
assert.equal(
  organisationSourceKey("http://www.example.test/members/"),
  organisationSourceKey("https://example.test/members"),
);
assert.notEqual(
  organisationSourceKey("https://example.test/members/one"),
  organisationSourceKey("https://example.test/members/two"),
  "Shared hosts do not establish the same organisation",
);
assert.notEqual(
  organisationSourceKey("https://example.test/?id=1"),
  organisationSourceKey("https://example.test/?id=2"),
);
assert.equal(
  buildBulkSourceJobManifest(linked).filter((source) => source.queue_status === "queued").length,
  36,
);
const membership = linked.find(
  (source) => source.organisations.filter((body) => body.membershipReference).length > 10,
);
assert(membership && !membership.enabled);
const body = {
  ...SPORTS_ORGANISATIONS[0],
  slug: "synthetic-body",
  name: "Synthetic Body",
  website: "https://example.test/new-body",
  websiteKind: "member-directory",
};
const backfill = missingOrganisationSources(sources, [body, { ...body, slug: "synthetic-second" }]);
assert.equal(backfill.length, 1, "Shared membership URLs must not create duplicate jobs");
assert.equal(backfill[0].enabled, false);
assert.equal(backfill[0].follow_history_links, false);
assert.equal(backfill[0].coverage_start_year, "");
assert.match(backfill[0].coverage_scope, /Membership reference only/);
assert.match(backfill[0].notes, /not a fresh website or capability check/);
assert.equal(
  linked.find((source) => source.source_id === "swimming_canada_athlete_profiles").organisations[0]
    .slug,
  "swimming-canada",
);

const date = "1980-02-03";
const details = {
  birthdayVisibility: "full",
  sourceProfileObservation: { dateOfBirth: date },
  sourceProfileDetailsPublication: {
    athleteId: 123,
    reviewedAt: "2026-10-23",
    filledProfileDetails: { dateOfBirth: date, birthdayVisibility: "full" },
  },
};
assert.equal(publishedSourceProfileDetails(details, date, 123).birthday, "3 February 1980");
for (const [value, dob, id] of [
  [{ ...details, birthdayVisibility: "hidden" }, date, 123],
  [details, "1980-02-04", 123],
  [details, date, 124],
  [{ ...details, sourceProfileDetailsPublication: undefined }, date, 123],
  [{ ...details, sourceProfileObservation: {} }, date, 123],
])
  assert.equal(
    publishedSourceProfileDetails(value, dob, id),
    null,
    "Changed facts, privacy choices and mismatched approvals must remain private",
  );
assert.doesNotMatch(
  JSON.stringify(publishedSourceProfileDetails(details, date, 123)),
  /sourceProfile|reviewedAt|1980-02-03/,
);
console.log(
  JSON.stringify({
    linkedOrganisations: slugs.size,
    sources: linked.length,
    automaticCollectionUnchanged: true,
    sourceBirthdayPrivacyChecks: "passed",
  }),
);
