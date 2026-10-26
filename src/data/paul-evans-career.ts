// Editorial summary of sources inspected on 10 October 2026. This does not
// create results, infer verification, or expose private account information.
const coaching = {
  label: "Paul Evans Coaching",
  url: "https://www.paulevanscoaching.com/about-paul-evans-runner",
  locator: "About Paul: Chicago victory, two Olympic appearances, Lisbon and Reading wins",
};
const worldAthletics = {
  label: "World Athletics",
  url: "https://worldathletics.org/athletes/great-britain-ni/paul-evans-14189179",
  locator: "Paul William Evans, athlete 14189179; 1992–1996 Olympic and marathon results",
};
export const paulEvansCareer = {
  slug: "paul-william-evans",
  checkedAt: "2026-10-26",
  biography: [
      "Paul William Evans is a British distance runner, two-time Olympian and winner of the 1996 Chicago Marathon. Based in Norfolk, he built an international career across track, cross-country and road racing before becoming a coach. His club associations include Belgrave Harriers and City of Norwich AC.",
      "Evans represented Great Britain in the Olympic 10,000m at Barcelona in 1992 and Atlanta in 1996. In Barcelona he qualified from his heat and finished 11th in the final in 28:29.83. He reached the final again in Atlanta but did not finish. His best 10,000m time, 27:47.79, came in Stockholm in July 1993; his 5000m best of 13:25.38 followed in Helsinki in June 1995.",
      "His road career reached its peak at Chicago on 20 October 1996, when he won in 2:08:52. That victory followed second place at the 1995 New York City Marathon in 2:11:05 and third at the 1996 London Marathon in 2:10:40. He remained competitive at the distance the following year, running 2:09:18 in London and 2:09:20 in Chicago.",
      "Evans also won the Lisbon Half Marathon in 1991 and Reading in 1993. His half-marathon record includes 1:01:18 at the 1997 Great North Run, a point-to-point course performance. Alongside the major road races, he competed in international cross-country events across Britain and Europe, including races in Belfast, Durham, Albufeira, Brussels and Elgoibar.",
      "A relatively late arrival at elite distance running, Evans went on to develop a coaching career in Norfolk. His experience ranges from domestic club competition to Olympic finals and winning a major city marathon, giving him a broad practical background for helping runners with different ambitions."
  ],
  biographySources: [worldAthletics, coaching],
  achievements: [
    {
      id: "chicago-1996",
      competitionTier: "major" as const,
      title: "Chicago Marathon winner",
      date: "20 October 1996",
      outcomes: ["1st · 2:08:52"],
      sources: [worldAthletics, coaching],
    },
    {
      id: "olympic-10000",
      competitionTier: "olympic" as const,
      title: "Competed in 2 Olympic Games",
      showOnBoard: true,
      date: "Barcelona 1992 · Atlanta 1996",
      outcomes: ["Great Britain · 10,000m"],
      sources: [worldAthletics, coaching],
    },
    {
      id: "new-york-1995",
      competitionTier: "major" as const,
      title: "New York City Marathon",
      date: "12 November 1995",
      outcomes: ["2nd · 2:11:05"],
      sources: [worldAthletics],
    },
    {
      id: "london-1996",
      competitionTier: "major" as const,
      title: "London Marathon",
      date: "21 April 1996",
      outcomes: ["3rd · 2:10:40"],
      sources: [worldAthletics],
    },
  ],
  reportedHighlights: [],
};
