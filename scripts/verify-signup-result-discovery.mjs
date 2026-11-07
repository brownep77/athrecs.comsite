// Automatic result discovery straight after sign-up, through the real
// authenticated RPCs, migrations and SQL. Disposable synthetic data only.
//
// A new athlete gives name, nationality, town, date of birth and clubs at
// sign-up, then saves their racing name ("Save and find my results"). Those
// sign-up details must be used to rank and filter what discovery finds:
//   A  Sam Taylor, Norwich, Norwich Road Runners          -> found first (club + town)
//   B  Sam Taylor, Leeds, Leeds City AC                    -> found, below A
//   C  S Taylor, Norwich                                   -> found only with town support
//   D  Sam Taylor, U20 in 2026 (athlete born 1984)        -> flagged as an age conflict
import { signupDetails } from "./fixtures/signup-details.mjs";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

const origin = "http://127.0.0.1:18361";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  ATHRECS_CLAIMS_EMAILS: "",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "synthetic-discovery-secret-at-least-32-characters",
  TSS_SERVER_FN_BASE: `${origin}/_serverFn/`,
});
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};

const modules = new Map();
async function rpc(file, name, data, token) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file);
  const start = source.indexOf(`const ${name} =`);
  assert(start >= 0, name);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
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

const server = await createServer({ server: { host: "127.0.0.1", port: 18361, strictPort: true } });
let database;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  await (await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts")).ensureAthrecsSeeded();

  const response = await fetch(`${origin}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({
      ...signupDetails("Sam Taylor"),
      signupLocation: "Norwich",
      signupDateOfBirth: "1984-09-02",
      signupClubs: "Norwich Road Runners\nCity of Norwich AC",
      email: "discovery-sam@example.test",
      password: "Synthetic-Password-123!",
    }),
  });
  assert.equal(response.status, 200, await response.clone().text());
  const { user, token } = await response.json();
  await sql`update "user" set "emailVerified"=true where id=${user.id}`;

  await sql`insert into events(id,slug,name,sport,surface,country) values
    (993101,'synthetic-discovery-10k','Synthetic Discovery 10K','Running','Road','United Kingdom')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values
    (993101,993101,'2026-09-01','10K',10),(993102,993101,'2025-09-01','10K',10)`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility,city,county,country,source_club_name) values
    (993101,'synthetic-sam-norwich','Sam Taylor','private','Norwich','Norfolk','England','Norwich Road Runners'),
    (993102,'synthetic-sam-leeds','Sam Taylor','private','Leeds','West Yorkshire','England','Leeds City AC'),
    (993103,'synthetic-s-norwich','S Taylor','private','Norwich','Norfolk','England',null),
    (993104,'synthetic-sam-junior','Sam Taylor','private',null,'','',null)`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,category,status) values
    (993101,993101,993101,2400,'M40-44','finished'),
    (993102,993102,993102,2500,'SM','finished'),
    (993103,993102,993103,2450,null,'finished'),
    (993104,993101,993104,2300,'U20','finished')`;

  // The racing name step that follows sign-up ("Save and find my results").
  await rpc(
    "athrecs/athlete-account-api",
    "saveMyAthleteRacingName",
    { fullName: "Sam Taylor", privacyAcknowledged: true },
    token,
  );
  const found = await rpc("athrecs/result-match-api", "listMyPotentialResultMatches", {}, token);
  const ours = found.matches.filter((m) => m.resultId >= 993101 && m.resultId <= 993104);
  const byId = Object.fromEntries(ours.map((m) => [m.resultId, m]));
  const report = ours.map((m) => ({
    result: m.resultId,
    name: m.athleteName,
    confidence: m.confidence,
    score: m.score,
    reasons: m.reasons,
  }));
  console.log(JSON.stringify(report, null, 2));

  assert(byId[993101], "A: the Norwich club athlete is found");
  assert(
    byId[993101].reasons.some((r) => /club/i.test(r)),
    "A: the sign-up club is used as matching evidence",
  );
  assert(
    byId[993101].reasons.some((r) => /city or town/i.test(r)),
    "A: the sign-up town is used as matching evidence",
  );
  assert(byId[993102], "B: a same-name athlete elsewhere is still shown for review");
  assert(
    byId[993101].score > byId[993102].score,
    "A ranks above B because club and town match the sign-up details",
  );
  assert(byId[993103], "C: an initial-only result is suggested when the sign-up town supports it");
  assert(
    !byId[993104] || byId[993104].confidence === "possible",
    "D: a junior result is not presented as a strong match for an athlete born in 1984",
  );
  assert(
    !JSON.stringify(found).includes("1984-09-02"),
    "The private date of birth never appears in the response",
  );
  console.log(
    "Sign-up result discovery passed: sign-up club, town and date of birth rank and filter results found after sign-up; private details stay out of responses.",
  );
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
