import sixthDuplicateReviews from "./fixture-duplicate-reviews-sixth-2026-10-26.json" with { type: "json" };
import fifthDuplicateReviews from "./fixture-duplicate-reviews-fifth-2026-10-26.json" with { type: "json" };
import duplicateReviews from "./fixture-duplicate-reviews-2026-10-26.json" with { type: "json" };
import secondDuplicateReviews from "./fixture-duplicate-reviews-second-2026-10-26.json" with { type: "json" };
import thirdDuplicateReviews from "./fixture-duplicate-reviews-third-2026-10-26.json" with { type: "json" };
import fourthDuplicateReviews from "./fixture-duplicate-reviews-fourth-2026-10-26.json" with { type: "json" };

/** Reviewed unsupported or duplicate dates stay in storage, outside public listings. */
export const FIXTURE_DATE_REVIEWS: Record<
  string,
  { sourceUrl: string; checkedAt: string; note: string }
> = {
  ...Object.fromEntries(
    [
      ...duplicateReviews,
      ...secondDuplicateReviews,
      ...thirdDuplicateReviews,
      ...fourthDuplicateReviews,
      ...fifthDuplicateReviews,
      ...sixthDuplicateReviews,
    ].map((review) => [
      `${review.duplicateSlug}|${review.date}`,
      {
        sourceUrl: review.sourceUrl,
        checkedAt: review.checkedAt,
        note: `Duplicate programme. Use /races/${review.canonicalSlug} for ${review.date}; all confirmed distances remain on that listing. Original records remain available for audit.`,
      },
    ]),
  ),
  "milano-city-marathon|2027-04-03": {
    sourceUrl: "https://www.milanomarathon.it/en/practical-info/",
    checkedAt: "2026-10-26",
    note: "The exact organiser programme confirms 2027-04-04. This prior-day record and its unsupported 23:00 start remain in storage for audit; the confirmed edition is retained.",
  },
  "prague-half-marathon|2027-04-02": {
    sourceUrl:
      "https://www.runczech.com/en/events/generali-prague-half-marathon-2027-2/races/generali-prague-half-marathon",
    checkedAt: "2026-10-26",
    note: "The exact organiser programme confirms 2027-04-03. This prior-day record and its unsupported 23:00 start remain in storage for audit; the confirmed edition is retained.",
  },
  "changsha-marathon|2026-10-25": {
    sourceUrl: "https://www.marathonchangsha.com/Detail/30",
    checkedAt: "2026-10-25",
    note: "The organiser’s current 2026 regulations and news confirm 15 November, with the event first gun at 07:00 CST (UTC+8). The older AIMS-based 25 October record is retained for audit only. Later wave clocks must be checked separately.",
  },
  "toulouse-metropole-run-experience|2026-10-31": {
    sourceUrl: "https://harmonie-mutuelle.toulouserunexperience.fr/marathon/",
    checkedAt: "2026-10-25",
    note: "The organiser confirms the 2026 marathon on 1 November, with starts from 08:00. The unsupported 31 October marathon duplicates the existing 1 November edition and is retained in storage for audit only.",
  },
  "wa-croatian-road-running-championships-7245412|2026-10-25": {
    sourceUrl:
      "https://has.hr/images/stories/HAS/servisi/raspisi26/20261031_Zapresic_PH_cestovna_trcanja_raspis.pdf",
    checkedAt: "2026-10-25",
    note: "The federation's 2026 championship bulletin confirms Saturday 31 October in Zaprešić. Use that existing date; this older 25 October record is retained for audit.",
  },
  "wa-serbian-cross-country-championships-7240001|2026-10-25": {
    sourceUrl: "https://serbia.opentrack.run/en-gb/x/2026/SRB/kros26/",
    checkedAt: "2026-10-25",
    note: "The Serbian federation's competition service confirms 24 October 2026 and publishes results. The existing 24 October edition is retained; this older 25 October record is not an additional race.",
  },
  "wa-4th-kokushikan-university-competition-7245266|2026-10-24": {
    sourceUrl:
      "https://kokushikan-trackfield.com/schedule/%E7%AC%AC4%E5%9B%9E%E5%9B%BD%E5%A3%AB%E8%88%98%E5%A4%A7%E5%AD%A6%E7%AB%B6%E6%8A%80%E4%BC%9A/",
    checkedAt: "2026-10-25",
    note: "The organiser's fourth-meeting page and regulations confirm 7–8 November 2026. The old October dates are retained for audit; start clocks for the November days remain unverified.",
  },
  "wa-4th-kokushikan-university-competition-7245266|2026-10-25": {
    sourceUrl:
      "https://kokushikan-trackfield.com/schedule/%E7%AC%AC4%E5%9B%9E%E5%9B%BD%E5%A3%AB%E8%88%98%E5%A4%A7%E5%AD%A6%E7%AB%B6%E6%8A%80%E4%BC%9A/",
    checkedAt: "2026-10-25",
    note: "The organiser's fourth-meeting page and regulations confirm 7–8 November 2026. The old October dates are retained for audit; start clocks for the November days remain unverified.",
  },
  "wa-privatbank-kyiv-unbroken-marathon-7237779|2026-10-10": {
    sourceUrl: "https://kyivmarathon.org/programa-zahodu/",
    checkedAt: "2026-10-25",
    note: "The current organiser programme and updated regulations move this event to 24–25 October 2026 in Khmelnytskyi. The older club-ranking subsection still contains 10–11 October; the explicit revised race-day programme takes precedence.",
  },
  "wa-privatbank-kyiv-unbroken-marathon-7237779|2026-10-11": {
    sourceUrl: "https://kyivmarathon.org/programa-zahodu/",
    checkedAt: "2026-10-25",
    note: "The current organiser programme and updated regulations move this event to 24–25 October 2026 in Khmelnytskyi. The older club-ranking subsection still contains 10–11 October; the explicit revised race-day programme takes precedence.",
  },
  "tirana-marathon|2026-10-25": {
    sourceUrl: "https://www.tiranamarathon.com/en",
    checkedAt: "2026-10-25",
    note: "The organiser postponed the weekend to 14–15 November 2026. The 10K, half marathon and marathon now start on 15 November at 09:00 CET. The former 25 October editions are retained for audit only.",
  },
  "cramond-promenade-5k-10k-half-marathon-october|2026-10-25": {
    sourceUrl: "https://www.upandrunningevents.co.uk/events",
    checkedAt: "2026-10-25",
    note: "Date conflict: the organiser calendar lists 1 November 2026, while its linked Let's Do This event 268358 still lists 25 October. Neither date is treated as confirmed until the discrepancy is resolved; the stored 10:00 10K start is preserved for audit.",
  },
  "x-ray-marathon|2026-10-25": {
    sourceUrl: "https://www.roentgenlauf.de/index.php/strecken-2/marathon-2",
    checkedAt: "2026-10-25",
    note: "Duplicate of the marathon in the Röntgenlauf event (roentgenlauf). The organiser confirms 25 October 2026 and a 09:30 CET marathon start at Clemenshammer. Use the existing Röntgenlauf edition; retain this directory record for audit.",
  },
  ...Object.fromEntries(
    [
      ["2027-01-17", "january"],
      ["2027-05-02", "may"],
      ["2027-10-17", "october"],
      ["2027-12-12", "december"],
    ].map(([date, month]) => [
      `run-heaton-park-half-marathon-march-2027|${date}`,
      {
        sourceUrl: `https://www.runthrough.co.uk/event/run-heaton-park-5k-10k-half-marathon-junior-race-${month}-2027`,
        checkedAt: "2026-10-23",
        note: "See the month-specific Heaton Park listing for this date; this page covers the March 2027 event.",
      },
    ]),
  ),
  "gear-10k-kings-lynn|2026-11-08": {
    sourceUrl: "https://www.runforall.com/events/10k/gear-10k/",
    checkedAt: "2026-10-20",
    note: "The old 8 November 2026 listing is unsupported. The organiser advertises 2 May 2027 at 09:30.",
  },
  "marriotts-way-10k|2026-11-01": {
    sourceUrl: "https://www.southnorfolkandbroadland.gov.uk/leisure/marriotts-way-10k",
    checkedAt: "2026-10-20",
    note: "The old 1 November 2026 listing is unsupported. The council advertises 19 September 2027, with starts from 10:00 to 10:40.",
  },
  "lingwood-duathlon|2027-03-21": {
    sourceUrl: "https://tri-anglia.club/races/lingwood-duathlon/",
    checkedAt: "2026-10-20",
    note: "The organiser says the 2027 date is TBC. The previously estimated 21 March date and 08:00 start have not been confirmed for that edition.",
  },
};
export const withheldFixtureDateKeys = Object.keys(FIXTURE_DATE_REVIEWS);
export const fixtureDateIsWithheld = (slug: string, date: string) =>
  !!FIXTURE_DATE_REVIEWS[`${slug}|${date}`];
