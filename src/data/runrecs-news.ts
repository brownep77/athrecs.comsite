export type NewsArticle = {
  slug: string;
  date: string;
  displayDate: string;
  title: string;
  standfirst: string;
  body: string[];
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "sunday-double-run-norwich-big-half-2026",
    date: "2026-09-07",
    displayDate: "7 September 2026",
    title: "Sunday double: course records in Norwich, McColgan’s fourth Big Half",
    standfirst:
      "Two sold-out city races landed on the same Sunday. Run Norwich, a 10 km not a half, produced the first sub-30 on the course. In London, Eilish McColgan won The Big Half for a fourth time on her first start in five months.",
    body: [
      "Run Norwich is the Community Sports Foundation 10 km through the closed city centre. The London race was The Big Half, from Tower Bridge to the Cutty Sark.",
      "Jonathan Escalante-Phillips (Cambridge & Coleridge AC) won Run Norwich in 29:59, the first man under 30 minutes on this course and 42 seconds inside the record he set as a debutant in 2024 (30:41). Logan Smith (City of Norwich AC) was second in 30:02. Marshall Smith (Ashford AC), the 2025 champion in 31:28, took third in 30:50.",
      "Daisy Glover (Framlingham Flyers) won on debut in 33:26, taking 1:11 off Holly Archer’s 2024 record of 34:37. Archer was second in 35:06. Ellie Grubb (City of Norwich AC) was third in 35:38.",
      "The field was a record 8,047 starters, up from 7,798 finishers in 2025. Philippe Clement started the race. About 20,000 spectators lined a route past the Castle, Carrow Road and the Cathedral. Official results are on runnorwich.co.uk; treat day-of times as provisional until queries close at midnight on Tuesday 8 September.",
      "In London, Eilish McColgan won in 1:10:54, her fourth Big Half title and first race since a fractured toe at April’s London Marathon. Jessica Warner-Judd, the 2025 champion, was second in 1:12:13. Emma Pallant was third in 1:12:59.",
      "The time was a win, not a raid on the clock. McColgan’s course record remains 1:07:35 from 2022. She won here in 1:09:14 in 2024. Next start: Great North Run, 13 September.",
      "Kadar Omar Abdullahi (Birchfield Harriers) won the men’s race in 1:01:51. Jack Rowe, chasing a fourth straight title after 2023–25, was second by 14 seconds in 1:02:05. David Weir won the men’s wheelchair race in 46:13, a course record. Eden Rainbow-Cooper defended the women’s wheelchair title in 52:47. A record 17,876 finished the ninth edition.",
      "Sources: Norwich Evening News; Run Norwich results pages; BBC Sport and Evening Standard Big Half reports; London Marathon Events. Elite times as published on race day.",
    ],
  },
];

export function getNewsArticle(slug: string) {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}
