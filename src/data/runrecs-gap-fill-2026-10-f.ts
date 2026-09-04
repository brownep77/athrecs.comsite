/**
 * October 2026 batch F. Worldwide leftovers after earlier October sweeps.
 */
import type { Edition, Series } from "./types";

const CHECKED_AT = "2026-09-04";

function officialEntry(
  code: string,
  name: string,
  url: string,
  notes: string,
): Edition["entryOptions"] {
  return [
    {
      providerCode: code,
      providerName: name,
      entryUrl: url,
      entryType: "official",
      status: "open",
      checkedAt: CHECKED_AT,
      sourceUrl: url,
      notes,
    },
  ];
}

export const runrecsGapFillOctFSeries: Series[] = [
  { slug: "blouberg-marathon", name: "Intercare Blouberg Marathon", sport: "Running", country: "South Africa", county: "Western Cape", city: "Cape Town", area: "Blouberg", surface: "Road", distances: ["Marathon"], summary: "Intercare Blouberg Marathon in Cape Town.", description: "Intercare Blouberg Marathon is Saturday 3 October 2026.", organiser: "Intercare Blouberg Marathon", website: "https://www.ahotu.com/calendar/running/marathon/october/africa", featured: false, source_url: "https://www.ahotu.com/calendar/running/marathon/october/africa" },
  { slug: "beer-city-half-fort-worth", name: "Beer City Half Fort Worth", sport: "Running", country: "United States", county: "Texas", city: "Fort Worth", area: "Panther Island Pavilion", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Beer City Half Fort Worth in Fort Worth.", description: "Beer City Half Fort Worth is Saturday 10 October 2026.", organiser: "Beer City Half Fort Worth", website: "https://runsignup.com/Race/TX/FortWorth/BeerCityHalfFortWorth", featured: false, source_url: "https://runsignup.com/Race/TX/FortWorth/BeerCityHalfFortWorth" },
  { slug: "autumn-challenge-exmouth", name: "Autumn Challenge Exmouth", sport: "Running", country: "United Kingdom", county: "Devon", city: "Exmouth", area: "Exmouth", surface: "Trail", distances: ["Half"], summary: "Autumn Challenge Exmouth in Exmouth.", description: "Autumn Challenge Exmouth is Sunday 11 October 2026.", organiser: "Autumn Challenge", website: "https://findarace.com/half-marathons/october/p2", featured: false, source_url: "https://findarace.com/half-marathons/october/p2" },
  { slug: "scare-bear-durham", name: "Scare Bear Run North", sport: "Running", country: "United Kingdom", county: "County Durham", city: "Durham", area: "Durham", surface: "Trail", distances: ["Half", "10K"], summary: "Scare Bear Run North in Durham.", description: "Scare Bear Run North is Sunday 11 October 2026.", organiser: "Scare Bear Run", website: "https://findarace.com/half-marathons/october/p2", featured: false, source_url: "https://findarace.com/half-marathons/october/p2" },
  { slug: "maple-city-half", name: "Maple City Half Marathon", sport: "Running", country: "United States", county: "Ohio", city: "Norwalk", area: "Norwalk", surface: "Road", distances: ["Half", "5K"], summary: "Maple City Half Marathon in Norwalk.", description: "Maple City Half Marathon is Sunday 11 October 2026.", organiser: "Norwalk Area United Fund", website: "https://runsignup.com/Race/OH/Norwalk/MapleCityHalfMarathon", featured: false, source_url: "https://runsignup.com/Race/OH/Norwalk/MapleCityHalfMarathon" },
  { slug: "lee-valley-october", name: "Lee Valley VeloPark October", sport: "Running", country: "United Kingdom", county: "Greater London", city: "London", area: "Lee Valley VeloPark", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Lee Valley VeloPark October in London.", description: "Lee Valley VeloPark October is Saturday 17 October 2026.", organiser: "RunThrough", website: "https://findarace.com/half-marathons/october/p2", featured: false, source_url: "https://findarace.com/half-marathons/october/p2" },
  { slug: "king-sneferu-pyramids", name: "King Sneferu Pyramids Challenge", sport: "Running", country: "Egypt", county: "Giza", city: "Dahshur", area: "Dahshur", surface: "Road", distances: ["10K", "5K"], summary: "King Sneferu Pyramids Challenge in Dahshur.", description: "King Sneferu Pyramids Challenge is Friday 23 October 2026.", organiser: "Egyptian Marathon", website: "https://www.egyptianmarathon.com/", featured: false, source_url: "https://www.egyptianmarathon.com/" },
  { slug: "jacaranda-city-challenge", name: "aQuelle Jacaranda City Challenge", sport: "Running", country: "South Africa", county: "Gauteng", city: "Pretoria", area: "Rietondale", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "aQuelle Jacaranda City Challenge in Pretoria.", description: "aQuelle Jacaranda City Challenge is Saturday 24 October 2026.", organiser: "Jacaranda City Challenge", website: "https://runningcalendar.co.za/events/jacaranda-city-challenge", featured: false, source_url: "https://runningcalendar.co.za/events/jacaranda-city-challenge" },
];

export const runrecsGapFillOctFEditions: Edition[] = [
  { seriesSlug: "blouberg-marathon", date: "2026-10-03", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/calendar/running/marathon/october/africa", entryOptions: officialEntry("blouberg-marathon", "Intercare Blouberg Marathon", "https://www.ahotu.com/calendar/running/marathon/october/africa", "Calendar listing: Saturday 3 October 2026."), source: "https://www.ahotu.com/calendar/running/marathon/october/africa", notes: "Marathon event." },
  { seriesSlug: "beer-city-half-fort-worth", date: "2026-10-10", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://runsignup.com/Race/TX/FortWorth/BeerCityHalfFortWorth", entryOptions: officialEntry("beer-city-half-fort", "Beer City Half Fort Worth", "https://runsignup.com/Race/TX/FortWorth/BeerCityHalfFortWorth", "Official listing: Saturday 10 October 2026."), source: "https://runsignup.com/Race/TX/FortWorth/BeerCityHalfFortWorth", notes: "Half event." },
  { seriesSlug: "autumn-challenge-exmouth", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/half-marathons/october/p2", entryOptions: officialEntry("autumn-challenge-ex", "Autumn Challenge Exmouth", "https://findarace.com/half-marathons/october/p2", "Calendar listing: Sunday 11 October 2026."), source: "https://findarace.com/half-marathons/october/p2", notes: "Half event." },
  { seriesSlug: "scare-bear-durham", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/half-marathons/october/p2", entryOptions: officialEntry("scare-bear-durham", "Scare Bear Run North", "https://findarace.com/half-marathons/october/p2", "Calendar listing: Sunday 11 October 2026."), source: "https://findarace.com/half-marathons/october/p2", notes: "Half event." },
  { seriesSlug: "maple-city-half", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://runsignup.com/Race/OH/Norwalk/MapleCityHalfMarathon", entryOptions: officialEntry("maple-city-half", "Maple City Half Marathon", "https://runsignup.com/Race/OH/Norwalk/MapleCityHalfMarathon", "Official listing: Sunday 11 October 2026."), source: "https://runsignup.com/Race/OH/Norwalk/MapleCityHalfMarathon", notes: "Half event." },
  { seriesSlug: "lee-valley-october", date: "2026-10-17", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/half-marathons/october/p2", entryOptions: officialEntry("lee-valley-october", "Lee Valley VeloPark October", "https://findarace.com/half-marathons/october/p2", "Calendar listing: Saturday 17 October 2026."), source: "https://findarace.com/half-marathons/october/p2", notes: "Half event." },
  { seriesSlug: "king-sneferu-pyramids", date: "2026-10-23", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.egyptianmarathon.com/", entryOptions: officialEntry("king-sneferu-pyrami", "King Sneferu Pyramids Challenge", "https://www.egyptianmarathon.com/", "Official site: Friday 23 October 2026."), source: "https://www.egyptianmarathon.com/", notes: "10K event." },
  { seriesSlug: "jacaranda-city-challenge", date: "2026-10-24", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://runningcalendar.co.za/events/jacaranda-city-challenge", entryOptions: officialEntry("jacaranda-city-chal", "aQuelle Jacaranda City Challenge", "https://runningcalendar.co.za/events/jacaranda-city-challenge", "Official listing: Saturday 24 October 2026."), source: "https://runningcalendar.co.za/events/jacaranda-city-challenge", notes: "Marathon event." },
];
