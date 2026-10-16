import type { ClubProfile } from "./club-profiles";

// Batch 81: community directories and dated primary sporting accounts.
export const villageAndYouthRecoveryProfiles: Record<string, ClubProfile> = {
  "boxted-runners": {
    summary: "Boxted Runners is a village running club near Colchester in Essex, founded in 2017 and combining welcoming group runs with the school-supporting Boxted 10K event.",
    biography: [
      "Boxted Runners began in June 2017 when Vanessa Dolling brought a small group together in Boxted, near Colchester, England. Her aim was to make running approachable for people across north Essex and neighbouring Suffolk, including those who had never tried it. A committee followed in December that year, leading to affiliation with England Athletics.",
      "The club organised its first Boxted 10K in May 2018, raising money for the village school. The event's own account describes a programme of 10K, 5K and junior 2K races through the Constable countryside, with profits supporting Boxted St Peter's School. That community fundraising role sits alongside the club's regular group running.",
      "The published training programme uses several local meeting points, including Boxted Village Hall, Highwoods Tesco and seasonal sessions at Northern Gateway. Ask the club's administration team which group and venue suits a first visit. King George's Field is the club's published address, while the school on Carters Hill is associated with the race; neither should be assumed to be the start of every training run."
    ],
    founded_year: 2017,
    notable_members: [{ name: "Vanessa Dolling", connection: "Founder", detail: "The club and its race website identify Dolling as the founder in June 2017. This records her founding contribution, not a claim about current competitive membership." }],
    sources: [{ title: "Club foundation and programme", url: "https://boxtedrunners.co.uk/about-us/" }, { title: "Race organiser's account and school fundraising", url: "https://boxted10k.co.uk/?page_id=1195" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://boxtedrunners.co.uk/", city: "Boxted" },
    location_note: "King George's Field is the published club address; sessions use several venues. The race's school address is not substituted as a training base.",
    contact_note: "The administration email is for club enquiries; the races email is event-specific. The membership page was unavailable, so current fees and first-visit arrangements need confirmation."
  },
  "parbold-pink-panthers": {
    summary: "Parbold Pink Panthers is a women's running group in Parbold, West Lancashire, offering local runs and documented social outings with neighbouring clubs.",
    biography: [
      "Parbold Pink Panthers brings women together for running around Parbold in West Lancashire, England. The village's community website describes local runs twice a week and welcomes women across different ages and fitness levels. Its useful-contacts and activities directories publish Jane Warner as the group's enquiry contact.",
      "The Panthers also take part in the area's wider running community. Newburgh Nomads' first-hand account of its New Year's Eve 2024 outing records runners from Parbold Pink Panthers joining friends from Billinge and Skelmersdale Boundary Harriers. The group followed the Parbold Hill Race course at a steady pace, tackling muddy stretches before gathering socially afterwards.",
      "That outing illustrates the group's social and off-road activity, but it is not a weekly training timetable. Newcomers should contact Jane to confirm the next suitable run, starting point and joining arrangements. Parbold is the supported local area; the former Spey Close directory address in Wigan is not retained as a presumed training venue. No founding year or named sporting alumni have been established."
    ],
    sources: [{ title: "Village description of the running group", url: "https://www.parboldonline.info/" }, { title: "Published club enquiry contact", url: "https://www.parboldonline.info/local-info/useful-contacts.html" }, { title: "Activities directory corroborating the enquiry address", url: "https://www.parboldonline.info/local-info/whats-on.html" }, { title: "Host club's account of New Year's Eve 2024", url: "https://www.nomadsrunning.club/2025/01/new-years-eve-2024.html" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Parbold", county: "Lancashire", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Parbold is an area indicator. The Farmers Arms was the start of a dated shared outing, not a verified weekly meeting point.",
    contact_note: "Use the email spelling corroborated in both community contact tables, not the apparent typo in the homepage announcement. A current timetable, foundation date and official social destination remain unresolved."
  },
  "new-forest-junior-ac": {
    summary: "New Forest Junior AC is a Hampshire athletics club listed at Noadswood School in Dibden Purlieu, with a documented connection to middle-distance runner Leah Johnson.",
    biography: [
      "New Forest Junior AC is part of Hampshire's athletics community in southern England. Hampshire Athletics lists the club at Noadswood School on North Road in Dibden Purlieu, near Southampton. The existing England Athletics catalogue entry covers track and field, cross-country, road running and race walking, rather than a single running discipline.",
      "A University of Winchester profile published on 20 January 2026 identifies middle-distance runner Leah Johnson as a New Forest Junior AC member. The article follows her move into university study and its elite sports programme while retaining that club association. It offers a dated example of an athlete's connection with the club beyond school, not evidence of today's membership list or a new athlete identity.",
      "The club's own website was unavailable during this review, so its current training groups, minimum ages, waiting lists and joining process could not be confirmed. Families and prospective athletes should consult the club through the governing-body directory before travelling. The school is a directory-listed location, not a verified promise that a particular session takes place there."
    ],
    notable_members: [{ name: "Leah Johnson", connection: "Member identified in January 2026", detail: "The University of Winchester's 20 January 2026 profile explicitly identifies Johnson as a New Forest Junior AC member. The association is dated to that article and does not establish current membership." }],
    sources: [{ title: "Hampshire Athletics club directory", url: "https://www.hampshireathletics.org.uk/clubs/" }, { title: "University profile identifying the club association, January 2026", url: "https://www.winchester.ac.uk/News-and-Events/Press-Centre/Media-Articles/Elite-Sports-Programme-propels-middle-distance-runner-Leah-into-the-fast-lane.php" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Dibden Purlieu", county: "Hampshire", address: "Noadswood School, North Road, Dibden Purlieu", address_kind: "directory" },
    location_note: "Hampshire Athletics supplies the school location. Current training times and access arrangements were not independently established.",
    contact_note: "No club-role email or telephone, founding date or current age policy was established. The unavailable standalone site is not added as a newly checked contact route."
  },
  "new-ross-triathlon-club": {
    summary: "New Ross Triathlon Club serves the New Ross area of County Wexford, Ireland, and appears in Triathlon Ireland's adult club network and 2026 Community League.",
    biography: [
      "New Ross Triathlon Club connects swimming, cycling and running in the New Ross area of County Wexford, Ireland. Triathlon Ireland's public directory gives New Ross as its nearest town and lists no junior members. This supports an adult-club description without implying that a particular swimming pool or cycling meeting point has been confirmed.",
      "The club appears in the inaugural 2026 Triathlon Club Community League. Triathlon Ireland's October announcement placed New Ross third in Division Four, in a competition designed to encourage participation and repeat racing as well as performance. When reviewed on 16 October, the tables remained subject to affiliation and membership checks, with finalisation scheduled for 23 October 2026; the placing is therefore provisional.",
      "Prospective members should confirm the current training programme and joining arrangements before attending. The retained membership-directory email differs in spelling from the newer public directory, and that discrepancy remains unresolved. A reliable weekly timetable, founding history and specific training venues were not available, so none have been filled in by assumption."
    ],
    sources: [{ title: "Triathlon Ireland town and junior-status listing", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" }, { title: "Provisional 2026 Community League table and review deadline", url: "https://www.triathlonireland.com/news/triathlon-club-community-league-divisions-results/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "New Ross", adult_only: true },
    location_note: "New Ross is a nearest-town indicator, not a verified training address.",
    contact_note: "Existing newrosstriathlonclub@hotmail.com and its original provenance are preserved. The newer public directory prints newrosstriathalonclub@hotmail.com; no replacement is made without resolving the discrepancy. Its generic Facebook homepage is not added as a club social link."
  },
  "bramley-breezers": {
    summary: "Bramley Breezers is a social running club in Bramley, Leeds, with a documented community base and experience hosting cross-country running in Bramley Fall Woods.",
    biography: [
      "Bramley Breezers is a social running group in Bramley, Leeds, England. Its governing-body catalogue entry includes road, trail and cross-country running alongside athletics. The Villagers Community Club on Broad Lane is the listed base, rather than a clubhouse claimed to be owned by the runners.",
      "A photographed, first-hand community report records the Breezers hosting their first West Yorkshire Winter League cross-country race on 22 January 2023. More than four hundred runners tackled an eight-kilometre course through Bramley Fall Woods, with club volunteers marshalling and supporting them. Afterwards, runners and helpers gathered at the Villagers for hot food, while raffle prizes donated by the Breezers raised money for Bramley Elderly Action.",
      "The same report described Monday and Wednesday evening meetings at 6:30pm. Those details are dated to January 2023, not presented as a confirmed current timetable. Before a first visit, use the club's existing governing-body contact and linked Facebook group to check today's sessions and joining arrangements. A founding date, direct club email and telephone were not established from the accessible sources."
    ],
    sources: [{ title: "First-hand report of the club's January 2023 league race", url: "https://westleedsdispatch.com/a-wintery-league-run-in-bramley-falls-wood/" }],
    reviewed_at: "2026-10-16",
    location_note: "The Villagers is a directory-listed base corroborated by a January 2023 event report. Confirm the current meeting point before travelling.",
    contact_note: "The standalone website and linked RunTogether page were unavailable. Existing directory social provenance is preserved; no inaccessible event-listing email is copied from a search snippet."
  }
};
