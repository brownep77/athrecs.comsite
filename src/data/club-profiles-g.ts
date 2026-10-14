import type { ClubProfile } from "./club-profiles";

// Primary pages opened on 13 October 2026. Historical associations are not
// claims of current membership and do not create athlete identities or results.
export const coastalAndRegionalClubProfiles: Record<string, ClubProfile> = {
  "axe-valley-runners": {
    summary:
      "Axe Valley Runners is a Seaton-based running club serving East Devon and nearby West Dorset, with beginner groups, juniors and the Grizzly multi-terrain race.",
    biography: [
      "Axe Valley Runners brings together runners from Seaton, Beer, Axminster and the surrounding East Devon and West Dorset countryside. Its club programme spans first steps through Couch to 5K, social running and longer-distance challenges, with a relaunched junior section and Run and Talk sessions. New members register through Spond and can use the club's enquiry form to find a suitable group.",
      "The club is closely associated with the Grizzly, which began in Beer in 1988 with 27 runners on a six-mile course. As the race grew, its start moved to Seaton and a shorter Cub race was added in 1992. The non-profit event draws on local marshals and community groups and has raised money for charities and good causes. That race history is part of the club's identity, but taking on the Grizzly is certainly not a requirement for joining a weekly run.",
    ],
    location_note:
      "Seaton is the club's home base. Check the club-night calendar for the meeting point of your chosen group; the directory's cricket-club address is not a guarantee that every session starts there.",
    corrections: { website: "https://www.axevalleyrunners.org.uk/" },
    sources: [
      { title: "Club activities and new members", url: "https://www.axevalleyrunners.org.uk/" },
      {
        title: "The Grizzly's history",
        url: "https://www.axevalleyrunners.org.uk/the-grizzly/history/",
      },
      { title: "Club enquiry form", url: "https://www.axevalleyrunners.org.uk/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "bideford-aac": {
    summary:
      "Bideford Amateur Athletic Club, known locally as the Bideford Blues, offers running and rowing for juniors and adults from its clubhouse on The Pill in North Devon.",
    biography: [
      "Bideford Amateur Athletic Club is both a running and rowing club, with a shared home on The Pill beside Kingsley Road in Bideford, Devon. Known locally as the Bideford Blues, it is run by volunteers and combines training with a clubhouse, changing facilities and a social programme. The running section was founded in 1980 by Geoff Fanson and Barrie White; that date belongs to the section, not necessarily to the older club as a whole.",
      "Adult runners can try group runs before joining, with routes organised around different distances and paces and regrouping points along the way. Juniors can begin running from age six, subject to the waiting list; rowing has a separate minimum age and training arrangements. The club organises the Bideford half marathon, 10K and 10-mile races. Its contact page routes enquiries separately to the running, rowing, membership and race teams, helping newcomers reach the right volunteers.",
    ],
    corrections: {
      website: "https://bidefordaac.co.uk/",
      address_kind: "clubhouse",
      sports: ["Running", "Athletics", "Rowing"],
    },
    sources: [
      { title: "Bideford Blues running and rowing", url: "https://bidefordaac.co.uk/" },
      { title: "Running section origins and sessions", url: "https://bidefordaac.co.uk/running" },
      { title: "Membership and junior waiting list", url: "https://bidefordaac.co.uk/membership" },
      {
        title: "Clubhouse address and section enquiry forms",
        url: "https://bidefordaac.co.uk/get-in-touch",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "exeter-harriers": {
    summary:
      "Exeter Harriers is a volunteer-run athletics club founded in 1904, offering track and field, cross-country and junior sportshall from Exeter Arena in Devon.",
    biography: [
      "Exeter Harriers has been part of athletics in Devon since 1904. Its home is the Exeter Arena site, where the club has its own pavilion and hires the all-weather track for training and meetings. Athletes can join from age eight, with coaching for beginners as well as those progressing to regional, national and international competition.",
      "The programme extends beyond the summer track season: teams compete in the Westward Cross Country League, and younger athletes take part in Devon sportshall competition. The club also organises evening open meetings and the Ken Trickey Memorial meeting. Newcomers can arrange temporary membership, with the welcome-desk volunteers helping them find a training group; parents must stay on site while a junior is taking part in the trial period. Visiting members of other clubs can ask about guest membership.",
    ],
    founded_year: 1904,
    contact_note:
      "The pavilion telephone is normally answered around training sessions and meetings; otherwise leave a message or email the welcome desk.",
    corrections: { website: "https://www.exeterharriers.org.uk/", address_kind: "clubhouse" },
    sources: [
      {
        title: "Club history, facilities and athletics programme",
        url: "https://www.exeterharriers.org.uk/",
      },
      {
        title: "Temporary membership and junior supervision",
        url: "https://www.exeterharriers.org.uk/contents/2487-temporary-membership",
      },
      {
        title: "Guest membership",
        url: "https://www.exeterharriers.org.uk/contents/2488-guest-membership",
      },
      {
        title: "Pavilion address and enquiries",
        url: "https://www.exeterharriers.org.uk/contents/2684-contactus",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "erme-valley-harriers": {
    summary:
      "Erme Valley Harriers is an Ivybridge athletics club founded in 1983, with adult running, junior track and field, cross-country and sportshall in South Devon.",
    biography: [
      "Erme Valley Harriers grew out of the marathon boom, holding its first committee meeting in November 1983. Founder Richard Bristow wanted a club for Ivybridge runners with a strong family atmosphere. The early road-running group soon added cross-country, entering the Westward League in 1984, and junior track and field followed. The club's events have included the Ivybridge 10K, local hill races and charity challenges.",
      "Today adult sessions use Ivybridge Rugby Club as a base, while juniors from age eight train at Ivybridge Community College, moving between outdoor facilities and the sports hall with the seasons. The club offers a route into running through Couch to 5K as well as competition for experienced athletes. Prospective members can try sessions before committing; families should contact the secretary about the appropriate junior group and current meeting arrangements.",
    ],
    founded_year: 1983,
    location_note:
      "The rugby club is the adult base. Junior sessions use Ivybridge Community College, so check the relevant group's instructions before travelling.",
    corrections: { website: "https://www.ermevalleyharriers.co.uk/", address_kind: "training" },
    sources: [
      {
        title: "Club origins and development",
        url: "https://www.ermevalleyharriers.co.uk/about-us/",
      },
      {
        title: "Current adult and junior training",
        url: "https://www.ermevalleyharriers.co.uk/training/",
      },
      {
        title: "Joining and trial sessions",
        url: "https://www.ermevalleyharriers.co.uk/club-membership-kit/",
      },
      {
        title: "Club role contacts",
        url: "https://www.ermevalleyharriers.co.uk/club-information/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "exmouth-harriers": {
    summary:
      "Exmouth Harriers offers adult running in coastal East Devon, combining structured efforts, social runs and local races with competitive and social membership options.",
    biography: [
      "Exmouth Harriers is an adult running club in Exmouth, Devon, with a programme built around shared training rather than a requirement to race. Tuesday sessions focus on efforts, intervals or hills, while other runs offer a steadier social outing. The club's published arrangements use Exmouth's LED Tennis Centre and, for some summer sessions, the grass track at St Peter's School in Lympstone.",
      "Members can choose competitive membership with England Athletics registration or a social or second-claim option. Club life includes relay teams, awards evenings and helping to stage the Budleigh Blister, alongside occasional charity activities. New runners should email the secretary and membership secretary before a taster session. The club then supplies its current training updates; older website timetables should not be treated as a fixed meeting time for every week.",
    ],
    location_note:
      "Training meeting points vary between Exmouth and seasonal sessions in Lympstone. Confirm the current venue with the club; the retained directory address is not labelled as a verified training base.",
    corrections: { website: "https://exmouthharriers.co.uk/" },
    sources: [
      {
        title: "Training updates and taster-session instructions",
        url: "https://exmouthharriers.co.uk/training",
      },
      {
        title: "Membership, volunteering and club activities",
        url: "https://exmouthharriers.co.uk/membership",
      },
      {
        title: "Club enquiries and public social links",
        url: "https://exmouthharriers.co.uk/contact",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "bude-rats-run-and-tri": {
    summary:
      "Bude RATs, the Run and Tri club in North Cornwall, welcomes runners of different abilities for social runs, structured training and local trail events.",
    biography: [
      "Bude RATs has been bringing runners together in the North Cornwall town of Bude since 2008. The Run and Tri name is familiar locally, while the club's current public programme centres on running: a Tuesday social outing and a more focused Thursday training session. Runners are welcome whether their goal is improved fitness, company on a run or preparing for an event.",
      "The club's race programme includes the Bude Lifeboat Run, Bude Pirate Run and Talan's Notorious Trail. Members are encouraged to take part in events around Cornwall and the wider South West, with social activities alongside the racing. Newcomers are offered four sessions before joining. Meeting locations are announced through the club's Facebook group, and separate general and membership email addresses provide a straightforward way to ask which session to try.",
    ],
    founded_year: 2008,
    location_note:
      "The club is based in Bude, but run starts vary. Use the current club announcement rather than treating the incomplete directory street address as a training venue.",
    corrections: { city: "Bude", address: "", postcode: "", location_precision: "area-only" },
    sources: [
      { title: "Club origins", url: "https://www.buderats.co.uk/about-us" },
      {
        title: "Running sessions, trial visits and club races",
        url: "https://www.buderats.co.uk/",
      },
      {
        title: "General and membership enquiries",
        url: "https://www.buderats.co.uk/copy-of-join-our-club",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "cornwall-ac": {
    summary:
      "Cornwall Athletic Club trains at Carn Brea in Pool, Redruth, offering track and field, road running and cross-country for juniors, adults and masters.",
    biography: [
      "Cornwall Athletic Club grew from the merger of Duchy of Cornwall AC and West Cornwall AC and is based at Carn Brea Leisure Centre in Pool, Redruth. Its programme covers track and field, road running, cross-country and junior sportshall, welcoming athletes from age nine. The club has helped develop international athletes, including pole vaulter Molly Caudery, who began trying different events at Carn Brea before specialising.",
      "Coached sessions run throughout the year, and newcomers can ask the track and field or endurance team about a suitable group before arranging membership through Spond. England Athletics named Cornwall AC its Club of the Month in September 2026. That report also described the worn track and the work to secure funding for resurfacing; the club's training base should not be confused with a guarantee that licensed competitions can currently be held there.",
    ],
    location_note:
      "Carn Brea is the club's training base. England Athletics reported on 30 September 2026 that the track lacked a competition licence while resurfacing funding was being sought; confirm event and facility arrangements directly.",
    notable_members: [
      {
        name: "Molly Caudery",
        connection: "Athlete developed at Cornwall AC",
        detail:
          "Described starting at the club at about age eleven in England Athletics' September 2026 feature, which traces her progress to the World Indoor Championships podium.",
      },
    ],
    corrections: { website: "https://www.cornwallac.org.uk/", address_kind: "training" },
    sources: [
      { title: "Club activities and Carn Brea base", url: "https://www.cornwallac.org.uk/" },
      {
        title: "Joining and role contacts",
        url: "https://www.cornwallac.org.uk/content/JoinUs.asp",
      },
      {
        title: "England Athletics Club of the Month, 30 September 2026",
        url: "https://www.englandathletics.org/news/cornwall-ac-england-athletics-x-athletics-weekly-club-of-the-month/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "newquay-and-par-ac": {
    summary:
      "Newquay & Par AC offers track and field, cross-country and junior sportshall from two Cornish bases, with its headquarters at Par Athletics Track.",
    biography: [
      "Newquay & Par Athletic Club was formed in 1984 when Newquay AC and Par AC joined together. Serving north, mid and east Cornwall, it retains two active bases rather than expecting every athlete to train in one town. Par Athletics Track is the headquarters; its former cinder surface was replaced by an all-weather track that reopened in July 2000.",
      "Coaching covers the track and field events, with cross-country and junior sportshall extending the season through winter. Club teams take part in the South West Athletics League and Westward Cross Country League, and open meetings give athletes further chances to compete. Its roll of honour includes Olympian Jemma Simpson and several international juniors. New members should contact the Par or Newquay team about a suitable group; endurance and road-running enquiries have their own named contacts.",
    ],
    founded_year: 1984,
    location_note:
      "Par Athletics Track is the headquarters and one training base. The club also trains in Newquay; check the relevant section's arrangements.",
    notable_members: [
      {
        name: "Jemma Simpson",
        connection: "Club life member and international roll of honour",
        detail: "The 800m runner represented Great Britain at the Beijing 2008 Olympic Games.",
      },
      {
        name: "Kevin Toher",
        connection: "Club life member",
        detail:
          "Competed in three World Cross Country Championships as an under-20 athlete, including Boston in 1992.",
      },
    ],
    corrections: { address_kind: "training" },
    sources: [
      { title: "1984 merger and two club bases", url: "https://www.newquayandpar.co.uk/" },
      {
        title: "Facilities, competition and life members",
        url: "https://www.newquayandpar.co.uk/about-us/",
      },
      {
        title: "International roll of honour",
        url: "https://www.newquayandpar.co.uk/roll-of-honour/",
      },
      { title: "Section contacts", url: "https://www.newquayandpar.co.uk/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "beverley-athletic-club": {
    summary:
      "Beverley Athletic Club offers road and cross-country running in East Yorkshire, with adult training, a junior section and the Beverley and Walkington 10K races.",
    biography: [
      "Beverley Athletic Club began in February 1993 after runner Peter Brown suggested bringing together people who were running alone around the town. A meeting at Beverley Leisure Centre led to Wednesday group runs and, eventually, an affiliated club. It remains rooted in Beverley and the East Riding of Yorkshire, with road running and cross-country at the centre of its programme.",
      "Adults can join club runs, speed sessions and strength work, while juniors develop running skills alongside introductory jumping and throwing. Junior training commonly uses the Westwood, with indoor winter sessions and a waiting list managed through Spond. The club also organises the Beverley and Walkington 10Ks and the community Beaver Trail outing. Prospective adult members should contact the membership team before attending so a welcome runner can help them settle into a suitable group.",
    ],
    founded_year: 1993,
    location_note:
      "This is a Beverley club, not a York-based training group. Adult run starts vary and juniors commonly use Beverley Westwood or winter indoor facilities. The former North Newbald postal listing is not used as a training address.",
    corrections: {
      city: "Beverley",
      address: "",
      postcode: "",
      location_precision: "area-only",
      website: "https://www.beverleyathleticclub.co.uk/",
    },
    sources: [
      {
        title: "Club history, training, junior waiting list and contacts",
        url: "https://www.beverleyathleticclub.co.uk/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "harrogate-harriers-and-ac": {
    summary:
      "Harrogate Harriers & AC combines adult road, fell and track running with junior athletics in North Yorkshire, and organises the Run Harrogate 10K.",
    biography: [
      "Harrogate Harriers & Athletics Club was formed in April 2000 by the merger of Harrogate AC and Imperial AC. Imperial took its name from the fruit shop on Royal Parade where its runners met, while today's red, black and gold kit marks the combined club. The North Yorkshire club competes on road, fell and track and organises the Run Harrogate 10K.",
      "Senior training is based around Harrogate Squash and Fitness Centre, with coached efforts, social runs and longer outings on the programme. Adults are advised to be comfortable running continuously for thirty minutes, and the membership team can discuss preparation or a trial period. The junior section caters for school years five to thirteen, with cross-country and track and field competition. Junior sessions are allocated by invitation according to age, experience and capacity, so families should arrange a taster first.",
    ],
    founded_year: 2000,
    location_note:
      "Harrogate Squash and Fitness Centre is the senior base. Some social runs start elsewhere and junior arrangements are allocated separately; confirm the session before attending.",
    corrections: { website: "https://www.harrogate-harriers.co.uk/", address_kind: "training" },
    sources: [
      {
        title: "Senior club and merger history",
        url: "https://www.harrogate-harriers.co.uk/welcome-to-seniors",
      },
      {
        title: "Senior training and meeting arrangements",
        url: "https://www.harrogate-harriers.co.uk/seniors-training",
      },
      { title: "New members", url: "https://www.harrogate-harriers.co.uk/new-members" },
      {
        title: "Junior age groups",
        url: "https://www.harrogate-harriers.co.uk/harrogate-harriers-juniors",
      },
      {
        title: "Junior session allocation",
        url: "https://www.harrogate-harriers.co.uk/juniors-training",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "keighley-and-craven-ac": {
    summary:
      "Keighley & Craven AC is an Aire Valley club for road, fell, cross-country and track running, with junior athletics and a training base at Carlton Keighley.",
    biography: [
      "Keighley & Craven Athletics Club brings together two strands of local running history. Keighley Road Runners began in 1984 and Keighley Hill Runners followed in 1986; the clubs merged in 1998. Road racing and the Yorkshire fells remain equally important parts of its character, reflected in events such as the Haworth Hobble, Yorkshireman off-road races and Bronte Way Fell Race.",
      "The club meets at Carlton Keighley in Utley, offering junior athletics and adult groups from Ready to Run through to more demanding speed, hill and endurance sessions. Regrouping helps runners of different paces train together, and newcomers can try a first session before joining. Volunteers also support local charities and organise the club's races. Its history remembers Jimmy Ashworth's achievements in the predecessor Road Runners' colours, rather than presenting those performances as belonging to the later merged club.",
    ],
    founded_year: 1998,
    notable_members: [
      {
        name: "Jimmy Ashworth",
        connection: "Historical athlete of predecessor Keighley Road Runners",
        detail:
          "The club history records top-ten finishes at the London Marathon and Great North Run after he joined the Road Runners in the 1980s.",
      },
    ],
    corrections: {
      city: "Keighley",
      county: "West Yorkshire",
      website: "https://kcac.co.uk/",
      address: "Carlton Keighley, Green Head Road, Utley, Keighley, BD20 6EB",
      postcode: "BD20 6EB",
      address_kind: "training",
      location_precision: "postcode",
    },
    sources: [
      { title: "Club community, races and training base", url: "https://kcac.co.uk/" },
      { title: "Predecessor clubs and merger history", url: "https://kcac.co.uk/our-history/" },
      {
        title: "Senior groups and first-session guidance",
        url: "https://kcac.co.uk/senior-training/",
      },
      { title: "Club enquiry form", url: "https://kcac.co.uk/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "fitmums-and-friends": {
    summary:
      "Fitmums and Friends is a Yorkshire running and walking charity that began in Cottingham, with local groups, junior athletics and activities supporting community wellbeing.",
    biography: [
      "Fitmums and Friends started in Cottingham, East Yorkshire, in 2009 when Sam Barlow invited other parents to join a sociable run. Four mums came along to that first evening; the group soon welcomed people beyond its original circle and added Friends to its name. It became a registered charity in 2017 and received the King's Award for Voluntary Service in 2024.",
      "Today its local groups offer running and walking at different distances and paces, using a regrouping system called shepherding so faster participants loop back rather than leaving others behind. The wider programme includes junior athletics, cycling, family sessions and bereavement and sight-loss activities. You do not need to be a mum to join. Newcomers can register for trial sessions and choose a local group; activities and booking requirements vary by location, so the Beverley listing is only one part of the Yorkshire network.",
    ],
    founded_year: 2009,
    location_note:
      "A network of local Yorkshire groups, originating in Cottingham. East Riding Leisure Beverley is a listed local venue, not a single headquarters for every activity; use the session finder for the appropriate meeting point.",
    notable_members: [
      {
        name: "Sam Barlow",
        connection: "Founder",
        detail:
          "Awarded the British Empire Medal in 2015 and named BBC Sports Personality of the Year Unsung Hero in 2021 for her community work.",
      },
      {
        name: "Jo Pavey",
        connection: "Patron since 2019",
        detail:
          "The Olympian supports the charity as patron; this is not a claim of competitive club membership.",
      },
    ],
    corrections: {
      website: "https://fitmums.org.uk/",
      sports: ["Running", "Athletics", "Cycling"],
    },
    sources: [
      {
        title: "Origins, founder, patron and voluntary-service award",
        url: "https://fitmums.org.uk/about-us/about-us",
      },
      {
        title: "How groups support different abilities",
        url: "https://fitmums.org.uk/about-us/how",
      },
      {
        title: "Activities, age groups and joining questions",
        url: "https://fitmums.org.uk/about-us/faqs",
      },
      { title: "Trial sessions", url: "https://fitmums.org.uk/trial" },
      { title: "Enquiries and official social links", url: "https://fitmums.org.uk/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-queens-university-ac": {
    summary:
      "Queen's University Athletics Club in Belfast offers student track and field, cross-country and road running, with coached sessions and intervarsity competition.",
    biography: [
      "Queen's University Athletics Club has represented the Belfast university in running and athletics for more than a century. Its programme brings together track and field, cross-country and road running, with space for both competitive athletes and students who mainly want a social run. Coached track sessions use Mary Peters Track, while a longer social run meets at the university's Physical Education Centre.",
      "Members can represent Queen's at the Maynooth Road Relays, Irish university cross-country championships and indoor and outdoor athletics championships, with opportunities to enter BUCS competition too. Club social events sit alongside the training programme. The Students' Union club page provides the joining route, athletics email and official social accounts; prospective members should check those updates for current session times rather than using the Students' Union office as a training address.",
    ],
    location_note:
      "Track sessions use Mary Peters Track; the social run meets at the Physical Education Centre. The Students' Union's Elmwood Avenue address is an administrative contact, not the athletics training base.",
    corrections: { website: "https://home.q-su.org/clubssocieties/athletics/" },
    sources: [
      {
        title: "Queen's Students' Union athletics club, training and joining",
        url: "https://home.q-su.org/clubssocieties/athletics/",
      },
      {
        title: "Athletics Northern Ireland affiliated club contact",
        url: "https://athleticsni.org/Clubs/Find-A-Club",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ni-st-malachys-ac": {
    summary:
      "St Malachys AC is a Belfast athletics club with close historical ties to St Malachy's College and the development of middle-distance runner Michael McKillop.",
    biography: [
      "St Malachys AC grew out of the athletics community around St Malachy's College in Belfast. Paddy McKillop, who taught physical education at the college, founded the club to give runners opportunities to compete against other clubs across Ireland. His son Michael later described the friendships and support he found there as an important part of his development in middle-distance running.",
      "The club remains listed by Athletics Northern Ireland, which publishes a secretary's contact for enquiries. Its history includes Michael McKillop's progression to international para athletics, but that association does not establish a current training timetable or an open school-site session. Anyone interested in joining should ask the club directly about suitable groups, eligibility and meeting arrangements; a precise founding year and current venue have not been confirmed in the sources reviewed.",
    ],
    notable_members: [
      {
        name: "Michael McKillop",
        connection: "Historical club athlete",
        detail:
          "The international middle-distance runner recalls his development and lifelong friendships at St Malachy's AC in a 2024 Mary Peters Trust interview.",
      },
    ],
    sources: [
      {
        title: "Michael McKillop's account of the club, 1 July 2024",
        url: "https://marypeterstrust.org/michael-mckillop-running/",
      },
      {
        title: "Current affiliated-club secretary contact",
        url: "https://athleticsni.org/Clubs/Find-A-Club",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-carraig-na-bhfear-a-c": {
    summary:
      "Carraig na bhFear AC serves Carrignavar and surrounding County Cork communities, with juvenile and adult athletics and a long record of hosting cross-country championships.",
    biography: [
      "Carraig na bhFear Athletic Club was established at a community-centre meeting on 5 September 1980, renewing an earlier athletics tradition in this part of County Cork. Its juvenile section drew families from Carrignavar and neighbouring communities, and members took part in track and field, road racing and cross-country. Local farmers have played a particularly important role by making land available for races.",
      "Cross-country hosting is a distinctive part of the club's history: national championships came to the area in 1991, 1999 and 2006. Training uses Coláiste an Chroí Naofa in Carrignavar, with additional track sessions listed at MTU in Bishopstown. Prospective members can contact the secretary or use the Athletics Ireland club-registration page. The published club timetable is labelled spring 2025, so confirm the current day and group before travelling.",
    ],
    founded_year: 1980,
    location_note:
      "The local base is Coláiste an Chroí Naofa, Carrignavar. The club also lists MTU track sessions in Bishopstown; its spring-2025 timetable and county-directory times differ, so current times need confirmation.",
    corrections: { city: "Carrignavar", website: "https://www.carraignabhfearac.com/" },
    sources: [
      {
        title: "Club foundation and cross-country history",
        url: "https://www.carraignabhfearac.com/about/history",
      },
      {
        title: "Published training locations",
        url: "https://www.carraignabhfearac.com/about/training",
      },
      {
        title: "Cork Athletics club contact and social page",
        url: "https://www.corkathletics.org/clubs/114-carraig-na-bhfear-athletic-club.html",
      },
      {
        title: "Athletics Ireland club listing and registration",
        url: "https://membership.athleticsireland.ie/clubpage/Carraig-Na-Bhfear_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-carrick-aces-a-c": {
    summary:
      "Carrick Aces AC is a community athletics club in Carrickmacross, County Monaghan, with junior and adult sections and a training track at Convent Lands.",
    biography: [
      "Carrick Aces Athletic Club began in Carrickmacross in 1990, when 32 local parents came together to create athletics opportunities for their children. A senior section followed in 1991. Building a permanent home took longer: plans for a cinder track began in 2000, with construction following years of fundraising and planning work. Floodlights and toilets were added in 2014.",
      "The Convent Lands track remains the training location listed by Athletics Ireland. In its 2020 club feature, the governing body described a broad programme of junior athletics, adult road runs and Fit for Life sessions, with parents helping to keep activities running. The annual 5K brings the club into the wider community. New members should use the current registration page or contact the club to confirm their group; the historical feature's membership totals and weekly timetable are not treated as current figures.",
    ],
    founded_year: 1990,
    notable_members: [
      {
        name: "Rose Lambe",
        connection: "Athlete featured in the club's 2020 profile",
        detail:
          "Athletics Ireland's feature identifies her as a former Ireland representative and Women's Mini-Marathon winner.",
      },
      {
        name: "Yared Derese",
        connection: "Joined the club in late 2018",
        detail:
          "Featured by Athletics Ireland in January 2020 as one of the athletes raising the club's profile; this is a historical association, not confirmation of present membership.",
      },
    ],
    corrections: { city: "Carrickmacross" },
    sources: [
      {
        title: "Athletics Ireland club feature, 13 January 2020",
        url: "https://www.athleticsireland.ie/carrick-aces-a-c-achieving-together/",
      },
      {
        title: "Current training address, contact and registration",
        url: "https://membership.athleticsireland.ie/clubpage/Carrick_Aces_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-carrick-on-shannon-a-c": {
    summary:
      "Carrick-on-Shannon AC provides athletics in County Leitrim, with junior training organised through the town's Sports Complex and membership through Athletics Ireland.",
    biography: [
      "Carrick-on-Shannon Athletic Club serves young athletes and runners in County Leitrim, Ireland. Its current junior programme is organised through Carrick-on-Shannon Sports Complex, with younger groups working indoors and older athletes meeting there before outdoor sessions. Training groups take account of experience, ability and the events an athlete wants to pursue, rather than treating every child as a distance runner.",
      "The club's October 2026 update sets out both general junior sessions and an additional circuit and event session for older athletes preparing for regional and national competition. Parents and volunteers help with supervision, coaching and the practical work around each evening. Registration and payment must be completed before participation. The secretary is the contact for new-member questions and current arrangements; families should follow the latest club notice because the autumn timetable differs from the January programme.",
    ],
    location_note:
      "The October 2026 club notice identifies Carrick-on-Shannon Sports Complex as the junior meeting point. The directory's Glen Carrick address is not used as the exact training location here; the Sports Complex postcode has not been independently confirmed.",
    corrections: {
      city: "Carrick-on-Shannon",
      website: "https://carrickac.blogspot.com/",
      address: "Carrick-on-Shannon Sports Complex, Carrick-on-Shannon, Co. Leitrim",
      postcode: "",
      address_kind: "training",
      location_precision: "area-only",
    },
    sources: [
      {
        title: "Club training update dated 3 October 2026",
        url: "https://carrickac.blogspot.com/",
      },
      {
        title: "Athletics Ireland registration and contact",
        url: "https://membership.athleticsireland.ie/clubpage/Carrick-on-Shannon_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-carrick-on-suir-a-c": {
    summary:
      "Carrick-on-Suir AC offers athletics in County Tipperary, with juvenile track and field and a senior Road Runners section serving the town and surrounding area.",
    biography: [
      "Carrick-on-Suir Athletic Club combines an established juvenile athletics tradition with its senior Road Runners section in County Tipperary. The senior committee was formed in May 2006 after eleven runners met at the Carraig Hotel. That was a new chapter for adult road running and cross-country, not the founding date of the club's earlier junior activities.",
      "The Road Runners' history includes local race series, a Christmas GOAL Mile, beginner sessions and fundraising for hospitals and charities. Today the county athletics directory gives separate contacts for juvenile track and field and the Road Runners, helping families and adults reach the appropriate section. Athletics Ireland lists the Seán Kelly Sports Centre as the club's training location. Ask the relevant contact for the current programme rather than relying on the older history page's weekly timetable.",
    ],
    corrections: { city: "Carrick-on-Suir" },
    sources: [
      {
        title: "Road Runners section history",
        url: "https://www.carrickroadrunners.ie/about-us-topmenu-28/our-club-history",
      },
      {
        title: "Tipperary Athletics section contacts",
        url: "https://tipperaryathletics.com/clubs-contacts/",
      },
      {
        title: "Athletics Ireland venue and registration",
        url: "https://membership.athleticsireland.ie/clubpage/Carrick-on-Suir_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-carrigaline-a-c": {
    summary:
      "Carrigaline AC is a County Cork road-running club founded in 2012, offering coached groups and Couch to 5K programmes from the Men's Shed and Lions Club meeting point.",
    biography: [
      "Carrigaline Athletic Club, also known as Carrigaline Roadrunners, was formed in May 2012. Based in Carrigaline, County Cork, it brings together runners who want company, encouragement and a group suited to their level. Its published club runs meet at the Men's Shed and Lions Club, with different groups overseen by an Athletics Ireland coach.",
      "Regular Couch to 5K programmes provide a way in for beginners, while the wider club supports members working towards their own running goals. The website lists Tuesday and Thursday evening sessions; new runners should contact the club before attending to confirm the appropriate group. Membership information, updates and public enquiries are available through its ClubZap website, club email and official Facebook and Instagram pages.",
    ],
    founded_year: 2012,
    corrections: { city: "Carrigaline", website: "https://www.carrigalineac.ie/" },
    sources: [
      {
        title: "Club origins, meeting point and beginner programmes",
        url: "https://www.carrigalineac.ie/about",
      },
      {
        title: "Public email and official social accounts",
        url: "https://carrigalineac.ie/contact",
      },
      {
        title: "Athletics Ireland club listing",
        url: "https://membership.athleticsireland.ie/clubpage/Carrigaline_A.C.",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athletics-ireland-carrigtwohill-a-c": {
    summary:
      "Carrigtwohill AC is an adult running club in East Cork, welcoming different abilities and meeting at Carrigtwohill Community Centre on Main Street.",
    biography: [
      "Carrigtwohill Athletic Club is an adult running group in the East Cork town of Carrigtwohill, Ireland. Athletics Ireland describes a small club that welcomes runners of different abilities and lists the Community Centre on Main Street as its meeting point. It is a senior-only listing, rather than a junior athletics programme.",
      "The national and county directories both point runners to the Community Centre, although their published training days and start times differ. Newcomers should confirm arrangements with the club secretary or through the Facebook page linked by Cork Athletics before attending. Athletics Ireland provides the membership route. A founding date and notable alumni have not been established from the available primary pages, so the profile focuses on practical joining information.",
    ],
    location_note:
      "Meetings use Carrigtwohill Community Centre, T45 X3N1. Athletics Ireland lists Tuesday at 7pm; Cork Athletics lists Tuesday and Thursday at 7.15pm. Confirm the current session with the club.",
    corrections: { city: "Carrigtwohill", adult_only: true },
    sources: [
      {
        title: "Athletics Ireland senior-club description and registration",
        url: "https://membership.athleticsireland.ie/clubpage/Carrigtwohill_A.C.",
      },
      {
        title: "Cork Athletics contact, social page and meeting point",
        url: "https://www.corkathletics.org/clubs/115-carrigtohill-athletic-club.html",
      },
    ],
    reviewed_at: "2026-10-13",
  },
};
