/**
 * October 2026 batch B.
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

export const runrecsGapFillOctBSeries: Series[] = [
  { slug: "victoria-park-october", name: "Victoria Park Half Marathon 10K and 5K October", sport: "Running", country: "United Kingdom", county: "Greater London", city: "London", area: "Victoria Park", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Victoria Park Half Marathon 10K and 5K October in London.", description: "Victoria Park Half Marathon 10K and 5K October is Saturday 3 October 2026.", organiser: "Victoria Park October", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
  { slug: "hardwick-hobble-autumn", name: "The Hardwick Hobble Autumn", sport: "Running", country: "United Kingdom", county: "Derbyshire", city: "Chesterfield", area: "Hardwick", surface: "Trail", distances: ["10K"], summary: "The Hardwick Hobble Autumn in Chesterfield.", description: "The Hardwick Hobble Autumn is Saturday 3 October 2026.", organiser: "The Hardwick Hobble Autumn", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
  { slug: "hull-culture-run", name: "Hull Culture Run", sport: "Running", country: "United Kingdom", county: "East Yorkshire", city: "Hull", area: "Hull", surface: "Road", distances: ["10K"], summary: "Hull Culture Run in Hull.", description: "Hull Culture Run is Saturday 3 October 2026.", organiser: "Hull Culture Run", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
  { slug: "vina-del-mar-marathon", name: "Vina del Mar Marathon", sport: "Running", country: "Chile", county: "Valparaiso", city: "Vina del Mar", area: "Vina del Mar", surface: "Road", distances: ["Marathon", "Half"], summary: "Vina del Mar Marathon in Vina del Mar.", description: "Vina del Mar Marathon is Sunday 4 October 2026.", organiser: "Vina del Mar Marathon", website: "https://www.ahotu.com/calendar/running/half-marathon/october/south-america", featured: false, source_url: "https://www.ahotu.com/calendar/running/half-marathon/october/south-america" },
  { slug: "run-kent-october", name: "Run Kent Half Marathon 10K and 5K October", sport: "Running", country: "United Kingdom", county: "Kent", city: "Tonbridge", area: "Tonbridge", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Run Kent Half Marathon 10K and 5K October in Tonbridge.", description: "Run Kent Half Marathon 10K and 5K October is Sunday 4 October 2026.", organiser: "Run Kent", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
  { slug: "run-yorkshire-roundhay-october", name: "Run Yorkshire Roundhay October", sport: "Running", country: "United Kingdom", county: "West Yorkshire", city: "Leeds", area: "Roundhay Park", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Run Yorkshire Roundhay October in Leeds.", description: "Run Yorkshire Roundhay October is Sunday 4 October 2026.", organiser: "Run Yorkshire", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
  { slug: "long-view-marathon", name: "Long View Marathon", sport: "Running", country: "United States", county: "Colorado", city: "Fort Collins", area: "Edora Park", surface: "Road", distances: ["Marathon", "Half"], summary: "Long View Marathon in Fort Collins.", description: "Long View Marathon is Saturday 10 October 2026.", organiser: "Long View Marathon", website: "https://www.longviewmarathon.com/", featured: false, source_url: "https://www.longviewmarathon.com/" },
  { slug: "asics-ldnx-10k", name: "ASICS LDNX 10K", sport: "Running", country: "United Kingdom", county: "Greater London", city: "London", area: "Wembley", surface: "Road", distances: ["10K"], summary: "ASICS LDNX 10K in London.", description: "ASICS LDNX 10K is Sunday 11 October 2026.", organiser: "ASICS LDNX 10K", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
  { slug: "activepulse-chattogram-marathon", name: "ActivePulse Chattogram Marathon", sport: "Running", country: "Bangladesh", county: "Chattogram", city: "Chattogram", area: "Patenga Sea Beach", surface: "Road", distances: ["Marathon", "Half", "10K"], summary: "ActivePulse Chattogram Marathon in Chattogram.", description: "ActivePulse Chattogram Marathon is Friday 16 October 2026.", organiser: "ActivePulse", website: "https://activepulsebd.com/product/apcm2026/", featured: false, source_url: "https://activepulsebd.com/product/apcm2026/" },
  { slug: "reading-town-10k", name: "Reading Town 10K", sport: "Running", country: "United Kingdom", county: "Berkshire", city: "Reading", area: "Reading", surface: "Road", distances: ["10K"], summary: "Reading Town 10K in Reading.", description: "Reading Town 10K is Sunday 18 October 2026.", organiser: "Reading Town 10K", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
  { slug: "worthing-seafront-10k", name: "Worthing Seafront 10K", sport: "Running", country: "United Kingdom", county: "West Sussex", city: "Worthing", area: "Worthing Seafront", surface: "Road", distances: ["10K"], summary: "Worthing Seafront 10K in Worthing.", description: "Worthing Seafront 10K is Sunday 25 October 2026.", organiser: "Worthing Seafront 10K", website: "https://findarace.com/10k-runs/october", featured: false, source_url: "https://findarace.com/10k-runs/october" },
];

export const runrecsGapFillOctBEditions: Edition[] = [
  { seriesSlug: "victoria-park-october", date: "2026-10-03", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("victoria-park-octob", "Victoria Park Half Marathon 10K and 5K October", "https://findarace.com/10k-runs/october", "Calendar listing: Saturday 3 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "Half event." },
  { seriesSlug: "hardwick-hobble-autumn", date: "2026-10-03", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("hardwick-hobble-aut", "The Hardwick Hobble Autumn", "https://findarace.com/10k-runs/october", "Calendar listing: Saturday 3 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "10K event." },
  { seriesSlug: "hull-culture-run", date: "2026-10-03", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("hull-culture-run", "Hull Culture Run", "https://findarace.com/10k-runs/october", "Calendar listing: Saturday 3 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "10K event." },
  { seriesSlug: "vina-del-mar-marathon", date: "2026-10-04", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/calendar/running/half-marathon/october/south-america", entryOptions: officialEntry("vina-del-mar-marath", "Vina del Mar Marathon", "https://www.ahotu.com/calendar/running/half-marathon/october/south-america", "Calendar listing: Sunday 4 October 2026."), source: "https://www.ahotu.com/calendar/running/half-marathon/october/south-america", notes: "Marathon event." },
  { seriesSlug: "run-kent-october", date: "2026-10-04", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("run-kent-october", "Run Kent Half Marathon 10K and 5K October", "https://findarace.com/10k-runs/october", "Calendar listing: Sunday 4 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "Half event." },
  { seriesSlug: "run-yorkshire-roundhay-october", date: "2026-10-04", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("run-yorkshire-round", "Run Yorkshire Roundhay October", "https://findarace.com/10k-runs/october", "Calendar listing: Sunday 4 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "Half event." },
  { seriesSlug: "long-view-marathon", date: "2026-10-10", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.longviewmarathon.com/", entryOptions: officialEntry("long-view-marathon", "Long View Marathon", "https://www.longviewmarathon.com/", "Official site: Saturday 10 October 2026."), source: "https://www.longviewmarathon.com/", notes: "Marathon event." },
  { seriesSlug: "asics-ldnx-10k", date: "2026-10-11", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("asics-ldnx-10k", "ASICS LDNX 10K", "https://findarace.com/10k-runs/october", "Calendar listing: Sunday 11 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "10K event." },
  { seriesSlug: "activepulse-chattogram-marathon", date: "2026-10-16", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://activepulsebd.com/product/apcm2026/", entryOptions: officialEntry("activepulse-chattog", "ActivePulse Chattogram Marathon", "https://activepulsebd.com/product/apcm2026/", "Official site: Friday 16 October 2026."), source: "https://activepulsebd.com/product/apcm2026/", notes: "Marathon event." },
  { seriesSlug: "reading-town-10k", date: "2026-10-18", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("reading-town-10k", "Reading Town 10K", "https://findarace.com/10k-runs/october", "Calendar listing: Sunday 18 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "10K event." },
  { seriesSlug: "worthing-seafront-10k", date: "2026-10-25", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/10k-runs/october", entryOptions: officialEntry("worthing-seafront-1", "Worthing Seafront 10K", "https://findarace.com/10k-runs/october", "Calendar listing: Sunday 25 October 2026."), source: "https://findarace.com/10k-runs/october", notes: "10K event." },
];
