import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import {
  assistantInput,
  assistantPage,
  assistantInstructions,
} from "../src/lib/athrecs/assistant.ts";
import { assistantCopy } from "../src/lib/athrecs/assistant-copy.ts";
import {
  runAssistantTurn,
  readAssistantHistory,
  cleanupAssistant,
  AssistantLimit,
} from "../src/lib/athrecs/assistant-store.server.ts";
import { askOpenAI } from "../src/lib/athrecs/assistant-provider.server.ts";
import { assistantProviderConfig } from "../src/lib/athrecs/assistant-config.server.ts";

const db = new PGlite();
await db.exec(
  await readFile(new URL("../migrations/20261016_assistant_chats.sql", import.meta.url), "utf8"),
);
function wrap(connection) {
  const sql = async (strings, ...params) =>
    (
      await connection.query(
        strings.reduce((query, part, index) => query + (index ? `$${index}` : "") + part, ""),
        params,
      )
    ).rows;
  sql.query = async (query, params = []) => (await connection.query(query, params)).rows;
  sql.transaction = (run) => connection.transaction((tx) => run(wrap(tx)));
  return sql;
}
const sql = wrap(db);
const context = (tokenHash = randomUUID(), overrides = {}) => ({
  tokenHash,
  networkHash: null,
  monthlyLimit: 3000,
  input: {
    message: "How do I create an account?",
    language: "en",
    page: "/athletes",
    requestId: randomUUID(),
  },
  ...overrides,
});
const reset = () =>
  db.exec(
    "TRUNCATE assistant_messages, assistant_conversations, assistant_usage RESTART IDENTITY CASCADE",
  );

try {
  const gateway = assistantProviderConfig({
    ATHRECS_ASSISTANT_PROVIDER: "vercel",
    VERCEL_OIDC_TOKEN: "synthetic-token",
    ATHRECS_ASSISTANT_RATE_LIMIT_SECRET: "synthetic-stable-secret",
  });
  assert.equal(gateway.provider, "vercel");
  assert.equal(gateway.model, "openai/gpt-6-luna");
  assert.equal(gateway.apiKey, "synthetic-token");
  assert.equal(
    assistantProviderConfig({
      ATHRECS_ASSISTANT_PROVIDER: "vercel",
      VERCEL_OIDC_TOKEN: "rotated-token",
      ATHRECS_ASSISTANT_RATE_LIMIT_SECRET: gateway.rateLimitSecret,
    }).rateLimitSecret,
    gateway.rateLimitSecret,
  );
  assert.equal(assistantProviderConfig({ OPENAI_API_KEY: "direct-key" }).provider, "openai");
  assert.equal(assistantProviderConfig({}).apiKey, "");
  await askOpenAI([], "en", gateway, async (url, options) => {
    assert.equal(url, "https://ai-gateway.vercel.sh/v1/responses");
    assert.equal(options.headers.Authorization, "Bearer synthetic-token");
    assert.equal(JSON.parse(options.body).model, "openai/gpt-6-luna");
    return new Response(
      JSON.stringify({
        status: "completed",
        output: [{ type: "message", content: [{ type: "output_text", text: "Hello" }] }],
      }),
    );
  });
  assert.equal(assistantPage("/athletes"), "/athletes");
  for (const path of [
    "//evil.example",
    "/athlete-account?token=secret",
    "/admin/athletes/secret",
    "/join/invite-secret",
    "/%2f%2fevil.example",
    "/auth/callback#secret",
  ])
    assert.equal(assistantPage(path), "/");
  assert.throws(() => assistantInput.parse({ ...context().input, message: "x".repeat(1001) }));
  assert.throws(() => assistantInput.parse({ ...context().input, requestId: "not-a-uuid" }));
  for (const [language, copy] of Object.entries(assistantCopy)) {
    assert.deepEqual(Object.keys(copy).sort(), Object.keys(assistantCopy.en).sort());
    assert.match(assistantInstructions(language), /Reply in/);
    assert.ok(copy.unavailable && copy.notice);
  }
  let calls = 0;
  const alice = context("alice");
  const answer = async (messages) => {
    calls++;
    assert.equal(messages.at(-1).content, alice.input.message);
    return "Open Athlete Account to get started.";
  };
  const transcript = await runAssistantTurn(sql, alice, answer);
  assert.equal(transcript.length, 2);
  assert.equal(transcript[0].role, "user");
  assert.equal(transcript[1].role, "assistant");
  assert.deepEqual(await readAssistantHistory(sql, "someone-else"), []);
  assert.deepEqual(await runAssistantTurn(sql, alice, answer), transcript);
  assert.equal(calls, 1, "retry must not call provider or charge quota twice");

  const bob = context("bob");
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  let entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  const pending = runAssistantTurn(sql, bob, async () => {
    entered();
    await ready;
    return "Welcome";
  });
  await started;
  await assert.rejects(
    runAssistantTurn(sql, { ...bob, input: { ...bob.input, requestId: randomUUID() } }, answer),
    (error) => error instanceof AssistantLimit && error.code === "busy",
  );
  release();
  await pending;

  const french = context("fr", { input: { ...context().input, language: "fr" } });
  const failed = await runAssistantTurn(sql, french, async () => {
    throw new Error("secret-provider-body");
  });
  assert.equal(failed.at(-1).status, "unavailable");
  assert.equal(failed.at(-1).content, assistantCopy.fr.unavailable);
  assert.ok(!JSON.stringify(failed).includes("secret-provider-body"));

  await reset();
  const limited = context("limited", { monthlyLimit: 1 });
  await runAssistantTurn(sql, limited, async () => "First reply");
  await assert.rejects(
    runAssistantTurn(sql, context("new-browser", { monthlyLimit: 1 }), async () => {
      throw new Error("must never call");
    }),
    (error) => error.code === "limited",
  );
  assert.equal(
    (await sql`SELECT count(*)::int AS n FROM assistant_conversations`)[0].n,
    1,
    "denied requests must roll back conversation creation",
  );

  await reset();
  const hourly = context("hourly");
  for (let n = 0; n < 12; n++)
    await runAssistantTurn(
      sql,
      { ...hourly, input: { ...hourly.input, requestId: randomUUID() } },
      async () => "Reply",
    );
  await assert.rejects(
    runAssistantTurn(
      sql,
      { ...hourly, input: { ...hourly.input, requestId: randomUUID() } },
      async () => "Never",
    ),
    (error) => error.code === "limited",
  );
  assert.equal(
    (await sql`SELECT turns FROM assistant_usage WHERE bucket LIKE 'month:%'`)[0].turns,
    12,
    "rejected session quota must roll back the global counter",
  );

  await sql`UPDATE assistant_conversations SET created_at = now() - interval '91 days'`;
  assert.deepEqual(await readAssistantHistory(sql, "hourly"), []);
  await cleanupAssistant(sql);
  assert.equal((await sql`SELECT count(*)::int AS n FROM assistant_messages`)[0].n, 0);

  await reset();
  const interrupted = context("interrupted");
  const id = randomUUID();
  await sql`INSERT INTO assistant_conversations (id, token_hash, language, page_path, active_request, processing_until)
    VALUES (${id}, ${interrupted.tokenHash}, 'en', '/', ${interrupted.input.requestId}, now() - interval '1 second')`;
  await sql`INSERT INTO assistant_messages (conversation_id, request_id, role, content, language)
    VALUES (${id}, ${interrupted.input.requestId}, 'user', 'Interrupted question', 'en')`;
  const recovered = await runAssistantTurn(sql, interrupted, async () => {
    throw new Error("no duplicate provider request");
  });
  assert.equal(recovered.length, 2);
  assert.equal(recovered[1].status, "unavailable");

  let captured;
  const reply = await askOpenAI(
    transcript,
    "es",
    { apiKey: "synthetic-key", model: "gpt-6-luna" },
    async (url, options) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      captured = JSON.parse(options.body);
      return new Response(
        JSON.stringify({
          status: "completed",
          output: [
            { type: "reasoning" },
            { type: "message", content: [{ type: "output_text", text: "Hola" }] },
          ],
        }),
      );
    },
  );
  assert.equal(reply, "Hola");
  assert.equal(captured.store, false);
  assert.equal(captured.max_output_tokens, 600);
  assert.match(captured.instructions, /Reply in Spanish/);
  assert.equal(captured.input.length, transcript.length);
  await assert.rejects(
    askOpenAI(
      transcript,
      "en",
      { apiKey: "synthetic", model: "test" },
      async () => new Response("private-error", { status: 401 }),
    ),
    /Assistant provider unavailable/,
  );
  await assert.rejects(
    askOpenAI(
      transcript,
      "en",
      { apiKey: "synthetic", model: "test" },
      async () => new Response(JSON.stringify({ status: "incomplete", output: [] })),
    ),
    /Incomplete response/,
  );

  const api = await readFile(
    new URL("../src/lib/athrecs/assistant-api.ts", import.meta.url),
    "utf8",
  );
  for (const name of [
    "getStaffAssistantChats",
    "getStaffAssistantTranscript",
    "deleteStaffAssistantTranscript",
  ]) {
    assert.match(
      api.slice(api.indexOf(`export const ${name}`) + 13).split("export const ")[0],
      /middleware\(\[staffMiddleware\]\)/,
    );
  }
  console.log(
    "Assistant checks passed: durable transcripts, isolation, retries, concurrency, quotas, retention, recovery, language, provider handling and staff guards.",
  );
} finally {
  await db.close();
}
