import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Upload } from "lucide-react";
import { getDbStatus } from "@/lib/athrecs/api";
import { previewResultLinksCsv, publishResultLinksCsv } from "@/lib/athrecs/results-links-api";
import type { ResultLinkPreviewStatus } from "@/lib/athrecs/results-links-import";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/result-links")({
  head: () => ({
    meta: [
      { title: "Results links — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AdminResultLinksPage,
});

const EMPTY_CSV =
  "event_slug,date,distance,provider_name,provider_code,results_url,source_url,verified,checked_at\n";

const STATUS_LABEL: Record<ResultLinkPreviewStatus, string> = {
  ready: "Ready",
  duplicate: "Duplicate",
  held: "Held",
  unmatched: "Unmatched",
  ambiguous: "Ambiguous",
  invalid: "Invalid",
};

function statusClass(status: ResultLinkPreviewStatus): string {
  if (status === "ready") return "border-emerald-500/30 bg-emerald-50 text-emerald-900";
  if (status === "duplicate") return "border-sky-500/30 bg-sky-50 text-sky-900";
  if (status === "held") return "border-amber-500/30 bg-amber-50 text-amber-900";
  return "border-red-500/30 bg-red-50 text-red-900";
}

function AdminResultLinksPage() {
  const queryClient = useQueryClient();
  const [csv, setCsv] = useState(EMPTY_CSV);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewResultLinksCsv>> | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const dbStatus = useQuery({
    queryKey: ["admin-db-status"],
    queryFn: () => getDbStatus(),
  });

  const previewMutation = useMutation({
    mutationFn: () => previewResultLinksCsv({ data: { csv } }),
    onSuccess: (result) => {
      setPreview(result);
      setMessage(
        `Preview complete: ${result.counts.ready.toLocaleString()} ready, ${result.counts.duplicate.toLocaleString()} duplicate and ${result.counts.held.toLocaleString()} held.`,
      );
    },
    onError: (error) => {
      setPreview(null);
      setMessage(error instanceof Error ? error.message : String(error));
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishResultLinksCsv({ data: { csv } }),
    onSuccess: (result) => {
      setPreview(result.preview);
      setMessage(
        `Published ${result.inserted.toLocaleString()} verified result link${result.inserted === 1 ? "" : "s"}. ${result.skipped.toLocaleString()} row${result.skipped === 1 ? " was" : "s were"} skipped safely.`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  function updateCsv(value: string) {
    setCsv(value);
    setPreview(null);
    setMessage(null);
  }

  async function loadFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 5_000_000) {
      setMessage("CSV is larger than the 5 MB import limit");
      return;
    }
    updateCsv(await file.text());
  }

  const problemCount = preview
    ? preview.counts.unmatched + preview.counts.ambiguous + preview.counts.invalid
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">
            Results administration
          </p>
          <h1 className="font-display text-2xl font-semibold text-fg md:text-3xl">
            Bulk results-link importer
          </h1>
          <p className="max-w-3xl text-sm text-muted">
            Upload result-page links for existing editions. Every row must exactly match an event
            slug, date and distance. Previewing never publishes; only verified, approved rows can be
            added.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to admin
          </Link>
        </Button>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-fg">Results-link CSV</h2>
            <p className="mt-1 text-xs text-subtle">
              Required: event_slug, date, distance, provider_name, results_url. New links require
              HTTPS and verified=true.
            </p>
          </div>
          <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-elevated px-4 text-sm font-medium text-fg hover:border-accent hover:text-accent">
            <Upload className="size-4" aria-hidden="true" />
            Choose CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => void loadFile(event.target.files?.[0])}
            />
          </label>
        </div>

        <textarea
          value={csv}
          onChange={(event) => updateCsv(event.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={!csv.trim() || previewMutation.isPending || publishMutation.isPending}
            onClick={() => previewMutation.mutate()}
          >
            {previewMutation.isPending ? "Checking rows…" : "Preview and check duplicates"}
          </Button>
          <Button
            type="button"
            disabled={
              !preview?.counts.ready ||
              dbStatus.data?.persistent !== true ||
              previewMutation.isPending ||
              publishMutation.isPending
            }
            onClick={() => publishMutation.mutate()}
          >
            {publishMutation.isPending
              ? "Publishing…"
              : `Publish ${preview?.counts.ready.toLocaleString() ?? 0} approved`}
          </Button>
          <p className="text-xs text-subtle">
            Editing the CSV clears the preview. Publishing repeats every server-side check.
          </p>
        </div>

        {dbStatus.data && !dbStatus.data.persistent && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Connect Neon before publishing so imported links survive server restarts. Preview
            remains available.
          </p>
        )}
        {message && (
          <p className="rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent">
            {message}
          </p>
        )}
      </section>

      {preview && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Rows" value={preview.counts.total} />
            <SummaryCard label="Ready" value={preview.counts.ready} tone="ready" />
            <SummaryCard label="Duplicates" value={preview.counts.duplicate} tone="duplicate" />
            <SummaryCard label="Held" value={preview.counts.held} tone="held" />
            <SummaryCard label="Needs correction" value={problemCount} tone="problem" />
          </div>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-fg">Row-by-row preview</h2>
              <p className="text-xs text-subtle">
                Restricted registered domains stay held even when a row is marked verified.
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[76rem] text-left text-sm">
                <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
                  <tr>
                    <th className="px-3 py-2 font-medium">Row</th>
                    <th className="px-3 py-2 font-medium">Edition</th>
                    <th className="px-3 py-2 font-medium">Provider</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Reason</th>
                    <th className="px-3 py-2 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber} className="border-t border-border align-top">
                      <td className="px-3 py-3 tabular text-muted">{row.rowNumber}</td>
                      <td className="px-3 py-3">
                        {row.eventName ? (
                          <Link
                            to="/races/$slug"
                            params={{ slug: row.eventSlug }}
                            className="font-medium text-fg no-underline hover:text-accent"
                          >
                            {row.eventName}
                          </Link>
                        ) : (
                          <span className="font-medium text-fg">{row.eventSlug || "—"}</span>
                        )}
                        <p className="mt-1 text-xs text-subtle">
                          {row.date || "No date"} · {row.distance || "No distance"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-fg">{row.providerName || "—"}</p>
                        {row.sourceName && (
                          <p className="mt-1 text-xs text-subtle">{row.sourceName}</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={statusClass(row.status)}>
                          {STATUS_LABEL[row.status]}
                        </Badge>
                      </td>
                      <td className="max-w-md px-3 py-3 text-muted">{row.reason}</td>
                      <td className="max-w-xs px-3 py-3">
                        {row.resultsUrl.startsWith("https://") ? (
                          <a
                            href={row.resultsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 break-all text-xs text-accent no-underline hover:underline"
                          >
                            Open
                            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="break-all text-xs text-subtle">
                            {row.resultsUrl || "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="rounded-xl border border-border bg-surface p-4 text-sm shadow-card md:p-5">
        <h2 className="font-display text-lg font-semibold text-fg">Publication rules</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted">
          <li>Exact event slug + date + distance match only; no fuzzy attachment.</li>
          <li>Canonical URL duplicates are skipped within the file and against the database.</li>
          <li>Multiple different providers may be published for the same edition.</li>
          <li>RunABC and every other held registry domain remain blocked pending review.</li>
          <li>Only event-level links are stored; this importer does not copy participant rows.</li>
        </ul>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "ready" | "duplicate" | "held" | "problem";
}) {
  const classes = {
    default: "border-border bg-surface text-fg",
    ready: "border-emerald-500/30 bg-emerald-50 text-emerald-950",
    duplicate: "border-sky-500/30 bg-sky-50 text-sky-950",
    held: "border-amber-500/30 bg-amber-50 text-amber-950",
    problem: "border-red-500/30 bg-red-50 text-red-950",
  }[tone];
  return (
    <div className={`rounded-xl border p-4 shadow-card ${classes}`}>
      <p className="text-xs uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular">{value.toLocaleString()}</p>
    </div>
  );
}
