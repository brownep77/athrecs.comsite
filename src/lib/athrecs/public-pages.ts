import { SPORT_PAGES } from "./sport-pages";
import { ROAD_ULTRAS, ULTRA_GUIDE_PATH, ultraPath } from "../running/road-ultras";
import { EDITORIAL_ARTICLES } from "../../data/athrecs-editorial";
import { editorialPath } from "./editorial";
import { FEATURED_ROAD_RACES } from "../../data/featured-road-races";

/** One list for the HTML directory and the XML sitemap. Account tools stay private. */
export const PUBLIC_PAGES = [
  { path: "/", name: "AthRecs home" },
  { path: "/about-us", name: "About AthRecs" },
  { path: "/athletes", name: "Athlete profiles" },
  { path: "/results", name: "Race results" },
  { path: "/race-reports", name: "Race Reports" },
  { path: "/news", name: "News" },
  { path: "/running/featured-races", name: "Featured road race previews" },
  ...FEATURED_ROAD_RACES.map((race) => ({
    path: `/running/previews/${race.slug}`,
    name: `${race.name} — race preview`,
  })),
  ...EDITORIAL_ARTICLES.map((article) => ({ path: editorialPath(article), name: article.title })),
  { path: "/results/berlin-marathon-2026", name: "Berlin Marathon 2026 results" },
  { path: "/results/bure-valley-10-2026", name: "Bure Valley 10 2026 winners summary" },
  { path: "/races", name: "Races and events" },
  { path: "/calendar", name: "Athletics calendar" },
  { path: "/race-series", name: "Athletics disciplines and championships" },
  { path: "/clubs", name: "Running and athletics clubs" },
  { path: "/find-events", name: "Find sporting events" },
  { path: "/join", name: "Create an athlete profile" },
  { path: "/brands", name: "Sports brands and partners" },
  { path: "/opportunities", name: "Athlete and club opportunities" },
  { path: "/sponsorship", name: "Athlete sponsorship" },
  { path: "/privacy", name: "Athlete privacy" },
  { path: "/site-map", name: "Browse AthRecs" },
  { path: ULTRA_GUIDE_PATH, name: "UK road ultramarathons" },
  ...ROAD_ULTRAS.map((race) => ({
    path: ultraPath(race.slug),
    name: `${race.name} — road ultra guide`,
  })),
  ...SPORT_PAGES.map((sport) => ({ path: `/sports/${sport.slug}`, name: sport.label })),
];
