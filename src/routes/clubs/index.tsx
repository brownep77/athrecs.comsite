import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { useState } from "react";
import {
  CLUB_PAGE_SIZE,
  parseClubDirectorySearch,
  type ClubDirectorySearch,
} from "@/lib/clubs/directory-search";
import { directoryStructuredData } from "@/lib/athrecs/directory-structured-data";
import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { getClubDirectoryPage } from "@/lib/athrecs/api";
import { ClubCard } from "@/components/clubs/ClubCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/clubs/")({
  validateSearch: parseClubDirectorySearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const data = await getClubDirectoryPage({ data: deps });
    if (deps.page && !data.clubs.length) throw notFound();
    return data;
  },
  head: ({ loaderData, match }) => {
    if (IS_RUNRECS_SITE || !loaderData) return {};
    const { q, country, sport, page } = match.search;
    const filtered = Boolean(q || country || sport);
    const url = `${SITE_URL}/clubs${page && !filtered ? `?page=${page}` : ""}`;
    const title = `Running, swimming, cycling and triathlon clubs${page ? ` · Page ${page}` : ""} | ATHRECS`;
    return {
      meta: siteGraphMeta({
        title,
        description:
          "Find running, swimming, cycling, triathlon and athletics clubs. Browse club profiles, locations, official websites and athlete records on AthRecs.",
        url,
        indexable: !filtered,
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: filtered
        ? []
        : directoryStructuredData(
            url,
            title.split(" | ")[0],
            loaderData.clubs.map((club) => ({
              name: club.name,
              path: `/clubs/${encodeURIComponent(club.slug)}`,
            })),
          ),
    };
  },
  component: ClubsPage,
});

function ClubsPage() {
  const { clubs, total, countries, sports } = Route.useLoaderData();
  const search = Route.useSearch();
  const { q = "", sport = "", country = "", page: currentPage = 1 } = search;
  const navigate = useNavigate({ from: Route.fullPath });
  const [draft, setDraft] = useState<string | null>(null);
  const pages = Math.max(1, Math.ceil(total / CLUB_PAGE_SIZE));
  function changeFilter(patch: Partial<ClubDirectorySearch>) {
    void navigate({
      to: "/clubs",
      search: { ...search, ...patch, page: undefined },
      replace: true,
      resetScroll: false,
    });
  }
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
          Find your club by name, location or sport. Open its profile to claim it or request access
          as a club representative. Affiliated and unaffiliated clubs can apply.
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
          value={draft ?? q}
          onFocus={() => setDraft(q)}
          onBlur={() => setDraft(null)}
          onChange={(e) => {
            setDraft(e.target.value);
            changeFilter({ q: e.target.value || undefined });
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
              changeFilter({ country: e.target.value || undefined });
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
              changeFilter({ sport: e.target.value || undefined });
            }}
            className="ml-2 min-h-11 rounded-lg border border-border bg-surface px-3"
          >
            <option value="">All sports</option>
            {(sport && !sports.includes(sport) ? [...sports, sport] : sports).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-subtle" aria-live="polite">
        {total} clubs · Page {currentPage} of {pages}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {clubs.map((c) => (
          <ClubCard key={c.id} club={c} />
        ))}
      </div>
      {!clubs.length && (
        <p>
          No clubs match these filters. Try another name or clear the country and sport filters.
        </p>
      )}
      {pages > 1 && (
        <nav aria-label="Club directory pages" className="flex gap-3">
          {currentPage > 1 && (
            <Button variant="secondary" asChild>
              <Link
                to="/clubs"
                rel="prev"
                search={{ ...search, page: currentPage === 2 ? undefined : currentPage - 1 }}
              >
                Previous
              </Link>
            </Button>
          )}
          {currentPage < pages && (
            <Button variant="secondary" asChild>
              <Link to="/clubs" rel="next" search={{ ...search, page: currentPage + 1 }}>
                Next
              </Link>
            </Button>
          )}
        </nav>
      )}
      <p className="text-xs text-muted">
        Directory evidence badges describe the listing. Representative identity and authority are
        checked separately during registration.
      </p>
    </div>
  );
}
