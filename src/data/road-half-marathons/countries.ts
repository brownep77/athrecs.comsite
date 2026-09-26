import type { MarathonCountryGuide } from "../road-marathons/types";

export const HALF_MARATHON_COUNTRIES: readonly MarathonCountryGuide[] = [
  {
    id: "uk",
    name: "United Kingdom",
    guide: "uk-half-marathons",
    countryCode: "GB",
    regionLabel: "County / area",
    description:
      "The UK’s road half marathons range from Newcastle’s mass start to Bath’s city streets and Belfast’s neighbourhoods. Compare 13.1-mile races across England, Scotland, Wales and Northern Ireland, with dates, entry routes, course information and previous results. Half the marathon distance still deserves a full training plan; the medal rarely checks how sensible your pacing was.",
  },
  {
    id: "ireland",
    name: "Ireland",
    guide: "ireland-half-marathons",
    countryCode: "IE",
    regionLabel: "County",
    description:
      "Ireland’s road half marathons offer city streets, coastal roads and plenty of reasons to look up from your watch. Compare 21.0975 km races in the Republic of Ireland by county, with official entry links, course guides and previous results. Dublin and Cork bring the city setting; Kerry supplies the scenery. Northern Ireland’s races sit in the UK guide.",
  },
  {
    id: "usa",
    name: "United States",
    guide: "usa-half-marathons",
    countryCode: "US",
    regionLabel: "State / district",
    description:
      "American road half marathons come with very different personalities, from Houston’s city streets to Boston’s rolling park roads. Compare 13.1-mile races by state, with announced dates, entry options, route details and official results. Check the half marathon’s own timetable when booking a race weekend: sharing a festival does not always mean sharing a start day.",
  },
  {
    id: "canada",
    name: "Canada",
    guide: "canada-half-marathons",
    countryCode: "CA",
    regionLabel: "Province",
    description:
      "Canada’s road half marathons offer waterfront kilometres, city landmarks and a useful choice of seasons. Compare races by province, from Vancouver and Victoria to Toronto and Ottawa, with dates, entry methods, courses and results. The distance is always 21.0975 km. How often you stop admiring the view to check your pace is rather more personal.",
  },
  {
    id: "australia",
    name: "Australia",
    guide: "australia-half-marathons",
    countryCode: "AU",
    regionLabel: "State / territory",
    description:
      "Australia’s road half marathons take in Sydney’s harbour views, Melbourne’s big-race atmosphere and coastal kilometres in Queensland. Compare 21.0975 km races by state or territory, with official dates, entry options, course maps and results. There is plenty of sightseeing on offer, although the kilometre markers still expect your attention.",
  },
  {
    id: "new-zealand",
    name: "New Zealand",
    guide: "new-zealand-half-marathons",
    countryCode: "NZ",
    regionLabel: "Region",
    description:
      "New Zealand’s road half marathons cover harbour crossings, capital-city streets and the flatter roads of Christchurch and Dunedin. Compare 21.0975 km races by region, with confirmed dates, entry links, course details and past results. A good view helps the kilometres along; it does not, sadly, do them for you.",
  },
  {
    id: "south-africa",
    name: "South Africa",
    guide: "south-africa-half-marathons",
    countryCode: "ZA",
    regionLabel: "Province",
    description:
      "South Africa’s road half marathons range from Cape Town’s established races to club events in Gauteng. Compare 21.0975 km races by province, with dates, entry methods, route information and results. Check each organiser’s licence and entry rules before booking. The early alarm is often part of the experience; a sensible first kilometre remains optional, but advisable.",
  },
];

export const halfMarathonCountry = (id: string) =>
  HALF_MARATHON_COUNTRIES.find((country) => country.id === id);
export const halfMarathonCountryFromPath = (guide: string) =>
  HALF_MARATHON_COUNTRIES.find((country) => country.guide === guide);
