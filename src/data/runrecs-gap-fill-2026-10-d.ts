/**
 * October 2026 batch D.
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

export const runrecsGapFillOctDSeries: Series[] = [
  { slug: "maverick-south-downs-october", name: "Maverick South Downs Trail October", sport: "Running", country: "United Kingdom", county: "Hampshire", city: "Horndean", area: "South Downs", surface: "Trail", distances: ["Half", "10K"], summary: "Maverick South Downs Trail October in Horndean.", description: "Maverick South Downs Trail October is Saturday 3 October 2026.", organiser: "Maverick Race", website: "https://findarace.com/half-marathons/october", featured: false, source_url: "https://findarace.com/half-marathons/october" },
  { slug: "southampton-half-october", name: "Southampton Half Marathon October", sport: "Running", country: "United Kingdom", county: "Hampshire", city: "Southampton", area: "St Marys Stadium", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Southampton Half Marathon October in Southampton.", description: "Southampton Half Marathon October is Sunday 4 October 2026.", organiser: "RunThrough", website: "https://www.runthrough.co.uk/event/southampton-half-marathon-10k--junior-october-2026", featured: false, source_url: "https://www.runthrough.co.uk/event/southampton-half-marathon-10k--junior-october-2026" },
  { slug: "basingstoke-half-october", name: "Phillips Law Basingstoke Half Marathon", sport: "Running", country: "United Kingdom", county: "Hampshire", city: "Basingstoke", area: "Basingstoke", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Phillips Law Basingstoke Half Marathon in Basingstoke.", description: "Phillips Law Basingstoke Half Marathon is Sunday 4 October 2026.", organiser: "Destination Basingstoke", website: "https://www.destinationbasingstoke.co.uk/half-marathon/", featured: false, source_url: "https://www.destinationbasingstoke.co.uk/half-marathon/" },
  { slug: "the-hurt-guildford", name: "The Hurt", sport: "Running", country: "United Kingdom", county: "Surrey", city: "Guildford", area: "Hurtwood Forest", surface: "Trail", distances: ["Half"], summary: "The Hurt in Guildford.", description: "The Hurt is Saturday 10 October 2026.", organiser: "The Hurt", website: "https://www.thehurt.co.uk/", featured: false, source_url: "https://www.thehurt.co.uk/" },
  { slug: "gc50-run-festival", name: "fisiocrem GC50 Run Festival", sport: "Running", country: "Australia", county: "Queensland", city: "Coolangatta", area: "Queen Elizabeth Park", surface: "Road", distances: ["Half", "10K", "5K", "Ultra"], summary: "fisiocrem GC50 Run Festival in Coolangatta.", description: "fisiocrem GC50 Run Festival is Sunday 11 October 2026.", organiser: "GC50 Run Festival", website: "https://www.gc50runfestival.com.au/", featured: false, source_url: "https://www.gc50runfestival.com.au/" },
  { slug: "love-luton-runfest", name: "Love Luton RunFest", sport: "Running", country: "United Kingdom", county: "Bedfordshire", city: "Luton", area: "Luton", surface: "Road", distances: ["Half", "10K", "5K"], summary: "Love Luton RunFest in Luton.", description: "Love Luton RunFest is Sunday 11 October 2026.", organiser: "Love Luton", website: "https://loveluton.org.uk/runfest/", featured: false, source_url: "https://loveluton.org.uk/runfest/" },
  { slug: "run-leicester-october", name: "Run Leicester Half Marathon and 10K", sport: "Running", country: "United Kingdom", county: "Leicestershire", city: "Leicester", area: "Leicester", surface: "Road", distances: ["Half", "10K"], summary: "Run Leicester Half Marathon and 10K in Leicester.", description: "Run Leicester Half Marathon and 10K is Sunday 11 October 2026.", organiser: "Run Leicester", website: "https://www.runningcalendar.co.uk/event/run-leicester-half-marathon-10k/", featured: false, source_url: "https://www.runningcalendar.co.uk/event/run-leicester-half-marathon-10k/" },
];

export const runrecsGapFillOctDEditions: Edition[] = [
  { seriesSlug: "maverick-south-downs-october", date: "2026-10-03", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://findarace.com/half-marathons/october", entryOptions: officialEntry("maverick-south-down", "Maverick South Downs Trail October", "https://findarace.com/half-marathons/october", "Calendar listing: Saturday 3 October 2026."), source: "https://findarace.com/half-marathons/october", notes: "Half event." },
  { seriesSlug: "southampton-half-october", date: "2026-10-04", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runthrough.co.uk/event/southampton-half-marathon-10k--junior-october-2026", entryOptions: officialEntry("southampton-half-oc", "Southampton Half Marathon October", "https://www.runthrough.co.uk/event/southampton-half-marathon-10k--junior-october-2026", "Official listing: Sunday 4 October 2026."), source: "https://www.runthrough.co.uk/event/southampton-half-marathon-10k--junior-october-2026", notes: "Half event." },
  { seriesSlug: "basingstoke-half-october", date: "2026-10-04", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.destinationbasingstoke.co.uk/half-marathon/", entryOptions: officialEntry("basingstoke-half-oc", "Phillips Law Basingstoke Half Marathon", "https://www.destinationbasingstoke.co.uk/half-marathon/", "Official site: Sunday 4 October 2026."), source: "https://www.destinationbasingstoke.co.uk/half-marathon/", notes: "Half event." },
  { seriesSlug: "the-hurt-guildford", date: "2026-10-10", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.thehurt.co.uk/", entryOptions: officialEntry("the-hurt-guildford", "The Hurt", "https://www.thehurt.co.uk/", "Official site: Saturday 10 October 2026."), source: "https://www.thehurt.co.uk/", notes: "Half event." },
  { seriesSlug: "gc50-run-festival", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.gc50runfestival.com.au/", entryOptions: officialEntry("gc50-run-festival", "fisiocrem GC50 Run Festival", "https://www.gc50runfestival.com.au/", "Official site: Sunday 11 October 2026."), source: "https://www.gc50runfestival.com.au/", notes: "Half event." },
  { seriesSlug: "love-luton-runfest", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://loveluton.org.uk/runfest/", entryOptions: officialEntry("love-luton-runfest", "Love Luton RunFest", "https://loveluton.org.uk/runfest/", "Official site: Sunday 11 October 2026."), source: "https://loveluton.org.uk/runfest/", notes: "Half event." },
  { seriesSlug: "run-leicester-october", date: "2026-10-11", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://www.runningcalendar.co.uk/event/run-leicester-half-marathon-10k/", entryOptions: officialEntry("run-leicester-octob", "Run Leicester Half Marathon and 10K", "https://www.runningcalendar.co.uk/event/run-leicester-half-marathon-10k/", "Calendar listing: Sunday 11 October 2026."), source: "https://www.runningcalendar.co.uk/event/run-leicester-half-marathon-10k/", notes: "Half event." },
];
