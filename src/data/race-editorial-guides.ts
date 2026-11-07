/**
 * Editorial race guides supplement factual fixture/result APIs.
 * Keep a separate editionDate so instructions never drift into the following year.
 * All prose must be original and fact-checked; never copy organiser marketing text.
 * Media rights are handled separately in the reviewed image registry.
 */
export type RaceEditorialGuide = {
  slug: string;
  editionDate: string;
  checkedAt: string;
  seoTitle: string;
  seoDescription: string;
  strapline: string;
  opening: readonly string[];
  course: readonly string[];
  pacingTip?: string;
  practical: readonly { label: string; value: string }[];
  atmosphere: readonly string[];
  history: readonly string[];
  highlights?: readonly { label: string; value: string; sourceUrl: string }[];
  faqs: readonly { question: string; answer: string }[];
  sources: readonly { label: string; url: string }[];
  caveat: string;
};

export const RACE_EDITORIAL_GUIDES: readonly RaceEditorialGuide[] = [
  {
    slug: "wymondham-nyd-10k",
    editionDate: "2027-01-01",
    checkedAt: "2026-11-07",
    seoTitle: "Wymondham New Year's Day 10K 2027 | Course, Entry & Results | AthRecs",
    seoDescription: "Wymondham New Year's Day 10K returns on 1 January 2027. Explore the Norfolk course, start time, entry details, race-day advice, winners and past results.",
    strapline: "Start the year on the right foot. Preferably both of them.",
    opening: [
      "Some people begin New Year's Day with a lie-in. Others pull on their running shoes, brave the January air and head to Wymondham for ten kilometres of countryside, camaraderie and the prospect of cake afterwards.",
      "Organised by Wymondham Athletics Club, this is a proper Norfolk New Year's tradition. Club athletes chasing a quick time share the roads with first-time 10K runners, familiar faces and people who simply want to begin the year by doing something they're proud of.",
      "Whatever your target, crossing a finish line on the first morning of the year is a satisfying way to get started. The Christmas decorations can wait."
    ],
    course: [
      "The race starts and finishes on Lady's Lane, on the outskirts of Wymondham. Its rural-road route runs through countryside towards Morley, following undulating roads rather than a completely flat circuit.",
      "What stands out is the setting: country lanes, open countryside and the natural rises and falls of the roads around Morley. It has the character of a Norfolk club race rather than a big-city 10K. The route remains open to traffic, with marshals along the course.",
      "The organiser provides water around halfway and at the finish. Check the final 2027 map and race-day instructions before travelling; older course maps are useful background, not proof that every detail is unchanged."
    ],
    practical: [
      { label: "Race date", value: "Friday 1 January 2027" },
      { label: "Start time", value: "10:00 GMT" },
      { label: "Distance", value: "10K / 6.2 miles, chip timed" },
      { label: "Race HQ", value: "Wymondham Central Hall, Back Lane, NR18 0QB" },
      { label: "Start and finish", value: "Lady's Lane, around five minutes' walk from HQ" },
      { label: "Number collection", value: "From 07:45 at Race HQ" },
      { label: "Entry fees", value: "£19 affiliated / £21 unaffiliated (check live entry form)" },
      { label: "Capacity", value: "750 places; availability can change" },
      { label: "Eligibility", value: "At least 15 years old on race day" },
      { label: "Water and finish", value: "Water around halfway and at the finish; snacks and a bespoke finisher medal" },
      { label: "Toilets", value: "Portable toilets at Central Hall car park; additional toilets expected near Market Street car park. Hall toilets closed" },
      { label: "Parking", value: "Use town car parks, not residential roads; follow the club's parking guidance" },
      { label: "Baggage", value: "No bag drop; bring only what you can carry" },
      { label: "Safety pins", value: "Bring your own to reduce waste" },
      { label: "Headphones", value: "Not permitted, including bone-conduction models; roads remain open" },
      { label: "Dogs and buggies", value: "Not permitted on the course" },
      { label: "Spectators", value: "No spectators down Lady's Lane during the race; use the designated viewing/diversion area" },
      { label: "Prizes", value: "Age-category trophies awarded on the day" },
      { label: "Transfers", value: "Allowed until midnight 16 December 2026; no refunds or deferrals" },
      { label: "UKA licence", value: "31605" },
      { label: "Race enquiries", value: "WACracesecretary@gmail.com" }
    ],
    atmosphere: [
      "Wymondham has become a friendly fixture on East Anglia's running calendar, with marshals who have earned a reputation for enthusiastic encouragement. You don't need a podium finish to be part of the occasion.",
      "At headquarters, runners can find tea, coffee and cake in return for a charitable donation. The chosen charity for 2027 had not been announced on the official entry page when checked, so we won't guess.",
      "The race suits runners at different levels, provided they are prepared for the distance, undulations and open-road conditions. Whether you're chasing a club record, returning after a break or taking on your first 10K, it's a good place to make an early-year memory."
    ],
    history: [
      "In 2026, the event held its 43rd running and welcomed a record 689 competitors. Nearly 100 volunteers helped with marshalling and the finishing-area operation, a reminder that community races are built as much by the people in hi-vis as the people wearing race numbers.",
      "The 2026 men's race was won by Aaron McGrady in 33:50.8 chip time, while Hannah Somani won the women's race in 38:51.0. The official 2024 report also identifies Sophie Alden's 34:59.6 as a women's course record.",
      "Older editions deserve a home too. The organiser links annual results back to 2004, and AthRecs should connect those editions with runners' verified results and athlete profiles as the archive develops."
    ],
    highlights: [
      { label: "2026 record turnout", value: "689 runners", sourceUrl: "https://www.wymondhammagazine.co.uk/sport/new-years-day-10k-sees-record-turnout-of-689-runners" },
      { label: "2026 men's winner", value: "Aaron McGrady · 33:50.8 chip", sourceUrl: "https://www.wymondhamac.com/post/nyd-10k-2026-results" },
      { label: "2026 women's winner", value: "Hannah Somani · 38:51.0 chip", sourceUrl: "https://www.wymondhamac.com/post/nyd-10k-2026-results" },
      { label: "2024 women's course record", value: "Sophie Alden · 34:59.6 chip (reported record)", sourceUrl: "https://www.wymondhamac.com/post/nyd-10k-2024-results" }
    ],
    faqs: [
      { question: "When is the Wymondham New Year's Day 10K 2027?", answer: "Friday 1 January 2027. The 10K starts at 10:00am GMT." },
      { question: "Where are race headquarters and the start?", answer: "Race HQ is at Wymondham Central Hall, Back Lane, NR18 0QB. The start and finish are on Lady's Lane, around a five-minute walk away." },
      { question: "Is the Wymondham 10K course flat?", answer: "No. It follows undulating country roads around Wymondham. Pace sensibly, especially on the rises." },
      { question: "Is this a good first 10K?", answer: "The event welcomes runners of varied abilities, including newcomers, but you should be prepared for the full distance and for open roads. Check the organiser's final instructions." },
      { question: "Can runners wear bone-conduction headphones?", answer: "No. The organiser prohibits all types of headphones because the roads remain open to traffic." },
      { question: "Is there a bag drop?", answer: "No. The 2027 instructions specify that there is no bag-drop facility." },
      { question: "Will I get a medal?", answer: "Yes. The organiser lists a bespoke medal for finishers." },
      { question: "Can I transfer my entry?", answer: "The organiser permits transfers to another runner until midnight on 16 December 2026, but not refunds or deferrals." },
      { question: "Where can I find previous Wymondham 10K results?", answer: "AthRecs links recorded editions, athlete profiles and published results; the organiser and official timing provider also publish results. Not every historical edition is necessarily complete." }
    ],
    sources: [
      { label: "Official 2027 entry and race-day instructions", url: "https://totalracetiming.co.uk/race/713" },
      { label: "Wymondham AC race information and historic results", url: "https://www.wymondhamac.com/nyd10k" },
      { label: "2026 official club results", url: "https://www.wymondhamac.com/post/nyd-10k-2026-results" },
      { label: "2024 official club results and record", url: "https://www.wymondhamac.com/post/nyd-10k-2024-results" },
      { label: "2026 event report", url: "https://www.wymondhammagazine.co.uk/sport/new-years-day-10k-sees-record-turnout-of-689-runners" }
    ],
    caveat: "Entry availability, parking arrangements, the course and race-day instructions can change. Always check Wymondham AC and the official entry provider before travelling. No claim about an unverified men's course record is made."
  }
];

export function raceEditorialGuideFor(slug: string, editionDate?: string | null) {
  if (!editionDate) return undefined;
  return RACE_EDITORIAL_GUIDES.find((guide) => guide.slug === slug && guide.editionDate === editionDate);
}
