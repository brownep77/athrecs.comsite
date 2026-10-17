import type { ClubProfile } from "./club-profiles.ts";

// Official club, governing-body and primary community pages opened on 16 October 2026 UTC.
export const regionalAndInclusiveParticipationProfiles: Record<string, ClubProfile> = {
  "wolds-veteran-rc": {
    summary: "Wolds Veteran RC has supported masters runners around Grimsby since 1988, with a history of road racing, relays and community fundraising.",
    biography: [
      "Wolds Veteran Runners Club was formed in 1988 in the Grimsby area of North East Lincolnshire, England. A club account published by the British Masters Athletic Federation describes a group supporting masters runners of different abilities, with regular involvement in road races and masters relays.",
      "That account records how members kept connected during the 2020 restrictions. They organised predicted-time runs, entered the BMAF virtual 5K relays and took part in a team mileage challenge supporting a mental-health charity. These were activities in a particular season, rather than a current events programme.",
      "The same history highlights Lynne Higgins' strong W65 road performances in 2019 and 2020. Her association is recorded historically here, not as confirmation of present membership. Prospective runners should check the club's current joining arrangements and meeting place: the historical account does not establish a reliable present-day training timetable or enquiry contact."
    ],
    founded_year: 1988,
    notable_members: [{ name: "Lynne Higgins", connection: "Historical member", detail: "The club's June 2020 BMAF account highlights her W65 road-running performances in 2019 and 2020; current membership is not established." }],
    sources: [{ title: "Club account published by BMAF, 25 June 2020", url: "https://bmaf.org.uk/2020/06/25/wolds-veteran-runners-club/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Grimsby", county: "North East Lincolnshire", location_precision: "area-only" },
    contact_note: "The official website was unavailable during this review; current training and public contacts remain unconfirmed."
  },
  "woodthorpe-huffers-and-puffers": {
    summary: "Woodthorpe Huffers & Puffers is a member-run Nottingham running club welcoming beginners and social runners from its Thackeray's Lane Park meeting point.",
    biography: [
      "Woodthorpe Huffers and Puffers is a running club in Woodthorpe, Nottingham, England. It welcomes complete beginners as well as regular runners looking for company, with members sharing the work of organising the club rather than employing paid staff. England Athletics affiliation supports its organised running.",
      "The main Wednesday outing is a three-mile run from Thackeray's Lane Park beside the Vale pub. A warm-up precedes the run, and members also arrange informal Monday and Saturday outings. Routes take in local roads and parks, with countryside running providing a change of scenery.",
      "Social time is part of the club's character, including a monthly gathering after the Wednesday run and other group activities. Newcomers can try a run before deciding whether to join. The website provides a membership form, a general email and an enquiry form; runners should confirm the current session arrangements and whether recreational or competitive membership suits them."
    ],
    sources: [{ title: "Club and enquiries", url: "https://woodthorpehuffersandpuffers.co.uk/" }, { title: "Membership and club life", url: "https://woodthorpehuffersandpuffers.co.uk/about-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://woodthorpehuffersandpuffers.co.uk/", city: "Nottingham", address_kind: "training" },
    location_note: "Thackeray's Lane Park is the published meeting point; confirm the session before attending."
  },
  "wrekin-harriers": {
    summary: "Wrekin Harriers develops junior runners and athletes across Wellington and Shrewsbury, with FUNETICS, athletics and age-group competition.",
    biography: [
      "Wrekin Harriers is a junior running and athletics club serving Wellington and Shrewsbury in Shropshire, England. Formed in 2021, it affiliated to England Athletics on 31 March 2023. That year it also joined the Commonwealth Games legacy programme to offer FUNETICS activities for younger children.",
      "The programme uses several venues, including Wrekin College, Meole Brace and seasonal outdoor or indoor locations. Club information describes participation in the Shropshire Young Athletes League, county championships, Sportshall athletics and junior fell running, with additional relay and inter-county opportunities for some athletes.",
      "Families can enquire through the published club email before completing a membership form. The 2026–27 joining page describes athletes aged nine to eighteen alongside younger FUNETICS groups, while the homepage gives narrower age ranges. Parents should therefore confirm the right group, available places and venue directly. Annual membership options distinguish regular training from occasional attendance, and family discounts or longer payment arrangements are offered."
    ],
    founded_year: 2021,
    sources: [{ title: "Club origins and seasonal venues", url: "https://www.wrekinharriers.co.uk/" }, { title: "Membership 2026–27", url: "https://www.wrekinharriers.co.uk/become-a-member" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Wellington and Shrewsbury", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Training uses several Shropshire venues; confirm the age group and seasonal meeting point.",
    contact_note: "Homepage and joining-page age bands differ, including FUNETICS ages; ask the club which group is appropriate."
  },
  "wrekin-road-runners": {
    summary: "Wrekin Road Runners combines sociable, pace-group running around Telford and Wellington with a racing history dating to 1992.",
    biography: [
      "Wrekin Road Runners began in July 1992 in Telford, Shropshire, England. Its early headquarters were at Telford Ice Rink, and its first road race took place in the Town Park that November. The club's history records later success in cross-country and team relay competition alongside trips to races overseas.",
      "Today's programme offers led groups at different paces, with Tuesday outings from Sainsbury's in Telford and Thursday road sessions from Wellington Leisure Centre. Summer trail runs explore the Ercall and Wrekin woodland. Sessions can include intervals, hills and other fitness work, so the weekly schedule matters more than a single permanent starting point.",
      "New runners are directed to the joining and membership pages, where the club explains how its qualified leaders keep groups together. Its historical account names Sadie David as a 2008 Sexarathon Series winner. That is a dated sporting association, not a claim about current membership. Check the latest meeting location before attending."
    ],
    founded_year: 1992,
    notable_members: [{ name: "Sadie David", connection: "Historical club runner", detail: "The club's history records her victory in the 2008 Sexarathon Series; current membership is not asserted." }],
    sources: [{ title: "Club history", url: "https://www.wrekinroadrunners.net/club-history.html" }, { title: "Weekly organised runs", url: "https://www.wrekinroadrunners.net/weekly-organised-runs.html" }, { title: "Joining and enquiries", url: "https://www.wrekinroadrunners.net/join-uscontact-us.html" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    location_note: "Wellington Leisure Centre is the Thursday road-run base, not the start of every session.",
    contact_note: "The site's email button was obscured in this review; no email address has been guessed."
  },
  "wycombe-phoenix-harriers-and-ac": {
    summary: "Wycombe Phoenix Harriers & AC serves High Wycombe from Little Marlow, with junior development, specialist track and field coaching and cross-country.",
    biography: [
      "Wycombe Phoenix Harriers and AC serves High Wycombe and nearby Buckinghamshire communities in England. The club uses 1912 as its official foundation year, while its history also records earlier activity in 1910. It moved from Handy Cross to the Wycombe District Athletics Complex in Little Marlow in 2014.",
      "Volunteer coaches introduce children to running, jumping and throwing before they move towards specialist squads. The wider programme includes sprints, hurdles, distance running, pole vault and throws, with cross-country alongside track competition. Pippa Woolven appears in the club's history for her 2014 Commonwealth Games steeplechase participation and later international cross-country selection.",
      "Joining enquiries go through the club's topic-based contact form. Families should check squad availability carefully: the contact page says the youngest group has a waiting list, with training offered from nine although applications can be made from eight. Volunteering is another way to become involved, and the form routes those offers separately from athlete membership enquiries."
    ],
    founded_year: 1912,
    notable_members: [{ name: "Pippa Woolven", connection: "Historical club athlete", detail: "The club history records her 2014 Commonwealth Games steeplechase appearance and 2018 European cross-country selection; present membership is not implied." }],
    sources: [{ title: "History and community", url: "https://wycombephoenix.org/about/" }, { title: "Training squads", url: "https://wycombephoenix.org/" }, { title: "Joining enquiries and waiting lists", url: "https://wycombephoenix.org/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://wycombephoenix.org/", city: "Little Marlow", address: "Wycombe District Athletics Complex, Westhorpe Farm Lane, Little Marlow", address_kind: "training" },
    contact_note: "The club labels 1912 its official foundation while recording activity in 1910. Check current squad waiting lists before attending."
  },
  "wye-valley-runners": {
    summary: "Wye Valley Runners brings Hereford runners together for road and countryside outings and organises the Muddy Woody 6 and Crocodile 8.",
    biography: [
      "Wye Valley Runners is a running club based in Hereford, England, with an enthusiasm for the countryside beyond the city. Its approach is deliberately relaxed: members can take part as their time allows, whether they want regular company, better fitness or opportunities to race in the club vest.",
      "Monday and Wednesday evening runs usually start at Halo Leisure Centre on Holmer Road. Off-road outings make use of the surrounding landscape, while the members' app carries the latest run plans. The club also puts on events including the Muddy Woody 6 and Crocodile 8, bringing its volunteers into the wider local running scene.",
      "Prospective members are welcome to try the club for around a month before committing. Beginner training groups are advertised separately, so someone starting from scratch should ask about the next suitable programme. The public contact form is the enquiry route; check the current meeting point rather than assuming every outing leaves from the leisure centre."
    ],
    sources: [{ title: "Club, training and events", url: "https://www.wyevalleyrunners.co.uk/" }, { title: "Public enquiry form", url: "https://www.wyevalleyrunners.co.uk/contact-us" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    location_note: "Halo Leisure Centre is the usual base; the members' app gives session-specific locations."
  },
  "wymeswold-rc": {
    summary: "Wymeswold RC is a small Leicestershire running club with sociable group outings and a connection to the village's Waddle race.",
    biography: [
      "Wymeswold Running Club is based in Wymeswold, Leicestershire, England. Its activity-provider listing with Active Together describes a small, mixed running club for people aged sixteen and over, welcoming different abilities and placing enjoyment at the centre of its activities.",
      "The listing describes Tuesday and Thursday evening runs and members travelling together to local and overseas races. A separate parish-council account identifies Niall Gardam as a founder member and a former race director of the Wymeswold Waddle, linking the club with the village's wider community life. Neither source establishes a foundation year.",
      "Active Together publishes a named club enquiry contact, but its linked village website page was unavailable during this review. New runners should confirm that the listed sessions, eligibility and joining arrangements remain current before attending. The Brook Street directory address is not established as a training start, so this profile shows the village rather than directing runners to a particular house."
    ],
    notable_members: [{ name: "Niall Gardam", connection: "Founder member", detail: "Wymeswold Parish Council identifies him as a founder member and former Wymeswold Waddle race director; no founding date or current athletic membership is inferred." }],
    sources: [{ title: "Club-provided activity listing", url: "https://www.active-together.org/directory/wymeswold-running-club" }, { title: "Parish council biography", url: "https://www.wymeswoldparishcouncil.gov.uk/the-council?page=2" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Wymeswold", address: "", postcode: "", location_precision: "area-only" },
    contact_note: "Contact details are published in the activity-provider listing, not independently confirmed by a working club website; check the current programme."
  },
  "yate-and-district-ac": {
    summary: "Yate & District AC develops track and field athletes at Yate Outdoor Sports Complex, with a junior academy, specialist groups and adaptive athletics.",
    biography: [
      "Yate and District Athletic Club was formed in 1983 and is based in Yate, South Gloucestershire, England. Its home at Yate Outdoor Sports Complex has an eight-lane track and field-event facilities. Club volunteers helped establish the organisation that kept these facilities available to the local community.",
      "The junior academy rotates running, jumping and throwing activities, giving children a broad introduction before progression to specialist training. Club sessions extend through to masters athletes, and adaptive and para-athletics have a named coordinator. Westbury Harriers is identified as the club's endurance-running partner.",
      "The club's Hall of Fame records athletes with national representation, including Zoe Derham and Ryan Scott. These historical entries do not establish present membership. New families should contact the academy team, while the membership secretary handles joining enquiries for the wider club. The published training page does not currently promise separate masters-only sessions; confirm the appropriate group and booking arrangements before visiting."
    ],
    founded_year: 1983,
    notable_members: [{ name: "Zoe Derham", connection: "Historical Hall of Fame athlete", detail: "Yate's Hall of Fame records England representation in 2002–12 and Great Britain representation in 2005–12." }, { name: "Ryan Scott", connection: "Historical Hall of Fame athlete", detail: "Yate's Hall of Fame lists his Great Britain representation in 2006; current membership is not asserted." }],
    sources: [{ title: "Club programme", url: "https://yateac.co.uk/" }, { title: "Training", url: "https://yateac.co.uk/training/" }, { title: "Venue and community facilities", url: "https://yateac.co.uk/how-to-find-us/" }, { title: "Annual history", url: "https://yateac.co.uk/about-the-club/club-history/annual-review/" }, { title: "Hall of Fame", url: "https://yateac.co.uk/about-the-club/hall-of-fame/" }, { title: "Role contacts", url: "https://yateac.co.uk/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://yateac.co.uk/", city: "Yate", address: "Yate Outdoor Sports Complex, Broad Lane, Yate", address_kind: "training", sports: ["Athletics", "Running"] }
  },
  "yate-and-sodbury-striders": {
    summary: "Yate & Sodbury Striders focuses on masters runners aged 35 and over, with coached road, cross-country and track training in South Gloucestershire.",
    biography: [
      "Yate and Sodbury Striders is a masters running club in Yate and Chipping Sodbury, South Gloucestershire, England. It focuses on runners aged thirty-five and over who want to develop through coaching and competition, with England Athletics affiliation and a headquarters at Yate Outdoor Sports Complex.",
      "Training combines sessions at the Ridings with track work at YOSC. The published programme includes Tuesday morning training, an evening option by prior arrangement and Thursday track sessions. The club's association with Yate and District Athletic Club also creates opportunities to take part in track and field competition.",
      "Its May 2024 report records Caroline Nicholas, Marian Grace and Caroline Lavis earning age-group podium places in the Great Birmingham Run's England representative 10K. Those are dated achievements, not claims of current selection. Prospective members can contact the secretary or membership team to discuss their aims and confirm the right session, particularly where summer and winter meeting points differ."
    ],
    notable_members: [{ name: "Caroline Nicholas", connection: "Club athlete in 2024", detail: "The club's May 2024 report records second place in WV40 at the Great Birmingham Run England representative 10K." }, { name: "Marian Grace", connection: "Club athlete in 2024", detail: "The same report records second place in WV65 at the May 2024 England representative 10K in Birmingham." }, { name: "Caroline Lavis", connection: "Club athlete in 2024", detail: "The club records third place in WV75 at the May 2024 England representative 10K in Birmingham." }],
    sources: [{ title: "Club purpose and committee", url: "https://www.yateandsodburystriders.co.uk/" }, { title: "Training and enquiries", url: "https://www.yateandsodburystriders.co.uk/contact/" }, { title: "Competition pathways", url: "https://www.yateandsodburystriders.co.uk/membership/" }, { title: "Birmingham report, 6 May 2024", url: "https://www.yateandsodburystriders.co.uk/podium-places-for-yate-and-sodbury-striders-in-the-aj-bell-great-birmingham-run-england-athletics-ea-representative-10k-race-on-5th-may-2024/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Yate", address_kind: "training", sports: ["Running"] },
    location_note: "YOSC is the club headquarters and track base; other sessions use the Ridings and may require advance arrangement."
  },
  "yaxley-runners-and-joggers": {
    summary: "Yaxley Runners & Joggers has served the Peterborough area since 1986, combining sociable adult running with a junior athletics programme.",
    biography: [
      "Yaxley Runners and Joggers was formed in 1986 and draws members from Peterborough and the surrounding area of England. The club welcomes runners of different abilities, with regular training and social activities. Racing is an option rather than an obligation, and members are not expected to attend every club night.",
      "Monday sessions start at Hampton Sports Centre on Clayburn Road, where a beginners' rota pairs new arrivals with experienced members. Thursday meeting points vary around Peterborough to offer different routes and terrain, and members arrange longer weekend outings. New runners can contact the club or introduce themselves at a session.",
      "The junior section offers an athletics programme for eight- to sixteen-year-olds, meeting on Fridays outside the school summer holiday. Children can try sessions before joining, and competition is encouraged without being compulsory. Families should confirm current availability and forms with the club. Hampton is a training venue, not the starting point for every adult run."
    ],
    founded_year: 1986,
    sources: [{ title: "Club history and adult running", url: "https://www.yaxleyrunners.org.uk/" }, { title: "Junior athletics", url: "https://www.yaxleyrunners.org.uk/juniors/" }, { title: "Enquiries", url: "https://www.yaxleyrunners.org.uk/contact-us/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.yaxleyrunners.org.uk/", address: "Hampton Sports Centre, Clayburn Road, Hampton Hargate, Peterborough", address_kind: "training" }
  },
  "yeovil-olympiads-ac": {
    summary: "Yeovil Olympiads AC has developed Somerset athletes since 1969, with track and field coaching at the Bill Whistlecroft Athletics Arena.",
    biography: [
      "Yeovil Olympiads Athletic Club was established in 1969 in Yeovil, Somerset, England. Track and field is central to its identity, supported by an eight-lane arena and a clubhouse opened in 1988 in memory of former member Joanna France. A partnership with Wells City Harriers began in 2001, linking track competition with road and cross-country opportunities.",
      "The arena was renamed for Bill Whistlecroft in September 2014. The club's tribute describes his contribution as a coach, organiser and educator, and the renaming recognised a lifetime of work in local athletics. This is a historical association, not a current membership entry.",
      "The club provides training and organises open meetings, including the Yeovil Games. New athletes are asked to contact the club before trying a training night; the public contact page includes membership and secretary telephone numbers. Families can then check the appropriate coaching group, application process and current fees, including the club's published financial-assistance arrangements."
    ],
    founded_year: 1969,
    notable_members: [{ name: "Bill Whistlecroft", connection: "Historical coach and organiser", detail: "The club commemorates his contribution to Yeovil athletics; the arena was renamed in his honour in September 2014 following his death in 2013." }],
    sources: [{ title: "Origins, facilities and partnerships", url: "https://www.yeovilolympiads.com/" }, { title: "Bill Whistlecroft tribute", url: "https://www.yeovilolympiads.com/club-information/bill-whistlecroft" }, { title: "First-time enquiries", url: "https://www.yeovilolympiads.com/contact-us" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.yeovilolympiads.com/", address_kind: "training" },
    contact_note: "Published phone contacts are retained; JavaScript-obscured email addresses have not been guessed. Contact the club before a first training visit."
  },
  "yeovil-town-rrc": {
    summary: "Yeovil Town RRC combines road, cross-country and multi-terrain running with led groups, track training and its Yeovilton summer 5K series.",
    biography: [
      "Yeovil Town Road Running Club brings together runners in Yeovil, Somerset, England, from beginners and returning runners to experienced club racers. Despite its name, the programme extends beyond roads to cross-country and multi-terrain events, with some members also taking on night races.",
      "Tuesday club runs use groups matched to different distances and paces. The usual meeting point is Yeovil Town Football Club, with Goldenstones used when the football team is at home. Other opportunities include hill work, Thursday pub runs, Friday speed sessions at the Bill Whistlecroft Athletics Arena and longer weekend outings.",
      "The club contributes to local racing through events such as its six-race summer 5K series at Yeovilton. Newcomers can use the joining pages or public enquiry form to find a suitable group. Because venues and sessions vary, check the current calendar before travelling. The members-only Facebook group is for club communication rather than an unrestricted public information page."
    ],
    sources: [{ title: "Club and programme", url: "https://www.yeoviltownrrc.com/" }, { title: "Public enquiry form", url: "https://www.yeoviltownrrc.com/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.yeoviltownrrc.com/", address_kind: "training" },
    location_note: "The football-club base is session-specific; match nights and other training sessions use different venues."
  },
  "young-athletes-club": {
    summary: "Young Athletes Club offers junior athletics at Guildford Spectrum, founded in 2011 by masters athletes Virginia and Tony Mitchell.",
    biography: [
      "Young Athletes Club is based at Guildford Spectrum in Surrey, England. Virginia and Tony Mitchell launched it in 2011, bringing their experience as GB masters athletes to coaching children. The club describes Virginia's world and European masters success over 400 metres and 800 metres as part of that coaching background.",
      "Training uses the Spectrum's floodlit eight-lane athletics track. A junior pathway introduces younger children to athletics, while performance groups provide further development. The programme includes track and field, cross-country and Sportshall competition, with additional training camps during the Easter and summer holidays.",
      "Families should use the membership email or head-coach telephone number to discuss an appropriate place. The website advertises juniors from age six and performance age groups extending to U18, but some introductory age descriptions differ and waiting lists can apply. Confirm the school-year group, term dates and availability before making plans; a successful enquiry is not a guarantee of immediate admission."
    ],
    founded_year: 2011,
    notable_members: [{ name: "Virginia Mitchell", connection: "Co-founder and coach", detail: "The club identifies its 2011 co-founder as a GB masters athlete and world and European masters champion over 400m and 800m." }, { name: "Tony Mitchell", connection: "Co-founder and coach", detail: "The club identifies Tony as a GB masters athlete who co-founded Young Athletes Club with Virginia in 2011." }],
    sources: [{ title: "Club origins and coaching", url: "https://www.young-athletes.co.uk/" }, { title: "Joining and public contacts", url: "https://www.young-athletes.co.uk/how-to-join/" }],
    reviewed_at: "2026-10-16",
    corrections: { address_kind: "training" },
    contact_note: "Confirm current school-year eligibility, waiting lists and term dates; the website's age descriptions are not uniform."
  },
  "zero-to-hero-runners": {
    summary: "Zero to Hero Runners helps beginners start running in Bromley's Norman Park, with a free group programme listed by local community partners.",
    biography: [
      "Zero to Hero Runners is a beginner-focused running group in Bromley, south-east London, England. Bromley Council lists it among activities in the borough's green spaces, describing free group running based mainly in Norman Park and intended to help people take their first steps into the sport.",
      "The local Pro-Active Bromley partnership describes a gradual course supported by practice between group sessions. Its account also highlights the social side, with time for refreshments after a run. Wednesday mornings are listed by both community sources, although their precise timings differ, so those times should not be treated as a confirmed current booking.",
      "Prospective runners should register their interest and ask when the next course begins before attending. The council links to zero2hero.org.uk, but that site was unavailable during this review. Current enquiries, course dates and exact meeting arrangements therefore remain to be confirmed; the park location is useful orientation, not a promise that a group will be present on arrival."
    ],
    sources: [{ title: "Bromley Council activity listing", url: "https://www.bromley.gov.uk/parks-open-spaces/wellbeing-bromley%E2%80%99s-green-spaces" }, { title: "Pro-Active Bromley beginner programme", url: "https://proactivebromley.org.uk/find/zerotohero/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://zero2hero.org.uk/", address_kind: "training" },
    contact_note: "The council-linked replacement website was unavailable. Partner pages give different Wednesday times; confirm the next course and meeting point."
  },
  "british-wheelchair-athletics-association": {
    summary: "The British Wheelchair Athletics Association supports wheelchair track and field, with a long-standing emphasis on seated throws and athlete development.",
    biography: [
      "The British Wheelchair Athletics Association was established in 1982 to promote athletics for people who use wheelchairs because of disability. Its original emphasis was on giving people with spinal cord injuries access to field events, a purpose the association says remains central to its work across Britain.",
      "Its disciplines include seated shot, discus, javelin and club throwing, using throwing frames adapted to athletes' needs. The association also publishes information on combined events, classification and athlete development. Its programme includes Grand Prix competitions and training opportunities rather than a single weekly local running group.",
      "A January 2026 notice moved that year's Grand Prix to Coventry Godiva Track because of redevelopment at Stoke Mandeville. This does not make Coventry the permanent base for every activity. The public contacts can advise on current events and joining, as the membership page still says information is forthcoming. The Croston address is for correspondence, not a place to arrive for training."
    ],
    founded_year: 1982,
    scope: "national",
    sources: [{ title: "Association origins", url: "https://www.bwaa.co.uk/" }, { title: "Disciplines", url: "https://www.bwaa.co.uk/disciplines/" }, { title: "2026 Grand Prix venue notice", url: "https://www.bwaa.co.uk/2026/01/30/grand-prix-change-of-venue/" }, { title: "Public contacts", url: "https://www.bwaa.co.uk/contact/" }, { title: "Joining information", url: "https://www.bwaa.co.uk/joinus/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Croston", address_kind: "correspondence" },
    location_note: "The Croston contact address is not a training venue. Events use separately announced locations; the 2026 Grand Prix notice names Coventry."
  },
  "black-girls-do-run-uk": {
    summary: "Black Girls Do Run UK is a London running community and charity, founded in 2019 to increase Black women's participation and visibility in distance running.",
    biography: [
      "Black Girls Do Run UK began in London, England, in 2019 when Tasha Thompson set out to make everyday Black women runners more visible. Starting with an Instagram page and support from friends, the community grew into an England Athletics-affiliated club and became a registered charity in October 2023.",
      "The group welcomes Black women aged eighteen and over, from first-time runners to experienced distance runners. Free, led social runs take place in several parts of London, with local groups in the east, north-west and south. Its work also includes a kit lending library, a support fund and development opportunities for Black women run leaders.",
      "Prospective participants can follow the website's run and event links to find the next suitable outing. Published pages differ on some weekday details, so the current booking information should guide attendance. This is an in-person London community with an online presence, not a club whose activities take place only virtually."
    ],
    founded_year: 2019,
    notable_members: [{ name: "Tasha Thompson", connection: "Founder", detail: "The organisation's own history identifies Tasha as its founder in 2019; this is a leadership association, not an athlete identity or verified membership claim." }],
    sources: [{ title: "Origins and charitable development", url: "https://www.blackgirlsdorun.co.uk/about-black-girls-do-run" }, { title: "Runs and community programmes", url: "https://www.blackgirlsdorun.co.uk/" }, { title: "Enquiry and run routing", url: "https://www.blackgirlsdorun.co.uk/contact-us" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "London", virtual: false, location_precision: "area-only" },
    location_note: "Runs take place at multiple London locations; use the current event details for the meeting point."
  },
  "benson-striders": {
    summary: "Benson Striders is a sociable Oxfordshire running club founded in 2010, with small ability groups exploring village roads, Thames paths and the Chilterns.",
    biography: [
      "Benson Striders was established in 2010 in Benson, South Oxfordshire, England, by two beginners who wanted to encourage others to enjoy running. It has grown into a club for novice runners and people preparing for marathons or ultras, while retaining a sociable, supportive approach.",
      "Small groups run different distances on roads, footpaths and bridleways around the village. Summer routes can follow the Thames towpath, while winter outings use country lanes towards places such as Warborough, Ewelme and Chalgrove. Members also enter local races together, with experienced runners offering training company and advice.",
      "The England Athletics-affiliated club invites people already able to run around 5K to arrange a free Saturday trial by email. Its regular Saturday gathering starts at Benson Parish Hall, with other sessions using seasonal meeting points. Prospective runners should confirm the next outing and suitable group. Coffee and organised social evenings give members opportunities to meet beyond training and racing."
    ],
    founded_year: 2010,
    sources: [{ title: "Club history and trial arrangements", url: "https://bensonstriders.com/info" }, { title: "Current club run information", url: "https://bensonstriders.com/" }, { title: "Contact page", url: "https://bensonstriders.com/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://bensonstriders.com/", address_kind: "training", sports: ["Running"] },
    contact_note: "The free Saturday trial is described for runners able to cover about 5K; arrange it with the club first."
  },
  "barnt-green-chuggers": {
    summary: "Barnt Green Chuggers is the running side of a sociable running and cycling club formed in 2005 at Barnt Green Sports Club.",
    biography: [
      "Barnt Green Chuggers is the running section of the Chuggers and Chaingang club in Barnt Green, Worcestershire, England. Formed in 2005, the club brings adults together for recreational running and cycling, with experienced volunteer leaders rather than a formal coaching or competition-led programme.",
      "Monday evening runs leave Barnt Green Sports Club in groups matched by pace and distance. The surrounding Worcestershire countryside provides routes for both runners and riders, while the sports club offers changing facilities and a place to socialise afterwards. Monthly curry evenings and other gatherings are part of the club's social life.",
      "Membership is for people aged eighteen and over and includes arrangements with the parent sports club. New runners can enquire about trial runs through the contact form. Anyone interested in the Chaingang cycling side should book an introductory ride instead of simply turning up, so the leaders can explain group-riding arrangements. Check the latest membership guide and session details before attending."
    ],
    founded_year: 2005,
    sources: [{ title: "Origins and joining", url: "https://barntgreenchuggers.co.uk/about-us" }, { title: "Club activities", url: "https://barntgreenchuggers.co.uk/" }, { title: "Training base and enquiry form", url: "https://barntgreenchuggers.co.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://barntgreenchuggers.co.uk/", city: "Barnt Green", address: "Barnt Green Sports Club, Margesson Drive, Barnt Green", address_kind: "clubhouse" }
  },
  "brentwood-running-club": {
    summary: "Brentwood Running Club began as Thrift Green Trotters in 1987 and combines Essex group running with a long-standing commitment to local charities.",
    biography: [
      "Brentwood Running Club was founded in Brentwood, Essex, England, in 1987 by Brian Carter, John Hayman and Alf Overy. Originally called Thrift Green Trotters, it adopted its current name in 2018 while retaining an emphasis on fitness, friendship and shared enjoyment of running.",
      "The main Wednesday run starts at the Brentwood Centre, with led pace groups for different abilities. Other outings include shorter social runs, Friday hills and longer weekend training. Some locations change between summer and winter, so members use the club's current communications to confirm where to meet.",
      "Fundraising is a significant part of club life, including support for Saint Francis Hospice and members' London Marathon efforts. People considering membership can use the public email or contact form to ask about an appropriate group or beginner course. The Brentwood Centre is a regular training base, not the start of every outing; check the session details before travelling."
    ],
    founded_year: 1987,
    sources: [{ title: "Origins, former name and charity work", url: "https://www.brentwoodrunningclub.co.uk/about" }, { title: "Weekly runs", url: "https://www.brentwoodrunningclub.co.uk/weekly-runs" }, { title: "Membership enquiries", url: "https://www.brentwoodrunningclub.co.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.brentwoodrunningclub.co.uk/", city: "Brentwood", address_kind: "training" }
  }
};
