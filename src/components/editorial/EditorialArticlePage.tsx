import { Link } from "@tanstack/react-router";
import type { EditorialArticle } from "@/lib/athrecs/editorial";

export function EditorialArticlePage({ article }: { article: EditorialArticle }) {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
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
        <p className="text-lg leading-8 text-muted">{article.standfirst}</p>
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
      <div className="space-y-5 text-base leading-8">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {article.links?.length ? (
        <nav
          aria-label="Report sources and results"
          className="flex flex-col gap-3 border-t border-border pt-5"
        >
          {article.links.map((link) => (
            <a key={link.url} href={link.url} className="text-accent underline underline-offset-2">
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </article>
  );
}
