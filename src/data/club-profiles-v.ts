import type { ClubProfile } from "./club-profiles";

// Public editorial associations only; these do not verify athlete identities or membership.
export const valleysAndCommunityProfiles: Record<string, ClubProfile> = {
  "chessington-unity-running-club": {
    summary: "Chessington Unity Running Club offers running and walking groups in Chessington, with morning, evening and weekend sessions for adults.",
    biography: [
      "Chessington Unity Running Club was started in 2021 by local runners who wanted a club that belonged to Chessington, in south-west London, England. It affiliated with England Athletics that April. Walking is part of the programme alongside running, and the club welcomes adults taking their first steps as well as those training for long-distance races.",
      "The weekly pattern includes early-morning outings, evening club runs and a Saturday session, with additional Sunday trail runs announced to members. Meeting points vary: Churchfields Recreation Grounds, the North Star pub, Rhona’s Café, Horton Golf Club and the Harrier Centre track all appear in the club’s venue guide. Check the particular session rather than relying on one address.",
      "Prospective members can try a session before joining. The online membership form covers club membership, with England Athletics registration offered separately. A qualified coach, run leaders and welfare officers support the sessions, while social events give members time together away from training."
    ],
    founded_year: 2021,
    sources: [
      { title: "Club origins and approach", url: "https://unityrunningclub.co.uk/about-us" },
      { title: "Membership and weekly sessions", url: "https://unityrunningclub.co.uk/joining-the-club" },
      { title: "Session meeting places", url: "https://unityrunningclub.co.uk/find-us" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Chessington", address: "", postcode: "", location_precision: "area-only", adult_only: true },
    location_note: "The club uses several meeting points in and around Chessington. The incomplete directory address has been removed; use the session listing for the correct venue."
  },
  "chester-road-runners": {
    summary: "Chester Road Runners grew from a beginners’ group in 2012 and now offers paced club runs and Couch to 5K courses from Westminster Park.",
    biography: [
      "Chester Road Runners began in late 2012 when Louisa Hallas brought beginners together for Sunday runs at Chester Racecourse. The group moved to Westminster Park in spring 2013 and developed into an England Athletics-affiliated club serving Chester and the surrounding Cheshire area in England. Supporting people new to running remains an important part of its work.",
      "The main Wednesday session meets at the Westminster Park car park on Hough Green. Six groups accommodate different running speeds and experience, from newer runners to established competitors. The club’s published aims also include track running, cross-country opportunities and race walking, alongside its road-running programme.",
      "Volunteer run leaders support regular sessions and ten-week Couch to 5K courses. New members can register for a four-week trial of the ordinary club sessions; the beginner course has separate arrangements. Training notices and social outings are shared through members’ Facebook groups, and the contact page routes enquiries to the club or membership secretary."
    ],
    founded_year: 2012,
    sources: [
      { title: "History and club aims", url: "https://chesterroadrunners.org.uk/about" },
      { title: "Groups, venue and trial arrangements", url: "https://chesterroadrunners.org.uk" },
      { title: "Club and membership enquiries", url: "https://chesterroadrunners.org.uk/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address_kind: "training", adult_only: true },
    location_note: "Westminster Park car park, Hough Green, Chester CH4 8JW is the main Wednesday meeting point, not a correspondence address."
  },
  "chesterfield-and-district-ac": {
    summary: "Chesterfield & District AC has offered athletics since 1978, with track, field, cross-country and Sportshall training at Tupton Hall School.",
    biography: [
      "Chesterfield & District Athletics Club was formed in 1978, when the English Schools Track and Field Championships at Brookfield Community School helped stimulate local interest in athletics. Early summer training used the cinder track at Queens Park Annexe. The Derbyshire club moved its training base to Tupton Hall School in Old Tupton, England, in 2008.",
      "Tupton provides a floodlit all-weather track, sports hall and gym, although the club uses other local tracks to host league matches. Its programme covers track and field, cross-country, road running and Sportshall. Young athletes and adults have routes into league competition, regional championships and open meetings.",
      "Training is normally on Tuesday and Thursday evenings. Members are accepted from age nine, and newcomers must arrange an induction by email before attending. Four trial sessions are available, with the normal session charge still payable. This is a competing athletics club: members are expected to represent it when selected. An Athlete Assistance Fund offers a route to discuss help with membership or equipment costs."
    ],
    founded_year: 1978,
    sources: [
      { title: "Club history and facilities", url: "https://chesterfieldac.co.uk/about/" },
      { title: "Inductions, membership and competition expectations", url: "https://chesterfieldac.co.uk/membership-info/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://chesterfieldac.co.uk/", address_kind: "training" },
    location_note: "Tupton Hall School is the training base. League meetings may be held at other tracks because the school track is not a full competition venue."
  },
  "chew-valley-snails": {
    summary: "Chew Valley Snails offers adult social running and Couch to 5K courses around the Chew Valley, with local road and trail routes.",
    biography: [
      "Chew Valley Snails is a recreational running group in the Chew Valley, south of Bristol in England. It welcomes adults aged 18 and over, including complete beginners and people returning to running. The group is affiliated to the Association of Running Clubs and puts conversation and company at the centre of its sessions.",
      "Ten-week Couch to 5K courses build towards a graduation run at a local parkrun. Beyond the course, run leaders offer social outings on roads, fields, woodland paths and tracks, with different distances and meeting points across the valley. The Salt & Malt car park at Chew Lake is one published starting point, but it is not the start for every run.",
      "Several leaders first joined as Couch to 5K participants before qualifying to lead others. Non-members may try up to three social runs before joining, and course fees include membership. The club’s booking pages and Facebook group carry session arrangements; newcomers should check the next course or suitable social run before travelling."
    ],
    sources: [
      { title: "Club approach, courses and run leaders", url: "https://clubspark.englandathletics.org/ChewValleySnails" },
      { title: "Age eligibility, trials and membership", url: "https://clubspark.englandathletics.org/ChewValleySnails/FAQs" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Chew Valley", website: "https://clubspark.englandathletics.org/ChewValleySnails", address: "", postcode: "", location_precision: "area-only", adult_only: true },
    location_note: "Runs start at different places in the Chew Valley. The former Community Farm directory address has not been confirmed as a regular training base."
  },
  "chiltern-harriers-ac": {
    summary: "Chiltern Harriers AC has served Chesham, Amersham and surrounding Buckinghamshire communities since 1978, across road, cross-country and track athletics.",
    biography: [
      "Chiltern Harriers Athletic Club was formed in 1978 during the growth of recreational road running. It now draws athletes from Chesham, Amersham, the Chalfonts, Prestwood and Great Missenden in Buckinghamshire, England. Its programme follows the seasons, with winter cross-country, summer track and field, and road running throughout the year.",
      "The club stages the Pednor 5, Shardeloes 10K and Pednor 10, giving local runners a choice of road and multi-terrain races. Senior Tuesday sessions move between locations around Chesham and Amersham, using trails in lighter months and illuminated roads in winter. Get Going Running offers a gentler route into the senior programme, while Sunday outings explore the Chiltern countryside.",
      "Junior training is organised by coaching group and discipline rather than through one universal session. The junior page currently says its mixed-ability beginners’ group is closed indefinitely; parents should contact the appropriate coach about other groups and capacity. Membership, coaching and committee enquiry forms are available through the club contacts page."
    ],
    founded_year: 1978,
    sources: [
      { title: "Club history and races", url: "https://www.chilternharriers.com/the-club.html" },
      { title: "Senior training and Sunday runs", url: "https://www.chilternharriers.com/seniors.html" },
      { title: "Junior groups and availability", url: "https://www.chilternharriers.com/juniors.html" },
      { title: "Club enquiry routes", url: "https://www.chilternharriers.com/club-contacts.html" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address: "", postcode: "", location_precision: "area-only" },
    location_note: "Training uses several venues around Chesham and Amersham and specialist tracks elsewhere. The old Pednor Road directory address is not presented as a public training venue."
  },
  "chiltern-trail-runners": {
    summary: "Chiltern Trail Runners explores the hills and paths around Wendover, with coached sessions, group trail runs and longer weekend outings.",
    biography: [
      "Chiltern Trail Runners is a trail-focused running club in the Chiltern Hills, England, with regular meeting points around Wendover and nearby Buckinghamshire villages. Its UK Athletics affiliation supports a programme led by locally based coaches and experienced run leaders. The emphasis is on learning routes, building confidence off road and running in company.",
      "The club normally meets fortnightly on a Wednesday or Thursday evening, with a choice of distances commonly around eight and ten kilometres. Longer weekend runs are also offered. Leaders regroup at gates and trail junctions, and someone stays towards the back so that the group remains together.",
      "New runners can try a weekday group run before buying membership and should introduce themselves to a leader first. Trail shoes are required; winter evening sessions also call for a head torch and high-visibility clothing. The online calendar gives the actual venue and route, while the club’s contact and welfare emails provide separate ways to raise questions."
    ],
    sources: [
      { title: "Club area and session pattern", url: "https://chilterntrailrunners.com/" },
      { title: "Coaches and club approach", url: "https://chilterntrailrunners.com/about/" },
      { title: "Trial runs, distances and equipment", url: "https://chilterntrailrunners.com/faq/" },
      { title: "Club and welfare contacts", url: "https://chilterntrailrunners.com/contact/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Wendover", county: "Buckinghamshire" },
    location_note: "Wendover is a regular meeting area, not a fixed clubhouse. Check the calendar because trail sessions rotate between locations."
  },
  "chineham-park-running-club": {
    summary: "Chineham Park Running Club offers coached and social running around Basingstoke, including recovery sessions, club nights and Sunday long runs.",
    biography: [
      "Chineham Park Running Club serves adult runners in Basingstoke, Hampshire, England. The England Athletics-affiliated club welcomes a range of abilities and aims to help members improve their running in a supportive group. Its activities include local road races, cross-country and events from 10K through to marathons and ultras.",
      "Wednesday is the main club night. The published winter meeting point is outside Fitness First in Chineham Business Park; summer sessions use different venues around Basingstoke. Monday outings are intended as easy or recovery runs, while a leader-organised Sunday long run is usually around ten miles and can form part of longer race preparation.",
      "Membership is for people aged 18 and over. Prospective members are encouraged to arrange a coached taster session through the membership email. The club also holds social events, general meetings and guest-speaker sessions, giving members a say in its development as well as a regular group to run with."
    ],
    sources: [
      { title: "Membership and adult eligibility", url: "https://www.chinehamparkrunningclub.com/" },
      { title: "Training, events and affiliation", url: "https://www.chinehamparkrunningclub.com/menu" },
      { title: "Contact and official social links", url: "https://www.chinehamparkrunningclub.com/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.chinehamparkrunningclub.com/", adult_only: true, address: "Fitness First, Chineham Business Park, Basingstoke", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Fitness First is the published winter Wednesday meeting point. Other sessions and summer club nights use different Basingstoke locations; confirm arrangements before attending."
  },
  "chorlton-runners": {
    summary: "Chorlton Runners combines social running, cross-country, track and fell outings in south Manchester, with a clubhouse at the Bowling Green.",
    biography: [
      "Chorlton Runners grew from the efforts of cousins Tony Payne and Ann Carney to create a beginner-friendly running group in Manchester, England. Early Sunday runs met at Chorlton Waterpark. A Tuesday run followed in 2006, and the Bowling Green became the club’s home in 2008. England Athletics affiliation followed in 2014.",
      "The club now serves Chorlton and neighbouring areas including Whalley Range, Stretford, Sale and Didsbury. Social runs sit alongside cross-country, track sessions and team relays. Its Black Sheep group, established in 2013, heads onto trails and fells, while the Chorlton Challenge provides a club race series.",
      "The club’s hall of fame includes Peter Taylor-Bray, who represented Great Britain at the 2023 World Orienteering Championship, and Nathan Drinkwater, credited with the Double Yorkshire Three Peaks record in 2018. These are documented sporting connections, not a statement about either athlete’s present membership.",
      "Newcomers can try up to three club runs before joining. The usual social-run starting point is the Bowling Green clubhouse on Tuesday evenings and Sunday mornings. Use the club’s individual-enquiry form to check a suitable session."
    ],
    notable_members: [
      { name: "Peter Taylor-Bray", connection: "Club hall of fame", detail: "The club records his Great Britain representation at the 2023 World Orienteering Championship." },
      { name: "Nathan Drinkwater", connection: "Club hall of fame", detail: "The club credits him with the Double Yorkshire Three Peaks record in 2018." }
    ],
    sources: [
      { title: "Club history", url: "https://www.chorltonrunners.co.uk/history" },
      { title: "Runs, races and trial visits", url: "https://www.chorltonrunners.co.uk/" },
      { title: "Club hall of fame", url: "https://www.chorltonrunners.co.uk/hall-of-fame" },
      { title: "Enquiry forms", url: "https://www.chorltonrunners.co.uk/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { county: "Greater Manchester", address: "The Bowling Green, Chorlton, Manchester", postcode: "", address_kind: "clubhouse", location_precision: "area-only" },
    location_note: "The Bowling Green is the clubhouse and usual social-run meeting place. The former Longford Park track address is not the start point for every club session."
  },
  "cirencester-ac": {
    summary: "Founded in 1985, Cirencester Athletics Club offers running, junior track and field and triathlon training in the Gloucestershire Cotswolds.",
    biography: [
      "Cirencester Athletics Club was formed in 1985 and serves Cirencester and the surrounding Cotswolds in Gloucestershire, England. Alongside adult running, it has a junior and teen track-and-field section and incorporates Cirencester Triathlon Club. Members range from people developing their fitness to athletes competing internationally.",
      "Tuesday adult training uses coached interval, effort and hill sessions, with groups of different intensities. The summer base is the grass track at Deer Park School; winter sessions start at Cotswold Leisure Centre before moving onto routes around town. Thursday morning social runs often visit Cirencester Park, and weekly coached swimming adds another option for triathletes.",
      "The club’s own events include the Summer Sizzler and Chedworth Trail Races. Volunteers organise races, coaching, communications and social activities. Adults can arrange a three-week trial through the training page, while junior enquiries have a separate contact route. Membership runs from April to March, with affiliated and unaffiliated options described on the club website."
    ],
    founded_year: 1985,
    sources: [
      { title: "Club history and sections", url: "https://www.cirencesterac.com/about-us" },
      { title: "Adult training and trials", url: "https://www.cirencesterac.com/seniors" },
      { title: "Membership and affiliation", url: "https://www.cirencesterac.com/members" },
      { title: "Club events and contact routes", url: "https://www.cirencesterac.com/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.cirencesterac.com/", address: "Cotswold Leisure Centre, Tetbury Road, Cirencester, GL7 1US", address_kind: "training", sports: ["Running", "Athletics", "Triathlon", "Swimming"] },
    location_note: "Cotswold Leisure Centre is the winter adult meeting point and swimming venue. Summer running uses Deer Park School; juniors have separate arrangements."
  },
  "city-of-birmingham-striders": {
    summary: "City of Birmingham Striders offers city-centre running, coached sessions and social runs, building on the Yoga Haven running group started in 2012.",
    biography: [
      "City of Birmingham Striders, usually called COBS, is a running club in Birmingham, England. It developed from the Yoga Haven run club established in 2012. The club combines coached training with social running and encourages people to try sessions before deciding whether to become members.",
      "Its published programme includes Tuesday coaching at Aston University’s Woodcock Street Sports Centre, Thursday runs from St Paul’s Square and longer Sunday outings from Brindleyplace. Monthly track sessions and morning 5K runs add variety. Meeting details should be checked through the club’s session-booking route because not every run starts in the Jewellery Quarter.",
      "A partnership with Aston Gazelles began in September 2023 after England Athletics coaching support encouraged the two groups to train together. The governing body’s account describes increased attendance and a way for students to keep running with a club after graduation. COBS also supports members entering cross-country and relay competition, and invites confidential enquiries where membership cost is a barrier."
    ],
    sources: [
      { title: "Origins and club sessions", url: "https://cobs.org.uk.connectmyclub.co.uk/" },
      { title: "Trial runs and membership support", url: "https://cobs.org.uk.connectmyclub.co.uk/info/membershipfaq" },
      { title: "England Athletics account of the Aston Gazelles partnership", url: "https://www.englandathletics.org/news/birmingham-running-clubs-collaborating-to-improve-athlete-experience/" },
      { title: "Club contact form", url: "https://cobs.org.uk.connectmyclub.co.uk/contact" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://cobs.org.uk.connectmyclub.co.uk/", address: "St Paul’s Square, Jewellery Quarter, Birmingham, B3 1HA", address_kind: "training" },
    location_note: "St Paul’s Square is the Thursday meeting area, not a verified clubhouse at number 64. Other sessions start at Aston University, Brindleyplace or the advertised track venue."
  },
  "welsh-athletics-merthyr-running-club": {
    summary: "Merthyr Running Club offers social and club runs in Merthyr Tydfil, with Welsh Athletics affiliation and a community-focused programme.",
    biography: [
      "Merthyr Running Club is a community running club in Merthyr Tydfil, Wales. It welcomes a range of abilities and backgrounds, with an emphasis on fitness, wellbeing and individual running goals. Its Welsh Athletics affiliation sits alongside a social approach that gives members company and encouragement on regular runs.",
      "The club website lists Monday and Sunday social runs and a Thursday club run. The membership page identifies Merthyr Leisure Centre as the Thursday and Sunday meeting point. Runners should check the individual session notice for the current start time and route, particularly before a first visit.",
      "Shared race trips, member race round-ups and summer and Christmas social events form part of club life. The website also carries information about the Merthyr Half Marathon. Membership follows the April-to-March athletics year; the club publishes both an enquiry email and telephone number for people wanting to discuss joining or a suitable session."
    ],
    sources: [
      { title: "Club purpose and public contact details", url: "https://www.merthyrhalfmarathon.co.uk/" },
      { title: "Membership and leisure-centre sessions", url: "https://www.merthyrhalfmarathon.co.uk/membership/" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "Rhydycar/Merthyr Leisure Centre is the published Thursday and Sunday meeting point. Confirm individual sessions with the club; this is not a postal address."
  },
  "welsh-athletics-micky-morris-racing-team": {
    summary: "Micky Morris Racing Team is an East Wales endurance club covering road, cross-country, trail and mountain running, with a documented elite marathon connection.",
    biography: [
      "Micky Morris Racing Team is listed by Welsh Athletics in its East Wales region. The club’s declared disciplines are road running, cross-country, trail and fell or mountain running, and its colours are green with gold trim. It is an endurance-running team rather than a track-and-field club in the governing body’s directory.",
      "Marathon runner Natasha Cockram is part of the team’s international story. Welsh Athletics named Micky Morris Racing Team as her club in its July 2022 introduction to the Welsh Commonwealth Games marathon squad. This records her association at the time of selection, rather than her current club status.",
      "The directory provides a main club enquiry contact and two welfare contacts. Prospective members should use those details to ask about training groups, meeting places and joining requirements. A current public timetable, fixed training address and primary account of the club’s foundation have not yet been established."
    ],
    notable_members: [{ name: "Natasha Cockram", connection: "Welsh Athletics club listing in July 2022", detail: "Named with Micky Morris Racing Team in Welsh Athletics’ introduction to the 2022 Commonwealth Games marathon squad; this is a dated association, not current-membership verification." }],
    sources: [
      { title: "Governing-body club directory", url: "https://www.welshathletics.org/en/club/view/micky-morris-racing-team" },
      { title: "Commonwealth Games 2022 marathon squad introduction", url: "https://www.welshathletics.org/en/blog/post/commonwealth-games-2022-marathon" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "", location_precision: "area-only" },
    location_note: "East Wales is the governing body’s regional classification, not a town or confirmed training venue. Ask the club for its current meeting arrangements."
  },
  "welsh-athletics-neath-harriers": {
    summary: "Neath Harriers trains at Cwrt Herbert running track in Neath, offering junior and senior athletics, cross-country and road-running competition.",
    biography: [
      "Neath Harriers is an athletics club based at Cwrt Herbert running track in Neath, Wales. It belongs to the West Wales athletics region and offers coaching across running, jumping and throwing, as well as cross-country and road running. Beginners and experienced athletes are welcomed, with competition matched to their ability.",
      "Tuesday and Thursday training includes endurance, sprints, throws and junior development sessions, with some specialist disciplines following their own arrangements. The club accepts athletes from their ninth birthday. It asks every member to compete appropriately and makes clear that it cannot accommodate people joining solely to get fit for another sport.",
      "The contribution of volunteers is visible in the club’s record of Steve Hames receiving the Welsh Athletics Services to Club Development award in September 2024. The tribute describes his work with junior and senior sections, team organisation and officiating. Newcomers can use the club enquiry email or phone to discuss a suitable coaching group before attending."
    ],
    notable_members: [{ name: "Steve Hames", connection: "Club chair recognised in 2024", detail: "Received the Welsh Athletics Services to Club Development award in September 2024 for his contribution to Neath Harriers and athletics volunteering." }],
    sources: [
      { title: "Club disciplines and home venue", url: "https://neath-harriers.co.uk/" },
      { title: "Joining, coaching and competition expectations", url: "https://neath-harriers.co.uk/join-neath-harriers/" },
      { title: "Club report of Steve Hames’ development award", url: "https://neath-harriers.co.uk/news/welsh-athletics-run-wales-annual-awards-evening-steve-hames/" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "Cwrt Herbert running track at the sports centre on Neath Abbey Road, SA10 7BE, is the training and home-event venue. Confirm the appropriate coaching group before visiting."
  },
  "welsh-athletics-north-wales-road-runners": {
    summary: "North Wales Road Runners is based in Llandudno, with weekly group runs, club races and a long association with the Nick Beer 10K.",
    biography: [
      "North Wales Road Runners is based in Llandudno, Wales, and celebrated its fortieth anniversary in 2023. Its programme brings together social runners and competitors for road races, cross-country and other endurance events. Journalist and masters runner Don Hale has chronicled much of the club’s activity on its website.",
      "Tuesday training normally starts at Ysgol John Bright on Maesdu Road, with runs of roughly four to seven miles and tail runners supporting the group. Meeting places can change, so the club asks runners to check its current notices. The membership programme also includes a summer promenade relay, a Christmas handicap and a club championship organised by ability group.",
      "The club’s history is closely connected with the Nick Beer 10K around the Great Orme. After years of club organisation, management passed to Always Aim High Events from 2023, with the event continuing to support the club and local charities. Membership and general enquiries can be sent through role-specific forms on the club website."
    ],
    notable_members: [{ name: "Don Hale", connection: "Club runner and reporter", detail: "The club’s 2023 anniversary report identifies the award-winning journalist as a masters runner with North Wales Road Runners and the author of its account." }],
    sources: [
      { title: "Fortieth anniversary report", url: "https://nwrrc.co.uk/large-turn-out-for-nwrrcs-40th-anniversary-gathering/" },
      { title: "Tuesday training arrangements", url: "https://nwrrc.co.uk/training-sessions-for-north-wales-road-runners/" },
      { title: "Membership and club events", url: "https://nwrrc.co.uk/membership/" },
      { title: "Nick Beer 10K management handover", url: "https://alwaysaimhighevents.com/journal/always-aim-high-events-take-on-iconic-nick-beer-10k-event-for-2023" },
      { title: "Club contact form and address", url: "https://nwrrc.co.uk/contact-nwrrc/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Llandudno", county: "Conwy", website: "https://nwrrc.co.uk/", address: "Ysgol John Bright, Maesdu Road, Llandudno, LL30 1LF", postcode: "LL30 1LF", address_kind: "training", location_precision: "postcode" },
    location_note: "Ysgol John Bright is the usual Tuesday meeting point, with access arrangements described by the club. Check notices for occasional changes."
  },
  "welsh-athletics-ogmore-phoenix-runners": {
    summary: "Ogmore Phoenix Runners grew from Cwm Ogwr Running Club and offers road, trail and beginner running across the Ogmore Valley and Bridgend area.",
    biography: [
      "Ogmore Phoenix Runners traces its roots to Cwm Ogwr Running Club, founded in Ogmore Vale in 2012. It adopted the Phoenix name in 2017. The volunteer-run Welsh Athletics club now draws runners from the Ogmore, Garw and Llynfi valleys, Bridgend and nearby communities in South Wales.",
      "Its beginner programme has helped people progress from their first 5K to longer races, while established runners take part in local leagues and shared race trips. Training includes sessions around Ynysawdre, Thursday outings from the Life Centre in Ogmore Vale and occasional track sessions at Bridgend. Sunday trail runs depend on leader availability.",
      "The club uses Spond for up-to-date session locations and changes. Runs include regular regrouping, with coaches and qualified leaders supporting different abilities. Full, second-claim and social membership options are available, and the membership secretary can explain the application process. Social gatherings and friendships are as much part of the club’s story as its race results."
    ],
    founded_year: 2012,
    sources: [
      { title: "Club origins and community", url: "https://www.ogmorephoenixrunners.co.uk/" },
      { title: "Training venues and booking notices", url: "https://www.ogmorephoenixrunners.co.uk/training/" },
      { title: "Membership options", url: "https://www.ogmorephoenixrunners.co.uk/membership/" },
      { title: "Club and membership contacts", url: "https://www.ogmorephoenixrunners.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "The club serves several valleys and the Bridgend area. Thursday runs use the Life Centre in Ogmore Vale; other meeting points are confirmed through Spond."
  },
  "welsh-athletics-outdoor-fitness": {
    summary: "Outdoor Fitness combines outdoor group exercise and Welsh Athletics-affiliated running in Cardiff and across South Wales, operating since 2008.",
    biography: [
      "Outdoor Fitness was established in 2008 and provides outdoor group training in Cardiff and other South Wales locations. It is a fitness provider with Welsh Athletics affiliation, rather than simply a conventional road-running club. Members can train for general fitness, use the sessions alongside another sport or race as part of its running team.",
      "Classes combine cardiovascular work with strength, core and balance exercises, using bodyweight rather than relying on gym equipment. Participants train together, with instructors adapting the work to different fitness levels. The programme also includes challenges and events, and the organisation emphasises the friendships that develop through regular outdoor sessions.",
      "The website advertises an introductory first session and both pay-per-session and membership arrangements. Training takes place across multiple venues, so prospective participants should ask about the current timetable and the most suitable class. A telephone number, named enquiry email and contact form are published for that purpose."
    ],
    founded_year: 2008,
    sources: [
      { title: "Origins, affiliation and training approach", url: "https://www.outdoorfitnessltd.com/" },
      { title: "Class structure and fitness levels", url: "https://www.outdoorfitnessltd.com/about/" },
      { title: "Enquiries and multiple venues", url: "https://www.outdoorfitnessltd.com/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address: "Cafe Castan, Cardiff, CF11 9QJ", address_kind: "training" },
    location_note: "Cafe Castan is a directory-listed Cardiff meeting point, not the base for every class. Outdoor Fitness operates at several South Wales venues; confirm the current session location."
  },
  "cavan-triathlon-club": {
    summary: "Cavan Triathlon Club serves Cavan and the surrounding area, with documented beginner programmes and investment in swimming-support equipment.",
    biography: [
      "Cavan Triathlon Club is based in Cavan, Ireland, and appears in Triathlon Ireland’s club directory. Its published history of beginner activities shows a route into swimming, cycling and running for people who have not previously combined the three sports, as well as a club option for experienced triathletes.",
      "In January 2018 the club held an open evening in Drumalee and launched a six-to-eight-week New to Tri programme. That course worked towards a short pool-based triathlon, combining guided training with an achievable first event. It is a documented example of the club’s development work, not an announcement that the same course is currently open.",
      "Triathlon Ireland’s 2021 equipment-funding report also records an allocation for a pontoon, defibrillator and paddleboards. The governing body continues to publish the club’s enquiry email and Cavan location. Newcomers should contact the club for current training venues, beginner-course availability and age eligibility rather than rely on an older event notice."
    ],
    sources: [
      { title: "Current governing-body club listing", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "January 2018 open evening and beginner programme", url: "https://www.triathlonireland.com/news/2018/cavan-triathlon-club-open-evening/" },
      { title: "Equipment funding reported in 2021", url: "https://www.triathlonireland.com/news/2021/triathlon-ireland-clubs-receive-e370k-in-equipment-funding/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Cavan" },
    location_note: "Cavan is the directory-listed base. The 2018 open-evening venue is historical and is not presented as a current training address."
  },
  "crosshaven-triathlon-club": {
    summary: "Crosshaven Triathlon Club serves triathletes in County Cork, with national recognition for its work welcoming beginners and returning athletes.",
    biography: [
      "Crosshaven Triathlon Club is based in Crosshaven, County Cork, Ireland. Triathlon Ireland’s directory publishes a direct club enquiry email and does not list a junior section. Its community work has received national recognition alongside its involvement in swimming, cycling and running.",
      "At the 2025 Triathlon Ireland awards, Jason Tivy received the Lynne Algar Spirit of Triathlon Award. The governing body’s account credits his Crosshaven programme with bringing more than a hundred beginners and returning participants into consistent training, and highlights the care taken to make sessions welcoming.",
      "Crosshaven also appears in Triathlon Ireland’s 2026 Women in Sport Advocate programme through Justine Keohane, who is listed with both Crosshaven and Midlands Triathlon Club. For anyone interested in joining, the club email is the best published route to ask about suitable sessions, meeting points and beginner opportunities."
    ],
    notable_members: [
      { name: "Jason Tivy", connection: "Crosshaven community programme recognised in 2025", detail: "Winner of the 2025 Lynne Algar Spirit of Triathlon Award; Triathlon Ireland recognised his work welcoming beginners and returning athletes in Crosshaven." },
      { name: "Justine Keohane", connection: "2026 Women in Sport Advocate", detail: "Listed by Triathlon Ireland with Crosshaven and Midlands Triathlon Club in its 2026 Women in Sport Advocate programme." }
    ],
    sources: [
      { title: "Club location and direct enquiry email", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "2025 annual awards and Jason Tivy", url: "https://www.triathlonireland.com/news/triathlon-ireland-annual-awards-night-2025/" },
      { title: "2026 Women in Sport Advocates", url: "https://www.triathlonireland.com/news/introducing-our-women-in-sport-advocates/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Crosshaven" },
    location_note: "Crosshaven is the club’s operating area. No current training or correspondence street address is established here."
  },
  "cuilcagh-tc": {
    summary: "Cuilcagh Triathlon Club brings together swimmers, cyclists and runners around Swanlinbar and Cuilcagh Mountain, with a cross-border membership catchment.",
    biography: [
      "Cuilcagh Triathlon Club is based around Swanlinbar and Cuilcagh Mountain in County Cavan, Ireland. Its community profile describes a cross-border catchment, drawing swimmers, cyclists and runners from Cavan, Leitrim, Donegal and Fermanagh.",
      "Members take part in swimming, cycling and running individually as well as triathlon, other combined events and adventure races. The club’s account includes both people participating for enjoyment and those who want to compete. A community-hosted history also describes a June bank-holiday club race and fundraising for local organisations, although it does not establish a current race date.",
      "The public club enquiry email is corroborated by both Triathlon Ireland and the Swanlinbar community page. A Derryvaughan, Ballyconnell address is published there as a contact address, not as a training venue. Prospective members should email for current sessions, race plans and joining arrangements."
    ],
    sources: [
      { title: "Governing-body location and enquiry email", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "Club account hosted by Swanlinbar Development Association", url: "https://www.swanlinbar.ie/cuilcagh-triathlon-club/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Swanlinbar", address: "Cuilcagh Tri Club, Derryvaughan, Ballyconnell, Co. Cavan", address_kind: "correspondence", location_precision: "area-only" },
    location_note: "Derryvaughan, Ballyconnell is a published correspondence/contact address. The club serves the wider Cuilcagh region; do not travel to this address expecting a training session."
  }
};
