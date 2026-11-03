import { createServerFn } from "@tanstack/react-start";
import { editorialReadingMinutes, type EditorialArticle } from "./editorial";
import { isResultDocument } from "./result-document";

const publicLink = (link: { label: string; url: string }) =>
  isResultDocument(link.url, link.label) ? { label: link.label, url: "" } : link;

export function publicEditorialArticle(article: EditorialArticle): EditorialArticle {
  return {
    ...article,
    links: article.links?.map(publicLink),
    callToAction: article.callToAction && !isResultDocument(article.callToAction.url, article.callToAction.label) ? article.callToAction : undefined,
    sections: article.sections?.map((section) => ({ ...section, sources: section.sources?.map(publicLink) })),
  };
}

export const getEditorialArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const { EDITORIAL_ARTICLES } = await import("../../data/athrecs-editorial");
    const article = EDITORIAL_ARTICLES.find((item) => item.slug === data);
    return article ? publicEditorialArticle(article) : null;
  });

export const getEditorialSummaries = createServerFn({ method: "GET" }).handler(async () => {
  const { EDITORIAL_ARTICLES } = await import("../../data/athrecs-editorial");
  return EDITORIAL_ARTICLES.map((article) => ({
    slug: article.slug, kind: article.kind, listInRaceReports: article.listInRaceReports,
    date: article.date, publishedAt: article.publishedAt, displayDate: article.displayDate,
    title: article.title, standfirst: article.standfirst, sports: article.sports,
    locations: article.locations, coverageLevels: article.coverageLevels,
    coverageContinents: article.coverageContinents, minutes: editorialReadingMinutes(article),
    body: [] as string[],
  }));
});
