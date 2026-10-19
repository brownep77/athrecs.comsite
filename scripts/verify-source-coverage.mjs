// Runs inside the existing disposable database / authenticated real-RPC suite.
import assert from "node:assert/strict";

export async function verifySourceCoverage({ sql, read }) {
  const report = (group, extra = {}) => read({ section: "sources", group, ...extra });
  for (const group of ["fixtures", "athleteSources", "resultSources", "profileResults"])
    await assert.rejects(() => read({ section: "sources", group }, "member-token"), /Forbidden/);

  await sql`update events set source_url='https://www.Fixtures.test/calendar' where slug='stats-multi'`;
  await sql`update editions set source_url='https://other.test/edition' where event_id=(select id from events where slug='stats-multi') and distance_code='10K'`;
  const fixtures = await report("fixtures");
  const fixture = fixtures.rows.find((r) => r.label === "fixtures.test · Running");
  assert.equal(fixture.count, 2);
  assert.equal(fixture.denominator, 3);
  assert.equal(fixture.share, 66.7);
  assert.equal(fixtures.rows.find((r) => r.label === "other.test · Running").share, 33.3);
  assert.equal(
    fixtures.rows.reduce((n, r) => n + r.count, 0),
    4,
    "Alias excluded",
  );
  assert.equal((await report("fixtures", { mode: "records", key: fixture.drill })).total, 2);
  assert.equal((await report("fixtures", { q: "' OR 1=1 --" })).total, 0);
  assert.equal((await report("fixtures", { page: 100 })).rows.length, 0);

  const [athlete] = await sql`select id from athletes where slug='stats-male'`;
  const [result] =
    await sql`select id from results where athlete_id=${athlete.id} and source_url='https://example.test/results'`;
  await sql`update athletes set source_url='https://www.EXAMPLE.test/athlete' where id=${athlete.id}`;
  await sql`insert into result_source_references(result_id,source_url,source_name) values(${result.id},'https://www.EXAMPLE.test/extra','Synthetic'),(${result.id},'https://second.test/result','Second')`;
  const athletes = await report("athleteSources");
  const first = athletes.rows.find((r) => r.key === "example.test");
  assert.equal(
    first.count,
    2,
    "Profile, history and result evidence deduplicated per athlete/host",
  );
  assert.equal(first.denominator, 4, "Synthetic profile excluded");
  assert.equal(first.share, 50);
  assert.equal((await report("athleteSources", { mode: "records", key: first.drill })).total, 2);
  assert.equal(athletes.rows.find((r) => r.key === "Unknown source").count, 2);
  const results = await report("resultSources");
  assert.equal(results.rows.find((r) => r.key === "example.test").count, 2);
  assert.equal(results.rows.find((r) => r.key === "example.test").denominator, 3);
  assert.equal(results.rows.find((r) => r.key === "second.test").share, 33.3);
  assert.equal(results.rows.find((r) => r.key === "Unknown source").count, 1);
  assert.equal((await report("resultSources", { mode: "records", key: "example.test" })).total, 2);

  const unknown = await report("profileResults");
  assert(
    unknown.rows.every((r) => r.percent === null),
    "No expected years means unknown, never 100%",
  );
  const [history] =
    await sql`select * from athlete_source_histories where athlete_id=${athlete.id} and provider='Synthetic'`;
  await sql`update athlete_source_histories set years_expected='{2024,2024,2025}',years_captured='{2024,2024,2099}',captured_at='2026-01-02T12:00:00Z',performances=performances||'[{"syntheticTest":true},{"profileExcluded":true}]'::jsonb where athlete_id=${athlete.id} and provider='Synthetic'`;
  const histories = await report("profileResults");
  const row = histories.rows.find((r) => JSON.parse(r.key)[0] === athlete.id);
  assert.equal(row.expected, 2);
  assert.equal(row.captured, 1);
  assert.equal(row.percent, 50, "Duplicate/extra captured years cannot inflate completion");
  assert.equal(row.saved, 2, "Hidden/synthetic performances excluded");
  assert.equal(new Date(row.checked).toISOString(), "2026-01-02T12:00:00.000Z");
  assert.notEqual(
    row.checked,
    histories.generatedAt,
    "Capture time never replaced by report load time",
  );
  assert.equal((await report("profileResults", { mode: "records", key: row.drill })).total, 2);
  const datasets = await report("datasets");
  assert.equal(datasets.rows[0].matched, 50);
  assert(datasets.rows[0].label.includes("2025-01-01"));
  assert(datasets.rows[0].label.includes("5K"));
  for (const expected of [null, 0, 1]) {
    await sql`update result_archive_datasets set expected_rows=${expected}`;
    assert.equal((await report("datasets")).rows[0].percent, expected === 1 ? 200 : null);
  }
  // Restore fixtures used by the rest of the existing suite.
  await sql`update result_archive_datasets set expected_rows=2`;
  await sql.query(
    "update athlete_source_histories set years_expected=$1,years_captured=$2,captured_at=$3,performances=$4::jsonb where athlete_id=$5 and provider='Synthetic'",
    [
      history.years_expected,
      history.years_captured,
      history.captured_at,
      JSON.stringify(history.performances),
      athlete.id,
    ],
  );
  await sql`delete from result_source_references where result_id=${result.id}`;
  console.log(
    "PASS: source shares, denominator boundaries, multi-source deduplication, editions, history year coverage, unknowns, capture timestamps and staff-only RPCs.",
  );
}
