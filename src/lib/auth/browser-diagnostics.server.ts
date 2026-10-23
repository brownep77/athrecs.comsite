import { createHmac, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Sql } from "../db";
import { browserErrorCodes, diagnosticKinds, diagnosticRoute } from "../athrecs/access-diagnostics";
import { boundedJson, pruneAccessEvents } from "./access-diagnostics.server";
import { clientGeography } from "./client-login.server";

const schema = z
  .object({
    kind: z.enum(diagnosticKinds),
    code: z.enum(browserErrorCodes),
    route: z.string().max(400),
    online: z.boolean(),
    viewport: z.enum(["small", "medium", "large"]),
    reference: z.string().uuid(),
  })
  .strict();

export async function recordBrowserDiagnostic(
  request: Request,
  sql: Sql,
  getUser: () => Promise<string | null>,
) {
  const headers = { "cache-control": "private, no-store", "x-robots-tag": "noindex" };
  const url = new URL(request.url);
  if (
    request.headers.get("origin") !== url.origin ||
    ![null, "same-origin"].includes(request.headers.get("sec-fetch-site"))
  )
    return new Response(null, { status: 403, headers });
  const data = schema.safeParse(await boundedJson(request, 2048));
  if (!data.success) return new Response(null, { status: 400, headers });
  const secret = process.env.BETTER_AUTH_SECRET;
  const ip =
    process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]
      : null;
  const key =
    secret && ip
      ? createHmac("sha256", secret)
          .update(`diagnostics:${new Date().toISOString().slice(0, 10)}:${ip}`)
          .digest("hex")
      : "unknown-network";
  const accepted = await sql.transaction(async (tx) => {
    for (const [bucket, limit] of [
      ["all", 300],
      [key, 10],
    ] as const) {
      const [row] = await tx<{
        hits: number;
      }>`insert into athlete_diagnostic_limits(bucket,window_start,hits)
        values(${bucket},date_trunc('minute',now()),1) on conflict(bucket) do update set
        hits=case when athlete_diagnostic_limits.window_start=date_trunc('minute',now()) then athlete_diagnostic_limits.hits+1 else 1 end,
        window_start=date_trunc('minute',now()) returning hits`;
      if (row.hits > limit) return false;
    }
    return true;
  });
  if (!accepted) return new Response(null, { status: 429, headers });
  const userId = await getUser(); // Resolve on the server, never trust a client user ID/email.
  const geo = clientGeography(request.headers, process.env.VERCEL === "1");
  const { kind, code, route, online, viewport, reference } = data.data;
  await sql`insert into athlete_access_events(user_id,kind,outcome,error_code,request_id,host,route,user_agent,country_code,region,city,release_id,online,viewport,source)
    values(${userId},${kind},'error',${code},${reference || randomUUID()},${url.hostname},${diagnosticRoute(route)},${(request.headers.get("user-agent") ?? "").slice(0, 1024)},${geo.country},${geo.region},${geo.city},${process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 40) ?? null},${online},${viewport},'browser')`;
  await pruneAccessEvents(sql);
  return new Response(null, { status: 204, headers });
}
