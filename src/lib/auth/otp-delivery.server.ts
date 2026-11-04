import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
import type { Sql } from "../db";

// Better Auth catches delivery callback failures. Keep the failure local to this
// request so one failed email cannot change another visitor's response.
const delivery = new AsyncLocalStorage<{ failed: boolean }>();

export function recordOtpDeliveryFailure(type: string): void {
  if (type === "sign-in") {
    const state = delivery.getStore();
    if (state) state.failed = true;
  }
}

export async function discardUndeliveredOtp(
  sql: Sql,
  code: { email: string; otp: string; type: string },
): Promise<void> {
  // Matches the configured Better Auth storeOTP="hashed" representation. The
  // hash condition preserves a newer code issued by a concurrent successful send.
  const hash = createHash("sha256").update(code.otp).digest("base64url");
  const identifier = `${code.type}-otp-${code.email.trim().toLowerCase()}`;
  await sql`delete from verification where identifier=${identifier} and value like ${`${hash}:%`}`;
}

export async function handleAuthWithOtpDeliveryStatus(
  request: Request,
  handler: (request: Request) => Promise<Response>,
): Promise<Response> {
  if (
    request.method !== "POST" ||
    new URL(request.url).pathname !== "/api/auth/email-otp/send-verification-otp"
  )
    return handler(request);
  return delivery.run({ failed: false }, async () => {
    const response = await handler(request);
    if (!delivery.getStore()?.failed || !response.ok) return response;
    // Sign-in codes are sent for both new and existing accounts. Other recovery
    // endpoints retain their neutral responses and do not disclose membership.
    return Response.json(
      {
        code: "AUTH_EMAIL_DELIVERY_UNAVAILABLE",
        message: "We could not send your sign-in code. Please try again shortly.",
      },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store", "Retry-After": "60" },
      },
    );
  });
}
