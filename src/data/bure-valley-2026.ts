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
  title: "Peck sets course record at Bure Valley 10",
  standfirst:
    "Sam Peck won the tenth anniversary Bure Valley 10 in a course record of 52:33.9, with Grace Buchanan taking the women’s race in 1:04:31.9.",
  body: [
    "The race returned to Banningham on Sunday 27 September. Organised by Bure Valley Harriers, the ten-mile course follows the country lanes around the village, with a few climbs along the way before the finish on the green.",
    "James Preston took the men’s senior award in 56:51.3. Andrew Plume won the 40–44 category in 58:32.8, with Neil Adams taking the 45–49 title in 58:14.4.",
    "Tim Mardall ran 57:51.4 to win the men’s 55–59 category. Mitchell Dann took the 50–54 award in 1:00:47.9, while David Crotch finished in 1:11:33.7 to win the 60–64 category.",
    "Nigel Marlow won the men’s 65–69 category in 1:20:59.5. The 70–74 award went to Andrew Hammond in 1:26:49.1, and Graham Walsh took the 75-plus title in 1:24:35.2.",
    "In the women’s categories, Emily Haslam won the senior award in 1:08:11.9. Amy Wright took the 40–44 title in 1:15:57.0, while Zoe Thomas won the 45–49 category in 1:10:26.6.",
    "Juliet Garnham led the women’s 50–54 category in 1:13:03.9, with Louise Hurr winning the 55–59 award in 1:14:20.3. Karen Balcombe took the 60–64 title in 1:18:11.0.",
    "Bobbie Sauerzapf won the women’s 65–69 category in 1:37:21.5. Linda Cusack took the 70–74 award in 1:27:07.1, and Veronica Manly won the 75-plus category in 1:51:11.8.",
    "The winners and age-category results are linked below, along with the official results for the full field. Category awards exclude the top three overall.",
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
