import { NEWS_ARTICLES } from "./runrecs-news";
import type { EditorialArticle } from "../lib/athrecs/editorial";

// Reuse the already-published report without changing its text or the RunRecs feed.
// Add news as kind: "news". Tag only locations and sports actually covered.
const publishedReport = NEWS_ARTICLES.find(
  (article) => article.slug === "sunday-double-run-norwich-big-half-2026",
);

export const EDITORIAL_ARTICLES: EditorialArticle[] = publishedReport
  ? [
      {
        ...publishedReport,
        kind: "race-reports",
        sports: ["road-running"],
        locations: [
          { country: "England", area: "East of England", county: "Norfolk" },
          { country: "England", area: "London", county: "Greater London" },
        ],
      },
    ]
  : [];
