import assert from "node:assert/strict";
import fs from "node:fs";
import {
  berlinSnapshotSchema,
  berlinSearch,
  berlinSelection,
  berlinPlace,
  berlinShareUrl,
} from "../src/lib/athrecs/berlin-results.ts";

const snapshot = berlinSnapshotSchema.parse(
  JSON.parse(
    fs.readFileSync(new URL("../src/data/berlin-marathon-2026.json", import.meta.url), "utf8"),
  ),
);
// Synthetic fixtures only: verify rank separation, category selection and refusal
// of incomplete/unverified records without introducing actual race performances.
const synthetic = {
  id: "test-1",
  bib: "TEST-1",
  name: "Synthetic Runner",
  gender: "women",
  country: null,
  club: null,
  category: "TEST-W45",
  overallPlace: 25,
  genderPlace: 3,
  categoryPlace: 1,
  gunTime: "3:04:05",
  chipTime: "3:00:01",
  status: "finished",
  verified: true,
  publicationApproved: true,
  sourceUrl: "https://example.com/test-only",
  sourceLocator: "TEST-1",
  checkedAt: "2026-09-27T12:00:00+01:00",
};
const fixture = {
  ...snapshot,
  status: "provisional",
  coverage: "partial",
  updatedAt: "2026-09-27T12:00:00+01:00",
  results: [synthetic],
};
assert(berlinSnapshotSchema.safeParse(fixture).success);
assert(
  !berlinSnapshotSchema.safeParse({ ...fixture, results: [{ ...synthetic, verified: false }] })
    .success,
);
assert(
  !berlinSnapshotSchema.safeParse({
    ...fixture,
    results: [{ ...synthetic, publicationApproved: false }],
  }).success,
);
assert(!berlinSnapshotSchema.safeParse({ ...fixture, results: [synthetic, synthetic] }).success);
assert(!berlinSnapshotSchema.safeParse({ ...fixture, status: "awaiting" }).success);
assert(
  !berlinSnapshotSchema.safeParse({ ...fixture, results: [{ ...synthetic, chipTime: "3:60:00" }] })
    .success,
);
assert.equal(berlinPlace(synthetic, "women"), 3);
assert.equal(berlinPlace(synthetic, "all"), 25);
assert.equal(berlinPlace(synthetic, "age"), 1);
assert.equal(berlinSelection(fixture, berlinSearch({ view: "men" })).length, 0);
assert.equal(berlinSelection(fixture, berlinSearch({ view: "women" })).length, 1);
assert.equal(
  berlinSelection(fixture, berlinSearch({ view: "age", category: "TEST-W45" })).length,
  1,
);
assert.equal(berlinSelection(fixture, berlinSearch({ view: "age" })).length, 0);
assert.equal(berlinSelection(fixture, berlinSearch({ view: "all", q: "TEST-1" })).length, 1);
assert.equal(berlinSearch({ view: "bad", page: -2 }).view, "men");
assert(
  berlinShareUrl(berlinSearch({ view: "age", category: "TEST-W45" })).includes("category=TEST-W45"),
);
console.log(
  `Berlin snapshot valid: ${snapshot.results.length} results, ${snapshot.status}; rank, evidence and sharing checks passed.`,
);
