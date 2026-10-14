import type { ClubProfile } from "./club-profiles";

// Club editorial histories only: no athlete accounts, result imports or membership verification.
export const cityAndCommunityProfiles: Record<string, ClubProfile> = {
  "city-of-plymouth-ac": {
    summary: "City of Plymouth Athletic Club offers track and field and cross-country coaching at Brickfields, now Foulston Park, in Devonport.",
    biography: [
      "City of Plymouth Athletic Club trains at Brickfields in Devonport, Plymouth, England, a sporting site now known as Foulston Park. Its history reaches back through Devonport YMCA Harriers, recorded in county competition in the 1920s, and Devonport AC, the name adopted in 1956. The City of Plymouth name followed in 1968; these are stages in a longer story rather than one certain founding date.",
      "The club’s archive records rapid Southern League progress in the early 1970s and the conversion of the cinder track to an all-weather surface in 1984. More recent investment in 2021 renewed the six-lane track and associated facilities. Today the programme spans sprints, hurdles, jumps, throws, endurance and cross-country, supported by volunteer coaches and officials.",
      "Training groups range from Panthers for younger children to junior development and senior squads. New members are directed to a 14-day trial registration before choosing a paid membership option. Use the club’s enquiry form to find the right group and confirm arrangements; guest and pay-as-you-go sessions have their own booking requirements."
    ],
    sources: [
      { title: "Club history, including corrections to the early account", url: "https://plymouthac.co.uk/club-history/" },
      { title: "Current facilities and coaching groups", url: "https://plymouthac.co.uk/" },
      { title: "Trial membership and booking guidance", url: "https://plymouthac.co.uk/membership-information/" },
      { title: "General enquiries", url: "https://plymouthac.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://plymouthac.co.uk/", address: "Foulston Park (Brickfields), Raglan Road, Devonport, Plymouth", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "The club identifies Raglan Road as the athletics-site location. The older Madden Road directory address is not used as an exact entrance pin; confirm access for the chosen session."
  },
  "city-of-preston-triathlon-club-for-juniors": {
    summary: "City of Preston Triathlon Club for Juniors introduces young people to swimming, cycling and running, from first sessions to junior racing.",
    biography: [
      "City of Preston Triathlon Club for Juniors is a grassroots multisport club in Preston, Lancashire, England. Its sessions are designed to help young athletes build swimming confidence, bike-handling skills and running technique in a supportive group. Beginners are welcome alongside children who already enjoy racing.",
      "The club describes a progression from play-based introductory sessions to more structured work on pacing, endurance and race tactics. It encourages participation in the North West junior triathlon series and supports committed athletes exploring regional academy or inter-regional opportunities. Parents receive updates about activities and progression.",
      "A serviceable bike, helmet, trainers and ordinary swimming kit are the starting equipment; specialist race gear is not a condition of joining. The website gives inconsistent upper ages, referring both to 8–16 and to a pathway through age 18. Families should confirm eligibility, current venues and session availability with the club before attending."
    ],
    sources: [{ title: "Junior programme, equipment and age guidance", url: "https://prestontriathlon.carrd.co/" }],
    reviewed_at: "2026-10-14",
    location_note: "UCLAN Sports Arena is the existing directory-listed venue. The club page does not establish that every swim, bike or run session meets there; check the session details."
  },
  "city-of-salisbury-ac-and-rc": {
    summary: "City of Salisbury Athletics & Running Club offers junior and senior athletics, road running and cross-country from its Five Rivers track base.",
    biography: [
      "City of Salisbury Athletics & Running Club, often shortened to CoSARC, brings track and field, cross-country and distance running together in Salisbury, Wiltshire, England. Its clubhouse is beside the athletics track reached through the Five Rivers Leisure Centre car park on Hulse Road. The club welcomes athletes from school Year 4, with a separate adult distance-running programme.",
      "Junior coaching covers introductory multi-event athletics and specialist disciplines as athletes progress. Senior groups train in endurance, sprints, hurdles, jumps and throws. Teams compete in track-and-field leagues and in road and cross-country competitions across Wiltshire, Hampshire and the South West; participation is encouraged at an appropriate level.",
      "The Salisbury 10 Mile is the club’s flagship spring road race. The Stonehenge Stomp brings runners and walkers together on countryside routes each January. Prospective members can contact the membership team to discuss joining and access to the Coacha booking system, while separate contacts handle road-running, welfare and event enquiries."
    ],
    sources: [
      { title: "Club sections, eligibility and community events", url: "https://www.salisbury-arc.org/" },
      { title: "Junior and senior coaching", url: "https://www.salisbury-arc.org/training" },
      { title: "Clubhouse and public role contacts", url: "https://www.salisbury-arc.org/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.salisbury-arc.org/", address: "Athletics Track, Five Rivers Leisure Centre, Hulse Road, Salisbury, SP1 3NR", address_kind: "clubhouse" },
    location_note: "The clubhouse and track are accessed from the Five Rivers car park. The separate registered office in West Winterslow is not a training venue."
  },
  "city-of-sheffield-and-dearne-ac": {
    summary: "City of Sheffield & Dearne AC offers athletics at Woodbourn Road, with a history of club mergers and an Olympic connection through Jessica Ennis-Hill.",
    biography: [
      "City of Sheffield & Dearne Athletic Club serves Sheffield and South Yorkshire, England, with coaching for runners, jumpers, throwers and combined-event athletes. Its outdoor training base is Woodbourn Road Athletics Centre, also identified by the club as Sheffield Hallam University City Athletics Stadium. Road running, cross-country and endurance events complement its track-and-field programme.",
      "The National Athletics League traces the club through Sheffield United Harriers and the 1975 merger with Sheffield City Athletic Club. The City of Sheffield name was adopted in 2000, followed by the merger with Dearne Athletic Club in 2015. The league’s account also recalls Jessica Ennis-Hill’s introduction to athletics at a Don Valley Stadium holiday event in 1996, the beginning of her association with the club and a career that brought Olympic and world titles.",
      "The club welcomes junior beginners through to senior competitors. Its membership page invites newcomers to discuss trial sessions with the membership secretary before committing, and describes annual membership including England Athletics affiliation. Contact the club to confirm the appropriate coaching group and meeting place."
    ],
    notable_members: [{ name: "Jessica Ennis-Hill", connection: "Historical club athlete", detail: "The National Athletics League’s club history recalls her 1996 introduction to athletics at Don Valley Stadium and subsequent Olympic and world titles." }],
    sources: [
      { title: "League history and Jessica Ennis-Hill association", url: "https://www.nationalathleticsleague.org.uk/club/city-of-sheffield-and-dearne-ac/" },
      { title: "Club disciplines and outdoor base", url: "https://sheffieldathletics.co.uk/" },
      { title: "Trial sessions and membership", url: "https://sheffieldathletics.co.uk/membership/" },
      { title: "Stadium and training venue", url: "https://sheffieldathletics.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Sheffield", website: "https://sheffieldathletics.co.uk/", address: "Woodbourn Road Athletics Centre, Sheffield", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "The club identifies Woodbourn Road as its primary outdoor training venue. Its contact page uses different postcodes for the stadium and training-centre descriptions, so no single postcode is asserted here."
  },
  "clapham-chasers": {
    summary: "Clapham Chasers is a volunteer-run running and triathlon club in south-west London, with swimming, cycling and beginner programmes alongside racing.",
    biography: [
      "Clapham Chasers began in November 2005 when local runners started meeting for a Monday run in south-west London, England. Shared races and regular outings grew into a club with its home at Trinity Fields in Wandsworth. Volunteers still organise its running, cycling, swimming and social programme.",
      "Training takes place across several venues: Battersea Park for track and tempo running, local pools for coached swimming, and Richmond Park and Regent’s Park for cycling sessions. Weekend rides and long runs explore other routes. The club competes across athletics and triathlon and organises the Thames Riverside 20, a race associated with spring marathon preparation.",
      "Beginner pathways include Team 10K, Build Up to Brighton cycling and a novice triathlon programme. Course dates and availability should be checked rather than assumed from older notices. Newcomers can arrange a taster, with separate enquiry addresses for membership, running, swimming and triathlon. Membership options are available with or without England Athletics affiliation."
    ],
    founded_year: 2005,
    sources: [
      { title: "Club origins and affiliations", url: "https://claphamchasers.co.uk/about-us" },
      { title: "Training venues and novice programmes", url: "https://claphamchasers.co.uk/" },
      { title: "Membership options", url: "https://claphamchasers.co.uk/memberships" },
      { title: "Role-specific enquiries", url: "https://claphamchasers.co.uk/contactus" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "London", website: "https://claphamchasers.co.uk/", address: "Trinity Fields Clubhouse, Wandsworth, London", postcode: "", address_kind: "clubhouse", location_precision: "area-only", sports: ["Running", "Athletics", "Triathlon", "Cycling", "Swimming"] },
    location_note: "Trinity Fields is the documented clubhouse. The former flat address is not presented as a public meeting place; many sessions start at other venues."
  },
  "dublin-university-cycling-and-triathlon-club": {
    summary: "Dublin University Cycling and Triathlon Club brings student cyclists and triathletes together at Trinity College Dublin for coached training and social rides.",
    biography: [
      "Dublin University Cycling and Triathlon Club is part of Trinity College Dublin’s sporting community in Dublin, Ireland. The university traces its cycling roots to the nineteenth century and records a revival in 2010. Today the club combines cycling and triathlon, welcoming both newcomers and experienced endurance athletes.",
      "Its programme includes outdoor rides, indoor cycling, coached swimming and runs with the university athletics club. Pool and cycling-studio sessions provide a campus-based starting point, while rides take members farther afield. Brunch after swimming is one of the club’s regular social traditions.",
      "The university’s club page links to registration and publishes cycling@tcd.ie for enquiries. An annual club membership supports training and activities; exchange students are advised to check separately about sports-centre access. Contact the club for the current term’s timetable and eligibility rather than relying on the older timetable displayed on the university page."
    ],
    sources: [{ title: "University club history, programme and direct contacts", url: "https://www.tcd.ie/sport/student-sport/sport-clubs/cycling--triathlon/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Dublin", county: "Dublin" },
    location_note: "Trinity College Dublin is the university base. Pool, studio, running and outdoor cycling sessions have different meeting arrangements; no general university-office address is presented as a club training point."
  },
  "fingal-triathlon-club": {
    summary: "Fingal Triathlon Club has offered junior and senior multisport training across north County Dublin since 2009 and organises racing in Skerries.",
    biography: [
      "Fingal Triathlon Club was set up in 2009 by people looking for varied training and company in north County Dublin, Ireland. It welcomes juniors and adults, from newcomers building confidence to athletes preparing for longer triathlons. Members also take part in swimming, cycling, running, duathlon and adventure racing without necessarily competing in every discipline.",
      "Training is spread across Fingal rather than based at one clubhouse. The club lists pool sessions at Sportlink and the National Aquatic Centre, sea swimming around Donabate and Tower Bay, and runs at Newbridge Park and Ardgillan Castle. Cycling routes reach into north Dublin and Meath. Members should check the current timetable and suitability of each session before attending.",
      "The club organises triathlon and aquabike events in Skerries alongside junior activities, skills sessions and social evenings. Membership is arranged through Triathlon Ireland, and the joining guidance requires Triathlon Ireland membership before training. The club secretary can explain trial arrangements, junior availability and how to book sessions."
    ],
    founded_year: 2009,
    sources: [
      { title: "Club origins, sections and events", url: "https://fingaltri.ie/" },
      { title: "Training locations", url: "https://fingaltri.ie/about-us/location" },
      { title: "Joining and training requirements", url: "https://fingaltri.ie/members/how-join" },
      { title: "Club enquiries", url: "https://fingaltri.ie/contact" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "The club operates across Fingal, north County Dublin. Swimming, cycling and running use different venues; no single training address is assigned."
  },
  "glin-tri-club": {
    summary: "Glin Tri Club was formed in 2017 on the Shannon Estuary in County Limerick, with local swim and cycle resources and its own triathlon.",
    biography: [
      "Glin Tri Club was formed in 2017 in Glin, County Limerick, Ireland. Its setting on the Shannon Estuary is central to the club’s identity, with swimming at Glin Pier featuring in its training information. The club brings swimming, cycling and running together for people interested in triathlon and local endurance sport.",
      "The website provides suggested cycling routes around Glin and training-plan resources for prospective triathletes. It also hosts information about the Glin Sprint Triathlon and Try A Tri; the 2026 event page records a race on 5 September. That past event is part of the club’s programme, not an announcement of a future edition.",
      "Triathlon Ireland lists a direct club enquiry email, and the club website has a contact form and a linked Facebook group. Prospective members should ask about current group sessions, membership and supervised swimming arrangements. The pier’s inclusion in a training guide does not mean a coached or safety-supported session is available whenever someone visits."
    ],
    founded_year: 2017,
    sources: [
      { title: "Club origins and estuary setting", url: "https://glintriclub.com/" },
      { title: "Local training resources", url: "https://glintriclub.com/training/" },
      { title: "2026 club triathlon", url: "https://glintriclub.com/glin-triathlon/" },
      { title: "Club enquiry form", url: "https://glintriclub.com/contact-us/" },
      { title: "Governing-body club directory", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Glin", website: "https://glintriclub.com/" },
    location_note: "Glin is the club’s base. Confirm the particular training or event meeting place; the pier is not a clubhouse or correspondence address."
  },
  "welsh-athletics-parc-bryn-bach-running-club": {
    summary: "Parc Bryn Bach Running Club in Tredegar offers road and cross-country running, with beginner pathways and seasonal park and leisure-centre meeting points.",
    biography: [
      "Parc Bryn Bach Running Club was formed in February 2008 under the name Club 69. Based in Tredegar, Wales, it is affiliated to Welsh Athletics and combines road running and cross-country competition with trail, track and longer-distance interests. Beginners and experienced runners share the club programme.",
      "The club describes a summer base at Parc Bryn Bach and a winter meeting point at Tredegar Leisure Centre, with Thursday training and additional track sessions. First Strides provides a supported route for newer runners, while its Couch to 5K programme has used nine-week courses. Check current notices for course intake and seasonal changes before attending.",
      "Volunteering is part of the club’s local role. Its published account describes involvement in Bryn Bach parkrun and support for junior parkrun, which is managed separately by Blaenau Gwent Athletics Club. Joining and general enquiries can be directed through the club’s published contacts."
    ],
    founded_year: 2008,
    sources: [{ title: "Origins, beginner pathways and community activity", url: "https://pbbrc.run/about/" }, { title: "Park operator’s club and seasonal venue listing", url: "https://www.parcbrynbach.co.uk/clubs" }],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://pbbrc.run/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Parc Bryn Bach is the summer base and Tredegar Leisure Centre the winter meeting point. The former combined timetable is not an exact street address; confirm the current session."
  },
  "welsh-athletics-paul-popham-running-club": {
    summary: "Paul Popham Running Club began in Swansea in 2016 and offers Learn 2 Run and coached groups, with a newer Haverfordwest programme.",
    biography: [
      "Paul Popham Running Club was founded in Swansea, Wales, in February 2016. Its original aim was to help people progress from starting running to completing 5K through an eight-week Learn 2 Run programme, followed by a Swansea Bay parkrun. The club marked its tenth anniversary in 2026.",
      "Swansea remains its flagship base, with Haverfordwest now offering another local programme. Beginner membership supports the Learn 2 Run pathway; full membership is aimed at runners able to cover 5K continuously and includes leader-led and coached groups. The emphasis is on individual progress, social support and finding a suitable group rather than keeping up with one fixed pace.",
      "The club also organises Wear Wally in support of Popham Kidney Support. New members can choose the Swansea or Haverfordwest joining route and ask about current sessions through the contact form or published telephone number. Its business-village contact address should not be mistaken for the start of every run."
    ],
    founded_year: 2016,
    sources: [
      { title: "Origins, anniversary and charity event", url: "https://www.paulpophamrunningclub.co.uk/" },
      { title: "Beginner and full membership programmes", url: "https://www.paulpophamrunningclub.co.uk/club-info/" },
      { title: "Swansea and Haverfordwest enquiries", url: "https://www.paulpophamrunningclub.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.paulpophamrunningclub.co.uk/" },
    location_note: "The club offers Swansea and Haverfordwest programmes. Its Tawe Business Village contact address is not presented as a training venue; use the relevant local session details."
  },
  "welsh-athletics-pegasus-running-club": {
    summary: "Pegasus Running Club has been part of Cardiff running since 1982, with coached and social sessions from Cathedral Green in Llandaff.",
    biography: [
      "Pegasus Running Club was created in Cardiff, Wales, in 1982 by BT engineers and friends inspired by the first London Marathon. Its history names Stuart Raven, Dennis Williams and Gary Fowler among the founders and explains that the Pegasus name came from the shoes they wore. The club originally met at Western Leisure Centre in Ely, where Atlanta Ladies RC was also based before later merging with Pegasus.",
      "Today the Welsh Athletics-affiliated club meets at Cathedral Green in Llandaff. Monday outings use an out-and-back format, Tuesday sessions focus on coached speed or hill work, and Wednesday social runs offer several distances. Qualified run leaders support the programme, which welcomes runners with different abilities and goals.",
      "Newcomers can use the club’s joining page or contact form to ask about a suitable first session. The contact page’s displayed email differs from its email-link destination, so the form is the clearer route until that discrepancy is resolved. Membership and session details are published separately."
    ],
    founded_year: 1982,
    sources: [{ title: "History, affiliation and weekly sessions", url: "https://pegasusrunningclub.org.uk/" }, { title: "Club email and enquiry form", url: "https://pegasusrunningclub.org.uk/contact-pegasus-running-club/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Cardiff", address_kind: "training" },
    location_note: "Cathedral Green in Llandaff is the published running-session meeting point. South Wales is the club’s region, not its town."
  },
  "welsh-athletics-pembrokeshire-harriers": {
    summary: "Pembrokeshire Harriers formed in 2001 from Cleddau AC and Preseli Harriers, combining track and field, road running and cross-country in the county.",
    biography: [
      "Pembrokeshire Harriers was formed in 2001 by the merger of Cleddau Athletic Club and Preseli Harriers. Based at the all-weather track at Haverfordwest High VC School in Haverfordwest, Wales, it brings track and field, cross-country and road running under one club. Cleddau’s roots date to 1970; Preseli was founded in 1988–89 by Gerald Codd.",
      "The club’s history celebrates predecessor athletes including Welsh cross-country and steeplechase representative Karl Palmer, national multi-event winner Teresa Andrews, and sprinter and hurdler Danielle Selly, who progressed to Great Britain junior representation. These achievements belong to the Preseli chapter of the club’s history, rather than establishing present membership.",
      "The club welcomes athletes from school Year 4 and encourages competition appropriate to ability. Junior track sessions run during school terms, while road-running contacts cover Haverfordwest and Pembroke groups. Published joining guidance requires registration and paid membership before training; families and adult newcomers should contact the membership team about current availability and fees."
    ],
    founded_year: 2001,
    notable_members: [
      { name: "Karl Palmer", connection: "Preseli Harriers predecessor club", detail: "The club history records his senior Welsh representation in cross-country and steeplechase." },
      { name: "Teresa Andrews", connection: "Preseli Harriers predecessor club", detail: "The club history records Welsh representation and an AAA national multi-event title." },
      { name: "Danielle Selly", connection: "Preseli Harriers predecessor club", detail: "The club history records Welsh and Great Britain junior representation in her sprinting and hurdling career." }
    ],
    sources: [
      { title: "Club merger and predecessor athletes", url: "https://www.pembrokeshireharriersac.co.uk/about-us/club-history" },
      { title: "Current home track and junior sessions", url: "https://www.pembrokeshireharriersac.co.uk/home" },
      { title: "Eligibility and registration requirements", url: "https://www.pembrokeshireharriersac.co.uk/membership/joining-and-membership" },
      { title: "Coaching and road-running contacts", url: "https://www.pembrokeshireharriersac.co.uk/coaches-and-contacts/contact-information" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address: "Athletics track, Haverfordwest High VC School, Haverfordwest", address_kind: "training", location_precision: "area-only" },
    location_note: "Haverfordwest High VC School is the track base. Road-running groups also operate elsewhere, including Pembroke; check the relevant group before travelling."
  },
  "welsh-athletics-pencoed-panthers": {
    summary: "Pencoed Panthers offers social and competitive running in Pencoed, with beginner and improver groups and participation in the Bridgend County Running League.",
    biography: [
      "Pencoed Panthers is a Welsh Athletics-affiliated running club in Pencoed, South Wales. The governing body lists road running, cross-country, trail and track-and-field activity, with navy and pink club colours. Its session structure provides routes for beginners, improvers and more experienced runners, alongside social groups.",
      "The Bridgend County Running League records the Panthers joining its local inter-club competition in 2017. That league brings neighbouring clubs together to host races and supply volunteers, with individual age-graded scoring and team competition. It gives members a local racing programme without requiring everyone to run at the same speed.",
      "Welsh Athletics lists Monday and Wednesday sessions and a monthly track session at Bridgend AC. Because a current street-level meeting point is not established here, new runners should contact the club before attending. Separate general and welfare email addresses are published in the governing-body listing."
    ],
    sources: [{ title: "Sessions, disciplines and direct club contacts", url: "https://www.welshathletics.org/en/club/view/pencoed-panthers" }, { title: "League history and club participation", url: "https://bridgendcountyrunningleague.wordpress.com/about/" }],
    reviewed_at: "2026-10-14",
    location_note: "Pencoed is the club’s local base. Ask for the current Monday or Wednesday meeting point; the monthly track session is listed at Bridgend AC."
  },
  "welsh-athletics-penyffordd-run-club": {
    summary: "Penyffordd Run Club began in 2016 and offers social running from the Red Lion, with routes around Flintshire and outings into North Wales and Cheshire.",
    biography: [
      "Penyffordd Run Club grew from a conversation between three friends after the 2016 Chester Metric Marathon. A village Facebook invitation brought thirteen people to its first run on 12 October 2016. The club serves Penyffordd and Penymynydd in Flintshire, Wales, and has been affiliated to Welsh Athletics since 2017.",
      "Regular runs start at the Red Lion car park in Penyffordd. Monday and Wednesday evenings offer different pace groups, with longer Saturday runs and periodic interval and hill sessions. Monthly Sunday social outings explore North Wales and Cheshire, often followed by breakfast. In March 2025 members made the club’s first European trip to the Lisbon half marathon.",
      "Adults can arrange a two-week consecutive trial before joining. The club asks newcomers to make contact first so run leaders can welcome them. Reflective clothing and lights are important for darker evenings, as some village routes use unlit roads without pavements. Its enquiry email and online calendar provide the practical starting points for a first visit."
    ],
    founded_year: 2016,
    sources: [
      { title: "Origins and first overseas club trip", url: "https://www.penyfforddrunclub.com/about-us" },
      { title: "Session programme and affiliation", url: "https://www.penyfforddrunclub.com/" },
      { title: "Adult trials, meeting point and equipment", url: "https://www.penyfforddrunclub.com/new-members-guide-1" },
      { title: "Club enquiries", url: "https://www.penyfforddrunclub.com/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { county: "Flintshire", address: "Red Lion car park, Penyffordd", address_kind: "training", location_precision: "area-only" },
    location_note: "The Red Lion car park is the regular club-run meeting point. Away runs and social outings use their advertised locations."
  }
};
