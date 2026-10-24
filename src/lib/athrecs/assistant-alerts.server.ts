import { createHash, timingSafeEqual } from "node:crypto";
import type { Sql } from "../db";

/** No credentials, recipient defaults or preview sends. Activation is a separate step. */
export function assistantAlertConfig(env: NodeJS.ProcessEnv = process.env) {
  const token = env.ATHRECS_CHAT_WHATSAPP_TOKEN?.trim() ?? "";
  const sender = env.ATHRECS_CHAT_WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const recipient = env.ATHRECS_CHAT_WHATSAPP_RECIPIENT?.trim() ?? "";
  const version = env.ATHRECS_CHAT_WHATSAPP_GRAPH_VERSION?.trim() ?? "";
  const template = env.ATHRECS_CHAT_WHATSAPP_TEMPLATE?.trim() ?? "";
  const language = env.ATHRECS_CHAT_WHATSAPP_TEMPLATE_LANGUAGE?.trim() ?? "";
  const missing: string[] = [];
  if (!token) missing.push("WhatsApp access token");
  if (!/^\d{5,30}$/.test(sender)) missing.push("WhatsApp sender phone-number ID");
  if (!/^[1-9]\d{7,14}$/.test(recipient)) missing.push("Confirmed receiving number");
  if (!/^v\d{1,3}\.\d{1,2}$/.test(version)) missing.push("Supported Meta API version");
  if (!/^[a-z0-9_]{1,512}$/.test(template)) missing.push("Approved alert template");
  if (!/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language)) missing.push("Approved template language");
  if (env.ATHRECS_CHAT_WHATSAPP_OPT_IN !== "true") missing.push("Recipient opt-in confirmation");
  if (!env.DATABASE_URL?.trim()) missing.push("Persistent database");
  if (!env.CRON_SECRET?.trim()) missing.push("Alert worker authentication");
  const active = env.ATHRECS_CHAT_WHATSAPP_ENABLED === "true";
  const production = env.VERCEL_ENV === "production";
  const configured = missing.length === 0;
  const limit = Number(env.ATHRECS_CHAT_WHATSAPP_MONTHLY_LIMIT ?? "100");
  const monthlyLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 3000) : 100;
  // Bind queued work to the approved destination/template. Changing settings must
  // never forward an existing backlog to a newly configured phone number.
  const destinationKey = createHash("sha256")
    .update(JSON.stringify([sender, recipient, template, language, version]))
    .digest("hex");
  return {
    enabled: active && production && configured,
    active,
    production,
    configured,
    missing,
    token,
    sender,
    recipient,
    version,
    template,
    language,
    monthlyLimit,
    destinationKey,
  };
}
export type AssistantAlertConfig = ReturnType<typeof assistantAlertConfig>;

export function assistantAlertReadiness(config = assistantAlertConfig()) {
  return {
    enabled: config.enabled,
    configured: config.configured,
    production: config.production,
    missing: config.missing,
    monthlyLimit: config.monthlyLimit,
    recipientEnding: /^[1-9]\d{7,14}$/.test(config.recipient) ? config.recipient.slice(-4) : null,
  };
}

export function authorizedAssistantAlertWorker(request: Request, env = process.env) {
  const secret = env.CRON_SECRET?.trim();
  if (!secret) return false;
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

type Outcome =
  | { status: "accepted"; providerId: string }
  | { status: "pending" | "failed" | "uncertain"; error: string };

/** The approved template contains fixed text and a URL button; no transcript leaves AthRecs. */
export async function sendAssistantWhatsAppAlert(
  config: AssistantAlertConfig,
  conversationId: string,
  fetcher: typeof fetch = fetch,
): Promise<Outcome> {
  if (!config.enabled || !/^[0-9a-f-]{36}$/i.test(conversationId))
    return { status: "failed", error: "Alert is not configured for production." };
  try {
    const response = await fetcher(
      `https://graph.facebook.com/${config.version}/${config.sender}/messages`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(5000),
        redirect: "error",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: config.recipient,
          type: "template",
          template: {
            name: config.template,
            language: { code: config.language },
            components: [
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{ type: "text", text: conversationId }],
              },
            ],
          },
        }),
      },
    );
    if (response.status === 429)
      return { status: "pending", error: "WhatsApp rate limit; a retry is queued." };
    if (response.status >= 500)
      return {
        status: "uncertain",
        error: "Provider outcome is uncertain; check WhatsApp logs before resending.",
      };
    if (!response.ok)
      return {
        status: "failed",
        error: `WhatsApp rejected the alert (HTTP ${response.status}). Check account and template settings.`,
      };
    const receipt = await response.json();
    const id = receipt?.messages?.[0]?.id;
    if (typeof id !== "string" || !id || id.length > 512)
      return {
        status: "uncertain",
        error: "WhatsApp acceptance receipt was missing; check provider logs.",
      };
    return { status: "accepted", providerId: id };
  } catch {
    // WhatsApp does not offer a send idempotency key here. A lost response must
    // never be blindly replayed: the notification may already be on the phone.
    return {
      status: "uncertain",
      error: "Delivery attempt was interrupted; check WhatsApp logs before resending.",
    };
  }
}

/** Immediate attempt after message commit; cron only recovers unsent or explicitly rate-limited work. */
export async function deliverAssistantAlerts(
  sql: Sql,
  config = assistantAlertConfig(),
  conversationId?: string,
  send = sendAssistantWhatsAppAlert,
) {
  const counts = { attempted: 0, accepted: 0, pending: 0, failed: 0, uncertain: 0 };
  if (!config.enabled) return counts;
  await sql`UPDATE assistant_chat_alerts SET status = 'uncertain',
    last_error = 'Worker stopped during delivery; check WhatsApp logs before resending.'
    WHERE status = 'processing' AND processing_at < now() - interval '2 minutes'`;
  await sql`UPDATE assistant_chat_alerts SET status = 'expired', last_error = 'Alert expired or destination changed.'
    WHERE status = 'pending' AND (created_at < now() - interval '24 hours' OR destination_key <> ${config.destinationKey})`;
  // Bound each invocation. Immediate calls select only this visitor's conversation.
  for (let n = 0; n < (conversationId ? 1 : 5); n++) {
    const reservation = await sql.transaction(async (tx) => {
      const [row] = await tx<{ message_id: string; conversation_id: string; attempts: number }>`
        SELECT message_id::text, conversation_id, attempts FROM assistant_chat_alerts
        WHERE status = 'pending' AND next_attempt_at <= now() AND destination_key = ${config.destinationKey}
          AND (${conversationId ?? null}::uuid IS NULL OR conversation_id = ${conversationId ?? null}::uuid)
        ORDER BY next_attempt_at, message_id LIMIT 1 FOR UPDATE SKIP LOCKED`;
      if (!row) return null;
      const now = new Date();
      const bucket = `whatsapp-alert:${now.toISOString().slice(0, 7)}`;
      const expires = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
      const quota =
        await tx`INSERT INTO assistant_usage(bucket, turns, expires_at) VALUES (${bucket}, 1, ${expires})
        ON CONFLICT (bucket) DO UPDATE SET turns = assistant_usage.turns + 1
        WHERE assistant_usage.turns < ${config.monthlyLimit} RETURNING turns`;
      if (!quota.length) {
        await tx`UPDATE assistant_chat_alerts SET status = 'limited', last_error = 'Monthly alert attempt limit reached.'
          WHERE message_id = ${row.message_id}::bigint`;
        return null;
      }
      await tx`UPDATE assistant_chat_alerts SET status = 'processing', processing_at = now(), attempts = attempts + 1
        WHERE message_id = ${row.message_id}::bigint`;
      return row;
    });
    if (!reservation) break;
    counts.attempted++;
    let outcome: Outcome;
    try {
      outcome = await send(config, reservation.conversation_id);
    } catch {
      outcome = {
        status: "uncertain",
        error: "Provider outcome is uncertain; check WhatsApp logs before resending.",
      };
    }
    if (outcome.status === "pending" && reservation.attempts >= 4)
      outcome = { status: "failed", error: "WhatsApp rate limit persisted after five attempts." };
    const delay = Math.min(1800, 60 * 2 ** reservation.attempts);
    await sql`UPDATE assistant_chat_alerts SET status = ${outcome.status},
      provider_id = ${outcome.status === "accepted" ? outcome.providerId : null},
      last_error = ${outcome.status === "accepted" ? null : outcome.error},
      next_attempt_at = now() + ${delay} * interval '1 second'
      WHERE message_id = ${reservation.message_id}::bigint AND status = 'processing'`;
    counts[outcome.status]++;
  }
  return counts;
}

export async function assistantAlertSummary(sql: Sql) {
  const states = await sql<{ status: string; count: number }>`
    SELECT status, count(*)::int AS count FROM assistant_chat_alerts GROUP BY status`;
  return { ...assistantAlertReadiness(), states };
}
