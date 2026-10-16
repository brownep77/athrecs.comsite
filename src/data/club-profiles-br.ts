import type { ClubProfile } from "./club-profiles.ts";

// Official club and university pages opened on 16 October 2026 UTC.
export const regionalAndUniversityParticipationProfiles: Record<string, ClubProfile> = {
  "trx-wolves-ac": {
    summary: "TRX Wolves AC offers structured adult running in Wolverhampton, with its Renegades training group and a UK virtual membership option.",
    biography: [
      "TRX Wolves AC is based in Wolverhampton, England, and welcomes runners aged 18 and over for road, track and cross-country training. Its approach centres on consistent, structured coaching, with runners able to participate locally or represent the club through its UK virtual membership option.",
      "The Renegades group brings together runners from different clubs and accommodates a wide range of paces. Second-claim and social membership allow people to train with the group without changing their main racing club. The website offers three free sessions before joining and directs runners to a weekly training blog for locations.",
      "The club's race programme includes the Tettenhall 5K. Its published committee lists Ian Stewart MBE as president. Membership opened in February 2026, but that announcement does not establish the date when the earlier training group began."
    ],
    notable_members: [{ name: "Ian Stewart MBE", connection: "Club president", detail: "Listed as president on the club's committee page when checked in October 2026; this is a role association, not a claim of current racing membership." }],
    sources: [{ title: "Club, training, membership and committee", url: "https://trxwolvesac.com/" }],
    corrections: { website: "https://trxwolvesac.com/", adult_only: true },
    reviewed_at: "2026-10-16"
  },
  "ttt-run-club": {
    summary: "TTT Run Club is the running-club membership route within Total Tri Training's wider UK endurance coaching community.",
    biography: [
      "TTT Run Club sits within Total Tri Training, a UK coaching organisation supporting endurance athletes from novices to experienced competitors. The running club provides a way to represent the TTT community in affiliated running races, alongside the organisation's separate triathlon coaching services.",
      "Its membership page explains first-claim and second-claim options, a downloadable application form and the requirement to wear the club vest when racing for the team. Applicants are directed to the published membership email for processing and payment instructions.",
      "The wider organisation offers online coaching, training days and camps, but these should not be assumed to be included in running-club membership. The affiliation product was marked out of stock when checked, so prospective runners should confirm availability directly. No single public club training venue is established by these pages."
    ],
    sources: [{ title: "Total Tri Training introduction", url: "https://www.totaltritraining.com/" }, { title: "Run club membership and contact", url: "https://www.totaltritraining.com/product/total-tri-affiliation/" }],
    contact_note: "Confirm current membership availability and what is included; the affiliation product page was marked out of stock when reviewed.",
    reviewed_at: "2026-10-16"
  },
  "tuff-fitty-triathlon-club": {
    summary: "Tuff Fitty Triathlon Club brings adults across West Sussex together for swimming, cycling, running and the Frosty Aquathlon.",
    biography: [
      "Tuff Fitty Triathlon Club draws adult members from across West Sussex, England. Its programme combines coached swimming, track running, group runs and cycling, with newcomers able to try a couple of sessions before deciding whether to join.",
      "Published venues include Littlehampton Wave for pool swimming, Worthing Sports Centre for track sessions and Arundel for a Saturday run. Other activities include virtual cycling and seasonal sea swimming. The club charges separately for hired pool and track facilities, while many outdoor group activities have no additional session charge.",
      "Tuff Fitty organises the Frosty Aquathlon and publishes advice for novice triathletes. Its membership page explicitly describes an adult-only club, with experience shared by coaches and fellow members. Check the current events information before travelling, as the website also retains older championship schedules."
    ],
    sources: [{ title: "Club activities and venues", url: "https://www.tuff-fitty.co.uk/" }, { title: "Membership and participation", url: "https://www.tuff-fitty.co.uk/new-membership-faq/" }],
    corrections: { adult_only: true },
    location_note: "Training is spread across West Sussex, including Littlehampton, Worthing and Arundel; no single venue covers every session.",
    reviewed_at: "2026-10-16"
  },
  "tunbridge-wells-harriers": {
    summary: "Tunbridge Wells Harriers grew from a 1982 running club into an adult road, trail and cross-country community based at the Nevill Ground.",
    founded_year: 1982,
    biography: [
      "Tunbridge Wells Harriers traces its present organisation to Tunbridge Wells Runners, formed in June 1982 by runners who had trained for the first London Marathon. This was distinct from the older Harriers club that existed before the Second World War. The current name and striped club vest were adopted in 1997.",
      "The club moved to the Nevill Ground in Tunbridge Wells, Kent, in 2006. Wednesday runs start from the pavilion, while track sessions use Tonbridge School. Road, trail and cross-country running form the core of the programme, with social gatherings after training.",
      "Membership is for adults over 18. Prospective members can try three sessions and should consult the club's guidance on suitable running distances. The Harriers organise the Tunbridge Wells Half Marathon and Eridge Park 10, bringing their volunteers and runners into the wider local running community."
    ],
    sources: [{ title: "History, venues and joining", url: "https://www.twharriers.org.uk/about-us/" }, { title: "Club enquiry form", url: "https://www.twharriers.org.uk/contact-us/" }],
    corrections: { city: "Tunbridge Wells", website: "https://www.twharriers.org.uk/", adult_only: true, address: "Nevill Ground Pavilion, Nevill Gate, off Warwick Park, Tunbridge Wells, TN2 5ES", postcode: "TN2 5ES", address_kind: "clubhouse" },
    reviewed_at: "2026-10-16"
  },
  "tyne-bridge-harriers": {
    summary: "Tyne Bridge Harriers offers Newcastle runners a range of training groups, junior participation and road and track competition.",
    founded_year: 2011,
    biography: [
      "Tyne Bridge Harriers formed in January 2011 and is based at East End Pool in Byker, Newcastle upon Tyne. The North East club combines weekday group training with Saturday track sessions and welcomes runners pursuing both social participation and competitive goals.",
      "Its adult training is arranged in five groups, allowing runners with different levels of speed and endurance to find suitable company. Prospective members can request a trial through the club's form, which helps coaches choose an appropriate group. Under-18 enquiries are directed to the separate junior section.",
      "The club's activities include road racing, cross-country and track and field, alongside the Bridges of the Tyne five-mile race. Current reports show members taking part across the regional calendar. Newcomers should arrange their first session before visiting the East End Pool meeting point."
    ],
    sources: [{ title: "Club origins and meeting place", url: "https://www.tynebridgeharriers.com/" }, { title: "Trial sessions and junior route", url: "https://www.tynebridgeharriers.com/join-tbh/try-a-training-session-with-tbh/" }],
    corrections: { city: "Newcastle upon Tyne", website: "https://www.tynebridgeharriers.com/", address: "East End Pool, Hadrian Square, Newcastle upon Tyne, NE6 1AL", postcode: "NE6 1AL", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "ucl-running-athletics-and-cross-country-club": {
    summary: "UCL RAX combines London student running, track and field, cross-country and beginner programmes with university competition and social activities.",
    biography: [
      "UCL Running, Athletics and Cross Country Club, known as RAX, welcomes students ranging from complete beginners to university championship competitors. Its London programme covers social running, cross-country, track and field and combined events.",
      "Social runs meet outside Bloomsbury Theatre and explore Regent's Park in different distance and pace groups. Track opportunities involve Highgate Harriers at Parliament Hill and London Heathside at Finsbury Park. Couch to 5K, postgraduate runs and women's sessions provide further ways into running.",
      "Members can enter LUCA competitions, BUCS championships and the athletics Varsity match against King's College London. The club also organises tours, social gatherings and fundraising. Membership is purchased through Students' Union UCL, with separate social and race-inclusive options; some partner training and trips carry additional costs."
    ],
    sources: [{ title: "Official students' union club profile", url: "https://studentsunionucl.org/clubs-societies/running-athletics-and-cross-country-club" }],
    location_note: "Sessions use several London venues. Bloomsbury Theatre is the published social-run meeting point, not the venue for every athletics session.",
    reviewed_at: "2026-10-16"
  },
  "uffo-athletic-satellite-clubs": {
    summary: "UFFO Athletic Satellite Clubs connects London community sport with culturally inclusive walking, running and children's movement activities.",
    biography: [
      "UFFO Athletic and Leisure Group is a not-for-profit organisation promoting physical activity within Somali and Muslim communities. Its London projects use walking, running, athletics and traditional games to make participation accessible in settings that respect participants' cultural backgrounds.",
      "Children's activities develop balance, coordination, jumping and throwing as well as social skills. The organisation also encourages parents and carers to take part through health and wellbeing programmes, and invites volunteers to support its community work.",
      "The satellite-club page currently describes a dated Lambeth holiday programme for young people with SEND and their siblings from East African backgrounds. Those 2025 and early-2026 dates should not be treated as a current timetable. Enquire through the published organisation contacts for available sessions and their venues."
    ],
    sources: [{ title: "Organisation and community purpose", url: "https://www.uffoathletic.com/who-we-are/" }, { title: "Satellite programme and enquiries", url: "https://www.uffoathletic.com/uffo-athletic-satellite-clubs/" }],
    corrections: { website: "https://www.uffoathletic.com/uffo-athletic-satellite-clubs/", city: "London", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Activities use community venues. The organisation's footer address is not established as a public training venue.",
    reviewed_at: "2026-10-16"
  },
  "university-of-birmingham-ac-and-cross-country-club": {
    summary: "Birmingham's university athletics club combines track and field, cross-country, recreational participation and a longstanding Ivy League exchange.",
    biography: [
      "The University of Birmingham Athletics and Cross Country Club brings together students and an active alumni community in Birmingham, England. Its programme includes beginners, recreational athletes and high-level competitors, with coaching across athletics event groups and support for para-sport.",
      "Most training uses the university's own track, opened in 2017, with further sessions at Alexander Stadium's indoor facilities and local parks. Members can compete at BUCS championships, cross-country leagues and relay events, while the club hosts its own Track and Field Series.",
      "An Ivy League exchange dating from 1962 alternates visits with American university athletes. Coaching qualifications, officiating and student committee work offer ways to participate beyond competition. Prospective students and returning alumni should use the club's membership guidance to confirm the right training and membership arrangements."
    ],
    sources: [{ title: "University sport: club, facilities and exchange", url: "https://www.sportandfitness.bham.ac.uk/sport/discover-sport/athletics-xc/" }, { title: "Club enquiry contacts", url: "https://www.ubsportathletic.co.uk/about" }],
    corrections: { website: "https://www.ubsportathletic.co.uk/" },
    reviewed_at: "2026-10-16"
  },
  "university-of-manchester-ath-and-xc-club": {
    summary: "Manchester's university athletics and cross-country opportunities span coached training, student competition and a cross-country tradition dating to 1924.",
    biography: [
      "The University of Manchester provides athletics and cross-country opportunities through separately described student clubs. The cross-country section records its foundation in 1924 and welcomes runners of different abilities, including those who prefer social running to competition.",
      "Cross-country activities include coached track training at Wythenshawe, BUCS competition and the club's Manchester Relays. The published introduction says there are no trials or attendance requirements and invites runners to try sessions before joining.",
      "The athletics section also welcomes different experience levels and was runner-up for the university's Club of the Year award in 2025. Its page lists Manchester Regional Arena as a 2024/25 venue, but does not confirm a current timetable. Contact the appropriate section for up-to-date sessions rather than relying on those older academic-year details."
    ],
    sources: [{ title: "Official cross-country club listing", url: "https://manchesterstudentsunion.com/activities/view/CrossCountry" }, { title: "Official athletics club listing", url: "https://manchesterstudentsunion.com/activities/view/athletics" }],
    corrections: { website: "https://www.sport.manchester.ac.uk/sport-and-activity/sport-a-to-z/athletics-and-cross-country/" },
    contact_note: "The union lists athletics and cross-country separately. The 1924 origin applies to cross-country; published academic-year training details require confirmation.",
    reviewed_at: "2026-10-16"
  },
  "university-of-plymouth-athletics-club": {
    summary: "Plymouth's student athletics club combines sprint, endurance and field training with social runs, cross-country and university championships.",
    biography: [
      "University of Plymouth Athletics Club welcomes competitive athletes and social runners in Plymouth, Devon. Its 2026/27 students' union listing describes endurance, sprint and field-event groups, with two weekly track sessions and opportunities to compete.",
      "Social runs start from the students' union roof meeting point and split into suitable paces, with a policy of keeping runners together. Longer Sunday outings explore places such as Saltram and Mount Edgcumbe, while members also visit local parkruns.",
      "The competition programme includes the Westward Cross Country League, BUCS championships and local road races. Social activities include both evenings out and alcohol-free gatherings. The official union page provides membership choices, a club email and social accounts for confirming sessions; its two different Instagram handles should be checked before relying on one for updates."
    ],
    sources: [{ title: "Official 2026/27 club programme and contacts", url: "https://www.upsu.com/sports/clubs/athletics/" }],
    corrections: { city: "Plymouth" },
    reviewed_at: "2026-10-16"
  },
  "unsanctioned-athletics": {
    summary: "Unsanctioned Athletics grew from Nottingham's running scene into unusual race formats and a performance-focused affiliated racing collective.",
    biography: [
      "Unsanctioned Athletics began in Nottingham, England, and presents its racing project as active since 2023. Its events use unusual formats, with the specific challenge revealed shortly before the start so runners must adapt their plans.",
      "Alongside these events, the Unsanctioned Athletics Race Collective, or UARC, is described as an England Athletics-affiliated racing team. It targets experienced competitors and applies performance standards before accepting members, rather than operating as an unrestricted beginner group.",
      "The collective's published support includes coaching partnerships, equipment and creative assistance for athletes. Interested runners can register interest through the team page or consult its official Instagram for application windows. Participation in an Unsanctioned event should not be confused with membership of the racing collective."
    ],
    sources: [{ title: "Organisation background", url: "https://www.unsanctionedathletics.com/about" }, { title: "Racing collective and applications", url: "https://www.unsanctionedathletics.com/ua-team" }],
    reviewed_at: "2026-10-16"
  },
  "vale-of-york-athletic-community": {
    summary: "Vale of York Athletic Community offers junior and adult athletics across Tadcaster, Bubwith and York, with routes into track, road and cross-country competition.",
    biography: [
      "Vale of York Athletic Community serves runners and athletes in the Selby and York area of England. Its current programme combines track and field, endurance running and strength work, with adults and juniors sometimes training at the same venue so families can participate together.",
      "Adult sessions use Tadcaster's school track, Bubwith's circuit and sports facilities, and tracks in York. Competition opportunities include summer track and field, winter cross-country and the York and District road league. Adults can ask to try a session without joining a waiting list.",
      "Children begin with Funetics for ages five to seven before progressing into age-group athletics. Places vary by venue and age group, with waiting lists for some junior sessions. The club provides an enquiry form and describes an access fund for families needing help with participation costs."
    ],
    sources: [{ title: "Adult programme", url: "https://valeofyork.org/adults/" }, { title: "Junior routes and capacity", url: "https://valeofyork.org/juniors/" }, { title: "Club enquiry form", url: "https://valeofyork.org/contact/" }],
    location_note: "Training uses several venues around Tadcaster, Bubwith and York; confirm the venue for the chosen session.",
    reviewed_at: "2026-10-16"
  },
  "valley-hill-runners": {
    summary: "Valley Hill Runners meets in High Green, Sheffield, for sociable running through local parks, woodland and roads.",
    biography: [
      "Valley Hill Runners is based in High Green, Sheffield, England. Members run for fitness, race preparation and company, using routes around High Green, Grenoside and Chapeltown that mix roads with parks and woodland.",
      "The club's published introduction welcomes runners aged 12 and over, from first-timers to experienced runners. Monday and Wednesday sessions meet in the car park outside Thorncliffe Community Club on Mortomley Close, gathering before the advertised evening start.",
      "The regular gathering time is 6.20pm for a 6.30pm start. Thorncliffe is a meeting point for runs into the surrounding area, so newcomers should arrive before departure rather than expect the group to remain at the community club."
    ],
    sources: [{ title: "Official club introduction and sessions", url: "https://www.valleyhillrunners.com/" }],
    corrections: { website: "https://www.valleyhillrunners.com/", address: "Thorncliffe Community Club car park, Mortomley Close, High Green, Sheffield, S35 3HZ", postcode: "S35 3HZ", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "valley-striders-ac": {
    summary: "Valley Striders brings adult and junior running to Alwoodley in Leeds, alongside associated cycling and triathlon groups.",
    biography: [
      "Valley Striders is based in Alwoodley, Leeds, England, and competes on road, fell, trail and cross-country courses. Its runners enter county, regional and national team events, with participation ranging from beginners to experienced marathon runners.",
      "Tuesday training uses the Old Leodiensian Club on Crag Lane, while Thursday social runs leave from different locations. A junior section welcomes children from age eight, and the club's wider community also includes cycling and triathlon groups.",
      "The website publishes junior training updates and seasonal competition information, helping families follow the changing programme. Prospective members can use a dedicated trial-session route linked from the contact page; general enquiries are directed through the club form. Confirm the appropriate group and venue before attending."
    ],
    sources: [{ title: "Club introduction and training base", url: "https://www.valleystriders.org.uk/" }, { title: "Enquiries and trial-session route", url: "https://www.valleystriders.org.uk/contact-us/" }],
    corrections: { address: "The Leodiensian Club, Crag Lane, Alwoodley, Leeds, LS17 5PR", postcode: "LS17 5PR", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "vegan-runners-uk": {
    summary: "Vegan Runners UK connects runners across the country through local meetups, training, races and a shared commitment to vegan living.",
    scope: "national",
    biography: [
      "Vegan Runners UK is a nationwide athletics club organised around a shared commitment to vegan living rather than a single town. It welcomes runners of different abilities and brings members together through local groups, races and social activities across the UK.",
      "Local meetups provide opportunities to train and attend parkrun, while the wider calendar includes road racing, cross-country and hill or fell running. The club is affiliated to England Athletics, with individual registration offered as an optional addition to membership.",
      "Volunteers help organise runs, events and community activities. The website directs prospective members to its joining page and people interested in helping to the club secretary through the contact form. The registered company address in Cambridge is an administrative address, not a common training base for this dispersed membership."
    ],
    sources: [{ title: "UK-wide club and membership structure", url: "https://www.veganrunners.org.uk/about-2/" }, { title: "Activities and registered address", url: "https://www.veganrunners.org.uk/" }],
    corrections: { city: "", address: "", postcode: "", location_precision: "area-only", website: "https://www.veganrunners.org.uk/" },
    location_note: "UK-wide club with local groups; the registered office is not a shared training venue.",
    reviewed_at: "2026-10-16"
  },
  "verwood-runners": {
    summary: "Verwood Runners offers sociable Dorset running, structured sessions and periodic Couch to 5K courses with qualified leaders.",
    biography: [
      "Verwood Runners is an inclusive running club in Verwood, Dorset, England. Its published aims emphasise enjoyment, safe group running and the social benefits of taking part, supported by qualified running leaders and a coach.",
      "Regular groups cater for existing runners able to cover five kilometres in around 45 minutes or less. Sessions range from easier five-kilometre outings to interval training, giving members different ways to develop their running.",
      "The club periodically offers Couch to 5K courses for people starting out. Dates and meeting arrangements are announced on its website and Facebook group, so a course should not be assumed to be continuously available. Newcomers can use the club's enquiry form to ask about joining and the most suitable session."
    ],
    sources: [{ title: "Club introduction and beginner provision", url: "https://verwoodrunners.co.uk/about/" }, { title: "Joining enquiry form", url: "https://verwoodrunners.co.uk/contact/" }],
    reviewed_at: "2026-10-16"
  },
  "veterans-ac": {
    summary: "Veterans AC has supported masters athletics since 1931, offering London and South East competition in running, track and field and race walking.",
    founded_year: 1931,
    biography: [
      "Veterans Athletic Club was founded at Stamford Bridge stadium in London on 12 September 1931. Its history records a long association with masters athletics and cross-country on Wimbledon Common, where the club's connections extend back to around the 1950s.",
      "Based in London with members across the South East, Veterans AC provides opportunities in road running, cross-country, track and field and race walking for athletes aged 35 and over. Its programme includes club championships and events at several venues rather than one weekly training base.",
      "Membership is handled through the British Masters Athletics Federation's OpenTrack system, with first-claim and second-claim arrangements explained on the club website. The membership secretary offers help by public email and telephone. The postal application address is for administration and should not be treated as a training venue."
    ],
    sources: [{ title: "Club history", url: "https://vetsac.org.uk/Club-History.html" }, { title: "Activities and regional reach", url: "https://vetsac.org.uk/" }, { title: "Membership and public enquiries", url: "https://vetsac.org.uk/Membership.html" }],
    corrections: { city: "London", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Competition venues vary across London and the South East; the membership secretary's postal address is for correspondence.",
    reviewed_at: "2026-10-16"
  },
  "wadebridge-running-club": {
    summary: "Wadebridge Running Club combines paced social runs, intervals and changing coastal routes around North Cornwall.",
    biography: [
      "Wadebridge Running Club brings together runners in Wadebridge, Cornwall, England, for fitness, friendship and local exploration. Its programme welcomes both people building confidence and runners preparing for races, with routes using nearby lanes, trails and coast.",
      "Monday intervals and Wednesday social runs meet at the town-centre bandstand in front of the Co-op. The social session divides into six groups, including a walk/run option, while coached interval work can be adapted to different levels.",
      "Sunday outings use changing coastal locations and a progressive running-time format. Occasional summer Dash-Bash evenings combine a social run with food and conversation afterwards. Members should check the published Sunday locations and club updates before travelling, since the coastal meeting point changes from week to week."
    ],
    sources: [{ title: "Club introduction", url: "https://www.wadebridgerunningclub.com/" }, { title: "Sessions and social links", url: "https://www.wadebridgerunningclub.com/training" }],
    corrections: { address: "Bandstand in front of the Co-op, Wadebridge town centre", postcode: "", location_precision: "unverified", address_kind: "training" },
    location_note: "The bandstand is the Monday and Wednesday meeting point; Sunday coastal locations vary.",
    reviewed_at: "2026-10-16"
  },
  "wadhurst-runners": {
    summary: "Wadhurst Runners has brought East Sussex runners together since 1999 through social training, local competition and the Bewl races.",
    founded_year: 1999,
    biography: [
      "Wadhurst Runners was formed in 1999 by Albert Kemp and other local runners in East Sussex, England. Known as the Waddies, its members include people running for company and fitness as well as competitors in road, cross-country and relay events.",
      "Regular runs start from Uplands Sports Centre's car park in Wadhurst, with a further group using Bedgebury. Members compete in the Sussex Grand Prix and East Sussex Cross Country League, and the club also provides a coached Couch to 5K route for beginners.",
      "The club organises the Bewl 15 and five-mile races, with volunteers supporting the events and fundraising for the Kent, Surrey and Sussex air ambulance charity. Prospective runners can email the club to arrange a first visit. The next beginner course was advertised for spring 2027 when this profile was reviewed."
    ],
    notable_members: [{ name: "Albert Kemp", connection: "Founding member", detail: "Named by the club as one of the runners who established Wadhurst Runners in 1999." }],
    sources: [{ title: "Club origins, activities and enquiries", url: "https://www.wadhurstrunners.com/" }],
    corrections: { address: "Uplands Sports Centre car park, Wadhurst", postcode: "", location_precision: "unverified", address_kind: "training" },
    reviewed_at: "2026-10-16"
  },
  "walsall-arboretum-running-club": {
    summary: "Walsall Arboretum Running Club grew from six runners in 2012 into a led Monday-evening programme with beginner and paced groups.",
    founded_year: 2012,
    biography: [
      "Walsall Arboretum Running Club began in 2012 with six regular Monday runners and became affiliated to England Athletics in 2020. Based in Walsall, England, it welcomes people with different experience levels and aims to keep each runner supported within a group.",
      "Sessions use leaders at the front and back of groups, with routes and exercises covering hills, speed, endurance and strength. The published meeting point is Walsall Arboretum Visitor Centre on Broadway North. The current homepage lists Run for Fun, 5to7 and 7Up groups, while the faster 10+ group is temporarily paused.",
      "Couch to 5K courses are normally advertised for January and September. Newcomers should use the club's contact form to ask about the next course or suitable regular group. The club also welcomes enquiries from people interested in becoming run leaders."
    ],
    sources: [{ title: "Club origins and leaders", url: "https://www.walsallarboretumrunningclub.co.uk/about-us" }, { title: "Current groups and paused session", url: "https://www.walsallarboretumrunningclub.co.uk/" }, { title: "Enquiries and meeting point", url: "https://www.walsallarboretumrunningclub.co.uk/contact-us" }],
    corrections: { address: "Walsall Arboretum Visitor Centre, Broadway North, Walsall, WS1 2QH", postcode: "WS1 2QH", address_kind: "training" },
    reviewed_at: "2026-10-16"
  }
};
