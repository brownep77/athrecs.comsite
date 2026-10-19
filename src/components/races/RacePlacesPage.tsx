import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { formatRaceDateShort as formatDate } from "@/lib/athrecs/format";
import { fixtureSummary } from "@/lib/athrecs/fixture-presentation";
import type { RacePlacePageData } from "@/lib/athrecs/race-places";
import { racePlaceUrl } from "@/lib/athrecs/race-places-seo";
import { racePlaceCopy, type RaceCopyParagraph } from "@/lib/athrecs/race-places-copy";

const link = "text-accent underline underline-offset-4 hover:text-fg";
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
              {race.next.distance ? ` · ${race.next.distance}` : ""}
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
        {data.ancestors.map((ancestor) => (
          <span key={ancestor.key}>
            <span aria-hidden="true"> / </span>
            {ancestor.key === place.key ? (
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
            ? ` · ${data.featuredCount.toLocaleString("en-GB")} featured races`
            : ""}
        </p>
      </header>
      {data.children.length ? (
        <section aria-labelledby="places-heading">
          <h2 id="places-heading" className="font-display text-2xl font-semibold">
            Browse{" "}
            {place.kind === "world"
              ? "continents"
              : place.kind === "continent"
                ? "countries and territories"
                : "states, counties and areas"}
          </h2>
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
                  {child.count ? `${child.count} events` : "Listings coming soon"}
                </span>
              </a>
            ))}
          </div>
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
          {data.archive ? "Awaiting dates and past editions" : "Upcoming races"}
        </h2>
        {data.featuredCount ? (
          <p className="text-sm text-muted">
            Featured races are AthRecs editorial selections or recorded major-series events. They
            appear first; the list also includes local events.
          </p>
        ) : null}
        {data.races.length ? (
          renderRaces(data.races)
        ) : (
          <p className="rounded-xl border border-dashed border-border p-6 text-muted">
            {data.total
              ? "No races are currently listed in this view. Use the tabs above to browse upcoming races or recorded editions."
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
      {data.page === 1 && copy.questions.length ? (
        <section aria-labelledby="race-questions-heading" className="max-w-3xl space-y-5">
          <h2 id="race-questions-heading" className="font-display text-2xl font-semibold">
            Planning your next race
          </h2>
          {copy.questions.map(({ question, answer }) => (
            <div key={question}>
              <h3 className="text-lg font-semibold">{question}</h3>
              <p className="mt-2 leading-7 text-muted">{copyParagraph(answer)}</p>
            </div>
          ))}
        </section>
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
