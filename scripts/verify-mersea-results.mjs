import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { publicMerseaEdition } from "../src/lib/athrecs/mersea-archive.server.ts";

const archive = JSON.parse(
  readFileSync(new URL("../src/data/mersea-10/archive.json", import.meta.url), "utf8"),
);
const publishedFields = [
  "name",
  "finishTime",
  "position",
  "sourcePosition",
  "bib",
  "club",
  "sex",
  "category",
  "sourceAward",
  "genderPosition",
  "categoryPosition",
  "age",
];
let checked = 0;
for (const edition of archive.editions) {
  const publication = publicMerseaEdition(edition, edition.rows);
  assert.equal(publication.count, edition.rows.length, "Preserve field coverage");
  assert.equal(publication.rows.length, edition.rows.length, "All public finishers remain");
  assert.deepEqual(publication.providers, [...new Set(edition.sources.map(({ name }) => name))]);
  assert.doesNotMatch(JSON.stringify(publication), /https?:\/\/|www\./i);
  for (const [index, row] of publication.rows.entries()) {
    const raw = edition.rows[index];
    assert.equal("sourceUrl" in row, false);
    for (const field of publishedFields) {
      assert.equal(row[field], raw[field], `${edition.year}, row ${index}: ${field}`);
    }
  }
  checked += publication.rows.length;
}
const sentinel = "https://example.test/private-result";
const synthetic = {
  ...archive.editions[0],
  staffOnly: sentinel,
  note: `Provisional placings. ${sentinel}`,
  sources: [{ name: sentinel, url: sentinel }],
  rows: [{ name: "Runner", finishTime: "1:11:11", sourceUrl: sentinel, internalNotes: sentinel }],
};
const safe = publicMerseaEdition(synthetic, synthetic.rows);
assert.equal(safe.note, "Provisional placings.");
assert.deepEqual(safe.providers, []);
assert(!JSON.stringify(safe).includes(sentinel));
assert(checked > 0);
console.log(
  `Mersea: ${checked} finisher records in ${archive.editions.length} editions preserve published facts without exposing source links.`,
);
