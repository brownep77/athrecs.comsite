import { NEWS_ARTICLES } from "./runrecs-news";
import { BURE_REPORT } from "./bure-valley-2026";
import { OCTOBER_WEEKEND_PREVIEWS } from "./october-weekend-previews";
import type { EditorialArticle } from "../lib/athrecs/editorial";

// Reuse the already-published report without changing its text or the RunRecs feed.
// Add news as kind: "news". Tag only locations and sports actually covered.
const publishedReport = NEWS_ARTICLES.find(
  (article) => article.slug === "sunday-double-run-norwich-big-half-2026",
);

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  ...OCTOBER_WEEKEND_PREVIEWS,
  BURE_REPORT,
  ...(publishedReport
    ? [
        {
          ...publishedReport,
          kind: "race-reports" as const,
          sports: ["road-running"],
          locations: [
            { country: "England", area: "East of England", county: "Norfolk" },
            { country: "England", area: "London", county: "Greater London" },
          ],
        },
      ]
    : []),
];

