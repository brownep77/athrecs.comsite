import type { ClubProfile } from "./club-profiles";

// Public club sources opened on 13 October 2026. Historical connections are
// editorial context, not athlete identity claims or verified result imports.
export const regionalClubProfiles: Record<string, ClubProfile> = {
  "birmingham-running-athletics-and-triathlon-club-brat": {
    summary:
      "BRAT brings running, athletics and triathlon together in Birmingham, combining a busy training programme with a club history reaching back to Smethwick Harriers.",
    biography: [
      "Birmingham Running, Athletics & Triathlon Club took its present form in 2010, when Birmingham Rowheath AC merged with Birmingham Running and Triathlon. The athletics side has much older roots: Smethwick Harriers began in 1921, and later mergers brought together clubs from Harborne, Oldbury, Warley and Rowheath. Their road relays, cross-country teams and track athletes all form part of BRAT’s history.",
      "Today the club offers running, track and field, cycling and swimming, with a junior athletics section and separate contacts for each discipline. Its triathlon predecessor included Chrissie Wellington and Jodie Stimpson among its members. New athletes can ask about the group that suits their experience, while prospective cyclists should contact the club before joining a ride.",
    ],
    founded_year: 2010,
    notable_members: [
      {
        name: "Chrissie Wellington",
        connection: "Former member of the Birmingham Running and Triathlon predecessor club",
        detail:
          "World long-distance triathlon champion in 2008; her BRAT connection is recorded in the club history.",
      },
      {
        name: "Jodie Stimpson",
        connection: "Former member of the triathlon predecessor club",
        detail:
          "Named in BRAT’s history among the triathletes who enjoyed success with the club before the 2010 merger.",
      },
    ],
    sources: [
      {
        title: "BRAT history and predecessor clubs",
        url: "https://bratclub.co.uk/club-info/history/",
      },
      {
        title: "Discipline and membership contacts",
        url: "https://bratclub.co.uk/club-info/key-contacts/",
      },
      {
        title: "Chrissie Wellington’s World Triathlon record",
        url: "https://triathlon.org/athletes/profile/13302/chrissie-wellington",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "chester-triathlon-club": {
    summary:
      "Chester Triathlon Club offers swimming, cycling and running for juniors and adults, with a local race programme that includes Deva Divas and the Dee Mile swim.",
    biography: [
      "Chester Triathlon Club was formed in 1994 and grew from a small group with no coaches into a club offering organised training across all three disciplines. Early races helped that growth: the Deva Triathlon developed from the Fire Brigade Triathlon, while members practised their transitions at the Sandy Lane training triathlons.",
      "The club’s programme extends beyond triathlon. Its website lists pool and open-water swimming, group rides, coached running, cross-country and a junior section. Events such as Deva Divas, the Dee Mile swim and Christleton 5K give members opportunities to race and volunteer locally. Newcomers can use the club’s joining guidance to find suitable sessions before attending.",
    ],
    founded_year: 1994,
    location_note:
      "Sessions and races use several venues. Consult the club’s swim, bike and run pages for the appropriate meeting point.",
    sources: [
      {
        title: "Chester Triathlon Club history",
        url: "https://www.chestertri.org.uk/our-club/club-history/",
      },
      { title: "Training, juniors and club races", url: "https://www.chestertri.org.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "fairwater-runners-cwmbran": {
    summary:
      "Fairwater Runners Cwmbran is a Torfaen running club based at Cwmbran Stadium, with coached sessions, road and off-road runs and local league racing.",
    biography: [
      "Fairwater Runners Cwmbran meets at Cwmbran Stadium in Torfaen for group training on roads, cross-country and mixed-terrain routes. Runs include cut-off points so members who want a shorter outing can take one. The club describes itself as a small, sociable group and welcomes runners with different levels of experience.",
      "Training is complemented by time trials, handicap events and arranged track sessions. Members also represent the club in GLCL road and cross-country races and the Gwent Cross Country League, giving regular opportunities to contribute to a team. Anyone interested in trying a session should contact the club first to confirm the meeting arrangements and a suitable group.",
    ],
    corrections: {
      address: "Cwmbran Stadium, Henllys Way, Cwmbran, NP44 3YS",
      postcode: "NP44 3YS",
      address_kind: "training",
    },
    sources: [
      {
        title: "Fairwater club activities and league participation",
        url: "https://fairwater-runners-cwmbran.org.uk/",
      },
      {
        title: "Training routes and stadium meeting point",
        url: "https://fairwater-runners-cwmbran.org.uk/training/",
      },
      { title: "Club enquiries", url: "https://fairwater-runners-cwmbran.org.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "gog-triathlon-club": {
    summary:
      "GOG Triathlon Club is based in Llandudno and draws members from across North Wales, offering coached swimming, cycling and running for a range of abilities.",
    biography: [
      "GOG Triathlon Club grew out of a meeting at the Rhos Fynach pub in Rhos-on-Sea at the end of 2014. A dozen people discussed how to support one another in triathlon, and the club was established in 2015. Interest spread quickly across North Wales, with more than 150 people joining during its first year.",
      "The club describes its base as Llandudno and welcomes both complete beginners and experienced competitors. Members can work on all three disciplines or concentrate on swimming, cycling or running. British Triathlon-trained coaches lead sessions, and prospective members can try running or swimming before committing. The current timetable and club social channels give the details for each venue.",
    ],
    founded_year: 2015,
    corrections: {
      city: "Llandudno",
      website: "https://gogtriathlon.com/",
      address: "",
      postcode: "",
      address_kind: "directory",
    },
    location_note:
      "The club is based in Llandudno and uses multiple North Wales training venues. The earlier directory entry combined Llandudno and Colwyn Bay sessions; it was not a single street address.",
    sources: [
      { title: "GOG’s origins", url: "https://gogtriathlon.com/about-gog-tri/" },
      { title: "Club base, coaching and introductory sessions", url: "https://gogtriathlon.com/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "leeds-and-bradford-triathlon-club": {
    summary:
      "Leeds & Bradford Triathlon Club supports beginners, experienced triathletes and para-triathletes across West Yorkshire, with coached training and a junior section.",
    biography: [
      "Leeds & Bradford Triathlon Club was formed in 2000 through the merger of two local clubs. Its training programme serves West Yorkshire, with coached sessions throughout the year and access to the Yorkshire Dales for longer rides. The club welcomes novices as well as international triathletes and para-triathletes.",
      "Dedicated youth and junior sessions sit alongside the adult programme. Members also meet for post-training coffee, social events and an end-of-season awards evening. The club organises the Ilkley Triathlon and has received UK Triathlon Club of the Year awards. Separate membership, junior and youth contacts help new athletes find the right starting point.",
    ],
    founded_year: 2000,
    location_note:
      "Training takes place at venues across West Yorkshire. The directory address should not be treated as the meeting point for every session.",
    sources: [
      {
        title: "Club merger, activities and enquiry contacts",
        url: "https://lbt.org.uk/about-lbt/",
      },
      { title: "West Yorkshire training programme", url: "https://lbt.org.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "manchester-triathlon-club": {
    summary:
      "Manchester Triathlon Club began in 1988 and offers coached multisport training, junior activities and local races including Boundary Breeze and an aquathlon series.",
    biography: [
      "Manchester Triathlon Club began in 1988 after cyclist and firefighter John Moore called a meeting at the Olde Cock Inn in Didsbury. The growing club later met at Hough End before moving to Longford Park. Its history traces early runs around Sale Water Park, the development of pool coaching and the arrival of open-water sessions at Salford Quays.",
      "The volunteer-run club now offers swimming, cycling and running for different levels of experience, together with a junior section. It organises Boundary Breeze, a sprint triathlon, and a series of aquathlons. Manchester Triathlon Club was named Triathlon England’s North West Club of the Year in 2023; social events and member volunteering remain part of its programme alongside racing.",
    ],
    founded_year: 1988,
    sources: [
      {
        title: "Manchester Triathlon Club history",
        url: "https://manchestertriathlonclub.org.uk/club-history/",
      },
      {
        title: "Current club programme and regional award",
        url: "https://manchestertriathlonclub.org.uk/",
      },
      { title: "Enquiry routes", url: "https://manchestertriathlonclub.org.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "manx-fell-runners": {
    summary:
      "Manx Fell Runners organises fell running on the Isle of Man, including the Manx Mountain Marathon, a fell-running league and shorter winter hill races.",
    biography: [
      "Manx Fell Runners is an Isle of Man club centred on running over the island’s hills and upland terrain. It promotes the Manx Mountain Marathon and the Manx Fell Running League, with races through the year and a Winter Hill League in the final months of the season.",
      "The club website brings together route information, junior events, results and details of its informal Plodders outings. A guide for newcomers explains the demands of uneven ground and steep descents, along with navigation and race-kit requirements. Runners planning a first event should check its individual instructions and use the club contact form if they are unsure which race is suitable.",
    ],
    location_note:
      "Races and group outings use different locations across the island; check the individual route and meeting details.",
    sources: [
      {
        title: "About Manx Fell Runners and contact form",
        url: "https://manxfellrunners.org/club",
      },
      { title: "Club activities and route resources", url: "https://manxfellrunners.org/" },
      {
        title: "Introduction to fell running",
        url: "https://manxfellrunners.org/beginners-guide-to-fell-running",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "manx-harriers": {
    summary:
      "Manx Harriers is a Douglas athletics club formed in 1991, with track and field, road and cross-country running, trail events and a strong race-walking tradition.",
    biography: [
      "Manx Harriers was formed in 1991 when Boundary Harriers and Manx AC merged. The opening of the all-weather track at the National Sports Centre in Douglas helped bring the clubs together, giving them a shared base and the chance to pool coaching and volunteer resources. The clubhouse remains at the NSC.",
      "The club covers track and field, road running, cross-country, trail running and race walking, with members also travelling to competitions off the island. Volunteers organise major local fixtures including the Parish Walk and Easter Festival of Running. Its hall of fame reflects that range, recording international runners and race walkers as well as the people who have supported Manx athletics over many years.",
    ],
    founded_year: 1991,
    corrections: {
      city: "Douglas",
      address: "Manx Harriers clubhouse, National Sports Centre, Douglas",
      postcode: "",
      address_kind: "clubhouse",
      website: "https://www.manxharriers.com/",
    },
    notable_members: [
      {
        name: "Keith Gerrard",
        connection: "Club hall of fame",
        detail: "England and Great Britain international cross-country runner.",
      },
      {
        name: "Steve Partington",
        connection: "Club hall of fame",
        detail:
          "Race walker who represented the Isle of Man at multiple Commonwealth Games and competed in Race Walking World Cups.",
      },
      {
        name: "Elizabeth Corran",
        connection: "Club hall of fame and life member",
        detail: "World veteran over-40 race-walking champion in 1996.",
      },
    ],
    sources: [
      { title: "Club merger and NSC base", url: "https://www.manxharriers.com/club-history/" },
      {
        title: "Manx Harriers hall of fame",
        url: "https://www.manxharriers.com/club-history/hall-of-fame/",
      },
      { title: "Club contacts", url: "https://www.manxharriers.com/contacts/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "northern-isle-of-man-ac": {
    summary:
      "Northern (Isle of Man) Athletic Club supports athletics, road running, cross-country and walking around Ramsey, with junior and adult training and island races.",
    biography: [
      "Northern (Isle of Man) Athletic Club offers athletics, road running, cross-country and walking for a range of ages and abilities. Its programme includes junior track competitions, a winter road series and longer running and walking events. Members also have opportunities to compete in Lancashire championships and the island’s mainland league teams.",
      "Training includes sprint and middle-distance groups from school Year 6 through to veterans, alongside activities for younger children. Sessions use locations around Ramsey and, for some track work, the National Sports Centre in Douglas. Meeting points can change, so newcomers should check the latest club notices rather than assume all training starts at the directory address.",
    ],
    location_note:
      "Training is based around Ramsey, with some sessions at the NSC track in Douglas. Confirm the location for the chosen age group and session.",
    sources: [
      {
        title: "Club disciplines and competition opportunities",
        url: "https://www.northernaciom.com/club-information",
      },
      {
        title: "Sprint and middle-distance groups",
        url: "https://www.northernaciom.com/training-under13group-veteran",
      },
      { title: "Junior activities and events", url: "https://www.northernaciom.com/" },
      { title: "Club contact", url: "https://www.northernaciom.com/club-contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "thames-turbo-triathlon-club": {
    summary:
      "Thames Turbo Triathlon Club trains around Hampton and south-west London, using Hampton Pool, local tracks, parks and open water for adult and junior sessions.",
    biography: [
      "Thames Turbo Triathlon Club brings together adult and junior athletes around Hampton and south-west London. Hampton Pool is its base for year-round outdoor swimming, with other sessions using St Mary’s University’s athletics track and Shepperton Lake. Junior training also uses local school facilities and the open spaces of Bushy and Richmond parks.",
      "The club is run by its members and offers coached sessions across swimming, cycling and running. Group rides often head towards the Surrey Hills, while members arrange additional opportunities to train and meet socially. A two-week trial gives prospective members time to try the programme, meet the coaches and decide which sessions fit their goals.",
    ],
    corrections: {
      city: "Hampton",
      address: "Hampton Pool, Hampton High Street, Hampton, TW12 2ST",
      postcode: "TW12 2ST",
      address_kind: "training",
    },
    location_note:
      "Hampton Pool is one training base. Track, open-water, junior and cycling sessions use other venues listed by the club.",
    sources: [
      { title: "Coaches, venues and trial membership", url: "https://thamesturbo.co.uk/about" },
      { title: "Club contact and Hampton Pool address", url: "https://thamesturbo.co.uk/contact" },
      { title: "Membership and club programme", url: "https://thamesturbo.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "3d-triathlon-club": {
    summary:
      "3D Triathlon Club is a North Dublin club founded in 2001, with coached swim, bike and run sessions around the city centre and Phoenix Park.",
    biography: [
      "3D Triathlon Club began in 2001 during the journey home from the Windsor Triathlon. Its founders wanted a club on Dublin’s north side that combined structured coaching with a welcome for beginners and experienced athletes. Seventy members joined in its first year, and the club has retained that mix of training and social activity.",
      "Sessions take place around Dublin city centre, with Phoenix Park used for running and cycling. The club aims to make training accessible by bike or public transport, and members help with the volunteering needed to keep it running. Prospective members can try three coached sessions before joining; the club contact form is the place to arrange an introduction.",
    ],
    founded_year: 2001,
    corrections: { city: "Dublin", website: "https://3dtri.ie/" },
    sources: [
      { title: "3D’s origins and training approach", url: "https://3dtri.ie/about-3d-tri" },
      { title: "Introductory sessions", url: "https://3dtri.ie/" },
      { title: "Membership and training enquiries", url: "https://3dtri.ie/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athy-triathlon-club": {
    summary:
      "Athy Triathlon Club was founded in 2012 in south Kildare, supporting triathlon, duathlon and aquathlon alongside individual swimming, cycling and running goals.",
    biography: [
      "Athy Triathlon Club was created in 2012 by a small group in south Kildare who shared an interest in multisport. It welcomes people working towards improved fitness as well as those preparing for races. Members can take part in one discipline, such as cycling, without being expected to compete in a triathlon.",
      "Club members enter duathlons, triathlons and aquathlons, along with running events from 5K to marathons and occasional adventure races. A junior section and the club’s Flat Out duathlon events add opportunities for younger athletes. The website provides separate guidance for juniors and for people who are new to triathlon or returning after a break.",
    ],
    founded_year: 2012,
    sources: [
      {
        title: "Athy Triathlon Club origins and ethos",
        url: "https://athytriathlonclub.com/about-us-2/",
      },
      {
        title: "Juniors, Flat Out events and new-member guidance",
        url: "https://athytriathlonclub.com/",
      },
      { title: "Club contact routes", url: "https://athytriathlonclub.com/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "belpark-tc": {
    summary:
      "Belpark Triathlon Club is based around Rathfarnham in south Dublin, with roots in a 1986 running group and a history of national individual and team titles.",
    biography: [
      "Belpark Triathlon Club takes its name from Belgrave Square Harriers and Bushy Park. Members of that Ranelagh running club formed Belpark in 1986, combining the two names as they moved into triathlon. The club is now based around Rathfarnham in south Dublin and draws members from across the city and beyond.",
      "Alongside triathletes, Belpark welcomes duathletes, swimmers, adventure racers and people who simply enjoy training in company. Its history includes national men’s, women’s and mixed club titles, plus mixed-relay championships in 2017 and 2018. The club website offers new-member guidance, a junior section and information about its Phoenix Park duathlons and other race activities.",
    ],
    founded_year: 1986,
    corrections: { city: "Dublin", website: "https://www.belparktri.ie/" },
    notable_members: [
      {
        name: "Maeve Maher-McWilliams",
        connection: "Club honours list",
        detail: "National Series champion in 2016.",
      },
      {
        name: "Eilis Connery",
        connection: "Club honours list",
        detail: "National duathlon champion in 2010.",
      },
    ],
    sources: [
      {
        title: "Belpark history and national honours",
        url: "https://pages.belparktri.ie/about-us/",
      },
      { title: "Club activities and junior section", url: "https://www.belparktri.ie/" },
      { title: "Club enquiry form", url: "https://www.belparktri.ie/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "cork-triathlon-club": {
    summary:
      "Cork Triathlon Club offers multisport training and a junior section, with a history shaped by its King of the Hill and Lost Sheep triathlons.",
    biography: [
      "Cork Triathlon Club’s present incarnation grew from a meeting at the Silversprings Hotel in November 1998, after an earlier club had disbanded. Its early race programme included a national sprint duathlon championship and King of the Hill in Kinsale. The Lost Sheep followed in 2003, developing into the club’s demanding middle-distance event based in Kenmare.",
      "The club combines swimming, cycling and running with junior activities, coaching and volunteer-led events. Its history records a strong 2018 National Series season, including Donnach Kiely’s overall win. New members can use separate contacts for membership, training and juniors, while race-specific addresses handle questions about King of the Hill and the Lost Sheep.",
    ],
    corrections: { city: "Cork", website: "https://www.corktri.com/" },
    notable_members: [
      {
        name: "Donnach Kiely",
        connection: "Club’s 2018 season history",
        detail: "Recorded by Cork Triathlon Club as the overall National Series winner in 2018.",
      },
    ],
    sources: [
      {
        title: "Cork Triathlon Club history and 2018 season",
        url: "https://www.corktri.com/this-is-ctc/",
      },
      { title: "Membership, junior and race contacts", url: "https://www.corktri.com/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "limerick-tc": {
    summary:
      "Limerick Triathlon Club was founded in 1984 and supports multisport across Ireland’s Midwest, organising Kilkee’s Hell of the West and the Joey Hannan Memorial.",
    biography: [
      "Limerick Triathlon Club was founded in 1984. Its first event took place at St Enda’s Sports Complex in 1985, followed that summer by the first Kilkee Hell of the West triathlon. Racing and volunteering have remained closely connected: the club also organises the Joey Hannan Memorial Triathlon and a duathlon at the University of Limerick.",
      "The programme serves beginners through to experienced long-distance competitors, with club trips, group rides, running and swimming. Much of the activity is arranged by members, alongside coached pool swimming; athletes seeking individual coaching are directed to arrange it separately. Associate membership offers a way to stay involved when not racing, and the club encourages members to help deliver its events.",
    ],
    founded_year: 1984,
    corrections: { city: "Limerick", website: "https://limericktriathlon.com/" },
    sources: [
      {
        title: "Limerick club history and races",
        url: "https://limericktriathlon.com/about-the-club/",
      },
      {
        title: "Current training arrangements and contacts",
        url: "https://limericktriathlon.com/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "midleton-cycling-and-triathlon-club": {
    summary:
      "Midleton Cycling & Triathlon Club brings group cycling and multisport training to East Cork, continuing a local cycling tradition that began in 1968.",
    biography: [
      "Midleton Cycling & Triathlon Club took its present form in 2009, replacing Midleton Cycling Club, which had begun in 1968 as part of Midleton Athletic Club. That history connects the club’s cycling section with its newer swim, bike and run activities. Routes around East Cork offer both flatter riding and hills close to the town.",
      "Club rides normally start outside Midleton Courthouse, with groups organised for different abilities and ride lengths. The programme also includes pool and open-water swimming, group running and indoor cycling. Newcomers are encouraged to build their confidence through suitable groups; prospective members should check the current ride notice and contact the club before their first outing.",
    ],
    founded_year: 2009,
    corrections: { city: "Midleton" },
    location_note:
      "Midleton Courthouse is the published starting point for club rides. Swimming, running and other sessions use separate venues.",
    sources: [
      {
        title: "Cycling-club roots and multisport programme",
        url: "https://www.midletonctc.com/aboutus",
      },
      { title: "Current ride groups and club enquiries", url: "https://www.midletonctc.com/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "naas-t-c": {
    summary:
      "Naas Triathlon Club serves Naas and Newbridge in County Kildare, with adult and junior activities, beginner support and a winter duathlon race programme.",
    biography: [
      "Naas Triathlon Club serves the Naas and Newbridge areas of County Kildare. It welcomes people taking up multisport for the first time as well as experienced competitors. Duathlon provides an alternative for those who prefer running and cycling, while the club also supports members training simply for fitness and enjoyment.",
      "The club’s activities include coached training, junior sessions and the Galco Naas Duathlon Series at Punchestown. Its website provides different enquiry routes for general questions, membership, novices and race information. New members can use those contacts to find the right group and check the current session programme before attending.",
    ],
    corrections: { city: "Naas", website: "https://naastriclub.com/" },
    sources: [
      { title: "Naas and Newbridge club activities", url: "https://naastriclub.com/about-ntc/" },
      { title: "Training, juniors and duathlon series", url: "https://naastriclub.com/" },
      { title: "Naas club contacts", url: "https://naastriclub.com/contact-ntc/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-brecon-athletic-club": {
    summary:
      "Brecon Athletic Club offers track and field, cross-country and road running at Penlan, alongside Happy Feet social runs and Couch to 5K courses.",
    biography: [
      "Brecon Athletic Club trains at Penlan Athletics Track, with the Bannau Brycheiniog hills close by. Its programme takes young athletes from broad running, jumping and throwing activities towards more specialised training, while middle-distance and endurance groups cater for a wider age range. Indoor facilities support some sessions through the winter.",
      "For adult road runners, the Happy Feet group offers social running with meeting points confirmed for each outing. Couch to 5K courses provide another route into the club. President Kirsty Wade was a junior member while living and attending school in Llandrindod Wells, and recalls those early years in her welcome to members.",
    ],
    corrections: {
      county: "Powys",
      address: "Penlan Athletics Track, Brecon, Powys, LD3 9SR",
      postcode: "LD3 9SR",
      address_kind: "training",
      website: "https://breconac.org.uk/",
    },
    location_note:
      "Penlan is the athletics base. Happy Feet social runs have separate meeting points, confirmed through the group before each run.",
    notable_members: [
      {
        name: "Kirsty Wade",
        connection: "Former junior member and club president",
        detail:
          "The club’s welcome page recalls her early athletics at Brecon while she lived in Llandrindod Wells.",
      },
    ],
    sources: [
      { title: "Brecon club programme", url: "https://breconac.org.uk/" },
      { title: "Training groups and venues", url: "https://breconac.org.uk/training" },
      {
        title: "Welcome from Kirsty Wade",
        url: "https://breconac.org.uk/welcome-from-club-president",
      },
      { title: "Club address and enquiries", url: "https://breconac.org.uk/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-bridgend-athletics": {
    summary:
      "Bridgend Athletics Club trains at Newbridge Fields, offering junior and senior athletics with roots in the town’s technical-college team of the 1950s.",
    biography: [
      "Bridgend Athletics Club grew from a team at Bridgend Technical College in the 1950s. It became Bridgend YMCA in the early 1960s and adopted the Bridgend AC name around the mid-1980s, along with the yellow vest and blue hoops still associated with the club. In 1997, its grass track was replaced by a floodlit 300m track and clubhouse.",
      "Newbridge Fields remains the club’s home for running, jumping and throwing. Junior and senior groups cater for new athletes and experienced competitors, with members also taking part in cross-country, trail and mountain running. The club provides separate junior and senior membership contacts and welcomes people interested in coaching, officiating or helping with its activities.",
    ],
    corrections: {
      address: "Bridgend Athletics Club, Newbridge Fields, Bridgend, CF31 4AD",
      postcode: "CF31 4AD",
      address_kind: "training",
    },
    sources: [
      {
        title: "Bridgend history and Newbridge Fields",
        url: "https://bridgendathletics.org/aboutus",
      },
      {
        title: "Club membership and volunteering contacts",
        url: "https://bridgendathletics.org/contact",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-carmarthen-and-district-harriers": {
    summary:
      "Carmarthen & District Harriers was founded in 1948 and trains at Johnstown, developing young athletes across running, jumping and throwing in West Wales.",
    biography: [
      "Carmarthen & District Harriers began at the Dolwar Café in Blue Street in April 1948, with Ron B Evans and Ernie Jones as its founders. Early training used Carmarthen Park. The club later helped develop the Johnstown track, where a new synthetic surface opened in 1988, and its history includes hosting Welsh championships and international meetings.",
      "Today training takes place at Carmarthen Leisure Centre’s athletics track, with introductory run, jump and throw groups and more specialised coaching. The club accepts athletes from their ninth birthday, subject to capacity, and expects members to compete for its teams. New athletes should contact the joining team first so they can be directed to the appropriate group.",
    ],
    founded_year: 1948,
    corrections: {
      address:
        "Carmarthen Leisure Centre Athletics Track, Llansteffan Road, Johnstown, Carmarthen, SA31 3NQ",
      postcode: "SA31 3NQ",
      address_kind: "training",
    },
    notable_members: [
      {
        name: "Gwynne Griffiths",
        connection: "Club history",
        detail: "Represented Great Britain at the 1966 European Championships.",
      },
      {
        name: "Hedydd Davies",
        connection: "Club athlete and long-serving administrator",
        detail:
          "Won four Welsh marathon titles; the club history records his third title at Carmarthen in 1970.",
      },
    ],
    sources: [
      {
        title: "Club history, coaching and joining requirements",
        url: "https://www.carmarthenharriers.co.uk/club-info/",
      },
      {
        title: "Current club contacts and Johnstown address",
        url: "https://www.carmarthenharriers.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-celtic-tri": {
    summary:
      "Celtic Tri began in 2005 in the Swansea and Neath Port Talbot area, offering adult and junior multisport training and local triathlon, aquathlon and duathlon events.",
    biography: [
      "Celtic Tri was formed in 2005 by triathletes from Swansea and Neath Port Talbot who wanted to share training, experience and company. It grew into a club drawing members from across South and West Wales, including beginners, long-distance racers and athletes competing in age-group teams. The club received Welsh Triathlon’s Club of the Year award in 2008.",
      "Its programme brings together pool and open-water swimming, cycling and running, with a separate Celtic Juniors section. Club events include the Neath Valley Triathlon, Stephen Lewis TriStars Aquathlon and Pembrey Junior Duathlon. Prospective members can use the published contact page to discuss their experience and identify suitable sessions across the club’s different venues.",
    ],
    founded_year: 2005,
    location_note:
      "The club originated in the Swansea and Neath Port Talbot area and uses several training venues across the region.",
    sources: [
      { title: "Celtic Tri origins and 2008 award", url: "https://www.celtictri.co.uk/about-us/" },
      { title: "Training, juniors and club events", url: "https://www.celtictri.co.uk/" },
      { title: "Club contact and social channels", url: "https://www.celtictri.co.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-clwb-run-wales": {
    summary:
      "Clwb Run Wales is a Welsh Athletics-affiliated virtual running club for adults across Wales who want club membership while running independently or with a local group.",
    biography: [
      "Clwb Run Wales gives adults across Wales a way to belong to an affiliated running club without attending a conventional weekly club night. It is designed for people who cannot easily access a local affiliated club, have limited time or prefer to keep running with an unaffiliated social group.",
      "Membership connects runners through an online community and includes Welsh Athletics affiliation, with the opportunity to represent the club at eligible events. The club’s guidance explains the exceptions for regional cross-country championships and the transfer process for existing affiliated athletes. This is a Wales-wide virtual club: members train in their own locations rather than at one shared clubhouse or track.",
    ],
    scope: "national",
    corrections: { virtual: true, adult_only: true },
    location_note:
      "A virtual club serving Wales. There is no single club training venue; the Run Wales office is a contact point, not a shared training base.",
    sources: [
      {
        title: "Clwb Run Wales membership and eligibility",
        url: "https://irun.wales/clwb-run-wales/",
      },
      { title: "Run Wales programme and virtual club", url: "https://irun.wales/about-us/" },
      { title: "Run Wales enquiries", url: "https://irun.wales/about-us/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-deeside-aac": {
    summary:
      "Deeside Amateur Athletic Club trains at Coleg Cambria in Connah’s Quay, with indoor and outdoor facilities for track and field, cross-country and road runners.",
    biography: [
      "Deeside Amateur Athletic Club is based at Coleg Cambria’s Deeside site in Connah’s Quay. Its facilities include an eight-lane outdoor track, field-event areas and a six-lane indoor sprint straight. That combination supports year-round training, with volunteer coaches helping athletes develop across track and field, cross-country and road running.",
      "The club welcomes athletes from age nine through to masters. Team opportunities include the Cheshire League, Youth Development League, Northern League, North Wales cross-country leagues and Borders road league. Families and other volunteers also help with officiating at meetings. Membership enquiries should go through the club’s contact page before a newcomer attends training.",
    ],
    corrections: {
      city: "Connah’s Quay",
      county: "Flintshire",
      address: "Deeside AAC, Coleg Cambria Deeside, Kelsterton Road, Connah’s Quay, CH5 4BR",
      postcode: "CH5 4BR",
      address_kind: "training",
    },
    sources: [
      {
        title: "Facilities, age groups and team competitions",
        url: "https://www.deesideathleticclub.co.uk/about-us/",
      },
      {
        title: "Club contact and Coleg Cambria address",
        url: "https://www.deesideathleticclub.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-eryri-harriers": {
    summary:
      "Eryri Harriers is a North Wales running club founded in Llanberis in 1977, with fell, mountain, road and cross-country racing and an active junior programme.",
    biography: [
      "Eryri Harriers was formed at the Royal Victoria Hotel in Llanberis on 7 September 1977. Ken Jones, then organiser of the Snowdon Race, called the meeting that established the club and its first officers. Those origins connect Eryri closely with mountain running, although its members also compete on roads and over cross-country.",
      "The club welcomes runners from across North Wales and further afield. Its training programme includes hill sessions, longer runs, junior activities and Plodders groups, alongside club races and championships. Different sessions suit different experience levels, so new runners should check the programme and contact the relevant road, mountain, cross-country or junior representative before joining in.",
    ],
    founded_year: 1977,
    sources: [
      { title: "Eryri’s founding meeting", url: "https://www.eryriharriers.org.uk/theclub" },
      { title: "Club disciplines and welcome", url: "https://www.eryriharriers.org.uk/" },
      { title: "Training programme", url: "https://www.eryriharriers.org.uk/training" },
      { title: "Discipline and junior contacts", url: "https://www.eryriharriers.org.uk/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-menai-track-and-field": {
    summary:
      "Menai Track & Field trains at Treborth in Bangor, developing junior and senior athletes for track and field, cross-country, road and mountain competition.",
    biography: [
      "Menai Track & Field was established in 2000 and is based at Treborth Athletics Track in Bangor. Its all-weather 400m track supports junior development and more specialised training for older athletes. The club also takes part in cross-country, with individual members entering road and mountain races.",
      "Young athletes compete in the Welsh Junior League and Youth Development League, including North Wales composite teams for older age groups. The Eryri Academy provides a separate introduction for younger children who may later progress into Menai’s club groups. Families should use the joining or contact pages to check the appropriate group, availability and current training arrangements.",
    ],
    founded_year: 2000,
    corrections: {
      address: "Treborth Athletics Track, Bangor, LL57 2NX",
      postcode: "LL57 2NX",
      address_kind: "training",
      website: "https://menaitrackandfield.co.uk/",
    },
    sources: [
      {
        title: "Menai history, teams and training",
        url: "https://menaitrackandfield.co.uk/about/",
      },
      {
        title: "Treborth address and joining enquiries",
        url: "https://menaitrackandfield.co.uk/contact/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-penarth-and-dinas-runners": {
    summary:
      "Penarth and Dinas Runners is a Vale of Glamorgan club founded in 1988, combining road, trail and cross-country running with races at Porthkerry and Cosmeston.",
    biography: [
      "Penarth and Dinas Runners was formed in 1988 and brings together runners of different abilities in the Vale of Glamorgan. Local road, trail and cross-country races form its club championship, while trips to marathons and the Welsh Castles Relay give members opportunities to race and support one another further afield.",
      "The club organises the Porthkerry 5-mile mixed-terrain race, Cosmeston Relays and CF64 winter race, with profits supporting Tenovus Cancer Care. Its training page identifies Penarth Athletic Rugby and Cricket Club as the base introduced in 2025. Prospective members can arrange a trial session through the club’s form or public enquiry email, checking the calendar for the meeting point.",
    ],
    founded_year: 1988,
    corrections: {
      address: "Penarth Athletic Rugby and Cricket Club, Penarth",
      postcode: "",
      address_kind: "training",
    },
    location_note:
      "The club’s training page names Penarth Athletic Rugby and Cricket Club as its base from 2025, replacing the older leisure-centre listing. Individual sessions may meet elsewhere.",
    sources: [
      {
        title: "Club history, races and charity support",
        url: "https://penarthanddinasrunners.co.uk/",
      },
      {
        title: "Current training base and trial sessions",
        url: "https://penarthanddinasrunners.co.uk/club-training-information",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-wrexham-amateur-athletic-club": {
    summary:
      "Wrexham Athletic Club was founded in 1954 and trains at Queensway, offering track and field coaching from age eight through to senior and masters athletes.",
    biography: [
      "Wrexham Athletic Club was founded in 1954 and is associated with the maroon vest worn by its athletes. Training centres on Queensway track, with groups for younger athletes and event-specific coaching in sprints, endurance, hurdles, jumps, throws and combined events. Some winter sessions use indoor facilities at Deeside.",
      "The club offers two taster sessions before asking prospective athletes to join. Its own sessions start at age eight, with younger children directed to separate local programmes. A Special Olympics group provides another route into athletics. Membership, general and welfare enquiries have dedicated contacts, helping families and adult newcomers find the right coach and training group.",
    ],
    founded_year: 1954,
    sources: [
      { title: "Wrexham’s foundation and club news", url: "https://www.wrexhamac.club/" },
      {
        title: "Coaching groups, Queensway sessions and contacts",
        url: "https://www.wrexhamac.club/about/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
};
