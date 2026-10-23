import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { Sql } from "../db";
import { clientGeography } from "./client-login.server";
import { clientSignInMethod } from "../athrecs/client-data";

type Capture = { sessionId?: string; userId?: string };
const capture = new AsyncLocalStorage<Capture>();
export function captureCreatedSession(session: { id: string; userId: string }) {
  const state = capture.getStore();
  if (state) Object.assign(state, { sessionId: session.id, userId: session.userId });
}
const errors = new Set([
  "INVALID_EMAIL_OR_PASSWORD",
  "INVALID_PASSWORD",
  "INVALID_OTP",
  "OTP_EXPIRED",
  "TOO_MANY_ATTEMPTS",
  "TOO_MANY_REQUESTS",
  "EMAIL_NOT_VERIFIED",
  "USER_NOT_FOUND",
  "USER_ALREADY_EXISTS",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "INVALID_EMAIL",
  "INVALID_ORIGIN",
  "INVALID_CALLBACK_URL",
  "PROVIDER_NOT_FOUND",
  "FAILED_TO_GET_USER_INFO",
  "FAILED_TO_CREATE_USER",
  "FAILED_TO_CREATE_SESSION",
  "INVALID_CREDENTIALS",
  "ACCOUNT_NOT_LINKED",
  "STATE_MISMATCH",
  "access_denied",
  "invalid_code",
  "state_mismatch",
  "oauth_callback_error",
  "unable_to_get_user_info",
  "account_not_linked",
]);
function errorCode(value: unknown, status: number) {
  return typeof value === "string" && errors.has(value)
    ? value
    : status >= 500
      ? "SERVER_ERROR"
      : status === 429
        ? "RATE_LIMITED"
        : "AUTH_REQUEST_REJECTED";
}
export async function boundedJson(
  request: Request | Response,
  max = 8192,
): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) return {};
  const reader = request.clone().body?.getReader();
  if (!reader) return {};
  let text = "",
    size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) {
        void reader.cancel();
        return {};
      }
      text += decoder.decode(value, { stream: true });
    }
    const data: unknown = JSON.parse(text + decoder.decode());
    return data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  } catch {
    return {};
  } finally {
    reader.releaseLock();
  }
}
function authRoute(path: string) {
  const route = path.replace(/^\/api\/auth/, "");
  const exact = [
    "/sign-in/email",
    "/sign-in/email-otp",
    "/sign-in/social",
    "/sign-up/email",
    "/sign-out",
    "/email-otp/send-verification-otp",
    "/email-otp/verify-email",
    "/email-otp/reset-password",
    "/request-password-reset",
    "/reset-password",
    "/verify-email",
    "/send-verification-email",
    "/oauth2/sign-in",
  ];
  if (exact.includes(route)) return route;
  if (/^\/(?:oauth2\/)?callback\/[a-z-]+$/.test(route))
    return route.replace(/\/[^/]+$/, "/:provider");
  // Successful session refreshes are intentionally excluded. Errors still count.
  if (route === "/get-session") return route;
  return "/other-auth";
}
function operation(route: string) {
  if (route.includes("callback")) return "provider_callback";
  if (route.includes("sign-out")) return "sign_out";
  if (route.includes("send-verification")) return "verification_requested";
  if (route.includes("reset-password")) return "password_recovery";
  if (route.includes("sign-up")) return "signup_request";
  if (route.includes("get-session")) return "session_check";
  return "sign_in_request";
}
export async function pruneAccessEvents(sql: Sql) {
  await sql`delete from athlete_access_events where occurred_at < now()-interval '90 days'`;
  await sql`delete from athlete_diagnostic_limits where window_start < now()-interval '1 day'`;
}

/** Always preserve the original auth response, even if diagnostics fail. */
export async function handleAuthWithDiagnostics(
  request: Request,
  handler: (request: Request) => Promise<Response>,
  getSql: () => Promise<Sql>,
  getActor?: () => Promise<string | null>,
) {
  const state: Capture = {};
  return capture.run(state, async () => {
    const started = performance.now(),
      requestId = randomUUID();
    const url = new URL(request.url),
      route = authRoute(url.pathname);
    // Extract only the entered email/provider; never pass a request body to storage.
    const input = await boundedJson(request);
    const entered =
      typeof input.email === "string" &&
      /^[^\s@]{1,128}@[^\s@]{1,125}\.[^\s@]+$/.test(input.email) &&
      input.email.length <= 254
        ? input.email.trim().toLowerCase()
        : null;
    const method = clientSignInMethod(
      url.pathname.replace(/^\/api\/auth/, ""),
      {},
      { provider: input.provider },
    );
    let response: Response | undefined;
    let actor: string | null = null;
    if (route === "/sign-out" && getActor) {
      try {
        actor = await getActor();
      } catch {
        /* Auth itself decides the response. */
      }
    }
    try {
      response = await handler(request);
      return response;
    } finally {
      const duration = Math.min(2147483647, Math.round(performance.now() - started));
      try {
        const status = response?.status ?? 500;
        const body = status >= 400 && response ? await boundedJson(response) : {};
        const redirect = response?.headers.get("location");
        const redirectError = redirect ? new URL(redirect, url).searchParams.get("error") : null;
        const failed = status >= 400 || Boolean(redirectError);
        if (route !== "/get-session" || failed) {
          const sql = await getSql();
          const release = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 40) ?? null;
          if (state.sessionId) {
            await sql`update athlete_client_logins set request_id=${requestId},host=${url.hostname},route=${route},duration_ms=${duration},http_status=${status},release_id=${release} where session_id=${state.sessionId}`;
          }
          if (!state.sessionId || failed) {
            const geo = clientGeography(request.headers, process.env.VERCEL === "1");
            await sql`insert into athlete_access_events(user_id,attempted_email,kind,outcome,error_code,request_id,host,route,sign_in_method,user_agent,country_code,region,city,duration_ms,http_status,release_id,source)
              values(${actor},${entered},${operation(route)},${status >= 500 ? "error" : failed ? "failed" : "info"},${failed ? errorCode(body.code ?? redirectError, status) : null},${requestId},${url.hostname},${route},${method},${(request.headers.get("user-agent") ?? "").slice(0, 1024)},${geo.country},${geo.region},${geo.city},${duration},${status},${release},'server')`;
          }
          await pruneAccessEvents(sql);
        }
      } catch {
        console.warn(`[auth-diagnostics] Capture unavailable; reference ${requestId}`);
      }
    }
  });
}
