import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { assistantConversationId, assistantInboxPath } from "../src/lib/athrecs/assistant-link.ts";
import ts from "typescript";
import {
  assistantAlertConfig,
  assistantAlertReadiness,
  authorizedAssistantAlertWorker,
  sendAssistantWhatsAppAlert,
  deliverAssistantAlerts,
} from "../src/lib/athrecs/assistant-alerts.server.ts";
import { runAssistantTurn, cleanupAssistant } from "../src/lib/athrecs/assistant-store.server.ts";

const env = {
  VERCEL_ENV: "production",
  DATABASE_URL: "synthetic-in-memory",
  CRON_SECRET: "synthetic-cron",
  ATHRECS_CHAT_WHATSAPP_ENABLED: "true",
  ATHRECS_CHAT_WHATSAPP_TOKEN: "synthetic-token",
  ATHRECS_CHAT_WHATSAPP_PHONE_NUMBER_ID: "1234567890",
  ATHRECS_CHAT_WHATSAPP_RECIPIENT: "447700900123",
  ATHRECS_CHAT_WHATSAPP_GRAPH_VERSION: "v99.0",
  ATHRECS_CHAT_WHATSAPP_TEMPLATE: "synthetic_alert",
  ATHRECS_CHAT_WHATSAPP_TEMPLATE_LANGUAGE: "en_GB",
  ATHRECS_CHAT_WHATSAPP_OPT_IN: "true",
};
const config = assistantAlertConfig(env);
assert.equal(config.enabled, true);
assert.equal(config.monthlyLimit, 100);
for (const overrides of [
  { VERCEL_ENV: "preview" },
  { ATHRECS_CHAT_WHATSAPP_OPT_IN: "false" },
  { ATHRECS_CHAT_WHATSAPP_ENABLED: "false" },
  { ATHRECS_CHAT_WHATSAPP_TOKEN: "" },
  { DATABASE_URL: "" },
  { CRON_SECRET: "" },
  { ATHRECS_CHAT_WHATSAPP_RECIPIENT: "https://evil.test" },
  { ATHRECS_CHAT_WHATSAPP_GRAPH_VERSION: "v99.0/evil" },
])
  assert.equal(assistantAlertConfig({ ...env, ...overrides }).enabled, false);
assert.equal(assistantAlertConfig({}).enabled, false);
assert.equal(
  assistantAlertConfig({ ...env, ATHRECS_CHAT_WHATSAPP_MONTHLY_LIMIT: "-1" }).monthlyLimit,
  100,
);
assert.equal(
  assistantAlertConfig({ ...env, ATHRECS_CHAT_WHATSAPP_MONTHLY_LIMIT: "99999" }).monthlyLimit,
  3000,
);
assert.equal(assistantAlertReadiness(config).recipientEnding, "0123");
assert.ok(!JSON.stringify(assistantAlertReadiness(config)).includes("synthetic-token"));
assert.ok(!JSON.stringify(assistantAlertReadiness(config)).includes("447700900123"));
assert.equal(
  authorizedAssistantAlertWorker(
    new Request("https://www.athrecs.com/api/assistant-chat-alerts"),
    env,
  ),
  false,
);
assert.equal(
  authorizedAssistantAlertWorker(
    new Request("https://www.athrecs.com/api/assistant-chat-alerts", {
      headers: { Authorization: "Bearer synthetic-cron" },
    }),
    env,
  ),
  true,
);
assert.equal(
  authorizedAssistantAlertWorker(
    new Request("https://www.athrecs.com/api/assistant-chat-alerts", {
      headers: { Authorization: "Bearer wrong" },
    }),
    env,
  ),
  false,
);
assert.equal(
  authorizedAssistantAlertWorker(
    new Request("https://www.athrecs.com/api/assistant-chat-alerts"),
    {},
  ),
  false,
);

const conversationId = randomUUID();
assert.equal(assistantInboxPath(conversationId), `/admin/assistant-chats?chat=${conversationId}`);
for (const invalid of [
  "//evil.test",
  "https://evil.test",
  `${conversationId}&returnTo=https://evil.test`,
  [conversationId],
  null,
]) {
  assert.equal(assistantConversationId(invalid), undefined);
  assert.equal(assistantInboxPath(invalid), "/admin/assistant-chats");
}
const transport = await sendAssistantWhatsAppAlert(config, conversationId, async (url, options) => {
  assert.equal(url, "https://graph.facebook.com/v99.0/1234567890/messages");
  assert.equal(options.headers.Authorization, "Bearer synthetic-token");
  assert.equal(options.redirect, "error");
  const body = JSON.parse(options.body);
  assert.deepEqual(body, {
    messaging_product: "whatsapp",
    to: "447700900123",
    type: "template",
    template: {
      name: "synthetic_alert",
      language: { code: "en_GB" },
      components: [
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: conversationId }],
        },
      ],
    },
  });
  return Response.json({ messages: [{ id: "synthetic-provider-receipt" }] });
});
assert.equal(transport.status, "accepted");
for (const [http, status] of [
  [429, "pending"],
  [400, "failed"],
  [401, "failed"],
  [500, "uncertain"],
]) {
  const outcome = await sendAssistantWhatsAppAlert(
    config,
    conversationId,
    async () => new Response("PRIVATE BODY MUST NOT LEAK", { status: http }),
  );
  assert.equal(outcome.status, status);
  assert.ok(!JSON.stringify(outcome).includes("PRIVATE BODY"));
}
assert.equal(
  (
    await sendAssistantWhatsAppAlert(config, conversationId, async () => {
      throw Error("PRIVATE TOKEN");
    })
  ).status,
  "uncertain",
);
assert.equal(
  (await sendAssistantWhatsAppAlert(config, conversationId, async () => Response.json({}))).status,
  "uncertain",
);
await sendAssistantWhatsAppAlert({ ...config, enabled: false }, conversationId, async () => {
  throw Error("Disabled alerts must never call fetch");
});

const db = new PGlite();
for (const name of ["20261016_assistant_chats.sql", "20261020_assistant_chat_alerts.sql"])
  await db.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
function wrap(connection) {
  const sql = async (strings, ...params) =>
    (
      await connection.query(
        strings.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
        params,
      )
    ).rows;
  sql.transaction = (run) => connection.transaction((tx) => run(wrap(tx)));
  return sql;
}
const sql = wrap(db);
const context = (extra = {}) => ({
  tokenHash: randomUUID(),
  networkHash: null,
  monthlyLimit: 3000,
  alertDestinationKey: config.destinationKey,
  input: {
    requestId: randomUUID(),
    message: "SYNTHETIC PRIVATE VISITOR TEXT",
    language: "en",
    page: "/athletes",
  },
  ...extra,
});
const reset = () =>
  db.exec(
    "TRUNCATE assistant_messages, assistant_conversations, assistant_usage RESTART IDENTITY CASCADE",
  );
let sends = 0;
const accepted = async () => {
  sends++;
  return { status: "accepted", providerId: `receipt-${sends}` };
};
try {
  const first = context();
  let notificationStarted = false;
  await runAssistantTurn(
    sql,
    first,
    async () => {
      assert.equal(notificationStarted, true);
      return "Reply";
    },
    async (id) => {
      notificationStarted = true;
      const [stored] =
        await sql`SELECT * FROM assistant_messages WHERE conversation_id=${id} AND role='user'`;
      assert.equal(
        stored.content,
        first.input.message,
        "message must be committed before delivery",
      );
      await deliverAssistantAlerts(sql, config, id, accepted);
    },
  );
  assert.equal(sends, 1);
  await runAssistantTurn(
    sql,
    first,
    async () => {
      throw Error("duplicate reply");
    },
    async () => {
      throw Error("duplicate alert");
    },
  );
  await deliverAssistantAlerts(sql, config, undefined, accepted);
  assert.equal(sends, 1, "duplicate submission and cron must not resend accepted alerts");
  assert.equal((await sql`SELECT status FROM assistant_chat_alerts`)[0].status, "accepted");
  assert.ok(
    !JSON.stringify(await sql`SELECT * FROM assistant_chat_alerts`).includes(first.input.message),
    "outbox must not store message text",
  );

  await reset();
  const broken = context();
  const reply = await runAssistantTurn(
    sql,
    broken,
    async () => "Reply survives",
    async () => {
      throw Error("notification outage");
    },
  );
  assert.equal(reply.at(-1).content, "Reply survives");
  assert.equal((await sql`SELECT status FROM assistant_chat_alerts`)[0].status, "pending");
  let release, started;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const running = new Promise((resolve) => {
    started = resolve;
  });
  const delivery = deliverAssistantAlerts(sql, config, undefined, async () => {
    started();
    await gate;
    return { status: "accepted", providerId: "concurrent-receipt" };
  });
  await running;
  assert.equal(
    (await deliverAssistantAlerts(sql, config, undefined, accepted)).attempted,
    0,
    "concurrent worker must skip processing row",
  );
  release();
  await delivery;

  await reset();
  await runAssistantTurn(sql, context(), async () => "Reply");
  await deliverAssistantAlerts(sql, config, undefined, async () => ({
    status: "pending",
    error: "Rate limited",
  }));
  assert.equal(
    (await deliverAssistantAlerts(sql, config, undefined, accepted)).attempted,
    0,
    "backoff prevents immediate retry",
  );
  await sql`UPDATE assistant_chat_alerts SET next_attempt_at=now()-interval '1 second'`;
  await deliverAssistantAlerts(sql, config, undefined, accepted);
  assert.equal((await sql`SELECT attempts FROM assistant_chat_alerts`)[0].attempts, 2);

  await reset();
  await runAssistantTurn(sql, context(), async () => "Reply");
  await deliverAssistantAlerts(sql, config, undefined, async () => ({
    status: "uncertain",
    error: "Timed out",
  }));
  assert.equal(
    (await deliverAssistantAlerts(sql, config, undefined, accepted)).attempted,
    0,
    "uncertain sends must not replay",
  );
  await reset();
  await runAssistantTurn(sql, context(), async () => "Reply");
  await sql`UPDATE assistant_chat_alerts SET status='processing',processing_at=now()-interval '3 minutes'`;
  assert.equal((await deliverAssistantAlerts(sql, config, undefined, accepted)).attempted, 0);
  assert.equal((await sql`SELECT status FROM assistant_chat_alerts`)[0].status, "uncertain");

  await reset();
  await runAssistantTurn(sql, context(), async () => "Reply");
  const changed = assistantAlertConfig({ ...env, ATHRECS_CHAT_WHATSAPP_RECIPIENT: "447700900124" });
  assert.equal((await deliverAssistantAlerts(sql, changed, undefined, accepted)).attempted, 0);
  assert.equal((await sql`SELECT status FROM assistant_chat_alerts`)[0].status, "expired");
  await reset();
  await runAssistantTurn(sql, context(), async () => "Reply");
  await sql`UPDATE assistant_chat_alerts SET created_at=now()-interval '25 hours'`;
  assert.equal((await deliverAssistantAlerts(sql, config, undefined, accepted)).attempted, 0);

  await reset();
  await runAssistantTurn(sql, context(), async () => "Reply");
  await deliverAssistantAlerts(sql, { ...config, monthlyLimit: 1 }, undefined, accepted);
  await sql`DELETE FROM assistant_conversations`;
  await runAssistantTurn(sql, context(), async () => "Reply");
  assert.equal(
    (await deliverAssistantAlerts(sql, { ...config, monthlyLimit: 1 }, undefined, accepted))
      .attempted,
    0,
  );
  assert.equal(
    (await sql`SELECT status FROM assistant_chat_alerts`)[0].status,
    "limited",
    "deleting a chat must not reset monthly quota",
  );

  await reset();
  await runAssistantTurn(sql, context({ alertDestinationKey: undefined }), async () => "Reply");
  assert.equal(
    (await sql`SELECT count(*)::int AS n FROM assistant_chat_alerts`)[0].n,
    0,
    "disabled alerts must not accumulate a backlog",
  );
  await reset();
  await runAssistantTurn(sql, context(), async () => "Reply");
  await sql`DELETE FROM assistant_conversations`;
  assert.equal(
    (await deliverAssistantAlerts(sql, config, undefined, accepted)).attempted,
    0,
    "deleted chat must not notify",
  );
  await runAssistantTurn(sql, context(), async () => "Reply");
  await sql`UPDATE assistant_conversations SET created_at=now()-interval '91 days'`;
  await cleanupAssistant(sql);
  assert.equal((await sql`SELECT count(*)::int AS n FROM assistant_chat_alerts`)[0].n, 0);

  await reset();
  await runAssistantTurn(sql, context({ monthlyLimit: 1 }), async () => "Reply");
  await assert.rejects(runAssistantTurn(sql, context({ monthlyLimit: 1 }), async () => "Never"));
  assert.equal(
    (await sql`SELECT count(*)::int AS n FROM assistant_chat_alerts`)[0].n,
    1,
    "rejected chat must not create an alert",
  );
  console.log(
    "PASS: WhatsApp alerts are opt-in and production-only; atomic message/outbox commit, immediate delivery, no duplicate submissions, concurrent claims, backoff, uncertain-send hold, expiry, destination changes, quotas, deletion, privacy and worker auth. Synthetic data and mocked delivery only.",
  );
  // Exercise the actual worker route: no SQL or sender access before authentication/readiness.
  let routeSqlCalls = 0,
    routeDeliveries = 0,
    ready = true;
  const module = { exports: {} };
  const routeSource = await readFile(
    new URL("../src/routes/api/assistant-chat-alerts.ts", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(routeSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const deps = {
    "@tanstack/react-router": { createFileRoute: () => (options) => options },
    "@/lib/athrecs/assistant-alerts.server": {
      authorizedAssistantAlertWorker: (request) => authorizedAssistantAlertWorker(request, env),
      assistantAlertConfig: () => ({ ...config, enabled: ready }),
      deliverAssistantAlerts: async () => {
        routeDeliveries++;
        return { accepted: 0 };
      },
    },
    "@/lib/db": {
      getSql: async () => {
        routeSqlCalls++;
        return sql;
      },
    },
  };
  new Function("require", "module", "exports", compiled)(
    (name) => {
      if (!(name in deps)) throw Error(`Unexpected import ${name}`);
      return deps[name];
    },
    module,
    module.exports,
  );
  const handler = module.exports.Route.server.handlers.GET;
  const request = new Request("https://www.athrecs.com/api/assistant-chat-alerts", {
    headers: { Authorization: "Bearer synthetic-cron" },
  });
  assert.equal((await handler({ request: new Request(request.url) })).status, 401);
  assert.equal(routeSqlCalls, 0);
  assert.equal(routeDeliveries, 0);
  ready = false;
  await handler({ request });
  assert.equal(routeSqlCalls, 0);
  ready = true;
  const result = await handler({ request });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("Cache-Control"), "private, no-store");
  assert.equal(routeSqlCalls, 1);
  assert.equal(routeDeliveries, 1);
  console.log(
    "PASS: real notification worker route rejects unauthorized access, skips paused delivery, returns private headers; conversation links reject injected redirects.",
  );
} finally {
  await db.close();
}
