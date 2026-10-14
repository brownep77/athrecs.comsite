import type { ClubProfile } from "./club-profiles";

// Editorial club information; these associations do not create athlete identities.
export const regionalTrainingProfiles: Record<string, ClubProfile> = {
  "clapham-pioneers": {
    summary: "Clapham Pioneers brings social and structured running to Clapham Old Town, with group runs, Battersea track sessions and shared race trips.",
    biography: [
      "Clapham Pioneers was founded in 2009 in south London, England. The volunteer-run club meets in Clapham Old Town and combines regular training with the social side of running: shared races, weekend outings and trips to European half marathons are part of its programme.",
      "Tuesday sessions start at Wingate Square and include structured work alongside a social 5K option. The training programme mixes hills, intervals and a monthly timed 5K in Battersea Park. Sunday long runs meet outside the Alexandra pub, while a monthly Thursday session uses Battersea Park’s Millennium Arena track. These are different meeting points, so newcomers should check the session they plan to attend.",
      "A first drop-in session is free, with run leaders available to welcome newcomers and explain the groups. The club also takes part in the local running community: its gallery records a Clapham Common parkrun volunteer takeover in 2025. General enquiries can go to the club email or its contact form."
    ],
    founded_year: 2009,
    sources: [{ title: "Club origins and community activity", url: "https://www.claphampioneers.co.uk/" }, { title: "Training and first-session guidance", url: "https://www.claphampioneers.co.uk/our-training" }, { title: "Club contacts", url: "https://www.claphampioneers.co.uk/contact-us" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "London", website: "https://www.claphampioneers.co.uk/", address: "Wingate Square, Clapham Old Town, London", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Wingate Square is the Tuesday meeting point. Sunday runs and track sessions start elsewhere; it is not a correspondence address."
  },
  "clapham-runners": {
    summary: "Clapham Runners is a small running club serving Clapham and Battersea, with coached park sessions and opportunities to try training before joining.",
    biography: [
      "Clapham Runners began in 2005 and serves runners around Clapham and Battersea in London, England. It describes itself as a small, mixed-ability club where members train together rather than having to arrive with a particular race target. The nearby parks give its week a practical local focus.",
      "Tuesday training uses Battersea Park’s Millennium Arena for coached speed and core work. Thursday sessions on Clapham Common focus on intervals, and members also run at local parkruns, including Clapham Common and Tooting. The combination offers structured training alongside familiar social runs.",
      "Prospective members are invited to try a few sessions before deciding whether to join. Email the club to arrange a first visit and confirm the meeting point; the Battersea track and Clapham Common sessions do not start in the same place."
    ],
    founded_year: 2005,
    sources: [{ title: "Club history, sessions and joining enquiries", url: "https://www.claphamrunners.com/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "London", website: "https://claphamrunners.com/", address: "Millennium Arena, Battersea Park, London", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "The arena is the Tuesday training venue. Thursday sessions take place on Clapham Common; confirm the meeting instructions before attending."
  },
  "claremont-road-runners": {
    summary: "Claremont Road Runners is an adult running club in Newcastle upon Tyne, with social runs, structured sessions and the Weetslade Relay.",
    biography: [
      "Claremont Road Runners was established in 1981 in Newcastle upon Tyne, England. The club welcomes runners aged 18 and over and uses Newcastle University’s Sports and Fitness Centre on Wallace Street as its city-centre base. Its programme combines road running, off-road routes and friendly club competition.",
      "Monday outings explore varied routes, typically around seven miles with shorter alternatives. Wednesday sessions include intervals, hills and bootcamp-style training for different abilities. Quarterly handicap races move between the Town Moor in summer and the Quayside in winter, followed by time together socially. The club also organises the Weetslade Relay.",
      "New runners can complete the trial-session form and attend a few sessions without committing to membership. The enquiries team can explain the groups, changing facilities and current meeting arrangements. Published secretary and welfare contacts provide separate routes for administrative and safeguarding questions."
    ],
    founded_year: 1981,
    sources: [{ title: "Club history, eligibility, training and trials", url: "https://www.claremontroadrunners.co.uk/about-us/" }, { title: "Public club officer contacts", url: "https://www.claremontroadrunners.co.uk/club-officer-contacts/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Newcastle upon Tyne", adult_only: true, address: "Newcastle University Sports and Fitness Centre, Wallace Street, Newcastle upon Tyne", postcode: "NE2 4DR", address_kind: "training" },
    location_note: "Wallace Street is the club’s stated sports-centre base, replacing the older Richardson Road directory address. Race and away-session meeting points vary."
  },
  "clayton-le-moors-harriers": {
    summary: "Clayton-le-Moors Harriers has deep Lancashire roots in road, cross-country and fell running, including associations with Ron Hill and Bob Graham Round pioneers.",
    biography: [
      "Clayton-le-Moors Harriers began in Lancashire, England, in 1922 as Clayton Harriers, a branch of Bury Athletic Club. It became independent in 1930, re-formed after the Second World War in 1946 and adopted its present name in 1947. Road running, cross-country, trails and the fells now sit alongside junior athletics in the club’s activities.",
      "Its history includes Commonwealth marathon champion Ron Hill and fell-running figures Alan Heaton and Stan Bradshaw. A meeting after the 1970 Pendle Fell Race helped establish the Fell Runners Association. The club’s contemporary honours include Biruk Aduna Kebede’s national under-20 men’s cross-country title in 2026, adding a newer chapter to a substantial endurance tradition.",
      "Training groups use venues across the Burnley and Pendle area, including road sessions from Queen’s Park and fell outings around Barley. Some outings are organised by members rather than coached or guided sessions; the club explains the experience and equipment expected for its fell groups. Prospective members should use the membership contact to find a suitable group and check the arrangements before attending."
    ],
    founded_year: 1922,
    notable_members: [
      { name: "Ron Hill", connection: "Historical club member", detail: "The club history records his long association and 1970 Commonwealth marathon gold." },
      { name: "Alan Heaton", connection: "Historical club member", detail: "The club history credits him with the first repeat of Bob Graham’s round after a 28-year gap." },
      { name: "Stan Bradshaw", connection: "Historical club member", detail: "A prominent figure in the club’s fell-running history who followed Heaton in completing the Bob Graham Round." },
      { name: "Biruk Aduna Kebede", connection: "Club honours, 2026", detail: "The club’s history records his 2026 national under-20 men’s cross-country title." }
    ],
    sources: [{ title: "Club history and honours", url: "https://www.claytonlemoorsharriers.co.uk/about" }, { title: "Training groups and participation requirements", url: "https://www.claytonlemoorsharriers.co.uk/training" }, { title: "Joining and membership", url: "https://www.claytonlemoorsharriers.co.uk/join-us" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Clayton-le-Moors", county: "Lancashire", website: "https://www.claytonlemoorsharriers.co.uk/" },
    location_note: "The club serves Lancashire from several road, junior and fell-running meeting points. No single club office is asserted as the start of all sessions."
  },
  "clc-striders": {
    summary: "CLC Striders is a volunteer-run Cheltenham running club offering social runs, coached intervals and road, track and cross-country competition.",
    biography: [
      "CLC Striders is based at the Cheltenham Ladies’ College Health and Fitness Centre on Malvern Road in Cheltenham, Gloucestershire, England. Membership is open beyond the college community. Volunteers organise a programme of running and athletics, with teams taking part in road, track and cross-country competition.",
      "Monday social runs offer routes of roughly four or six miles, while Wednesday training concentrates on coached interval sessions. Venues change with the season: the club describes winter use of the Honeybourne Line and summer training on the college grass and in Pittville Park. Members can build consistent training while sharing local races and club activities.",
      "Newcomers can try a few sessions and discuss membership through the contact form. The published joining guidance asks runners to be able to cover about four miles in 36 minutes or less, so it is useful to check suitability before a first visit. Coaches can explain the session format and the current meeting point."
    ],
    sources: [{ title: "Club introduction and membership suitability", url: "https://clcstriders-runningclub.co.uk/about" }, { title: "Weekly and seasonal training", url: "https://clcstriders-runningclub.co.uk/training" }, { title: "Enquiry form", url: "https://clcstriders-runningclub.co.uk/contact" }],
    reviewed_at: "2026-10-14",
    corrections: { address: "CLC Health and Fitness Centre, Malvern Road, Cheltenham", address_kind: "training", sports: ["Running", "Athletics"] },
    location_note: "The health and fitness centre is the club base; seasonal interval sessions use other locations."
  },
  "cleobury-mortimer-running-club": {
    summary: "Cleobury Mortimer Running Club grew from eight friends in 2015 into a Shropshire club with pace groups, beginner courses and local parkrun volunteering.",
    biography: [
      "Cleobury Mortimer Running Club began in September 2015 when eight friends met for a run from the sports hall in Cleobury Mortimer, Shropshire, England. Initially a satellite group of Ludlow Runners, it became an independent England Athletics club in January 2018. Later that year it received a West Midlands club/group award for its volunteer-led work.",
      "The programme includes five Tuesday pace groups from the Sports and Social Club, Thursday run-walk and running options, and social outings from the Community Hub. Beginner courses offer a gradual introduction to running. The group also helped establish Wyre Forest parkrun and has continued to contribute volunteers to the local event.",
      "Prospective members can try two sessions before joining. Check the current calendar to choose a pace group or beginner intake: older pages describe a different weekly pattern. The Sports and Social Club and the Lower Street Community Hub are separate meeting places, with the latter also offering a café stop after some runs."
    ],
    founded_year: 2015,
    sources: [{ title: "Current sessions, beginner course and joining guidance", url: "https://www.runcleobury.org/" }, { title: "Origins, independence and volunteer award", url: "https://www.runcleobury.org/about/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Cleobury Mortimer", county: "Shropshire", address_kind: "training" },
    location_note: "The Sports and Social Club is the Tuesday base. Other sessions meet at the Community Hub on Lower Street; the club is in Cleobury Mortimer rather than Kidderminster."
  },
  "cliff-village-runners": {
    summary: "Cliff Village Runners serves Navenby and Wellingore in Lincolnshire, with structured training, social runs and a beginner Couch to 5K programme.",
    biography: [
      "Cliff Village Runners brings runners together around Navenby and Wellingore, south of Lincoln in Lincolnshire, England. The club’s weekly programme combines Tuesday structured training with a Thursday social run, giving members a choice between focused practice and a more relaxed outing.",
      "Its spring Couch to 5K course introduces running through a progressive mix of walking and running, supported by qualified leaders. Sessions are organised around time and gradual development rather than expecting beginners to keep a particular pace. Graduates can move into the Thursday group and then explore the Tuesday sessions as their confidence grows.",
      "The Venue car park in Navenby is a published meeting point for the beginner programme. Use the club email or contact form to check the next course intake, the appropriate group and where a particular session starts. The village meeting point is a training location, not a club office or postal address."
    ],
    sources: [{ title: "Club programme and public email", url: "https://clubspark.englandathletics.org/CliffVillageRunners" }, { title: "Beginner course and meeting point", url: "https://clubspark.englandathletics.org/CliffVillageRunners/Couchto5K" }, { title: "Enquiry form", url: "https://clubspark.englandathletics.org/CliffVillageRunners/Contact" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Navenby", address: "The Venue car park, Navenby", postcode: "", address_kind: "training", location_precision: "area-only" }
  },
  "clowne-road-runners-club": {
    summary: "Clowne Road Runners combines road and trail running with cross-country and relays, and organises the Clowne Half Marathon and Elmton Chase.",
    biography: [
      "Clowne Road Runners is based at Clowne Community Centre in Clowne, Derbyshire, England. Members run on roads and trails and take part in cross-country, with club activities extending from ordinary weekly outings to local races and longer team challenges.",
      "The club’s Grand Prix and standards awards give members goals across the year. Its programme includes inter-club cross-country and relay outings such as Round Rotherham and Belper, while presentation evenings celebrate participation and performances. The Clowne Half Marathon and the five-mile Elmton Chase trail race are established parts of its own event programme.",
      "New runners should contact the membership team to discuss a suitable group and trial arrangements. The website’s pages give different weekly training patterns, so check the current calendar before travelling to the community centre. Junior activities have separate arrangements; the general running-group guidance should not be taken as the eligibility rule for every section."
    ],
    sources: [{ title: "Club activities and events", url: "https://clowneroadrunners.org/?page_id=1919" }, { title: "Club secretary and membership contacts", url: "https://clowneroadrunners.org/?page_id=14" }, { title: "Current club notices and base", url: "https://clowneroadrunners.org/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Clowne", county: "Derbyshire", website: "https://clowneroadrunners.org/", address: "Clowne Community Centre, Recreation Close, Clowne", address_kind: "training" },
    location_note: "The community centre is the club’s stated home. Race, relay and off-road sessions have their own meeting instructions."
  },
  "kenmare-tc": {
    summary: "Kenmare Triathlon Club has a multisport history in County Kerry stretching back to 2006, including the Little Bo Peep triathlon.",
    biography: [
      "Kenmare Triathlon Club was formed in 2006 in Kenmare, County Kerry, Ireland. Its history records the first Little Bo Peep triathlon in July 2007 and the event’s inclusion in the National Series in 2013. Swimming, cycling and running give the club a close connection with the surrounding Kerry landscape.",
      "The club’s published account describes coached swimming, group cycling and running, along with volunteering at Little Bo Peep. Relay participation has offered another way to experience an event, allowing people to complete one discipline as part of a team rather than taking on a whole triathlon at once.",
      "Several training and membership pages retain older dates and prices. They explain the club’s development but do not establish a current timetable. Prospective members should use the published enquiry email to confirm present activities, membership requirements and suitable sessions before attending; no single training or clubhouse address is asserted here."
    ],
    founded_year: 2006,
    sources: [{ title: "Formation and Little Bo Peep history", url: "https://www.kenmaretri.com/about/" }, { title: "Membership and published enquiry email", url: "https://www.kenmaretri.com/about/membership/" }, { title: "Club contact route", url: "https://www.kenmaretri.com/contact-us/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Kenmare", website: "https://www.kenmaretri.com/" },
    location_note: "Kenmare is the club’s town. The older website timetable does not establish a current single training venue."
  },
  "killarney-triathlon-club": {
    summary: "Killarney Triathlon Club offers swimming, cycling and running in County Kerry, with seasonal lake and pool training and opportunities to try sessions.",
    biography: [
      "Killarney Triathlon Club brings swimmers, cyclists and runners together in Killarney, County Kerry, Ireland. It first affiliated to Triathlon Ireland in 2015; that affiliation date is distinct from an established founding year. Members can train socially or prepare for competition, and racing is not a requirement of belonging to the club.",
      "The published programme describes winter pool swimming at the Gleneagle’s Aquila Club, indoor cycling at St Mary’s Hall and running around Ross Racecourse. Summer activities include swimming at Dundag Beach in Muckross and combined swim-bike-run practice. Local parkrun outings and coffee provide another way to meet other members.",
      "Newcomers can enquire about three trial sessions before joining. Beginner swim training expects the ability to swim two lengths of front crawl; people still learning that skill are directed towards lessons first. Club membership and Triathlon Ireland membership are separate requirements. Contact the club for the current seasonal timetable, session suitability and trial arrangements."
    ],
    sources: [{ title: "Club introduction and affiliation", url: "https://killarneytriathlonclub.com/about/" }, { title: "Seasonal training and swim suitability", url: "https://killarneytriathlonclub.com/training/" }, { title: "Trials and membership", url: "https://killarneytriathlonclub.com/membership/" }, { title: "Club enquiries", url: "https://killarneytriathlonclub.com/contact/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Killarney", website: "https://killarneytriathlonclub.com/" },
    location_note: "Training uses several pools, halls and outdoor locations around Killarney. Published sample timetables should be confirmed before attendance."
  },
  "kinsale-triathlon-club": {
    summary: "Kinsale Triathlon Club combines swim, bike and run training with local races, volunteer activities and social outings in County Cork.",
    biography: [
      "Kinsale Triathlon Club grew from an informal group in 2009 and affiliated to Triathlon Ireland in 2011. Based in Kinsale, County Cork, Ireland, it welcomes people who enjoy one, two or all three triathlon disciplines. Members’ ambitions range from a first short event to longer-distance triathlons.",
      "The club describes a busy social and training programme, including a 5K league, night swims, hill sessions, group rides and training weekends. Its local event involvement includes the Old Head Duathlon, Kinsale Kidathlon, the Regatta five-mile run and Santa Dash. Volunteering can mean helping with kayaks, timing or looking after bikes, so participation extends beyond racing.",
      "Prospective members can ask about three trial sessions and joining through Triathlon Ireland. The contact form is the direct route for checking session availability and which group would suit a newcomer. Membership prices shown in older notices should be confirmed for the current season rather than assumed to remain in force."
    ],
    founded_year: 2009,
    sources: [{ title: "Origins, programme and community events", url: "https://www.kinsaletriclub.com/about/" }, { title: "Trials and joining", url: "https://www.kinsaletriclub.com/how-to-join/" }, { title: "Contact form and official social links", url: "https://www.kinsaletriclub.com/contact/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Kinsale", website: "https://www.kinsaletriclub.com/" },
    location_note: "The club is based in Kinsale, with different meeting points for swimming, cycling and running. No unconfirmed street address is used as a training pin."
  },
  "lanesboro-triathlon-club": {
    summary: "Lanesboro Triathlon Club serves the Lanesborough–Ballyleague community on the Shannon, with adult and junior training and the Two Provinces event.",
    biography: [
      "Lanesboro Triathlon Club was founded in 2010 in the Lanesborough–Ballyleague community on the River Shannon, County Longford, Ireland. Its development has combined racing with bringing newcomers into swimming, cycling and running. Triathlon Ireland recognised it as Club of the Year in 2019.",
      "The club introduced Zero2Tri in 2018, a six-month pathway towards a first Two Provinces triathlon. Junior activities and the Two Provinces Kidathon broaden its community role. The published junior guidance starts from age eight and asks children to be able to swim 25 metres, with pool sessions and suitable seasonal outdoor activities forming parts of the programme.",
      "Membership is arranged alongside Triathlon Ireland registration. Contact the membership team about current junior places, beginner support and trial arrangements. Some website notices retain older season dates, so the published history of Zero2Tri does not mean that a new course is currently open. Meeting points and swimming arrangements should be confirmed for each session."
    ],
    founded_year: 2010,
    sources: [{ title: "Club origins, beginner programme and award", url: "https://trilanesboro.com/about-our-club/" }, { title: "Junior eligibility and activities", url: "https://trilanesboro.com/about-our-club/junior-club/" }, { title: "Joining and membership contact", url: "https://trilanesboro.com/membership/" }, { title: "Club role contacts", url: "https://trilanesboro.com/about-our-club/club-committee/" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Lanesboro", website: "https://trilanesboro.com/" },
    location_note: "The club serves Lanesborough–Ballyleague. Swimming, cycling and junior activities use different venues; a generic Main Street reference is not an exact session location."
  },
  "liquid-motion-tc": {
    summary: "Liquid Motion Triathlon Club serves Ballina and north Mayo with pool, track and cycling sessions and introductory routes into multisport.",
    biography: [
      "Liquid Motion Triathlon Club serves Ballina and north County Mayo, Ireland, combining swimming, cycling and running. Its website also features the Salmon Run triathlon, Try a Tri and duathlon programme, giving members local multisport events to work towards alongside their regular training.",
      "The club’s 2026 training page lists pool swimming in Ballina, track running, indoor cycling through Zwift and Sunday rides shared with Ballina Cycling Club. The cycling programme offers different ability groups. These sessions use several venues and formats rather than a single clubhouse.",
      "An introductory six-week New2Tri programme ran in 2025, illustrating the club’s approach to helping newcomers prepare for a shorter event. That past course is not a promise of a current intake or free membership. Prospective members should check the current club and Triathlon Ireland registration requirements and ask which training group is appropriate before attending."
    ],
    sources: [{ title: "Club and event programme", url: "https://www.liquidmotion.ie/" }, { title: "2026 training programme", url: "https://www.liquidmotion.ie/training-2026.html" }, { title: "Membership requirements", url: "https://www.liquidmotion.ie/membership.html" }, { title: "Historical 2025 beginner programme", url: "https://www.liquidmotion.ie/new-to-tri.html" }],
    reviewed_at: "2026-10-14",
    corrections: { city: "Ballina", website: "https://www.liquidmotion.ie/" },
    location_note: "Ballina is supported by the club’s 2026 pool and running programme. Shared cycle rides and other activities have separate meeting arrangements."
  },
  "welsh-athletics-pont-y-pwl-and-district-runners": {
    summary: "Pont-y-pŵl & District Runners offers running in Pontypool, Wales, from First Steps and family activities to cross-country and local races.",
    biography: [
      "Pont-y-pŵl & District Runners serves Pontypool, Wales, with programmes for adults, children and families. The club is affiliated to Welsh Athletics and participates in the Gwent Leisure Centre League and Gwent cross-country competition. Its local event programme includes Coity Fell Race, the Blaenavon Heritage five-mile race and sprint relays.",
      "First Steps provides a free introduction to running, while Free Wheelers offers activities for parents and children. A junior park group caters for younger runners. The club’s monthly training plans give other members a more structured programme, so joining need not mean starting with the same session or race ambition as everyone else.",
      "First Steps and Free Wheelers do not require club membership. Separate adult, junior and family membership options are available for the wider club programme. Use the club enquiry route to confirm eligibility, group availability and meeting points; the Pontypool park base does not mean every group meets at the same place."
    ],
    sources: [{ title: "Club sections, events and beginner activities", url: "https://www.pontypoolrunners.co.uk/" }, { title: "Club programme", url: "https://pontypoolrunners.co.uk/about-us" }, { title: "Membership options and exceptions", url: "https://pontypoolrunners.co.uk/membership" }],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://pontypoolrunners.co.uk/", address_kind: "training" },
    location_note: "Pontypool Active Living Centre and the park are the directory-listed base. Confirm the meeting point for First Steps, junior activities and other groups separately."
  },
  "welsh-athletics-pontyclun-athletics-club": {
    summary: "Pontyclun Athletics Club introduces young athletes to running, jumping and throwing at Y Pant School, with competition and parent volunteering central to its programme.",
    biography: [
      "Pontyclun Athletics Club is a junior-focused athletics club in Pontyclun, Wales, using Y Pant Comprehensive School on Cowbridge Road. Its programme introduces running, jumping and throwing rather than concentrating on long-distance running. Published guidance includes events such as long jump, high jump, shot and javelin.",
      "The club emphasises participation and learning rather than selecting children solely on ability. The club encourages athletes to compete in agreed events, and families are asked to support its programme, including through volunteering. Indoor gym activities provide winter options alongside outdoor athletics when conditions allow.",
      "Parents should contact the membership representative to discuss age eligibility, places and a first visit. The website’s older age-category descriptions should be checked against the current season’s arrangements. Y Pant is the training venue; the separate address printed with a committee contact is correspondence information and is not where children attend sessions."
    ],
    sources: [{ title: "Junior athletics programme and school venue", url: "https://pontyclunathletics.wixsite.com/club" }, { title: "Participation and competition guidance", url: "https://pontyclunathletics.wixsite.com/club/faq" }, { title: "Membership telephone and venue", url: "https://pontyclunathletics.wixsite.com/club/contact-us" }],
    reviewed_at: "2026-10-14",
    corrections: { address: "Y Pant Comprehensive School, Cowbridge Road, Talbot Green, Pontyclun", postcode: "CF72 8YQ", address_kind: "training" },
    location_note: "Y Pant School is the training venue. The membership representative’s separate correspondence address is not a public session location."
  },
  "welsh-athletics-pontyclun-road-runners": {
    summary: "Pontyclun Road Runners combines local training, road and off-road running with volunteer work, and became Run 4 Wales’s inaugural Featured Club in 2026.",
    biography: [
      "Pontyclun Road Runners serves Pontyclun and the surrounding area in Wales, with road, trail, fell and cross-country running. In March 2026 Run 4 Wales named it the first club in its Featured Club programme, highlighting its community involvement and welcoming approach to runners with different backgrounds and ambitions.",
      "The club’s contribution extends beyond its own race results. Run 4 Wales describes charity support, parkrun volunteer takeovers and members helping other runners as race pacers. Its training programme uses several local meeting points, including Pontyclun Rugby Club, the Miskin Arms and Ynysddu, with additional track sessions at Bryn Celynnog.",
      "Welsh Athletics lists coaching and a guide-running contact through the club. Newcomers should email the club to discuss the right session, current joining arrangements and any guide support they need. Multiple meeting points are kept separate here so a timetable or list of venues is not mistaken for one street address."
    ],
    sources: [{ title: "Governing-body disciplines, venues and contacts", url: "https://www.welshathletics.org/en/club/view/pontyclun-road-runners" }, { title: "Run 4 Wales Featured Club announcement, 12 March 2026", url: "https://www.run4wales.org/introducing-our-2026-featured-club-pontyclun-road-runners/" }],
    reviewed_at: "2026-10-14",
    corrections: { address: "", postcode: "", location_precision: "area-only" },
    location_note: "Sessions use Pontyclun Rugby Club, the Miskin Arms, Ynysddu and Bryn Celynnog track. Confirm the chosen session rather than treating the combined directory text as an address."
  },
  "welsh-athletics-pontypridd-roadents-ac": {
    summary: "Pontypridd Roadents AC is an adult running club with track training in Beddau, varied Thursday sessions and road and cross-country competition.",
    biography: [
      "Pontypridd Roadents AC serves adult runners around Pontypridd, Wales. Membership is for people aged 18 and over, and the club does not run a junior section. Its programme combines structured training with club championships, parkrun outings, Welsh relay events and Gwent League cross-country.",
      "Tuesday training takes place at Bryn Celynnog Comprehensive School in Beddau. Thursday meeting points vary and are communicated through the club’s Spond arrangements, so older references to a fixed town-centre start should not be treated as the current weekly plan. Track work and varied local routes give members different ways to develop their running.",
      "The club offers taster sessions in the first week of its monthly cycle, covering one Tuesday and one Thursday session before membership is required. Contact the membership team before attending to check the next opportunity and the group that suits you. Published club and welfare contacts provide routes for further questions."
    ],
    sources: [{ title: "Current training venues and communication", url: "https://pontypriddroadentsac.org.uk/club/training/" }, { title: "Adult membership and taster arrangements", url: "https://pontypriddroadentsac.org.uk/club/membership/" }, { title: "Club contact routes", url: "https://pontypriddroadentsac.org.uk/club/contact/" }],
    reviewed_at: "2026-10-14",
    corrections: { adult_only: true, address: "Bryn Celynnog Comprehensive School, Beddau", postcode: "CF38 2AE", address_kind: "training" },
    location_note: "Bryn Celynnog is the Tuesday track venue. Thursday locations are announced separately through Spond; the older fixed Llys Cadwyn listing is not retained as the sole meeting point."
  },
  "welsh-athletics-porthcawl-runners": {
    summary: "Porthcawl Runners has offered running and walking on the South Wales coast since 2010, with beginner courses, social runs and road and off-road interests.",
    biography: [
      "Porthcawl Runners was founded in 2010 in Porthcawl, Wales. The volunteer-run, Welsh Athletics-affiliated club welcomes people aged 16 and over and includes walking, beginner running and more established runners. Its coastal setting offers seafront routes alongside road, trail and cross-country opportunities.",
      "The club is based at Porthcawl RFC on South Road. Published activities include Monday and Wednesday sessions, Sunday longer runs and local parkrun outings. Couch to 5K courses provide a route into the regular groups, while the wider programme allows members to train socially or work towards races.",
      "Newcomers can ask about trying sessions before joining. Use the club contact form to confirm the current beginner intake, group and meeting instructions. The rugby club is the published base and a care-of contact address, but away runs and other activities may start elsewhere."
    ],
    founded_year: 2010,
    sources: [{ title: "Club origins and activities", url: "https://porthcawlrunners.com/about-main/about-us/" }, { title: "Eligibility, beginners and trying sessions", url: "https://porthcawlrunners.com/about-main/faqs/" }, { title: "Club base and enquiry form", url: "https://porthcawlrunners.com/contact-us/" }],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://porthcawlrunners.com/", address: "Porthcawl RFC, South Road, Porthcawl", postcode: "CF36 3DA", address_kind: "training" },
    location_note: "Porthcawl RFC is the club’s stated base and care-of contact address. Check session instructions for outings starting elsewhere."
  },
  "welsh-athletics-prestatyn-rc": {
    summary: "Prestatyn Running Club has served runners in Denbighshire since 1982, with road, cross-country and fell running and changing local session venues.",
    biography: [
      "Prestatyn Running Club was founded in 1982 in Prestatyn, Denbighshire, Wales. Its members take part in road running, cross-country and fell running, with both newer and experienced runners sharing the club’s activities. Social membership provides another way to stay involved alongside full running membership.",
      "The weekly pattern combines steady Monday runs with more structured Wednesday sessions. The autumn 2026 notices place Monday meetings at Ffrith Astrobowl on Victoria Road and Wednesday meetings at the rear of Prestatyn High School, reached from David’s Close. Away runs and weather-related changes are announced separately.",
      "Prospective members should contact the club or membership secretary to discuss joining and obtain the application form. Check the latest run notice before attending, including meeting point and high-visibility clothing guidance. The two regular venues are described separately rather than presenting the school’s general postal address as the start of every run."
    ],
    founded_year: 1982,
    sources: [{ title: "Club origins and introduction", url: "https://www.prestatynrunningclub.com/" }, { title: "Autumn 2026 session notices", url: "https://www.prestatynrunningclub.com/club-runs-information" }, { title: "Membership options and application", url: "https://www.prestatynrunningclub.com/membership-application" }, { title: "Committee and official social links", url: "https://www.prestatynrunningclub.com/committee-members" }],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.prestatynrunningclub.com/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Autumn 2026 notices distinguish Ffrith Astrobowl from the school’s rear car park at David’s Close. Check current notices; no single street address or uncertain venue postcode is asserted."
  }
};
