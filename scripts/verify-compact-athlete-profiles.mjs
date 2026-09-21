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
  const sourcePerformances = [
    {
      year: 2025,
      date: "2025-06-01",
      sourceDate: "1 Jun",
      ageGroup: "Senior",
      discipline: "1500",
      performance: "3:37.30",
      wind: "",
      place: "3h2",
      venue: "Test track",
      meeting: "Test meeting",
      sourceUrls: ["https://example.test/track"],
      labels: ["Personal Best"],
    },
    {
      year: 2025,
      date: "2025-06-01",
      sourceDate: "1 Jun",
      ageGroup: "Senior",
      discipline: "Long Jump",
      performance: "4.04\nw",
      wind: "2.5",
      place: "3",
      venue: "Test track",
      meeting: "Test meeting",
      sourceUrls: ["https://example.test/track"],
      labels: [],
    },
  ];
  await sql`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
    values (${privateSource.id},'powerof10','history-private','https://example.test/athlete',
      now(),true,array[2025],array[2025],${JSON.stringify(sourcePerformances)}::jsonb),
      (${source.id},'powerof10','history-linked','https://example.test/linked',
      now(),false,array[2025,2024],array[2025],'[]'::jsonb)`;
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
  assert.equal(
    privateProfile.sourceHistories.length,
    1,
    "Source histories stay scoped to the athlete",
  );
  assert.deepEqual(
    privateProfile.sourceHistories[0].performances,
    sourcePerformances,
    "Track precision, field marks, annotations and heat positions survive the database and HTTP transport exactly",
  );
  assert.equal(privateProfile.sourceHistories[0].complete, true);
  assert.deepEqual(privateProfile.results[0].sourceUrls.sort(), [
    "https://example.test/corroboration",
    "https://example.test/result",
  ]);
  const accountProfile = await getStaffProfile(directory.athletes[0].athrecsId, staff);
  assert.equal(accountProfile.athlete.name, "Compact Test Athlete");
  assert.equal(accountProfile.results.length, 1, "Account view includes linked source results");
  assert.equal(accountProfile.results[0].finishTimeSeconds, 2700);
  assert.equal(
    accountProfile.sourceHistories.length,
    1,
    "Canonical account includes its linked source history",
  );
  assert.equal(accountProfile.sourceHistories[0].externalId, "history-linked");
  assert.equal(accountProfile.sourceHistories[0].complete, false);
  const publicProfile = await rpc("api", "getAthleteBySlug", "compact-linked-athlete");
  assert.deepEqual(
    publicProfile.sourceHistories,
    [],
    "Private source archives must not be exposed through public profiles",
  );
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
  // Publish through the authenticated HTTP endpoint, then read anonymously.
  // All fixtures and privacy transitions stay in this process's disposable DB.
  const publishSelection = (athleteNumbers, headers) =>
    rpc("staff-athlete-directory-api", "publishStaffAthleteProfiles", { athleteNumbers }, headers);
  const readPrivateSource = () => rpc("api", "getAthleteBySlug", "compact-private-directory");
  for (const headers of [
    undefined,
    owner,
    other,
    { ...staff, "x-forwarded-host": "www.athrecs.com" },
    { ...staff, "sec-fetch-site": "cross-site" },
  ]) {
    await assert.rejects(() => publishSelection([privateIdentity.number], headers));
  }
  assert.equal(await readPrivateSource(), null, "Rejected requests must not publish the profile");
  await assert.rejects(() => publishSelection([], staff));
  await assert.rejects(() => publishSelection(["invalid"], staff));

  // An unclaimed public profile still requires explicit archive publication.
  const [unselected] = await sql`insert into athletes (slug,display_name,profile_visibility)
    values ('compact-unselected-history','Compact unselected history','public') returning id`;
  await sql`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
    values (${unselected.id},'powerof10','history-unselected','https://example.test/unselected',
      now(),true,array[2025],array[2025],${JSON.stringify(sourcePerformances)}::jsonb)`;
  assert.deepEqual(
    (await rpc("api", "getAthleteBySlug", "compact-unselected-history")).sourceHistories,
    [],
    "Being public alone must not expose an unpublished archive",
  );
  assert.deepEqual(
    await publishSelection([privateIdentity.number, privateIdentity.number], staff),
    {
      published: 1,
      resultsPublished: 1,
      skipped: 0,
    },
  );
  const publishedSource = await readPrivateSource();
  assert.deepEqual(
    publishedSource.sourceHistories,
    privateProfile.sourceHistories,
    "Explicit publication preserves the selected archive exactly through the public API",
  );
  assert.equal(publishedSource.results.length, 1);
  assert.equal(publishedSource.results[0].id, privateResult.id);
  assert.deepEqual(
    (await rpc("api", "getAthleteBySlug", "compact-unselected-history")).sourceHistories,
    [],
    "Publishing a selected profile must not expose another athlete's archive",
  );
  assert.deepEqual(await publishSelection([privateIdentity.number], staff), {
    published: 0,
    resultsPublished: 0,
    skipped: 1,
  });
  const [audit] = await sql`select count(*)::int as count from network_audit_log
    where action='athlete.bulk_publish' and entity_id=${String(privateSource.id)}`;
  assert.equal(audit.count, 1, "Repeated publication must not duplicate audit entries");

  await sql`update athletes set profile_visibility='private' where id=${privateSource.id}`;
  assert.equal(
    await readPrivateSource(),
    null,
    "Making a published profile private must hide its archived history through the public API",
  );
  await sql`update athletes set profile_visibility='public' where id=${privateSource.id}`;
  assert.deepEqual((await readPrivateSource()).sourceHistories, publishedSource.sourceHistories);
  await sql`update athlete_source_histories set published_at=null where athlete_id=${privateSource.id}`;
  assert.deepEqual(
    (await readPrivateSource()).sourceHistories,
    [],
    "Revoking archive publication must hide the archive even while the profile is public",
  );
  await sql`update athlete_source_histories set published_at=now() where athlete_id=${privateSource.id}`;
  await sql`insert into athlete_account_links (athlete_id,user_id,user_email)
    values (${privateSource.id},'compact-owner','compact-owner@example.test')`;
  assert.deepEqual(
    (await readPrivateSource()).sourceHistories,
    [],
    "Claiming a published source profile must stop staff archive sharing",
  );
  await sql`update athletes set profile_visibility='private' where id=${privateSource.id}`;
  assert.deepEqual(await publishSelection([privateIdentity.number], staff), {
    published: 0,
    resultsPublished: 0,
    skipped: 1,
  });
  assert.equal(
    await readPrivateSource(),
    null,
    "Staff publication must not override an account-managed profile's privacy",
  );
  await sql`update athletes set profile_visibility='public' where id=${privateSource.id}`;
  await rpc("athlete-profile-share-api", "saveMyProfileShare", { enabled: false }, owner);
  assert.equal(
    await rpc("athlete-profile-share-api", "getPublishedSharedProfile", { slug: share.slug }),
    null,
  );
  assert.equal(await rpc("api", "getAthleteBySlug", "compact-linked-athlete"), null);
  assert.equal(
    await readPrivateSource(),
    null,
    "Owner opt-out must hide a formerly staff-published source profile too",
  );
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
