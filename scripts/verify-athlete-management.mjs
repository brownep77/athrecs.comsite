// Real management/share/correspondence services and a disposable database. No network,
// production credentials, participant records or outgoing notifications are used.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { createRequire } from "node:module";
import { PGlite } from "@electric-sql/pglite";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const db = new PGlite();
await db.waitReady;
const sqlFor = (connection) => {
  const query = async (text, values = []) => (await connection.query(text, values)).rows;
  const sql = (parts, ...values) =>
    query(
      parts.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
      values,
    );
  sql.query = query;
  sql.transaction = (fn) => db.transaction((tx) => fn(sqlFor(tx)));
  return sql;
};
const sql = sqlFor(db);
const server = {
  createServerFn: () => {
    let validate = (data) => data;
    const chain = {
      middleware: () => chain,
      validator: (fn) => {
        validate = fn;
        return chain;
      },
      handler:
        (fn) =>
        (data, context = {}) =>
          fn({ data: validate(data), context }),
    };
    return chain;
  },
  createServerOnlyFn: (fn) => fn,
  createMiddleware: () => {
    const chain = { client: () => chain, server: () => chain };
    return chain;
  },
};
const overrides = new Map([
  ["@tanstack/react-start", server],
  ["@tanstack/react-start/server", { setResponseHeader() {} }],
  [resolve("src/lib/db.ts"), { getSql: async () => sql, dbSource: "neon" }],
  [
    resolve("src/lib/site-scope.ts"),
    { IS_RUNRECS_SITE: false, sportIsInAthleteProfileScope: () => true },
  ],
  [resolve("src/lib/auth/middleware.ts"), { authMiddleware: "authenticated-context" }],
  [resolve("src/lib/auth/staff-middleware.ts"), { staffMiddleware: "staff-context" }],
  [resolve("src/lib/auth/profile-access.ts"), { profileReadMiddleware: "profile-context" }],
  [resolve("src/lib/athrecs/seed.server.ts"), { ensureAthrecsSeeded: async () => {} }],
  [
    resolve("src/lib/athrecs/athlete-inbox-imap.server.ts"),
    {
      openPrivateInbox: async () => {
        throw new Error("No network in management regression");
      },
    },
  ],
]);
const modules = new Map();
function load(path) {
  let filename = resolve(path);
  if (!existsSync(filename) && !extname(filename)) filename += ".ts";
  if (!existsSync(filename) && !filename.endsWith(".ts")) filename += ".ts";
  if (overrides.has(filename)) return overrides.get(filename);
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} };
  modules.set(filename, module);
  const code = ts.transpileModule(readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("require", "module", "exports", code)(
    (name) => {
      if (overrides.has(name)) return overrides.get(name);
      if (name.startsWith("@/")) return load(resolve("src", name.slice(2)));
      if (name.startsWith(".")) return load(resolve(dirname(filename), name));
      return require(name);
    },
    module,
    module.exports,
  );
  return module.exports;
}

try {
  for (const name of readdirSync("migrations")
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    await db.exec(readFileSync(`migrations/${name}`, "utf8"));
  }
  const management = load("src/lib/athrecs/athlete-management.server.ts");
  const workspace = load("src/lib/athlete-workspace/service.server.ts");
  const sharing = load("src/lib/athrecs/athlete-profile-share-api.ts");
  const correspondence = load("src/lib/athrecs/athlete-messages.server.ts");
  const inbox = load("src/lib/athrecs/athlete-inbox.server.ts");
  await sql`insert into "user"(id,name,email,"emailVerified") values
    ('management-reviewer','Independent Synthetic Reviewer','management-reviewer@example.test',true)`;
  await sql`insert into events(id,slug,name,sport) values(997000,'management-test-event','Synthetic Management Race','Running')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km)
    values(997000,997000,'2025-05-04','10K',10)`;
  const cases = [
    { key: "self", method: "athlete", reviewed: false, expected: false },
    { key: "label-only", method: "staff", reviewed: false, noSourceClaim: true, expected: false },
    { key: "self-reviewed", method: "staff", reviewed: true, selfReviewer: true, expected: false },
    { key: "no-evidence", method: "staff", reviewed: true, noEvidence: true, expected: false },
    { key: "reviewed", method: "staff", reviewed: true, expected: true },
    { key: "legacy-reviewed", method: "unrecorded", reviewed: true, expected: true },
    { key: "revoked", method: "staff", reviewed: true, revoked: true, expected: false },
  ];
  for (const [index, fixture] of cases.entries()) {
    fixture.id = 997001 + index;
    fixture.userId = `management-${fixture.key}`;
    const email = `${fixture.userId}@example.test`;
    await sql`insert into "user"(id,name,email,"emailVerified")
      values(${fixture.userId},${`Synthetic ${fixture.key}`},${email},true)`;
    await sql`insert into athletes(id,slug,display_name,gender,bio,city,country,profile_visibility)
      values(${fixture.id},${fixture.userId},${`Synthetic ${fixture.key}`},'U','Original researched biography','Original city','United Kingdom','public')`;
    await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status,result_visibility,result_details)
      values(${fixture.id},997000,${fixture.id},2400,'finished','private','{"verificationStatus":"source_verified","timing":{"finishText":"40:00"}}'::jsonb)`;
    await sql`insert into result_claims(id,result_id,athlete_id,claimant_user_id,claimant_email,status,
      verification_method,declaration_accepted,confirmation_method,reviewed_at,reviewed_by_user_id,reviewed_by_email,staff_note)
      values(${fixture.id},${fixture.id},${fixture.id},${fixture.userId},${email},'approved','other',true,${fixture.method},
        ${fixture.reviewed ? new Date() : null},${fixture.reviewed ? (fixture.selfReviewer ? fixture.userId : "management-reviewer") : null},
        ${fixture.reviewed ? (fixture.selfReviewer ? email : "management-reviewer@example.test") : null},
        ${fixture.reviewed && !fixture.noEvidence ? "Synthetic independent club officer response checked against this account." : null})`;
    await sql`insert into athlete_account_links(athlete_id,user_id,user_email,source_claim_id,status,confirmation_method)
      values(${fixture.id},${fixture.userId},${email},${fixture.noSourceClaim ? null : fixture.id},${fixture.revoked ? "revoked" : "active"},${fixture.method})`;
    assert.equal(
      await management.hasReviewedAthleteManagement(sql, fixture.userId, fixture.id),
      fixture.expected,
      fixture.key,
    );
  }
  const [before] = await sql`select
    (select jsonb_agg(r order by id) from results r where id>=997001) as results,
    (select jsonb_agg(c order by id) from result_claims c where id>=997001) as claims,
    (select jsonb_agg(l order by athlete_id) from athlete_account_links l where athlete_id>=997001) as links`;
  await db.exec(readFileSync("migrations/20261103_reviewed_athlete_management.sql", "utf8"));
  const [after] = await sql`select
    (select jsonb_agg(r order by id) from results r where id>=997001) as results,
    (select jsonb_agg(c order by id) from result_claims c where id>=997001) as claims,
    (select jsonb_agg(l order by athlete_id) from athlete_account_links l where athlete_id>=997001) as links`;
  assert.deepEqual(
    after,
    before,
    "The additive management migration never changes stored results, claims or links",
  );

  const legacy = cases[0],
    actor = { userId: legacy.userId, staff: false };
  const privateView = await workspace.workspace(legacy.id, actor);
  assert.equal(privateView.linked.length, 1, "Legacy private association remains available");
  assert.equal(privateView.results.length, 1, "Legacy private history remains available");
  assert.equal(
    privateView.editable,
    false,
    "A self-declaration cannot control canonical profile fields",
  );
  const { id: _id, slug: _slug, profile_visibility: _visibility, ...fields } = privateView.profile;
  await assert.rejects(
    () =>
      workspace.editProfile(
        {
          athleteId: legacy.id,
          version: privateView.profileVersion,
          fields: { ...fields, bio: "Unreviewed replacement" },
          reason: "Synthetic unreviewed write attempt.",
        },
        actor,
      ),
    /independently review ownership/,
  );
  await assert.rejects(
    () =>
      workspace.excludeResult(
        {
          athleteId: legacy.id,
          resultId: legacy.id,
          excluded: true,
          reason: "Synthetic unreviewed exclusion attempt.",
        },
        actor,
      ),
    /independently review ownership/,
  );
  const [preserved] =
    await sql`select a.bio,r.result_details from athletes a join results r on r.athlete_id=a.id where a.id=${legacy.id}`;
  assert.equal(preserved.bio, "Original researched biography");
  assert.equal(preserved.result_details.verificationStatus, "source_verified");
  assert.equal(preserved.result_details.profileExcluded, undefined);

  await sql`insert into athlete_messages(id,athlete_id,direction,channel,subject,body,contact,status,source)
    values('management-original-correspondence',${legacy.id},'sent','email','Synthetic original correspondence',
      'Private synthetic message for the original athlete.','original-runner@example.test','accepted','site')`;
  const [sourceNumber] =
    await sql`select number::text from athlete_identifiers where athlete_id=${legacy.id}`;
  const sourceMessages = await correspondence.loadAthleteMessages(sql, {
    target: { athleteNumber: sourceNumber.number },
    direction: "all",
    page: 1,
  });
  assert.equal(
    sourceMessages.recipientUserId,
    null,
    "A self-declared link cannot address athlete correspondence to its account",
  );
  assert.equal(sourceMessages.recipientEmail, null);
  const accountMessages = await correspondence.loadAthleteMessages(sql, {
    target: { userId: legacy.userId },
    direction: "all",
    page: 1,
  });
  assert.equal(
    accountMessages.total,
    0,
    "A self-declared account cannot inherit the athlete's correspondence",
  );
  assert.deepEqual(
    await inbox.matchInboxSender(sql, "original-runner@example.test"),
    {
      userId: null,
      athleteId: legacy.id,
    },
    "An incoming reply remains with its original athlete until ownership is independently reviewed",
  );

  const settings = await sharing.getMyProfileShare(undefined, actor);
  assert.equal(settings.ownershipReviewRequired, true);
  await sql`update athlete_public_shares set enabled=true,search_indexable=true,acknowledged_at=now() where user_id=${legacy.userId}`;
  const blockedShare = await sharing.getMyProfileShare(undefined, actor);
  assert.equal(
    blockedShare.enabled,
    false,
    "A historical enabled share cannot override missing ownership review",
  );
  assert.equal(blockedShare.searchIndexable, false);
  assert.equal(await sharing.getPublishedSharedProfile({ slug: settings.slug }), null);
  assert.equal(
    await sharing.getPublishedSharedProfile({ slug: legacy.userId }),
    null,
    "A self-declared link cannot replace the canonical athlete URL with an account overlay",
  );
  await assert.rejects(
    () => sharing.saveMyProfileShare({ enabled: true, acknowledged: true }, actor),
    /review the ownership/,
  );
  const withdrawn = await sharing.saveMyProfileShare({ enabled: false }, actor);
  assert.equal(
    withdrawn.enabled,
    false,
    "Privacy withdrawal remains available during ownership review",
  );

  const valid = cases.find((c) => c.key === "reviewed"),
    reviewedActor = { userId: valid.userId, staff: false };
  const reviewedView = await workspace.workspace(valid.id, reviewedActor);
  assert.equal(
    reviewedView.editable,
    true,
    "Recorded independent review preserves existing management rights",
  );
  const {
    id: _reviewedId,
    slug: _reviewedSlug,
    profile_visibility: _reviewedVisibility,
    ...reviewedFields
  } = reviewedView.profile;
  await workspace.editProfile(
    {
      athleteId: valid.id,
      version: reviewedView.profileVersion,
      fields: { ...reviewedFields, city: "Reviewed owner correction" },
      reason: "Synthetic authorised profile update.",
    },
    reviewedActor,
  );
  const enabled = await sharing.saveMyProfileShare(
    { enabled: true, acknowledged: true },
    reviewedActor,
  );
  assert.equal(enabled.enabled, true);
  assert.equal(enabled.ownershipReviewRequired, false);
  assert.equal(
    (await sql`select count(*)::int as n from results where id>=997001`)[0].n,
    cases.length,
  );
  console.log(
    "Reviewed management passed: matching evidence, independent reviewer, legacy preservation, denied canonical edits, correspondence binding and overlays, privacy withdrawal and reviewed-owner access.",
  );
} finally {
  await db.close();
}
