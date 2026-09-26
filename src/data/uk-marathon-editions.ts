import type { MarathonEdition } from "@/lib/running/marathon-calendar";

/** Exact full-marathon dates from opened official organiser/entry pages; never recurrence estimates. */
export const UK_MARATHON_EDITIONS: readonly MarathonEdition[] = [
  {
    raceId: "london",
    startDate: "2027-04-24",
    endDate: "2027-04-25",
    sourceUrl:
      "https://www.londonmarathonevents.co.uk/london-marathon/2027-tcs-london-marathon-double-faqs",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "manchester",
    startDate: "2027-04-18",
    sourceUrl: "https://www.manchestermarathon.co.uk/event-info/about-event/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "brighton",
    startDate: "2027-04-04",
    sourceUrl: "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-marathon",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "edinburgh",
    startDate: "2027-05-30",
    sourceUrl: "https://www.edinburghmarathon.com/marathon",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "belfast",
    startDate: "2027-05-02",
    sourceUrl: "https://belfastcitymarathon.com/events/2027-phoenix-energy-belfast-city-marathon",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "chester",
    startDate: "2026-10-11",
    sourceUrl: "https://ale.niftyentries.com/2026-MBNA-Chester-Marathon",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "yorkshire",
    startDate: "2026-10-18",
    sourceUrl: "https://www.runforall.com/events/marathon/yorkshire-marathon/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "yorkshire",
    startDate: "2027-10-17",
    sourceUrl: "https://www.runforall.com/events/season-tickets/yorkshire-double-season-ticket/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "milton-keynes",
    startDate: "2027-05-03",
    sourceUrl: "https://mkmarathon.com/mk-marathon/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "southampton",
    startDate: "2027-04-11",
    sourceUrl: "https://www.southamptonmarathon.co.uk/abp-southampton-marathon-festival",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "loch-ness",
    startDate: "2026-09-27",
    sourceUrl: "https://www.lochnessmarathon.com/event/loch-ness-marathon/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "loch-ness",
    startDate: "2027-09-26",
    sourceUrl: "https://www.lochnessmarathon.com/event/loch-ness-marathon/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "abingdon",
    startDate: "2026-10-18",
    sourceUrl: "https://www.abingdonmarathon.org.uk/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "windermere",
    startDate: "2027-06-13",
    sourceUrl: "https://www.windermeremarathon.co.uk/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "boston-uk",
    startDate: "2027-04-11",
    sourceUrl: "https://www.bostonmarathon.co.uk/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "leeds",
    startDate: "2027-05-09",
    sourceUrl: "https://www.runforall.com/events/marathon/leeds-marathon/",
    checkedAt: "2026-09-26",
  },
  {
    raceId: "newport",
    startDate: "2027-04-18",
    sourceUrl: "https://newportwalesmarathon.co.uk/register-marathon/",
    checkedAt: "2026-09-26",
  },
];

/** No confirmed 2027 date was found in official sources at the review date. */
export const UK_MARATHON_UNCONFIRMED_2027 = ["chester", "abingdon"] as const;
