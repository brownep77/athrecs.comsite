import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import type { Sql } from "../db";
import {
  athrecsProperty,
  reportDates,
  type ReportInput,
  type ReportState,
  type SearchReport,
  type VisitReport,
} from "./core";

const PROJECT = "prj_lbw3shClq8n6SThzl8i825UPBp6I";
const TEAM = "team_9LaPtmxxgJlZ80PpdxggOibC";
const count = z.number().finite().nonnegative();
const visitCounts = z.object({ visitors: count, pageviews: count });
const visitRows = z.object({ data: z.array(visitCounts.passthrough()) });
const searchRow = z.object({
  keys: z.array(z.string()).optional(),
  clicks: count,
  impressions: count,
  ctr: count.max(1),
  position: count,
});
const searchRows = z.object({ rows: z.array(searchRow).optional() });
class ProviderError extends Error {
  constructor(readonly status: number) {
    super("Reporting provider request failed");
  }
}

async function providerJson(url: string, token: string, body?: object) {
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
    redirect: "error",
  });
  if (!response.ok) throw new ProviderError(response.status);
  return response.json();
}

function encryptionKey() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Secure reporting storage is not configured.");
  return createHash("sha256").update(`athrecs-web-stats:v1:${secret}`).digest();
}
export function encryptCredential(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(PROJECT));
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}
export function decryptCredential(value: string) {
  const [version, iv, tag, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !tag || !encrypted)
    throw new Error("Invalid reporting connection.");
  const cipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"));
  cipher.setAAD(Buffer.from(PROJECT));
  cipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([cipher.update(Buffer.from(encrypted, "base64")), cipher.final()]).toString(
    "utf8",
  );
}

async function vercelQuery(token: string, since: string, until: string, dimension?: string) {
  const params = new URLSearchParams({
    projectId: PROJECT,
    teamId: TEAM,
    since,
    until,
    filter: "environment eq 'production'",
  });
  if (dimension) {
    params.set("by", dimension);
    params.set("limit", "10");
  }
  return providerJson(
    `https://api.vercel.com/v1/query/web-analytics/visits/${dimension ? "aggregate" : "count"}?${params}`,
    token,
  );
}

export async function saveVercelConnection(sql: Sql, token: string, userId: string) {
  const encrypted = encryptCredential(token);
  const until = new Date().toISOString();
  const since = new Date(Date.now() - 86400_000).toISOString();
  try {
    visitCounts.parse((await vercelQuery(token, since, until)).data);
  } catch {
    throw new Error(
      "This token could not read AthRecs Web Analytics. Check its team access and expiry.",
    );
  }
  await sql`insert into staff_web_stats_connections(provider, credential_ciphertext, updated_by)
    values('vercel', ${encrypted}, ${userId}) on conflict(provider) do update
    set credential_ciphertext=excluded.credential_ciphertext, updated_by=excluded.updated_by, updated_at=now()`;
  return { connected: true };
}

export async function readVercelReport(
  sql: Sql,
  { days }: ReportInput,
): Promise<ReportState<VisitReport>> {
  try {
    const [connection] = await sql<{
      credential_ciphertext: string;
    }>`select credential_ciphertext from staff_web_stats_connections where provider='vercel'`;
    const token =
      process.env.ATHRECS_VERCEL_ANALYTICS_TOKEN?.trim() ||
      (connection ? decryptCredential(connection.credential_ciphertext) : "");
    if (!token)
      return {
        status: "connect",
        message: "Tracking is enabled. Connect a Vercel reporting token to show its figures here.",
      };
    // Rolling window includes today's traffic, particularly useful on launch day.
    const until = new Date().toISOString();
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const dimensions = ["requestPath", "country", "referrerHostname", "deviceType"];
    const [total, ...groups] = await Promise.all([
      vercelQuery(token, since, until),
      ...dimensions.map((by) => vercelQuery(token, since, until, by)),
    ]);
    const totals = visitCounts.parse(total.data);
    const rows = groups.map((group, index) =>
      visitRows.parse(group).data.map((row) => ({
        label:
          typeof row[dimensions[index]] === "string" ? String(row[dimensions[index]]) : "Unknown",
        visitors: row.visitors,
        pageviews: row.pageviews,
      })),
    );
    return {
      status: "ready",
      fetchedAt: until,
      report: {
        since,
        until,
        ...totals,
        pages: rows[0],
        countries: rows[1],
        referrers: rows[2].map((row) => ({ ...row, label: row.label || "Direct / unknown" })),
        devices: rows[3],
      },
    };
  } catch (error) {
    const denied = error instanceof ProviderError && [401, 403].includes(error.status);
    return {
      status: denied ? "connect" : "error",
      message: denied
        ? "The Vercel reporting token has expired or cannot access this project. Reconnect below."
        : "Vercel figures could not be loaded. Try again or open the Vercel dashboard. This does not mean traffic is zero.",
    };
  }
}

export async function readGoogleReport(
  token: string,
  { days }: ReportInput,
): Promise<ReportState<SearchReport>> {
  try {
    const sites = z
      .object({
        siteEntry: z
          .array(z.object({ siteUrl: z.string(), permissionLevel: z.string().optional() }))
          .optional(),
      })
      .parse(await providerJson("https://www.googleapis.com/webmasters/v3/sites", token));
    const property = athrecsProperty(sites.siteEntry ?? []);
    if (!property)
      return {
        status: "connect",
        message:
          "This Google account cannot access an AthRecs Search Console property. Use the Google account that owns or has access to athrecs.com.",
      };
    const { since, until } = reportDates(days);
    const query = async (dimensions: string[]) =>
      searchRows.parse(
        await providerJson(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
          token,
          {
            startDate: since,
            endDate: until,
            type: "web",
            dataState: "final",
            dimensions,
            rowLimit: 10,
          },
        ),
      );
    const responses = await Promise.all(
      [[], ["query"], ["page"], ["country"], ["device"]].map(query),
    );
    const groups = responses.map((result) =>
      (result.rows ?? []).map((row) => ({
        label: row.keys?.[0] ?? "Total",
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      })),
    );
    return {
      status: "ready",
      fetchedAt: new Date().toISOString(),
      report: {
        since,
        until,
        property,
        totals: groups[0][0] ?? { label: "Total", clicks: 0, impressions: 0, ctr: 0, position: 0 },
        queries: groups[1],
        pages: groups[2],
        countries: groups[3],
        devices: groups[4],
      },
    };
  } catch (error) {
    const denied = error instanceof ProviderError && [401, 403].includes(error.status);
    return {
      status: denied ? "connect" : "error",
      message: denied
        ? "Google has not allowed this report. Reconnect with Search Console access. If it still fails, enable the Search Console API in the site's Google Cloud project."
        : "Google Search Console could not be refreshed. Try again or open Google directly. This does not mean search traffic is zero.",
    };
  }
}
