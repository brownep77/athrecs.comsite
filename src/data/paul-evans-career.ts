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
  checkedAt: "2026-10-10",
  biography: [
    "Paul Evans is a British distance runner and two-time Olympian. He won the 1996 Chicago Marathon in 2:08:52 and represented Great Britain over 10,000m at the Barcelona 1992 and Atlanta 1996 Olympic Games.",
    "His road career includes second at the 1995 New York City Marathon, third at the 1996 London Marathon, and victories at the Lisbon and Reading half marathons. He later became a running coach in Norfolk.",
  ],
  biographySources: [worldAthletics, coaching],
  achievements: [
    {
      id: "chicago-1996",
      title: "Chicago Marathon winner",
      date: "20 October 1996",
      outcomes: ["1st · 2:08:52"],
      sources: [worldAthletics, coaching],
    },
    {
      id: "olympic-10000",
      title: "Two Olympic Games",
      date: "Barcelona 1992 · Atlanta 1996",
      outcomes: ["Great Britain · 10,000m"],
      sources: [worldAthletics, coaching],
    },
    {
      id: "new-york-1995",
      title: "New York City Marathon",
      date: "12 November 1995",
      outcomes: ["2nd · 2:11:05"],
      sources: [worldAthletics],
    },
    {
      id: "london-1996",
      title: "London Marathon",
      date: "21 April 1996",
      outcomes: ["3rd · 2:10:40"],
      sources: [worldAthletics],
    },
  ],
  reportedHighlights: [],
};
