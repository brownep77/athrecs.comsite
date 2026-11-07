import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGrowthDashboard } from "@/lib/growth/api";
import { GROWTH_METRICS, growthTotals } from "@/lib/growth/core";

export const Route = createFileRoute("/admin/growth")({
  head: () => ({
    meta: [
      { title: "Daily growth — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: GrowthPage,
});

const number = (value: number) => value.toLocaleString("en-GB");
const dayLabel = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

function GrowthPage() {
  const query = useQuery({
    queryKey: ["growth-dashboard", 30],
    queryFn: () => getGrowthDashboard({ data: { days: 30 } }),
    refetchInterval: 15 * 60_000,
  });
  const days = query.data?.days ?? [];
  const today = growthTotals(days, 1);
  const week = growthTotals(days, 7);
  const month = growthTotals(days, 30);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-800">
            <TrendingUp className="size-4" aria-hidden="true" />
            ATHRECS Staff
          </p>
          <h1 className="font-display text-3xl font-semibold text-slate-950">Daily growth</h1>
          <p className="text-sm text-slate-600">
            What was added each day (London time). Test records are left out.
            {query.data
              ? ` Updated ${new Date(query.data.generatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.`
              : ""}
          </p>
        </div>
        <Button variant="secondary" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw
            className={`size-4 ${query.isFetching ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </header>

      {query.isError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-900">
          The growth figures could not be loaded. Try Refresh.
        </p>
      ) : null}

      <section aria-label="Totals" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GROWTH_METRICS.map((m) => (
          <div key={m.key} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">{m.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums text-slate-950">
              {query.isLoading ? "…" : number(today[m.key])}
              <span className="ml-2 text-sm font-normal text-slate-500">today</span>
            </p>
            <p className="mt-1 text-sm tabular-nums text-slate-600">
              {number(week[m.key])} in 7 days · {number(month[m.key])} in 30 days
            </p>
            <p className="mt-2 text-xs text-slate-500">{m.detail}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="growth-daily" className="space-y-2">
        <h2 id="growth-daily" className="text-lg font-semibold text-slate-900">
          Last 30 days
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Day
                </th>
                {GROWTH_METRICS.map((m) => (
                  <th key={m.key} scope="col" className="px-3 py-2 text-right font-semibold">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.day} className="border-t border-slate-100">
                  <th scope="row" className="px-3 py-2 text-left font-medium text-slate-800">
                    {dayLabel(d.day)}
                  </th>
                  {GROWTH_METRICS.map((m) => (
                    <td
                      key={m.key}
                      className={`px-3 py-2 text-right tabular-nums ${d[m.key] ? "text-slate-900" : "text-slate-400"}`}
                    >
                      {number(d[m.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
