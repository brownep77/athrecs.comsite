import type { ClubProfile } from "./club-profiles";

// Official club and governing-body pages read on 14 October 2026.
// Editorial associations do not establish athlete identities or import results.
export const yorkshireAndNorthernCommunityProfiles: Record<string, ClubProfile> = {
  "city-of-york-ac": {
    summary:
      "City of York AC offers track and field, road, cross-country, trail and fell running in York, with junior, masters and disability athletics groups.",
    biography: [
      "City of York Athletics Club brings a wide range of athletics together at the University of York in York, England. Its volunteer-led programme covers sprints, jumps, throws and distance running, alongside road, cross-country, trail and fell running. Training starts from School Year 6, with opportunities for senior and masters athletes and an established disability athletics group. The club is a registered charity and relies on members who help with coaching, officiating, events and administration.",
      "New athletes should contact the membership secretary before visiting so the club can identify a suitable group. Two taster sessions are offered when capacity allows, but younger athletes may need to join a waiting list. Parents or guardians should make enquiries for under-eighteens. Training times vary by event, age group and season, so the university sports-centre address is a starting point for enquiries rather than a promise that every squad meets together.",
    ],
    sources: [
      {
        title: "Club programme and taster arrangements",
        url: "https://www.cityofyorkac.com/about-us",
      },
      {
        title: "Membership and waiting lists",
        url: "https://www.cityofyorkac.com/memberships",
      },
      {
        title: "Sports-centre address and role contacts",
        url: "https://www.cityofyorkac.com/contact-us",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      address: "University of York Sports Centre, York, YO10 5NA",
      postcode: "YO10 5NA",
      address_kind: "training",
    },
  },
  "craven-energy-triathlon-and-multisport-club": {
    summary:
      "Craven Energy is a Skipton triathlon and multisport club offering coached swimming, cycling and running for adults and juniors in North Yorkshire.",
    biography: [
      "Craven Energy Triathlon and Multisport Club is based in Skipton, North Yorkshire, England. Beginners preparing for a first swim-bike-run event train alongside experienced age-group competitors and people who simply enjoy exercising with others. The club supports the Brownlee Foundation's Skipton Triathlon, runs its own championships and takes part in winter cross-country. Its website records a Yorkshire Triathlon Club of the Year award in 2020 and third place in the national competition.",
      "Prospective members can arrange a taster in each of the three disciplines before joining. Junior swimming requires at least 100 metres of continuous front crawl and thirty seconds of treading water; children not yet ready for the pool can ask about introductory bike and run sessions. Coaches and the membership secretary share public enquiry addresses. Training is booked through the club's website, while its members' group helps organise additional social rides, runs and swimming outings.",
    ],
    sources: [
      {
        title: "Club activities, award and tasters",
        url: "https://clubs.britishtriathlon.org/CravenEnergyTriathlonclub",
      },
      {
        title: "Joining and junior swimming requirements",
        url: "https://clubspark.net/CravenEnergyTriathlonclub/Membership",
      },
      {
        title: "Published Skipton base",
        url: "https://clubspark.net/CravenEnergyTriathlonclub/Contact",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      city: "Skipton",
      county: "North Yorkshire",
      address: "Active North Yorkshire Skipton, 21 Gargrave Road, Skipton, BD23 1UD",
      postcode: "BD23 1UD",
      address_kind: "directory",
      website: "https://clubspark.net/CravenEnergyTriathlonclub",
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    location_note:
      "The club publishes Active North Yorkshire Skipton as its base. Check each training booking for its venue; this is not a single meeting point for every discipline.",
  },
  "sheffield-triathlon-club": {
    summary:
      "Sheffield Triathlon Club, founded in 1986, offers coached swimming, cycling and running across Sheffield, with seasonal sessions and club-organised events.",
    biography: [
      "Sheffield Triathlon Club was formed in 1986 by early participants in the sport in Sheffield, South Yorkshire, England. It combines coached training with social rides, running sessions and events, including the Hathersage Hilly, aquathlons and duathlons. Its membership includes first-time triathletes and experienced age-group competitors, with volunteers running the club and its coaching programme.",
      "Training uses several venues: Heeley Baths and Graves for pool swimming, Rother Valley for seasonal open-water sessions, and parks and roads around Sheffield for running and cycling. Check the calendar for winter venue changes and booking requirements. Non-members may try a session or two before joining. The dedicated junior section is currently inactive because its coordinator role is vacant; families should contact the club about any suitable supervised alternatives rather than assuming regular junior sessions are available.",
    ],
    sources: [
      {
        title: "Origins and club organisation",
        url: "https://www.sheffieldtriclub.com/about",
      },
      {
        title: "Seasonal training and enquiries",
        url: "https://www.sheffieldtriclub.com/training",
      },
      {
        title: "Current junior-programme restriction",
        url: "https://www.sheffieldtriclub.com/juniors",
      },
      {
        title: "Club events",
        url: "https://www.sheffieldtriclub.com/",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 1986,
    corrections: {
      address: "",
      postcode: "",
      location_precision: "area-only",
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    location_note:
      "Sessions use Heeley Baths, Graves Leisure Centre, Rother Valley and separate running/cycling meeting points. Confirm the booked session's venue; the older Psalter Lane directory address is not presented as a training base.",
  },
  "south-leeds-lakers-running-club": {
    summary:
      "South Leeds Lakers is a community running club in Leeds with free social runs, junior athletics, coached sessions and the Bah Humbug 10K.",
    biography: [
      "South Leeds Lakers grew out of the community around Cross Flatts parkrun in Leeds, West Yorkshire, England. With support from Run Leeds and the Hunslet Rugby Foundation, nineteen runners attended its first social run on 10 February 2015. England Athletics affiliation followed a year later, and the club received the Yorkshire and Humberside Club of the Year award in 2017. Keeping ordinary club participation free remained central to its approach, with individual England Athletics registration optional.",
      "Tuesday club nights meet at Hunslet Nelson Cricket Club, while daytime runs and track coaching offer other ways to take part. A junior section started in 2019 and provides run, jump and throw sessions for eight- to fourteen-year-olds at the John Charles Centre for Sport. Junior places must be booked, and an accompanying adult must remain onsite. The Lakers also organise the Bah Humbug 10K and take part in veterans' and winter leagues.",
    ],
    sources: [
      {
        title: "Club origins and community model",
        url: "https://www.southleedslakers.co.uk/history",
      },
      {
        title: "Club-night venue",
        url: "https://www.southleedslakers.co.uk/",
      },
      {
        title: "Junior athletics and booking conditions",
        url: "https://www.southleedslakers.co.uk/juniors",
      },
      {
        title: "General enquiries",
        url: "https://www.southleedslakers.co.uk/contact-us",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 2015,
    corrections: {
      address_kind: "training",
    },
    location_note:
      "Adult club night meets at Hunslet Nelson Cricket Club. Junior track sessions use John Charles Centre for Sport, Middleton Grove, Leeds LS11 5DJ, with advance booking.",
  },
  "wakefield-district-h-and-ac": {
    summary:
      "Wakefield District Harriers & AC is a Thornes Park-based athletics club founded in 1895, offering track and field, road running and cross-country.",
    biography: [
      "Wakefield District Harriers and Athletics Club dates its establishment to 1895, when athletics and cycling separated from the town's rugby organisation. Today its base is Thornes Park Stadium in Wakefield, West Yorkshire, England. Track and field groups range from Junior Jets to senior and masters athletes, with road running and cross-country alongside the stadium programme. Its history includes international sprinters, high jumpers and distance runners, reflecting that breadth of activity.",
      "Children can join from eight, and under-eighteens train with qualified club coaches. Newcomers may attend training for up to four weeks before committing to membership, paying the relevant session charge. Application forms are available online or from the clubhouse, and the membership secretary handles enquiries. Thornes Park is a shared council facility: the stadium's telephone number is not a direct club-membership line.",
    ],
    sources: [
      {
        title: "Club origins and notable alumni",
        url: "https://wakefieldharriers.co.uk/history/",
      },
      {
        title: "Membership, trial and age requirements",
        url: "https://wakefieldharriers.co.uk/club-membership/",
      },
      {
        title: "Current stadium address and programme",
        url: "https://wakefieldharriers.co.uk/",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 1895,
    corrections: {
      website: "https://wakefieldharriers.co.uk/",
      address: "Thornes Park Stadium, Horbury Road, Wakefield, WF2 8TY",
      postcode: "WF2 8TY",
      address_kind: "training",
      sports: ["Running", "Athletics"],
    },
    notable_members: [
      {
        name: "Martyn Bernard",
        connection: "Historical club athlete",
        detail:
          "High jumper listed among the club's notable alumni; Commonwealth silver medallist and a Beijing 2008 Olympic finalist.",
      },
      {
        name: "Emily Freeman",
        connection: "Historical club athlete",
        detail:
          "Sprinter included in the club's alumni history, with appearances at the Olympic Games and World Championships.",
      },
      {
        name: "Alan Bell",
        connection: "Historical club athlete",
        detail:
          "The club's history records his selection for the 400m at the Moscow 1980 Olympics.",
      },
      {
        name: "John Newsome",
        connection: "Historical athlete and club president",
        detail:
          "Marathon runner and long-serving club volunteer who remained club president until his death in 2016.",
      },
    ],
  },
  "york-acorn-running-club": {
    summary:
      "York Acorn Running Club has offered road, trail and fell running in Acomb, York, since 1982, with Tuesday training and opportunities to try the club.",
    biography: [
      "York Acorn Running Club was formed in 1982 and meets in Acomb, York, England. Its members run on roads, trails and fells, bringing together competitive racers and people who prefer a social outing. The club uses York Acorn Rugby Club on Thanet Road as its Tuesday-evening meeting point. Training offers a choice of interval or speed work and steady runs of different lengths and paces.",
      "Prospective members can try a couple of sessions before joining and contact the club through its shared email. Members use a closed Facebook group and WhatsApp for weekly arrangements, so checking ahead is useful before a first visit. England Athletics registration is included in the club's published membership offer, with opportunities to take part in the York and District Road Race League. Meals and other social gatherings are part of club life alongside training.",
    ],
    sources: [
      {
        title: "Origins, venue, sessions and enquiries",
        url: "https://yorkacornrunningclub.org.uk/",
      },
      {
        title: "Joining and trial sessions",
        url: "https://yorkacornrunningclub.org.uk/?page_id=206",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 1982,
    corrections: {
      address: "York Acorn Rugby Club, Thanet Road, York, YO24 2NW",
      postcode: "YO24 2NW",
      address_kind: "training",
    },
  },
  "york-knavesmire-harriers": {
    summary:
      "York Knavesmire Harriers offers road, trail, fell and cross-country running in York, with social runs, track sessions and the Brass Monkey Half Marathon.",
    biography: [
      "York Knavesmire Harriers is a running club in York, England, with activities across road, trail, fell and cross-country. Its weekly programme combines social runs with track and threshold training, giving members different ways to build fitness and prepare for races. The club is also associated with the Brass Monkey Half Marathon, which has its own enquiry address separate from membership.",
      "Meeting points depend on the session. Monday social runs use the entrance to York College, Thursday social runs meet by the Knavesmire gates at the junction of Knavesmire Road, Racecourse Road and Campleshon Road, and track training uses the university running track. These are distinct from the older William Court directory address. New runners should use the membership email or contact form and check the current calendar before attending; club-run schedules and race information are published on the website.",
    ],
    sources: [
      {
        title: "Running disciplines",
        url: "https://www.yorkknavesmireharriers.co.uk/about-us/",
      },
      {
        title: "Current calendar and meeting points",
        url: "http://www.yorkknavesmireharriers.co.uk/",
      },
      {
        title: "Membership",
        url: "https://www.yorkknavesmireharriers.co.uk/membership/",
      },
      {
        title: "Club and race contacts",
        url: "https://www.yorkknavesmireharriers.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      address: "",
      postcode: "",
      location_precision: "area-only",
      website: "https://www.yorkknavesmireharriers.co.uk/",
    },
    location_note:
      "York College, the Knavesmire gates and the university track are separate session venues. Confirm the current calendar rather than travelling to the old William Court directory address.",
  },
  "york-postal-harriers": {
    summary:
      "York Postal Harriers welcomes runners from all backgrounds in York, with structured Wednesday coaching, road and cross-country racing and a club hall of fame.",
    biography: [
      "York Postal Harriers began as a club for postal workers in York, England, but now welcomes runners from all backgrounds. Its approach combines structured coaching with a strong social side, supporting people working towards a first parkrun as well as runners tackling longer events. Wednesday evening training is central to the programme, with current arrangements shared through the club's Facebook group.",
      "Members take part in the York and District Road Race League and PECO cross-country, and the club's hall of fame recognises contributions nominated by fellow runners. Joining information and application forms are available on the website, which also provides a general contact form. Prospective members should confirm where the next session meets: the New Earswick address retained in older directory information is not established as the training venue.",
    ],
    sources: [
      {
        title: "Postal-worker origins, coaching and contact form",
        url: "https://www.yorkpostalharriers.com/",
      },
      {
        title: "Membership and league participation",
        url: "https://www.yorkpostalharriers.com/faq",
      },
      {
        title: "Member-nominated hall of fame",
        url: "https://www.yorkpostalharriers.com/yph-hall-of-fame",
      },
    ],
    reviewed_at: "2026-10-14",
    location_note:
      "Training arrangements are shared through the club's Facebook group. The retained directory address is not a confirmed session meeting point.",
    notable_members: [
      {
        name: "Ian Ellwood",
        connection: "Club hall of fame",
        detail:
          "Recognised as the first York Postal Harrier to win a York and District Road Race League race, at Bishop Wilton in June 2018.",
      },
      {
        name: "Bill Shively",
        connection: "Club hall of fame",
        detail:
          "Nominated by fellow members for his contribution to the club and his running achievements.",
      },
    ],
  },
  "york-triathlon-club": {
    summary:
      "York Triathlon Club offers adult swimming, cycling and running in York, with coached sessions, social rides, time trials and road and cross-country leagues.",
    biography: [
      "York Triathlon Club brings swimming, cycling and running together in York, England. It welcomes adults preparing for a first triathlon as well as experienced age-group competitors, and people interested in just one discipline can join too. Pool sessions focus on technique and endurance, with seasonal open-water practice, group rides, winter spin classes and coached or social running on roads, tracks and trails.",
      "The club connects members with PECO cross-country, the York and District Road Race League and cycling time trials, including a club championship within Clifton Cycling Club's series. New members must be eighteen or over. Trial sessions are booked through the club's membership portal rather than by simply arriving; pool participants need to swim at least 200 metres of front crawl unaided. Energise is one swimming venue, while other sessions use separate locations shown in the calendar.",
    ],
    sources: [
      {
        title: "Programme, affiliations and time trials",
        url: "https://www.yorktriclub.co.uk/public/about.php",
      },
      {
        title: "Adult membership and swimming requirements",
        url: "https://www.yorktriclub.co.uk/public/home.php?page=faq",
      },
      {
        title: "Current venues and contacts",
        url: "https://www.yorktriclub.co.uk",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
      address_kind: "training",
    },
    location_note:
      "Energise is a pool-training venue. Spin, cycling and running sessions have their own meeting points; consult the event booking.",
  },
  "yorkshire-wolds-runners": {
    summary:
      "Yorkshire Wolds Runners is an adult running club in Driffield, East Yorkshire, offering coached group sessions, walk-run options and a trial month.",
    biography: [
      "Yorkshire Wolds Runners took shape after local runners met in 2009 and formally established the club in 2010. Based in Driffield in the East Riding of Yorkshire, England, it welcomes adults with very different starting points: some begin with short walk-run outings, while others train for races and longer distances. Qualified coaches lead sessions, and the club includes guide runners who support visually impaired participants.",
      "Driffield Leisure Centre is the usual Tuesday and Thursday meeting point, although club notices may direct runners elsewhere for a particular evening. Prospective members are offered a no-obligation trial month and can use the website's enquiry form before coming along. The club's published approach is to keep groups together rather than leave runners behind, with social runs and the Top of the Wolds 10K also part of its activities.",
    ],
    sources: [
      {
        title: "2009 beginnings, 2010 formation and adult programme",
        url: "https://www.yorkshirewoldsrunners.co.uk/about-yorkshire-wolds-runners/",
      },
      {
        title: "Meeting point and trial month",
        url: "https://www.yorkshirewoldsrunners.co.uk",
      },
      {
        title: "Public contact form",
        url: "https://www.yorkshirewoldsrunners.co.uk/contact-yorkshire-wolds-runners/",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 2010,
    corrections: {
      city: "Driffield",
      address_kind: "training",
    },
  },
  "north-york-moors-ac": {
    summary:
      "North York Moors AC offers road, fell, track and cross-country running around Middlesbrough and the North York Moors, with coached sessions and club events.",
    biography: [
      "North York Moors Athletic Club brings together runners from Middlesbrough and the North York Moors area of England. Its programme spans road running, fell outings, track work and cross-country, with club championships, social events and organised races. Middlesbrough Sports Village and Nunthorpe Sports and Recreation Club are regular training locations, while fell runs explore different routes.",
      "A September 2026 notice introduced a trial timetable change from the week beginning 12 October: track sessions moved to Thursdays, with Nunthorpe and alternating-venue sessions moving to Tuesdays. This supersedes the older day pattern still shown in the homepage introduction. New runners should contact the committee and check Spond or the club's current updates before attending. The club offers taster participation, although its pages differ on the allowance. Its published postal contact is a correspondence address, not a training venue.",
    ],
    sources: [
      {
        title: "Training locations, programme and enquiries",
        url: "https://www.nym.ac/",
      },
      {
        title: "October 2026 trial timetable change",
        url: "https://www.nym.ac/session-day-changes/",
      },
      {
        title: "Postal contact and event organisation",
        url: "https://www.nym.ac/key-contacts/",
      },
      {
        title: "Club introduction and trial participation",
        url: "https://www.nym.ac/about/",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      website: "https://www.nym.ac/",
      address: "North York Moors AC, c/o 4 Glenn Crescent, Marton, Middlesbrough, TS7 8ED",
      postcode: "TS7 8ED",
      address_kind: "correspondence",
    },
    location_note:
      "The Glenn Crescent address is for correspondence only. Training uses Middlesbrough Sports Village, Nunthorpe Sports and Recreation Club and other advertised venues.",
  },
  "down-triathlon-club": {
    summary:
      "Down Triathlon Club serves Downpatrick and County Down with swimming, cycling and running, including a junior section and coached community training.",
    biography: [
      "Down Triathlon Club was established in 2019 in County Down, Northern Ireland. It serves Downpatrick and the surrounding area, with pool swimming, road cycling through County Down and running at Downshire and Dunleath playing fields. The club's website records its Triathlon Ireland Club of the Year award in 2023. Newcomers train alongside experienced triathletes, with the programme supported by volunteer officers and coaches.",
      "The Down Tigers junior section began in 2022, adding coached swimming, cycling, running and transition practice. Junior sessions use several locations, often the grounds of Downshire Estate, and have separate booking and safeguarding arrangements. The club's general and junior pages give different age ranges, so families should confirm eligibility directly before registering. Adult and junior sign-up links, the current programme and the club's public enquiry routes are available through its website.",
    ],
    sources: [
      {
        title: "Origins and junior-section launch",
        url: "https://www.downtriathlonclub.com/about",
      },
      {
        title: "Training venues and club award",
        url: "https://www.downtriathlonclub.com/",
      },
      {
        title: "Junior programme and safeguarding",
        url: "https://www.downtriathlonclub.com/juniors",
      },
      {
        title: "Downpatrick directory entry",
        url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 2019,
    corrections: {
      city: "Downpatrick",
    },
    location_note:
      "Pool, bike and running sessions use different venues. Downshire Estate and Dunleath Playing Fields are not a single club headquarters.",
  },
  "invictus-tri-squad-belfast": {
    summary:
      "Invictus Triathlon Squad is a Belfast club founded in 2011, with coached swimming, group cycling and members ranging from beginners to age-group competitors.",
    biography: [
      "Invictus Triathlon Squad began in 2011 when a group of triathletes formed a club in Belfast, Northern Ireland. It describes itself as a small squad with a competitive side, while also welcoming beginners and members who train without entering races. Its published programme centres on coached pool swimming and group cycling, with membership options for different levels of swim participation.",
      "Swimming uses the BRA pool and Andersonstown Leisure Centre, while group rides start from locations including King's Square, Queen's Sport at Upper Malone and Loughshore car park. These are session venues, not one fixed clubhouse. Prospective members can ask to try two training sessions before deciding whether to join. Contact the membership address or official Facebook page to confirm availability and the current meeting point; the website does not publish a regular group-running timetable.",
    ],
    sources: [
      {
        title: "Club history, training and trial arrangements",
        url: "http://www.invictustriathlon.com/",
      },
      {
        title: "Public membership contact and Belfast location",
        url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 2011,
    corrections: {
      city: "Belfast",
      website: "https://www.invictustriathlon.com/",
    },
    location_note:
      "Pool sessions and group rides use several Belfast-area venues. Confirm the current session location before travelling.",
  },
  "athletics-ireland-aughagower-a-c": {
    summary:
      "Aughagower AC is a County Mayo athletics club founded in 2012, teaching running, jumping and throwing to young athletes from its village community-centre base.",
    biography: [
      "Aughagower Athletics Club was founded in 2012 by Ernie Deacy, Breifne Gannon, Mel King and Lorna Harper. Based at the community centre in Aughagower, County Mayo, Ireland, it provides athletics for children and young people aged seven to eighteen. Its September-to-June programme introduces younger athletes to running, jumping and throwing, then helps older athletes develop those skills.",
      "Community fundraising is an important part of the club's activity, including family events and a can-and-bottle collection campaign. A planned six-lane, 200-metre track and walking trail across from the community centre received planning approval in July 2024; the club's development page still describes fundraising, so the project is not presented here as an open facility. Families can use the club's shared email or Athletics Ireland membership page to ask about joining and the current training arrangements.",
    ],
    sources: [
      {
        title: "Founders, programme and enquiries",
        url: "https://www.aughagowerathleticsclub.com/",
      },
      {
        title: "Community-centre base and age range",
        url: "https://www.aughagowerathleticsclub.com/our-club",
      },
      {
        title: "Planned track and walking trail",
        url: "https://www.aughagowerathleticsclub.com/track-development",
      },
      {
        title: "Governing-body contact and location",
        url: "https://membership.athleticsireland.ie/clubpage/Aughagower_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 2012,
    corrections: {
      city: "Aughagower",
      website: "https://www.aughagowerathleticsclub.com/",
      address: "Aughagower Community Centre, Aughagower, County Mayo",
      postcode: "",
      address_kind: "training",
    },
    location_note:
      "The community centre is the established club base. The proposed track and walking trail across from it are not confirmed as completed; no precise venue Eircode has been assigned.",
  },
  "athletics-ireland-aughrim-a-c": {
    summary:
      "Aughrim Athletics Club offers junior and senior athletics in County Wicklow, with seasonal track and field, cross-country and volunteer-led coaching.",
    biography: [
      "Aughrim Athletics Club serves Aughrim and the surrounding County Wicklow area in Ireland. Its junior programme develops running, jumping, throwing, coordination and teamwork, with track and field in spring and summer and cross-country in autumn and winter. The published introductory programme is for six- to fourteen-year-olds, while the wider club also welcomes senior athletes.",
      "Many coaches became involved through their children's participation, and the club has close links with Community Games through longstanding volunteer Fiona Shannon. Its coaching biographies also describe an adult Couch to 5K initiative started by Laura Brennan. Registration for the 2026–27 season is described as limited, so prospective members should use the current joining link or enquire before attending. Athletics Ireland lists Killacloran as the training location; confirm the exact meeting point and group arrangements with the club.",
    ],
    sources: [
      {
        title: "Club introduction and limited registration",
        url: "https://www.aughrimathletics.com/",
      },
      {
        title: "Seasonal junior programme",
        url: "https://www.aughrimathletics.com/junior-athletes",
      },
      {
        title: "Coaches and Community Games involvement",
        url: "https://www.aughrimathletics.com/coaches",
      },
      {
        title: "Training location and public enquiries",
        url: "https://membership.athleticsireland.ie/clubpage/Aughrim_A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      city: "Aughrim",
      website: "https://www.aughrimathletics.com/",
    },
    notable_members: [
      {
        name: "Fiona Shannon",
        connection: "Club volunteer and Community Games leader",
        detail:
          "The club's team biography traces her involvement to Community Games training in 2007 and records her appointment to its national board in 2018.",
      },
    ],
  },
  "athletics-ireland-b-m-o-h-a-c": {
    summary:
      "BMOH Athletics is a Sixmilebridge and Kilmurry club in County Clare, founded in 2012, with membership and club updates available through ClubZap.",
    biography: [
      "BMOH Athletics serves Sixmilebridge and Kilmurry in County Clare, Ireland. Its official website dates the club's foundation to 2012, while Athletics Ireland lists it as a mixed-age club in south-east Clare. The club announced a return to activity in July 2026 after a short break, inviting local runners to renew their involvement.",
      "ClubZap is the club's stated channel for membership and forthcoming activities, with a public PRO email alongside the contact details retained in the governing-body directory. New members should check those current updates for the programme and meeting arrangements. The published Sixmilebridge directory location is retained, but the available club pages do not establish a detailed weekly timetable or a fuller account of its early history; these are not inferred from the 2026 restart announcement.",
    ],
    sources: [
      {
        title: "Foundation year and official club website",
        url: "https://bmohac.com/",
      },
      {
        title: "July 2026 return to activity",
        url: "https://bmohac.com/articles/192637",
      },
      {
        title: "Mixed-age directory and contacts",
        url: "https://membership.athleticsireland.ie/clubpage/B.M.O.H._A.C.",
      },
    ],
    reviewed_at: "2026-10-14",
    founded_year: 2012,
    corrections: {
      city: "Sixmilebridge",
      website: "https://bmohac.com/",
    },
  },
  "omagh-tc": {
    summary:
      "Omagh Triathlon Club is an adult club in West Tyrone, with swim, bike and run training around Omagh and Loughmacrory and the Tri-The-Lough event.",
    biography: [
      "Omagh Triathlon Club is an adult, cross-community club serving Omagh and West Tyrone in Northern Ireland. Training centres on the town and nearby Loughmacrory, where the freshwater lough provides a setting for open-water practice and the club's Tri-The-Lough sprint and introductory triathlon events. Members range from newcomers to experienced competitors, with coached swimming a substantial part of the programme.",
      "The club also arranges group cycling, seasonal time trials and occasional practice sessions around the Tri-The-Lough course. Its social and training activities have included overseas trips and off-road duathlons. Membership is handled through Triathlon Ireland, while the club's contact form is the route for questions about joining, sessions or its race. Detailed training arrangements are shared with members through WhatsApp; confirm the current programme rather than relying on an older published timetable.",
    ],
    sources: [
      {
        title: "Club programme, venues and community activities",
        url: "http://www.omaghtriathlonclub.com/",
      },
      {
        title: "Joining and training enquiries",
        url: "https://www.omaghtriathlonclub.com/contact.html",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      city: "Omagh",
      adult_only: true,
      website: "https://www.omaghtriathlonclub.com/",
    },
    location_note:
      "Training is arranged around Omagh and Loughmacrory. The race venue is not treated as a permanent clubhouse; check each session's meeting point.",
  },
  "olympian-triathlon-club": {
    summary:
      "Olympian Triathlon Club has offered swimming, cycling and running in Belfast since 1984, with coached sessions at Olympia Leisure Centre and Mary Peters' Track.",
    biography: [
      "Olympian Triathlon Club was formed in 1984 in Belfast, Northern Ireland, during the sport's early years in Ireland. Its programme brings together new triathletes, experienced competitors and members who train for enjoyment without racing. Coached pool swimming and indoor cycling use Olympia Leisure Centre, while running sessions take place at Mary Peters' Track. A spring and summer cycling time-trial league adds another way to take part.",
      "The club offers up to three taster sessions by arrangement through its contact form. Membership options distinguish swimmers, non-swimmers and students, and members are required to hold a valid Triathlon Ireland licence. Its history remembers early member Kevin Morgan for his racing, coaching and work introducing schoolchildren to triathlon. Use the current olympiantriathlon.com website for enquiries: the former olympiantriclub.co.uk address no longer displays club information.",
    ],
    founded_year: 1984,
    notable_members: [
      {
        name: "Kevin Morgan",
        connection: "Historical member and triathlon pioneer",
        detail:
          "The club's profile records his 1990 Irish triathlon title and his work organising schools triathlon and coaching athletes.",
      },
    ],
    sources: [
      {
        title: "Club origins, training, membership and contact form",
        url: "https://olympiantriathlon.com/",
      },
      {
        title: "Kevin Morgan's club history",
        url: "https://olympiantriathlon.com/profiles/kevin-morgan",
      },
    ],
    reviewed_at: "2026-10-14",
    corrections: {
      city: "Belfast",
      website: "https://olympiantriathlon.com/",
      contact_url: "https://olympiantriathlon.com/#contact",
    },
    location_note:
      "Olympia Leisure Centre and Mary Peters' Track are separate training venues. Confirm the appropriate session and booking before visiting.",
  },
};
