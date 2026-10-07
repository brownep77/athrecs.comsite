import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { getNewsArticle } from "@/data/runrecs-news";
import { EDITORIAL_ARTICLES } from "@/data/athrecs-editorial";
import { EditorialArticlePage } from "@/components/editorial/EditorialArticlePage";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    if (!IS_RUNRECS_SITE) {
      const editorial = EDITORIAL_ARTICLES.find((item) => item.slug === params.slug);
      if (!editorial) throw notFound();
      if (editorial.kind === "race-reports")
        throw redirect({
          to: "/race-reports/$slug",
          params: { slug: editorial.slug },
          statusCode: 301,
        });
      return { article: editorial, editorial };
    }
    const article = getNewsArticle(params.slug);
    if (!article) throw notFound();
    return { article, editorial: null };
  },
  head: ({ loaderData }) =>
    loaderData
      ? !IS_RUNRECS_SITE
        ? {
            links: [{ rel: "canonical", href: `${SITE_URL}/news/${loaderData.article.slug}` }],
            meta: siteGraphMeta({
              title: `${loaderData.article.title} | ATHRECS.com`,
              description: loaderData.article.standfirst,
              url: `${SITE_URL}/news/${loaderData.article.slug}`,
              type: "article",
            }),
          }
        : {
            links: [
              { rel: "canonical", href: `https://www.runrecs.com/news/${loaderData.article.slug}` },
            ],
            meta: [
              { title: `${loaderData.article.title} | RunRecs.com` },
              { name: "description", content: loaderData.article.standfirst },
            ],
          }
      : {},
  component: NewsArticlePage,
});

function NewsArticlePage() {
  const { article, editorial } = Route.useLoaderData();
  if (editorial) return <EditorialArticlePage article={editorial} />;
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm">
        <Link to="/news" className="font-medium text-muted no-underline hover:text-fg">
          ← News
        </Link>
      </p>
      <header className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          {article.displayDate}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">{article.standfirst}</p>
      </header>
      <div className="space-y-4 text-sm leading-7 text-fg sm:text-base">
        {article.body.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
