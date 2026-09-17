// Exercise the real importer and HTTP handlers against a disposable PGLite database.
// Environment changes affect only this test process, never a deployment or configured database.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.ATHRECS_STAFF_EMAILS = "compact-staff@example.test";
const origin = "http://127.0.0.1:18192";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18192, strictPort: true } });
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
  const { ensureAthrecsSeeded } = await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts");
  await ensureAthrecsSeeded();
  for (const id of ["owner", "other", "staff"]) {
    await sql`insert into "user" ("id","name","email","emailVerified") values (${`compact-${id}`},${`Compact ${id}`},${`compact-${id}@example.test`},true)`;
    await sql`insert into "session" ("id","token","expiresAt","updatedAt","userId") values (${`compact-${id}`},${`compact-test-${id}`},now()+interval '1 hour',now(),${`compact-${id}`})`;
  }
  await sql`insert into "account" ("id","accountId","providerId","userId","updatedAt") values ('compact-staff-google','compact-staff','google','compact-staff',now())`;
  const owner = { authorization: "Bearer compact-test-owner" };
  const other = { authorization: "Bearer compact-test-other" };
  const staff = { authorization: "Bearer compact-test-staff" };
  await assert.rejects(() => rpc("athlete-upcoming-api", "getMyUpcoming"));
  await assert.rejects(() =>
    rpc("staff-athlete-directory-api", "getStaffAthleteDirectory", {}, owner),
  );
  await assert.rejects(() =>
    rpc("staff-athlete-directory-api", "exportStaffAthleteDirectory", {}, other),
  );
  const account = await rpc("athlete-account-api", "getMyAthleteAccount", undefined, owner);
  const sport = (name, primary) => ({
    sportCode: name,
    isPrimary: primary,
    experienceLevel: "club",
    disciplines: [],
    preferredDistances: [],
    preferredSurfaces: [],
    trainingSessionsPerWeek: null,
    trainingHoursPerWeek: null,
    weeklyDistanceKm: null,
    eventsPerYear: null,
    goals: "",
    coachName: name === "Running" ? "Test running coach" : "Test swim coach",
  });
  const input = {
    ...account,
    fullName: "Compact Test Athlete",
    displayName: "Compact Test Athlete",
    dateOfBirth: "1980-01-02",
    nationality: "British",
    clubOrTeam: "Unattached",
    profileDetails: {
      birthCountry: "United Kingdom",
      previousClub: "Test previous club",
      coach: "Test coach",
      manager: "Test manager",
      runningAgeCategory: "M45",
      birthdayVisibility: "hidden",
      acceptContact: false,
    },
    sports: [sport("Running", true), sport("Swimming", false)],
    privacyAcknowledged: true,
  };
  await rpc("athlete-account-api", "saveMyAthleteAccount", input, owner);
  const saved = await rpc("athlete-account-api", "getMyAthleteAccount", undefined, owner);
  assert.equal(saved.profileDetails.manager, "Test manager");
  assert.equal(saved.athleteNumber, account.athleteNumber);
  assert.equal(saved.sports.length, 2);
  const fixture = {
    sport: "Swimming",
    eventName: "Compact test swim",
    eventDate: "2099-05-20",
    distance: "1500m",
    city: "Stockholm",
    country: "Sweden",
    eventUrl: "https://example.test/swim",
    status: "Entered",
  };
  await rpc("athlete-upcoming-api", "saveMyUpcoming", fixture, owner);
  let events = await rpc("athlete-upcoming-api", "getMyUpcoming", undefined, owner);
  assert.equal(events.length, 1);
  assert.equal(events[0].country, "Sweden");
  await assert.rejects(() => rpc("athlete-upcoming-api", "saveMyUpcoming", fixture, owner));
  await assert.rejects(() =>
    rpc("athlete-upcoming-api", "saveMyUpcoming", { ...fixture, eventDate: "2099-02-30" }, owner),
  );
  await assert.rejects(() =>
    rpc(
      "athlete-upcoming-api",
      "saveMyUpcoming",
      { ...fixture, eventUrl: "javascript:alert(1)" },
      owner,
    ),
  );
  await assert.rejects(() =>
    rpc("athlete-upcoming-api", "saveMyUpcoming", { ...events[0], eventName: "Take over" }, other),
  );
  await assert.rejects(() =>
    rpc("athlete-upcoming-api", "deleteMyUpcoming", { id: events[0].id }, other),
  );
  assert.equal((await rpc("athlete-upcoming-api", "getMyUpcoming", undefined, other)).length, 0);
  const share = await rpc("athlete-profile-share-api", "getMyProfileShare", undefined, owner);
  assert.equal(
    await rpc("athlete-profile-share-api", "getPublishedSharedProfile", { slug: share.slug }),
    null,
  );
  await rpc(
    "athlete-profile-share-api",
    "saveMyProfileShare",
    { enabled: true, acknowledged: true },
    owner,
  );
  let published = await rpc("athlete-profile-share-api", "getPublishedSharedProfile", {
    slug: share.slug,
  });
  assert(published);
  assert.equal(published.details.birthday, "");
  assert(!JSON.stringify(published).includes("1980-01-02"));
  assert.equal(published.details.runningAgeCategory, "M45");
  assert.equal(published.upcoming.length, 1);
  assert.deepEqual(published.sports, ["Running", "Swimming"]);
  for (const [visibility, birthday] of [
    ["day-month", "2 January"],
    ["full", "2 January 1980"],
  ]) {
    await rpc(
      "athlete-account-api",
      "saveMyAthleteAccount",
      { ...input, profileDetails: { ...input.profileDetails, birthdayVisibility: visibility } },
      owner,
    );
    published = await rpc("athlete-profile-share-api", "getPublishedSharedProfile", {
      slug: share.slug,
    });
    assert.equal(published.details.birthday, birthday);
    assert(!("dateOfBirth" in published));
  }
  await rpc("athlete-upcoming-api", "saveMyUpcoming", { ...events[0], city: "Uppsala" }, owner);
  assert.equal(
    (await rpc("athlete-profile-share-api", "getPublishedSharedProfile", { slug: share.slug }))
      .upcoming[0].city,
    "Uppsala",
  );
  const [source] =
    await sql`insert into athletes (slug,display_name,profile_visibility) values ('compact-linked-athlete','Compact previous name','public') returning id`;
  await sql`insert into athlete_account_links (athlete_id,user_id,user_email) values (${source.id},'compact-owner','compact-owner@example.test')`;
  const directory = await rpc(
    "staff-athlete-directory-api",
    "getStaffAthleteDirectory",
    { q: "Compact Test Athlete" },
    staff,
  );
  assert.equal(directory.total, 1);
  assert.equal(directory.athletes[0].athleteNumber, account.athleteNumber);
  assert.equal(directory.athletes[0].sources.length, 1);
  assert.equal(directory.athletes[0].sports.length, 2);
  const [privateSource] = await sql`insert into athletes (slug,display_name,profile_visibility)
    values ('compact-private-directory','Compact private directory athlete','private') returning id`;
  const [privateIdentity] =
    await sql`select athlete_number::text as number from athlete_resolved_ids
    where athlete_id=${privateSource.id}`;
  const privateId = `ATH-${privateIdentity.number.padStart(6, "0")}`;
  const [profileEvent] = await sql`insert into events (slug,name,sport)
    values ('compact-profile-result','Compact profile race','Running') returning id`;
  const [profileEdition] =
    await sql`insert into editions (event_id,event_date,distance_code,distance_km)
    values (${profileEvent.id},'2025-01-01','10K',10) returning id`;
  const [privateResult] = await sql`insert into results
    (athlete_id,edition_id,finish_time_seconds,chip_time_seconds,result_visibility,source_url)
    values (${privateSource.id},${profileEdition.id},2400,2400,'private','https://example.test/result') returning id`;
  await sql`insert into result_source_references (result_id,source_url,source_name)
    values (${privateResult.id},'https://example.test/corroboration','Corroborating source')`;
  await sql`insert into results (athlete_id,edition_id,finish_time_seconds,result_visibility)
    values (${source.id},${profileEdition.id},2700,'private')`;
  const getStaffProfile = (athleteId, headers) =>
    rpc("staff-athlete-directory-api", "getStaffAthleteProfile", { athleteId }, headers);
  await assert.rejects(() => getStaffProfile(privateId));
  await assert.rejects(() => getStaffProfile(privateId, owner));
  await assert.rejects(() => getStaffProfile(privateId, other));
  await assert.rejects(() =>
    getStaffProfile(privateId, { ...staff, "x-forwarded-host": "www.athrecs.com" }),
  );
  await assert.rejects(() =>
    getStaffProfile(privateId, { ...staff, "sec-fetch-site": "cross-site" }),
  );
  await assert.rejects(() => getStaffProfile("invalid", staff));
  assert.equal(await getStaffProfile("ATH-999999999999", staff), null);
  const privateProfile = await getStaffProfile(privateId, staff);
  assert.equal(privateProfile.athlete.visibility, "Private");
  assert.equal(privateProfile.athlete.profilePath, null);
  assert.equal(
    privateProfile.results.length,
    1,
    "Staff view must not include another athlete's results",
  );
  assert.equal(privateProfile.results[0].resultId, privateResult.id);
  assert.equal(privateProfile.results[0].chipTimeSeconds, 2400);
  assert.deepEqual(privateProfile.results[0].sourceUrls.sort(), [
    "https://example.test/corroboration",
    "https://example.test/result",
  ]);
  const accountProfile = await getStaffProfile(directory.athletes[0].athrecsId, staff);
  assert.equal(accountProfile.athlete.name, "Compact Test Athlete");
  assert.equal(accountProfile.results.length, 1, "Account view includes linked source results");
  assert.equal(accountProfile.results[0].finishTimeSeconds, 2700);
  assert.equal(await rpc("api", "getAthleteBySlug", "compact-private-directory"), null);
  const [stillPrivate] = await sql`select a.profile_visibility,r.result_visibility
    from athletes a join results r on r.athlete_id=a.id where r.id=${privateResult.id}`;
  assert.equal(stillPrivate.profile_visibility, "private");
  assert.equal(stillPrivate.result_visibility, "private");
  await rpc(
    "athlete-upcoming-api",
    "saveStaffUpcoming",
    { ...fixture, athleteId: source.id, eventName: "Staff-added race", sport: "Running" },
    staff,
  );
  assert.equal(
    (await rpc("athlete-profile-share-api", "getPublishedSharedProfile", { slug: share.slug }))
      .upcoming.length,
    2,
  );
  const exported = await rpc(
    "staff-athlete-directory-api",
    "exportStaffAthleteDirectory",
    { q: "Compact Test Athlete" },
    staff,
  );
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(exported.base64, "base64"));
  assert.equal(workbook.getWorksheet("Athletes").rowCount, 2);
  assert.equal(workbook.getWorksheet("Sports").rowCount, 3);
  assert.equal(
    workbook.getWorksheet("Athletes").getCell("A2").value,
    directory.athletes[0].athrecsId,
  );
  await rpc("athlete-profile-share-api", "saveMyProfileShare", { enabled: false }, owner);
  assert.equal(
    await rpc("athlete-profile-share-api", "getPublishedSharedProfile", { slug: share.slug }),
    null,
  );
  assert.equal(await rpc("api", "getAthleteBySlug", "compact-linked-athlete"), null);
  assert.equal(
    (await rpc("athlete-directory-api", "getAthleteDirectory", { q: "Compact previous name" }))
      .total,
    0,
  );
  await rpc("athlete-upcoming-api", "deleteMyUpcoming", { id: events[0].id }, owner);
  assert.equal((await rpc("athlete-upcoming-api", "getMyUpcoming", undefined, owner)).length, 0);
  const paul = await rpc("api", "getAthleteBySlug", "paul-browne");
  assert.equal(paul.athlete.details.nationality, "British");
  assert.equal(paul.athlete.details.birthday, "");
  assert(!JSON.stringify(paul).includes("1978-05-20"));
  const html = await (await fetch(`${origin}/athletes/paul-browne`)).text();
  assert(html.includes("Norfolk Gazelle"));
  assert(html.includes('role="tooltip"'));
  assert(!html.includes("1978-05-20"));
  console.log(
    "Compact profiles verified: real authenticated account saves, birthday choices, multi-sport IDs, fixture persistence/ownership, staff-only directory and XLSX export, publication and privacy.",
  );
} finally {
  await server.close();
  if (database) await database.close();
}
