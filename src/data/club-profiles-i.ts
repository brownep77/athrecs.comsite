import type { ClubProfile } from "./club-profiles";

// Official club pages and primary directories read on 13–14 October 2026 UTC.
// Historical associations are editorial only, never athlete identity verification.
export const northernAndCommunityClubProfiles: Record<string, ClubProfile> = {
  "accrington-road-runners": {
    summary:
      "Accrington Road Runners is a Lancashire running club offering sociable group training, road, trail and fell racing from Accrington Cricket Club.",
    biography: [
      "Accrington Road Runners was established in 1985 to encourage running in the Hyndburn area of Lancashire, England. Forty years later, members marked the anniversary with a 40-mile relay. The club organises the Accrington 10K and maintains separate road, trail and fell points competitions, but racing is only one part of its purpose: fitness, company and enjoyment matter just as much.",
      "Tuesday training starts from Accrington Cricket Club on Thorneyholme Road. Runners divide into four ability groups, with a typical session covering around 10K; newcomers can try a session before deciding whether to join. The website has an online membership route and a committee contact form. Check the current programme if you are unsure which group would suit you, especially if you are just starting to run.",
    ],
    founded_year: 1985,
    corrections: { address_kind: "training", website: "https://accrington-road-runners.co.uk/" },
    sources: [
      {
        title: "Club origins, anniversary and Accrington 10K",
        url: "https://accrington-road-runners.co.uk/",
      },
      {
        title: "Training base, groups and committee contact form",
        url: "https://accrington-road-runners.co.uk/about-us/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "allen-valley-striders": {
    summary:
      "Allen Valley Striders is an Allendale running club in Northumberland, with social runs, road and fell running and the Hexhamshire Hobble.",
    biography: [
      "Allen Valley Striders began in 2005 at Deneholme and now starts most club runs from Allendale Primary School. Its Northumberland membership reaches beyond the Allen Valley to Haltwhistle, Haydon Bridge and Hexham. The club is known locally for the Hexhamshire Hobble and combines road, cross-country and fell running with non-running social events.",
      "There is no entry-speed requirement, and walking the hills is perfectly acceptable. Some members race while others simply enjoy a regular run with company. Prospective runners should email the club or use its Facebook group to arrange a couple of introductory runs. The published charter welcomes people over 16; ask the club about its arrangements for younger members before attending. Volunteers can also help with coaching or occasional event marshalling.",
    ],
    founded_year: 2005,
    location_note:
      "Most runs start at Allendale Primary School; confirm the meeting point for your chosen session. Allendale is the club base, rather than Hexham town centre.",
    corrections: {
      city: "Allendale",
      sports: ["Running"],
      adult_only: false,
      address_kind: "training",
    },
    sources: [
      {
        title: "Origins, Allendale base and published charter",
        url: "http://allenvalleystriders.co.uk/",
      },
      {
        title: "Introductory runs and volunteering",
        url: "http://allenvalleystriders.co.uk/membership/",
      },
      { title: "Club enquiries", url: "http://allenvalleystriders.co.uk/contact/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "ashington-hirst-running-club": {
    summary:
      "Ashington Hirst Running Club offers run/walk groups, coached efforts and social running from Ashington Rugby Club in Northumberland.",
    biography: [
      "Ashington Hirst Running Club grew out of Hirst Welfare Beginners, a small group that first ran together on 4 March 2014. Iain Singer helped develop the sessions after an approach from England Athletics. Members chose a club name, colours and committee in March 2015, and UK Athletics affiliation followed that April. Those beginnings still show in the club's mix of run/walk, steady running and more demanding training.",
      "The Northumberland club is based at Ashington Rugby Club on Ellington Road. Tuesday and Thursday groups offer several paces, while Friday's social run usually meets at Fox Cover car park. Juniors aged 12 and over may join Tuesday efforts with a parent or guardian present. Newcomers can arrange two or three introductory runs and should arrive early to meet the leaders. Its community work includes the Festive 5K, support for Friends of Ashington Woods and food-bank collections.",
    ],
    founded_year: 2015,
    corrections: { address_kind: "training", website: "https://ashingtonhirstrunningclub.co.uk/" },
    location_note:
      "The rugby club is the main base; Friday social runs usually meet at Fox Cover car park. Check the session announcement before travelling.",
    sources: [
      {
        title: "Club formation, community race and enquiries",
        url: "https://www.ashingtonhirstrunningclub.co.uk",
      },
      {
        title: "Training groups, junior conditions and taster runs",
        url: "https://ashingtonhirstrunningclub.co.uk/training",
      },
      { title: "Membership", url: "https://ashingtonhirstrunningclub.co.uk/membership" },
    ],
    reviewed_at: "2026-10-14",
  },
  "aycliffe-running-club": {
    summary:
      "Aycliffe Running Club serves Newton Aycliffe in County Durham, with road, trail and cross-country running and track sessions in nearby Shildon.",
    biography: [
      "Aycliffe Running Club brings together runners in Newton Aycliffe, County Durham, for coached training and competition across road, trail, fell and cross-country events. The North Yorkshire and South Durham Winter Cross Country League is part of its programme, alongside club championships and social trips to races. Its published achievements include Andy Talbot's account of joining in 2018 and later representing England Masters in the marathon.",
      "The club's joining page describes Tuesday sessions from the Oakleaf Sports Complex and Thursday track training at Shildon Stadium 2000. New runners are offered a week's trial before committing. Sessions may change with weather, safety conditions or coach availability, so check the training page and club announcements rather than relying on an old timetable. Membership enquiries go to the club's shared email address; competitive and social options are available.",
    ],
    notable_members: [
      {
        name: "Andy Talbot",
        connection: "Club athlete in its published achievements archive",
        detail:
          "His firsthand club account describes joining in 2018 and subsequently representing England Masters in the marathon.",
      },
    ],
    location_note:
      "Training uses Oakleaf Sports Complex in Newton Aycliffe and Shildon Stadium 2000. The former town-only directory address is not an exact training venue.",
    corrections: { address: "", postcode: "", address_kind: "directory" },
    sources: [
      {
        title: "Joining, venues and competition programme",
        url: "http://ayclifferunningclub.org.uk/sample-page/",
      },
      {
        title: "Training updates and enquiries",
        url: "http://ayclifferunningclub.org.uk/training-plans/",
      },
      {
        title: "Andy Talbot's firsthand account",
        url: "http://ayclifferunningclub.org.uk/andy-talbot-achievements-awards/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "barlick-fell-runners": {
    summary:
      "Barlick Fell Runners is a Barnoldswick club in Lancashire, offering fell, trail, road and cross-country running, junior coaching and social runs.",
    biography: [
      "Barlick Fell Runners formed in December 2012 as a fell-running club in Barnoldswick, Lancashire. Its programme has since widened to road, cross-country and trail competition, with internal championships and team relay opportunities. The hills remain central to the club, but membership is not restricted to experienced fell racers or runners chasing a particular time.",
      "Tuesday speed-and-hill sessions and junior coaching meet at Barnoldswick Cricket Club, Victory Park. Juniors can start from age eight, subject to availability. Monday social runs explore changing routes across road, trail and fell, while Wednesday pub runs offer another way to meet the group. Check the weekly Facebook notice for the location and footwear advice. Adults can try a run before joining; junior enquiries should go through the contact form or membership secretary.",
    ],
    founded_year: 2012,
    location_note:
      "Victory Park is the Tuesday training base. Monday and Wednesday meeting points vary; the incomplete former directory address is not used for directions.",
    corrections: {
      city: "Barnoldswick",
      address: "Barnoldswick Cricket Club, Victory Park, Barnoldswick",
      postcode: "",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club formation and disciplines",
        url: "https://www.barlickfellrunners.org.uk/about",
      },
      {
        title: "Current training and junior sessions",
        url: "https://www.barlickfellrunners.org.uk/",
      },
      {
        title: "Trying the club and membership",
        url: "https://www.barlickfellrunners.org.uk/membership",
      },
      {
        title: "Membership and welfare contacts",
        url: "https://www.barlickfellrunners.org.uk/contact",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "blyth-running-club": {
    summary:
      "Blyth Running Club offers road running, track and field, cross-country and beginner training for adults and juniors in south-east Northumberland.",
    biography: [
      "Blyth Running Club took shape after the first Great North Run and affiliated to the Amateur Athletic Association in December 1983. From its base at Blyth Sports Centre, it developed a year-round programme: road races and longer runs, winter cross-country and summer track and field. The club also organises events including the Blyth Sands Race and Autumn Relays, with an internal Grand Prix for members.",
      "Runners can join for competition or simply for regular training and company. The club has senior and junior sections, a Couch to 5K programme and groups for a range of abilities. Monday and Wednesday club nights are described on its membership page, with longer runs on Sundays. Newcomers should check the current training schedule and contact the enquiries team, which can help identify the right group before a first visit.",
    ],
    corrections: {
      website: "https://blythrunningclub.org.uk/",
      address: "Blyth Sports Centre, Bolam Park, Blyth, NE24 5BT",
      address_kind: "training",
    },
    sources: [
      {
        title: "Origins, affiliation and joining",
        url: "https://blythrunningclub.org.uk/about/membership/",
      },
      {
        title: "Seasonal programme and club activities",
        url: "https://blythrunningclub.org.uk/about/",
      },
      {
        title: "Current events and beginner programme",
        url: "http://www.blythrunningclub.org.uk/",
      },
      { title: "Club contact form", url: "https://blythrunningclub.org.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "bowland-fell-runners": {
    summary:
      "Bowland Fell Runners is a Lancashire club for fell racing, social hill runs and mountain challenges around the Forest of Bowland, Lancaster and Chipping.",
    biography: [
      "Bowland Fell Runners is built around the Forest of Bowland rather than a single town or track. Members train near Chipping, Lancaster and the surrounding fells, and compete in races and relays across Britain. The club also documents longer local challenges through its Dig the Peat route collection, including the Bowland 1500s and watershed traverses. Mountain marathons and long-distance rounds sit alongside shorter social outings.",
      "The junior section welcomes children aged seven to 17, with an emphasis on running skills and enjoying the countryside. Under-12s must be accompanied by a parent or guardian, and the club specifies suitable fell shoes, waterproofs and winter lighting. Weekly arrangements are shared through its linked Facebook group; membership is handled through the website's SI Entries link. Meeting points vary, so check the planned route and kit requirements rather than travelling to the old Lancaster directory address.",
    ],
    location_note:
      "This is a multi-venue fell club serving the Forest of Bowland. The former Redvers Street directory address is not presented as a training base.",
    corrections: {
      website: "https://bowlandfr.org.uk/",
      address: "",
      postcode: "",
      address_kind: "directory",
    },
    sources: [
      { title: "Club area and training overview", url: "http://www.bowlandfellrunners.org.uk/" },
      { title: "Fell racing and long-distance activities", url: "https://bowlandfr.org.uk/about/" },
      {
        title: "Club-developed Bowland challenges",
        url: "https://bowlandfr.org.uk/about/dig-the-peat/",
      },
      {
        title: "Junior ages, equipment and joining route",
        url: "https://bowlandfr.org.uk/juniors/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "burnley-ac": {
    summary:
      "Burnley Athletic Club trains at Barden Athletics Track in Lancashire, with junior development, track and field, cross-country and senior coaching.",
    biography: [
      "Burnley Athletic Club is a volunteer-run athletics club based at Barden Track in Burnley, Lancashire. Its history page describes the move from a cinder track to a synthetic all-weather surface in 1998. Today the programme brings together sprints, hurdles, jumps and throws with endurance running and cross-country, and members compete in leagues including Mid Lancs, Red Rose Cross Country and Northern Masters.",
      "New athletes can ask about two taster sessions before joining. Junior development introduces a range of skills, while older athletes have event-specific coaching groups. The website currently has a waiting list for under-12s, so families should enquire before turning up. The club asks all visitors to contact its shared enquiries email first, allowing a coach to be available at Barden Athletics Track on Barden Lane.",
    ],
    corrections: {
      website: "https://www.burnleyathleticclub.co.uk/",
      address: "Barden Athletics Track, Barden Lane, Burnley, BB10 1JQ",
      postcode: "BB10 1JQ",
      address_kind: "training",
    },
    sources: [
      {
        title: "Barden track history and club programme",
        url: "https://www.burnleyathleticclub.co.uk/about-us/",
      },
      { title: "Junior waiting-list notice", url: "https://www.burnleyac.co.uk/" },
      {
        title: "Taster sessions and membership process",
        url: "https://www.burnleyathleticclub.co.uk/membership",
      },
      {
        title: "Training address and club enquiries",
        url: "https://www.burnleyathleticclub.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "chester-le-street-and-dist-ac": {
    summary:
      "Chester-le-Street & District Athletics Club offers running, jumps and throws for juniors and adults at Riverside Sports Complex in County Durham.",
    biography: [
      "Chester-le-Street & District Athletics Club was formed in 1977 by Kenneth Wright, Bob and John Tinkler, and Derek Reay, who had previously belonged to Elswick Harriers. It has since offered local athletes a route into training and competition at county, regional and national level. The club is based at Riverside Sports Complex beside Durham's cricket ground in Chester-le-Street, England.",
      "Volunteer coaches work with young people from age eight through to adults, covering running and track and field events. Tuesday and Thursday sessions give newcomers a chance to try the sport, with the first session free before the club's normal session and membership arrangements apply. Parents and other supporters can get involved as coaches, officials or helpers, too. The shared enquiries email and website contact form are the best starting points for questions about a first visit.",
    ],
    founded_year: 1977,
    corrections: {
      address: "Riverside Sports Complex, Ropery Lane, Chester-le-Street, DH3 3QR",
      postcode: "DH3 3QR",
      address_kind: "training",
      website: "https://www.chesterlestreetathletics.com/",
    },
    sources: [
      { title: "Club history and founders", url: "https://www.chesterlestreetathletics.com/about" },
      {
        title: "Joining, sessions and volunteering",
        url: "https://www.chesterlestreetathletics.com/membership",
      },
      { title: "Riverside address and enquiries", url: "http://www.chesterlestreetathletics.com/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "chorley-athletic-and-triathlon-club": {
    summary:
      "Chorley Athletic and Triathlon Club is a volunteer-run Lancashire club for running, track and field, race walking, swimming, cycling and multisport.",
    biography: [
      "Chorley Athletic and Triathlon Club was created on 1 May 2012 by members of Chorley Harriers & Tri and Chorley Athletic Club. The Lancashire club combines running, jumping and throwing with walking and multisport, welcoming both competitive athletes and people looking for regular exercise. Its volunteer structure includes specialist leads for road and trail, fell running, cross-country, track and field, swimming and cycling.",
      "Junior athletics focuses on movement skills before specialisation, with most sessions at St Michael's High School in Chorley or Horwich Track. The wider programme includes cross-country, Sportshall, trail running and triathlon-related events. Prospective members can try an appropriate session and then register through the club's MemberMojo system; ask the general or junior enquiries team which group to attend. The Carleton Road address is for club contact, not a promise that training takes place there.",
    ],
    founded_year: 2012,
    location_note:
      "Carleton Road is the published club contact address. Junior sessions mainly use St Michael's High School and Horwich Track; other disciplines have separate arrangements.",
    corrections: {
      address_kind: "correspondence",
      website: "https://www.chorley-athletic-and-triathlon.org/web4/about.php",
      sports: ["Running", "Athletics", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    sources: [
      {
        title: "2012 formation and specialist sections",
        url: "https://www.chorley-athletic-and-triathlon.org/web4/about.php",
      },
      {
        title: "New-member process",
        url: "https://www.chorley-athletic-and-triathlon.org/web4/new-to-the-club.php",
      },
      {
        title: "Junior development and venues",
        url: "https://www.chorley-athletic-and-triathlon.org/web4/junior-athletics.php",
      },
      {
        title: "Public club contacts",
        url: "https://www.chorley-athletic-and-triathlon.org/web4/contact.php",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "durham-city-harriers-and-ac": {
    summary:
      "Durham City Harriers & AC offers adult running and junior athletics at Maiden Castle in Durham, with track and field, cross-country and beginner groups.",
    biography: [
      "Durham City Harriers traces its first club to 1907, when members met at the Criterion Hotel near Framwellgate Bridge. Early athlete George Lee represented Britain at the 1912 Stockholm Olympics. The club was reformed in 1972 and later adopted its distinctive orange vest. After periods at Framwellgate Moor and Durham Johnston schools, it returned to Maiden Castle and the university's sports facilities.",
      "From the Graham Sports Centre in Durham, the club now offers senior endurance and performance groups, a beginner programme and a transition group for developing runners. Junior coaching covers running, jumping and throwing, but the current website says junior membership is full and the waiting list is closed. Adults can ask about taster sessions through the membership secretary. Check availability and the appropriate group before visiting; a general welcome on an older page does not guarantee a junior place.",
    ],
    notable_members: [
      {
        name: "George Lee",
        connection: "Athlete of the early Durham City Harriers club",
        detail:
          "The club history records his appearances in the 5,000m and 10,000m at the 1912 Stockholm Olympics.",
      },
    ],
    corrections: {
      address: "Graham Sports Centre, Maiden Castle, Stockton Road, Durham, DH1 3SE",
      address_kind: "training",
      website: "https://www.durhamcityharriers.org.uk/",
    },
    sources: [
      {
        title: "1907 origins, George Lee and 1972 reformation",
        url: "https://www.durhamcityharriers.org.uk/club-history/",
      },
      {
        title: "Current groups and junior waiting-list closure",
        url: "http://www.durhamcityharriers.org.uk/",
      },
      {
        title: "Membership availability and public enquiries",
        url: "https://www.durhamcityharriers.org.uk/how-to-join/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "elswick-harriers": {
    summary:
      "Elswick Harriers is a Newcastle upon Tyne running and athletics club based in Newburn, with beginner groups, juniors, road racing and cross-country.",
    biography: [
      "Elswick Harriers began in 1889 and has trained from Newburn Activity Centre since 1994. Its history links Newcastle club running to Olympians Alex Burns, Alan Lillington and Mike McLeod, whose career included 10,000m silver at Los Angeles in 1984. Norman Woodcock's work helped sustain the club through difficult years, and the relays bearing his name remain part of its race programme alongside the Good Friday Relays and Newburn River Run.",
      "The Newburn base gives runners access to roads, paths and cross-country terrain around the Tyne Riverside Country Park. Senior groups range from beginners to experienced competitors, with a gradual None to Run programme for people starting out. Juniors have their own section, and newcomers can request a buddy to help them settle in. Tuesday and Thursday evenings are the main club nights; let the club know you are coming so it can direct you to the right group.",
    ],
    founded_year: 1889,
    notable_members: [
      {
        name: "Mike McLeod",
        connection: "Long-standing club athlete",
        detail:
          "The club records his membership from 1966 and his Olympic 10,000m silver medal at Los Angeles in 1984.",
      },
      {
        name: "Alex Burns",
        connection: "Historical club athlete",
        detail:
          "Distance runner associated with the club's 1930s history and the 1932 and 1936 Olympic Games.",
      },
      {
        name: "Norman Woodcock",
        connection: "Historical runner and club organiser",
        detail:
          "Remembered for sustaining Elswick Harriers around the Second World War; the club holds memorial relays in his name.",
      },
    ],
    corrections: {
      website: "https://elswickharriers.org.uk/",
      address: "Newburn Activity Centre, Grange Road, Newburn, Newcastle upon Tyne, NE15 8ND",
      address_kind: "training",
      sports: ["Running", "Athletics", "Triathlon"],
    },
    sources: [
      {
        title: "Origins, Newburn move and historical athletes",
        url: "https://elswickharriers.org.uk/our-history/",
      },
      {
        title: "Club groups, races and buddy scheme",
        url: "https://elswickharriers.org.uk/elswick-harriers-club-information/",
      },
      { title: "Beginner pathway and current programme", url: "https://elswickharriers.org.uk/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-abergele-harriers": {
    summary:
      "Abergele Harriers is an adult running club in North Wales, with road, cross-country, fell and trail running around Abergele and Pensarn.",
    biography: [
      "Abergele Harriers brings adult runners together on the North Wales coast, from sociable training groups to road races, cross-country and the fells. Its long-running Abergele 5 events form part of that local racing history: the club's archive records a 33rd five-mile race and the addition of a 5K in 2019. Those archive dates describe past events, not the next race programme.",
      "The club welcomes runners aged 18 and over and separates training into different pace groups; racing is optional. Welsh Athletics lists sessions at Pensarn Beach car park and Abergele Leisure Centre. The club's own training page still describes 2021 pandemic arrangements, so ask the secretary for the current meeting point before attending. Under-18s are directed towards a track-based club because Abergele's regular training is largely on public roads.",
    ],
    location_note:
      "Welsh Athletics lists Pensarn Beach car park and Abergele Leisure Centre. Confirm the venue directly: the club's training page still carries 2021 arrangements.",
    corrections: { adult_only: true, address: "", postcode: "", address_kind: "directory" },
    sources: [
      {
        title: "Club welcome and adult-only membership",
        url: "https://www.abergeleharriers.co.uk/Main.htm",
      },
      {
        title: "Abergele 5 historical race archive",
        url: "https://www.abergeleharriers.co.uk/The5.htm",
      },
      { title: "Dated training arrangements", url: "https://www.abergeleharriers.co.uk/2.htm" },
      {
        title: "Governing-body disciplines and current directory venues",
        url: "https://www.welshathletics.org/en/club/view/abergele-harriers",
      },
      { title: "Secretary contact", url: "https://www.abergeleharriers.co.uk/Form1.htm" },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-brackla-harriers": {
    summary:
      "Brackla Harriers is a Bridgend running club in South Wales, combining road, cross-country and trail training with a busy social programme.",
    biography: [
      "Brackla Harriers trains from Bridgend Tennis, Squash and Bowls Club on Church Street. The South Wales club offers structured running without making competition a condition of belonging: members can work towards races or come for a regular run and a chat. Road, trail and cross-country are its main disciplines, with a monthly track session used for training rather than a track-racing focus.",
      "Welsh Athletics-trained leaders and coaches support group sessions and can discuss more individual training plans. The club programme includes local running leagues, relays and the Merthyr Mawr Pudding Race, with social evenings woven into club life. New runners should email the membership team to arrange a first session. The website links a 2026–27 application form but still displays older fees in its membership text, so confirm the current cost rather than relying on that figure.",
    ],
    corrections: {
      address: "Bridgend Tennis, Squash and Bowls Club, Church Street, Bridgend, CF31 3AZ",
      address_kind: "training",
      website: "https://bracklaharriers.co.uk/",
    },
    sources: [
      {
        title: "Programme, coaching and Church Street base",
        url: "https://www.bracklaharriers.co.uk/",
      },
      {
        title: "Membership arrangements and application form",
        url: "https://bracklaharriers.co.uk/membership/",
      },
      {
        title: "Welsh Athletics club listing",
        url: "https://www.welshathletics.org/en/club/view/brackla-harriers",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-buckley-rc": {
    summary:
      "Buckley Runners is an adult running club in North Wales, offering coached intervals, social runs, road racing, cross-country and fell running.",
    biography: [
      "Buckley Runners serves adults in Buckley and the surrounding North Wales area, from people taking their first running steps to experienced racers. The club combines volunteer coaching with road, cross-country, fell and trail activity. Competitive members can take part in road and cross-country leagues, while social membership provides a way to stay involved without racing.",
      "Training uses several local meeting points, not one permanent clubhouse. The October 2026 programme includes Buckley Common, Mold Road and Penymynydd, with a changing venue for the Wednesday off-road social run. New runners can try sessions before joining and should check the current weekly plan for the right group, pace and location. Membership and club news are managed through the club website and member channels, with a public contact form and shared email for enquiries.",
    ],
    location_note:
      "Sessions use different locations around Buckley, Mold Road and Penymynydd. Check the current weekly training page; no single exact address is assumed.",
    corrections: { adult_only: true },
    sources: [
      { title: "Club ethos and adult membership", url: "https://www.buckleyrunners.org.uk/" },
      {
        title: "October 2026 training locations",
        url: "https://www.buckleyrunners.org.uk/training/",
      },
      { title: "Membership options", url: "https://www.buckleyrunners.org.uk/membership/" },
      { title: "Public enquiry route", url: "https://www.buckleyrunners.org.uk/contact/" },
      {
        title: "Current governing-body contacts and disciplines",
        url: "https://www.welshathletics.org/en/club/view/buckley-rc",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-builth-and-district-running-club": {
    summary:
      "Builth & District Running Club offers social running, coached hills and track sessions, cross-country and beginner support in Builth Wells, Mid Wales.",
    biography: [
      "Builth & District Running Club was established in 2006 in Builth Wells, Powys. It combines organised racing with sociable local running and supports the wider community through Groe parkrun and beginner groups. During the 2020 lockdown it launched the BaDRelay15 challenge, which returned for further editions and connected teams of runners without an entry fee.",
      "The club meets at the Cattle Market in Builth Wells, with Wednesday runs split into ability groups and Tuesday coaching that changes between track work and hills with the season. A monthly session takes place at the athletics track in Brecon. Newcomers can try two sessions, then use the online membership form or contact the club by email. Members also have opportunities to run in Herefordshire cross-country events and the Gwent League.",
    ],
    founded_year: 2006,
    location_note:
      "The Cattle Market is the regular Builth Wells meeting point. Monthly Brecon track sessions take place elsewhere; check the club programme.",
    sources: [
      {
        title: "Club origins, beginner welcome and BaDRelay15",
        url: "https://www.builthanddistrictrc.com/",
      },
      {
        title: "2026–27 membership and training benefits",
        url: "https://builthanddistrictrc.com/membership-benefits/",
      },
      {
        title: "Welsh Athletics venue and contacts",
        url: "https://www.welshathletics.org/en/club/view/builth-and-district-running-club",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-cabinteely-a-c": {
    summary:
      "Cabinteely Athletic Club is a volunteer-led Dublin club based at Kilbogget Park, offering running, jumping and throwing for young athletes and seniors.",
    biography: [
      "Cabinteely Athletic Club's history follows the development of Kilbogget Park in south Dublin. Its original track was laid out in the 1970s, but membership later lapsed and the club was re-established in March 2010. The present club trains throughout the year with portable track lighting and works with local schools to introduce children to athletics.",
      "Running, jumping and throwing are taught by a volunteer team, with younger athletes and seniors using different training groups. The club maintains waiting lists for both juvenile and senior entry, so use the joining page rather than assume a place is immediately available. Beyond training, members support community events including Darkness Into Light, the Goal Mile, the India Festival and DLR Bay 10K. Public enquiries can be sent through the club contact form or the email published by Athletics Ireland.",
    ],
    founded_year: 2010,
    location_note:
      "Training is at Kilbogget Park on Churchview Road. The club and sports partnership print A96 X4KO, while Athletics Ireland prints A96 PC84; the conflicting Eircode is left unconfirmed.",
    corrections: {
      city: "Cabinteely",
      website: "https://www.cabinteelyac.ie/",
      address: "Kilbogget Park, Churchview Road, Dublin",
      postcode: "",
      address_kind: "training",
    },
    sources: [
      { title: "Club programme and Kilbogget Park base", url: "https://www.cabinteelyac.ie/" },
      {
        title: "Origins, 2010 revival and community work",
        url: "https://www.cabinteelyac.ie/about-us.html",
      },
      {
        title: "Juvenile and senior waiting lists",
        url: "https://www.cabinteelyac.ie/waiting-lists--joining.html",
      },
      {
        title: "Athletics Ireland contact and venue listing",
        url: "https://membership.athleticsireland.ie/clubpage/Cabinteely_A.C.",
      },
      {
        title: "Local sports partnership venue listing",
        url: "https://dlrsportspartnership.ie/club-listings/cabinteely-athletic-club/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-calry-a-c": {
    summary:
      "Calry Athletic Club is a County Sligo athletics club with roots in the 1960s and a listed training base at Calry Community Park in Hazelwood.",
    biography: [
      "Calry Athletic Club is part of County Sligo's long-established athletics community. Neighbouring Sligo AC's own history recalls Calry's activity in the mid-1960s, before Sligo AC was formed in 1971. The local history project Memory of Calry also records Gerry Cunningham serving as club secretary in the early 1970s. These accounts establish a substantial local history without fixing an exact founding year.",
      "Athletics Ireland lists Calry Community Park in Hazelwood as the club's training location and provides an online joining route. Sligo Sport and Recreation Partnership publishes a club contact and links its Facebook page. Prospective athletes should use those contacts to ask about current groups, ages and session times: the directory confirms the venue, but does not supply a full timetable. The Ballinode address in the local sports listing is not substituted for the Community Park training base.",
    ],
    corrections: {
      city: "Calry",
      address: "Calry Community Park, Hazelwood, County Sligo, F91 YT98",
      address_kind: "training",
    },
    sources: [
      {
        title: "Training venue and joining route",
        url: "https://membership.athleticsireland.ie/clubpage/Calry_A.C.",
      },
      {
        title: "Local sports partnership club contacts",
        url: "https://www.sligosportandrecreation.ie/club_directory/calry-athletics-club/",
      },
      {
        title: "Sligo AC's account of Calry's earlier athletics activity",
        url: "https://sligoac.com/2022/12/11/about-sligo-athletics-club/",
      },
      {
        title: "Former secretary's local-history biography",
        url: "https://memoryofcalry.wordpress.com/gerry-cunningham/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-caltra-and-district-a-c": {
    summary:
      "Caltra and District Athletic Club serves rural east Galway, with juvenile athletics, adult running and a history of community races and volunteering.",
    biography: [
      "Caltra and District Athletic Club began in late 2015 to offer an accessible sport in rural east Galway, Ireland. A club-written Athletics Ireland profile describes volunteers developing running, jumping and throwing for children alongside adult Couch to 5K and distance-running groups. Caltra hosted a leg of the Galway 5K series in 2019, and the club helped revive local Community Games activity.",
      "Community work has been a feature of the club, from sharing equipment and volunteers with schools and charities to a 2021 project connecting teenage art with rural running. Those are historical examples, not claims that the same programmes are currently open. Athletics Ireland's present listing offers a joining route and contact telephone, and mentions the Ahascragh/Fohenagh GAA astroturf. Ask the club which venue and age group applies before attending; its directory address alone is not a complete training plan.",
    ],
    founded_year: 2015,
    location_note:
      "The directory gives a Caltra address but separately describes training at Ahascragh/Fohenagh GAA astroturf. Confirm the correct meeting point; no single precise venue or Eircode is assumed.",
    corrections: { city: "Caltra", address: "", postcode: "", address_kind: "directory" },
    sources: [
      {
        title: "Club's 2021 account of origins and community work",
        url: "https://www.athleticsireland.ie/caltra-district-ac-club-profile/",
      },
      {
        title: "Current directory, contact and training description",
        url: "https://membership.athleticsireland.ie/clubpage/Caltra_and_District_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-castlebar-a-c": {
    summary:
      "Castlebar Athletic Club in County Mayo focuses on young athletes, with track and field, throwing and cross-country training around Castlebar.",
    biography: [
      "Castlebar Athletic Club caters mainly for children and teenagers aged eight to 18 in County Mayo, Ireland. Its programme introduces track and field as well as cross-country, with separate Little Athletics, older juvenile and throwing sessions. The club's 2026 updates describe the seasonal move into cross-country and give parents and athletes practical race guidance alongside training news.",
      "Training usually takes place at St Mary's track in Castlebar, with recent notices also referring to the ATU track and Sunday cross-country sessions at Lough Lannagh. Race weekends can replace normal training, so the website and club text groups are important for current arrangements. Families interested in joining should use the Athletics Ireland club contact and registration route. The older GMIT directory address is retained only as directory information, rather than being presented as the venue for every session.",
    ],
    location_note:
      "The club names St Mary's track, the ATU track and seasonal Lough Lannagh sessions. Confirm the venue for the relevant age group; race weekends may replace training.",
    corrections: {
      city: "Castlebar",
      website: "https://castlebarac.ie/",
      address_kind: "directory",
    },
    sources: [
      { title: "Club age range and 2026 seasonal notices", url: "https://castlebarac.ie/" },
      {
        title: "Training groups and venue-change guidance",
        url: "https://castlebarac.ie/training_times",
      },
      {
        title: "Athletics Ireland contact and registration",
        url: "https://membership.athleticsireland.ie/clubpage/Castlebar_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
  },
};
