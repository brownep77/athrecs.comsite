/**
 * October 2026 batch C.
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

export const runrecsGapFillOctCSeries: Series[] = [
  { slug: "jackass-half-marathon", name: "Jackass Half Marathon", sport: "Running", country: "United States", county: "Idaho", city: "Kellogg", area: "Trail of the Coeur d Alenes", surface: "Road", distances: ["Half", "5K"], summary: "Jackass Half Marathon in Kellogg.", description: "Jackass Half Marathon is Saturday 3 October 2026.", organiser: "Silver Valley Chamber", website: "https://raceroster.com/events/2026/114442/2026-jackass-half-marathon-and-5k", featured: false, source_url: "https://raceroster.com/events/2026/114442/2026-jackass-half-marathon-and-5k" },
  { slug: "greenwich-park-october", name: "Greenwich Park 5K and 10K October", sport: "Running", country: "United Kingdom", county: "Greater London", city: "London", area: "Greenwich Park", surface: "Road", distances: ["10K", "5K"], summary: "Greenwich Park 5K and 10K October in London.", description: "Greenwich Park 5K and 10K October is Monday 5 October 2026.", organiser: "RunThrough", website: "https://www.runthrough.co.uk/", featured: false, source_url: "https://www.runthrough.co.uk/" },
  { slug: "tatton-park-october", name: "Tatton Park 5K and 10K October", sport: "Running", country: "United Kingdom", county: "Cheshire", city: "Knutsford", area: "Tatton Park", surface: "Road", distances: ["10K", "5K"], summary: "Tatton Park 5K and 10K October in Knutsford.", description: "Tatton Park 5K and 10K October is Monday 5 October 2026.", organiser: "RunThrough", website: "https://www.runthrough.co.uk/", featured: false, source_url: "https://www.runthrough.co.uk/" },
  { slug: "newcastle-town-moor-october", name: "Newcastle Town Moor Half Marathon October", sport: "Running", country: "United Kingdom", county: "Tyne and Wear", city: "Newcastle upon Tyne", area: "Town Moor", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Newcastle Town Moor Half Marathon October in Newcastle upon Tyne.", description: "Newcastle Town Moor Half Marathon October is Sunday 11 October 2026.", organiser: "Newcastle Town Moor October", website: "https://www.letsdothis.com/gb/running-events/half-marathon/october", featured: false, source_url: "https://www.letsdothis.com/gb/running-events/half-marathon/october" },
  { slug: "heaton-park-october", name: "Heaton Park Half Marathon October", sport: "Running", country: "United Kingdom", county: "Greater Manchester", city: "Manchester", area: "Heaton Park", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Heaton Park Half Marathon October in Manchester.", description: "Heaton Park Half Marathon October is Sunday 11 October 2026.", organiser: "Run Heaton", website: "https://www.runheaton.com/", featured: false, source_url: "https://www.runheaton.com/" },
  { slug: "mission-inn-run", name: "Mission Inn Run", sport: "Running", country: "United States", county: "California", city: "Riverside", area: "Mission Inn", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Mission Inn Run in Riverside.", description: "Mission Inn Run is Sunday 18 October 2026.", organiser: "Mission Inn Foundation", website: "https://www.missioninnrun.org/", featured: false, source_url: "https://www.missioninnrun.org/" },
  { slug: "runthrough-long-beach-october", name: "Long Beach 5K 10K and Half Marathon October", sport: "Running", country: "United States", county: "California", city: "Long Beach", area: "Aquatic Park", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Long Beach 5K 10K and Half Marathon October in Long Beach.", description: "Long Beach 5K 10K and Half Marathon October is Saturday 24 October 2026.", organiser: "RunThrough USA", website: "https://runthroughusa.com/la-october-2026", featured: false, source_url: "https://runthroughusa.com/la-october-2026" },
  { slug: "santa-cruz-marathon", name: "Santa Cruz Marathon", sport: "Running", country: "United States", county: "California", city: "Santa Cruz", area: "Santa Cruz", surface: "Road", distances: ["Marathon", "Half"], summary: "Santa Cruz Marathon in Santa Cruz.", description: "Santa Cruz Marathon is Sunday 25 October 2026.", organiser: "Santa Cruz Marathon", website: "https://www.goldenstatechallenge.com/race-calendar", featured: false, source_url: "https://www.goldenstatechallenge.com/race-calendar" },
];

export const runrecsGapFillOctCEditions: Edition[] = [
  { seriesSlug: "jackass-half-marathon", date: "2026-10-03", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://raceroster.com/events/2026/114442/2026-jackass-half-marathon-and-5k", entryOptions: officialEntry("jackass-half-marath", "Jackass Half Marathon", "https://raceroster.com/events/2026/114442/2026-jackass-half-marathon-and-5k", "Official listing: Saturday 3 October 2026."), source: "https://raceroster.com/events/2026/114442/2026-jackass-half-marathon-and-5k", notes: "Half event." },
  { seriesSlug: "greenwich-park-october", date: "2026-10-05", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.runthrough.co.uk/", entryOptions: officialEntry("greenwich-park-octo", "Greenwich Park 5K and 10K October", "https://www.runthrough.co.uk/", "Calendar listing: Monday 5 October 2026."), source: "https://www.runthrough.co.uk/", notes: "10K event." },
  { seriesSlug: "tatton-park-october", date: "2026-10-05", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.runthrough.co.uk/", entryOptions: officialEntry("tatton-park-october", "Tatton Park 5K and 10K October", "https://www.runthrough.co.uk/", "Calendar listing: Monday 5 October 2026."), source: "https://www.runthrough.co.uk/", notes: "10K event." },
  { seriesSlug: "newcastle-town-moor-october", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.letsdothis.com/gb/running-events/half-marathon/october", entryOptions: officialEntry("newcastle-town-moor", "Newcastle Town Moor Half Marathon October", "https://www.letsdothis.com/gb/running-events/half-marathon/october", "Calendar listing: Sunday 11 October 2026."), source: "https://www.letsdothis.com/gb/running-events/half-marathon/october", notes: "Half event." },
  { seriesSlug: "heaton-park-october", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runheaton.com/", entryOptions: officialEntry("heaton-park-october", "Heaton Park Half Marathon October", "https://www.runheaton.com/", "Official site: Sunday 11 October 2026."), source: "https://www.runheaton.com/", notes: "Half event." },
  { seriesSlug: "mission-inn-run", date: "2026-10-18", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.missioninnrun.org/", entryOptions: officialEntry("mission-inn-run", "Mission Inn Run", "https://www.missioninnrun.org/", "Official site: Sunday 18 October 2026."), source: "https://www.missioninnrun.org/", notes: "Half event." },
  { seriesSlug: "runthrough-long-beach-october", date: "2026-10-24", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://runthroughusa.com/la-october-2026", entryOptions: officialEntry("runthrough-long-bea", "Long Beach 5K 10K and Half Marathon October", "https://runthroughusa.com/la-october-2026", "Official listing: Saturday 24 October 2026."), source: "https://runthroughusa.com/la-october-2026", notes: "Half event." },
  { seriesSlug: "santa-cruz-marathon", date: "2026-10-25", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.goldenstatechallenge.com/race-calendar", entryOptions: officialEntry("santa-cruz-marathon", "Santa Cruz Marathon", "https://www.goldenstatechallenge.com/race-calendar", "Calendar listing: Sunday 25 October 2026."), source: "https://www.goldenstatechallenge.com/race-calendar", notes: "Marathon event." },
];
