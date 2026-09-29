import { createFileRoute, Link } from "@tanstack/react-router";
import { NEWS_ARTICLES } from "@/data/runrecs-news";
import { EditorialBrowse } from "@/components/editorial/EditorialBrowse";
import { parseEditorialSearch } from "@/lib/athrecs/editorial";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/news/")({
  validateSearch: parseEditorialSearch,
  head: () =>
    IS_RUNRECS_SITE
      ? {
          links: [{ rel: "canonical", href: "https://www.runrecs.com/news" }],
          meta: [
            { title: "News | RunRecs.com" },
            {
              name: "description",
              content: "Race reports and results from RunRecs.",
            },
          ],
        }
      : {
          links: [{ rel: "canonical", href: `${SITE_URL}/news` }],
          meta: siteGraphMeta({
            title: "Sports News by country, area and county | ATHRECS.com",
            description:
              "Browse sports news, event announcements and local updates on AthRecs by sport, country, area and county.",
            url: `${SITE_URL}/news`,
          }),
        },
  component: IS_RUNRECS_SITE ? NewsIndexPage : AthRecsNewsPage,
});

function AthRecsNewsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <EditorialBrowse
      kind="news"
      search={search}
      onChange={(next) => {
        void navigate({ search: next });
      }}
    />
  );
}

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
              <span className="mt-4 inline-block text-sm font-semibold text-fg">
                Read the report
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
