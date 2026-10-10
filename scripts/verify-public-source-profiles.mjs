import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
for (const k of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
])
  process.env[k] = "";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18277";
process.env.TSS_SERVER_FN_BASE = origin + "/_serverFn/";
const server = await createServer({ server: { host: "127.0.0.1", port: 18277, strictPort: true } });
let db;
async function rpc(file, name, data) {
  const source = await (await fetch(origin + "/src/lib/" + file + ".ts")).text();
  const start = source.indexOf("const " + name + " =");
  assert(start >= 0);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(id);
  const response = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method: "GET",
      data,
      headers: { origin, "sec-fetch-site": "same-origin" },
      context: {},
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
try {
  await server.listen();
  // Use the real schema and synthetic fixtures; the full race catalogue is
  // unrelated to this access-control check and must not be seeded here.
  console.log("Initializing isolated schema");
  const module = await server.ssrLoadModule("/src/lib/db.ts");
  db = await module.getPglite();
  const sql = await module.getSql();
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  const { readSourceNationality } = await server.ssrLoadModule(
    "/src/lib/athrecs/source-nationality.ts",
  );
  assert.equal(readSourceNationality({ country: "Brazil" }), null, "Residence is not nationality");
  assert.equal(readSourceNationality({ duvSourceObservation: { nationality: "BRA" } }), null);
  assert.equal(
    readSourceNationality({
      sourceNationalityObservation: {
        value: "Unknown",
        provider: "Timer",
        sourceUrl: "https://example.test/results",
      },
    }),
    null,
  );
  assert.equal(
    readSourceNationality({
      sourceNationalityObservation: {
        value: "BRA",
        provider: "Timer",
        sourceUrl: "javascript:alert(1)",
      },
    }),
    null,
  );
  assert.equal(
    readSourceNationality({
      sourceNationalityObservation: {
        value: "Irish",
        provider: "Timer",
        sourceUrl: "https://example.test/results",
      },
    }).value,
    "Irish",
  );
  console.log("Checking anonymous profile and directory access");
  const [a] =
    await sql`insert into athletes(slug,display_name,profile_visibility,bio,date_of_birth) values('synthetic-duv-public','Synthetic DUV Public','public','Unpublished test biography','1980-01-01') returning id`;
  const read = () => rpc("athrecs/api", "getAdministratorPublishedAthlete", "synthetic-duv-public");
  assert.equal(await read(), null, "A public flag alone does not grant anonymous profile access");
  await sql`insert into network_audit_log(action,entity_type,entity_id,after_value) values('athlete.profile_admin_published','athlete',${String(a.id)},${JSON.stringify({ athleteId: a.id, profile_visibility: "public" })}::jsonb)`;
  const nationalityDetails = {
    duvSourceObservation: { nationality: "BRA", birthYear: 1980 },
    sourceIdentities: [
      {
        externalId: "999999999",
        sourceUrl: "https://statistik.d-u-v.org/getresultperson.php?runner=999999999",
      },
    ],
  };
  await sql`update athletes set profile_details=${JSON.stringify(nationalityDetails)}::jsonb where id=${a.id}`;
  const p = await read();
  assert.equal(p.athlete.display_name, "Synthetic DUV Public");
  assert.equal(p.athlete.bio, "");
  assert.equal(p.athlete.date_of_birth, null);
  assert.equal(p.sourceHistories.length, 0);
  assert.equal(
    p.searchIndexable,
    false,
    "Profile publication does not grant search-indexing approval",
  );
  assert.equal(p.athlete.nationality, "BRA");
  assert.equal(p.athlete.nationality_source.provider, "DUV");
  assert.equal(p.athlete.details.birthCountry, "");
  assert(!JSON.stringify(p).includes("birthYear"), "Only the nationality observation is exposed");
  const directory = await rpc("athrecs/athlete-directory-api", "getAthleteDirectory", {
    q: "Synthetic DUV Public",
  });
  assert.equal(directory.athletes.length, 1);
  assert.equal(directory.athletes[0].nationality, "BRA");
  assert(!JSON.stringify(directory).includes("duvSourceObservation"));
  const page = await fetch(origin + "/athletes/synthetic-duv-public");
  const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(page.headers.get("x-robots-tag"), /noindex/);
  assert(html.includes("Synthetic DUV Public"));
  assert(!html.includes("Unpublished test biography"));
  assert(html.includes("Brazil"));
  assert(html.includes("As listed by"));
  assert(html.includes("runner=999999999"));
  const index = await fetch(origin + "/athletes?q=Synthetic%20DUV%20Public");
  const listing = await index.text();
  assert.equal(index.status, 200);
  assert(listing.includes("Synthetic DUV Public"));
  assert(!listing.includes("Sign in to view athlete profiles"));
  assert(listing.includes('data-country-code="BR"'), "Directory renders the nationality flag");
  assert(html.includes('data-country-code="BR"'), "Profile renders the nationality flag");
  await sql`update athletes set profile_details=${JSON.stringify({ ...nationalityDetails, nationality: "Irish" })}::jsonb where id=${a.id}`;
  assert.equal(
    (await read()).athlete.nationality,
    null,
    "A source import must not expose or override a separately stated private nationality",
  );
  await sql`update athletes set profile_details=${JSON.stringify(nationalityDetails)}::jsonb where id=${a.id}`;
  await sql`update athletes set profile_visibility='private' where id=${a.id}`;
  assert.equal(await read(), null);
  assert.equal(
    (
      await rpc("athrecs/athlete-directory-api", "getAthleteDirectory", {
        q: "Synthetic DUV Public",
      })
    ).athletes.length,
    0,
  );
  await sql`update athletes set profile_visibility='public' where id=${a.id}`;
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('synthetic-duv-owner','Test Owner','duv-owner@example.test',true,now(),now())`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(${a.id},'synthetic-duv-owner','duv-owner@example.test','active')`;
  assert.equal(await read(), null, "A profile-only publication must not override a linked account");
  console.log(
    "PASS: anonymous directory/profile access, explicit publication audit, private and account-linked exclusions, unpublished history and biography/DOB protection. Isolated local database only.",
  );
} finally {
  if (db) await db.close();
  await server.close();
}
