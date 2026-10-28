// Real framework RPC, authentication, migrations and SQL in a disposable database.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.ATHRECS_STAFF_EMAILS = "race-edits-staff@example.test";
const origin = "http://127.0.0.1:18217";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18217, strictPort: true } });
let database;
let source;
async function rpc(name, data, headers = {}) {
  source ??= await (await fetch(`${origin}/src/lib/athrecs/race-edit-suggestions-api.ts`)).text();
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
      headers: { origin, "sec-fetch-site": "same-origin", ...headers },
      context: {},
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  await sql`insert into events (slug,name,sport,country,county,city,area,surface,summary,description,organiser,website)
    values ('synthetic-race-edit','Synthetic race edit','Running','England','Norfolk','Norwich','','Road','','','Synthetic AC','https://example.test/race')`;
  for (const role of ["owner", "other", "staff"]) {
    const id = `race-edits-${role}`;
    await sql`insert into "user" (id,name,email,"emailVerified") values (${id},${id},${`${id}@example.test`},true)`;
    await sql`insert into "session" (id,token,"expiresAt","updatedAt","userId") values (${id},${id},now()+interval '1 hour',now(),${id})`;
  }
  await sql`insert into "account" (id,"accountId","providerId","userId","updatedAt") values ('race-edits-google','race-edits-staff','google','race-edits-staff',now())`;
  const owner = { authorization: "Bearer race-edits-owner" },
    other = { authorization: "Bearer race-edits-other" },
    staff = { authorization: "Bearer race-edits-staff" };
  const [race] =
    await sql`select id,slug,name from events where sport='Running' order by id limit 1`;
  const suggestion = {
    slug: race.slug,
    suggestion: "Please check the start location for the next half marathon.",
    evidenceUrl: "https://example.test/race-instructions",
  };
  await assert.rejects(() => rpc("submitRaceEdit", suggestion));
  await assert.rejects(() =>
    rpc("submitRaceEdit", { ...suggestion, slug: "missing-race-edit-fixture" }, owner),
  );
  for (const changes of [
    { suggestion: "short" },
    { suggestion: " ".repeat(50) },
    { suggestion: "x".repeat(2001) },
    { evidenceUrl: "javascript:alert(1)" },
    { evidenceUrl: "https://user:secret@example.test" },
    { slug: "../private" },
  ])
    await assert.rejects(() => rpc("submitRaceEdit", { ...suggestion, ...changes }, owner));
  await assert.rejects(() =>
    rpc("submitRaceEdit", suggestion, {
      ...owner,
      origin: "https://unrelated.example",
      "sec-fetch-site": "cross-site",
    }),
  );
  const before = (await sql`select row_to_json(events) as data from events where id=${race.id}`)[0]
    .data;
  const submitted = await rpc("submitRaceEdit", suggestion, owner);
  assert(submitted.id);
  const queued =
    await sql`select * from race_edit_alert_deliveries where suggestion_id=${submitted.id} order by recipient`;
  assert.deepEqual(
    queued.map((row) => row.recipient),
    ["paul@athrecs.com", "paultwbrowne@gmail.com"],
  );
  assert(
    queued.every((row) => row.attempts === 0 && !row.sent_at),
    "Local submissions queue without sending",
  );
  assert.equal(queued[0].submission.email, "race-edits-owner@example.test");
  await assert.rejects(() => rpc("getRaceEdits", {}, owner));
  await assert.rejects(() => rpc("getRaceEdits", {}));
  const queue = await rpc("getRaceEdits", {}, staff);
  const item = queue.items.find((row) => row.id === submitted.id);
  assert.equal(item.suggestion, suggestion.suggestion);
  assert.equal(item.race_name, race.name);
  assert(!("user_id" in item));
  await assert.rejects(() =>
    rpc("reviewRaceEdit", { id: submitted.id, status: "reviewed" }, owner),
  );
  await assert.rejects(() =>
    rpc("reviewRaceEdit", { id: submitted.id, status: "published" }, staff),
  );
  await rpc("reviewRaceEdit", { id: submitted.id, status: "reviewed" }, staff);
  await assert.rejects(() =>
    rpc("reviewRaceEdit", { id: submitted.id, status: "dismissed" }, staff),
  );
  assert(!(await rpc("getRaceEdits", {}, staff)).items.some((row) => row.id === submitted.id));
  const [reviewed] =
    await sql`select status,reviewed_at,reviewed_by from race_edit_suggestions where id=${submitted.id}`;
  assert.equal(reviewed.status, "reviewed");
  assert(reviewed.reviewed_at);
  assert.equal(reviewed.reviewed_by, "race-edits-staff");
  const dismiss = await rpc("submitRaceEdit", { ...suggestion, evidenceUrl: "" }, owner);
  await rpc("reviewRaceEdit", { id: dismiss.id, status: "dismissed" }, staff);
  const { ROAD_MARATHONS } = await server.ssrLoadModule("/src/data/road-marathons/index.ts");
  const { ROAD_ULTRAS } = await server.ssrLoadModule("/src/lib/running/road-ultras.ts");
  for (const [pageType, guide, prefix] of [
    ["road", ROAD_MARATHONS[0], "/running/races/"],
    ["ultra", ROAD_ULTRAS[0], "/running/ultramarathons/"],
  ]) {
    await assert.rejects(() =>
      rpc("submitRaceEdit", { ...suggestion, pageType, slug: "missing-editorial-race" }, owner),
    );
    const edit = await rpc("submitRaceEdit", { ...suggestion, pageType, slug: guide.slug }, owner);
    const record = (await rpc("getRaceEdits", {}, staff)).items.find((item) => item.id === edit.id);
    assert.equal(record.event_id, null);
    assert.equal(record.race_name, guide.name);
    assert.equal(record.race_path, `${prefix}${guide.slug}`);
    await rpc("reviewRaceEdit", { id: edit.id, status: "reviewed" }, staff);
  }
  const concurrent = await Promise.allSettled(
    Array.from({ length: 7 }, () => rpc("submitRaceEdit", suggestion, other)),
  );
  assert.equal(
    concurrent.filter((result) => result.status === "fulfilled").length,
    5,
    "Atomic hourly limit",
  );
  assert.equal(concurrent.filter((result) => result.status === "rejected").length, 2);
  assert.equal(
    (await sql`select count(*)::int n from race_edit_alert_deliveries`)[0].n,
    18,
    "Only nine accepted suggestions queue alerts; reviews and rejected submissions do not",
  );
  assert.deepEqual(
    (await sql`select row_to_json(events) as data from events where id=${race.id}`)[0].data,
    before,
    "Suggestions and reviews never change catalogue records",
  );
  // Staff pagination must not strand later suggestions behind the first 50.
  await sql`insert into race_edit_suggestions (user_id,event_id,race_slug,race_name,suggestion)
    select 'race-edits-owner',${race.id},${race.slug},${race.name},'Synthetic pagination suggestion' from generate_series(1,51)`;
  const first = await rpc("getRaceEdits", { page: 0 }, staff),
    second = await rpc("getRaceEdits", { page: 1 }, staff);
  assert.equal(first.total, 56);
  assert.equal(first.items.length, 50);
  assert.equal(second.items.length, 6);
  assert(!second.items.some((item) => first.items.some((other) => item.id === other.id)));

  // Real delivery/reservation SQL with an intercepted provider: no real email is sent.
  const { deliverRaceEditAlerts, notifyRaceEdit } = await server.ssrLoadModule(
    "/src/lib/athrecs/race-edit-alerts.server.ts",
  );
  await notifyRaceEdit(submitted.id);
  assert(
    (
      await sql`select attempts from race_edit_alert_deliveries where suggestion_id=${submitted.id}`
    ).every((row) => row.attempts === 0),
  );
  const sends = [];
  let failRecipient = "paultwbrowne@gmail.com";
  const send = async (email, key) => {
    sends.push({ email, key });
    if (email.to.includes(failRecipient)) throw Error("Synthetic provider outage");
    return `synthetic-${sends.length}`;
  };
  assert.deepEqual(await deliverRaceEditAlerts(sql, submitted.id, send), { sent: 1, failed: 1 });
  const firstSends = structuredClone(sends);
  assert(
    firstSends.every(({ email }) => email.from === "paul@athrecs.com" && email.to.length === 1),
  );
  assert(
    firstSends.every(
      ({ email }) =>
        email.subject.startsWith("AthRecs fixture correction — ") &&
        email.text.includes(suggestion.suggestion) &&
        email.text.includes(suggestion.evidenceUrl) &&
        email.text.includes("race-edits-owner@example.test") &&
        email.text.includes("/admin/event-register"),
    ),
  );
  assert.deepEqual(await deliverRaceEditAlerts(sql, submitted.id, send), { sent: 0, failed: 0 });
  await sql`update "user" set name='Changed after submission' where id='race-edits-owner'`;
  await sql`update race_edit_suggestions set suggestion='Changed after notification' where id=${submitted.id}`;
  await sql`update race_edit_alert_deliveries set next_attempt_at=now() where suggestion_id=${submitted.id} and sent_at is null`;
  failRecipient = "";
  await Promise.all([
    deliverRaceEditAlerts(sql, submitted.id, send),
    deliverRaceEditAlerts(sql, submitted.id, send),
  ]);
  assert.equal(sends.length, 3, "Concurrent workers only retry the failed recipient");
  assert.deepEqual(
    sends[2],
    firstSends.find(({ email }) => email.to.includes("paultwbrowne@gmail.com")),
    "Retry keeps the same payload and idempotency key",
  );
  assert.equal(
    (
      await sql`select count(*)::int n from athlete_messages where contact in ('paul@athrecs.com','paultwbrowne@gmail.com')`
    )[0].n,
    0,
    "Internal alerts do not enter athlete conversations",
  );
  const beforeRollback = (await sql`select count(*)::int n from race_edit_alert_deliveries`)[0].n;
  await assert.rejects(() =>
    sql.transaction(async (tx) => {
      await tx`insert into race_edit_suggestions(user_id,event_id,race_slug,race_name,suggestion)
      values('race-edits-owner',${race.id},${race.slug},${race.name},'Rolled back suggestion')`;
      throw Error("rollback");
    }),
  );
  assert.equal(
    (await sql`select count(*)::int n from race_edit_alert_deliveries`)[0].n,
    beforeRollback,
  );
  await sql`update race_edit_alert_deliveries set first_attempt_at=now()-interval '24 hours',next_attempt_at=now() where suggestion_id=${dismiss.id}`;
  assert.deepEqual(await deliverRaceEditAlerts(sql, dismiss.id, send), { sent: 0, failed: 0 });
  assert.equal(
    (
      await sql`select count(*)::int n from race_edit_alert_deliveries where suggestion_id=${dismiss.id} and needs_review`
    )[0].n,
    2,
    "Ambiguous deliveries stop before provider idempotency expires",
  );
  await sql`insert into athletes(id,slug,display_name,profile_visibility) values(992463,'synthetic-alert-test','Synthetic alert test','private')`;
  await sql`insert into athrecs_test_athletes(athlete_id,user_id,email) values(992463,'race-edits-other','race-edits-other@example.test')`;
  const [testEdit] =
    await sql`insert into race_edit_suggestions(user_id,event_id,race_slug,race_name,suggestion,race_path)
    values('race-edits-other',${race.id},${race.slug},${race.name},'<script>synthetic content</script>',${`/races/${race.slug}`}) returning id`;
  const testRows =
    await sql`select * from race_edit_alert_deliveries where suggestion_id=${testEdit.id}`;
  assert.deepEqual(
    testRows.map((row) => row.recipient),
    ["paul@athrecs.com"],
    "Fictional test isolation",
  );
  await deliverRaceEditAlerts(sql, testEdit.id, send);
  assert(sends.at(-1).email.subject.startsWith("[FICTIONAL TEST]"));
  assert(!sends.at(-1).email.html.includes("<script>"));
  console.log(
    "PASS: real race suggestion RPC, authentication, validation, rate limits, staff review and pagination; atomic two-recipient alerts, rollback, independent retries, concurrency, frozen idempotency payload, expiry review, safe HTML and fictional-test isolation. No real emails sent.",
  );
} finally {
  await server.close();
  await database?.close();
}
