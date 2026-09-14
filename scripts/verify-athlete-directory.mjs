// Exercise the real importer and HTTP handlers against a disposable PGLite database.
// Environment changes affect only this test process, never a deployment or configured database.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "false";
const origin = "http://127.0.0.1:18190";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18190, strictPort: true } });
let database;
const cache = new Map();
async function rpc(file, name, data, headers) {
  if (!cache.has(file)) {
    const response = await fetch(`${origin}/src/lib/athrecs/${file}.ts`);
    assert.equal(response.status, 200);
    cache.set(file, await response.text());
  }
  const source = cache.get(file);
  const start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} must be present in the compiled client module`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method, `${name} must use the framework's RPC transport`);
  // Supply transport configuration in Node; the actual HTTP server still runs
  // its own request context, authentication, validation and database queries.
  const response = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: { origin, "sec-fetch-site": "same-origin", ...headers },
      context: {},
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
try {
  await server.listen();
  const dbModule = await server.ssrLoadModule("/src/lib/db.ts");
  database = await dbModule.getPglite();
  const sql = await dbModule.getSql();
  const before = await rpc("athlete-directory-api", "getAthleteDirectory", {});
  const fields = [
    ["alpha", "Directory Fixture Alpha", "England", "public"],
    ["beta", "Directory Fixture Beta", "Scotland", "public"],
    ["gamma", "Directory Fixture Gamma", "IE", "public"],
    ["delta", "Directory Fixture Delta", "Ireland", "public"],
    ["secret", "Directory Fixture Secret", "Secret country", "private"],
  ];
  for (const [slug, name, country, visibility] of fields) {
    await sql`insert into athletes (slug, display_name, country, profile_visibility)
      values (${`directory-fixture-${slug}`}, ${name}, ${country}, ${visibility})`;
  }
  const [event] = await sql`insert into events (slug, name, sport, county, city, country)
    values ('directory-fixture-event', 'Directory Fixture', 'Swimming', '', '', 'Ireland') returning id`;
  const [edition] = await sql`insert into editions (event_id, event_date, distance_code)
    values (${event.id}, '2026-07-01', '10K') returning id`;
  const fixtureIds = await sql`select id, slug from athletes where slug like 'directory-fixture-%'`;
  for (const athlete of fixtureIds) {
    await sql`insert into results (edition_id, athlete_id, finish_time_seconds, result_visibility)
      values (${edition.id}, ${athlete.id}, 2700, ${athlete.slug.endsWith("beta") ? "private" : "public"})`;
  }
  const first = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: "Directory Fixture",
    pageSize: 2,
  });
  assert.equal(first.total, 4);
  assert.equal(first.athletes.length, 2);
  assert.deepEqual(
    first.athletes.map((a) => a.display_name),
    ["Directory Fixture Alpha", "Directory Fixture Beta"],
  );
  assert.equal(first.publicAthletes, before.publicAthletes + 4);
  assert.equal(first.publicResults, before.publicResults + 3);
  assert(
    !first.countries.includes("Secret country"),
    "Private profiles cannot leak through facets",
  );
  assert.equal(
    first.athletes[1].result_count,
    0,
    "A public profile cannot expose private result counts",
  );
  assert.deepEqual(first.athletes[1].sports, [], "Private results cannot expose a sport");
  const second = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: "Directory Fixture",
    pageSize: 2,
    page: 2,
  });
  assert.deepEqual(
    second.athletes.map((a) => a.display_name),
    ["Directory Fixture Delta", "Directory Fixture Gamma"],
  );
  const beyond = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: "Directory Fixture",
    pageSize: 2,
    page: 999,
  });
  assert.equal(beyond.page, 2, "Out-of-range pages recover to the last valid page");
  const uk = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: "Directory Fixture",
    country: "United Kingdom",
  });
  assert.equal(uk.total, 2);
  const ireland = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: "Directory Fixture",
    country: "Ireland",
    sport: "Swimming",
  });
  assert.equal(ireland.total, 2);
  const sport = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: "Directory Fixture",
    sport: "Swimming",
  });
  assert.equal(sport.total, 3, "Sport filtering includes only visible performances");
  assert.equal(
    (await rpc("athlete-directory-api", "getAthleteDirectory", { q: "Directory Fixture Secret" }))
      .total,
    0,
  );
  assert.equal(
    (await rpc("athlete-directory-api", "getAthleteDirectory", { q: "%Directory Fixture%" })).total,
    0,
    "Search treats wildcards as literal text",
  );
  await assert.rejects(rpc("athlete-directory-api", "getAthleteDirectory", { pageSize: 10000 }));
  for (const path of ["/", "/athletes?country=Ireland", "/find-events"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, `${path} must render`);
    const html = await response.text();
    assert(!html.includes("Directory Fixture Secret"));
    if (path === "/") {
      assert(html.includes("Your sporting life,"));
      assert(html.includes("https://www.runrecs.com/races"));
      assert(!html.includes("Upcoming athletics"));
    }
    if (path === "/find-events") assert(html.includes("https://triathlon.org/events"));
  }
  console.log(
    "Athlete discovery verified over HTTP: search, country, sport, pagination, visibility, counts and page rendering.",
  );
} finally {
  await server.close();
  if (database) await database.close();
}
