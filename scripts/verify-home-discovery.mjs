import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { homeProfileSlugs } from "../src/lib/athrecs/home-discovery.server.ts";
import { parseShortlist } from "../src/components/home/use-home-shortlist.ts";

// Isolated synthetic records exercise each privacy boundary in the real query.
const fixture = new PGlite();
await fixture.exec(`
  create table athletes(id integer primary key, slug text, profile_type text, profile_visibility text);
  create table results(id integer, athlete_id integer, edition_id integer, result_visibility text);
  create table editions(id integer, event_id integer, event_date date);
  create table events(id integer, sport text);
  create table athlete_account_links(athlete_id integer, user_id text, status text);
  create table athlete_public_shares(user_id text, enabled boolean, share_results boolean);
  create table athlete_profile_hidden_results(user_id text, result_id integer);
  insert into events values (1,'Running'),(2,'Swimming');
  insert into editions values (1,1,'2020-01-01'),(2,2,'2020-02-01'),(3,1,current_date+1);
  insert into athletes values
    (1,'public','Individual','public'), (2,'private','Individual','private'),
    (3,'private-result','Individual','public'), (4,'hidden','Individual','public'),
    (5,'sharing-off','Individual','public'), (6,'results-off','Individual','public'),
    (7,'swimmer','Individual','public'), (8,'future','Individual','public'),
    (9,'public-figure','Public figure','private');
  insert into results values
    (1,1,1,'public'), (2,2,1,'public'), (3,3,1,'private'), (4,4,1,'public'),
    (5,5,1,'public'), (6,6,1,'public'), (7,7,2,'public'), (8,8,3,'public'),
    (9,9,1,'private');
  insert into athlete_account_links values (4,'hidden-owner','active'),(5,'disabled-owner','active'),(6,'results-owner','active');
  insert into athlete_public_shares values ('disabled-owner',false,true),('results-owner',true,false);
  insert into athlete_profile_hidden_results values ('hidden-owner',4);
`);
const sql = async (strings, ...values) => {
  const text = strings.reduce((query, segment, i) => query + (i ? `$${i}` : "") + segment, "");
  return (await fixture.query(text, values)).rows;
};
assert.deepEqual(
  (await homeProfileSlugs(sql, null)).map((r) => r.slug),
  ["swimmer", "public", "public-figure"],
);
assert.deepEqual(
  (await homeProfileSlugs(sql, "Swimming")).map((r) => r.slug),
  ["swimmer"],
);
assert.deepEqual(await homeProfileSlugs(sql, "Swimming' OR 1=1 --"), []);
await fixture.close();
assert.deepEqual(parseShortlist("malformed"), []);
assert.deepEqual(parseShortlist('{"kind":"athlete"}'), []);
assert.deepEqual(
  parseShortlist(
    JSON.stringify([{ key: "a", kind: "athlete", name: "Synthetic", href: "javascript:alert(1)" }]),
  ),
  [],
);
assert.deepEqual(
  parseShortlist(
    JSON.stringify([{ key: "a", kind: "athlete", name: "Synthetic", href: "//example.com" }]),
  ),
  [],
);
const saved = {
  key: "athlete:sample",
  kind: "athlete",
  name: "Synthetic athlete",
  href: "/athletes/sample",
};
assert.deepEqual(parseShortlist(JSON.stringify([saved])), [saved]);
console.log(
  "PASS: homepage privacy, sport filtering, literal query values and shortlist validation",
);

if (!process.argv.includes("--http")) process.exit(0);

// Exercise the compiled server functions and SSR against the app's disposable
// PGLite database, never a configured/production database.
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_STAFF_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
const origin = "http://127.0.0.1:18196";
process.env.BETTER_AUTH_URL = origin;
process.env.BETTER_AUTH_SECRET = "local-home-discovery-test-secret-at-least-32-characters";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const { createServer } = await import("vite");
const { createClientRpc } = await import("@tanstack/start-client-core/client-rpc");
const { runWithStartContext } = await import("@tanstack/start-storage-context");
const server = await createServer({ server: { host: "127.0.0.1", port: 18196, strictPort: true } });
let database;
try {
  await server.listen();
  console.log("Homepage HTTP server listening");
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  console.log("Homepage test database ready");
  const compiled = await (await fetch(`${origin}/src/lib/athrecs/home-discovery-api.ts`)).text();
  async function rpc(name, data, token, clientContext = false) {
    const start = compiled.indexOf(`const ${name} =`);
    assert(start >= 0);
    const section = compiled.slice(start, compiled.indexOf(";", start));
    const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
    assert(id);
    const response = await runWithStartContext({ startOptions: {} }, () =>
      createClientRpc(id)({
        method: "GET",
        data,
        headers: {
          origin,
          "sec-fetch-site": "same-origin",
          ...(!clientContext && token ? { authorization: `Bearer ${token}` } : {}),
        },
        context: clientContext ? { bearerToken: token } : {},
      }),
    );
    if (response.error) throw response.error;
    return response.result;
  }
  console.log("Homepage RPC module compiled");
  const anonymous = await rpc("getHomeDiscovery", {});
  assert.equal(anonymous.canViewProfiles, false);
  assert.deepEqual(anonymous.people, []);
  const invalid = await rpc("getHomeDiscovery", {}, "invalid-token");
  assert.equal(invalid.canViewProfiles, false);
  assert.deepEqual(invalid.people, []);
  console.log("Anonymous and invalid-token homepage feeds omit profile performances");
  const signup = await fetch(`${origin}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({
      name: "Home Discovery Viewer",
      email: "home-viewer@example.test",
      password: "Home-only-test-password-123!",
    }),
  });
  assert.equal(signup.status, 200, await signup.clone().text());
  const { token } = await signup.json();
  assert(token);
  const home = await rpc("getHomeDiscovery", {}, token);
  assert.equal(home.canViewProfiles, true);
  const clientHome = await rpc("getHomeDiscovery", {}, token, true);
  assert.equal(clientHome.canViewProfiles, true);
  assert.deepEqual(clientHome.people, home.people);
  assert(home.directory.publicAthletes > 0);
  assert(home.people.length > 0, "Seed catalogue should provide real public spotlights");
  for (const person of home.people) {
    assert(person.results.length > 0);
    assert(!("sourceHistories" in person));
    assert(!("date_of_birth" in person));
    assert(!("profile_details" in person));
    assert(!("sourceUrls" in person.results[0]));
  }
  assert(
    home.events.every(
      (event) => event.href.startsWith("/races/") || /^https?:\/\//.test(event.href),
    ),
  );
  const swimming = await rpc("getHomeDiscovery", { sport: "Swimming" }, token);
  assert(swimming.people.every((person) => person.results.every((r) => r.sport === "Swimming")));
  assert(swimming.events.every((event) => event.sport === "Swimming"));
  const empty = await rpc("getHomeDiscovery", { sport: "No such sport" }, token);
  assert.equal(empty.people.length, 0);
  assert.equal(empty.events.length, 0);
  for (const kind of ["Athletes", "Results", "Events", "Clubs"]) {
    const search = await rpc("searchHomeDiscovery", {
      kind,
      q: kind === "Events" ? "" : home.people[0].name,
    });
    assert(Array.isArray(search));
    if (kind === "Athletes" || kind === "Results")
      assert(search.some((r) => r.label === home.people[0].name));
  }
  const response = await fetch(origin);
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const text of [
    "Your sporting life",
    "Recent performances",
    "Athlete spotlight",
    "Find your next event",
    "Achievements worth sharing",
    "athrecs-logo-header.png",
    "Berlin Marathon 2026",
    "Your next event starts here",
    "Sign in to explore athlete performances",
  ])
    assert(html.includes(text), text);
  for (const href of [
    "/results/berlin-marathon-2026",
    "/races",
    "/sports/road-running",
    "/calendar",
    "/running/calendar",
    "/running",
    "/running#countries-title",
    "/running#half-marathons",
    "/running/uk-road-ultramarathons",
    "/find-events",
  ]) {
    assert(html.includes(`href="${href}"`), href);
  }
  const { MARATHON_COUNTRIES } = await import("../src/data/road-marathons/countries.ts");
  for (const country of MARATHON_COUNTRIES)
    assert(html.includes(`href="/running/${country.guide}"`), country.guide);
  assert(!html.includes("Illustrative athletes"));
  console.log(
    `PASS: homepage HTTP loader, four searches, sports, empty states and SSR (${home.people.length} public spotlights)`,
  );
} finally {
  await server.close();
  await database?.close();
}
