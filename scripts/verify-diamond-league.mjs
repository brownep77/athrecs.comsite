import assert from "node:assert/strict";
import {
  DIAMOND_LEAGUE_2027 as meetings,
  DIAMOND_LEAGUE_BROADCASTERS as broadcasters,
  diamondLeagueCoverage,
} from "../src/data/diamond-league.ts";
import { worldAthleticsSeries, worldAthleticsEditions } from "../src/data/world-athletics.ts";
import { fixtureDateIsWithheld } from "../src/data/fixture-date-reviews.ts";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishDiamondLeagueEditions } from "./lib/diamond-league-publication.mjs";
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");

assert.equal(meetings.length, 15);
assert.equal(new Set(meetings.map((m) => m.slug)).size, 15);
for (const meeting of meetings) {
  assert(
    worldAthleticsSeries.some(
      (s) => s.slug === meeting.slug && s.sport === "Athletics" && s.surface === "Track",
    ),
  );
  for (const date of new Set([meeting.startDate, meeting.endDate])) {
    assert(
      worldAthleticsEditions.some((e) => e.seriesSlug === meeting.slug && e.date === date),
      `${meeting.id} ${date} missing`,
    );
    assert(!fixtureDateIsWithheld(meeting.slug, date));
  }
  assert.doesNotThrow(() => new Intl.DateTimeFormat("en-GB", { timeZone: meeting.timeZone }));
}
assert.equal(meetings.find((m) => m.id === "paris").startDate, "2027-06-25");
assert(fixtureDateIsWithheld("wa-meeting-de-paris-7220881", "2027-06-18"));
assert.equal(meetings.find((m) => m.id === "silesia").startDate, "2027-08-14");
assert.equal(meetings.find((m) => m.id === "zurich").endDate, "2027-08-26");
assert.equal(
  diamondLeagueCoverage("United States", "eugene").broadcaster,
  "2027 broadcaster not yet confirmed",
);
assert.equal(diamondLeagueCoverage("United States", "london").broadcaster, "FloTrack");
assert.equal(diamondLeagueCoverage("Ireland", "london"), undefined);
assert.equal(broadcasters.filter((b) => b.status === "rights-confirmed").length, 4);
assert.equal(new Set(broadcasters.map((b) => b.country)).size, broadcasters.length);
assert(broadcasters.every((b) => b.sourceUrl.startsWith("https://")));

const { pg, sql } = await bulkFixture();
try {
  await sql.query("alter table editions add column if not exists start_time text");
  await sql.query(
    "insert into events(id,slug,name,sport,surface,country) values(901001,'synthetic-diamond','Synthetic Meeting','Athletics','Track','England')",
  );
  await sql.query(
    "insert into event_distances(event_id,distance_code) values(901001,'Track & field')",
  );
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,notes) values(901001,901001,'2027-08-25','Track & field',0,'Open','18:00','Retain existing evidence')",
  );
  const before = (await sql.query("select * from editions where id=901001"))[0];
  const fixture = [
    {
      slug: "synthetic-diamond",
      startDate: "2027-08-25",
      endDate: "2027-08-26",
      sourceUrl: "https://example.org/programme",
    },
  ];
  const result = await publishDiamondLeagueEditions(sql, publishing, fixture);
  assert.equal(result.added, 1);
  assert.deepEqual((await sql.query("select * from editions where id=901001"))[0], before);
  assert.equal(
    (await sql.query("select count(*)::int as n from editions where event_id=901001"))[0].n,
    2,
  );
  assert.equal((await publishDiamondLeagueEditions(sql, publishing, fixture)).skipped, true);
  assert.equal((await sql.query("select count(*)::int as n from catalogue_revisions"))[0].n, 1);
} finally {
  await pg.close();
}
console.log(
  `Diamond League: 15 meetings, ${broadcasters.length} country/territory rows, edition dates, US exception and idempotent publication passed.`,
);
