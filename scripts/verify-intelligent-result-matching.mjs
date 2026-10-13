// Real authenticated RPCs, migrations and SQL; disposable synthetic data only.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import {
  matchingNames,
  matchingSettingsSchema,
  missingClaimIdentity,
  distanceSearchAliases,
  publicResultUrl,
} from "../src/lib/athrecs/result-matching-settings.ts";
import { resultIdentityEvidence } from "../src/lib/athrecs/result-match.ts";
const origin = "http://127.0.0.1:18349";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  ATHRECS_CLAIMS_EMAILS: "",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "synthetic-matching-secret-at-least-32-characters",
  TSS_SERVER_FN_BASE: `${origin}/_serverFn/`,
  XAI_API_KEY: "test-only-key",
});
const outbound = [];
let zdr = true;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.x.ai/v1/responses") {
    const body = JSON.parse(init.body);
    outbound.push(body);
    return Response.json(
      {
        output_text: JSON.stringify({
          candidates: [
            {
              sourceUrl: "https://example.com/synthetic-results",
              athleteName: "Synthetic Former",
              eventName: "Synthetic 10K",
              eventDate: "2026-09-01",
              distance: "10K",
              finishTime: "40:00",
              confidence: "exact",
            },
          ],
        }),
      },
      { headers: { "x-zero-data-retention": String(zdr) } },
    );
  }
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
assert.deepEqual(
  matchingNames(
    "Synthetic Runner",
    ["Synthetic Alias One", "Synthetic Alias Two", "Synthetic Alias Three"],
    { otherSurnames: ["Former", "Older", "Oldest"], maidenName: "Maiden" },
  ),
  [
    "Synthetic Runner",
    "Synthetic Alias One",
    "Synthetic Alias Two",
    "Synthetic Alias Three",
    "Synthetic Former",
    "Synthetic Older",
    "Synthetic Oldest",
    "Synthetic Maiden",
  ],
);
assert.deepEqual(distanceSearchAliases("10 km"), ["10k", "10km", "10kilometres", "10kilometers"]);
assert(distanceSearchAliases("half marathon").includes("half"));
for (const url of [
  "http://example.com/a",
  "https://127.0.0.1/a",
  "https://localhost/a",
  "https://example.com/?token=secret",
  "https://name:secret@example.com/a",
])
  assert.throws(() => publicResultUrl(url));
assert.equal(matchingSettingsSchema.safeParse({ address: "Synthetic street" }).success, false);
assert.equal(
  resultIdentityEvidence(
    { dateOfBirth: "1984-09-02" },
    { eventDate: "2026-09-01", ageAtRace: "41" },
  ).conflict,
  false,
);
assert.equal(
  resultIdentityEvidence(
    { dateOfBirth: "1984-09-02" },
    { eventDate: "2026-09-01", category: "M60-64" },
  ).conflict,
  true,
);
assert.equal(
  resultIdentityEvidence({ dateOfBirth: "1984-09-02" }, { eventDate: "2026", category: "M60-64" })
    .conflict,
  false,
);
assert.equal(
  resultIdentityEvidence({ nationality: "British; Irish" }, { nationality: "IRL" }).boost,
  6,
);
assert.equal(
  resultIdentityEvidence({ country: "Ireland" }, { nationality: "IRL" }).boost,
  0,
  "Residence never supplies nationality",
);
for (const key of ["fullName", "dateOfBirth", "nationality", "verifiedEmail"])
  assert(
    missingClaimIdentity({
      ...{
        fullName: "Synthetic Runner",
        dateOfBirth: "1984-09-02",
        nationality: "Irish",
        verifiedEmail: "test@example.test",
        emailVerified: true,
      },
      [key]: "",
    }).length,
  );
const modules = new Map();
async function rpc(file, name, data, token) {
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
      },
      context: {},
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
const server = await createServer({ server: { host: "127.0.0.1", port: 18349, strictPort: true } });
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
  const claim = () =>
    rpc(
      "athrecs/result-claims-api",
      "submitResultClaim",
      {
        resultId: 992491,
        declarationAccepted: true,
        fullName: "Forged",
        dateOfBirth: "1980-01-01",
        nationality: "Irish",
      },
      a.token,
    );
  await assert.rejects(claim, /Before claiming/);
  const identity = {
    fullName: "Synthetic Runner",
    dateOfBirth: "1984-09-02",
    nationality: "Irish",
    privacyAcknowledged: true,
  };
  await assert.rejects(() =>
    rpc(
      "athrecs/result-matching-settings-api",
      "saveMyClaimIdentity",
      { ...identity, dateOfBirth: "2026-02-30" },
      a.token,
    ),
  );
  await rpc("athrecs/result-matching-settings-api", "saveMyClaimIdentity", identity, a.token);
  await sql`insert into events(id,slug,name,sport,surface,country) values(992491,'synthetic-matching','Synthetic Matching 10K','Running','Road','Ireland')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values(992491,992491,'2026-09-01','10K',10),(992492,992491,'2025-09-01','5K',5)`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility,profile_details) values(992491,'synthetic-matching-former','Synthetic Former','private','{"nationality":"IRL"}'::jsonb),(992492,'synthetic-matching-mismatch','Synthetic Older','private','{}'::jsonb)`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,category,status) values(992491,992491,992491,2400,'M40-44','finished'),(992492,992492,992491,1200,'M40-44','finished'),(992493,992491,992492,2400,'M60-64','finished')`;
  const settings = matchingSettingsSchema.parse({
    otherSurnames: ["Former", "Older", "Oldest"],
    maidenName: "Maiden",
    sourceUrls: [
      "https://example.com/synthetic-results",
      "https://www.thepowerof10.info/athletes/profile.aspx?athleteid=9876543",
      "https://www.parkrun.org.uk/parkrunner/9876543/",
    ],
    address: "Synthetic private street",
    phone: "000-test-only",
    contactConsent: true,
  });
  await rpc("athrecs/result-matching-settings-api", "saveMyMatchingSettings", settings, a.token);
  assert.equal(
    (await rpc("athrecs/result-matching-settings-api", "getMyMatchingSettings", undefined, b.token))
      .address,
    "",
    "Another account cannot read settings",
  );
  let matches = await rpc(
    "athrecs/result-match-api",
    "listMyPotentialResultMatches",
    { name: "Synthetic Former", year: "2026", distance: "10 km" },
    a.token,
  );
  assert.deepEqual(
    matches.matches.map((m) => m.resultId),
    [992491],
  );
  assert(matches.matches[0].reasons.some((r) => /nationality matches/.test(r)));
  assert(!JSON.stringify(matches).includes("1984-09-02"));
  assert(!JSON.stringify(matches).includes("Synthetic private street"));
  await assert.rejects(
    () =>
      rpc(
        "athrecs/result-match-api",
        "listMyPotentialResultMatches",
        { name: "Another Person" },
        a.token,
      ),
    /Save this racing name/,
  );
  for (const column of ["full_name", "date_of_birth", "nationality"]) {
    const original =
      column === "full_name"
        ? identity.fullName
        : column === "date_of_birth"
          ? identity.dateOfBirth
          : identity.nationality;
    await sql.query(
      `update athlete_private_profiles set ${column}=${column === "full_name" ? "'123'" : "null"} where user_id=$1`,
      [a.user.id],
    );
    await assert.rejects(claim, /Before claiming/);
    await sql.query(`update athlete_private_profiles set ${column}=$1 where user_id=$2`, [
      original,
      a.user.id,
    ]);
  }
  assert.equal(
    (await sql`select count(*)::int n from athlete_account_links where user_id=${a.user.id}`)[0].n,
    0,
  );
  await sql`update "user" set "emailVerified"=false where id=${a.user.id}`;
  await assert.rejects(claim, /Verify your email/);
  await sql`update "user" set "emailVerified"=true where id=${a.user.id}`;
  assert.equal(
    (await rpc("athrecs/grok-runner-search-api", "findExternalRunnerMatches", undefined, a.token))
      .consentRequired,
    true,
  );
  assert.equal(outbound.length, 0);
  await rpc(
    "athrecs/result-matching-settings-api",
    "saveMyMatchingSettings",
    { ...settings, externalSearchConsent: true },
    a.token,
  );
  await sql`update athlete_private_profiles set date_of_birth='2015-01-01' where user_id=${a.user.id}`;
  assert.match(
    (await rpc("athrecs/grok-runner-search-api", "findExternalRunnerMatches", undefined, a.token))
      .message,
    /adults/,
  );
  assert.equal(outbound.length, 0);
  await sql`update athlete_private_profiles set date_of_birth='1984-09-02' where user_id=${a.user.id}`;
  zdr = false;
  assert.match(
    (await rpc("athrecs/grok-runner-search-api", "findExternalRunnerMatches", undefined, a.token))
      .message,
    /No athlete details/,
  );
  assert.equal(outbound.length, 1);
  assert.equal(outbound[0].input, "Reply OK.");
  zdr = true;
  const external = await rpc(
    "athrecs/grok-runner-search-api",
    "findExternalRunnerMatches",
    undefined,
    a.token,
  );
  assert.equal(external.available, true);
  assert.equal(external.matches.length, 1);
  assert.equal(
    external.matches[0].resultId,
    null,
    "AI cannot attach ownership from event/year guesses",
  );
  const prompt = JSON.parse(outbound.at(-1).input[1].content);
  assert(prompt.alsoKnownAs.includes("Synthetic Former"));
  assert.equal(prompt.resultProfileUrls.length, 3);
  for (const privateValue of [
    "1984-09-02",
    "matching-a@example.test",
    "Synthetic private street",
    "000-test-only",
    "Irish",
  ])
    assert(!JSON.stringify(prompt).includes(privateValue), `Private field leaked: ${privateValue}`);
  await rpc(
    "athrecs/result-matching-settings-api",
    "saveMyMatchingSettings",
    { ...settings, address: "", phone: "", contactConsent: false, externalSearchConsent: false },
    a.token,
  );
  assert.equal(
    (
      await sql`select count(*)::int n from athlete_external_match_searches where user_id=${a.user.id}`
    )[0].n,
    0,
  );
  assert.equal(
    (await rpc("athrecs/result-matching-settings-api", "getMyMatchingSettings", undefined, a.token))
      .address,
    "",
  );
  const conflict = await rpc(
    "athrecs/result-claims-api",
    "submitResultClaim",
    { resultId: 992493, declarationAccepted: true },
    a.token,
  );
  assert.equal(conflict.status, "pending", "Age conflict needs staff review");
  const approved = await claim();
  assert.equal(
    approved.status,
    "approved",
    "Saved surname may explicitly confirm an uncontested profile",
  );
  assert.equal(
    (
      await sql`select count(*)::int n from athlete_account_links where user_id=${a.user.id} and status='active'`
    )[0].n,
    1,
  );
  console.log(
    "PASS: required identity enforced in authenticated claims; alias/distance/year matches; age conflict review; private settings isolation; consent, adult and ZDR gates; external payload minimisation; withdrawal clears contact and cache.",
  );
} finally {
  await server.close();
  await database?.close();
}
