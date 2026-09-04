/**
 * September 2026 batch E. Distinct slugs and town+date pairs.
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

export const runrecsGapFillESeries: Series[] = [
  { slug: "basingstoke-summer-festival", name: "Basingstoke Summer Running Festival", sport: "Running", country: "United Kingdom", county: "Hampshire", city: "Basingstoke", area: "Basingstoke", surface: "Road", distances: ["10K", "5K"], summary: "Basingstoke Summer Running Festival in Basingstoke.", description: "Basingstoke Summer Running Festival is Thursday 10 September 2026.", organiser: "Basingstoke Summer Running Festival", website: "https://findarace.com/trail-runs/september", featured: false, source_url: "https://findarace.com/trail-runs/september" },
  { slug: "lulworth-cove-trails", name: "Lulworth Cove Trails", sport: "Running", country: "United Kingdom", county: "Dorset", city: "Wareham", area: "Lulworth Cove", surface: "Trail", distances: ["10K", "27K", "50K"], summary: "Lulworth Cove Trails in Wareham.", description: "Lulworth Cove Trails is Saturday 12 September 2026.", organiser: "RunThrough", website: "https://www.runthrough.co.uk/event/lulworth-cove-trails-september-2026", featured: false, source_url: "https://www.runthrough.co.uk/event/lulworth-cove-trails-september-2026" },
  { slug: "dartmoor-volcano-race", name: "Dartmoor Volcano Race", sport: "Running", country: "United Kingdom", county: "Devon", city: "Buckfastleigh", area: "Dartmoor", surface: "Trail", distances: ["Half"], summary: "Dartmoor Volcano Race in Buckfastleigh.", description: "Dartmoor Volcano Race is Saturday 12 September 2026.", organiser: "Dartmoor Volcano Race", website: "https://findarace.com/trail-runs/september", featured: false, source_url: "https://findarace.com/trail-runs/september" },
  { slug: "flying-scotsman-milton-keynes", name: "Flying Scotsman Marathons Milton Keynes", sport: "Running", country: "United Kingdom", county: "Buckinghamshire", city: "Milton Keynes", area: "Milton Keynes", surface: "Road", distances: ["Marathon", "Half"], summary: "Flying Scotsman Marathons Milton Keynes in Milton Keynes.", description: "Flying Scotsman Marathons Milton Keynes is Saturday 12 September 2026.", organiser: "Flying Scotsman Marathons", website: "https://findarace.com/trail-runs/september", featured: false, source_url: "https://findarace.com/trail-runs/september" },
  { slug: "defeat-delamere", name: "Defeat Delamere", sport: "Running", country: "United Kingdom", county: "Cheshire", city: "Northwich", area: "Delamere Forest", surface: "Trail", distances: ["10K", "5K"], summary: "Defeat Delamere in Northwich.", description: "Defeat Delamere is Sunday 13 September 2026.", organiser: "Roy Castle Lung Cancer Foundation", website: "https://roycastle.org/event/defeat-delamere/", featured: false, source_url: "https://roycastle.org/event/defeat-delamere/" },
  { slug: "holdenby-trailfest", name: "TrailFest Holdenby House", sport: "Running", country: "United Kingdom", county: "Northamptonshire", city: "Holdenby", area: "Holdenby House", surface: "Trail", distances: ["10K", "5K"], summary: "TrailFest Holdenby House in Holdenby.", description: "TrailFest Holdenby House is Sunday 13 September 2026.", organiser: "TrailFest Holdenby House", website: "https://findarace.com/trail-runs/september", featured: false, source_url: "https://findarace.com/trail-runs/september" },
  { slug: "breaking-the-laws-30k", name: "Breaking The Laws 30K", sport: "Running", country: "United Kingdom", county: "East Lothian", city: "North Berwick", area: "North Berwick", surface: "Trail", distances: ["30K"], summary: "Breaking The Laws 30K in North Berwick.", description: "Breaking The Laws 30K is Sunday 13 September 2026.", organiser: "Breaking The Laws 30K", website: "https://findarace.com/trail-runs/september", featured: false, source_url: "https://findarace.com/trail-runs/september" },
  { slug: "city-v-wharf", name: "The City v Wharf Run Challenge", sport: "Running", country: "United Kingdom", county: "Greater London", city: "London", area: "City of London", surface: "Road", distances: ["10K"], summary: "The City v Wharf Run Challenge in London.", description: "The City v Wharf Run Challenge is Thursday 17 September 2026.", organiser: "The City v Wharf Run Challenge", website: "https://findarace.com/trail-runs/september", featured: false, source_url: "https://findarace.com/trail-runs/september" },
  { slug: "adder-dash", name: "The Adder Dash", sport: "Running", country: "United Kingdom", county: "East Sussex", city: "Lewes", area: "Lewes", surface: "Trail", distances: ["10K"], summary: "The Adder Dash in Lewes.", description: "The Adder Dash is Saturday 19 September 2026.", organiser: "The Adder Dash", website: "https://findarace.com/trail-runs/september", featured: false, source_url: "https://findarace.com/trail-runs/september" },
];

export const runrecsGapFillEEditions: Edition[] = [
  { seriesSlug: "basingstoke-summer-festival", date: "2026-09-10", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/trail-runs/september", entryOptions: officialEntry("basingstoke-summer", "Basingstoke Summer Running Festival", "https://findarace.com/trail-runs/september", "Calendar listing: Thursday 10 September 2026."), source: "https://findarace.com/trail-runs/september", notes: "10K event." },
  { seriesSlug: "lulworth-cove-trails", date: "2026-09-12", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://www.runthrough.co.uk/event/lulworth-cove-trails-september-2026", entryOptions: officialEntry("lulworth-cove-trail", "Lulworth Cove Trails", "https://www.runthrough.co.uk/event/lulworth-cove-trails-september-2026", "Calendar listing: Saturday 12 September 2026."), source: "https://www.runthrough.co.uk/event/lulworth-cove-trails-september-2026", notes: "10K event." },
  { seriesSlug: "dartmoor-volcano-race", date: "2026-09-12", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/trail-runs/september", entryOptions: officialEntry("dartmoor-volcano-ra", "Dartmoor Volcano Race", "https://findarace.com/trail-runs/september", "Calendar listing: Saturday 12 September 2026."), source: "https://findarace.com/trail-runs/september", notes: "Half event." },
  { seriesSlug: "flying-scotsman-milton-keynes", date: "2026-09-12", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://findarace.com/trail-runs/september", entryOptions: officialEntry("flying-scotsman-mil", "Flying Scotsman Marathons Milton Keynes", "https://findarace.com/trail-runs/september", "Calendar listing: Saturday 12 September 2026."), source: "https://findarace.com/trail-runs/september", notes: "Marathon event." },
  { seriesSlug: "defeat-delamere", date: "2026-09-13", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://roycastle.org/event/defeat-delamere/", entryOptions: officialEntry("defeat-delamere", "Defeat Delamere", "https://roycastle.org/event/defeat-delamere/", "Calendar listing: Sunday 13 September 2026."), source: "https://roycastle.org/event/defeat-delamere/", notes: "10K event." },
  { seriesSlug: "holdenby-trailfest", date: "2026-09-13", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/trail-runs/september", entryOptions: officialEntry("holdenby-trailfest", "TrailFest Holdenby House", "https://findarace.com/trail-runs/september", "Calendar listing: Sunday 13 September 2026."), source: "https://findarace.com/trail-runs/september", notes: "10K event." },
  { seriesSlug: "breaking-the-laws-30k", date: "2026-09-13", distance: "30K", distanceKm: 30, status: "Open", entryUrl: "https://findarace.com/trail-runs/september", entryOptions: officialEntry("breaking-the-laws-3", "Breaking The Laws 30K", "https://findarace.com/trail-runs/september", "Calendar listing: Sunday 13 September 2026."), source: "https://findarace.com/trail-runs/september", notes: "30K event." },
  { seriesSlug: "city-v-wharf", date: "2026-09-17", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/trail-runs/september", entryOptions: officialEntry("city-v-wharf", "The City v Wharf Run Challenge", "https://findarace.com/trail-runs/september", "Calendar listing: Thursday 17 September 2026."), source: "https://findarace.com/trail-runs/september", notes: "10K event." },
  { seriesSlug: "adder-dash", date: "2026-09-19", distance: "10K", distanceKm: 10, status: "Open", entryUrl: "https://findarace.com/trail-runs/september", entryOptions: officialEntry("adder-dash", "The Adder Dash", "https://findarace.com/trail-runs/september", "Calendar listing: Saturday 19 September 2026."), source: "https://findarace.com/trail-runs/september", notes: "10K event." },
];
