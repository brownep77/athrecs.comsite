import { createFileRoute, Link } from "@tanstack/react-router";
import { NEWS_ARTICLES } from "@/data/runrecs-news";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News | RunRecs.com" },
      {
        name: "description",
        content: "Race reports and results from RunRecs.",
      },
    ],
  }),
  component: NewsIndexPage,
});

function NewsIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">News</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Race reports
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Published results from city races, dated as they land.
        </p>
      </header>
      <ul className="space-y-4">
        {NEWS_ARTICLES.map((article) => (
          <li key={article.slug}>
            <Link
              to="/news/$slug"
              params={{ slug: article.slug }}
              className="block rounded-2xl border border-border bg-surface p-5 no-underline shadow-card hover:border-accent"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                {article.displayDate}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-fg">
                {article.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">{article.standfirst}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-fg">Read the report</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
