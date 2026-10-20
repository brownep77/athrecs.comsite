import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { formatRaceDateShort as formatDate } from "@/lib/athrecs/format";
import { fixtureSummary } from "@/lib/athrecs/fixture-presentation";
import type { RacePlacePageData } from "@/lib/athrecs/race-places";
import { placeEntryUrl } from "@/lib/athrecs/race-place-facets";
import { racePlaceUrl } from "@/lib/athrecs/race-places-seo";
import { racePlaceCopy, type RaceCopyParagraph } from "@/lib/athrecs/race-places-copy";

const link = "text-accent underline underline-offset-4 hover:text-fg";
const monthLabel = (value: string) =>
  new Date(`${value}-01T12:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
const copyParagraph = (parts: RaceCopyParagraph) =>
  parts.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : (
      <a key={`${part.href}-${index}`} href={part.href} className={link}>
        {part.text}
      </a>
    ),
  );

export function RacePlacesPage({ data }: { data: RacePlacePageData }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) void router.invalidate();
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  const { place } = data;
  const copy = racePlaceCopy(data);
  const renderRaces = (races: RacePlacePageData["races"]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {races.map((race) => (
        <article key={race.id} className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>{race.sport}</span>
            {race.featured ? (
              <span className="rounded-full bg-elevated px-3 py-1 font-semibold text-fg">
                Featured race
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 font-display text-xl font-semibold">
            <a href={`/races/${encodeURIComponent(race.slug)}`} className="hover:text-accent">
              {race.name}
            </a>
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <CountryFlag country={race.country} showCode />
            {[race.city, race.region || race.county]
              .filter(Boolean)
              .filter((value, index, values) => values.indexOf(value) === index)
              .join(", ")}
          </p>
          <p className="mt-3 text-sm leading-6">
            {fixtureSummary(race.summary, race.sport, race.city)}
          </p>
          {race.next ? (
            <p className="mt-3 text-sm font-semibold">
              <time dateTime={race.next.date}>{formatDate(race.next.date)}</time>
              {race.next.endDate && race.next.endDate !== race.next.date ? (
                <>
                  {" "}
                  – <time dateTime={race.next.endDate}>{formatDate(race.next.endDate)}</time>
                </>
              ) : null}
              {race.listedDistances.filter((distance) => distance !== "Other").length
                ? ` · ${race.listedDistances
                    .filter((distance) => distance !== "Other")
                    .map((distance) => (distance === "Half" ? "Half marathon" : distance))
                    .join(" / ")}`
                : ""}
              {race.next.status === "Closed" ? " · Entry closed" : ""}
              {race.next.status === "TBC" ? " · Status TBC" : ""}
            </p>
          ) : (
            <p className="mt-3 text-sm font-semibold">
              {race.cancelledDate
                ? `Cancelled edition: ${formatDate(race.cancelledDate)}`
                : "Next date not listed"}
            </p>
          )}
          <a
            href={`/races/${encodeURIComponent(race.slug)}`}
            className={`${link} mt-4 inline-flex min-h-11 items-center text-sm`}
          >
            {race.next
              ? "Race details, entry and past editions"
              : "Race guide and recorded editions"}{" "}
            →
          </a>
          {race.next?.status === "Open" && placeEntryUrl(race.next.entryUrl) ? (
            <a
              href={placeEntryUrl(race.next.entryUrl)!}
              className={`${link} ml-4 inline-flex min-h-11 items-center text-sm`}
            >
              Entry information ↗
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
  return (
    <article className="space-y-8 pb-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-muted">
        <a href="/" className={link}>
          AthRecs
        </a>
        {data.breadcrumbs.map((ancestor) => (
          <span key={ancestor.path}>
            <span aria-hidden="true"> / </span>
            {ancestor.path === data.path ? (
              <span aria-current="page">{ancestor.name}</span>
            ) : (
              <a href={ancestor.path} className={link}>
                {ancestor.name}
              </a>
            )}
          </span>
        ))}
      </nav>
      <header className="border-b border-border pb-6">
        {place.country ? (
          <CountryFlag country={place.country} showName showCode />
        ) : (
          <p className="text-sm font-semibold text-accent">Explore by location</p>
        )}
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {copy.heading}
        </h1>
        <div className="mt-4 max-w-3xl space-y-3 leading-7 text-muted">
          {copy.intro.map((paragraph, index) => (
            <p key={index}>{copyParagraph(paragraph)}</p>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          {data.total.toLocaleString("en-GB")} listed events ·{" "}
          {data.upcomingCount.toLocaleString("en-GB")} with upcoming dates
          {data.featuredCount
            ? ` · ${data.featuredCount.toLocaleString("en-GB")} upcoming featured races`
            : ""}
        </p>
      </header>
      <nav aria-label="Sports and running distances" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={place.path}
            aria-current={!data.facet.sport ? "page" : undefined}
            className="rounded-lg border border-border px-4 py-3 text-sm aria-[current=page]:bg-elevated"
          >
            All sports
          </a>
          {data.sportLinks.map((item) => (
            <a
              key={item.slug}
              href={item.path}
              aria-current={
                data.facet.sport?.slug === item.slug && !data.facet.distance ? "page" : undefined
              }
              className="rounded-lg border border-border px-4 py-3 text-sm hover:border-accent aria-[current=page]:bg-elevated"
            >
              {item.label}
            </a>
          ))}
        </div>
        {(!data.facet.sport || data.facet.sport.slug === "running") && data.distanceLinks.length ? (
          <div>
            <p className="mb-2 text-sm font-semibold">Browse running distances</p>
            <div className="flex flex-wrap gap-2">
              {data.distanceLinks.map((item) => (
                <a
                  key={item.slug}
                  href={item.path}
                  aria-current={data.facet.distance?.slug === item.slug ? "page" : undefined}
                  className="rounded-lg border border-border px-4 py-3 text-sm hover:border-accent aria-[current=page]:bg-elevated"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
      {data.children.length ? (
        <section aria-labelledby="places-heading">
          <details open={place.kind === "world" || place.kind === "continent" ? true : undefined}>
            <summary className="cursor-pointer py-2">
              <h2 id="places-heading" className="font-display text-2xl font-semibold">
                Browse{" "}
                {place.kind === "world"
                  ? "continents"
                  : place.kind === "continent"
                    ? "countries and territories"
                    : place.kind === "nation"
                      ? "counties and areas"
                      : "states, counties and areas"}
              </h2>
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.children.map((child) => (
                <a
                  key={child.key}
                  href={child.path}
                  className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 hover:border-accent"
                >
                  <span className="flex items-center gap-2 font-medium">
                    {child.country ? <CountryFlag country={child.country} /> : null}
                    {child.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {child.count ? `${child.count} recorded events` : "Listings coming soon"}
                  </span>
                </a>
              ))}
            </div>
          </details>
        </section>
      ) : null}
      <section aria-labelledby="races-heading" className="space-y-4">
        <nav
          aria-label="Race dates"
          className="flex flex-wrap gap-4 border-b border-border pb-3 text-sm"
        >
          <a
            href={racePlaceUrl(data, 1, false)}
            aria-current={!data.archive ? "page" : undefined}
            className={link}
          >
            Upcoming ({data.upcomingCount})
          </a>
          <a
            href={racePlaceUrl(data, 1, true)}
            aria-current={data.archive ? "page" : undefined}
            className={link}
          >
            Awaiting dates and past editions ({data.archiveCount})
          </a>
        </nav>
        <h2 id="races-heading" className="font-display text-2xl font-semibold">
          {data.archive
            ? "Awaiting dates and past editions"
            : `Upcoming ${data.facet.distance?.heading.toLowerCase() ?? data.facet.sport?.heading.toLowerCase() ?? "races"}`}
        </h2>
        <form
          method="get"
          action={data.path}
          key={`${data.path}:${data.filters.month}:${data.filters.city}:${data.archive}`}
          className="flex flex-wrap items-end gap-4 rounded-xl bg-elevated p-4"
          aria-label="Filter race calendar"
        >
          {data.archive ? <input type="hidden" name="view" value="archive" /> : null}
          {!data.archive ? (
            <label className="min-w-40 flex-1 text-sm font-semibold">
              Month
              <select
                name="month"
                defaultValue={data.filters.month ?? ""}
                className="mt-2 block min-h-11 w-full rounded-lg border border-border bg-surface p-2 font-normal"
              >
                <option value="">All upcoming dates</option>
                {data.filters.month &&
                !data.months.some((item) => item.value === data.filters.month) ? (
                  <option value={data.filters.month}>{monthLabel(data.filters.month)}</option>
                ) : null}
                {data.months.map((item) => (
                  <option key={item.value} value={item.value}>
                    {monthLabel(item.value)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="min-w-40 flex-1 text-sm font-semibold">
            Town or city
            {data.cities.length <= 100 ? (
              <select
                name="city"
                defaultValue={data.filters.city ?? ""}
                className="mt-2 block min-h-11 w-full rounded-lg border border-border bg-surface p-2 font-normal"
              >
                <option value="">All towns and cities</option>
                {data.filters.city &&
                !data.cities.some((item) => item.value === data.filters.city) ? (
                  <option value={data.filters.city}>{data.filters.city}</option>
                ) : null}
                {data.cities.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="city"
                defaultValue={data.filters.city ?? ""}
                placeholder="Enter a town or city"
                className="mt-2 block min-h-11 w-full rounded-lg border border-border bg-surface p-2 font-normal"
              />
            )}
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg border border-accent bg-surface px-5 py-2 font-semibold"
          >
            Find races
          </button>
          {data.filters.month || data.filters.city ? (
            <a
              className={`${link} inline-flex min-h-11 items-center`}
              href={`${data.path}${data.archive ? "?view=archive" : ""}`}
            >
              Clear filters
            </a>
          ) : null}
        </form>
        {!data.archive && data.races.length ? (
          <p className="text-sm text-muted">
            {data.upcomingCount} matching {data.upcomingCount === 1 ? "event" : "events"}, earliest
            date first. Entry availability is shown separately.
          </p>
        ) : null}
        {data.races.length ? (
          renderRaces(data.races)
        ) : (
          <p className="rounded-xl border border-dashed border-border p-6 text-muted">
            {data.total
              ? "No races match this view. Try another month or town, clear the filters, or browse the recorded editions."
              : "We do not yet have race listings for this location. Explore the surrounding area using the links above."}
          </p>
        )}
        {data.archivePreview.length ? renderRaces(data.archivePreview) : null}
        {data.pageCount > 1 ? (
          <nav aria-label="Race pages" className="flex items-center justify-between gap-4 py-4">
            {data.page > 1 ? (
              <a href={racePlaceUrl(data, data.page - 1)} className={link}>
                ← Previous
              </a>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted">
              Page {data.page} of {data.pageCount}
            </span>
            {data.page < data.pageCount ? (
              <a href={racePlaceUrl(data, data.page + 1)} className={link}>
                Next →
              </a>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
      {data.featuredRaces.length ? (
        <section aria-labelledby="featured-races-heading" className="space-y-4">
          <h2 id="featured-races-heading" className="font-display text-2xl font-semibold">
            Featured races {place.kind === "world" ? "worldwide" : `in ${place.name}`}
          </h2>
          <p className="text-sm text-muted">
            AthRecs editorial selections and events recorded in major or final series. These are
            also included by date in the calendar above.
          </p>
          {renderRaces(data.featuredRaces)}
        </section>
      ) : null}
      {data.page === 1 && !data.archive && (data.guidance.length || data.cities.length > 1) ? (
        <section aria-labelledby="choosing-race-heading" className="max-w-3xl space-y-5">
          <h2 id="choosing-race-heading" className="font-display text-2xl font-semibold">
            Choosing a race {place.kind === "world" ? "away from home" : `in ${place.name}`}
          </h2>
          {data.guidance.map((item) => (
            <div key={item.slug}>
              <h3 className="text-lg font-semibold">{item.heading}</h3>
              <p className="mt-2 leading-7 text-muted">{item.text}</p>
              <p className="mt-2 text-sm text-muted">
                <a className={link} href={`/races/${item.slug}`}>
                  View race guide
                </a>
                {" · "}
                <a className={link} href={item.source}>
                  {item.sourceName}
                </a>
                {" · "}Checked <time dateTime={item.checkedAt}>{formatDate(item.checkedAt)}</time>
              </p>
            </div>
          ))}
          {data.cities.length > 1 ? (
            <p className="leading-7 text-muted">
              The unfiltered {data.archive ? "archive" : "upcoming calendar"} includes events in{" "}
              {data.cities
                .slice()
                .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
                .slice(0, 3)
                .map((item) => `${item.value} (${item.count})`)
                .join(", ")}
              . Use the town filter to compare locations, then check the race guide for the start
              venue and organiser’s travel information.
            </p>
          ) : null}
        </section>
      ) : null}
      {data.page === 1 && copy.questions.length ? (
        <section aria-labelledby="race-questions-heading" className="max-w-3xl space-y-5">
          <h2 id="race-questions-heading" className="font-display text-2xl font-semibold">
            Questions about{" "}
            {data.facet.distance?.heading.toLowerCase() ??
              data.facet.sport?.heading.toLowerCase() ??
              "races"}{" "}
            {place.kind === "world" ? "worldwide" : `in ${place.name}`}
          </h2>
          {copy.questions.map(({ question, answer }) => (
            <div key={question}>
              <h3 className="text-lg font-semibold">{question}</h3>
              <p className="mt-2 leading-7 text-muted">{copyParagraph(answer)}</p>
            </div>
          ))}
        </section>
      ) : null}
      {data.siblings.length ? (
        <nav aria-label="More locations" className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">
            More locations in {data.ancestors.at(-2)?.name}
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {data.siblings.slice(0, 12).map((item) => (
              <a key={item.path} href={item.path} className={link}>
                {item.name}
              </a>
            ))}
            {data.siblings.length > 12 ? (
              <a href={data.ancestors.at(-2)?.path} className={link}>
                Browse all locations
              </a>
            ) : null}
          </div>
        </nav>
      ) : null}
      <aside className="rounded-xl bg-elevated p-5 text-sm leading-6 text-muted">
        <p>
          This guide is put together from the events recorded on AthRecs and updates as dates pass
          or new editions are added. Coverage is growing; it is not a complete list of every race.
        </p>
        <p className="mt-2">
          Check the organiser’s latest information for entry availability, cancellations and final
          arrangements. A past edition does not confirm that a race will return.
        </p>
      </aside>
    </article>
  );
}
