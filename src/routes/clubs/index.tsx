import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listClubs } from "@/lib/athrecs/api";
import { ClubCard } from "@/components/clubs/ClubCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/clubs/")({
  loader: () => listClubs({ data: {} }),
  head: () =>
    IS_RUNRECS_SITE
      ? {}
      : {
          meta: siteGraphMeta({
            title: "Running, swimming, cycling and triathlon clubs | ATHRECS",
            description:
              "Find running, swimming, cycling, triathlon and athletics clubs. Browse club profiles, locations, official websites and athlete records on AthRecs.",
            url: `${SITE_URL}/clubs`,
          }),
          links: [{ rel: "canonical", href: `${SITE_URL}/clubs` }],
        },
  component: ClubsPage,
});

function ClubsPage() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [sport, setSport] = useState("");
  const [page, setPage] = useState(1);
  const { data = initial } = useQuery({
    queryKey: ["clubs", q],
    queryFn: () => listClubs({ data: { q: q || undefined } }),
    initialData: !q ? initial : undefined,
    placeholderData: (prev) => prev ?? (!q ? initial : undefined),
    staleTime: 30_000,
    refetchOnMount: false,
  });
  const countries = [...new Set(initial.map((club) => club.country).filter(Boolean))].sort();
  const sports = [...new Set(initial.flatMap((club) => club.sports))].sort();
  const filtered = data.filter(
    (club) => (!country || club.country === country) && (!sport || club.sports.includes(sport)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 48));
  const currentPage = Math.min(page, pages);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">Clubs</h1>
          {!IS_RUNRECS_SITE ? (
            <Link
              to="/directory"
              search={{}}
              className="text-sm font-medium text-accent hover:underline"
            >
              Federations & governing bodies →
            </Link>
          ) : null}
          <Link
            to="/athletes"
            className="text-sm font-medium text-accent no-underline hover:underline"
          >
            Athletes →
          </Link>
        </div>
        <p className="text-sm text-muted">
          Find a club by name, location or sport. Browse its public listing before registering as an
          authorised club representative. Affiliated and unaffiliated clubs can register.
        </p>
        {!IS_RUNRECS_SITE && (
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/clubs/account">Club sign-in / My registrations</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/clubs/register" search={{ missing: true }}>
                Club missing? Request a listing
              </Link>
            </Button>
          </div>
        )}
      </header>

      <label className="block max-w-md space-y-1.5 text-xs font-medium text-muted">
        Search
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Club name, city, sport…"
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          Country
          <select
            aria-label="Country"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            className="ml-2 min-h-11 rounded-lg border border-border bg-surface px-3"
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Sport
          <select
            aria-label="Sport"
            value={sport}
            onChange={(e) => {
              setSport(e.target.value);
              setPage(1);
            }}
            className="ml-2 min-h-11 rounded-lg border border-border bg-surface px-3"
          >
            <option value="">All sports</option>
            {sports.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-subtle" aria-live="polite">
        {filtered.length} clubs · Page {currentPage} of {pages}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.slice((currentPage - 1) * 48, currentPage * 48).map((c) => (
          <ClubCard key={c.id} club={c} />
        ))}
      </div>
      {!filtered.length && (
        <p>
          No clubs match these filters. Try another name or clear the country and sport filters.
        </p>
      )}
      {pages > 1 && (
        <nav aria-label="Club directory pages" className="flex gap-3">
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </nav>
      )}
      <p className="text-xs text-muted">
        Directory evidence badges describe the listing. Representative identity and authority are
        checked separately during registration.
      </p>
    </div>
  );
}
