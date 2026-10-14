import type { ClubProfile } from "./club-profiles";

// Primary club/directory pages and attributed historical interviews read 14 October 2026.
// Editorial associations do not establish athlete identities or import performances.
export const southEastAndNorthernClubProfiles: Record<string, ClubProfile> = {
  "crowborough-runners": {
    summary:
      "Crowborough Runners is an East Sussex club with a Goldsmiths track base, junior coaching, paced social runs and the Crowborough 10K.",
    biography: [
      "Crowborough Runners was founded in 1982 and serves runners in Crowborough, East Sussex, England. Its three-lane all-weather track at Goldsmiths Recreation Ground gives beginners and experienced runners a year-round training base, with floodlighting in winter. Volunteer England Athletics coaches lead structured sessions, while Wednesday outings move between roads in winter and off-road routes in summer. Groups are arranged by pace, including provision for newer runners and those rebuilding their fitness.",
      "The junior section welcomes runners from eight to eighteen for Saturday track training. Adults can try a session or club run before applying, and separate adult and junior membership forms are available on the website. The club also organises the Crowborough 10K and asks members to help with the event. Social activities sit alongside competition, with club runners taking part in the Sussex Grand Prix, cross-country and team relays. Ask the club which group suits you before your first visit.",
    ],
    founded_year: 1982,
    corrections: { website: "https://crowboroughrunners.org.uk/", address_kind: "training" },
    sources: [
      {
        title: "Club history, coaching, membership and contacts",
        url: "https://crowboroughrunners.org.uk/the-club/",
      },
      {
        title: "Track base, weekly runs and junior sessions",
        url: "https://crowboroughrunners.org.uk/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "dacorum-athletics-club": {
    summary:
      "Dacorum AC in Hemel Hempstead brings together track and field, road running and cross-country, with junior development and adult running groups.",
    biography: [
      "Dacorum Athletics Club is based in Hemel Hempstead, Hertfordshire, England. Its present organisation came from the 1995 merger of Dacorum Athletic Club and Tring Athletic Club, founded separately in 1976 and 1980. The combined club used the Dacorum & Tring name until returning to Dacorum AC in 2021. Track and field is a substantial part of its programme, with young athletes moving from introductory groups into development and event-specific squads.",
      "Road runners train on the roads and paths around Hemel Hempstead as well as the track, with groups for different speeds and ambitions. This section accepts runners from sixteen and offers a short trial before commitment. Cross-country brings the road and track sections together through the Chiltern League and junior competition. Prospective members should use the contact form and select the membership manager or head coach; junior entry arrangements depend on the squad. The club also supports volunteers who want to become coaches or officials.",
    ],
    founded_year: 1995,
    notable_members: [
      {
        name: "Deborah Keenleyside",
        connection: "Club coaching profile",
        detail:
          "The club's head-coach biography records Great Britain representation in the 400m hurdles in 1981.",
      },
    ],
    corrections: { website: "https://www.dacorumac.org.uk/dact/", city: "Hemel Hempstead" },
    sources: [
      {
        title: "Predecessors, merger and 2021 name change",
        url: "https://www.dacorumac.org.uk/dact/about-3/",
      },
      {
        title: "Training sections and coaching biographies",
        url: "https://www.dacorumac.org.uk/dact/",
      },
      {
        title: "Membership and general enquiries",
        url: "https://www.dacorumac.org.uk/dact/contact/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "farnham-runners": {
    summary:
      "Farnham Runners is a Surrey road and trail running club founded in 1985, with a Lower Bourne clubhouse, coached sessions and a beginners' course.",
    biography: [
      "Farnham Runners has been part of running in Farnham, Surrey, England, since 1985. The club explores Bourne Woods and the commons around Frensham, Tilford, Hankley and Crooksbury, alongside road running and track work in Aldershot. Its clubhouse is at Bourne Sports and Social Club in Lower Bourne, where training days include access to changing rooms and showers. Members compete in the Hampshire Road Race League and Southern Cross Country League, with an internal Grand Prix encouraging participation across the ability range.",
      "The Get Me Started course introduces newcomers to running over nine weeks, working towards 5K while helping them get to know the club. Regular training includes coached speed sessions, intervals and club runs; each has its own venue, so the clubhouse is not the start point for everything. A summer championship in Bourne Woods, a Christmas handicap, club suppers and race weekends give members reasons to meet beyond weekly training. General and membership enquiries go through the club's shared email.",
    ],
    founded_year: 1985,
    corrections: {
      website: "https://www.farnham-runners.org.uk/",
      address:
        "Bourne Sports and Social Club, Cricket Lane, Lower Bourne, Farnham, Surrey, GU10 3PR",
      postcode: "GU10 3PR",
      address_kind: "clubhouse",
    },
    sources: [
      {
        title: "Club history, training and social programme",
        url: "https://www.farnham-runners.org.uk/about/",
      },
      {
        title: "Clubhouse address and facilities",
        url: "https://www.farnham-runners.org.uk/about/where-we-meet/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "farnham-triathlon-club": {
    summary:
      "Farnham Triathlon Club offers swimming, cycling and running for adults and young people in Surrey, with training across Farnham, Aldershot and Blackbushe.",
    biography: [
      "Farnham Triathlon Club was established in 1985 in Farnham, Surrey, England, and draws members from the neighbouring Hampshire and Berkshire borders. Its programme covers swimming, cycling and running for beginners through to experienced triathletes. Members take on sprint and standard-distance triathlons as well as duathlons, aquathlons and longer-distance events. The club also helps run the Hart Triathlon in Fleet, giving members opportunities to volunteer as well as race.",
      "Training is spread across Farnham Leisure Centre, Aldershot Garrison and, in summer, Blackbushe. The youth squad welcomes eight- to sixteen-year-olds, with pool coaching and seasonal cycling on the closed go-kart circuit at Blackbushe. Youth sessions develop bike handling, running and transitions as well as swimming; helmets are compulsory for cycling. New members can contact the general-enquiries address or head coach before booking. Farnham Leisure Centre is the published club address, not a claim that every discipline trains at the same site.",
    ],
    founded_year: 1985,
    corrections: {
      website: "https://farnhamtri.co.uk/",
      city: "Farnham",
      address: "Farnham Leisure Centre, Dogflud Way, Farnham, GU9 7UD",
      postcode: "GU9 7UD",
      address_kind: "training",
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    location_note:
      "Farnham Leisure Centre is one training venue. Aldershot Garrison and seasonal sessions at Blackbushe have separate arrangements; confirm your booked session's venue.",
    sources: [
      { title: "Club origins and disciplines", url: "https://farnhamtri.co.uk/" },
      { title: "Venues and enquiry contacts", url: "https://farnhamtri.co.uk/contact-us/" },
      { title: "Youth coaching and cycling safety", url: "https://farnhamtri.co.uk/ftc-youth/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "haslemere-border-ac": {
    summary:
      "Haslemere Border AC is a Surrey running and athletics club with a Woolmer Hill base, a junior section and the Gibbet Hill 10K.",
    biography: [
      "Haslemere Border Athletic Club began as Border AC in 1959, founded by Bill Sykes. Early sessions took place at Hindhead playing fields while members helped build facilities at Woolmer Hill. The pavilion opened in 1964, and the club adopted the Haslemere Border name in 1971. Originally a track and field club and a founding member of the Men's Southern League, it has developed a strong road and cross-country programme in Haslemere, Surrey, England.",
      "Today's Woolmer Hill Sports Association base has a short all-weather track and a grass oval, while training also uses the Devil's Punch Bowl and other local routes. Ability groups and a Young Athletes section offer different ways into the club, and prospective members can arrange a trial. The Gibbet Hill 10K is a longstanding club event; the history also records its first Southern Cross Country League title in 2016–17. Check the training calendar for the actual meeting point, as sessions move between locations.",
    ],
    founded_year: 1959,
    notable_members: [
      {
        name: "Bill Sykes",
        connection: "Founder",
        detail: "Founded Border AC in 1959, the club later renamed Haslemere Border AC.",
      },
    ],
    corrections: {
      address:
        "Woolmer Hill Sports Association, The Pavilion, Woolmer Hill, Haslemere, Surrey, GU27 1QA",
      postcode: "GU27 1QA",
      address_kind: "clubhouse",
    },
    sources: [
      {
        title: "Club origins, facilities and cross-country milestone",
        url: "https://www.hbac.co.uk/about",
      },
      { title: "Role contacts and club address", url: "https://www.hbac.co.uk/contact" },
    ],
    reviewed_at: "2026-10-14",
  },
  "hastings-ac": {
    summary:
      "Hastings Athletic Club offers track and field, cross-country and road running from the Ark Alexandra Athletics Arena in East Sussex.",
    biography: [
      "Hastings Athletic Club has roots in the late 1960s and provides athletics in Hastings, East Sussex, England. It is a registered charity, run through its membership, trustees and committee, with a year-round programme at the track historically known as William Parker. Sprinting, distance running, throws, jumps and pole vault sit alongside cross-country and road events. The club welcomes new athletes and people returning to the sport, with family and individual membership options.",
      "The published starting age is eight, and prospective members can request free trial sessions before joining. Coaches organise groups around the different events, while members compete in regional leagues and local competitions. The current contact page identifies the venue as Ark Alexandra Athletics Arena on Park Avenue, rather than the older Parkstone Road directory address. Use the club's enquiry form to discuss the right training group and confirm access arrangements before a first visit.",
    ],
    corrections: {
      address: "Ark Alexandra Athletics Arena, Park Avenue, Hastings, East Sussex, TN34 2PG",
      postcode: "TN34 2PG",
      address_kind: "training",
    },
    sources: [
      {
        title: "Charitable purpose and club history",
        url: "https://hastingsathleticclub.co.uk/about/",
      },
      {
        title: "Starting age, disciplines and trial sessions",
        url: "https://hastingsathleticclub.co.uk/",
      },
      {
        title: "Current arena address and contact form",
        url: "https://hastingsathleticclub.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "hastings-runners": {
    summary:
      "Hastings Runners is an East Sussex running club with Horntye club nights, track sessions, walking and Walk2Run support for beginners.",
    biography: [
      "Hastings Runners grew out of the running boom of the 1980s and now offers a varied programme in Hastings, East Sussex, England. Wednesday club night brings together four groups for hour-long runs, with Horntye as a regular meeting point. Track work, longer weekend outings and other organised runs give members options through the week. The club describes a broad range of abilities, from runners preparing for fast marathons to people building confidence over 5K.",
      "Beginners can look out for the club's Walk2Run programme, and a walking group offers another way to take part. Volunteers lead training and organise club races, including internal championship events. The public welcome-and-information Facebook group and chair's email provide routes for enquiries; the members' mailing list is separate. Check the session notice for the meeting point, particularly for long runs and outings away from Horntye. Published membership fees differ between website pages, so confirm the current subscription when joining.",
    ],
    corrections: { website: "https://hastingsrunners.co.uk/", sports: ["Running", "Walking"] },
    location_note:
      "Horntye is a regular club-run meeting point, not the venue for every session. Track and away runs have separate arrangements.",
    sources: [
      {
        title: "Origins, volunteer programme and beginner groups",
        url: "https://hastingsrunners.co.uk/about-us/",
      },
      {
        title: "Club sessions and information groups",
        url: "https://hastingsrunners.co.uk/club-info/",
      },
      { title: "Chair's enquiry address", url: "https://hastingsrunners.co.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "haywards-heath-harriers": {
    summary:
      "Haywards Heath Harriers serves Mid Sussex with track and field, road, trail and cross-country running, junior coaching and trial sessions.",
    biography: [
      "Haywards Heath Harriers developed from a young cross-country group in 1965 and formally affiliated in February 1966, the year it recognises as its foundation. The club in Haywards Heath, West Sussex, England, later expanded into track and field, road running and other endurance disciplines. Daley Thompson began his athletics career with the Harriers before becoming a double Olympic decathlon champion. The club celebrated its sixtieth anniversary in 2026.",
      "Whitemans Green near Cuckfield is central to summer athletics, with Warden Park used for winter training. The programme also includes road and trail racing, the South Downs Way Relay and cross-country. Adults can arrange trial sessions, while young athletes have a separate joining route. The club is supporting the proposed Whitemans Green Active Track, an all-weather community facility; this remains a development project, not a completed track advertised for training. Newcomers receive their meeting instructions before attending, rather than travelling to the older directory correspondence address.",
    ],
    founded_year: 1966,
    notable_members: [
      {
        name: "Daley Thompson",
        connection: "Early-career club athlete",
        detail:
          "Began athletics with the Harriers before winning Olympic decathlon gold in 1980 and 1984.",
      },
    ],
    corrections: {
      website: "https://www.haywardsheathharriers.co.uk/",
      address: "",
      postcode: "",
      location_precision: "area-only",
    },
    location_note:
      "Summer athletics uses Whitemans Green near Cuckfield and winter training uses Warden Park. Confirm the group-specific meeting point; the former Bower address is not a confirmed training venue.",
    sources: [
      {
        title: "Sixtieth-anniversary history and training homes",
        url: "https://www.haywardsheathharriers.co.uk/history.html",
      },
      {
        title: "Adult programme and trial enquiries",
        url: "https://www.haywardsheathharriers.co.uk/join-us",
      },
      { title: "General enquiry form", url: "https://www.haywardsheathharriers.co.uk/contact-us" },
    ],
    reviewed_at: "2026-10-14",
  },
  "horsham-blue-star-harriers": {
    summary:
      "Horsham Blue Star Harriers is a West Sussex athletics club with track and field, cross-country and road running at Broadbridge Heath.",
    biography: [
      "Horsham Blue Star Harriers marked a hundred years of its present club in 2025. It was re-established on 4 February 1925 after an earlier Horsham club had closed during the First World War. That predecessor counted distance-running pioneer Alfred Shrubb among its athletes. Later generations built a strong cross-country tradition: the club won the Sussex men's championship nine years in succession from 1946 to 1954. Track and field and Sportshall athletics broadened the programme over subsequent decades.",
      "The club is based at the Broadbridge Heath track in Horsham, West Sussex, England, with coaching for track and field, road running and cross-country. Main-club joining information is aimed at athletes over ten, while the Martlets group provides a separate introduction for eight- to ten-year-olds. Training and membership are arranged through the club's enquiry routes. Its published history recognises volunteers as well as international athletes, including John Luxford's long service as runner, coach, team manager and official.",
    ],
    founded_year: 1925,
    notable_members: [
      {
        name: "Alfred Shrubb",
        connection: "Athlete of the pre-First World War club",
        detail:
          "Competed for Horsham Blue Star before joining South London Harriers; this association predates the present club's 1925 re-establishment.",
      },
      {
        name: "John Luxford",
        connection: "Historical athlete and volunteer",
        detail:
          "Joined in 1950 and served the club and Sussex athletics for six decades as athlete, coach, team manager and official.",
      },
    ],
    corrections: {
      city: "Horsham",
      website: "https://www.horshambluestarharriers.org.uk/",
      address: "",
      postcode: "",
      location_precision: "area-only",
    },
    location_note:
      "Training is based at the Broadbridge Heath athletics track in Horsham. The older Haywards Heath street address is not a confirmed training venue; ask the club for the entrance and session arrangements.",
    sources: [
      {
        title: "Centenary history and historical athletes",
        url: "https://www.horshambluestarharriers.org.uk/centenary",
      },
      { title: "Club disciplines", url: "https://www.horshambluestarharriers.org.uk/about.html" },
      {
        title: "Main club and Martlets entry routes",
        url: "https://www.horshambluestarharriers.org.uk/join-us.html",
      },
      { title: "Contact form", url: "https://www.horshambluestarharriers.org.uk/contact-us.html" },
    ],
    reviewed_at: "2026-10-14",
  },
  "horsham-joggers": {
    summary:
      "Horsham Joggers is a West Sussex running club with paced road and trail groups, coached sessions at The Bridge and community races.",
    biography: [
      "Horsham Joggers was formally constituted in 1984, following an informal group that had begun several years earlier. Founder Dave Bridges organised beginner sessions from Horsham Park at a time when jogging was attracting new participants. His account describes a club built around looking after newcomers, alongside demanding longer runs through St Leonard's Forest. The club in Horsham, West Sussex, England, retains that mix of recreational running and personal challenge.",
      "Tuesday groups meet outside The Bridge Leisure Centre in Broadbridge Heath, while Thursday track sessions use its athletics entrance. Road and trail outings cover a range of paces, with additional marathon preparation and other coached sessions. The club organises the Horsham 10K and takes part in the West Sussex Fun Run League. RunAndTalk activities provide a wellbeing focus alongside racing. Prospective members can use the contact form or introduce themselves on a club night, checking the calendar for sessions that meet elsewhere.",
    ],
    founded_year: 1984,
    notable_members: [
      {
        name: "Dave Bridges",
        connection: "Founder and early secretary",
        detail:
          "Organised the original beginner sessions and developed the West Sussex Fun Run League, as recalled in his club history.",
      },
    ],
    corrections: {
      address:
        "The Bridge Leisure Centre, Wickhurst Lane, Broadbridge Heath, Horsham, West Sussex, RH12 3YS",
      postcode: "RH12 3YS",
      address_kind: "training",
    },
    sources: [
      {
        title: "Firsthand account of origins and 1984 constitution",
        url: "https://www.horshamjoggers.co.uk/club-history/",
      },
      { title: "Training and community programme", url: "https://www.horshamjoggers.co.uk/" },
      {
        title: "Current meeting point and contact form",
        url: "https://www.horshamjoggers.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "brown-shoes-tc": {
    summary:
      "Brown Shoes Triathlon Club grew from Newtownabbey's Try a Tri sessions and offers pool coaching, cycling and support for newcomers in Northern Ireland.",
    biography: [
      "Brown Shoes Triathlon Club started in 2017 after friends met through Try a Tri programmes at the Valley Leisure Centre in Newtownabbey, Northern Ireland. Its coaches include members who developed from beginners into long-distance triathletes. Pool sessions use the Valley Leisure Centre and Antrim Forum, while cycling changes with the season: outdoor rides in better weather give way to virtual cycling and spin sessions during colder months.",
      "The club offers three trial sessions and asks swimmers to be able to complete about 250 metres front crawl before joining its pool groups. Anyone not yet at that stage can contact the club to discuss options. Membership is arranged through Triathlon Ireland by selecting Brown Shoes TC. Although running is part of triathlon, the detailed training page says the club does not currently organise regular group runs; members run independently or with local running clubs. Confirm the discipline and venue when booking a trial.",
    ],
    founded_year: 2017,
    corrections: { city: "Newtownabbey" },
    location_note:
      "Pool training uses Valley Leisure Centre in Newtownabbey and Antrim Forum. Cycling arrangements vary; the club does not currently advertise regular organised group runs.",
    sources: [
      { title: "2017 origins", url: "https://brownshoestriathlonclub.co.uk/" },
      {
        title: "Try a Tri beginnings and coaching",
        url: "https://brownshoestriathlonclub.co.uk/about",
      },
      {
        title: "Discipline-specific training arrangements",
        url: "https://brownshoestriathlonclub.co.uk/swim-%2F-bike-%2F-run",
      },
      {
        title: "Trials, swimming requirement and membership",
        url: "https://brownshoestriathlonclub.co.uk/join-us",
      },
      { title: "Club email and form", url: "https://brownshoestriathlonclub.co.uk/contact" },
    ],
    reviewed_at: "2026-10-14",
  },
  "special-olympics-newtownabbey-racers": {
    summary:
      "Newtownabbey Racers is a Special Olympics athletics club at Valley Leisure Centre, offering a local training route for people with intellectual disabilities.",
    biography: [
      "Newtownabbey Racers Special Olympics Club provides athletics for people with intellectual disabilities in Newtownabbey, Northern Ireland. Disability Sport NI's Active Living No Limits directory identifies it as a Special Olympics-affiliated club based at Valley Leisure Centre on Church Road. Athletics training is the core activity in that listing, alongside other club activities.",
      "The directory advertises a Wednesday evening session and publishes a club email and telephone for enquiries. Prospective athletes, families and supporters should use those contacts to check eligibility, available places and the current session arrangements before travelling. The leisure centre is a training venue, not a separate club postal office. A founding date and fuller club history have not been established from the accessible primary material, so this profile stays focused on the published programme and joining route.",
    ],
    corrections: {
      city: "Newtownabbey",
      address: "Valley Leisure Centre, Church Road, Newtownabbey",
      postcode: "",
      address_kind: "training",
    },
    sources: [
      {
        title: "Disability Sport NI activity directory: Newtownabbey Racers listing",
        url: "https://activelivingnolimits.co.uk/find-an-opportunity/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-ace-a-c": {
    summary:
      "Ace Athletics Club in Drogheda, County Louth, combines junior development and adult running, with family participation and a growing international youth pathway.",
    biography: [
      "Ace Athletics Club serves Drogheda, County Louth, Ireland, with a family-focused programme for juniors and adults. Its approach brings newer athletes and experienced competitors into the same club community. The club's own account describes training at St Oliver's Community College; an Athletics Ireland feature in February 2026 explains that a purchased eleven-acre site is intended for future development rather than an already operating permanent home.",
      "Athletics Ireland has highlighted Ace athletes Eimear Cooney and Lorcán Forde Dunne, whose Boston invitational trip offered experience alongside senior international competitors. That development pathway sits alongside recreational membership and younger age groups. Children must turn seven in the year they join, and applications are processed by the club registrar before payment and Athletics Ireland registration. Contact the club for the current training location and group. Published founding accounts disagree between 2018 and 2019, so no exact founding year is assigned here.",
    ],
    notable_members: [
      {
        name: "Eimear Cooney",
        connection: "Athletics Ireland club spotlight, February 2026",
        detail:
          "Named as an Ace athlete with underage Irish team experience and featured following a Boston high-school invitational mile trip.",
      },
      {
        name: "Lorcán Forde Dunne",
        connection: "Athletics Ireland club spotlight, February 2026",
        detail:
          "Featured as an Ace athlete developing through underage Irish teams and a Boston invitational experience.",
      },
    ],
    corrections: {
      city: "Drogheda",
      website: "https://www.aceathletics.ie/",
      address: "",
      postcode: "",
      location_precision: "area-only",
    },
    location_note:
      "Confirm the current group venue with the club. The directory coordinates are not a street address, and the planned permanent training site is not presented as an operating facility.",
    sources: [
      { title: "Club purpose and school training base", url: "https://www.aceathletics.ie/about" },
      {
        title: "Age eligibility and membership process",
        url: "https://www.aceathletics.ie/join-us",
      },
      {
        title: "Athletics Ireland club feature and facility plans, February 2026",
        url: "https://www.athleticsireland.ie/club-spotlight-acing-it-in-boston-with-ace-athletics-club/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-an-bru-a-c": {
    summary:
      "An Brú Athletics Club is based around Bruff in County Limerick, welcoming runners of different abilities through local club training and Athletics Ireland membership.",
    biography: [
      "An Brú Athletics Club was established in 2014 in the Bruff area of County Limerick, Ireland. Its listing with Limerick City and County Council welcomes new members of all abilities and describes a three-session weekly programme. The emphasis is on local participation in athletics and running, with public email and telephone contacts for people considering joining.",
      "Athletics Ireland lists the club as mixed and provides online joining and renewal. Its directory names Ballingoola, Grange, near Kilmallock as a training location, while the council listing describes the wider Bruff base. These are different levels of location detail, not evidence that every session starts at one address. Ask the club which group and meeting point are appropriate before attending; exact current session times and a fuller historical account remain to be confirmed.",
    ],
    founded_year: 2014,
    corrections: { city: "Bruff" },
    location_note:
      "The council describes a Bruff-area club; Athletics Ireland lists Ballingoola, Grange, near Kilmallock. Confirm the meeting point for your training group.",
    sources: [
      {
        title: "Council club listing, origins and public contacts",
        url: "https://www.limerick.ie/discover/eat-see-do/sports-recreation/sports-clubs-classes/athletics/an-bru-athletics-club",
      },
      {
        title: "Athletics Ireland training location and membership",
        url: "https://membership.athleticsireland.ie/clubpage/An_Bru_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-ardattin-a-c": {
    summary:
      "Ardattin Athletics Club serves County Carlow, with local athletics and links to the county's collaborative training programme for teenage athletes.",
    biography: [
      "Ardattin Athletics Club is based in Ardattin, County Carlow, Ireland. Athletics Ireland lists it as a mixed club, with a training location at Cranns in Ardattin and an online membership route. Its place in the county's athletics community extends beyond one venue: coach Barry Byrne contributed to Athletics Ireland's May 2026 feature on the Carlow Training and Development Group.",
      "That county collaboration gives athletes aged twelve and over an additional way to train with peers, bringing sprint and endurance groups together at SETU in Carlow. The programme complements local clubs rather than replacing them, with an emphasis on retaining teenagers in sport and developing coaches. For Ardattin membership, use the club's Athletics Ireland joining route and confirm local session arrangements before attending. SETU is the shared county programme's venue, not a replacement address for every Ardattin session.",
    ],
    corrections: { city: "Ardattin" },
    location_note:
      "Athletics Ireland lists Cranns, Ardattin for club training. SETU Carlow hosts the separate county development group described in the biography.",
    sources: [
      {
        title: "Club location and membership route",
        url: "https://membership.athleticsireland.ie/clubpage/Ardattin_A.C.",
      },
      {
        title: "County teenage-development programme and Ardattin coach interview",
        url: "https://www.athleticsireland.ie/carlow-clubs-unite-to-tackle-teen-drop-off-in-athletics/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-ardmore-a-c": {
    summary:
      "Ardmore Athletics Club is a juvenile club in Ardmore, County Waterford, training at the local GAA pitch with membership through Athletics Ireland.",
    biography: [
      "Ardmore Athletics Club is a juvenile athletics club based in Ardmore, County Waterford, Ireland. Its club-authored Athletics Ireland listing identifies the local Ardmore GAA pitch as the training venue. The listing explicitly says that its separate Ferrypoint, Kinsalebeg, Youghal address is for post only; that address should not send a new athlete to the wrong place for training.",
      "Families can use the club's public email to ask about the current groups, session times and joining arrangements. Athletics Ireland provides online joining and renewal, but the directory does not establish a minimum starting age or available places. Those details should be confirmed directly with the club. No unsupported founding year or famous-member association is added to this profile.",
    ],
    corrections: { city: "Ardmore", address_kind: "correspondence" },
    location_note:
      "The Ferrypoint/Kinsalebeg/Youghal address is expressly postal only. Training is at Ardmore GAA pitch in County Waterford; confirm the session and entrance with the club.",
    sources: [
      {
        title: "Club-authored venue, postal-address distinction and juvenile scope",
        url: "https://membership.athleticsireland.ie/clubpage/Ardmore_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-beechmount-harriers-a-c": {
    summary:
      "Beechmount Harriers is a Belfast athletics club with a Mary Peters Track base and a history spanning track, cross-country and distance running.",
    biography: [
      "Beechmount Harriers was formed in Belfast, Northern Ireland, in 1980 by members of the former Belfast Olympic club. In a 2022 anniversary interview, Stuart Kennedy described his father Jim's role as a founder and designer of the red-and-green club vest. The club's programme has encompassed track running, cross-country and marathons, with younger athletes and masters runners sharing a long-established local athletics community.",
      "Athletics Ireland's current listing identifies Mary Peters Track on Upper Malone Road as the training location and provides a shared club email, telephone and membership link. Contact the club for today's group arrangements rather than relying on the timetable in the older anniversary interview. Historical athletes include Teresa Duffy, whose Athletics Northern Ireland interview recalls running for Beechmount through much of her competitive career. That history is distinct from a claim about her present membership or any new athlete-profile verification.",
    ],
    founded_year: 1980,
    notable_members: [
      {
        name: "Teresa Duffy",
        connection: "Historical club athlete",
        detail:
          "Athletics Northern Ireland's 2011 interview records her long Beechmount association and her 1998 Dublin Marathon victory.",
      },
    ],
    corrections: {
      address: "Mary Peters Track, Upper Malone Road, Belfast, BT9 5PR",
      postcode: "BT9 5PR",
      address_kind: "training",
    },
    sources: [
      {
        title: "Current Athletics Ireland venue and club contacts",
        url: "https://membership.athleticsireland.ie/clubpage/Beechmount_Harriers_A.C.",
      },
      {
        title: "Founder's family and club members interviewed on the anniversary",
        url: "https://belfastmedia.com/back-on-top-after-covid-paul-elliott-and-beechmount-harriers-stay-firmly-on-the-track",
      },
      {
        title: "Athletics Northern Ireland interview with Teresa Duffy, 2011",
        url: "https://athleticsni.blogspot.com/2011/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "armagh-pikekickers-triathlon-club": {
    corrections: { city: "Armagh", adult_only: true },
    summary:
      "Armagh Pikekickers Triathlon Club brings swimmers, cyclists and runners together in County Armagh and organises Tri the Orchard at Loughgall.",
    biography: [
      "Armagh Pikekickers Triathlon Club was established in 2014 and marked its tenth anniversary in 2024. In an anniversary interview, its chair and committee described a club built around training, race trips and friendships across the greater Armagh area of Northern Ireland. Tri the Orchard at Loughgall Country Park is a club-organised sprint triathlon, connecting its swimming, cycling and running programme with a local event.",
      "Triathlon Ireland lists Armagh Pikekickers as an adult club and publishes a shared enquiry email. Prospective members should use that address to confirm current sessions and eligibility; an older account mentioning teenage members does not establish today's junior provision. The governing body's 2018 School Games feature records Jordan Johnson's association with the club before his selection for Ireland. Loughgall is an event location, not evidence of a single headquarters or the venue for every training session.",
    ],
    founded_year: 2014,
    notable_members: [
      {
        name: "Jordan Johnson",
        connection: "Historical club association, 2018",
        detail:
          "Triathlon Ireland named him as an Armagh Pikekickers athlete when announcing Ireland's 2018 School Games team.",
      },
    ],
    location_note:
      "Loughgall Country Park hosts Tri the Orchard. Ask the club about current training venues; no exact headquarters address has been established.",
    sources: [
      {
        title: "Triathlon Ireland club directory and adult membership scope",
        url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/",
      },
      {
        title: "Tenth-anniversary interview with club officers",
        url: "https://armaghi.com/news/armagh-news/armagh-pikekickers-triathlon-club-celebrating-ten-years-of-fitness-and-friendship/255517",
      },
      {
        title: "Jordan Johnson's historical club association",
        url: "https://www.triathlonireland.com/news/2018/team-ireland-selected-for-uk-schools-finals/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
};
