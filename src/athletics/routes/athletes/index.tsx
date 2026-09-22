import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowRight, Search, UserRound } from "lucide-react";
import { AthleteDirectoryCard } from "@/components/athletes/AthleteDirectoryCard";
import { getAthleteDirectory } from "@/lib/athrecs/athlete-directory-api";
import {
  parseAthleteDirectorySearch,
  type AthleteDirectory,
  type AthleteDirectorySearch,
} from "@/lib/athrecs/athlete-directory";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

export const Route = createFileRoute("/athletes/")({
  validateSearch: parseAthleteDirectorySearch,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getAthleteDirectory({ data: deps }),
  head: ({ loaderData, match }) => {
    const search = parseAthleteDirectorySearch(match.search);
    const query = new URLSearchParams();
    for (const key of ["q", "country", "sport"] as const) {
      if (search[key]) query.set(key, search[key]);
    }
    const page = loaderData?.page ?? search.page ?? 1;
    if (page > 1) query.set("page", String(page));
    const canonical = `${SITE_URL}/athletes${query.size ? `?${query}` : ""}`;
    const filtered = Boolean(search.q || search.country || search.sport);
    return {
      meta: siteGraphMeta({
        title: `Explore athlete profiles${page > 1 ? ` · Page ${page}` : ""} | ATHRECS`,
        description:
          "Find public athlete profiles by name, country and sport. Explore race results, source performance histories and sporting records.",
        url: canonical,
      }).map((tag) =>
        filtered && "name" in tag && tag.name === "robots"
          ? { name: "robots", content: "noindex, follow" }
          : tag,
      ),
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: AthleteDirectoryPage,
});

function AthleteDirectoryPage() {
  const directory = Route.useLoaderData() as unknown as AthleteDirectory;
  const search = Route.useSearch();
  const navigate = useNavigate();
  const pending = useRouterState({ select: (s) => s.isLoading });
  const pages = Math.max(1, Math.ceil(directory.total / directory.pageSize));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void navigate({
      to: "/athletes",
      search: parseAthleteDirectorySearch(Object.fromEntries(fields)),
    });
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            The athlete directory
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Explore athlete profiles
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Discover the people behind the performances. Search public profiles and explore their
            sporting records.
          </p>
        </div>
        <Link
          to="/my-athlete-profile"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg no-underline"
        >
          <UserRound className="size-4" aria-hidden="true" />
          Build my profile
        </Link>
      </header>
      <form
        key={JSON.stringify(search)}
        onSubmit={submit}
        role="search"
        className="grid gap-3 rounded-2xl border border-border bg-elevated/40 p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto]"
      >
        <label className="space-y-1.5 text-xs font-medium text-muted">
          Name, athlete ID, club or place
          <input
            name="q"
            type="search"
            maxLength={120}
            defaultValue={search.q}
            placeholder="Search athletes…"
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-muted">
          Country
          <select
            name="country"
            defaultValue={search.country ?? ""}
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg"
          >
            <option value="">All countries</option>
            {[...new Set([...directory.countries, ...(search.country ? [search.country] : [])])]
              .sort()
              .map((country) => (
                <option key={country}>{country}</option>
              ))}
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-medium text-muted">
          Sport in results
          <select
            name="sport"
            defaultValue={search.sport ?? ""}
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg"
          >
            <option value="">All sports</option>
            {[...new Set([...directory.sports, ...(search.sport ? [search.sport] : [])])]
              .sort()
              .map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-lg bg-primary px-5 text-sm font-semibold text-primary-fg disabled:opacity-60"
        >
          <Search className="size-4" aria-hidden="true" />
          {pending ? "Searching…" : "Search"}
        </button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p role="status" className="text-muted">
          {directory.total.toLocaleString("en-GB")} public profile{directory.total === 1 ? "" : "s"}
          {directory.total > 0
            ? ` · Showing ${(directory.page - 1) * directory.pageSize + 1}–${Math.min(directory.page * directory.pageSize, directory.total)}`
            : ""}
        </p>
        {search.q || search.country || search.sport ? (
          <Link to="/athletes" search={{}} className="font-semibold text-accent">
            Clear filters
          </Link>
        ) : null}
      </div>
      {directory.athletes.length ? (
        <div aria-busy={pending} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {directory.athletes.map((athlete) => (
            <AthleteDirectoryCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-border p-7 text-center">
          <Search className="mx-auto size-7 text-accent" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl font-semibold">No public profiles found</h2>
          <p className="mt-2 text-sm text-muted">
            Try a different name or clear a filter. Private and unlisted profiles do not appear in
            this directory.
          </p>
          <Link
            to="/athlete-account"
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent"
          >
            Looking for your own results? <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      )}
      {pages > 1 ? (
        <nav
          aria-label="Athlete directory pages"
          className="flex items-center justify-between gap-3"
        >
          <PageLink search={search} page={directory.page - 1} disabled={directory.page <= 1}>
            Previous
          </PageLink>
          <p className="text-xs text-muted">
            Page {directory.page} of {pages}
          </p>
          <PageLink search={search} page={directory.page + 1} disabled={directory.page >= pages}>
            Next
          </PageLink>
        </nav>
      ) : null}
      <p className="border-t border-border pt-4 text-xs leading-5 text-muted">
        These are the public profiles currently in AthRecs, listed alphabetically. Your own profile
        starts private. Sport filters use the results available on each public profile.
      </p>
    </div>
  );
}

function PageLink({
  search,
  page,
  disabled,
  children,
}: {
  search: AthleteDirectorySearch;
  page: number;
  disabled: boolean;
  children: string;
}) {
  const Icon = children === "Previous" ? ArrowLeft : ArrowRight;
  const content = (
    <>
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </>
  );
  const className =
    "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium";
  return disabled ? (
    <span aria-disabled="true" className={`${className} text-subtle`}>
      {content}
    </span>
  ) : (
    <Link to="/athletes" search={{ ...search, page }} className={`${className} text-accent`}>
      {content}
    </Link>
  );
}
