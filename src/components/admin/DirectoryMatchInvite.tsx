import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { findDirectoryInvitationAccounts } from "@/lib/athrecs/claim-invitations-api";
import { formatAthleteId } from "@/lib/athrecs/athlete-id";
import { AthleteMatchInvite } from "@/components/staff/AthleteMatchInvite";
import { AthleteContactActions } from "@/components/staff/AthleteContactActions";
import { ExternalProfileInvite } from "@/components/staff/ExternalProfileInvite";

export function DirectoryMatchInvite({
  athleteNumber,
  name,
  initiallyNewContact = false,
}: {
  athleteNumber: string;
  name: string;
  initiallyNewContact?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ q?: string; page: number }>({ page: 1 });
  const [recipient, setRecipient] = useState<string | null>(null);
  const [newContact, setNewContact] = useState(initiallyNewContact);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const query = useQuery({
    queryKey: ["directory-invitation-accounts", athleteNumber, filters],
    queryFn: () => findDirectoryInvitationAccounts({ data: { athleteNumber, ...filters } }),
    staleTime: 0,
    gcTime: 0,
  });
  const account = query.data?.registered
    ? query.data.accounts[0]
    : query.data?.accounts.find((a) => a.userId === recipient);
  return (
    <section
      aria-label={`Match and invite for ${name}`}
      className="space-y-4 rounded-xl border border-accent bg-surface p-4 text-fg"
    >
      <div>
        <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold">
          Match & invite · {name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Invite someone new or match an existing signup. Use email, SMS or social messaging. The
          athlete confirms before staff approve the claim.
        </p>
      </div>
      {query.data && !query.data.registered ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={newContact ? "default" : "secondary"}
            aria-pressed={newContact}
            onClick={() => {
              setNewContact(true);
              setRecipient(null);
            }}
          >
            Invite someone not signed up
          </Button>
          <Button
            type="button"
            variant={newContact ? "secondary" : "default"}
            aria-pressed={!newContact}
            onClick={() => {
              setNewContact(false);
              setRecipient(null);
            }}
          >
            Match an existing signup
          </Button>
        </div>
      ) : null}
      {!query.data?.registered && !newContact ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setRecipient(null);
            setFilters({ q: search.trim(), page: 1 });
          }}
        >
          <label className="min-w-0 flex-1 basis-full text-sm font-medium sm:basis-auto">
            Find the athlete’s signup
            <input
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2"
              placeholder="Name, email or ATH number"
              maxLength={120}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Button type="submit">Find signup</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearch("");
              setRecipient(null);
              setFilters({ q: "", page: 1 });
            }}
          >
            Show all signups
          </Button>
        </form>
      ) : null}
      {query.isPending ? (
        <p role="status">Finding signed-up athletes…</p>
      ) : query.isError ? (
        <p role="alert">
          Signups could not load.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      ) : query.data ? (
        <>
          {!query.data.registered && !newContact ? (
            <>
              <p className="text-xs text-muted">
                {filters.q === undefined ? "Suggested signups by profile name. " : ""}
                {query.data.total} matching signups. Check the recipient; a matching name is only a
                suggestion.
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {query.data.accounts.map((a) => (
                  <article
                    key={a.userId}
                    className={`rounded-lg border p-3 ${account?.userId === a.userId ? "border-accent bg-accent-soft" : "border-border"}`}
                  >
                    <h3 className="font-semibold">{a.name}</h3>
                    <p className="break-all text-sm">{a.email}</p>
                    <p className="text-xs text-muted">
                      {a.athleteNumber ? formatAthleteId(a.athleteNumber) : "Account ID pending"} ·{" "}
                      {a.emailVerified ? "Email verified" : "Email verification required to claim"}
                    </p>
                    <p className="text-xs text-muted">
                      {[a.club, a.location].filter(Boolean).join(" · ") ||
                        "Club and location not supplied"}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-2"
                      aria-pressed={account?.userId === a.userId}
                      onClick={() => setRecipient(a.userId)}
                    >
                      Choose recipient
                    </Button>
                  </article>
                ))}
              </div>
              {!query.data.accounts.length ? (
                <p className="text-sm">
                  No signup found. Choose “Invite someone not signed up” to send a direct profile
                  invitation, or try another search.
                </p>
              ) : null}
              {query.data.total > query.data.pageSize ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={query.data.page <= 1 || query.isFetching}
                    onClick={() => {
                      setRecipient(null);
                      setFilters({ ...filters, page: query.data!.page - 1 });
                    }}
                  >
                    Previous signups
                  </Button>
                  <span>
                    Page {query.data.page} of {Math.ceil(query.data.total / query.data.pageSize)}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      query.data.page * query.data.pageSize >= query.data.total || query.isFetching
                    }
                    onClick={() => {
                      setRecipient(null);
                      setFilters({ ...filters, page: query.data!.page + 1 });
                    }}
                  >
                    Next signups
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
          {newContact && !query.data.registered && query.data.athleteId ? (
            <ExternalProfileInvite
              key={query.data.athleteId}
              athleteId={query.data.athleteId}
              name={name}
            />
          ) : null}
          {account && (!newContact || query.data.registered) ? (
            <div key={account.userId}>
              <p className="break-words text-sm font-medium">
                Recipient: {account.name} · {account.email}
              </p>
              <AthleteMatchInvite
                account={account}
                athleteId={query.data.athleteId ?? undefined}
                initiallyOpen
              />
              <AthleteContactActions account={account} />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
