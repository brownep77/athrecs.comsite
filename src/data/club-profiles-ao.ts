import type { ClubProfile } from "./club-profiles";

// Official club, governing-body and direct club statements opened 15 October 2026.
export const localRoutesAndClubOriginsProfiles: Record<string, ClubProfile> = {
  "hillsborough-and-rivelin-rc": {
    summary: "Hillsborough & Rivelin Running Club brings road, trail and fell runners together in Sheffield, with grouped runs and goal-focused training.",
    biography: [
      "Hillsborough & Rivelin Running Club was formed in 2020 in the north of Sheffield, England. Road running, trails and the nearby hills all feature in its programme, which aims to help runners set realistic targets and develop the training habits to reach them. The club's Peak Performance groups organise additional sessions around shared goals and ability levels.",
      "Hillsborough Park is a regular Monday meeting place, while other runs use the Rivelin area, southern Sheffield and the Peak District. The training page describes road groups, track work and strength sessions, but also contains older and conflicting timetable details. Members should use the latest club announcements to confirm the session and starting point, especially for seasonal headtorch and fell outings.",
      "First- and second-claim membership options are available, with concessions described for students, older runners and people receiving income support. The membership secretary can explain the joining process and any England Athletics transfer needed when changing first-claim clubs. The club's road and fell championships offer a focus for runners who enjoy competition alongside their weekly training."
    ],
    founded_year: 2020,
    sources: [{ title: "Club origins and membership", url: "https://www.hillsboroughandrivelinrunningclub.co/" }, { title: "Training locations and seasonal arrangements", url: "https://www.hillsboroughandrivelinrunningclub.co/club-training" }],
    reviewed_at: "2026-10-15",
    location_note: "Sessions have different Sheffield and Peak District starts. Confirm the latest meeting instructions; the old directory address is not established as a training venue.",
    corrections: { address: "", postcode: "", location_precision: "unverified" }
  },
  "hinckley-running-club": {
    summary: "Hinckley Running Club offers senior running and junior athletics in Hinckley and Burbage, with road leagues, cross-country and volunteer-led training.",
    biography: [
      "Hinckley Running Club was founded in October 1987 in Leicestershire, England, and added its junior section in 2012. Adults train and race on the roads and cross-country, while children from seven can develop through running, QuadKids athletics and winter Sportshall competition. The club is run by member volunteers, many of whom also help with junior coaching.",
      "Senior sessions take place on Tuesday and Thursday evenings around Hinckley and Burbage. Tuesday intervals use changing locations; Thursday runs start at Argents Mead or Hastings High School according to the published plan. Junior Wednesday sessions use Hastings High School. A free three-week trial must be registered first so that newcomers receive the session information.",
      "The club recommends that adults can already cover five kilometres before trying Tuesday training, with a greater endurance requirement for Thursday's continuous group runs. Racing includes the Leicestershire Road Running League and Derby Runner Cross Country League. Mental-health ambassadors, a litter-picking group and parkrun volunteering give members ways to contribute beyond competition."
    ],
    founded_year: 1987,
    sources: [{ title: "History, junior development, eligibility and trial membership", url: "https://hinckleyrunningclub.com/about-us/" }, { title: "Enquiries and official social channels", url: "https://hinckleyrunningclub.com/contact/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Hinckley", county: "Leicestershire", adult_only: false }
  },
  "hitchin-running-club": {
    summary: "Hitchin Running Club, known as the Hitchin Hares, offers sociable all-pace running and coached Couch to 5K courses in Hertfordshire.",
    biography: [
      "Hitchin Running Club is a social running club in Hitchin, Hertfordshire, England, whose members are also known as the Hitchin Hares. Its approach puts meeting people and enjoying a run alongside fitness and race ambitions. The club describes itself as welcoming all paces, without a trial or minimum-speed requirement.",
      "Weekly sessions are open to members and visitors, with newcomers asked to introduce themselves through the club's Facebook page before attending. The website directs first-time visitors towards a Wednesday or Sunday run. Some timetable information is loaded separately, so the current meeting place and start time should be confirmed with the club rather than inferred from an older directory address.",
      "A coached six-week Couch to 5K programme provides a separate route into running, with support between sessions and a five-kilometre finish. Course dates are announced through Facebook, and the published course email is available for questions. Social challenges and club gatherings are part of the Hares' identity, with a link to the separate Burnt Hare events site."
    ],
    sources: [{ title: "Club ethos, joining and Couch to 5K", url: "https://www.hitchinrunningclub.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "Confirm the current session start with the club; the retrieved page did not establish the older Teller Bar address as a current meeting point.",
    corrections: { address: "", postcode: "", location_precision: "unverified" }
  },
  "hoad-hill-harriers": {
    summary: "Hoad Hill Harriers is an Ulverston running club founded in 1987, combining social runs, coached training, cross-country and local race organisation.",
    biography: [
      "Hoad Hill Harriers was established in 1987 in Ulverston, Cumbria, England, on the northern side of Morecambe Bay. Its home is Ulverston Park Sports Club, formerly the Glaxo sports and social club, where members use the clubhouse and field. Social runners and regular racers share the club's adult programme.",
      "Monday and Thursday evenings provide the main weekly meeting points, with group running and improvement sessions supported by club coaches. Members also arrange outings and race trips between club nights. The club welcomes adults over eighteen and encourages prospective members to speak to a coach or committee member, or contact the enquiries address before coming along.",
      "The Harriers organise mile, five-kilometre and ten-kilometre events, including summer and Christmas races, and participate in the Mid Lancs Cross Country League. An internal championship and monthly challenges give members further goals, with age-category awards broadening the opportunities to take part. Newsletters and social channels carry the latest arrangements for training, racing and club gatherings."
    ],
    founded_year: 1987,
    sources: [{ title: "Club history, adult membership and races", url: "https://hoadhillharriers.co.uk/our-club/about-us/" }, { title: "Current club nights", url: "http://www.hoadhillharriers.co.uk/" }, { title: "Club enquiries", url: "https://hoadhillharriers.co.uk/contact/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Ulverston", county: "Cumbria", address: "Ulverston Park Sports Club, North Lonsdale Road, Ulverston", postcode: "LA12 9DR", address_kind: "training", adult_only: true }
  },
  "hockley-trail-runners": {
    summary: "Hockley Trail Runners is an Essex trail-running club established in 2016, with mixed-ability off-road groups and regular effort sessions.",
    biography: [
      "Hockley Trail Runners was established in 2016 and explores the trails and off-road routes around Hockley, Essex, England. The club's tenth-anniversary website describes a mixed-ability community, welcoming people new to trail running as well as those who already enjoy longer or more demanding outings.",
      "Wednesday evening and Sunday morning runs form the regular programme, with Tuesday effort sessions offering a more structured training option. The emphasis is on finding a suitable group and enjoying local trails together. Newcomers are invited to get in touch through the contact page or official Facebook channels before coming to a run.",
      "The website provides a training hub, pacing guidance and information about coaches and leaders, alongside membership and club events. Questions about beginners' courses, coaching or joining can go to the core-team email or enquiry form. A meeting location should be confirmed for the chosen session; the incomplete address in the older directory is not a reliable set of directions."
    ],
    founded_year: 2016,
    sources: [{ title: "Club origins and regular runs", url: "https://www.hockleytrailrunners.co.uk" }, { title: "Core-team enquiries", url: "https://www.hockleytrailrunners.co.uk/contact" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Hockley", county: "Essex", address: "", postcode: "", location_precision: "unverified" }
  },
  "hogweed-trotters": {
    summary: "Hogweed Trotters runs from Chipping Sodbury, combining Cotswold lanes and trails with coached sessions and a sociable club community.",
    biography: [
      "Hogweed Trotters began in 2000 with a small group of running enthusiasts and grew into a club drawing members from Chipping Sodbury, Bristol and the surrounding area of England. Its running ranges from preparation for a first short race to half marathons, marathons and off-road challenges, with enjoyment and companionship central to club life.",
      "The current website identifies Chipping Sodbury School as the start and finish for Wednesday evening and Sunday morning sessions. Routes use local byways and country lanes towards the Cotswolds. The club describes a regrouping approach in which runners loop back so that nobody is left behind, helping members of different speeds share an outing.",
      "Prospective members are encouraged to come to a session, meet the group and then register through the club's membership system. Coaching and advice from experienced runners support personal goals, while members also train for events such as the Bristol and Bath half marathons. The Hogweed Trot 10K is part of the club's local running calendar."
    ],
    founded_year: 2000,
    sources: [{ title: "Origins, current meeting place and local running", url: "https://hogweedtrotters.co.uk/" }, { title: "Joining and membership", url: "https://hogweedtrotters.co.uk/joining/" }],
    reviewed_at: "2026-10-15",
    corrections: { address: "Chipping Sodbury School, Chipping Sodbury", postcode: "", address_kind: "training" }
  },
  "holcombe-harriers": {
    summary: "Holcombe Harriers combines fell, trail and road running with multisport activity from Holcombe Brook, near Ramsbottom and Bury.",
    biography: [
      "Holcombe Harriers is a multidiscipline club based around Holcombe Brook, near Ramsbottom and Bury in England. Members take part in fell, trail and road running as well as cycling, mountain biking, duathlon and triathlon. Thursday runs start from the Hare and Hounds, while additional swimming and cycling sessions are arranged informally.",
      "The club asks newcomers to be comfortable running about five miles continuously before joining a training run. Routes and conditions vary between road and fell, and winter outings require suitable visibility equipment and clothing. The general club email is the best place to confirm arrangements before attending; the separate beginner-group phone mentioned on the website is not a Holcombe enquiry number.",
      "Local events include the Holcombe Two Towers Fell Race. Members also created the Andy Haines Memorial Round to remember their late clubmate, who died in November 2024. The approximately thirty-two-mile route connects Holcombe Moor and Scout Moor, passing a memorial cairn and the plaque near Peel Tower, and can be explored in sections rather than only as a single long run."
    ],
    notable_members: [{ name: "Andy Haines", connection: "Late club runner commemorated by a memorial route", detail: "The club's memorial-round page remembers Haines, who died in November 2024, and explains the route created by fellow members." }],
    sources: [{ title: "Disciplines, training and joining guidance", url: "https://holcombeharriers.com/about/" }, { title: "Andy Haines Memorial Round", url: "https://holcombeharriers.com/andy-haines-memorial-round/" }, { title: "Club race and current base", url: "https://holcombeharriers.com/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Holcombe Brook", address: "Hare and Hounds, 400 Bolton Road West, Holcombe Brook, Bury", postcode: "BL0 9RY", address_kind: "training" }
  },
  "holgate-harriers": {
    summary: "Holgate Harriers is a community running club in York, with social groups, coached sessions and a local identity inspired by Holgate Windmill.",
    biography: [
      "Holgate Harriers is based in the Holgate area of York, England, and became affiliated to England Athletics in April 2025. Its kit takes inspiration from the neighbourhood's five-sailed windmill, which also provides a memorable landmark for hill efforts. The affiliation date is a milestone, rather than evidence of when the first informal group began.",
      "Thursday social runs meet at York RI Rugby Club on New Lane, with groups offering different distances and paces. New runners can try the club before choosing full or social membership. The programme also includes structured coaching, monthly trail outings and a chosen parkrun followed by time together over breakfast or coffee.",
      "In 2026 the club joined the York and District Road Race League, giving eligible members access to its series of local ten-kilometre races. More than twenty people joined the January 2026 Couch to 5K programme. Anyone interested in a future beginner course should enquire directly, since a possible later course is not the same as a confirmed booking opportunity."
    ],
    sources: [{ title: "Affiliation milestone and local identity", url: "https://holgateharriers.co.uk/about-us/" }, { title: "Current running, beginner courses and league participation", url: "https://www.holgateharriers.co.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { address_kind: "training" }
  },
  "holland-sports-ac": {
    summary: "Holland Sports Athletics Club offers junior and senior track and field, endurance running and cross-country from Hurst Green in Oxted, Surrey.",
    biography: [
      "Holland Sports Athletics Club was formally established in 1982 in Hurst Green, Oxted, Surrey, England. It belongs to a wider sports association whose football roots go back to 1929, but that earlier date is not the athletics club's foundation. A floodlit track and clubhouse at Mill Lane support year-round training in a semi-rural setting.",
      "Junior groups introduce running, jumping and throwing, with specialist sprint, jump, throw and endurance pathways as athletes develop. Senior middle- and long-distance runners compete on the track, roads and cross-country. The club describes successive Surrey League promotions into Division One, and its 2026 news celebrates Jack Kavanagh's UK five-kilometre road title.",
      "Former junior international sprinter Marvin Popoola has joined the coaching programme, bringing his experience to younger athletes. Prospective members should submit the club's sign-up form and wait for confirmation of a space or waiting-list place before attending. The volunteer-led organisation aims to develop future coaches as well as athletes, with introductory taster sessions available through the published joining process."
    ],
    founded_year: 1982,
    notable_members: [{ name: "Jack Kavanagh", connection: "Club athlete highlighted in 2026", detail: "Holland Sports reports his 2026 UK 5K Road Championships victory while representing the club." }, { name: "Marvin Popoola", connection: "Sprint coach and former junior international", detail: "The club describes his work with its junior sprint groups and his earlier England and Great Britain representation." }],
    sources: [{ title: "Athletics-club history, coaching, joining and 2026 athlete news", url: "http://www.hollandsportsac.org.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { address_kind: "training", adult_only: false }
  },
  "holme-pierrepont-rc": {
    summary: "Holme Pierrepont Running Club combines Nottingham group running, Bingham track sessions and road and cross-country leagues from its water-sports-centre base.",
    biography: [
      "Holme Pierrepont Running Club is based at the National Water Sports Centre near Nottingham, England. Monday club runs leave from the centre in paced groups, with a steady group adapting to its slowest runner. The club asks participants to be able to run five miles continuously, and a duty runner helps newcomers find a suitable group.",
      "Tuesday track sessions use Toot Hill Sports Centre in Bingham, a separate venue from the main club base. Efforts are timed so that runners of different speeds can work together. Autumn Thursday sessions alternate between Nottingham's Embankment area and the Bridgford hills, with the latest schedule setting out the start point and any social-run alternative.",
      "Members can take part in the Summer League and North Midlands and East Midlands cross-country leagues, alongside internal events such as the Lake Handicap and Cliffs Handicap. The monthly Running Free newsletter keeps the community informed. New runners may try the club for a few weeks before applying through the linked England Athletics membership form."
    ],
    sources: [{ title: "Training venues and joining threshold", url: "http://www.hprcrun.co.uk/" }, { title: "Membership, leagues and club events", url: "https://www.hprcrun.co.uk/membership" }],
    reviewed_at: "2026-10-15",
    location_note: "The National Water Sports Centre is the Monday base; Bingham track and Thursday meeting places are separate venues.",
    corrections: { address_kind: "training" }
  },
  "instinctive-sports": {
    summary: "Plympton Instinctive Sports is a Plymouth running and walking club founded in 1984, with a social programme and a history of supporting local charities.",
    biography: [
      "Instinctive Sports, also known as Plympton Instinctive Sports, began in 1984 when a group interested in keeping fit started meeting informally in Plymouth, Devon, England. Enjoyment, participation and encouraging people into running shaped the club from the outset. Its membership includes runners with varied experience, alongside a walking section.",
      "Tuesday club nights meet at the sixth-form centre at Hele's School on Seymour Road in Plympton. Longer Sunday outings use different starts around Plymouth and Dartmoor, with additional Thursday runs arranged locally. New members, from beginners to experienced runners, can use the club's enquiry form to discuss which activity suits them.",
      "Members enter events from ten kilometres to ultramarathons, while an active social calendar helps build friendships away from race day. The club has supported causes including Guide Dogs and St Luke's Hospice. Its organising history includes the Guy Fawkes ten-mile run, Sam Penny Scenic Challenge and Plym Valley Challenge; these are historical events, not a claim that registration remains open today."
    ],
    founded_year: 1984,
    sources: [{ title: "Origins, activities, charity support and former races", url: "https://instinctivesports.co.uk/" }, { title: "Club enquiry form", url: "https://instinctivesports.co.uk/contact-us/" }],
    reviewed_at: "2026-10-15",
    corrections: { address: "Sixth Form Centre, Hele's School, Seymour Road, Plympton, Plymouth", address_kind: "training", socials: [{ platform: "Facebook", url: "https://www.facebook.com/pages/Instinctive-Sports/183400842822", source_url: "https://instinctivesports.co.uk/", checked_at: "2026-10-15" }, { platform: "Instagram", url: "https://www.instagram.com/plymptoninstinctivesports/", source_url: "https://instinctivesports.co.uk/", checked_at: "2026-10-15" }] }
  },
  "honiton-rc": {
    summary: "Honiton Running Club explores East Devon roads and trails, with coached sessions, junior athletics and events including the Honiton Hippo and Blackdown Beast.",
    biography: [
      "Honiton Running Club is based in Honiton, East Devon, England, where town routes, country lanes and footpaths provide varied running through the seasons. Members join for fitness, wellbeing and company as well as racing. The club's event programme includes the Honiton Hippo, Blackdown Beast, Blackdown Beauty and Ottery 10K.",
      "Monday club nights emphasise shared running, while Wednesday sessions include coached work and a monthly five-kilometre handicap. Friday morning social runs offer another option, and members arrange weekend outings and preparation for longer races. Starts change with the weekly programme, so the current calendar should be checked rather than treating one meeting place as permanent.",
      "New adult runners are asked to be able to cover three miles or five kilometres at their own pace before joining ordinary club runs. Those not yet at that point can contact the committee for advice. A separate junior club meets at Honiton Community College, with its own enquiry route. Prospective members can try a club night and use the online joining or secretary contact form."
    ],
    sources: [{ title: "Club programme and entry guidance", url: "https://honitonrc.com/about/" }, { title: "Current calendar and organised events", url: "http://www.honitonrc.com/" }, { title: "Secretary enquiry form", url: "https://honitonrc.com/contact-secretary-and-lead-welfare-officer/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Honiton", county: "Devon", adult_only: false }
  },
  "hook-norton-harriers": {
    summary: "Hook Norton Harriers combines Oxfordshire village running, Cotswold routes and local races, with a Tuesday base at Hook Norton Sports and Social Club.",
    biography: [
      "Hook Norton Harriers brings runners together in Hook Norton, Oxfordshire, England, with members also travelling from neighbouring counties. The club grew from a small group who wanted to run together and organise events. Its own races include the Hooky 6 and Christmas Canter, alongside a programme of club competition and social gatherings.",
      "Tuesday evening sessions meet at Hook Norton Sports and Social Club on The Bourne. Winter running is mainly on roads, with optional structured training; lighter evenings open up field paths and routes through the Cotswold countryside. Groups accommodate different abilities, with the club emphasising that runners should not be left behind.",
      "Members may enter the Mota-vation series, Oxfordshire cross-country fixtures and an internal championship, but racing is optional. Nearby Banbury and Chipping Norton School parkruns are also part of club life. Newcomers can come to a Tuesday run or contact the membership secretary first. General enquiries and questions about the club's own races have separate published role addresses."
    ],
    sources: [{ title: "Club activities and training", url: "https://www.hooknortonharriers.org.uk/about-us/" }, { title: "Club races", url: "http://hooknortonharriers.org.uk/" }, { title: "Role contacts and base", url: "https://www.hooknortonharriers.org.uk/contact/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Hook Norton", address_kind: "training" }
  },
  "hook-runners": {
    summary: "Hook Runners is a Hampshire community running club founded in 2016, offering coached groups, an Absolute Beginners Club and local trail outings.",
    biography: [
      "Hook Runners was founded in October 2016 in Hook, Hampshire, England. Its community combines experienced competitors with people taking their first steps into running. Members train together, support each other at races and contribute locally through charity fundraising, litter picking and helping at community events.",
      "The main training sessions start by Hook Community Centre, with coached activity on Tuesday mornings and Wednesday and Thursday evenings. Social runs add further opportunities during the week, including outings on Hampshire trails. Newcomers can contact the club to arrange a trial and should check the latest session details before attending.",
      "Since 2017 the Absolute Beginners Club has offered a ten-week introduction to running, building towards five kilometres without requiring a particular finishing time. Two coached sessions and an independent weekend run lead towards a graduation parkrun. Established members can enjoy a monthly handicap, club championship and local cross-country events, while the club's social side helps new runners remain involved after their first course."
    ],
    founded_year: 2016,
    sources: [{ title: "Origins, community activity, training and beginner programme", url: "https://www.hookrunners.com" }],
    reviewed_at: "2026-10-15",
    corrections: { address: "Hook Community Centre, Hook", postcode: "RG27 9NN", address_kind: "training" }
  },
  "horley-harriers-running-club": {
    summary: "Horley Harriers offers coached running in Horley, Surrey, with endurance sessions, intervals and track visits to K2 in Crawley.",
    biography: [
      "Horley Harriers Running Club serves Horley, Surrey, England, and became affiliated to England Athletics in 2016. It welcomes social runners as well as members pursuing particular race distances or times. Coaches and run leaders support the programme, and prospective members can arrange free trial sessions before deciding whether to join.",
      "Tuesday and Thursday training uses different locations around Horley. Sessions include steady running, tempo work and intervals, allowing runners to choose an effort appropriate to their experience and goals. The club publishes a monthly schedule, with further meeting details shared through its members' Facebook group.",
      "The October 2026 programme includes K2 track nights in Crawley and a winter time trial as well as Horley endurance sessions. These track visits are distinct from the club's local meeting points. Contact the club's general email for trial arrangements and current guidance; an older single street address does not describe all of its training venues."
    ],
    sources: [{ title: "Affiliation milestone and coached running", url: "https://www.horleyharriers.co.uk/about-us" }, { title: "October 2026 training schedule", url: "https://www.horleyharriers.co.uk/training-schedule" }, { title: "Free trials and public contact", url: "https://www.horleyharriers.co.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { address: "", postcode: "", location_precision: "unverified" }
  },
  "horsforth-fellandale-club": {
    summary: "Horsforth Fellandale is a fell-running club near Leeds and Otley Chevin, with outdoor roots dating to 1980 and a history of championship success.",
    biography: [
      "Horsforth Fellandale Club held its inaugural meeting on 17 January 1980 in Horsforth, Leeds, England. It grew from members of the 9th Airedale Venture Scout Unit who wanted to continue their outdoor activities together. Mountaineering, walking and camping gradually gave way to a stronger emphasis on fell and off-road running.",
      "The club's history records women's English team titles in 1993 and 1994 and a British team title in 1994. Andrea Priestly and Brian Hilton are remembered for gaining England international honours. Members also helped organise major fell events, while the club's Danefield Relay on Otley Chevin remains an important local fixture.",
      "Wednesday training usually uses Otley Chevin in summer, with winter road or headtorch outings from different locations. Adults can try four sessions before joining. Junior membership is available to children of existing members, but the club explicitly does not provide junior training sessions. The training coordinator or secretary can advise on the latest start point, terrain and suitable group."
    ],
    founded_year: 1980,
    notable_members: [{ name: "Andrea Priestly", connection: "Historical England international", detail: "The club's history records her England international honours during its development as a fell-running club." }, { name: "Brian Hilton", connection: "Historical England international", detail: "Horsforth Fellandale's history identifies Hilton among members who gained England international honours." }],
    sources: [{ title: "Club origins and historical honours", url: "https://www.fellandale.com/history" }, { title: "Current membership, junior limitation and training", url: "https://www.fellandale.com/contactjoinus" }, { title: "Current club activity and Danefield Relay", url: "http://www.fellandale.com/" }],
    reviewed_at: "2026-10-15",
    location_note: "Training starts vary between Otley Chevin, Horsforth and other locations. The club offers junior membership but no junior training programme.",
    corrections: { address: "", postcode: "", location_precision: "unverified", adult_only: false }
  },
  "horsforth-harriers": {
    summary: "Horsforth Harriers is a Leeds running club founded in 1985, with road, trail and cross-country activity and the annual Apperley Bridge Canter.",
    biography: [
      "Horsforth Harriers began in 1985 after friends Gordon Little and John Holmes decided to look for other local runners. A newspaper advertisement brought together the first small group in Horsforth, Leeds, England. The club remembers the late Gordon Little as a founder and former president whose outlook combined running with an equally important social life.",
      "Road running remains central, with members taking part in distances from five kilometres to marathons and ultras. Cross-country, fell and trail races offer further variety, but competition is optional. The club welcomes adults with different levels of experience and organises the annual Apperley Bridge Canter.",
      "Horsforth Brewery on New Road Side is the current Tuesday meeting point, replacing an older directory address that should not be used for training. Thursday arrangements are published through the club's Harrier Hub and may use another location. Prospective members can use the general email or contact form to ask about joining, session suitability and the club's Couch to 5K provision."
    ],
    founded_year: 1985,
    notable_members: [{ name: "Gordon Little", connection: "Late founder and former president", detail: "The club's history credits Little with helping establish Horsforth Harriers in 1985 and recalls his later presidency." }, { name: "John Holmes", connection: "Founding organiser", detail: "Horsforth Harriers' history describes Holmes and Gordon Little placing the advertisement that brought its first runners together." }],
    sources: [{ title: "Founders, history and disciplines", url: "https://www.horsforthharriers.co.uk/about" }, { title: "Current meeting point and enquiries", url: "https://www.horsforthharriers.co.uk/contact" }, { title: "Club race and adult participation", url: "http://horsforthharriers.co.uk/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Horsforth", address: "Horsforth Brewery, 143 New Road Side, Horsforth, Leeds", postcode: "LS18 4QD", address_kind: "training" }
  },
  "athletics-ireland-boyle-a-c": {
    summary: "Boyle Athletic Club serves Boyle and surrounding County Roscommon, with an inclusive senior athletics programme and a local five-kilometre road race.",
    biography: [
      "Boyle Athletic Club was formed in 2018 in Boyle, County Roscommon, Ireland. Its founding statement described a response to growing local interest in athletics and the appointment of a working committee. The current Athletics Ireland listing emphasises an inclusive environment where members of different abilities can work towards their own best performance.",
      "Athletics Ireland identifies Abbey Park in Abbeytown as the training location and currently categorises Boyle AC as a senior-only club. Joining and renewal links are available through that directory. The formation statement's wider ambitions do not establish a present junior programme, and a current timetable or direct club enquiry address still needs confirmation.",
      "The club's 2026 five-kilometre road-race announcement described a route from Boyle Abbey alongside Boyle Canal and support for the Jack and Jill Foundation. That dated event illustrates the club's contribution to local running and charity fundraising; it is not a current race-registration invitation."
    ],
    founded_year: 2018,
    sources: [{ title: "Current club description and training location", url: "https://membership.athleticsireland.ie/clubpage/Boyle_A.C." }, { title: "Club formation statement, 1 July 2018", url: "https://www.boyletoday.com/boyle-athletic-club-formed/" }, { title: "Club's 2026 road-race announcement", url: "https://www.boyletoday.com/date-announced-for-this-years-boyle-ac-5k-road-race/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Boyle", county: "Roscommon", adult_only: true, socials: [] }
  },
  "welsh-athletics-trg-runners": {
    summary: "TRG Runners is a Caerphilly running club based at Team Rees Gym, with Welsh Athletics listing road, track, cross-country, trail and mountain disciplines.",
    biography: [
      "TRG Runners is based in Caerphilly, Wales, at Team Rees Gym in Trecenydd Business Park. Welsh Athletics places the club in its South Wales region and lists a broad range of disciplines: road running, track and field, cross-country, trail and fell or mountain running. The club's colours are orange and white.",
      "The governing-body directory gives Sunday morning as the training slot and identifies the gym as the meeting venue. Runners should contact the club before attending to confirm the current session, starting point and suitability. The gym's own fitness classes and commercial membership offers are separate services and should not be assumed to form part of running-club membership.",
      "Richard Rees is the listed main club contact, with separate welfare officers also published by Welsh Athletics. The club's Instagram channel provides another way to follow its activity. For joining questions, use the running-club contact rather than assuming that a general gym subscription includes club registration."
    ],
    sources: [{ title: "Welsh Athletics club disciplines, venue and contacts", url: "https://www.welshathletics.org/en/club/view/trg-runners" }, { title: "Venue address and separate gym services", url: "https://www.teamreesgym.com/" }],
    reviewed_at: "2026-10-15"
  },
  "welsh-athletics-welshpool-athletics-club": {
    summary: "Welshpool Athletics Club develops local track-and-field and cross-country participation, with seasonal venues and a community connection to Adele Nicoll.",
    biography: [
      "Welshpool Athletics Club provides track-and-field and cross-country activity in Welshpool, Powys, Wales. In a June 2024 launch announcement, Adele Nicoll described the work behind establishing regular sessions after earlier holiday camps under her academy's name. The announcement distinguished younger children's academy activity from registered club participation, rather than treating them as one identical programme.",
      "The current Welsh Athletics directory lists Tuesday evening training, using Welshpool High School on Salop Road in summer and the Freedom Leisure Centre's astro-turf area in winter. These are seasonal training venues, not a single year-round clubhouse. Parents and prospective athletes should confirm the age group, available places and current arrangements through the club's membership email.",
      "Nicoll is listed as membership secretary, while her Welsh Athletics athlete biography identifies her competitive club as Birchfield Harriers. Her involvement in developing Welshpool's community club should therefore not be confused with a claim that she currently competes for it. The directory also names separate welfare officers and links to the club's academy-branded Facebook page."
    ],
    notable_members: [{ name: "Adele Nicoll", connection: "Club development and membership secretary", detail: "Her 2024 launch statement describes establishing local sessions, and Welsh Athletics lists her as membership secretary. Its athlete biography separately lists Birchfield Harriers as her competitive club." }],
    sources: [{ title: "Current disciplines, seasonal venues and membership role", url: "https://www.welshathletics.org/en/club/view/welshpool" }, { title: "Adele Nicoll's club-launch statement, 6 June 2024", url: "https://mywelshpool.co.uk/viewersport/articleId/25900/Adele-launches-Welshpool-Athletics-Club" }, { title: "Welsh Athletics athlete biography and competitive club", url: "https://www.welshathletics.org/en/page/adele-nicoll-shot-put" }],
    reviewed_at: "2026-10-15"
  }
};
