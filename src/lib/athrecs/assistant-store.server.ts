import { randomUUID } from "node:crypto";
import type { Sql } from "../db";
import { assistantPage, type AssistantInput, type ChatMessage } from "./assistant.ts";
import { assistantCopy } from "./assistant-copy.ts";

export class AssistantLimit extends Error {
  readonly code: "limited" | "busy";
  constructor(code: "limited" | "busy") {
    super(code);
    this.code = code;
  }
}
type Conversation = {
  id: string;
  language: AssistantInput["language"];
  active_request: string | null;
  busy: boolean;
};
export async function cleanupAssistant(sql: Sql) {
  await sql`DELETE FROM assistant_conversations WHERE created_at <= now() - interval '90 days'`;
  await sql`DELETE FROM assistant_usage WHERE expires_at < now()`;
}
export async function readAssistantHistory(sql: Sql, tokenHash: string): Promise<ChatMessage[]> {
  return sql<ChatMessage>`SELECT m.role, m.content, m.language, m.status, m.created_at::text
    FROM assistant_messages m JOIN assistant_conversations c ON c.id = m.conversation_id
    WHERE c.token_hash = ${tokenHash} AND c.created_at > now() - interval '90 days' ORDER BY m.id`;
}
async function consume(sql: Sql, bucket: string, limit: number, expires: Date) {
  const rows =
    await sql`INSERT INTO assistant_usage (bucket, turns, expires_at) VALUES (${bucket}, 1, ${expires})
    ON CONFLICT (bucket) DO UPDATE SET turns = assistant_usage.turns + 1
    WHERE assistant_usage.turns < ${limit} RETURNING turns`;
  if (!rows.length) throw new AssistantLimit("limited");
}

// One durable reservation per turn; no transaction is held open while calling OpenAI.
// Duplicate submissions neither call the provider again nor consume another quota slot.
export async function runAssistantTurn(
  sql: Sql,
  context: {
    tokenHash: string;
    networkHash: string | null;
    input: AssistantInput;
    monthlyLimit: number;
  },
  reply: (messages: ChatMessage[]) => Promise<string>,
): Promise<ChatMessage[]> {
  const { tokenHash, networkHash, input, monthlyLimit } = context;
  await cleanupAssistant(sql);
  const reservation = await sql.transaction(async (tx) => {
    await tx`INSERT INTO assistant_conversations (id, token_hash, language, page_path)
      VALUES (${randomUUID()}, ${tokenHash}, ${input.language}, ${assistantPage(input.page)})
      ON CONFLICT (token_hash) DO NOTHING`;
    const [conversation] = await tx<Conversation>`SELECT id, language, active_request,
      coalesce(processing_until > now(), false) AS busy FROM assistant_conversations
      WHERE token_hash = ${tokenHash} FOR UPDATE`;
    const existing =
      await tx`SELECT id FROM assistant_messages WHERE conversation_id = ${conversation.id}
      AND request_id = ${input.requestId} AND role = 'user'`;
    if (conversation.busy) throw new AssistantLimit("busy");
    // Recover an interrupted request into an explicit, durable failure message.
    if (conversation.active_request) {
      await tx`INSERT INTO assistant_messages (conversation_id, request_id, role, content, language, status)
        VALUES (${conversation.id}, ${conversation.active_request}, 'assistant',
        ${assistantCopy[conversation.language].unavailable}, ${conversation.language}, 'unavailable')
        ON CONFLICT (conversation_id, request_id, role) DO NOTHING`;
      await tx`UPDATE assistant_conversations SET active_request = null, processing_until = null
        WHERE id = ${conversation.id}`;
    }
    if (existing.length) return null;
    const [count] = await tx<{ n: number }>`SELECT count(*)::int AS n FROM assistant_messages
      WHERE conversation_id = ${conversation.id} AND role = 'user'`;
    if (count.n >= 100) throw new AssistantLimit("limited");
    const now = new Date();
    const hour = now.toISOString().slice(0, 13);
    // Consistent bucket order keeps concurrent reservations deadlock-free.
    await consume(
      tx,
      `month:${hour.slice(0, 7)}`,
      monthlyLimit,
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
    );
    if (networkHash)
      await consume(tx, `network:${hour}:${networkHash}`, 30, new Date(now.getTime() + 7200000));
    await consume(tx, `session:${hour}:${tokenHash}`, 12, new Date(now.getTime() + 7200000));
    await tx`INSERT INTO assistant_messages (conversation_id, request_id, role, content, language)
      VALUES (${conversation.id}, ${input.requestId}, 'user', ${input.message}, ${input.language})`;
    await tx`UPDATE assistant_conversations SET language = ${input.language}, updated_at = now(),
      active_request = ${input.requestId}, processing_until = now() + interval '60 seconds'
      WHERE id = ${conversation.id}`;
    return conversation.id;
  });
  if (!reservation) return readAssistantHistory(sql, tokenHash);
  let content: string;
  let status: "complete" | "unavailable" = "complete";
  try {
    const history = await readAssistantHistory(sql, tokenHash);
    content = (await reply(history.slice(-10))).trim();
    if (!content || content.length > 4000) throw new Error("Invalid assistant response");
  } catch {
    // Never persist or return provider error bodies, credentials or stack traces.
    content = assistantCopy[input.language].unavailable;
    status = "unavailable";
  }
  await sql.transaction(async (tx) => {
    const lease = await tx`SELECT id FROM assistant_conversations WHERE id = ${reservation}
      AND active_request = ${input.requestId} FOR UPDATE`;
    if (!lease.length) return;
    await tx`INSERT INTO assistant_messages (conversation_id, request_id, role, content, language, status)
      VALUES (${reservation}, ${input.requestId}, 'assistant', ${content}, ${input.language}, ${status})
      ON CONFLICT (conversation_id, request_id, role) DO NOTHING`;
    await tx`UPDATE assistant_conversations SET updated_at = now(), active_request = null,
      processing_until = null WHERE id = ${reservation}`;
  });
  return readAssistantHistory(sql, tokenHash);
}
