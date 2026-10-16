import type { ClubProfile } from "./club-profiles";

// Official club, governing-body and club-authored sources opened 15 October 2026.
export const regionalParticipationAndCoachingProfiles: Record<string, ClubProfile> = {
  "havering-90-joggers": {
    summary: "Havering '90 Joggers is an Upminster running club with coached groups, Learn to Run courses and a base at Upminster Rugby Club.",
    biography: [
      "Havering '90 Joggers began in 1990 and is based in Upminster, Greater London, England. Its early meeting places included Hornchurch Sports Centre and Abbs Cross before the move to Upminster Rugby Club. The club offers adult runners company and coaching, with groups that let members build confidence or work towards their own race goals.",
      "Tuesday and Thursday evening sessions meet at Two Gables, the rugby club's home on Hall Lane, with Sunday morning running adding a longer outing to the week. New runners can ask about Learn to Run courses, while those already running can try club sessions before committing to membership. The appropriate group and current arrangements should be checked with the club first.",
      "The club's hall of fame records contribution as well as running performance. It remembers Ron Dobie's service as president from 2015 to 2022, placing that role firmly in the club's history. Public enquiries go to the club's general email rather than to the rugby venue's separate administration."
    ],
    founded_year: 1990,
    notable_members: [{ name: "Ron Dobie", connection: "Former club president", detail: "The club's hall of fame records his presidency from 2015 to 2022." }],
    sources: [
      { title: "Club history, training and joining", url: "https://www.h90j.org.uk/about-us" },
      { title: "Club honours and former president", url: "https://www.h90j.org.uk/hall-of-fame" },
      { title: "Current club base and enquiries", url: "https://www.h90j.org.uk/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Upminster", address: "Two Gables, Upminster Rugby Club, Hall Lane, Upminster", postcode: "RM14 1AU", address_kind: "training" }
  },
  "hayle-runners": {
    summary: "Hayle Runners combines coached running in Hayle, Cornwall, with track sessions at Carn Brea, trail outings and local race organisation.",
    biography: [
      "Hayle Runners brings together runners in Hayle, Cornwall, England, with a programme extending from supported walk-run activity to faster endurance training. Tuesday club evenings use Hayle Rugby Club as their base, with several groups so that members can find suitable company rather than follow one pace. Walk-run sessions are offered on selected Tuesdays by arrangement, and beginner courses have their own advertised starts.",
      "Thursday training offers two different settings: track running at Carn Brea Leisure Centre in Pool, near Redruth, and trail outings from changing locations. Sunday runs include longer preparation for half marathons and marathons as well as shorter alternatives. Members should check each announcement, since these sessions do not all begin in Hayle.",
      "The club organises the Marazion 10K and St Ives Bay 10K, linking road running with Cornwall's coastal terrain. Its 2025 honours named Andrea Simmons female Runner of the Year and recognised Mark Hynard for distinguished service. Prospective members can use the club's enquiry form to discuss adult, junior or beginner options before attending."
    ],
    notable_members: [
      { name: "Andrea Simmons", connection: "2025 club award recipient", detail: "Hayle Runners' hall of fame names her female Runner of the Year for 2025." },
      { name: "Mark Hynard", connection: "2025 distinguished-service recipient", detail: "The club's 2025 honours recognise his distinguished service." }
    ],
    sources: [
      { title: "Club activities and races", url: "https://www.haylerunners.com/" },
      { title: "Training groups and changing venues", url: "https://haylerunners.com/training/" },
      { title: "Club honours", url: "https://haylerunners.com/about-us/hall-of-fame/" },
      { title: "Club enquiries", url: "https://haylerunners.com/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Hayle Rugby Club is the Tuesday base. Carn Brea track and changing Thursday trail and Sunday starts are separate venues.",
    corrections: { address_kind: "training" }
  },
  "hazlemere-runners": {
    summary: "Hazlemere Runners offers community running near High Wycombe, with Couch to 5K, improver groups and locally organised races.",
    biography: [
      "Hazlemere Runners grew from informal runs that began in October 2016 and became a formal club in June 2017. Based around Hazlemere, High Wycombe and neighbouring Penn and Tylers Green in Buckinghamshire, England, it developed through a council health initiative and volunteer support from Active-In. That background remains visible in its emphasis on helping people begin running and then keep going.",
      "The club provides Couch to 5K and improver activity alongside its regular groups. Its membership guidance asks runners joining ordinary sessions to be able to run five kilometres; people not yet at that stage are directed towards the beginner programme. A trial can be arranged through the club's registration system before applying for membership.",
      "Local events include the Hazlemere Super 5 and West Wycombe Trails. First- and second-claim membership options allow runners to choose the appropriate England Athletics arrangement. Use the club's contact form to check the next course, trial availability and the meeting instructions for Hazlemere Recreation Ground rather than assuming that every group starts in the same place."
    ],
    founded_year: 2017,
    sources: [
      { title: "Origins and community running", url: "https://www.hazlemererunners.co.uk" },
      { title: "Membership and trial eligibility", url: "https://www.hazlemererunners.co.uk/membership-options/" },
      { title: "Recreation-ground meeting guidance", url: "https://www.hazlemererunners.co.uk/meeting-points/" },
      { title: "Club contact form", url: "https://www.hazlemererunners.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The club publishes meeting-point guidance for Hazlemere Recreation Ground. Confirm the specific session's start before attending."
  },
  "heaton-harriers-and-athletics-club-limited": {
    summary: "Heaton Harriers is a Newcastle running and athletics club founded in 1890, with coached sessions, junior development and a long racing history.",
    biography: [
      "Heaton Harriers was founded on 4 November 1890 in Newcastle upon Tyne, England. Its history follows the club through the first Memorial Road Race in 1920, strong inter-war competition and a revival after a difficult period in the 1970s. The junior section was re-established in 2008, adding a new generation to a club with deep roots in North East athletics.",
      "Among its historical athletes is Maurice Benn, who competed at the 1968 Olympic Games. The club also remembers runner Anita Nott through its memorial women's event. These connections sit alongside the everyday programme of coached training and club racing, rather than implying that former athletes are current members.",
      "The current club website lists Longbenton Sports Ground on Coach Lane as its base, with Tuesday, Thursday and Sunday sessions managed through Spond. The adult trial page expects applicants already to be capable of five miles at roughly ten-minute-mile pace or faster; it is not a complete beginner course. Prospective runners should submit the trial form and confirm the group, location and seasonal visibility requirements before travelling."
    ],
    founded_year: 1890,
    notable_members: [
      { name: "Maurice Benn", connection: "Historical club athlete and Olympian", detail: "The club's history identifies Benn as a competitor at the 1968 Olympic Games." },
      { name: "Anita Nott", connection: "Late runner commemorated by the club", detail: "Heaton's history recalls her involvement and the women's memorial running event held in her name." }
    ],
    sources: [
      { title: "Club history", url: "https://heatonharriers.org.uk/potted-history/" },
      { title: "Adult trial requirements", url: "https://heatonharriers.org.uk/trial-a-session/" },
      { title: "Current training base and contacts", url: "https://heatonharriers.org.uk/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://heatonharriers.org.uk/", address_kind: "training" }
  },
  "hedge-end-running-club": {
    summary: "Hedge End Running Club serves Hedge End, West End and Botley near Southampton with coached road running, track sessions and cross-country teams.",
    biography: [
      "Hedge End Running Club was formed in November 2012 to bring runners together around Hedge End, West End and Botley, near Southampton in Hampshire, England. Its programme combines sociable group running with structured training and opportunities to represent the club in local road and cross-country leagues.",
      "Tuesday sessions include intervals or hills at changing locations, with a separate track option at Southampton Sports Centre. Thursday groups cover different paces and distances, while Monday activities provide another way to train or meet other members. The club participates in the Hampshire Road Race League and the CC6, RR10 and Hampshire cross-country competitions.",
      "New runners can enquire about a trial before applying through Teamo. Membership is completed through the club's application and invoicing process, with first- and second-claim options. Community support also features in club life: Mountbatten Hampshire was its chosen charity for 2025. Check the current session announcement for the meeting place, as a general Botley Road directory address does not describe every training start."
    ],
    founded_year: 2012,
    sources: [
      { title: "Origins, training, membership and 2025 charity", url: "https://www.hedgeendrunningclub.com/aboutTheClub" },
      { title: "Club news and role contacts", url: "https://www.hedgeendrunningclub.com" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Meeting points vary by session and are communicated through the club. Southampton Sports Centre track is a separate Tuesday option; the former exact Botley Road directory address is not confirmed as a fixed training base.",
    corrections: { city: "Hedge End", address: "", postcode: "", location_precision: "unverified" }
  },
  "henfield-joggers": {
    summary: "Henfield Joggers is a West Sussex running club with social trail outings, local league participation and community races around Henfield.",
    biography: [
      "Henfield Joggers began with six people on its first club run on 1 April 1990. Based in Henfield, West Sussex, England, it has retained a sociable approach to running, with local countryside routes and optional competition rather than an expectation that everyone must race.",
      "Wednesday evening is the regular club outing. Henfield Leisure Centre is the usual base, while many summer runs start from local pubs and explore different trails. Members also take part in the West Sussex Fun Run League and the South Downs Relay; the club records an overall relay victory in 2022.",
      "The Seven Stiles race and a half marathon organised with the leisure centre connect the club to the wider local running community. Prospective members can enquire by email and apply through the club's online membership route. England Athletics affiliation is an optional addition rather than the same thing as club membership. Check the week's start point before joining a run, especially during the summer programme."
    ],
    founded_year: 1990,
    sources: [
      { title: "First run and club history", url: "https://www.henfieldjoggers.co.uk/history/" },
      { title: "Current club programme", url: "https://www.henfieldjoggers.co.uk" },
      { title: "Membership and optional affiliation", url: "https://www.henfieldjoggers.co.uk/new-members/" },
      { title: "Club enquiries", url: "https://www.henfieldjoggers.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Henfield Leisure Centre is the usual base, not a guarantee of every start. Summer pub runs use different meeting points.",
    corrections: { address_kind: "training" }
  },
  "hercules-running-and-tri-club": {
    summary: "Hercules Running & Tri Club combines local coached running in Harlow, Essex, with an explicitly worldwide Zwift running and cycling community.",
    biography: [
      "Hercules Running & Tri Club brings together local runners in Harlow, Essex, England, and a worldwide virtual community on Zwift. The not-for-profit club describes affiliations with England Athletics and British Triathlon and offers different ways to belong depending on whether members train locally, online or through both.",
      "Local activity includes coached track running in Harlow. Online, members can join treadmill running, social rides and structured cycling sessions, with banded rides intended to keep different abilities together. Competitive Zwift teams take part in the Zwift Racing League and WTRL team time trials, while members can also represent the club at in-person running and multisport events.",
      "Founder and head coach Paul Schroder leads the coaching side. Membership options distinguish a free virtual community from second-claim, student, international and England Athletics-affiliated arrangements. The club app provides schedules and updates; newcomers should check the appropriate membership and training location before attending. Its international scope is explicitly described by the club, not inferred merely from having an online presence."
    ],
    scope: "global",
    notable_members: [{ name: "Paul Schroder", connection: "Founder and head coach", detail: "The club identifies him as its founder and a qualified England Athletics and British Triathlon coach." }],
    sources: [{ title: "Local and worldwide programme, coaching and membership", url: "https://herculesrunningandtri.com/" }],
    reviewed_at: "2026-10-15",
    location_note: "Harlow is the local coaching base, alongside an explicitly global Zwift community. The current site does not confirm the precise track address; use the club app for session details.",
    corrections: { city: "Harlow", address: "", postcode: "", location_precision: "unverified" }
  },
  "hereford-and-county-ac": {
    summary: "Hereford & County AC provides track-and-field athletics in Hereford, with development coaching, junior and senior competition and bookable trial sessions.",
    biography: [
      "Hereford & County Athletics Club was founded in 1962 and is based at the athletics track at Hereford Leisure Centre, Herefordshire, England. Its programme covers track and field, giving young athletes a route into the sport and supporting junior and senior competition through the club's teams.",
      "Children can start from school year four. Development and junior coaching introduce the disciplines, with sportshall athletics providing another form of competition alongside outdoor league fixtures. Regular Tuesday and Thursday evening sessions use the Holmer Road facility; the club publishes seasonal adjustments to the timetable.",
      "New athletes can book two trial sessions before deciding whether to join. Booking is essential, so families and adult applicants should contact the club email rather than simply turn up at the track. Members use Spond for communication, and membership information explains the application and England Athletics arrangements. The leisure centre is a training venue; its general reception is not a substitute for the athletics club's own enquiry contact."
    ],
    founded_year: 1962,
    sources: [
      { title: "Club origins and age groups", url: "https://www.herefordcountyathletics.co.uk/about-us" },
      { title: "Training, trial booking and contact", url: "https://www.herefordcountyathletics.co.uk/" },
      { title: "Joining the club", url: "https://www.herefordcountyathletics.co.uk/membership" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://www.herefordcountyathletics.co.uk/", address_kind: "training" }
  },
  "hereford-couriers-running-club": {
    summary: "Hereford Couriers Running Club grew from a postal-workers' club in 1981 and now offers group running, race training and local events in Hereford.",
    biography: [
      "Hereford Couriers Running Club began in 1981 when Derek Davies brought postal workers together to run. Originally known as The Couriers, it later opened to a wider membership and adopted the Hereford name. The club's history also recalls early ultrarunner Martin Daykin, illustrating how members' interests extended beyond ordinary road distances.",
      "Today the Hereford, Herefordshire, England club offers Tuesday and Thursday runs in several pace and distance groups from Hereford Leisure Centre. Separate speed sessions use track, road or hills according to the published programme. Members take part in road running, cross-country and fell running, with some track competition too.",
      "The club contributes to the local race calendar through its Christmas 10K, Jon Ward memorial 5K and 5K series, supported by volunteers. Membership is available from age sixteen, with first- and second-claim arrangements described on the joining page. New runners should contact the club or consult the current programme to find a suitable group; the Couriers remain distinct from Hereford & County Athletics Club despite sharing a venue."
    ],
    founded_year: 1981,
    notable_members: [
      { name: "Derek Davies", connection: "Club founder", detail: "The club's history credits him with bringing postal workers together to establish The Couriers in 1981." },
      { name: "Martin Daykin", connection: "Historical club ultrarunner", detail: "The Couriers' history identifies Daykin among its early members with an interest in ultra-distance running." }
    ],
    sources: [
      { title: "Club history and events", url: "https://herefordcouriers.com/" },
      { title: "Training and 2026–27 membership", url: "https://herefordcouriers.com/membership/" },
      { title: "Club enquiry form and email", url: "https://herefordcouriers.com/contactus/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address_kind: "training" }
  },
  "hereford-triathlon-club": {
    summary: "Hereford Triathlon Club offers swimming, cycling and running in Herefordshire, with volunteer-led club activity and a history dating to 1988.",
    biography: [
      "Hereford Triathlon Club was formed in 1988 after a local triathlon the previous year sparked interest in the sport. Its first club race followed in 1990. Based in Hereford, Herefordshire, England, it brings swimming, cycling and running together through a volunteer-run programme rather than treating each discipline as a separate club.",
      "Published training includes pool swimming at Hereford Leisure Pool, running and cycle outings, summer open-water activity and seasonal cycling options. The pool and Hereford Leisure Centre are different facilities: the latter appears in the programme through parkrun, not as the venue for every swim or run. Members should check the current session details before attending.",
      "The club asks members to help marshal one of its events, supporting the volunteer effort that funds coaching. Swimming sessions require an ability to cover 400 metres front crawl, without a stated minimum speed. Membership is mainly for adults, but sixteen- and seventeen-year-olds may participate under the published supervision conditions. Contact the club to discuss eligibility, membership and the right first session."
    ],
    founded_year: 1988,
    sources: [
      { title: "Origins, eligibility and volunteer expectations", url: "http://www.herefordtriathlonclub.co.uk/membership" },
      { title: "Training and seasonal activities", url: "http://www.herefordtriathlonclub.co.uk/training" },
      { title: "Club enquiries", url: "http://www.herefordtriathlonclub.co.uk/contactus" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Hereford Leisure Pool and Hereford Leisure Centre are separate programme locations. Other cycling and open-water starts vary; confirm the session rather than assuming one fixed clubhouse.",
    corrections: { adult_only: false }
  },
  "herts-phoenix-ac": {
    summary: "Herts Phoenix AC trains at Ware and Welwyn Garden City, offering track and field, road running, cross-country and race walking across age groups.",
    biography: [
      "Herts Phoenix Athletic Club serves athletes from two Hertfordshire bases in England: Wodson Park in Ware and Gosling Sports Park in Welwyn Garden City. It was created by bringing together Verlea AC and Hertford and Ware AC, preserving connections with several earlier local athletics clubs.",
      "Coaches cover track and field, cross-country, road running and race walking, with activity ranging from sportshall athletics to masters competition. Summer outdoor athletics is complemented by winter cross-country, road and indoor opportunities. The National Athletics League's club history records entry to the UK Women's Athletics League in 2005 and the British Athletics League in 2018.",
      "Olympic sprinter Jodie Williams is among the athletes associated with the club in that league history. This is a historical connection, not confirmation of current membership. The club's online membership system offers age-specific, student, senior and second-claim options, subject to approval. New athletes should confirm the appropriate coach and venue before attending, since Ware and Welwyn Garden City are separate training bases."
    ],
    notable_members: [{ name: "Jodie Williams", connection: "Historically associated Olympic sprinter", detail: "The National Athletics League's Herts Phoenix club history identifies Williams as an Olympian associated with the club; current membership is not established here." }],
    sources: [
      { title: "Club origins, disciplines and two bases", url: "https://hertsphoenix.com/about-us-3/" },
      { title: "League history and Olympic association", url: "https://www.nationalathleticsleague.org.uk/club/herts-phoenix/" },
      { title: "Approved membership options", url: "https://membermojo.co.uk/hertsphoenix" },
      { title: "Club programme", url: "https://hertsphoenix.com/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Training is split between Wodson Park, Ware SG12 0UQ, and Gosling Sports Park, Welwyn Garden City AL8 6XE. Check the coach's venue before travelling.",
    corrections: { website: "https://hertsphoenix.com/", address_kind: "training" }
  },
  "hi-runners": {
    summary: "HI Runners offers adult community running north of Cambridge, with coached sessions in Histon, Northstowe and Willingham and support for wellbeing.",
    biography: [
      "HI Runners is an adult running club serving communities north of Cambridge in Cambridgeshire, England. Its sessions bring together people with different experience and goals, from run-walk participation to longer-distance running, with an emphasis on company, encouragement and mental wellbeing alongside fitness.",
      "The weekly programme spreads activity across Histon, Northstowe and Willingham. It includes tempo running and coached interval sessions, while weekend social outings offer another way to meet members. Meeting points vary by day and season: Histon Recreation Ground, guided-busway stops and Northstowe locations are not interchangeable starts.",
      "Prospective members can try two sessions before joining. The club's membership page describes first- and second-claim arrangements and England Athletics affiliation, while its contact form provides a route for questions about suitable groups. Check the current session listing before travelling, especially for Willingham's winter and summer changes. The club also signposts mental-health champions and Run and Talk activity as part of its community support."
    ],
    sources: [
      { title: "Community running and wellbeing", url: "https://hi-runners.co.uk/" },
      { title: "Coached sessions and seasonal meeting points", url: "https://hi-runners.co.uk/sessions/" },
      { title: "Club membership", url: "https://hi-runners.co.uk/membership/" },
      { title: "Club contact form", url: "https://hi-runners.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Histon, Northstowe and Willingham have different session starts, including seasonal changes. A single exact recreation-ground address would not represent the whole programme.",
    corrections: { address: "", postcode: "", location_precision: "unverified", adult_only: true }
  },
  "high-peak-athletic-club": {
    summary: "High Peak Athletic Club provides junior athletics in Buxton, with age-group coaching, sportshall activity and track-and-field opportunities.",
    biography: [
      "High Peak Athletic Club was established in 2014 in Buxton, Derbyshire, England. Its focus is on young athletes aged seven to sixteen, introducing athletics through coached activity and opportunities to develop skills across track-and-field events. The club also describes work with local schools, connecting its sessions to the wider junior sporting community.",
      "The published Saturday programme uses Buxton Community School's large sports hall and outdoor facilities, with groups divided by age and ability. Sportshall athletics and track-and-field competition provide different settings in which children can put those skills into practice.",
      "Parents should use the club contact form to confirm availability and the current arrangements before attending or submitting a junior membership form. The information page marks the additional Thursday Fairfield Centre session as not running because of building work, so it should not be treated as an available weekly option. Older fee information on the website is dated April 2023 and does not establish today's membership charge."
    ],
    founded_year: 2014,
    sources: [
      { title: "Club origins and junior focus", url: "https://highpeakathleticsclub.wordpress.com/" },
      { title: "Saturday venue and suspended Thursday session", url: "https://highpeakathleticsclub.wordpress.com/info/" },
      { title: "Junior enquiries", url: "https://highpeakathleticsclub.wordpress.com/contact/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Saturday coaching is listed at Buxton Community School, using indoor and outdoor facilities. The separate Fairfield Centre Thursday session is marked as suspended.",
    corrections: { address: "Buxton Community School, College Road, Buxton", address_kind: "training", adult_only: false }
  },
  "athletics-ireland-athlone-a-c": {
    summary: "Athlone AC serves the Irish midlands with athletics at the Technological University of the Shannon, a Fit for Life route and masters representation.",
    biography: [
      "Athlone Athletics Club serves Athlone and the surrounding Irish midlands, describing itself through Athletics Ireland as a mixed, inclusive club. Its governing-body membership page identifies the Technological University of the Shannon in Athlone, County Westmeath, Ireland, as its training location and provides a direct route to join or renew.",
      "The club appears in Athletics Ireland's Fit for Life programme, which provides a sociable way for beginners and regular runners to build fitness in ability-based groups. Interested adults can contact the named local programme coordinator to ask about the current Athlone sessions; the national listing does not establish a particular weekly timetable.",
      "Athlone's masters representation includes Eileen Kenny, identified by Athletics Ireland in August 2024 as part of an Irish over-seventy women's 4 × 800-metre relay team that set a world-record performance, then subject to ratification. This is a dated sporting association, not confirmation of her present membership or of subsequent record ratification. For current training groups, age eligibility and joining advice, use the club's own published enquiry details."
    ],
    notable_members: [{ name: "Eileen Kenny", connection: "Athlone masters athlete identified in 2024", detail: "Athletics Ireland's August 2024 report names her in the over-seventy women's 4 × 800-metre record-setting relay team, with records explicitly subject to ratification." }],
    sources: [
      { title: "Athletics Ireland club membership and training location", url: "https://membership.athleticsireland.ie/clubpage/Athlone_A.C." },
      { title: "Fit for Life programme and Athlone coordinator", url: "https://www.athleticsireland.ie/get-involved/programmes/fit4life/" },
      { title: "Dated 2024 masters relay report", url: "https://www.athleticsireland.ie/123-ie-national-masters-track-and-field-championships/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Technological University of the Shannon, Athlone", postcode: "N37 F6D7", address_kind: "training" }
  },
  "athletics-ireland-boyne-a-c": {
    summary: "Boyne AC is a Drogheda athletics club training at Lourdes Stadium, with documented combined-events achievement and participation in women's leadership development.",
    biography: [
      "Boyne Athletics Club is based in Drogheda, County Louth, Ireland. Athletics Ireland's membership directory lists Lourdes Stadium on Boyle O'Reilly Terrace as its training location and identifies it as a mixed club. The same page provides the official joining and renewal route, keeping Boyne distinct from other athletics clubs serving the Drogheda area.",
      "Its sporting history includes Amy McTeggart's junior women's heptathlon victory at the 2014 national combined-events championships. Athletics Ireland's contemporary report attributes the performance to Boyne AC, providing a specific example of the club's track-and-field representation without implying that the athlete remains a member today.",
      "Boyne was also among the clubs supporting participants in Athletics Ireland's 2025 Women in Sport Leadership Programme, which developed practical leadership and committee skills. That is a dated development activity rather than an advertised current training course. Prospective members should use the official membership route and confirm available age groups, coaching sessions and the stadium meeting arrangements; a current timetable and reliable public club enquiry email were not established in the sources reviewed."
    ],
    notable_members: [{ name: "Amy McTeggart", connection: "Boyne athlete at the 2014 national championships", detail: "Athletics Ireland's contemporary report records her junior women's heptathlon title while representing Boyne AC." }],
    sources: [
      { title: "Official membership and Lourdes Stadium listing", url: "https://membership.athleticsireland.ie/clubpage/Boyne_A.C." },
      { title: "2014 national combined-events report", url: "https://www.athleticsireland.ie/national-league-final-ce-championships/" },
      { title: "2025 women's leadership programme", url: "https://www.athleticsireland.ie/leadership-programme-concludes-in-dublin/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Lourdes Stadium, Boyle O'Reilly Terrace, Drogheda", postcode: "A92 DA31", address_kind: "training" }
  },
  "athletics-ni-dub-running-club": {
    summary: "Dub Runners of Belfast is a sociable running club associated with Upper Malone, with road, cross-country and off-road activity and the Giant's Trail Race.",
    biography: [
      "Dub Runners of Belfast is a running club based around Upper Malone in Belfast, Northern Ireland. Athletics Northern Ireland lists the club for senior road, cross-country, mountain and fell running, while its public club description emphasises a mixture of ages, experience and abilities.",
      "The club's Strava page describes Tuesday and Thursday evening meetings at Queen's University Sport's Upper Malone facilities, with a separate Sunday meeting near Belfast Boat Club. These are different starting points, and newcomers should confirm the current programme with the club before relying on the undated public schedule.",
      "Dub Runners organises the Giant's Trail Race through the Lagan Valley. Its 2024 race page described a roughly six-mile route taking in Minnowburn, the Giant's Ring and the towpath, with the Motor Neurone Disease Association in Northern Ireland chosen as that year's beneficiary. That event page documents the club's local contribution, not an open registration offer today. The general club email listed by Athletics Northern Ireland is the appropriate route for present-day joining enquiries."
    ],
    sources: [
      { title: "Athletics Northern Ireland affiliation and enquiry contact", url: "https://athleticsni.org/About/Find-A-Club" },
      { title: "Club-authored description and meeting arrangements", url: "https://www.strava.com/clubs/dub-runners-of-belfast-78294" },
      { title: "Club's 2024 Giant's Trail Race and charity", url: "https://register.enthuse.com/ps/event/GiantsTrailRace2024" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The club describes Upper Malone weekday training and a separate Belfast Boat Club Sunday start. The public schedule is undated; confirm current arrangements before attending."
  },
  "castlebar-tri-club": {
    summary: "Castlebar Tri Club is a County Mayo triathlon club with documented involvement in beginner participation and regional swim, bike and run community activity.",
    biography: [
      "Castlebar Tri Club is part of the triathlon community in Castlebar, County Mayo, Ireland. Its involvement in regional participation projects shows how local clubs can introduce swimming, cycling and running together, with support extending beyond established racers.",
      "In 2019, Castlebar joined four other Mayo clubs, Triathlon Ireland and Mayo Sports Partnership in a New to Tri programme for women. After eight weeks of preparation, seventy-nine participants completed a first triathlon at Lough Lannagh in Castlebar. The pool swim, cycle and lakeside run were the conclusion of that joint programme, not evidence that the same course or timetable is offered every year.",
      "A later Triathlon Ireland announcement named Castlebar member and accredited coach Brendan Fergus as the leader of its Mayo Social Hub beginning in May 2025. That initiative brought people interested in triathlon together for supported activity. Both projects are dated examples of participation and coaching. Prospective members should confirm the club's current training, joining arrangements and venues; neither historical event location is presented here as a permanent clubhouse."
    ],
    notable_members: [{ name: "Brendan Fergus", connection: "Club member and coach identified in 2025", detail: "Triathlon Ireland named the Castlebar member and accredited coach as leader of its May 2025 Mayo Social Hub." }],
    sources: [
      { title: "2019 joint Mayo beginner programme", url: "https://www.triathlonireland.com/news/2019/race-report-mayo-tri-clubs-joint-new-to-tri-programme/" },
      { title: "2025 Mayo Social Hub and club coach", url: "https://www.triathlonireland.com/news/mayo-social-hub/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Lough Lannagh is documented as the 2019 beginner event venue, not a confirmed permanent training base. Current session venues remain to be established."
  }
};
