import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { listStaffProfileSetups, completeStaffProfileSetup } from "@/lib/athrecs/profile-setup-api";

export function ProfileSetupRequests() {
  const client = useQueryClient();
  const requests = useQuery({
    queryKey: ["staff-profile-setups"],
    queryFn: () => listStaffProfileSetups(),
  });
  const complete = useMutation({
    mutationFn: (id: number) => completeStaffProfileSetup({ data: { id } }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["staff-profile-setups"] }),
  });
  return (
    <section
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
      aria-label="Profile setup review queue"
    >
      <h2 className="font-display text-xl font-semibold">Profile setup requests</h2>
      <p className="text-sm text-muted">
        New and returning athletes asking us to check profile links and find missing results.
        Showing up to 100 oldest open requests.
      </p>
      {requests.isPending ? (
        <p role="status">Loading requests…</p>
      ) : requests.isError ? (
        <p role="alert">
          Requests could not load.{" "}
          <button className="underline" onClick={() => void requests.refetch()}>
            Try again
          </button>
        </p>
      ) : !requests.data.length ? (
        <p>No open requests.</p>
      ) : (
        requests.data.map((r) => (
          <article key={r.id} className="space-y-2 rounded-lg border border-border p-4">
            <h3 className="font-semibold">{r.details.fullName}</h3>
            <p className="text-sm">
              {r.email} ·{" "}
              {new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}
            </p>
            <p className="text-sm">
              Current club: {r.details.currentClub || "Not supplied"}. Previous clubs:{" "}
              {r.details.previousClubs.join(", ") || "Not supplied"}.
            </p>
            <p className="text-sm">
              Previous names: {r.details.previousNames.join(", ") || "Not supplied"}.
            </p>
            <ul className="space-y-1 text-sm">
              {r.details.sourceUrls.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">
              Staff email: {r.alert_sent ? "Sent" : "Queued; delivery not confirmed"}. Links
              supplied by athlete; identity and results still require review.
            </p>
            <Button
              variant="secondary"
              disabled={complete.isPending}
              onClick={() => complete.mutate(r.id)}
            >
              Mark review complete
            </Button>
          </article>
        ))
      )}
      {complete.isError ? <p role="alert">Review status could not be saved. Try again.</p> : null}
    </section>
  );
}
