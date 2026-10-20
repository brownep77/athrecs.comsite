// Real auth + Vite server-function regression tests. Only synthetic accounts and
// a disposable, in-memory PGlite database; all external delivery is intercepted.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import * as helpers from "../src/lib/athrecs/member-onboarding.ts";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_INVITATION_RESEND_API_KEY",
  "ATHRECS_CLAIMS_EMAILS",
  "ATHRECS_SIGNUP_ALERT_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.ATHRECS_STAFF_EMAILS = "onboarding-staff@example.test";
process.env.BETTER_AUTH_SECRET = "synthetic-member-onboarding-secret-at-least-32-characters";
const origin = "http://127.0.0.1:18247";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;

let adverseCases = 0;
const metadata = {
  firstName: "Synthetic",
  lastName: "Athlete",
  roles: ["athlete"],
  organisation: "",
};

// Exercise Unicode names, unexpected runtime types, markup, invisible characters,
// duplicate privileges and oversized values before HTTP and database coverage.
const badMetadata = [
  null,
  { firstName: undefined, lastName: undefined },
  { firstName: "" },
  { lastName: "" },
  { firstName: "   " },
  { firstName: 123 },
  { lastName: {} },
  { firstName: "123" },
  { lastName: "--" },
  { firstName: "<script>" },
  { lastName: "Runner>" },
  { firstName: "Alex\n" },
  { firstName: "Alex\r" },
  { firstName: "Al\tEx" },
  { firstName: "A\u0000lex" },
  { firstName: "A\u200blex" },
  { lastName: "Run\u202ener" },
  { firstName: "😀" },
  { firstName: "A".repeat(61) },
  { lastName: "B".repeat(61) },
  { firstName: "A".repeat(70), lastName: "B".repeat(70) },
  { roles: [] },
  { roles: "athlete" },
  { roles: ["admin"] },
  { roles: ["staff"] },
  { roles: ["athlete", "athlete"] },
  { roles: [null] },
  { roles: ["Athlete"] },
  { roles: Array(8).fill("coach") },
  { organisation: [] },
  { organisation: "x".repeat(161) },
  { organisation: "<club>" },
  { organisation: "Club\u2066Name" },
  { organisation: "Club\nName" },
];
for (const value of badMetadata) {
  const input = value === null ? null : { ...metadata, ...value };
  assert.throws(
    () => helpers.validateMemberOnboardingInput(input),
    undefined,
    `Reject unsafe member metadata ${JSON.stringify(value)}`,
  );
  adverseCases++;
}
for (const [firstName, lastName] of [
  ["Élodie", "O’Connor"],
  ["张", "伟"],
  ["Łukasz", "Żółć"],
  ["A", "B"],
  ["Jean-Luc", "D'Arcy"],
  ["علي", "حسن"],
]) {
  assert.equal(
    helpers.validateMemberOnboardingInput({ ...metadata, firstName, lastName }).firstName,
    firstName,
  );
}
assert.equal(helpers.memberNamesMatch(" Élodie", "O’Connor ", "ÉLODIE O’CONNOR"), true);
assert.equal(helpers.memberNamesMatch("Synthetic", "Athlete", "Different Person"), false);
const badDestinations = [
  "https://evil.example",
  "//evil.example",
  "///evil.example",
  "javascript:alert(1)",
  "data:text/html,test",
  "\\evil.example",
  "/\\evil.example",
  "/%5cevil.example",
  "/%2f%2fevil.example",
  "/%252f%252fevil.example",
  "/%25252f%25252fevil.example",
  "/%2525252f%2525252fevil.example",
  "/%0aevil",
  "/%0devil",
  "/\u0000evil",
  "/%E0%A4%A",
  "/join",
  "/JOIN?next=/",
  "/api/auth/session",
  "/x/../join",
  "/x/../api/auth",
  "/%6aoin",
  "/%61pi/auth",
  "x".repeat(1501),
  12,
  null,
];
for (const value of badDestinations) {
  assert.equal(
    helpers.safeOnboardingReturnTo(value),
    undefined,
    `Reject unsafe redirect ${JSON.stringify(value)}`,
  );
  adverseCases++;
}
for (const value of [
  "/my-account",
  "/athlete-account?section=potential",
  "/races?country=United%20Kingdom",
  "/athletes/example#results",
]) {
  assert.equal(helpers.safeOnboardingReturnTo(value), value);
}
for (const path of [
  "/join",
  "/admin/athlete-accounts",
  "/api/auth/callback",
  "/claim-invitation/abc",
  "/result-claims",
  "/privacy",
  "/terms",
]) {
  assert.equal(
    helpers.shouldRequestOnboarding(path),
    false,
    `${path} does not interrupt a sensitive journey`,
  );
}
assert.equal(helpers.shouldRequestOnboarding("/races"), true);

const deliveries = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const value = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(value);
  if (url.href === "https://api.resend.com/emails") {
    deliveries.push({ headers: init?.headers, payload: JSON.parse(init?.body ?? "{}") });
    return Response.json({ id: `synthetic-onboarding-${deliveries.length}` });
  }
  assert.equal(url.origin, origin, `External network blocked: ${url.origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18247, strictPort: true } });
let database;
const modules = new Map();
async function rpc(file, name, data, token, headers = {}) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file);
  const start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} real RPC exists`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method, `${name} client RPC metadata exists`);
  const result = await runWithStartContext({ startOptions: {} }, () =>
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
  if (result.error) throw result.error;
  return result.result;
}
const call = (name, data, token, headers) =>
  rpc("athrecs/member-onboarding-api", name, data, token, headers);
const getAccount = (token) =>
  rpc("athrecs/athlete-account-api", "getMyAthleteAccount", undefined, token);
const saveAccount = (data, token) =>
  rpc("athrecs/athlete-account-api", "saveMyAthleteAccount", data, token);
const sport = {
  sportCode: "Running",
  isPrimary: true,
  experienceLevel: "recreational",
  disciplines: [],
  preferredDistances: [],
  preferredSurfaces: [],
  trainingSessionsPerWeek: null,
  trainingHoursPerWeek: null,
  weeklyDistanceKm: null,
  eventsPerYear: null,
  goals: "",
  coachName: "",
};
const baseAccount = (name) => ({
  fullName: name,
  country: "United Kingdom",
  nationality: "British",
  dateOfBirth: "1985-05-20",
  postcode: "ZZ1 1ZZ",
  privacyAcknowledged: true,
  sports: [{ ...sport }],
  preferences: {},
  consents: {
    performanceInsights: false,
    personalisation: false,
    productResearch: false,
    marketing: false,
  },
});

try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  assert.equal(db.dbSource, "pglite", "Refuse any configured external database");
  database = await db.getPglite();
  const sql = await db.getSql();
  const signup = async (label, verified = true) => {
    const response = await fetch(`${origin}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify({
        name: `Synthetic ${label}`,
        email: `onboarding-${label.toLowerCase()}@example.test`,
        password: "Synthetic-password-123!",
      }),
    });
    const result = await response.json();
    assert.equal(response.status, 200, `Synthetic ${label} signup: ${JSON.stringify(result)}`);
    if (verified) await sql`update "user" set "emailVerified"=true where id=${result.user.id}`;
    return {
      id: result.user.id,
      token: result.token,
      name: `Synthetic ${label}`,
      firstName: "Synthetic",
      lastName: label,
    };
  };
  const accounts = {};
  for (const [role, label] of [
    ["athlete", "Athlete"],
    ["coach", "Coach"],
    ["club", "Club"],
    ["organiser", "Organiser"],
    ["timing", "Timer"],
    ["supporter", "Supporter"],
    ["staff_request", "Requester"],
  ])
    accounts[role] = await signup(label);
  const unverified = await signup("Unverified", false);
  const staff = await signup("Staff");
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('onboarding-staff-google','onboarding-staff-google','google',${staff.id},now(),now())`;
  assert.equal(Object.keys(accounts).length + 2, 9, "Nine synthetic test accounts");
  const athlete = accounts.athlete;
  const metaFor = (account, roles) => ({
    firstName: account.firstName,
    lastName: account.lastName,
    roles,
    organisation: "Synthetic Test Organisation",
  });

  for (const name of ["getMyOnboarding", "completeMyOnboarding", "listStaffMemberRoles"]) {
    await assert.rejects(
      () => call(name, name === "completeMyOnboarding" ? metadata : {}, ""),
      /Unauthorized|Forbidden/,
    );
  }
  await assert.rejects(
    () =>
      call("completeMyOnboarding", metadata, athlete.token, {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () =>
      call("completeMyOnboarding", metadata, unverified.token),
    /[Vv]erif|[Pp]rofile|[Ss]ave/,
  );
  await assert.rejects(
    () => saveAccount(baseAccount(unverified.name), unverified.token),
    /[Vv]erif/,
  );
  assert.equal(await call("getMyOnboarding", undefined, athlete.token), null);
  await assert.rejects(
    () => call("completeMyOnboarding", metaFor(athlete, ["athlete"]), athlete.token),
    /[Pp]rofile|[Ss]ave|[Cc]omplete/,
  );

  const mailCount = deliveries.length;
  // A known-race hint is athlete supplied only: saving it must not manufacture a
  // catalogue athlete, ownership link, verified performance or claim invitation.
  const [before] =
    await sql`select (select count(*)::int from athletes) as athletes,(select count(*)::int from results) as results,(select count(*)::int from result_claims) as claims,(select count(*)::int from athlete_account_links) as links,(select count(*)::int from athlete_claim_invitations) as invites,(select count(*)::int from signup_welcome_deliveries) as welcomes`;
  const saved = await saveAccount(
    {
      ...baseAccount(athlete.name),
      fingerprintEvent: "Synthetic Test Race",
      fingerprintYear: "2025",
      fingerprintDistance: "10K",
      fingerprintTime: "45:00",
      previousNames: ["Synthetic Former"],
      parkrunId: "A0000000",
      preferences: {
        equipmentBrands: ["Synthetic Trainer"],
        clothingBrands: ["Synthetic Clothing"],
        nutritionBrands: ["Synthetic Nutrition"],
      },
    },
    athlete.token,
  );
  assert.equal(saved.fullName, athlete.name);
  assert.deepEqual(saved.preferences.equipmentBrands, ["Synthetic Trainer"]);
  const completed = await call(
    "completeMyOnboarding",
    metaFor(athlete, ["athlete"]),
    athlete.token,
  );
  assert.deepEqual(completed, metaFor(athlete, ["athlete"]));
  assert.deepEqual(completed.roles, ["athlete"]);
  assert.equal((await call("getMyOnboarding", undefined, athlete.token)).firstName, "Synthetic");
  await assert.rejects(() =>
    call(
      "completeMyOnboarding",
      {
        ...metaFor(athlete, ["athlete"]),
        userId: accounts.coach.id,
        staffApproved: true,
        isStaff: true,
      },
      athlete.token,
    ),
  );
  assert.equal(
    await call("getMyOnboarding", undefined, accounts.coach.token),
    null,
    "Forged userId cannot write another account",
  );
  const reread = await getAccount(athlete.token);
  assert.deepEqual(reread.claimedProfiles, []);
  assert.deepEqual(reread.claimedResults, []);
  assert.equal(reread.claimCount, 0);
  assert.equal(reread.consents.marketing, false);

  // Each role uses its existing verified account; roles can be combined without
  // creating additional accounts or granting organisation or staff authority.
  for (const [role, account] of Object.entries(accounts)) {
    if (role === "athlete") continue;
    await saveAccount(
      { ...baseAccount(account.name), dateOfBirth: "", nationality: "", postcode: "", sports: [] },
      account.token,
    );
    const result = await call("completeMyOnboarding", metaFor(account, [role]), account.token);
    assert.deepEqual(
      result,
      metaFor(account, [role]),
      `${role} completes without athlete-only fields`,
    );
    assert.deepEqual(result.roles, [role]);
  }
  const multi = await call(
    "completeMyOnboarding",
    metaFor(athlete, ["athlete", "coach", "club"]),
    athlete.token,
  );
  assert.deepEqual(multi.roles, ["athlete", "coach", "club"]);
  for (let n = 0; n < 3; n++)
    await call(
      "completeMyOnboarding",
      metaFor(athlete, ["athlete", "coach", "club"]),
      athlete.token,
    );
  assert.equal(
    (await sql`select count(*)::int as n from member_onboarding where user_id=${athlete.id}`)[0].n,
    1,
  );
  assert.equal(
    (
      await sql`select count(*)::int as n from athlete_private_profiles where user_id=${athlete.id}`
    )[0].n,
    1,
  );

  for (const input of badMetadata) {
    await assert.rejects(() =>
      call(
        "completeMyOnboarding",
        input === null ? null : { ...metaFor(athlete, ["athlete"]), ...input },
        athlete.token,
      ),
    );
  }
  await assert.rejects(
    () =>
      call(
        "completeMyOnboarding",
        { ...metaFor(athlete, ["athlete"]), lastName: "SomeoneElse" },
        athlete.token,
      ),
    /[Nn]ame|[Mm]atch|[Pp]rofile/,
  );
  assert.equal(
    (await call("getMyOnboarding", undefined, athlete.token)).lastName,
    "Athlete",
    "Rejected mutations leave valid metadata intact",
  );

  // A historical completion flag does not hide a subsequently incomplete profile.
  const incomplete = [
    ["country", ""],
    ["date_of_birth", null],
    ["nationality", ""],
    ["postcode", ""],
    ["full_name", "Other Person"],
    ["privacy_acknowledged_at", null],
  ];
  // Privacy acknowledgement is NOT NULL in the schema, so cover that condition
  // through its public save validator rather than weakening a database constraint.
  for (const [column, value] of incomplete) {
    if (column === "privacy_acknowledged_at") {
      await assert.rejects(() =>
        saveAccount({ ...baseAccount(athlete.name), privacyAcknowledged: false }, athlete.token),
      );
      adverseCases++;
      continue;
    }
    const [old] = await sql.query(
      `select ${column}::text as value from athlete_private_profiles where user_id=$1`,
      [athlete.id],
    );
    await sql.query(`update athlete_private_profiles set ${column}=$1 where user_id=$2`, [
      value,
      athlete.id,
    ]);
    assert.equal(
      await call("getMyOnboarding", undefined, athlete.token),
      null,
      `Missing ${column} reopens onboarding`,
    );
    await assert.rejects(() =>
      call("completeMyOnboarding", metaFor(athlete, ["athlete"]), athlete.token),
    );
    await sql.query(`update athlete_private_profiles set ${column}=$1 where user_id=$2`, [
      old.value,
      athlete.id,
    ]);
    adverseCases++;
  }
  await sql`update athlete_sport_profiles set is_primary=false where user_id=${athlete.id}`;
  assert.equal(await call("getMyOnboarding", undefined, athlete.token), null);
  await assert.rejects(() =>
    call("completeMyOnboarding", metaFor(athlete, ["athlete"]), athlete.token),
  );
  await sql`update athlete_sport_profiles set is_primary=true where user_id=${athlete.id}`;
  adverseCases++;
  await sql`update "user" set "emailVerified"=false where id=${athlete.id}`;
  assert.equal(await call("getMyOnboarding", undefined, athlete.token), null);
  await assert.rejects(() =>
    call("completeMyOnboarding", metaFor(athlete, ["athlete"]), athlete.token),
  );
  await sql`update "user" set "emailVerified"=true where id=${athlete.id}`;
  adverseCases++;

  // Fine-grained optimistic locking prevents stale tabs from silently restoring
  // consent or overwriting newer preferences, including simultaneous submissions.
  let current = await getAccount(athlete.token);
  current = await saveAccount(
    {
      ...current,
      expectedUpdatedAt: current.updatedAt,
      consents: { ...current.consents, marketing: true },
    },
    athlete.token,
  );
  const stale = structuredClone(current);
  current = await saveAccount(
    {
      ...current,
      expectedUpdatedAt: current.updatedAt,
      city: "Synthetic New City",
      consents: { ...current.consents, marketing: false },
    },
    athlete.token,
  );
  await assert.rejects(
    () => saveAccount({ ...stale, expectedUpdatedAt: stale.updatedAt }, athlete.token),
    /[Cc]hang|[Uu]pdat|[Ss]tale|[Rr]eload/,
  );
  assert.equal(
    (await getAccount(athlete.token)).consents.marketing,
    false,
    "Stale tab cannot regrant withdrawn consent",
  );
  assert.equal((await getAccount(athlete.token)).city, "Synthetic New City");
  const races = await Promise.allSettled([
    saveAccount(
      { ...current, expectedUpdatedAt: current.updatedAt, city: "Synthetic Concurrent A" },
      athlete.token,
    ),
    saveAccount(
      { ...current, expectedUpdatedAt: current.updatedAt, city: "Synthetic Concurrent B" },
      athlete.token,
    ),
  ]);
  assert.equal(
    races.filter((result) => result.status === "fulfilled").length,
    1,
    "Exactly one concurrent save succeeds",
  );
  assert.equal(
    races.filter((result) => result.status === "rejected").length,
    1,
    "The stale concurrent save is rejected",
  );
  assert.equal(
    (await getAccount(accounts.coach.token)).city,
    "",
    "Another account remains isolated",
  );

  const requester = accounts.staff_request;
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('onboarding-requester-google','onboarding-requester-google','google',${requester.id},now(),now())`;
  for (const account of Object.values(accounts))
    await assert.rejects(() => call("listStaffMemberRoles", {}, account.token), /Forbidden/);
  await assert.rejects(
    () => call("listStaffMemberRoles", {}, staff.token, { "x-forwarded-host": "www.athrecs.com" }),
    /staff host required/,
  );
  await assert.rejects(
    () =>
      call("listStaffMemberRoles", {}, staff.token, {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  const staffRows = await call("listStaffMemberRoles", {}, staff.token);
  const serialised = JSON.stringify(staffRows);
  assert(
    serialised.includes("staff_request"),
    "Authorised staff can review pending self-declared roles",
  );
  assert(serialised.includes(requester.id), "Staff can see the request for the correct account");
  const [after] =
    await sql`select (select count(*)::int from athletes) as athletes,(select count(*)::int from results) as results,(select count(*)::int from result_claims) as claims,(select count(*)::int from athlete_account_links) as links,(select count(*)::int from athlete_claim_invitations) as invites,(select count(*)::int from signup_welcome_deliveries) as welcomes`;
  assert.deepEqual(
    after,
    before,
    "Onboarding does not create source athletes/results, claims, ownership links, invitations or welcome jobs",
  );
  assert.equal(
    deliveries.length,
    mailCount,
    "Saving and repeating onboarding never dispatches duplicate welcomes",
  );
  assert.equal(
    (
      await sql`select count(*)::int as n from "user" where email like 'onboarding-%@example.test'`
    )[0].n,
    9,
  );
  assert(adverseCases >= 60);
  console.log(
    `PASS: 9 synthetic accounts, all 7 roles, ${adverseCases} adverse metadata/redirect/incomplete-profile cases, actual auth and RPC, repeat submissions, profile isolation, no invented identity links/results, staff-request protection, precise stale-write/concurrency protection and consent preservation. Disposable PGlite; external network blocked; no real emails.`,
  );
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
