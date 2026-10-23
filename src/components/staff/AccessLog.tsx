import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "../ui/button";
import { listAccessLog } from "@/lib/athrecs/access-log-api";
import type { AccessEvent, AccessFilters } from "@/lib/athrecs/access-diagnostics";

const field = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm";
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "Europe/London",
      }).format(new Date(value))
    : "Not recorded";
const label = (value: string) => value.replaceAll("_", " ");
const initial = {
  q: "",
  page: 1,
  days: 7,
  outcome: "all",
  device: "",
  browser: "",
  view: "events",
} as const;

export function AccessLog() {
  const [filters, setFilters] = useState<AccessFilters>(initial);
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["staff-access-log", filters],
    queryFn: () => listAccessLog({ data: filters }),
    staleTime: 30_000,
    gcTime: 0,
    refetchInterval: 60_000,
  });
  const data = query.data,
    sessions = filters.view === "sessions";
  const update = (patch: Partial<AccessFilters>) => setFilters({ ...filters, ...patch, page: 1 });
  return (
    <section className="min-w-0 space-y-5" aria-label="Login and diagnostics">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Login & diagnostics</h1>
          <p className="mt-2 text-sm text-muted">
            A shared timeline of account access and website problems. Times are UK time. Refreshes
            every minute while open.
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh log
        </Button>
      </header>
      <div className="flex flex-wrap gap-2" aria-label="Log views">
        <Button
          variant={!sessions ? "default" : "secondary"}
          aria-pressed={!sessions}
          onClick={() => update({ view: "events" })}
        >
          All access events
        </Button>
        <Button
          variant={sessions ? "default" : "secondary"}
          aria-pressed={sessions}
          onClick={() => update({ view: "sessions" })}
        >
          Unexpired sessions
        </Button>
      </div>
      <p className="rounded-xl border border-border bg-surface p-4 text-sm leading-6 text-muted">
        {sessions
          ? "These accounts have sessions that have not expired or been signed out. This does not show who is online now. One account can have several sessions. The list covers retained sign-ins from the last 90 days."
          : "Successful sign-ins are confirmed sessions. Email entered on an unsuccessful attempt is unverified. Browser errors are client-reported observations. Verification and recovery requests do not mean someone signed in."}
      </p>
      <form
        className="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: search.trim() });
        }}
      >
        <label className="space-y-1 text-sm font-medium">
          Search accounts or errors
          <input
            className={field}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            maxLength={120}
            placeholder="Name, email, error or support reference"
          />
        </label>
        {!sessions ? (
          <>
            <Select
              label="Period"
              value={String(filters.days)}
              onChange={(value) => update({ days: Number(value) })}
              options={[
                ["1", "Last 24 hours"],
                ["7", "Last 7 days"],
                ["30", "Last 30 days"],
                ["90", "Last 90 days"],
              ]}
            />
            <Select
              label="Outcome"
              value={filters.outcome}
              onChange={(value) => update({ outcome: value as AccessFilters["outcome"] })}
              options={[
                ["all", "All outcomes"],
                ["success", "Successful sign-ins"],
                ["failed", "Failed attempts"],
                ["error", "Errors"],
                ["info", "Other access activity"],
              ]}
            />
          </>
        ) : null}
        <Select
          label="Device type"
          value={filters.device}
          onChange={(device) => update({ device })}
          options={[
            ["", "All devices"],
            ...["Mobile phone", "Tablet", "Desktop / laptop", "Automated client", "Unknown"].map(
              (v) => [v, v],
            ),
          ]}
        />
        <Select
          label="Browser"
          value={filters.browser}
          onChange={(browser) => update({ browser })}
          options={[
            ["", "All browsers"],
            ...["Chrome", "Safari", "Edge", "Firefox", "Samsung Internet", "Opera", "Unknown"].map(
              (v) => [v, v],
            ),
          ]}
        />
        <div className="flex items-end gap-2">
          <Button type="submit">
            <Search className="size-4" aria-hidden="true" />
            Search log
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearch("");
              setFilters({ ...initial, view: filters.view });
            }}
          >
            Reset filters
          </Button>
        </div>
      </form>
      {query.isError ? (
        <p role="alert">The log could not load. Use Refresh log to try again.</p>
      ) : query.isPending ? (
        <p role="status">Loading access records…</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Metric
              label={sessions ? "Unexpired sessions" : "Matching events"}
              value={data.summary.total}
            />
            <Metric label="Successful sign-ins" value={data.summary.successful} />
            <Metric label="Failed attempts" value={data.summary.failed} />
            <Metric label="Errors" value={data.summary.errors} />
          </div>
          <p className="text-xs leading-5 text-muted">
            Detailed failure and error capture began {date(data.startedAt)}. Earlier failures cannot
            be reconstructed. Older surviving sessions are marked as recovered. Records are retained
            for 90 days.{" "}
            {data.summary.p95 !== null
              ? `95% of timed requests completed within ${data.summary.p95.toLocaleString("en-GB")} ms. Timing excludes diagnostic storage.`
              : ""}
          </p>
          {!sessions && data.issues.length ? (
            <details className="rounded-xl border border-border bg-surface p-4">
              <summary className="cursor-pointer font-semibold">
                Most common problems in these results
              </summary>
              <ul className="mt-3 space-y-2 text-sm">
                {data.issues.map((issue, i) => (
                  <li key={i}>
                    <strong>
                      {issue.count} × {issue.code}
                    </strong>{" "}
                    · {issue.route} · {issue.browser} · {issue.device}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          <p role="status" className="text-sm text-muted">
            {data.summary.total.toLocaleString("en-GB")} records · newest first
          </p>
          {data.events.length ? (
            <div className="max-w-full overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <caption className="sr-only">
                  Individual account access events, newest first
                </caption>
                <thead>
                  <tr>
                    {[
                      "When (UK)",
                      "Account / entered email",
                      "Event and outcome",
                      "Browser and device",
                      "Approximate location",
                      "Details",
                    ].map((title) => (
                      <th key={title} scope="col" className="border-b border-border p-3">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((event) => (
                    <EventRow key={event.id} event={event} sessions={sessions} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed p-5">No records match these filters.</p>
          )}
          <nav className="flex items-center justify-between gap-2" aria-label="Access log pages">
            <Button
              variant="secondary"
              disabled={data.page <= 1}
              onClick={() => setFilters({ ...filters, page: data.page - 1 })}
            >
              Previous events
            </Button>
            <span className="text-sm">
              Page {data.page} of {Math.max(1, Math.ceil(data.summary.total / data.pageSize))}
            </span>
            <Button
              variant="secondary"
              disabled={data.page * data.pageSize >= data.summary.total}
              onClick={() => setFilters({ ...filters, page: data.page + 1 })}
            >
              Next events
            </Button>
          </nav>
          <p className="text-xs leading-5 text-muted">
            Locations are approximate. Device numbers recognise a browser on this site, not a
            physical device or phone serial number. Reports may be absent when the page or network
            cannot start, or rate limits are reached. No passwords, codes, tokens, raw IPs or error
            message text are stored here.
          </p>
        </>
      ) : null}
    </section>
  );
}
function EventRow({ event: e, sessions }: { event: AccessEvent; sessions: boolean }) {
  const color =
    e.outcome === "success"
      ? "bg-emerald-50 text-emerald-800"
      : e.outcome === "failed"
        ? "bg-amber-50 text-amber-900"
        : e.outcome === "error"
          ? "bg-red-50 text-red-800"
          : "bg-slate-100 text-slate-700";
  return (
    <tr className="align-top">
      <td className="border-b border-border p-3 whitespace-nowrap">
        {date(e.at)}
        {e.recovered ? (
          <span className="mt-1 block text-xs text-muted">Recovered session</span>
        ) : null}
        {sessions ? (
          <span className="mt-1 block text-xs text-muted">Expires {date(e.expiresAt)}</span>
        ) : null}
      </td>
      <td className="max-w-64 border-b border-border p-3 break-words">
        <strong>
          {e.identity === "account"
            ? e.name
            : e.identity === "entered"
              ? "Email entered (unverified)"
              : "Unidentified visitor"}
        </strong>
        <span className="mt-1 block">{e.email ?? "No account identified"}</span>
      </td>
      <td className="border-b border-border p-3">
        <span
          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold capitalize ${color}`}
        >
          {label(e.outcome)}
        </span>
        <span className="mt-2 block capitalize">{label(e.kind)}</span>
        <span className="mt-1 block text-xs">{e.method ?? "Method not recorded"}</span>
        {e.errorCode ? (
          <strong className="mt-2 block break-all text-xs">{e.errorCode}</strong>
        ) : null}
      </td>
      <td className="border-b border-border p-3">
        {e.browser}
        {e.browserVersion ? ` ${e.browserVersion}` : ""}
        <span className="mt-1 block text-xs">
          {e.deviceType} · {e.os}
        </span>
        <span className="mt-1 block text-xs">
          {e.deviceNumber ? `Device ${e.deviceNumber}` : "No recognised device number"}
        </span>
      </td>
      <td className="border-b border-border p-3">{e.location}</td>
      <td className="max-w-72 border-b border-border p-3">
        <details>
          <summary className="cursor-pointer font-medium">Event details</summary>
          <dl className="mt-2 space-y-2 break-all text-xs">
            {[
              ["Website", e.host],
              ["Page / endpoint", e.route],
              ["HTTP status", e.httpStatus],
              ["Response time", e.durationMs === null ? null : `${e.durationMs} ms`],
              ["Support reference", e.requestId],
              ["Release", e.releaseId?.slice(0, 12)],
              ["Source", e.source === "browser" ? "Browser report (unverified)" : "Server"],
              [
                "Browser connection",
                e.online === null ? null : e.online ? "Reported online" : "Reported offline",
              ],
              ["Screen size", e.viewport],
            ].map(([key, value]) => (
              <div key={key}>
                <dt className="font-semibold">{key}</dt>
                <dd>{value ?? "Not recorded"}</dd>
              </div>
            ))}
          </dl>
        </details>
      </td>
    </tr>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-2xl font-semibold">{value.toLocaleString("en-GB")}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="space-y-1 text-sm font-medium">
      {label}
      <select
        aria-label={label}
        className={field}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
