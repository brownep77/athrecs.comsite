import type { ClubProfile } from "./club-profiles";

// Researched club descriptions, not athlete identity or membership verification.
export const runningAndTriathlonCommunityProfiles: Record<string, ClubProfile> = {
  "chapel-allerton-runners": {
    summary: "Chapel Allerton Runners brings together road, cross-country and fell runners in north Leeds, with Wednesday club runs and Monday intervals.",
    biography: [
      "Chapel Allerton Runners is based at Gledhow Sports & Social Club in Leeds, West Yorkshire, England. The club records an athletics affiliation dating back to 1992. Members enter road, cross-country and fell races, but joining does not have to revolve around racing: keeping fit and having company on a run are equally familiar reasons for coming along.",
      "Wednesday is the main club night, with routes of roughly four to eight miles and groups running at different speeds. Winter outings use lit streets; summer routes explore the green spaces of north Leeds and sometimes start away from Gledhow. Monday interval sessions use local tracks or other suitable routes, with arrangements announced on the club website.",
      "The club’s calendar includes cross-country leagues, team relays, parkrun activities and social events. Membership combines the running club’s athletics affiliation with Gledhow Sports & Social Club membership. New runners should email ahead and check that week’s meeting point, especially during the summer."
    ],
    sources: [
      { title: "Club background, runs and enquiries", url: "https://chapelallertonrunners.com/?page_id=167" },
      { title: "Membership arrangements", url: "https://chapelallertonrunners.com/?page_id=20" },
      { title: "Current club notices and activities", url: "https://chapelallertonrunners.com/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { county: "West Yorkshire", address_kind: "training", website: "https://chapelallertonrunners.com/" },
    location_note: "Gledhow Sports & Social Club is the usual meeting place, not a guarantee of the start point for every run. Check the club’s weekly notice."
  },
  "chase-harriers": {
    summary: "Chase Harriers runs in Cannock and on Cannock Chase, with twice-weekly group sessions, social running and shared race outings.",
    biography: [
      "Chase Harriers is a running club in Cannock, Staffordshire, England. Its Tuesday and Thursday evening sessions bring together runners with different goals, from regular exercise and conversation to preparing for a race. The club describes tail runners and group support as part of keeping those sessions welcoming.",
      "The landscape changes with the seasons. Winter runs meet at Cannock Chase Leisure Centre on Stafford Road and use road routes, including loops and out-and-back sessions. In the lighter months the group moves to the White House car park on Cannock Chase for off-road running. The published meeting time is 6.15pm for a 6.30pm start, with runs lasting about an hour.",
      "Members also meet at parkrun, train with other local clubs and take on races together. The club’s enquiry email is the best starting point for a first visit: confirm the current seasonal venue and explain the distance or pace you are comfortable with."
    ],
    sources: [
      { title: "Club approach and seasonal training", url: "https://chaseharriers.co.uk/about-us/" },
      { title: "Meeting points and club contacts", url: "https://chaseharriers.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address_kind: "training", website: "https://chaseharriers.co.uk/" },
    location_note: "The leisure centre is the winter training meeting point. Summer sessions use the White House car park on Cannock Chase; confirm the precise start with the club."
  },
  "chatteris-running-club": {
    summary: "Chatteris Running Club offers coached road running in Cambridgeshire, with twice-weekly sessions and occasional Couch to 5K courses.",
    biography: [
      "Chatteris Running Club serves runners in Chatteris, Cambridgeshire, England. Its twice-weekly sessions cater for a mixture of abilities, from people establishing a running routine to experienced members working towards their next race. Qualified run leaders and a coach support the road-running programme.",
      "Newcomers can try four sessions before deciding whether to join. The club also organises Couch to 5K courses periodically, rather than promising a continuous intake; prospective beginners should ask when the next course is planned. Members have access to training-plan resources as well as group sessions.",
      "Membership runs from April to March and includes England Athletics affiliation, with separate junior and student categories described on the joining page. The club publishes an enquiry email and a contact form. Use these to confirm the right group and meeting point before attending."
    ],
    sources: [
      { title: "Club sessions and beginner courses", url: "https://www.chatterisrunningclub.co.uk/" },
      { title: "Joining and membership", url: "https://www.chatterisrunningclub.co.uk/joincrc" },
      { title: "Club enquiries", url: "https://www.chatterisrunningclub.co.uk/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.chatterisrunningclub.co.uk/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Chatteris is the club’s operating area. A previous directory street address has not been established as a training venue; ask the club for the current meeting point."
  },
  "cheadle-rc": {
    summary: "Cheadle Running Club is based at South Moorlands Leisure Centre in Staffordshire, with road, cross-country and fell running for members over 16.",
    biography: [
      "Cheadle Running Club meets in Cheadle, Staffordshire, England, rather than the town of the same name in Cheshire. South Moorlands Leisure Centre on Allen Street is its usual starting point. Members run on roads, over cross-country courses and on the fells, with some focused on competition and others mainly enjoying the fitness and social side.",
      "The published club sessions are Wednesday evenings and Sunday mornings, with groups arranged to suit different runners. Cheadle competes in the North Staffordshire Cross Country League and organises races including the Cheadle Spring 5 and Cheadle 4, alongside club handicaps. The Cheadle 4 also supports local charitable fundraising.",
      "Membership is for runners over 16, and prospective members can arrange a month’s trial. The club does not advertise a dedicated beginners’ group, although it can discuss a shorter introductory run. Its contact form is the place to explain your experience and check the next suitable session."
    ],
    sources: [
      { title: "Club activities, races and joining questions", url: "https://cheadlerunningclub.com/about/" },
      { title: "Club contact form", url: "https://cheadlerunningclub.com/contact/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address_kind: "training", website: "https://cheadlerunningclub.com/" },
    location_note: "South Moorlands Leisure Centre, Allen Street, Cheadle, Staffordshire ST10 1HJ is the training meeting point."
  },
  "chelmsford-ac": {
    summary: "Founded in 1934, Chelmsford Athletics Club develops track and field, road and cross-country athletes at Melbourne Athletics Stadium in Essex.",
    biography: [
      "Chelmsford Athletics Club was founded in 1934 and is based at Melbourne Athletics Stadium in Chelmsford, Essex, England. Its programme spans track and field, road running and cross-country. This is a competition-focused club: athletes are expected to train regularly and represent Chelmsford in appropriate events.",
      "The club’s coaching pathway starts from age 11 in school year six, with a development group for years six and seven and specialist groups beyond that stage. Places depend on coaching capacity and suitability, so a membership enquiry is not an automatic offer of a place. Adults can also ask about training and trial arrangements, while parents or guardians handle enquiries for under-18s.",
      "Its history includes Brian Hill-Cottingham, who joined in 1953 and became the club’s first international when he represented England at cross-country in 1960. Chelmsford’s tribute also records his later coaching and practical contribution to the clubhouse. That long involvement links the club’s competitive history with the volunteers who sustain its day-to-day work."
    ],
    founded_year: 1934,
    notable_members: [{ name: "Brian Hill-Cottingham", connection: "Historical athlete and coach", detail: "Joined Chelmsford in 1953 and became its first international through England cross-country selection in 1960; later coached younger athletes and helped with the clubhouse." }],
    sources: [
      { title: "Club origins and disciplines", url: "https://www.chelmsford-athletics.club/" },
      { title: "Coaching ages, trials and membership enquiries", url: "https://www.chelmsford-athletics.club/membership-enquiries" },
      { title: "Stadium and club contact", url: "https://www.chelmsford-athletics.club/contact-us" },
      { title: "Club tribute to Brian Hill-Cottingham", url: "https://www.chelmsford-athletics.club/post/brian-hill-cottingham-a-chelmsford-ac-legend-remembered" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address: "Melbourne Athletics Stadium, Salerno Way, Chelmsford, Essex, CM1 2EH", address_kind: "training", website: "https://www.chelmsford-athletics.club/" },
    location_note: "Melbourne Athletics Stadium is the club’s training base. Coaching availability and session arrangements should be confirmed before visiting."
  },
  "cherwell-runners-and-joggers": {
    summary: "Cherwell Runners & Joggers is a Banbury running club founded in 1990, offering paced group runs, coached sessions and social running.",
    biography: [
      "Cherwell Runners & Joggers began with eight local runners in 1990. Based in Banbury, Oxfordshire, England, it has grown around a straightforward idea: runners with different speeds and ambitions should be able to enjoy the same club. Its activities range from building confidence after Couch to 5K to preparing for marathons.",
      "Tuesday is the main entry point for newcomers, with several paced groups meeting at the pool-side entrance to Woodgreen Leisure Centre. Thursday outings are for members and include hill work, mixed-pace sessions and a coached session on the first Thursday of the month. Some runs head onto cross-country routes or finish with a pub visit.",
      "Cherwell also organises the Hornton 6 and maintains a social calendar alongside its regular training. The club offers two trial runs and asks prospective members to contact it beforehand, so the leaders can suggest a suitable group and explain the meeting arrangements."
    ],
    founded_year: 1990,
    sources: [
      { title: "Club beginnings and approach", url: "https://cherwellrunners.org.uk/about-us-banburys-friendly-running-club" },
      { title: "Training and newcomer arrangements", url: "https://cherwellrunners.org.uk/" },
      { title: "Club contacts", url: "https://cherwellrunners.org.uk/contacts" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Banbury", address: "Woodgreen Leisure Centre, Woodgreen Avenue, Banbury, OX16 0HS", address_kind: "training", website: "https://cherwellrunners.org.uk/" },
    location_note: "Tuesday runs meet at Woodgreen Leisure Centre’s pool-side entrance. Other sessions can have different arrangements."
  },
  "cheshire-dragons": {
    summary: "Cheshire Dragons grew from a Cuddington training group and now brings runners together for road, trail, grass and track sessions in Cheshire.",
    biography: [
      "Cheshire Dragons grew out of the BJT training group in Cuddington, Cheshire, England. Welsh Masters international Bernie Jones had been setting sessions for the group before it became a formal club during the Covid period. The club’s account links that change to the restrictions on informal gatherings and the opportunity for organised club training to resume.",
      "Members come from Cheshire and North Wales, with sessions mainly around Cuddington, Hartford and Rudheath. Training makes use of roads, trails, grass and tracks; the published pattern includes recovery runs, a midweek workout and longer weekend outings. Meeting points vary, so the club’s current arrangements matter more than a single postal address.",
      "The membership page provides a route through MemberMojo and explains first-claim and second-claim membership. Prospective runners can use the named club contact to ask about joining a session. The club’s Facebook group and Instagram account provide further ways to follow its activities."
    ],
    notable_members: [{ name: "Bernie Jones", connection: "Coach of the club’s predecessor training group", detail: "The club identifies Welsh Masters international Bernie Jones as the coach who set sessions for the Cuddington BJT group from which Cheshire Dragons developed." }],
    sources: [
      { title: "Origins and training group", url: "http://www.cheshiredragons.com/about-us/" },
      { title: "Club membership", url: "http://www.cheshiredragons.com/membership/" },
      { title: "Club enquiries and operating area", url: "http://www.cheshiredragons.com/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Cuddington", county: "Cheshire", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Training uses several locations around Cuddington, Hartford and Rudheath. No single clubhouse or postal address is established here.",
    contact_note: "Use the named club enquiry contact. Unrelated template email, telephone and address text appearing on the website has not been included."
  },
  "northumberland-fell-runners": {
    summary: "Northumberland Fell Runners is a regional fell-running club formed in 1997, with members across north-east England meeting at races and mountain events.",
    biography: [
      "Northumberland Fell Runners was formed in 1997 as a specialist fell-running club in north-east England. Its members are spread across Northumberland and the wider region, rather than gathering at one town’s track or clubhouse. The club’s own description makes an important distinction for newcomers: it meets at races, not at a regular weekly training night.",
      "Members take part in local fell races and travel to the Lake District and other mountain areas. Mountain marathons and longer challenges, including the Bob Graham Round, are also part of club life. An annual club championship and awards dinner give these geographically scattered runners a shared calendar.",
      "The website carries race reports, club history and membership forms, with an email group used to keep members in touch. Anyone considering joining can contact the secretary to discuss the club and suitable events. An old directory address in Scotland should not be mistaken for the club’s regional base or a training venue."
    ],
    founded_year: 1997,
    sources: [
      { title: "Club origins, regional membership and activities", url: "http://www.northumberlandfellrunners.co.uk/?page_id=16" },
      { title: "Joining the club", url: "http://www.northumberlandfellrunners.co.uk/?page_id=39" },
      { title: "Club secretary and welfare contacts", url: "http://www.northumberlandfellrunners.co.uk/?page_id=498" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "", county: "Northumberland", country: "England", region: "North East", address: "", postcode: "", location_precision: "area-only" },
    location_note: "A regional north-east England club without a regular weekly meeting venue. The former Scottish directory address is not presented as its headquarters or training base."
  },
  "247triathlon-club": {
    summary: "Letterkenny 24/7 Triathlon Club supports swimming, cycling and running in Donegal, from first triathlons to middle-distance racing.",
    biography: [
      "Letterkenny 24/7 Triathlon Club is based in Letterkenny, County Donegal, Ireland. Its programme brings swimming, cycling and running into one club, with coached sessions and training partners for newcomers as well as experienced competitors. Members can work towards a first triathlon or build towards longer events without having to train for every discipline alone.",
      "The published training programme uses Aura Leisure Centre for pool swimming, run sessions and cycle meet-ups. Summer activities extend to open-water swimming at Gartan Outdoor Centre, with safety arrangements and cover, and brick sessions or time trials around Foxhall. Prospective members should check the latest club notes and booking arrangements rather than relying on an old timetable.",
      "The club’s events include the Letterkenny Try a Tri, Gartan Sprint Triathlon and Sheephaven 70.3 in the Downings area. Its joining guidance encourages people to sample training before committing, while ongoing membership involves both the club and Triathlon Ireland. Contact the secretaries to arrange an introduction and confirm eligibility for the session you want to attend."
    ],
    sources: [
      { title: "Club and its events", url: "https://letterkenny247.com/about-the-club" },
      { title: "Training locations and introductory sessions", url: "https://letterkenny247.com/training-schedules" },
      { title: "Joining guidance", url: "https://letterkenny247.com/join-us" },
      { title: "Club officers and enquiries", url: "https://letterkenny247.com/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Letterkenny", website: "https://letterkenny247.com/" },
    location_note: "Aura Leisure Centre and Gartan Outdoor Centre are training locations, not a single club correspondence address. Confirm the venue and booking for each session.",
    contact_note: "The joining page still contains older licence prices. Check current fees and age eligibility with the club rather than using that historic price table."
  },
  "ams-triathlon": {
    summary: "AMS Triathlon, founded in 2011, is a Dublin multisport club serving the Dublin 7 and Dublin 15 areas, from first triathlons to long-distance challenges.",
    biography: [
      "AMS Triathlon, also known as Activ Multi Sport, was formed in March 2011 in the Dublin 7 and Dublin 15 areas of Ireland. Its catchment stretches from Cabra towards Ratoath. Members take on sprint triathlons and longer races, but the club also makes room for standalone swimming, running and cycling, adventure races, aquathlons and duathlons.",
      "Its published training information describes a network of venues rather than one clubhouse: pools in Cabra, Blanchardstown and Coolmine, running in Phoenix Park and at track facilities, and group rides. Some of that material refers to older seasons, so prospective members should ask for the current calendar before choosing a session.",
      "Information evenings and social gatherings sit alongside the sporting programme. Joining is arranged through the club and Triathlon Ireland, with a public enquiry email for initial questions. The website records that the junior section was put on hold in 2023; a current junior intake has not been confirmed, so families should enquire rather than assume a place is available."
    ],
    founded_year: 2011,
    sources: [
      { title: "Club formation and activities", url: "https://www.amstriathlon.ie/about.html" },
      { title: "Published training venues", url: "https://www.amstriathlon.ie/training.html" },
      { title: "Joining AMS", url: "https://www.amstriathlon.ie/joinams.html" },
      { title: "Triathlon Ireland club directory", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Dublin", county: "Dublin", website: "https://www.amstriathlon.ie/" },
    location_note: "Serving Dublin 7 and Dublin 15, with training at several venues. No single clubhouse address is asserted.",
    contact_note: "Ask for the current training calendar. Older timetable and junior-membership material should not be treated as confirmation of an active junior programme."
  },
  "ballybunion-tc": {
    summary: "Ballybunion Triathlon Club brings multisport activity to the north Kerry coast, with a local duathlon and an open route for membership enquiries.",
    biography: [
      "Ballybunion Triathlon Club is based in Ballybunion, County Kerry, Ireland. The club’s website dates its first event to 2021 and describes its duathlon as a way to bring people together around sport in the coastal town. That event milestone is documented; it is not treated here as a confirmed club founding date.",
      "The club’s 2026 duathlon announcement set out a three-kilometre run, a twenty-kilometre cycle and a five-kilometre run, using the town’s coastal setting and the roads towards Beale Hill. It illustrates the club’s local organising role, rather than serving as a standing training timetable or an invitation to an event that has already passed.",
      "Ballybunion is listed by Triathlon Ireland, and its club website provides a general enquiry email, contact form and social accounts. New members should ask directly about current training, membership and suitable introductory activities. No permanent clubhouse or regular meeting address has been confirmed."
    ],
    sources: [
      { title: "Club events and first-event milestone", url: "https://ballybuniontriathlon.ie/" },
      { title: "Club contact details", url: "https://ballybuniontriathlon.ie/contact" },
      { title: "Triathlon Ireland listing", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Ballybunion", website: "https://ballybuniontriathlon.ie/" },
    location_note: "Ballybunion is the club’s home town. Event locations are not presented as a permanent clubhouse or training address."
  },
  "blackwater-triathlon-club": {
    summary: "Blackwater Triathlon Club was formed in Fermoy in 2007 and supports triathletes across north and east Cork, from beginners to experienced racers.",
    biography: [
      "Blackwater Triathlon Club began in late 2007 when a group of triathletes came together in Fermoy, County Cork, Ireland. The club serves north and east Cork and describes links with local swimming, cycling and running clubs as part of its development. It welcomes beginners as well as athletes with substantial racing experience.",
      "Organising events has been part of that story from the start. Its first triathlon took place on 31 August 2008 and attracted 350 participants, according to the club’s account. More recent event programmes have offered different distances and an introductory Try a Tri, giving local competitors more than one way into the sport.",
      "Membership is available throughout the year, and the joining page publishes a club enquiry email. The website also carries training information, but prospective members should confirm the current sessions and venues directly. Fermoy is the club’s base; the race location should not be confused with a permanent postal or clubhouse address."
    ],
    founded_year: 2007,
    sources: [
      { title: "Founding and Cork catchment", url: "https://www.blackwatertriclub.com/abouttheclub" },
      { title: "Event history and club programme", url: "https://www.blackwatertriclub.com/" },
      { title: "Joining and club email", url: "https://www.blackwatertriclub.com/join" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Fermoy", website: "https://www.blackwatertriclub.com/" },
    location_note: "Fermoy is the club’s base. Contact the club for the venue and arrangements for each training session."
  },
  "northwest-tc": {
    summary: "North West Triathlon Club is a Derry multisport club and host of the City of Derry Triathlon, linking local participation with international racing.",
    biography: [
      "North West Triathlon Club, listed in the directory as Northwest TC, is based in Derry, Northern Ireland. Triathlon Ireland lists it as a club with a junior section as well as adult activity. Swimming, cycling and running are the core sports, with the club’s public enquiry contact providing a starting point for membership and training questions.",
      "The club hosted the City of Derry Triathlon programme on 5 September 2026. Racing brought a sold-out age-group field together with Europe Triathlon Cup and Junior Cup competitions, using the River Foyle, city quays, Peace Bridge and Ebrington Square. The organiser’s report records the contribution of local volunteers and the return of international triathlon to the city after 2017.",
      "That event is a substantial part of the club’s public contribution, but its city-centre race facilities are not presented as a permanent training base. Prospective adult and junior members should contact the club for the current programme, available places and safeguarding arrangements before attending a session."
    ],
    sources: [
      { title: "Club location, junior provision and contact", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "City of Derry organiser and programme", url: "https://codtriathlon.com/" },
      { title: "Organiser’s September 2026 race report", url: "https://codtriathlon.com/europe-triathlon-cup-city-of-derry-2026-race-recap/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Derry" },
    location_note: "Derry is the club’s base. The River Foyle and Ebrington Square are documented event locations, not a verified club correspondence address."
  },
  "welsh-athletics-meirionnydd-running-club": {
    summary: "Meirionnydd Running Club was founded in Dolgellau in 2006 and offers road, trail, fell and cross-country running across southern Eryri.",
    biography: [
      "Meirionnydd Running Club was founded in Dolgellau, Gwynedd, Wales, in 2006. Its members now come from Dolgellau, Bala, Bangor and the wider southern Eryri area. Road runners, fell runners and people who mainly want company on a social outing share the club, with junior membership from age 11.",
      "The training offer includes social runs around Dolgellau and Bala, speed work in Dolgellau and track sessions in Bangor. Routes make use of local lanes, forests, beaches and mountains. Members also take part in cross-country, relays and road races, while talks, trips, beach runs and post-run gatherings provide a less competitive side to club life.",
      "In 2025, Meirionnydd hosted the UKA Hill and Fell Relay Championship at Penantigi Isaf near Dinas Mawddwy and was named Welsh Athletics Off-Track Club of the Year. The joining page invites prospective members to try a training or social run and publishes a membership enquiry address. Ask which group and meeting point best suit your experience."
    ],
    founded_year: 2006,
    sources: [
      { title: "Club origins and 2025 milestones", url: "https://www.meirionnydd.com/about-us" },
      { title: "Training, junior ages and joining", url: "https://www.meirionnydd.com/joinus" },
      { title: "Club officers", url: "https://www.meirionnydd.com/committee" },
      { title: "Welsh Athletics venues and contacts", url: "https://www.welshathletics.org/en/club/view/meirionnydd-running-club" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.meirionnydd.com/", address: "Glan Wnion Leisure Centre, Dolgellau, LL40 1LH", address_kind: "training" },
    location_note: "Glan Wnion Leisure Centre is a listed Dolgellau training venue. The wider programme also uses Bala and Bangor; confirm the meeting point for your chosen session."
  },
  "welsh-athletics-monross-trailblazers": {
    summary: "Monross Trailblazers serves Monmouth and Ross-on-Wye, with coached running, social outings and racing on roads, trails, cross-country courses and fells.",
    biography: [
      "Monross Trailblazers links runners in Monmouth, Wales, and Ross-on-Wye, England. Its name reflects that cross-border community in Monmouthshire and Herefordshire. The club is affiliated to Welsh Athletics, with members taking part in road running, cross-country, trail events, fell races and ultras.",
      "Wednesday evening training alternates between the two areas. Sessions combine a warm-up, a technical workout and a cool-down, with hills, intervals and other formats adapted for different abilities. Winter running uses roads; spring and summer sessions make more use of nearby woodland. The club asks runners to check updates because weather and ground conditions can change the venue.",
      "Newcomers can arrange two free trial sessions through the website’s enquiry form. Social and racing membership options provide different levels of involvement, from weekly training and club gatherings to cross-country leagues and team relays. Volunteers also help sustain the club’s local running activities."
    ],
    sources: [
      { title: "Cross-border club, membership and enquiry form", url: "https://monross-trailblazers.co.uk/" },
      { title: "Training structure and seasonal arrangements", url: "https://monross-trailblazers.co.uk/training/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Monmouth", county: "Monmouthshire", website: "https://monross-trailblazers.co.uk/" },
    location_note: "A Welsh-affiliated cross-border club serving Monmouth and Ross-on-Wye. Sessions alternate between locations; no single clubhouse address is asserted."
  },
  "welsh-athletics-mynydd-du-mountain-runners": {
    summary: "Mynydd Du is a fell-running club in the Black Mountains and Bannau Brycheiniog, with adult running and a parent-supported Mini Dragons junior section.",
    biography: [
      "Mynydd Du is a fell-running club centred on the Black Mountains and Bannau Brycheiniog in south Wales. Its activities take runners onto mountain terrain, with a club championship and local fell-racing links providing goals across the year. Abergavenny is the directory’s listed locality, but the club’s running area extends well beyond one town.",
      "The Mini Dragons section helps children and parents get out on the hills together. It is not described as a drop-off activity: parents remain responsible for their children and need to be equipped and able to accompany them on the terrain. Families should contact the junior organiser for current arrangements, as the published guidance includes some older material.",
      "The club reported receiving £5,640 from Sport Wales’ Be Active Wales Fund in 2025 to support a safer and more diverse mountain-running community. Adult and child membership is handled through MemberMojo, with separate public contacts for general enquiries, training and Mini Dragons. Prospective runners should ask about suitable outings and equipment before joining a session."
    ],
    sources: [
      { title: "Club area, championships and 2025 funding", url: "https://www.mynydd-du.org/home" },
      { title: "Mini Dragons and parental responsibilities", url: "https://www.mynydd-du.org/mini-dragons" },
      { title: "Membership arrangements", url: "https://www.mynydd-du.org/membership" },
      { title: "General, training and junior contacts", url: "https://www.mynydd-du.org/contact" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "Mountain-running activity is spread across the Black Mountains and Bannau Brycheiniog. Contact the relevant organiser for the meeting point; no permanent clubhouse is confirmed."
  },
  "welsh-athletics-mynyddwyr-de-cymru": {
    summary: "Mynyddwyr de Cymru is a south Wales fell-running club formed in 1980, with changing Tuesday-night routes and a long history of mountain-running challenges.",
    biography: [
      "Mynyddwyr de Cymru, usually shortened to MDC, was formed in 1980. This south Wales fell-running club draws members from Cardiff, the valleys, the Swansea area and Bannau Brycheiniog. It has no central headquarters: running together in different parts of the region is a defining part of its club life.",
      "Tuesday evening runs visit a different location each week, with faster and steadier groups and some slower-paced outings. The published calendar gives route distances, climbs and meeting details. Newcomers should contact the membership secretary before attending, particularly if they are new to mountain terrain. Membership is open to adults over 18, and the club encourages car sharing and responsible use of the countryside.",
      "MDC’s history records members developing long-distance challenges and organising many Welsh fell races in their own right. It specifically distinguishes those individual organisers from the club itself. The account also identifies club member Alison Wright’s Everest Base Camp-to-Kathmandu record with Helene Diamantides, one of the international endurance achievements connected with its early years."
    ],
    founded_year: 1980,
    notable_members: [{ name: "Alison Wright", connection: "Historical club member", detail: "MDC’s historical account identifies Wright as a club member and records her Everest Base Camp-to-Kathmandu record with Helene Diamantides." }],
    sources: [
      { title: "Club formation and regional membership", url: "https://www.runmdc.org.uk/" },
      { title: "2026 training calendar and newcomer advice", url: "https://runmdc.org.uk/training-runs/" },
      { title: "Adult membership", url: "https://runmdc.org.uk/join-mdc/" },
      { title: "Martin Lucas’s club history", url: "https://runmdc.org.uk/a-brief-history-of-mdc/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "", county: "", region: "South Wales", website: "https://runmdc.org.uk/", adult_only: true },
    location_note: "A regional south Wales club with no central headquarters. Tuesday meeting points change weekly and are published in the training calendar."
  },
  "welsh-athletics-maldwyn-harriers": {
    summary: "Maldwyn Harriers is a volunteer-run athletics club in Newtown, Powys, with junior track and field, adult running groups and a summer race series.",
    biography: [
      "Maldwyn Harriers is based at Maldwyn Leisure Centre in Newtown, Powys, Wales. Junior athletes from age eight receive an introduction to running, jumping and throwing, while adult groups cover beginner running, steady social outings and more structured training. Volunteers provide the coaching, team management and organisation behind the programme.",
      "The club offers a ten-week beginner course and intermediate sessions for runners who can already cover about five kilometres. Back Lane car park is a meeting point for several adult groups, including Sunday Striders, while junior athletics uses the leisure-centre track. Ask the club about the next suitable course or session before attending.",
      "Maldwyn’s summer series brings together five local races with opportunities for club members and visiting runners. Track and field league competition and winter cross-country add other ways to take part. Membership information and separate general, adult-membership and junior contacts are available on the club website."
    ],
    sources: [
      { title: "Club base, ages, training and competition", url: "https://maldwynharriers.org.uk/" },
      { title: "Role contacts and social accounts", url: "https://maldwynharriers.org.uk/contact/" },
      { title: "Welsh Athletics training listing", url: "https://www.welshathletics.org/en/club/view/maldwyn-harriers" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Newtown", county: "Powys", address: "Maldwyn Leisure Centre, Plantation Lane, Newtown, SY16 1LH", postcode: "SY16 1LH", address_kind: "training", website: "https://maldwynharriers.org.uk/" },
    location_note: "The leisure-centre track is a junior training base. Several adult groups meet at Back Lane car park; check the arrangements for the group you intend to join."
  },
  "welsh-athletics-emlyn-runners": {
    summary: "Rhedwyr Emlyn Runners was formed in Newcastle Emlyn in 2008 and combines Thursday club runs with local races, social events and community fundraising.",
    biography: [
      "Rhedwyr Emlyn Runners began in 2008 when ten runners formed a club in Newcastle Emlyn, west Wales. It welcomes a broad range of adult runners, including beginners and walk-runners as well as experienced competitors. Members run for fitness, enter races individually and as teams, and help organise local events.",
      "Thursday is club night at Newcastle Emlyn Leisure Centre. The programme alternates coached sessions with social runs, and newcomers can try a couple of sessions before discussing membership. The website’s pages give slightly different arrival details, so check the latest club notice or email before your first visit.",
      "The club’s own races include the Abercych 10K and the ten-mile multi-terrain Diafol Dolbryn Devil. Its history also describes members marshalling for other organisations and raising funds for charities, local sportspeople and community causes. Membership includes Welsh Athletics affiliation, with an enquiry email and membership information published online."
    ],
    founded_year: 2008,
    sources: [
      { title: "Founding, club races and community work", url: "https://emlynrunners.wixsite.com/emlyn/about-us" },
      { title: "Trial sessions, venue and membership", url: "https://emlynrunners.wixsite.com/emlyn/club-information" },
      { title: "Current club-night notices", url: "https://emlynrunners.wixsite.com/emlyn" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Newcastle Emlyn", address: "Newcastle Emlyn Leisure Centre, Newcastle Emlyn, SA38 9LN", postcode: "SA38 9LN", address_kind: "training" },
    location_note: "Newcastle Emlyn Leisure Centre is the Thursday training meeting point. Confirm the arrival time and whether to meet in reception or the car park."
  },
  "triangle-triathlon-club": {
    summary: "Triangle Triathlon Club is based in Coleraine, with a history of beginner development and organising aquathlon racing on Northern Ireland’s north coast.",
    biography: [
      "Triangle Triathlon Club is based in Coleraine, County Derry, Northern Ireland. Its place in the north-coast multisport community includes both competitive events and work to introduce people to swimming, cycling and running. Triathlon Ireland’s club directory provides the public membership enquiry email.",
      "In 2021, Triangle was among the first six clubs awarded support through Triathlon Ireland’s Try a Triathlon programme. The following year it organised the Portrush Aquathlon, which hosted national championship racing and youth events. These are documented milestones in the club’s activity, not a promise that the same beginner course or event is currently open.",
      "Founder member Anne Paul has represented Ireland at elite and age-group level and competed at the Commonwealth Games alongside paratriathlete Judith MacCombe. Triathlon Ireland approved her honorary life membership in 2026. Newcomers can contact Triangle to ask about present training venues, eligibility and membership; a current junior programme has not been established by the available club listing."
    ],
    notable_members: [{ name: "Anne Paul", connection: "Founder member", detail: "Triathlon Ireland identifies Paul as a founder of Triangle, an elite and age-group international, and a Commonwealth Games partner of Judith MacCombe. Her honorary life membership was approved in 2026." }],
    sources: [
      { title: "Coleraine club listing and enquiries", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "2021 beginner-development programme", url: "https://www.triathlonireland.com/news/2021/introducing-the-try-a-triathlon-club-programme/" },
      { title: "2022 Portrush Aquathlon organiser", url: "https://www.triathlonireland.com/news/2022/aquathlon-national-champs-gallery-results/" },
      { title: "Anne Paul’s honorary life membership", url: "https://www.triathlonireland.com/news/karen-lewis-elected-president/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Coleraine" },
    location_note: "Coleraine is the listed club base. Portrush is a documented race venue, not an assumed training or correspondence address."
  }
};
