import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import {
  copyForLanguage,
  countrySiteFromSlug,
  displayCountryForLanguage,
  isSiteLanguage,
  translateCountryText,
} from "@/lib/athrecs/country-sites";
import { RaceCard } from "@/components/races/RaceCard";
import { Button } from "@/components/ui/button";

const SPORTS = new Set<Sport>([
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
  "Adventure Racing",
  "Functional Fitness",
  "Walking",
]);

type CountryRaceSearch = {
  sport?: Sport;
  distance?: string;
  surface?: string;
  page?: number;
};

const PAGE_SIZE = 40;

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const Route = createFileRoute("/$language/$country/races/")({
  validateSearch: (search: Record<string, unknown>): CountryRaceSearch => {
    const sport = optionalText(search.sport);
    return {
      sport: sport && SPORTS.has(sport as Sport) ? (sport as Sport) : undefined,
      distance: optionalText(search.distance),
      surface: optionalText(search.surface),
      page:
        typeof search.page === "number" && Number.isInteger(search.page) && search.page > 1
          ? search.page
          : typeof search.page === "string" && /^\d+$/.test(search.page) && Number(search.page) > 1
            ? Number(search.page)
            : undefined,
    };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const site = countrySiteFromSlug(params.country);
    if (!site || !isSiteLanguage(params.language)) throw notFound();
    const races = await listEvents({
      data: {
        country: site.country,
        sport: deps.sport,
        distance: deps.distance,
        surface: deps.surface,
        upcomingOnly: true,
        limit: PAGE_SIZE + 1,
        offset: ((deps.page ?? 1) - 1) * PAGE_SIZE,
      },
    });
    return { site, language: params.language, races };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { site, language } = loaderData;
    const copy = copyForLanguage(language);
    const country = displayCountryForLanguage(site, language);
    return {
      meta: [
        { title: `${translateCountryText(copy.racesIn, country)} | ATHRECS` },
        {
          name: "description",
          content: translateCountryText(copy.racesIntro, country),
        },
      ],
    };
  },
  component: CountryRacesPage,
});

const distanceFilters = [
  { label: "5K", value: "5K" },
  { label: "10K", value: "10K" },
  { label: "Half", value: "Half" },
  { label: "Marathon", value: "Marathon" },
] as const;

function CountryRacesPage() {
  const { site, language, races } = Route.useLoaderData();
  const search = Route.useSearch();
  const copy = copyForLanguage(language);
  const country = displayCountryForLanguage(site, language);
  const page = search.page ?? 1;
  const visibleRaces = races.slice(0, PAGE_SIZE);
  const hasNextPage = races.length > PAGE_SIZE;
  const firstEventNumber = visibleRaces.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastEventNumber = (page - 1) * PAGE_SIZE + visibleRaces.length;

  return (
    <div className="space-y-6 pb-10">
      <Link
        to="/$language/$country"
        params={{ language, country: site.slug }}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        {translateCountryText(copy.backToCountry, country)}
      </Link>

      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {site.flag} {country}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
          {translateCountryText(copy.racesIn, country)}
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          {translateCountryText(copy.racesIntro, country)}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-3 shadow-card">
        <FilterLink
          label={copy.allRaces}
          active={!search.sport && !search.distance}
          language={language}
          country={site.slug}
          search={{}}
        />
        <FilterLink
          label={copy.exploreRunning}
          active={search.sport === "Running" && !search.distance}
          language={language}
          country={site.slug}
          search={{ sport: "Running" }}
        />
        <FilterLink
          label="parkrun"
          active={search.sport === "Parkrun"}
          language={language}
          country={site.slug}
          search={{ sport: "Parkrun" }}
        />
        {distanceFilters.map((filter) => (
          <FilterLink
            key={filter.value}
            label={filter.value === "Half" ? copy.halfMarathon : filter.label}
            active={search.distance === filter.value}
            language={language}
            country={site.slug}
            search={{ sport: "Running", distance: filter.value }}
          />
        ))}
        <FilterLink
          label={copy.triathlon}
          active={search.sport === "Triathlon"}
          language={language}
          country={site.slug}
          search={{ sport: "Triathlon" }}
        />
        <FilterLink
          label={copy.cycling}
          active={search.sport === "Cycling"}
          language={language}
          country={site.slug}
          search={{ sport: "Cycling" }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-subtle">
          {visibleRaces.length ? `${firstEventNumber}–${lastEventNumber}` : "0"}{" "}
          {copy.events.toLowerCase()}
        </p>
        {page > 1 || hasNextPage ? <p className="text-xs font-medium text-muted">{page}</p> : null}
      </div>
      <div className="grid gap-2">
        {visibleRaces.length ? (
          visibleRaces.map((race) => (
            <RaceCard key={race.id} race={race} localized={{ language, country: site.slug }} />
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
            {copy.noRaces}
          </p>
        )}
      </div>

      {page > 1 || hasNextPage ? (
        <nav
          aria-label="Event pages"
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-card"
        >
          {page > 1 ? (
            <Button asChild variant="secondary">
              <Link
                to="/$language/$country/races"
                params={{ language, country: site.slug }}
                search={{ ...search, page: page > 2 ? page - 1 : undefined }}
                aria-label="Previous page"
              >
                ←
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" disabled aria-label="Previous page">
              ←
            </Button>
          )}
          <span className="text-sm text-subtle">{page}</span>
          {hasNextPage ? (
            <Button asChild>
              <Link
                to="/$language/$country/races"
                params={{ language, country: site.slug }}
                search={{ ...search, page: page + 1 }}
                aria-label="Next page"
              >
                →
              </Link>
            </Button>
          ) : (
            <Button disabled aria-label="Next page">
              →
            </Button>
          )}
        </nav>
      ) : null}
    </div>
  );
}

function FilterLink({
  label,
  active,
  language,
  country,
  search,
}: {
  label: string;
  active: boolean;
  language: string;
  country: string;
  search: CountryRaceSearch;
}) {
  return (
    <Button asChild size="sm" variant={active ? "default" : "secondary"}>
      <Link to="/$language/$country/races" params={{ language, country }} search={search}>
        {label}
      </Link>
    </Button>
  );
}
