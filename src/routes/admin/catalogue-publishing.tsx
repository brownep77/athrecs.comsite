import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Database, RotateCcw, ShieldCheck } from "lucide-react";
import {
  getCataloguePublishing,
  publishCatalogueImport,
  rollbackCatalogueImport,
  stageCatalogueImport,
  validateCatalogueImport,
} from "@/lib/athrecs/catalogue-publishing-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CatalogueBatchRow = {
  id: string;
  sourceKey: string;
  status: string;
  error: string | null;
  counts: { events: number; editions: number };
  validationSummary: { errors?: unknown[] } | null;
};

type CatalogueRevisionRow = {
  id: number;
  batchId: string;
  publishedAt: string;
  status: string;
};

export const Route = createFileRoute("/admin/catalogue-publishing")({
  head: () => ({
    meta: [
      { title: "Staged catalogue publishing — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: CataloguePublishingPage,
});

const EMPTY_BATCH = JSON.stringify(
  {
    sourceKey: "",
    sourceUrl: "",
    events: [],
    editions: [],
  },
  null,
  2,
);

function CataloguePublishingPage() {
  const queryClient = useQueryClient();
  const [json, setJson] = useState(EMPTY_BATCH);
  const [message, setMessage] = useState<string | null>(null);

  const dashboard = useQuery({
    queryKey: ["catalogue-publishing"],
    queryFn: () => getCataloguePublishing(),
    refetchInterval: 15_000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["catalogue-publishing"] });

  const stageMutation = useMutation({
    mutationFn: async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(json);
      } catch {
        throw new Error("The batch must be valid JSON");
      }
      return stageCatalogueImport({ data: parsed as never });
    },
    onSuccess: (result) => {
      setMessage(
        result.reused
          ? `Existing staged batch opened: ${result.batchId}`
          : `Batch staged: ${result.batchId}`,
      );
      void refresh();
    },
    onError: showError,
  });

  const validateMutation = useMutation({
    mutationFn: (batchId: string) => validateCatalogueImport({ data: { batchId } }),
    onSuccess: (result) => {
      setMessage(
        result.status === "ready"
          ? `Batch ready: ${result.events} events and ${result.editions} editions`
          : `${result.invalidRows} staged row(s) need correction`,
      );
      void refresh();
    },
    onError: showError,
  });

  const publishMutation = useMutation({
    mutationFn: (batchId: string) => publishCatalogueImport({ data: { batchId } }),
    onSuccess: (result) => {
      setMessage(
        `Revision ${result.revisionId} published atomically: ${result.eventsUpserted} events, ${result.editionsUpserted} editions and ${result.entryOptionsUpserted} entry options`,
      );
      void refresh();
    },
    onError: showError,
  });

  const rollbackMutation = useMutation({
    mutationFn: (revisionId: number) => rollbackCatalogueImport({ data: { revisionId } }),
    onSuccess: (result) => {
      setMessage(`Revision ${result.revisionId} rolled back`);
      void refresh();
    },
    onError: showError,
  });

  function showError(error: unknown) {
    setMessage(error instanceof Error ? error.message : String(error));
  }

  function confirmPublish(batch: CatalogueBatchRow) {
    const required = `PUBLISH ${batch.sourceKey}`;
    const entered = window.prompt(
      `This changes the live catalogue. Type ${required} to publish this validated batch.`,
    );
    if (entered === required) publishMutation.mutate(batch.id);
    else if (entered !== null) setMessage("Publication cancelled: confirmation did not match.");
  }

  function confirmRollback(revisionId: number) {
    const required = `ROLLBACK ${revisionId}`;
    const entered = window.prompt(
      `This reverses the latest catalogue revision. Type ${required} to continue.`,
    );
    if (entered === required) rollbackMutation.mutate(revisionId);
    else if (entered !== null) setMessage("Rollback cancelled: confirmation did not match.");
  }

  const batches = (dashboard.data?.batches ?? []) as CatalogueBatchRow[];
  const revisions = (dashboard.data?.revisions ?? []) as CatalogueRevisionRow[];
  const currentRevisionId = dashboard.data?.currentRevisionId ?? null;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Safe database updates
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
            Staged catalogue publishing
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            New fixtures are stored first, checked for invalid references and duplicates, then
            published inside one transaction. A failed publication makes no partial live change.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/admin">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to admin
          </Link>
        </Button>
      </header>

      <section
        className={`rounded-xl border p-4 shadow-card ${
          dashboard.data?.persistent
            ? "border-emerald-500/30 bg-emerald-50"
            : "border-amber-500/40 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-fg">
              {dashboard.data?.persistent
                ? "Neon Postgres — transactional publishing enabled"
                : "PGLite preview — publishing disabled"}
            </p>
            <p className="mt-1 text-sm text-muted">
              Backend: {dashboard.data?.backend ?? "checking"}. Staging and validation are safe in
              preview; live publication and rollback require the persistent Neon database.
            </p>
          </div>
        </div>
      </section>

      {message ? (
        <p className="rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-fg">
          {message}
        </p>
      ) : null}

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-fg">1. Stage a batch</h2>
          <p className="mt-1 text-sm text-muted">
            Use official sources and include related event, edition and entry-option rows together.
          </p>
        </div>
        <textarea
          value={json}
          onChange={(event) => setJson(event.target.value)}
          spellCheck={false}
          className="min-h-[28rem] w-full rounded-lg border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-fg outline-none focus:ring-2 focus:ring-accent/30"
          aria-label="Catalogue batch JSON"
        />
        <Button
          type="button"
          onClick={() => stageMutation.mutate()}
          disabled={stageMutation.isPending}
        >
          {stageMutation.isPending ? "Staging…" : "Stage without publishing"}
        </Button>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-fg">2. Validate and publish</h2>
          <p className="mt-1 text-sm text-muted">
            Publication is available only after validation reports zero invalid rows.
          </p>
        </div>

        {dashboard.isLoading ? <p className="text-sm text-muted">Loading batches…</p> : null}
        {dashboard.isError ? (
          <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            The publishing dashboard could not be loaded.
          </p>
        ) : null}

        <div className="grid gap-3">
          {batches.map((batch) => (
            <article
              key={batch.id}
              className="rounded-xl border border-border bg-surface p-4 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-fg">{batch.sourceKey}</h3>
                    <StatusBadge status={batch.status} />
                  </div>
                  <p className="mt-1 break-all text-xs text-subtle">{batch.id}</p>
                  <p className="mt-2 text-sm text-muted">
                    {batch.counts.events} event row{batch.counts.events === 1 ? "" : "s"} ·{" "}
                    {batch.counts.editions} edition row
                    {batch.counts.editions === 1 ? "" : "s"}
                  </p>
                  {batch.error ? <p className="mt-2 text-sm text-red-800">{batch.error}</p> : null}
                  {batch.validationSummary?.errors &&
                  Array.isArray(batch.validationSummary.errors) ? (
                    <ul className="mt-2 max-w-3xl list-disc space-y-1 pl-5 text-xs text-amber-900">
                      {batch.validationSummary.errors.slice(0, 5).map((error) => (
                        <li key={String(error)}>{String(error)}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {["staged", "invalid", "failed"].includes(batch.status) ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => validateMutation.mutate(batch.id)}
                      disabled={validateMutation.isPending}
                    >
                      <ShieldCheck className="size-4" aria-hidden="true" />
                      Validate
                    </Button>
                  ) : null}
                  {batch.status === "ready" ? (
                    <Button
                      type="button"
                      onClick={() => confirmPublish(batch)}
                      disabled={!dashboard.data?.persistent || publishMutation.isPending}
                    >
                      Publish
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          {!batches.length && !dashboard.isLoading ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              No staged batches yet.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-fg">
            3. Revision history and rollback
          </h2>
          <p className="mt-1 text-sm text-muted">
            Only the current revision can be rolled back. Rollback refuses to delete an edition
            after results or later dependent data have been attached.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-3 py-2">Revision</th>
                <th className="px-3 py-2">Batch</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((revision) => (
                <tr key={revision.id} className="border-t border-border">
                  <td className="px-3 py-3 font-semibold tabular text-fg">{revision.id}</td>
                  <td className="max-w-xs px-3 py-3 break-all text-xs text-muted">
                    {revision.batchId}
                  </td>
                  <td className="px-3 py-3 text-muted">
                    {new Date(revision.publishedAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={revision.status} />
                  </td>
                  <td className="px-3 py-3">
                    {revision.status === "published" && revision.id === currentRevisionId ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={!dashboard.data?.persistent || rollbackMutation.isPending}
                        onClick={() => confirmRollback(revision.id)}
                      >
                        <RotateCcw className="size-4" aria-hidden="true" />
                        Roll back
                      </Button>
                    ) : (
                      <span className="text-xs text-subtle">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!revisions.length ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted">
                    No published revisions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "published" || status === "ready"
      ? "border-emerald-500/30 bg-emerald-50 text-emerald-900"
      : status === "invalid" || status === "failed"
        ? "border-red-500/30 bg-red-50 text-red-900"
        : status === "rolled_back"
          ? "border-slate-400/40 bg-slate-100 text-slate-800"
          : "border-amber-500/30 bg-amber-50 text-amber-900";
  return <Badge className={className}>{status.replaceAll("_", " ")}</Badge>;
}
