import type { ClubProfile } from "./club-profiles";

// Club, governing-body and primary community sources opened on 15 October 2026.
export const regionalRunningAndMultisportProfiles: Record<string, ClubProfile> = {
  "hadleigh-hares-ac": {
    summary: "Hadleigh Hares AC offers adult and junior running in Hadleigh, Suffolk, with beginner sessions, monthly track training and winter cross-country.",
    biography: [
      "Hadleigh Hares Athletics Club has been part of running in Hadleigh, Suffolk, England, since 1984. It welcomes adults and juniors aged eight to sixteen, combining local training with club races and Suffolk winter cross-country. Its programme makes room for people taking their first steps as well as runners working towards a particular distance or performance goal.",
      "Senior sessions distinguish beginner and novice running on Tuesdays from improver groups on Mondays and Thursdays. A monthly Wednesday visit to Northgate Athletics Track adds another setting, alongside strength-and-conditioning sessions and social runs. Members use the club app to see the current programme and indicate which sessions they will attend.",
      "Adults can arrange a one-month trial before joining; junior applications follow a separate route and include session charges. The club's memorial to Mike Rosbrook recalls a member who joined in 2004 and helped coach a women's group on Tuesday evenings. His contribution is remembered as part of the club's history, not as a current coaching appointment. Newcomers should use the enquiry form to confirm the right group and meeting point."
    ],
    founded_year: 1984,
    notable_members: [{ name: "Mike Rosbrook", connection: "Late member and volunteer coach", detail: "The club's memorial records that he joined in 2004 and regularly helped coach a women's Tuesday group." }],
    sources: [
      { title: "Club origins and age groups", url: "https://www.hadleigh-hares.co.uk/" },
      { title: "Senior programme", url: "https://www.hadleigh-hares.co.uk/seniors" },
      { title: "Trial and junior membership", url: "https://www.hadleigh-hares.co.uk/membership" },
      { title: "Remembering Mike Rosbrook", url: "https://www.hadleigh-hares.co.uk/mike-rus" },
      { title: "Club enquiry form", url: "https://www.hadleigh-hares.co.uk/copy-of-contact" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Session locations are confirmed through the club app; monthly track training is at Northgate. The old Castle Lane directory address has not been established as a training venue.",
    corrections: { address: "", postcode: "", location_precision: "unverified" }
  },
  "hailsham-harriers": {
    summary: "Hailsham Harriers is an East Sussex running club with junior and senior groups, road and cross-country racing, and track training in Eastbourne.",
    biography: [
      "Hailsham Harriers was formed in Hailsham, East Sussex, England, in 1984 through the merger of Lansdowne Striders and the existing Hailsham AC. The Striders had begun as social workers preparing for a local fun run. A public meeting brought the groups together, and the club remembers Derek Wells as a central figure in establishing its welcoming character.",
      "The shared Hailsham Cricket Pavilion is the main base for Tuesday junior and senior sessions. Track evenings take place at Eastbourne Sports Park, while selected summer Thursdays use Abbots Wood from a separate meeting point. The club competes in Sussex road, cross-country and masters track-and-field events, and contributes to the local calendar through the Hellingly 10K and other community activities.",
      "Prospective members can try training and contact the membership secretary before applying online. Junior winter sessions have an over-eight age restriction because they use surrounding streets; lights and high-visibility clothing are required. Check the published session details before travelling, since the pavilion, Eastbourne track and summer trail start are not interchangeable venues."
    ],
    founded_year: 1984,
    notable_members: [{ name: "Derek Wells", connection: "Founding organiser", detail: "The club's history remembers Wells as its founding father and credits him with helping shape the club and its values." }],
    sources: [
      { title: "1984 merger and Derek Wells", url: "https://hailsham-harriers.org.uk/club-history/" },
      { title: "Membership and racing", url: "https://hailsham-harriers.org.uk/join/" },
      { title: "Training venues and junior winter restriction", url: "https://hailsham-harriers.org.uk/how-to-find-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Hailsham Cricket Pavilion is the shared headquarters and Tuesday base. Eastbourne track and summer Abbots Wood sessions have separate meeting points.",
    corrections: { website: "https://hailsham-harriers.org.uk/", address_kind: "training" }
  },
  "halmer-harriers": {
    summary: "Halmer Harriers is a community running club in Spalding, Lincolnshire, with mixed-ability evening runs and a record of local charity fundraising.",
    biography: [
      "Halmer Harriers brings runners together in Spalding, Lincolnshire, England. Its club-submitted description on the NHS-backed H.A.Y. Lincolnshire directory emphasises a mixture of ages and abilities, with a practical starting threshold: members should be able to complete five kilometres in forty minutes or less. That is different from a course designed for people who have never run before.",
      "The directory's July 2024 update places Tuesday and Thursday evening meetings at the clubhouse on Sir Halley Stewart Playing Field, rather than the residential address in the older athletics listing. It asks runners to wear lights on dark evenings and directs newcomers to the club's Facebook page or the start of a session. Because the timetable is dated, visitors should confirm it before attending.",
      "The Harriers also have a visible community role. South Holland District Council's 2023 events record describes their festive five-kilometre Reindeer Run, which raised money for the chairman's chosen charities despite the rain. Public club email and Facebook enquiries provide a route to ask about current membership and suitable runs; the unavailable standalone website is not evidence of closure."
    ],
    sources: [
      { title: "Club description, entry threshold and July 2024 venue listing", url: "https://haylincolnshire.co.uk/activities/halmer-harriers-running-club/" },
      { title: "Council record of the 2023 Reindeer Run", url: "https://www.sholland.gov.uk/article/25169/Halmer-Harriers-Reindeer-Run" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "H.A.Y. Lincolnshire's July 2024 club listing gives Sir Halley Stewart Playing Field, Winfrey Avenue, PE11 1DA. Confirm the current meeting arrangement before attending.",
    corrections: { address: "Sir Halley Stewart Playing Field, Winfrey Avenue, Spalding", postcode: "PE11 1DA", address_kind: "training" }
  },
  "hamworthy-harriers": {
    summary: "Hamworthy Harriers is an adult running club based at the Hamworthy Club on Magna Road, combining road racing, parkrun, relays and social runs.",
    biography: [
      "Hamworthy Harriers was established in 1986 and has built its identity around running with an active social side. Based at the Hamworthy Club on Magna Road near Wimborne in Dorset, England, the group welcomes adults of varied abilities. Its own running-section page distinguishes the Harriers from the other sports and venue services offered by the wider complex.",
      "Monday evening runs leave the club at six, with routes starting from around four miles and an opportunity to meet in the bar afterwards. Other evening and Sunday outings are arranged separately. Members take part in road races from short distances through marathons and beyond, parkruns, team relays and, for some, canicross. A club challenge links race and parkrun participation with an end-of-year social presentation.",
      "Membership offers first- and second-claim arrangements and includes England Athletics affiliation. The club explicitly does not cater for under-eighteens. New runners should contact the Harriers' secretary or chairman to discuss the group, current fees and an appropriate first outing. Those running-specific contacts are separate from the complex's reception, room-booking and events staff."
    ],
    founded_year: 1986,
    sources: [{ title: "Harriers history, adult eligibility, sessions and role contacts", url: "https://www.hamworthyclub.co.uk/copy-of-squash" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Wimborne", address: "Hamworthy Club, Magna Road, Wimborne", address_kind: "training", adult_only: true }
  },
  "handsworth-roadhogs": {
    summary: "Handsworth Roadhogs is a Sheffield community running club with road, fell and cross-country activities, beginners' support and local trail races.",
    biography: [
      "Handsworth Roadhogs was formed in 1985 in Sheffield, South Yorkshire, England, gaining Amateur Athletic Association affiliation the following year. The club combines road running with fell and off-road activity: its road grand prix has a companion Wildhogs competition, and members also take part in inter-club cross-country and relay events.",
      "Regular Monday and Wednesday club runs start from Handsworth Grange Sports Centre. Leaders adapt the pace to those attending, using shorter and longer groups where possible, with stops and runbacks to keep the group together. Separate beginner and improver activity helps runners progress towards these outings. The club also stages the Handsworth Hobble and Waverley Dash and has supported other Sheffield races through marshalling.",
      "Visitors can try a run before submitting the membership form. Check the club's current route announcement and use the sports-centre car park entrance on Beaver Hill Road, not the school entrance on Handsworth Grange Road. The published entrance postcode differs from the building's postal address, so the access instructions matter more than following the school address alone."
    ],
    founded_year: 1985,
    sources: [
      { title: "Club history and community events", url: "https://handsworthroadhogs.uk/about-us.html" },
      { title: "Regular runs and correct entrance", url: "https://handsworthroadhogs.uk/club-runs.html" },
      { title: "Beginners, improvers and current activities", url: "https://handsworthroadhogs.uk/" },
      { title: "Enquiry form", url: "https://handsworthroadhogs.uk/contact-us.html" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Enter the sports-centre car park from Beaver Hill Road, S13 9QY. The school postal address uses Handsworth Grange Road, S13 9HJ; the club specifically says not to use that entrance.",
    corrections: { address: "Handsworth Grange Sports Centre, Beaver Hill Road, Sheffield", postcode: "S13 9QY", address_kind: "training" }
  },
  "hartshill-runners": {
    summary: "Hartshill Runners offers leader-supported running in Oakengates, Telford, with mixed-pace groups and periodic Couch to 5K courses.",
    biography: [
      "Hartshill Runners is based at Hartshill Park in Oakengates, Telford, Shropshire, England. The club's England Athletics-hosted pages describe a group for beginners through to experienced runners, with qualified leaders supporting outings rather than a single pace or distance expected of everyone.",
      "Monday and Wednesday evenings are the regular meeting times. The group aims to offer three options, ranging from outings of up to five kilometres to ten kilometres and beyond, with pace varying between groups. This gives newcomers a way to find suitable company while allowing more experienced runners to extend their distance.",
      "People starting from scratch can enquire about the next Couch to 5K course; these are advertised separately rather than offered at every ordinary club session. Use the club's contact form to ask about course availability, the right group and the precise park meeting point."
    ],
    sources: [
      { title: "Club programme and beginner courses", url: "https://groups.runtogether.co.uk/hartshillrunners" },
      { title: "Club contact form and park address", url: "https://clubspark.englandathletics.org/hartshillrunners/Contact" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://clubspark.englandathletics.org/hartshillrunners", address: "Hartshill Park, Oakengates, Telford, Shropshire, TF2 6EU", postcode: "TF2 6EU", address_kind: "training" }
  },
  "harvel-hash-house-harriers": {
    summary: "Harvel Hash House Harriers combines sociable hashing with road and off-road running from Harvel village on Kent's North Downs.",
    biography: [
      "Harvel Hash House Harriers is a local running and hashing club in Harvel, Kent, England. The North Downs setting lends itself to off-road outings, while members also take part in road running across a range of distances. Its connection with the wider hashing tradition does not make it a global club: its regular community is rooted in Harvel village.",
      "Tuesday training starts from Harvel Cricket Club and normally offers a walk or slow jog, an easy-paced run and a longer, quicker option. Distances vary from roughly one to three miles for the shortest group to six or seven for the longer one. The monthly Sunday hash is a separate, sociable outing, typically four to six miles with frequent stops and changing locations.",
      "Newcomers should email before attending so the club can discuss their running experience and confirm the appropriate group and start point. The website also carries the club's Harvel 5 event information. Hashing's international history is described on a separate page, but it does not establish when this particular Harvel club was founded."
    ],
    sources: [
      { title: "Local programme and cricket-club base", url: "https://www.harvelhashhouseharriers.com/" },
      { title: "Pace groups and visitor guidance", url: "https://harvelhashhouseharriers.com/about-us/" },
      { title: "Background to hashing, not Harvel's founding date", url: "https://harvelhashhouseharriers.com/what-is-hashing/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Tuesday runs use Harvel Cricket Club, David Street. Monthly hashes use changing locations and should be confirmed with the club.",
    corrections: { address: "Harvel Cricket Club, David Street, Harvel", postcode: "DA13 0DE", city: "Harvel", address_kind: "training" }
  },
  "harwell-harriers": {
    summary: "Harwell Harriers serves Didcot, Harwell and nearby South Oxfordshire villages with coached running, beginner courses and community activities.",
    biography: [
      "Harwell Harriers began in 2016 as a group seeking to build a running community in Harwell and Didcot, Oxfordshire, England. Its history records the introduction of club championships in 2019, beginner courses in 2021 and an affiliation with Boundary Park in 2022 that gave the club an established home.",
      "Tuesday and Thursday evening sessions use Boundary Park in Great Western Park, with summer running also taking place at Wittenham Clumps. Qualified coaches and run leaders support members whose interests range from parkrun to ultramarathons. Ordinary club sessions ask participants to be able to run four miles within fifty-five minutes; new and returning runners can instead enquire about the dedicated courses.",
      "The club's community activity includes a foodbank run and a donation to Earth Trust, both recorded in its 2023 history. Prospective members can arrange a trial through the contact form before joining online, or ask which beginner course or regular group would best suit their experience."
    ],
    founded_year: 2016,
    sources: [
      { title: "Current sessions and participation threshold", url: "https://harwellharriers.org/" },
      { title: "Origins, courses and community milestones", url: "https://harwellharriers.org/club/club-history" },
      { title: "Membership and general enquiries", url: "https://harwellharriers.org/contact-us" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Boundary Park is the regular base; summer sessions may use Wittenham Clumps. Confirm the selected session's location before travelling.",
    corrections: { address_kind: "training" }
  },
  "harwich-runners": {
    summary: "Harwich Runners offers coached running in Harwich and Dovercourt, with a rugby-club base, junior sessions, local races and multisport links.",
    biography: [
      "Harwich Runners was founded in 1982 by British international decathlete Roy Snow to encourage local people to become more active. Based in Harwich and Dovercourt, Essex, England, the club continues to bring together beginners, returning runners and experienced competitors rather than concentrating on one performance level.",
      "Tuesday club night normally starts at Harwich and Dovercourt Rugby Club on Low Road. A rota of experienced coaches offers different session options, including warm-ups and cool-downs, with routes varying around the two towns. A separate Saturday junior programme provides an entry point for younger runners. The club also has triathlon links and organises local events, supported by a chip-timing system developed from 2011 for its races.",
      "Visitors can try two or three sessions before deciding whether to join. The training page asks runners to arrive before the session for announcements and wear high-visibility clothing when needed. Senior applications use Spond, which also carries current training details. The enquiry form separates membership, racing, triathlon and welfare questions so newcomers can reach the appropriate volunteer."
    ],
    founded_year: 1982,
    notable_members: [{ name: "Roy Snow", connection: "Founder and international decathlete", detail: "The club identifies Snow as the British international decathlete who founded Harwich Runners in 1982." }],
    sources: [
      { title: "Origins, joining and event support", url: "https://www.harwichrunners.co.uk/1_aboutus/aboutus.php" },
      { title: "Tuesday training and rugby-club meeting point", url: "https://www.harwichrunners.co.uk/1_training/training.php" },
      { title: "Club enquiry form", url: "https://www.harwichrunners.co.uk/1_aboutus/contact_us.php" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Training normally meets at Harwich and Dovercourt Rugby Club, Low Road. The previous Wick Lane directory address is not the published club-night start; the exact postcode is left unconfirmed.",
    corrections: { address: "Harwich and Dovercourt Rugby Club, Low Road, Dovercourt", postcode: "", address_kind: "training", location_precision: "unverified" }
  },
  "hatch-warren-runners": {
    summary: "Hatch Warren Runners is a community running club in Basingstoke, offering varied-pace evening runs from Hatch Warren and Beggarwood.",
    biography: [
      "Hatch Warren Runners grew from a Facebook group and held its first club run on 6 March 2013. Its history describes ten people turning up for that first outing, some running or walking three miles and others covering six. The small group developed into a wider running community in Hatch Warren and Beggarwood, Basingstoke, Hampshire, England.",
      "Monday and Wednesday evening runs offer different distances and paces. Most start from either the Portsmouth Arms or the Co-op in Beggarwood, with other arrangements announced through the members' Facebook page. The club's emphasis is on personal progress and mutual encouragement, so the choice of group matters more than matching a single expected pace.",
      "The website provides a downloadable membership application, club rules and an enquiry form. Newcomers should check which start point and route apply to their intended evening before attending; the Portsmouth Arms is one regular meeting place, not the start for every run."
    ],
    founded_year: 2013,
    sources: [
      { title: "First-run date, current starts and application", url: "https://www.hwrunners.co.uk/" },
      { title: "Early community history", url: "https://www.hwrunners.co.uk/about-us/our-history/" },
      { title: "Public enquiry form", url: "https://www.hwrunners.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The Portsmouth Arms and Beggarwood Co-op are alternative regular starts. Confirm the specific run through the club; the listed pub is not a universal meeting point.",
    corrections: { address: "Portsmouth Arms, Hatch Warren Way, Basingstoke", address_kind: "training" }
  },
  "havant-ac": {
    summary: "Havant Athletic Club provides running, jumping and throwing from Waterlooville, with junior-to-masters membership and local road-race organisation.",
    biography: [
      "Havant Athletic Club was founded in 1978 and serves athletes in the Havant and Waterlooville area of Hampshire, England. It accepts members from eight years old through to masters age groups. Track-and-field activity includes running, jumping, throwing and combined events, alongside cross-country, race walking and road running.",
      "The main training base is Oaklands Roman Catholic School on Stakes Hill Road in Waterlooville, with Tuesday and Thursday sessions. Other days and venues depend on coach availability. The club also contributes to participation beyond its own membership through the Hayling 10 road race and the Lakeside 5K evening series.",
      "New members can use the linked application system or ask questions through the club contact form. Membership and training-night charges are separate, and first- and second-claim arrangements are available. The fees page contains an old, incomplete table, so it is better to confirm the current subscription directly than rely on its figures. Beginners and experienced competitors should both arrange the appropriate coaching group before attending."
    ],
    founded_year: 1978,
    sources: [
      { title: "Activities and club events", url: "https://www.havantac.co.uk/" },
      { title: "History, minimum age and Oaklands base", url: "https://havantac.co.uk/about-us/" },
      { title: "Membership categories and separate training charges", url: "https://havantac.co.uk/membership/" },
      { title: "Club enquiry form", url: "https://havantac.co.uk/contact/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Oaklands Roman Catholic School, Stakes Hill Road, Waterlooville", postcode: "PO7 7BW", address_kind: "training" }
  },
  "haverhill-running-club": {
    summary: "Haverhill Running Club offers adult and junior running in Suffolk, with coached sessions, beginner courses, team racing and social club runs.",
    biography: [
      "Haverhill Running Club brings together runners in Haverhill, Suffolk, England, for training in the town and nearby countryside. Its programme combines Tuesday coaching with Thursday club runs, while beginner courses help people build towards five kilometres. Road races, winter cross-country and team relays give members different ways to take part in competition.",
      "The junior and younger-junior sections cover ages eight to seventeen, with separate training arrangements from the adult programme. Seniors join from eighteen. Club time trials, a summer 5K series and social events complement the regular weekly runs, and the club app carries session details and communication. Stephen Reyes is among the people recognised with lifetime membership and is also listed as the beginner-course contact.",
      "Adults can register for up to three free taster sessions before deciding on membership. Junior enquiries go to the junior secretary, while the membership team handles senior applications. The joining page contains inconsistent app-code wording, so use its live application link or ask the club rather than relying on a copied code. Check the app for the selected session's actual meeting point."
    ],
    notable_members: [{ name: "Stephen Reyes", connection: "Lifetime member and beginner-course contact", detail: "Listed on the club's lifetime-members page and as the contact for beginner-course enquiries; this is a club service association, not a claim about current competitive status." }],
    sources: [
      { title: "Adult, junior and community programme", url: "https://haverhillrunningclub.com/" },
      { title: "Senior eligibility and taster sessions", url: "https://haverhillrunningclub.com/membership/" },
      { title: "Lifetime members", url: "https://haverhillrunningclub.com/lifetime-members/" },
      { title: "Role contacts", url: "https://haverhillrunningclub.com/contact/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The leisure centre remains the directory address. Training and junior-session meeting points should be checked in the club programme rather than assumed to use that address every week."
  },
  "haxby-runners": {
    summary: "Haxby Runners is a community club near York, with run-walk groups, structured sessions, road and trail outings and the Haxby 10K.",
    biography: [
      "Haxby Runners began in April 2020 during lockdown as a way for people to remain active and connected. It has since developed into a running community in Haxby, near York in North Yorkshire, England, combining social outings with training and racing. The club also organises the Haxby 10K, whose race start at Oaken Grove is separate from the usual club meeting point.",
      "Regular sessions meet at Ethel Ward Car Park on Calf Close. Monday and Friday options include shorter run-walk groups, while Wednesday mornings focus on speed and Thursday evenings provide structured training. Selected Sundays add local road runs or trips to trails, often followed by a café stop. Thursday training is reserved for affiliated members; other trial arrangements should be checked with the club.",
      "The first few runs are free, giving visitors a chance to find a suitable group. Members book through ClubSign and should check it for cancellations or changed plans. Public email, Facebook and Instagram links provide enquiry routes, while the members' WhatsApp community helps arrange additional outings and social activities."
    ],
    founded_year: 2020,
    sources: [
      { title: "Lockdown origins and club event", url: "https://haxbyrunners.com/" },
      { title: "Weekly groups, member restriction and meeting point", url: "https://www.haxbyrunners.com/our-runs" },
      { title: "Public contact and club social accounts", url: "https://www.haxbyrunners.com/contact" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Ethel Ward Car Park, Calf Close, Haxby, York", postcode: "YO32 3NU", address_kind: "training" }
  },
  "eden-tri-club": {
    summary: "Eden Tri Club is an adult triathlon club in Edenderry, County Offaly, with documented local swimming and national duathlon participation.",
    biography: [
      "Eden Tri Club is based in Edenderry, County Offaly, Ireland, and is listed by Triathlon Ireland as an adult club. Its multisport identity brings swimming, cycling and running together, with a public club email for people seeking membership information or a suitable route into training.",
      "Local primary evidence places the club at Edenderry Swimming Pool: the pool's January-to-June 2024 timetable included a dedicated Monday evening Eden Tri session and asked swimmers to contact the group directly. That confirms a historical training connection, not a current weekly booking. The club also appears in national racing reports; Triathlon Ireland identified Enda Bagnall as an Eden member when he finished second at the February 2024 Waterford Duathlon.",
      "Prospective members should enquire directly about present swim sessions, cycling and running arrangements, and any experience needed before joining. The club website was unavailable during this review, so no current timetable, exact training address or founding date has been inferred from older material. The federation's club listing remains a useful contact and membership starting point."
    ],
    notable_members: [{ name: "Enda Bagnall", connection: "Documented 2024 competitor", detail: "Triathlon Ireland's February 2024 Waterford Duathlon report identifies Bagnall with Eden Tri Club and records his second place; current membership is not inferred." }],
    sources: [
      { title: "Club location and enquiry email", url: "https://www.triathlonireland.com/get-involved/find-a-club/" },
      { title: "Dated 2024 pool timetable", url: "https://edenderryswimmingpool.ie/schedule/" },
      { title: "February 2024 Waterford Duathlon report", url: "https://www.triathlonireland.com/news/waterford-duathlon-race-report/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Edenderry is confirmed by Triathlon Ireland. The swimming-pool timetable is dated 2024; a current training venue and schedule remain unconfirmed.",
    corrections: { city: "Edenderry", adult_only: true, location_precision: "official-directory" }
  },
  "lisburn-triathlon-club": {
    summary: "Lisburn Triathlon Club is a Northern Irish multisport club with a documented duathlon-organising role and historical links to international triathlete James Edgar.",
    biography: [
      "Lisburn Triathlon Club serves the Lisburn area of Northern Ireland and is listed by Triathlon Ireland in County Antrim. Its history includes an early connection with James Edgar: Sport Ireland's July 2015 European Championships preview described the sixteen-year-old as racing for the then recently established club. That is a dated association, not proof of his current membership or an exact club founding year.",
      "The club also helps deliver local racing. Triathlon Ireland credited it with hosting the 2025 SERE Lisburn Duathlon at Down Royal Racecourse, supported by volunteers. The report highlighted participation by para-athletes from Brain Injury Matters alongside the wider field, illustrating a community contribution beyond club training.",
      "The current federation directory lists the club without a junior section and provides its public enquiry email and Facebook page. Newcomers should use those routes to confirm membership eligibility, coaching and current swim, bike and run arrangements. Down Royal is documented here as an event venue, not assumed to be the club's everyday training base."
    ],
    notable_members: [{ name: "James Edgar", connection: "Documented junior member in 2015", detail: "Sport Ireland's 8 July 2015 European Championships preview identified Edgar as racing with Lisburn Triathlon Club. The association is historical." }],
    sources: [
      { title: "Current club location, contact and junior-section status", url: "https://www.triathlonireland.com/get-involved/find-a-club/" },
      { title: "Sport Ireland's July 2015 James Edgar profile", url: "https://www.sportireland.ie/news/52-irish-prepare-for-european-triathlon-championships" },
      { title: "2025 club-hosted duathlon and inclusive participation", url: "https://www.triathlonireland.com/events/lisburn-duathlon-race-report/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Lisburn is the federation-listed location. Down Royal Racecourse is a documented duathlon venue, not a confirmed regular training base.",
    corrections: { city: "Lisburn", location_precision: "official-directory", adult_only: true }
  },
  "cromane-triathlon-club": {
    summary: "Cromane Triathlon Club is an adult multisport club in County Kerry and a participant in the South-West Ireland tri-club community.",
    biography: [
      "Cromane Triathlon Club is based in Cromane, County Kerry, Ireland. Triathlon Ireland lists it as an adult club and publishes a dedicated enquiry email. Its local identity is connected with a wider Kerry and Cork network: Cromane is one of the clubs named by Tralee Triathlon Club in the South-West Ireland Triathlon Clubs partnership.",
      "The partnership's published aims centre on shared experience, social contact and participation across ability levels. Its 2024 programme included a Cromane Zwift group and the Cromane Seafest sprint triathlon. Tralee's archived 2025 training calendar also listed cycling time-trial dates with Cromane Tri Club. These dated records show inter-club activity without establishing today's weekly training timetable.",
      "New members should contact Cromane directly to ask about current swimming, cycling and running sessions and membership requirements. The club's public Facebook presence offers another enquiry route. A precise training venue, founding year and notable-member history were not established from the available primary pages, so event locations and neighbouring clubs' facilities are not presented as Cromane's permanent base."
    ],
    sources: [
      { title: "Federation club directory", url: "https://www.triathlonireland.com/get-involved/find-a-club/" },
      { title: "Regional partnership and 2024 shared programme", url: "https://traleetriclub.ie/south-west-ireland-tri-clubs" },
      { title: "Archived 2025 cycling time-trial listings", url: "https://traleetriclub.ie/training" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Cromane is confirmed by the federation; no single current training venue is established. Regional event locations are not treated as a clubhouse address.",
    corrections: { city: "Cromane", location_precision: "official-directory", adult_only: true }
  },
  "helm-hill-runners": {
    summary: "Helm Hill Runners is a Kendal fell-running club with junior and senior training, a winter race league and a history of international representation.",
    biography: [
      "Helm Hill Runners is a fell-running club based around Kendal in Cumbria, England. Junior development sits alongside senior training and racing, with the club's honours list recognising international representation by athletes including Hannah Russell, Chris Richards and Scarlet Dale. These are historical honours, not a claim that every listed runner remains a current member.",
      "Wednesday training brings junior and senior groups together, with colour-coded senior groups helping runners choose an appropriate level. Winter meetings use the canal path behind the leisure centre; summer sessions move onto the Helm above the Station Inn. Mondays offer separate track and steady-running options. Juniors can start from eight and should contact the coordinator before attending.",
      "The club organises the Kendal Winter League, a series of short fell and cross-country-style races with junior courses as well as senior events. Visitors need not be club members to race, but must follow registration and kit requirements. Prospective training members can try sessions before joining through the membership link and should check the calendar for the correct seasonal venue."
    ],
    notable_members: [
      { name: "Hannah Russell", connection: "International honours list", detail: "Named in both the junior and senior international-vest sections of Helm Hill's honours page; current membership is not asserted." },
      { name: "Chris Richards", connection: "International honours list", detail: "Named in the club's junior and senior international-vest lists, documenting a development and representation association." },
      { name: "Scarlet Dale", connection: "Senior international honours list", detail: "Included among athletes recognised for senior international vests on the club's honours page." }
    ],
    sources: [
      { title: "Training groups, ages and seasonal venues", url: "https://www.helmhill.co.uk/index.php/training2" },
      { title: "International honours", url: "https://www.helmhill.co.uk/index.php/honour/international" },
      { title: "Winter League participation and kit", url: "https://www.helmhill.co.uk/index.php/races/kendal-winter-league/about-the-winter-league" },
      { title: "Membership and role contacts", url: "https://www.helmhill.co.uk/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Winter Wednesday training meets on the canal path behind Kendal Leisure Centre; summer Wednesdays use the Helm above the Station Inn. Monday track and steady runs have separate arrangements. The leisure centre is a landmark, not the start for every session.",
    corrections: { city: "Kendal", address_kind: "training" }
  },
  "helsby-running-club": {
    summary: "Helsby Running Club offers road, trail and fell running from Helsby Community Sports Club, with mixed-pace training and the Four Villages Half Marathon.",
    biography: [
      "Helsby Running Club is based in Helsby village, Cheshire, England, and draws runners from Frodsham, Runcorn, Elton, Chester and surrounding communities. Its home is Helsby Community Sports Club on Callender Way. The club's activities span road, cross-country, trail and fell running, with the Four Villages Half Marathon a prominent event in its own race programme.",
      "Monday and Wednesday evenings provide regular opportunities to train together, and members also arrange informal weekend outings. The joining guidance suggests that someone able to run three kilometres continuously should be comfortable starting with a suitable group. Monday effort sessions are adaptable, allowing newcomers to do an appropriate amount rather than keep up with one fixed pace.",
      "Visitors are encouraged to try several runs before joining. Full and social membership offer different routes into the club, with some league competition and affiliation benefits reserved for full members. An online joining form is available, and the public club email is the practical enquiry route: the contact page currently displays an unrendered form shortcode rather than a working embedded form."
    ],
    sources: [
      { title: "Club activities and races", url: "https://www.helsbyrunningclub.org.uk/" },
      { title: "Village and sports-club location", url: "https://www.helsbyrunningclub.org.uk/about/" },
      { title: "Trials, pace guidance and membership routes", url: "https://www.helsbyrunningclub.org.uk/join-us/" },
      { title: "Public email and address", url: "https://www.helsbyrunningclub.org.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Helsby", address: "Helsby Community Sports Club, Callender Way, Helsby", postcode: "WA6 0FX", address_kind: "clubhouse" }
  },
  "headington-rr": {
    summary: "Headington RoadRunners is an Oxford adult running club based at OXSRAD, combining social and coached running with road, cross-country and relay competition.",
    biography: [
      "Headington RoadRunners was founded at a public meeting in Oxford, England, on 28 November 1988. Patrick Coulter called the meeting, where those attending chose Headington Road Runners over the proposed Oxford Road Runners name. The club moved to OXSRAD in Marston in May 1989 and developed a tradition of runbacks and group support so that faster runners could train alongside slower companions.",
      "Mara Yamauchi recalls training with the club as a teenager before her later international career, while the club history also records Jethro Lennox's mountain-running success. Road racing, cross-country and long-distance relays remain important parts of the club's identity, alongside organising the Headington 5 and contributing to local league events.",
      "Adults can try sessions before joining. Thursday evenings at OXSRAD offer several pace groups; a shorter option builds towards continuous running, and Monday's social 5K suits those already comfortable with that distance. Complete beginners should ask about coaching guidance or the spring beginners' group. Applications use the club's membership system, and the membership secretary can advise on a suitable first session."
    ],
    founded_year: 1988,
    notable_members: [
      { name: "Patrick Coulter", connection: "Founding organiser", detail: "Called the 28 November 1988 meeting that established Headington RoadRunners, according to the club history." },
      { name: "Mara Yamauchi", connection: "Former teenage member", detail: "Her first-person recollection on the club history page describes training with Headington in the 1980s and 1990s before her later Olympic career." },
      { name: "Jethro Lennox", connection: "Historical mountain-running association", detail: "The club history identifies Lennox among its successful members and records his 2008 World Long Distance Mountain Running Challenge victory." }
    ],
    sources: [
      { title: "Founding meeting, OXSRAD and historical athletes", url: "https://hrr.org.uk/about-hrr/hrr-club-history/" },
      { title: "Trials, beginner guidance and joining", url: "https://hrr.org.uk/about-hrr/joining-hrr/" },
      { title: "Adult club introduction and role contacts", url: "https://www.hrr.org.uk/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address_kind: "training" }
  },
  "heanor-running-club": {
    summary: "Heanor Running Club offers junior and senior running in Derbyshire, with seasonal training bases, road and cross-country competition and the Pudding Run.",
    biography: [
      "Heanor Running Club was formed on 28 September 1982 at the Market Hotel in Heanor, Derbyshire, England. David Levens proposed the meeting shortly after helping organise the first Heanor Half Marathon. Early runners such as Andy May established the club's competitive reputation, while Judith Wooley's young-athlete section helped sustain it during a more difficult period in the 1990s.",
      "Today the club combines road and cross-country running with junior development and its long-established Christmas Pudding 10K. Senior training is listed for Tuesdays and Thursdays, using Shipley Hall Cricket Club in summer and the Heanor welfare venue in winter. Junior Thursday sessions also change venue seasonally, from Shipley to Rutland Sports Park.",
      "Newcomers should contact the club before attending to confirm the current group, time and seasonal location. The published programme offers support from qualified coaches and runners of different abilities, while the seasonal venue changes allow the club to make use of both summer outdoor routes and winter facilities."
    ],
    founded_year: 1982,
    notable_members: [
      { name: "David Levens", connection: "Founding organiser", detail: "Proposed the club's first meeting in September 1982 after co-organising the inaugural Heanor Half Marathon." },
      { name: "Judith Wooley", connection: "Historical junior-section organiser", detail: "The club history credits Wooley with starting a young-athlete section in the early-to-mid 1990s." },
      { name: "Andy May", connection: "Early competitive member", detail: "The club history describes May as a leading Heanor runner during the 1980s, including the 1983 Codnor Half Marathon team success." }
    ],
    sources: [
      { title: "1982 foundation and historical members", url: "https://www.heanorrunningclub.com/club-history/" },
      { title: "Seasonal senior and junior training", url: "https://www.heanorrunningclub.com/training-nights/" },
      { title: "Pudding Run and public enquiry email", url: "https://www.heanorrunningclub.com/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Shipley Hall Cricket Club is the published summer base, not a year-round meeting point. Senior winter sessions use the Heanor welfare venue; juniors use Rutland Sports Park. Confirm current arrangements with the club.",
    corrections: { address_kind: "training" }
  }
};
