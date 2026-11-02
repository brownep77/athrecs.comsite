import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import {
  intercomIdentityConfigured,
  loadIntercomIdentity,
} from "../src/lib/athrecs/intercom-identity.server.ts";

// Synthetic, in-memory records only. No application DB, contacts or Intercom
// network calls are used. Exercise the production SQL and signed output.
const db = new PGlite();
const sql = async (strings, ...values) => {
  const query = strings.reduce((text, part, index) => text + (index ? `$${index}` : "") + part, "");
  return (await db.query(query, values)).rows;
};
const env = {
  VITE_INTERCOM_APP_ID: "testapp1",
  VITE_SITE_BRAND: "athrecs",
  INTERCOM_SECRET_KEY: "synthetic-only-intercom-key-never-sent-to-intercom",
};
const now = 1_793_232_000;
const forbiddenFetch = globalThis.fetch;
globalThis.fetch = async () => {
  throw new Error("Intercom identity verification must not make network calls");
};

function verifyToken(identity) {
  assert.equal(identity.status, "ready");
  const [header, body, signature, extra] = identity.jwt.split(".");
  assert.equal(extra, undefined);
  assert.deepEqual(JSON.parse(Buffer.from(header, "base64url")), { alg: "HS256", typ: "JWT" });
  const expected = createHmac("sha256", env.INTERCOM_SECRET_KEY)
    .update(`${header}.${body}`)
    .digest();
  assert(timingSafeEqual(Buffer.from(signature, "base64url"), expected));
  const payload = JSON.parse(Buffer.from(body, "base64url"));
  assert.equal(payload.user_id, identity.userId);
  assert.equal(payload.iat, now);
  assert.equal(payload.exp, now + 3600);
  assert.equal(payload.exp, identity.expiresAt);
  assert(!("custom_attributes" in payload), "Custom data is at the JWT top level");
  assert.deepEqual(
    Object.keys(payload).sort(),
    [
      "user_id",
      "name",
      "email",
      "created_at",
      "iat",
      "exp",
      "athrecs_linked_profile_count",
      "athrecs_profile_status",
      "athrecs_pending_claim_count",
      "athrecs_linked_result_count",
      "athrecs_profile_id",
      "athrecs_profile_url",
    ].sort(),
    "Only the agreed minimal attribute allowlist leaves the server",
  );
  return payload;
}

try {
  await db.exec(`
    create table "user" (
      id text primary key, name text not null, email text not null,
      "createdAt" timestamptz not null, private_note text
    );
    create table athletes (id integer primary key, slug text not null);
    create table athlete_account_links (
      athlete_id integer primary key, user_id text not null, status text not null
    );
    create table result_claims (
      id integer primary key, athlete_id integer, claimant_user_id text, status text
    );
    create table athlete_claimable_results (
      id integer primary key, athlete_id integer, available boolean, status text
    );
    insert into "user" values
      ('account-a', 'Athlete A', 'athlete-a@example.test', '2026-10-01T12:00:00Z', 'private A'),
      ('account-b', 'Athlete B', 'athlete-b@example.test', '2026-10-02T12:00:00Z', 'private B'),
      ('account-c', 'Athlete C', 'athlete-c@example.test', '2026-10-03T12:00:00Z', 'private C');
    insert into athletes values (11, 'athlete-a'), (12, 'athlete-b'), (13, 'athlete-extra');
    insert into athlete_account_links values (11, 'account-a', 'active'), (12, 'account-b', 'active');
    insert into result_claims values
      (1, 11, 'account-a', 'approved'),
      (2, 12, 'account-b', 'pending'),
      (3, 13, 'account-b', 'needs_info');
    insert into athlete_claimable_results values
      (1, 11, true, 'finished'),
      (2, 11, true, 'dns'),
      (3, 11, true, 'did not start'),
      (4, 11, true, 'dnf'),
      (-1, 11, true, 'finished'),
      (-2, 11, false, 'finished'),
      (5, 12, true, 'finished');
  `);

  let queryCount = 0;
  const noQuerySql = () => {
    queryCount += 1;
    throw new Error("Unexpected database read");
  };
  for (const config of [
    {},
    { ...env, INTERCOM_SECRET_KEY: "" },
    { ...env, INTERCOM_SECRET_KEY: "   " },
    { ...env, VITE_INTERCOM_APP_ID: "bad-id!" },
    { ...env, VITE_SITE_BRAND: "runrecs" },
  ]) {
    assert.equal(intercomIdentityConfigured(config), false);
    assert.deepEqual(await loadIntercomIdentity(noQuerySql, "account-a", config, now), {
      status: "disabled",
    });
  }
  assert.deepEqual(await loadIntercomIdentity(noQuerySql, "dev-user", env, now), {
    status: "disabled",
  });
  assert.deepEqual(await loadIntercomIdentity(noQuerySql, "", env, now), { status: "disabled" });
  assert.equal(queryCount, 0, "Missing config/dev fallback never queries real accounts");

  const a = verifyToken(await loadIntercomIdentity(sql, "account-a", env, now));
  assert.equal(a.name, "Athlete A");
  assert.equal(a.email, "athlete-a@example.test");
  assert.equal(a.created_at, Date.parse("2026-10-01T12:00:00Z") / 1000);
  assert.equal(a.athrecs_linked_profile_count, 1);
  assert.equal(a.athrecs_profile_status, "linked");
  assert.equal(a.athrecs_profile_id, "11");
  assert.equal(a.athrecs_profile_url, "https://www.athrecs.com/athletes/athlete-a");
  assert.equal(a.athrecs_pending_claim_count, 0, "Another account's pending requests are isolated");
  assert.equal(
    a.athrecs_linked_result_count,
    3,
    "Available source + canonical; DNF included, DNS excluded",
  );
  assert(!JSON.stringify(a).includes("private A"));

  const b = verifyToken(await loadIntercomIdentity(sql, "account-b", env, now));
  assert.equal(b.user_id, "account-b");
  assert.equal(b.email, "athlete-b@example.test");
  assert.equal(b.athrecs_linked_result_count, 1);
  assert.equal(b.athrecs_pending_claim_count, 2);
  assert.equal(
    b.athrecs_profile_status,
    "linked",
    "Pending requests never override a real active link",
  );

  const c = verifyToken(await loadIntercomIdentity(sql, "account-c", env, now));
  assert.equal(c.athrecs_profile_status, "no_linked_profile");
  assert.equal(c.athrecs_profile_id, "");
  assert.equal(c.athrecs_profile_url, "");
  assert.equal(c.athrecs_linked_result_count, 0);

  await db.exec("insert into result_claims values (4, 13, 'account-c', 'pending')");
  const pending = verifyToken(await loadIntercomIdentity(sql, "account-c", env, now));
  assert.equal(pending.athrecs_profile_status, "claim_pending");
  assert.equal(pending.athrecs_profile_id, "", "A pending request never becomes profile ownership");

  await db.exec("insert into athlete_account_links values (13, 'account-a', 'active')");
  const multiple = verifyToken(await loadIntercomIdentity(sql, "account-a", env, now));
  assert.equal(multiple.athrecs_profile_status, "multiple_linked");
  assert.equal(multiple.athrecs_linked_profile_count, 2);
  assert.equal(multiple.athrecs_profile_id, "", "No arbitrary primary profile");
  assert.equal(multiple.athrecs_profile_url, "", "Clear stale single-profile context");

  await db.exec("update athlete_account_links set status='revoked' where user_id='account-a'");
  const revoked = verifyToken(await loadIntercomIdentity(sql, "account-a", env, now));
  assert.equal(revoked.athrecs_profile_status, "no_linked_profile");
  assert.equal(revoked.athrecs_profile_id, "");
  assert.equal(revoked.athrecs_profile_url, "");
  assert.equal(revoked.athrecs_linked_result_count, 0);

  await assert.rejects(
    loadIntercomIdentity(sql, "unknown-account", env, now),
    /Signed-in account is unavailable/,
  );
  await assert.rejects(
    loadIntercomIdentity(sql, "account-a' OR 1=1 --", env, now),
    /Signed-in account is unavailable/,
  );
  console.log(
    "Intercom identity: signatures, expiry, attribute allowlist, account isolation, ownership states and disabled fallback passed.",
  );
} finally {
  globalThis.fetch = forbiddenFetch;
  await db.close();
}
