import { useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, Globe2, Search, Trophy } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { countryCardStyle } from "@/lib/running/country-card-palette";
import type { RunningGuideDirectory, RunningGuideDistance } from "@/lib/running/guide-directory";

const linkClass =
  "inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const controlClass =
  "mt-2 min-h-12 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-base text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const distanceNames: Record<RunningGuideDistance, string> = {
  "half-marathon": "Half marathon",
  marathon: "Marathon",
  ultra: "Ultra",
};

function searchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function CountryName({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true">
        <CountryFlag country={name} />
      </span>
      <span>{name}</span>
    </span>
  );
}

export function RunningGuidesPage({ directory }: { directory: RunningGuideDirectory }) {
  const [query, setQuery] = useState("");
  const [countryId, setCountryId] = useState("");
  const [distance, setDistance] = useState("");
  const terms = searchText(query).trim().split(/\s+/).filter(Boolean);
  const hasFilters = terms.length > 0 || Boolean(countryId || distance);
  const filtered = directory.guides.filter((guide) => {
    if (countryId && guide.countryId !== countryId) return false;
    if (distance && guide.distance !== distance) return false;
    const text = searchText(
      `${guide.name} ${guide.location} ${guide.countryName} ${guide.countryId} ${distanceNames[guide.distance]}`,
    );
    return terms.every((term) => text.includes(term));
  });
  const countryCollectionCount = directory.countries.reduce(
    (count, country) => count + country.links.length,
    0,
  );
  const updated = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(directory.modifiedAt),
  );

  function clearFilters() {
    setQuery("");
    setCountryId("");
    setDistance("");
  }

  return (
    <article className="space-y-10 pb-10 md:space-y-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <a href="/" className="hover:text-accent">
          AthRecs
        </a>
        <span aria-hidden="true">/</span>
        <a href="/running" className="hover:text-accent">
          Running
        </a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Running guides</span>
      </nav>

      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-accent" />
        <div className="grid gap-7 p-5 md:p-8 lg:grid-cols-[1.65fr_1fr] lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              The AthRecs running library
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-fg md:text-5xl">
              Running guides by country and race series
            </h1>
            <p className="mt-5 max-w-3xl leading-7 text-muted">
              Find marathon, half-marathon and ultra guides in one place. Compare countries, explore
              race series and open individual guides for course information, published dates, entry
              routes and practical runner advice.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              For first-time runners, experienced amateurs, club athletes and professionals planning
              their next race or season.
            </p>
          </div>
          <aside
            aria-label="Guide directory coverage"
            className="self-center rounded-xl border border-border bg-elevated p-5"
          >
            <BookOpen className="size-6 text-accent" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-semibold">Choose where to start</h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-3 text-sm">
              <dt className="font-display text-3xl font-semibold text-accent">
                {countryCollectionCount}
              </dt>
              <dd>country guide collections</dd>
              <dt className="font-display text-3xl font-semibold text-accent">
                {directory.totalGuides}
              </dt>
              <dd>individual race guides</dd>
              <dt className="font-display text-3xl font-semibold text-accent">
                {directory.series.length}
              </dt>
              <dd>race series and collections</dd>
            </dl>
          </aside>
        </div>
        <nav
          aria-label="On this page"
          className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border bg-elevated px-5 py-3 md:px-8 lg:px-10"
        >
          {[
            ["#country-guides", "Country guides"],
            ["#race-series", "Race series"],
            ["#race-guides", "Find a race guide"],
            ["#all-countries", "More countries"],
          ].map(([href, label]) => (
            <a key={href} href={href} className={linkClass}>
              {label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </header>

      <section
        id="country-guides"
        aria-labelledby="country-guides-heading"
        className="scroll-mt-24 space-y-5"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            Start with a destination
          </p>
          <h2 id="country-guides-heading" className="mt-2 font-display text-3xl font-semibold">
            Race guides by country
          </h2>
          <p className="mt-3 leading-7 text-muted">
            Browse dedicated road-race guides for {directory.countries.length} countries. Each
            country collection links to individual races and groups them by local area to help you
            plan.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {directory.countries.map((country) => (
            <article
              key={country.id}
              className="rounded-xl border p-5"
              style={countryCardStyle(country.id)}
            >
              <h3 className="font-display text-xl font-semibold">
                <CountryName name={country.name} />
              </h3>
              <p className="mt-2 text-sm">{country.count} individual race guides</p>
              <ul className="mt-3 divide-y divide-current/10">
                {country.links.map((guide) => (
                  <li key={guide.path}>
                    <a
                      href={guide.path}
                      className="flex min-h-12 items-center justify-between gap-3 py-2 font-semibold underline decoration-current/35 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    >
                      <span>{guide.name}</span>
                      <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        id="race-series"
        aria-labelledby="race-series-heading"
        className="scroll-mt-24 space-y-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
              Plan a bigger challenge
            </p>
            <h2 id="race-series-heading" className="mt-2 font-display text-3xl font-semibold">
              Race series and collections
            </h2>
            <p className="mt-3 leading-7 text-muted">
              Explore the series guide or browse the races in each collection.
            </p>
          </div>
          <a href="/running/race-series" className={linkClass}>
            All race-series listings <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {directory.series.map((series) => (
            <a
              key={series.id}
              href={series.path}
              className="group flex flex-col rounded-xl border border-border bg-surface p-5 no-underline transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-6"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
                <Trophy className="size-4" aria-hidden="true" />
                {series.kind === "series" ? "Race series" : "Race collection"}
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold text-fg">{series.name}</h3>
              <p className="mb-4 mt-3 leading-7 text-muted">{series.description}</p>
              <span className="mt-auto inline-flex min-h-11 items-center gap-2 font-semibold text-accent group-hover:underline">
                Explore {series.name}
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        id="race-guides"
        aria-labelledby="race-guides-heading"
        className="scroll-mt-24 space-y-5"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            Go straight to your race
          </p>
          <h2 id="race-guides-heading" className="mt-2 font-display text-3xl font-semibold">
            Find an individual race guide
          </h2>
          <p className="mt-3 leading-7 text-muted">
            Open a country below, or search by race name, city or region. Filter by country and
            distance to narrow down the guides.
          </p>
        </div>
        <div
          role="search"
          aria-label="Find a running guide"
          className="rounded-xl border border-border bg-elevated p-4 sm:p-5"
        >
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
            <label className="text-sm font-semibold" htmlFor="guide-search">
              <span className="inline-flex items-center gap-2">
                <Search className="size-4" aria-hidden="true" />
                Search race guides
              </span>
              <input
                id="guide-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="For example: Cardiff or Boston"
                className={controlClass}
                aria-controls="running-guide-results"
              />
            </label>
            <label className="text-sm font-semibold" htmlFor="guide-country">
              Country
              <select
                id="guide-country"
                aria-label="Country"
                value={countryId}
                onChange={(event) => setCountryId(event.target.value)}
                className={controlClass}
                aria-controls="running-guide-results"
              >
                <option value="">All countries</option>
                {directory.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold" htmlFor="guide-distance">
              Distance
              <select
                id="guide-distance"
                aria-label="Distance"
                value={distance}
                onChange={(event) => setDistance(event.target.value)}
                className={controlClass}
                aria-controls="running-guide-results"
              >
                <option value="">All distances</option>
                {Object.entries(distanceNames).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted">
              {filtered.length} of {directory.totalGuides} race guides
            </p>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              className="min-h-11 px-2 text-sm font-semibold text-accent underline underline-offset-4 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Clear filters
            </button>
          </div>
        </div>
        <div id="running-guide-results" className="space-y-3">
          {directory.countries.map((country) => {
            const guides = filtered.filter((guide) => guide.countryId === country.id);
            if (!guides.length) return null;
            return (
              <details
                key={country.id}
                open={hasFilters || country.id === "uk"}
                className="group rounded-xl border border-border bg-surface"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 rounded-xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden sm:px-5">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold">
                      <CountryName name={country.name} />
                    </span>
                    <span className="text-sm text-muted">
                      {guides.length} {guides.length === 1 ? "guide" : "guides"}
                    </span>
                  </span>
                  <ChevronDown
                    className="size-5 shrink-0 text-accent transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="grid border-t border-border sm:grid-cols-2">
                  {guides.map((guide) => (
                    <li key={guide.id} className="border-b border-border last:border-b-0">
                      <a
                        href={guide.path}
                        className="flex h-full min-h-20 items-start justify-between gap-3 px-4 py-4 no-underline hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:px-5"
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-accent underline underline-offset-4">
                            {guide.name}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-muted">
                            {distanceNames[guide.distance]} · {guide.location}
                          </span>
                        </span>
                        <ArrowRight
                          className="mt-1 size-4 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface p-5 leading-7">
              No guide matches these filters. Try a shorter race name, choose another country or
              distance, or{" "}
              <button type="button" onClick={clearFilters} className={linkClass}>
                clear the filters
              </button>
              .
            </p>
          ) : null}
        </div>
        <p className="text-sm leading-6 text-muted">
          Looking for an event without a dedicated guide?{" "}
          <a href="/running/events" className={linkClass}>
            Search the wider running calendar
          </a>
          .
        </p>
      </section>

      <section
        id="all-countries"
        aria-labelledby="all-countries-heading"
        className="scroll-mt-24 space-y-5"
      >
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
            <Globe2 className="size-4" aria-hidden="true" />
            Explore further
          </p>
          <h2 id="all-countries-heading" className="mt-2 font-display text-3xl font-semibold">
            More countries and local running pages
          </h2>
          <p className="mt-3 leading-7 text-muted">
            The country hubs cover a wider range of destinations. Open a country for its sporting
            pages, or use the running location directory to browse continents, states, counties and
            provinces.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6">
          <a href="/races/places/running" className={linkClass}>
            Running races by location <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a href="/running/calendar" className={linkClass}>
            Running calendar <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <details className="group rounded-xl border border-border bg-surface">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 p-5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            Browse all {directory.portals.length} country and home-nation hubs
            <ChevronDown
              className="size-5 shrink-0 text-accent group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <ul className="grid gap-x-5 gap-y-1 border-t border-border p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
            {directory.portals.map((portal) => (
              <li key={portal.path}>
                <a href={portal.path} className={linkClass}>
                  <span aria-hidden="true">{portal.flag}</span>
                  {portal.name}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section aria-labelledby="guide-questions" className="space-y-5 border-t border-border pt-8">
        <h2 id="guide-questions" className="font-display text-3xl font-semibold">
          Questions about the running guides
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-semibold">
              Where can I find running race guides by country?
            </h3>
            <p className="mt-2 leading-7 text-muted">
              Choose a country in the{" "}
              <a href="#country-guides" className="text-accent underline underline-offset-4">
                country guide section
              </a>
              , then open its marathon, half-marathon or available ultra collection. Each collection
              links to detailed race pages and local areas.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">
              Where are the SuperHalfs and other race-series guides?
            </h3>
            <p className="mt-2 leading-7 text-muted">
              The{" "}
              <a href="#race-series" className="text-accent underline underline-offset-4">
                race-series section
              </a>{" "}
              links to SuperHalfs, European Marathon Classics, Marathon des Sables and other road,
              trail and desert guides, alongside the World Marathon Majors, UTMB World Series and
              UTMB Index race collections. Each guide explains its entry routes and any completion
              or ranking rules. UTMB Index is a race collection, separate from the UTMB World
              Series.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">
              Are the guides useful for amateur and professional runners?
            </h3>
            <p className="mt-2 leading-7 text-muted">
              Yes. Use the guides to compare courses, published dates and entry information.
              Beginners and club runners can plan practical race-day arrangements; competitive
              athletes can follow official links for current qualifying standards and elite-entry
              details where available.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">
              Can I find races by state, county or province?
            </h3>
            <p className="mt-2 leading-7 text-muted">
              Country guides group races by their local area. For a wider search, the{" "}
              <a href="/races/places/running" className="text-accent underline underline-offset-4">
                running location directory
              </a>{" "}
              lets you explore countries and their available regions.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">
              Where should I confirm a race date, start time or entry?
            </h3>
            <p className="mt-2 leading-7 text-muted">
              Open the individual guide and follow its official organiser links. Check the exact
              edition, distance and start wave before booking. A date or time marked TBC remains
              unconfirmed; the same race may change its arrangements between years.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">
              What if my race does not have a guide yet?
            </h3>
            <p className="mt-2 leading-7 text-muted">
              Use{" "}
              <a href="/running/events" className="text-accent underline underline-offset-4">
                running race search
              </a>{" "}
              or the{" "}
              <a href="/running/calendar" className="text-accent underline underline-offset-4">
                running calendar
              </a>{" "}
              to explore the wider event catalogue. This directory lists the dedicated guides
              currently available on AthRecs.
            </p>
          </div>
        </div>
      </section>
      <p className="border-t border-border pt-5 text-sm leading-6 text-muted">
        Directory updated <time dateTime={directory.modifiedAt}>{updated}</time>. Individual guides
        show their own source and edition information.
      </p>
    </article>
  );
}
