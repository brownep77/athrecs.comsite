import { ArrowRight, Compass, ExternalLink, Trophy } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { RunningGuidesLink } from "@/components/running/RunningGuidesLink";
import type { RunningSeriesGuide } from "@/data/running-series-guides";
import { runningSeriesGuidePath, type RunningSeriesSummary } from "@/lib/running/series-guides";

const linkClass =
  "inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function GuideSection({
  id,
  title,
  paragraphs,
}: {
  id: string;
  title: string;
  paragraphs: string[];
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 space-y-4">
      <h2 id={`${id}-heading`} className="font-display text-2xl font-semibold text-fg md:text-3xl">
        {title}
      </h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="max-w-3xl leading-7 text-muted">
          {paragraph}
        </p>
      ))}
    </section>
  );
}

export function RunningSeriesGuidePage({
  guide,
  countries,
  related,
}: {
  guide: RunningSeriesGuide;
  countries: { name: string; countryName: string; path: string }[];
  related: RunningSeriesSummary[];
}) {
  const checked = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(guide.checkedAt),
  );
  return (
    <article className="space-y-9 pb-10 md:space-y-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <a href="/running/guides" className="hover:text-accent">
          Running guides
        </a>
        <span aria-hidden="true">/</span>
        <a href="/running/race-series" className="hover:text-accent">
          Race series
        </a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{guide.name}</span>
      </nav>
      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-accent" />
        <div className="grid gap-7 p-5 md:p-8 lg:grid-cols-[1.6fr_1fr] lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-accent">
              Running series guide
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-fg md:text-5xl">
              {guide.name}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{guide.shortDescription}</p>
            <p className="mt-4 text-sm leading-6 text-muted">
              Entry, format and practical planning for amateur, club and competitive runners.
            </p>
          </div>
          <aside
            aria-label="Series at a glance"
            className="self-start rounded-xl border border-border bg-elevated p-5"
          >
            <Compass className="size-6 text-accent" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-semibold">At a glance</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-fg">Format</dt>
                <dd className="mt-1 leading-6 text-muted">{guide.format}</dd>
              </div>
              <div>
                <dt className="font-semibold text-fg">Running disciplines</dt>
                <dd className="mt-1 leading-6 text-muted">{guide.disciplines.join(" · ")}</dd>
              </div>
              <div>
                <dt className="font-semibold text-fg">Locations covered</dt>
                <dd className="mt-2 flex flex-wrap gap-x-3 gap-y-2 text-muted">
                  {guide.countries.map((country) => (
                    <span key={country.name} className="inline-flex items-center gap-1.5">
                      {country.code ? (
                        <span aria-hidden="true">
                          <CountryFlag country={country.code} />
                        </span>
                      ) : null}
                      {country.name}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
        <nav
          aria-label="On this page"
          className="flex flex-wrap gap-x-5 gap-y-1 border-t border-border bg-elevated px-5 py-3 md:px-8 lg:px-10"
        >
          {[
            ["#overview", "Overview"],
            ["#entry", "How to enter"],
            ["#amateurs", "Amateur runners"],
            ["#competition", "Competitive runners"],
            ["#questions", "Questions"],
          ].map(([href, label]) => (
            <a key={href} href={href} className={linkClass}>
              {label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </header>
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-12">
        <div className="min-w-0 space-y-10">
          <GuideSection
            id="overview"
            title={`What is ${guide.name}?`}
            paragraphs={guide.overview}
          />
          <GuideSection id="entry" title="How do I enter?" paragraphs={guide.entryAdvice} />
          <GuideSection
            id="amateurs"
            title="What should amateur runners know?"
            paragraphs={guide.amateurAdvice}
          />
          <GuideSection
            id="competition"
            title="What should competitive runners know?"
            paragraphs={guide.competitiveAdvice}
          />
          <GuideSection
            id="completion"
            title="How do completion and rankings work?"
            paragraphs={guide.completionOrRanking}
          />
          <GuideSection
            id="planning"
            title="Planning your races and travel"
            paragraphs={guide.planningAdvice}
          />
          <section id="questions" aria-labelledby="questions-heading" className="scroll-mt-24">
            <h2 id="questions-heading" className="font-display text-2xl font-semibold md:text-3xl">
              Runner questions
            </h2>
            <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-surface px-5">
              {guide.faqs.map((faq) => (
                <section key={faq.question} className="py-5">
                  <h3 className="font-semibold leading-6 text-fg">{faq.question}</h3>
                  <p className="mt-2 leading-7 text-muted">{faq.answer}</p>
                </section>
              ))}
            </div>
          </section>
        </div>
        <aside className="min-w-0 space-y-7">
          <section id="official-links" className="rounded-xl border border-border bg-elevated p-5">
            <h2 className="font-display text-xl font-semibold">Official information</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Check the organiser's current entry conditions and the instructions for your race
              edition.
            </p>
            <ul className="mt-3 divide-y divide-border">
              {guide.officialLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} py-2 text-sm`}
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-muted">
              Information checked <time dateTime={guide.checkedAt}>{checked}</time>.
            </p>
          </section>
          {countries.length ? (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="font-display text-xl font-semibold">Explore country guides</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                More races in relevant destinations. These country selections are broader than this
                series.
              </p>
              <ul className="mt-3 divide-y divide-border">
                {countries.map((country) => (
                  <li key={country.path}>
                    <a href={country.path} className={`${linkClass} py-2 text-sm`}>
                      <span aria-hidden="true">
                        <CountryFlag country={country.countryName} />
                      </span>
                      <span>{country.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <RunningGuidesLink />
        </aside>
      </div>
      <section
        aria-labelledby="related-series-heading"
        className="space-y-5 border-t border-border pt-8"
      >
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-accent" aria-hidden="true" />
          <h2 id="related-series-heading" className="font-display text-2xl font-semibold">
            More series to explore
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((series) => (
            <a
              key={series.slug}
              href={runningSeriesGuidePath(series.slug)}
              className="rounded-xl border border-border bg-surface p-5 no-underline hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <h3 className="font-display text-xl font-semibold text-fg">{series.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{series.shortDescription}</p>
              <span className="mt-4 inline-flex items-center gap-2 font-semibold text-accent">
                Read the guide
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
