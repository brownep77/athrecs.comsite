import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResultDistance } from "@/components/athletes/ResultDistance";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { openAthleteAuth } from "@/lib/auth/client";
import {
  getMyTestHub,
  registerForTestRace,
  retryTestConfirmationEmails,
} from "@/lib/athrecs/test-account-api";

export const Route = createFileRoute("/test-account")({
  head: () => ({
    meta: [
      { title: "Private test hub | AthRecs" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: TestAccountPage,
});

function TestAccountPage() {
  const user = useCurrentUserState();
  const cache = useQueryClient();
  const hub = useQuery({
    queryKey: ["private-test-hub", user.user?.id],
    queryFn: () => getMyTestHub(),
    enabled: Boolean(user.user),
    retry: false,
  });
  const registration = useMutation({
    mutationFn: registerForTestRace,
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["private-test-hub"] });
    },
  });
  const retryEmails = useMutation({
    mutationFn: () => retryTestConfirmationEmails(),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["private-test-hub"] });
    },
  });
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 text-slate-900">
        <p className="text-sm font-bold uppercase tracking-wide">
          Fictional test information · Private
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Your AthRecs test hub</h1>
        <p className="mt-3">
          Practise with Test Test, a fictional male runner, and ten invented races. Nothing here is
          a real entry, result, PB, medal or achievement. Test profiles cannot be published or
          indexed.
        </p>
      </div>
      {!user.user ? (
        <section className="space-y-3">
          <p>Sign in with your approved test account to open the races and results.</p>
          <Button onClick={() => openAthleteAuth()}>Sign in to test account</Button>
        </section>
      ) : null}
      {hub.isLoading ? <p role="status">Loading private test races…</p> : null}
      {hub.error ? <p role="alert">{hub.error.message}</p> : null}
      {hub.data ? (
        <>
          <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
            <h2 className="text-xl font-semibold">
              {hub.data.name} · Male · {hub.data.email}
            </h2>
            <p>
              Use the normal account editor to save the name Test Test. Then open a result to claim
              the profile and review all ten results together. You can select or remove individual
              results before confirming, and restore them later.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/athlete-account" search={{ section: "identity" }}>
                  Edit test profile
                </Link>
              </Button>
              {hub.data.races[0] ? (
                <Button asChild variant="secondary">
                  <Link to="/claim-results" search={{ resultId: hub.data.races[0].resultId }}>
                    Review and claim results
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="secondary">
                <Link to="/athlete-account" search={{ section: "races" }}>
                  View profile results
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted">
              The fictional race controls below practise registration and confirmation emails. Real
              race entry remains with each event’s official entry provider. Cancel and register
              again to repeat a practice registration; repeat clicks do not duplicate entries or
              emails.
            </p>
          </section>
          {registration.error ? <p role="alert">{registration.error.message}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {hub.data.races.map((race) => (
              <section
                key={race.id}
                className="space-y-3 rounded-xl border border-border bg-surface p-5"
              >
                <p className="text-xs font-bold uppercase text-amber-700">Fictional test race</p>
                <h2 className="text-xl font-semibold">
                  {race.name} <ResultDistance distance={race.distance} />
                </h2>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt>Fictional race date</dt>
                  <dd>{race.date}</dd>
                  <dt>Fictional gun time</dt>
                  <dd>{race.performance}</dd>
                  <dt>Practice registration</dt>
                  <dd>{race.registered ? "Registered" : "Not registered"}</dd>
                  <dt>Profile result</dt>
                  <dd>{race.claimed ? "Included" : "Not yet included"}</dd>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={registration.isPending}
                    onClick={() =>
                      registration.mutate({
                        data: { eventId: race.id, registered: !race.registered },
                      })
                    }
                  >
                    {race.registered ? "Cancel practice entry" : `Register for ${race.name}`}
                  </Button>
                  <Button asChild variant="secondary">
                    <Link to="/claim-results" search={{ resultId: race.resultId }}>
                      Review result
                    </Link>
                  </Button>
                </div>
                {race.registered ? (
                  <p className="text-xs text-muted">
                    {race.emailSent
                      ? "Confirmation accepted by email provider."
                      : "Email not yet confirmed. Use Retry email delivery below after ten minutes."}
                  </p>
                ) : null}
              </section>
            ))}
          </div>
          <Button
            variant="secondary"
            disabled={retryEmails.isPending}
            onClick={() => retryEmails.mutate()}
          >
            Retry email delivery
          </Button>
          {retryEmails.isSuccess ? (
            <p role="status">
              {retryEmails.data.sent} email(s) accepted. Pending sends wait ten minutes between
              attempts. Unconfirmed sends older than 23 hours need staff review.
            </p>
          ) : null}
          {retryEmails.error ? <p role="alert">{retryEmails.error.message}</p> : null}
        </>
      ) : null}
    </main>
  );
}
