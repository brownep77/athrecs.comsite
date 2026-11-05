import { createFileRoute, notFound } from "@tanstack/react-router";
import { EditorialArticlePage } from "@/components/editorial/EditorialArticlePage";
import { getEditorialArticle } from "@/lib/athrecs/public-editorial-api";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { editorialJsonLd } from "@/lib/athrecs/editorial";
import { getPublicEditorialAthleteLinks } from "@/lib/athrecs/editorial-athletes-api";

export const Route = createFileRoute("/race-reports/$slug")({
  loader: async ({ params }) => {
    const article = await getEditorialArticle({ data: params.slug });
    if (IS_RUNRECS_SITE || article?.kind !== "race-reports") throw notFound();
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
            image: loaderData.article.image
              ? new URL(loaderData.article.image.src, SITE_URL).href
              : undefined,
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
