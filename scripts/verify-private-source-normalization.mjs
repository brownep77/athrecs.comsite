import assert from "node:assert/strict";
import { normalizePrivateSourceRow } from "./lib/private-source-normalization.mjs";
import { auditResults } from "./lib/result-evidence-audit.mjs";

const original = { Category: "None", "Cat Pos": "8" };
const row = { category: "None", categoryPlace: 8, genderPlace: 1, overallPlace: 8, original };
const normalized = normalizePrivateSourceRow(row);
assert.equal(normalized.category, null);
assert.equal(normalized.categoryPlace, null);
assert.equal(normalized.sourceCategoryPlace, 8);
assert.equal(normalized.sourceCategoryLabel, "None");
assert.deepEqual(normalized.original, original);
assert.equal(row.categoryPlace, 8, "Original capture is immutable");
const classified = { ...row, category: "F40", original: { ...original, Category: "F40" } };
assert.equal(normalizePrivateSourceRow(classified), classified, "Actual category contradictions stay reviewable");
const mixed = { ...row, category: "MixedO", original: { ...original, Category: "MixedO" } };
assert.equal(normalizePrivateSourceRow(mixed), mixed, "Do not infer the scope of a mixed category");
const source = { url: "https://totalracetiming.co.uk/raceresults/1#sr1", headings: ["Synthetic race"],
  startTimes: ["01/01/2026"], rowCount: 1, tables: [{
    headers: ["Position", "Forename", "Surname", "Gender Pos", "Category", "Cat Pos", "Tag", "Time"],
    rows: [["8", "Synthetic", "Runner", "1", "None", "8", "12", "00:30:00.1"]],
  }] };
const candidate = { id: 1, display_name: "Synthetic Runner", source_bib: "12", event_date: "2026-01-01",
  source_url: source.url, status: "finished", finish_time_seconds: 1800.1,
  overall_place: normalized.overallPlace, gender_place: normalized.genderPlace, category_place: normalized.categoryPlace };
const audit = auditResults([candidate], [source], "2026-10-09");
assert.deepEqual(audit.issues, []);
assert.deepEqual(audit.comparisons[0].flags, []);
assert.equal(audit.comparisons[0].official_matches[0].categoryPlace, 8, "Original source rank is still compared and retained");
assert(auditResults([{ ...candidate, category_place: 8 }], [source]).issues[0].flags.includes("category_place_exceeds_gender"));
console.log("Explicit absent-category normalization and original-value preservation passed.");
