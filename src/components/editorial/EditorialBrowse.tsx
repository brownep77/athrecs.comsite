import { Link } from "@tanstack/react-router";
import { EDITORIAL_ARTICLES } from "@/data/athrecs-editorial";
import { COUNTRY_SITES } from "@/lib/athrecs/country-sites";
import {
  editorialLocationOptions,
  editorialPath,
  filterEditorialArticles,
  type EditorialKind,
  type EditorialSearch,
} from "@/lib/athrecs/editorial";
import { SPORT_PAGES, getSportPage } from "@/lib/athrecs/sport-pages";

const control =
  "mt-2 h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-base text-fg disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent";
const link = "inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold no-underline";

export function EditorialBrowse({
  kind,
  search,
  onChange,
}: {
  kind: EditorialKind;
  search: EditorialSearch;
  onChange: (search: EditorialSearch) => void;
}) {
  const title = kind === "race-reports" ? "Race Reports" : "News";
  const sport = getSportPage(search.sport);
  const articles = filterEditorialArticles(EDITORIAL_ARTICLES, kind, search);
  const locations = editorialLocationOptions(EDITORIAL_ARTICLES, search);
  const countries = [
    ...new Set([...COUNTRY_SITES.map((site) => site.country), ...locations.countries]),
  ].sort((a, b) => a.localeCompare(b));
  const filtered = Boolean(search.country || search.area || search.county);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {sport ? `${sport.label} · ` : ""}
          {title}
        </h1>
        <p className="text-base leading-7 text-muted">
          {kind === "race-reports"
            ? "Stories from the finish line, from local races to the world stage."
            : "Sporting news, event announcements and updates from your area and beyond."}
        </p>
      </header>
      <nav aria-label="Stories" className="flex flex-wrap gap-2 border-b border-border pb-4">
        <Link
          to="/race-reports"
          search={search}
          aria-current={kind === "race-reports" ? "page" : undefined}
          className={`${link} ${kind === "race-reports" ? "bg-primary text-primary-fg" : "bg-elevated text-fg"}`}
        >
          Race Reports
        </Link>
        <Link
          to="/news"
          search={search}
          aria-current={kind === "news" ? "page" : undefined}
          className={`${link} ${kind === "news" ? "bg-primary text-primary-fg" : "bg-elevated text-fg"}`}
        >
          News
        </Link>
      </nav>
      <section
        aria-label="Filter stories"
        className="rounded-xl border border-border bg-elevated/40 p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            label="Country"
            all="All countries"
            value={search.country}
            options={countries}
            onChange={(country) => onChange({ sport: search.sport, country })}
          />
          <LocationSelect
            label="Area / region"
            all={search.country ? "All areas" : "Choose a country first"}
            value={search.area}
            options={locations.areas}
            disabled={!search.country}
            onChange={(area) => onChange({ sport: search.sport, country: search.country, area })}
          />
          <LocationSelect
            label="County / local area"
            all={search.area ? "All counties / local areas" : "Choose an area first"}
            value={search.county}
            options={locations.counties}
            disabled={!search.country || !search.area}
            onChange={(county) => onChange({ ...search, county })}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4">
          <p className="text-sm leading-6 text-muted">
            Areas and counties appear as stories are added. States and provinces use the area
            filter.
          </p>
          {filtered || search.sport ? (
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
      <p role="status" className="text-sm text-muted">
        {articles.length}{" "}
        {kind === "race-reports"
          ? articles.length === 1
            ? "race report"
            : "race reports"
          : articles.length === 1
            ? "news story"
            : "news stories"}
        {filtered
          ? ` · ${[search.country, search.area, search.county].filter(Boolean).join(" · ")}`
          : " · All locations"}
      </p>
      {articles.length ? (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.slug}>
              <article className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                <time dateTime={article.date} className="text-sm font-semibold text-accent">
                  {article.displayDate}
                </time>
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
                        to={kind === "race-reports" ? "/race-reports" : "/news"}
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
            {filtered || search.sport
              ? `No ${title.toLowerCase()} match these filters yet`
              : `No ${title.toLowerCase()} published yet`}
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            {filtered || search.sport
              ? "Choose another location or clear the filters to browse more widely."
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
  options: string[];
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
