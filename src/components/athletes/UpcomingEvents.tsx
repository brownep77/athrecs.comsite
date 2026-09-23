import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ATHLETE_SPORTS } from "@/lib/athrecs/athlete-account-api";
import {
  getMyUpcoming,
  saveMyUpcoming,
  deleteMyUpcoming,
  getStaffUpcoming,
  saveStaffUpcoming,
  deleteStaffUpcoming,
  type UpcomingEvent,
  type UpcomingInput,
} from "@/lib/athrecs/athlete-upcoming-api";
import { CountryFlag } from "./CountryFlag";
import { Button } from "@/components/ui/button";
import { formatRaceDateShort } from "@/lib/athrecs/format";

export function UpcomingTable({
  events,
  action,
}: {
  events: UpcomingEvent[];
  action?: (event: UpcomingEvent) => React.ReactNode;
}) {
  if (!events.length)
    return (
      <p className="rounded-lg border border-border p-4 text-sm text-muted">
        No upcoming events added yet.
      </p>
    );
  return (
    <div
      className={`${action ? "" : "profile-table-wrap"} overflow-x-auto rounded-lg border border-border bg-surface`}
    >
      <table
        role="table"
        className={`${action ? "" : "profile-card-table"} w-full text-left text-sm`}
      >
        <caption className="sr-only">Manually added athlete fixtures</caption>
        <thead role="rowgroup" className="bg-elevated text-xs text-subtle">
          <tr role="row">
            {[
              "Date",
              "Event",
              "Sport",
              "Distance",
              "Location",
              "Status",
              ...(action ? ["Manage"] : []),
            ].map((label) => (
              <th
                role="columnheader"
                key={label}
                scope="col"
                className="whitespace-nowrap px-3 py-2 font-medium"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="divide-y divide-border">
          {events.map((event) => (
            <tr role="row" key={event.id} className="hover:bg-elevated/50">
              <td
                role="cell"
                data-label="Date"
                className="whitespace-nowrap px-3 py-2 text-xs tabular-nums"
              >
                {formatRaceDateShort(event.eventDate)}
              </td>
              <td role="cell" data-label="Event" className="min-w-40 px-3 py-2 font-medium">
                {event.eventUrl ? (
                  <a
                    href={event.eventUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {event.eventName} ↗
                  </a>
                ) : (
                  event.eventName
                )}
              </td>
              <td role="cell" data-label="Sport" className="px-3 py-2 text-xs">
                {event.sport}
              </td>
              <td role="cell" data-label="Distance" className="px-3 py-2 text-xs">
                {event.distance || "—"}
              </td>
              <td role="cell" data-label="Location" className="px-3 py-2">
                <span className="inline-flex flex-wrap items-center gap-2 text-xs">
                  {event.city}
                  <CountryFlag country={event.country} />
                </span>
              </td>
              <td role="cell" data-label="Status" className="px-3 py-2 text-xs">
                {event.status}
              </td>
              {action ? (
                <td role="cell" data-label="Actions" className="px-3 py-2">
                  {action(event)}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const empty: UpcomingInput = {
  sport: "Running",
  eventName: "",
  eventDate: "",
  distance: "",
  city: "",
  country: "",
  eventUrl: "",
  status: "Planned",
};
export function UpcomingEventsEditor({ athleteId }: { athleteId?: number }) {
  const client = useQueryClient();
  const key = ["athlete-upcoming", athleteId ?? "me"];
  const query = useQuery({
    queryKey: key,
    queryFn: () => (athleteId ? getStaffUpcoming({ data: { athleteId } }) : getMyUpcoming()),
  });
  const [draft, setDraft] = useState<UpcomingInput | null>(null);
  const [message, setMessage] = useState("");
  const [removing, setRemoving] = useState<number | null>(null);
  const save = useMutation({
    mutationFn: (data: UpcomingInput) =>
      athleteId ? saveStaffUpcoming({ data: { ...data, athleteId } }) : saveMyUpcoming({ data }),
    onSuccess: async () => {
      setDraft(null);
      setMessage("Fixture saved.");
      await client.invalidateQueries({ queryKey: key });
    },
    onError: (error) => setMessage(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: number) =>
      athleteId
        ? deleteStaffUpcoming({ data: { id, athleteId } })
        : deleteMyUpcoming({ data: { id } }),
    onSuccess: async () => {
      setRemoving(null);
      setMessage("Fixture removed.");
      await client.invalidateQueries({ queryKey: key });
    },
    onError: (error) => setMessage(error.message),
  });
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold">Upcoming events</h2>
          <p className="text-xs text-muted">
            Add fixtures for any of your sports. Future events appear on your public profile when
            sharing is enabled.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setDraft({ ...empty });
            setMessage("");
          }}
        >
          Add event
        </Button>
      </div>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
      {draft ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-elevated p-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(draft);
          }}
        >
          {(
            [
              ["eventName", "Event name", "text"],
              ["eventDate", "Date", "date"],
              ["distance", "Distance / discipline", "text"],
              ["city", "City / venue", "text"],
              ["country", "Country", "text"],
              ["eventUrl", "Event website (optional)", "url"],
            ] as const
          ).map(([field, label, type]) => (
            <label className="space-y-1 text-xs font-medium" key={field}>
              {label}
              <input
                required={field === "eventName" || field === "eventDate"}
                maxLength={field === "eventUrl" ? 1000 : 200}
                type={type}
                value={draft[field] ?? ""}
                onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                className="block h-10 w-full rounded border border-border bg-surface px-2 text-sm"
              />
            </label>
          ))}
          <label className="space-y-1 text-xs font-medium">
            Sport
            <select
              value={draft.sport}
              onChange={(event) =>
                setDraft({ ...draft, sport: event.target.value as UpcomingInput["sport"] })
              }
              className="block h-10 w-full rounded border border-border bg-surface px-2 text-sm"
            >
              {ATHLETE_SPORTS.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium">
            Status
            <select
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as UpcomingInput["status"] })
              }
              className="block h-10 w-full rounded border border-border bg-surface px-2 text-sm"
            >
              {["Planned", "Entered", "Confirmed", "Cancelled"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <Button disabled={save.isPending} type="submit">
              {save.isPending ? "Saving…" : "Save fixture"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      {query.isLoading ? (
        <p>Loading fixtures…</p>
      ) : query.isError ? (
        <p role="alert">
          Fixtures could not load. <button onClick={() => void query.refetch()}>Try again</button>
        </p>
      ) : (
        <UpcomingTable
          events={query.data ?? []}
          action={(event) => (
            <div className="flex gap-2 whitespace-nowrap text-xs">
              {removing === event.id ? (
                <>
                  <button
                    disabled={remove.isPending}
                    className="text-red-700"
                    onClick={() => remove.mutate(event.id)}
                  >
                    Confirm remove
                  </button>
                  <button onClick={() => setRemoving(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button
                    className="text-accent"
                    onClick={() => {
                      setDraft(event);
                      setMessage("");
                    }}
                  >
                    Edit
                  </button>
                  <button className="text-red-700" onClick={() => setRemoving(event.id)}>
                    Remove
                  </button>
                </>
              )}
            </div>
          )}
        />
      )}
    </section>
  );
}
