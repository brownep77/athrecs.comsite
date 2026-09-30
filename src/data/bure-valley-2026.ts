import type { EditorialArticle } from "../lib/athrecs/editorial";

export const BURE_RESULTS_URL = "https://www.webscorer.com/race?raceid=449288";
export const BURE_ORGANISER_URL = "https://burevalleyharriers.com/our-races/";

// The published winners summary is not a full participant import. Do not use
// these award rows to infer overall positions, club membership or athlete IDs.
// Source summary retrieved 30 September 2026; category awards exclude top three.
export const BURE_WINNERS = [
  { category: "Male", name: "Sam Peck", time: "52:33.9" },
  { category: "Female", name: "Grace Buchanan", time: "1:04:31.9" },
  { category: "Male Senior", name: "James Preston", time: "56:51.3" },
  { category: "Male 40–44", name: "Andrew Plume", time: "58:32.8" },
  { category: "Male 45–49", name: "Neil Adams", time: "58:14.4" },
  { category: "Male 50–54", name: "Mitchell Dann", time: "1:00:47.9" },
  { category: "Male 55–59", name: "Tim Mardall", time: "57:51.4" },
  { category: "Male 60–64", name: "David Crotch", time: "1:11:33.7" },
  { category: "Male 65–69", name: "Nigel Marlow", time: "1:20:59.5" },
  { category: "Male 70–74", name: "Andrew Hammond", time: "1:26:49.1" },
  { category: "Male 75+", name: "Graham Walsh", time: "1:24:35.2" },
  { category: "Female Senior", name: "Emily Haslam", time: "1:08:11.9" },
  { category: "Female 40–44", name: "Amy Wright", time: "1:15:57.0" },
  { category: "Female 45–49", name: "Zoe Thomas", time: "1:10:26.6" },
  { category: "Female 50–54", name: "Juliet Garnham", time: "1:13:03.9" },
  { category: "Female 55–59", name: "Louise Hurr", time: "1:14:20.3" },
  { category: "Female 60–64", name: "Karen Balcombe", time: "1:18:11.0" },
  { category: "Female 65–69", name: "Bobbie Sauerzapf", time: "1:37:21.5" },
  { category: "Female 70–74", name: "Linda Cusack", time: "1:27:07.1" },
  { category: "Female 75+", name: "Veronica Manly", time: "1:51:11.8" },
] as const;

export const BURE_REPORT: EditorialArticle = {
  slug: "bure-valley-10-2026",
  kind: "race-reports",
  date: "2026-09-30",
  displayDate: "30 September 2026",
  title: "Bure Valley 10: Peck breaks the course record, Buchanan wins the women’s race",
  standfirst:
    "Sam Peck gave the Bure Valley 10 a course record on its tenth anniversary. Grace Buchanan won the women’s race as the Norfolk event returned to Banningham on Sunday 27 September.",
  body: [
    "Bure Valley Harriers’ ten-mile road race takes runners out onto the country lanes around Banningham before returning to the village green. This is an undulating course: a rural setting with enough climbing to make the finish feel earned.",
    "Peck’s winning performance was confirmed as a course record by the organisers. Buchanan headed the women’s field. Their published winning times were 52:33.9 and 1:04:31.9 respectively; the organiser’s report gives these as 52:33 and 1:04:31.",
    "The anniversary also brought familiar faces back to the route. Writing for Runners-next-the-Sea, Kirsty L described her eighth appearance, the repeated climbs and the return to the village green. Her club’s report also recognised Tim Mardall’s age-category win.",
    "The results include awards from the senior categories through to 75-plus. Category winners are listed separately from the overall winners: the timing provider excludes the top three overall from its category results. That distinction matters when comparing an age-category award with a runner’s place in the full field.",
    "The winners summary is available below, with a link to the official results for the full field. Times retain the precision published by the timing provider. The summary is not a complete finishing list.",
  ],
  sports: ["road-running"],
  locations: [{ country: "England", area: "East of England", county: "Norfolk" }],
  links: [
    { label: "Bure Valley 10 winners summary", url: "/results/bure-valley-10-2026" },
    { label: "Official results — Sublime Timing / Webscorer", url: BURE_RESULTS_URL },
    { label: "Bure Valley Harriers race report", url: BURE_ORGANISER_URL },
    { label: "Runners-next-the-Sea race account", url: "https://www.rnts.co.uk/author/rntsadmin/" },
  ],
};
