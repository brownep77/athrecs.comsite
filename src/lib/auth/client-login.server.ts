import { createHmac, randomBytes } from "node:crypto";
import type { GenericEndpointContext } from "@better-auth/core";
import type { Sql } from "../db";
import { clientSignInMethod } from "../athrecs/client-data";

export async function pruneClientLogins(sql: Sql) {
  await sql`delete from athlete_client_logins where signed_in_at < now()-interval '90 days'`;
  await sql`delete from athlete_client_devices where last_seen_at < now()-interval '90 days'`;
}

function headerText(headers: Headers | undefined, key: string, max: number): string | null {
  const raw = headers?.get(key);
  if (!raw) return null;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* malformed encodings remain plain text */
  }
  return (
    Array.from(decoded)
      .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
      .join("")
      .trim()
      .slice(0, max) || null
  );
}

export function clientGeography(headers: Headers | undefined, trustedVercel: boolean) {
  // These are trusted platform headers only when this function runs on Vercel.
  // Never infer location from a timezone, user profile, language or server region.
  if (!trustedVercel) return { country: null, region: null, city: null };
  const country = headerText(headers, "x-vercel-ip-country", 80);
  return {
    country: country && /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null,
    region: headerText(headers, "x-vercel-ip-country-region", 80),
    city: headerText(headers, "x-vercel-ip-city", 120),
  };
}

export async function recordClientLogin(
  sql: Sql,
  session: { id: string; userId: string; createdAt: Date },
  ctx: GenericEndpointContext | null,
) {
  await pruneClientLogins(sql);
  if (!ctx) return; // Trigger still keeps the login timestamp and reported user agent.
  const origin = new URL(ctx.context.baseURL).origin;
  const secure = origin.startsWith("https:");
  const cookieName = secure ? "__Host-athrecs_device" : "athrecs_device";
  let cookie = await ctx.getSignedCookie(cookieName, ctx.context.secret);
  if (typeof cookie !== "string" || !/^[a-f0-9]{48}$/.test(cookie)) {
    cookie = randomBytes(24).toString("hex");
  }
  const deviceKey = createHmac("sha256", ctx.context.secret)
    .update(JSON.stringify([session.userId, origin, cookie]))
    .digest("hex");
  const geo = clientGeography(ctx.headers ?? ctx.request?.headers, process.env.VERCEL === "1");
  await sql.transaction(async (tx) => {
    const [device] = await tx<{ id: string }>`
      insert into athlete_client_devices(user_id,device_key_hash,first_seen_at,last_seen_at)
      values(${session.userId},${deviceKey},${session.createdAt},${session.createdAt})
      on conflict(user_id,device_key_hash) do update set
        last_seen_at=greatest(athlete_client_devices.last_seen_at,excluded.last_seen_at)
      returning id::text`;
    await tx`update athlete_client_logins set device_id=${device.id}::bigint,
      sign_in_method=${clientSignInMethod(ctx.path)},country_code=${geo.country},region=${geo.region},city=${geo.city}
      where session_id=${session.id} and user_id=${session.userId}`;
  });
  // Host-only, httpOnly, signed, scoped to account in storage. No fingerprinting.
  await ctx.setSignedCookie(cookieName, cookie, ctx.context.secret, {
    secure,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 90 * 24 * 60 * 60,
  });
}
