// Exercise the public club RPC against a disposable database. No production writes.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "false";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18247";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({
  cacheDir: "node_modules/.vite-club-counts",
  server: { host: "127.0.0.1", port: 18247, strictPort: true },
});
let database;
try {
  await server.listen();
  const module = await server.ssrLoadModule("/src/lib/db.ts");
  database = await module.getPglite();
  const sql = await module.getSql();
  const response = await fetch(`${origin}/src/lib/athrecs/api.ts`);
  assert.equal(response.status, 200);
  const source = await response.text();
  const start = source.indexOf("const getClubBySlug =");
  assert(start >= 0);
  const id = source
    .slice(start, source.indexOf(";", start))
    .match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(id);
  async function readClub(slug) {
    const response = await runWithStartContext({ startOptions: {} }, () =>
      createClientRpc(id)({
        method: "GET",
        data: slug,
        context: {},
        headers: { origin, "sec-fetch-site": "same-origin" },
      }),
    );
    if (response.error) throw response.error;
    return response.result;
  }
  await readClub("synthetic-club-counts-missing"); // Complete normal schema and seed setup.
  const [club] = await sql`insert into clubs (slug,name,city,county,country,sports)
    values ('synthetic-club-counts','Synthetic Club Counts','','','England','Triathlon') returning id`;
  const athletes = [];
  for (const name of ["History", "Mixed", "Empty", "Private"]) {
    const [athlete] = await sql`insert into athletes (slug,display_name,club_id,profile_visibility)
      values (${`synthetic-club-counts-${name.toLowerCase()}`},${name},${club.id},${name === "Private" ? "private" : "public"})
      returning id`;
    athletes.push(athlete);
    await sql`insert into network_audit_log(action,entity_type,entity_id,after_value,note)
      values ('athlete.bulk_publish','athlete',${String(athlete.id)},'{"profile_visibility":"public"}'::jsonb,'Synthetic count fixture')`;
  }
  const performance = {
    year: 2026,
    date: "2026-10-01",
    sourceDate: "2026-10-01",
    ageGroup: "F30-34",
    discipline: "Full-distance triathlon",
    performance: "12:00:00",
    wind: "",
    place: "",
    venue: "Synthetic venue",
    meeting: "Synthetic triathlon",
    sourceUrls: ["https://example.test/results"],
    labels: [],
    verificationStatus: "source_verified",
  };
  for (const athlete of [athletes[0], athletes[1], athletes[3]]) {
    const rows = [
      performance,
      { ...performance, date: "2025-10-01", year: 2025 },
      { ...performance, profileExcluded: true },
    ];
    await sql`insert into athlete_source_histories
      (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
      values (${athlete.id},'Synthetic timer',${String(athlete.id)},'https://example.test/results',now(),false,'{}','{2025,2026}',${JSON.stringify(rows)}::jsonb,now())`;
  }
  await sql`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
    values (${athletes[0].id},'Synthetic timer','unpublished','https://example.test/unpublished',now(),false,'{}','{2026}',${JSON.stringify([performance])}::jsonb)`;
  const [event] = await sql`insert into events (slug,name,sport,county,city,country)
    values ('synthetic-club-counts-event','Synthetic road event','Running','','','England') returning id`;
  const [edition] = await sql`insert into editions (event_id,event_date,distance_code)
    values (${event.id},'2026-09-01','10K') returning id`;
  await sql`insert into results (edition_id,athlete_id,finish_time_seconds,result_visibility)
    values (${edition.id},${athletes[1].id},2700,'public')`;
  const published = await readClub("synthetic-club-counts");
  assert.deepEqual(
    published.members.map((m) => [m.display_name, m.result_count]),
    [
      ["Empty", 0],
      ["History", 2],
      ["Mixed", 3],
    ],
    "Club cards include published source results alongside imported results, excluding private profiles and excluded or unpublished rows",
  );
  assert.equal(published.moreMembers, false);
  assert(
    !JSON.stringify(published).includes("example.test"),
    "Club response contains counts, not private source evidence",
  );
  await sql`update athlete_source_histories set published_at=null where athlete_id=${athletes[0].id}`;
  assert.equal(
    (await readClub("synthetic-club-counts")).members.find((m) => m.display_name === "History")
      .result_count,
    0,
    "Withdrawing source publication updates the club count immediately",
  );
  console.log(
    "Club result counts passed: source-only, mixed, empty, unpublished, excluded and private records through the public RPC.",
  );
} finally {
  await server.close();
  if (database) await database.close();
}
