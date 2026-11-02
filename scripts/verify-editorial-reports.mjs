import assert from "node:assert/strict";
import { AUCKLAND_MARATHON_2026_RESULTS } from "../src/data/auckland-marathon-2026-results.ts";
import { DUBLIN_MARATHON_2026_RESULTS } from "../src/data/dublin-marathon-2026-results.ts";
import { editorialAthleteNames } from "../src/lib/athrecs/editorial-athletes.ts";
import {
  editorialJsonLd,
  editorialPath,
  editorialWordCount,
  filterEditorialArticles,
} from "../src/lib/athrecs/editorial.ts";

const reports = [AUCKLAND_MARATHON_2026_RESULTS, DUBLIN_MARATHON_2026_RESULTS];
for (const article of reports) {
  const words = editorialWordCount({ ...article, standfirst: "" });
  assert(words >= 500, `${article.slug}: substantive report needs at least 500 prose words`);
  assert(article.seoTitle && article.description && article.author);
  assert.equal(
    new Set(article.sections.map((section) => section.id)).size,
    article.sections.length,
  );
  const proseAndTables = JSON.stringify([article.standfirst, article.body, article.sections]);
  const roster = editorialAthleteNames(article);
  assert.equal(
    roster.length,
    article.athleteNames.length,
    "Declare every table athlete in the editorial roster",
  );
  for (const name of roster)
    assert(proseAndTables.includes(name), `Roster name not found: ${name}`);
  assert.equal(
    Object.keys(article.athleteLinks).length,
    0,
    "New report identity decisions belong in private staff review",
  );
  for (const section of article.sections) {
    assert(section.sources?.length, `${section.id}: retain factual source attribution`);
    for (const source of section.sources) assert.equal(new URL(source.url).protocol, "https:");
    if (section.table) {
      for (const row of section.table.rows) assert.equal(row.length, section.table.headings.length);
    }
  }
  const graph = editorialJsonLd(article, "https://www.athrecs.com")["@graph"][0];
  assert.equal(graph.url, `https://www.athrecs.com${editorialPath(article)}`);
  assert.equal(graph.wordCount, editorialWordCount(article));
  assert(!("candidates" in graph) && !("reviewNotes" in graph));
  assert.equal(
    filterEditorialArticles(reports, "news", {
      level: "local",
      continent: article.coverageContinents[0],
      ...article.locations[0],
    }).length,
    1,
  );
  console.log(
    `${article.slug}: ${words} body words; ${editorialWordCount(article)} with standfirst; ${roster.length} athlete review entries`,
  );
}
assert.equal(filterEditorialArticles(reports, "news", { country: "Australia" }).length, 0);
assert.equal(filterEditorialArticles(reports, "news", { country: "Canada" }).length, 0);
assert.equal(filterEditorialArticles(reports, "news", { level: "world" }).length, 0);
console.log(
  "Editorial report checks passed: substantial prose, sources, complete rosters, canonical metadata and accurate geography.",
);
