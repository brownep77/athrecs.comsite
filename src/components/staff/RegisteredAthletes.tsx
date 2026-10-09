import { AthleteMatchInvite } from "./AthleteMatchInvite";
import { RegistrationStats } from "./RegistrationStats";
import { AthleteContactActions } from "./AthleteContactActions";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listRegisteredAthletes } from "@/lib/athrecs/registrations-api";
import type { RegistrationFilters } from "@/lib/athrecs/registration-filters";
import type { RegisteredAthlete } from "@/lib/athrecs/registrations.server";
import { STAFF_SENDER_LABEL } from "@/lib/athrecs/athlete-contact";
import { formatAthleteId } from "@/lib/athrecs/athlete-id";

const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg";
const initialFilters: RegistrationFilters = {
  q: "",
  status: "all",
  sort: "newest",
  page: 1,
  month: "",
  joinedFrom: "",
  joinedTo: "",
};

export function RegisteredAthletes() {
  const [filters, setFilters] = useState(initialFilters);
  const [search, setSearch] = useState("");
  const accounts = useQuery({
    queryKey: ["staff-registrations", filters],
    queryFn: () => listRegisteredAthletes({ data: filters }),
    staleTime: 30_000,
    gcTime: 0,
  });
  const data = accounts.data;
  return (
    <section className="space-y-5" aria-label="Signed-up athletes">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-fg">Signed-up athletes</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Every registered account, including people who have not finished their profile. Private
            account and activity information for staff.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => void accounts.refetch()}
          disabled={accounts.isFetching}
        >
          <RefreshCw className="size-4" aria-hidden="true" /> Refresh
        </Button>
      </header>
      {data && !accounts.isError ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Registered athletes", data.summary.total],
            ["Signed up today", data.summary.today],
            ["Signed up this month", data.summary.thisMonth],
            ["Joined in last 7 days", data.summary.recentSignups],
            ["Email unverified", data.summary.unverified],
            ["Awaiting claim approval", data.summary.pending],
            ["Claims needing information", data.summary.needsInfo],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-2xl font-semibold text-fg">{value.toLocaleString("en-GB")}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      ) : null}
      {data && !accounts.isError ? (
        <RegistrationStats
          stats={data.stats}
          onMonth={(month) => setFilters({ ...filters, month })}
          onPeriod={(joinedFrom, joinedTo) =>
            setFilters({ ...filters, joinedFrom, joinedTo, page: 1 })
          }
        />
      ) : null}
      <aside
        className="rounded-xl border border-border bg-surface p-4 text-sm text-muted"
        aria-label="Contact sender"
      >
        <strong className="text-fg">Contact sender: {STAFF_SENDER_LABEL}</strong>
        <p className="mt-1">
          Select that SIM for SMS or sign into that number in WhatsApp, Telegram or Viber. Email
          uses your mail app’s selected sender. Contact buttons open the app or profile for you to
          compose and send. Recipient account and privacy settings may limit availability.
        </p>
      </aside>
      <form
        className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...filters, q: search.trim(), page: 1 });
        }}
      >
        <label className="space-y-1 text-sm font-medium text-fg">
          Find an athlete
          <input
            className={inputClass}
            value={search}
            maxLength={120}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email, club or ATH number"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-fg">
          Show
          <select
            className={inputClass}
            value={filters.status}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: event.target.value as RegistrationFilters["status"],
                page: 1,
              })
            }
          >
            <option value="all">All registrations</option>
            <option value="pending">Claims awaiting action</option>
            <option value="unverified">Email unverified</option>
            <option value="unfinished">Profile not saved</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium text-fg">
          Sort by
          <select
            className={inputClass}
            value={filters.sort}
            onChange={(event) =>
              setFilters({
                ...filters,
                sort: event.target.value as RegistrationFilters["sort"],
                page: 1,
              })
            }
          >
            <option value="newest">Newest signup</option>
            <option value="oldest">Oldest signup</option>
            <option value="logins">Most recorded sign-ins</option>
            <option value="recent">Most recent sign-in</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium text-fg">
          Signed up from
          <input
            type="date"
            className={inputClass}
            value={filters.joinedFrom}
            max={filters.joinedTo || undefined}
            onChange={(event) =>
              setFilters({ ...filters, joinedFrom: event.target.value, page: 1 })
            }
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-fg">
          Signed up to
          <input
            type="date"
            className={inputClass}
            value={filters.joinedTo}
            min={filters.joinedFrom || undefined}
            onChange={(event) => setFilters({ ...filters, joinedTo: event.target.value, page: 1 })}
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setSearch("");
            setFilters({ ...initialFilters, month: filters.month });
          }}
        >
          Clear filters
        </Button>
        <Button type="submit">
          <Search className="size-4" aria-hidden="true" /> Search
        </Button>
      </form>
      {accounts.isError ? (
        <div role="alert" className="rounded-lg border border-red-300 p-4 text-sm">
          Accounts could not load. Use Refresh to try again.
        </div>
      ) : accounts.isPending ? (
        <p role="status">Loading registered athletes…</p>
      ) : data ? (
        <>
          <p className="text-xs leading-5 text-muted">
            Sign-ins count new authenticated sessions (including signup) since{" "}
            {formatTimestamp(data.summary.trackingSince)}. Earlier logins are unknown; refreshes and
            failed attempts do not count. Dates use UK time. Claimed races count distinct race
            editions, excluding rejected or withdrawn claims. Sports from linked results are
            separate from self-selected sports; DNS records are excluded.
          </p>
          <p className="text-sm text-muted" role="status">
            {data.total.toLocaleString("en-GB")} matching account{data.total === 1 ? "" : "s"}
          </p>
          <div className="space-y-3">
            {data.accounts.map((account) => (
              <RegistrationCard key={account.userId} account={account} />
            ))}
            {!data.accounts.length ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center">
                No registrations match these filters.
              </p>
            ) : null}
          </div>
          <nav className="flex items-center justify-between gap-3" aria-label="Account pages">
            <Button
              variant="secondary"
              disabled={data.page <= 1}
              onClick={() => setFilters({ ...filters, page: data.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}
            </span>
            <Button
              variant="secondary"
              disabled={data.page * data.pageSize >= data.total}
              onClick={() => setFilters({ ...filters, page: data.page + 1 })}
            >
              Next
            </Button>
          </nav>
        </>
      ) : null}
    </section>
  );
}

function RegistrationCard({ account }: { account: RegisteredAthlete }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-fg">{account.name}</h2>
          <p className="break-all text-sm text-muted">{account.email}</p>
          <p className="mt-1 text-xs text-muted">
            {account.athleteNumber
              ? formatAthleteId(account.athleteNumber)
              : "ATH number unavailable"}{" "}
            · {account.emailVerified ? "Email verified" : "Email unverified"} ·{" "}
            {account.profileSavedAt ? "Profile saved" : "Profile not saved"}
          </p>
        </div>
        <Link
          to="/admin/result-claims"
          search={{ claimant: account.userId }}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
        >
          Review claims
          {account.pending + account.needsInfo ? ` (${account.pending + account.needsInfo})` : ""}
        </Link>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <Detail label="Signed up">{formatTimestamp(account.signedUpAt)}</Detail>
        <Detail label="Last recorded sign-in">
          {account.lastSignInAt
            ? formatTimestamp(account.lastSignInAt)
            : "None recorded since tracking began"}
        </Detail>
        <Detail label="Recorded sign-ins">{account.signInCount.toLocaleString("en-GB")}</Detail>
        <Detail label="Claimed races">
          {account.racesClaimed} · {account.linkedProfiles} linked profiles ·{" "}
          {account.linkedResults} linked results
        </Detail>
        <Detail label="Claim status">
          {account.approved} approved · {account.pending} pending · {account.needsInfo} need
          information · {account.rejected} rejected · {account.withdrawn} withdrawn
        </Detail>
        <Detail label="Sports in linked results">
          {account.resultSports.join(", ") || "No linked race records"}
        </Detail>
        <Detail label="Self-selected sports">
          {account.selectedSports.join(", ") || "None supplied"}
        </Detail>
        <Detail label="Club and location">
          {[account.club, account.location].filter(Boolean).join(" · ") || "None supplied"}
        </Detail>
      </dl>
      <AthleteMatchInvite account={account} />
      <AthleteContactActions account={account} />
    </article>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-medium text-fg">{label}</dt>
      <dd className="mt-1 break-words text-muted">{children}</dd>
    </div>
  );
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
}
