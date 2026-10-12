/** Official entry pages inspected on 12 October 2026. No inferred opening dates. */
export const eventOfferCorrections = [
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
];
