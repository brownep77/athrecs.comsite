import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { openAthleteAuth } from "@/lib/auth/client";
import { getMyRaceCalendar, updateMyRaceCalendar } from "@/lib/athrecs/calendar-subscription-api";
import { validCalendarRaceId } from "@/lib/athrecs/calendar-subscription";
import { calendarUnavailable } from "@/lib/athrecs/event-calendar";

export const Route = createFileRoute("/my-race-calendar")({
  validateSearch: (search: Record<string, unknown>) => ({
    race: validCalendarRaceId(search.race) ? search.race : "",
  }),
  head: () => ({
    meta: [
      { title: "My race calendar | AthRecs" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: MyRaceCalendar,
});

function MyRaceCalendar() {
  const { race: raceId } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const key = ["my-race-calendar", user?.id, raceId];
  const query = useQuery({
    queryKey: key,
    queryFn: () => getMyRaceCalendar({ data: { raceId } }),
    enabled: Boolean(user),
    retry: false,
  });
  const change = useMutation({
    mutationFn: (data: {
      action: "add" | "remove" | "enable" | "reset" | "disable";
      raceId?: string;
    }) => updateMyRaceCalendar({ data }),
    onSuccess: async (_, data) => {
      setMessage(
        data.action === "add"
          ? "Race added. If you already subscribe, it will appear when your calendar refreshes."
          : data.action === "remove"
            ? "Race removed. Your calendar will update when it next refreshes."
            : data.action === "disable"
              ? "Subscription disabled. Remove the calendar in your calendar app to remove its existing entries."
              : data.action === "reset"
                ? "New private link created. Subscribe again using the new link below."
                : "Your calendar is ready to subscribe to.",
      );
      await client.invalidateQueries({ queryKey: ["my-race-calendar", user?.id] });
    },
    onError: (error) => setMessage(error.message),
  });
  const data = query.data;
  const candidate = data?.candidate;
  const alreadyAdded = data?.items.some((item) => item.id === raceId);
  const feedUrl = data?.feedPath ? `https://www.athrecs.com${data.feedPath}` : "";
  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-semibold">My race calendar</h1>
        <p className="text-muted">
          Choose races here, then subscribe once in Apple Calendar. Your selections stay private and
          do not add races to your public athlete profile.
        </p>
        <a className="text-accent underline" href="/athlete-account">
          My Athlete Account
        </a>
      </header>
      <noscript>
        <p>
          Managing a private subscription requires JavaScript for sign-in. Google, Outlook and the
          calendar-file download remain available on each race page.
        </p>
      </noscript>
      {isPending ? (
        <p>Checking your sign-in…</p>
      ) : !user ? (
        <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold">Sign in to create your race calendar</h2>
          <p>Your selected race will still be here after you sign in.</p>
          <Button
            onClick={() =>
              openAthleteAuth({
                mode: "signin",
                callbackURL: `/my-race-calendar${raceId ? `?race=${encodeURIComponent(raceId)}` : ""}`,
              })
            }
          >
            Sign in or create account
          </Button>
        </section>
      ) : query.isPending ? (
        <p>Loading your race calendar…</p>
      ) : query.isError ? (
        <p role="alert">
          Your calendar could not load.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      ) : (
        <>
          {message ? (
            <p role="status" className="rounded-lg border border-border p-3">
              {message}
            </p>
          ) : null}
          {raceId ? (
            <section className="space-y-3 rounded-xl border border-border bg-surface p-5">
              <h2 className="text-xl font-semibold">{candidate?.name ?? "Race unavailable"}</h2>
              {candidate ? (
                <>
                  <p>
                    {candidate.date} · {candidate.distance}
                  </p>
                  {alreadyAdded ? (
                    <p>This race is already in your calendar.</p>
                  ) : calendarUnavailable(candidate) ? (
                    <p>{calendarUnavailable(candidate)}</p>
                  ) : (
                    <Button
                      disabled={change.isPending}
                      onClick={() => change.mutate({ action: "add", raceId })}
                    >
                      <CalendarPlus className="size-4" aria-hidden="true" /> Add race to my calendar
                    </Button>
                  )}
                </>
              ) : (
                <p>
                  This edition is no longer available. Return to its race page to check the latest
                  details.
                </p>
              )}
            </section>
          ) : null}
          <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
            <h2 className="text-xl font-semibold">Subscribe in Apple Calendar</h2>
            <p className="text-sm text-muted">
              Subscribe once to a separate, read-only calendar. Races you add or remove here update
              when your calendar app refreshes; changes are not instant. This does not enter you
              into any race.
            </p>
            {feedUrl ? (
              <>
                <Button asChild>
                  <a href={feedUrl.replace(/^https:/, "webcal:")} rel="noreferrer">
                    Open Apple Calendar <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </Button>
                <p className="text-sm">
                  Confirm the subscription in Calendar. If your browser does not open it, use the
                  subscription address below in Calendar → Add Calendar → Add Subscription Calendar.
                </p>
                <details className="space-y-3">
                  <summary className="cursor-pointer py-2 font-medium">
                    Subscription address and controls
                  </summary>
                  <p className="text-sm text-muted">
                    Keep this link private: anyone with it can read your selected races. It contains
                    no account name, email address or profile results.
                  </p>
                  <label className="block text-sm">
                    Private subscription address
                    <input
                      aria-label="Private subscription address"
                      readOnly
                      value={feedUrl}
                      onFocus={(event) => event.currentTarget.select()}
                      className="mt-1 block w-full rounded border border-border bg-elevated p-3"
                    />
                  </label>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(feedUrl);
                        setMessage("Subscription address copied.");
                      } catch {
                        setMessage("Select the subscription address above and copy it.");
                      }
                    }}
                  >
                    Copy subscription address
                  </Button>
                  <p className="text-sm text-muted">
                    Resetting the link stops the old subscription from updating. You will need to
                    subscribe again. Disabling it stops future updates; existing entries remain
                    until you remove that calendar in your app.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      disabled={change.isPending}
                      onClick={() => change.mutate({ action: "reset" })}
                    >
                      Reset private link
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={change.isPending}
                      onClick={() => change.mutate({ action: "disable" })}
                    >
                      Disable subscription
                    </Button>
                  </div>
                </details>
              </>
            ) : (
              <Button
                disabled={change.isPending}
                onClick={() => change.mutate({ action: "enable" })}
              >
                Create subscription link
              </Button>
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Selected races ({data?.items.length ?? 0})</h2>
            {!data?.items.length ? (
              <p>
                No races selected yet. Use Apple Calendar in a race page’s Add to calendar menu.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.items.map(({ id, race }) => (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold">
                        {race ? (
                          <a href={race.pageUrl} className="text-accent underline">
                            {race.name}
                          </a>
                        ) : (
                          "Edition no longer available"
                        )}
                      </p>
                      {race ? (
                        <p className="text-sm">
                          {race.date} · {race.distance}
                        </p>
                      ) : null}
                      {!race || calendarUnavailable(race) ? (
                        <p className="text-sm text-muted">
                          Unavailable races are omitted from the subscription. Check the organiser.
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant="secondary"
                      disabled={change.isPending}
                      aria-label={`Remove ${race?.name ?? "unavailable race"}`}
                      onClick={() => change.mutate({ action: "remove", raceId: id })}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
