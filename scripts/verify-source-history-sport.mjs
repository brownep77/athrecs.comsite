import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  sourceHistorySport,
  sourceHistorySportMigration,
} from "../src/lib/athrecs/source-history-sport.ts";
import { buildProfileTimeline } from "../src/lib/athrecs/profile-timeline.ts";
import {
  profileEvidenceSports,
  profileSportEvidenceMigration,
} from "../src/lib/athrecs/profile-sport-evidence.ts";
import {
  isCrossCountryHistoryResult,
  isTrailHistoryResult,
} from "../src/lib/athrecs/profile-history-results.ts";

const examples = [
  ["parkrun", "", "Parkrun"],
  ["5 km parkrun", "", "Parkrun"],
  ["parkrunCX", "", "Parkrun"],
  ["5K", "parkrun official results", "Parkrun"],
  ["Marathon", "", "Running"],
  ["10 Kilometres Road", "", "Running"],
  ["5 mile trail", "", "Running"],
  ["10K Multi Terrain", "", "Running"],
  ["Cross-country — Senior Men", "", "Running"],
  ["10KXC", "powerof10", "Running"],
  ["ZXC", "powerof10", "Running"],
  ["ZXCL", "powerof10", "Running"],
  ["5.848KL", "powerof10", "Running"],
  ["Road relay leg — Under 17 Men", "", "Running"],
  ["50K trail", "", "Running"],
  ["24h", "DUV Ultra Marathon Statistics", "Running"],
  ["Distance unverified", "utmb", "Running"],
  ["SHORT10K", "powerof10", "Running"],
  ["5K (short course)", "", "Running"],
  ["1500", "", "Athletics"],
  ["800m", "", "Athletics"],
  ["5000 Metres", "", "Athletics"],
  ["10,000 Metres", "", "Athletics"],
  ["Long Jump", "", "Athletics"],
  ["Shot 4K", "", "Athletics"],
  ["SP3.25K", "powerof10", "Athletics"],
  ["Mile", "", "Athletics"],
  ["2 Miles", "", "Athletics"],
  ["Mile Road", "", "Running"],
  ["2 Miles Road", "", "Running"],
  ["60m indoors", "", "Athletics"],
  ["Women 4x100m relay", "", "Athletics"],
  ["3000m S/C", "", "Athletics"],
  ["Triathlon — 5K run", "", "Triathlon"],
  ["Duathlon 10K", "", "Duathlon"],
  ["Aquathlon", "", "Aquathlon"],
  ["Aquabike", "", "Aquabike"],
  ["10K Swimming", "", "Swimming"],
  ["100km Cycling", "", "Cycling"],
  ["Rowing", "", "Rowing"],
  ["Indoor Rowing 1000m", "Time Team", "Indoor Rowing"],
  ["Indoor Rowing 5000m", "Time Team", "Indoor Rowing"],
  ["HYROX Doubles", "", "HYROX"],
  ["DEKA FIT 5K", "", "DEKA"],
  ["CrossFit Open", "", "CrossFit"],
  ["Functional Fitness", "", "Functional Fitness"],
  ["Swimrun 30K", "", "Swimrun"],
  ["Orienteering Middle Distance", "", "Orienteering"],
  ["Adventure Racing 500km", "", "Adventure Racing"],
  ["Final", "Time Team", "Indoor Rowing", "World Rowing Virtual Indoor Rowing Championships"],
  ["Obstacle course race", "", "OCR"],
  ["Race walking", "", "Walking"],
  ["Senior", "club results", null],
  ["Wave 1", "timer", null],
  ["", "", null],
  ["Distance unverified", "organiser", null],
  ["U11", "timer", "Running", "Norfolk Cross Country Championships"],
  ["Wave 1", "timer", "Running", "Marriott's Way 10k"],
  ["Senior", "timer", "Triathlon", "Example Triathlon"],
  ["800m", "timer", "Athletics", "Example Triathlon weekend"],
  ["Senior", "timer", null, "Example club meeting"],
  ["Fun Run", "timer", "Running"],
  ["Canicross Powered", "timer", "Running"],
  ["Senior", "timer", "Running", "Lowestoft Scores Race"],
  ["Championship Relay", "timer", "Running", "Norfolk Gazelles 'Big Stampede'"],
  ["Human Powered", "timer", "Running", "Rag-it-Round Repps"],
  ["Human Powered - Go Short", "timer", "Running", "The Nelson Knee-Knobbler (race 3)"],
  ["Human Powered", "timer", null, "Another event"],
  ["5.9M", "powerof10", "Running"],
  ["2M Relay Leg", "powerof10", "Running"],
  ["2.65MLT", "powerof10", "Running"],
  ["5.5MT", "powerof10", "Running"],
  ["4KXL", "powerof10", "Running"],
  ["10KDH", "powerof10", "Running"],
  ["100m", "powerof10", "Athletics"],
  ["5.9M", "another source", null],
  ["One Hour", "World Athletics", "Athletics"],
  ["One Hour", "worldathletics", "Athletics"],
  ["One Hour", "unknown source", null],
  ["TriU13M", "powerof10", "Athletics"],
  ["PenU17MNS", "powerof10", "Athletics"],
  ["TriU11M", "powerof10", "Athletics"],
  ["TriU13M", "unknown source", null],
  ["Relay Leg", "powerof10", "Running", "Regional Road Relay Championships"],
  ["Relay Leg", "powerof10", null, "Unknown relay"],
  ["Virtual Run", "timer", "Running"],
  ["Virtual Challenge", "timer", null],
];
const db = new PGlite();
try {
  await db.exec(
    "create table athlete_source_histories(provider text,performances jsonb); create table athletes(profile_details jsonb)",
  );
  const migration = await readFile(
    new URL("../migrations/20261024_athlete_sport_classification_v4.sql", import.meta.url),
    "utf8",
  );
  assert.equal(
    migration,
    sourceHistorySportMigration(),
    "SQL must stay generated from the display rules",
  );
  // Building the expression index also exercises PostgreSQL's restricted search path.
  await db.exec(migration);
  const profileMigration = await readFile(
    new URL("../migrations/20261024_athlete_sport_profile_evidence_v2.sql", import.meta.url),
    "utf8",
  );
  assert.equal(profileMigration, profileSportEvidenceMigration());
  await db.exec(profileMigration);
  const rank = {
    provider: "powerof10",
    sourceUrl: "https://www.powerof10.uk/Home/Athlete/synthetic",
    rankingTitle: "10K Overall Men 2026 to 40:00",
  };
  const directory = {
    url: "https://worldathletics.org/athletes-home?disciplineCode=5RR",
    row: { aaAthleteId: "synthetic", disciplines: "3000 Metres, 10,000 Metres, 10 Kilometres" },
  };
  for (const [details, expected] of [
    [null, []],
    [{}, []],
    [{ sports: ["Running"] }, []],
    [{ powerOf10Ranking20260917: rank }, ["Running"]],
    [{ powerOf10Ranking20260917: { ...rank, sourceUrl: "https://example.test/unverified" } }, []],
    [{ directorySource: directory }, ["Athletics", "Running"]],
    [
      { directorySource: { ...directory, row: { ...directory.row, disciplines: "5000 Metres" } } },
      ["Athletics"],
    ],
    [
      {
        publishedRaceHistory: {
          status: "public",
          includeInRaceResults: true,
          entries: [
            {
              distance: "Half marathon",
              includeInRaceResults: true,
              verificationStatus: "unverified",
            },
          ],
        },
      },
      ["Running"],
    ],
    [
      {
        publishedRaceHistory: {
          status: "draft",
          includeInRaceResults: true,
          entries: [{ distance: "Half marathon", includeInRaceResults: true }],
        },
      },
      [],
    ],
    [{ preparedPublicRaceHistory: { entries: [{ distance: "Marathon" }] } }, []],
    [
      { publication_approved: true, user_supplied_sports: ["Triathlon", "Running", "Unsupported"] },
      ["Running", "Triathlon"],
    ],
    [{ publication_approved: false, user_supplied_sports: ["Running"] }, []],
    [{ publication_approved: "true", user_supplied_sports: ["Running"] }, []],
    [{ directorySource: [], publishedRaceHistory: { entries: {} }, user_supplied_sports: {} }, []],
  ]) {
    assert.deepEqual(profileEvidenceSports(details), expected);
    const { rows } = await db.query("select athlete_profile_sports_v2($1) sports", [
      JSON.stringify(details),
    ]);
    assert.deepEqual(rows[0].sports, expected, "Profile evidence JS/SQL parity");
  }
  for (const [discipline, provider, expected, meeting = ""] of examples) {
    assert.equal(sourceHistorySport(discipline, provider, meeting), expected, discipline);
    const { rows } = await db.query("select athlete_source_sport_v4($1,$2,$3) as sport", [
      provider,
      discipline,
      meeting,
    ]);
    assert.equal(rows[0].sport, expected, `Postgres: ${discipline}`);
  }
  const history = ["5 mile trail", "parkrun", "800m", "10K", "Senior"].map((discipline) => ({
    discipline,
  }));
  history.push({ discipline: "Triathlon", profileExcluded: true });
  await db.query("insert into athlete_source_histories values ('fixture',$1)", [
    JSON.stringify(history),
  ]);
  const { rows } = await db.query(
    "select athlete_history_sports_v4(provider,performances) as sports from athlete_source_histories",
  );
  assert.deepEqual(
    rows[0].sports,
    ["Athletics", "Parkrun", "Running"],
    "Keep supported multi-sport memberships, exclude unknown and hidden performances",
  );
  const { rows: empty } = await db.query(
    "select athlete_history_sports_v4('fixture',null) as sports",
  );
  assert.deepEqual(empty[0].sports, []);
  const timeline = buildProfileTimeline(
    [],
    [
      {
        provider: "fixture",
        externalId: "1",
        sourceUrl: "https://example.test",
        performances: [
          {
            discipline: "Senior",
            date: "",
            year: 2026,
            performance: "",
            place: "",
            wind: "",
            venue: "",
            meeting: "",
            labels: [],
            sourceUrls: [],
          },
        ],
      },
    ],
  );
  assert.equal(timeline.count, 1, "Unknown sport cannot delete an existing performance");
  assert.equal(timeline.history[0].sport, "Unclassified");
  assert(isCrossCountryHistoryResult({ discipline: "10KXC", labels: [] }));
  assert(isCrossCountryHistoryResult({ discipline: "ZXCL", labels: [] }));
  assert(isTrailHistoryResult({ discipline: "5 mile trail", labels: [] }));
  console.log(
    `Source history sport: ${examples.length} JS/PostgreSQL cases, index, exclusions, multi-sport and unknown-result preservation passed.`,
  );
} finally {
  await db.close();
}
