import type { ClubProfile } from "./club-profiles";

// Batch 77: recovered official sources; editorial associations are not athlete identities.
export const recoveredClubAccessAndOriginsProfiles: Record<string, ClubProfile> = {
  "fetch-everyone": {
    summary: "Fetch Everyone Running Club offers an England Athletics-affiliated virtual club alongside the Fetch training-log and running community, with an online club night.",
    biography: [
      "Fetch Everyone Running Club brings a formal club option to the online Fetch community. Listed by England Athletics as a virtual club with a Bedford, England, directory address, it connects runners without requiring them to attend a single local training base. Club membership is distinct from simply having a free Fetcheveryone website account.",
      "The wider website provides training logs, route planning, race listings and discussion forums. The running club adds an England Athletics-affiliated membership route and an informal Tuesday evening online club night, where members can exchange advice and catch up. This is a virtual gathering, not a scheduled group run from the directory address.",
      "Applications are made through the dedicated FERC joining page. Its 2026–27 membership year runs from April to March, with joining permitted during the year. Runners moving from another affiliated club are asked to complete the England Athletics transfer process first. Membership includes eligibility for the club's London Marathon ballot, rather than a guaranteed race place."
    ],
    sources: [{ title: "FERC membership and online club night", url: "https://www.fetcheveryone.com/ferc.php" }, { title: "Fetch community and training tools", url: "https://www.fetcheveryone.com/" }],
    reviewed_at: "2026-10-16",
    corrections: { address: "", postcode: "", location_precision: "area-only" },
    location_note: "Bedford is the existing directory locality, not a confirmed training venue. The street address is omitted for this virtual club; no global scope is inferred.",
    contact_note: "Use the dedicated FERC joining page for membership and its questions route. No public club-role email, telephone or founding date was established."
  },
  "shefford-runners": {
    summary: "Shefford Runners is an adult running club in Bedfordshire, offering pace groups, intervals and a Couch to 5K route into regular club running.",
    biography: [
      "Shefford Runners brings adults together for running in Shefford, Bedfordshire, England. Its members range from newcomers building confidence to runners tackling longer distances, including ultras. The club combines regular group outings with interval work and a nine-week Couch to 5K programme.",
      "The October 2026 calendar lists Monday groups from the side car park at Samuel Whitbread School, with choices from 5K through to 10K-plus and a transition group between shorter distances. Other outings use different meeting points, so the current session listing matters more than a single club address. Couch to 5K is offered in periodic intakes rather than as a drop-in course every week.",
      "Sessions are booked through ConnectMyClub. New participants need to accept the club's code of conduct before booking, and ordinary new runners are asked to complete membership arrangements within three weeks. The course has its own joining instructions. Use the club contact form to ask about a suitable group, the next beginner intake or meeting arrangements."
    ],
    sources: [{ title: "Club and joining instructions", url: "https://sheffordrunners.co.uk/" }, { title: "October 2026 sessions and beginner course", url: "https://sheffordrunners.co.uk/training" }, { title: "Club contact form", url: "https://sheffordrunners.co.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://sheffordrunners.co.uk/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "The unconfirmed Manor Close directory address is omitted. The published calendar identifies Samuel Whitbread School and other session-specific meeting points.",
    contact_note: "ConnectMyClub supplier emails are excluded. No foundation year is inferred from the site's 2019 header; beginner-course dates should be checked before booking."
  },
  "fordy-runs-running-club-leeds": {
    summary: "Fordy Runs Leeds offers free social running from Headingley through Run with the Rhinos, a partnership with Leeds Rhinos Foundation.",
    biography: [
      "Fordy Runs Running Club's Leeds group is an in-person running community in Leeds, West Yorkshire, England. Its Run with the Rhinos sessions are delivered with Leeds Rhinos Foundation, bringing the wider Fordy Runs network into a local setting at Headingley.",
      "The published meeting point is outside the South Stand at AMT Headingley Stadium on Wednesday evenings. The free weekly runs welcome different abilities, including people building towards a first 5K and runners preparing for the Rob Burrow Leeds Marathon. Coaches support participants, and a drink and conversation afterwards are part of the social invitation.",
      "Runners should book a place in advance so the organisers can plan numbers. The wider Fordy Runs club offers free social membership and an optional paid England Athletics-affiliated route. Check the Leeds session details before attending, and use the network's central enquiry address for help finding the local group. This physical satellite is distinct from the network's online running community."
    ],
    sources: [{ title: "Leeds partnership, meeting point and booking", url: "https://www.fordyruns.com/run-with-the-rhinos" }, { title: "Network membership options", url: "https://www.fordyruns.com/running-club" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Leeds", county: "West Yorkshire", virtual: false, address: "South Stand, AMT Headingley Stadium, Leeds", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "The official Leeds partnership page establishes an in-person meeting point; the inherited virtual designation is removed. This is not a clubhouse or correspondence address.",
    contact_note: "The existing hello@fordyruns.com contact and network social links are central Fordy Runs routes, not separately verified Leeds accounts."
  },
  "wesham-road-runners-and-ac": {
    summary: "Wesham Road Runners & AC serves Kirkham and Wesham in Lancashire, combining social runs, coached sessions and road, fell, trail and cross-country competition.",
    biography: [
      "Wesham Road Runners and Athletic Club is based in Kirkham and Wesham, Lancashire, England. Its running programme reaches beyond the roads into fell, trail and cross-country racing, with local interclub competition adding another way to run as part of a team.",
      "Monday club nights meet at Kirkham and Wesham Cricket Club, while Wednesday evenings offer structured training with qualified coaches. Runners can discuss their goals with the coaching team or join a social outing at an appropriate pace. The club advertises a free trial week for prospective members.",
      "Membership options include first-claim, second-claim and social membership, with different competition benefits. Club handicaps, road and off-road championships and a social calendar give members reasons to meet throughout the year. Applications are handled online, and the membership secretary can explain the appropriate category. For the cricket-club base, use the Wellington Street entrance: the club says the Woodlands Avenue entrance is closed to vehicles."
    ],
    sources: [{ title: "Club programme and trial", url: "https://weshamroadrunners.com/about-us/" }, { title: "Coaching support", url: "https://weshamroadrunners.com/training/" }, { title: "Membership categories and activities", url: "https://weshamroadrunners.com/join-us/" }, { title: "Current base and enquiries", url: "https://weshamroadrunners.com/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://weshamroadrunners.com/", city: "Kirkham and Wesham", address: "Kirkham and Wesham Cricket Club, Wellington Street, Kirkham", postcode: "PR4 2JN", address_kind: "training" },
    location_note: "The club-published Wellington Street access and PR4 2JN replace the directory's Woodlands Avenue address and PR4 2JQ.",
    contact_note: "The about page says formed in 1985 but also describes a 25th anniversary in 2009. The history page is unfinished, so the founding year remains unset pending clarification."
  },
  "whitchurch-whippets": {
    summary: "Whitchurch Whippets serves North Shropshire and South Cheshire with social runs, coached sessions and road, fell, trail and cross-country opportunities.",
    biography: [
      "Whitchurch Whippets is a running club in Whitchurch, Shropshire, England, serving the surrounding North Shropshire and South Cheshire area. Jon Morgan and Alison Birch's invitation in a local newspaper brought prospective runners together in November 2007. The club was formally established on 18 December that year, with England Athletics affiliation following in April 2008.",
      "Members meet at Whitchurch Rugby Club on Tuesday and Thursday evenings. Runs are organised into pace groups, with conversational outings alongside speed and hill sessions. Members take part in road, fell, trail and cross-country events, while club socials and occasional Couch to 5K courses provide other ways to become involved.",
      "Membership is open from age 16. New runners may try several sessions before applying through the online membership form; complete beginners should check when the next introductory course is available. The club asks visitors to enter the rugby-club site from Sedgeford rather than Edgeley Road. Its general enquiry email is the best starting point for choosing a group."
    ],
    founded_year: 2007,
    notable_members: [{ name: "Jon Morgan", connection: "Founding organiser", detail: "The club history records his joint newspaper invitation in 2007; this is a historical founding association." }, { name: "Alison Birch", connection: "Founding organiser", detail: "The club history identifies her alongside Jon Morgan in the 2007 initiative that led to the club's formation." }],
    sources: [{ title: "Founding history", url: "https://www.whitchurchwhippets.co.uk/club-information" }, { title: "Current programme, access and enquiries", url: "https://www.whitchurchwhippets.co.uk/home" }, { title: "Training approach", url: "https://www.whitchurchwhippets.co.uk/training" }, { title: "Membership and trial sessions", url: "https://www.whitchurchwhippets.co.uk/membership" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.whitchurchwhippets.co.uk/home", address: "Whitchurch Rugby Club, entrance from Sedgeford, Whitchurch", address_kind: "training" },
    location_note: "The club explicitly directs visitors to the Sedgeford entrance, not Edgeley Road; the existing SY13 1EU postcode is confirmed.",
    contact_note: "The 2018 move to admitting people aged 16 and over is distinct from the 2007 foundation. No current beginner-course intake is promised."
  },
  "wigan-and-district-h-and-ac": {
    summary: "Wigan and District Harriers and Athletic Club includes an endurance section for road, cross-country, fell and trail running alongside its track-and-field activity.",
    biography: [
      "Wigan and District Harriers and Athletic Club is based in Wigan, Greater Manchester, England. Its endurance section is the road-running wing of the wider athletics club, with members also taking part in cross-country, fell and trail events and triathlon. The section's story is not the founding history of the whole club.",
      "In June 2011, a group of runners joined the Harriers and helped re-establish its road-running activity. The endurance group's own history records the launch of the Amberswood Trail Race in 2012 and its work with Joining Jack on the Wigan 10K. These activities helped connect the section with the wider local running community.",
      "The endurance group offers coached sessions for different abilities and invites prospective members to try it before joining. Its published winter programme includes intervals and longer efforts around the stadium area, with meeting points changing when matches take place. Contact the endurance enquiry address for current arrangements: the detailed timetable is dated October 2024, so its exact times and track charges should be reconfirmed."
    ],
    sources: [{ title: "Endurance section identity and joining", url: "https://wiganharriersendurance.wordpress.com/about-us/" }, { title: "Endurance section history, 17 October 2015", url: "https://wiganharriersendurance.wordpress.com/2015/10/17/wigan-harriers-endurance-a-brief-history/" }, { title: "Training arrangements, last updated October 2024", url: "https://wiganharriersendurance.wordpress.com/training/" }],
    reviewed_at: "2026-10-16",
    contact_note: "The public contact is for the endurance section, not all junior or specialist athletics. Its fee table is labelled 2024. The main club website could not be read; no whole-club founding year or new venue correction is inferred."
  },
  "walton-ac": {
    summary: "Walton Athletic Club, founded in 1942, offers track and field, cross-country and road running from the Elmbridge Sports Hub in Walton-on-Thames.",
    biography: [
      "Walton Athletic Club was founded in 1942 in Surrey, England. Based in Walton-on-Thames, it offers track and field, cross-country, road running and sportshall athletics, with coaching and competition for different ages and levels of experience.",
      "The club trains at the Elmbridge Sports Hub on Waterside Drive, where an eight-lane floodlit track is supported by jumps and throws facilities, changing rooms and a clubroom. Its academy introduces children in school years 4 to 7 to running, hurdling, jumping and throwing, while older athletes can progress through junior, senior and masters activity.",
      "Jim Hogan is part of Walton's historical athletics story: the Olympic Federation of Ireland records him joining the club after moving to England in 1960. He later became European marathon champion in 1966; this is not a claim about his club at that later championship. Prospective members should contact the academy or membership team to find the right group before completing the club's online forms."
    ],
    founded_year: 1942,
    notable_members: [{ name: "Jim Hogan", connection: "Historical member", detail: "The Olympic Federation of Ireland records him joining Walton AC after moving to England in 1960. His later European marathon title does not establish his club affiliation at that championship." }],
    sources: [{ title: "Club origins, disciplines and facilities", url: "https://waltonac.co.uk/about-us" }, { title: "Age groups and joining routes", url: "https://waltonac.co.uk/club-information/membership" }, { title: "Training venue and general enquiries", url: "https://waltonac.co.uk/contact-us" }, { title: "Olympic Federation of Ireland: Jim Hogan", url: "https://olympics.ie/athletes/james-jim-hogan/" }, { title: "Official club social link", url: "https://waltonac.co.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://waltonac.co.uk/", city: "Walton-on-Thames", address_kind: "training" },
    location_note: "The club identifies the Waterside Drive athletics arena behind the Xcel leisure complex as its training base, rather than a correspondence address."
  },
  "salford-metropolitan-ac": {
    summary: "Salford Metropolitan AC offers track-and-field, road, cross-country and sportshall athletics at Cleavley Athletics Track in Eccles, with age-group coaching.",
    biography: [
      "Salford Metropolitan Athletics Club trains at Cleavley Athletics Track in Eccles, Salford, England. It is a broad athletics club rather than solely a running group, with opportunities in sprinting, distance running, hurdles, throws and pole vault, as well as road running, cross-country and sportshall competition.",
      "The published programme separates younger juniors, older school-age athletes and seniors, with Monday and Thursday sessions and an additional Tuesday session for seniors. Coaches plan activities around each group, while people unsure which discipline to try are encouraged to explore different events. The club also describes social activities beyond training.",
      "Membership is available from age seven, but the membership page still carries a waiting-list notice labelled 2025. Families and new adult members should ask about current capacity rather than assume a place is available. The club publishes a membership email and a general contact form; these provide a route to discuss age groups, access needs and a suitable first visit."
    ],
    sources: [{ title: "Venue, age-group programme and competitions", url: "https://salfordmetac.co.uk/" }, { title: "Activities and enquiry form", url: "https://salfordmetac.co.uk/contact/" }, { title: "Membership age and dated waiting-list notice", url: "https://salfordmetac.co.uk/membership/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://salfordmetac.co.uk/", address: "Cleavley Athletics Track, Blantyre Street, Eccles, Salford", address_kind: "training" },
    location_note: "The official site identifies Cleavley Athletics Track on Blantyre Street; its M30 8HY postcode matches the directory. The vague Civic Centre wording is replaced.",
    contact_note: "Waiting-list information is dated 2025 and has not been assumed current. The age-seven minimum and school-year session groupings should be discussed with membership enquiries. No founding year established."
  },
  "watford-harriers": {
    summary: "Watford Harriers has provided athletics since 1925, with Woodside Stadium coaching, junior pathways and senior running on track, roads and trails.",
    biography: [
      "Watford Harriers Athletics Club was founded in 1925 and is based at Woodside Stadium in Watford, Hertfordshire, England. Track and field sits alongside road running and cross-country, with league competition and the club's open graded meetings providing opportunities to compete.",
      "The senior programme uses Woodside as a starting point for track, park, road and trail sessions. Tuesday and Thursday training offers choices for different levels of experience, while Cassiobury Park is another endurance-running venue. Juniors have separate multi-event and specialist groups, including sprinting, middle distance, hurdles, jumps and throws.",
      "Prospective senior members can arrange three free sessions before joining. Families should contact the membership secretary about the appropriate junior group and available spaces. Some specialist sessions are invitation-only and require agreement with the coach. Check arrangements before travelling: the club warns of a high volume of enquiries, and its general and junior pages differ on some specialist training times."
    ],
    founded_year: 1925,
    sources: [{ title: "History, disciplines and training conditions", url: "https://watfordharriers.org.uk/about-us" }, { title: "Senior programme and trial sessions", url: "https://watfordharriers.org.uk/seniors" }, { title: "Junior groups and specialist access", url: "https://watfordharriers.org.uk/juniors" }, { title: "Public role contacts and venue", url: "https://watfordharriers.org.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://watfordharriers.org.uk/", city: "Watford", address_kind: "training" },
    location_note: "Woodside Stadium is the confirmed athletics training base; Cassiobury Park serves separate running sessions.",
    contact_note: "General and junior pages disagree on javelin and high-jump days. No exact specialist timetable is promised; website-administration and clubhouse-hire inboxes are not general joining contacts."
  },
  "tri-lakeland": {
    summary: "Tri Lakeland is a Cockermouth-area triathlon club founded in 1987, with seasonal swimming, cycling and running across west Cumbria and the Lake District.",
    biography: [
      "Tri Lakeland is a triathlon club based around Cockermouth in Cumbria, England. It was formed on 20 May 1987 and affiliated to the British Triathlon Association that July. The club organises the Bassenthwaite sprint and standard-distance triathlons and offers members a varied swim-bike-run programme.",
      "Training follows the seasons: pool swimming at Workington runs through the colder months, while summer open-water sessions use private access from Bassenthwaite Sailing Club. Coached running takes place at the Copeland athletics track. Summer bike-and-run sessions leave from Cockermouth School, alongside club rides, winter indoor cycling and conditioning sessions.",
      "The club distinguishes coached running and gym work from its uncoached swimming and brick sessions. Regular participation requires membership, although a taster can be arranged before committing. Spond is used for booking and, where applicable, payment. Newcomers should contact the club to choose a suitable session, especially for swimming, where the programme expects reasonable competence rather than offering learn-to-swim lessons."
    ],
    founded_year: 1987,
    sources: [{ title: "Origins and affiliation", url: "https://www.trilakeland.com/about-2" }, { title: "Club area, events and enquiries", url: "https://www.trilakeland.com/" }, { title: "Seasonal training and booking conditions", url: "https://www.trilakeland.com/training" }, { title: "Club activities", url: "https://www.trilakeland.com/events" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.trilakeland.com/", city: "Cockermouth", address: "", postcode: "", location_precision: "area-only" },
    location_note: "The club describes a Cockermouth-area base with several west Cumbrian venues. An unconfirmed Whitehaven street address is omitted rather than presented as a clubhouse.",
    contact_note: "Arrange a taster with the club; regular sessions require membership and some have charges. Seasonal lake access is not permission for unsupervised public swimming. No unsupported alumni added."
  },
  "southport-strollers-running-club": {
    summary: "Southport Strollers Running Club began in 2018 and offers supported group runs, speed-and-stamina sessions and social race meet-ups in Southport.",
    biography: [
      "Southport Strollers Running Club is a community running club in Southport, Merseyside, England. Founded in 2018, it welcomes runners at different stages of their experience, with a shared emphasis on supporting individual progress. The club is affiliated to England Athletics, but individual athlete registration is optional.",
      "Its joining page describes Monday, Tuesday and Thursday evening sessions. Runners warm up together before splitting into smaller groups for outings of different distances, led by qualified run leaders. Monday work focuses on speed and stamina, and the programme also includes parkrun and race meet-ups.",
      "New members apply through the club's online membership page and receive a welcome brochure explaining how to get started. The official contact form handles questions about membership, club runs and interval sessions. Confirm the appropriate group and meeting point before attending; a published programme is not a reservation for a particular session."
    ],
    founded_year: 2018,
    sources: [{ title: "Club-managed membership page, origins and programme", url: "https://membermojo.co.uk/southportstrollers" }, { title: "Club enquiry form and published social links", url: "https://www.southportstrollers.co.uk/contact-us/" }],
    reviewed_at: "2026-10-16",
    contact_note: "The detailed training page timed out and the taster form returned 401. No current taster entitlement, exact meeting time, new address or founding-day precision is inferred."
  },
  "leven-valley-ac": {
    summary: "Leven Valley AC focuses on junior endurance running in south Cumbria, with track, cross-country, fell and road activity and a Furness Academy training base.",
    biography: [
      "Leven Valley Athletics Club is an endurance-running club in south Cumbria, England, with training at Furness Academy in Barrow-in-Furness and off-road sessions around the area. Its club-submitted Active Cumbria listing describes a particular focus on developing junior competitors, while also including senior runners.",
      "The programme combines track work with fell, cross-country and road running. The listing identifies a Tuesday track session and a Wednesday off-road run with changing meeting points. Prospective members should contact the club to confirm the present timetable and discuss a suitable starting group or access requirements.",
      "Jess Bailey illustrates the club's junior endurance tradition. In a published first-person interview she identified Leven Valley as her club and described cross-country, mountain running and summer track competition. England Athletics also documented her association with the club at the 2022 English National Cross Country Championships. These sources establish a historical association, not a fresh claim about her current club membership."
    ],
    notable_members: [{ name: "Jess Bailey", connection: "Documented junior endurance association", detail: "England Athletics identified her with Leven Valley at the 2022 National Cross Country Championships; her Kukri interview also names the club. Present membership has not been inferred." }],
    sources: [{ title: "Club-submitted programme, contact and venue information", url: "https://www.activecumbria.org/?cID=260&region_id=&sport_id=14" }, { title: "Jess Bailey first-person club account", url: "https://www.kukrisports.com/uk/ytp-jess-bailey/" }, { title: "England Athletics, 4 March 2022", url: "https://www.englandathletics.org/news/bringing-the-national-to-life/" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    location_note: "Furness Academy is the listed track-training venue. Active Cumbria's separate Newlands address is not presented as a training venue or clubhouse.",
    contact_note: "The Active Cumbria entry is submitted by the organising club and has no visible update date. Confirm current sessions directly; its inclusion is not a governance or accessibility verification."
  }
};
