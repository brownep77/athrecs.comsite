import type { ClubProfile } from "./club-profiles";

// Primary sources opened on 14 October 2026. Editorial associations only.
export const regionalHeritageAndParticipationProfiles: Record<string, ClubProfile> = {
  "banbury-harriers-ac": {
    summary: "Banbury Harriers provides track and field, cross-country, road running and sportshall athletics in north Oxfordshire.",
    biography: [
      "Banbury Harriers Athletics Club offers training and competition in Banbury, Oxfordshire, England, for athletes from the age of eight. Its programme spans track and field, cross-country, road running and sportshall, giving young athletes opportunities to try different events rather than concentrate on distance running alone.",
      "The club is based at the athletics track at North Oxfordshire Academy. Cherwell District Council identifies the eight-lane floodlit track as the Harriers’ home; the wider sports site is shared with other users. The club’s own community fundraising statement describes investment in equipment and specialist training, supported by volunteer coaches.",
      "The Banbury 5 road race is another part of its local athletics activity, with the club publishing the 2026 race and results link on its website. Prospective members should consult the club directly about suitable groups and the current timetable: older seasonal fixture lists are not a promise that a particular session is running this week."
    ],
    sources: [
      { title: "Club disciplines and Banbury 5", url: "https://banburyharriers.org/" },
      { title: "Track operator’s club and facility information", url: "https://www.cherwell.gov.uk/info/3/leisure-and-wellbeing/759/north-oxfordshire-academy---sports-facilities-hire" },
      { title: "Club community fundraising statement", url: "https://www.cherwelllottery.co.uk/support/banbury-harriers-athletics-club" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { address: "North Oxfordshire Academy athletics track, Banbury", postcode: "", address_kind: "training" }
  },
  "bedford-and-county-ac": {
    summary: "Bedford & County AC offers junior development and specialist athletics at Bedford International Athletics Stadium.",
    biography: [
      "Bedford & County Athletic Club traces its roots to the Bedford County Cycling and Athletic Club formed in 1885. Its history records an interruption around the First World War and a restart in 1936 without the cycling section. The club later moved to Barkers Lane, where Bedford International Athletics Stadium remains its home in Bedford, England.",
      "Track and field, distance running, road racing and cross-country sit alongside a structured introduction for children. Beagles and Beagles Plus develop younger athletes’ skills before older school-age athletes move towards specialist groups. The stadium’s development has been part of that story, including a synthetic track in 1989 and a Mondo surface in 2010.",
      "New members should contact the club before attending, giving their school year and the events that interest them. Places depend on coaching capacity and waiting lists. Trial arrangements differ between the younger Beagles groups and older athletes, so families should use the relevant joining route rather than assume every session is open to walk-ins."
    ],
    sources: [
      { title: "Club history", url: "https://www.bedfordandcountyac.org.uk/index.php/about-us/history" },
      { title: "About the club and stadium", url: "https://www.bedfordandcountyac.org.uk/index.php/about-us" },
      { title: "New members", url: "https://www.bedfordandcountyac.org.uk/index.php/membership/new-members" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "Barkers Lane is the stadium training base. The 1885 origins precede a wartime interruption and the club’s 1936 restart.",
    corrections: { address: "Bedford International Athletics Stadium, Barkers Lane, Bedford", postcode: "MK41 9SB", address_kind: "training" }
  },
  "bedford-harriers-ac": {
    summary: "Bedford Harriers combines group running, cross-country and multisport with a programme of locally organised races.",
    biography: [
      "Bedford Harriers Athletic Club began in 1985, when a small group came together to organise the Bedford Marathon. The Bedford, England, club developed beyond that original race into a community for road runners, cross-country competitors and multisport athletes.",
      "Bedford International Athletics Stadium on Barkers Lane is its regular base. Monday and Wednesday evening running groups offer different paces, while Friday activities include track work and circuit training. The club also takes part in the Three Counties Cross Country League, providing a team setting for winter running away from the roads.",
      "Organising events remains central to its life. The Doug Anderson 5K, Oakley 20 and Bedford Triathlon are among the events described by the club. Members’ marshalling and other volunteer work help support coaching and equipment. New runners can contact the general enquiry team to discuss an appropriate group and check the current joining and session arrangements."
    ],
    founded_year: 1985,
    sources: [{ title: "Club origins, training and events", url: "https://www.bedfordharriers.co.uk/the_club.asp" }],
    reviewed_at: "2026-10-14",
    corrections: { address: "Bedford International Athletics Stadium, Barkers Lane, Bedford", postcode: "MK41 9SB", address_kind: "training", sports: ["Running", "Triathlon", "Cycling", "Swimming"] }
  },
  "bicester-ac": {
    summary: "Bicester Athletic Club develops young athletes through track and field, cross-country and winter sportshall sessions.",
    biography: [
      "Bicester Athletic Club was established in 1982 in Bicester, Oxfordshire, England. It offers young athletes an introduction to track and field and cross-country, with children normally able to start from age eight. Volunteers underpin its coaching and club activities.",
      "Training changes with the seasons. Summer sessions use The Bicester School’s grass track and jumping and throwing facilities. The published winter programme includes sportshall at Bicester Leisure Centre, circuits for older athletes and conditioning at several local venues. The club uses session invitations to keep members informed about the right place and group.",
      "Families should submit a membership enquiry before coming along. Capacity limits apply, and new starters are offered a four-session trial once arrangements have been agreed. Adult membership is different: the club’s membership information explains that adults train independently rather than joining an adult coaching programme. The school is an important summer base, not the location of every winter or weekend session."
    ],
    founded_year: 1982,
    sources: [
      { title: "Club introduction", url: "https://www.bicesterac.co.uk/" },
      { title: "Membership arrangements", url: "https://www.bicesterac.co.uk/bac-club-information/membership/" },
      { title: "Seasonal training programme", url: "https://www.bicesterac.co.uk/bac-club-information/training/" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "Summer athletics uses The Bicester School. Winter and conditioning sessions use the leisure centre and other venues; follow the club invitation.",
    corrections: { address: "", postcode: "" }
  },
  "boston-and-district-ac": {
    summary: "Boston & District AC provides athletics in Lincolnshire, with track and field, cross-country, road running and sportshall activities.",
    biography: [
      "Boston & District Athletic Club was formed on 31 March 2000 in Boston, Lincolnshire, England. Its activities include track and field, cross-country, road running and sportshall athletics. The club describes an inclusive approach across ages and abilities, including athletes with disabilities.",
      "The Princess Royal Sports Arena is identified in its current training information. Its contact page also names the B-Hive on Punchbowl Lane as the clubhouse, so these two locations should not be treated as interchangeable. Members and visitors need to check which venue applies to a particular activity.",
      "The club is a registered charity, and its website brings together training information, competition material and club contacts. Prospective athletes and families can use the general enquiry email to ask about coaching groups, available places and how to join. Asking first is especially useful when choosing between track, endurance and younger athletes’ activities, rather than assuming a single session suits everyone."
    ],
    founded_year: 2000,
    sources: [
      { title: "Club origins and training information", url: "http://www.bostonanddistrictac.com/" },
      { title: "Club contacts and clubhouse", url: "http://bostonanddistrictac.com/bdac/contactus.html" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "The Princess Royal Sports Arena is a training venue. The B-Hive on Punchbowl Lane is separately described as the clubhouse; check the session location.",
    corrections: { address: "Princess Royal Sports Arena, Boston", postcode: "PE21 7PB", address_kind: "training" }
  },
  "bourne-town-harriers": {
    summary: "Bourne Town Harriers offers adult running and junior athletics, with seasonal sessions around Bourne in Lincolnshire.",
    biography: [
      "Bourne Town Harriers brings together adult runners and young athletes in Bourne, Lincolnshire, England. Its activities span road running, cross-country and junior athletics, with the club describing itself as an original member of the Frostbite Friendly League.",
      "Senior Tuesday runs change meeting point with the season: the leisure-centre car park is used in autumn and winter, while summer outings start from the Beech Avenue green and head towards Bourne Woods. Junior training normally takes place on term-time Fridays at Bourne Grammar School, using its hall and pitches in winter and grass track in summer.",
      "The junior section normally covers ages nine to sixteen, and a waiting list may apply. Some juniors can join Tuesday endurance work by invitation, rather than through unrestricted access to adult sessions. Separate junior and general contact forms help newcomers reach the right organiser. Membership information also explains opportunities to take part in the Frostbite and Lincolnshire cross-country leagues."
    ],
    sources: [
      { title: "Club introduction", url: "https://bournetownharriers.org/" },
      { title: "Adult and junior training", url: "https://bournetownharriers.org/training/" },
      { title: "Joining", url: "https://bournetownharriers.org/join-us/" },
      { title: "Separate enquiry forms", url: "https://bournetownharriers.org/contact-us/" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "Senior meeting points vary by season. Bourne Grammar School is the junior training venue, not the start of all club runs.",
    corrections: { address: "", postcode: "" }
  },
  "bracknell-ac": {
    summary: "Bracknell Athletic Club offers junior development and specialist track and field at the John Nike Athletics Stadium.",
    biography: [
      "Bracknell Athletic Club is a volunteer-run athletics club based at the John Nike Athletics Stadium beside Bracknell Leisure Centre in Berkshire, England. Its programme includes outdoor track and field, indoor athletics and cross-country, with opportunities from introductory children’s sessions through to senior competition.",
      "Children in school years four to six learn fundamental movement and athletics skills through the Young Athlete programme and in-house Quad Kids challenges. From year seven, athletes progress through a multi-event approach towards groups such as sprints, hurdles, jumps, throws and middle distance. Regular competition for the club is part of its membership expectations.",
      "At the October 2026 review, the club advertised waiting lists across its age groups. Prospective members should use the waiting-list and enquiry routes before attending. Training is listed on Tuesdays, Thursdays and Saturdays, subject to competition arrangements. The club also welcomes people interested in coaching, officiating and other volunteer roles, with training available for newcomers to those tasks."
    ],
    sources: [{ title: "Club programme, waiting lists and volunteering", url: "https://www.bracknellac.com/" }],
    reviewed_at: "2026-10-14",
    contact_note: "Waiting lists were advertised across age groups on 14 October 2026. Contact the club before attending.",
    corrections: { address: "John Nike Athletics Stadium, Bracknell Leisure Centre, Bracknell", postcode: "", address_kind: "training" }
  },
  "bracknell-forest-runners": {
    summary: "Bracknell Forest Runners combines social runs, coached track sessions and forest outings for adult runners in Berkshire.",
    biography: [
      "Bracknell Forest Runners was founded in 1989 in Bracknell, Berkshire, England. Its adult running community takes part in road races, trails, cross-country and longer-distance events, with enjoyment and companionship at the centre of the club’s stated purpose.",
      "The weekly programme uses different locations: Monday club runs meet at South Hill Park, Wednesday speed sessions use Bracknell’s athletics track, and Sunday outings start at The Lookout for a forest run. Track sessions are coached, while the club runs provide several pace groups. Newcomers can try up to three Wednesday sessions before committing to membership.",
      "Club championships cover several road-racing distances, and the Thames Valley Cross Country League provides winter team competition. Members also volunteer at events, including the London Marathon. Membership is open to adults aged eighteen and over; the membership team can explain the available options and help a new runner choose a suitable first session."
    ],
    founded_year: 1989,
    sources: [
      { title: "Club history, constitution and sessions", url: "https://bracknell-forestrunners.org/" },
      { title: "Official membership portal introduction", url: "https://bfr.clubtrac.co.uk/pages/home" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "South Hill Park, the athletics track and The Lookout serve different sessions. Confirm the meeting point before attending.",
    corrections: { address: "", postcode: "", adult_only: true }
  },
  "bracknell-road-runners": {
    summary: "Bracknell Road Runners offers adult group running, interval work and off-road outings without a single dedicated clubhouse.",
    biography: [
      "Bracknell Road Runners is an adult running club in Bracknell, Berkshire, England. Members explore local roads, parks and woodland, including Swinley Forest and Windsor Great Park, and take part in distances ranging from shorter road races to ultras.",
      "Midweek group runs generally last around an hour, with the club describing routes of roughly five to eight miles and groups running at about ten-minute-mile pace or faster. Wednesday interval training caters for a wider range of paces, with track work on alternate weeks. These distinctions help a newcomer choose an appropriate session rather than assume every run has the same entry level.",
      "The club has no dedicated clubhouse. South Hill Park is one meeting point, while the sports-centre track and other locations serve different activities. Adults aged eighteen and over can enquire about trying sessions before joining. Volunteering at parkrun and the London Marathon is also part of the club’s wider running community."
    ],
    sources: [
      { title: "Club running and volunteering", url: "https://bracknellrr.org.uk/" },
      { title: "Joining and session expectations", url: "https://bracknellrr.org.uk/our-club/" },
      { title: "Meeting locations", url: "https://bracknellrr.org.uk/bracknell-map/" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "No dedicated clubhouse. Check the weekly start point; South Hill Park is only one of several meeting locations.",
    corrections: { address: "", postcode: "", adult_only: true }
  },
  "bradford-airedale-ac": {
    summary: "Bradford Airedale AC combines junior athletics and adult running at Horsfall, with roots in nineteenth-century Airedale Harriers.",
    biography: [
      "Bradford Airedale Athletic Club traces its history to Airedale Harriers, formed in 1880. A 1965 merger created Airedale and Spen Valley Athletic Club, and the Bradford Airedale name followed in the 1980s. These are stages in the club’s development, rather than three unrelated clubs sharing the same name.",
      "Horsfall is the club’s base in Bradford, West Yorkshire, England. Its programme includes track and field for young athletes and road and off-road running for adults. Newcomers are encouraged to contact the club about an appropriate training group, and the membership information describes three introductory sessions before joining.",
      "The club’s history records Peter Warden’s international career, including the 1964 Olympic 400 metres hurdles semi-finals and a Commonwealth bronze medal in 1966. That historical association sits alongside a continuing local role: introducing children to athletics and giving adult runners regular company and training. Current group arrangements should be confirmed with the training contact rather than inferred from older fee tables."
    ],
    notable_members: [{ name: "Peter Warden", connection: "Historical athlete association", detail: "The club history records his 1964 Olympic 400 metres hurdles semi-final appearance and 1966 Commonwealth bronze medal." }],
    sources: [
      { title: "Club history", url: "https://www.bradfordairedaleac.org.uk/home/about/" },
      { title: "Club training", url: "https://www.bradfordairedaleac.org.uk/home/clubtraining/" },
      { title: "Membership and introductory sessions", url: "https://www.bradfordairedaleac.org.uk/home/membership/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Bradford", address_kind: "training" }
  },
  "bridlington-road-runners": {
    summary: "Bridlington Road Runners offers coastal community running, junior sessions and a programme of club races in East Yorkshire.",
    biography: [
      "Bridlington Road Runners is based on the East Yorkshire coast in Bridlington, England. Its club programme brings together regular adult training, junior running and internal races, providing both a social setting and opportunities to compete.",
      "The published adult programme centres on Tuesday and Thursday evenings, with runners meeting in the leisure-centre café before steady or structured sessions. Junior sessions use varying venues, so families should confirm the location with the coach. Beginner courses are arranged according to demand; the advertised Wednesday option is not a guarantee that a course is running every week.",
      "The club’s race calendar includes handicap events such as the Stuart Spooner Anniversary Run, Carnaby Canter and Christmas race, alongside other club challenges and league activity. New runners can use the official contact route to ask about a suitable group, beginner opportunities and membership. The leisure-centre meeting point should not be mistaken for the venue of every junior or competition session."
    ],
    sources: [
      { title: "Official club introduction", url: "https://www.bridlingtonroadrunners.co.uk/" },
      { title: "Joining and training", url: "https://www.bridlingtonroadrunners.co.uk/join-us" },
      { title: "Club races and events", url: "https://www.bridlingtonroadrunners.co.uk/races-events" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { website: "https://www.bridlingtonroadrunners.co.uk/", address: "", postcode: "" },
    location_note: "Adult Tuesday and Thursday groups meet at the leisure-centre café. Junior venues vary; confirm with the coach."
  },
  "brighton-and-hove-ac": {
    summary: "Brighton & Hove AC offers track and field, road running and cross-country at Withdean, with a long Sussex athletics heritage.",
    biography: [
      "Brighton & Hove Athletic Club took its present form in 1966 through the merger of Brighton and Hove clubs. Its predecessor history reaches back to Brighton County Harriers in 1894 and includes Sussex Walking and Athletic Club. Withdean became an athletics home before the merger and remains the club’s base in Brighton and Hove, England.",
      "Track and field, road running and cross-country connect its junior development programme with senior competition. The club’s Olympic roll includes Steve Ovett and Amber Anning, whose two Paris 2024 relay bronze medals are recorded alongside her individual 400 metres final. These honours describe documented sporting associations, not a claim about present membership.",
      "New athletes normally start from age nine and should arrange contact with a coach before joining through the club’s membership system. At review in October 2026, admission for the youngest group, school year six and below, was closed. Families should check capacity rather than turn up unannounced. The club also describes a confidential support fund for members who need financial help."
    ],
    founded_year: 1966,
    notable_members: [
      { name: "Steve Ovett", connection: "Historical athlete association", detail: "Listed on the club’s Olympic roll, including his 1980 Olympic 800 metres gold and 1,500 metres bronze." },
      { name: "Amber Anning", connection: "Olympic roll of honour", detail: "The club records her two relay bronze medals and individual 400 metres final at Paris 2024." }
    ],
    sources: [
      { title: "Club history by Reg Hook", url: "https://brightonandhoveac.com/about/history/" },
      { title: "New-member arrangements", url: "https://brightonandhoveac.com/training/new-members/" },
      { title: "Olympic athletes", url: "https://brightonandhoveac.com/honours/olympic-athletes/" }
    ],
    reviewed_at: "2026-10-14",
    contact_note: "The youngest group, school year six and below, was closed to new members at the 14 October 2026 review. Ask about current capacity.",
    corrections: { address_kind: "training" }
  },
  "brighton-and-hove-frontrunners": {
    summary: "Brighton & Hove Front Runners is a local LGBTQ+ and allies running club with seafront sessions and social activities.",
    biography: [
      "Brighton & Hove Front Runners began in October 2018 after local interest grew through a Facebook group. Based in Brighton and Hove, England, it welcomes LGBTQ+ runners and allies and belongs to the wider international Front Runners network. It is a local club, rather than a worldwide virtual membership organisation.",
      "Wednesday evening sessions meet on the green beside the King Alfred Leisure Centre car park in Hove. The programme includes intervals and timed out-and-back runs, allowing runners to return together, while Sunday outings use different locations. Social gatherings and parkrun participation are part of the club community.",
      "The club has also organised Couch to 5K programmes, but these are distinct from its regular runs, whose published guidance assumes an existing running base. Prospective members should ask which session or beginner programme suits them. General and membership enquiry addresses are available, and the weekly arrangements should be checked before travelling to a Sunday meeting point."
    ],
    founded_year: 2018,
    sources: [
      { title: "Club origins, ethos and running programme", url: "https://www.bhfrontrunners.org.uk/about" },
      { title: "Club enquiries", url: "https://www.bhfrontrunners.org.uk/contact" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "Wednesday sessions meet on the green beside the King Alfred Leisure Centre car park. Sunday venues vary.",
    corrections: { city: "Brighton and Hove", address: "Green beside King Alfred Leisure Centre car park, Hove", postcode: "", address_kind: "training" }
  },
  "brighton-phoenix": {
    summary: "Brighton Phoenix combines athletics and triathlon, with Withdean track training and a wider multisport programme.",
    biography: [
      "Brighton Phoenix was founded in 1981 by Matt Paterson and Steve Ovett. The Brighton, England, club expanded into triathlon during the 1990s and adopted the Brighton Phoenix name in 2012. Ovett’s Olympic success preceded the club’s formation, so those achievements should not be presented as Phoenix victories.",
      "Withdean Stadium hosts Wednesday athletics training for juniors and seniors. The wider programme includes endurance sessions, strength work, cycling-related training and swimming at Roedean. This gives members a choice between a running focus and the combined demands of swim, bike and run.",
      "Prospective members should use the appropriate junior or senior joining route and arrange taster sessions first. At the October 2026 review, places for younger juniors were limited, with older junior enquiries considered individually. The club’s pages differ about taster charges, so newcomers should confirm any payment directly. Withdean is a training base, not the location of every swimming, cycling or endurance activity."
    ],
    founded_year: 1981,
    notable_members: [
      { name: "Matt Paterson", connection: "Co-founder", detail: "Named with Steve Ovett in the club’s account of its 1981 foundation." },
      { name: "Steve Ovett", connection: "Co-founder", detail: "Helped establish Phoenix in 1981, after his 1980 Olympic success." }
    ],
    sources: [
      { title: "Club history", url: "https://brightonphoenix.org.uk/about/club-history/" },
      { title: "Training programme", url: "https://brightonphoenix.org.uk/training/" },
      { title: "Junior and senior enquiries", url: "https://brightonphoenix.org.uk/contact/" },
      { title: "Joining and tasters", url: "https://brightonphoenix.org.uk/membership/join/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Brighton", address: "Withdean Stadium, Brighton", postcode: "", address_kind: "training", sports: ["Running", "Athletics", "Triathlon", "Cycling", "Swimming"] },
    location_note: "Withdean is the athletics training base; swimming and other multisport sessions use separate venues."
  },
  "welsh-athletics-barry-and-vale-harriers": {
    summary: "Barry & Vale Harriers provides track and field, cross-country and road running from Jenner Park in the Vale of Glamorgan.",
    biography: [
      "Barry & Vale Harriers is an athletics club based at Jenner Park in Barry, Wales. Welsh Athletics lists track and field, cross-country and road running among its disciplines, connecting stadium athletics with running beyond the track.",
      "The governing body’s historical timeline records a change from Barry Harriers to Barry & Vale Harriers in 1979. That is a naming milestone, not evidence that the club was first founded that year. Jenner Park is independently identified by Welsh Athletics as the club’s home, with the stadium serving as a sporting venue rather than a private correspondence address.",
      "The current club directory lists a Wednesday evening training session and a main enquiry contact, together with the club’s Facebook group. Prospective athletes and families should use those routes to confirm suitable age groups, coaching availability and how to join. Published venue postcodes differ between sources, so visitors should confirm the entrance and meeting arrangements before travelling."
    ],
    sources: [
      { title: "Welsh Athletics club directory", url: "https://www.welshathletics.org/en/club/view/barry-vale-harriers" },
      { title: "Jenner Park facility listing", url: "https://www.welshathletics.org/en/facility/view/jenner-park" },
      { title: "Welsh Athletics historical milestones, 1979", url: "https://www.welshathletics.org/image/WA%20Timeline/WA%20Milestones%20230321pdf.pdf" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Barry", address: "Jenner Park, Barry Road, Barry", postcode: "", address_kind: "training" }
  },
  "welsh-athletics-cwmbran-harriers": {
    summary: "Cwmbran Harriers offers track and field and cross-country in Torfaen, with a tradition of grassroots athletics service.",
    biography: [
      "Cwmbran Harriers is based at Cwmbran Stadium in Torfaen, Wales, with track and field and cross-country listed by Welsh Athletics. Its history includes an earlier Torfaen AC identity: the governing body’s tribute to Mary Jones describes her continuing as treasurer when Torfaen AC became Cwmbran Harriers.",
      "Jones was a life member, treasurer and membership secretary, as well as an athletics official. Welsh Athletics recognised her service with its Meritorious Award in 2001 and Award of Honour in 2013. Her contribution illustrates the club’s roots in volunteer-led grassroots sport, rather than only its competitive record.",
      "The club has also participated in the Gwent Harriers composite youth team alongside other East Wales clubs, as described by partner club Brecon AC. Families should ask Cwmbran’s current enquiry contact about training groups, places and the season’s competition arrangements; an older league schedule does not establish current selection rules or dates. The stadium is the training base, not a general postal address."
    ],
    notable_members: [{ name: "Mary Jones", connection: "Former life member and club officer", detail: "Welsh Athletics’ 2022 tribute records her service as treasurer and membership secretary and its 2001 and 2013 honours." }],
    sources: [
      { title: "Current club directory", url: "https://www.welshathletics.org/en/club/view/cwmbran-harriers" },
      { title: "Mary Jones tribute, 22 March 2022", url: "https://www.welshathletics.org/en/blog/post/mary-jones-obituary" },
      { title: "Partner club’s youth league information", url: "https://breconac.org.uk/youth-development-league" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Cwmbran", address: "Cwmbran Stadium, Henllys Way, Cwmbran", postcode: "NP44 3YS", address_kind: "training" }
  },
  "welsh-athletics-tri-hard-harriers": {
    summary: "Tri Hard Harriers grew from a Swansea social running group into a club covering road, trail and other running disciplines.",
    biography: [
      "Tri Hard Harriers began in Swansea, Wales, in January 2020, when Michael Roderick and a group of friends established a social running group. In his Run Wales account, Roderick describes its growth during its first year into a Welsh Athletics-affiliated club, with encouragement and friendship central to its character.",
      "The current governing-body directory lists road running, track and field, cross-country, fell and mountain running, and trail running. It gives Thursday evening and Sunday morning training slots, with the Secret Bar & Kitchen on Mumbles Road as the listed meeting venue. That venue is a meeting point, not a claim that the club owns a clubhouse there.",
      "New runners can contact the chairperson or membership secretary to discuss joining and the most suitable session. The founding account celebrates helping people pursue their own goals, but its early membership total is historical rather than a current headcount. Meeting arrangements and session suitability should be confirmed directly before a first visit."
    ],
    founded_year: 2020,
    notable_members: [{ name: "Michael Roderick", connection: "Co-founder", detail: "His Run Wales account describes establishing Tri Hard Harriers with friends in January 2020." }],
    sources: [
      { title: "Founder’s account for Run Wales", url: "https://irun.wales/run-leaders/run-leader-support/run-leader-champions/" },
      { title: "Current club directory", url: "https://www.welshathletics.org/en/club/view/tri-hard-hari" }
    ],
    reviewed_at: "2026-10-14",
    location_note: "The Secret Bar & Kitchen is the directory’s meeting venue; confirm the current session start point with the club.",
    corrections: { city: "Swansea", address: "The Secret Bar & Kitchen, Mumbles Road, Brynmill, Swansea", postcode: "SA2 0AY", address_kind: "training" }
  },
  "tullamore-triathlon-club": {
    summary: "Tullamore Triathlon Club provides an adult swim, bike and run community in County Offaly, Ireland.",
    biography: [
      "Tullamore Triathlon Club is based in Tullamore, County Offaly, Ireland. Triathlon Ireland lists it as a club without a junior section, making it an adult route into the combined disciplines of swimming, cycling and running.",
      "A February 2020 Triathlon Ireland interview with member Máire-Tríona Keane gives a glimpse of its community life. As a Beyond the Finish Line advocate, she described the support and companionship of club training, including organised sessions and less formal opportunities to train together. This is a documented historical account, not a current timetable or a claim that she still holds that role.",
      "The national governing body publishes a direct club enquiry email. Prospective members should use it to ask about present training venues, suitable sessions and joining arrangements, particularly if new to one of triathlon’s three sports. No single pool, cycling start or running venue is confirmed here, and the club’s older website should not be relied on for current session details."
    ],
    notable_members: [{ name: "Máire-Tríona Keane", connection: "Member and advocate documented in 2020", detail: "Featured by Triathlon Ireland in February 2020 as a Tullamore member and Beyond the Finish Line advocate; no present role is inferred." }],
    sources: [
      { title: "Triathlon Ireland club directory", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" },
      { title: "Meet the Advocate: Máire-Tríona Keane, 17 February 2020", url: "https://www.triathlonireland.com/news/2020/meet-the-advocate-maire-triona-keane/" }
    ],
    reviewed_at: "2026-10-14",
    corrections: { city: "Tullamore", address: "", postcode: "", adult_only: true },
    location_note: "Based in Tullamore. Current swimming, cycling and running meeting points should be confirmed with the club."
  }
};
