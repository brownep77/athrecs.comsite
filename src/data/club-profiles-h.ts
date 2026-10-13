import type { ClubProfile } from "./club-profiles";

// Primary pages read on 13 October 2026 UTC. Club editorial associations only;
// no athlete accounts, results, verification or privacy settings are changed.
export const southernAndMultisportClubProfiles: Record<string, ClubProfile> = {
  "alton-runners": {
    summary:
      "Alton Runners is a Hampshire road and cross-country club with coached groups, junior membership and a long connection to the Alton 10 race.",
    biography: [
      "Alton Runners grew from a few Alton Round Table members jogging around Jubilee Field in 1981. The group adopted the name Alton Joggers at its first general meeting in March 1982, later becoming Alton Runners. Its yellow club colours have outlasted the name change. The Alton 10 began in a snowstorm in 1984, and the club's partnership with Alton Lions has helped turn local races into support for charitable causes.",
      "Based in Alton, Hampshire, the club welcomes runners from nearby villages as well as the town. Members compete in the Hampshire Road Race League and Southern Cross Country League, while others come for fitness and company. Tuesday and Thursday sessions use local venues including Jubilee Fields and Anstey Park. Membership includes junior and young-runner categories; prospective members can ask the membership team about a trial and which group to attend.",
    ],
    location_note:
      "Meeting points vary by session and season. Check the booking programme before travelling to Jubilee Fields, Anstey Park or the sports centre.",
    sources: [
      {
        title: "Founder’s account of Alton Joggers and Alton Runners",
        url: "https://www.altonrunners.co.uk/contents/387-history",
      },
      { title: "Current club programme", url: "https://www.altonrunners.co.uk/" },
      {
        title: "Membership categories and trials",
        url: "https://www.altonrunners.co.uk/contents/341-membership",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "andover-ac": {
    summary:
      "Andover Athletic Club offers junior and senior track and field, cross-country and road running from its Charlton base in Andover, Hampshire.",
    biography: [
      "Andover Athletic Club's story includes a 1950s club and a revival in the 1964–65 season after a short closure. Coaches built the renewed club around young athletes before it moved to Charlton in 1983. Early sessions there relied on a portable generator, well before the finished track and pavilion. The club's historical athletes include high jumper Rosalind Few, selected for the 1972 Munich Olympics.",
      "Today the Hampshire club offers running, jumps and throws to junior and senior members, with younger athletes learning several events before specialising. The clubhouse is at Charlton Sports and Leisure Centre, West Portway, Andover—not the Winchester correspondence address in the directory. Group times depend on the coach, so new athletes should contact the club before their first visit. Associate membership also gives supporters and non-competing family members a way to take part in club life.",
    ],
    notable_members: [
      {
        name: "Rosalind Few",
        connection: "Historical club athlete",
        detail:
          "The club history records the high jumper's selection for the 1972 Munich Olympics.",
      },
    ],
    corrections: {
      city: "Andover",
      address: "Charlton Sports and Leisure Centre, West Portway, Andover, SP10 3LF",
      postcode: "SP10 3LF",
      address_kind: "clubhouse",
      website: "https://www.andoverathletics.co.uk/",
    },
    sources: [
      {
        title: "Club history, athletes and Charlton clubhouse",
        url: "https://www.andoverathletics.co.uk/about",
      },
      { title: "Membership options", url: "https://www.andoverathletics.co.uk/membership" },
      { title: "Public club enquiries", url: "https://www.andoverathletics.co.uk/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "ashford-ac": {
    summary:
      "Ashford Athletic Club trains at the Julie Rose Stadium in Ashford, Kent, with track and field coaching, junior development and the Ashford 10K.",
    biography: [
      "Ashford Athletic Club was formed in March 1965 after two local teachers sought extra coaching for promising pupils. Its first session attracted 23 people. The club later campaigned for better facilities, and the Julie Rose Stadium opened in 1997; its eight-lane outdoor track was relaid in 2022. The stadium and the Ashford 10K are linked to international club athlete Julie Rose, whose memorial fund helped launch the track project after her death in 1985.",
      "The Kent club offers sprinting, distance events, jumps and throws, with indoor facilities as well as the outdoor track. Club nights are on Tuesdays and Thursdays. Younger members begin from school Year 5, but the website currently says its waiting list for Years 4–8 is closed: families should ask the membership team about availability rather than arrive expecting a place. General enquiries and membership have separate email addresses, and the volunteer-run mobile is checked periodically for texts.",
    ],
    founded_year: 1965,
    notable_members: [
      {
        name: "Julie Rose",
        connection: "Historical club athlete",
        detail:
          "International Ashford athlete commemorated by the stadium and the memorial fundraising that helped create it.",
      },
    ],
    corrections: { website: "https://www.ashfordac.org.uk/", address_kind: "training" },
    contact_note:
      "Email is the club's preferred first contact. The volunteer-run mobile is checked for texts a few days a week.",
    sources: [
      { title: "Club facilities and joining restrictions", url: "https://www.ashfordac.org.uk/" },
      { title: "Club origins", url: "https://www.ashfordac.org.uk/show/Profiles" },
      {
        title: "Julie Rose memorial and Ashford 10K history",
        url: "https://www.ashfordac.org.uk/show/Ashford-10k",
      },
      { title: "Membership and general enquiries", url: "https://www.ashfordac.org.uk/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "bexhill-runners-and-triathletes": {
    summary:
      "Bexhill Runners & Triathletes brings running and multisport training to adults and juniors in Bexhill-on-Sea, East Sussex.",
    biography: [
      "Bexhill Runners & Triathletes brings together two strands of sport in the East Sussex seaside town. Paul Holdaway and his father Lee established the running club in 2000; a triathlon section began as Team Lifestyle Tri in 2009. The organisations merged in November 2011 to form BRT, so the combined club's history should not be confused with the date of its running predecessor.",
      "The club welcomes people who want to race and those who simply enjoy training with others. There are sessions for adults and juniors from age eight, alongside a local race series that relies on members helping with organisation and marshalling. Newcomers can try three sessions before joining. Adult sessions require booking, and the contact form directs questions about adult training, junior running and kit to the appropriate volunteers.",
    ],
    founded_year: 2011,
    corrections: { address: "", postcode: "", location_precision: "area-only" },
    location_note:
      "Sessions use the seafront, Bexhill Rowing Club, St Richard's Catholic College and Battle Abbey School Pool, as well as variable running routes. Confirm the booking location; there is no single meeting point for every activity.",
    sources: [
      {
        title: "Running and triathlon merger history",
        url: "https://www.bexhillrunnerstriathletes.co.uk/our-club.html",
      },
      {
        title: "Trials, juniors and session booking",
        url: "https://www.bexhillrunnerstriathletes.co.uk/",
      },
      {
        title: "Club enquiry form",
        url: "https://www.bexhillrunnerstriathletes.co.uk/contact-us.html",
      },
      {
        title: "Session venues and booking requirements",
        url: "https://www.bexhillrunnerstriathletes.co.uk/sessions.html",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "bognor-regis-tone-zone-runners": {
    summary:
      "Bognor Regis Tone Zone Runners trains from Arun Leisure Centre in Felpham, West Sussex, with coached running, beginners' support and the Bognor Prom 10K.",
    biography: [
      "Bognor Regis Tone Zone Runners started in January 1997 when instructors and gym users at Arun Leisure Centre began training for the Bognor Prom 10K. The race remains part of the club's identity, alongside its blue and orange kit. From those gym-based beginnings, it has developed into a running club serving Felpham, Bognor Regis and the surrounding West Sussex area.",
      "Club runs still start from Arun Leisure Centre on Tuesday and Thursday evenings. Coaching combines intervals with runs at different paces and distances, and summer off-road outings make use of the surrounding countryside. Beginners have a Couch to 5K route into the club; people joining outside the usual intake can ask the head coach what support is available. Separate coaching, membership and general-enquiry addresses make it easier to reach the right person.",
    ],
    founded_year: 1997,
    corrections: {
      city: "Bognor Regis",
      website: "https://www.tonezonerunners.org/",
      address: "Arun Leisure Centre, Felpham Way, Bognor Regis, PO22 8ED",
      address_kind: "training",
    },
    sources: [
      { title: "Club origins and local base", url: "https://www.tonezonerunners.org/about" },
      { title: "Coached sessions and beginners", url: "https://www.tonezonerunners.org/training" },
      { title: "Venue and role contacts", url: "https://www.tonezonerunners.org/contact" },
    ],
    reviewed_at: "2026-10-13",
  },
  "canterbury-harriers": {
    summary:
      "Canterbury Harriers is a Kent running club with road and cross-country teams, coached evenings at Birleys Sports Pavilion and the Whitstable 10K.",
    biography: [
      "Canterbury Harriers began in 1993 and was reconstituted in 1997. Its runners compete on roads and across country in Kent, including the East Kent Road Relay Series and Kent Fitness League. The club also organises the Whitstable 10K and has a tradition of summer pub runs, awards evenings and trips to races further afield.",
      "The club meets at Birleys Sports Pavilion on St Stephen's Road in Canterbury. Tuesday and Thursday coaching ranges from hill work to longer runs, with occasional weekend outings on local trails. Members can use the training-booking system, while newcomers should use the club's enquiry form to discuss a suitable session. The pavilion is the published meeting point; it should not be confused with a general recreation-centre address.",
    ],
    founded_year: 1993,
    corrections: {
      website: "https://www.canterburyharriers.org/",
      address: "Birleys Sports Pavilion, St Stephen's Road, Canterbury",
      postcode: "",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club history, programme and meeting point",
        url: "https://www.canterburyharriers.org/about/about-us",
      },
      {
        title: "Training and coaches",
        url: "https://www.canterburyharriers.org/training/training-coaches",
      },
      { title: "Club enquiry form", url: "https://www.canterburyharriers.org/contact/contact-us" },
    ],
    reviewed_at: "2026-10-13",
  },
  "chichester-runners-and-ac": {
    summary:
      "Chichester Runners & AC offers road, trail, cross-country and track running in West Sussex, with junior athletics, Couch to 5K and social training groups.",
    biography: [
      "Chichester Runners & Athletics Club was founded in 1984 and now combines junior athletics with a broad adult running programme. Its West Sussex setting shapes much of that programme: summer trail runs, Sussex cross-country competition and training around Oaklands Park sit alongside track sessions. Couch to 5K helps new runners get started, while the club's social events give members reasons to meet away from racing.",
      "The adult timetable includes daytime and evening groups, from a gentle foundation session to more demanding endurance work. Chichester Rugby Club is a regular base, with other sessions at Chichester College and the Phil Baker track; members book through Spond. Adults can arrange a try-out through the contact form. The club currently asks families interested in junior membership to enquire in March 2027 for the summer intake and says it does not keep a waiting list.",
    ],
    founded_year: 1984,
    location_note:
      "Chichester Rugby Club is a regular meeting point, but the venue varies by group and season. Check Spond or ask the club before attending.",
    corrections: { address_kind: "training" },
    contact_note:
      "The August 2026 contact notice directs junior enquiries to March 2027 for the next summer intake; there is no junior waiting list.",
    sources: [
      { title: "Club overview and origins", url: "https://www.chichester-runners.org.uk/" },
      {
        title: "September 2026 training groups and locations",
        url: "https://www.chichester-runners.org.uk/training/",
      },
      {
        title: "Try-outs and junior intake notice",
        url: "https://www.chichester-runners.org.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "crawley-ac": {
    summary:
      "Crawley Athletic Club is based at K2 Athletics Arena in West Sussex, offering track and field, road running and cross-country from school Year 5 upwards.",
    biography: [
      "Crawley Athletic Club combines track and field with road and cross-country running at K2 Athletics Arena in Crawley, West Sussex. Its history also reaches into ultradistance running: Crawley Museum holds the Len Hurst Belt, presented to the club as the most successful team in the former London-to-Brighton race. On the field, long-serving athlete and volunteer Karen Shackel is among the club's notable javelin throwers.",
      "The current programme includes event-specific coaching and beginner groups from school Year 5. Club sessions are generally on Mondays and Wednesdays, although endurance groups also meet away from the track. Prospective athletes must arrange a trial enquiry before attending. Club membership and track-training tickets are separate purchases, and the club explicitly warns that buying a training ticket does not make someone a member.",
    ],
    notable_members: [
      {
        name: "Karen Shackel",
        connection: "Historical athlete and club volunteer",
        detail:
          "Formerly Karen Miller, she joined Crawley in 1976, became an English Schools javelin champion and later contributed as an official and organiser, as documented by Sussex Athletics in 2020.",
      },
    ],
    corrections: {
      website: "https://www.crawleyac.net/",
      address: "K2 Athletics Arena, Pease Pottage Hill, Crawley, RH11 9BQ",
      address_kind: "training",
      contact_url: "https://www.crawleyac.net/index.php/membership",
    },
    sources: [
      {
        title: "Training venue and advance trial requirement",
        url: "https://www.crawleyac.net/index.php/training",
      },
      {
        title: "Membership and training-ticket distinction",
        url: "https://www.crawleyac.net/index.php/membership",
      },
      {
        title: "Crawley Museum's Len Hurst Belt history",
        url: "https://crawleymuseums.org/the-len-hurst-belt/",
      },
      {
        title: "Sussex Athletics: Karen the Spear Holder",
        url: "https://www.sussexathletics.net/news/karen-the-spear-holder/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "eastbourne-rovers-ac": {
    summary:
      "Eastbourne Rovers Athletic Club offers junior, senior and masters athletics, road running and cross-country from Eastbourne Sports Park in East Sussex.",
    biography: [
      "Eastbourne Rovers traces its roots to a cycling club formed in 1894, with a harriers section following around 1896. Athletics and cycling eventually became separate clubs in 1971. For the athletics club, a major later step was the move to Eastbourne Sports Park's all-weather track in 2000. Its historical runners include 1950s international distance athlete Pat Ranger.",
      "Today the volunteer-led East Sussex club supports juniors from age nine, seniors and masters across sprints, distance running, jumps and throws. Tuesday and Thursday track sessions are complemented by road-running groups and cross-country competition. The club added a Couch to 5K programme and its own trackside cabin in 2022. Newcomers can arrange a trial through the enquiry form, choosing the subject that best matches their interest; road groups may meet away from the Sports Park.",
    ],
    notable_members: [
      {
        name: "Pat Ranger",
        connection: "Historical club athlete",
        detail:
          "International distance runner associated with Eastbourne Rovers in the 1950s, recorded in the club's own history.",
      },
    ],
    corrections: { address_kind: "training" },
    sources: [
      {
        title: "Rovers origins, separation and modern milestones",
        url: "https://eastbourneroversac.co.uk/about-us/history/",
      },
      { title: "Current groups and trial enquiries", url: "https://eastbourneroversac.co.uk/" },
      {
        title: "Training and competition programme",
        url: "https://eastbourneroversac.co.uk/about-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "fleet-and-crookham-ac": {
    summary:
      "Fleet & Crookham Athletic Club offers junior and adult athletics in Hampshire, with road, track and cross-country training and the Fleet Half Marathon.",
    biography: [
      "Fleet & Crookham Athletic Club was founded in 1960. Peter Driver, the 1954 Commonwealth six-mile champion, moved to Fleet and became club secretary, helping establish its place in local running. The memorial races held after his death developed into today's Fleet 10K and 5K, and the club added the Fleet Half Marathon in 1982. Volunteers remain central to those races and to the club's weekly programme.",
      "In 2025 the Hampshire club moved to a new home at Crookham Park, supported by Church Crookham Parish Council. Training includes road, trails, track and field events, with sessions also using the Garrison Track. Junior athletes aged eight to seventeen join through a waiting list and scheduled intakes rather than an unrestricted drop-in. Adults, coaches and volunteers can use the club's online membership and enquiry routes to find their place.",
    ],
    founded_year: 1960,
    notable_members: [
      {
        name: "Peter Driver",
        connection: "Former club secretary",
        detail:
          "The 1954 Commonwealth six-mile champion helped develop the club; memorial races in his name became the Fleet 10K and 5K.",
      },
    ],
    corrections: { website: "https://www.fleetandcrookhamac.club/", address_kind: "training" },
    location_note:
      "The Crookham Park base uses Church Crookham Community Centre on Boyce Road. Some sessions take place at the Garrison Track; check the relevant group timetable.",
    sources: [
      {
        title: "Club history and 2025 relocation",
        url: "https://www.fleetandcrookhamac.club/about",
      },
      {
        title: "Junior waiting list and intakes",
        url: "https://www.fleetandcrookhamac.club/juniors",
      },
      {
        title: "Community-centre base and enquiries",
        url: "https://www.fleetandcrookhamac.club/contact-us",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "gosport-road-runners": {
    summary:
      "Gosport Road Runners is a Hampshire running club based at Gosport & Fareham Rugby Club, with beginners' courses, coached groups and social runs.",
    biography: [
      "Gosport Road Runners has been part of the Hampshire running community since 1983. Club nights begin at Gosport & Fareham Rugby Club, with runners choosing between different distances, intervals and routes. Its loop-back sessions let quicker runners cover extra ground while keeping the group together, and monthly time trials offer a way to measure progress without travelling to a race.",
      "The programme reaches from Couch to 5K to marathon and longer-distance running. Summer outings explore countryside beyond Gosport, while headtorch runs and social events keep members active through the darker months. Newcomers can try a few sessions before joining, and runners aged fourteen to seventeen may attend with a responsible adult. The membership secretary and general-enquiry address provide straightforward routes for arranging a first visit.",
    ],
    founded_year: 1983,
    corrections: { address_kind: "training" },
    sources: [
      {
        title: "Club history and group-running format",
        url: "https://gosportroadrunners.org.uk/the-club/",
      },
      { title: "Beginners, younger runners and trials", url: "https://gosportroadrunners.org.uk/" },
      { title: "Training and time trials", url: "https://gosportroadrunners.org.uk/training/" },
      { title: "Rugby-club base and enquiries", url: "https://gosportroadrunners.org.uk/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "maidstone-harriers-run-and-tri-club": {
    summary:
      "Maidstone Harriers is an adult running and triathlon club in Kent, with coached running, swimming and cycling and a base at Maidstone Hockey Club.",
    biography: [
      "Maidstone Harriers began as a small running group in 1983 and has grown into a running and triathlon club serving Maidstone, Kent. Its volunteers organise the Maidstone 10K, half marathon and Turkey Run, alongside club teams in local road and cross-country competition. Social runs, fundraising and parkrun outings give members other ways to get involved.",
      "Training is spread across several venues rather than one all-purpose clubhouse. Club runs leave Maidstone Hockey Club on Armstrong Road, track sessions use Sutton Valence, swimming takes place at Mote Park Leisure Centre and indoor cycling uses Lockmeadow Health Club. Membership is for adults aged eighteen and over. The contact form has a dedicated try-out option, so prospective runners and triathletes can ask which session best suits their experience before committing.",
    ],
    founded_year: 1983,
    corrections: {
      address: "Maidstone Hockey Club, Armstrong Road, Maidstone, ME15 6AZ",
      address_kind: "training",
      sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    location_note:
      "The hockey club is the club-run meeting point. Track, swimming and indoor-cycling sessions use separate venues around Maidstone and Sutton Valence.",
    sources: [
      { title: "Club story and local events", url: "https://maidstoneharriers.co.uk/our-story/" },
      {
        title: "Training venues and disciplines",
        url: "https://maidstoneharriers.co.uk/training-coaching/",
      },
      {
        title: "Adult membership and try-out enquiries",
        url: "https://maidstoneharriers.co.uk/contact-us/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-aberdare-valley-aac": {
    summary:
      "Aberdare Valley Amateur Athletics Club offers junior athletics, senior training and beginner running from the Ron Jones Stadium in Aberdare, South Wales.",
    biography: [
      "Aberdare Valley Amateur Athletics Club gives runners and track-and-field athletes a local base at the Ron Jones Stadium in Aberdare, Rhondda Cynon Taf. The South Wales club has junior and senior groups, alongside a beginner and social-running programme. Its black and amber colours appear in road races, cross-country and track-and-field competition.",
      "Juniors can start from age eight, learning running and field events with qualified coaches before progressing into competition. Senior sessions develop speed and endurance, while the social group offers a less competitive introduction. The club website explains the groups and membership process, and Welsh Athletics lists current club and welfare contacts. Because the two sources show slightly different weekly schedules, prospective members should confirm the next session directly instead of relying on an old timetable or fee.",
    ],
    contact_note:
      "Ask the club to confirm current group times and fees; the club website and governing-body timetable do not list precisely the same sessions.",
    sources: [
      { title: "Club overview", url: "https://aberdarevalleyaac.wordpress.com/" },
      {
        title: "Junior groups at the Ron Jones Stadium",
        url: "https://aberdarevalleyaac.wordpress.com/juniors/",
      },
      {
        title: "Beginner and social group",
        url: "https://aberdarevalleyaac.wordpress.com/beginners-social-group/",
      },
      { title: "Senior coaching", url: "https://aberdarevalleyaac.wordpress.com/seniors/" },
      {
        title: "Welsh Athletics club and venue directory",
        url: "https://www.welshathletics.org/en/club/view/aberdare-valley-aac",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-amman-valley-harriers": {
    summary:
      "Amman Valley Harriers, or Clwb Rhedeg Dyffryn Aman, is an Ammanford running club with junior athletics and senior road, trail and interval sessions in West Wales.",
    biography: [
      "Amman Valley Harriers was established in August 1983 and is based in Ammanford, Carmarthenshire. Also known as Clwb Rhedeg Dyffryn Aman, it has senior and masters runners as well as a junior section. Its programme makes use of the area's hills, town routes and Dinefwr Park, with intervals at local tracks providing a different kind of challenge.",
      "Senior meeting points change with the session and season: they include Dinefwr Bowls Centre, Amman Valley Leisure Centre and Tregib. Members book through Spond, and newcomers are asked to contact the secretary before a trial so someone can welcome them. Juniors begin from age seven, with an accompanying adult required at that age, and use outdoor tracks or Tregib's indoor facilities in winter. The club therefore has several training locations, not one combined rugby-and-bowls-club address.",
    ],
    founded_year: 1983,
    corrections: { address: "", postcode: "", location_precision: "area-only" },
    location_note:
      "Sessions use different venues in Ammanford and the Llandeilo area. Dinefwr Bowls Centre, Amman Valley Leisure Centre, Tregib and town or park meeting points are not interchangeable; confirm the Spond booking location.",
    sources: [
      {
        title: "Club identity and volunteers",
        url: "https://ammanvalleyharriers.wordpress.com/about/",
      },
      {
        title: "Origins, senior sessions and Spond",
        url: "https://ammanvalleyharriers.wordpress.com/seniors/",
      },
      {
        title: "Junior ages and seasonal venues",
        url: "https://ammanvalleyharriers.wordpress.com/juniors/",
      },
      {
        title: "Meeting points and secretary contact",
        url: "https://ammanvalleyharriers.wordpress.com/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "welsh-athletics-colwyn-bay-ac": {
    summary:
      "Colwyn Bay Athletic Club offers track and field, cross-country and road running in North Wales, with development groups and specialist event coaching.",
    biography: [
      "Colwyn Bay Athletic Club grew in the early 1970s through the work of Arthur Bebbington and Eileen Haskins MBE. Bebbington developed distance running and much of the club's organisation, while Haskins coached sprinting. Their work helped turn a small group recruited through local schools into an established North Wales club. Approval for an all-weather track in 1989 marked an important step beyond the original cinder surface.",
      "The club now offers track and field, cross-country and road running, with development groups from school Year 3 and specialist sprint and middle-distance coaching. Sessions normally run on Mondays and Wednesdays, including during school holidays apart from bank holidays. The website currently operates a waiting list: contact the club before attending. Two trial sessions are available once arranged, after which membership is handled through Nifty Entries and training charges are paid separately.",
    ],
    notable_members: [
      {
        name: "Arthur Bebbington",
        connection: "Founding organiser and coach",
        detail:
          "Built the distance-running programme and helped secure the all-weather track, according to the club's history.",
      },
      {
        name: "Eileen Haskins MBE",
        connection: "Founding coach",
        detail: "Developed the sprinting side of the club during its early-1970s beginnings.",
      },
    ],
    contact_note:
      "A waiting list is in operation. Arrange a place with the club before using its two-session trial.",
    sources: [
      {
        title: "Club founders and track history",
        url: "https://www.colwynbayathletics.org.uk/about-us/our-history.php",
      },
      {
        title: "Membership and training arrangements",
        url: "https://www.colwynbayathletics.org.uk/athletes/membership-and-training.php",
      },
      { title: "Current waiting-list notice", url: "https://www.colwynbayathletics.org.uk/" },
      { title: "Club contact form", url: "https://www.colwynbayathletics.org.uk/contact-us/" },
      {
        title: "Welsh Athletics public club contacts",
        url: "https://www.welshathletics.org/en/club/view/colwyn-bay-ac",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "athlone-triathlon-club": {
    summary:
      "Athlone Triathlon Club brings swimming, cycling and running together in Ireland's Midlands, with a junior section and the beginner-focused I TRI’d event.",
    biography: [
      "Athlone Triathlon Club is a Midlands swim, bike and run community with links across Athlone and nearby Ballinasloe. Its I TRI’d event gives newcomers an introduction to triathlon; the club reported another edition in May 2026, supported by its own volunteers. Members also take part in the Midlands Aquathon Series with neighbouring clubs, making shorter swim-and-run events part of the local season.",
      "The club has a junior section as well as adult training. Its published programme describes track running, group cycling, winter indoor-bike sessions and pool and open-water swimming, but that timetable is labelled 2022–23. It is useful background, not a current appointment: ask the club for this season's venues, times and junior availability. The working website uses the www address, and its contact page provides a club email and the official Facebook page for up-to-date enquiries.",
    ],
    corrections: { city: "Athlone", website: "https://www.athlonetriathlonclub.com/" },
    location_note:
      "Training has used venues in Athlone and Ballinasloe, with seasonal open-water sessions. The published 2022–23 timetable is dated; no single exact training address is asserted here.",
    sources: [
      { title: "Club news and I TRI’d 2026", url: "https://www.athlonetriathlonclub.com/" },
      {
        title: "Published training programme, labelled 2022–23",
        url: "https://www.athlonetriathlonclub.com/p/training-program.html",
      },
      { title: "Junior section", url: "https://www.athlonetriathlonclub.com/p/junior-club.html" },
      {
        title: "Current enquiry routes",
        url: "https://www.athlonetriathlonclub.com/p/contact-us.html",
      },
    ],
    reviewed_at: "2026-10-13",
  },
  "carlow-tc": {
    summary:
      "Carlow Triathlon Club offers swimming, cycling and running from Carlow town, with seasonal pool and River Barrow training and support for first-time triathletes.",
    biography: [
      "Carlow Triathlon Club was established in December 2018 by a small group of local athletes. Based in Carlow town, Ireland, it supports members from their first triathlon through to longer-distance events. The River Barrow at Bagenalstown is one of its open-water training locations, and club triathlons give newer members a chance to practise putting the three sports together.",
      "Training combines coached, group and self-paced swimming, cycling and running. Pool sessions replace the summer open-water programme in winter, with timetable changes shared through Spond and club communications. The club reports achieving Bronze status in Triathlon Ireland's Evolve standards programme. Its public email is the best starting point for current joining information, as some website copy still refers to the 2025 membership season; no old fee or intake date is treated here as current.",
    ],
    founded_year: 2018,
    corrections: { city: "Carlow", website: "http://carlowtriathlonclub.ie/" },
    location_note:
      "Carlow town is the club's base. Bagenalstown on the River Barrow is a seasonal swimming location, not a correspondence address or an all-year meeting point.",
    sources: [
      { title: "Club origins and programme", url: "http://carlowtriathlonclub.ie/?page_id=698" },
      {
        title: "Seasonal training and Spond updates",
        url: "http://carlowtriathlonclub.ie/?page_id=65",
      },
      { title: "Carlow base and Evolve status", url: "http://carlowtriathlonclub.ie/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "cobh-triathlon-club": {
    summary:
      "Cobh Triathlon Club is a volunteer-run swim, bike and run club in County Cork, with a junior section and the Jailbreak triathlon's Spike Island swim.",
    biography: [
      "Cobh Triathlon Club began in 2011 with a small group of aspiring triathletes in the County Cork harbour town. A juvenile section followed in 2023. The club is closely associated with Jailbreak, a standard-distance triathlon whose swim starts at Spike Island, but its training also welcomes members who prefer to focus on just one or two of the sports.",
      "Pool and open-water swimming, group cycles and track running sit alongside practical sessions on transitions, bike handling and maintenance. Groups are organised by ability, with training updates shared through club communications. Membership is arranged through Triathlon Ireland by selecting Cobh TC. Anyone wishing to train must be a current member unless the committee agrees otherwise in advance, so prospective members should use the public club email rather than assume a drop-in session is available.",
    ],
    founded_year: 2011,
    corrections: { city: "Cobh", website: "https://cobhtri.com/" },
    sources: [
      { title: "Club history, juniors and Jailbreak", url: "https://cobhtri.com/about/" },
      {
        title: "Training and membership requirements",
        url: "https://cobhtri.com/training-information/",
      },
      { title: "Club enquiries", url: "https://cobhtri.com/contact/" },
    ],
    reviewed_at: "2026-10-13",
  },
  "drogheda-triathlon-club": {
    summary:
      "Drogheda Triathlon Club offers adult swimming, cycling and running in County Louth, with coached sessions, group rides and a route into first-time triathlon.",
    biography: [
      "Drogheda Triathlon Club brings together adult swimmers, cyclists and runners from Drogheda and the surrounding County Louth area. A volunteer committee supports coaching, membership and inclusion, and members can train across all three disciplines or concentrate on the activities they enjoy most. The club also offers a New-to-Tri programme, although its published information-night copy needs an updated date before a new intake can be assumed.",
      "The published summer programme uses Lourdes Stadium for running, Aura Leisure Centre for pool swimming and Port Oriel at Clogherhead for open water, with cycling sessions around the wider area. These are seasonal arrangements, so ask for the current timetable. Membership is for people aged eighteen and over; the club does not currently offer a junior section. Prospective members can contact the membership team to arrange trial sessions and choose the appropriate Triathlon Ireland membership.",
    ],
    corrections: { city: "Drogheda", website: "https://www.droghedatri.ie/", adult_only: true },
    location_note:
      "The club uses several venues in Drogheda and County Louth. Port Oriel is a seasonal open-water location; confirm current session arrangements with the club.",
    sources: [
      { title: "Club volunteers", url: "https://www.droghedatri.ie/about-1" },
      { title: "Adult membership and trials", url: "https://www.droghedatri.ie/membership" },
      { title: "Summer training venues", url: "https://www.droghedatri.ie/training" },
      {
        title: "New-to-Tri programme, with older intake copy",
        url: "https://www.droghedatri.ie/new-to-tri",
      },
      { title: "Club contact form and email", url: "https://www.droghedatri.ie/contact-us" },
    ],
    reviewed_at: "2026-10-13",
  },
  "lough-key-triathlon-club": {
    summary:
      "Lough Key Triathlon Club is a north-west Ireland multisport club associated with Boyle's Lough Key race and beginner training in Carrick-on-Shannon.",
    biography: [
      "Lough Key Triathlon Club connects the Roscommon and Leitrim area through swimming, cycling and running. Lough Key Forest Park at Boyle is the setting for its triathlon, including a shorter-swim option listed in Triathlon Ireland's 2026 beginner-race guide. That event venue is distinct from the places used for weekly training.",
      "The club's March 2026 New-to-Tri programme launched in Carrick-on-Shannon and included coached swimming at Aura, with running and cycling locations shared on registration. This provides a useful example of its work with beginners, not a promise that the same course is still open. For the next intake or current club sessions, use the published Lough Key email or official Facebook page. No precise founding date or permanent clubhouse address has been established from the available primary sources.",
    ],
    location_note:
      "Lough Key Forest Park, Boyle, is the race venue; the March 2026 beginner programme used Aura in Carrick-on-Shannon. Confirm current training meeting points directly.",
    sources: [
      {
        title: "Triathlon Ireland: Lough Key beginner programme",
        url: "https://www.triathlonireland.com/news/new2tri-upcoming-programmes/",
      },
      {
        title: "2026 beginner triathlon guide and official club link",
        url: "https://www.triathlonireland.com/events/best-beginner-triathlons/",
      },
    ],
    reviewed_at: "2026-10-13",
  },
};
