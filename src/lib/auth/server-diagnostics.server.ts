import { randomUUID } from "node:crypto";
import { diagnosticRoute } from "../athrecs/access-diagnostics";
import { clientGeography } from "./client-login.server";
import { pruneAccessEvents } from "./access-diagnostics.server";

export async function recordServerFailure(request: Request, status: number, durationMs: number) {
  const reference = randomUUID();
  try {
    const { getSql } = await import("../db");
    const sql = await getSql();
    const geo = clientGeography(request.headers, process.env.VERCEL === "1");
    const url = new URL(request.url);
    await sql`insert into athlete_access_events(kind,outcome,error_code,request_id,host,route,user_agent,country_code,region,city,http_status,duration_ms,release_id,source)
      values('server_error','error','SERVER_REQUEST_ERROR',${reference},${url.hostname},${diagnosticRoute(url.pathname)},${(request.headers.get("user-agent") ?? "").slice(0, 1024)},${geo.country},${geo.region},${geo.city},${status},${Math.min(2147483647, Math.round(durationMs))},${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 40) ?? null},'server')`;
    await pruneAccessEvents(sql);
  } catch {
    console.warn(`[server-diagnostics] Capture unavailable; reference ${reference}`);
  }
}
