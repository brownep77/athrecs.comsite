import { SPORT_PAGES } from "./sport-pages";

/** One list for the HTML directory and the XML sitemap. Account tools stay private. */
export const PUBLIC_PAGES = [
  { path: "/", name: "AthRecs home" },
  { path: "/about-us", name: "About AthRecs" },
  { path: "/athletes", name: "Athlete profiles" },
  { path: "/results", name: "Race results" },
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
  ...SPORT_PAGES.map((sport) => ({ path: `/sports/${sport.slug}`, name: sport.label })),
];
