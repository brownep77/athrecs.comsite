import type { ClubProfile } from "./club-profiles";

// Batch 96: rendered club pages and explicitly dated primary accounts.
export const recoveredTrailCoastalAndTrackProfiles: Record<string, ClubProfile> = {
  "pendle-trail-running-club": {
    summary: "Pendle Trail Running Club brings Colne runners onto local trails, combining varied off-road sessions with club races, social events and fundraising.",
    biography: [
      "Pendle Trail Running Club is based in Colne, Lancashire, England, and was created to introduce runners to off-road running. Its welcome extends from people trying trails for the first time to runners preparing for half marathons and marathons. Sessions explore the Pendle area on varied routes, led by people the club describes as qualified Leaders in Running Fitness.",
      "The programme includes a club championship mixing distances and terrain, alongside social events and fundraising. Its own events include the Pendle five-mile trail race from Barley and the Coldwell ten-mile loop through the countryside around Trawden, Wycoller and Boulsworth Hill. Races organised by other clubs and charities also appear in the championship; inclusion does not make Pendle Trail their organiser.",
      "The website's contact button opens the club enquiry email, and its linked Facebook group offers another way to ask about joining and the next suitable run. Confirm the meeting point and required kit before attending. The Dressers address in the directory is not established by these pages as the start of every session, and race venues are separate again."
    ],
    sources: [{ title: "Rendered official welcome, leaders and enquiry email", url: "https://www.pendletrailrunningclub.co.uk/" }, { title: "Rendered committee and championship programme", url: "https://www.pendletrailrunningclub.co.uk/club-info" }],
    reviewed_at: "2026-10-17",
    location_note: "The Dressers remains a directory address. Local session starts and Barley/Trawden race venues are not interchangeable.",
    contact_note: "No founding year, fixed training timetable or notable-member history established. Coldwell text refers to booking for 2025 alongside a November 2026 date; no current race date promised. Existing adult membership classification retained; beginner-friendly wording does not establish junior eligibility."
  },
  "regis-road-runners": {
    summary: "Regis Road Runners is a Bognor Regis running and walking community, with sociable promenade outings, summer away days and festive runs.",
    biography: [
      "Regis Road Runners brings runners and walkers together in Bognor Regis, West Sussex, England. Most Thursday outings start at 7pm and use an out-and-back format along the promenade, taking about forty minutes so people moving at different speeds can finish together. The club welcomes varied abilities and says membership is not required to try these runs.",
      "West Park Cafe in Aldwick is the main meeting point, but it is not the only one: the club asks visitors to check its Tuesday social-media update for that week's location. Summer away days take members to places such as East Dean, Centurion Way and Swanbourne Lake. December runs add Christmas lights, festive clothing and time together afterwards.",
      "Bognor Regis parkrun at Hotham Park is a regular part of club life, alongside visits to other parkruns and organised races further afield. The website describes the Benidorm Half Marathon as a club tradition. Prospective members can use the public enquiry email and downloadable membership form; confirm the current subscription and any eligibility requirements before applying. The website's undated price is not treated here as a guaranteed current fee."
    ],
    sources: [{ title: "Rendered official activities, membership and public contacts", url: "https://regisroadrunners.co.uk/" }, { title: "Official-linked Strava club confirms Bognor Regis and run format", url: "https://www.strava.com/clubs/rotaryroadrunners" }],
    reviewed_at: "2026-10-17",
    corrections: { city: "Bognor Regis", address: "West Park Cafe, Aldwick, Bognor Regis", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Official main run start replaces the incomplete directory address '10, PO21 3JR'; no postcode inferred. Starts vary and should be checked each week.",
    contact_note: "Founding year and notable-member history unconfirmed. Strava's older rotaryroadrunners URL displays Regis Road Runners and links back to the official site; tracking parameters removed. Existing adult membership classification retained. Website supplier and photographer links excluded."
  },
  "fylde-coast-runners": {
    summary: "Fylde Coast Runners is a Blackpool-based road-race organiser, with events across the Lancashire coast and a public events office for runner enquiries.",
    biography: [
      "Fylde Coast Runners is based in Blackpool, Lancashire, England. Its current official website describes an independent event organiser, offering road races from shorter family-friendly distances and 5Ks to half marathons and marathons. Coastal promenades, parks and Lancashire roads provide the settings for a programme aimed at experienced racers, newcomers and charity runners.",
      "The organisation's work extends beyond taking entries: its account of race preparation covers route permissions, course marking, stewarding, water stations, medical planning and runner information. Facilities and licensing depend on the event. The Blackpool Festival of Running and Windmill Remembrance Day 10K are examples on its calendar, not evidence that every event participant belongs to a training club.",
      "The former website redirects to the new FCR site, which brings event information, entries, results and photographs together. Its events office publishes an enquiry email and telephone for entry, accessibility and race-day questions. This is an event-participation route, not a verified weekly training or club-membership offer. Check each race's own age limits, venue and conditions; the directory's adult-club classification is distinct from family-event eligibility."
    ],
    sources: [{ title: "Official homepage reached by redirect from the directory website", url: "https://www.fcrentry.com/" }, { title: "Rendered About FCR: independent Blackpool event organiser", url: "https://www.fcrentry.com/events?view=about" }, { title: "Rendered events-office address, phone and email", url: "https://www.fcrentry.com/events?view=contact" }],
    reviewed_at: "2026-10-17",
    corrections: { city: "Blackpool", county: "Lancashire", website: "https://www.fcrentry.com/", address: "FCR BaseCamp, Levens House, Clifton Road, Blackpool, FY4 4QA", postcode: "FY4 4QA", address_kind: "correspondence", location_precision: "postcode" },
    location_note: "Levens House is the published events office, classified as correspondence rather than a training venue or race start.",
    contact_note: "Current site focuses on event organisation; separate club membership and training arrangements remain unresolved. Founding year and notable members unconfirmed. Directory adult-only field preserved, not applied to every advertised race. No results imported and no event entrant treated as a club member."
  },
  "tynedale-harriers-and-ac": {
    summary: "Tynedale Harriers & AC is a Hexham athletics club with junior and senior participation, a Wentworth Stadium connection and a documented masters-sprinting community.",
    biography: [
      "Tynedale Harriers & AC is an athletics and running club in Hexham, Northumberland, England. Its organiser listing describes coaching, competition and social opportunities for juniors and seniors. It invites prospective members to try club nights before joining online, although the undated Tuesday times should be confirmed directly before a visit.",
      "Wentworth is part of the club's documented sporting setting. England Athletics' June 2025 support report records assistance over a possible loss of the stadium infield. That account establishes a facility issue at the time, not its eventual outcome or a promise that every discipline is currently available there.",
      "The club's masters-sprinting story includes former member Chris Fenwick. In a December 2025 tribute published by North East Masters Athletics Association, his son Gary described Chris taking up athletics in 2015, training at Hexham and subsequently joining Tynedale. The account remembers his commitment to training and encouragement of newcomers. It is a historical association, not a current-membership claim. For today's sessions, age groups and joining arrangements, use the club's existing website or directory-linked Facebook page."
    ],
    notable_members: [{ name: "Chris Fenwick", connection: "Former member and masters sprinter", detail: "His son's tribute, published by NEMAA on 3 December 2025, describes joining Tynedale after taking up athletics in 2015. Historical association only." }],
    sources: [{ title: "Club organiser's introduction and trial-membership guidance", url: "https://www.letsdothis.com/o/tynedale-harriers-and-athletic-club-89238" }, { title: "England Athletics June 2025 facility-support report", url: "https://www.englandathletics.org/news/england-athletics-supporting-the-club-community-club-support-round-up-june-2025/" }, { title: "Gary Fenwick's tribute published by NEMAA, 3 December 2025", url: "https://www.nemaa.co.uk/news1/in-loving-memory-of-chris-fenwick-1954-2025" }],
    reviewed_at: "2026-10-17",
    location_note: "Wentworth Leisure Centre remains directory context; the 2025 infield concern is not proof of current access or closure.",
    contact_note: "Club website and fresh directory retrieval unavailable. Existing Facebook provenance retained. Founding year, current timetable, direct enquiry contacts and outcome of the infield issue remain unresolved; no snippet-only details adopted."
  }
};
