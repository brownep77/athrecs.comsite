import type { ClubProfile } from "./club-profiles";

// A second editorial batch, researched from the linked club histories and public pages.
// Historical athlete connections are descriptive; they do not link or claim accounts.
export const additionalClubProfiles: Record<string, ClubProfile> = {
  "bristol-and-west-ac": {
    summary:
      "Bristol & West Athletic Club traces its history to 1882, with a West Country athletics tradition and a training base at Whitehall Athletics Arena in Bristol.",
    biography: [
      "Bristol & West Athletic Club began in 1882 as South Bristol Harriers and took the Bristol Athletic Club name in 1897. A merger with Bristol South Harriers followed in 1957. The present name dates from 2004, reflecting a commitment to athletes across the wider West Country as well as Bristol itself.",
      "The club’s history spans track and field and distance running, including its part in staging the 2002 National Cross Country Championships at Ashton Court. Whitehall Athletics Arena became its base following the move from Whitchurch in 2011. Earlier generations include Mary Rand, who competed as Mary Bignal for predecessor club Bristol South Harriers, and senior Great Britain international Jo Pavey.",
    ],
    founded_year: 1882,
    notable_members: [
      {
        name: "Mary Rand",
        connection: "Athlete at predecessor Bristol South Harriers",
        detail:
          "Competed as Mary Bignal before becoming an Olympic long jump champion and world record holder.",
      },
      {
        name: "Jo Pavey",
        connection: "Historical club international",
        detail:
          "Listed as Joanne Davies-Pavey among the club’s senior Great Britain internationals.",
      },
    ],
    sources: [
      {
        title: "About Bristol & West Athletic Club",
        url: "https://www.bristolandwestac.org/about",
      },
      {
        title: "Official history of Bristol & West Athletic Club (PDF)",
        url: "https://www.bristolandwestac.org/_files/ugd/eaf2e5_3678b629477c4da695b481a54e77000c.pdf",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "hercules-wimbledon": {
    summary:
      "Hercules Wimbledon Athletic Club brings together two South London athletics traditions, with a history rooted in Wimbledon Park and a merger in 1967.",
    biography: [
      "Hercules Wimbledon Athletic Club was formed on 6 September 1967 when Hercules AC and Wimbledon AC joined forces. Hercules had started as a women’s club in Streatham in 1933, admitting men three years later. Wimbledon AC began in 1938 and re-formed in 1953 after the opening of the Wimbledon Park track.",
      "The merged club kept something of both identities: scarlet from Hercules and yellow from Wimbledon. Early road and cross-country successes were followed by entry into the national men’s athletics league in 1971. Its history also records the work of volunteers such as David Littlewood, a longstanding treasurer and later president whose officiating career took him to three Olympic Games.",
    ],
    founded_year: 1967,
    notable_members: [
      {
        name: "David Littlewood MBE",
        connection: "Former president and lifelong member",
        detail:
          "Served as club treasurer for 43 years and became an international athletics official, working at three Olympic Games.",
      },
    ],
    sources: [
      {
        title: "Hercules Wimbledon club history",
        url: "https://www.herculeswimbledonac.org.uk/history",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "serpentine-running-and-triathlon-club": {
    summary:
      "Serpentine Running and Triathlon Club is a volunteer-run central London club for road running, cross-country, track and field, triathlon and other multisport events.",
    biography: [
      "Serpentine Running and Triathlon Club grew out of a group training for the London Marathon in 1982. Road running remains part of its identity, but the central London club now covers cross-country, track and field and a broad range of multisport events. Adult beginners train alongside runners and triathletes with substantial racing experience.",
      "Triathlon activity ranges from sprint races to long-distance events, with duathlon, aquathlon and aquabike also represented. Volunteer coaches and organisers support both training and the social side of membership. The club has members living overseas, although its roots and main activities remain in London; newcomers can use the club’s joining information to find a suitable training group.",
    ],
    founded_year: 1982,
    sources: [
      {
        title: "About Serpentine Running and Triathlon Club",
        url: "https://www.serpentine.org.uk/about/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "cambridge-university-hare-and-hounds-club": {
    summary:
      "Cambridge University Hare and Hounds is the university’s cross-country running club, founded in 1880 and welcoming runners across a wide range of abilities.",
    biography: [
      "Cambridge University Hare and Hounds held its first club run on 7 February 1880. The first Varsity cross-country match against Oxford followed that December, beginning a fixture that became central to the club’s calendar. Its name recalls the early paper-chase format, in which the ‘hares’ laid a trail for other runners to follow.",
      "CUH&H remains the University of Cambridge’s cross-country running club, with cross-country recognised as a Full Blue sport. The club welcomes runners of different backgrounds and abilities, alongside those competing for university teams. Its programme includes college, inter-club and university racing; prospective students and existing students can find training and membership information on the official site.",
    ],
    founded_year: 1880,
    sources: [
      { title: "Hare and Hounds history", url: "https://cuhh.soc.srcf.net/about/history/" },
      {
        title: "About the university cross-country club",
        url: "https://cuhh.soc.srcf.net/about/club/",
      },
      { title: "Training and competition programme", url: "https://cuhh.soc.srcf.net/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "cambridge-university-ac": {
    summary:
      "Cambridge University Athletic Club offers coached track and field squads, college competitions, BUCS athletics and the historic Varsity match against Oxford.",
    biography: [
      "Cambridge University Athletic Club traces its beginnings to the University Sports held at Fenner’s in 1857. The organisation developed during the early 1860s, and the first Oxford–Cambridge Varsity athletics match took place in 1864. That competition remains a defining part of the club’s track and field season.",
      "Today CUAC has event squads led by coaches and supported by student leaders, with opportunities to try different disciplines before specialising. Athletes compete in college events, BUCS championships and Varsity matches. The history of participation has broadened too: the club appointed a women’s captain in 1970, a full women’s Varsity match followed in 1975, and para athletics featured in Varsity competition in 2024.",
    ],
    founded_year: 1857,
    sources: [
      { title: "About Cambridge University Athletic Club", url: "https://www.cuac.org.uk/about" },
      { title: "CUAC history", url: "https://www.cuac.org.uk/history" },
    ],
    reviewed_at: "2026-10-13",
  },
  "woodford-green-ac-with-essex-ladies": {
    summary:
      "Woodford Green AC with Essex Ladies is an athletics club at Ashton Playing Fields in Woodford Bridge, combining histories that include several Olympic athletes.",
    biography: [
      "Woodford Green AC with Essex Ladies took its present form in December 1998, when the two clubs merged. Woodford Green AC had been founded in 1908, developing from an earlier harriers section. Its green-and-white hoops reflected the nearby Epping Forest, while Ashton Playing Fields in Woodford Bridge became its post-war track home.",
      "Essex Ladies brought a distinguished athletics history of its own. Its athletes included Dorothy Manley, the 1948 Olympic 100m silver medallist, and Sally Gunnell, whose 400m hurdles career included Olympic gold in 1992 and a world title and world record in 1993. The combined club’s published history preserves the achievements and identities of both predecessors.",
    ],
    founded_year: 1998,
    notable_members: [
      {
        name: "Sally Gunnell",
        connection: "Athlete at predecessor Essex Ladies",
        detail:
          "Olympic 400m hurdles champion in 1992 and world champion and world record holder in 1993.",
      },
      {
        name: "Dorothy Manley",
        connection: "Athlete at predecessor Essex Ladies",
        detail: "Won the women’s 100m silver medal at the 1948 London Olympics.",
      },
    ],
    sources: [
      {
        title: "Woodford Green and Essex Ladies club history",
        url: "https://www.wgel.org.uk/club-woodford-green-ac",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "bournemouth-ac": {
    summary:
      "Bournemouth Athletic Club is based at Kings Park Athletic Centre, offering junior and senior track and field, cross-country and road running in Dorset.",
    biography: [
      "Bournemouth Athletic Club trains at Kings Park Athletic Centre and covers the main track and field disciplines alongside road running and cross-country. Members take part in regional and national leagues, with volunteer coaches and officials supporting the club’s training and competition programme.",
      "For younger athletes, the junior development sessions introduce running, jumping and throwing across the ages of eight to 14. The wider club caters for different ages and levels of experience, allowing athletes to build skills before focusing on particular events. Anyone interested in joining should check the relevant training group with the club, since arrangements differ between junior development and specialist disciplines.",
    ],
    sources: [
      {
        title: "Bournemouth AC activities and junior development",
        url: "https://www.bournemouthac.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "sutton-and-district-ac": {
    summary:
      "Sutton & District Athletic Club serves Sutton and South London, with junior, senior and masters athletics at the David Weir Leisure Centre in Carshalton.",
    biography: [
      "Sutton & District Athletic Club was created in 1985 through the merger of Sutton & Cheam Harriers and Mitcham AC. It serves runners and field-event athletes in Sutton, Surrey and the surrounding South London area, with coaching provided by volunteers.",
      "The club’s home at Carshalton Sports Arena gained refurbished facilities in 2003 and was used as an Olympic training camp in 2012. The venue was subsequently renamed the David Weir Leisure Centre. Club activity includes track and field, cross-country and sportshall athletics, with provision from school Year 5 through to masters competition. Prospective members can ask about the appropriate group for their age and chosen events.",
    ],
    founded_year: 1985,
    sources: [
      { title: "Sutton & District club information", url: "https://www.suttondistrictac.co.uk/" },
      {
        title: "Sutton & District history",
        url: "https://www.suttondistrictac.co.uk/aboutus.html",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "galway-triathlon-club": {
    summary:
      "Galway Triathlon Club provides coached swimming, cycling and running for Galway city and county, from first-time triathletes to experienced long-distance competitors.",
    biography: [
      "Galway Triathlon Club was founded in 2004 and draws members from Galway city, the county and surrounding areas. Its structured training programme brings swimming, cycling and running together for people preparing for a first race as well as those working towards longer-distance events.",
      "Members also take part in duathlon, aquathlon and aquabike, so there are ways to compete using two disciplines as well as all three. The club has a junior section for ages 16 to 18 and uses coached sessions to support progression. Its official membership information is the best starting point for finding the current programme and a suitable training group.",
    ],
    founded_year: 2004,
    corrections: { city: "Galway", county: "Galway" },
    sources: [{ title: "About Galway Triathlon Club", url: "https://www.galwaytri.ie/about-us/" }],
    reviewed_at: "2026-10-13",
  },
  "msc-tri": {
    summary:
      "MSC Tri is a triathlon club serving south Donegal, north Leitrim, north Sligo and north Fermanagh, with swimming, cycling and running across the region.",
    biography: [
      "MSC Tri was established in 2003 and serves a region stretching across south Donegal, north Leitrim, north Sligo and north Fermanagh. Its swim, bike and run programme reflects that geography, with members using coastal routes, inland lakes and the roads around several neighbouring towns.",
      "The club describes swimming at Mullaghmore Bay and Lough Melvin, winter pool training at Ballyshannon Leisure Centre, and cycling routes through Leitrim and Sligo. Running locations include Ballyshannon, Bundoran, Tullan Strand and Rossnowlagh. Sessions take place at different venues, so new members should confirm the meeting point and requirements for the particular activity they plan to join.",
    ],
    founded_year: 2003,
    location_note:
      "A regional club using several training locations. Confirm the venue with the club before attending.",
    sources: [
      { title: "MSC Tri club information", url: "https://www.msctri.ie/" },
      { title: "MSC Tri history and training locations", url: "https://www.msctri.ie/about" },
    ],
    reviewed_at: "2026-10-13",
  },
  "ucd-triathlon-club": {
    summary:
      "UCD Triathlon Club offers swimming, cycling and running at University College Dublin, with training for different abilities and opportunities to race in intervarsity events.",
    biography: [
      "UCD Triathlon Club brings swimming, cycling and running into the sporting programme at University College Dublin. It caters for different levels of experience, including students working towards a first triathlon and those looking for structured training alongside their studies.",
      "The club takes part in Triathlon Ireland events and the Intervarsity Championships. Members can use the programme to develop each discipline, prepare for competition or improve general fitness. UCD’s official club listing provides the route to current membership and training information.",
    ],
    corrections: { city: "Dublin", county: "Dublin" },
    sources: [
      {
        title: "UCD Sport: Triathlon Club",
        url: "https://www.ucd.ie/sport/clubs/clublist/triathlon/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "ryston-runners": {
    summary:
      "Ryston Runners is a West Norfolk athletics club founded in Downham Market in 1986, offering road running, cross-country and track and field for juniors and adults.",
    biography: [
      "Ryston Runners began at Ryston End in Downham Market in 1986. What started as a running club developed into a broader athletics club serving West Norfolk, including the Downham Market and King’s Lynn areas. Its programme now combines road running, cross-country and track and field.",
      "The club caters for juniors from school Year 4, seniors and masters, and prospective members can arrange a taster session before joining. It also stages its own events, including the Cross Country Grand Prix and the Wissey Festival’s five- and ten-mile races. Training arrangements vary by group, so visitors should book through the club rather than use its postal address as a meeting point.",
    ],
    founded_year: 1986,
    location_note:
      "The Federation Club address is for correspondence. Ask the club for the training venue for your group.",
    corrections: {
      address: "Federation Club, Lynn Road, Downham Market, Norfolk",
      postcode: "",
      address_kind: "correspondence",
      website: "https://rystonrunners.org.uk/",
      contact_url: "https://rystonrunners.org.uk/contact/",
    },
    sources: [
      {
        title: "About Ryston Runners",
        url: "https://rystonrunners.org.uk/about-the-athletics-club/",
      },
      { title: "Club events and joining information", url: "https://rystonrunners.org.uk/" },
      {
        title: "Ryston public contacts and postal address",
        url: "https://rystonrunners.org.uk/contact/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "swansea-harriers": {
    summary:
      "Swansea Harriers is a competitive athletics club founded in 1962, based at Swansea University Athletics Centre and offering junior, senior and masters training.",
    biography: [
      "Swansea Harriers was founded in 1962 and is based at Swansea University Athletics Centre on Sketty Lane. Its programme introduces younger athletes to track and field while providing specialist training and competition for older age groups. Junior entry starts from school Year 5, with seniors and masters also represented.",
      "Competition is central to the club: new athletes do not need previous experience, but are expected to train regularly and take part in suitable events. Its hall of fame includes world 400m hurdles champion Dai Greene, world 1500m medallist Hayley Tullett and Olympic discus thrower Philippa Roles. Their careers sit alongside the club’s continuing work developing athletes in Swansea.",
    ],
    founded_year: 1962,
    notable_members: [
      {
        name: "Dai Greene",
        connection: "Club hall of fame",
        detail:
          "Won the world 400m hurdles title in 2011, following European and Commonwealth titles in 2010.",
      },
      {
        name: "Hayley Tullett",
        connection: "Club hall of fame",
        detail: "World 1500m bronze medallist in 2003 and an Olympian in 2000 and 2004.",
      },
      {
        name: "Philippa Roles",
        connection: "Club hall of fame",
        detail: "Represented Great Britain in the discus at the 2004 and 2008 Olympic Games.",
      },
    ],
    corrections: {
      city: "Swansea",
      address: "Swansea University Athletics Centre, Sketty Lane, Sketty, Swansea, SA2 9AU",
      postcode: "SA2 9AU",
      address_kind: "training",
    },
    sources: [
      {
        title: "Swansea Harriers hall of fame",
        url: "https://www.swanseaharriers.co.uk/hall-of-fame/",
      },
      {
        title: "Track and field membership and competition",
        url: "https://www.swanseaharriers.co.uk/track-field/",
      },
      {
        title: "Swansea Harriers training location",
        url: "https://www.swanseaharriers.co.uk/location/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-port-talbot-harriers": {
    summary:
      "Port Talbot Harriers traces its roots to the YMCA Harriers formed in 1921, with a long history of running and athletics in the South Wales town.",
    biography: [
      "Port Talbot Harriers began as Port Talbot YMCA Harriers in 1921. The club became independent in 1961 after losing access to YMCA facilities, with a public meeting at the Municipal Buildings establishing Port Talbot Harriers and Athletic Club on 9 February that year.",
      "Its history records generations of local runners and administrators, from early member Ike O’Brien to his son Jim, who won the Welsh cross-country championship at Seven Sisters after the 1961 reorganisation. Longstanding administrator Arthur Williams also served as Welsh AAA president. The club marked its centenary in 2021, and its published history preserves the people and events behind a century of athletics in Port Talbot.",
    ],
    founded_year: 1921,
    notable_members: [
      {
        name: "Jim O’Brien",
        connection: "Historical club runner",
        detail:
          "Recorded in the club history as a Welsh cross-country champion at Seven Sisters following the 1961 reorganisation.",
      },
    ],
    sources: [
      {
        title: "Port Talbot Harriers club history",
        url: "https://www.porttalbotharriers.co.uk/club/history/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "highgate-harriers": {
    summary:
      "Highgate Harriers is a North London athletics club founded in 1879, based at Parliament Hill and home to the Night of the 10,000m PBs.",
    biography: [
      "Highgate Harriers has been part of North London athletics since 1879. Based at Parliament Hill, the club supports running, jumping and throwing, with coaching and competition backed by volunteer organisers and officials. Younger athletes can get involved through its junior and youth development activities.",
      "Parliament Hill is also the setting for the Night of the 10,000m PBs, an event established by Highgate volunteers in 2013. That initiative is a distinctive part of the club’s recent story, alongside its regular work with athletes developing their skills and working towards competition. The official club programme provides details of groups, open meetings and how to get involved.",
    ],
    founded_year: 1879,
    corrections: { city: "London" },
    sources: [
      {
        title: "Highgate Harriers club and event information",
        url: "https://www.highgateharriers.org.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "london-heathside": {
    summary:
      "London Heathside is a volunteer-run North London club for track and field, road running, cross-country and triathlon, formed by a merger in 2000.",
    biography: [
      "London Heathside was formed in April 2000 through the merger of North London AC and Muswell Hill Runners. The predecessor clubs dated from 1972 and 1981 respectively, bringing together athletics and road-running traditions from neighbouring parts of North London.",
      "The club draws athletes from areas including Haringey, Camden and Hackney, with activity across track and field, road running, cross-country and triathlon. Members volunteer to run training and competition, organise open meetings and host cross-country fixtures. Heathside also supports the YMCA Crouch End 10K, maintaining a connection between club athletics and local community races.",
    ],
    founded_year: 2000,
    sources: [
      { title: "London Heathside history", url: "https://www.londonheathside.org.uk/history" },
    ],
    reviewed_at: "2026-10-13",
  },
  "city-of-portsmouth-ac": {
    summary:
      "City of Portsmouth Athletic Club is based at the Mountbatten Centre, offering track and field, cross-country and road running from age eight through to masters.",
    biography: [
      "City of Portsmouth Athletic Club was formed in 1993 when Portsmouth AC and Portsmouth, Fareham & District AC merged. The histories of its predecessors reach back into the city’s nineteenth-century running and cycling clubs, giving the present organisation roots much older than its current name.",
      "The club is based at the Mountbatten Centre on Alex Way in Portsmouth. It caters for athletes from age eight, with no upper age limit, and combines track and field with cross-country and road running. Its published history follows the development of both men’s and women’s athletics locally, while the current programme gives new members a route into coached training and club competition.",
    ],
    founded_year: 1993,
    corrections: {
      city: "Portsmouth",
      address: "Mountbatten Centre, Alex Way, Portsmouth, PO2 8QT",
      postcode: "PO2 8QT",
      address_kind: "training",
    },
    sources: [
      {
        title: "About City of Portsmouth Athletic Club",
        url: "https://www.portsmouthathletic.co.uk/about",
      },
      {
        title: "Portsmouth club history and location",
        url: "https://www.portsmouthathletic.co.uk/club-history",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "cheltenham-and-county-harriers": {
    summary:
      "Cheltenham & County Harriers offers track and field, road running and cross-country in Gloucestershire, with coaching for young athletes from age nine through to adults.",
    biography: [
      "Cheltenham & County Harriers brings together runners, jumpers and throwers across Gloucestershire. The club supports athletes from age nine through to retirement and beyond, with event groups covering sprints, middle-distance running, throws and jumps as well as road running and cross-country.",
      "Younger members can also take part in sportshall athletics, introducing competition through a different format during the indoor season. Qualified volunteer coaches work with people beginning the sport and athletes progressing towards higher-level competition. Team events are part of club life, and new members should enquire about the coaching group that fits their age, experience and interests.",
    ],
    sources: [
      {
        title: "About Cheltenham & County Harriers",
        url: "https://www.cheltenhamharriers.co.uk/about-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "blackburn-road-runners": {
    summary:
      "Blackburn Road Runners is a Lancashire running club with paced groups, walking activities and races from road 5Ks to cross-country, fell running and ultras.",
    biography: [
      "Blackburn Road Runners offers group running in Blackburn and the surrounding Lancashire countryside. Regular runs start from Cherry Tree Cricket Club, while social ‘Run and Eat’ outings use other venues. Paced running groups cater for different speeds; the club asks runners to be able to cover at least three miles, and also provides a walking group.",
      "Members race on roads, trails, fells and cross-country courses, over distances ranging from 5K to ultras. Relays, a club championship and performance standards give runners different ways to set goals and take part. The social programme runs alongside training, making the club a place to find regular company as well as prepare for a particular race.",
    ],
    location_note:
      "Regular runs use Cherry Tree Cricket Club; some social outings have different starting points. Check the session details.",
    sources: [
      {
        title: "About Blackburn Road Runners",
        url: "https://www.blackburnroadrunners.net/about-the-club/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "taunton-ac": {
    summary:
      "Taunton Athletic Club has roots in the 1880s and offers junior and senior athletics in Somerset, including track and field, sportshall, cross-country and road running.",
    biography: [
      "Taunton Athletic Club traces its origins to the 1880s and continues to provide organised athletics in the Somerset town. Its junior and senior programme spans track and field, sportshall athletics, cross-country and road running, giving members several ways to take part through the seasons.",
      "Volunteer coaches support athletes developing basic skills as well as those progressing towards more demanding competition. The club describes a pathway from recreational participation to international athletics, while encouraging people to remain involved in sport over the longer term. Prospective members can contact the club to discuss their age, preferred events and the appropriate training group.",
    ],
    corrections: { city: "Taunton" },
    sources: [{ title: "About Taunton Athletic Club", url: "https://www.tauntonac.org/about-us" }],
    reviewed_at: "2026-10-13",
  },
  "winchester-district-ac": {
    summary:
      "Winchester & District Athletic Club was founded in 1976, with a history of community fundraising and athletics at the Bar End track in Winchester.",
    biography: [
      "Winchester & District Athletic Club was founded in 1976 by John Miller, following a fundraising run by his daughter Lynda the previous year. Early athletes trained on a school grass track with limited equipment. The club later promoted the Mayor’s Marathon and Half Marathon in 1982, helping establish a wider programme of athletics in Winchester.",
      "A major change came when the Bar End track became available in 2008, with an official opening in 2009. The facility was developed through a city council and university project, supported by fundraising from club members. The club became a Charitable Incorporated Organisation in 2018. Its history documents the volunteers and local partnerships that built the facilities used by later generations.",
    ],
    founded_year: 1976,
    sources: [
      { title: "Winchester & District club history", url: "https://www.wadac.org.uk/club-history" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-newport-harriers": {
    summary:
      "Newport Harriers is a Welsh athletics club established in 1896, supporting junior, senior, masters and para athletes across track, field and running disciplines.",
    biography: [
      "Newport Harriers was established in 1896 and has a long association with athletics in the South Wales city. The club’s activities include track and field, cross-country, road running and fell running, with junior, senior, masters and para athletes represented.",
      "Coaches, officials and other volunteers support the training and competition programme. Alongside opportunities for athletes, the club welcomes people interested in helping run the sport. Coaching groups can reach capacity, so anyone considering membership should contact the club before attending to establish whether a suitable place is available.",
    ],
    founded_year: 1896,
    sources: [
      { title: "About Newport Harriers", url: "https://www.newportharriers.com/about-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-aberystwyth-ac": {
    summary:
      "Aberystwyth Athletic Club offers road, trail and hill running on the west coast of Wales, with senior training groups and a junior programme.",
    biography: [
      "Aberystwyth Athletic Club brings together runners on the west coast of Wales, from people starting out to experienced competitors. Its surroundings offer a mix of town roads, coastal routes and Welsh hills, reflected in a programme that includes road, trail and hill running.",
      "Senior activities include social runs, speed and endurance sessions, women’s groups and running-buggy sessions. There is also a junior programme. Different sessions serve different needs, so the club’s current timetable and enquiry contact are useful starting points for choosing a group, checking the meeting place and finding out how to join.",
    ],
    sources: [
      {
        title: "Aberystwyth AC activities and training",
        url: "https://aberystwythac.wordpress.com/",
      },
      { title: "Aberystwyth club contacts", url: "https://aberystwythac.wordpress.com/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "reading-ac": {
    summary:
      "Reading Athletic Club was founded in 1881 and is based at Palmer Park Stadium, with junior, senior and veterans’ track and field, road running and cross-country.",
    biography: [
      "Reading Athletic Club has been part of the town’s sporting life since 1881. Its home is Palmer Park Stadium on Wokingham Road, where qualified coaches work with athletes from school Year 5 through to adult and veteran groups. Track and field sits alongside cross-country, road running and sportshall competition.",
      "The club’s 125th-anniversary history, compiled by Brian Bacon in 2006, records athletes including Ann Packer, Kathy Cook, Beverley Callender and Gerry Stevens. That history sits alongside a continuing junior development programme and opportunities to represent the club in league competition. New members can enquire about a group suited to their age and event interests.",
    ],
    founded_year: 1881,
    notable_members: [
      {
        name: "Ann Packer",
        connection: "Historical club athlete",
        detail:
          "Named in the club’s account of its 125th-anniversary history, compiled by Brian Bacon.",
      },
      {
        name: "Kathy Cook",
        connection: "Historical club athlete",
        detail: "Included among the athletes featured in Reading AC’s published history.",
      },
    ],
    corrections: {
      city: "Reading",
      address: "Palmer Park Stadium, Wokingham Road, Reading, RG6 1LF",
      postcode: "RG6 1LF",
      address_kind: "training",
    },
    sources: [
      { title: "Reading AC history, training and location", url: "https://www.readingac.com/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "newham-and-essex-beagles-ac": {
    summary:
      "Newham & Essex Beagles is an East London athletics club training at the London Marathon Community Track, with junior and senior coaching across track, field and distance running.",
    biography: [
      "Newham & Essex Beagles is rooted in East London and trains at the London Marathon Community Track beside London Stadium in Queen Elizabeth Olympic Park. Its programme covers track and field, road running and cross-country, with junior and senior athletes working in coached groups.",
      "The Junior Academy provides a route into athletics, while team managers coordinate entry to club competitions and athletes can also take part in open meetings. Christine Ohuruogu is named as president emeritus on the club’s official site. New members should use the club’s joining information to find the right training group and confirm arrangements before visiting the track.",
    ],
    notable_members: [
      {
        name: "Christine Ohuruogu",
        connection: "President emeritus",
        detail: "Named as president emeritus in the club’s official leadership information.",
      },
    ],
    corrections: {
      city: "London",
      address: "London Marathon Community Track, Marshgate Lane, London, E20 8ST",
      postcode: "E20 8ST",
      address_kind: "training",
    },
    sources: [
      {
        title: "Newham & Essex Beagles training, leadership and contacts",
        url: "https://www.newhamandessexbeagles.com/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "norfolk-gazelles": {
    summary:
      "Norfolk Gazelles is a Norwich running club with coached sessions at the UEA athletics track, social runs and local events including the Valentine’s 10K.",
    biography: [
      "Norfolk Gazelles brings together runners of different standards in Norwich. Coached training at the UEA athletics track is complemented by social runs, giving members opportunities to work on their running and enjoy regular company away from race day.",
      "The club’s calendar includes the Valentine’s 10K and Alex Moore Relay, alongside social activities, awards and parkrun meet-ups. New runners can request a taster through the training team. Sessions use a booking process, so prospective members should wait for confirmation and check the venue rather than arrive at a session without an agreed place.",
    ],
    location_note:
      "Track sessions use the UEA athletics track; other runs have separate meeting points. Confirm the venue when booking.",
    sources: [
      {
        title: "Norfolk Gazelles training, tasters and events",
        url: "https://www.norfolkgazelles.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "city-of-norwich-ac": {
    summary:
      "City of Norwich Athletic Club was formed in 1996 and offers competitive track and field, cross-country and road running, with junior development and adult groups.",
    biography: [
      "City of Norwich Athletic Club, usually known as CoNAC, was formed in 1996 through the merger of Duke Street Running Club and Norfolk Olympiads Athletic Club. It became a charity in 2016. The club combines track and field with cross-country and road running, supported by volunteers and a programme for younger athletes.",
      "CoNAC is a competition-focused club: members are expected to train regularly and make themselves available for appropriate team events. Its younger-athlete provision includes Athletics 365, while older juniors and adults join event or running groups. Places depend on coaching capacity, so prospective members should follow the relevant application or waiting-list route before attending a session.",
    ],
    founded_year: 1996,
    sources: [
      { title: "About City of Norwich Athletic Club", url: "https://conac.org.uk/about-the-club/" },
      {
        title: "CoNAC membership and training-group applications",
        url: "https://conac.org.uk/join-conac/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "norwich-road-runners": {
    summary:
      "Norwich Road Runners trains from Sewell Park Academy, with paced road runs, coached sessions and a junior section for runners aged eight to 16.",
    biography: [
      "Norwich Road Runners grew from small groups running together in the early 1980s. Some first raced as Fitt Signs and then Midnight Runners; the Norwich Road Runners name was adopted around 1983–84, and the club became affiliated in 1985. Its history records six founders who brought those early groups together.",
      "Today the club meets at Sewell Park Academy on Constitution Hill. Its adult programme includes easier runs, coached interval sessions and road runs divided by pace, while the junior section caters for ages eight to 16. Membership and taster enquiries have their own route on the club website. Junior places may be limited, so families should obtain an offer before completing registration.",
    ],
    location_note:
      "Use the Constitution Hill entrance for Sewell Park’s sports facilities. The junior page says there is no sports-centre access from St Clements Hill.",
    corrections: {
      city: "Norwich",
      address: "Sewell Park Academy Sports Centre, Constitution Hill, Norwich, NR3 4BB",
      postcode: "NR3 4BB",
      address_kind: "training",
      contact_url: "https://www.norwichroadrunners.co.uk/contact-us",
    },
    sources: [
      {
        title: "Norwich Road Runners club history and governance",
        url: "https://www.norwichroadrunners.co.uk/club-information",
      },
      {
        title: "Training venue and joining enquiries",
        url: "https://www.norwichroadrunners.co.uk/contact-us",
      },
      {
        title: "Junior runners and sports-centre access",
        url: "https://www.norwichroadrunners.co.uk/junior-runners",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "cambridge-harriers": {
    summary:
      "Cambridge Harriers is a South East London athletics club serving Greenwich and Bexley, founded in 1890 and offering track and field, road, cross-country and race walking.",
    biography: [
      "Cambridge Harriers is based in South East London, serving Greenwich and Bexley. It was formed on 18 July 1890 by members of Cambridge Cricket Club who wanted winter sporting activity, and held its first run on Blackheath that October. The name comes from that cricket club, rather than a base in the city of Cambridge.",
      "Members now take part in track and field, road running, cross-country, fell running and race walking. Training locations include Sutcliffe Park Sports Centre and local parks, with a clubhouse in Bexley. The club’s Olympians list records javelin thrower Steve Backley at four Games from 1992 to 2004 and sprinter Daryll Neita at Rio, Tokyo and Paris.",
    ],
    founded_year: 1890,
    notable_members: [
      {
        name: "Steve Backley",
        connection: "Club Olympians list",
        detail:
          "Represented in the club’s Olympic record for the javelin at Barcelona 1992, Atlanta 1996, Sydney 2000 and Athens 2004.",
      },
      {
        name: "Daryll Neita",
        connection: "Club Olympians list",
        detail:
          "Listed for sprint and relay appearances at the Rio, Tokyo and Paris Olympic Games.",
      },
    ],
    location_note:
      "A South East London club with several training sites. Check the location for the relevant event group.",
    sources: [
      { title: "Cambridge Harriers history", url: "https://www.cambridgeharriers.org/history" },
      {
        title: "Club activities and South East London locations",
        url: "https://www.cambridgeharriers.org/",
      },
      { title: "Cambridge Harriers Olympians", url: "https://www.cambridgeharriers.org/olympians" },
    ],
    reviewed_at: "2026-10-13",
  },
  "cambridge-triathlon-club": {
    summary:
      "Cambridge Triathlon Club offers year-round swim, bike and run training for juniors and adults in Cambridgeshire, from first events to long-distance racing.",
    biography: [
      "Cambridge Triathlon Club provides coached training throughout the year for junior and senior members in Cambridgeshire. Its athletes take part in triathlon, duathlon and aquathlon, as well as individual swimming, cycling and running events. Experience ranges from first-time competitors to athletes racing at international level, across supersprint and long-distance formats.",
      "Members help organise club events, including the Rob McLean Junior Triathlon for under-16s. A club championship brings together selected local and national races, while relay outings, social activities and an annual awards dinner provide opportunities to meet beyond training. The official programme sets out current sessions and how new members can take part.",
    ],
    sources: [
      {
        title: "About Cambridge Triathlon Club",
        url: "https://www.cambridgetriathlonclub.com/the-club/about-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
};
