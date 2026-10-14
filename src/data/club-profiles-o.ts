import type { ClubProfile } from "./club-profiles";

// Primary club and governing-body sources read on 14 October 2026.
export const borderAndCommunityClubProfiles: Record<string, ClubProfile> = {
  "ambleside-ac": {
    summary:
      "Ambleside AC is a Lake District fell-running club founded in 1983, with senior and junior groups, mountain races and a long record of championship success.",
    biography: [
      "Ambleside AC grew from a small group of local runners in 1983 into a fell-running club with a substantial place in Lake District racing. Based in Ambleside, Cumbria, England, it organises races including Fairfield, Langdale Horseshoe and Wansfell. Helping at these events is part of club life, alongside racing, training and trips away together.",
      "The club's honours span generations: Keith Anderson appears as the 1991 British fell champion, Sarah McCormack as the 2019 mountain-running World Cup champion, and Scout Adkin as the 2024 and 2025 women's World Cup series winner. These are dated club honours, rather than a statement about current membership. The junior section began in 2011 and won the English team championship in 2019.",
      "Winter Tuesday sessions use the Parish Centre in Ambleside; summer runs start from changing locations across the Lakes. Runners need suitable hill kit and the ability to look after themselves on rough ground. Senior joining is handled through SI Entries. Juniors have a minimum age of eight and a waiting-list process; the published intake notice reports coaching-capacity restrictions, so families should enquire before attending.",
    ],
    founded_year: 1983,
    location_note:
      "Ambleside Parish Centre is the winter Tuesday meeting point. Summer fell runs and other sessions use different venues; check the club calendar.",
    notable_members: [
      {
        name: "Keith Anderson",
        connection: "Historical club honours",
        detail: "Listed in Ambleside's roll of honour as the 1991 men's British fell champion.",
      },
      {
        name: "Sarah McCormack",
        connection: "Club roll of honour",
        detail: "The club records her 2019 mountain-running World Cup championship.",
      },
      {
        name: "Scout Adkin",
        connection: "Club roll of honour",
        detail:
          "Listed as the women's World Mountain Running Association World Cup series champion in 2024 and 2025.",
      },
    ],
    corrections: {
      address_kind: "training",
    },
    sources: [
      {
        title: "Club history",
        url: "https://www.amblesideac.org.uk/about/",
      },
      {
        title: "Roll of honour",
        url: "https://www.amblesideac.org.uk/about/roll-of-honour/",
      },
      {
        title: "Seasonal Tuesday training",
        url: "https://www.amblesideac.org.uk/training/tuesday-evenings/",
      },
      {
        title: "Senior joining",
        url: "https://www.amblesideac.org.uk/about/joining-ambleside-ac/",
      },
      {
        title: "Junior joining restrictions",
        url: "https://www.amblesideac.org.uk/juniors/join-aac-juniors/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "astley-and-tyldesley-road-runners": {
    summary:
      "Astley & Tyldesley Road Runners offers road, cross-country, trail and fell running, with sessions at Gin Pit and Leigh Sports Village in Greater Manchester.",
    biography: [
      "Astley & Tyldesley Road Runners brings runners together around Astley, Tyldesley and Leigh in Greater Manchester, England. The club trains from places including Gin Pit Miners Welfare Club and Leigh Sports Village, combining local social runs with structured work for people preparing for races or improving their fitness.",
      "Its programme extends beyond road running to cross-country, trails, fell races and track sessions. Members can take part in local and regional competition, while the Gin Pit 5 is one of the club's own events. The weekly training menu includes Monday track work and separate Tuesday and Wednesday sessions, with details published for each evening.",
      "Beginners, returning runners and experienced competitors are welcome, and prospective members can try sessions before joining. The contact form and club enquiry email are the best starting points for choosing an appropriate group. Gin Pit is a published club base, but it is worth checking the individual session page because training also takes place elsewhere.",
    ],
    location_note:
      "Gin Pit Miners Welfare Club is a published training base. Leigh Sports Village and other local meeting points are used for separate sessions.",
    corrections: {
      city: "Tyldesley",
      address: "The Miners Welfare Club, Gin Pit Village, Ley Road, Tyldesley, Manchester, M29 7DW",
      postcode: "M29 7DW",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club programme and base",
        url: "http://www.astleyrunners.co.uk/",
      },
      {
        title: "About the club",
        url: "https://astleyrunners.co.uk/about-us/",
      },
      {
        title: "Training",
        url: "https://astleyrunners.co.uk/training/",
      },
      {
        title: "Contact",
        url: "https://astleyrunners.co.uk/contact/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "billinge-running-club": {
    summary:
      "Billinge Running Club brings trail runners together around Billinge and Wigan, with Wednesday social runs, Monday coaching and community trail events.",
    biography: [
      "Billinge Running Club is a trail-focused running community in the Billinge and Wigan area of England. Its own account describes an idea started by two local runners who wanted to combine time outdoors with fitness and community projects. Night-time trail running and the social side of meeting afterwards remain a distinctive part of its activities.",
      "The club advertises a free Wednesday social run for different abilities and a Monday coaching session covering speed, conditioning and general fitness. Monday's published meeting point is The Triangle at the top of Moss Road. Routes for the Wednesday outing are announced separately, so the older Delph Tavern directory address should not be assumed to be the start of every run.",
      "Members can choose an England Athletics-affiliated option or social/second-claim membership. The programme also includes Ladies Trails Before Ales, a 5K coaching programme, club championships and events such as the Three Counties Trot. New runners can use the session enquiry form or the public club email to ask which outing suits their experience.",
    ],
    location_note:
      "Monday coaching meets at The Triangle, at the top of Moss Road. Wednesday routes are published separately. No single exact address is used here for all sessions.",
    corrections: {
      address: "",
      postcode: "",
      location_precision: "area-only",
    },
    sources: [
      {
        title: "Trail running and weekly social",
        url: "https://www.billingerunning.club/",
      },
      {
        title: "Origins",
        url: "https://www.billingerunning.club/about",
      },
      {
        title: "Monday coaching",
        url: "https://www.billingerunning.club/mondaytraining",
      },
      {
        title: "Joining options",
        url: "https://www.billingerunning.club/join",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "billingham-marsh-hse-h-and-ac": {
    summary:
      "Billingham Marsh House Harriers AC was founded in 1986 and offers senior running and junior athletics from Norton Sports Charity in Stockton-on-Tees.",
    biography: [
      "Billingham Marsh House Harriers AC was established in 1986 and now trains at Norton Sports Charity in Norton, Stockton-on-Tees, England. The club has senior and junior sections, with opportunities ranging from an introductory 5K run to road marathons and local athletics competition.",
      "Senior Monday sessions are recovery runs divided into groups, while Thursday training includes coached efforts and a gentler running option. Juniors start from age eight and meet on Thursdays. Their seasonal programme uses a grass track on the football pitches in summer and the hockey AstroTurf in winter, with track and field and cross-country opportunities through the NYSD League.",
      "The club offers three trial sessions before joining and asks newcomers to arrive early or contact it in advance for help choosing a coach or group. At the Norton complex, sign-in is inside the football clubhouse; the club's directions distinguish this from the cricket-ground entrance. In-house competitions and social events, including the Christmas presentation, bring the sections together.",
    ],
    founded_year: 1986,
    location_note:
      "Training and junior sign-in use Norton Sports Charity, with the club based inside Norton Football Club's clubhouse. Follow the club's directions within the complex rather than stopping at the cricket-ground entrance.",
    corrections: {
      city: "Stockton-on-Tees",
      address: "Norton Sports Charity, 74 Station Road, Norton, Stockton-on-Tees, TS20 1PE",
      postcode: "TS20 1PE",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club origins",
        url: "https://marsh-house.org/",
      },
      {
        title: "Joining and training",
        url: "https://marsh-house.org/training/",
      },
      {
        title: "Senior programme",
        url: "https://marsh-house.org/senior-club-training/",
      },
      {
        title: "Junior programme",
        url: "https://marsh-house.org/juniors/",
      },
      {
        title: "Directions and contact",
        url: "https://marsh-house.org/contact-us/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "billingham-running-club": {
    summary:
      "Billingham Running Club was formed in 2022 and offers adult group runs and coached efforts in Billingham, with changing Monday meeting points.",
    biography: [
      "Billingham Running Club was formed in 2022 in Billingham, England. It is a separate club from Billingham Marsh House Harriers, with its own coaches, membership and race programme. England Athletics affiliation supports members who want to compete, while recreational runners can join for regular company and training.",
      "Monday runs are organised into groups of similar ability and use a rotation of local meeting places. Thursday sessions focus on work such as repetitions, hills and threshold running, usually meeting outside Billingham Rugby Club on Greenwood Road. Both arrangements can change, and the club publishes the week's location on its social channels.",
      "Prospective members are asked to make contact before trying a session so the coaches know to expect them. Up to three sessions are available before membership is required. The club offers first-claim, second-claim, associate and student options, with a joining page that starts the application process by email. Its website also keeps a club race league and links to the Billy Goat Gallop.",
    ],
    founded_year: 2022,
    location_note:
      "Thursday sessions usually meet outside Billingham Rugby Club on Greenwood Road. Monday meeting points rotate; the club's weekly social update takes priority.",
    corrections: {
      address_kind: "training",
    },
    sources: [
      {
        title: "Club formation",
        url: "https://billinghamrc.org.uk/",
      },
      {
        title: "Changing training venues",
        url: "https://billinghamrc.org.uk/training",
      },
      {
        title: "Trial sessions and membership",
        url: "https://billinghamrc.org.uk/signup",
      },
      {
        title: "Contact form",
        url: "https://billinghamrc.org.uk/contact",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "oswestry-olympians": {
    summary:
      "Oswestry Olympians is a running, athletics and triathlon club in Shropshire, England, serving both sides of the Welsh border since 1980.",
    biography: [
      "Oswestry Olympians was founded in November 1980 by Doug Morris and other local athletes, as Park Hall Stadium returned from military to local use. Volunteers helped restore its athletics track, giving the new club a base for junior and senior sport. The club is based in Oswestry, Shropshire, England, and draws members from both sides of the border with Wales.",
      "Its English and Welsh athletics affiliations reflect that border community. Road, fell, cross-country and track and field developed alongside social running, and a triathlon section was formed in 2003. The club history records Doug Morris's role in establishing races including the Lake Vyrnwy Half Marathon and the contribution of former chairman Mick Ward. Park Hall's original track belongs to that history, rather than being presented as a current training venue.",
      "Junior sessions cover athletics, sportshall and cross-country, with locations managed through SPOND. The current junior page restricts attendance to members and says specific triathlon coaching is not being provided. Senior and junior membership links are available on the club website; the contact form routes enquiries to the appropriate section.",
    ],
    founded_year: 1980,
    location_note:
      "The club is based in Oswestry, Shropshire, England, and serves the Welsh border area. Its Welsh Athletics directory affiliation does not place its home town in Wales. Training uses multiple locations; members receive session details separately.",
    notable_members: [
      {
        name: "Doug Morris",
        connection: "Founding member",
        detail:
          "Helped establish Oswestry Olympians in 1980 and launched local races including the Lake Vyrnwy Half Marathon, according to the club history.",
      },
      {
        name: "Mick Ward",
        connection: "Former chairman",
        detail:
          "Chaired the club during 1990–2000; its history recalls his earlier British amateur cycling championship and later age-group running.",
      },
    ],
    corrections: {
      country: "England",
      address: "",
      postcode: "",
      location_precision: "area-only",
      address_kind: "directory",
    },
    sources: [
      {
        title: "Club home and membership",
        url: "https://www.oswestryolympians.com/",
      },
      {
        title: "History and border affiliations",
        url: "https://oswestryolympians.com/history/",
      },
      {
        title: "Junior programme and restrictions",
        url: "https://oswestryolympians.com/juniors/",
      },
      {
        title: "Section contact form",
        url: "https://oswestryolympians.com/contact/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "sospan-road-runners": {
    summary:
      "Sospan Road Runners is a Llanelli running club founded in April 1984, with beginner sessions and road, trail, fell and cross-country running.",
    biography: [
      "Sospan Road Runners has been part of running in Llanelli, Wales, since April 1984. Its name means saucepan in Welsh and was chosen to reflect the town's saucepan-making heritage. The volunteer-run club combines local training with race trips and social events, welcoming runners and joggers with different goals.",
      "Canolfan Pentre Awel is the published meeting place. Monday runs offer different distances, Wednesday gives beginners and returning runners a dedicated session, and Thursday concentrates on development work such as hills, speed and intervals. Weekend runs vary in route and length. Members are directed to the club's social pages for updates and holiday exceptions.",
      "Although road running is in its name, the Welsh Athletics listing also covers cross-country, trail and fell or mountain running. Club members have travelled to marathons in London, Dublin and New York, while regular social gatherings help newcomers get to know other runners. Joining information and the membership form sit alongside the session details, with a public email and contact form for questions.",
    ],
    founded_year: 1984,
    location_note:
      "Canolfan Pentre Awel in Llanelli is the club's published meeting venue. Check session updates for routes and holiday changes.",
    corrections: {
      address_kind: "training",
    },
    sources: [
      {
        title: "Club history and name",
        url: "https://sospanroadrunners.co.uk/about/",
      },
      {
        title: "Sessions and joining",
        url: "https://sospanroadrunners.co.uk/regular-sessions/",
      },
      {
        title: "Contact and venue",
        url: "https://sospanroadrunners.co.uk/contact/",
      },
      {
        title: "Welsh Athletics disciplines",
        url: "https://www.welshathletics.org/en/club/view/sospan-road-runners",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-3m-gorseinon-road-runners": {
    summary:
      "3M Gorseinon Road Runners has offered coached running since 1989, with winter sessions at Swansea University and summer venues around Swansea and Gorseinon.",
    biography: [
      "3M Gorseinon Road Runners is a Welsh Athletics-affiliated club serving Gorseinon and Swansea, Wales. Established in 1989, it offers coached running for people starting with Couch to 5K as well as runners preparing for competition. The programme includes track and off-track sessions, cross-country, parkrun outings and social events.",
      "Wednesday training moves with the seasons. The published 2026–27 winter programme uses Swansea University track from October to March, while summer sessions take place at different locations around Swansea and Gorseinon. Members are asked to check ConnectMyClub because individual locations can change. A club Grand Prix provides a range of distances through the year.",
      "New runners can arrange a first trial session through the membership officer, using the club email or contact form. The website describes a membership spanning teenagers through older runners, but applicants should confirm the appropriate group and current joining conditions. The winter track and changing summer venues are more useful for planning a first visit than the older Victoria Road directory address.",
    ],
    founded_year: 1989,
    location_note:
      "The 2026–27 winter sessions use Swansea University track, SA2 8QG. Summer venues vary around Swansea and Gorseinon; check ConnectMyClub before travelling.",
    corrections: {
      address: "Swansea University athletics track, Swansea, SA2 8QG",
      postcode: "SA2 8QG",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club overview and founding year",
        url: "http://www.3mgorseinonrr.co.uk/",
      },
      {
        title: "About and seasonal training",
        url: "https://3mgorseinonrr.co.uk/about-us/",
      },
      {
        title: "2026–27 session venues",
        url: "https://3mgorseinonrr.co.uk/sessions/",
      },
      {
        title: "Membership enquiries",
        url: "https://3mgorseinonrr.co.uk/contact/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-ballintotis-fit4life-a-c": {
    summary:
      "Ballintotis Fit4Life A.C. is an adult running club near Castlemartyr in County Cork, welcoming beginners and experienced runners into local community running.",
    biography: [
      "Ballintotis Fit4Life A.C. is an adult running club in Ballintotis near Castlemartyr, County Cork, Ireland. The local community council describes a group ranging from beginners to experienced marathon runners, with Couch to 5K activities and members travelling to 10K races and marathons around the country.",
      "The club is part of the wider running life around Ballintotis and Loughaderra Lake. It works with the community council on the Lap of the Lake walk and associated charitable donations. The area's four-mile road race is organised by Ballintotis Community Council in association with East Cork AC; its history and famous race visitors should not be confused with the founding or membership of Fit4Life.",
      "Athletics Ireland lists Ballintotis Fit4Life as senior-only and provides an online joining route, a public club email and a telephone contact. The community council also directs prospective runners to the same email. Enquire about the current training group and meeting point before attending: the opened pages did not provide a dependable weekly timetable.",
    ],
    location_note:
      "Athletics Ireland lists Ballintotis, Castlemartyr as the training locality. Its postcode also appears against the national school on the community website; an exact club meeting point has not been established here.",
    corrections: {
      city: "Ballintotis",
      address: "",
      postcode: "",
      location_precision: "area-only",
      adult_only: true,
    },
    sources: [
      {
        title: "Senior-only listing and contacts",
        url: "https://membership.athleticsireland.ie/clubpage/Ballintotis_Fit4Life_A.C.",
      },
      {
        title: "Community council club introduction",
        url: "https://ballintotis.com/local-groups-clubs/",
      },
      {
        title: "Community activity and location context",
        url: "https://ballintotis.com/our-community/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
};
