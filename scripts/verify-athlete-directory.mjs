// Exercise the real importer and HTTP handlers against a disposable PGLite database.
// Environment changes affect only this test process, never a deployment or configured database.
import assert from "node:assert/strict";
import { load } from "cheerio";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "false";
const origin = "http://127.0.0.1:18190";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
console.log("[athlete-directory] Preparing isolated database and HTTP server");
const server = await createServer({ server: { host: "127.0.0.1", port: 18190, strictPort: true } });
console.log("[athlete-directory] Database ready");
let database;
const cache = new Map();
async function rpc(file, name, data, headers) {
  if (!cache.has(file)) {
    console.log(`[athlete-directory] Loading HTTP module ${file}`);
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
  console.log("[athlete-directory] HTTP server ready");
  const dbModule = await server.ssrLoadModule("/src/lib/db.ts");
  database = await dbModule.getPglite();
  const sql = await dbModule.getSql();
  const before = await rpc("athlete-directory-api", "getAthleteDirectory", {});
  assert.equal(before.publicAthletes, null);
  assert.equal(before.publicResults, null);
  console.log("[athlete-directory] Catalogue ready; checking discovery and privacy");
  const accentFixtures = [
    ["accent-jose", "José Carlos Accentfixture", "public"],
    ["accent-plain", "Jose Plain Accentfixture", "public"],
    ["accent-composed", "Zoë Accentfixture", "public"],
    ["accent-decomposed", "Zoe\u0308 Accentfixture", "public"],
    ["accent-unrelated", "Joseph Carlos Accentfixture", "public"],
    ["accent-private", "José Private Accentfixture", "private"],
    ["accent-script", "王 测试目录", "public"],
  ];
  for (const [slug, name, visibility] of accentFixtures) {
    await sql`insert into athletes (slug, display_name, profile_visibility)
      values (${slug}, ${name}, ${visibility})`;
  }
  for (const q of [
    "Jose Carlos Accentfixture",
    "José Carlos Accentfixture",
    "JOSE\u0301 CARLOS ACCENTFIXTURE",
  ]) {
    const found = await rpc("athlete-directory-api", "getAthleteDirectory", { q });
    assert.deepEqual(
      found.athletes.map((athlete) => athlete.slug),
      ["accent-jose"],
    );
    assert.equal(
      found.athletes[0].display_name,
      "José Carlos Accentfixture",
      "Display spelling stays unchanged",
    );
  }
  assert.equal(
    (await rpc("athlete-directory-api", "getAthleteDirectory", { q: "José Plain Accentfixture" }))
      .total,
    1,
    "An accented query also finds an unaccented stored name",
  );
  for (const q of ["Jose", "José"]) {
    const found = await rpc("athlete-directory-api", "getAthleteDirectory", { q });
    assert(
      found.athletes.some((athlete) => athlete.slug === "accent-jose"),
      "The indexed prefilter must fold accents too",
    );
    assert(
      !found.athletes.some((athlete) => athlete.slug === "accent-private"),
      "Accent folding preserves profile privacy",
    );
  }
  for (const q of ["Zoe Accentfixture", "Zoë Accentfixture", "Zoe\u0308 Accentfixture"]) {
    const firstAccentPage = await rpc("athlete-directory-api", "getAthleteDirectory", {
      q,
      pageSize: 1,
    });
    const lastAccentPage = await rpc("athlete-directory-api", "getAthleteDirectory", {
      q,
      pageSize: 1,
      page: 2,
    });
    assert.equal(firstAccentPage.athletes.length, 1);
    assert.equal(firstAccentPage.hasMore, true);
    assert.equal(firstAccentPage.total, null);
    assert.equal(lastAccentPage.total, 2);
    assert.equal(lastAccentPage.hasMore, false);
    assert.deepEqual(
      [firstAccentPage.athletes[0].slug, lastAccentPage.athletes[0].slug].sort(),
      ["accent-composed", "accent-decomposed"],
      "Canonical Unicode forms match without duplicates or changes to bounded pagination",
    );
  }
  for (const q of ["%José Carlos Accentfixture%", "José_", "\u0301\u0308", "\u0301 \u0308"]) {
    assert.equal(
      (await rpc("athlete-directory-api", "getAthleteDirectory", { q })).total,
      0,
      "Literal wildcards and accent-only queries must never broaden discovery",
    );
  }
  assert.equal(
    (await rpc("athlete-directory-api", "getAthleteDirectory", { q: "测试目录" })).total,
    1,
    "Accent folding preserves non-Latin text",
  );
  const accentHtmlResponse = await fetch(`${origin}/athletes?q=Jose+Carlos+Accentfixture`);
  assert.equal(accentHtmlResponse.status, 200);
  const accentHtml = load(await accentHtmlResponse.text());
  assert.equal(
    accentHtml('main a[href="/athletes/accent-jose"]').length,
    1,
    "The anonymous directory route exposes the same matching profile link",
  );
  assert(accentHtml("main").text().includes("José Carlos Accentfixture"));
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
  assert.equal(first.total, null, "A look-ahead row replaces full-catalogue counting");
  assert.equal(first.hasMore, true);
  assert.equal(first.athletes.length, 2);
  const withoutFacets = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: "Directory Fixture",
    pageSize: 2,
    includeFacets: false,
  });
  assert.deepEqual(withoutFacets.countries, []);
  assert.deepEqual(withoutFacets.sports, []);
  assert.deepEqual(
    { ...withoutFacets, countries: first.countries, sports: first.sports },
    first,
    "Skipping unused homepage facets must preserve profiles, counts and pagination",
  );
  assert.deepEqual(
    first.athletes.map((a) => a.display_name),
    ["Directory Fixture Alpha", "Directory Fixture Beta"],
  );
  assert.equal(first.publicAthletes, null);
  assert.equal(first.publicResults, null);
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
  assert.equal(second.total, 4, "The final page has an exact total");
  assert.equal(second.hasMore, false);
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
  const identifierRows = await sql`select athlete.id, athlete.slug, identifier.athlete_number::text
    from athletes athlete join athlete_resolved_ids identifier on identifier.athlete_id=athlete.id
    where athlete.slug in ('directory-fixture-alpha', 'directory-fixture-secret')`;
  const alpha = identifierRows.find((row) => row.slug.endsWith("alpha"));
  const secret = identifierRows.find((row) => row.slug.endsWith("secret"));
  await sql`update athletes set profile_details='{"nationality":null,"birthdayVisibility":null}'::jsonb,
    date_of_birth='1980-01-02' where id=${alpha.id}`;
  const nullDetailsProfile = await rpc("api", "getAthleteBySlug", alpha.slug);
  assert.equal(
    nullDetailsProfile.athlete.id,
    alpha.id,
    "An imported null must not break a profile",
  );
  assert.equal(
    (
      await sql`select profile_details->'nationality' as nationality from athletes where id=${alpha.id}`
    )[0].nationality,
    null,
    "Reading a profile must not rewrite its source details",
  );
  const reference = (number) => `ATH-${number.padStart(6, "0")}`;
  const byId = await rpc("athlete-directory-api", "getAthleteDirectory", {
    q: reference(alpha.athlete_number).toLowerCase(),
  });
  assert.equal(byId.total, 1);
  assert.equal(byId.athletes[0].athlete_number, alpha.athlete_number);
  assert.equal(byId.athletes[0].id, alpha.id);
  assert.equal(
    (
      await rpc("athlete-directory-api", "getAthleteDirectory", {
        q: reference(secret.athlete_number),
      })
    ).total,
    0,
    "Knowing a private athlete's ID cannot reveal their profile",
  );
  assert.equal(await rpc("api", "getAthleteBySlug", reference(secret.athlete_number)), null);
  await sql`insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
    values ('directory-owner', 'Private Account', 'directory@example.test', true, now(), now())`;
  const [owner] =
    await sql`select number::text from athlete_identifiers where user_id='directory-owner'`;
  await sql`insert into athlete_account_links(athlete_id, user_id, user_email)
    values(${secret.id}, 'directory-owner', 'directory@example.test')`;
  assert.equal(
    (await rpc("athlete-directory-api", "getAthleteDirectory", { q: reference(owner.number) }))
      .total,
    0,
    "An account linked only to private identities stays undiscoverable by ID",
  );
  await sql`insert into athlete_account_links(athlete_id, user_id, user_email)
    values(${alpha.id}, 'directory-owner', 'directory@example.test')`;
  for (const number of [owner.number, alpha.athlete_number]) {
    const canonical = await rpc("athlete-directory-api", "getAthleteDirectory", {
      q: reference(number),
    });
    assert.equal(
      canonical.total,
      1,
      "The source ID remains a searchable alias for the public athlete",
    );
    assert.equal(canonical.athletes[0].athlete_number, owner.number);
    assert.equal(canonical.athletes[0].id, alpha.id);
    const profile = await rpc("api", "getAthleteBySlug", reference(number));
    assert.equal(profile.athlete.athlete_number, owner.number);
    assert.equal(profile.athlete.id, alpha.id);
    const response = await fetch(`${origin}/athletes/${reference(number)}`, { redirect: "manual" });
    assert.equal(response.status, 301);
    assert(response.headers.get("location").endsWith(`/athletes/${alpha.slug}`));
  }
  assert.equal(
    await rpc("api", "getAthleteBySlug", reference(secret.athlete_number)),
    null,
    "A private source alias must not reveal other identities owned by the same account",
  );
  const profileHtml = await (await fetch(`${origin}/athletes/${alpha.slug}`)).text();
  assert(profileHtml.includes(reference(owner.number)));
  assert(profileHtml.includes("Copy athlete ID"));
  const readFixture = () =>
    rpc("athlete-directory-api", "getAthleteDirectory", { q: "Directory Fixture" });
  const visible = await readFixture();
  const resultCount = (directory) => directory.athletes.reduce((sum, a) => sum + a.result_count, 0);
  const [alphaResult] = await sql`select id from results where athlete_id=${alpha.id}`;
  await sql`insert into athlete_public_shares (user_id, slug, enabled, share_results)
    values ('directory-owner', 'directory-owner-fixture', true, true)`;
  const [accentClub] = await sql`insert into clubs(slug,name)
    values ('accent-search-club','São Clube Accentfixture') returning id`;
  await sql`update athletes set city='Évora Accentfixture',club_id=${accentClub.id} where id=${alpha.id}`;
  for (const q of [
    "Evora Accentfixture",
    "Évora Accentfixture",
    "Sao Clube Accentfixture",
    "São Clube Accentfixture",
  ]) {
    assert.equal(
      (await rpc("athlete-directory-api", "getAthleteDirectory", { q })).athletes[0]?.id,
      alpha.id,
    );
  }
  await sql`update athlete_public_shares set share_location=false,share_club=false where user_id='directory-owner'`;
  for (const q of [
    "Evora Accentfixture",
    "Évora Accentfixture",
    "Sao Clube Accentfixture",
    "São Clube Accentfixture",
  ]) {
    assert.equal(
      (await rpc("athlete-directory-api", "getAthleteDirectory", { q })).total,
      0,
      "Folded candidates cannot disclose owner-hidden location or club fields",
    );
  }
  await sql`update athlete_public_shares set share_location=true,share_club=true where user_id='directory-owner'`;
  await sql`update athletes set city=null,club_id=null where id=${alpha.id}`;
  await sql`insert into athlete_profile_hidden_results (user_id, result_id)
    values ('directory-owner', ${alphaResult.id})`;
  const hidden = await readFixture();
  assert.equal(resultCount(hidden), resultCount(visible) - 1);
  assert.equal(hidden.total, visible.total);
  assert.equal(hidden.athletes.find((a) => a.id === alpha.id).result_count, 0);
  assert.deepEqual(hidden.athletes.find((a) => a.id === alpha.id).sports, []);
  await sql`delete from athlete_profile_hidden_results where user_id='directory-owner'`;
  await sql`update athlete_public_shares set share_results=false where user_id='directory-owner'`;
  const resultsOptOut = await readFixture();
  assert.equal(resultCount(resultsOptOut), resultCount(visible) - 1);
  assert(
    !resultsOptOut.athletes.some((a) => a.id === alpha.id),
    "Result-sharing opt-outs leave discovery immediately",
  );
  await sql`update athlete_public_shares set enabled=false where user_id='directory-owner'`;
  const unpublished = await readFixture();
  assert.equal(unpublished.total, visible.total - 1);
  assert.equal(unpublished.athletes.length, visible.athletes.length - 1);
  assert(!unpublished.athletes.some((a) => a.id === alpha.id));
  await sql`update athlete_account_links set status='revoked' where athlete_id=${alpha.id}`;
  const revoked = await readFixture();
  assert.equal(resultCount(revoked), resultCount(visible));
  assert.equal(revoked.total, visible.total);
  assert.equal(revoked.athletes.find((a) => a.id === alpha.id).result_count, 1);
  await sql`update athlete_account_links set status='active' where athlete_id=${alpha.id}`;
  await sql`update athlete_public_shares set enabled=true, share_results=true
    where user_id='directory-owner'`;
  assert.deepEqual(await readFixture(), visible, "Privacy changes take effect on the next read");
  await sql`update athletes set profile_type='Public figure' where id=${secret.id}`;
  await sql`update results set result_visibility='private' where athlete_id=${secret.id}`;
  const publicFigure = await readFixture();
  assert.equal(publicFigure.total, visible.total + 1);
  assert.equal(resultCount(publicFigure), resultCount(visible));
  assert.equal(
    publicFigure.athletes.find((a) => a.id === secret.id).result_count,
    0,
    "A public-figure label does not publish a private performance",
  );
  await sql`update athlete_public_shares set enabled=false, share_results=false
    where user_id='directory-owner'`;
  const figureOptOut = await readFixture();
  assert(
    !figureOptOut.athletes.some((a) => a.id === secret.id),
    "A public-figure label does not override an owner's publication veto",
  );
  await sql`update athletes set profile_type='Athlete' where id=${secret.id}`;
  await sql`update athlete_public_shares set enabled=true, share_results=true
    where user_id='directory-owner'`;
  await assert.rejects(rpc("athlete-directory-api", "getAthleteDirectory", { pageSize: 10000 }));
  for (const path of ["/", "/athletes?country=Ireland", "/find-events"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, `${path} must render`);
    const html = await response.text();
    assert(!html.includes("Directory Fixture Secret"));
    if (path === "/") {
      const home = load(html);
      assert.equal(home("main h1").text().trim(), "Find your next running race");
      assert(home('main a[href="#fixtures"]').length, "Homepage must link to its fixture list");
      const filters = home('main #fixtures form[method="get"][action="/"]');
      assert.equal(filters.length, 1, "Homepage filters must submit to the Running homepage");
      for (const name of ["country", "month", "distance"]) {
        assert.equal(filters.find(`select[name="${name}"]`).length, 1, `Missing ${name} filter`);
      }
      assert(html.includes('href="/sports/road-running"'));
      assert(!html.includes("https://www.runrecs.com/races"));
      assert(!html.includes("Upcoming athletics"));
    }
    if (path === "/find-events") assert(html.includes("https://triathlon.org/events"));
  }
  console.log(
    "Athlete discovery verified over HTTP: search, facets, pagination, visibility, hidden results, opt-outs, public figures, counts and page rendering.",
  );
} catch (error) {
  console.error("[athlete-directory] Verification failed", error);
  throw error;
} finally {
  await server.close();
  if (database) await database.close();
}
