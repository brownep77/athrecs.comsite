import { z } from "zod";

export const reportInput = z
  .object({ days: z.union([z.literal(7), z.literal(28), z.literal(90)]) })
  .strict();
export type ReportInput = z.infer<typeof reportInput>;
export const GOOGLE_SEARCH_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
export const VERCEL_DASHBOARD =
  "https://vercel.com/athrecs-holding-page-set-up/athrecs-comsite/analytics";
export const GOOGLE_DASHBOARD =
  "https://search.google.com/search-console?resource_id=sc-domain%3Aathrecs.com";
export type ReportState<T> =
  | { status: "ready"; fetchedAt: string; report: T }
  | { status: "connect" | "error"; message: string };
export type VisitRow = { label: string; visitors: number; pageviews: number };
export type VisitReport = {
  since: string;
  until: string;
  visitors: number;
  pageviews: number;
  pages: VisitRow[];
  countries: VisitRow[];
  referrers: VisitRow[];
  devices: VisitRow[];
};
export type SearchRow = {
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};
export type SearchReport = {
  since: string;
  until: string;
  property: string;
  totals: SearchRow;
  queries: SearchRow[];
  pages: SearchRow[];
  countries: SearchRow[];
  devices: SearchRow[];
};

export function reportDates(days: number, now = new Date()) {
  // Google defines report dates in Pacific time; exclude today's partial day.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const end = new Date(`${today}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { since: start.toISOString().slice(0, 10), until: end.toISOString().slice(0, 10) };
}

export function athrecsProperty(sites: { siteUrl: string; permissionLevel?: string }[]) {
  const allowed = ["sc-domain:athrecs.com", "https://www.athrecs.com/", "https://athrecs.com/"];
  return allowed.find((property) =>
    sites.some(
      (site) => site.siteUrl === property && site.permissionLevel !== "siteUnverifiedUser",
    ),
  );
}
