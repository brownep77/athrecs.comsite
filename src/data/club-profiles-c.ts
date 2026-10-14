import type { ClubProfile } from "./club-profiles";

// Individually researched club profiles. Athlete connections do not claim identities
// or create verified results. The linked public sources were opened and read.
export const furtherClubProfiles: Record<string, ClubProfile> = {
  "aylsham-runners": {
    summary:
      "Aylsham Runners offers coached sessions, social runs and youth running in Aylsham, Norfolk, with groups for different abilities and the annual Aylsham 10K.",
    biography: [
      "Aylsham Runners is a Norfolk club built around regular group running in and around the market town. Sessions usually start at Aylsham Recreation Ground and combine coached efforts with social runs. A tail runner or walker stays at the back of mixed-ability sessions, while smaller groups arrange longer outings together.",
      "The club has a youth section and takes part in races and volunteering across the county. Its own Aylsham 10K, Blickling parkrun and the Round Norfolk Relay feature in club life alongside social events. Newcomers can try two sessions before joining, whether they are looking for running company or working towards a distance or PB.",
    ],
    corrections: { city: "Aylsham", county: "Norfolk", website: "https://aylshamrunners.com/" },
    sources: [
      {
        title: "Aylsham Runners activities and joining information",
        url: "https://aylshamrunners.com/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "bure-valley-harriers": {
    summary:
      "Bure Valley Harriers is a Norfolk running club with training in Norwich and Worstead, social runs, cross-country outings and its own Bure Valley 10-mile race.",
    biography: [
      "Bure Valley Harriers brings together runners of different abilities for structured training and social running in Norfolk. Its programme changes with the seasons: summer sessions use Worstead and Sloughbottom Park, including routes along Marriott’s Way, while winter groups meet at the Open Academy and Norman Centre in Norwich.",
      "Members take part in local races and events further afield, with weekend track or hill sessions, parkrun outings and occasional beach runs adding variety. The club also organises the Bure Valley 10-mile road race. Because meeting points vary by day and season, check the current training page before setting out for a first session.",
    ],
    location_note:
      "Training uses several Norwich and Worstead locations. The club timetable identifies each seasonal meeting point.",
    sources: [
      {
        title: "Bure Valley Harriers and its 10-mile race",
        url: "https://burevalleyharriers.com/",
      },
      { title: "Seasonal training locations", url: "https://burevalleyharriers.com/training/" },
      { title: "Club enquiries", url: "https://burevalleyharriers.com/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "cambridge-and-coleridge-ac": {
    summary:
      "Cambridge & Coleridge Athletic Club combines track and field with road running and cross-country in Cambridge, with junior teams and national relay success.",
    biography: [
      "Cambridge & Coleridge Athletic Club competes across track and field, road running and cross-country. Its programme connects younger athletes in the Eastern Young Athletes and East Anglian leagues with senior teams competing nationally, alongside participation in local road races and marathons.",
      "A milestone came in April 2025, when the senior men won bronze at the National 12-Stage Road Relays, following fourth place the year before. The women’s six-stage team also competed, while club volunteers were busy organising the Cambourne 10K and supporting younger athletes at league meetings. Those team fixtures and local events are an important part of C&C’s life beyond individual performances.",
    ],
    sources: [
      {
        title: "Club report on national relays, junior leagues and the Cambourne 10K",
        url: "https://cambridgeandcoleridge.org.uk/petes-post-may-2025/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "colchester-and-tendring-ac": {
    summary:
      "Colchester & Tendring Athletics Club trains at Colchester Garrison Athletics Stadium, offering junior development and specialist coaching through to masters competition.",
    biography: [
      "Colchester & Tendring Athletics Club is based at Colchester Garrison Athletics Stadium on Circular Road North. Younger members start with a broad mix of running, jumping and throwing, then move towards more focused event training as their skills develop. Volunteer coaches support athletes across different levels of experience.",
      "The club competes in the Eastern Young Athletes, East Anglian and Southern Athletics leagues, with masters opportunities through the Eastern Masters Athletics Club league. Social events give members time together away from the track. Membership enquiries should follow the age-group waiting lists on the club website; the general contact form is reserved for other questions.",
    ],
    corrections: {
      address: "Colchester Garrison Athletics Stadium, Circular Road North, Colchester, CO2 7TL",
      postcode: "CO2 7TL",
      address_kind: "training",
    },
    contact_note:
      "Use the membership page for joining and waiting-list enquiries. The general form is for other club questions.",
    sources: [
      {
        title: "Club coaching, leagues, location and contact guidance",
        url: "https://www.colchesterandtendringac.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "colchester-harriers-ac": {
    summary:
      "Colchester Harriers Athletic Club offers track and field, race walking, road running, cross-country and trail racing, with coaching at the Colchester Garrison Track.",
    biography: [
      "Colchester Harriers supports a broad range of athletics, including race walking alongside track and field, road running, cross-country and trail racing. The club welcomes athletes from school Year 5 upwards and has training groups for different abilities. Coached track sessions take place at the Garrison Track on Circular Road North.",
      "There are ways to contribute beyond competing: the club supports members who want to become coaches or officials, offers social membership and holds club social events. Its coached track sessions are for first- or second-claim members. Prospective athletes should contact the relevant junior, track and field or endurance team before attending.",
    ],
    corrections: {
      address: "Garrison Athletics Track, Circular Road North, Colchester",
      postcode: "",
      address_kind: "training",
    },
    sources: [
      { title: "About Colchester Harriers", url: "https://www.colchesterharriers.co.uk/about-us/" },
      {
        title: "Enquiry routes and Garrison Track location",
        url: "https://www.colchesterharriers.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "dereham-runners": {
    summary:
      "Dereham Runners AC began in 1986 after runners met through a local sports shop, developing into a Norfolk club with senior and junior running programmes.",
    biography: [
      "Dereham Runners AC began on 3 April 1986 after interest gathered around Gill Boucher’s Track & Field shop in Nelson Place. Boucher and coach Rob Kinge arranged the first meeting, attended by around 25 people. The club soon settled at Dereham Rugby Club, where a makeshift running circuit around the pitch served as its early track.",
      "A move to Neatherd High School followed in 1995, giving members access to a grass track and indoor space. The club’s programme now includes senior training, junior athletics, cross-country and its own road races. Its published history follows that growth from a small local group to a club travelling to events elsewhere in Britain and to Dereham’s twin town in France.",
    ],
    founded_year: 1986,
    sources: [
      {
        title: "The early history of Dereham Runners",
        url: "https://www.derehamrunners.co.uk/news/the-early-history-of-dereham-runners",
      },
      { title: "Club training, juniors and events", url: "https://www.derehamrunners.co.uk/" },
      { title: "Dereham Runners enquiries", url: "https://www.derehamrunners.co.uk/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "diss-and-district-ac": {
    summary:
      "Diss & District Athletics Club was founded in 1952 and now offers adult road running and social runs from the Mere in Diss, Norfolk.",
    biography: [
      "Diss & District Athletics Club was founded in 1952 by local enthusiasts who wanted people to keep training and competing after leaving school. Volunteer coaches and committee members continue that work through the club’s road-running programme, welcoming different abilities and running goals.",
      "The current group meets by the statue at the Mere in Diss for coached running and social sessions. Club life also includes race outings, parkrun visits and cross-country participation. The club currently says it cannot offer junior sessions, so families should enquire before making plans. Adults interested in joining can arrange introductory sessions through the published club email.",
    ],
    founded_year: 1952,
    corrections: {
      address: "The Mere, by the statue, Diss, Norfolk",
      postcode: "",
      address_kind: "training",
      website: "https://www.dissanddistrictathleticsclub.co.uk/",
    },
    sources: [
      {
        title: "Diss club history, current programme and meeting point",
        url: "https://www.dissanddistrictathleticsclub.co.uk/",
      },
      {
        title: "Club events and cross-country activities",
        url: "https://www.dissanddistrictathleticsclub.co.uk/club-events",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "ipswich-harriers": {
    summary:
      "Ipswich Harriers was founded in 1883, with a Suffolk athletics history spanning cross-country, road running and the move to Northgate’s synthetic track in 1981.",
    biography: [
      "Ipswich Harriers was founded in 1883. An early newspaper report describes a January 1884 handicap run from the Old Bell in Stoke to the Freston Boot and back, watched by crowds in the streets. The club’s headquarters later moved through several town-centre venues, including a long spell at the Coach and Horses.",
      "Women joined in the late 1930s, and the club moved to Northgate when its synthetic track opened in 1981. Earlier milestones included the North of the Thames cross-country title in 1923 and the Eastern Counties title in 1938. The history also records a transition from friendly inter-club track meetings to league competition, with records being kept as far back as 1892.",
    ],
    founded_year: 1883,
    sources: [
      {
        title: "Ipswich Harriers club history",
        url: "http://www.ipswich-harriers.co.uk/history.html",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "ipswich-jaffa-rc": {
    summary:
      "Ipswich JAFFA Running Club began in 1977 as Jogging And Fitness For All, with group running at Northgate, a junior section and a long relay-racing tradition.",
    biography: [
      "Ipswich JAFFA grew from a council jogging course in Chantry Park led by coach Terry Gould. Runners wanted to carry on after the course finished, and the club was formed on 26 September 1977. Its name stands for Jogging And Fitness For All, reflecting the original aim of making running accessible to local people.",
      "Club nights at Northgate Sports Club bring together groups running at different paces and distances, with beginners and juniors also catered for. JAFFA introduced its Ekiden Relay in 1992, with six runners sharing the marathon distance. Its history records five consecutive national Today’s Runner cross-country team titles from 1990 to 1994, achieved through a strong emphasis on whole-club participation.",
    ],
    founded_year: 1977,
    sources: [
      {
        title: "History of Ipswich JAFFA",
        url: "https://www.ipswichjaffa.org.uk/history-of-ipswich-jaffa/",
      },
      {
        title: "Northgate club nights and junior running",
        url: "https://www.ipswichjaffa.org.uk/about-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "leicester-coritanian-ac": {
    summary:
      "Leicester Coritanian Athletic Club is based at Saffron Lane Athletics Stadium, with coaching across track and field, road running and cross-country since 1969.",
    biography: [
      "Leicester Coritanian Athletic Club took its present identity in 1969, when predecessor club LCAT moved to the newly opened Saffron Lane athletics stadium. Saffron Lane remains its home, with coaching groups covering sprints, hurdles, jumps, throws and endurance, alongside road running and cross-country.",
      "The club’s hall of fame includes European under-23 discus champion Eden Francis, Commonwealth triple jump silver medallist Laura Samuel and Olympic high jump finalist Diana Davies. New athletes can arrange a taster session before joining. Training is organised around event groups, so contacting the club first helps establish which coach and session will suit a newcomer.",
    ],
    founded_year: 1969,
    notable_members: [
      {
        name: "Eden Francis",
        connection: "Club hall of fame",
        detail: "Won the European under-23 discus title in 2009.",
      },
      {
        name: "Laura Samuel",
        connection: "Club hall of fame",
        detail:
          "Won triple jump silver at the 2014 Commonwealth Games and the 2010 World Junior Championships.",
      },
      {
        name: "Diana Davies",
        connection: "Club hall of fame",
        detail: "Reached the Olympic high jump finals in Los Angeles in 1984 and Seoul in 1988.",
      },
    ],
    corrections: {
      address: "Saffron Lane Athletics Stadium, Saffron Lane, Leicester, LE2 7NQ",
      postcode: "LE2 7NQ",
      address_kind: "training",
    },
    sources: [
      {
        title: "Leicester Coritanian history",
        url: "https://www.leicestercoritanian.com/our-history",
      },
      { title: "Club hall of fame", url: "https://www.leicestercoritanian.com/hall-of-fame" },
      {
        title: "Event groups, tasters and stadium address",
        url: "https://www.leicestercoritanian.com/training",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "morpeth-harriers-and-ac": {
    summary:
      "Morpeth Harriers & Athletic Club was founded in 1946 and offers road, cross-country and track and field athletics in Morpeth, Northumberland.",
    biography: [
      "Morpeth Harriers began in 1946 with its roots in cross-country and road running. The club developed into a wider athletics organisation, using the track at King Edward VI School alongside its clubhouse at Morpeth Rugby Club. It supports junior, senior and veteran athletes, from local league participants to international competitors.",
      "Its best-known athletes include Commonwealth marathon champion Jim Alder, Olympic 1500m finalist Laura Weightman and Olympic 5000m runner Nick McCormick. Local opportunities remain central to the programme, including Harrier League cross-country, road races and grassroots track meetings. The clubhouse and school track are separate sites, so visitors should confirm where their training group meets.",
    ],
    founded_year: 1946,
    notable_members: [
      {
        name: "Jim Alder",
        connection: "Historical club athlete",
        detail:
          "Commonwealth Games marathon champion in Kingston in 1966 and silver medallist in Edinburgh in 1970.",
      },
      {
        name: "Laura Weightman",
        connection: "Club's notable-athlete history",
        detail: "Reached the Olympic 1500m finals at London 2012 and Rio 2016.",
      },
      {
        name: "Nick McCormick",
        connection: "Club's notable-athlete history",
        detail: "Represented Great Britain in the 5000m at the London 2012 Olympics.",
      },
    ],
    location_note:
      "The clubhouse is at Morpeth Rugby Club. Track sessions use King Edward VI School on Cottingwood Lane; check the training group’s meeting point.",
    corrections: {
      city: "Morpeth",
      county: "Northumberland",
      address: "Morpeth Harriers Clubhouse, Grange House Field, Mitford Road, Morpeth, NE61 1RJ",
      postcode: "NE61 1RJ",
      address_kind: "clubhouse",
      contact_url: "https://www.morpethharriers.co.uk/contact",
    },
    sources: [
      {
        title: "Morpeth Harriers history and notable athletes",
        url: "https://www.morpethharriers.co.uk/about",
      },
      {
        title: "Clubhouse, track and enquiry form",
        url: "https://www.morpethharriers.co.uk/contact",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "north-norfolk-beach-runners": {
    summary:
      "North Norfolk Beach Runners is a Cromer running club for adults of different abilities, with local road and cross-country races and a strong social programme.",
    biography: [
      "North Norfolk Beach Runners grew from an informal group running around Cromer and East Runton in the mid-1980s. The club remains based in Cromer, bringing together adult beginners, experienced racers and runners in later life. Its blue-and-yellow colours are familiar at local road and cross-country events.",
      "The club’s activities extend beyond regular training to a handicap series, club standards and organised events including the Holt 10K, Worstead 5 Mile and Chase the Train. It also organises Cromer’s Boxing Day dip. The contact page directs visitors to Cromer Lawn Tennis & Squash Association on Norwich Road; check the club calendar for the starting point of a particular run.",
    ],
    corrections: {
      website: "https://www.northnorfolkbeachrunners.com/",
      contact_url: "https://www.northnorfolkbeachrunners.com/contact-north-norfolk-beach-runners",
    },
    sources: [
      {
        title: "North Norfolk Beach Runners origins, activities and events",
        url: "https://www.northnorfolkbeachrunners.com/",
      },
      {
        title: "Club contact and Cromer meeting location",
        url: "https://www.northnorfolkbeachrunners.com/contact-north-norfolk-beach-runners",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "notts-ac": {
    summary:
      "Notts Athletic Club was founded in 1928 and trains at Harvey Hadden Stadium in Nottingham, with coaching from junior athletics through to veterans’ competition.",
    biography: [
      "Notts Athletic Club has been part of Nottingham athletics since 1928. Based at Harvey Hadden Stadium, it welcomes athletes from age nine through to veterans, with coaching across sprints, distance running, hurdles, jumps, throws and pole vault.",
      "Members compete at different levels, from local sportshall meetings to national league athletics. The range of event groups gives young athletes room to try several disciplines and more experienced competitors a place to develop their specialist events. Prospective members can use the club’s training information and enquiry contact to find the appropriate group before attending the stadium.",
    ],
    founded_year: 1928,
    corrections: {
      address: "Harvey Hadden Stadium, Nottingham, NG8 4PB",
      postcode: "NG8 4PB",
      address_kind: "training",
      website: "https://www.nottsac.co.uk/",
      contact_url: "https://www.nottsac.co.uk/contact",
    },
    sources: [
      { title: "Notts AC history and event groups", url: "https://www.nottsac.co.uk/about" },
      { title: "Stadium address and club enquiries", url: "https://www.nottsac.co.uk/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "poole-runners": {
    summary:
      "Poole Runners offers group running in Dorset, with beginner sessions, road and cross-country racing, track training and a junior programme.",
    biography: [
      "Poole Runners combines social club runs with training for road races, cross-country and track events. Its programme includes speed work, recovery runs and longer outings, with routes into the club for people starting through Couch to 5K as well as more experienced runners.",
      "The club also has junior provision through SquadKids and an under-18 group. Its published event programme includes the Upton Summer Series, Broadstone Quarter Marathon and an internal club championship, giving members different distances and formats to work towards. Training groups use different sessions and venues, so the current schedule is the best place to plan a first visit.",
    ],
    sources: [
      {
        title: "Poole Runners training and club programme",
        url: "https://poolerunners.co.uk/our-club/",
      },
      { title: "Poole Runners juniors and events", url: "https://poolerunners.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "preston-harriers": {
    summary:
      "Preston Harriers was founded in 1881 and offers road running, cross-country, fell running, track and field and sportshall athletics in Lancashire.",
    biography: [
      "Preston Harriers was formed at the White Horse Inn on Friargate on 15 September 1881. The Lancashire club now covers road running, cross-country, fell running, track and field and sportshall athletics, with groups for younger athletes, seniors and masters. Track sessions use the university sports arena.",
      "The club’s international athletes have included Helen Clitheroe, John Nuttall, Steve Tunstall and Steve Smith. Clitheroe won the European indoor 3000m title in Paris in 2011. Alongside competition, members help organise races and support coaching and officiating. Newcomers can enquire about a suitable training group and try sessions before committing to membership.",
    ],
    founded_year: 1881,
    notable_members: [
      {
        name: "Helen Clitheroe",
        connection: "Historical club international",
        detail: "Won the European indoor 3000m title in Paris in 2011.",
      },
      {
        name: "John Nuttall",
        connection: "Historical club international",
        detail:
          "Named among Preston Harriers athletes who won national titles and represented Great Britain at major championships.",
      },
    ],
    corrections: {
      city: "Preston",
      county: "Lancashire",
      website: "https://prestonharriers.co.uk/",
      contact_url: "https://prestonharriers.co.uk/contact/",
    },
    sources: [
      {
        title: "Preston Harriers history and activities",
        url: "https://prestonharriers.co.uk/our-club/",
      },
      {
        title: "Training enquiries, contacts and trial sessions",
        url: "https://prestonharriers.co.uk/contact/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "ranelagh-harriers": {
    summary:
      "Ranelagh Harriers is a road and cross-country running club in Richmond, founded in 1881, with Richmond Park routes and coached track sessions at Osterley.",
    biography: [
      "Ranelagh Harriers began in Putney in 1881 and has been based around Richmond since the mid-1930s. Its clubhouse behind the Dysart Arms on Petersham Road gives members access to Richmond Park, riverside towpaths and local roads. Cross-country and road running are at the centre of the club’s programme.",
      "Coaches and run leaders support runners aiming at a first parkrun as well as those working towards marathon PBs. Track sessions use Osterley, while the race calendar combines regional and national competition with longstanding club fixtures, a 10K and a half marathon. New runners and those returning to the sport can arrange a taster session.",
    ],
    founded_year: 1881,
    corrections: {
      city: "Richmond",
      address:
        "Ranelagh Harriers Clubhouse, behind the Dysart Arms, 135A Petersham Road, Richmond, TW10 7AA",
      postcode: "TW10 7AA",
      address_kind: "clubhouse",
      website: "https://ranelagh-harriers.co.uk/",
    },
    sources: [
      {
        title: "Ranelagh Harriers origins, clubhouse and training",
        url: "https://ranelagh-harriers.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "west-norfolk-ac": {
    summary:
      "West Norfolk Athletic Club is based at Lynnsport in King’s Lynn, with track and field, sportshall, road and cross-country opportunities for different ages and abilities.",
    biography: [
      "West Norfolk Athletic Club began in the late 1960s, first using a local school playing field before moving to Lynnsport in King’s Lynn in 1991. The club has developed junior, senior and masters athletics through regional leagues, with disabled athletes also contributing to its county and national performances.",
      "Its history includes cross-country courses at Bawsey sandpits and Houghton Hall, as well as road-running events. Today its own programme includes the Keith Ward indoor meeting and Fighter 5K at Great Massingham airfield. Members also support local parkrun and the King’s Lynn GEAR 10K and take part in team events such as the Round Norfolk and Hereward relays.",
    ],
    sources: [
      {
        title: "West Norfolk AC history and local events",
        url: "http://westnorfolkac.co.uk/index.php/about-the-club/club-history/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "wolverhampton-and-bilston": {
    summary:
      "Wolverhampton & Bilston Athletic Club is based at Aldersley Leisure Village, with a history of national league success and international track and field athletes.",
    biography: [
      "Wolverhampton & Bilston Athletic Club took its present form in 1967, when Wolverhampton Harriers merged with Bilston Town Athletic Club. Its predecessors had trained at several local grounds before the move to Aldersley in 1956. Aldersley Leisure Village remains the club’s headquarters.",
      "The club enjoyed a particularly strong period in the 1970s and early 1980s, winning the men’s National League Division One from 1975 to 1982 and representing Britain in the European Clubs Cup. Its history names athletes including Tessa Sanderson, Kathy Cook, Sonia Lannaman and Rosemary Stirling. Current training and membership information is available through the club, with a waiting-list route for junior applicants when groups are full.",
    ],
    founded_year: 1967,
    notable_members: [
      {
        name: "Tessa Sanderson",
        connection: "Historical club athlete",
        detail:
          "Named in the club’s history among the international athletes who represented Wolverhampton & Bilston.",
      },
      {
        name: "Kathy Cook",
        connection: "Historical club athlete",
        detail: "Included in Wolverhampton & Bilston’s published list of notable former athletes.",
      },
    ],
    corrections: {
      address: "Aldersley Leisure Village, Aldersley Road, Wolverhampton, WV6 9NW",
      postcode: "WV6 9NW",
      address_kind: "training",
    },
    sources: [
      {
        title: "Wolverhampton & Bilston history and headquarters",
        url: "https://www.wolvesandbilstonac.co.uk/about-us/club-history/",
      },
      {
        title: "Current club and membership information",
        url: "https://www.wolvesandbilstonac.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "wymondham-ac": {
    summary:
      "Wymondham Athletic Club began as Wymondham Joggers in 1978 and offers coached road running, cross-country and track sessions from its Kett’s Park base in Norfolk.",
    biography: [
      "Wymondham Athletic Club began in May 1978 as Wymondham Joggers, founded by John Dunsire, Chris Croton and Brian Harvey. The first London Marathon helped shift the group’s interest towards racing. Its first Wymondham road race followed in 1983, and the club adopted the Wymondham Athletic Club name in 1992.",
      "Regular club nights now start from Kett’s Park Community Centre, with coached groups covering different levels. Road running remains the main focus, alongside trail runs, cross-country and track sessions. WAC organises the New Year’s Day 10K and Wymondham 20. Its joining guidance asks prospective runners to be able to complete 5K without stopping; enquiries and taster arrangements go through the club.",
    ],
    founded_year: 1978,
    corrections: {
      county: "Norfolk",
      address: "Kett’s Park Community Centre, Harts Farm Road, Wymondham, NR18 0UR",
      postcode: "NR18 0UR",
      address_kind: "training",
    },
    location_note:
      "Club nights use Kett’s Park. Track sessions have separate seasonal venues; consult the current programme.",
    sources: [
      { title: "Wymondham AC history", url: "https://www.wymondhamac.com/history" },
      {
        title: "Current training, entry level and Kett’s Park address",
        url: "https://www.wymondhamac.com/",
      },
      { title: "Club and membership contacts", url: "https://www.wymondhamac.com/contact-us" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-albertville-harriers": {
    summary:
      "Albertville Harriers is a North Belfast running club founded in 1919, welcoming beginners and experienced runners with a history rooted in the Shankill and Ardoyne areas.",
    biography: [
      "Albertville Harriers began in 1919 among young men attending a Bible class at the Albert Hall on Belfast’s Shankill Road. Early premises were in Ardoyne Village. The club history recalls trophies and records being stored in a coal shed when members were mobilised in 1939, preserving part of its story through the war.",
      "Later homes included Olive Street, community halls and Ballysillan Leisure Centre. The North Belfast club welcomes beginners and experienced runners and is affiliated to Athletics Northern Ireland. Training uses different locations for road, hill and track work, so prospective members should confirm the current meeting point through the club’s published contacts.",
    ],
    founded_year: 1919,
    sources: [
      {
        title: "Albertville Harriers history and activities",
        url: "https://www.albertvilleharriers.org/club-history/",
      },
      { title: "Club contacts", url: "https://www.albertvilleharriers.org/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-annadale-striders": {
    summary:
      "Annadale Striders was formed in Belfast in 1973, developing from school athletics into a club with a strong cross-country, road and track tradition.",
    biography: [
      "Annadale Striders was founded at the end of the 1973 track season, following discussions led by Neil Morton and Tony McKnight. Pupils from Annadale Grammar School formed the early core, and the new club quickly won age-group road relay and cross-country races. Its first Northern Ireland team championships followed in 1974.",
      "The club’s history traces the development of athletes including middle-distance runner Paul Lawther, who represented Northern Ireland at the Commonwealth Games. It also records the work of coaches and volunteers who helped the young club establish itself across road, cross-country and track and field. The Malcolm Cup became one of its principal race promotions, continuing a connection with winter team competition.",
    ],
    founded_year: 1973,
    notable_members: [
      {
        name: "Paul Lawther",
        connection: "Historical club athlete",
        detail:
          "A leading athlete in the club’s early years and a Northern Ireland Commonwealth Games representative.",
      },
    ],
    sources: [
      {
        title: "Annadale Striders club history",
        url: "http://annadalestriders.co.uk/club-history/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-lagan-valley-ac": {
    summary:
      "Lagan Valley Athletics Club was founded in 1989 and is based at Mary Peters Track in Belfast, with junior, senior and masters athletics across several disciplines.",
    biography: [
      "Lagan Valley Athletics Club was formed in 1989 by John Glover and a small group of mainly female athletes. Its inaugural meeting took place at the Dub Pavilion that August. Early success came through athletes including Karen Mills, Jane Hale and Vicky Jamison, while Judith Rodgers became the club’s first Commonwealth Games representative.",
      "Based at Mary Peters Track in Belfast, the club expanded into a programme for different ages, abilities and disciplines. Its young-athlete meetings began in 1991, and junior development remains an important part of club life. Cross-country, mountain running and other endurance events feature alongside track and field, with the official contact form directing training and membership enquiries.",
    ],
    founded_year: 1989,
    notable_members: [
      {
        name: "Judith Rodgers",
        connection: "Historical club athlete",
        detail:
          "The first Lagan Valley AC member to compete at the Commonwealth Games, according to the club history.",
      },
    ],
    corrections: {
      city: "Belfast",
      website: "https://laganvalleyac.co.uk/",
      contact_url: "https://laganvalleyac.co.uk/contact/",
    },
    sources: [
      {
        title: "Lagan Valley AC history and development",
        url: "https://laganvalleyac.co.uk/about/",
      },
      { title: "Lagan Valley club enquiries", url: "https://laganvalleyac.co.uk/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-north-belfast-harriers": {
    summary:
      "North Belfast Harriers offers senior and junior running, with a clubhouse on Oldpark Terrace and access to local tracks, Cavehill and the Belfast hills.",
    biography: [
      "North Belfast Harriers uses its Oldpark Terrace clubhouse as a base for training runs, meetings and social events. Built in 2001, the clubhouse has changing and shower facilities and a multipurpose room. Nearby Boys’ and Girls’ Model tracks support structured sessions, while Cavehill, Black Mountain and Divis provide routes for hill and trail running.",
      "The club has senior and junior programmes, with members competing on the road and in cross-country. Senior newcomers can enquire about trying training before joining. Junior applications use a waiting list, with a place offered before payment is taken. Separate membership and coaching contacts help direct questions to the right group.",
    ],
    corrections: {
      address: "North Belfast Harriers Clubhouse, 14 Oldpark Terrace, Belfast, BT14 6NN",
      postcode: "BT14 6NN",
      address_kind: "clubhouse",
      website: "https://northbelfastharriers.com/",
      contact_url: "https://northbelfastharriers.com/contact-us/",
    },
    sources: [
      {
        title: "North Belfast Harriers clubhouse and training areas",
        url: "https://northbelfastharriers.com/clubhouse/",
      },
      {
        title: "Senior trials and junior applications",
        url: "https://northbelfastharriers.com/membership/",
      },
      { title: "Club activities", url: "https://northbelfastharriers.com/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-orangegrove-ac": {
    summary:
      "Orangegrove AC is an East Belfast running and athletics club founded in 2009, with coached sessions, junior development and road, trail and cross-country racing.",
    biography: [
      "Orangegrove AC was founded in 2009 and has grown alongside community running in East Belfast. The club has supported Belfast Victoria parkrun and JogBelfast East, while developing its own coached programme for runners with different goals and levels of experience.",
      "Members take part in road races, trail running, cross-country, track and field and ultra-distance events. Structured efforts and endurance sessions sit alongside social runs, with junior coaching available separately. The club also has an internal championship and supports the CIYMS Boxing Day Fun Run. Senior and junior enquiry addresses make it straightforward to ask about the appropriate group.",
    ],
    founded_year: 2009,
    corrections: {
      website: "https://orangegroveac.co.uk/",
      contact_url: "https://orangegroveac.co.uk/contact/",
    },
    sources: [
      {
        title: "Orangegrove AC history and activities",
        url: "https://orangegroveac.co.uk/our-club/",
      },
      { title: "Coaching, juniors, events and contacts", url: "https://orangegroveac.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-willowfield-harriers": {
    summary:
      "Willowfield Harriers is an East Belfast running club founded in 1898, with junior and adult road running, cross-country and a long record of club competition.",
    biography: [
      "Willowfield Temperance Harriers was founded in 1898 and remains part of East Belfast’s running community. Its archive preserves early medals, photographs and accounts of the club’s first 50 years, including the team’s Irish junior cross-country title in 1908.",
      "The club now brings together younger runners, adult newcomers and experienced competitors, with road racing in summer and cross-country through winter. In 2021 its junior section received Athletics Ireland’s Top Juvenile Cross Country Club award. The history also records Neill Weir’s victory in the 155-mile Racing the Planet Patagonia event in 2017, showing the range of distances represented by Willowfield members.",
    ],
    founded_year: 1898,
    notable_members: [
      {
        name: "Neill Weir",
        connection: "Athlete featured in club history",
        detail: "Won the 155-mile Racing the Planet Patagonia event in November 2017.",
      },
    ],
    sources: [
      {
        title: "Willowfield Harriers history",
        url: "https://www.willowfieldharriers.co.uk/club-history",
      },
      {
        title: "Club overview and junior award",
        url: "https://www.willowfieldharriers.co.uk/about-us",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "bungay-black-dog-rc": {
    summary:
      "Bungay Black Dog Running Club serves the Waveney Valley from its Ditchingham running centre, with senior and junior training and a history linked to the Bungay Marathon.",
    biography: [
      "Bungay Black Dog Running Club grew from informal runs during the running boom that followed the first London Marathon. Its first organised run took place in 1981, followed by the first Bungay Marathon and club committee in 1982. The Black Dog emblem draws on the town’s Black Shuck legend.",
      "The club owns Bungay Area Running Centre on Pirnhow Street in Ditchingham, with grass tracks, a clubhouse and junior facilities. Members use it for training alongside social and longer runs around the Waveney Valley. Club events include the Summer Series 10K races and Groggy Doggy cross-country, first held in 1984, while beginners can find an introductory route into running.",
    ],
    corrections: {
      address: "Bungay Area Running Centre, Pirnhow Street, Ditchingham",
      postcode: "",
      address_kind: "training",
    },
    sources: [
      {
        title: "Bungay Black Dog origins and club events",
        url: "https://blackdogs.run/aboutus/our-story/",
      },
      {
        title: "Bungay Area Running Centre facilities",
        url: "https://blackdogs.run/aboutus/our-facilities/",
      },
      { title: "Training and beginner activities", url: "https://blackdogs.run/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "coltishall-jaguars": {
    summary:
      "Coltishall Jaguars is a Norfolk running club founded in 2004, growing from the Mike Groves memorial race and maintaining a strong connection with local charity events.",
    biography: [
      "Coltishall Jaguars grew from a race organised by Alan Groves in memory of his son Mike. The first Mike Groves Run took place in 1999, raising money for Quidenham Children’s Hospice. Its success helped inspire Alan and his younger son Paul to launch the running club in 2004.",
      "Alan remained club president for 20 years, and the Mike Groves race became a central part of the Jaguars’ 10K series. The club’s history reflects both the family behind its beginnings and the friendships formed through regular training and local racing. Members continue that community tradition through club runs, race participation and events supporting local charities.",
    ],
    founded_year: 2004,
    sources: [
      {
        title: "Coltishall Jaguars origins and founder tribute",
        url: "https://www.coltishalljaguars.co.uk/about-2/our-running-roots/",
      },
      { title: "Club running programme and races", url: "https://www.coltishalljaguars.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "great-yarmouth-district-ac": {
    summary:
      "Great Yarmouth & District Athletic Club was formed in 1973, with track and field at Wellesley Recreation Ground and a road-running section organising local races.",
    biography: [
      "Great Yarmouth & District Athletic Club has offered athletics in the town since 1973. Its base is Wellesley Recreation Ground, where qualified coaches work across running, sprinting, jumping and throwing. Junior entry requires athletes to be at least eight and in school Year 4, with no upper age limit for older members.",
      "Track and field teams compete in the East Anglian League, while the road-running section organises the Humpty Dumpty 10K and Freethorpe Ten. Visitors can discuss the available event groups and try a session before joining. The club’s training page sets out the current schedule, including additional sessions beyond the main weekly club evening.",
    ],
    founded_year: 1973,
    sources: [
      {
        title: "Great Yarmouth & District history, coaching and road races",
        url: "https://www.gydac.co.uk/about-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "great-yarmouth-road-runners": {
    summary:
      "Great Yarmouth Road Runners offers coached running, social activities and walking in coastal Norfolk, with a community programme recognised by England Athletics in 2023.",
    biography: [
      "Great Yarmouth Road Runners combines regular training with a broad social and community programme. Members can take part in coached running, a walking group and club outings, while newcomers can arrange a trial and meet a buddy at their first session.",
      "The club won England Athletics’ East Region Club of the Year award in 2023, recognising work including charity fundraising, foodbank collections and support for new runners. Its own races help sustain those activities. Training locations change with the season, including Cliff Park Ormiston Academy and the Marina Centre, so prospective members should confirm arrangements with the membership secretary before attending.",
    ],
    location_note:
      "Training locations change seasonally. Check the current club calendar or ask the membership secretary for the meeting point.",
    corrections: {
      website: "https://www.gyrr.co.uk/",
      contact_url: "https://www.gyrr.co.uk/contact-us",
    },
    sources: [
      {
        title: "Great Yarmouth Road Runners activities, award and membership contact",
        url: "https://www.gyrr.co.uk/about-us",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "waveney-valley-ac": {
    summary:
      "Waveney Valley Athletic Club offers athletics around Lowestoft and the Waveney area, with junior development, senior off-track running and seasonal indoor and outdoor training.",
    biography: [
      "Waveney Valley Athletic Club runs an athletics programme at East Point Academy on Kirkley Run in Lowestoft. Summer sessions use the playing field, while winter training moves into the sports hall. The club also arranges access to the Great Yarmouth track when available, and endurance groups use Lowestoft’s seafront and other venues.",
      "Younger athletes learn running, jumping and throwing through a broad development programme before specialising. Older athletes can work in sprint, field or endurance groups, alongside a separate senior off-track section. New members can try two taster sessions. Because venues vary by discipline and season, the athletics coordinator can confirm the right group and meeting point.",
    ],
    location_note:
      "Athletics usually uses East Point Academy in Lowestoft; track, endurance and senior off-track groups may meet elsewhere.",
    sources: [
      {
        title: "Waveney Valley athletics training and junior development",
        url: "https://www.waveneyvalley.org/athletics-training/",
      },
      { title: "Club sections and off-track running", url: "https://www.waveneyvalley.org/" },
    ],
    reviewed_at: "2026-10-13",
  },
};
