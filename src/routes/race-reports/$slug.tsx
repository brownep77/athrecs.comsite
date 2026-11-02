import { createFileRoute, notFound } from "@tanstack/react-router";
import { EditorialArticlePage } from "@/components/editorial/EditorialArticlePage";
import { EDITORIAL_ARTICLES } from "@/data/athrecs-editorial";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { editorialJsonLd } from "@/lib/athrecs/editorial";
import { getPublicEditorialAthleteLinks } from "@/lib/athrecs/editorial-athletes-api";

export const Route = createFileRoute("/race-reports/$slug")({
  loader: async ({ params }) => {
    const article = EDITORIAL_ARTICLES.find(
      (item) => item.slug === params.slug && item.kind === "race-reports",
    );
    if (IS_RUNRECS_SITE || !article) throw notFound();
    return {
      article: {
        ...article,
        athleteLinks: await getPublicEditorialAthleteLinks({ data: { slug: article.slug } }),
      },
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          links: [
            { rel: "canonical", href: `${SITE_URL}/race-reports/${loaderData.article.slug}` },
          ],
          meta: siteGraphMeta({
            title: `${loaderData.article.seoTitle ?? loaderData.article.title} | AthRecs`,
            description: loaderData.article.description ?? loaderData.article.standfirst,
            url: `${SITE_URL}/race-reports/${loaderData.article.slug}`,
            type: "article",
          }),
          scripts: [
            {
              type: "application/ld+json",
              children: JSON.stringify(editorialJsonLd(loaderData.article, SITE_URL)).replace(
                /</g,
                "\\u003c",
              ),
            },
          ],
        }
      : {},
  component: RaceReportPage,
});

function RaceReportPage() {
  const { article } = Route.useLoaderData();
  return <EditorialArticlePage article={article} />;
}
