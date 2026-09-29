import { createFileRoute, notFound } from "@tanstack/react-router";
import { EditorialArticlePage } from "@/components/editorial/EditorialArticlePage";
import { EDITORIAL_ARTICLES } from "@/data/athrecs-editorial";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/race-reports/$slug")({
  loader: ({ params }) => {
    const article = EDITORIAL_ARTICLES.find(
      (item) => item.slug === params.slug && item.kind === "race-reports",
    );
    if (IS_RUNRECS_SITE || !article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          links: [
            { rel: "canonical", href: `${SITE_URL}/race-reports/${loaderData.article.slug}` },
          ],
          meta: siteGraphMeta({
            title: `${loaderData.article.title} | ATHRECS.com`,
            description: loaderData.article.standfirst,
            url: `${SITE_URL}/race-reports/${loaderData.article.slug}`,
            type: "article",
          }),
        }
      : {},
  component: RaceReportPage,
});

function RaceReportPage() {
  const { article } = Route.useLoaderData();
  return <EditorialArticlePage article={article} />;
}
