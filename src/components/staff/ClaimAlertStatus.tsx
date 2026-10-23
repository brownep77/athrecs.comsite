import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getClaimAlertSummary, retryClaimAlerts } from "@/lib/athrecs/result-claim-alerts-api";

export function ClaimAlertStatus() {
  const client = useQueryClient();
  const summary = useQuery({
    queryKey: ["claim-alert-status"],
    queryFn: () => getClaimAlertSummary(),
    refetchInterval: 30_000,
  });
  const retry = useMutation({
    mutationFn: () => retryClaimAlerts(),
    onSuccess: () => client.invalidateQueries({ queryKey: ["claim-alert-status"] }),
  });
  if (summary.isPending) return <p role="status">Checking claim email status…</p>;
  if (summary.isError)
    return (
      <p role="alert">
        Claim email status could not be loaded.{" "}
        <button type="button" className="underline" onClick={() => void summary.refetch()}>
          Try again
        </button>
      </p>
    );
  const data = summary.data;
  const configured =
    data.production && data.persistent && data.emailConfigured && data.recipientCount > 0;
  return (
    <section
      aria-label="Claim email alerts"
      className="space-y-3 rounded-xl border border-border bg-surface p-4"
    >
      <h2 className="font-semibold">Claim email alerts</h2>
      <p className="text-sm text-muted">
        Straightforward claims complete immediately. Staff receive a notification afterwards;
        ownership conflicts remain flagged for attention.
      </p>
      <p className="text-sm text-muted">
        {configured
          ? `Staff alerts go to ${data.recipientCount} configured recipient${data.recipientCount === 1 ? "" : "s"}. ${data.retriesConfigured ? "Failed sends retry every 10 minutes." : "Scheduled retries need configuration."}`
          : "Email delivery is paused in this environment. Claims and queued notifications remain saved."}
      </p>
      <p className="text-sm">
        {data.sent} accepted by the email service · {data.pending} waiting · {data.awaiting_setup}{" "}
        awaiting recipients
      </p>
      <p className="text-sm">
        Profile confirmation emails: {data.profile_pending} waiting · {data.profile_needs_review}{" "}
        need delivery review.
      </p>
      {data.needs_review > 0 || data.profile_needs_review > 0 ? (
        <p role="alert" className="text-sm text-red-800">
          {data.needs_review + data.profile_needs_review} delivery status
          {data.needs_review === 1 ? "" : "es"} could not be confirmed. Check the email provider
          before sending again.
        </p>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        disabled={!configured || retry.isPending}
        onClick={() => retry.mutate()}
      >
        {retry.isPending ? "Retrying…" : "Retry due emails"}
      </Button>
      {retry.isError ? (
        <p role="alert" className="text-sm text-red-800">
          The retry could not complete. Pending alerts remain saved.
        </p>
      ) : null}
      {retry.isSuccess ? (
        <p role="status" className="text-sm">
          {retry.data.paused
            ? "Delivery is paused."
            : `${retry.data.sent} accepted; ${retry.data.failed} still need attention.`}
        </p>
      ) : null}
    </section>
  );
}
