import type { ClubProfile } from "./club-profiles";

// Official club and governing-body pages opened 15 October 2026.
export const regionalTrainingAndAccessProfiles: Record<string, ClubProfile> = {
  "loftus-and-whitby-ac": {
    summary: "Loftus and Whitby AC brings together coastal runners in North Yorkshire and Cleveland, with senior and junior activity and the Poultry and Mulgrave races.",
    biography: [
      "Loftus and Whitby AC serves runners around Loftus and Whitby on England's north-east coast. Its programme includes road, cross-country and fell running, welcoming people who run for fitness as well as those who enjoy competition. The club organises the Poultry Run and Mulgrave Run, giving local runners opportunities to race and volunteer.",
      "Loftus Cricket Club on Whitby Road is a senior meeting base, while the published programme also includes activity in Whitby. Junior sessions use different venues through the year, including the Caedmon sixth-form site and Royal Crescent. The website's current notices and older footer give different days and times, so families should confirm arrangements before travelling.",
      "Prospective members can use the club contact form or speak to its secretary about joining. The website provides a membership application and a Facebook group for club news. Its archive preserves photographs, press cuttings and older accounts of club life; these are historical material rather than a current training timetable."
    ],
    sources: [{ title: "Club programme and races", url: "https://www.loftusandwhitbyac.co.uk/" }, { title: "Joining", url: "https://www.loftusandwhitbyac.co.uk/join/" }, { title: "Club archive", url: "https://www.loftusandwhitbyac.co.uk/memories/" }, { title: "Enquiry form", url: "https://www.loftusandwhitbyac.co.uk/contact/" }],
    reviewed_at: "2026-10-15",
    contact_note: "Training notices and the older site footer disagree on times; confirm the relevant senior or junior session with the club.",
    location_note: "Loftus Cricket Club is one meeting base; Whitby sessions have separate locations.",
    corrections: { city: "Loftus", address_kind: "training" }
  },
  "london-city-runners": {
    summary: "London City Runners grew from a small Bermondsey group in 2010 into a social running club offering Thames routes, separate track sessions and beginner courses.",
    biography: [
      "London City Runners began in May 2010 in Bermondsey, London, England. The club's account recalls a small group whose bags were initially kept in its founder's flat. Social running remains central to its identity, with free group outings along the Thames and a place to meet afterwards.",
      "The current river-run base is the Marquis of Wellington at 21 Druid Street, rather than the older 130 Druid Street address. Tuesday, Thursday and Sunday runs offer several route lengths. Most are not formally paced or led, so newcomers should read the route information rather than assume every outing is a coached session.",
      "Create the club's online member profile before attending. Regular river runs suit people already able to run about 5K, while separate Couch to 5K programmes support beginners. Wednesday track sessions use Southwark Park Sports and Athletics Centre and require advance booking and payment. Confirm the facilities for your chosen run: Sunday river sessions do not offer bag storage."
    ],
    founded_year: 2010,
    sources: [{ title: "Origins and current base", url: "https://www.londoncityrunners.com/about-us" }, { title: "River runs and first attendance", url: "https://www.londoncityrunners.com/river-runs" }],
    reviewed_at: "2026-10-15",
    location_note: "21 Druid Street is the river-run meeting base; booked track sessions take place at Southwark Park.",
    corrections: { city: "London", website: "https://www.londoncityrunners.com/", address: "Marquis of Wellington, 21 Druid Street, Bermondsey, London", postcode: "SE1 2HH", address_kind: "training" }
  },
  "london-frontrunners": {
    summary: "London Frontrunners has offered inclusive LGBT+ running since 1995, with London-wide social runs, road and cross-country racing, coaching and triathlon.",
    biography: [
      "London Frontrunners was formed in 1995 and is part of the International Front Runners network. Based across London, England, it welcomes LGBT+ runners and allies, from recreational joggers to competitive road and cross-country athletes. Triathlon, coaching and social activities broaden the programme beyond its weekly runs.",
      "Runs take place in several parts of London, including Elephant and Castle, Regent's Park, Greenwich, Clapham, Hyde Park and Victoria Park. Newcomers are paired with a volunteer or similarly paced runner, rather than assigned to a fixed formal pace group. The separate long run requires enough endurance to complete a route that cannot readily be shortened.",
      "Complete the new-runner pre-registration and contact the club before a first visit. A free introductory month precedes paid membership, and post-run meals provide a way to get to know people. England Athletics' September 2026 awards recognised coach and Pride Run 10K race director Dominic Addison as London's Unsung Hero, highlighting the volunteering behind the club."
    ],
    founded_year: 1995,
    notable_members: [{ name: "Dominic Addison", connection: "Coach and race director recognised in 2026", detail: "England Athletics' September 2026 London awards account names Addison as an Unsung Hero for his London Frontrunners coaching, run-leading and Pride Run 10K work." }],
    sources: [{ title: "Club identity and origins", url: "https://londonfrontrunners.org/" }, { title: "First run and introductory month", url: "https://londonfrontrunners.org/your-first-lfr-run/" }, { title: "Membership", url: "https://londonfrontrunners.org/membership/" }, { title: "2026 London volunteer awards", url: "https://www.englandathletics.org/news/regional-volunteer-awards-2026-london/" }],
    reviewed_at: "2026-10-15",
    location_note: "A London-wide club with several meeting places, not a single clubhouse. International network membership does not make this a global club.",
    corrections: { city: "London", website: "https://londonfrontrunners.org/", sports: ["Running", "Triathlon"] }
  },
  "lonely-goat-rc": {
    summary: "Lonely Goat RC is an online running community offering flexible participation, peer support, virtual challenges and optional England Athletics registration.",
    biography: [
      "Lonely Goat RC is an online running club affiliated with England Athletics. Rather than organising its identity around a Southampton training night, it connects people who run in their own locations and at their own pace. Its emphasis is on encouragement and personal achievement, not only speed or distance.",
      "Members share advice and experiences through Facebook, Instagram and Strava, with running articles and regular emails adding further support. Free membership provides access to the community, while the optional Member Plus tier adds benefits including virtual challenges and discounts. These are separate from individual England Athletics registration.",
      "Joining starts on the club website. Affiliation is available for members who want the associated racing benefits, but is not required simply to belong to Lonely Goat. Public enquiries go to the club email or the dedicated club-enquiry form; shop enquiries have a separate form. The directory's former street address should not be treated as a place to attend training."
    ],
    sources: [{ title: "Online club and membership options", url: "https://lonelygoat.com/about/" }, { title: "Club and shop enquiry routes", url: "https://lonelygoat.com/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "This is an online club, not a Southampton training venue; no global scope or physical meeting point is inferred.",
    corrections: { address: "", postcode: "" }
  },
  "long-eaton-running-club": {
    summary: "Long Eaton Running Club was established in 1986 and combines West Park group runs with road, cross-country and fell competition, beginner support and charity activity.",
    biography: [
      "Long Eaton Running Club was formally affiliated in October 1986 in Long Eaton, Derbyshire, England. Its roots were a small group training together after local half marathons, including Martin Goodall, Don Pitman and first secretary Dave Munt. That modern club is distinct from the town's nineteenth-century Long Eaton Harriers.",
      "West Park remains its base for Tuesday and Thursday group runs. Members take part in road races, cross-country, trail and fell events, while Couch to 5K activity offers a route into running. The Risley Trail and Nomad Ultra, club competitions and social events add variety to the annual programme.",
      "The club offers a four-week trial; contact the membership team to arrange an introduction and check the meeting point near the rugby club. Its history records successful racing teams and charitable fundraising alongside ordinary runners' personal milestones. Former standout performers include Neil Renault, who joined in 2005, and Sarah Harris, whose 2011 marathon performances led to an England selection."
    ],
    founded_year: 1986,
    notable_members: [{ name: "Dave Munt", connection: "Founding organiser and first secretary", detail: "The official history identifies Munt as one of the original training group and the club's first secretary; he died in 2011." }, { name: "Neil Renault", connection: "Historical member from 2005", detail: "The club history records Renault joining in 2005 and subsequently setting course records at Folksworth, Gloucester and Southwell." }, { name: "Sarah Harris", connection: "Historical club athlete", detail: "The club history describes Harris's 2011 Robin Hood Marathon win and England selection following her Edinburgh Marathon performance; this is not a claim of present membership." }],
    sources: [{ title: "Club history", url: "https://www.longeatonrunningclub.com/history.php" }, { title: "Current programme, trial and base", url: "https://www.longeatonrunningclub.com" }, { title: "Membership application", url: "https://www.longeatonrunningclub.com/join.php" }],
    reviewed_at: "2026-10-15",
    location_note: "West Park is the club and group-run base, replacing an unrelated exact correspondence listing in Nottingham.",
    corrections: { city: "Long Eaton", county: "Derbyshire", address: "West Park Clubhouse, West Park, Long Eaton", postcode: "NG10 4AA", address_kind: "training" }
  },
  "longwood-harriers-ac": {
    summary: "Longwood Harriers traces its Huddersfield roots to 1888 and provides competition-focused athletics, with training at Leeds Road and seasonal use of Cleckheaton.",
    biography: [
      "Longwood Harriers AC grew from a running group at St Mark's Church in Longwood, Huddersfield, in 1888. The West Yorkshire club in England now offers track and field, road running and cross-country, with volunteer coaches supporting junior and senior athletes. Competition is an expected part of membership, not merely an optional extra to group exercise.",
      "Training uses Leeds Road in Huddersfield, with Cleckheaton's track used in summer because of limitations at the Leeds Road facilities. Track and field is prominent in summer; cross-country becomes a focus in winter while road running continues through the year. Parents and older athletes are encouraged to help with coaching, officiating and club events.",
      "Prospective members must contact the club before attending. Coaching capacity is limited and a waiting list may apply; turning up on a training night does not secure a place. Once invited, newcomers can try two sessions before completing the membership process. Confirm the relevant age group, venue and session charges with the secretary."
    ],
    founded_year: 1888,
    sources: [{ title: "Origins and club introduction", url: "http://www.longwoodhac.org.uk/" }, { title: "Training and competition expectations", url: "http://www.longwoodhac.org.uk/membership.html" }, { title: "Joining and waiting list", url: "http://www.longwoodhac.org.uk/joiningLHAC.html" }, { title: "Club officials", url: "http://www.longwoodhac.org.uk/officials.html" }],
    reviewed_at: "2026-10-15",
    location_note: "Leeds Road is a training venue; some summer activity moves to Cleckheaton. Confirm the session before travelling.",
    corrections: { address: "Leeds Road Playing Fields, Huddersfield", postcode: "", address_kind: "training" }
  },
  "lordshill-road-runners": {
    summary: "Lordshill Road Runners began in Southampton in 1982 and offers beginner-to-competitive group training, local leagues and charity-supporting races.",
    biography: [
      "Lordshill Road Runners was founded in summer 1982 after the early London and Southampton marathons inspired a group of local runners. The first outings began at Lordshill Library. The Southampton club in England later helped establish the league now known as RR10 and developed its own road races.",
      "Monday training generally meets at Taunton's College on Hill Lane, with groups using Southampton Common, the outdoor sports centre and nearby roads. Beginners and returners have their own progression options alongside faster training groups. Wednesday sessions add drills, hills and intervals, with Thursday endurance work offered around major marathons.",
      "Membership is open from seventeen, and newcomers can try two sessions before joining. Check the current location on the club's programme or Spond, because track sessions and some groups meet elsewhere. RR10 and CC6 participation, the Lordshill 10K, charity fundraising and social trips give members ways to contribute as well as compete. The membership secretary can explain affiliated and unaffiliated options."
    ],
    founded_year: 1982,
    sources: [{ title: "Club history", url: "https://www.lordshillroadrunners.org.uk/about-us/club-history/" }, { title: "Monday training and venues", url: "https://www.lordshillroadrunners.org.uk/training/monday/" }, { title: "Membership and trial", url: "https://www.lordshillroadrunners.org.uk/membership/" }],
    reviewed_at: "2026-10-15",
    location_note: "Taunton's College is the usual Monday meeting point; some groups and track sessions start elsewhere.",
    corrections: { address: "Richard Taunton Sixth Form College, Hill Lane, Southampton", address_kind: "training" }
  },
  "lostock-ac": {
    summary: "Lostock AC grew from British Aerospace employees training for the Bolton Marathon and now combines road, trail and fell running with a busy social programme in Horwich.",
    biography: [
      "Lostock AC began in the early 1980s when British Aerospace employees at the Lostock factory trained together for the Bolton Marathon. Originally based at the factory sports pavilion, the club moved through several venues before settling around Horwich, near Bolton in Greater Manchester, England. Its history links workplace running with a lasting local community.",
      "Wednesday groups meet in the foyer of Horwich Leisure Centre, with road routes and off-road options towards Rivington. The wider programme includes track training at Bolton Arena, fell and trail championships, cross-country and support for swimming and cycling. The Lostock 6 and Leo Pollard Memorial Fell Race are established club-organised events.",
      "Beginners can look for the club's Couch to 5K and improver programmes, while established runners can contact the membership team about a Wednesday visit. Winter off-road sessions require suitable clothing and a headtorch. Handicaps, shared meals, camping weekends and other social occasions are part of the club's appeal beyond racing. No exact founding year is inferred from its early-1980s account."
    ],
    sources: [{ title: "Workplace origins and club activity", url: "https://lostock-ac.co.uk/about/" }, { title: "Joining and training venues", url: "https://lostock-ac.co.uk/join/" }, { title: "Beginner programmes", url: "https://lostock-ac.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "Horwich Leisure Centre is the Wednesday meeting point, not the former Hillside Avenue directory address.",
    corrections: { city: "Horwich", address: "Horwich Leisure Centre, Horwich", postcode: "", address_kind: "training" }
  },
  "loughborough-students-ac": {
    summary: "Loughborough Students AC offers university track and field and cross-country, combining accessible student participation with performance coaching and BUCS competition.",
    biography: [
      "Loughborough Students AC is based at Loughborough University in Leicestershire, England. Its athletics programme spans track and field and cross-country, with opportunities for students developing their sport as well as established competitors. Indoor and outdoor facilities at the university's athletics and throws centres support the different event groups.",
      "Membership brings access to club training and selected competitions, including university open meetings and league activity. BUCS teams are selected rather than guaranteed to every member. The university's published coaching team includes former international triple jumper Femi Akinsanya and former world, European and Commonwealth 400-metre hurdles champion Dai Greene.",
      "Prospective students and current students can use the athletics enquiry form to discuss their event, experience and joining options. Early-term introductions help connect newcomers with the appropriate coaches, while the club's social programme provides another route into university life. Training arrangements depend on the event group, so confirm these directly rather than treating the campus address as a universal meeting point."
    ],
    notable_members: [{ name: "Femi Akinsanya", connection: "Director of Athletics in the reviewed university programme", detail: "The university identifies Akinsanya as a former international triple jumper who joined its athletics staff in 2019; this is a coaching association, not a student-alumnus claim." }, { name: "Dai Greene", connection: "Head of Sprints and Hurdles in the reviewed programme", detail: "The university coaching biography identifies Greene's world, European and Commonwealth 400-metre hurdles titles and his coaching role at Loughborough." }],
    sources: [{ title: "University athletics, facilities, membership and coaches", url: "https://www.lboro.ac.uk/sport/sports/athletics/" }],
    reviewed_at: "2026-10-15",
    location_note: "HIPAC is a university athletics facility; individual event groups have their own training arrangements.",
    corrections: { address_kind: "training" }
  },
  "loughton-ac": {
    summary: "Loughton AC serves West Essex and East London with running, athletics and race walking, using the Roding Valley grass track, local trails and Epping Forest.",
    biography: [
      "Loughton Athletic Club draws members from Loughton and surrounding West Essex and East London communities in England. It welcomes recreational runners and competitive athletes, with track and field, road running, cross-country, hill and fell running and race walking represented. Veterans' groups and a children's section sit alongside the wider adult membership.",
      "Summer training makes use of the Roding Valley grass track and nearby paths, including access to Epping Forest. Winter sessions move towards road work and indoor running-specific strength and conditioning. Sunday forest runs and participation and volunteering at Roding Valley parkrun add a social dimension to the coached programme.",
      "Adults are encouraged to contact the club and arrange a trial before joining. Junior capacity needs particular care: at this review the under-12 group and its waiting list were closed, while older children were asked to enquire about available places. General questions should use the contact form; the published welfare email is explicitly reserved for safeguarding matters, not membership enquiries."
    ],
    sources: [{ title: "Club activities", url: "https://www.loughtonac.org.uk/about" }, { title: "Seasonal training", url: "https://www.loughtonac.org.uk/training" }, { title: "Joining and junior capacity", url: "https://www.loughtonac.org.uk/new-members" }, { title: "Enquiry and welfare distinction", url: "https://www.loughtonac.org.uk/contact-us" }],
    reviewed_at: "2026-10-15",
    contact_note: "Under-12 group and waiting list closed at review; check the website for reopening. Use the general contact form, not the welfare-only email.",
    corrections: { city: "Loughton", address_kind: "training" }
  },
  "louth-ac": {
    summary: "Louth AC offers junior and senior athletics in Lincolnshire, with road, cross-country and track-and-field activity, seasonal meeting places and an introductory trial.",
    biography: [
      "Louth Athletic Club is based in Louth, Lincolnshire, England. It brings together occasional joggers, social runners and athletes who compete for the club in road running, cross-country and track and field. Volunteers organise coaching, events and the supporting work that keeps both junior and senior sections active.",
      "Training follows the seasons. Juniors use the London Road track in summer and indoor facilities in winter, while senior groups explore the surrounding countryside in lighter months and use town routes through winter. Cattlemarket Car Park is one winter meeting point, not the start of every session; the current calendar and club Facebook notices give the details.",
      "The club offers an eight-week trial before membership is required. Senior, junior and supporter options are available, with individual England Athletics registration needed for relevant competitive activity rather than for every social runner. Contact the membership secretary for adult enquiries and the named junior contact for coaching availability. Wolds Dash and seasonal fun-run activity provide further ways for the local community to take part."
    ],
    sources: [{ title: "Club introduction", url: "https://louth-ac.org.uk/about-us/" }, { title: "Membership and trials", url: "https://louth-ac.org.uk/membership/" }, { title: "Seasonal venues", url: "https://louth-ac.org.uk/training-venues-locations/" }, { title: "Club contacts", url: "https://louth-ac.org.uk/contact-us/" }],
    reviewed_at: "2026-10-15",
    location_note: "London Road is the summer track venue; junior indoor sessions and senior runs use other locations.",
    corrections: { city: "Louth", county: "Lincolnshire", website: "https://louth-ac.org.uk/" }
  },
  "louth-triathlon-club": {
    summary: "Louth Triathlon Club supports beginners and experienced multisport athletes through swimming, cycling and running, with a main pool base at Meridian Leisure Centre.",
    biography: [
      "Louth Triathlon Club is a community multisport club in Louth, Lincolnshire, England. It helps newcomers and experienced age-group athletes develop across swimming, cycling and running. The club records Triathlon England's national Club of the Year award in 2023, alongside East Midlands recognition in 2020 and 2023.",
      "Meridian Leisure Centre is its principal base for pool sessions. Coached swimming and running are complemented by triathlon-specific work, including seasonal transition practice. Club events include aquathlons, duathlons, triathlons, running events and cycling time trials, giving members different ways to practise and compete.",
      "Contact the membership secretary to request a joining form or arrange an introductory session. The club advertises a free first session, with subsequent bookings and applicable charges handled through Spond. Facebook and WhatsApp member groups carry updates, so confirm the timetable rather than relying on the joining page's older 2025 session list. The pool programme is identified as being coordinated by Paul Fowler of 100% Swimming."
    ],
    sources: [{ title: "Club introduction and awards", url: "http://www.louthtriclub.co.uk/" }, { title: "Community aims and pool base", url: "https://www.louthtriclub.co.uk/about/" }, { title: "Joining", url: "https://www.louthtriclub.co.uk/join-the-club/" }, { title: "Session bookings", url: "https://www.louthtriclub.co.uk/training-sessions/" }, { title: "2026 contacts", url: "https://www.louthtriclub.co.uk/contact-us/" }],
    reviewed_at: "2026-10-15",
    location_note: "Meridian is the principal pool venue; running and cycling activities may start elsewhere.",
    corrections: { website: "https://www.louthtriclub.co.uk/", address_kind: "training" }
  },
  "low-fell-rc": {
    summary: "Low Fell Running Club has served Gateshead since 1985, with adult and junior coaching, local races and training across the cricket club, stadium and parks.",
    biography: [
      "Low Fell Running Club was established in 1985 in Gateshead, England. Its programme combines adult running groups with junior athletics from age eight, offering routes into fitness and competition. The club organises the Angel View Run and Watergate 5K as well as supporting members' training and racing.",
      "Gateshead Fell Cricket Club is an important meeting base, including Thursday adult training and some junior sessions. Other starts vary: Tuesday adult locations are announced through member communications, and junior Friday training changes between Gateshead Stadium in winter and Saltwell Park in summer. A separate Monday ladies' group adds another option.",
      "Qualified coaches lead junior activity, dividing children into groups suited to their development. Families can use the junior membership form and check the current schedule before attending. Adults should also confirm their group's location rather than assume every run begins at the cricket club. The published welfare email is for concerns and safeguarding, not a general enquiry address."
    ],
    founded_year: 1985,
    sources: [{ title: "History, current programme and races", url: "https://www.lowfellrunningclub.co.uk/" }, { title: "Junior participation", url: "https://www.lowfellrunningclub.co.uk/pages/our-club/junior-athletes" }, { title: "Committee and welfare", url: "https://www.lowfellrunningclub.co.uk/pages/our-club/club-committee-and-policies" }],
    reviewed_at: "2026-10-15",
    location_note: "The cricket club is one training base; adult Tuesday and seasonal junior Friday sessions have other starts.",
    corrections: { address_kind: "training" }
  },
  "lowestoft-road-runners": {
    summary: "Lowestoft Road Runners was formed in 1996 to retain the old Lowestoft AC colours and now offers adult road and cross-country running with varied weekly sessions.",
    biography: [
      "Lowestoft Road Runners was formed in 1996 in Lowestoft, Suffolk, England. Its history reaches back to Lowestoft AC, but the present club was created to retain that club's colours when the earlier organisation combined with Beccles Running Club to form Waveney Valley AC. These are related histories, not interchangeable club identities.",
      "The programme includes a Monday social 5K, Tuesday hill and speed work and a changing Thursday session. Members represent the club in local races, relays and Suffolk championships as well as running for fitness and company. Training locations include Water Lane Leisure Centre, Clarkson Road in Oulton Broad and Claremont Pier.",
      "Membership is for adults aged eighteen and over who can already run 5K. The beginner welcome therefore does not imply a complete walk-to-run course. Prospective members can email the club or use its contact form, then complete the online membership application. Check the calendar or Facebook notices for the exact session and start point before travelling."
    ],
    founded_year: 1996,
    sources: [{ title: "Club history and entry requirements", url: "https://www.lowestoftroadrunners.co.uk/about-us" }, { title: "Training and locations", url: "https://www.lowestoftroadrunners.co.uk/training" }, { title: "Joining and enquiries", url: "https://www.lowestoftroadrunners.co.uk/contact-us" }],
    reviewed_at: "2026-10-15",
    location_note: "Claremont Pier is one of several starts; the club publishes NR33 0QN for this venue, not the previous NR33 0BS.",
    corrections: { city: "Lowestoft", address: "Claremont Pier, Lowestoft", postcode: "NR33 0QN", address_kind: "training" }
  },
  "ludlow-runners": {
    summary: "Ludlow Runners combines South Shropshire road and cross-country running with Mortimer Forest routes, coached groups and beginner courses.",
    biography: [
      "Ludlow Runners is a road and cross-country club in Ludlow, South Shropshire, England. Members run through the town and in Mortimer Forest, using headtorches for winter off-road outings. The club also organises its own races and participates in the Herefordshire and Borders Cross Country League.",
      "Tuesday social runs offer daytime and evening options, with groups and locations announced through club communications. Thursday activity includes coached sessions and gentler training runs, so runners can choose a group suited to their experience and goals. Head coach Colin Lancaster is described by the club as an experienced UK Athletics coach educator.",
      "Newcomers can arrange three trial sessions before joining. Separate eight-week beginner courses help people establish a comfortable run-and-walk routine, subject to demand and the next course date. Use the contact form to discuss the right starting point. The older Worcestershire postcode is not a training base: meeting places vary around Ludlow and the forest."
    ],
    notable_members: [{ name: "Colin Lancaster", connection: "Head coach in the reviewed club programme", detail: "The club identifies Lancaster as its head coach and an experienced UK Athletics coach educator; this is a coaching association, not an athlete-identity claim." }],
    sources: [{ title: "Club introduction", url: "https://ludlowrunners.org/about/" }, { title: "Training and coaching", url: "https://ludlowrunners.org/our-training/" }, { title: "Trial and membership", url: "https://ludlowrunners.org/join-us/" }, { title: "Enquiry form", url: "https://ludlowrunners.org/contact-us/" }],
    reviewed_at: "2026-10-15",
    location_note: "Training uses Ludlow and Mortimer Forest locations; the former WR15 correspondence postcode is not a meeting point.",
    corrections: { city: "Ludlow", county: "Shropshire", address: "", postcode: "", website: "https://ludlowrunners.org/" }
  },
  "luton-athletic-club": {
    summary: "Luton Athletic Club was created by a 2004 merger and provides volunteer-led athletics coaching at Stockwood Park, with junior, senior and family membership options.",
    biography: [
      "Luton Athletic Club was formed in 2004 by the merger of Luton United AC and Vauxhall AC, bringing the town's athletics community into one club. Based at Stockwood Park in Luton, Bedfordshire, England, it supports track and field alongside endurance running, with opportunities for different ages and event groups.",
      "Core club nights are Tuesday and Thursday, with additional sessions arranged by the relevant coaches. The published coaching team covers youth athletics from age nine, endurance, sprints, hurdles, jumps and throws. Coaching is provided by volunteers; the separate track charge is collected by the venue operator rather than included as unlimited free facility use.",
      "Contact the coaching coordinator before a first visit to confirm availability and the appropriate group. Three taster sessions are offered before membership is required. Junior, senior, family, student and social options have different conditions. The club also invites parents and athletes to help with coaching, officiating and committee work, and offers support to new volunteers."
    ],
    founded_year: 2004,
    sources: [{ title: "Merger and club introduction", url: "https://lutonac.co.uk/" }, { title: "Coaching and session arrangements", url: "https://lutonac.co.uk/coaching/" }, { title: "Membership and volunteering", url: "https://lutonac.co.uk/join-us/" }, { title: "Stockwood Park and contacts", url: "https://lutonac.co.uk/contact/" }],
    reviewed_at: "2026-10-15",
    location_note: "Stockwood Park is the training base; the membership secretary's postal address is correspondence only.",
    corrections: { address_kind: "training" }
  },
  "macclesfield-harriers-and-ac": {
    summary: "Macclesfield Harriers and AC offers track and field, road, fell, trail and cross-country activity, with paced adult groups and junior places arranged in advance.",
    biography: [
      "Macclesfield Harriers and Athletic Club serves Macclesfield, Cheshire, England, with road running, track and field, cross-country, fell and trail sections. Volunteers coach athletes from age nine upwards, from newcomers to national-level competitors. The breadth of the programme allows members to explore several disciplines without assuming that each session suits every age or ability.",
      "Track groups use Macclesfield Athletics Track behind the leisure centre. Road groups have different paces and distances, with some summer runs starting at Tegg's Nose and other outings using local roads and trails. Fell runs change venue from week to week, so the leisure centre is not a universal start point.",
      "Adults can email the Try a Run contact to find a suitable group and arrange a trial. Junior applicants must contact the waiting-list team before attending; demand can mean a substantial wait, especially in younger groups. The club's joining and timetable pages describe trail sessions differently, so prospective trail runners should confirm the next outing with its leaders."
    ],
    sources: [{ title: "Club disciplines and welcome", url: "https://macclesfield-harriers.co.uk/" }, { title: "New-member guidance", url: "https://macclesfield-harriers.co.uk/new-to-the-club/" }, { title: "Training groups and venues", url: "https://macclesfield-harriers.co.uk/weekly-training-times/" }, { title: "General enquiry form", url: "https://macclesfield-harriers.co.uk/general-enquiry/" }],
    reviewed_at: "2026-10-15",
    contact_note: "Junior places require prior contact. Confirm trail-session frequency: joining and timetable pages differ.",
    location_note: "The track is behind Macclesfield Leisure Centre; road, fell and trail groups also use other starts.",
    corrections: { website: "https://macclesfield-harriers.co.uk/", address_kind: "training" }
  },
  "maidenhead-ac": {
    summary: "Maidenhead AC combines senior running and junior athletics at Braywick Park, with a six-lane cinder track, volunteer coaching and the Maidenhead Easter 10.",
    biography: [
      "Maidenhead Athletic Club is based at Braywick Park in Maidenhead, Berkshire, England. Its history describes local cycling-and-athletics activity in the late nineteenth century, including a joint sports meeting in 1884 and later club-name changes. An earlier 1869 proposal is explicitly uncertain, so it is not treated as the present club's founding date.",
      "The modern club has senior and junior sections, a six-lane cinder track and a purpose-built clubhouse opened in 2009. Senior activity includes track work, road runs and cross-country, while junior coaching covers running, jumping and throwing. The Maidenhead Easter 10 and an active social calendar complement regular training.",
      "Adults can join online or enquire about visiting a session. Junior coaching places are limited and use a waiting list; parents of children over thirteen are asked to contact junior administration before registering interest. Cross-country-only junior participation has a separate route and does not require joining the coaching waiting list. Volunteers and parent helpers are important to the club's programme."
    ],
    sources: [{ title: "Facilities, activities and contacts", url: "https://www.maidenheadac.org/" }, { title: "Historical account and uncertain early proposal", url: "https://www.maidenheadac.org/club-history/" }, { title: "Membership and junior waiting list", url: "https://www.maidenheadac.org/membership" }],
    reviewed_at: "2026-10-15",
    location_note: "Braywick Park contains the club's track and pavilion; junior admission must be arranged rather than assumed.",
    corrections: { address_kind: "training" }
  },
  "malvern-joggers": {
    summary: "Malvern Joggers has brought Worcestershire runners together since 2003, with adult beginner support, paced club runs, trail races and charity fundraising.",
    biography: [
      "Malvern Joggers was established in 2003 in Malvern, Worcestershire, England. A volunteer-run club, it supports runners ranging from walk-jog beginners to experienced marathon and ultra-distance participants. Wednesday club night is organised into pace groups, with the Malvern Hills providing nearby opportunities for summer trail running.",
      "The wider programme includes hill and technical sessions, social runs, parkruns and longer weekend outings. Beginner and progression programmes help members work towards 5K, 10K and longer distances without requiring everyone to pursue the same goals. Its annual 5K and 10K trail races also support a nominated charity; the club names Malvern Special Families for 2026.",
      "Despite broad all-ages wording, the current joining page is explicit that membership is for adults aged eighteen and over and that there is no junior section. Newcomers can try Wednesday runs before joining online. The published meeting base is Malvern Rugby Club; check arrangements with the membership team, especially for sessions elsewhere. Social meals and the internal Champions League add to club life."
    ],
    founded_year: 2003,
    sources: [{ title: "Club programme, base and charity", url: "https://www.malvernjoggers.co.uk" }, { title: "Origins and volunteer organisation", url: "https://www.malvernjoggers.co.uk/about" }, { title: "Adult membership and trial", url: "https://www.malvernjoggers.co.uk/join" }],
    reviewed_at: "2026-10-15",
    location_note: "Malvern Rugby Club is the published Wednesday meeting base; other sessions may use different starts.",
    corrections: { address: "Malvern Rugby Club, Malvern", postcode: "", address_kind: "training", adult_only: true }
  },
  "manchester-frontrunners": {
    summary: "Manchester Frontrunners has offered LGBTQ+ community running since 2005, combining social city routes, track training, race participation and a buddy welcome for newcomers.",
    biography: [
      "Manchester Frontrunners was founded in 2005 in Manchester, England, and belongs to the International Front Runners network. It welcomes LGBTQ+ runners and allies, with members joining for fitness, racing and friendship. Participation in Manchester Pride and shared meals after runs connect its sporting programme with the city's wider community life.",
      "Thursday urban runs start at Manchester Aquatics Centre, with approximate 5K, 7.5K and 10K options and routes changing with the seasons. Saturday social runs and member-only Tuesday track sessions provide other ways to participate. The club also organises the It's a Piece of Cake 10K.",
      "Contact the co-chairs or complete the new-runner form before attending so a buddy can meet you and arrange Spond access. Regular club runs require adult participants who can comfortably run 5K; the separate Couch to 5K course is the starting point for complete beginners when available. A few introductory runs are offered before paid membership, and new runners are matched at their own pace."
    ],
    founded_year: 2005,
    sources: [{ title: "Origins and community activity", url: "https://www.manchesterfrontrunners.org/aboutus" }, { title: "First run", url: "https://www.manchesterfrontrunners.org/join-us/your-first-run-with-us" }, { title: "Thursday venue and routes", url: "https://www.manchesterfrontrunners.org/our-runs-in-manchester/thursday-run" }, { title: "Enquiries and entry requirements", url: "https://www.manchesterfrontrunners.org/contact" }, { title: "Club race", url: "https://www.manchesterfrontrunners.org/" }],
    reviewed_at: "2026-10-15",
    location_note: "Manchester Aquatics Centre is the Thursday meeting base, not the location of every run or track session.",
    corrections: { address_kind: "training" }
  }
};
