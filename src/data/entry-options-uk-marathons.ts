import type { EntryOptionSeed } from "./types";

/**
 * Verified UK marathon entry routes.
 *
 * A provider is included only when the exact destination was checked and the
 * page offered a live entry route. Listing-only and "Notify me" aggregator
 * pages are deliberately excluded.
 */
export const ukMarathonEntryOptions: Record<string, EntryOptionSeed[]> = {
  "london-marathon|2027-04-24|Marathon": [
    {
      providerCode: "official-charity",
      providerName: "London Marathon charity places",
      entryUrl: "https://www.londonmarathonevents.co.uk/london-marathon/run-charity",
      entryType: "charity",
      status: "open",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl: "https://www.londonmarathonevents.co.uk/ballot",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "official-ballot",
      providerName: "TCS London Marathon ballot",
      entryUrl: "https://www.londonmarathonevents.co.uk/ballot",
      entryType: "official",
      status: "closed",
      closesAt: "2026-05-01T16:00:00+01:00",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl: "https://www.londonmarathonevents.co.uk/ballot",
      isVerified: true,
    },
  ],
  "brighton-marathon|2027-04-04|Marathon": [
    {
      providerCode: "official",
      providerName: "Let's Do This (official Brighton entry)",
      entryUrl:
        "https://www.letsdothis.com/gb/o/29443/checkout/ticket?eventId=244393&occurrenceId=21111174386&preferred=true&utm_campaign=general-ticket-selection&utm_medium=organic&utm_organiser_id=29443&utm_source=website",
      entryType: "official",
      status: "open",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl:
        "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-marathon",
      isVerified: true,
      isPrimary: true,
    },
  ],
  "edinburgh-marathon|2027-05-30|Marathon": [
    {
      providerCode: "official",
      providerName: "Edinburgh Marathon official entry",
      entryUrl: "https://www.edinburghmarathon.com/marathon",
      entryType: "official",
      status: "open",
      priceAmount: 84.5,
      priceCurrency: "GBP",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl: "https://www.edinburghmarathon.com/marathon/event-information",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "official-charities",
      providerName: "Edinburgh Marathon charities",
      entryUrl: "https://www.edinburghmarathon.com/charities/marathon",
      entryType: "charity",
      status: "open",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl: "https://www.edinburghmarathon.com/charities/marathon",
      isVerified: true,
    },
  ],
  "belfast-marathon|2027-05-02|Marathon": [
    {
      providerCode: "official",
      providerName: "Eventmaster (official Belfast entry)",
      entryUrl: "https://eventmaster.ie/event/32wxfx4tZW",
      entryType: "official",
      status: "open",
      priceAmount: 73,
      priceCurrency: "GBP",
      closesAt: "2027-04-16T00:15:00+01:00",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl: "https://belfastcitymarathon.com/events/2027-phoenix-energy-belfast-city-marathon",
      isVerified: true,
      isPrimary: true,
    },
  ],
  "loch-ness-marathon|2026-09-27|Marathon": [
    {
      providerCode: "official-charity",
      providerName: "Loch Ness Marathon charity places",
      entryUrl: "https://lochnessmarathon.com/run-for-charity/",
      entryType: "charity",
      status: "open",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl: "https://lochnessmarathon.com/event/loch-ness-marathon/",
      isVerified: true,
      isPrimary: true,
    },
    {
      providerCode: "official-general",
      providerName: "Loch Ness Marathon general entry",
      entryUrl: "https://lochnessmarathon.com/event/loch-ness-marathon/",
      entryType: "official",
      status: "sold_out",
      checkedAt: "2026-08-17T18:00:00+01:00",
      sourceUrl: "https://lochnessmarathon.com/event/loch-ness-marathon/",
      isVerified: true,
    },
  ],
};
