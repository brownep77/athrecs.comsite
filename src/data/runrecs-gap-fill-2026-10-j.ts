/**
 * October 2026 batch J. Worldwide leftovers after duplicate check.
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

export const runrecsGapFillOctJSeries: Series[] = [
  { slug: "aotea-wharf-to-wharf", name: "Wharf to Wharf Aotea Great Barrier Island", sport: "Running", country: "New Zealand", county: "Auckland", city: "Great Barrier Island", area: "Aotea", surface: "Road", distances: ["Half", "10K"], summary: "Wharf to Wharf Aotea Great Barrier Island.", description: "Wharf to Wharf Aotea Great Barrier Island is Saturday 3 October 2026.", organiser: "Wharf 2 Wharf Committee", website: "https://events.humanitix.com/wharf-to-wharf-2026", featured: false, source_url: "https://events.humanitix.com/wharf-to-wharf-2026" },
  { slug: "chaiyaphum-marathon", name: "Chaiyaphum Marathon", sport: "Running", country: "Thailand", county: "Chaiyaphum", city: "Chaiyaphum", area: "Nai Mueang", surface: "Road", distances: ["Marathon"], summary: "Chaiyaphum Marathon in Chaiyaphum.", description: "Chaiyaphum Marathon is Sunday 11 October 2026.", organiser: "Chaiyaphum Marathon", website: "https://worldsmarathons.com/marathon/chaiyaphum-marathon", featured: false, source_url: "https://worldsmarathons.com/marathon/chaiyaphum-marathon" },
  { slug: "dat-sen-hong-dong-thap", name: "Dat Sen Hong Marathon Dong Thap", sport: "Running", country: "Vietnam", county: "Dong Thap", city: "Cao Lanh", area: "Cao Lanh", surface: "Road", distances: ["Marathon", "Half", "10K", "5K"], summary: "Dat Sen Hong Marathon Dong Thap in Cao Lanh.", description: "Dat Sen Hong Marathon Dong Thap is Sunday 11 October 2026.", organiser: "Dat Sen Hong Marathon Dong Thap", website: "https://www.ahotu.com/event/dat-sen-hong-marathon-dong-thap", featured: false, source_url: "https://www.ahotu.com/event/dat-sen-hong-marathon-dong-thap" },
  { slug: "mission-mt-somers", name: "Mission Mt Somers", sport: "Running", country: "New Zealand", county: "Canterbury", city: "Staveley", area: "Staveley", surface: "Trail", distances: ["Marathon", "Half", "10K", "5K"], summary: "Mission Mt Somers in Staveley.", description: "Mission Mt Somers is Saturday 31 October 2026.", organiser: "Enduranz Events", website: "https://www.enduranzevents.co.nz/", featured: false, source_url: "https://www.enduranzevents.co.nz/" },
];

export const runrecsGapFillOctJEditions: Edition[] = [
  { seriesSlug: "aotea-wharf-to-wharf", date: "2026-10-03", distance: "Half", distanceKm: 21.0975, status: "Open", entryUrl: "https://events.humanitix.com/wharf-to-wharf-2026", entryOptions: officialEntry("aotea-wharf-to-whar", "Wharf to Wharf Aotea Great Barrier Island", "https://events.humanitix.com/wharf-to-wharf-2026", "Official listing: Saturday 3 October 2026."), source: "https://events.humanitix.com/wharf-to-wharf-2026", notes: "Half event." },
  { seriesSlug: "chaiyaphum-marathon", date: "2026-10-11", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://worldsmarathons.com/marathon/chaiyaphum-marathon", entryOptions: officialEntry("chaiyaphum-marathon", "Chaiyaphum Marathon", "https://worldsmarathons.com/marathon/chaiyaphum-marathon", "Calendar listing: Sunday 11 October 2026."), source: "https://worldsmarathons.com/marathon/chaiyaphum-marathon", notes: "Marathon event." },
  { seriesSlug: "dat-sen-hong-dong-thap", date: "2026-10-11", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.ahotu.com/event/dat-sen-hong-marathon-dong-thap", entryOptions: officialEntry("dat-sen-hong-dong-t", "Dat Sen Hong Marathon Dong Thap", "https://www.ahotu.com/event/dat-sen-hong-marathon-dong-thap", "Calendar listing: Sunday 11 October 2026."), source: "https://www.ahotu.com/event/dat-sen-hong-marathon-dong-thap", notes: "Marathon event." },
  { seriesSlug: "mission-mt-somers", date: "2026-10-31", distance: "Marathon", distanceKm: 42.195, status: "Open", entryUrl: "https://www.enduranzevents.co.nz/", entryOptions: officialEntry("mission-mt-somers", "Mission Mt Somers", "https://www.enduranzevents.co.nz/", "Official site: Saturday 31 October 2026."), source: "https://www.enduranzevents.co.nz/", notes: "Marathon event." },
];
