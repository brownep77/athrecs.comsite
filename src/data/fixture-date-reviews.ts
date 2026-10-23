/** Reviewed unsupported or duplicate dates stay in storage, outside public listings. */
export const FIXTURE_DATE_REVIEWS: Record<
  string,
  { sourceUrl: string; checkedAt: string; note: string }
> = {
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
        note: "This occurrence belongs to its separate month-specific Heaton Park listing. The duplicate attached to the March page is retained only in storage.",
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
