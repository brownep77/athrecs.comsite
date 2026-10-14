// Real RPC, SQL and optional browser checks against disposable synthetic data.
// Never opens DATABASE_URL, seeds the catalogue, or sends email.
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { chromium } from "playwright";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_CLAIMS_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.ATHRECS_STAFF_EMAILS = "stats-staff@example.test";
process.env.BETTER_AUTH_SECRET = "collection-stats-test-secret-at-least-32-chars";
const origin = "http://127.0.0.1:18246";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18246, strictPort: true } });
let database, browser, rpcId, lastHeaders;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(
    url.startsWith(origin),
    `External requests prohibited in stats test: ${new URL(url).origin}`,
  );
  const response = await realFetch(input, init);
  if (url.includes("/_serverFn/")) lastHeaders = response.headers;
  return response;
};
async function read(data = {}, token, headers = {}) {
  if (!rpcId) {
    const source = await (await fetch(`${origin}/src/lib/collection-stats/api.ts`)).text();
    rpcId = source.match(/createClientRpc\("([^"]+)"\)/)?.[1];
    assert(rpcId, "Actual compiled stats RPC is present");
  }
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(rpcId)({
      method: "GET",
      data,
      context: {},
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const { statsFilters, statsCsv } = await server.ssrLoadModule(
    "/src/lib/collection-stats/core.ts",
  );
  const { retainedFixtureAliasSlugs } = await server.ssrLoadModule(
    "/src/data/fixture-deduplication.ts",
  );
  await sql`insert into "user"(id,name,email,"emailVerified") values('stats-staff','Synthetic Staff','stats-staff@example.test',true),('stats-member','Synthetic Member','member@example.test',true)`;
  await sql`insert into session(id,token,"expiresAt","updatedAt","userId") values('stats-session','stats-token',now()+interval '1 day',now(),'stats-staff'),('member-session','member-token',now()+interval '1 day',now(),'stats-member')`;
  await assert.rejects(() => read(), /Unauthorized/);
  await assert.rejects(() => read({}, "stats-token"), /Forbidden/);
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('stats-google','stats-google','google','stats-staff',now(),now())`;
  await assert.rejects(() => read({}, "member-token"), /Forbidden/);
  await assert.rejects(
    () =>
      read({}, "stats-token", {
        origin: "https://untrusted.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () => read({}, "stats-token", { "x-forwarded-host": "www.athrecs.com" }),
    /staff host required/,
  );
  const empty = await read({}, "stats-token");
  assert.deepEqual(empty.races.totals, { events: 0, editions: 0 });
  assert.deepEqual(empty.races.rows, []);
  assert.deepEqual(empty.profiles.rows, []);
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  assert(lastHeaders.get("vary").includes("Authorization"));
  assert(lastHeaders.get("x-robots-tag").includes("noindex"));
  await assert.rejects(() => read({ raceGroup: "country);drop table athletes;--" }, "stats-token"));
  assert.throws(() => statsFilters.parse({ year: 0 }));
  assert.throws(() => statsFilters.parse({ unexpected: true }));

  async function event(slug, sport, country, county) {
    return (
      await sql`insert into events(slug,name,sport,country,county) values(${slug},${slug},${sport},${country},${county}) returning id`
    )[0].id;
  }
  const multi = await event("stats-multi", "Running", "England", "Norfolk");
  const swim = await event("stats-swim", "Swimming", "Ireland", "Norfolk");
  await event("stats-unknown", "", " ", "");
  const alias = await event(retainedFixtureAliasSlugs[0], "Running", "England", "Norfolk");
  await sql`insert into event_distances(event_id,distance_code) values(${multi},'5K'),(${multi},'10K'),(${multi},'Half marathon')`;
  const [edition] =
    await sql`insert into editions(event_id,event_date,distance_code) values(${multi},'2025-01-01','5K') returning id`;
  await sql`insert into editions(event_id,event_date,distance_code) values(${multi},'2026-01-01','5K'),(${multi},'2026-01-01','10K'),(${swim},'2026-01-02','5K'),(${alias},'2026-01-02','5K')`;
  const [male] =
    await sql`insert into athletes(slug,display_name,gender,country,county,profile_visibility,created_at) values('stats-male','Sensitive Name',' M ','England','Norfolk','public',now()-interval '8 days') returning id`;
  await sql`insert into athletes(slug,display_name,gender,country,county) values('stats-female','Private Name','female','Ireland','Norfolk'),('stats-unknown','Another Private Name','U','',''),('stats-nb','Nonbinary Name','NB','England','Norfolk')`;
  await sql`insert into athletes(slug,display_name,gender,country,county,profile_details) values('stats-test','Fictional','M','England','Norfolk','{"syntheticTest":true}')`;
  await sql`insert into results(athlete_id,edition_id,finish_time_seconds) values(${male.id},${edition.id},1500)`;
  // One athlete has several sport sources; identity and totals must stay distinct.
  await sql`insert into results(athlete_id,edition_id,finish_time_seconds)
    select ${male.id},id,1800 from editions where event_id=${swim}`;
  await sql`update athletes set profile_details='{"nationality":"GBR"}' where id=${male.id}`;
  await sql`update athletes set profile_details='{"nationality":"Kenyan","sourceNationalityObservation":{"value":"GBR","provider":"Synthetic","sourceUrl":"https://example.test/nationality"}}' where slug='stats-female'`;
  await sql`update athletes set profile_details='{"publication_approved":true,"user_supplied_sports":["Swimming","Swimming"],"sourceNationalityObservation":{"value":"IRL","provider":"Synthetic","sourceUrl":"https://example.test/nationality"}}' where slug='stats-nb'`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email) values(${male.id},'stats-member','member@example.test')`;
  await sql`insert into athlete_private_profiles(user_id,verified_email,full_name,nationality,privacy_notice_version,privacy_acknowledged_at)
    values('stats-member','member@example.test','Synthetic Member','French','test',now())`;
  await sql`insert into athlete_sport_profiles(user_id,sport_code) values('stats-member','Cycling'),('stats-member','Running')`;
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,years_expected,years_captured,performances)
    select id,'Synthetic',slug,'https://example.test/history',now(),'{}','{}',
      case when slug='stats-female' then '[{"discipline":"Triathlon"},{"discipline":"Triathlon"},{"discipline":"Rowing","profileExcluded":true}]'::jsonb
      else '[{"discipline":"10K"},{"discipline":"5K"}]'::jsonb end
    from athletes where slug in ('stats-female','stats-male')`;
  const total = await read({}, "stats-token");
  assert.deepEqual(total.totals, {
    events: 3,
    editions: 4,
    profiles: 4,
    publicProfiles: 1,
    added7d: 3,
  });
  assert.deepEqual(total.excluded, { eventAliases: 1, testProfiles: 1 });
  assert.equal(total.races.rows.find((r) => r.sport === "Running").events, 1);
  assert.deepEqual(total.races.gaps, { sport: 1, distance: 1, country: 1, county: 1 });
  assert.deepEqual(total.profiles.gaps, {
    sport: 1,
    gender: 1,
    nationality: 1,
    country: 1,
    county: 1,
  });
  assert.deepEqual(total.profiles.rows.map((r) => r.gender).sort(), [
    "Female",
    "Male",
    "Non-binary",
    "Unknown",
  ]);
  assert.doesNotMatch(
    JSON.stringify(total),
    /Sensitive Name|Private Name|stats-token|example.test/,
  );
  const byDistance = await read({ raceGroup: "distance" }, "stats-token");
  assert.equal(byDistance.races.rows.find((r) => r.distance === "5K").events, 2);
  assert.equal(byDistance.races.rows.find((r) => r.distance === "5K").editions, 3);
  assert.equal(byDistance.races.rows.find((r) => r.distance === "Half marathon").editions, 0);
  assert.equal(
    byDistance.races.totals.events,
    3,
    "Grand total must not sum overlapping distance rows",
  );
  const county = await read({ raceGroup: "county", profileGroup: "county" }, "stats-token");
  assert.equal(
    county.races.rows.filter((r) => r.county === "Norfolk").length,
    2,
    "Same county name in different countries stays separate",
  );
  const filtered = await read(
    {
      sport: "Running",
      distance: "5K",
      raceCountry: "England",
      raceCounty: "Norfolk",
      year: 2026,
      gender: "Female",
      profileCountry: "Ireland",
      profileCounty: "Norfolk",
      raceGroup: "detail",
      profileGroup: "detail",
    },
    "stats-token",
  );
  assert.deepEqual(filtered.races.totals, { events: 1, editions: 1 });
  assert.equal(filtered.profiles.totals.profiles, 1);
  assert.deepEqual(filtered.totals, total.totals, "Filters do not change whole catalogue totals");
  assert.equal(
    (await read({ sport: "Swimming" }, "stats-token")).profiles.totals.profiles,
    4,
    "Race filters do not filter profiles",
  );
  assert.equal(
    (await read({ gender: "Male" }, "stats-token")).races.totals.events,
    3,
    "Profile filters do not filter races",
  );
  assert.equal(
    (await read({ raceCountry: "' OR 1=1 --" }, "stats-token")).races.totals.events,
    0,
    "SQL values stay parameterised",
  );
  assert.equal((await read({ gender: "Unknown" }, "stats-token")).profiles.totals.profiles, 1);
  assert.equal((await read({ year: 2027 }, "stats-token")).races.rows.length, 0);
  const sports = await read({ profileGroup: "sport" }, "stats-token");
  assert.equal(sports.profiles.totals.profiles, 4);
  assert.deepEqual(
    Object.fromEntries(sports.profiles.rows.map((row) => [row.sport, row.profiles])),
    { Swimming: 2, Cycling: 1, Running: 1, Triathlon: 1, Unknown: 1 },
  );
  assert.equal(
    sports.profiles.rows.reduce((sum, row) => sum + row.profiles, 0),
    6,
  );
  const combined = await read(
    {
      profileGroup: "sportGenderNationality",
      profileSport: "Swimming",
      gender: "Male",
      nationality: "France",
    },
    "stats-token",
  );
  assert.equal(combined.profiles.rows.length, 1);
  assert.equal(combined.profiles.rows[0].nationality, "France");
  assert.equal(combined.profiles.rows[0].sport, "Swimming");
  assert.equal(combined.profiles.totals.profiles, 1);
  assert.equal(combined.profiles.totals.publicProfiles, 1);
  assert.equal(
    (await read({ nationality: "Kenya", profileCountry: "Ireland" }, "stats-token")).profiles.totals
      .profiles,
    1,
    "Nationality stays independent of residence and beats source observations",
  );
  assert.equal(
    (await read({ profileSport: "Swimming", profileGroup: "gender" }, "stats-token")).profiles
      .totals.profiles,
    2,
  );
  assert.equal(
    (await read({ profileSport: "Unknown" }, "stats-token")).profiles.totals.profiles,
    1,
  );
  assert.equal((await read({ nationality: "Unknown" }, "stats-token")).profiles.totals.profiles, 1);
  assert.equal(
    (await read({ profileSport: "Rowing" }, "stats-token")).profiles.totals.profiles,
    0,
    "Excluded source rows do not create a sport",
  );
  assert.equal(
    (await read({ nationality: "' OR 1=1 --" }, "stats-token")).profiles.totals.profiles,
    0,
  );
  await sql`update athlete_private_profiles set nationality=null where user_id='stats-member'`;
  assert.equal(
    (await read({ nationality: "United Kingdom" }, "stats-token")).profiles.totals.profiles,
    1,
    "GBR uses the existing country display dictionary",
  );
  await sql`update athletes set profile_details='{"nationality":"British"}' where id=${male.id}`;
  assert.equal(
    (await read({ nationality: "United Kingdom" }, "stats-token")).profiles.totals.profiles,
    1,
    "British and GBR use the same aggregate label",
  );
  await sql`update athlete_private_profiles set nationality='French' where user_id='stats-member'`;
  await sql`update athlete_account_links set status='revoked' where athlete_id=${male.id}`;
  assert.equal(
    (await read({ profileSport: "Cycling" }, "stats-token")).profiles.totals.profiles,
    0,
    "Revoked account links do not supply sport or nationality",
  );
  assert.equal((await read({ nationality: "France" }, "stats-token")).profiles.totals.profiles, 0);
  await sql`update athlete_account_links set status='active' where athlete_id=${male.id}`;
  const { sourceNationalitySql } = await server.ssrLoadModule(
    "/src/lib/collection-stats/nationality.server.ts",
  );
  const { readSourceNationality } = await server.ssrLoadModule(
    "/src/lib/athrecs/source-nationality.ts",
  );
  const wmmId = "12345678-1234-1234-1234-123456789abc";
  for (const details of [
    {},
    {
      sourceNationalityObservation: {
        value: "USA",
        provider: "Synthetic",
        sourceUrl: "https://example.test/a",
      },
    },
    {
      sourceNationalityObservation: {
        value: "GBR",
        provider: "Synthetic",
        sourceUrl: "javascript:bad",
      },
    },
    {
      sourceNationalityObservation: {
        value: "IRL",
        provider: "",
        sourceUrl: "https://example.test/a",
      },
    },
    {
      sourceNationalityObservation: {
        value: { bad: "object" },
        provider: "Synthetic",
        sourceUrl: "https://example.test/a",
      },
    },
    {
      worldMarathonMajors: {
        athleteId: wmmId,
        nationality: "CAN",
        sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-rankings",
      },
      archiveCreation: { sourceRowsCompared: true, candidateId: wmmId },
    },
    {
      worldMarathonMajors: {
        athleteId: wmmId,
        nationality: "CAN",
        sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-rankings",
      },
      archiveCreation: { sourceRowsCompared: false, candidateId: wmmId },
    },
    {
      duvSourceObservation: { nationality: "AUS" },
      sourceIdentities: [
        {
          externalId: "123",
          sourceUrl: "https://statistik.d-u-v.org/getresultperson.php?runner=123",
        },
      ],
    },
    {
      duvSourceObservation: { nationality: "AUS" },
      sourceIdentities: [
        {
          externalId: "456",
          sourceUrl: "https://statistik.d-u-v.org/getresultperson.php?runner=123",
        },
      ],
    },
  ]) {
    const [row] = await sql.query(
      `select ${sourceNationalitySql("details")} as value from (select $1::jsonb as details) source`,
      [JSON.stringify(details)],
    );
    assert.equal(
      row.value,
      readSourceNationality(details)?.value ?? null,
      "SQL observation extraction matches supported source readers",
    );
  }
  console.log(
    "PASS: athlete sports from four recorded sources, multi-sport deduplication, combined filters, declaration precedence, nationality aliases, revoked links, unknowns and source observation extraction.",
  );
  const csv = statsCsv([["=FORMULA()", 'A "quoted", label', 12, "\n+FORMULA()"]]);
  assert(csv.includes("'=FORMULA()"));
  assert(csv.includes('"A ""quoted"", label"'));
  assert(csv.includes("'\n+FORMULA()"));
  console.log(
    "PASS: actual RPC auth, private cache, validation, empty data, totals, all breakdowns, overlapping distances, years, unknowns, exclusions, independent filters, parameterisation and safe CSV.",
  );

  if (process.argv.includes("--browser")) {
    browser = await chromium.launch({
      executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      extraHTTPHeaders: { authorization: "Bearer stats-token" },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/admin/collection-stats`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page.getByRole("heading", { name: "Data collection stats", exact: true }).waitFor();
    const table = page.getByRole("table", { name: "Race collection breakdown", exact: true });
    await table.getByRole("cell", { name: "Running", exact: true }).waitFor();
    await page.getByLabel("Group races by", { exact: true }).selectOption("detail");
    await page.getByLabel("Race sport", { exact: true }).selectOption("Swimming");
    await table.getByRole("cell", { name: "Swimming", exact: true }).waitFor();
    assert.equal(await table.getByRole("cell", { name: "Running", exact: true }).count(), 0);
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download CSV", exact: true }).first().click();
    const download = await downloaded;
    const exported = await readFile(await download.path(), "utf8");
    assert(exported.includes('"Swimming","5K","Ireland","Norfolk","1","1"'));
    await page.getByLabel("Profile gender", { exact: true }).selectOption("Female");
    await page
      .getByRole("table", { name: "Profile collection breakdown" })
      .getByRole("cell", { name: "Female", exact: true })
      .waitFor();
    await page
      .getByLabel("Group profiles by", { exact: true })
      .selectOption("sportGenderNationality");
    await page.getByLabel("Profile sport", { exact: true }).selectOption("Triathlon");
    await page.getByLabel("Profile nationality", { exact: true }).selectOption("Kenya");
    const profilesTable = page.getByRole("table", { name: "Profile collection breakdown" });
    await profilesTable.getByRole("cell", { name: "Kenya", exact: true }).waitFor();
    await profilesTable.getByRole("cell", { name: "Triathlon", exact: true }).waitFor();
    const profileDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download CSV", exact: true }).last().click();
    assert(
      (await readFile(await (await profileDownload).path(), "utf8")).includes(
        '"Triathlon","Female","Kenya","1","0","1"',
      ),
    );
    await page.getByRole("button", { name: "Reset profile filters" }).click();
    await profilesTable.getByRole("cell", { name: "Male", exact: true }).waitFor();
    assert.equal(await page.getByLabel("Profile sport", { exact: true }).inputValue(), "");
    assert.equal(await page.getByLabel("Profile nationality", { exact: true }).inputValue(), "");
    await page.getByRole("button", { name: "Reset race filters" }).click();
    await table.getByRole("cell", { name: "Running", exact: true }).waitFor();
    await mkdir("artifacts", { recursive: true });
    await page.screenshot({ path: "artifacts/collection-stats-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel("Group races by", { exact: true }).selectOption("county");
    await table.getByRole("cell", { name: "Norfolk", exact: true }).first().waitFor();
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "No mobile page overflow",
    );
    await page.screenshot({ path: "artifacts/collection-stats-mobile.png", fullPage: true });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: desktop/mobile staff page, filters, group switching, reset, real CSV download and no browser errors.",
    );
  }
} finally {
  await browser?.close();
  await database?.close();
  await server.close();
  globalThis.fetch = realFetch;
}
