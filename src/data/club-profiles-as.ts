import type { ClubProfile } from "./club-profiles";

// Official club and governing-body pages opened 15 October 2026.
export const regionalRoutesAndParticipationProfiles: Record<string, ClubProfile> = {
  "knutsford-tri-club": {
    summary: "Knutsford Tri Club supports swimming, cycling and running across Cheshire, with coached training, adult trial sessions and a separate youth section.",
    biography: [
      "Knutsford Tri Club is a multisport community based around Knutsford, Cheshire, England. Swimming, cycling and running bring beginners and experienced triathletes together, with coached sessions complemented by informal outings and social activity. Adult membership and the coached fifteen-to-seventeen youth section have distinct arrangements.",
      "The club describes pool swimming in Knutsford and Wilmslow, outdoor swimming opportunities, social cycling and running with Knutsford Runners. Shared challenges have included Wales in a Day and coast-to-coast cycling. These illustrate the club's activity beyond individual race preparation; they are not promises of current scheduled trips.",
      "Prospective members can try up to three swim, bike or run sessions in total. Registration through Joinin is required even for a trial, using the trial booking option and providing the information requested by the club. The membership officer can explain the appropriate sessions, youth arrangements and any separate training charges."
    ],
    sources: [{ title: "Club programme and youth section", url: "https://www.knutsfordtriclub.co.uk/" }, { title: "Trial booking and membership", url: "https://knutsfordtriclub.co.uk/join-ktc/" }],
    reviewed_at: "2026-10-15",
    location_note: "Training spans several pools and outdoor venues; Knutsford Leisure Centre is not the start of every session.",
    corrections: { website: "https://www.knutsfordtriclub.co.uk/", address_kind: "training" }
  },
  "kingston-upon-hull-ac": {
    summary: "Kingston upon Hull Athletic Club develops track and field, road running and cross-country from Costello Stadium, with a junior academy and senior coaching.",
    biography: [
      "Kingston upon Hull Athletic Club is based at Costello Stadium in Hull, East Yorkshire, England. The club welcomes athletes from eight years old and supports track and field, cross-country and road running. A junior academy provides an introduction for younger athletes, alongside adult and senior training.",
      "Costello's facilities include an outdoor athletics track with jumping and throwing areas, a six-lane indoor sprint straight and an indoor throwing cage. A clubhouse sits near the track. Coaches and volunteers support athletes through training and competition, including youth league teams.",
      "Families and adults interested in joining are directed to the club's membership request form. Other enquiries can use the separate contact form. Because coaching groups train at different times across the week, prospective members should arrange the appropriate session rather than turn up for an assumed open practice."
    ],
    sources: [{ title: "Club introduction and facilities", url: "https://kingstonuponhullac.co.uk/club-introduction" }, { title: "Junior academy and minimum age", url: "https://www.kingstonuponhullac.co.uk/" }, { title: "Membership and other enquiries", url: "https://kingstonuponhullac.co.uk/contact-us" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://kingstonuponhullac.co.uk/", address_kind: "training" }
  },
  "lancaster-and-morecambe-ac": {
    summary: "Lancaster and Morecambe Athletic Club was formed in 1965 and offers track and field, road, cross-country and fell running from Salt Ayre.",
    biography: [
      "Lancaster and Morecambe Athletic Club was formed in 1965 through the amalgamation of smaller local clubs, some with roots reaching back to 1904 or earlier. Serving Lancaster and Morecambe in Lancashire, England, it covers track and field, road running, cross-country and fell running for younger athletes through to masters.",
      "The club is based at Salt Ayre Sports Complex, between the two towns, with a purpose-built clubhouse and a floodlit eight-lane track. Tuesday and Thursday training brings together track groups and runners heading onto local roads. The club also has a tradition of organising road races, including the Three Bridges 10K.",
      "Senior and junior applicants use separate forms. The club's introduction warns of a junior waiting list, so families should enquire before attending. Current membership information also provides for a limited number of paid guest sessions, with booking required. Check the relevant group and membership arrangements rather than relying on older general invitations to turn up."
    ],
    founded_year: 1965,
    sources: [{ title: "Origins, facilities and junior waiting list", url: "https://lancasterathletics.co.uk/information/about-our-club" }, { title: "Current joining and guest-session arrangements", url: "https://lancasterathletics.co.uk/information/join-our-club" }, { title: "Club location and role contacts", url: "https://lancasterathletics.co.uk/contact-us" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://lancasterathletics.co.uk/", address: "Salt Ayre Sports Centre, Doris Henderson Way, Lancaster", postcode: "LA1 5JS", address_kind: "training" }
  },
  "lawley-running-club": {
    summary: "Lawley Running Club developed in Telford in 2013, with beginner courses, regular group running and a history of volunteering and local charity events.",
    biography: [
      "Lawley Running Club is based in Lawley, Telford, Shropshire, England. A committee formed in September 2013, with England Athletics affiliation following that November. The club history records Andy Crozier and Gaynor Williams undertaking run-leader training as part of establishing the group.",
      "Couch to 5K became an important part of the club's early development, attracting a much larger first intake than its organisers expected. The history also records a first Telford parkrun volunteer takeover in March 2014 and subsequent support for local parkrun activity. The Lawley 5K and Beckbury Trail are among its community race projects.",
      "The current homepage advertises training on Mondays, Wednesdays and Fridays. Prospective members are encouraged to try the club before joining through its online membership form. Beginner-course availability and the correct group should be checked with the club; historical participation totals are not presented as today's membership figures."
    ],
    founded_year: 2013,
    notable_members: [{ name: "Andy Crozier", connection: "Early club run leader", detail: "The club history records Crozier undertaking run-leader training during its 2013 establishment." }, { name: "Gaynor Williams", connection: "Early club run leader", detail: "The official history identifies Williams alongside Crozier in the initial run-leader training arrangements." }],
    sources: [{ title: "Club origins and community activity", url: "https://lawleyrunningclub.co.uk/about-us/" }, { title: "Trial participation and joining", url: "https://lawleyrunningclub.co.uk/join-our-club/" }, { title: "Current training days", url: "https://www.lawleyrunningclub.co.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://lawleyrunningclub.co.uk/" }
  },
  "launceston-road-runners": {
    summary: "Launceston Road Runners has supported social road and trail running in Cornwall since 1989, with paced groups, starter courses and the Treggy 7.",
    biography: [
      "Launceston Road Runners was founded in 1989 in Launceston, Cornwall, England. It describes itself primarily as a social running club, while members enter road and trail events from five kilometres to ultra distance. The Cornish Grand Prix series and the club's Treggy 7 are part of its running community.",
      "Tuesday social runs and Thursday structured sessions meet at Firebrand, Unit 2, Southgate Technology Park on Pennygillam Industrial Estate. Several groups offer different distances and speeds. The club requires high-visibility and reflective clothing for road sessions, with headtorches in winter or dull conditions.",
      "New runners can try a couple of sessions before joining. Separate eight-week zero-to-five-kilometre starter groups run periodically, so complete beginners should ask about the next course. The current membership form, committee contact page and club announcements provide joining details and any changes to training."
    ],
    founded_year: 1989,
    sources: [{ title: "Club history and approach", url: "https://launcestonroadrunners.co.uk/about-us/" }, { title: "Current meeting place and safety requirements", url: "https://www.launcestonroadrunners.co.uk/" }, { title: "Joining and beginner courses", url: "https://launcestonroadrunners.co.uk/join-lrr/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://launcestonroadrunners.co.uk/", address_kind: "training" }
  },
  "kidlington-running-club": {
    summary: "Kidlington Running Club grew from a 1983 road-running group into a Stratfield Brake-based community with seasonal road, canal and trail sessions.",
    biography: [
      "Kidlington Running Club was founded in 1983 as Kidlington Running and Athletic Club in Kidlington, Oxfordshire, England. Early meetings took place at Exeter Hall and then Gosford Hill Sports Centre. In the late 1990s the club helped establish Stratfield Brake Recreation Ground alongside local rugby and cricket clubs.",
      "The club's history links the site's woodland paths and a canal footbridge added in 2006 with opportunities to explore the surrounding countryside. Today it combines group running, structured training, club championships and winter cross-country. Its Mota-vation road-race series is another feature of the local running calendar.",
      "Regular sessions take place on Mondays, Tuesdays and Thursdays, generally from Stratfield Brake, with weekly notices confirming plans. Runners must be at least sixteen; under-eighteens need parental consent. Newcomers can try sessions before joining and should ask which group fits their current continuous-running ability, as the website gives differing twenty- and thirty-minute guides."
    ],
    founded_year: 1983,
    sources: [{ title: "Club history and Stratfield Brake", url: "https://kidlingtonrunning.org.uk/about/history/" }, { title: "Current club introduction and eligibility", url: "https://www.kidlingtonrunning.org.uk" }, { title: "Training and consent arrangements", url: "https://kidlingtonrunning.org.uk/club-activities/training/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://kidlingtonrunning.org.uk/", city: "Kidlington", address_kind: "training" }
  },
  "knutsford-runners": {
    summary: "Knutsford Runners is an adult running community in Cheshire, offering continuous runs, interval sessions and a separate Couch to 5K programme.",
    biography: [
      "Knutsford Runners brings adults together in Knutsford, Cheshire, England, for regular training and social running. The club welcomes people aged eighteen and over, with qualified run leaders and a volunteer committee supporting members' different goals, from building confidence to preparing for longer races.",
      "Monday continuous runs offer several distances, while Wednesday sessions focus on intervals at changing locations around Knutsford. A Couch to 5K programme provides a distinct route for complete beginners. The regular-session joining guidance assumes runners can manage five kilometres, so newcomers should discuss the best starting point with the club.",
      "Email the enquiry address to arrange free introductory runs, after which the membership secretary provides registration through Teamo. A partnership gives Knutsford Tri Club members access to Monday running, but they must still register and book; it does not make the two clubs a single organisation."
    ],
    sources: [{ title: "Programme and enquiries", url: "https://knutsfordrunners.co.uk/" }, { title: "Adult participation and club organisation", url: "https://knutsfordrunners.co.uk/aboutUs" }, { title: "Trials and tri-club partnership", url: "https://knutsfordrunners.co.uk/joinUs" }],
    reviewed_at: "2026-10-15",
    location_note: "Session locations vary and are published in the club calendar.",
    corrections: { adult_only: true }
  },
  "langport-runners": {
    summary: "Langport Runners has offered social road and off-road running in Somerset since summer 1998, with a weekly club night and routes for different paces.",
    biography: [
      "Langport Runners formed in summer 1998 in Langport, Somerset, England. Road and off-road running are both part of the club, which describes itself as a social group for people who enjoy running as well as those who want to compete.",
      "Wednesday is the main club night at Langport Sports and Social Club. Longer and shorter routes allow members to choose a suitable outing, with time to meet afterwards. A monthly out-and-back session asks runners to turn after the same elapsed time, making it possible for different paces to finish together.",
      "The first Wednesday of each month uses a different location, so visitors should confirm the meeting point rather than rely on the usual base. The advertised club-night session is free, but regular attendees are expected to become members. Club championships, race reports and the Portcullis Trail 10K pages provide further ways to follow the club's activity."
    ],
    founded_year: 1998,
    sources: [{ title: "Origins and disciplines", url: "https://www.langportrunners.co.uk/index.php/home/about" }, { title: "Club nights and changing starts", url: "https://www.langportrunners.co.uk/index.php/home/meeting-times" }, { title: "Club activities and membership navigation", url: "http://www.langportrunners.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "The sports and social club is the regular Wednesday base; the first Wednesday uses an announced alternative.",
    corrections: { website: "https://www.langportrunners.co.uk/", address: "Langport Sports and Social Club, Langport", postcode: "", address_kind: "training" }
  },
  "lancing-eagles-rc": {
    summary: "Lancing Eagles Running Club was founded in 1986 and offers adult road and trail running, social outings and West Sussex Fun Run League participation.",
    biography: [
      "Lancing Eagles Running Club has been part of Lancing, West Sussex, England, since 1986. It welcomes adults aged eighteen and over, from newer runners to experienced competitors. Regular groups explore roads in winter and trail routes in summer, with distances and paces chosen to suit those taking part.",
      "Wednesday club nights usually meet inside Lancing Manor Leisure Centre before runners divide into groups. Sunday outings offer a more informal social or longer run, with arrangements announced through the club's channels. Members also take part in parkrun, charity events and the West Sussex Fun Run League.",
      "Community fundraising marked the club's fortieth anniversary: its website reports a forty-hour treadmill challenge supporting Ferring Country Centre. Prospective runners can use the contact form to ask about a Wednesday session or membership. Check the current calendar and meeting notice before visiting, since individual runs can start elsewhere."
    ],
    founded_year: 1986,
    sources: [{ title: "Club introduction and anniversary fundraising", url: "https://www.lancingeagles.co.uk/" }, { title: "Age policy, running groups and membership", url: "https://www.lancingeagles.co.uk/aboutus.html" }, { title: "Public enquiry form", url: "https://www.lancingeagles.co.uk/contactus.html" }],
    reviewed_at: "2026-10-15",
    corrections: { adult_only: true, postcode: "BN15 0PH", address: "Lancing Manor Leisure Centre, Lancing", address_kind: "training" }
  },
  "larkfield-athletics-club": {
    summary: "Larkfield Athletic Club combines adult running in Kent with cross-country, cycling, swimming and triathlon activity, including a supported beginner pathway.",
    biography: [
      "Larkfield Athletic Club formed in 2001 in Larkfield, Kent, England. It is an over-eighteens club with road and off-road running at its core, while members also take part in duathlons and triathlons. Club cycling and swimming add opportunities for people moving into multisport.",
      "Tuesday club runs meet at Larkfield Leisure Centre, and Wednesday track sessions use Sutton Valence School. Thursday and weekend activities have changing local starts. The club also describes summer duathlons, cross-country participation and social events as part of its programme.",
      "Email the membership enquiry address to arrange a first visit. Outside its periodic zero-to-five-kilometre courses, the club recommends being able to run a continuous five kilometres before joining road or track sessions. Thursday sessions offer another way to build fitness, with the appropriate group and availability best confirmed in advance."
    ],
    founded_year: 2001,
    sources: [{ title: "Club origins, joining and training venues", url: "https://www.larkfieldac.co.uk" }],
    reviewed_at: "2026-10-15",
    location_note: "The leisure centre is the Tuesday start; track sessions use Sutton Valence School and other sessions vary.",
    corrections: { adult_only: true, address_kind: "training" }
  },
  "ledbury-and-district-harriers": {
    summary: "Ledbury and District Harriers grew from a 2001 local race into a Herefordshire running club, with countryside routes and the Magnificent Eastnor Castle Seven.",
    biography: [
      "Ledbury and District Harriers began after the September 2001 Ledbury Chase in Ledbury, Herefordshire, England. Terry Folly raised the idea of a club with runner Bruce Butler, and a meeting at Ledbury Rugby Club brought local runners together. The name was chosen to include surrounding villages as well as the town.",
      "The club later took on the Ledbury Chase and launched the Magnificent Eastnor Castle Seven in 2005 as part of a local Rotary anniversary project. Its present programme includes Tuesday group runs and Thursday effort, speed or hill sessions. Routes move from town streets in darker months to nearby lanes, fields, the Eastnor Estate and Malvern Hills in spring and summer.",
      "The 2026–27 membership page welcomes runners over sixteen and allows children from twelve to run with a parent or responsible adult. It also explicitly says the club is no longer England Athletics affiliated. Prospective members should use the current form or contact page for arrangements; historic affiliation must not be assumed from an older listing."
    ],
    founded_year: 2001,
    notable_members: [{ name: "Bruce Butler", connection: "Founding participant and club historian", detail: "Butler's official club history recalls the first meeting following the 2001 Ledbury Chase and the development of the club's races." }],
    sources: [{ title: "First-hand club history", url: "https://ledburyharriers.org.uk/our-club/history-of-ledbury-harriers-2001-2012/" }, { title: "Current running programme", url: "http://www.ledburyharriers.org.uk/" }, { title: "2026–27 membership and affiliation statement", url: "https://ledburyharriers.org.uk/our-club/membership/" }],
    reviewed_at: "2026-10-15",
    contact_note: "The club's 2026–27 membership page states that it is no longer England Athletics affiliated; its own current joining information should be used.",
    corrections: { website: "https://ledburyharriers.org.uk/", address: "Ledbury Rugby Club, Ledbury", postcode: "", address_kind: "training" }
  },
  "kesgrave-kruisers": {
    summary: "Kesgrave Kruisers combines group running in Suffolk with beginner courses, track sessions and the charity-supporting Alan Brown 10K.",
    biography: [
      "Kesgrave Kruisers began in early 2017 when Em Mortimer and Andrew Rooke brought runners together at Millennium Fields in Kesgrave, Suffolk, England. The group subsequently moved regular sessions to Kesgrave War Memorial Community Centre. A formal committee and constitution followed in December 2019, with England Athletics affiliation in 2022.",
      "The club developed Couch to 5K and longer-distance improver courses alongside its Tuesday and Thursday training. Monthly track sessions and social runs add variety, while the session calendar identifies the start for each outing. Juniors can be included within an adult membership; families should check the relevant junior arrangements before attending.",
      "In 2023 the Kruisers launched the Alan Brown 10K in memory of a club member. Volunteer effort has helped the event support local charities, and the race hosted Suffolk's county 10K championship in 2025. Newcomers can try up to three sessions before joining through the club website."
    ],
    founded_year: 2017,
    notable_members: [
      { name: "Em Mortimer", connection: "Co-founder", detail: "The club history names Mortimer as one of the two founders in early 2017." },
      { name: "Andrew Rooke", connection: "Co-founder", detail: "The club history names Rooke as one of the two founders in early 2017." }
    ],
    sources: [{ title: "Club origins and community races", url: "https://kesgravekruisers.uk/history/" }, { title: "Membership and trial sessions", url: "https://kesgravekruisers.uk/membership/" }, { title: "Current session calendar", url: "https://kesgravekruisers.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "The community centre is a regular training base; the calendar also lists other meeting points.",
    corrections: { address_kind: "training" }
  },
  "keswick-ac": {
    summary: "Keswick Athletic Club brings together fell, trail, road and cross-country runners in the Lake District, with a history stretching back to 1974.",
    biography: [
      "Keswick Athletic Club grew from a small training group in Keswick, Cumbria, England, making its first race appearance at the Musbury Tor Relay in 1974. David Ellison helped organise the early club, and its history records Kenny Stuart and Billy Bland running in Keswick colours. Those are historical associations: Bland later joined Borrowdale.",
      "Fell running remains central, alongside road, trail and cross-country. Competitive teams share the club with runners who chiefly value company and time outdoors. Tuesday sessions run throughout the year, while winter activity includes strength and conditioning and additional training. Skills sessions have covered navigation, descending and scree.",
      "The leisure centre is a usual meeting point, not the start of every run. Members use Stack for session details, and visitors or prospective members can request temporary access. A women's social group explores local roads, trails and fells. Contact the club before trying a session so the route and group suit your experience."
    ],
    founded_year: 1974,
    notable_members: [
      { name: "David Ellison", connection: "Early organiser and member", detail: "The club's history credits Ellison with organising its early runners and helping revive the Latrigg Race." },
      { name: "Kenny Stuart", connection: "Historical fell-running member", detail: "The official history records Stuart representing Keswick in fell running." },
      { name: "Billy Bland", connection: "Historical fell-running member", detail: "The history records Bland running for Keswick before joining Borrowdale." }
    ],
    sources: [{ title: "Club history and joining", url: "https://www.keswickac.org.uk/" }, { title: "Training and visitor arrangements", url: "https://www.keswickac.org.uk/training" }],
    reviewed_at: "2026-10-15",
    location_note: "Training starts vary; check the current session notice rather than assuming every run leaves the leisure centre.",
    corrections: { website: "https://www.keswickac.org.uk/", address_kind: "training" }
  },
  "kidderminster-and-stourport": {
    summary: "Kidderminster and Stourport Athletic Club uses the Alan Moreton Track in Stourport-on-Severn for track and field, with junior and adult participation.",
    biography: [
      "Kidderminster and Stourport Athletic Club is based at the Alan Moreton Track on Kingsway in Stourport-on-Severn, Worcestershire, England. The Heart of England Athletics League traces the present club to the 2001 combination of Stourport Athletic Club and Kidderminster Running Club; Stourport's earlier club dated from 1973.",
      "The eight-lane, all-weather track supports running and field-event training. The club's facilities account records a clubhouse rebuilt in 2009 following a fire in 2007. Coaching serves junior and adult athletes, with opportunities for families and people new to athletics as well as experienced competitors.",
      "Published club pages list Tuesday, Thursday and Sunday training, but their precise times differ. Prospective members should confirm the appropriate group and session before visiting. The club also welcomes volunteer help with coaching, officiating and administration. Its track is shared, and club membership does not mean unrestricted access outside designated sessions."
    ],
    founded_year: 2001,
    sources: [{ title: "League account of the 2001 merger", url: "https://hofe-league.org.uk/ksac/" }, { title: "Club facilities and track access", url: "https://www.pitchero.com/clubs/kidderminsterstourportac/a/facilities-5974.html" }, { title: "Club registration overview", url: "https://dashboard.race-nation.co.uk/register/kidderminster-stourport-ac" }],
    reviewed_at: "2026-10-15",
    contact_note: "Published training times differ between club pages; confirm before attending. The secretary telephone is separate from the sports-club reception.",
    corrections: { website: "https://www.pitchero.com/clubs/kidderminsterstourportac/", city: "Stourport-on-Severn", address: "The Alan Moreton Track, Kingsway, Stourport-on-Severn", postcode: "DY13 8BQ", address_kind: "training" }
  },
  "kingston-ac-and-poly-harriers": {
    summary: "Kingston AC and Polytechnic Harriers is a volunteer-run Kingston athletics club offering track and field, road running and cross-country from childhood to masters competition.",
    biography: [
      "Kingston AC and Polytechnic Harriers brings together track and field, road-running and cross-country athletes in Kingston upon Thames, England. The volunteer-run club welcomes participants from eight years old through to masters, without performance standards for joining. Recreational involvement sits alongside team and individual competition.",
      "Its club championships and awards recognise performances across the season; some trophies date back to 1906. The club also uses electronic timing and field-event measurement equipment, with a Duke of Edinburgh programme introducing local young people to this side of athletics. Parents, supporters and officials contribute to the club alongside athletes and coaches.",
      "Prospective members can use the membership enquiry form to ask about age groups, coaching and the appropriate subscription. Household, junior and second-claim arrangements are described separately. General facility-use requests belong with the track operator, while membership and coaching enquiries should go to the club itself."
    ],
    sources: [{ title: "Club disciplines, age groups and activities", url: "https://kingstonandpoly.org/page/Club%20Information.html" }, { title: "Membership and enquiries", url: "https://kingstonandpoly.org/page/Membership.html" }, { title: "Public role contacts", url: "https://kingstonandpoly.org/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://kingstonandpoly.org/" }
  },
  "kirkby-milers-ac": {
    summary: "Kirkby Milers Athletics Club developed from a local running group in 2015 and now offers junior athletics, adult track sessions and social running in Knowsley.",
    biography: [
      "Kirkby Milers Athletics Club was founded in 2015 and is based in Kirkby, Knowsley, England. Its activity spans road running, track and field and cross-country, with social outings providing another way to take part. The club describes an inclusive approach to different abilities and disabilities rather than a requirement to race at a particular standard.",
      "Kirkby High School on Bracknell Avenue is the track base. Adult Wednesday sessions separate faster, intermediate and beginner or steady runners; the club describes wheelchair access and accessible toilets. Thursday social outings start elsewhere and include a walking group. Adult sessions are for those aged sixteen and over.",
      "Junior coaching for ages nine to sixteen follows the multi-event Athletics 365 approach, developing movement skills before more specialised competition. Families must contact the club before attending. Non-members can join the advertised adult track and social sessions, while some track-and-field sessions are members-only; check the relevant listing rather than assuming every session is open."
    ],
    founded_year: 2015,
    sources: [{ title: "Official membership account and origins", url: "https://membermojo.co.uk/kirkbymilers" }, { title: "Adult training and access", url: "https://www.kirkbymilers.co.uk/training.html" }, { title: "Junior coaching and prior contact", url: "https://www.kirkbymilers.co.uk/junior-training.html" }, { title: "Club enquiries", url: "https://www.kirkbymilers.co.uk/committee--contacts.html" }],
    reviewed_at: "2026-10-15",
    location_note: "Kirkby High School is the track venue; social runs use other starts, including Cherryfield Drive.",
    corrections: { address: "Kirkby High School, Bracknell Avenue, Kirkby", postcode: "L32 9PP", address_kind: "training" }
  },
  "knaresborough-striders": {
    summary: "Knaresborough Striders is a North Yorkshire running club founded in 2012, with paced groups, structured sessions and a Zero to Hero route into running.",
    biography: [
      "Knaresborough Striders formed at the beginning of 2012 in Knaresborough, North Yorkshire, England. Members take part in everything from parkrun to marathons and ultras, while others prefer regular company and gradual improvement to racing. Its Zero to Hero courses have helped newcomers move into the wider club.",
      "Tuesday and Thursday meetings use Knaresborough Cricket Club on Aspin Lane. The programme ranges from jogging groups to faster continuous runs, with Tuesday structured sessions using hills, intervals and endurance work. Occasional walking groups and course-linked beginner groups are not necessarily available at every meeting.",
      "Prospective members are invited to try the club for a few weeks before joining. The training page explains expected paces and distances so runners can choose sensibly. Social groups are led by members with in-house training; the club explicitly notes that these leaders do not necessarily hold an England Athletics run-leader qualification."
    ],
    founded_year: 2012,
    sources: [{ title: "Origins and trial participation", url: "https://knaresborough-striders.co.uk/about-us" }, { title: "Group structure and leader qualifications", url: "https://knaresborough-striders.co.uk/training-groups" }],
    reviewed_at: "2026-10-15",
    contact_note: "The site displays a Gmail enquiry address but its header email link targets a different address; use the contact page if uncertain.",
    corrections: { address_kind: "training" }
  },
  "kirkstall-harriers": {
    summary: "Kirkstall Harriers grew from Leeds Postal Harriers in 1985 and combines road, cross-country and fell running with a strong social club tradition.",
    biography: [
      "Kirkstall Harriers is a running club in Leeds, West Yorkshire, England, with road, cross-country and fell activity. Its history identifies an earlier name, Leeds Postal Harriers, and records the club's formation in January 1985. The social side is part of its stated purpose as well as training and competition.",
      "Regular Monday and Wednesday sessions leave Kirkstall Leisure Centre, with changes announced in the training schedule. New runners can attend a couple of trial sessions before deciding whether to join. Checking the current route and meeting arrangements is particularly useful for first-time visitors.",
      "Club championships and the Kirkstall Abbey 7 provide shared targets, while the website carries race reports and newsletters. The committee publishes a general enquiry email for questions about membership or finding a suitable session. Historical affiliation wording on an older information page is not treated as evidence of a present-day governing-body name."
    ],
    founded_year: 1985,
    sources: [{ title: "Club origins", url: "https://kirkstallharriers.org.uk/new/club/club-history/" }, { title: "Disciplines and trial training", url: "https://kirkstallharriers.org.uk/new/club/about-us/" }, { title: "Current committee enquiry address", url: "https://kirkstallharriers.org.uk/new/club/contacts/" }, { title: "Club events and reports", url: "http://kirkstallharriers.org.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Leeds", address: "Kirkstall Leisure Centre, Leeds", postcode: "", address_kind: "training" }
  },
  "knowle-and-dorridge-rc": {
    summary: "Knowle and Dorridge Running Club offers structured road-running sessions and racing near Solihull, with distinct meeting points and a published entry-ability guide.",
    biography: [
      "Knowle and Dorridge Running Club serves runners around Knowle and Dorridge in the Solihull area of England. Members take part in road races, cross-country and track events, supported by regular organised training and a calendar of club activity.",
      "Monday training includes intervals and hill work, while Wednesday sessions focus on tempo running. The published starts differ: Sainsbury's car park on Monday and Dorridge Village Hall car park on Wednesday. The calendar should be checked for the latest session details.",
      "These organised sessions are for current members, with a stated guide that runners should be able to complete five kilometres within thirty-five minutes. Prospective members should contact the membership secretary to discuss joining and suitability. The membership page still quotes a 2024–25 fee, so that old price is not presented as a current subscription."
    ],
    sources: [{ title: "Club running and racing", url: "https://knowleanddorridgerc.co.uk/" }, { title: "Training locations and entry ability", url: "https://knowleanddorridgerc.co.uk/training/" }, { title: "Membership enquiry route", url: "https://knowleanddorridgerc.co.uk/membership/" }],
    reviewed_at: "2026-10-15",
    location_note: "Dorridge Village Hall is the published Wednesday start, not the meeting point for every club session.",
    corrections: { address_kind: "training" }
  },
  "knowsley-harriers": {
    summary: "Knowsley Harriers supports junior and adult running around Halewood and Kirkby, with coaching, social participation and introductory trial sessions.",
    biography: [
      "Knowsley Harriers Athletics Club is based in the borough of Knowsley, Merseyside, England. It welcomes children and adults across a range of abilities, combining coaching with opportunities to run for fitness and take part in competition. The club describes a partnership with local leisure and cultural services to encourage sport and healthy living.",
      "Training uses more than one location. Its directions page lists Halewood Environment Centre on Okell Drive and the Kirkby Sports College site on Bracknell Avenue. The programme includes adult and junior groups, a Couch to 5K route and club championships across road and off-road running.",
      "Newcomers are offered two free trial sessions before deciding whether to join. General enquiries and junior-training enquiries have separate club email addresses. Contact the relevant team first to confirm the right group, meeting point and arrangements rather than treating a directory correspondence address as a training venue."
    ],
    sources: [{ title: "Club activities and trial sessions", url: "https://www.knowsley-harriers.com/" }, { title: "Training locations", url: "https://www.knowsley-harriers.com/contact-us/how-to-find-us/" }, { title: "General and junior enquiries", url: "https://www.knowsley-harriers.com/contact-us" }],
    reviewed_at: "2026-10-15",
    location_note: "Halewood Environment Centre and the Kirkby track site are separate training locations; confirm the session before travelling.",
    corrections: { website: "https://www.knowsley-harriers.com/", city: "Halewood", address: "Halewood Environment Centre, Okell Drive, Halewood", postcode: "L26 7XB", address_kind: "training" }
  }
};
