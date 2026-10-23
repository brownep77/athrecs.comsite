import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStaffArchiveRequests,
  processStaffArchiveClaims,
} from "@/lib/results-archive/member-api";
import { Button } from "@/components/ui/button";

export function ArchiveClaimRequests() {
  const client = useQueryClient();
  const requests = useQuery({
    queryKey: ["staff-archive-claim-requests"],
    queryFn: () => getStaffArchiveRequests(),
    refetchInterval: 30000,
  });
  const process = useMutation({
    mutationFn: (row: { entryId: number; userId: string }) =>
      processStaffArchiveClaims({ data: { userId: row.userId, entryIds: [Number(row.entryId)] } }),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["staff-archive-claim-requests"] }),
        client.invalidateQueries({ queryKey: ["staff-result-claims"] }),
        client.invalidateQueries({ queryKey: ["claim-alert-status"] }),
      ]),
  });
  return (
    <section
      aria-label="Archive result claims"
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <h2 className="font-semibold">Archive result claims</h2>
      <p className="text-sm text-muted">
        Archive requests and profile claims are managed here together. Completed archive claims
        appear in the Complete list below. Notifications go to info@athrecs.com.
      </p>
      {requests.isPending ? (
        <p role="status">Loading archive requests…</p>
      ) : requests.isError ? (
        <p role="alert">
          Archive requests could not load.{" "}
          <button className="underline" onClick={() => void requests.refetch()}>
            Try again
          </button>
        </p>
      ) : !requests.data.length ? (
        <p>No outstanding archive requests.</p>
      ) : (
        requests.data.map((row) => (
          <article
            key={`${row.entryId}:${row.userId}`}
            className="rounded-lg border border-border p-3 space-y-2"
          >
            <p className="font-semibold">
              {row.name || "Athlete account"} · {row.event}
            </p>
            <p className="text-sm">{row.note}</p>
            <p className="text-xs text-muted">
              Request #{row.entryId} ·{" "}
              {new Date(row.created).toLocaleString("en-GB", { timeZone: "Europe/London" })}
            </p>
            <Button
              variant="secondary"
              disabled={process.isPending}
              onClick={() => process.mutate(row)}
            >
              Process declared claim
            </Button>
            <a className="ml-3 text-sm underline" href="/admin/result-archive">
              Open source record
            </a>
          </article>
        ))
      )}
      {process.isError ? <p role="alert">{process.error.message}</p> : null}
      {process.isSuccess ? (
        <p role="status">
          {process.data.claimed} claimed · {process.data.added} added · {process.data.duplicates}{" "}
          already recorded. {process.data.held.map((h) => `#${h.entryId}: ${h.reason}`).join(" ")}
        </p>
      ) : null}
    </section>
  );
}
