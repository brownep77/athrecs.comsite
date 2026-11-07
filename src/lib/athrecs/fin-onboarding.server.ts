import { createHash, createHmac, randomBytes } from "node:crypto";
import type { Sql } from "../db";
import {
  finSignupLinkSchema,
  parseFinContinuation,
  type FinResumeResult,
  type FinSignupInput,
  type FinSignupLink,
} from "./fin-onboarding.ts";

const LINK_LIFETIME_MS = 24 * 60 * 60 * 1000;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const tokenForNonce = (secret: string, nonce: string) =>
  createHmac("sha256", secret).update(`athrecs-fin-onboarding-v1:${nonce}`).digest("base64url");

export class FinOnboardingError extends Error {
  readonly code: "request_conflict" | "expired";
  readonly status: number;
  constructor(code: "request_conflict" | "expired") {
    super(code);
    this.name = "FinOnboardingError";
    this.code = code;
    this.status = code === "request_conflict" ? 409 : 410;
  }
}

type Handoff = {
  request_key_hash: string;
  token_nonce: string;
  token_hash: string;
  payload_hash: string;
  racing_name: string;
  event_name: string | null;
  year: number | null;
  created_at: string;
  expires_at: string;
  consumed_by: string | null;
};

/** Only the authenticated integration calls this; input carries no account authority. */
export async function createFinSignupLink(
  sql: Sql,
  input: FinSignupInput,
  secret: string,
  now = new Date(),
): Promise<FinSignupLink> {
  const data = finSignupLinkSchema.parse(input);
  if (secret.trim().length < 32) throw new Error("Fin connector is not configured");
  const requestKey = hash(data.requestId);
  const payloadHash = hash(
    JSON.stringify([data.racingName, data.eventName ?? null, data.year ?? null]),
  );
  const nonce = randomBytes(32).toString("base64url");
  const proposedToken = tokenForNonce(secret.trim(), nonce);
  const expiresAt = new Date(now.getTime() + LINK_LIFETIME_MS);

  return sql.transaction(async (tx) => {
    await tx`insert into fin_onboarding_handoffs
      (request_key_hash,token_nonce,token_hash,payload_hash,racing_name,event_name,year,created_at,expires_at)
      values (${requestKey},${nonce},${hash(proposedToken)},${payloadHash},${data.racingName},
        ${data.eventName ?? null},${data.year ?? null},${now},${expiresAt})
      on conflict (request_key_hash) do nothing`;
    const [row] = await tx<Handoff>`select request_key_hash,token_nonce,token_hash,payload_hash,
      racing_name,event_name,year,created_at::text,expires_at::text,consumed_by
      from fin_onboarding_handoffs where request_key_hash=${requestKey} for update`;
    if (!row || new Date(row.expires_at).getTime() <= now.getTime())
      throw new FinOnboardingError("expired");
    if (row.payload_hash !== payloadHash) throw new FinOnboardingError("request_conflict");
    const token = tokenForNonce(secret.trim(), row.token_nonce);
    // A rotated integration secret cannot mint a replacement for an existing link.
    if (hash(token) !== row.token_hash) throw new FinOnboardingError("expired");
    return {
      status: "ready",
      signupUrl: `https://www.athrecs.com/join?continuation=${token}`,
      expiresAt: new Date(row.expires_at).toISOString(),
    };
  });
}

/**
 * Called only by the authenticated, same-origin POST server function. The token
 * preserves hints; it never proves identity, changes consent or grants ownership.
 */
export async function resumeFinSignup(
  sql: Sql,
  continuation: string,
  userId: string,
  now = new Date(),
): Promise<FinResumeResult> {
  if (!parseFinContinuation(continuation) || !userId || userId === "dev-user")
    return { status: "unavailable" };
  return sql.transaction(async (tx) => {
    const [row] = await tx<Handoff>`select request_key_hash,token_nonce,token_hash,payload_hash,
      racing_name,event_name,year,created_at::text,expires_at::text,consumed_by
      from fin_onboarding_handoffs where token_hash=${hash(continuation)} for update`;
    if (
      !row ||
      new Date(row.expires_at).getTime() <= now.getTime() ||
      (row.consumed_by && row.consumed_by !== userId)
    )
      return { status: "unavailable" };
    const [account] = await tx<{ verified: boolean; is_new: boolean }>`
      select "emailVerified" as verified, "createdAt">=${row.created_at}::timestamptz as is_new
      from "user" where id=${userId}`;
    if (!account) return { status: "unavailable" };
    if (!account.verified) return { status: "verify_email" };
    await tx`update fin_onboarding_handoffs set consumed_by=${userId},
      consumed_at=coalesce(consumed_at,${now}::timestamptz) where request_key_hash=${row.request_key_hash}`;
    if (account.is_new) {
      await tx`insert into fin_assisted_signups (user_id,handoff_key,completed_at)
        values (${userId},${row.request_key_hash},${now}) on conflict(user_id) do nothing`;
    }
    const [receipt] = await tx<{ handoff_key: string }>`select handoff_key from fin_assisted_signups
      where user_id=${userId}`;
    return {
      status: "ready",
      racingName: row.racing_name,
      eventName: row.event_name,
      year: row.year,
      expiresAt: new Date(row.expires_at).toISOString(),
      accountStatus:
        receipt?.handoff_key === row.request_key_hash ? "verified_new_signup" : "existing_account",
    };
  });
}

/** Expiry is enforced on every read; hourly cleanup removes the personal hints. */
export async function cleanupFinOnboarding(sql: Sql, now = new Date()): Promise<void> {
  await sql`delete from fin_onboarding_handoffs where expires_at<=${now}`;
  await sql`delete from fin_connector_usage where expires_at<=${now}`;
}
