// Disposable integration-test fixtures only. No production credentials or external identity calls.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { signupDetails } from "./signup-details.mjs";

export async function createSyntheticVerifiedSession(origin, sql, email, name) {
  assert.equal(new URL(origin).hostname, "127.0.0.1");
  assert(email.endsWith("@example.test"), "Only reserved synthetic email addresses are permitted");
  for (const key of [
    "DATABASE_URL",
    "DATABASE_URL_UNPOOLED",
    "POSTGRES_URL",
    "POSTGRES_URL_NON_POOLING",
  ])
    assert.equal(process.env[key] ?? "", "", "Never use application database credentials");
  const password = "Synthetic-fixture-password-123!";
  const post = (path, data) =>
    fetch(`${origin}/api/auth/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin, "sec-fetch-site": "same-origin" },
      body: JSON.stringify(data),
    });
  const registered = await post("sign-up/email", { ...signupDetails(name), email, password });
  assert.equal(registered.status, 200, await registered.clone().text());
  const { user } = await registered.json();
  // This fixture starts after mailbox verification; the sign-in itself uses the real auth endpoint.
  await sql`update "user" set "emailVerified"=true where id=${user.id}`;
  const signedIn = await post("sign-in/email", { email, password });
  assert.equal(signedIn.status, 200, await signedIn.clone().text());
  const session = await signedIn.json();
  assert(session.token && session.user.id === user.id);
  return session;
}

export async function createSyntheticStaffSession(origin, sql, email) {
  assert((process.env.ATHRECS_STAFF_EMAILS ?? "").split(",").includes(email));
  const session = await createSyntheticVerifiedSession(
    origin,
    sql,
    email,
    "Independent Test Reviewer",
  );
  // External Google authentication is outside these suites. Represent its completed identity
  // result in the disposable database; the real staff middleware still checks host, session,
  // allowlist and provider. The reviewer is a different account from every athlete claimant.
  await sql`insert into "account"(id,"accountId","providerId","userId","createdAt","updatedAt")
    values(${randomUUID()},${`synthetic-google-${session.user.id}`},'google',${session.user.id},now(),now())`;
  return session;
}

export function createAthleteRpc(origin, defaultToken) {
  const modules = new Map();
  return async (file, name, data, token = defaultToken) => {
    if (!modules.has(file)) {
      const response = await fetch(`${origin}/src/lib/athrecs/${file}.ts`);
      assert.equal(response.status, 200);
      modules.set(file, await response.text());
    }
    const source = modules.get(file);
    const start = source.indexOf(`const ${name} =`);
    assert(start >= 0, `${name} must use the real RPC transport`);
    const section = source.slice(start, source.indexOf(";", start));
    const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
    const method = section.match(/method: "(GET|POST)"/)?.[1];
    assert(id && method);
    const response = await runWithStartContext({ startOptions: {} }, () =>
      createClientRpc(id)({
        method,
        data,
        headers: { origin, "sec-fetch-site": "same-origin", authorization: `Bearer ${token}` },
        context: {},
      }),
    );
    if (response.error) throw response.error;
    return response.result;
  };
}

export async function approveSyntheticClaim(rpc, claimId, reviewerId, sql) {
  const staffNote =
    "Synthetic independent club-officer confirmation checked for this test athlete.";
  const result = await rpc("result-claims-api", "reviewResultClaim", {
    claimId,
    action: "approve",
    staffNote,
  });
  assert.equal(result.status, "approved");
  const [claim] =
    await sql`select athlete_id,claimant_user_id,confirmation_method,reviewed_by_user_id,reviewed_at,staff_note
    from result_claims where id=${claimId}`;
  assert.notEqual(claim.claimant_user_id, reviewerId);
  assert.equal(claim.confirmation_method, "staff");
  assert.equal(claim.reviewed_by_user_id, reviewerId);
  assert(claim.reviewed_at);
  assert.equal(claim.staff_note, staffNote);
  assert.equal(
    (
      await sql`select athlete_management_reviewed(${claim.athlete_id},${claim.claimant_user_id}) as reviewed`
    )[0].reviewed,
    true,
    "A real independent staff approval grants reviewed ownership",
  );
}
