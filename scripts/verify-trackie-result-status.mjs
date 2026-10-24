import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

// Extract the literal SQL without importing publisher code or connecting to a service.
const importer =
  process.argv[2] ??
  fileURLToPath(new URL("./publish-trackie-profiles.py", import.meta.url));
const resultSql = JSON.parse(
  execFileSync(
    "python3",
    [
      "-c",
      `
import ast,json,pathlib,sys
tree=ast.parse(pathlib.Path(sys.argv[1]).read_text())
values=[ast.literal_eval(node.value) for node in tree.body if isinstance(node,ast.Assign)
        and any(isinstance(target,ast.Name) and target.id=='RESULT_SQL' for target in node.targets)]
assert len(values)==1
matches=[sql for sql in values[0] if sql.startswith('INSERT INTO results(')]
assert len(matches)==1
print(json.dumps(matches[0]))
`,
      importer,
    ],
    { encoding: "utf8" },
  ),
);

const highJump = "Event 52 Men High Jump OPEN";
const cases = [
  ["qualified height", "J1.85m", highJump, "unknown", "finished"],
  [
    "junior qualified height",
    "J1.40m",
    "Women 14-15 High Jump",
    "unknown",
    "finished",
  ],
  ["explicit completed height", "J1.80m", highJump, "finished", "finished"],
  ["plain height", "1.85m", highJump, "unknown", "finished"],
  ["plain long jump", "4.37m", "Women 14-15 Long Jump", "unknown", "finished"],
  ["sprint seconds", "23.35", "Women 200 Meter Dash", "finished", "finished"],
  ["track minutes", "1:03.62", "Women 400 Meter Dash", "finished", "finished"],
  [
    "pentathlon total",
    "2269",
    "Women Throws Pentathlon",
    "unknown",
    "finished",
  ],
  ...["NM", "NH", "FOUL", "PASS", "XDNF", "DNS", "DNF", "DQ", "NT"].map(
    (mark) => [`raw ${mark}`, mark, highJump, "unknown", mark],
  ),
  ...["NM", "NH", "FOUL", "PASS", "XDNF", "DNS", "DNF", "DQ", "NT"].map(
    (status) => [
      `explicit ${status} overrides J mark`,
      "J1.85m",
      highJump,
      status,
      status,
    ],
  ),
  [
    "explicit DNF overrides numeric mark",
    "23.35",
    "Women 200 Meter Dash",
    "DNF",
    "DNF",
  ],
  ["case-insensitive explicit status", "J1.85m", highJump, "dnf", "dnf"],
  ["retain explicit status text", "J1.85m", highJump, " NH ", " NH "],
  ...[
    "J1.8.5m",
    "J1.85",
    "J0m",
    "J0.00m",
    "J-1.85m",
    "J1.85m extra",
    "J1:85m",
    "JInfinitym",
    "J 1.85m",
  ].map((mark) => [
    `malformed or zero ${mark}`,
    mark,
    highJump,
    "unknown",
    mark,
  ]),
  ...[
    "Men Long Jump",
    "Men Pole Vault",
    "Men Javelin Throw",
    "Men High Jumper",
    "Men NotHigh Jump",
  ].map((event) => [
    `unsupported context ${event}`,
    "J1.85m",
    event,
    "unknown",
    "J1.85m",
  ]),
  [
    "unexpected source state remains held",
    "J1.85m",
    highJump,
    "pending",
    "J1.85m",
  ],
  ["nonfinish raw mark remains nonfinish", "NH", highJump, "finished", "NH"],
];

const db = new PGlite();
try {
  await db.exec(`
    create table trackie_plan(p jsonb);
    create table athletes(id integer primary key, slug text unique);
    create table events(id integer primary key, slug text unique);
    create table editions(id integer primary key, event_id integer, event_date date, distance_code text);
    create table results(
      edition_id integer, athlete_id integer, status text, finish_time_seconds integer,
      overall_place integer, category text, bib text, result_source text, source_url text,
      result_visibility text, result_details jsonb, unique(edition_id, athlete_id)
    );
  `);
  const profiles = cases.map(
    ([, performance, competitionName, sourceStatus], index) => ({
      slug: `synthetic-trackie-${index + 1}`,
      performances: [
        {
          performance,
          competitionName,
          sourceStatus,
          eventSlug: `synthetic-meet-${index + 1}`,
          date: "2026-05-16",
          ageGroup: "",
          bib: "",
          place: "5",
          sourceClub: "Synthetic club",
          sourceUrls: ["https://example.invalid/results"],
          notes: "",
          archiveReference: {
            sourceKey: "synthetic",
            sourceRow: `page:1/row:${index + 1}`,
          },
        },
      ],
    }),
  );
  await db.query("insert into trackie_plan values ($1::jsonb)", [
    JSON.stringify({ profiles }),
  ]);
  await db.exec(`
    insert into athletes select row_number() over ()::int, x->>'slug'
      from trackie_plan cross join lateral jsonb_array_elements(p->'profiles') x;
    insert into events select row_number() over ()::int, x->'performances'->0->>'eventSlug'
      from trackie_plan cross join lateral jsonb_array_elements(p->'profiles') x;
    insert into editions select row_number() over ()::int, e.id,
      (x->'performances'->0->>'date')::date, x->'performances'->0->>'competitionName'
      from trackie_plan cross join lateral jsonb_array_elements(p->'profiles') x
      join events e on e.slug=x->'performances'->0->>'eventSlug';
  `);
  await db.exec(resultSql);
  const { rows } = await db.query("select * from results order by athlete_id");
  assert.equal(rows.length, cases.length);
  cases.forEach(([label, performance, , , expectedStatus], index) => {
    const row = rows[index];
    assert.equal(row.status, expectedStatus, label);
    assert.equal(
      row.result_details.reportedPerformance,
      performance,
      `${label}: raw mark retained`,
    );
    assert.equal(
      row.result_details.reportedPlace,
      "5",
      `${label}: source placing retained`,
    );
    assert.equal(
      row.result_details.profileExcluded,
      true,
      `${label}: mirror exclusion retained`,
    );
    assert.equal(
      row.result_details.verificationStatus,
      "unverified",
      `${label}: not automatically verified`,
    );
    assert.equal(row.finish_time_seconds, null, `${label}: no fabricated time`);
    assert.equal(
      row.overall_place,
      null,
      `${label}: no fabricated race ranking`,
    );
  });
  // Replay must preserve a later reviewed canonical status.
  await db.exec(
    "update results set status='reviewed-status' where athlete_id=1",
  );
  await db.exec(resultSql);
  assert.equal(
    (await db.query("select status from results where athlete_id=1")).rows[0]
      .status,
    "reviewed-status",
  );
  console.log(
    JSON.stringify({
      passed: true,
      cases: cases.length,
      checks: [
        "actual publisher SQL",
        "raw mark and placing retained",
        "explicit nonfinish precedence",
        "malformed/context rejection",
        "no automatic verification",
        "conflict replay preserves later edit",
      ],
    }),
  );
} finally {
  await db.close();
}
