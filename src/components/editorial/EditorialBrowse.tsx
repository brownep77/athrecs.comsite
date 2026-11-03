import { Link } from "@tanstack/react-router";
import type { EditorialArticle } from "@/lib/athrecs/editorial";
import { COUNTRY_SITES } from "@/lib/athrecs/country-sites";
import {
  EDITORIAL_CONTINENTS,
  EDITORIAL_LEVELS,
  EDITORIAL_PRIORITY_COUNTRIES,
  editorialCountryContinent,
  editorialLevels,
  editorialLocationOptions,
  editorialPath,
  filterEditorialArticles,
  type EditorialKind,
  type EditorialLevel,
  type EditorialSearch,
} from "@/lib/athrecs/editorial";
import { SPORT_PAGES, getSportPage } from "@/lib/athrecs/sport-pages";

const control =
  "mt-2 h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-base text-fg disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent";
const link =
  "inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold no-underline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const LEVEL_DESCRIPTIONS: Record<EditorialLevel, string> = {
  world: "Major international competitions and stories from the world stage.",
  continent: "Sporting achievements and results from across each continent.",
  national: "Championships, athletes and sporting stories by country.",
  local: "Achievements from counties, states, provinces, cities and clubs.",
};

function levelSearch(search: EditorialSearch, level?: EditorialLevel): EditorialSearch {
  // Keep the sport when moving between desks; each desk starts with all locations.
  return { sport: search.sport, level };
}

export function EditorialBrowse({
  kind,
  catalogue,
  search,
  onChange,
}: {
  catalogue: (EditorialArticle & { minutes: number })[];
  kind: EditorialKind;
  search: EditorialSearch;
  onChange: (search: EditorialSearch) => void;
}) {
  const title = kind === "race-reports" ? "Race Reports" : "News";
  const route = kind === "race-reports" ? "/race-reports" : "/news";
  const sport = getSportPage(search.sport);
  const activeLevel = EDITORIAL_LEVELS.find((item) => item.value === search.level);
  const articles = filterEditorialArticles(catalogue, kind, search);
  const locations = editorialLocationOptions(catalogue, kind, search);
  const countries = [
    ...new Set([
      ...EDITORIAL_PRIORITY_COUNTRIES,
      ...COUNTRY_SITES.map((site) => site.country),
      ...locations.countries,
    ]),
  ]
    .filter(
      (country) => !search.continent || editorialCountryContinent(country) === search.continent,
    )
    .sort((a, b) => a.localeCompare(b));
  const filtered = Boolean(
    search.level ||
    search.continent ||
    search.country ||
    search.area ||
    search.county ||
    search.sport,
  );
  const placeLabel = [search.continent, search.country, search.area, search.county]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-3">
        {sport ? (
          <Link
            to="/sports/$sport"
            params={{ sport: sport.slug }}
            search={{}}
            className="text-sm font-semibold text-accent"
          >
            {sport.label}
          </Link>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          AthRecs · Stories behind the results
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {activeLevel ? `${activeLevel.label} ` : ""}
          {sport ? `${sport.label} ` : ""}
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted">
          {activeLevel
            ? LEVEL_DESCRIPTIONS[activeLevel.value]
            : "Discover the athletes and achievements behind the results, from your local club to the world stage."}
        </p>
      </header>
      <nav aria-label="Stories" className="flex flex-wrap gap-2 border-b border-border pb-4">
        <Link
          to="/news"
          search={search}
          aria-current={kind === "news" ? "page" : undefined}
          className={`${link} ${kind === "news" ? "bg-primary text-primary-fg" : "bg-elevated text-fg"}`}
        >
          News
        </Link>
        <Link
          to="/race-reports"
          search={search}
          aria-current={kind === "race-reports" ? "page" : undefined}
          className={`${link} ${kind === "race-reports" ? "bg-primary text-primary-fg" : "bg-elevated text-fg"}`}
        >
          Race Reports
        </Link>
      </nav>
      <nav aria-label="News coverage" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Link
          to={route}
          search={levelSearch(search)}
          aria-current={!search.level ? "page" : undefined}
          className={`${link} justify-center border ${!search.level ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg hover:border-accent"}`}
        >
          All stories
        </Link>
        {EDITORIAL_LEVELS.map((level) => (
          <Link
            key={level.value}
            to={route}
            search={levelSearch(search, level.value)}
            aria-current={search.level === level.value ? "page" : undefined}
            className={`${link} justify-center border ${search.level === level.value ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg hover:border-accent"}`}
          >
            {level.label}
          </Link>
        ))}
      </nav>
      <section aria-labelledby="country-stories-heading" className="space-y-2">
        <h2 id="country-stories-heading" className="text-sm font-semibold text-muted">
          Explore by country
        </h2>
        <div className="flex flex-wrap gap-2">
          {EDITORIAL_PRIORITY_COUNTRIES.map((country) => (
            <Link
              key={country}
              to={route}
              search={{
                sport: search.sport,
                level: search.level === "local" ? "local" : "national",
                country,
              }}
              aria-current={search.country === country ? "page" : undefined}
              className={`${link} border ${search.country === country ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-fg hover:border-accent"}`}
            >
              {country}
            </Link>
          ))}
        </div>
      </section>
      <section
        aria-label="Filter stories"
        className="rounded-xl border border-border bg-elevated/40 p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="min-w-0 text-sm font-semibold">
            Sport
            <select
              className={control}
              value={search.sport ?? ""}
              onChange={(event) => onChange({ ...search, sport: event.target.value || undefined })}
            >
              <option value="">All sports</option>
              {search.sport && !sport ? <option value={search.sport}>{search.sport}</option> : null}
              {SPORT_PAGES.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <LocationSelect
            label="Continent"
            all="All continents"
            value={search.continent}
            options={EDITORIAL_CONTINENTS}
            onChange={(continent) =>
              onChange({ sport: search.sport, level: search.level, continent })
            }
          />
          <LocationSelect
            label="Country"
            all="All countries"
            value={search.country}
            options={countries}
            onChange={(country) =>
              onChange({
                sport: search.sport,
                level: search.level,
                continent: search.continent,
                country,
              })
            }
          />
          <LocationSelect
            label="Region / state / province"
            all={search.country ? "All regions" : "Choose a country first"}
            value={search.area}
            options={locations.areas}
            disabled={!search.country}
            onChange={(area) => onChange({ ...search, area, county: undefined })}
          />
          <LocationSelect
            label="County / city / local area"
            all={search.area ? "All local areas" : "Choose a region first"}
            value={search.county}
            options={locations.counties}
            disabled={!search.country || !search.area}
            onChange={(county) => onChange({ ...search, county })}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4">
          <p className="text-sm leading-6 text-muted">
            Regional and local choices appear as stories are published. UK coverage includes
            England, Scotland, Wales and Northern Ireland.
          </p>
          {filtered ? (
            <button
              type="button"
              className="min-h-11 text-sm font-semibold text-accent underline"
              onClick={() => onChange({})}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>
      <p role="status" aria-live="polite" className="text-sm text-muted">
        {articles.length}{" "}
        {kind === "race-reports"
          ? articles.length === 1
            ? "race report"
            : "race reports"
          : articles.length === 1
            ? "news story"
            : "news stories"}
        {search.level ? ` · ${activeLevel?.label ?? search.level}` : ""}
        {placeLabel ? ` · ${placeLabel}` : " · All locations"}
        {sport ? ` · ${sport.label}` : ""}
      </p>
      {articles.length ? (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.slug}>
              <article className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <time dateTime={article.date} className="font-semibold text-accent">
                    {article.displayDate}
                  </time>
                  <span className="text-muted">{article.minutes} min read</span>
                  {editorialLevels(article).map((level) => (
                    <span
                      key={level}
                      className="rounded-md bg-elevated px-2 py-1 text-xs text-muted"
                    >
                      {EDITORIAL_LEVELS.find((item) => item.value === level)?.label}
                    </span>
                  ))}
                </div>
                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">
                  <a
                    href={editorialPath(article)}
                    className="text-fg no-underline hover:text-accent"
                  >
                    {article.title}
                  </a>
                </h2>
                <p className="mt-3 text-base leading-7 text-muted">{article.standfirst}</p>
                <ul aria-label="Story locations" className="mt-3 flex flex-wrap gap-2">
                  {article.locations.map((location) => (
                    <li key={`${location.country}-${location.area}-${location.county}`}>
                      <Link
                        to={route}
                        search={{ sport: search.sport, ...location }}
                        className="inline-flex min-h-11 items-center rounded-lg bg-elevated px-3 text-sm text-accent no-underline hover:underline"
                      >
                        {[location.county, location.area, location.country]
                          .filter(Boolean)
                          .join(", ")}
                      </Link>
                    </li>
                  ))}
                </ul>
                <a
                  href={editorialPath(article)}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent"
                >
                  {kind === "race-reports" ? "Read race report" : "Read news story"}
                </a>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">
            {filtered
              ? `No ${kind === "news" ? "news stories" : "race reports"} match these filters yet`
              : `No ${kind === "news" ? "news stories" : "race reports"} published yet`}
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            {filtered
              ? "Try another sport or place, or clear the filters to explore the wider coverage."
              : "New stories will appear here when they are published."}
          </p>
        </div>
      )}
    </div>
  );
}

function LocationSelect({
  label,
  all,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  all: string;
  value?: string;
  options: readonly string[];
  disabled?: boolean;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <label className="min-w-0 text-sm font-semibold">
      {label}
      <select
        className={control}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <option value="">{all}</option>
        {value && !options.includes(value) ? <option value={value}>{value}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
