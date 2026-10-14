import type { ClubProfile } from "./club-profiles";

// Public sources opened on 13 October 2026. Historical associations are editorial
// context, not athlete identity verification or imported results.
export const communityClubProfiles: Record<string, ClubProfile> = {
  "4life-triathlon-club": {
    summary:
      "4Life Triathlon Club offers adult and junior swimming, cycling and running in East Leake, Nottinghamshire, with coached sessions and introductory trials.",
    biography: [
      "4Life Triathlon Club was founded by Dean Hughes in 2000 and developed a strong junior programme in the East Midlands. Its base is East Leake Leisure Centre in Nottinghamshire, where a pool and grass running tracks support training across the seasons. The club’s junior pathway helped Sophie Coldwell on her way to international triathlon.",
      "Adults can train for triathlon or choose a running-only membership, while juniors from eight can join subject to the published swimming requirements. The club offers trial sessions by arrangement; parents should contact the junior membership team so a child can be placed in a suitable group. Some junior sessions also use Loughborough Grammar School.",
    ],
    founded_year: 2000,
    notable_members: [
      {
        name: "Sophie Coldwell",
        connection: "Former junior member",
        detail:
          "The club records her progression from its junior section to international triathlon and the 2018 Commonwealth Games.",
      },
    ],
    corrections: {
      city: "East Leake",
      address: "East Leake Leisure Centre, Lantern Lane, East Leake, Nottinghamshire, LE12 6QN",
      postcode: "LE12 6QN",
      address_kind: "training",
    },
    sources: [
      { title: "Club origins and training base", url: "https://4lifetri.org.uk/our-club/" },
      {
        title: "Junior programme, trial requirements and Sophie Coldwell",
        url: "https://4lifetri.org.uk/join-us/juniors/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "altrincham-and-district-athletic-club-limited": {
    summary:
      "Altrincham and District Athletic Club trains at Timperley Track, offering running and track and field for juniors, adults and beginners in Greater Manchester.",
    biography: [
      "Altrincham and District Athletic Club was founded in 1961 and is based beside Timperley village in Greater Manchester, England. Its floodlit training ground combines a cinder oval with a synthetic sprint straight, jumping areas and throwing facilities. A grass trail and clubhouse give runners and field-event athletes a shared home close to the centre of the community.",
      "The club welcomes beginners as well as experienced competitors, with coached groups for juniors and adults. Members compete on the road, over cross-country and fells, and in track and field leagues. Prospective athletes can ask about a try-out through the membership page; there are also opportunities to help as a coach, official or volunteer. The Timperley track is separate from the club’s High Street postal address.",
    ],
    founded_year: 1961,
    corrections: {
      sports: ["Running", "Athletics"],
      address: "Timperley Recreation Ground, Park Road, Timperley, Altrincham, WA15 6UA",
      postcode: "WA15 6UA",
      address_kind: "training",
      website: "https://altrincham-athletics.co.uk/",
    },
    location_note:
      "Training is at Timperley Recreation Ground, behind the Scout Hut. The club separately publishes 19–21 High Street, Altrincham, WA14 1QP as its posting address.",
    sources: [
      {
        title: "Club background, disciplines and facilities",
        url: "https://altrincham-athletics.co.uk/",
      },
      {
        title: "Training location and separate postal address",
        url: "https://altrincham-athletics.co.uk/how-to-find-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "blackburn-harriers-and-ac": {
    summary:
      "Blackburn Harriers and Athletic Club is based at Witton Park Arena in Lancashire, with track and field, cross-country, road and fell running.",
    biography: [
      "Blackburn Harriers and Athletic Club dates from 1883. After a post-war revival and early training at Pleckgate, the opening of Witton Park’s track in 1958 helped the Lancashire club develop. Invitation meetings brought leading athletes to Blackburn, while its own members built a record in track and field, cross-country, road racing and the fells. The arena gained a new outdoor track and indoor facilities in 2015.",
      "The club’s history includes Olympic medallists Holly Bradshaw, Sophie Hitchon and Samantha Murray. Alongside that international record, Blackburn Harriers runs junior development and senior training groups and organises the Ribble Valley 10K. New members should use the club’s enquiry page to find the appropriate group, including its introductory run, jump and throw sessions for younger children.",
    ],
    founded_year: 1883,
    notable_members: [
      {
        name: "Holly Bradshaw",
        connection: "Olympian in the club’s history",
        detail: "Won pole vault bronze at the Tokyo Olympic Games in 2021.",
      },
      {
        name: "Sophie Hitchon",
        connection: "Olympian in the club’s history",
        detail: "Won hammer bronze at Rio 2016, the club’s first Olympic track and field medal.",
      },
      {
        name: "Samantha Murray",
        connection: "Blackburn Harrier recorded in the club history",
        detail: "Won modern pentathlon silver at London 2012 and the world title in 2014.",
      },
    ],
    corrections: {
      address: "Witton Park Arena, Preston Old Road, Blackburn, BB2 2TP",
      postcode: "BB2 2TP",
      address_kind: "training",
      website: "https://www.blackburnharriers.co.uk/",
    },
    sources: [
      {
        title: "Club history and international athletes",
        url: "https://www.blackburnharriers.co.uk/history/",
      },
      {
        title: "Membership enquiries and Witton Park headquarters",
        url: "https://www.blackburnharriers.co.uk/contact-us/",
      },
      {
        title: "Club disciplines and Ribble Valley 10K",
        url: "https://www.blackburnharriers.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "bolton-united-harriers-and-ac": {
    summary:
      "Bolton United Harriers and Athletics Club has been part of Bolton sport since 1908, with coached athletics at Leverhulme Park for a range of ages and abilities.",
    biography: [
      "Bolton United Harriers and Athletics Club has been running, jumping and throwing in Bolton since 1908. Its home is Leverhulme Park Athletics Track, off Long Lane, where indoor and outdoor facilities allow the club to train throughout the year. It welcomes people who want to improve their fitness as well as athletes preparing for competition.",
      "Qualified coaches lead a range of training groups, with the session times depending on the athlete’s group and event. Prospective members can email the club before visiting to discuss where to start. The club also maintains records and athlete interviews on its website and organises the Bolton 5K, connecting its regular training programme with local road racing.",
    ],
    founded_year: 1908,
    corrections: {
      address: "Leverhulme Park Athletics Track, Long Lane, Bolton, BL2 6EB",
      postcode: "BL2 6EB",
      address_kind: "training",
      website: "https://www.boltonunitedharriers.co.uk/",
    },
    sources: [
      {
        title: "Club background, training and membership enquiries",
        url: "https://www.boltonunitedharriers.co.uk/about-us/",
      },
      { title: "Club programme and Bolton 5K", url: "https://www.boltonunitedharriers.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "stockport-harriers-and-ac": {
    summary:
      "Stockport Harriers and AC trains at Woodbank Stadium, with track and field, endurance running, race walking and an inclusive disability athletics group.",
    biography: [
      "Stockport Harriers adopted its name in 1891 when Davenport Harriers, established in 1887, voted to change it. A reorganisation with Reddish and Marple Harriers followed in 1911, and Dash AC joined the club in 2014. Today its home is Woodbank Stadium in Offerton, Stockport, where coaching covers track and field, endurance running and race walking.",
      "Members compete on roads, fells and cross-country courses as well as the track, but recreational athletes are also welcome. The club has a dedicated inclusive group for athletes with a disability and organises the Stockport 10. Its published history records Olympic and Paralympic competitors alongside the volunteers who sustain coaching, events and community running at Woodbank Park.",
    ],
    founded_year: 1891,
    notable_members: [
      {
        name: "Ross Millington",
        connection: "Athlete in the club’s member history",
        detail:
          "Joined as a junior in 2002 and represented Great Britain in the 10,000m at Rio 2016.",
      },
      {
        name: "Jess Piasecki",
        connection: "Athlete in the club’s member history",
        detail:
          "European under-23 cross-country champion in 2012 and a marathon Olympian at Tokyo.",
      },
      {
        name: "Andrew Small",
        connection: "Paralympian in the club’s member history",
        detail: "Won 100m bronze at Rio 2016 and gold at the Tokyo Paralympics in 2021.",
      },
      {
        name: "Ron Hill",
        connection: "Occasional track representative and life vice-president",
        detail:
          "The marathon runner’s first-claim club was Clayton-le-Moors. Stockport records his occasional track appearances and election as life vice-president in 1998.",
      },
    ],
    corrections: {
      address: "Woodbank Stadium, Woodbank Park, Turncroft Lane, Offerton, Stockport, SK1 4JR",
      postcode: "SK1 4JR",
      address_kind: "training",
    },
    sources: [
      {
        title: "Activities, inclusive group and Woodbank Stadium",
        url: "http://stockportharriers.co.uk/",
      },
      {
        title: "Club history and predecessor clubs",
        url: "http://stockportharriers.co.uk/stockport-harriers-ac-history",
      },
      {
        title: "Historical member connections",
        url: "http://stockportharriers.co.uk/club-members-recent-years",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "warrington-a-c": {
    summary:
      "Warrington Athletic Club supports track and field, cross-country and road running, continuing an athletics tradition in the Cheshire town dating to 1884.",
    biography: [
      "Warrington Athletic Club traces its origins to 1884 and provides opportunities for athletes from Warrington and the surrounding area to train and compete. Its programme spans track and field, cross-country and road running, with members having represented both the club and their country beyond the local athletics scene.",
      "Coaches, officials and committee volunteers keep the club’s training and competition programme running. Its website brings together event information, club records, welfare guidance and the people behind the club. Anyone considering joining should contact the club directly for a suitable group and current training arrangements. This is a separate organisation from Warrington Road Runners and Warrington Running Club.",
    ],
    founded_year: 1884,
    corrections: { website: "https://warringtonac.co.uk/" },
    location_note:
      "The retained directory address is not confirmed here as a training venue. Ask the club for the meeting point for your group.",
    sources: [
      {
        title: "Club origins and athletics programme",
        url: "https://warringtonac.co.uk/who-we-are/",
      },
      { title: "Club enquiries", url: "https://warringtonac.co.uk/contact-us/" },
      { title: "Current club website", url: "https://warringtonac.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "warrington-road-runners": {
    summary:
      "Warrington Road Runners is an adult running club with road, trail, cross-country and track sessions based around Appleton and Victoria Park in Warrington.",
    biography: [
      "Warrington Road Runners has been active since 1977, bringing social and competitive runners together in Warrington, Cheshire. Its programme combines road routes around the south of the town with track sessions at Victoria Park, cross-country leagues and club championship races. Runners can work towards age-related standards or simply enjoy regular company on a run.",
      "Broomfields Leisure Centre in Appleton is a regular meeting point, while the track and other sessions have their own arrangements. The club also runs the Warrington 10K and organises social events. New runners can contact the chair or membership secretary about trying a session; its website asks participants to reserve training places through RunTogether. It is distinct from Warrington Athletic Club and Warrington Running Club.",
    ],
    founded_year: 1977,
    corrections: {
      address: "Broomfields Leisure Centre, Broomfields Road, Appleton, Warrington, WA4 3AE",
      postcode: "WA4 3AE",
      address_kind: "training",
    },
    location_note:
      "Broomfields is a club meeting point; track sessions use Victoria Park. Confirm the selected session and booking before travelling.",
    sources: [
      {
        title: "Club background, training and meeting point",
        url: "http://www.warringtonroadrunners.co.uk/",
      },
      {
        title: "Joining enquiries and club committee",
        url: "http://www.warringtonroadrunners.co.uk/aboutUs/contact.html",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "warrington-running-club": {
    summary:
      "Warrington Running Club meets at the Seven Woods in Westbrook, with sociable group runs, interval and hill sessions and support for different running abilities.",
    biography: [
      "Warrington Running Club is based in Westbrook, Warrington, and brings together runners of different backgrounds and speeds. Club runs use a regrouping approach: faster runners circle back towards those behind so the group can stay together. The emphasis is on building confidence and distance rather than treating each training night as a race.",
      "Members meet at the Seven Woods pub, with interval, hill, cross-country and strength work complementing the group runs. A club championship offers a way to try competitive running, and regular shared 5K routes help runners judge their progress between groups. Use the club’s contact form or email for joining advice and check the latest meeting details. Warrington Road Runners and Warrington Athletic Club are separate clubs.",
    ],
    corrections: {
      address: "Seven Woods pub, Westbrook, Warrington, WA5 8TE",
      postcode: "WA5 8TE",
      address_kind: "training",
    },
    sources: [
      {
        title: "Training approach and club activities",
        url: "https://www.warringtonrunningclub.co.uk/",
      },
      {
        title: "Club contact form and meeting point",
        url: "https://www.warringtonrunningclub.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-an-riocht-a-c": {
    summary:
      "An Ríocht Athletic Club is based at Crageens in Castleisland, County Kerry, with a floodlit athletics track and programmes for juvenile, senior and masters athletes.",
    biography: [
      "An Ríocht Athletic Club was founded in 1975 in Castleisland, County Kerry, Ireland. Years of local fundraising helped build its athletics and leisure complex at Crageens. The floodlit 400-metre track provides a home for training and competition, serving juvenile, senior and masters athletes from the area.",
      "The athletics programme includes track and field, cross-country and road running, with separate juvenile groups and advice for adults choosing a training group. The wider site also has a gym and fitness classes, but athletics-club membership and leisure-centre membership should not be assumed to be the same. Prospective members can use the Athletics Ireland club listing or ask the club about the programme that suits them.",
    ],
    founded_year: 1975,
    corrections: {
      city: "Castleisland",
      county: "Kerry",
      address: "An Ríocht, Crageens, Castleisland, County Kerry, V92 XV82",
      postcode: "V92 XV82",
      address_kind: "training",
      website: "https://www.riocht.ie/facilities/an-riocht-athletic-club/",
    },
    sources: [
      {
        title: "Athletics club origins and track",
        url: "https://www.riocht.ie/facilities/an-riocht-athletic-club/",
      },
      { title: "Juvenile and senior training", url: "https://www.riocht.ie/training/" },
      {
        title: "Athletics Ireland club location and enquiries",
        url: "https://membership.athleticsireland.ie/clubpage/An_Ríocht_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-ardee-and-district-a-c": {
    summary:
      "Ardee and District AC offers juvenile and adult athletics in County Louth, with track and field, cross-country, road running and the Seamie Weldon memorial races.",
    biography: [
      "Ardee and District Athletic Club’s present chapter began in 1992, initially under the revived Ferdia name before becoming Ardee and District in 2000. Athletics in the County Louth town reaches further back: Ferdia AC operated in the 1950s and early 1960s, followed by Ardee De La Salle AC from 1971 to 1986. The parish training field and generations of local volunteers connect those different eras.",
      "Today juveniles learn running, jumping and throwing, while adults train for cross-country, road races and longer distances. The Seamie Weldon Memorial 5K began in 2015, with a 10K added in 2022, honouring a club athlete, coach and committee member. New members should contact the secretary before attending: venues change with the season, and the club has announced temporary winter arrangements for October 2026.",
    ],
    founded_year: 1992,
    notable_members: [
      {
        name: "Sean Callan",
        connection: "Athlete of the 1950s–60s Ferdia AC predecessor",
        detail:
          "The club history records Louth, Leinster and All-Ireland cross-country titles; this is a historical association, not current membership.",
      },
    ],
    corrections: {
      city: "Ardee",
      county: "Louth",
      website: "https://ardeedistrictac.com/",
      address: "",
      postcode: "",
    },
    location_note:
      "Summer training uses the parish field on Drogheda Road. The homepage’s October 2026 notice moves winter juvenile sessions to Ardee Community School and Ardee Rugby Club while St Mary’s GFC’s pitch is maintained. Confirm your session; the directory also contains a separate correspondence address.",
    sources: [
      {
        title: "Three eras of athletics in Ardee and memorial races",
        url: "https://ardeedistrictac.com/about-us/",
      },
      {
        title: "Current groups and October 2026 venue notice",
        url: "https://ardeedistrictac.com/",
      },
      { title: "Secretary and joining enquiries", url: "https://ardeedistrictac.com/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-athenry-a-c": {
    summary:
      "Athenry AC offers juvenile and senior athletics in County Galway, with Moanbaun track sessions, social and tempo runs and the Fields of Athenry 10K.",
    biography: [
      "Athenry Athletic Club serves the County Galway town of Athenry in Ireland, with separate juvenile and senior sections. The Moanbaun athletics track is used for junior training and senior speed sessions, while other senior runs begin at the church car park. The club’s programme gives members both structured training and the company of a group on longer social runs.",
      "Juvenile sessions cater for children and teenagers, including those preparing for competition. Adults can combine speed, tempo and social running, and the club website carries information about Fit4Life, the local 5K series and the Fields of Athenry 10K. Joining enquiries go to the relevant senior or juvenile secretary; prospective members should confirm the current group and meeting point rather than assuming all sessions start at the track.",
    ],
    corrections: {
      city: "Athenry",
      county: "Galway",
      website: "https://www.athenryac.com/",
      address: "Moanbaun athletics track, Athenry, County Galway",
      postcode: "",
      address_kind: "training",
    },
    location_note:
      "The track is one training venue. The club also lists senior sessions starting at the church car park; check its training page for the appropriate meeting point.",
    sources: [
      { title: "Training groups and Moanbaun track", url: "https://www.athenryac.com/training" },
      { title: "Senior and juvenile joining guidance", url: "https://www.athenryac.com/joining" },
      { title: "Club contacts and event links", url: "https://www.athenryac.com/" },
      {
        title: "Athletics Ireland club listing",
        url: "https://membership.athleticsireland.ie/clubpage/Athenry_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-ballina-a-c": {
    summary:
      "Ballina Athletic Club is a volunteer-led club at Belleek in Ballina, County Mayo, with juvenile and adult athletics programmes and a dedicated track base.",
    biography: [
      "Ballina Athletic Club is a community athletics club in Ballina, County Mayo, Ireland. Its clubhouse and track are at Belleek, giving the town’s runners and athletes a local base. The club describes itself as a non-profit, volunteer-led sporting amenity with both juvenile and adult programmes.",
      "New members are welcome, with enquiries best directed to the club email published in Athletics Ireland’s current directory. That listing identifies the Belleek track and its Eircode, helping visitors distinguish this club from similarly named organisations overseas. Prospective athletes should confirm today’s training arrangements directly rather than relying on an older timetable or committee list.",
    ],
    corrections: {
      city: "Ballina",
      county: "Mayo",
      address: "Ballina Athletic Track, Belleek, Ballina, County Mayo, F26 C6H0",
      postcode: "F26 C6H0",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club background and community role",
        url: "https://ballinaathletics.wordpress.com/about/",
      },
      {
        title: "Current Athletics Ireland training location and email",
        url: "https://membership.athleticsireland.ie/clubpage/Ballina_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-bandon-a-c": {
    summary:
      "Bandon Athletic Club serves West Cork with track and field and road-running events, now based at its new six-lane athletics facility at Clancoolbeg.",
    biography: [
      "Bandon Athletic Club entered a new chapter on 11 April 2026 when its athletics facility at Clancoolbeg in Bandon, County Cork, was officially opened. Planning permission for the eight-acre site had been granted in 2021, followed by a project supported by public grants and local fundraising. Olympian Phil Healy cut the ribbon, with fellow Olympian and former Bandon athlete Nicola Tuthill also attending.",
      "The six-lane track gives the West Cork club its own training and competition base. Its community programme includes the annual Bandon road race, the Catherine Duggan Open Sports and summer athletics camps for children. Athletics Ireland’s opening report described a proposed indoor facility as a future ambition, not a completed building. Use the club’s published enquiry email to confirm joining and session arrangements at the new venue.",
    ],
    notable_members: [
      {
        name: "Phil Healy",
        connection: "Club member identified by Athletics Ireland in April 2026",
        detail:
          "The Olympian and European medallist officially opened Bandon’s new track on 11 April 2026.",
      },
      {
        name: "Nicola Tuthill",
        connection: "Began her athletics career with the club",
        detail:
          "Athletics Ireland records that the Olympian began her athletics career at Bandon AC and attended the new facility’s opening.",
      },
    ],
    corrections: {
      city: "Bandon",
      county: "Cork",
      address: "Bandon AC athletics facility, Clancoolbeg, Bandon, County Cork",
      postcode: "",
      address_kind: "training",
    },
    location_note:
      "The April 2026 opening report establishes Clancoolbeg as the new athletics base. The older directory’s Bandon AFC/Town Park address and Eircode are not used for this venue.",
    sources: [
      {
        title: "Athletics Ireland report of the new track, 16 April 2026",
        url: "https://www.athleticsireland.ie/bandon-ac-track-opened-by-olympian-phil-healy/",
      },
      {
        title: "Club enquiry email in the membership directory",
        url: "https://membership.athleticsireland.ie/clubpage/Bandon_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-bantry-a-c": {
    summary:
      "Bantry Athletic Club offers adult fitness running and juvenile athletics in West Cork, with cross-country, track events and a welcoming route into regular training.",
    biography: [
      "Bantry Athletic Club brings adults and children together for athletics in Bantry, County Cork, Ireland. The club describes a history stretching back more than fifty years, with regular training and a continuing welcome for new members. Its adult programme ranges from walk-and-run fitness sessions to preparation for marathons, allowing members to build up from their own starting point.",
      "Juveniles train across running, jumping and throwing disciplines and compete in cross-country and track events. Adult members also take part in road races, parkruns and marathons, with the social side of training an important part of club life. Enquiries can be made through the club’s contact form or its published chairperson’s address; current training updates are shared on the club’s Facebook and Instagram pages.",
    ],
    corrections: { city: "Bantry", county: "Cork", website: "https://www.bantryac.com/" },
    sources: [
      { title: "Adult and juvenile club programmes", url: "https://www.bantryac.com/" },
      { title: "Membership enquiries", url: "https://www.bantryac.com/contact" },
      {
        title: "Athletics Ireland club contact",
        url: "https://membership.athleticsireland.ie/clubpage/Bantry_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-blackrock-dublin-a-c": {
    summary:
      "Blackrock AC is a community athletics club in south Dublin, with juvenile coaching, adult running, Fit4Life and track, road, trail and cross-country competition.",
    biography: [
      "Blackrock Athletic Club was founded in 1944, growing from a small volunteer military unit into a community club in Blackrock, south Dublin. Its first national title came in 1950. The club has since developed juvenile, junior and adult sections, combining competitive athletics with recreational running and a Fit4Life programme introduced in 2013.",
      "Training covers track and field, cross-country, road and trail running. Carysfort Park is the clubhouse base, and beginners can ask about Couch to 5K while more experienced runners join the appropriate adult group. Club life extends to local races, shared trips and the annual Rory Byrne Run to the Forty Foot. Use the published joining guidance for age-group availability and current training arrangements.",
    ],
    founded_year: 1944,
    corrections: {
      city: "Blackrock",
      county: "Dublin",
      website: "https://blackrockac.ie/",
      address: "Carysfort Park, Carysfort Avenue, Blackrock, Dublin",
      postcode: "",
      address_kind: "clubhouse",
    },
    sources: [
      {
        title: "Club history, sections, activities and clubhouse",
        url: "https://blackrockac.ie/about/",
      },
      {
        title: "Athletics Ireland club identity",
        url: "https://membership.athleticsireland.ie/clubpage/Blackrock_(Dublin)_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-bohermeen-a-c": {
    summary:
      "Bohermeen Athletic Club in County Meath offers track and field, road running and cross-country, with a track and clubhouse beside Bohermeen Community Centre.",
    biography: [
      "Bohermeen Athletic Club’s roots go back to 1927, with revivals in 1954 and 1969. The current continuous chapter dates from 1969, and the County Meath club has remained active in cross-country, road racing and track and field. Its early history includes Pat Coyle, national cross-country champion in 1927 and 1928 and an Irish international.",
      "The club’s grounds beside Bohermeen Community Centre include a two-lane 400-metre track, a clubhouse and areas for jumping and throwing. Juvenile and adult athletes have opportunities to train and compete locally and further afield. The club also makes track access available through its membership arrangements; contact the club before visiting to confirm the appropriate group, access and current session details.",
    ],
    founded_year: 1969,
    notable_members: [
      {
        name: "Pat Coyle",
        connection: "Athlete of the club’s original 1920s era",
        detail:
          "The club records national cross-country titles in 1927 and 1928 and appearances for Ireland in Wales and Scotland.",
      },
    ],
    corrections: {
      city: "Bohermeen",
      county: "Meath",
      website: "https://www.bohermeenac.com/",
      address: "Bohermeen AC grounds, beside Bohermeen Community Centre, County Meath, C15 XW97",
      postcode: "C15 XW97",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club origins, revivals and international athletes",
        url: "https://www.bohermeenac.com/aboutus.html",
      },
      { title: "Training and track access", url: "https://www.bohermeenac.com/training.html" },
      {
        title: "Current facilities, location and contact",
        url: "https://membership.athleticsireland.ie/clubpage/Bohermeen_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-afan-valley-swimming-club": {
    summary:
      "Afan Valley Swimming Club is based at the community pool in Cymmer, South Wales, with public membership contacts and a Welsh Athletics listing for its running activities.",
    biography: [
      "Afan Valley Swimming Club is based at Afan Valley Swimming Pool on School Road in Cymmer, South Wales. The pool’s published development pathway offers progression from learning to swim towards club swimming, with competitive and non-competitive options. Families should ask the club which sessions suit a swimmer’s experience; pool lessons and club membership are separate enquiries.",
      "The club also appears in Welsh Athletics’ directory, which lists its social-running venue and public membership and welfare contacts. This gives the club a place in local land-based activity as well as swimming. New members can approach the membership secretary for current arrangements, while anyone seeking introductory swimming lessons should use the pool’s own booking information.",
    ],
    corrections: {
      address: "Afan Valley Swimming Pool, School Road, Cymmer, SA13 3EL",
      postcode: "SA13 3EL",
      address_kind: "training",
    },
    location_note:
      "The swimming pool is the published base. Pool lesson times and the club’s running sessions are different programmes; confirm the session directly.",
    sources: [
      {
        title: "Welsh Athletics club listing and role contacts",
        url: "https://www.welshathletics.org/en/club/view/afan-swim-club",
      },
      {
        title: "Pool location and development pathway into club swimming",
        url: "https://www.swimafan.co.uk/swimacademy.php",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-rhayader-rc": {
    summary:
      "Rhayader Running Club offers road and trail running around Rhayader and Llandrindod Wells in Powys, with beginner support, coached sessions and social runs.",
    biography: [
      "Rhayader Running Club was founded in 1984 and is based in the Mid Wales town of Rhayader. Its members run on the roads, trails and hills of Powys, with sessions around Rhayader and Llandrindod Wells. The programme welcomes beginners and returning runners as well as those working towards longer races and ultras.",
      "Regular sessions include structured training from Rhayader Leisure Centre, group runs in Llandrindod Wells and Sunday outings with different distances. The club also offers Couch to 5K support and opportunities to take part in local events. Prospective members can arrange a taster or email for a suitable group. Meeting points vary, and the club shares changes through its current communications rather than a single fixed venue.",
    ],
    founded_year: 1984,
    corrections: {
      address: "Rhayader Leisure Centre, Rhayader, Powys",
      postcode: "",
      address_kind: "training",
    },
    location_note:
      "The leisure centre is one meeting point. Llandrindod sessions and Sunday runs start elsewhere; confirm the chosen session with the club.",
    sources: [
      {
        title: "Club history, current sessions and joining enquiries",
        url: "https://www.rhayaderrc.wales/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-sarn-helen": {
    summary:
      "Sarn Helen is a running, cycling and triathlon club based in Lampeter, West Wales, with junior training, social runs, group rides and locally organised races.",
    biography: [
      "Sarn Helen brings runners, cyclists and triathletes together in Lampeter and the surrounding West Wales area. Adult running groups meet in Lampeter and Aberaeron, while junior sessions use Lampeter Leisure Centre. The club is affiliated to Welsh Athletics, Welsh Triathlon and British Cycling, reflecting a programme that extends beyond running alone.",
      "Members can join social runs, structured efforts and group rides, with separate running and cycling championships through the year. The club organises races including the Teifi 10, Sarn Helen Hill Race and Pumsaint Trail Half Marathon, giving members opportunities to compete and volunteer locally. Riders and runners should check the current arrangements for their group; the different meeting points are not a single clubhouse address.",
    ],
    corrections: {
      sports: ["Athletics", "Running", "Cycling", "Triathlon"],
      address: "",
      postcode: "",
    },
    location_note:
      "Adult sessions use several Lampeter and Aberaeron meeting points; junior training uses Lampeter Leisure Centre. Consult the club’s current programme before travelling.",
    sources: [
      {
        title: "Club disciplines, affiliations, training and race programme",
        url: "https://www.sarnhelen.org.uk/",
      },
      {
        title: "Club officers and coaching roles",
        url: "https://www.sarnhelen.org.uk/index.php/roles-responsibilities",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-trots": {
    summary:
      "Taf Running and Orienteering Team, known as TROTs, is based in St Clears, Carmarthenshire, with road, multi-terrain and cross-country running for different abilities.",
    biography: [
      "Taf Running and Orienteering Team was formed in October 1986 and is usually known as TROTs. Based in St Clears in south-west Wales, the club competes in road, multi-terrain and cross-country races. Its history includes strong women’s and veteran teams, while its regular sessions welcome runners with a wide range of goals and experience.",
      "The programme includes club runs from the Coach and Horses Surgery car park in St Clears and coached sessions in St Clears and Carmarthen. Members can choose distances and training suited to their experience, from improving a 5K to preparing for longer events. Use the club’s enquiry form and current session notices to arrange a first visit; meeting details should be confirmed before travelling.",
    ],
    founded_year: 1986,
    corrections: {
      city: "St Clears",
      county: "Carmarthenshire",
      address: "Coach and Horses Surgery car park, St Clears",
      postcode: "",
      address_kind: "training",
    },
    location_note:
      "The St Clears car park is a club-run meeting point, not a clubhouse or postal address. Some coached sessions use Carmarthen instead.",
    sources: [
      { title: "Club history, location and training programme", url: "https://www.trots.org.uk/" },
      { title: "Club enquiry form", url: "https://www.trots.org.uk/contact.php" },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-wrecsam-tri": {
    summary:
      "Wrecsam Triathlon Club is a North Wales swimming, cycling and running club whose history includes the development of triathlon races at Chirk and Bala.",
    biography: [
      "Wrecsam Triathlon Club began in 1995 when enthusiasts met at Gwyn Evans Sports Centre in Wrexham, North Wales, for triathlon-focused swimming led by centre manager Steve Bold. Originally called Wrexham Tri Hards, the club developed a race-organising role across the region. Its history records the first Chirk sprint race in 1998 and a Bala Olympic-distance event in 1999.",
      "Those events helped build a wider North Wales triathlon community, with later races at Mold and Denbigh and a middle-distance event at Bala. The club remembers Steve Bold through its account of a junior inter-regional race dedicated to him in 2002. Today prospective members can enquire by email and arrange trial sessions; current training details should be checked directly rather than inferred from the club’s historical venues.",
    ],
    founded_year: 1995,
    corrections: {
      sports: ["Running", "Triathlon", "Swimming", "Cycling"],
      website: "https://wrecsamtriclub.wixsite.com/wrecsam-triathlon-cl",
    },
    sources: [
      {
        title: "Club history, trials and public email links",
        url: "https://wrecsamtriclub.wixsite.com/wrecsam-triathlon-cl",
      },
    ],
    reviewed_at: "2026-10-13",
  },
};
