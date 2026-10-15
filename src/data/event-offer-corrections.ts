/** Official entry pages inspected on 12 October 2026. No inferred opening dates. */
export const eventOfferCorrections = [
  {
    key: "newcastle-town-moor-half-marathon-march-2027|2027-03-21|Half",
    providerCode: "official-runthrough",
    previousStatus: "open",
    sourceUrl:
      "https://www.runthrough.co.uk/event/runthrough-town-moor-exhibition-park-5k-10k-march-2027",
    patch: {
      priceAmount: 35.7,
      checkedAt: "2026-10-15",
      notes:
        "Official RunThrough page checked 15 October 2026: Half Marathon £34 plus mandatory 5% booking fee, £35.70 total. No sale-opening date is stated; leave opensAt empty. Preserve the original £34 in the publication snapshot.",
    },
  },
  {
    key: "abingdon-marathon|2026-10-18|Marathon",
    providerCode: "official",
    previousStatus: "waitlist",
    sourceUrl: "https://www.abingdonmarathon.org.uk/enter-the-race",
    patch: {
      status: "sold_out" as const,
      providerName: "Abingdon Marathon official entry and waiting list",
      checkedAt: "2026-10-12",
      notes:
        "The organiser explicitly confirms the 2026 race is sold out, with a waiting list. Transfers are closed. The general mid-February opening pattern is not an exact 2026 sale-start date.",
    },
  },
  {
    key: "the-dramathon|2026-10-17|10K",
    providerCode: "entrycentral-wee-dram-2026",
    previousStatus: "closed",
    sourceUrl: "https://www.entrycentral.com/thedramathon",
    patch: {
      opensAt: "2026-01-03",
      checkedAt: "2026-10-12",
      notes:
        "The organiser's EntryCentral listing gives entry opening as 3 January 2026 at 18:00 GMT. The DATE field preserves the day; this note preserves the published time. The Wee Dram is closed; this is not evidence of a sell-out or a currently purchasable place.",
    },
  },
  {
    key: "burnsall-trail-half-2027|2027-04-17|Half",
    providerCode: "official-burnsall-trail-half-2027",
    previousStatus: "open",
    sourceUrl: "https://www.sientries.co.uk/event/burnsall-trail-half-2027",
    patch: {
      opensAt: "2026-09-05",
      checkedAt: "2026-10-12",
      notes:
        "Opening date rechecked on 12 October 2026 against the official SiEntries listing for the 17 April 2027 Burnsall Trail Half: https://www.sientries.co.uk/event.php?elid=Y&event_id=18202. It explicitly gives 5 September 2026; no opening time is supplied. Preserve the existing price and availability.",
    },
  },
  {
    key: "kettlewell-trail-half-2027|2027-06-19|Half",
    providerCode: "official-kettlewell-trail-half-2027",
    previousStatus: "open",
    sourceUrl: "https://www.sientries.co.uk/event/kettlewell-trail-half-2027",
    patch: {
      opensAt: "2026-09-05",
      checkedAt: "2026-10-12",
      notes:
        "Opening date rechecked on 12 October 2026 against the official SiEntries listing for the 19 June 2027 Kettlewell Trail Half. It explicitly gives 5 September 2026; no opening time is supplied. Preserve the existing price and availability.",
    },
  },
  {
    key: "malham-half-marathon|2027-09-04|Half",
    providerCode: "official-malham-half-marathon-2027-09-04",
    previousStatus: "open",
    sourceUrl: "https://www.sientries.co.uk/event/malham-trail-half-2027",
    patch: {
      opensAt: "2026-09-05",
      checkedAt: "2026-10-12",
      notes:
        "Opening date rechecked on 12 October 2026 against the official SiEntries listing for the 4 September 2027 Malham Trail Half. It explicitly gives 5 September 2026 at 12:00; the DATE field retains the day and this note retains the published time without inventing a timezone. Preserve the existing price and availability.",
    },
  },
];
