// Daily growth dashboard: counts per London day from disposable synthetic data.
import assert from "node:assert/strict";
import { createServer } from "vite";

for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"])
  process.env[key] = "";
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  const sql = await db.getSql();
  const { readGrowth } = await server.ssrLoadModule("/src/lib/growth/service.server.ts");
  const { growthTotals } = await server.ssrLoadModule("/src/lib/growth/core.ts");

  const empty = await readGrowth(sql, 30);
  assert.equal(empty.days.length, 30);
  assert(empty.days.every((d) => d.fixtures === 0 && d.signups === 0));

  const [ev] =
    await sql`insert into events(slug,name,sport) values('growth-ev','Growth 10K','Running') returning id`;
  const [ed] =
    await sql`insert into editions(event_id,event_date,distance_code,stats_created_at) values(${ev.id},'2027-01-01','10K',now()) returning id`;
  await sql`insert into editions(event_id,event_date,distance_code,stats_created_at) values(${ev.id},'2027-02-01','10K',now()-interval '3 days')`;
  const [a] =
    await sql`insert into athletes(slug,display_name) values('growth-a','Growth Runner') returning id`;
  await sql`insert into athletes(slug,display_name,profile_details) values('growth-test','Fictional','{"syntheticTest":true}')`;
  await sql`insert into results(athlete_id,edition_id,finish_time_seconds,stats_created_at) values(${a.id},${ed.id},2400,now())`;
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt") values('growth-u','G','g@example.test',true,now()),('growth-old','O','o@example.test',true,now()-interval '40 days')`;

  const report = await readGrowth(sql, 30);
  const today = growthTotals(report.days, 1);
  const month = growthTotals(report.days, 30);
  assert.equal(today.fixtures, 1);
  assert.equal(month.fixtures, 2);
  assert.equal(today.results, 1);
  assert.equal(today.profiles, 1, "synthetic test profiles are left out");
  assert.equal(month.signups, 1, "sign-ups older than the window are left out");
  assert.deepEqual(
    report.days.map((d) => d.day),
    [...report.days.map((d) => d.day)].sort().reverse(),
    "newest day first",
  );
  console.log("Growth dashboard checks passed: daily counts, windows and test-record exclusions.");
} finally {
  await server.close();
}
