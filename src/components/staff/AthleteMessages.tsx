import { useId, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageSquare, ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStaffAthleteMessages,
  saveStaffAthleteMessage,
} from "@/lib/athrecs/athlete-messages-api";
import {
  messageChannelLabels,
  messageStatusLabels,
  type MessageTarget,
} from "@/lib/athrecs/athlete-messages";

const fieldClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg";
const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "medium",
    timeStyle: "short",
  });

export function AthleteMessages({
  target,
  initiallyOpen = false,
}: {
  target: MessageTarget;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const panelId = useId();
  return (
    <section
      className="my-4 rounded-xl border border-border bg-surface p-4"
      aria-label="Athlete messages"
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-2 text-left text-lg font-semibold"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <MessageSquare className="size-5 text-accent" aria-hidden="true" /> Messages
        <span className="ml-auto text-xs font-normal text-muted">
          {open ? "Hide" : "View sent and received"}
        </span>
      </button>
      {open ? (
        <div id={panelId}>
          <MessageHistory target={target} />
        </div>
      ) : null}
    </section>
  );
}

function MessageHistory({ target }: { target: MessageTarget }) {
  const [direction, setDirection] = useState<"all" | "sent" | "received">("all");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const query = useQuery({
    queryKey: ["staff-athlete-messages", target, direction, page],
    queryFn: () => getStaffAthleteMessages({ data: { target, direction, page } }),
    gcTime: 0,
  });
  const data = query.isError ? undefined : query.data;
  return (
    <div className="space-y-4 pt-3">
      <p className="text-sm text-muted">
        Private correspondence for staff. Site emails appear automatically. Add replies from your
        inbox or messaging apps using Record a message.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1" aria-label="Message filters">
          {(["all", "sent", "received"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={direction === value ? "default" : "secondary"}
              aria-pressed={direction === value}
              onClick={() => {
                setDirection(value);
                setPage(1);
              }}
            >
              {value === "all" ? "All" : value === "sent" ? "Sent" : "Received"}
              {data ? ` (${value === "all" ? data.sent + data.received : data[value]})` : ""}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className="size-4" aria-hidden="true" /> Refresh
        </Button>
        <Button
          size="sm"
          className="sm:ml-auto"
          onClick={() => {
            setAdding(!adding);
            setNotice("");
          }}
          aria-expanded={adding}
        >
          {adding ? "Cancel" : "Record a message"}
        </Button>
      </div>
      {adding ? (
        <MessageForm
          target={target}
          onSaved={() => {
            setAdding(false);
            setPage(1);
            setNotice("Message saved to this athlete’s record.");
            void query.refetch();
          }}
        />
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-accent">
          {notice}
        </p>
      ) : null}
      {query.isError ? (
        <p role="alert">Messages could not load. Use Refresh to try again.</p>
      ) : query.isPending ? (
        <p role="status">Loading messages…</p>
      ) : data ? (
        <>
          {!data.messages.length ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
              No {direction === "all" ? "" : `${direction} `}messages recorded
              {page > 1 ? " on this page" : " yet"}.
            </p>
          ) : null}
          <ol className="space-y-3" aria-label="Message history">
            {data.messages.map((message) => (
              <li
                key={message.id}
                className={`rounded-lg border border-border p-4 ${message.direction === "received" ? "bg-elevated" : ""}`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-accent">
                    {message.direction === "received" ? (
                      <ArrowDownLeft className="size-4" aria-hidden="true" />
                    ) : (
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    )}
                    {message.direction === "received" ? "Received" : "Sent"}
                  </span>
                  <span>
                    {messageChannelLabels[message.channel as keyof typeof messageChannelLabels] ??
                      message.channel}
                  </span>
                  <time
                    className="text-muted sm:ml-auto"
                    dateTime={new Date(message.occurredAt).toISOString()}
                  >
                    {formatDate(message.occurredAt)}
                  </time>
                </div>
                <details>
                  <summary className="cursor-pointer break-words font-semibold">
                    {message.subject}
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm">{message.body}</p>
                </details>
                <p className="mt-2 break-words text-xs text-muted">
                  {message.direction === "received" ? "From" : "To"}: {message.contact}
                  {message.sender ? ` · Sender: ${message.sender}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {messageStatusLabels[message.status] ?? message.status}
                  {message.source === "site" ? " · Automatic record" : " · Manual record"}
                </p>
              </li>
            ))}
          </ol>
          {data.total > data.pageSize || page > 1 ? (
            <nav className="flex items-center justify-between gap-2" aria-label="Message pages">
              <Button
                variant="secondary"
                disabled={page <= 1 || query.isFetching}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}
              </span>
              <Button
                variant="secondary"
                disabled={page * data.pageSize >= data.total || query.isFetching}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </>
      ) : null}
      <p className="text-xs leading-5 text-muted">
        Dates use UK time. Earlier invitation emails are included where a send was recorded. Other
        site email tracking starts with this feature. Provider acceptance does not confirm delivery
        or reading. External inboxes are not synced.
      </p>
    </div>
  );
}

function MessageForm({ target, onSaved }: { target: MessageTarget; onSaved: () => void }) {
  const [entryId] = useState(() => crypto.randomUUID());
  const [direction, setDirection] = useState<"sent" | "received">("received");
  const [channel, setChannel] = useState<keyof typeof messageChannelLabels>("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [contact, setContact] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const mutation = useMutation({
    mutationFn: () =>
      saveStaffAthleteMessage({
        data: {
          target,
          entryId,
          direction,
          channel,
          subject,
          body,
          contact,
          occurredAt: new Date(occurredAt).toISOString(),
        },
      }),
    onSuccess: onSaved,
  });
  return (
    <form
      className="space-y-3 rounded-lg border border-border bg-elevated p-4"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <h3 className="font-semibold">Record a message</h3>
      <p className="text-xs text-muted">
        Save a message already sent or received. This does not send anything.
      </p>
      <fieldset disabled={mutation.isPending} className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          Direction
          <select
            className={fieldClass}
            aria-label="Direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as typeof direction)}
          >
            <option value="received">Received from athlete</option>
            <option value="sent">Sent to athlete</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Channel
          <select
            className={fieldClass}
            aria-label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
          >
            {Object.entries(messageChannelLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Athlete email, number or contact
          <input
            className={fieldClass}
            required
            maxLength={254}
            aria-label="Athlete email, number or contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          Date and time (your local time)
          <input
            type="datetime-local"
            className={fieldClass}
            required
            aria-label="Date and time (your local time)"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          Subject
          <input
            className={fieldClass}
            required
            maxLength={200}
            aria-label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm sm:col-span-2">
          Message
          <textarea
            className={fieldClass}
            required
            rows={5}
            maxLength={20000}
            aria-label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
      </fieldset>
      {mutation.isError ? (
        <p role="alert" className="text-sm text-red-600">
          Message could not be saved. Check the date and required fields, then try again.
        </p>
      ) : null}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving…" : "Save message"}
      </Button>
    </form>
  );
}
