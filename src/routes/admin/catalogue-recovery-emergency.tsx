import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { dbSource } from "@/lib/db";
import { staffMiddleware } from "@/lib/auth/staff-middleware";

const getStaffCatalogueRecoveryStatus = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    if (dbSource !== "neon") {
      throw new Error("The persistent Neon database is not connected");
    }
    const { getCatalogueRecoveryStatus } = await import(
      "@/lib/athrecs/catalogue-recovery.server"
    );
    return getCatalogueRecoveryStatus();
  });

const runStaffCatalogueRecoveryBatch = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    if (dbSource !== "neon") {
      throw new Error("The persistent Neon database is not connected");
    }
    const { runCatalogueRecoveryBatch } = await import(
      "@/lib/athrecs/catalogue-recovery.server"
    );
    return runCatalogueRecoveryBatch();
  });

// The checked-in route tree is refreshed later by the Vite build.
// @ts-expect-error The new literal route is generated during that build step.
export const Route = createFileRoute("/admin/catalogue-recovery-emergency")({
  head: () => ({
    meta: [
      { title: "Catalogue recovery — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: CatalogueRecoveryPage,
});

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function CatalogueRecoveryPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["staff-catalogue-recovery"],
    queryFn: () => getStaffCatalogueRecoveryStatus(),
    refetchInterval: 10_000,
    retry: 1,
  });

  const recovery = useMutation({
    mutationFn: async () => {
      let status = await runStaffCatalogueRecoveryBatch();
      queryClient.setQueryData(["staff-catalogue-recovery"], status);

      for (let attempt = 0; !status.complete && attempt < 200; attempt += 1) {
        status = await runStaffCatalogueRecoveryBatch();
        queryClient.setQueryData(["staff-catalogue-recovery"], status);
      }

      if (!status.complete) {
        throw new Error(
          "Recovery paused before final verification. Press the restore button again to resume.",
        );
      }
      return status;
    },
    onSuccess: (status) => {
      setMessage(
        `Catalogue restored and verified: ${status.current.events.toLocaleString()} events, ${status.current.editions.toLocaleString()} editions and ${status.current.entryOptions.toLocaleString()} entry options.`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => setMessage(messageFromError(error)),
  });

  const status = statusQuery.data;
  const error = statusQuery.error ? messageFromError(statusQuery.error) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          System maintenance
        </p>
        <h1 className="font-display text-3xl font-semibold text-fg">Catalogue recovery</h1>
        <p className="text-sm leading-6 text-muted">
          Monitor the production catalogue and restore missing events or editions in small,
          resumable Neon transactions. Existing results, athlete accounts, claims and organiser
          data are preserved.
        </p>
      </header>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card">
        {statusQuery.isLoading && (
          <p className="text-sm text-muted">Checking the catalogue recovery state…</p>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-50 p-3 text-sm text-red-900">
            {error}
          </p>
        )}

        {status && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-subtle">Events</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">
                  {status.current.events.toLocaleString()}
                </p>
                <p className="text-xs text-subtle">
                  Target {status.target.events.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-subtle">Editions</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">
                  {status.current.editions.toLocaleString()}
                </p>
                <p className="text-xs text-subtle">
                  Target {status.target.editions.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-xs uppercase tracking-wide text-subtle">Progress</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">
                  {status.progressPercent.toLocaleString()}%
                </p>
                <p className="text-xs text-subtle">
                  {status.complete
                    ? "Verified complete"
                    : `${status.phase} · ${status.batchesCompleted} batches`}
                </p>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{ width: `${status.progressPercent}%` }}
              />
            </div>
          </>
        )}

        <Button
          type="button"
          disabled={recovery.isPending || status?.complete === true || !status}
          onClick={() => {
            const confirmed = window.confirm(
              "Restore missing production catalogue rows now? Existing results, accounts and claims will be preserved.",
            );
            if (confirmed) {
              setMessage(null);
              recovery.mutate();
            }
          }}
        >
          {recovery.isPending
            ? `Restoring… ${status?.progressPercent ?? 0}%`
            : status?.complete
              ? "Catalogue verified"
              : "Restore missing catalogue"}
        </Button>

        {recovery.isPending && (
          <p className="text-sm text-muted">
            Keep this page open. Recovery is resumable if the connection is interrupted.
          </p>
        )}

        {message && (
          <p className="rounded-lg border border-accent/30 bg-accent-soft p-3 text-sm text-fg">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
