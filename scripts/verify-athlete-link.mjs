// Real schema and service transactions, using only synthetic identities in memory.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
const require = createRequire(import.meta.url),
  ts = require("typescript"),
  zod = require("zod");
function load(path, deps = {}) {
  const m = { exports: {} };
  const c = ts.transpileModule(readFileSync(path, "utf8"), {
    fileName: path,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  new Function("require", "module", "exports", c.outputText)(
    (name) => {
      if (!(name in deps)) throw Error(`Unexpected dependency ${name}`);
      return deps[name];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const core = load("src/lib/athlete-link/core.ts", { zod });
const connections = load("src/lib/athrecs/profile-connections.ts");
const modernPowerOf10 =
  "https://www.powerof10.uk/Home/Athlete/11111111-2222-4333-8444-555555555555";
assert.deepEqual(core.athleteSource(modernPowerOf10), {
  provider: "powerof10",
  label: "Power of 10",
  externalId: "11111111-2222-4333-8444-555555555555",
  url: modernPowerOf10,
});
assert.deepEqual(connections.sourceIdentityFromUrl(modernPowerOf10), {
  provider: "powerof10",
  externalId: "11111111-2222-4333-8444-555555555555",
});
for (const bad of [
  modernPowerOf10.replace("powerof10.uk", "powerof10.uk.evil.test"),
  modernPowerOf10.replace("/Athlete/", "/Results/"),
  modernPowerOf10.replace("11111111-", "invalid-"),
  modernPowerOf10.replace("powerof10.uk", "powerof10.uk:444"),
]) {
  assert.throws(() => core.athleteSource(bad));
  assert.equal(connections.sourceIdentityFromUrl(bad), null);
}
assert.equal(
  core.athleteSource(modernPowerOf10.toUpperCase() + "/?utm_source=test#bio").url,
  modernPowerOf10,
);
const match = load("src/lib/staff-results-upload/core.ts");
for (const url of [
  "http://worldathletics.org/athletes/test/person-1",
  "https://worldathletics.org.evil.test/athletes/test/person-1",
  "https://user:pass@worldathletics.org/athletes/test/person-1",
  "https://127.0.0.1/athletes/test/person-1",
  "https://worldathletics.org:444/athletes/test/person-1",
  "https://worldathletics.org/athletes/test/%70erson-1",
  "https://www.thepowerof10.info/athletes/profile.aspx?athleteid=1&athleteid=2",
  "https://www.parkrun.org.uk/parkrunner/42/results/",
  "https://totalracetiming.co.uk/raceresults/706",
])
  assert.throws(() => core.athleteSource(url));
assert.equal(
  core.athleteSource("https://www.worldathletics.org/athletes/test/fixture-123?utm_source=test#bio")
    .url,
  "https://worldathletics.org/athletes/test/fixture-123",
);
assert.equal(core.athleteSource("https://worldathletics.org/athletes/-/123").externalId, "123");
assert.equal(
  core.athleteSource("https://www.thepowerof10.info/athletes/profile.aspx?athleteid=42").externalId,
  "42",
);
assert.equal(core.athleteSource("https://www.parkrun.org.uk/parkrunner/42/").externalId, "42");
const db = new PGlite();
await db.waitReady;
let failAudit = false,
  queries = 0;
function sqlFor(connection) {
  const query = async (text, values = []) => {
    queries++;
    if (failAudit && /insert into network_audit_log/i.test(text))
      throw Error("Synthetic late audit failure");
    // PGlite has one session. Lock/concurrency semantics are not simulated.
    if (/^select pg_advisory_xact_lock/.test(text.trim())) return [];
    return (await connection.query(text, values)).rows;
  };
  const sql = async (strings, ...values) => {
    let text = strings[0];
    values.forEach((_, i) => (text += `$${i + 1}${strings[i + 1]}`));
    return query(text, values);
  };
  sql.query = query;
  sql.transaction = (fn) => db.transaction((tx) => fn(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db),
  connection = { getSql: async () => sql, dbSource: "neon" },
  scope = { IS_RUNRECS_SITE: false };
const service = load("src/lib/athlete-link/service.server.ts", {
  "node:crypto": crypto,
  "../db": connection,
  "../site-scope": scope,
  "../staff-results-upload/core": match,
  "./core": core,
});
const actor = { userId: "synthetic-link-staff", staffEmail: "link-staff@example.test" };
const input = (id, name = "", searchName = "") => ({
  url: `https://worldathletics.org/athletes/test/synthetic-${id}`,
  name,
  searchName,
});
const request = (data, review, extra = {}) => ({
  ...data,
  version: review.version,
  requestId: crypto.randomUUID(),
  action: "create",
  reason: "Synthetic staff source and identity check recorded.",
  sourceChecked: true,
  identityChecked: true,
  rightsConfirmed: true,
  differentPerson: false,
  ...extra,
});
async function snapshot() {
  const data = {};
  for (const table of [
    "athletes",
    "athlete_source_identities",
    "athlete_identifiers",
    "results",
    "network_audit_log",
  ])
    data[table] = (
      await db.query(
        `select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from ${table} t`,
      )
    ).rows[0].rows;
  return JSON.stringify(data);
}
try {
  for (const name of readdirSync("migrations")
    .filter((n) => n.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync(`migrations/${name}`, "utf8"));
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values(${actor.userId},'Synthetic Staff',${actor.staffEmail},true,now(),now())`;
  const before = await snapshot();
  assert.equal((await service.checkLink(input(1), actor)).state, "needs_name");
  const data = input(1, "Synthetic Fresh Person"),
    checked = await service.checkLink(data, actor),
    req = request(data, checked);
  assert.equal(checked.state, "review");
  assert.equal(checked.totalCandidates, 0);
  assert.equal(await snapshot(), before, "Checks are read-only");
  await assert.rejects(() => service.checkLink(data, { userId: "", staffEmail: "" }), /Staff/);
  await assert.rejects(
    () => service.checkLink(data, { ...actor, staffEmail: "wrong@example.test" }),
    /verified staff/,
  );
  for (const key of ["sourceChecked", "identityChecked", "rightsConfirmed"])
    await assert.rejects(() => service.saveLink({ ...req, [key]: false }, actor));
  connection.dbSource = "pglite";
  await assert.rejects(() => service.saveLink(req, actor), /unavailable/);
  connection.dbSource = "neon";
  scope.IS_RUNRECS_SITE = true;
  await assert.rejects(() => service.checkLink(data, actor), /Use AthRecs/);
  scope.IS_RUNRECS_SITE = false;
  process.env.VERCEL_ENV = "preview";
  await assert.rejects(() => service.saveLink(req, actor), /preview/);
  delete process.env.VERCEL_ENV;
  assert.equal(await snapshot(), before);
  failAudit = true;
  await assert.rejects(() => service.saveLink(req, actor), /late audit failure/);
  failAudit = false;
  assert.equal(
    await snapshot(),
    before,
    "Late failures roll back the new athlete, identifier and source mapping",
  );
  const saved = await service.saveLink(req, actor);
  assert(saved.created);
  assert(saved.athleteNumber);
  const [person] = await sql`select * from athletes where id=${saved.athleteId}`;
  assert.equal(person.profile_visibility, "private");
  assert.equal(person.gender, "U");
  assert.equal(person.country, "");
  assert.equal(person.county, "");
  assert.equal(person.date_of_birth, null);
  assert.equal(person.bio, "");
  assert.equal((await sql`select count(*)::int as n from results`)[0].n, 0);
  const after = await snapshot();
  assert((await service.saveLink(req, actor)).replay);
  assert.equal(await snapshot(), after);
  await assert.rejects(
    () =>
      service.saveLink({ ...req, reason: "Different payload with a reused request ID." }, actor),
    /request has changed/,
  );
  assert.equal((await service.checkLink(input(1), actor)).state, "existing");
  await assert.rejects(
    () => service.saveLink({ ...req, requestId: crypto.randomUUID() }, actor),
    /changed/,
  );
  const [existing] =
    await sql`insert into athletes(slug,display_name,country,profile_visibility) values('synthetic-chris','Christopher Match','Testland','private') returning id`;
  const linking = input(2, "Chris Match"),
    matches = await service.checkLink(linking, actor);
  assert(matches.candidates.some((c) => c.id === existing.id));
  await assert.rejects(
    () => service.saveLink(request(linking, matches), actor),
    /different people/,
  );
  const same = await service.saveLink(
    request(linking, matches, { action: "link", athleteId: existing.id }),
    actor,
  );
  assert.equal(same.created, false);
  assert.equal(same.athleteId, existing.id);
  assert.equal(
    (await sql`select country from athletes where id=${existing.id}`)[0].country,
    "Testland",
  );
  assert.equal(
    (await sql`select profile_visibility from athletes where id=${existing.id}`)[0]
      .profile_visibility,
    "private",
  );
  const otherSource = await service.checkLink(input(3, "Chris Match"), actor);
  assert(otherSource.candidates.find((c) => c.id === existing.id).conflictingSource);
  await assert.rejects(
    () =>
      service.saveLink(
        request(input(3, "Chris Match"), otherSource, { action: "link", athleteId: existing.id }),
        actor,
      ),
    /conflicting source/,
  );
  const separate = await service.saveLink(
    request(input(3, "Chris Match"), otherSource, { differentPerson: true }),
    actor,
  );
  assert.notEqual(separate.athleteId, existing.id);
  const staleData = input(4, "New Stale Person"),
    stale = await service.checkLink(staleData, actor);
  await sql`insert into athletes(slug,display_name,profile_visibility) values('stale-person','New Stale Person','private')`;
  await assert.rejects(() => service.saveLink(request(staleData, stale), actor), /changed/);
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('synthetic-owner','Owner','owner@example.test',true,now(),now())`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email) values(${existing.id},'synthetic-owner','owner@example.test')`;
  const ownedData = {
      ...input(5, "Chris Match"),
      url: "https://www.thepowerof10.info/athletes/profile.aspx?athleteid=5",
    },
    owned = await service.checkLink(ownedData, actor);
  await assert.rejects(
    () =>
      service.saveLink(
        request(ownedData, owned, { action: "link", athleteId: existing.id }),
        actor,
      ),
    /Account-managed/,
  );
  const [legacy] =
    await sql`insert into athletes(slug,display_name,source_url,profile_visibility) values('legacy-source','Legacy Source','https://worldathletics.org/athletes/-/66','private') returning id`;
  assert.equal((await service.checkLink(input(66), actor)).candidates[0].id, legacy.id);
  await sql`insert into athletes(slug,display_name,source_url,profile_visibility) values('legacy-source-duplicate','Another Legacy','https://worldathletics.org/athletes/test/legacy-66','private')`;
  assert.equal((await service.checkLink(input(66), actor)).state, "conflict");
  await sql`insert into athlete_private_profiles(user_id,verified_email,full_name,world_athletics_url,privacy_notice_version,privacy_acknowledged_at) values('synthetic-owner','owner@example.test','Private Account Name','https://worldathletics.org/athletes/test/account-77','synthetic-test',now())`;
  assert.equal((await service.checkLink(input(77), actor)).state, "existing");
  assert.equal(
    (await service.checkLink(input(78, "Private Account Name"), actor)).candidates[0].managed,
    true,
  );
  assert(!JSON.stringify(await service.checkLink(input(77), actor)).includes("owner@example.test"));
  const aliases = await service.checkLink(input(79, "Changed Surname", "Christopher Match"), actor);
  assert(aliases.candidates.some((c) => c.id === existing.id));
  const modernInput = { url: modernPowerOf10, name: "Synthetic Modern Profile", searchName: "" };
  const modernReview = await service.checkLink(modernInput, actor);
  const modernSaved = await service.saveLink(request(modernInput, modernReview), actor);
  assert.equal((await service.checkLink({ ...modernInput, name: "" }, actor)).state, "existing");
  assert.equal(
    (await sql`select profile_visibility from athletes where id=${modernSaved.athleteId}`)[0]
      .profile_visibility,
    "private",
  );
  let middlewareSeen = 0;
  const fakeStaff = {};
  const api = load("src/lib/athlete-link/api.ts", {
    "@tanstack/react-start": {
      createServerFn: () => {
        const chain = {
          middleware: (list) => {
            assert.deepEqual(list, [fakeStaff]);
            middlewareSeen++;
            return chain;
          },
          validator: () => chain,
          handler: () => chain,
        };
        return chain;
      },
    },
    "@/lib/auth/staff-middleware": { staffMiddleware: fakeStaff },
    "./core": core,
  });
  assert(api.checkAthleteLink && api.saveAthleteLink);
  assert.equal(middlewareSeen, 2);
  console.log(
    `PASS: URL validation, existing/legacy/account identities, aliases, private creation, reviewed linking, conflicts, stale reviews, rollback, replay and access guards (${queries} isolated SQL statements). No live data or external requests.`,
  );
} finally {
  await db.close();
}
