import assert from "node:assert/strict";
await import("./verify-race-places.mjs");
const { distanceTone } = await import("../src/lib/athrecs/profile-colours.ts");
const { sportColourClass } = await import("../src/lib/athrecs/event-colours.ts");
const { racePlacePage } = await import("../src/lib/athrecs/race-places.ts");
const { racePlaceCopy } = await import("../src/lib/athrecs/race-places-copy.ts");
const { supplementedStart } = await import("../src/data/runrecs-race-guides.ts");
const { checkedFixtureStart, FIXTURE_DETAILS } = await import("../src/data/fixture-details.ts");
const { fixtureDateIsWithheld } = await import("../src/data/fixture-date-reviews.ts");
const { publishCheckedFixtures } = await import("./lib/checked-fixture-publication.mjs");
const { bulkFixture } = await import("./collector-bulk-fixture.mjs");

for (const [code, tone] of Object.entries({
  "2K": "teal",
  "5K": "mint",
  "5mi": "peach",
  "10K": "sky",
  "10mi": "lilac",
  Half: "rose",
  Marathon: "periwinkle",
  "50K": "lavender",
  "100K": "slate",
  Sprint: "sky",
  Standard: "gold",
  Middle: "rose",
  Iron: "lavender",
}))
  assert.equal(distanceTone(code), tone, code);
for (const [a, b] of [
  ["5K", "5000m"],
  ["2.5K", "2500m"],
  ["100mi", "100 miles"],
  ["25m", "0.025K"],
  ["10K", "10 km"],
])
  assert.equal(distanceTone(a), distanceTone(b), `${a}/${b}`);
assert.equal(
  checkedFixtureStart("marriotts-way-races", "2027-02-21", "Half · Marathon", "10:30"),
  "09:00",
);
assert.equal(checkedFixtureStart("reepham-cross-country", "2027-01-31", "5K", "10:15"), null);
assert.equal(checkedFixtureStart("reepham-cross-country", "2027-01-31", "10K", "10:30"), null);
assert.match(
  FIXTURE_DETAILS["reepham-cross-country|2027-01-31"].starts["5K"].note,
  /juniors start 10:00/,
);
FIXTURE_DETAILS["synthetic-unresolved|2027-01-01"] = {
  starts: { "5K": { time: null } },
};
assert.equal(checkedFixtureStart("synthetic-unresolved", "2027-01-01", "5K", "10:30"), null);
delete FIXTURE_DETAILS["synthetic-unresolved|2027-01-01"];
assert.equal(checkedFixtureStart("east-coast-10k", "2026-11-01", "10K", null), "10:00");
assert.equal(checkedFixtureStart("east-coast-10k", "2027-11-01", "10K", null), null);
assert.notEqual(distanceTone("5mi"), distanceTone("8K"));
assert.notEqual(distanceTone("100m"), distanceTone("100M"));
assert.notEqual(distanceTone("25m"), distanceTone("50m"));
assert.equal(sportColourClass("parkrun"), sportColourClass("Parkrun"));
const key = "europe/united-kingdom/england/norfolk";
const make = (id, sport, county, distance) => ({
  id,
  slug: `synthetic-${id}`,
  name: `Synthetic ${sport}`,
  sport,
  country: "England",
  county,
  region: null,
  city: "Example town",
  summary: "Synthetic fixture",
  featured: false,
  timeZone: "Europe/London",
  lastDate: null,
  editions: [{ date: "2027-06-01", endDate: null, status: "Open", distance, startTime: "09:00" }],
});
const rows = [
  make(1, "Running", "Norfolk", "5K"),
  make(2, "Running", "Suffolk", "5K"),
  make(3, "Cycling", "Norfolk", "100K"),
  make(4, "Parkrun", "Norfolk", "2K"),
  make(5, "Swimming", "Norfolk", "1500m"),
  make(6, "Duathlon", "Norfolk", "Other"),
];
const five = racePlacePage(rows, `${key}/running/5k`, "2026-10-20T12:00:00Z", 1, false, {
  month: "2027-06",
  city: "Example town",
});
assert(five.nearby.find((x) => x.name === "Suffolk").path.endsWith("/running/5k?month=2027-06"));
assert.equal(five.races[0].listedStarts[0].startTime, "09:00");
for (const [sport, distance] of [
  ["cycling", "100k"],
  ["parkrun", "2k"],
  ["swimming", "1500m"],
]) {
  const page = racePlacePage(rows, `${key}/${sport}/${distance}`, "2026-10-20T12:00:00Z");
  assert.equal(page.races.length, 1);
  assert(
    racePlaceCopy(page)
      .intro.flat()
      .some((x) => typeof x === "string" && x.length > 60),
  );
}
assert.equal(
  racePlacePage(rows, `${key}/duathlon/5k`, "2026-10-20T12:00:00Z"),
  null,
  "multisport legs are not standalone races",
);
assert.match(
  racePlaceCopy(racePlacePage(rows, key, "2026-10-20T12:00:00Z")).heading,
  /Norfolk sports and events/,
);
assert.equal(
  supplementedStart({ slug: "marriotts-way-races" }, "2027-02-21", "Half", "10:30"),
  "10:30",
  "organiser timetable takes precedence over stored fallback",
);
assert.equal(
  supplementedStart({ slug: "east-coast-10k" }, "2027-11-01", "10K", null),
  null,
  "never carry a checked time into another year",
);
assert(fixtureDateIsWithheld("lingwood-duathlon", "2027-03-21"));

// Real staging, validation, publication and repeat safety against an isolated database.
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { pg, sql } = await bulkFixture();
try {
  await sql.query("alter table editions add column if not exists start_time text");
  await sql.query(
    "insert into events(id,slug,name,sport,country) values(43,'gear-10k-kings-lynn','Synthetic GEAR fixture','Running','England'),(900001,'synthetic-checked','Synthetic Checked Fixture','Running','England')",
  );
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values(900001,900001,'2027-01-01','10K',10,'TBC',null,'https://example.org/old','Original evidence')",
  );
  const details = {
    "synthetic-checked|2027-01-01": {
      checkedAt: "2026-10-20",
      sourceUrl: "https://example.org/official",
      starts: { "10K": { time: "10:00", note: "Wave one" } },
    },
    "gear-10k-kings-lynn|2027-05-02": {
      checkedAt: "2026-10-20",
      sourceUrl: "https://example.org/gear",
      starts: { "10K": { time: "09:30" } },
    },
  };
  const result = await publishCheckedFixtures(sql, publishing, details);
  assert(result.revisionId);
  const changed = (
    await sql.query("select start_time,status,notes from editions where id=900001")
  )[0];
  assert.equal(changed.start_time, "10:00");
  assert.equal(changed.status, "TBC");
  assert(changed.notes.startsWith("Original evidence"));
  assert.equal(
    (
      await sql.query("select count(*)::int n from catalogue_change_log where revision_id=$1", [
        result.revisionId,
      ])
    )[0].n,
    2,
  );
  assert((await publishCheckedFixtures(sql, publishing, details)).alreadyPublished);
} finally {
  await pg.close();
}
console.log(
  "Colour aliases, county navigation, sport copy, date holds and audited fixture publication passed.",
);
await import("./verify-official-start-times.mjs");
