import type { RaceEditorialGuide } from "@/data/race-editorial-guides";

/** Research-backed editorial for the current event edition.
 * The database page supplies live schedule, status, entry and actual results.
 */
export function RaceEditorialSections({ guide }: { guide: RaceEditorialGuide }) {
  return (
    <article className="space-y-6" aria-labelledby="editorial-race-heading">
      <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          The AthRecs race guide
        </p>
        <h2 id="editorial-race-heading" className="font-display text-2xl font-semibold leading-snug text-fg">
          {guide.strapline}
        </h2>
        {guide.opening.map((paragraph) => (
          <p key={paragraph} className="max-w-4xl text-sm leading-relaxed text-muted md:text-base">
            {paragraph}
          </p>
        ))}
      </section>

      <section id="race-course" className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <h2 className="font-display text-xl font-semibold text-fg">The course: what it is really like to run</h2>
        {guide.course.map((paragraph) => (
          <p key={paragraph} className="max-w-4xl text-sm leading-relaxed text-muted">{paragraph}</p>
        ))}
        {guide.pacingTip && (
          <p className="rounded-lg border-l-4 border-accent bg-elevated p-4 text-sm leading-relaxed text-fg">
            <strong>Our course advice:</strong> {guide.pacingTip}
          </p>
        )}
      </section>

      <section id="race-day-essentials" className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-fg">Race-day essentials</h2>
          <p className="text-xs text-subtle">Organiser information checked {guide.checkedAt}. Confirm final instructions before racing.</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guide.practical.map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-elevated p-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-subtle">{label}</dt>
              <dd className="mt-1 text-sm font-medium leading-relaxed text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <h2 className="font-display text-xl font-semibold text-fg">More than ten kilometres</h2>
        {guide.atmosphere.map((paragraph) => (
          <p key={paragraph} className="max-w-4xl text-sm leading-relaxed text-muted">{paragraph}</p>
        ))}
      </section>

      <section id="race-history" className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <h2 className="font-display text-xl font-semibold text-fg">The race's history, winners and records</h2>
        {guide.history.map((paragraph) => (
          <p key={paragraph} className="max-w-4xl text-sm leading-relaxed text-muted">{paragraph}</p>
        ))}
        {guide.highlights?.length ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {guide.highlights.map((highlight) => (
              <div key={highlight.label} className="rounded-lg border border-border bg-elevated p-3">
                <dt className="text-xs font-semibold text-subtle">{highlight.label}</dt>
                <dd className="mt-1 text-base font-semibold text-fg">{highlight.value}</dd>
                <a
                  href={highlight.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-8 items-center text-xs font-medium text-accent underline"
                >
                  Source / official results
                </a>
              </div>
            ))}
          </dl>
        ) : null}
        <p className="text-sm font-medium text-fg">
          Ran it before? Explore the recorded results and linked athlete profiles further down this page.
          Even a first finish or a personal milestone deserves to be kept.
        </p>
      </section>

      <section id="race-editorial-faq" className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <h2 className="font-display text-xl font-semibold text-fg">Questions runners ask</h2>
        <div className="divide-y divide-border">
          {guide.faqs.map(({ question, answer }) => (
            <div key={question} className="space-y-1 py-3 first:pt-0 last:pb-0">
              <h3 className="text-sm font-semibold text-fg">{question}</h3>
              <p className="text-sm leading-relaxed text-muted">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="space-y-2 rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-subtle">
        <p>{guide.caveat}</p>
        <details>
          <summary className="cursor-pointer font-semibold text-fg">Research sources and last verification ({guide.checkedAt})</summary>
          <ul className="mt-2 space-y-1 pl-4">
            {guide.sources.map(({ label, url }) => (
              <li key={url} className="list-disc">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline">{label}</a>
              </li>
            ))}
          </ul>
        </details>
      </footer>
    </article>
  );
}
