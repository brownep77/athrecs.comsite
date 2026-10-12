import assert from "node:assert/strict";
import {
  publicAthleteSearchContent,
  searchSnippet,
} from "../src/lib/athrecs/public-athlete-search-content.ts";

const preview = {
  slug: "alex-example",
  displayName: "Alex Example",
  athleteNumber: "1",
  club: null,
  nationality: null,
  nationalitySource: null,
  sports: ["Running", "Parkrun", "Trail running", "Ultra running"],
  biography: [
    "Alex Example is a runner whose athlete-reported Example Marathon 2006 finish is unverified.",
  ],
  biographySources: [],
  entries: [{ kind: "recorded", result: { eventName: "Example 10K" } }],
  reportedRecords: [],
  totalResults: 67,
  searchIndexable: true,
};
const content = publicAthleteSearchContent(preview);
assert.equal(content.title, "Alex Example — Running results & biography | ATHRECS.com");
assert.match(
  content.description,
  /Alex Example.*athlete-reported Example Marathon 2006.*unverified/,
);
assert.match(content.description, /Recorded results include Example 10K/);
assert.equal(content.jsonLd.mainEntity.name, preview.displayName);
assert.equal(content.jsonLd.mainEntity.description, preview.biography[0]);
assert.equal(content.jsonLd.url, "https://www.athrecs.com/athletes/alex-example");
assert(content.description.length <= 175);
assert(!JSON.stringify(content).includes("67"), "Full history is not pulled into search metadata");
assert.equal(searchSnippet("  Two\n words.  "), "Two words.");
assert.equal(searchSnippet("First sentence. Next longer sentence.", 24), "First sentence. Next…");
const noBio = publicAthleteSearchContent({ ...preview, biography: [] });
assert.match(noBio.description, /Alex Example's athlete profile.*Example 10K/);
assert(!("description" in noBio.jsonLd.mainEntity), "Respect hidden biography");
const sourceHistory = publicAthleteSearchContent({
  ...preview,
  biography: [],
  entries: [{ kind: "history", result: { performance: { meeting: "Source Half Marathon" } } }],
});
assert.match(sourceHistory.description, /Recorded results include Source Half Marathon/);
assert(!sourceHistory.description.includes("verified"), "A record is not a verification claim");
const empty = publicAthleteSearchContent({ ...preview, biography: [], entries: [], sports: [] });
assert.match(empty.title, /Biography & latest results/);
assert(!empty.description.includes("Example 10K"));
console.log(
  "PASS: public-only name/event metadata, concise sport titles, readable snippets and unchanged verification qualifications.",
);
