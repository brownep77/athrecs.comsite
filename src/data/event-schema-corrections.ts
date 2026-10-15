/** Bounded additions to existing records, researched 15 October 2026.
 * These imported events are not part of the static seed catalogue. Do not
 * recreate them or derive new dates if the reviewed records no longer match.
 */
const beaconsSource = "https://www.sientries.co.uk/event/beacons-ultra-marathon-and-half-2026-2026";
const mothersDaySource = "https://runsignup.com/Race/FL/Clermont/OrlandoMothersDay5K";

export const eventSchemaCorrections = [
  {
    slug: "beacons-trail-marathon-half-marathon-ultra",
    expectedWebsite: "https://runabc.co.uk/beacons-trail-marathon",
    organiser: "Andali Events",
    website: "https://www.andalievents.com/",
    sourceUrl: beaconsSource,
    note: "Source review 15 October 2026: Andali Events identifies Beacons as its event at https://www.andalievents.com/. Its official SiEntries programme confirms 7 November 2026, Half £40 and Marathon £60, entries open 1 December 2025 and close 1 November 2026. SiEntries terms (https://www.sientries.co.uk/terms.php) identify its booking fee as part of the total entry fee. The FAQ at https://www.andalievents.com/events/beacons/beacons-faq gives Half start 09:30 and Marathon start 08:30. The suggested half-marathon finish is not a firm end time and is not used as endDate.",
    editions: [
      {
        date: "2026-11-07",
        distance: "Half",
        expectedStart: null,
        expectedStatus: "TBC",
        startTime: "09:30",
        price: 40,
      },
      {
        date: "2026-11-07",
        distance: "Marathon",
        expectedStart: null,
        expectedStatus: "TBC",
        startTime: "08:30",
        price: 60,
      },
    ],
  },
  {
    slug: "dream-finders-homes-mother-s-day-5k",
    expectedWebsite: mothersDaySource,
    organiser: "Florida Running Company",
    website: "https://www.floridarunningco.com/",
    sourceUrl: mothersDaySource,
    note: "Source review 15 October 2026: Florida Running Company explicitly lists Mother's Day 5K among the events it hosts at https://www.floridarunningco.com/. Its linked RunSignup programme gives 9 May 2027, 07:30–10:00 EDT for the 5K. Store the local end time without manufacturing a timezone or a sale-opening date. The advertised $35 price has not been established as inclusive of all mandatory fees, so no priced Offer is added.",
    editions: [
      {
        date: "2027-05-09",
        distance: "5K",
        expectedStart: "07:30",
        expectedStatus: "Open",
        endDate: "2027-05-09",
        endTime: "10:00",
        endSourceUrl: mothersDaySource,
        endCheckedAt: "2026-10-15",
      },
    ],
  },
];
