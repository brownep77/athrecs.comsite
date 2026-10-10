import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  excludeOwnedPerformance,
  getOwnedPerformanceHistory,
  getStaffPerformanceHistory,
} from "@/lib/athlete-workspace/admin-history-api";

export function ManagedPerformanceHistory({
  athleteId,
  staff,
}: {
  athleteId: number;
  staff: boolean;
}) {
  const [query, setQuery] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const history = useQuery({
    queryKey: ["managed-performance-history", athleteId, staff],
    queryFn: () =>
      staff
        ? getStaffPerformanceHistory({ data: { athleteId } })
        : getOwnedPerformanceHistory({ data: { athleteId } }),
    retry: false,
  });
  async function change(externalId: string, index: number, excluded: boolean) {
    setBusy(true);
    setMessage("");
    try {
      await excludeOwnedPerformance({
        data: {
          athleteId,
          externalId,
          index,
          excluded,
          reason: excluded
            ? "Athlete removed this performance from their profile."
            : "Athlete restored this performance to their profile.",
        },
      });
      await history.refetch();
      setMessage(
        excluded
          ? "Removed from your profile. You can restore it below."
          : "Restored to your profile.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The change was not saved.");
    } finally {
      setBusy(false);
    }
  }
  if (history.isError) return <p role="alert">Unable to load additional performance history.</p>;
  if (!history.data?.length) return null;
  const rows = history.data.flatMap((h) =>
    h.performances.map((row, index) => ({ ...row, index, externalId: h.externalId })),
  );
  return (
    <section className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-semibold">Additional performance history ({rows.length})</h2>
      <p className="text-sm text-slate-600">
        These entries were added by AthRecs. Each entry's verification status is shown below.{" "}
        {staff
          ? "The linked athlete can remove or restore each entry."
          : "Remove any entry from your profile, or restore it later. The original source record is retained."}
      </p>
      <input
        aria-label="Search additional performance history"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search event, year or performance"
        className="min-h-11 w-full rounded-lg border p-3"
      />
      <div className="max-h-[36rem] space-y-2 overflow-auto">
        {rows
          .filter((r) =>
            [r.meeting, r.discipline, r.yearLabel || r.year, r.performance]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((row) => (
            <article
              key={`${row.externalId}:${row.index}`}
              className="space-y-2 rounded-lg border p-3"
            >
              <h3 className="font-semibold">
                {row.meeting} · {row.discipline}
              </h3>
              <p className="text-sm">
                {row.dateLabel || row.date || row.yearLabel || row.year} ·{" "}
                {row.performance || "Performance not recorded"} · {row.venue}
              </p>
              {row.notes ? <p className="text-xs text-slate-600">{row.notes}</p> : null}
              <p className="text-xs">
                {row.profileExcluded ? "Removed from profile" : "Shown on profile"}
                {" · "}
                {row.verificationStatus === "verified_by_administrator"
                  ? "Verified by administrator"
                  : row.verificationStatus === "source_verified"
                    ? "Verified against source records"
                    : "Unverified"}
              </p>
              {!staff ? (
                <button
                  type="button"
                  disabled={busy}
                  className="min-h-11 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                  onClick={() => void change(row.externalId, row.index, !row.profileExcluded)}
                >
                  {row.profileExcluded ? "Restore to profile" : "Remove from profile"}
                </button>
              ) : null}
            </article>
          ))}
      </div>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}
