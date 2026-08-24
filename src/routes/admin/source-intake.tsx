import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  FileUp,
  Play,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import {
  getSourceManagement,
  importSourceCsv,
  previewSourceImportCsv,
  processManagedCrawlQueueNow,
  queueManagedCrawlsNow,
  reviewManagedSourceNow,
} from "@/lib/athrecs/source-management-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SOURCE_HEADERS =
  "source_id,source_name,start_url,source_type,enabled,source_section,region_scope,country_focus,coverage_scope,coverage_start_year,coverage_end_year,surface_scope,timing_scope,chip_timed_status,permission_url,allowed_domains,race_link_include_regex,race_link_exclude_regex,profile,follow_history_links,max_pages,rate_limit_seconds,rights_status,notes\n";

// The Vite build regenerates the checked-in route tree.
// @ts-expect-error This literal route is generated during the build.
export const Route = createFileRoute("/admin/source-intake")({
  head: () => ({
    meta: [
      { title: "Source intake and crawl queue — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: SourceIntakePage,
});

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function reviewTone(status: string): string {
  if (status === "approved") return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  if (status === "manual_only") return "border-sky-500/30 bg-sky-50 text-sky-900";
  if (status === "rejected") return "border-red-500/30 bg-red-50 text-red-900";
  return "border-amber-500/30 bg-amber-50 text-amber-900";
}

function previewTone(status: string): string {
  if (status === "ready") return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  if (status === "update") return "border-sky-500/30 bg-sky-50 text-sky-900";
  if (status === "possible_duplicate") {
    return "border-amber-500/30 bg-amber-50 text-amber-900";
  }
  return "border-red-500/30 bg-red-50 text-red-900";
}

function SourceIntakePage() {
  const queryClient = useQueryClient();
  const [csv, setCsv] = useState(SOURCE_HEADERS);
  const [preview, setPreview] = useState<
    Awaited<ReturnType<typeof previewSourceImportCsv>> | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);

  const dashboard = useQuery({
    queryKey: ["source-management"],
    queryFn: () => getSourceManagement(),
    refetchInterval: 15_000,
  });

  const previewMutation = useMutation({
    mutationFn: () => previewSourceImportCsv({ data: { csv } }),
    onSuccess: (result) => {
      setPreview(result);
      setMessage(
        `Checked ${result.counts.total.toLocaleString()} rows: ${result.counts.ready.toLocaleString()} new, ${result.counts.update.toLocaleString()} updates, ${result.counts.possibleDuplicate.toLocaleString()} possible duplicates and ${(result.counts.exactDuplicate + result.counts.invalid).toLocaleString()} blocked.`,
      );
    },
    onError: (error) => {
      setPreview(null);
      setMessage(errorMessage(error));
    },
  });

  const importMutation = useMutation({
    mutationFn: () => importSourceCsv({ data: { csv } }),
    onSuccess: (result) => {
      setPreview(result.preview);
      setMessage(
        `Imported ${result.imported.toLocaleString()} new sources and updated ${result.updated.toLocaleString()}; ${result.skipped.toLocaleString()} rows were skipped safely.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["source-management"] });
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const reviewMutation = useMutation({
    mutationFn: (input: {
      sourceId: string;
      decision: "approved" | "manual_only" | "rejected";
      duplicateStatus?: "new" | "update";
      note: string;
    }) => reviewManagedSourceNow({ data: input }),
    onSuccess: (source) => {
      setMessage(`${source.source_name} is now ${source.review_status.replaceAll("_", " ")}.`);
      void queryClient.invalidateQueries({ queryKey: ["source-management"] });
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const queueMutation = useMutation({
    mutationFn: () => queueManagedCrawlsNow({ data: {} }),
    onSuccess: (result) => {
      setMessage(
        `Queued ${result.queued.toLocaleString()} approved sources; ${result.alreadyActive.toLocaleString()} already had an active run.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["source-management"] });
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  const processMutation = useMutation({
    mutationFn: () => processManagedCrawlQueueNow({ data: { batchSize: 3 } }),
    onSuccess: (result) => {
      const candidates = result.results.reduce(
        (total, row) =>
          total + ("candidatesFound" in row ? Number(row.candidatesFound ?? 0) : 0),
        0,
      );
      setMessage(
        `Processed ${result.processed.toLocaleString()} page${result.processed === 1 ? "" : "s"} and staged ${candidates.toLocaleString()} private fixture candidate${candidates === 1 ? "" : "s"}.`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(errorMessage(error)),
  });

  async function loadCsv(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage("The source CSV is larger than the 2 MB limit.");
      return;
    }
    setCsv(await file.text());
    setPreview(null);
    setMessage(null);
  }

  function decideSource(
    source: NonNullable<typeof dashboard.data>["sources"][number],
    decision: "approved" | "manual_only" | "rejected",
  ) {
    const note = window.prompt(
      decision === "approved"
        ? "Record the terms/robots, selector and duplicate evidence used to approve this source."
        : decision === "manual_only"
          ? "Explain why this website is retained for manual research only."
          : "Explain why this source is rejected.",
      source.review_note ?? source.duplicate_note ?? "",
    );
    if (!note?.trim()) return;
    reviewMutation.mutate({
      sourceId: source.source_id,
      decision,
      duplicateStatus:
        decision === "approved" && source.duplicate_status === "possible_duplicate"
          ? "new"
          : undefined,
      note,
    });
  }

  const counts = dashboard.data?.counts;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Controlled source onboarding
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
            Bulk source intake and crawl queue
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            Upload websites, check source duplicates, review crawl rights and selectors, then run
            small rate-limited event-metadata crawls. Discoveries remain private until staff verify
            the genuine official website, fixture facts and every public entry or results link.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to={"/admin/sources" as never}>View controlled registry</Link>
          </Button>
          <Button asChild>
            <Link to={"/admin/verification" as never}>Open verification queue</Link>
          </Button>
        </div>
      </header>

      {counts ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Summary label="Managed" value={counts.total} />
          <Summary label="Pending" value={counts.pending} tone="held" />
          <Summary label="Approved" value={counts.approved} tone="ready" />
          <Summary label="Manual only" value={counts.manualOnly} tone="info" />
          <Summary label="Active crawls" value={counts.activeRuns} />
          <Summary label="Queued pages" value={counts.pendingPages} />
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent">
          {message}
        </p>
      ) : null}

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">1. Upload source CSV</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              The importer accepts the existing 24-column ATHRECS registry format. Every uploaded
              row is stored disabled and pending, even when its CSV enabled flag is 1.
            </p>
          </div>
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-elevated px-4 text-sm font-medium text-fg hover:border-accent hover:text-accent">
            <FileUp className="size-4" aria-hidden="true" />
            Choose CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => void loadCsv(event.target.files?.[0])}
            />
          </label>
        </div>
        <textarea
          value={csv}
          rows={12}
          spellCheck={false}
          onChange={(event) => {
            setCsv(event.target.value);
            setPreview(null);
            setMessage(null);
          }}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-fg outline-none focus:ring-2 focus:ring-accent/30"
          aria-label="Website source CSV"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={!csv.trim() || previewMutation.isPending || importMutation.isPending}
            onClick={() => previewMutation.mutate()}
          >
            <SearchCheck className="size-4" aria-hidden="true" />
            {previewMutation.isPending ? "Checking…" : "Preview and check duplicates"}
          </Button>
          <Button
            type="button"
            disabled={!preview || importMutation.isPending || previewMutation.isPending}
            onClick={() => importMutation.mutate()}
          >
            {importMutation.isPending ? "Importing…" : "Import reviewable rows"}
          </Button>
          <p className="text-xs text-subtle">
            Exact duplicates and invalid rows are skipped. Possible duplicates stay held for staff.
          </p>
        </div>
      </section>

      {preview ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-fg">Import preview</h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
            <table className="w-full min-w-[68rem] text-left text-sm">
              <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Country / coverage</th>
                  <th className="px-3 py-2">Rights status</th>
                  <th className="px-3 py-2">Issues</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={`${row.rowNumber}-${row.source.source_id}`} className="border-t border-border align-top">
                    <td className="px-3 py-3 tabular text-muted">{row.rowNumber}</td>
                    <td className="max-w-sm px-3 py-3">
                      <p className="font-medium text-fg">{row.source.source_name}</p>
                      <a
                        href={row.source.start_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 break-all text-xs text-accent no-underline hover:underline"
                      >
                        {row.source.start_url}
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={previewTone(row.status)}>
                        {row.status.replaceAll("_", " ")}
                      </Badge>
                      {row.duplicateOf ? (
                        <p className="mt-1 text-xs text-subtle">Matches {row.duplicateOf}</p>
                      ) : null}
                    </td>
                    <td className="max-w-xs px-3 py-3 text-muted">
                      <p>{row.source.country_focus}</p>
                      <p className="mt-1 text-xs">{row.source.coverage_scope}</p>
                    </td>
                    <td className="max-w-xs px-3 py-3 text-muted">{row.source.rights_status}</td>
                    <td className="max-w-md px-3 py-3 text-xs text-muted">
                      {row.issues.length ? row.issues.join("; ") : "No blocking issue"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">2. Review managed sources</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              Approval permits event-level metadata only. Sources blocked by terms or published
              crawl rules must remain manual-only or rejected.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={dashboard.isFetching}
              onClick={() => void dashboard.refetch()}
            >
              <RefreshCw className={`size-4 ${dashboard.isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              type="button"
              disabled={queueMutation.isPending || !counts?.approved}
              onClick={() => queueMutation.mutate()}
            >
              <Play className="size-4" aria-hidden="true" />
              {queueMutation.isPending ? "Queueing…" : "Queue approved sources"}
            </Button>
            <Button
              type="button"
              disabled={processMutation.isPending || !counts?.pendingPages}
              onClick={() => processMutation.mutate()}
            >
              <Play className="size-4" aria-hidden="true" />
              {processMutation.isPending ? "Crawling…" : "Process next pages"}
            </Button>
          </div>
        </div>

        {dashboard.isError ? (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            The managed source dashboard could not be loaded.
          </p>
        ) : null}

        <div className="grid gap-3">
          {(dashboard.data?.sources ?? []).map((source) => (
            <article key={source.source_id} className="rounded-xl border border-border bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-fg">{source.source_name}</h3>
                    <Badge className={reviewTone(source.review_status)}>
                      {source.review_status.replaceAll("_", " ")}
                    </Badge>
                    <Badge variant="outline">{source.duplicate_status.replaceAll("_", " ")}</Badge>
                    <Badge variant={source.manifest.queue_status === "queued" ? "solid" : "outline"}>
                      {source.manifest.queue_status === "queued" ? "Crawler eligible" : "Held"}
                    </Badge>
                  </div>
                  <a
                    href={source.start_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 break-all text-sm text-accent no-underline hover:underline"
                  >
                    {source.start_url}
                    <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                  </a>
                  <p className="mt-2 text-sm text-muted">
                    {source.country_focus} · {source.coverage_scope} · {source.surface_scope}
                  </p>
                  <p className="mt-1 text-xs text-subtle">
                    {source.rights_status} · max {source.max_pages} pages · {source.rate_limit_seconds}s spacing
                  </p>
                  {source.duplicate_note ? (
                    <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      {source.duplicate_note}
                    </p>
                  ) : null}
                  {source.review_note ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted">Review: {source.review_note}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={reviewMutation.isPending}
                    onClick={() => decideSource(source, "approved")}
                  >
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={reviewMutation.isPending}
                    onClick={() => decideSource(source, "manual_only")}
                  >
                    Manual only
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={reviewMutation.isPending}
                    onClick={() => decideSource(source, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {!dashboard.isLoading && !dashboard.data?.sources.length ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              No managed website sources have been imported yet.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-fg">3. Recent crawl runs</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Pages</th>
                <th className="px-3 py-2">Candidates</th>
                <th className="px-3 py-2">Requested</th>
                <th className="px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard.data?.runs ?? []).map((run) => (
                <tr key={run.id} className="border-t border-border">
                  <td className="px-3 py-3">
                    <p className="font-medium text-fg">{run.source_id}</p>
                    <p className="mt-1 break-all text-xs text-subtle">{run.id}</p>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={run.status === "completed" ? "solid" : "outline"}>
                      {run.status.replaceAll("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 tabular text-muted">{run.pages_fetched}</td>
                  <td className="px-3 py-3 tabular text-muted">{run.candidates_found}</td>
                  <td className="px-3 py-3 text-xs text-muted">
                    {new Date(run.requested_at).toLocaleString("en-GB")}
                  </td>
                  <td className="max-w-sm px-3 py-3 text-xs text-red-800">
                    {run.error_message ?? "—"}
                  </td>
                </tr>
              ))}
              {!dashboard.data?.runs.length ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted">
                    No managed crawl runs yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Participant result tables are outside this crawler. Only event-level fixture metadata,
        entry routes and links to result pages may enter the verification queue.
      </p>
    </div>
  );
}

function Summary({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "ready" | "held" | "info";
}) {
  const className =
    tone === "ready"
      ? "border-emerald-500/30 bg-emerald-50 text-emerald-950"
      : tone === "held"
        ? "border-amber-500/30 bg-amber-50 text-amber-950"
        : tone === "info"
          ? "border-sky-500/30 bg-sky-50 text-sky-950"
          : "border-border bg-surface text-fg";
  return (
    <div className={`rounded-xl border p-4 shadow-card ${className}`}>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular">{value.toLocaleString()}</p>
    </div>
  );
}
