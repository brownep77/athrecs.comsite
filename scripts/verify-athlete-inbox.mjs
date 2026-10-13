// Disposable DB and synthetic mailbox. No real mailbox or email delivery is used.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.ATHRECS_STAFF_EMAILS = "inbox-staff@example.test";
process.env.ATHRECS_INBOX_ENCRYPTION_KEY = randomBytes(32).toString("hex");
const origin = "http://127.0.0.1:18253";
process.env.TSS_SERVER_FN_BASE = origin + "/_serverFn/";
const server = await createServer({ server: { host: "127.0.0.1", port: 18253, strictPort: true } });
let db;
const cache = new Map();
async function rpc(name, data, token = "staff", headers = {}) {
  const file = "athlete-inbox-api";
  if (!cache.has(file))
    cache.set(file, await (await fetch(`${origin}/src/lib/athrecs/${file}.ts`)).text());
  const source = cache.get(file),
    start = source.indexOf(`const ${name} =`),
    part = source.slice(start, source.indexOf(";", start));
  const id = part.match(/createClientRpc\("([^"]+)"\)/)?.[1],
    method = part.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const response = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      context: {},
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer inbox-${token}` } : {}),
        ...headers,
      },
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
try {
  await server.listen();
  const database = await server.ssrLoadModule("/src/lib/db.ts");
  db = await database.getPglite();
  const sql = await database.getSql();
  const svc = await server.ssrLoadModule("/src/lib/athrecs/athlete-inbox.server.ts");
  const crypt = await server.ssrLoadModule("/src/lib/athrecs/athlete-inbox-crypto.server.ts");
  const imap = await server.ssrLoadModule("/src/lib/athrecs/athlete-inbox-imap.server.ts");
  await sql`insert into "user"(id,name,email,"emailVerified") values('mailbox-owner','Synthetic Owner','paul@athrecs.com',true)`;
  assert.equal(
    await svc.matchInboxSender(sql, "paul@athrecs.com"),
    null,
    "Internal messages to our own mailbox must not become athlete replies",
  );
  for (const id of ["staff", "athlete", "other", "unverified"]) {
    await sql`insert into "user"(id,name,email,"emailVerified") values(${id},'Synthetic Athlete',${`inbox-${id}@example.test`},${id !== "unverified"})`;
    await sql`insert into "session"(id,token,"expiresAt","updatedAt","userId") values(${id},${`inbox-${id}`},now()+interval '1 hour',now(),${id})`;
  }
  await sql`insert into account(id,"accountId","providerId","userId","updatedAt") values('inbox-staff-google','staff','google','staff',now())`;
  for (const token of ["", "athlete"])
    for (const [name, data] of [
      ["getAthleteInboxStatus"],
      ["connectStaffAthleteInbox", { password: "synthetic-secret", includeRecent: true }],
      ["syncStaffAthleteInbox"],
      ["disconnectStaffAthleteInbox"],
    ])
      await assert.rejects(() => rpc(name, data, token), /Unauthorized|Forbidden/);
  for (const headers of [
    { "x-forwarded-host": "www.athrecs.com" },
    { origin: "https://untrusted.example", "sec-fetch-site": "cross-site" },
  ])
    await assert.rejects(
      () =>
        rpc(
          "connectStaffAthleteInbox",
          { password: "synthetic-secret", includeRecent: true },
          "staff",
          headers,
        ),
      /Forbidden|Cross|staff host/,
    );
  assert.equal((await rpc("getAthleteInboxStatus")).connected, false);
  assert.equal((await rpc("syncStaffAthleteInbox")).skipped, "not-connected-or-busy");
  const encrypted = crypt.encryptInboxPassword("synthetic-secret");
  assert(!encrypted.includes("synthetic-secret"));
  assert.equal(crypt.decryptInboxPassword(encrypted), "synthetic-secret");
  assert.throws(() => crypt.decryptInboxPassword(encrypted.slice(0, -4) + "aaaa"));
  const message = (uid, sender, extra = {}) => ({
    uid,
    sender,
    subject: "Re: My race results",
    messageId: `<test-${uid}@example.test>`,
    receivedAt: "2026-10-13T01:00:00Z",
    size: 200,
    ...extra,
  });
  let messages = [
    message(1, "inbox-athlete@example.test"),
    message(2, "unknown@example.test"),
    message(3, "inbox-unverified@example.test"),
  ];
  let failBody = false,
    closed = 0,
    bodyReads = [];
  const open = async (password) => {
    assert.equal(password, "synthetic-secret");
    return {
      uidValidity: "123",
      uidNext: messages.length + 1,
      recentStart: async () => 0,
      headers: async (after) => messages.filter((m) => m.uid > after),
      body: async (m) => {
        bodyReads.push(m.uid);
        if (failBody) throw Error("synthetic failure");
        return "Thanks Paul. My result: https://example.test/results?id=123\nYour one-time code: 123456\nhttps://athrecs.com/claim?token=private\nhttps://www.athrecs.com/claim-results?resultId=12&invitation=private\n<script>not executed</script>";
      },
      close: async () => {
        closed++;
      },
    };
  };
  await svc.connectAthleteInbox(
    sql,
    { password: "synthetic-secret", includeRecent: true },
    "staff",
    open,
  );
  const stored = (await sql`select password_ciphertext from athlete_inbox_connection`)[0]
    .password_ciphertext;
  assert(!stored.includes("synthetic-secret"));
  const status = await rpc("getAthleteInboxStatus");
  assert.equal(status.connected, true);
  assert(!JSON.stringify(status).includes(stored));
  assert(!JSON.stringify(status).includes("synthetic-secret"));
  await sql`insert into athlete_messages(id,user_id,direction,channel,subject,body,contact,status,source) values('unverified-otp','unverified','sent','email','OTP','redacted','inbox-unverified@example.test','accepted','site')`;
  assert.equal(
    await svc.matchInboxSender(sql, "inbox-unverified@example.test"),
    null,
    "An OTP to an unverified account is not a conversation binding",
  );
  assert.equal((await svc.syncAthleteInbox(sql, open)).imported, 1);
  assert.deepEqual(bodyReads, [1], "Unrelated and unverified sender bodies must not be downloaded");
  assert.equal((await svc.syncAthleteInbox(sql, open)).imported, 0);
  const [received] = await sql`select * from athlete_messages where source='inbox'`;
  assert.equal(received.user_id, "athlete");
  assert.equal(received.direction, "received");
  assert.equal(received.status, "received");
  assert(received.body.includes("https://example.test/results?id=123"));
  assert(!received.body.includes("123456"));
  assert(!received.body.includes("token=private"));
  assert(!received.body.includes("invitation=private"));
  assert(received.body.includes("<script>not executed</script>"), "Stored as plain text");
  await svc.connectAthleteInbox(
    sql,
    { password: "synthetic-secret", includeRecent: true },
    "staff",
    open,
  );
  assert.equal(
    (await svc.syncAthleteInbox(sql, open)).imported,
    0,
    "Reconnection/backfill does not duplicate receipts",
  );
  const [a] =
    await sql`insert into athletes(slug,display_name) values('inbox-source-a','Synthetic Athlete') returning id`;
  const [b] =
    await sql`insert into athletes(slug,display_name) values('inbox-source-b','Synthetic Athlete') returning id`;
  for (const id of [a.id, b.id])
    await sql`insert into athlete_messages(id,athlete_id,direction,channel,subject,body,contact,status,source) values(${`sent-${id}`},${id},'sent','email','Hello','Synthetic invitation','shared@example.test','accepted','site')`;
  assert.equal(await svc.matchInboxSender(sql, "shared@example.test"), "ambiguous");
  messages.push(message(4, "shared@example.test"));
  assert.equal((await svc.syncAthleteInbox(sql, open)).ambiguous, 1);
  assert(!bodyReads.includes(4));
  for (const id of [a.id, b.id])
    await sql`insert into athlete_account_links(athlete_id,user_id,user_email) values(${id},'athlete','inbox-athlete@example.test')`;
  assert.deepEqual(
    await svc.matchInboxSender(sql, "shared@example.test"),
    { userId: "athlete", athleteId: null },
    "Only active approved links combine matching source identities",
  );
  messages.push(message(5, "inbox-other@example.test"));
  failBody = true;
  await assert.rejects(() => svc.syncAthleteInbox(sql, open));
  assert.equal(
    Number((await sql`select last_uid from athlete_inbox_connection`)[0].last_uid),
    4,
    "Failure must not skip an unrecorded email",
  );
  failBody = false;
  assert.equal((await svc.syncAthleteInbox(sql, open)).imported, 1);
  const key = process.env.ATHRECS_INBOX_ENCRYPTION_KEY;
  delete process.env.ATHRECS_INBOX_ENCRYPTION_KEY;
  assert.equal((await svc.syncAthleteInbox(sql, open)).skipped, "not-configured");
  assert.equal((await sql`select lease_token from athlete_inbox_connection`)[0].lease_token, null);
  process.env.ATHRECS_INBOX_ENCRYPTION_KEY = key;
  await sql`update athlete_inbox_connection set lease_token='busy',lease_until=now()+interval '1 minute'`;
  assert.equal((await svc.syncAthleteInbox(sql, open)).skipped, "not-connected-or-busy");
  await sql`update athlete_inbox_connection set lease_token=null,lease_until=null`;
  messages.push(message(6, "inbox-athlete@example.test"));
  const revokeOpen = async (p) => {
    const x = await open(p);
    return {
      ...x,
      body: async (m) => {
        await svc.disconnectAthleteInbox(sql);
        return x.body(m);
      },
    };
  };
  await assert.rejects(() => svc.syncAthleteInbox(sql, revokeOpen));
  assert.equal(
    (await sql`select count(*)::int n from athlete_messages where source='inbox'`)[0].n,
    2,
    "Disconnect prevents an in-flight write",
  );
  assert.equal((await rpc("getAthleteInboxStatus")).connected, false);
  assert(closed >= 5);
  // Verify actual adapter passes only TLS/read-only requests, reads no oversized body,
  // and turns MIME HTML into inert text without fetching remote content.
  const calls = [];
  let sourceFetch = 0;
  const fake = {
    on: () => {},
    connect: async () => calls.push("connect"),
    mailboxOpen: async (path, options) => {
      assert.equal(path, "INBOX");
      assert.equal(options.readOnly, true);
      return { readOnly: true, uidValidity: 1n, uidNext: 2 };
    },
    search: async () => [1],
    fetchAll: async () => [
      {
        uid: 1,
        envelope: { from: [{ address: "INBOX-ATHLETE@example.test" }], subject: "Synthetic" },
        size: 100,
        internalDate: new Date(),
      },
    ],
    fetchOne: async (uid, query, options) => {
      assert.equal(options.uid, true);
      assert(query.source.maxLength <= 1048577);
      sourceFetch++;
      return {
        source: Buffer.from(
          "From: a@example.test\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<p>Hello athlete</p><script>bad()</script>",
        ),
      };
    },
    logout: async () => calls.push("logout"),
    close: () => calls.push("close"),
  };
  const transport = await imap.openPrivateInbox("synthetic-secret", (opts) => {
    assert.equal(opts.host, "mail.privateemail.com");
    assert.equal(opts.port, 993);
    assert.equal(opts.secure, true);
    assert.equal(opts.tls.rejectUnauthorized, true);
    assert.equal(opts.logger, false);
    return fake;
  });
  assert.equal((await transport.headers(0))[0].sender, "inbox-athlete@example.test");
  assert((await transport.body(message(1, "a@example.test"))).includes("Hello athlete"));
  await transport.body(message(1, "a@example.test", { size: 2000000 }));
  assert.equal(sourceFetch, 1);
  await transport.close();
  assert.deepEqual(calls, ["connect", "logout"]);
  const response = await fetch(origin + "/api/athlete-inbox-sync");
  assert.equal(response.status, 401);
  console.log(
    "PASS: encrypted connection, real staff RPC privacy, exact matching, unverified/ambiguous/unrelated rejection, deduplication, retry cursor, leases, disconnect race, read-only TLS and MIME size limits. Synthetic mailbox only.",
  );
} finally {
  await server.close();
  if (db) await db.close();
}
