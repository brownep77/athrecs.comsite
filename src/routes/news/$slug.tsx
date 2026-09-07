import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getNewsArticle } from "@/data/runrecs-news";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    const article = getNewsArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.article.title} | RunRecs.com` },
      { name: "description", content: loaderData.article.standfirst },
    ],
  }),
  component: NewsArticlePage,
});

function NewsArticlePage() {
  const { article } = Route.useLoaderData();
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
