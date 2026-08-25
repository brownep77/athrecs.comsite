import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import {
  buildPotentialMatchSearchPatterns,
  normalizePersonName,
  scorePotentialResultNameMatch,
  uniquePotentialMatchNames,
} from "../src/lib/athrecs/result-match.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [api, panel, shell] = await Promise.all([
  readFile(resolve(root, "src/lib/athrecs/result-match-api.ts"), "utf8"),
  readFile(resolve(root, "src/components/athletes/PotentialResultMatchesPanel.tsx"), "utf8"),
  readFile(resolve(root, "src/components/layout/AppShell.tsx"), "utf8"),
]);

assert.equal(normalizePersonName("Dr. Paul T. Browne Jr"), "paul t browne");
assert.deepEqual(
  uniquePotentialMatchNames(["Paul Browne", "  paul browne ", "P. Browne", "Paul Browne"]),
  ["Paul Browne", "P. Browne"],
);

const exact = scorePotentialResultNameMatch(
  ["Paul Browne"],
  "Paul Browne",
  {},
  {},
);
assert.equal(exact?.confidence, "exact");
assert.equal(exact?.score, 100);

const strong = scorePotentialResultNameMatch(
  ["Paul T Browne"],
  "Paul Browne",
  {},
  {},
);
assert.equal(strong?.confidence, "strong");
assert.ok((strong?.score ?? 0) >= 90);

const unsupportedInitial = scorePotentialResultNameMatch(
  ["Paul Browne"],
  "P Browne",
  {},
  {},
);
assert.equal(unsupportedInitial, null, "An initial-only match needs corroborating context");

const supportedInitial = scorePotentialResultNameMatch(
  ["Paul Browne"],
  "P Browne",
  { city: "Norwich" },
  { city: "Norwich" },
);
assert.equal(supportedInitial?.confidence, "possible");
assert.match(supportedInitial?.reasons.join(" ") ?? "", /City or town matches/);

assert.equal(
  scorePotentialResultNameMatch(["Paul Browne"], "Paul Brown", {}, {}),
  null,
  "A different surname must not be suggested",
);

const patterns = buildPotentialMatchSearchPatterns(["Paul T Browne"]);
assert.ok(patterns.normalizedPatterns.includes("%paul%browne%"));
assert.ok(patterns.normalizedPatterns.includes("%p%browne%"));

const db = new PGlite();
await db.waitReady;
await db.exec(`
  create table athletes (id serial primary key, display_name text not null);
  insert into athletes (display_name) values
    ('Paul Browne'),
    ('P. Browne'),
    ('Peter Brown'),
    ('Alice Smith');
`);
const candidates = await db.query(
  `select display_name
   from athletes
   where trim(regexp_replace(lower(display_name), '[^a-z0-9]+', ' ', 'g'))
     like any($1::text[])
   order by display_name`,
  [patterns.normalizedPatterns],
);
assert.deepEqual(
  candidates.rows.map((row) => row.display_name),
  ["P. Browne", "Paul Browne"],
);
await db.close();

assert.match(api, /middleware\(\[authMiddleware\]\)/);
assert.match(api, /result_claims my_claim/);
assert.match(api, /athlete_account_links owner/);
assert.match(api, /scorePotentialResultNameMatch/);
assert.match(api, /ownedByAnotherAccount/);
assert.match(panel, /Potential results matching your name/);
assert.match(panel, /to="\/claim-results"/);
assert.match(panel, /suggestions, not confirmed ownership/i);
assert.match(shell, /pathname === "\/athlete-account"/);
assert.match(shell, /PotentialResultMatchesPanel/);

console.log(
  "Potential result matching verification passed: conservative name scoring, contextual support, private account gating and claim links are present.",
);
