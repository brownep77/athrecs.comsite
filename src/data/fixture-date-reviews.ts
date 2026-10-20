/** Reviewed unsupported dates are retained in storage, but never advertised as upcoming. */
export const FIXTURE_DATE_REVIEWS: Record<
  string,
  { sourceUrl: string; checkedAt: string; note: string }
> = {
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
