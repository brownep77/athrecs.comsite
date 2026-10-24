import assert from "node:assert/strict";
import {
  parseSavedFixtures,
  savedFixtureKey,
} from "../src/components/discovery/useSavedFixtures.ts";

const running = {
  eventId: 101,
  slug: "synthetic-running-fixture",
  name: "Synthetic running fixture",
  eventDate: "2027-05-09",
  country: "Ireland",
  distances: ["5K", "10K"],
};
const cycling = {
  ...running,
  eventId: 202,
  slug: "synthetic-cycling-fixture",
  name: "Synthetic cycling fixture",
  distances: ["80K"],
};
const saved = (fixtures) => parseSavedFixtures(JSON.stringify({ version: 1, fixtures }));

// A device shortlist is shared across sport pages, while separate dates remain separate editions.
assert.equal(saved([running, cycling, { ...running, eventDate: "2028-05-07" }]).length, 3);
assert.notEqual(savedFixtureKey(running), savedFixtureKey(cycling));
assert.notEqual(savedFixtureKey(running), savedFixtureKey({ ...running, eventDate: "2028-05-07" }));

// Never trust stored keys, navigation targets or unexpected private account fields.
const [safe] = saved([
  { ...running, key: "wrong", href: "javascript:alert(1)", privateToken: "test" },
]);
assert.equal(safe.key, "101:2027-05-09");
assert.equal("href" in safe, false);
assert.equal("privateToken" in safe, false);
assert.deepEqual(safe.distances, ["5K", "10K"]);
assert.equal(saved([running, running]).length, 1);
assert.equal(saved([{ ...running, eventDate: "2027-02-29" }]).length, 0);
assert.equal(saved([{ ...running, eventId: -1 }]).length, 0);
assert.equal(saved([{ ...running, eventId: "101" }]).length, 0);
assert.equal(saved([{ ...running, slug: "//outside.example" }]).length, 0);
assert.equal(saved([{ ...running, slug: "fixture?redirect=outside" }]).length, 0);
assert.deepEqual(saved([{ ...running, distances: ["10K", "10K", {}, null, ""] }])[0].distances, [
  "10K",
]);

for (const corrupted of [
  null,
  "",
  "{",
  "null",
  "[]",
  '{"version":2,"fixtures":[]}',
  '{"version":1,"fixtures":{}}',
]) {
  assert.deepEqual(parseSavedFixtures(corrupted), []);
}
assert.deepEqual(parseSavedFixtures("x".repeat(512_001)), []);
console.log(
  "Saved fixture checks passed: cross-sport identity, date separation, safe storage projection and malformed storage.",
);
