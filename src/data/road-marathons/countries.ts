import type { MarathonCountryGuide } from "./types";

export const MARATHON_COUNTRIES: readonly MarathonCountryGuide[] = [
  {
    id: "uk",
    name: "United Kingdom",
    guide: "uk-marathons",
    countryCode: "GB",
    regionLabel: "County / area",
    description:
      "From London’s crowds to the roads beside Loch Ness, the UK offers plenty of ways to spend 26.2 miles. Compare road marathon dates, courses, entry options and recent field sizes across England, Scotland, Wales and Northern Ireland. A familiar name is a good starting point; the course profile deserves a look too.",
  },
  {
    id: "australia",
    name: "Australia",
    guide: "australia-marathons",
    countryCode: "AU",
    regionLabel: "State / territory",
    description:
      "Australia’s road marathons take in harbour crossings, coastal roads and inland towns. Find race dates, entry options, course maps and previous results, from Sydney and Melbourne to smaller fields elsewhere in the country. There is plenty to look at, although keeping an eye on the kilometre markers remains advisable.",
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    guide: "new-zealand-marathons",
    countryCode: "NZ",
    regionLabel: "Region",
    description:
      "New Zealand’s road marathons offer city streets, waterfront stretches and countryside courses across both main islands. Compare race dates, routes, entry options and previous results before choosing your 42.195 kilometres. The scenery may help with the harder miles; it is less likely to help with the pacing.",
  },
  {
    id: "usa",
    name: "United States",
    guide: "usa-marathons",
    countryCode: "US",
    regionLabel: "State / district",
    description:
      "US road marathons range from Boston and New York to smaller city races with quite different entry rules and course profiles. Find upcoming dates, routes, approximate runner numbers and previous results across the country. Some races demand a qualifying time, others a place in a drawing; all require the same 26.2 miles once you get there.",
  },
  {
    id: "canada",
    name: "Canada",
    guide: "canada-marathons",
    countryCode: "CA",
    regionLabel: "Province",
    description:
      "Canada’s road marathon calendar stretches from Pacific waterfronts to the streets of Quebec and beyond. Compare race dates, course profiles, entry options and previous results, with recent field sizes to help you judge the scale of each event. Pick the setting first, then give the hills their say.",
  },
  {
    id: "ireland",
    name: "Ireland",
    guide: "ireland-marathons",
    countryCode: "IE",
    regionLabel: "County",
    description:
      "Dublin draws the crowds, but Ireland’s road marathon choices extend to Cork, Limerick and smaller races around the country. Compare dates, routes, entry options and previous results for marathons in the Republic of Ireland. The distance stays at 26.2 miles; the surroundings do a fair bit of changing. Belfast is in our UK guide.",
  },
  {
    id: "south-africa",
    name: "South Africa",
    guide: "south-africa-marathons",
    countryCode: "ZA",
    regionLabel: "Province",
    description:
      "South Africa’s road marathons take in Cape Town’s coastline, Soweto’s streets and some fairly persuasive hills. Compare 42.195 km races by province, with confirmed dates, entry options, course guides, approximate fields and previous results. A downhill route may look generous on paper; your legs might offer a different review the following morning.",
  },
];

export const countryGuide = (id: string) => MARATHON_COUNTRIES.find((country) => country.id === id);
export const countryGuideFromPath = (guide: string) =>
  MARATHON_COUNTRIES.find((country) => country.guide === guide);
