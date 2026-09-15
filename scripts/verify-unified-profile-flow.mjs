// Exercise the real importer and HTTP handlers against a disposable PGLite database.
// Environment changes affect only this test process, never a deployment or configured database.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "false";
const origin = "http://127.0.0.1:18189";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18189, strictPort: true } });
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
  const { applyResultsImport } = await server.ssrLoadModule(
    "/src/lib/athrecs/results-import.server.ts",
  );
  const account = await rpc("athlete-account-api", "getMyAthleteAccount");
  assert.match(account.athleteProfileId, /^[a-f0-9-]{36}$/);
  assert.match(account.athleteNumber, /^[1-9]\d*$/);
  console.log("Real account handler and database loaded.");
  const row = {
    eventSlug: "unified-fixture-road",
    date: "2026-07-01",
    distance: "10K",
    distanceKm: 10,
    athleteName: "Fixture Same Name",
    bib: "41",
    time: "40:00",
    source: "https://timer.example/race/1",
  };
  const first = await applyResultsImport({
    results: [row, { ...row, eventSlug: "unified-fixture-road-two" }],
  });
  assert.equal(first.resultsInserted, 2);
  assert.equal(
    (await sql`select count(*)::int n from athletes where display_name='Fixture Same Name'`)[0].n,
    2,
    "Names alone cannot merge people across races",
  );
  const identified = {
    ...row,
    athleteName: "Fixture Known Runner",
    athleteSourceProvider: "worldathletics",
    athleteSourceId: "76543210",
  };
  assert.equal((await applyResultsImport({ results: [identified] })).resultsInserted, 1);
  assert.equal(
    (
      await applyResultsImport({
        results: [
          {
            ...identified,
            athleteName: "Fixture Previous Name",
            eventSlug: "unified-fixture-track",
            sport: "Athletics",
            date: "2025-07-01",
          },
        ],
      })
    ).resultsInserted,
    1,
  );
  const known = (
    await sql`select athlete_id from athlete_source_identities where provider='worldathletics' and external_id='76543210'`
  )[0].athlete_id;
  assert.equal(
    (await sql`select count(*)::int n from results where athlete_id=${known}`)[0].n,
    2,
    "A stable source ID connects names and sports",
  );
  const duplicate = await applyResultsImport({
    results: [{ ...identified, source: "https://organiser.example/race/1" }],
  });
  assert.equal(duplicate.resultsUpdated, 1);
  const knownResult = (
    await sql`select r.id from results r join editions ed on ed.id=r.edition_id where r.athlete_id=${known} and ed.event_date='2026-07-01'`
  )[0].id;
  assert.equal(
    (
      await sql`select count(*)::int n from result_source_references where result_id=${knownResult}`
    )[0].n,
    2,
  );
  const conflicting = await applyResultsImport({
    results: [{ ...identified, time: "35:00", source: "https://other-timer.example/race/1" }],
  });
  assert.equal(conflicting.skipped, 1);
  assert.match(conflicting.errors[0], /Conflicting time/);
  assert.equal(
    (await sql`select finish_time_seconds from results where id=${knownResult}`)[0]
      .finish_time_seconds,
    2400,
  );
  assert.equal(
    (await applyResultsImport({ results: [{ ...identified, time: "" }] })).skipped,
    1,
    "A missing time cannot erase a valid performance",
  );
  const concurrent = await Promise.all([
    applyResultsImport({
      results: [
        {
          ...identified,
          eventSlug: "unified-concurrent",
          time: "40:00",
          source: "https://concurrent-one.example/result",
        },
      ],
    }),
    applyResultsImport({
      results: [
        {
          ...identified,
          eventSlug: "unified-concurrent",
          time: "35:00",
          source: "https://concurrent-two.example/result",
        },
      ],
    }),
  ]);
  assert.equal(
    concurrent.reduce((count, report) => count + report.resultsUpserted, 0),
    1,
  );
  assert.equal(
    concurrent.reduce((count, report) => count + report.skipped, 0),
    1,
  );
  await sql`update athlete_private_profiles set world_athletics_url='https://worldathletics.org/athletes/test/fixture-76543210' where user_id='dev-user'`;
  let matches = await rpc("result-match-api", "listMyPotentialResultMatches");
  assert(
    matches.matches.some((match) => match.athleteId === known),
    "Known IDs find results even when names differ",
  );
  await rpc("profile-connections-api", "dismissMyAthleteMatch", {
    athleteId: known,
    dismissed: true,
  });
  matches = await rpc("result-match-api", "listMyPotentialResultMatches");
  assert(!matches.matches.some((match) => match.athleteId === known));
  assert(
    (await rpc("profile-connections-api", "getMyDismissedAthletes")).some(
      (item) => item.athleteId === known,
    ),
  );
  await rpc("profile-connections-api", "dismissMyAthleteMatch", {
    athleteId: known,
    dismissed: false,
  });
  assert(
    (await rpc("result-match-api", "listMyPotentialResultMatches")).matches.some(
      (match) => match.athleteId === known,
    ),
  );
  await assert.rejects(() =>
    rpc("result-claims-api", "submitResultClaim", {
      resultId: knownResult,
      declarationAccepted: false,
    }),
  );
  const claim = await rpc("result-claims-api", "submitResultClaim", {
    resultId: knownResult,
    declarationAccepted: true,
  });
  assert.equal(claim.status, "approved");
  console.log("Imports, source matching, dismissals and confirmed ownership passed.");
  const after = await rpc("athlete-account-api", "getMyAthleteAccount");
  assert.equal(after.athleteProfileId, account.athleteProfileId);
  assert.equal(after.athleteNumber, account.athleteNumber);
  assert.equal(
    (await sql`select athlete_number::text from athlete_resolved_ids where athlete_id=${known}`)[0]
      .athlete_number,
    account.athleteNumber,
    "An approved claim resolves to the stable account ID",
  );
  assert.equal(
    after.claimedResults.filter((result) =>
      ["unified-fixture-road", "unified-fixture-track"].includes(result.eventSlug),
    ).length,
    2,
  );
  assert(
    after.claimedResults.find((result) => result.resultId === knownResult).sourceUrls.length >= 2,
  );
  await rpc("profile-connections-api", "saveMyProfileConnection", {
    platform: "instagram",
    url: "https://www.instagram.com/fixture_runner/",
    sharePublicly: false,
  });
  assert.equal(
    (await rpc("profile-connections-api", "getMyProfileConnections"))[0].sharePublicly,
    false,
  );
  await assert.rejects(() =>
    rpc("profile-connections-api", "saveMyProfileConnection", {
      platform: "instagram",
      url: "https://evil.example/runner",
      sharePublicly: true,
    }),
  );
  await assert.rejects(() =>
    rpc("profile-connections-api", "getMyProfileConnections", undefined, {
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "cors",
    }),
  );
  const share = await rpc("athlete-profile-share-api", "getMyProfileShare");
  assert.equal(
    await rpc("athlete-profile-share-api", "getPublishedSharedProfile", { slug: share.slug }),
    null,
  );
  await assert.rejects(() =>
    rpc("athlete-profile-share-api", "saveMyProfileShare", { enabled: true, acknowledged: false }),
  );
  await rpc("athlete-profile-share-api", "saveMyProfileShare", {
    enabled: true,
    acknowledged: true,
    shareBio: false,
    shareResults: true,
    shareClub: false,
    shareLocation: false,
  });
  let published = await rpc("athlete-profile-share-api", "getPublishedSharedProfile", {
    slug: share.slug,
  });
  assert(published);
  assert.equal(published.athleteNumber, account.athleteNumber);
  assert.equal(
    await rpc("athlete-profile-share-api", "getPublishedSharedProfile", {
      slug: `ATH-${account.athleteNumber.padStart(6, "0")}`,
    }),
    null,
    "A sequential ID must not make unlisted shared profiles discoverable",
  );
  assert.equal(published.connections.length, 0);
  assert.equal(published.club, "");
  assert.equal(published.country, "");
  assert(!("email" in published) && !("dateOfBirth" in published));
  assert(published.results.some((result) => result.resultId === knownResult));
  await rpc("profile-connections-api", "saveMyProfileConnection", {
    platform: "instagram",
    url: "https://www.instagram.com/fixture_runner/",
    sharePublicly: true,
  });
  published = await rpc("athlete-profile-share-api", "getPublishedSharedProfile", {
    slug: share.slug,
  });
  assert.equal(published.connections.length, 1);
  const alias = (
    await sql`insert into athletes(slug,display_name,profile_visibility) values('fixture-confirmed-alias','Fixture Previous Name','private') returning id`
  )[0].id;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email) values(${alias},'dev-user','fixture@example.test')`;
  assert.equal(
    (await sql`select athlete_number::text from athlete_resolved_ids where athlete_id=${alias}`)[0]
      .athlete_number,
    account.athleteNumber,
    "Every confirmed source identity resolves to the same account ID",
  );
  await sql`insert into results(edition_id,athlete_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,overall_place,category,source_url)
    select edition_id,${alias},status,finish_time_seconds,chip_time_seconds,gun_time_seconds,overall_place,category,'https://extra-source.example/race/1' from results where id=${knownResult}`;
  published = await rpc("athlete-profile-share-api", "getPublishedSharedProfile", {
    slug: share.slug,
  });
  const combined = published.results.filter(
    (result) => result.eventSlug === "unified-fixture-road",
  );
  assert.equal(combined.length, 1);
  assert.equal(combined[0].sourceResultIds.length, 2);
  await sql`insert into athlete_profile_hidden_results(user_id,result_id) values('dev-user',${knownResult})`;
  published = await rpc("athlete-profile-share-api", "getPublishedSharedProfile", {
    slug: share.slug,
  });
  assert(
    !published.results.some((result) => result.eventSlug === "unified-fixture-road"),
    "A duplicate cannot expose a hidden performance",
  );
  await rpc("athlete-profile-share-api", "saveMyProfileShare", { enabled: false });
  assert.equal(
    await rpc("athlete-profile-share-api", "getPublishedSharedProfile", { slug: share.slug }),
    null,
  );
  await rpc("profile-connections-api", "removeMyProfileConnection", { platform: "instagram" });
  assert.equal((await rpc("profile-connections-api", "getMyProfileConnections")).length, 0);
  console.log(
    "Unified profile integration passed: real imports, matching, dismissal/undo, confirmed claims, save/reload, source provenance and opt-in public visibility.",
  );
} finally {
  await server.close();
  if (database) await database.close();
}
