import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "../ui/button";
import { getClientLoginHistory, listClientData } from "@/lib/athrecs/client-data-api";
import type { ClientDataItem, ClientLogin } from "@/lib/athrecs/client-data";

const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg";
const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/London",
      }).format(new Date(value))
    : "Not recorded";

export function ClientData() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{
    q: string;
    page: number;
    sort: "newest" | "recent" | "logins";
  }>({ q: "", page: 1, sort: "newest" });
  const clients = useQuery({
    queryKey: ["staff-client-data", filters],
    queryFn: () => listClientData({ data: filters }),
    staleTime: 30_000,
    gcTime: 0,
    refetchInterval: 60_000,
  });
  const data = clients.data;
  return (
    <section className="space-y-5" aria-label="Client data">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Client data</h1>
          <p className="mt-2 text-sm text-muted">
            Private account, device and sign-in records for authorised staff. Refreshes every minute
            while open.
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={clients.isFetching}
          onClick={() => void clients.refetch()}
        >
          <RefreshCw className="size-4" aria-hidden="true" /> Refresh
        </Button>
      </header>
      <form
        className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[2fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...filters, q: search.trim(), page: 1 });
        }}
      >
        <label className="space-y-1 text-sm font-medium">
          Find a client
          <input
            className={inputClass}
            value={search}
            maxLength={120}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Sort by
          <select
            className={inputClass}
            value={filters.sort}
            onChange={(event) =>
              setFilters({ ...filters, sort: event.target.value as typeof filters.sort, page: 1 })
            }
          >
            <option value="newest">Newest signup</option>
            <option value="recent">Latest sign-in</option>
            <option value="logins">Most sign-ins</option>
          </select>
        </label>
        <Button type="submit">
          <Search className="size-4" aria-hidden="true" /> Search
        </Button>
      </form>
      <p className="rounded-xl border border-border bg-surface p-4 text-sm leading-6 text-muted">
        Locations are approximate network locations, not addresses. Device types are
        browser-reported. Device numbers recognise a browser on this site, not a phone serial number
        or IMEI. Another browser, private browsing or cleared cookies can produce a new number;
        shared browsers can be used by different people.
      </p>
      {clients.isError ? (
        <p role="alert">Client data could not load. Use Refresh to try again.</p>
      ) : clients.isPending ? (
        <p role="status">Loading client data…</p>
      ) : data ? (
        <>
          <p className="text-xs leading-5 text-muted">
            Counts include successful new sessions, including signup, since{" "}
            {formatDate(data.countsSince)}. Refreshes and failed attempts do not count. Detailed
            capture began {formatDate(data.detailsSince)}; surviving older sessions are marked.
            History and recognised devices cover the last 90 days. Times are UK time.
          </p>
          <p role="status" className="text-sm text-muted">
            {data.total.toLocaleString("en-GB")} matching clients
          </p>
          {data.clients.map((client) => (
            <ClientCard key={client.userId} client={client} />
          ))}
          {!data.clients.length ? <p>No clients match this search.</p> : null}
          <Pagination
            page={data.page}
            total={data.total}
            pageSize={data.pageSize}
            onPage={(page) => setFilters({ ...filters, page })}
          />
        </>
      ) : null}
    </section>
  );
}

function ClientCard({ client }: { client: ClientDataItem }) {
  const [showHistory, setShowHistory] = useState(false);
  const latest = client.latestLogin;
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <h2 className="text-lg font-semibold">{client.name}</h2>
      <p className="break-all text-sm text-muted">
        {client.email} · {client.emailVerified ? "Email verified" : "Email unverified"}
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Signed up">{formatDate(client.signedUpAt)}</Field>
        <Field label="Last recorded sign-in">{formatDate(client.lastSignInAt)}</Field>
        <Field label="Recorded sign-ins">{client.signInCount.toLocaleString("en-GB")}</Field>
        <Field label="Recognised devices (90 days)">
          {client.recognisedDevices.toLocaleString("en-GB")}
        </Field>
        <Field label="Latest captured location">{latest?.location ?? "Not recorded"}</Field>
        <Field label="Latest captured device">
          {latest ? deviceDescription(latest) : "Not recorded"}
        </Field>
        <Field label="Device number">
          {latest?.deviceNumber ? `Device ${latest.deviceNumber}` : "Not assigned"}
        </Field>
        <Field label="Sign-in method for latest record">
          {latest?.signInMethod ?? "Not recorded"}
        </Field>
        <Field label="Linked sign-in methods">
          {client.linkedMethods.join(", ") || "None recorded"}
        </Field>
      </dl>
      {latest?.existingSession ? (
        <p className="mt-3 text-xs text-muted">
          Recovered from an existing session. Its sign-in method, location and device number were
          not captured.
        </p>
      ) : null}
      <Button
        className="mt-4"
        variant="secondary"
        aria-expanded={showHistory}
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? "Hide login history" : "View login history"}
      </Button>
      {showHistory ? <ClientLoginHistory userId={client.userId} /> : null}
    </article>
  );
}

function ClientLoginHistory({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["staff-client-logins", userId, page],
    queryFn: () => getClientLoginHistory({ data: { userId, page } }),
    staleTime: 30_000,
    gcTime: 0,
    refetchInterval: 60_000,
  });
  if (query.isError)
    return (
      <div className="mt-4" role="alert">
        History could not load.{" "}
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    );
  if (query.isPending)
    return (
      <p className="mt-4" role="status">
        Loading login history…
      </p>
    );
  const data = query.data;
  return (
    <section className="mt-4 space-y-3" aria-label="Login history">
      <h3 className="font-semibold">Login history — last 90 days</h3>
      {data.logins.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {[
                  "Signed in (UK)",
                  "Approximate location",
                  "Device type / browser",
                  "Device number",
                  "Method",
                ].map((label) => (
                  <th key={label} scope="col" className="border-b border-border p-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.logins.map((login) => (
                <tr key={login.id}>
                  <td className="border-b border-border p-2">
                    {formatDate(login.signedInAt)}
                    {login.existingSession ? (
                      <span className="block text-xs text-muted">Existing session</span>
                    ) : null}
                  </td>
                  <td className="border-b border-border p-2">{login.location}</td>
                  <td className="border-b border-border p-2">{deviceDescription(login)}</td>
                  <td className="border-b border-border p-2">
                    {login.deviceNumber ? `Device ${login.deviceNumber}` : "Not assigned"}
                  </td>
                  <td className="border-b border-border p-2">
                    {login.signInMethod ?? "Not recorded"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No retained login details. Earlier sign-ins can still be included in the total.</p>
      )}
      <Pagination page={data.page} total={data.total} pageSize={data.pageSize} onPage={setPage} />
    </section>
  );
}
function deviceDescription(login: ClientLogin) {
  return `${login.deviceType} · ${login.os} · ${login.browser}`;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 text-sm">
      <dt className="font-medium">{label}</dt>
      <dd className="mt-1 break-words text-muted">{children}</dd>
    </div>
  );
}
function Pagination({
  page,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Client data pages">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span className="text-sm">
        Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
      </span>
      <Button
        variant="secondary"
        disabled={page * pageSize >= total}
        onClick={() => onPage(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
