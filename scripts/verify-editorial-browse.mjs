import assert from "node:assert/strict";
import {
  EDITORIAL_PRIORITY_COUNTRIES,
  editorialContinents,
  editorialCountryContinent,
  editorialJsonLd,
  editorialLevels,
  editorialLocationOptions,
  editorialPath,
  editorialReadingMinutes,
  editorialWordCount,
  filterEditorialArticles,
  parseEditorialSearch,
} from "../src/lib/athrecs/editorial.ts";

const article = (slug, kind, date, locations, sports = ["road-running"]) => ({
  slug,
  kind,
  date,
  locations,
  sports,
  title: slug,
  displayDate: date,
  standfirst: "",
  body: [],
});
const stories = [
  article("two-locations", "race-reports", "2026-09-01", [
    { country: "England", area: "East of England", county: "Norfolk" },
    { country: "England", area: "London", county: "Greater London" },
  ]),
  article("announcement", "news", "2026-09-02", [
    { country: "Ireland", area: "Leinster", county: "Dublin" },
  ]),
  article("later", "race-reports", "2026-09-03", [{ country: "England" }], ["trail-running"]),
];
const find = (kind, filters) =>
  filterEditorialArticles(stories, kind, filters).map((story) => story.slug);
assert.deepEqual(find("race-reports", {}), ["later", "two-locations"]);
assert.deepEqual(find("news", {}), ["announcement"]);
assert.deepEqual(find("race-reports", { country: "United Kingdom", county: "Norfolk" }), [
  "two-locations",
]);
assert.deepEqual(find("news", { country: "United Kingdom" }), [], "Ireland is not part of the UK");
assert.deepEqual(
  editorialLocationOptions(stories, "race-reports", { country: "United Kingdom", area: "East of England" })
    .counties,
  ["Norfolk"],
);
assert.deepEqual(editorialLocationOptions(stories, "race-reports", { country: "United Kingdom" }).areas, [
  "East of England",
  "London",
]);
assert.deepEqual(
  find("race-reports", {
    sport: "road-running",
    country: "England",
    area: "East of England",
    county: "Norfolk",
  }),
  ["two-locations"],
);
assert.deepEqual(
  find("race-reports", { country: "England", area: "London", county: "Norfolk" }),
  [],
  "Must match one complete location, not mix two locations",
);
assert.deepEqual(find("race-reports", { sport: "trail-running", county: "Norfolk" }), []);
assert.deepEqual(
  find("race-reports", { country: "Unlisted country" }),
  [],
  "Unknown filters must not widen the search",
);
assert.deepEqual(
  editorialLocationOptions(stories, "race-reports", { country: "England", area: "East of England" }).counties,
  ["Norfolk"],
);
assert.deepEqual(editorialLocationOptions(stories, "news", { country: "Ireland" }).areas, ["Leinster"]);
assert.deepEqual(editorialLocationOptions(stories, "race-reports", {}).counties, []);
assert.deepEqual(editorialLocationOptions(stories, "race-reports", { country: "Ireland" }).areas, []);
assert.deepEqual(parseEditorialSearch({ country: " England ", area: [], county: "", sport: 1 }), {
  country: "England",
});
assert.equal(parseEditorialSearch({ country: "x".repeat(200) }).country.length, 100);
assert.equal(editorialPath(stories[0]), "/race-reports/two-locations");
assert.equal(editorialPath(stories[1]), "/news/announcement");

const coverageStories = [
  {
    ...article("world-championship", "news", "2026-11-02", [
      { country: "United States", area: "New York" },
      { country: "England", area: "London" },
    ]),
    coverageLevels: ["world", "continent", "national", "local"],
  },
  article("auckland-local", "news", "2026-11-01", [{ country: "New Zealand", area: "Auckland" }]),
  article("canada-national", "news", "2026-10-31", [{ country: "Canada" }]),
  article("australia-national", "news", "2026-10-30", [{ country: "Australia" }]),
  article("northern-ireland", "news", "2026-10-29", [
    { country: "Northern Ireland", area: "County Antrim" },
  ]),
  article("ireland-national", "news", "2026-10-28", [{ country: "Ireland" }]),
  {
    ...article("europe-championship", "news", "2026-10-27", []),
    coverageLevels: ["continent"],
    coverageContinents: ["Europe"],
  },
];
const findCoverage = (filters) =>
  filterEditorialArticles(coverageStories, "news", filters).map((story) => story.slug);
assert.deepEqual(findCoverage({ level: "world" }), ["world-championship"]);
assert.deepEqual(
  editorialLevels(coverageStories[1]),
  ["continent", "national", "local"],
  "An overseas local event is not automatically a world story",
);
assert.deepEqual(findCoverage({ level: "continent", continent: "Oceania" }), [
  "auckland-local",
  "australia-national",
]);
assert.deepEqual(findCoverage({ level: "national", country: "Canada" }), ["canada-national"]);
assert.deepEqual(findCoverage({ level: "local", country: "Canada" }), []);
assert.deepEqual(findCoverage({ country: "United Kingdom" }), [
  "world-championship",
  "northern-ireland",
]);
assert.deepEqual(findCoverage({ country: "Ireland" }), ["ireland-national"]);
assert.deepEqual(
  findCoverage({ continent: "Europe", country: "United States" }),
  [],
  "Continent and country cannot match different locations in a multi-location story",
);
assert.deepEqual(findCoverage({ continent: "Europe", country: "England", area: "London" }), [
  "world-championship",
]);
assert.equal(findCoverage({ continent: "Europe" }).includes("europe-championship"), true);
assert.deepEqual(findCoverage({ continent: "Atlantis" }), []);
assert.deepEqual(findCoverage(parseEditorialSearch({ level: "unknown" })), []);
assert.deepEqual(findCoverage(parseEditorialSearch({ continent: "unknown" })), []);
assert.deepEqual(editorialLocationOptions(coverageStories, "news", { continent: "Oceania" }).countries, [
  "Australia",
  "New Zealand",
]);
assert.deepEqual(
  editorialLocationOptions(coverageStories, "news", { continent: "Europe", country: "United States" })
    .areas,
  [],
);
assert.equal(editorialCountryContinent("USA"), "North America");
assert.equal(editorialCountryContinent("Canada"), "North America");
assert.equal(editorialCountryContinent("Australia"), "Oceania");
assert.equal(editorialCountryContinent("New Zealand"), "Oceania");
assert.equal(editorialCountryContinent("England"), "Europe");
assert.equal(editorialCountryContinent("Northern Ireland"), "Europe");
assert.equal(editorialCountryContinent("Unlisted country"), undefined);
assert.deepEqual(editorialContinents(coverageStories[0]), ["Europe", "North America"]);
assert.deepEqual(EDITORIAL_PRIORITY_COUNTRIES, [
  "United Kingdom",
  "Ireland",
  "United States",
  "New Zealand",
  "Australia",
  "Canada",
]);

const proseArticle = {
  ...article("prose", "news", "2026-11-02", [{ country: "Canada" }]),
  title: "A title does not lengthen the story",
  standfirst: "Athletes celebrated together.",
  body: ["A well-earned finish matters.", "This isn’t a table."],
  sections: [
    {
      id: "results",
      heading: "Results headings are not counted",
      paragraphs: ["The club welcomed everyone."],
      table: {
        caption: "Not prose",
        headings: ["Athlete", "Place"],
        rows: [["word ".repeat(500), "1"]],
      },
      sources: [{ label: "Source credit is excluded", url: "https://example.com/results" }],
    },
  ],
  faqs: [{ question: "A repeated question?", answer: "Not counted again." }],
  description: "Metadata must not increase the word count.",
};
assert.equal(editorialWordCount(proseArticle), 15, "Only the main prose is counted");
assert.equal(editorialReadingMinutes(proseArticle), 1);
assert.equal(editorialReadingMinutes({ ...proseArticle, body: ["word ".repeat(500)] }), 3);
const structuredArticle = editorialJsonLd(proseArticle, "https://www.athrecs.com")["@graph"][0];
assert.equal(structuredArticle.wordCount, 15);
assert.equal(structuredArticle.timeRequired, "PT1M");
assert.equal(structuredArticle.url, "https://www.athrecs.com/news/prose");
assert.equal(
  editorialPath({ ...proseArticle, coverageLevels: ["world", "national"] }),
  "/news/prose",
);

console.log(
  "Editorial geography, UK home nations, continent/location isolation, canonical URLs and prose lengths verified.",
);
