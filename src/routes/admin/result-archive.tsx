import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Archive, Database, ExternalLink, FileUp, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResultReconciliationPanel } from "@/components/staff/ResultReconciliationPanel";
import {
  getResultArchiveDashboard,
  type ResultEditionCoverageStatus,
} from "@/lib/athrecs/result-ingestion-api";

export const Route = createFileRoute("/admin/result-archive")({
  head: () => ({
    meta: [
      { title: "Private result archive | ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  loader: () => getResultArchiveDashboard({ data: {} }),
  component: ResultArchivePage,
});

const STATUS_OPTIONS: Array<[ResultEditionCoverageStatus | "all", string]> = [
  ["all", "All statuses"],
  ["complete", "Complete"],
  ["partial", "Partial"],
  ["failed", "Failed"],
  ["queued", "Queued"],
  ["processing", "Processing"],
  ["blocked", "Blocked"],
];

function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}

function formatDate(value: string): string {
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function statusClass(status: string): string {
  if (status === "complete" || status === "completed") {
    return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  }
  if (status === "partial" || status === "completed_with_errors") {
    return "border-amber-500/30 bg-amber-50 text-amber-950";
  }
  if (status === "failed" || status === "blocked") {
    return "border-red-500/30 bg-red-50 text-red-900";
  }
  return "border-sky-500/30 bg-sky-50 text-sky-900";
}

function ResultArchivePage() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState<ResultEditionCoverageStatus | "all">("all");
  const dashboard = useQuery({
    queryKey: ["result-archive", q, sport, status],
    queryFn: () =>
      getResultArchiveDashboard({
        data: { q: q || undefined, sport: sport || undefined, status, limit: 150 },
      }),
    initialData: !q && !sport && status === "all" ? initial : undefined,
    placeholderData: (previous) => previous,
    staleTime: 20_000,
    refetchOnMount: false,
  });

  const data = dashboard.data ?? initial;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Private-by-default archive
          </p>
          <h1 className="font-display text-3xl font-semibold text-fg">Result ingestion & coverage</h1>
          <p className="text-sm leading-6 text-muted">
            Track scanned, uploaded and API-supplied results by sport, event and race edition.
            Participant names and finish times stay out of this staff index and remain available
            only to the secure athlete matching and claim workflow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void dashboard.refetch()}>
            <RefreshCw
              className={dashboard.isFetching ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin" hash="results-import">
              <FileUp className="size-4" aria-hidden="true" /> Import results
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Archive}
          label="Archived results"
          value={data.summary.privateResults + data.summary.publicResults}
          detail={`${formatNumber(data.summary.privateResults)} private`}
        />
        <Metric
          icon={Database}
          label="Event editions tracked"
          value={data.summary.trackedEditions}
          detail={`${formatNumber(data.summary.runs)} ingestion runs`}
        />
        <Metric
          icon={FileUp}
          label="New rows imported"
          value={data.summary.insertedResults}
          detail={`${formatNumber(data.summary.updatedResults)} existing rows refreshed`}
        />
        <Metric
          icon={ShieldCheck}
          label="Public results"
          value={data.summary.publicResults}
          detail="Public figures or explicit opt-in only"
        />
      </section>

      <ResultReconciliationPanel />

      <section className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-[minmax(14rem,1fr)_14rem_14rem]">
          <label className="space-y-1.5 text-xs font-medium text-muted">
            Search event or source
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="London Marathon, official timer…"
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted">
            Sport
            <select
              value={sport}
              onChange={(event) => setSport(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All sports</option>
              {data.sports.map((item) => (
                <option key={item.sport} value={item.sport}>
                  {item.sport} · {formatNumber(item.editionCount)} editions
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted">
            Coverage status
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ResultEditionCoverageStatus | "all")
              }
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">Coverage by event edition</h2>
            <p className="mt-1 text-xs text-muted">
              Event-level tracking only — no participant directory is exposed here.
            </p>
          </div>
          <Badge variant="outline">{formatNumber(data.editions.length)} shown</Badge>
        </div>
        {data.editions.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No result ingestion coverage matches these filters yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] text-left text-sm">
              <thead className="border-b border-border bg-elevated/60 text-[11px] uppercase tracking-wider text-subtle">
                <tr>
                  <th className="px-4 py-3">Sport</th>
                  <th className="px-4 py-3">Event edition</th>
                  <th className="px-4 py-3">Coverage</th>
                  <th className="px-4 py-3">Rows</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {data.editions.map((edition) => (
                  <tr key={edition.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 align-top">
                      <Badge variant="outline">{edition.sport}</Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        to="/races/$slug"
                        params={{ slug: edition.eventSlug }}
                        className="font-semibold text-fg no-underline hover:text-accent"
                      >
                        {edition.eventName}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(edition.eventDate)} · {edition.distanceCode}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge className={statusClass(edition.status)}>{edition.status}</Badge>
                      {edition.errorCount ? (
                        <p className="mt-1 text-xs text-red-700">
                          {edition.errorCount} row error{edition.errorCount === 1 ? "" : "s"}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-muted">
                      <strong className="text-fg">
                        {formatNumber(edition.rowsInserted + edition.rowsUpdated)}
                      </strong>{" "}
                      stored
                      <p className="mt-1 text-xs">
                        {formatNumber(edition.rowsInserted)} new · {formatNumber(edition.rowsUpdated)}
                        {" "}refreshed
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-fg">{edition.sourceName}</p>
                      <p className="mt-1 text-xs capitalize text-muted">
                        {edition.acquisitionMethod}
                      </p>
                      {edition.sourceUrl ? (
                        <a
                          href={edition.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent no-underline hover:underline"
                        >
                          Open source <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">Recent ingestion runs</h2>
            <p className="mt-1 text-xs text-muted">Scans, uploads, API pulls and manual imports.</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link to="/admin/result-links">Manage external result links</Link>
          </Button>
        </div>
        <div className="grid gap-2 p-4">
          {data.runs.length ? (
            data.runs.map((run) => (
              <article
                key={run.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusClass(run.status)}>{run.status}</Badge>
                    <Badge variant="outline">{run.sport}</Badge>
                    <span className="text-xs capitalize text-muted">{run.acquisitionMethod}</span>
                  </div>
                  <p className="mt-2 font-semibold text-fg">{run.sourceName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(run.startedAt).toLocaleString("en-GB")} · {run.editionCount} edition
                    {run.editionCount === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-muted md:text-right">
                  <strong className="text-fg">
                    {formatNumber(run.rowsInserted + run.rowsUpdated)}
                  </strong>{" "}
                  stored
                  <br />
                  <span className="text-xs">
                    {formatNumber(run.rowsDetected)} detected · {formatNumber(run.rowsSkipped)} skipped
                  </span>
                </p>
              </article>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted">No tracked result imports yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Archive;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-subtle">
        <Icon className="size-4 text-accent" aria-hidden="true" /> {label}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-fg">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </article>
  );
}
