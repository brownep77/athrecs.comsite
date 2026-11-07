import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIntakeDashboard, resolveIntake } from "@/lib/race-collector/autoingest-api";

export const Route = createFileRoute("/admin/fixture-autoingest")({
  head: () => ({
    meta: [
      { title: "Automatic fixtures — AthRecs Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: FixtureAutoingestPage,
});

const n = (v: number | undefined) => (v ?? 0).toLocaleString("en-GB");
const labels: Record<string, string> = {
  published: "Published automatically",
  already_listed: "Already in fixtures",
  duplicate: "Possible duplicates",
  missing: "Missing details",
  enrich: "Being researched",
  queued: "Waiting to be checked",
  rejected: "Out of scope",
  failed: "Retrying",
};

function FixtureAutoingestPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["fixture-autoingest"], queryFn: () => getIntakeDashboard() });
  const act = useMutation({
    mutationFn: (data: { id: number; action: "resolve" | "retry" }) => resolveIntake({ data }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["fixture-autoingest"] }),
  });
  const data = query.data;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Automatic fixtures</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Fixtures from every approved source are checked and published automatically. Only
            possible duplicates and races whose details could not be confirmed, even after automated
            research, are listed here.
          </p>
        </div>
        <Button variant="secondary" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className="mr-2 size-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {query.error ? (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{String(query.error)}</p>
      ) : null}

      {data ? (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border p-3">
              <dt className="text-xs text-slate-500">Published today</dt>
              <dd className="text-2xl font-semibold">{n(data.publishedToday)}</dd>
            </div>
            {[
              "published",
              "already_listed",
              "duplicate",
              "missing",
              "enrich",
              "queued",
              "rejected",
            ].map((key) => (
              <div key={key} className="rounded-lg border p-3">
                <dt className="text-xs text-slate-500">{labels[key]} (all time)</dt>
                <dd className="text-2xl font-semibold">{n(data.counts[key])}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-8 text-lg font-semibold">
            Waiting for you ({n(data.forStaff.length)})
          </h2>
          {data.forStaff.length === 0 ? (
            <p className="mt-2 text-slate-600">Nothing needs you right now.</p>
          ) : (
            <ul className="mt-3 divide-y rounded-lg border">
              {data.forStaff.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {row.name}{" "}
                      <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {row.status === "duplicate" ? "Possible duplicate" : "Missing details"}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      {[row.date || "Date unknown", row.distance || "Distance unknown", row.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {row.reasons.length ? (
                      <p className="mt-1 text-sm text-slate-700">{row.reasons.join("; ")}</p>
                    ) : null}
                    <p className="mt-1 flex flex-wrap gap-3 text-sm">
                      {row.sourceUrl ? (
                        <a
                          href={row.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="break-all underline"
                        >
                          Source page
                        </a>
                      ) : null}
                      {row.status === "duplicate" && row.runId ? (
                        <a href={`/admin/fixture-import?run=${row.runId}`} className="underline">
                          Compare and decide
                        </a>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={act.isPending}
                      onClick={() => act.mutate({ id: row.id, action: "retry" })}
                    >
                      Check again
                    </Button>
                    <Button
                      size="sm"
                      disabled={act.isPending}
                      onClick={() => act.mutate({ id: row.id, action: "resolve" })}
                    >
                      Done
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : query.isLoading ? (
        <p className="mt-6 text-slate-600">Loading…</p>
      ) : null}
    </main>
  );
}
