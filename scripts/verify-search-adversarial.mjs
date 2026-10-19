// Adversarial search integration tests: real auth/RPC/SQL, synthetic data, mocked provider only.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import {
  publicResultUrl,
  matchingNames,
  matchingSettingsSchema,
} from "../src/lib/athrecs/result-matching-settings.ts";
import { scorePotentialResultNameMatch } from "../src/lib/athrecs/result-match.ts";
const origin = "http://127.0.0.1:18350";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  ATHRECS_CLAIMS_EMAILS: "",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "synthetic-adversarial-secret-at-least-32-characters",
  TSS_SERVER_FN_BASE: `${origin}/_serverFn/`,
  XAI_API_KEY: "test-only-key",
});
const failures = [];
let passed = 0;
async function check(name, test) {
  try {
    await test();
    passed++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
const candidate = {
  sourceUrl: "https://example.com/synthetic-results",
  athleteName: "Synthetic Runner",
  eventName: "Synthetic 10K",
  eventDate: "2026-09-01",
  distance: "10K",
  finishTime: "40:00",
  confidence: "exact",
};
let providerText = JSON.stringify({ candidates: [candidate] }),
  providerStatus = 200,
  providerZdr = true,
  providerFailure = false,
  beforeResponse,
  beforeProbeResponse;
const outbound = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.x.ai/v1/responses") {
    const body = JSON.parse(init.body);
    outbound.push(body);
    if (providerFailure) throw new DOMException("Synthetic provider timeout", "TimeoutError");
    if (body.input === "Reply OK." && beforeProbeResponse) await beforeProbeResponse();
    if (body.input !== "Reply OK." && beforeResponse) await beforeResponse();
    return Response.json(
      { output_text: providerText },
      { status: providerStatus, headers: { "x-zero-data-retention": String(providerZdr) } },
    );
  }
  assert(url.startsWith(origin), `Unexpected outbound destination ${new URL(url).origin}`);
  return realFetch(input, init);
};
const modules = new Map();
async function rpc(file, name, data, token, headers = {}) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file),
    start = source.indexOf(`const ${name} =`);
  assert(start >= 0, name);
  const section = source.slice(start, source.indexOf(";", start)),
    id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1],
    method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const response = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      context: {},
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
const server = await createServer({ server: { host: "127.0.0.1", port: 18350, strictPort: true } });
let database;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const signup = async (email) => {
    const response = await fetch(`${origin}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({
        name: "Synthetic Runner",
        email,
        password: "Synthetic-Password-123!",
      }),
    });
    assert.equal(response.status, 200, await response.clone().text());
    return response.json();
  };
  const a = await signup("matching-a@example.test"),
    b = await signup("matching-b@example.test");
  await sql`update "user" set "emailVerified"=true where id=${a.user.id} or id=${b.user.id}`;
  await rpc("athrecs/athlete-account-api", "getMyAthleteAccount", undefined, a.token);

  const saveSettings = (value, token = a.token) =>
    rpc(
      "athrecs/result-matching-settings-api",
      "saveMyMatchingSettings",
      matchingSettingsSchema.parse(value),
      token,
    );
  const search = (filters = {}, token = a.token) =>
    rpc("athrecs/result-match-api", "listMyPotentialResultMatches", filters, token);
  const external = (token = a.token) =>
    rpc("athrecs/grok-runner-search-api", "findExternalRunnerMatches", undefined, token);
  const saveIdentity = (fullName = "Synthetic Runner") =>
    rpc(
      "athrecs/result-matching-settings-api",
      "saveMyClaimIdentity",
      { fullName, dateOfBirth: "1984-09-02", nationality: "Irish", privacyAcknowledged: true },
      a.token,
    );
  await saveIdentity();
  await sql`insert into events(id,slug,name,sport,surface,country) values(992600,'synthetic-adversarial','Synthetic Adversarial Races','Running','Road','Ireland')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values (992600,992600,'2026-09-01','10K',10),(992601,992600,'2025-09-01','10 miles',16.09344),(992602,992600,'2026-09-01','5K',5)`;
  for (const [i, name] of [
    "Synthetic Runner",
    "José García",
    "Siobhán O’Neill",
    "Synthetic William Runner",
    "Synthetic Peter Runner",
    "Synthetic Former",
  ].entries()) {
    const id = 992600 + i;
    await sql`insert into athletes(id,slug,display_name,profile_visibility) values(${id},${"synthetic-adversarial-" + i},${name},'private')`;
    await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status) values(${id},992600,${id},2400,'finished')`;
  }
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status) values(992620,992601,992600,4000,'finished'),(992621,992602,992600,1200,'finished')`;
  await check("anonymous search is rejected", () =>
    assert.rejects(() => search({}, null), /Unauthorized|Authentication|sign in/i),
  );
  await check("cross-site navigation cannot trigger a paid external search", () =>
    assert.rejects(
      () =>
        rpc("athrecs/grok-runner-search-api", "findExternalRunnerMatches", undefined, a.token, {
          "sec-fetch-site": "cross-site",
          "sec-fetch-mode": "navigate",
          "sec-fetch-dest": "document",
        }),
      /Forbidden|cross-site/i,
    ),
  );
  await check("forged account context cannot read another account settings", async () => {
    await saveSettings({
      otherSurnames: ["Former"],
      address: "Synthetic private street",
      phone: "000-test-only",
      contactConsent: true,
    });
    const settings = await rpc(
      "athrecs/result-matching-settings-api",
      "getMyMatchingSettings",
      { userId: a.user.id },
      b.token,
    );
    assert.equal(settings.address, "");
    assert.deepEqual(settings.otherSurnames, []);
  });
  await check("unrelated names and SQL wildcard inputs are rejected", async () => {
    for (const name of ["Other Person", "%'; DROP TABLE athletes; --", "_ %"])
      await assert.rejects(() => search({ name }), /Save this racing name/);
  });
  await check("year and distance jointly narrow results", async () => {
    const r = await search({ name: "Synthetic Runner", year: "2025", distance: "10 miles" });
    assert.deepEqual(
      r.matches.map((m) => m.resultId),
      [992620],
    );
  });
  await check("distance case variants find the same miles race", async () => {
    for (const distance of ["10M", "10m", "10 MI", "10 MILES"]) {
      const r = await search({ name: "Synthetic Runner", year: "2025", distance });
      assert.deepEqual(
        r.matches.map((m) => m.resultId),
        [992620],
        distance,
      );
    }
  });
  await check("malformed year and oversized filters are rejected", async () => {
    for (const filters of [
      { year: "20xx" },
      { year: "2026 OR 1=1" },
      { name: "x".repeat(121) },
      { distance: "x".repeat(41) },
    ])
      await assert.rejects(() => search(filters));
  });
  await check("punctuation-only distance does not silently remove filter", () =>
    assert.rejects(() => search({ distance: "%%%" })),
  );
  await check("surname aliases do not use a title as the first name", () =>
    assert(
      matchingNames("Dr Synthetic Runner", [], { otherSurnames: ["Former"] }).includes(
        "Synthetic Former",
      ),
    ),
  );
  await check("accented result is found from unaccented saved name", async () => {
    await saveIdentity("Jose Garcia");
    const r = await search({ name: "Jose Garcia" });
    assert(r.matches.some((m) => m.resultId === 992601));
  });
  await check("apostrophe and accent variations reach the scoring step", async () => {
    await saveIdentity("Siobhan ONeill");
    const r = await search({ name: "Siobhan ONeill" });
    assert(r.matches.some((m) => m.resultId === 992602));
  });
  await saveIdentity();
  await check("conflicting middle names cannot be a strong match", () => {
    const r = scorePotentialResultNameMatch(
      ["Synthetic William Runner"],
      "Synthetic Peter Runner",
      {},
      {},
    );
    assert(!r || r.confidence === "possible");
  });
  await check("unrelated full first names cannot become a strong match from context", () => {
    const r = scorePotentialResultNameMatch(
      ["Synthetic Runner"],
      "Samuel Runner",
      { city: "Norwich", region: "Norfolk", clubOrTeam: "Test Club" },
      { city: "Norwich", region: "Norfolk", clubName: "Test Club" },
    );
    assert(!r || r.confidence === "possible");
  });
  await check("private/sign-in links in fragments and redirects are rejected", () => {
    for (const url of [
      "https://example.com/#access_token=private",
      "https://example.com/?next=https%3A%2F%2Felsewhere.com%2F%3Ftoken%3Dprivate",
    ])
      assert.throws(() => publicResultUrl(url), url);
  });
  await check("ordinary public result query links remain accepted", () =>
    assert.equal(
      publicResultUrl("https://example.com/results?race=1&athlete=20"),
      "https://example.com/results?race=1&athlete=20",
    ),
  );
  await check("saved source IDs do not override an explicit name filter", async () => {
    await sql`insert into athlete_source_identities(provider,external_id,athlete_id,source_url) values('powerof10','9876500',992605,'https://www.thepowerof10.info/athletes/profile.aspx?athleteid=9876500')`;
    await saveSettings({
      otherSurnames: ["Former"],
      sourceUrls: ["https://www.thepowerof10.info/athletes/profile.aspx?athleteid=9876500"],
    });
    assert(
      (await search()).matches.some((m) => m.resultId === 992605),
      "Saved identifier finds a result",
    );
    assert(
      !(await search({ name: "Synthetic Runner" })).matches.some((m) => m.resultId === 992605),
      "Selecting one name narrows results",
    );
  });
  await saveSettings({});
  await check("Not me hides only that athlete for the signed-in account", async () => {
    await rpc(
      "athrecs/profile-connections-api",
      "dismissMyAthleteMatch",
      { athleteId: 992600, dismissed: true },
      a.token,
    );
    assert(!(await search()).matches.some((m) => m.athleteId === 992600));
    assert((await search({}, b.token)).matches.some((m) => m.athleteId === 992600));
    await rpc(
      "athrecs/profile-connections-api",
      "dismissMyAthleteMatch",
      { athleteId: 992600, dismissed: false },
      a.token,
    );
    assert((await search()).matches.some((m) => m.athleteId === 992600));
  });
  await check("archive suggestions support accents and keep private fields out", async () => {
    await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note) values('d9780833-5758-4310-834e-2cb08dbbc610',992600,'Synthetic Provider','synthetic-adversarial','https://example.com/synthetic-results','Synthetic test fixture only')`;
    await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash) values('d9780833-5758-4310-834e-2cb08dbbc610','synthetic-row',${JSON.stringify({ name: "José García", finishSeconds: 2400, status: "finished", nationality: "ESP", age: "42" })}::jsonb,${"a".repeat(64)})`;
    await saveIdentity("Jose Garcia");
    const rows = await rpc(
      "results-archive/member-api",
      "getMyArchiveMatches",
      { name: "Jose Garcia", year: "2026", distance: "10 km" },
      a.token,
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, "José García");
    assert(!("nationality" in rows[0]));
    assert(!("age" in rows[0]));
    assert.equal(
      (await rpc("results-archive/member-api", "getMyArchiveMatches", { year: "2025" }, a.token))
        .length,
      0,
    );
  });
  await saveIdentity();
  await check("newer weak candidates cannot crowd out an older exact name", async () => {
    // Exceed the larger 5,000-row discovery cap while retaining the old date-first control.
    await sql`insert into athletes(id,slug,display_name,profile_visibility) select n,'synthetic-scenic-runner-'||n,'Scenic Runner','private' from generate_series(993700,998700) n`;
    await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status) select n,992600,n,2400,'finished' from generate_series(993700,998700) n`;
    const oldWindow =
      await sql`select r.id from results r join athletes a on a.id=r.athlete_id join editions ed on ed.id=r.edition_id where lower(a.display_name) like '%s%runner%' and ed.event_date::text like '2026%' and ed.distance_code='10K' order by ed.event_date desc,r.id desc limit 1000`;
    assert.equal(oldWindow.length, 1000);
    assert(
      !oldWindow.some((r) => r.id === 992600),
      "The previous date-first candidate limit loses this exact match",
    );
    const result = await search({ name: "Synthetic Runner", year: "2026", distance: "10K" });
    assert(result.matches.some((m) => m.resultId === 992600));
    assert.equal(result.truncated, true);
  });
  await check("no external call without consent", async () => {
    outbound.length = 0;
    assert.equal((await external()).consentRequired, true);
    assert.equal(outbound.length, 0);
  });
  const resetExternal = async () => {
    providerText = JSON.stringify({ candidates: [candidate] });
    providerStatus = 200;
    providerZdr = true;
    providerFailure = false;
    beforeResponse = undefined;
    outbound.length = 0;
    await saveSettings({ externalSearchConsent: true });
  };
  await resetExternal();
  await check("provider failure does not masquerade as an empty successful search", async () => {
    providerStatus = 503;
    assert.equal((await external()).available, false);
    assert.equal(outbound.length, 1);
  });
  await resetExternal();
  await check("timeout leaves internal matching usable", async () => {
    providerFailure = true;
    assert.equal((await external()).available, false);
    assert((await search({ name: "Synthetic Runner" })).matches.length);
  });
  await resetExternal();
  await check("zero retention gate sends no athlete data", async () => {
    providerZdr = false;
    assert.equal((await external()).available, false);
    assert.equal(outbound.length, 1);
    assert.equal(outbound[0].input, "Reply OK.");
  });
  await resetExternal();
  await check("malformed provider output is an error, not a cached no-results answer", async () => {
    providerText = "not valid JSON";
    assert.equal((await external()).available, false);
    providerText = JSON.stringify({ candidates: [candidate] });
    assert.equal((await external()).matches.length, 1);
  });
  await resetExternal();
  await check("unrelated candidates cannot crowd out a valid match", async () => {
    providerText = JSON.stringify({
      candidates: [
        ...Array.from({ length: 20 }, (_, i) => ({
          ...candidate,
          athleteName: "Other Person " + i,
          sourceUrl: "https://example.com/result/" + i,
        })),
        candidate,
      ],
    });
    assert.equal((await external()).matches.length, 1);
  });
  await resetExternal();
  await check("external source labels cannot be spoofed by a URL path", async () => {
    providerText = JSON.stringify({
      candidates: [
        { ...candidate, sourceUrl: "https://example.com/parkrun/worldathletics/powerof10" },
      ],
    });
    assert.equal((await external()).matches[0].source, "other");
  });
  await resetExternal();
  await check("model exact confidence cannot promote an initial-only name", async () => {
    await sql`update athlete_private_profiles set city='Norwich' where user_id=${a.user.id}`;
    providerText = JSON.stringify({
      candidates: [
        { ...candidate, athleteName: "S Runner", location: "Norwich", confidence: "exact" },
      ],
    });
    assert.equal((await external()).matches[0].confidence, "possible");
  });
  await resetExternal();
  await check("external duplicates are returned once", async () => {
    providerText = JSON.stringify({ candidates: [candidate, { ...candidate }] });
    assert.equal((await external()).matches.length, 1);
  });
  await resetExternal();
  await check("unsafe legacy profile links never leave the server", async () => {
    await sql`update athlete_private_profiles set power_of_10_url='https://example.com/?token=synthetic-private' where user_id=${a.user.id}`;
    await external();
    assert(!JSON.stringify(outbound).includes("synthetic-private"));
    await sql`update athlete_private_profiles set power_of_10_url=null where user_id=${a.user.id}`;
  });
  await sql`update athlete_private_profiles set power_of_10_url=null where user_id=${a.user.id}`;
  await resetExternal();
  await check("successful external cache is private and reused", async () => {
    assert.equal((await external()).cached, false);
    const count = outbound.length;
    assert.equal((await external()).cached, true);
    assert.equal(outbound.length, count);
    assert.equal((await external(b.token)).matches.length, 0);
  });
  await resetExternal();
  await check(
    "consent withdrawal during a request cannot resurrect its results/cache",
    async () => {
      beforeResponse = () => saveSettings({ externalSearchConsent: false });
      const result = await external();
      beforeResponse = undefined;
      assert.equal(result.matches.length, 0);
      const [row] =
        await sql`select count(*)::int n from athlete_external_match_searches where user_id=${a.user.id}`;
      assert.equal(row.n, 0);
    },
  );
  await resetExternal();
  await check(
    "withdrawal during the privacy probe prevents the personal-data request",
    async () => {
      beforeProbeResponse = () => saveSettings({ externalSearchConsent: false });
      assert.equal((await external()).matches.length, 0);
      beforeProbeResponse = undefined;
      assert.equal(outbound.length, 1);
      assert.equal(outbound[0].input, "Reply OK.");
    },
  );
  await resetExternal();
  await check("identity changes during a search discard obsolete suggestions", async () => {
    beforeResponse = () => saveIdentity("Synthetic Changed");
    assert.equal((await external()).matches.length, 0);
    beforeResponse = undefined;
    const [row] =
      await sql`select count(*)::int n from athlete_external_match_searches where user_id=${a.user.id}`;
    assert.equal(row.n, 0);
    await saveIdentity();
  });
  await resetExternal();
  await check("expired external cache is refreshed", async () => {
    await external();
    const previous = outbound.length;
    await sql`update athlete_external_match_searches set created_at=now()-interval '8 days' where user_id=${a.user.id}`;
    assert.equal((await external()).cached, false);
    assert.equal(outbound.length, previous + 2);
  });
  await resetExternal();
  await check("birth-date changes invalidate cached external confidence", async () => {
    providerText = JSON.stringify({ candidates: [{ ...candidate, eventDate: "1990-09-01" }] });
    assert.equal((await external()).matches[0].confidence, "exact");
    await rpc(
      "athrecs/result-matching-settings-api",
      "saveMyClaimIdentity",
      {
        fullName: "Synthetic Runner",
        dateOfBirth: "1994-09-02",
        nationality: "Irish",
        privacyAcknowledged: true,
      },
      a.token,
    );
    const changed = await external();
    assert.equal(changed.cached, false);
    assert.equal(changed.matches[0].confidence, "possible");
    assert(!JSON.stringify(outbound).includes("1994-09-02"));
  });
  console.log(JSON.stringify({ passed, failed: failures.length, failures }));
  assert.deepEqual(failures, [], `${failures.length} adversarial checks failed`);
} finally {
  await server.close();
  await database?.close();
}
