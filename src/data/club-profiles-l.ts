import type { ClubProfile } from "./club-profiles";

// Club editorial evidence opened on 14 October 2026; not athlete identity verification.
export const southEastAndCommunityClubProfiles: Record<string, ClubProfile> = {
  "ashford-and-district-rrc": {
    summary:
      "Ashford & District Road Running Club is an adult running club in Ashford, Kent, with a Sandyacres base, coached track sessions and local road races.",
    biography: [
      "Ashford & District Road Running Club has brought runners together in Ashford, Kent, England, since 1988. Volunteers run the club and reinvest its funds in members' activities. Its home is Sandyacres Sports & Social Club in Kennington, where evening road groups start and runners can use the changing facilities. Coached sessions at the Julie Rose Stadium add track work to a programme that also includes hills, strength and conditioning, and longer weekend runs.",
      "Membership is open from age 18, with groups for beginners as well as experienced distance runners. Prospective members should use the enquiry form to arrange a trial before joining. The club also organises the Ashford & District 10 and 5 Mile races around Westwell and the Ashford 10K. Sandyacres is the social and road-running base, not the venue for every session; hill runs and weekend outings have their own meeting arrangements.",
    ],
    founded_year: 1988,
    corrections: { adult_only: true, address_kind: "clubhouse", sports: ["Running", "Athletics"] },
    sources: [
      {
        title: "Club origins, training, membership and races",
        url: "http://www.ashforddistrictrrc.co.uk/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "ashford-striders-rc": {
    summary:
      "Ashford Striders is a not-for-profit running club in Ashford, Kent, offering paced club runs, technique sessions and free taster runs.",
    biography: [
      "Ashford Striders Running Club serves Ashford in Kent, England, with runners working towards anything from a first 5K to an ultra. It is a not-for-profit club, with membership income put back into its activities. Its programme combines runs at different paces with technique sessions, giving members opportunities to develop their running as well as find company for regular outings. Guest runners from other clubs are welcome.",
      "The club advertises running nights on Mondays, Tuesdays and Thursdays and offers free taster runs for prospective members. Its website provides a taster-session form and asks for advance notice so a suitable group can be arranged. Meeting places vary; the Railway Club on Beaver Road is listed for Thursday runs, while other sessions use different locations. Use the contact form or taster form to confirm where your first run starts rather than assuming every group meets at the same address.",
    ],
    corrections: { sports: ["Running"] },
    location_note:
      "The Railway Club is a published Thursday meeting point. Other sessions use different venues; confirm the current arrangement with the club.",
    sources: [
      { title: "Club purpose, weekly runs and tasters", url: "https://ashfordstriders.uk/about/" },
      { title: "Taster form and meeting arrangements", url: "https://ashfordstriders.uk/" },
      { title: "Club contact form", url: "https://ashfordstriders.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "ashford-triathlon-club": {
    summary:
      "Ashford Triathlon Club offers swimming, cycling and running in Ashford, Kent, with coached sessions, social training and a history beginning in 2005.",
    biography: [
      "Ashford Triathlon Club began in 2005 after a national age-group triathlon at the Julie Rose Stadium stirred local interest in the sport. A group of Ashford athletes wanted training closer to home, and an early meeting at the Ashford International Hotel established the name and committee. The Kent club in England marked its twentieth year in 2025. Its original chairman's account recalls a women's team prize at the Ashford & District 10K in February 2006, the club's first team outing.",
      "Today the programme covers swimming, cycling and running, with sessions changing by season. Published examples include winter track work at Julie Rose Stadium, coached swimming at Ashford School and spring runs in Kings Wood. The club directs members to Spond for current arrangements and distinguishes coached sessions from informal outings. Newcomers can email the membership team to arrange a taster; pool sessions require the ability to swim 100 metres front crawl. Training-plan and bike-skills sessions complement the regular practical work.",
    ],
    founded_year: 2005,
    corrections: {
      city: "Ashford",
      website: "https://ashfordtriclub.co.uk/members/join-us/",
      address: "",
      postcode: "",
      location_precision: "area-only",
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    location_note:
      "Training uses several Ashford-area venues and seasonal open-water locations. The older Wye street address is not a confirmed training base; check Spond or ask the membership team.",
    sources: [
      {
        title: "Twentieth anniversary and original chairman's history",
        url: "https://ashfordtriclub.co.uk/members/history/",
      },
      {
        title: "Membership and taster enquiries",
        url: "https://ashfordtriclub.co.uk/members/join-us/",
      },
      {
        title: "Seasonal training and swimming requirement",
        url: "https://ashfordtriclub.co.uk/members/training-schedule/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "blackwater-valley-runners": {
    summary:
      "Blackwater Valley Runners is based at Aldershot Cricket Club in Hampshire, with road and trail groups, track training and community fundraising races.",
    biography: [
      "Blackwater Valley Runners brings road and trail runners together in Aldershot, Hampshire, England. Aldershot Cricket Club on Guildford Road is the main base, with Wednesday club runs organised into pace groups. Track work, hill sessions and longer trail outings provide other ways to train. The club takes part in the MABAC league and organises the Woodland Woggle and Rushmoor Wellesley 10K, using race surpluses to support charities.",
      "The joining process starts with a free trial arranged through the club's contact form. After trying a run, prospective members receive the online joining information. Membership also includes associate use of the cricket club, giving Wednesday evenings a social base as well as a start line. Summer away runs explore different routes, and the club organises trips where members can race or support others. Check the session notice before travelling: away runs and trail outings do not all begin at the clubhouse.",
    ],
    corrections: { website: "https://bvrunners.org.uk/", address_kind: "clubhouse" },
    sources: [
      { title: "Training, base and charity races", url: "https://bvrunners.org.uk/" },
      { title: "Membership and free trial", url: "https://bvrunners.org.uk/join-us/" },
      {
        title: "Away runs, social activities and community support",
        url: "https://bvrunners.org.uk/club-info/",
      },
      { title: "Enquiries and clubhouse address", url: "https://bvrunners.org.uk/contact-us/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "burgess-hill-runners": {
    summary:
      "Burgess Hill Runners is a West Sussex running club founded in 1993, with coached ability groups, walking, daytime runs and countryside routes.",
    biography: [
      "Burgess Hill Runners was formally launched on 4 November 1993, after local runners met to discuss creating a club for the West Sussex town. Its first home was an unlikely one: the showers at Sydney West Sports Centre. The club grew through several venues and became involved in the West Sussex Fun Run League. Its history includes the Blackcap Handicap, the Downs Link relay and a beginners' programme introduced in 2009.",
      "The present programme in Burgess Hill, England, ranges from beginners and improvers to advanced runners, alongside walking and daytime groups. Winter sessions use local roads and include track visits to Lewes; summer running makes use of surrounding footpaths. Meeting points change weekly and sessions are booked through Coacha, so the old Dunstall Avenue directory address should not be used as a training destination. Email the shared club address for help registering and choosing a group that matches your current running distance.",
    ],
    founded_year: 1993,
    corrections: {
      address: "",
      postcode: "",
      location_precision: "area-only",
      sports: ["Running", "Walking"],
    },
    location_note:
      "Weekly locations are supplied by email and the Coacha booking system. Track visits to Lewes are separate from Burgess Hill sessions.",
    sources: [
      {
        title: "Club formation and development",
        url: "https://www.bhrunners.co.uk/our-ethos/club-history",
      },
      {
        title: "Current groups, booking and seasonal venues",
        url: "https://www.bhrunners.co.uk/training",
      },
      { title: "Club enquiries", url: "https://www.bhrunners.co.uk/contact-us" },
    ],
    reviewed_at: "2026-10-14",
  },
  "camberley-and-district-ac": {
    summary:
      "Camberley & District Athletic Club offers track and field, cross-country and sportshall athletics in Surrey, with junior and senior membership routes.",
    biography: [
      "Camberley & District Athletic Club took its present form in March 1953, following a meeting between Bert Oten, George Hemsley and Ewen Stephens. Its history reaches back to a 1930s group at Watchett's Park. After several moves around Camberley, Surrey, England, the club settled at what is now King's International College and later added access to facilities at the Royal Military Academy. Club activities include summer track and field, winter cross-country and sportshall athletics.",
      "Coaching covers sprints, jumps, throws and middle-distance running, with venues changing by group and season. The winter 2026–27 programme also uses Tomlinscote and Lightwater Leisure Centre. Junior entry starts at school Year 5, but the membership page currently says the waiting list is closed for Year 5 and above; families should check the separate Year 4 enquiry arrangements before applying. Adults can contact the membership secretary for the senior coordinator. The club also welcomes volunteer coaches and helpers for its Camberley 10K and open cross-country events.",
    ],
    founded_year: 1953,
    notable_members: [
      {
        name: "Jonathon Dennis",
        connection: "Historical club athlete",
        detail:
          "The club history credits him with winning the Inter-Counties, English Schools and National under-17 cross-country titles in one season; it does not give the year.",
      },
    ],
    corrections: {
      city: "Camberley",
      website: "https://www.camberleyathletics.org.uk/index.php?pg=2",
      address: "King's International College, Watchetts Drive, Camberley, GU15 2PQ",
      address_kind: "training",
      sports: ["Running", "Athletics"],
    },
    location_note:
      "King's is the headquarters, not the venue for every group. The Royal Military Academy has controlled entry requiring driver ID; confirm the assigned venue and access with the club.",
    sources: [
      {
        title: "Club history and community events",
        url: "https://camberleyathletics.org.uk/index.php?pg=12",
      },
      {
        title: "Membership and waiting-list restrictions",
        url: "https://www.camberleyathletics.org.uk/index.php?pg=2",
      },
      {
        title: "Winter 2026–27 training venues",
        url: "https://www.camberleyathletics.org.uk/index.php?pg=3",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "deal-tri-club": {
    summary:
      "Deal Tri Club is a swimming, cycling, running and triathlon club in Deal, Kent, with junior activities and roots in Deal Striders and Deal Tri Squad.",
    biography: [
      "Deal Tri Club grew from Deal Striders, formed in 1983, and the Deal Tri Squad that followed in 1986. The two groups merged in 1993 as Deal Triathlon and Running Club before adopting the shorter name in 1996. Based in Deal, Kent, England, the club serves athletes across the surrounding coastal towns. Its programme covers swimming, cycling, running, triathlon and duathlon, with dedicated junior swimming and other junior activities.",
      "The club organises local events including the Deal Half Marathon and Dinosaur 10K, and its calendar carries training and social outings. Prospective members may attend trial sessions, but swimming trials require prior agreement with the swim captain and Saturday road cycling does not accommodate under-16s. The membership secretary can explain the appropriate route into the club. Training uses different venues; the Margate address in the older directory is not evidence that Deal Tri is based or trains there.",
    ],
    founded_year: 1993,
    notable_members: [
      {
        name: "Ian Pettitt",
        connection: "Co-founder and former president",
        detail:
          "The club's late president co-founded Deal Tri Squad and wrote its account of the early meetings and first members.",
      },
      {
        name: "Roger Francis-Darby",
        connection: "Co-founder of predecessor Deal Tri Squad",
        detail:
          "A local PE teacher and Deal Striders member, remembered in the club history as one of the triathlon squad's founders.",
      },
    ],
    corrections: {
      city: "Deal",
      address: "",
      postcode: "",
      location_precision: "area-only",
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    location_note:
      "Deal Tri uses separate swimming, cycling and running venues. Ask the relevant captain or check the current calendar; the old Margate directory address is not a training venue.",
    sources: [
      {
        title: "Predecessors, merger and founders",
        url: "https://www.dealtri.co.uk/about/history/",
      },
      {
        title: "Membership and trial-session restrictions",
        url: "https://www.dealtri.co.uk/membership/",
      },
      { title: "Sport and membership contacts", url: "https://www.dealtri.co.uk/contact/" },
      { title: "Club calendar and events", url: "https://www.dealtri.co.uk/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "dorking-and-mole-valley-ac": {
    summary:
      "Dorking & Mole Valley AC is a Surrey running and athletics club with junior coaching, Surrey Hills routes, walking groups and the Dorking Tens races.",
    biography: [
      "Dorking & Mole Valley Athletic Club makes use of the Surrey Hills around Dorking, England, for a programme that spans social running, track work and cross-country competition. The club caters for juniors, beginners, returning runners and experienced athletes. Pixham Lane Sports Ground is an important base, while the Dorking Tens brings runners together for 10-mile and 10K races. The event marked its fortieth year in 2026; that anniversary is not the club's founding date.",
      "Training includes coached sessions, pace-based club runs, run-walk groups and a walking group. Monday social outings finish with coffee, while other groups focus on speed, endurance or competition. Denbies, St Martin's School and Dorking Leisure Centre feature in the seasonal programme, so check the timetable rather than heading automatically to Pixham Lane. The club asks first-time visitors to arrive early to meet their coach or run leader and provide emergency contact details. Enquiries can be made through its contact page.",
    ],
    corrections: { address_kind: "training", sports: ["Running", "Athletics", "Walking"] },
    location_note:
      "Pixham Lane is one club base. Training locations vary by group and season, including Denbies, St Martin's School and Dorking Leisure Centre.",
    sources: [
      { title: "Club programme and Dorking Tens", url: "https://www.dmvac.org/" },
      { title: "Club introduction", url: "https://www.dmvac.org/about/" },
      { title: "Training groups and seasonal venues", url: "https://www.dmvac.org/training/" },
      { title: "Club contact page", url: "https://www.dmvac.org/contact/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-crickhowell-running-club": {
    summary:
      "Crickhowell Running Club is a community club in Powys, Wales, with Thursday running and walking groups and Couch to 5K courses.",
    biography: [
      "Crickhowell Running Club brings together runners and walkers in Crickhowell, Powys, Wales. Its regular Thursday gathering starts at The Courtyard on Standard Street, with running groups covering roughly three, five or six miles and a separate walking group. That range lets people choose an outing suited to their experience rather than fit into a single pace or distance. The club is affiliated to Welsh Athletics.",
      "For people starting from scratch, the club facilitates Couch to 5K groups at different points through the year. Availability is best checked directly rather than assumed from an older course announcement. The shared enquiry email and contact form cover membership, first visits and club events, and the club's Facebook and X pages provide additional updates. Prospective members can use those contacts to ask which group is suitable and confirm the next meeting before travelling.",
    ],
    corrections: {
      address: "The Courtyard, Standard Street, Crickhowell, NP8 1BZ",
      postcode: "NP8 1BZ",
      address_kind: "training",
      location_precision: "postcode",
      sports: ["Running", "Walking"],
    },
    sources: [
      {
        title: "Meeting point, running groups and beginner courses",
        url: "https://www.crickhowellrunningclub.co.uk/",
      },
      {
        title: "Club introduction and affiliation",
        url: "https://www.crickhowellrunningclub.co.uk/about/",
      },
      { title: "Public enquiries", url: "https://www.crickhowellrunningclub.co.uk/contact/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-deestriders-b-s-rc": {
    summary:
      "Deestriders Running Club serves Shotton and Deeside in North Wales, combining road, trail and track sessions with beginner courses and its Off Road Grand Prix.",
    biography: [
      "Deestriders Running Club has been active around Deeside in North Wales for more than forty years and was a founding member of the Borders League. Road runs start in Shotton, while trail outings explore the surrounding area and the Clwydian Range. Members can also take part in track sessions, local fell races and the North Wales Cross Country League. The club's Off Road Grand Prix is a four-race summer series on the banks of the Dee.",
      "New runners are offered a free trial and help choosing a training group. Faster runners loop back and groups stop to regroup, while a developers' group helps people progress beyond 5K. Ash Grove car park is the road-running meeting point; track and trail sessions have separate locations. The website also advertises a January Couch to 5K course. Contact the membership liaison before a first visit to confirm the current arrangements and the group that best matches your experience.",
    ],
    corrections: {
      city: "Shotton",
      address: "Ash Grove car park, Shotton",
      postcode: "",
      address_kind: "training",
      location_precision: "area-only",
    },
    location_note:
      "Ash Grove is the road-run meeting point. Club pages give conflicting CH5 1AF and CH5 1AG postcodes, so neither is assigned here. Track and trail sessions meet elsewhere.",
    sources: [
      {
        title: "Club background and weekly activities",
        url: "https://www.deestridersrunningclub.net/",
      },
      {
        title: "Joining, liaison contact and meeting points",
        url: "https://www.deestridersrunningclub.net/info.html",
      },
      {
        title: "Off Road Grand Prix and venue",
        url: "https://www.deestridersrunningclub.net/orgp.html",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-griffithstown-harriers": {
    summary:
      "Griffithstown Harriers is a Cwmbran running club founded in 1983, offering road running, cross-country, coached sessions and local community races.",
    biography: [
      "Griffithstown Harriers was established in 1983 and is based in Cwmbran, Torfaen, Wales. The club welcomes runners working towards a first 5K as well as experienced distance runners. Its programme includes road running and cross-country, with structured speed, hill and drill sessions alongside club handicaps. Local events include the Sorbrook Slog, Sorbrook Tough 10K and Boxing Day Fun Run.",
      "Regular Tuesday and Thursday training meets outside The Olive Tree in Cwmbran, with session details managed through the Heja app. Prospective members can arrange a one-month trial and ask about an appropriate group through the shared club email. The social calendar includes charity activities, club meals and visits to different parkruns. Use the current .com club website or its governing-body listing for information: the former .co.uk address is no longer a reliable club source.",
    ],
    founded_year: 1983,
    corrections: {
      city: "Cwmbran",
      county: "Torfaen",
      website: "https://www.griffithstownharriers.com/",
      address_kind: "training",
    },
    sources: [
      {
        title: "Current club website, origins and training",
        url: "https://www.griffithstownharriers.com/",
      },
      {
        title: "Governing-body venue, contacts and disciplines",
        url: "https://www.welshathletics.org/en/club/view/griffithstown-harriers",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-islwyn-rc": {
    summary:
      "Islwyn Running Club trains from Blackwood Rugby Club in Wales, with paced runs, coached sessions and road and cross-country league racing.",
    biography: [
      "Islwyn Running Club is based at Blackwood Rugby Club in Blackwood, Wales, and welcomes runners aged 16 and over. Tuesday groups are organised around pace and distance, while Thursday coaching works on technique, efficiency and preparation for races. Members range from newcomers to experienced marathon runners. The club also takes part in the Gwent Leisure Centre League's summer road and winter cross-country programme.",
      "The 2023–24 season marked Islwyn's fortieth anniversary, celebrated with the introduction of the Sirhowy Loop alongside the Sirhowy Challenge. Club events also raise money for nominated charities; its website names HCT Vulnerable and Homeless for 2025, rather than identifying a confirmed current beneficiary. Prospective members can email the membership secretary to choose a first session and check the monthly training calendar. Blackwood Rugby Club is the regular meeting point, but event and race venues should be checked separately.",
    ],
    corrections: { city: "Blackwood", address_kind: "training" },
    sources: [
      {
        title: "Club age range, anniversary and community activity",
        url: "https://www.islwynrunningclub.com/",
      },
      {
        title: "Regular training programme and meeting point",
        url: "https://www.islwynrunningclub.com/training/",
      },
      { title: "Membership enquiries", url: "https://www.islwynrunningclub.com/contact-us/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-borrisokane-a-c": {
    summary:
      "Borrisokane AC is an athletics club in County Tipperary, Ireland, with juvenile and adult membership and an inclusive Run with Dunne community race programme.",
    biography: [
      "Borrisokane Athletic Club serves Borrisokane in County Tipperary, Ireland. Athletics Ireland lists it as a mixed club, with training at Ballyhaden. A distinctive part of its recent story is Run with Dunne, a race programme in which people run, walk and wheel together. The club's fundraising account explains how wheelchair racer Cillian Dunne became its first wheelchair athlete and how the initiative helped welcome more para-athletes into the club.",
      "The programme combines a 5K with a children's 1K and raises funds for inclusive athletics and Dunne's sporting ambitions. Borrisokane also has a link to Gaelic football: in a 2020 GAA interview, Tipperary player Philip Austin credited his youth athletics at the club with helping develop his speed and fitness. Current membership and renewal are available through the Athletics Ireland club page. Prospective athletes should confirm the appropriate training group and arrangements before attending Ballyhaden.",
    ],
    notable_members: [
      {
        name: "Cillian Dunne",
        connection: "Club wheelchair athlete",
        detail:
          "The club identifies him as its first wheelchair racer and the athlete whose ambitions inspired the Run with Dunne fundraising series.",
      },
      {
        name: "Philip Austin",
        connection: "Former youth athlete",
        detail:
          "The Tipperary footballer described his Borrisokane athletics background in a December 2020 GAA interview; this is a historical association, not a claim of current athletics membership.",
      },
    ],
    corrections: { city: "Borrisokane", address_kind: "training" },
    sources: [
      {
        title: "Athletics Ireland membership and training location",
        url: "https://membership.athleticsireland.ie/clubpage/Borrisokane_A.C.",
      },
      {
        title: "Club-authored Run with Dunne account",
        url: "https://eventmaster.ie/fundraising/club/borrisokane-athletic-club",
      },
      {
        title: "Philip Austin's firsthand account, 3 December 2020",
        url: "https://www.gaa.ie/football/news/philip-austin-is-the-pride-of-borrisokane",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-bray-runners-a-c": {
    summary:
      "Bray Runners AC is a County Wicklow athletics club founded in 1983, with adult running, a juvenile section and training across several local parks and tracks.",
    biography: [
      "Bray Runners Athletic Club started in 1983, initially centred on marathon running in Bray, County Wicklow, Ireland. It later developed a juvenile section and a broader athletics programme. Today the club welcomes serious runners, joggers and people returning to fitness. Its adult activities include training at Shanganagh Park and seasonal track sessions, while members also support local parkrun through a regular pacing group.",
      "Juvenile training uses Kilbogget Park and Shoreline track in Greystones, with sessions allocated by age and ability. Some older groups also have trail outings, subject to the club's participation requirements. Parents are asked to use the weekly attendance system and check messages because sessions can change with coach availability. The shared club email is a useful first contact for adult or juvenile enquiries. Bray Head Terrace is the published contact address, not a substitute for checking the actual training venue.",
    ],
    founded_year: 1983,
    corrections: {
      website: "https://brayrunners.com/",
      city: "Bray",
      address: "",
      postcode: "",
      location_precision: "area-only",
      contacts: [
        {
          role: "Club enquiries",
          email: "brayrunnershs@gmail.com",
          source_url: "https://brayrunners.com/training-times",
          checked_at: "2026-10-14",
        },
      ],
    },
    location_note:
      "Adult and juvenile groups use Shanganagh Park, Kilbogget Park and the Greystones track. The directory's combined venue/Eircode is not assigned to one map pin. Bray Head Terrace is the website contact address.",
    contact_note:
      "Use the shared club email. The directory's 0871234567 number and the website's mismatched email link are not treated as verified contact details.",
    sources: [
      {
        title: "Club origins and membership scope",
        url: "https://brayrunners.com/about-bray-runners",
      },
      {
        title: "Adult and juvenile training and shared email",
        url: "https://brayrunners.com/training-times",
      },
      { title: "Published contact address", url: "https://brayrunners.com/contact-us" },
      {
        title: "Governing-body listing",
        url: "https://membership.athleticsireland.ie/clubpage/Bray_Runners_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-bree-a-c": {
    summary:
      "Bree Athletic Club in County Wexford, Ireland, offers track and field and cross-country from childhood onwards, with roots dating to 1970.",
    biography: [
      "Bree Athletic Club was founded in 1970 in County Wexford, Ireland. It began as a senior club but soon developed a strong juvenile focus. Its athletics programme covers sprints, hurdles, middle- and long-distance running, jumps, throws and race walking, as well as cross-country. The current Athletics Ireland listing welcomes athletes from age five onwards and identifies Ballyhogue GAA Grounds in Bree as a training base.",
      "The club uses several local facilities, including Bree Community Centre, the Enniscorthy Hub and DMP grounds, with other sessions taking place on Bree Hill or at Curracloe Beach. Training therefore needs to be checked by group rather than tied to one address. New members should contact the shared club email before attending; the club says athletes must be registered before training or competing. Its website preserves photographs and accounts from earlier decades alongside practical membership information.",
    ],
    founded_year: 1970,
    corrections: { city: "Bree", website: "https://breeathletic.weebly.com/", address_kind: "training" },
    location_note:
      "Ballyhogue GAA Grounds is a listed training base. The club uses several other facilities and outdoor locations; confirm the venue for the relevant group.",
    sources: [
      {
        title: "Club history, disciplines and registration requirement",
        url: "https://breeathletic.weebly.com/",
      },
      {
        title: "Current governing-body listing, venues and contacts",
        url: "https://membership.athleticsireland.ie/clubpage/Bree_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-bridevale-a-c": {
    summary:
      "Bridevale AC is a community running club in Rathcormac, County Cork, Ireland, with senior membership and a published base at Rathcormac Community Centre.",
    biography: [
      "Bridevale Athletic Club is a community-oriented running club in Rathcormac, County Cork, Ireland. Its Athletics Ireland listing describes a club for newcomers as well as established runners and identifies Rathcormac Community Centre as its training location. The membership category is senior-only; this should not be mistaken for an advertised juvenile coaching programme.",
      "The club directs people interested in joining or training to its Facebook and Instagram pages, and publishes a shared enquiry email. These are the places to check current session times, meeting arrangements and suitability before a first visit. Membership and renewal are also available through the Athletics Ireland club page. The community-centre listing provides a useful starting location, but it does not establish that every run starts there or that a particular weekly timetable remains in force.",
    ],
    corrections: { city: "Rathcormac", adult_only: true, address_kind: "training" },
    sources: [
      {
        title: "Club-authored governing-body listing and enquiry routes",
        url: "https://membership.athleticsireland.ie/clubpage/Bridevale_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
  },
};
