import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { loadRegistrationStats } from "@/lib/athrecs/registration-stats.server";

type Props = {
  stats: Awaited<ReturnType<typeof loadRegistrationStats>>;
  onMonth: (month: string) => void;
  onPeriod: (from: string, to: string) => void;
};

export function RegistrationStats({ stats, onMonth, onPeriod }: Props) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const buckets = stats[view];
  const peak = Math.max(1, ...buckets.map((bucket) => bucket.signups));
  return (
    <section
      className="rounded-xl border border-border bg-surface p-4"
      aria-label="Registration statistics"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Signup history</h2>
          <p className="text-sm text-muted">
            UK time · All registered accounts, including unfinished profiles. Imported profiles are
            excluded.
          </p>
        </div>
        <label className="text-sm">
          Statistics month
          <input
            type="month"
            value={stats.month}
            min="2000-01"
            max="2099-12"
            className="ml-2 rounded border border-border bg-surface p-2"
            onChange={(event) => {
              if (event.target.value) onMonth(event.target.value);
            }}
          />
        </label>
      </div>
      <div className="my-3 flex gap-2">
        <Button
          variant={view === "daily" ? "default" : "secondary"}
          aria-pressed={view === "daily"}
          onClick={() => setView("daily")}
        >
          By day
        </Button>
        <Button
          variant={view === "monthly" ? "default" : "secondary"}
          aria-pressed={view === "monthly"}
          onClick={() => setView("monthly")}
        >
          By month
        </Button>
      </div>
      <div className="max-h-72 overflow-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Registrations by{" "}
            {view === "daily" ? `day for ${stats.month}` : `month for ${stats.month.slice(0, 4)}`}
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th className="py-2">{view === "daily" ? "Date" : "Month"}</th>
              <th>New signups</th>
              <th className="text-right">Total to date</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr key={bucket.date} className="border-b border-border/50">
                <td className="py-2">
                  <button
                    type="button"
                    className="font-medium text-accent underline"
                    aria-label={`Show signups ${view === "daily" ? bucket.date : bucket.date.slice(0, 7)}`}
                    onClick={() => {
                      const end =
                        view === "daily"
                          ? bucket.date
                          : new Date(
                              Date.UTC(
                                Number(bucket.date.slice(0, 4)),
                                Number(bucket.date.slice(5, 7)),
                                0,
                              ),
                            )
                              .toISOString()
                              .slice(0, 10);
                      onPeriod(bucket.date, end);
                    }}
                  >
                    {new Intl.DateTimeFormat("en-GB", {
                      timeZone: "UTC",
                      month: "short",
                      ...(view === "daily"
                        ? { day: "numeric" as const }
                        : { year: "numeric" as const }),
                    }).format(new Date(bucket.date))}
                  </button>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="w-8">{bucket.signups}</span>
                    <span
                      aria-hidden="true"
                      className="h-2 rounded bg-accent"
                      style={{ width: `${(bucket.signups / peak) * 60}%` }}
                    />
                  </div>
                </td>
                <td className="text-right">{bucket.total.toLocaleString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Choose a date or month to see who signed up. Totals reflect accounts still held; deleted
        accounts are excluded.
      </p>
    </section>
  );
}
