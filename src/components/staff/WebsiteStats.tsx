import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  connectGoogleSearchStats,
  connectVercelStats,
  getGoogleSearchStats,
  getVercelStats,
} from "@/lib/web-stats/api";
import {
  GOOGLE_DASHBOARD,
  VERCEL_DASHBOARD,
  type ReportInput,
  type SearchRow,
  type VisitRow,
} from "@/lib/web-stats/core";

const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 1 });
const date = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { timeZone: "Europe/London" });

export function WebsiteStats() {
  const [days, setDays] = useState<ReportInput["days"]>(28);
  const [token, setToken] = useState("");
  const queryClient = useQueryClient();
  const vercel = useQuery({
    queryKey: ["web-stats-vercel", days],
    queryFn: () => getVercelStats({ data: { days } }),
    staleTime: 300_000,
    retry: false,
  });
  const google = useQuery({
    queryKey: ["web-stats-google", days],
    queryFn: () => getGoogleSearchStats({ data: { days } }),
    staleTime: 300_000,
    retry: false,
  });
  const saveToken = useMutation({
    mutationFn: () => connectVercelStats({ data: { token } }),
    onSuccess: () => {
      setToken("");
      void queryClient.invalidateQueries({ queryKey: ["web-stats-vercel"] });
    },
  });
  const connectGoogle = useMutation({
    mutationFn: () => connectGoogleSearchStats(),
    onSuccess: ({ url }) => window.location.assign(url),
  });
  const traffic = vercel.data?.status === "ready" ? vercel.data.report : null;
  const search = google.data?.status === "ready" ? google.data.report : null;

  return (
    <div className="space-y-6" id="website-stats">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Website traffic & Google</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            See how people visit AthRecs and how they find it in Google Search. These reports
            measure different activity, so their totals will differ.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm font-medium">
            Reporting period
            <select
              aria-label="Website reporting period"
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3"
              value={days}
              onChange={(event) => setDays(Number(event.target.value) as ReportInput["days"])}
            >
              <option value={7}>Last 7 days</option>
              <option value={28}>Last 28 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
          <Button
            variant="secondary"
            disabled={vercel.isFetching || google.isFetching}
            onClick={() => {
              void vercel.refetch();
              void google.refetch();
            }}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh web stats
          </Button>
        </div>
      </div>

      <section
        aria-labelledby="vercel-stats-heading"
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="vercel-stats-heading" className="text-xl font-semibold">
            Vercel Web Analytics
          </h3>
          <ReportLink href={VERCEL_DASHBOARD}>Open Vercel dashboard</ReportLink>
        </div>
        <p className="text-sm text-slate-600">
          Consented visits to public AthRecs pages. Tracking started on 14 October 2026; earlier
          visits are unavailable. Staff and private account pages are excluded.
        </p>
        {vercel.isPending ? <p role="status">Loading visitor statistics…</p> : null}
        {vercel.isError ? (
          <p role="alert" className="text-red-800">
            Visitor statistics could not be refreshed. Try again.
            {traffic ? " The last loaded figures remain below." : ""}
          </p>
        ) : null}
        {vercel.data && vercel.data.status !== "ready" ? (
          <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-950">
            {vercel.data.message}
          </p>
        ) : null}
        {traffic ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Visitors" value={number(traffic.visitors)} />
              <Metric label="Page views" value={number(traffic.pageviews)} />
            </div>
            <p className="text-xs text-slate-500">
              Rolling period: {date(traffic.since)}–{date(traffic.until)}, including today.{" "}
              {vercel.data?.status === "ready" ? <Updated value={vercel.data.fetchedAt} /> : null}
            </p>
            {!traffic.pageviews ? (
              <p className="text-sm text-slate-600">No page views recorded in this period yet.</p>
            ) : null}
            <div className="grid gap-5 xl:grid-cols-2">
              <Visits title="Popular pages" label="Page" rows={traffic.pages} />
              <Visits title="Traffic sources" label="Source" rows={traffic.referrers} />
              <Visits title="Visitor countries" label="Country" rows={traffic.countries} />
              <Visits title="Visitor devices" label="Device" rows={traffic.devices} />
            </div>
            <p className="text-xs text-slate-500">
              Top 10 groups per table. Visitors can appear in more than one group; do not add the
              rows to calculate total visitors.
            </p>
          </>
        ) : null}
        <details
          className="rounded-lg border border-slate-200 p-4"
          open={vercel.data?.status === "connect" ? true : undefined}
        >
          <summary className="cursor-pointer text-sm font-semibold">
            {traffic ? "Update Vercel reporting connection" : "Connect Vercel reporting"}
          </summary>
          <form
            className="mt-4 max-w-xl space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              saveToken.mutate();
            }}
          >
            <p className="text-sm leading-6 text-slate-600">
              Create a reporting token in{" "}
              <a
                className="underline"
                href="https://vercel.com/account/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel account settings
              </a>{" "}
              for the AthRecs team, then connect it here. The token is encrypted on the server and
              is never shown again.
            </p>
            <label className="grid gap-1.5 text-sm font-medium">
              Vercel token
              <input
                type="password"
                name="vercel-reporting-token"
                autoComplete="off"
                spellCheck={false}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                minLength={15}
                maxLength={1000}
                required
                className="min-h-11 rounded-lg border border-slate-300 px-3"
              />
            </label>
            <Button type="submit" disabled={saveToken.isPending || token.trim().length < 15}>
              {saveToken.isPending ? "Checking connection…" : "Connect Vercel"}
            </Button>
            {saveToken.isError ? (
              <p role="alert" className="text-sm text-red-800">
                Connection failed. Check that the token has access to the AthRecs team and has not
                expired.
              </p>
            ) : null}
            {saveToken.isSuccess ? (
              <p role="status" className="text-sm text-emerald-800">
                Vercel reporting connected.
              </p>
            ) : null}
          </form>
        </details>
      </section>

      <section
        aria-labelledby="google-stats-heading"
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="google-stats-heading" className="text-xl font-semibold">
            Google Search Console
          </h3>
          <ReportLink href={GOOGLE_DASHBOARD}>Open Google Search Console</ReportLink>
        </div>
        <p className="text-sm text-slate-600">
          Google Search clicks, impressions and rankings. Google reports in Pacific time; this view
          uses complete days through yesterday and finalized data, which can arrive later.
        </p>
        {google.isPending ? <p role="status">Loading Google search statistics…</p> : null}
        {google.isError ? (
          <p role="alert" className="text-red-800">
            Google statistics could not be refreshed. Try again.
            {search ? " The last loaded figures remain below." : ""}
          </p>
        ) : null}
        {google.data && google.data.status !== "ready" ? (
          <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-950">
            {google.data.message}
          </p>
        ) : null}
        {search ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Search clicks" value={number(search.totals.clicks)} />
              <Metric label="Search impressions" value={number(search.totals.impressions)} />
              <Metric label="Click-through rate" value={`${number(search.totals.ctr * 100)}%`} />
              <Metric
                label="Average position"
                value={search.totals.impressions ? number(search.totals.position) : "—"}
              />
            </div>
            <p className="text-xs text-slate-500">
              {search.since}–{search.until} · Property: {search.property}.{" "}
              {google.data?.status === "ready" ? <Updated value={google.data.fetchedAt} /> : null}
            </p>
            {!search.totals.impressions ? (
              <p className="text-sm text-slate-600">
                Google has not returned search impressions for this period.
              </p>
            ) : null}
            <div className="grid gap-5 xl:grid-cols-2">
              <SearchTable title="Top search terms" label="Search term" rows={search.queries} />
              <SearchTable title="Pages found in Google" label="Page" rows={search.pages} />
              <SearchTable title="Search countries" label="Country" rows={search.countries} />
              <SearchTable title="Search devices" label="Device" rows={search.devices} />
            </div>
            <p className="text-xs text-slate-500">
              Top 10 rows by clicks. Google omits some search terms for privacy; table sums can
              differ from the overall totals. Indexing details are available in Search Console.
            </p>
          </>
        ) : null}
        <div className="space-y-2">
          <Button
            variant="secondary"
            disabled={connectGoogle.isPending}
            onClick={() => connectGoogle.mutate()}
          >
            {connectGoogle.isPending
              ? "Opening Google…"
              : search
                ? "Reconnect Google Search Console"
                : "Connect Google Search Console"}
          </Button>
          <p className="text-xs text-slate-500">
            Read-only access for your staff Google account. Choose the account with access to
            athrecs.com. This does not change ordinary athlete sign-in.
          </p>
          {connectGoogle.isError ? (
            <p role="alert" className="text-sm text-red-800">
              Google could not be opened. Sign in to the staff backend again and retry.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ReportLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cyan-800 underline underline-offset-4"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ExternalLink className="size-4" aria-hidden="true" />
    </a>
  );
}
function Updated({ value }: { value: string }) {
  return (
    <>Updated {new Date(value).toLocaleString("en-GB", { timeZone: "Europe/London" })} (UK time).</>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
function Table({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="min-w-0 space-y-2">
      <h4 className="font-semibold">{title}</h4>
      <div
        className="overflow-x-auto rounded-lg border border-slate-200"
        tabIndex={0}
        role="region"
        aria-label={title}
      >
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th scope="col" key={header} className="px-3 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-200">
                {row.map((value, column) => (
                  <td
                    key={column}
                    className={`px-3 py-3 ${column ? "tabular-nums whitespace-nowrap" : "max-w-sm break-words [overflow-wrap:anywhere]"}`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? (
          <p className="p-4 text-sm text-slate-500">No rows reported for this period.</p>
        ) : null}
      </div>
    </div>
  );
}
function Visits({ title, label, rows }: { title: string; label: string; rows: VisitRow[] }) {
  return (
    <Table
      title={title}
      headers={[label, "Visitors", "Views"]}
      rows={rows.map((row) => [row.label, number(row.visitors), number(row.pageviews)])}
    />
  );
}
function SearchTable({ title, label, rows }: { title: string; label: string; rows: SearchRow[] }) {
  return (
    <Table
      title={title}
      headers={[label, "Clicks", "Impressions", "CTR", "Position"]}
      rows={rows.map((row) => [
        row.label,
        number(row.clicks),
        number(row.impressions),
        `${number(row.ctr * 100)}%`,
        row.impressions ? number(row.position) : "—",
      ])}
    />
  );
}
