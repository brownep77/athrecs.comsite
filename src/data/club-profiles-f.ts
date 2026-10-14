import type { ClubProfile } from "./club-profiles";

// Sources opened on 13 October 2026. Club history is editorial context only;
// it does not create athlete identities, results or verified membership claims.
export const midlandsAndIrelandClubProfiles: Record<string, ClubProfile> = {
  "charnwood-a-c": {
    summary:
      "Charnwood AC trains at Loughborough University’s Paula Radcliffe Stadium, with athletics coaching, road running and cross-country for juniors through to masters.",
    biography: [
      "Charnwood Athletic Club has been part of Loughborough’s sporting life since 1975. Based at the Paula Radcliffe Stadium at Loughborough University, the Leicestershire club offers coaching in sprints, hurdles, distance running, jumps and throws. Its programme takes athletes from introductory sessions into track and field, road and cross-country competition.",
      "The club celebrated its fiftieth anniversary in 2025. Parents and volunteers help deliver training, officiate and support the open meetings, while age-group teams give members a route into league and championship athletics. Newcomers can request a free taster through the club website; the club confirms availability before attendance, and training sessions are booked separately from annual membership.",
    ],
    founded_year: 1975,
    notable_members: [
      {
        name: "Hannah Nuttall",
        connection: "Charnwood athlete in British Athletics’ 2026 championship report",
        detail:
          "Won a second consecutive British 5000m title at the 2026 UK Athletics Championships.",
      },
    ],
    corrections: { address_kind: "training", website: "https://charnwoodac.co.uk/" },
    sources: [
      { title: "Club history and stadium", url: "https://charnwoodac.co.uk/about" },
      { title: "Trial sessions and joining", url: "https://charnwoodac.co.uk/join" },
      { title: "Training and enquiries", url: "https://charnwoodac.co.uk/contact" },
      {
        title: "British Athletics report on the 2026 UK Championships",
        url: "https://www.britishathletics.org.uk/hunt-and-glave-reign-supreme-in-100m-finals-in-day-one-of-novuna-uk-athletics-championships/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "coventry-triathletes": {
    summary:
      "Coventry Triathletes combines swimming, cycling and running across Coventry, with roots in the Sentridge Club formed in 1989 and its own sprint triathlon.",
    biography: [
      "Coventry Triathletes began as the Sentridge Club in November 1989, founded by Tony Nutt and a colleague. Known for their spotted kit, the club draws members from Coventry, Warwickshire and the wider West Midlands. Its history includes group trips to Windsor and Belgium’s Brasschaat triathlon, alongside the local Coventry Sprint Triathlon that it organises.",
      "Coached pool swimming takes place at King Henry VIII Sports Centre, while member-led runs meet at War Memorial Park. Social rides and informal training groups bring the three disciplines together without requiring everyone to pursue the same race distance. Membership and session bookings use TeamUp; the membership secretary can help newcomers choose the appropriate option and explain separate governing-body memberships.",
    ],
    founded_year: 1989,
    location_note:
      "Swimming uses King Henry VIII Sports Centre, Warwick Road, CV3 6AQ. Runs meet at the main car-park entrance on Kenilworth Road, War Memorial Park, CV3 6PT. These are separate training venues; check the session booking before travelling.",
    corrections: {
      address: "",
      postcode: "",
      location_precision: "area-only",
      website: "https://covtri.co.uk/",
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    sources: [
      { title: "Club origins and history", url: "https://covtri.co.uk/category/our-history/" },
      { title: "Swim, run and ride arrangements", url: "https://covtri.co.uk/training-sessions/" },
      { title: "Membership enquiries and joining", url: "https://covtri.co.uk/join-now/" },
      { title: "Club activities and enquiry form", url: "https://covtri.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "leamington-athletics-academy": {
    summary:
      "Leamington Athletics Academy offers junior track and field at Edmondscote in Leamington Spa, with age-group coaching and opportunities for disabled athletes.",
    biography: [
      "Leamington Athletics Academy introduces children and teenagers in Leamington Spa and Warwick to running, jumping and throwing. Training is based at Edmondscote Athletics Track, with groups progressing from games-based Minis sessions to more technical junior and teen athletics. The academy combines England Athletics’ Athletics365 approach with its own coaching curriculum.",
      "Competition is encouraged when an athlete is ready, but taking part for enjoyment and fitness is welcome too. The seasonal programme includes indoor sportshall and cross-country as well as outdoor track and field. The club publishes opportunities for athletes with special educational needs and disabilities, including cerebral palsy. Families request a place through the online booking or waiting-list system and can contact the academy about a suitable group.",
    ],
    location_note:
      "The training base is Edmondscote Athletics Track in Leamington Spa, not the Warwick street address previously supplied by the directory. This academy is a separate organisation from Leamington Cycling & Athletics Club.",
    corrections: {
      city: "Leamington Spa",
      address: "Edmondscote Athletics Track, Leamington Spa, CV32 6AD",
      postcode: "CV32 6AD",
      address_kind: "training",
    },
    sources: [
      {
        title: "Academy coaching and competition",
        url: "https://www.leamingtonathletics.co.uk/about",
      },
      {
        title: "Age groups, inclusive sessions and waiting lists",
        url: "https://www.leamingtonathletics.co.uk/join",
      },
      {
        title: "Role contacts and track address",
        url: "https://www.leamingtonathletics.co.uk/help",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "leamington-cycling-and-athletics-club": {
    summary:
      "Leamington Cycling & Athletics Club brings track and field, running and cycle time trials together, with an athletics home at Edmondscote in Leamington Spa.",
    biography: [
      "Leamington Cycling & Athletics Club was formed in September 1928 when the town’s cycling and athletic clubs joined together. Its athletics history reaches further back to Leamington Harriers in 1868. Edmondscote became a cinder-track venue in 1962 and gained an all-weather surface in 1986, providing a lasting home for local running, jumping and throwing.",
      "Today the club has separate athletics and cycling sections. At Edmondscote, juniors and adults can train for competition or personal fitness; the cycling section runs summer road time trials and hill climbs. The athletics roll of honour includes Paralympian Bob Matthews and international distance runner Sue Harrison. Prospective members should contact the relevant section, which has its own website and enquiry address.",
    ],
    founded_year: 1928,
    notable_members: [
      {
        name: "Bob Matthews",
        connection: "Historical club Paralympian",
        detail:
          "The club’s roll of honour records his appearances at Atlanta 1996, Sydney 2000 and Athens 2004.",
      },
      {
        name: "Sue Harrison",
        connection: "International athlete in the club roll of honour",
        detail:
          "Represented Great Britain in marathon and ultradistance competition, including European 100km bronze in 2013.",
      },
      {
        name: "Cavin Woodward",
        connection: "Historical club distance runner",
        detail:
          "Remembered in the club history for world records over 50 miles, 150km and 100 miles.",
      },
    ],
    corrections: {
      address_kind: "training",
      website: "https://leamingtoncyclingandathletics.org.uk/",
    },
    sources: [
      {
        title: "Club sections and Edmondscote address",
        url: "https://leamingtoncyclingandathletics.org.uk/",
      },
      {
        title: "Club origins and track development",
        url: "https://leamingtonathletics.club/club-history/",
      },
      {
        title: "International and Paralympic roll of honour",
        url: "https://leamingtonathletics.club/roll-of-honour/",
      },
      { title: "Cycling section and time trials", url: "https://leamington-cycling.com/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "nuneaton-harriers": {
    summary:
      "Nuneaton Harriers is based at the Pingles Stadium in Warwickshire, offering junior athletics, track and field, cross-country and adult running groups.",
    biography: [
      "Nuneaton Harriers Athletic Club trains at the Pingles Stadium in Nuneaton, where an eight-lane, floodlit all-weather track and clubhouse support its athletics programme. Children can start in the junior section from age seven, while older athletes train in event groups or join the adult running sessions. Track and field sits alongside road running and cross-country.",
      "The club welcomes social runners as well as athletes aiming for higher-level competition. Its programme includes open meetings and the Nuneaton 10K, and it received the West Midlands regional Club of the Year award in 2020. Training sessions are booked through the Pingles Stadium website; new members can use the club’s public email or contact page to ask which group to try.",
    ],
    corrections: {
      city: "Nuneaton",
      address: "The Pingles Stadium, Nuneaton, CV11 4LX",
      postcode: "CV11 4LX",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club programme, award and stadium contact",
        url: "https://www.nuneatonharriers.org.uk/",
      },
      {
        title: "Junior and adult athletics",
        url: "https://www.nuneatonharriers.org.uk/copy-of-home",
      },
      { title: "Club enquiries", url: "https://www.nuneatonharriers.org.uk/contact-us" },
    ],
    reviewed_at: "2026-10-13",
  },
  "rugby-and-northampton-ac": {
    summary:
      "Rugby & Northampton AC links two Midlands athletics communities, with track and field, cross-country and running groups at Rugby and Moulton College.",
    biography: [
      "Rugby & Northampton Athletic Club was formed on 1 April 2002 by the merger of Rugby & District AC and Northampton Phoenix AC. Both brought long local histories: Rugby’s roots lay in an engineering works’ recreation club, while Northampton Phoenix had revived athletics in the town in 1972 after an earlier club closed. The merged club competes in track and field, cross-country and road running.",
      "Members use tracks in both towns: Rugby Athletic Track beside the Queen’s Diamond Jubilee Sports Centre, and Moulton College near Northampton. Coaching spans young athletes, seniors and masters, with separate running groups for different starting points. The club’s hall of fame includes masters distance runner Angela Copson and international 800m athlete Damien Moss. Joining enquiries are routed by age group and training location through the club contact page.",
    ],
    founded_year: 2002,
    notable_members: [
      {
        name: "Angela Copson",
        connection: "Club hall of fame; joined in 2007",
        detail:
          "Began running in her late fifties and went on to set world masters W60 records at 3000m and 5000m, as recorded in the club’s historical profile.",
      },
      {
        name: "Damien Moss",
        connection: "Club international and former Northampton Phoenix junior",
        detail:
          "Joined the predecessor club in 1995 and represented Great Britain at the 2008 World Indoor Championships over 800m.",
      },
    ],
    location_note:
      "The club uses both Moulton College Athletics Track, Pitsford Centre Gate 4, NN3 7QL, and Rugby Athletic Track, Bruce Williams Way, CV22 5LJ. Confirm the venue for your training group.",
    corrections: { address_kind: "training", website: "https://randnac.org/" },
    sources: [
      { title: "Merger and predecessor histories", url: "https://randnac.org/history/" },
      { title: "Two training venues and club programme", url: "https://randnac.org/about/" },
      { title: "Historical athlete hall of fame", url: "https://randnac.org/hall-of-fame/" },
      { title: "Age-group and location enquiry forms", url: "https://randnac.org/contact-us/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "tipton-harriers": {
    summary:
      "Tipton Harriers is a Black Country athletics club based at Tipton Sports Academy, with a history stretching back to independence from Birchfield Harriers in 1910.",
    biography: [
      "Tipton Harriers became independent of Birchfield Harriers in 1910. Its subsequent growth helped shape athletics in the Black Country: the Dudley branch became a separate club in 1924, part of the history preserved by today’s Dudley & Stourbridge Harriers. Tipton’s own best-known historical runners include Jack Holden, winner of both the European and Empire Games marathons in 1950.",
      "The club’s present training base is Tipton Sports Academy on Wednesbury Oak Road in Tipton, West Midlands. Sandwell’s local activities directory lists Tuesday and Thursday evening sessions there. Anyone planning a first visit should ask the club about the right group and current arrangements; the directory’s earlier Wednesbury correspondence-style address is not the athletics venue.",
    ],
    founded_year: 1910,
    notable_members: [
      {
        name: "Jack Holden",
        connection: "Historical Tipton Harriers member",
        detail:
          "Won four International Cross Country titles and the European and Empire Games marathons in 1950; his club connection is recorded by World Athletics.",
      },
    ],
    corrections: {
      city: "Tipton",
      county: "West Midlands",
      address: "Tipton Sports Academy, Wednesbury Oak Road, Tipton, DY4 0BS",
      postcode: "DY4 0BS",
      address_kind: "training",
    },
    sources: [
      {
        title: "Sandwell club listing and training venue",
        url: "https://www.visitsandwell.com/finditdoit/things-to-do/tipton-harriers-p1569811",
      },
      { title: "Dudley club history and Tipton origins", url: "https://dashac.co.uk/history.html" },
      {
        title: "World Athletics tribute to Jack Holden",
        url: "https://worldathletics.org/news/news/marathon-and-cross-country-legend-jack-holden",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-barf-ni": {
    summary:
      "BARF combines fell running and climbing around Belfast and the Mourne Mountains, with winter hill sessions, summer trails and an informal mountain-club tradition.",
    biography: [
      "The Belfast Association of Rockclimbers and Fellrunners, usually shortened to BARF, grew from a small group of climbers and runners around 1991. Its published 1997 club profile describes an informal beginning and a shared interest in the hills rather than a single racing discipline. That combination of mountain running and climbing remains central to the Northern Ireland club.",
      "Winter training mixes road or track intervals with off-road hill sessions around Belfast; summer brings social trail runs and the hill-racing season. The club organises Mourne races including the Seven Sevens and Turkey Trot, and its 2026 programme included the Denis Rankin Round Relay. Newcomers can try sessions before joining, but should check the published meeting point and equipment guidance, including the winter head-torch requirement.",
    ],
    location_note:
      "Meeting points vary around Belfast and the hills. Use the club’s monthly training schedule rather than treating Belfast as one fixed venue.",
    sources: [
      { title: "Historical club profile, published June 1997", url: "https://barfni.co.uk/about/" },
      { title: "Seasonal training and equipment guidance", url: "https://barfni.co.uk/training/" },
      { title: "Trial sessions and membership contact", url: "https://barfni.co.uk/membership/" },
      { title: "Club races and 2026 relay", url: "http://barfni.co.uk/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-belfast-running-club": {
    summary:
      "Belfast Running Club trains around Ormeau Park and south Belfast, offering group running and a two-week trial for runners who can already cover 5K.",
    biography: [
      "Belfast Running Club brings together runners from across the greater Belfast area for sessions in the south of the city. Ormeau Park is its usual home area, although the club has no premises of its own. The programme combines Tuesday training around Ormeau with Thursday sessions at varying locations.",
      "Prospective members are asked to make contact before attending and can try two weeks of training before deciding whether to join. The recommended starting point is being able to run 5K. A club race series, parkrun outings and member stories sit alongside the training programme, giving runners ways to get involved beyond the weekly sessions. Check the club’s current schedule for the exact meeting point.",
    ],
    location_note:
      "The club explicitly states that it has no club premises. Ormeau Park is its home area, not a clubhouse or postal address.",
    sources: [
      {
        title: "Training, joining and no-premises statement",
        url: "https://www.belfastrunningclub.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-mallusk-harriers": {
    summary:
      "Mallusk Harriers is a Newtownabbey athletics club founded in 2010, with junior and senior training and the Run Newtownabbey Couch to 5K programme.",
    biography: [
      "Mallusk Harriers was founded in 2010 and serves Newtownabbey and the surrounding area of Northern Ireland. Its junior and senior sections take part in road running, cross-country, trails and track and field. Volunteers, coaches and members support a programme that makes room for recreational runners as well as competitive athletes.",
      "For complete beginners, Run Newtownabbey provides a spring Couch to 5K route into regular running. Runners who can already manage 5K comfortably can email the membership officer to arrange a trial at a Tuesday senior session. The club also has community connections with Valley parkrun and Brown Shoes Triathlon Club, while its headquarters are at Academy Sports Club on Mallusk Road.",
    ],
    founded_year: 2010,
    corrections: {
      address: "Academy Sports Club, Mallusk Road, Newtownabbey, BT36 4QE",
      postcode: "BT36 4QE",
      address_kind: "clubhouse",
      location_precision: "postcode",
    },
    sources: [
      {
        title: "Club history, disciplines and community links",
        url: "https://www.malluskharriers.co.uk/about-us/",
      },
      {
        title: "Training trials and beginner programme",
        url: "https://www.malluskharriers.co.uk/join-train-mallusk-harriers-newtownabbey/",
      },
      {
        title: "Headquarters and role contacts",
        url: "https://www.malluskharriers.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-victoria-park-and-connswater-ac": {
    summary:
      "Victoria Park & Connswater AC trains in east Belfast, combining coached distance running, road and cross-country racing with support for Jog Belfast beginners.",
    biography: [
      "Victoria Park & Connswater AC is based in Victoria Park in east Belfast. Its runners concentrate mainly on distances from 1500m to the marathon, with members also taking on shorter races and ultras. Roads and cross-country courses provide much of the racing, complemented by occasional track, trail and fell events.",
      "The club’s ‘Training with Lions’ motto describes an approach built around hard work and mutual support. Regular park sessions include tempo running and intervals, while target races and an internal championship give members shared goals. Volunteers help with Jog Belfast’s Couch to 5K programme, and the club’s honours include the women’s Northern Ireland 10K road team title in 2022. Interested runners can email the club to arrange a trial.",
    ],
    corrections: {
      address: "Victoria Park, Belfast, BT3 9EF",
      postcode: "BT3 9EF",
      address_kind: "training",
      location_precision: "postcode",
      website: "https://www.vpcac.com/",
      contacts: [
        {
          role: "Club enquiries",
          email: "hello@vpcac.com",
          source_url: "https://www.vpcac.com/",
          checked_at: "2026-10-13",
        },
      ],
    },
    sources: [
      { title: "Club activities, training, honours and contacts", url: "https://www.vpcac.com/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-abbey-striders-a-c": {
    summary:
      "Abbey Striders AC is an athletics club in Mallow, County Cork, with a history of children’s athletics and a listed training base at Davis College.",
    biography: [
      "Abbey Striders AC is based in Mallow, County Cork, where Athletics Ireland lists Davis College at Summerhill as its training location. The club has a documented background in introducing children to athletics: a January 2008 report described its coaches completing Athletics Ireland’s Leader course and using the Little Athletics programme to deliver games-based sessions.",
      "That report credited both coaches and parents for sustaining the children’s activities. Today the club remains in Athletics Ireland’s mixed-club directory, which provides the joining and renewal route and a public contact telephone number. New families should use that contact to confirm current age groups and training times; the timetable in the historical report is not a current session schedule.",
    ],
    corrections: {
      city: "Mallow",
      address: "Davis College, Summerhill, Mallow, Co. Cork, P51 H589",
      postcode: "P51 H589",
      address_kind: "training",
    },
    sources: [
      {
        title: "Current training location, joining and contact",
        url: "https://membership.athleticsireland.ie/clubpage/Abbey_Striders_A.C.",
      },
      {
        title: "Little Athletics development report, 31 January 2008",
        url: "https://www.athleticsireland.ie/abbey-striders-ac-receive-athletics-leader-pack/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-adamstown-a-c": {
    summary:
      "Adamstown AC is a County Wexford athletics club with a record in jumping, throwing and race walking, and a current training listing at Newtown.",
    biography: [
      "Adamstown Athletic Club is a mixed athletics club serving the Adamstown area of County Wexford, Ireland. Athletics Ireland lists its training location at Newtown. The club has also hosted the governing body’s Run, Jump, Throw coaching workshops at Adamstown Community Centre, supporting the development of coaches across several event groups.",
      "Its competitive history includes a strong day at the 2018 Irish Junior and Under-23 Championships: Joseph Mooney won the under-23 walk, Ryan Carthy Walsh won the junior high jump and Marguerite Furlong earned junior discus bronze. These are historical club associations, not a current membership list. Prospective members can use the Athletics Ireland club page for registration and telephone enquiries about present training arrangements.",
    ],
    notable_members: [
      {
        name: "Ryan Carthy Walsh",
        connection: "Adamstown athlete in the 2018 county report",
        detail:
          "Won the junior high jump at the Irish Junior and Under-23 Championships in Tullamore in June 2018.",
      },
      {
        name: "Joseph Mooney",
        connection: "Adamstown athlete in the 2018 county report",
        detail:
          "Won the under-23 5km walk at the same championships, as reported by Wexford Athletics.",
      },
    ],
    corrections: { city: "Adamstown" },
    sources: [
      {
        title: "Current training location and registration",
        url: "https://membership.athleticsireland.ie/clubpage/Adamstown_A.C.",
      },
      {
        title: "Wexford Athletics championship report, 30 June 2018",
        url: "https://wexfordathletics.com/wexford-junior-u23-athletes-impress-in-sweltering-heat-of-tullamore/",
      },
      {
        title: "Athletics Ireland coaching workshop listing",
        url: "https://eventmaster.ie/event/EbDf4EF74",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-aghada-running-club-a-c": {
    summary:
      "Aghada Running Club serves Aghada and Whitegate in East Cork, with senior running membership and a listed training base at Aghada GAA in Rostellan.",
    biography: [
      "Aghada Running Club is a senior running club serving Aghada and Whitegate in County Cork, Ireland. Its stated aim is to help more people run regularly. Athletics Ireland lists the club’s training location at Aghada GAA Club, Páirc Liam Uí Riain, in nearby Rostellan, rather than at a separate running clubhouse.",
      "The club’s Athletics Ireland page provides joining and renewal links, an enquiry email and links to its Facebook and Instagram accounts. Those are the starting points for asking about sessions and the level of running expected before attending. The listing is specifically for senior membership; it should not be read as advertising a children’s athletics programme.",
    ],
    corrections: { city: "Aghada", adult_only: true },
    sources: [
      {
        title: "Club description, senior membership, venue and public contacts",
        url: "https://membership.athleticsireland.ie/clubpage/Aghada_Running_Club_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-balbriggan-and-district-a-c": {
    summary:
      "Balbriggan & District AC brings junior and adult athletics to north County Dublin, with separate training bases and a club revival dating from 2012.",
    biography: [
      "Balbriggan & District Athletic Club describes its present chapter as a re-formation in 2012. Run by volunteers in north County Dublin, it welcomes members from its Little Athletes group through to masters. Juniors can explore cross-country, indoor and outdoor track and field through Dublin Athletics competitions, with participation encouraged at an appropriate level.",
      "Adult group runs meet at Flemington Community Centre on Hamlet Lane, while juvenile sessions use Balbriggan Sports Centre on Chapel Street. Strength and conditioning adds another option for members. The club website explains the separate programmes and provides a joining enquiry form. Its proposed track at Bremore Regional Park is a future development, not a training venue visitors should assume is already open.",
    ],
    location_note:
      "Adults meet at Flemington Community Centre, Hamlet Lane, K32 HD28. Juveniles train at Balbriggan Sports Centre, Pine Ridge, Chapel Street. The club and governing-body pages give different Eircodes for the sports centre, so no single postcode is assigned here.",
    corrections: {
      city: "Balbriggan",
      address: "",
      postcode: "",
      location_precision: "area-only",
      website: "https://www.balbrigganathclub.com/",
    },
    sources: [
      { title: "Club revival and proposed track", url: "https://balbrigganathclub.com/about/" },
      {
        title: "Adult meeting point",
        url: "https://balbrigganathclub.com/training/adult-training/",
      },
      {
        title: "Junior training and competition",
        url: "https://balbrigganathclub.com/training/kids-training/",
      },
      {
        title: "Directory contact and sports-centre address",
        url: "https://membership.athleticsireland.ie/clubpage/Balbriggan_and_District_A.C.",
      },
      { title: "Club enquiry form", url: "https://balbrigganathclub.com/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-ballinasloe-and-district-a-c": {
    summary:
      "Ballinasloe & District Athletics Club trains at Dunlo Running Track in County Galway, with grassroots coaching and indoor, outdoor and cross-country competition.",
    biography: [
      "Ballinasloe & District Athletics Club is based at Dunlo Running Track in Ballinasloe, County Galway. A volunteer-led club, it places particular emphasis on helping young athletes build skills, confidence and friendships through athletics. Its website describes a local tradition spanning around fifty years, without giving a precise founding date.",
      "Regular training prepares members for indoor championships in Athlone, outdoor competition in Galway and cross-country events further afield. Individual and family membership options are published on the club website, alongside an enquiry form for anyone considering joining. Athletics Ireland also provides a club registration page and telephone contact. Training is weather-dependent, so visitors should confirm the current arrangements before coming to Dunlo.",
    ],
    corrections: { city: "Ballinasloe", website: "https://www.ballinasloeathletics.ie/" },
    contact_note:
      "The website header and Athletics Ireland agree on info@ballinasloeathletics.ie. A different email appears in the website footer and has not been added as a second confirmed contact.",
    sources: [
      {
        title: "Club background, training and membership",
        url: "https://www.ballinasloeathletics.ie/",
      },
      {
        title: "Directory venue, registration and contacts",
        url: "https://membership.athleticsireland.ie/clubpage/Ballinasloe_and_District_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "clonmel-triathlon-club": {
    summary:
      "Clonmel Triathlon Club offers swimming, cycling and running in County Tipperary, with seasonal coaching, junior membership and the Camida sprint triathlon.",
    biography: [
      "Clonmel Triathlon Club brings swimmers, cyclists and runners together in Clonmel, County Tipperary. Its training follows the seasons: coached pool sessions at Clonmel Swimming Pool and running blocks lead into summer open-water swimming at Sandybanks. Members also organise group bike rides around Clonmel throughout the year.",
      "Club time trials and supersprint sessions help members practise for racing, alongside the Camida Clonmel Triathlon and youth events. Beginners are welcome, with full, junior and family membership options processed through Triathlon Ireland. Junior members must be accompanied at training by a parent or guardian who is also a club member. Session capacity and meeting arrangements are shared with members, so new starters should contact the club before attending.",
    ],
    location_note:
      "Training uses Clonmel Swimming Pool, Sandybanks and varying run or ride meeting points. Sandybanks is a seasonal swim venue, not a clubhouse or correspondence address.",
    corrections: { city: "Clonmel", website: "https://www.clonmeltriathlon.com/" },
    sources: [
      {
        title: "Seasonal swim, bike and run training",
        url: "https://www.clonmeltriathlon.com/training",
      },
      {
        title: "Membership and junior supervision",
        url: "https://www.clonmeltriathlon.com/membership",
      },
      { title: "Club events and public enquiry email", url: "https://www.clonmeltriathlon.com/" },
      { title: "Club contact form", url: "https://www.clonmeltriathlon.com/contactus" },
    ],
    reviewed_at: "2026-10-13",
  },
  "kilkenny-triathlon-club": {
    summary:
      "Kilkenny Triathlon Club grew from the city’s inaugural 2010 triathlon, launching in 2011 with coached swimming, running and multisport training for adults.",
    biography: [
      "Kilkenny Triathlon Club launched in January 2011 after local participants in the city’s first triathlon decided they wanted a club to train and race with. Based in Kilkenny, Ireland, it brings together newcomers and experienced triathletes for swimming, cycling and running, with social events and club races alongside the training programme.",
      "Runs use Kilkenny Castle Park in spring and summer and the Watershed in autumn and winter. Pool swimming also takes place at the Watershed, with seasonal open-water sessions at locations chosen for conditions and water quality. The programme includes combined bike-and-run practice and strength work. Current joining rules require members to be at least 18, with membership processed through Triathlon Ireland; beginners should check the published swimming prerequisites before booking.",
    ],
    founded_year: 2011,
    location_note:
      "The Watershed, Kilkenny Castle Park and seasonal open-water sites serve different sessions. Consult the training page for the appropriate meeting point and required equipment.",
    corrections: {
      city: "Kilkenny",
      adult_only: true,
      website: "https://www.kilkennytriathlonclub.com/",
    },
    sources: [
      { title: "Club formation", url: "https://www.kilkennytriathlonclub.com/about-us/" },
      {
        title: "Training venues and prerequisites",
        url: "https://www.kilkennytriathlonclub.com/training/",
      },
      {
        title: "Adult membership and joining",
        url: "https://www.kilkennytriathlonclub.com/join-us/",
      },
      {
        title: "Public contact and social links",
        url: "https://www.kilkennytriathlonclub.com/contact/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "waterford-triathlon-club": {
    summary:
      "Waterford Triathlon Club combines swim, bike and run training with local events such as Hook or by Crook in Dunmore East and the Tramore duathlon.",
    biography: [
      "Waterford Triathlon Club serves the Waterford area of south-east Ireland, offering coached and social sessions across swimming, cycling and running. Its published membership information welcomes beginners as well as more experienced athletes, while its account of the 2025 season marked the club’s twentieth anniversary.",
      "The club is closely associated with two coastal events: the Hook or by Crook Triathlon at Dunmore East and the Tramore Medical Duathlon, whose run-bike-run course finishes on the promenade. These race locations are not presented as a single club training address. Prospective members can select Waterford through Triathlon Ireland and use the public enquiry email to confirm current sessions; older fee offers and race dates should be checked before booking.",
    ],
    corrections: { city: "Waterford" },
    sources: [
      {
        title: "Published membership and training offer",
        url: "https://www.waterfordtriclub.com/post/membership-for-2025-now-open",
      },
      {
        title: "Club anniversary and Hook or by Crook",
        url: "https://www.waterfordtriclub.com/copy-of-tramore-medical-duathlon",
      },
      {
        title: "Tramore race description",
        url: "https://www.waterfordtriclub.com/tramore-duathlon",
      },
      {
        title: "Triathlon Ireland club contact and town",
        url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "west-clare-triathlon-club": {
    summary:
      "West Clare Triathlon Club is based around Kilrush, County Clare, bringing adults together for swimming, cycling, running, duathlon and relay participation.",
    biography: [
      "West Clare Triathlon Club is a multisport club based around Kilrush in County Clare, Ireland. Its local community listing describes a group that trains and competes in swimming, cycling and running, with enjoyment and mutual encouragement an important part of the club’s approach.",
      "The club also points newcomers towards duathlon if they would rather run and cycle without a swim, or relay racing where team members share the disciplines. Triathlon Ireland lists it as an adult club and publishes its enquiry email. Contact the club for current sessions and meeting points: no fixed clubhouse or training timetable is confirmed by the available sources.",
    ],
    corrections: { city: "Kilrush", adult_only: true },
    sources: [
      {
        title: "Local community description and enquiry email",
        url: "https://kilrush.ie/directory/west-clare-tri-club/",
      },
      {
        title: "Triathlon Ireland town and adult-club listing",
        url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
};
