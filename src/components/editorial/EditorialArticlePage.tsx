import { Link } from "@tanstack/react-router";
import {
  EDITORIAL_LEVELS,
  editorialContinents,
  editorialLevels,
  editorialReadingMinutes,
  type EditorialArticle,
} from "@/lib/athrecs/editorial";

import { ReportStandings } from "./ReportStandings";

function ArticleText({ text, links }: { text: string; links?: Record<string, string> }) {
  if (!links) return text;
  const profiles = new Map(Object.entries(links).filter(([name, slug]) => name.trim() && slug));
  if (!profiles.size) return text;
  const names = [...profiles.keys()]
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Full-name boundaries protect names with accents and avoid linking a shorter
  // name inside a different surname. Apostrophes after a name allow possessives.
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}\\p{M}_-])(${names.join("|")})(?![\\p{L}\\p{N}\\p{M}_-])`,
    "gu",
  );
  return text.split(pattern).map((part, index) => {
    const slug = profiles.get(part);
    return slug ? (
      <Link
        key={`${part}-${index}`}
        to="/athletes/$slug"
        params={{ slug }}
        className="text-accent underline underline-offset-2"
      >
        {part}
      </Link>
    ) : (
      part
    );
  });
}

export function EditorialArticlePage({ article }: { article: EditorialArticle }) {
  return (
    <article
      className={
        article.sections?.some((section) => section.standings)
          ? "mx-auto max-w-6xl space-y-6 [&>:not([data-standings])]:mx-auto [&>:not([data-standings])]:max-w-3xl"
          : "mx-auto max-w-3xl space-y-6"
      }
    >
      <Link
        to={article.kind === "race-reports" ? "/race-reports" : "/news"}
        search={{}}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
      >
        {article.kind === "race-reports" ? "All Race Reports" : "All News"}
      </Link>
      <header className="space-y-4 border-b border-border pb-6">
        <time dateTime={article.date} className="text-sm font-semibold text-accent">
          {article.displayDate}
        </time>
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {article.title}
        </h1>
        <p className="text-sm text-muted">
          {article.author ? `By ${article.author} · ` : ""}
          {editorialReadingMinutes(article)} min read
        </p>
        <nav aria-label="Article coverage" className="flex flex-wrap gap-2">
          {editorialLevels(article).map((level) => (
            <Link
              key={level}
              to={article.kind === "race-reports" ? "/race-reports" : "/news"}
              search={{ level }}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold text-accent"
            >
              {EDITORIAL_LEVELS.find((item) => item.value === level)?.label}
            </Link>
          ))}
          {editorialContinents(article).map((continent) => (
            <Link
              key={continent}
              to={article.kind === "race-reports" ? "/race-reports" : "/news"}
              search={{ continent }}
              className="inline-flex min-h-11 items-center rounded-lg bg-elevated px-3 text-sm text-accent"
            >
              {continent}
            </Link>
          ))}
        </nav>
        <p className="text-lg leading-8 text-muted">
          <ArticleText text={article.standfirst} links={article.athleteLinks} />
        </p>
        <ul className="flex flex-wrap gap-2" aria-label="Story locations">
          {article.locations.map((location) => (
            <li key={`${location.country}-${location.area}-${location.county}`}>
              <Link
                to={article.kind === "race-reports" ? "/race-reports" : "/news"}
                search={location}
                className="inline-flex min-h-11 items-center rounded-lg bg-elevated px-3 text-sm text-accent"
              >
                {[location.county, location.area, location.country].filter(Boolean).join(", ")}
              </Link>
            </li>
          ))}
        </ul>
      </header>
      {article.image ? (
        <figure className="space-y-2">
          <img
            src={article.image.src}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            fetchPriority="high"
            className="mx-auto h-auto max-h-[38rem] w-full rounded-xl object-contain"
          />
          <figcaption className="text-sm text-muted">
            <ArticleText text={article.image.caption} links={article.athleteLinks} />
          </figcaption>
        </figure>
      ) : null}
      {article.sections?.length ? (
        <nav
          aria-label="In this article"
          className="rounded-xl border border-border bg-surface p-5"
        >
          <p className="mb-2 font-semibold">In this article</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {article.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-accent underline underline-offset-2">
                  {section.heading}
                </a>
              </li>
            ))}
            {article.faqs?.length ? (
              <li>
                <a href="#questions" className="text-accent underline underline-offset-2">
                  Quick answers
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
      <div className="space-y-5 text-base leading-8">
        {article.body.map((paragraph) => (
          <p key={paragraph}>
            <ArticleText text={paragraph} links={article.athleteLinks} />
          </p>
        ))}
      </div>
      {article.sections?.map((section) => (
        <section
          key={section.id}
          data-standings={section.standings ? "" : undefined}
          id={section.id}
          className="scroll-mt-24 space-y-4 text-base leading-8"
          aria-labelledby={`${section.id}-heading`}
        >
          <h2
            id={`${section.id}-heading`}
            className="pt-4 font-display text-2xl font-semibold leading-tight"
          >
            <ArticleText text={section.heading} links={article.athleteLinks} />
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>
              <ArticleText text={paragraph} links={article.athleteLinks} />
            </p>
          ))}
          {section.image ? (
            <figure className="space-y-2">
              <img
                src={section.image.src}
                alt={section.image.alt}
                width={section.image.width}
                height={section.image.height}
                loading="lazy"
                className="mx-auto h-auto max-h-[38rem] w-full rounded-xl object-contain"
              />
              <figcaption className="text-sm text-muted">{section.image.caption}</figcaption>
            </figure>
          ) : null}
          {section.standings && (
            <ReportStandings
              key={article.slug}
              standings={section.standings}
              links={article.athleteLinks}
            />
          )}
          {section.table ? (
            <div
              className="overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-accent"
              role="region"
              aria-label={section.table.caption}
              tabIndex={0}
            >
              <table className="w-full min-w-[32rem] text-left text-sm leading-6">
                <caption className="p-3 text-left font-semibold">
                  <ArticleText text={section.table.caption} links={article.athleteLinks} />
                </caption>
                <thead className="bg-elevated">
                  <tr>
                    {section.table.headings.map((heading, index) => (
                      <th key={`${heading}-${index}`} scope="col" className="p-3">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, index) => (
                    <tr key={index} className="border-t border-border">
                      {row.map((cell, i) =>
                        i === 0 ? (
                          <th key={i} scope="row" className="p-3 font-medium">
                            <ArticleText text={cell} links={article.athleteLinks} />
                          </th>
                        ) : (
                          <td key={i} className="p-3">
                            <ArticleText text={cell} links={article.athleteLinks} />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {section.sources?.length ? (
            <p className="text-sm leading-6 text-muted">
              Sources:{" "}
              {section.sources.map((source, index) => (
                <span key={source.url || source.label}>
                  {index ? " · " : ""}
                  {source.url ? (
                    <a href={source.url} className="text-accent underline underline-offset-2">
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                </span>
              ))}
            </p>
          ) : null}
        </section>
      ))}
      {article.faqs?.length ? (
        <section
          id="questions"
          className="scroll-mt-24 space-y-5"
          aria-labelledby="questions-heading"
        >
          <h2 id="questions-heading" className="font-display text-2xl font-semibold">
            Quick answers
          </h2>
          {article.faqs.map((faq) => (
            <div key={faq.question} className="space-y-2">
              <h3 className="text-lg font-semibold">
                <ArticleText text={faq.question} links={article.athleteLinks} />
              </h3>
              <p className="leading-8">
                <ArticleText text={faq.answer} links={article.athleteLinks} />
              </p>
            </div>
          ))}
        </section>
      ) : null}
      {article.callToAction ? (
        <aside className="space-y-3 rounded-xl border border-border bg-elevated p-6">
          <h2 className="font-display text-2xl font-semibold">{article.callToAction.heading}</h2>
          <p className="leading-7">
            <ArticleText text={article.callToAction.text} links={article.athleteLinks} />
          </p>
          <a
            href={article.callToAction.url}
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2 font-semibold text-primary-fg"
          >
            {article.callToAction.label}
          </a>
        </aside>
      ) : null}
      {article.hashtags?.length ? (
        <p
          aria-label="Article hashtags"
          className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted"
        >
          {article.hashtags.map((hashtag) => (
            <span key={hashtag}>{hashtag}</span>
          ))}
        </p>
      ) : null}
      {article.links?.length ? (
        <nav
          aria-label="Related pages and sources"
          className="flex flex-col gap-3 border-t border-border pt-5"
        >
          {article.links.map((link) =>
            link.url ? (
              <a
                key={link.url}
                href={link.url}
                className="text-accent underline underline-offset-2"
              >
                {link.label}
              </a>
            ) : (
              <span key={link.label} className="text-muted">
                {link.label}
              </span>
            ),
          )}
        </nav>
      ) : null}
    </article>
  );
}
