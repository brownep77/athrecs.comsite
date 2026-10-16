import { createHash, createHmac, randomBytes } from "node:crypto";
import { getCookie, getRequest, setCookie, setResponseHeader } from "@tanstack/react-start/server";
import { getSql } from "../db";
import type { AssistantInput } from "./assistant";
import {
  AssistantLimit,
  readAssistantHistory,
  runAssistantTurn,
  cleanupAssistant,
} from "./assistant-store.server";
import { askOpenAI } from "./assistant-provider.server";

export function assistantConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
  const enabled =
    process.env.ATHRECS_ASSISTANT_ENABLED === "true" &&
    !!apiKey &&
    !!process.env.DATABASE_URL?.trim();
  const phone = process.env.ATHRECS_WHATSAPP_NUMBER?.trim() ?? "";
  return {
    enabled,
    apiKey,
    model: process.env.OPENAI_ASSISTANT_MODEL?.trim() || "gpt-6-luna",
    monthlyLimit: Math.min(
      10000,
      Math.max(
        1,
        Number.parseInt(process.env.ATHRECS_ASSISTANT_MONTHLY_LIMIT ?? "3000", 10) || 3000,
      ),
    ),
    whatsappUrl: /^[1-9]\d{7,14}$/.test(phone) ? `https://wa.me/${phone}` : null,
  };
}
export function privateAssistantResponse() {
  setResponseHeader("Cache-Control", "private, no-store");
  setResponseHeader("Vary", "Cookie, Origin");
  setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
}
function requireOrigin() {
  privateAssistantResponse();
  const request = getRequest();
  const site = request.headers.get("sec-fetch-site");
  if (
    (site && site !== "same-origin") ||
    request.headers.get("origin") !== new URL(request.url).origin
  ) {
    throw new Error("This chat is available only on this website.");
  }
}
function sessionHash(create: boolean): string | null {
  const secure = new URL(getRequest().url).protocol === "https:";
  const name = secure ? "__Host-athrecs-assistant" : "athrecs-assistant-local";
  let token = getCookie(name);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create) return null;
    token = randomBytes(32).toString("hex");
    setCookie(name, token, {
      httpOnly: true,
      secure,
      sameSite: "strict",
      path: "/",
      maxAge: 604800,
    });
  }
  return createHash("sha256").update(token).digest("hex");
}
export async function assistantHistory() {
  requireOrigin();
  if (!assistantConfig().enabled) return { messages: [], error: "unavailable" as const };
  const hash = sessionHash(false);
  return { messages: hash ? await readAssistantHistory(await getSql(), hash) : [], error: null };
}
export async function assistantSend(input: AssistantInput) {
  requireOrigin();
  const config = assistantConfig();
  if (!config.enabled) return { messages: [], error: "unavailable" as const };
  const tokenHash = sessionHash(true)!;
  // Vercel overwrites this header at its edge. Never trust arbitrary X-Forwarded-For.
  const ip = process.env.VERCEL === "1" ? getRequest().headers.get("x-vercel-forwarded-for") : null;
  const networkHash = ip
    ? createHmac("sha256", config.apiKey)
        .update(`${new Date().toISOString().slice(0, 10)}:${ip}`)
        .digest("hex")
    : null;
  try {
    const messages = await runAssistantTurn(
      await getSql(),
      { tokenHash, networkHash, input, monthlyLimit: config.monthlyLimit },
      (history) => askOpenAI(history, input.language, config),
    );
    return { messages, error: null };
  } catch (error) {
    if (error instanceof AssistantLimit) return { messages: [], error: error.code };
    return { messages: [], error: "unavailable" as const };
  }
}
export async function listAssistantChats(page: number) {
  const sql = await getSql();
  await cleanupAssistant(sql);
  const chats = await sql<{
    id: string;
    language: string;
    page_path: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    preview: string;
  }>`
    SELECT c.id, c.language, c.page_path, c.created_at::text, c.updated_at::text,
      (SELECT count(*)::int FROM assistant_messages m WHERE m.conversation_id = c.id) AS message_count,
      (SELECT left(content, 100) FROM assistant_messages m WHERE m.conversation_id = c.id ORDER BY m.id LIMIT 1) AS preview
    FROM assistant_conversations c WHERE c.created_at > now() - interval '90 days'
    ORDER BY c.updated_at DESC, c.id LIMIT 26 OFFSET ${page * 25}`;
  return {
    chats: chats.slice(0, 25),
    hasMore: chats.length > 25,
    enabled: assistantConfig().enabled,
  };
}
export async function assistantTranscript(id: string) {
  const sql = await getSql();
  const [chat] = await sql<{ id: string; language: string; page_path: string; created_at: string }>`
    SELECT id, language, page_path, created_at::text FROM assistant_conversations
    WHERE id = ${id} AND created_at > now() - interval '90 days'`;
  if (!chat) throw new Error("Chat not found or expired.");
  const messages = await sql<
    import("./assistant").ChatMessage
  >`SELECT role, content, language, status, created_at::text
    FROM assistant_messages WHERE conversation_id = ${id} ORDER BY id`;
  return { chat, messages };
}
