import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, DatabaseBackup, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  previewRecoverableResultReconciliation,
  publishRecoverableResultReconciliation,
} from "@/lib/athrecs/result-reconciliation-api";

const CONFIRMATION = "RESTORE CLAIMABLE RESULTS";

function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}

export function ResultReconciliationPanel() {
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const reconciliation = useQuery({
    queryKey: ["recoverable-result-reconciliation"],
    queryFn: () => previewRecoverableResultReconciliation(),
    staleTime: 30_000,
  });
  const publish = useMutation({
    mutationFn: () =>
      publishRecoverableResultReconciliation({ data: { confirmation } }),
    onSuccess: (result) => {
      setConfirmation("");
      setMessage(
        result.noOp
          ? "No recoverable result rows were missing. The database was not changed."
          : `Reconciliation stored ${formatNumber(result.inserted.results)} missing result rows and ${formatNumber(result.inserted.athletes)} athlete records.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["recoverable-result-reconciliation"] });
      void queryClient.invalidateQueries({ queryKey: ["result-archive"] });
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : String(error)),
  });

  const data = reconciliation.data;

  return (
    <section className="space-y-4 rounded-xl border border-cyan-700/25 bg-surface p-4 shadow-card md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Insert-only recovery
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-fg">
            Reconcile recoverable historical results
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Compare Neon with the retained ATHRECS catalogue. Publishing inserts only missing
            private athletes and claimable result rows. Existing records are never deleted or
            overwritten; identity conflicts remain blocked for staff review.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={reconciliation.isFetching}
          onClick={() => void reconciliation.refetch()}
        >
          <DatabaseBackup
            className={reconciliation.isFetching ? "size-4 animate-spin" : "size-4"}
            aria-hidden="true"
          />
          Preview again
        </Button>
      </div>

      {reconciliation.isLoading ? (
        <p className="text-sm text-muted">Comparing the database with the recoverable catalogue…</p>
      ) : reconciliation.isError || !data ? (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
          {reconciliation.error instanceof Error
            ? reconciliation.error.message
            : "The reconciliation preview could not be loaded."}
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Summary label="Baseline results" value={data.baseline.results} />
            <Summary label="Already present" value={data.present.results} />
            <Summary label="Safe to restore" value={data.recoverable.results} tone="safe" />
            <Summary label="Blocked conflicts" value={data.blocked.results} tone="warning" />
            <Summary label="Missing athletes" value={data.missing.athletes} />
          </div>

          {data.complete ? (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 px-3 py-3 text-sm text-emerald-950">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                All {formatNumber(data.baseline.results)} recoverable catalogue results are already
                represented in the database. No reconciliation write is needed.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-3 text-sm text-amber-950">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>
                    {formatNumber(data.recoverable.results)} result rows can be restored without
                    changing an existing participant record. {formatNumber(data.blocked.results)}
                    {" "}rows remain blocked where identity evidence conflicts.
                  </p>
                </div>

                {data.eventGaps.length ? (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[38rem] text-left text-sm">
                      <thead className="bg-elevated text-[11px] uppercase tracking-wider text-subtle">
                        <tr>
                          <th className="px-3 py-2">Event</th>
                          <th className="px-3 py-2">Present</th>
                          <th className="px-3 py-2">Restore</th>
                          <th className="px-3 py-2">Blocked</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.eventGaps.slice(0, 12).map((event) => (
                          <tr key={event.eventSlug} className="border-t border-border">
                            <td className="px-3 py-2">
                              <p className="font-medium text-fg">{event.eventName}</p>
                              <p className="text-xs text-muted">{event.sport}</p>
                            </td>
                            <td className="px-3 py-2 tabular-nums text-muted">
                              {formatNumber(event.presentResults)} / {formatNumber(event.targetResults)}
                            </td>
                            <td className="px-3 py-2 font-semibold tabular-nums text-emerald-800">
                              {formatNumber(event.recoverableResults)}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-amber-800">
                              {formatNumber(event.blockedResults)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-bg p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
                  <h3 className="font-semibold text-fg">Publication gate</h3>
                </div>
                <ul className="list-disc space-y-1.5 pl-5 text-xs leading-5 text-muted">
                  <li>No DELETE statements or replacement updates are used.</li>
                  <li>Ordinary athlete profiles and restored result rows remain private.</li>
                  <li>Every run is recorded by event edition in the ingestion ledger.</li>
                  <li>A second run is idempotent and inserts no duplicate rows.</li>
                </ul>
                {!data.persistent ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                    Publishing is disabled because this deployment is not connected to persistent
                    Neon.
                  </p>
                ) : null}
                <label className="space-y-1.5 text-xs font-medium text-muted">
                  Type {CONFIRMATION} to publish
                  <input
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    spellCheck={false}
                    className="h-11 w-full rounded-lg border border-border bg-surface px-3 font-mono text-xs text-fg outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </label>
                <Button
                  type="button"
                  className="w-full"
                  disabled={
                    !data.persistent ||
                    data.recoverable.results === 0 ||
                    confirmation !== CONFIRMATION ||
                    publish.isPending
                  }
                  onClick={() => publish.mutate()}
                >
                  {publish.isPending
                    ? "Reconciling…"
                    : `Restore ${formatNumber(data.recoverable.results)} claimable results`}
                </Button>
              </div>
            </div>
          )}

          {data.conflicts.count ? (
            <details className="rounded-lg border border-border bg-bg p-3 text-sm">
              <summary className="cursor-pointer font-medium text-fg">
                Review {formatNumber(data.conflicts.count)} identity conflict
                {data.conflicts.count === 1 ? "" : "s"}
              </summary>
              <div className="mt-3 grid gap-2">
                {data.conflicts.samples.slice(0, 20).map((conflict, index) => (
                  <div
                    key={`${conflict.entity}-${conflict.key}-${index}`}
                    className="rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{conflict.entity}</Badge>
                      <code className="break-all text-xs text-fg">{conflict.key}</code>
                    </div>
                    <p className="mt-1 text-xs text-muted">{conflict.reason}</p>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}

      {message ? (
        <p className="rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-accent">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function Summary({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "safe" | "warning";
}) {
  const className =
    tone === "safe"
      ? "border-emerald-500/30 bg-emerald-50 text-emerald-950"
      : tone === "warning"
        ? "border-amber-500/30 bg-amber-50 text-amber-950"
        : "border-border bg-bg text-fg";
  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{formatNumber(value)}</p>
    </div>
  );
}
