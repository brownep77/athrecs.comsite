import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, Building2, Search } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { OrganisationSports } from "@/components/directory/OrganisationSports";
import { SportCollections } from "@/components/directory/SportCollections";
import { Button } from "@/components/ui/button";
import { ORGANISATION_TYPES, SPORTS_ORGANISATIONS } from "@/data/sports-organisations";
import {
  DIRECTORY_COUNTRIES,
  DIRECTORY_NATIONAL_COUNTRIES,
  DIRECTORY_QUESTIONS,
  filterSportsOrganisations,
  parseDirectorySearch,
  type DirectorySearch,
} from "@/lib/athrecs/sports-directory";
import { SPORT_PAGES } from "@/lib/athrecs/sport-pages";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

const title = "Sports directory | National federations & governing bodies | AthRecs";
const description =
  "Find national sports federations, home-nation governing bodies, funding agencies and Olympic organisations. Explore who runs running, cycling, swimming, triathlon and duathlon on AthRecs.";

export const Route = createFileRoute("/directory/")({
  ssr: true,
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  validateSearch: parseDirectorySearch,
  head: ({ match }) => {
    const filtered = Object.values(match.search).some(Boolean);
    return {
      meta: siteGraphMeta({ title, description, url: `${SITE_URL}/directory` }).map((meta) =>
        "name" in meta && meta.name === "robots" && filtered
          ? { name: "robots", content: "noindex, follow" }
          : meta,
      ),
      links: [{ rel: "canonical", href: `${SITE_URL}/directory` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: `${SITE_URL}/directory`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: filterSportsOrganisations(match.search).map((body, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: body.name,
                url: `${SITE_URL}/directory/${body.slug}`,
              })),
            },
          }),
        },
      ],
    };
  },
  component: DirectoryPage,
});

const field =
  "h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-base text-fg outline-none focus:ring-2 focus:ring-accent/40";

function DirectoryPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [draftQuery, setDraftQuery] = useState<string | null>(null);
  const bodies = filterSportsOrganisations(search);
  const update = (patch: Partial<DirectorySearch>) => {
    void navigate({ search: (previous) => ({ ...previous, ...patch }), resetScroll: false });
  };
  const filtered = Object.values(search).some(Boolean);
  return (
    <div className="space-y-7 pb-5">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          The organisations behind your sport
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Sports directory
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted">
          Find the national federations, governing bodies and organisations that support your sport.
          Understand who does what, where they operate and how to reach their official website.
        </p>
        <nav aria-label="Directory sections" className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/directory"
            search={{}}
            aria-current="page"
            className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-fg no-underline"
          >
            Federations & governing bodies
          </Link>
          <Link
            to="/clubs"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold no-underline hover:bg-elevated"
          >
            <Building2 className="size-4" aria-hidden="true" /> Find a club
          </Link>
        </nav>
      </header>

      <section
        aria-labelledby="roles-heading"
        className="rounded-xl border border-accent/20 bg-accent-soft/40 p-5"
      >
        <h2 id="roles-heading" className="font-display text-xl font-semibold">
          Who does what?
        </h2>
        <div className="mt-4 grid gap-4 text-sm leading-6 sm:grid-cols-3">
          <p>
            <strong className="block text-fg">Funding & development</strong>
            <Link to="/directory/$slug" params={{ slug: "sport-england" }}>
              Sport England
            </Link>{" "}
            supports participation in England.{" "}
            <Link to="/directory/$slug" params={{ slug: "uk-sport" }}>
              UK Sport
            </Link>{" "}
            invests in elite Olympic and Paralympic programmes.
          </p>
          <p>
            <strong className="block text-fg">Governing bodies</strong>Federations such as{" "}
            <Link to="/directory/$slug" params={{ slug: "british-triathlon" }}>
              British Triathlon
            </Link>{" "}
            govern their sport, working with international and home-nation bodies.
          </p>
          <p>
            <strong className="block text-fg">Olympic & Paralympic teams</strong>The{" "}
            <Link to="/directory/$slug" params={{ slug: "british-olympic-association" }}>
              British Olympic Association
            </Link>{" "}
            manages Team GB. The{" "}
            <Link to="/directory/$slug" params={{ slug: "british-paralympic-association" }}>
              British Paralympic Association
            </Link>{" "}
            manages ParalympicsGB.
          </p>
        </div>
      </section>

      <SportCollections sports={search.sport ? [search.sport] : undefined} />

      <section aria-label="Find a sports organisation" className="space-y-4">
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            update({ q: (draftQuery ?? search.q ?? "").trim() || undefined });
            setDraftQuery(null);
          }}
        >
          <label className="block min-w-0 flex-1 space-y-1.5 text-sm font-medium">
            Search organisations
            <input
              aria-label="Search organisations"
              name="q"
              type="search"
              maxLength={120}
              value={draftQuery ?? search.q ?? ""}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Name, sport or role — e.g. Team GB"
              className={field}
            />
          </label>
          <Button type="submit" className="h-11">
            <Search className="size-4" aria-hidden="true" />
            <span>Search</span>
          </Button>
        </form>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1.5 text-sm font-medium">
            Country or territory
            <select
              aria-label="Country or territory"
              className={field}
              value={search.country ?? ""}
              onChange={(event) => update({ country: event.target.value || undefined })}
            >
              <option value="">All countries, territories & international</option>
              {DIRECTORY_COUNTRIES.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Sport
            <select
              aria-label="Sport"
              className={field}
              value={search.sport ?? ""}
              onChange={(event) =>
                update({ sport: (event.target.value as DirectorySearch["sport"]) || undefined })
              }
            >
              <option value="">All AthRecs sports</option>
              {SPORT_PAGES.map((sport) => (
                <option key={sport.slug} value={sport.slug}>
                  {sport.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Organisation type
            <select
              aria-label="Organisation type"
              className={field}
              value={search.type ?? ""}
              onChange={(event) =>
                update({ type: (event.target.value as DirectorySearch["type"]) || undefined })
              }
            >
              <option value="">All organisation types</option>
              {Object.entries(ORGANISATION_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" role="status">
            {bodies.length} of {SPORTS_ORGANISATIONS.length} organisations
          </p>
          {filtered ? (
            <Button
              variant="secondary"
              onClick={() => {
                setDraftQuery(null);
                void navigate({ search: {}, resetScroll: false });
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
        {search.country && search.country !== "International" ? (
          <p className="text-sm text-muted">
            Includes bodies whose remit covers this territory.{" "}
            <Link to="/directory" search={{ sport: search.sport, country: "International" }}>
              View international organisations →
            </Link>
          </p>
        ) : null}
      </section>

      <section aria-label="Sports organisations" className="grid gap-4 md:grid-cols-2">
        {bodies.map((body) => (
          <article
            key={body.slug}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <CountryFlag country={body.country} showName />
              <span className="rounded-md bg-elevated px-2 py-1">
                {ORGANISATION_TYPES[body.type]}
              </span>
            </div>
            <h2 className="font-display text-xl font-semibold">
              <Link
                to="/directory/$slug"
                params={{ slug: body.slug }}
                className="text-fg no-underline hover:text-accent hover:underline"
              >
                {body.name}
              </Link>
            </h2>
            <p className="text-xs font-medium text-muted">Remit: {body.jurisdiction}</p>
            <p className="text-sm leading-6 text-muted">{body.summary}</p>
            <OrganisationSports body={body} />
            <div className="mt-auto flex flex-wrap gap-x-5 pt-1 text-sm font-semibold">
              <Link
                to="/directory/$slug"
                params={{ slug: body.slug }}
                className="inline-flex min-h-11 items-center"
              >
                Role & related bodies →
              </Link>
              <a
                href={body.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1"
              >
                {body.websiteKind === "member-directory"
                  ? "Official member directory"
                  : "Official website"}{" "}
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </article>
        ))}
      </section>
      {!bodies.length ? (
        <div className="rounded-xl border border-border p-6">
          <h2 className="font-semibold">No organisations match these filters</h2>
          <p className="mt-2 text-sm text-muted">
            Try another name, clear a filter or browse the international bodies. Coverage is still
            growing.
          </p>
        </div>
      ) : null}
      <section aria-labelledby="directory-help" className="space-y-3 border-t border-border pt-6">
        <h2 id="directory-help" className="font-display text-2xl font-semibold">
          Understanding sports organisations
        </h2>
        {DIRECTORY_QUESTIONS.map((item) => (
          <details key={item.question} className="rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-semibold">{item.question}</summary>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">{item.answer}</p>
          </details>
        ))}
        <p className="text-xs leading-5 text-muted">
          National federations in {DIRECTORY_NATIONAL_COUNTRIES.length} countries and territories,
          alongside home-nation, regional, specialist and international organisations. Coverage is
          growing and is not exhaustive. Official references and review dates appear on each
          organisation’s page.
        </p>
      </section>
    </div>
  );
}
