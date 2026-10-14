import type { ClubProfile } from "./club-profiles";

// Primary club, county and governing-body sources read on 14 October 2026 UTC.
// Historical member associations are editorial, not athlete-account verification.
export const yorkshireWelshAndIrishClubProfiles: Record<string, ClubProfile> = {
  "bingley-harriers-and-ac": {
    summary:
      "Bingley Harriers & AC is a West Yorkshire athletics club with a long cross-country and fell-running history and opportunities for juniors and adults.",
    biography: [
      "Bingley Harriers began with a meeting at the Old Queen's Head on Bingley's Main Street in March 1893. Twenty-two members took part in its first cross-country season. A century later, the West Yorkshire club was enjoying a remarkable spell: it won the English National cross-country team title in 1991 and again in its centenary year, 1993. Richard Nerurkar's individual National titles and Ian Holmes's emergence in fell running belong to that chapter of the club's history.",
      "The club in Bingley, England, welcomes a much wider range of athletes than those results alone might suggest. Its public website describes an active junior section and opportunities for people of different ages and abilities, across athletics and the fells. Current news and training information are directed to the club's TeamApp pages; the separate archive is useful for history, not for arranging today's session. New members can email the membership secretary to find the appropriate group and confirm its meeting place.",
    ],
    founded_year: 1893,
    notable_members: [
      {
        name: "Richard Nerurkar",
        connection: "Historical club athlete",
        detail:
          "The club history records his individual English National cross-country titles in 1990, 1991 and 1993.",
      },
      {
        name: "Ian Holmes",
        connection: "Historical club fell runner",
        detail:
          "Bingley's history records his Northern Counties fell title and selection for the senior World Cup in 1992.",
      },
    ],
    corrections: { website: "https://www.bingleyharriers.co.uk/" },
    location_note:
      "The Wagon Lane address is a governing-body directory listing. Confirm your group's current meeting point through the club; archive venues are not a current timetable.",
    sources: [
      {
        title: "Club introduction and current TeamApp route",
        url: "https://www.bingleyharriers.co.uk/",
      },
      {
        title: "Bingley Harriers historical account (PDF)",
        url: "https://bingleyharriers.org.uk/wp-content/uploads/2012/09/History.pdf",
      },
      {
        title: "Club and membership enquiries",
        url: "https://www.bingleyharriers.co.uk/contacts/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "city-of-hull-ac": {
    summary:
      "City of Hull AC brings together road and cross-country runners in Hull, with group training, the Ferriby 10 and the club's Champagne League.",
    biography: [
      "City of Hull AC was formed in 1970 when Hull Harriers and Hull Achilles joined forces. Its roots reach further back: the club history traces Hull Harriers' first cross-country run to North Ferriby in November 1882. English international 800-metre runners Bob and Pam Piercy were among the athletes who became members at the merger. The Ferriby 10, Champagne League and Wolds Way Relay also feature prominently in the club's account of running in Hull and East Yorkshire, England.",
      "Today's programme offers road and cross-country runners several ways to train together. Sessions use places including Haltemprice Leisure Centre, Costello Stadium, the Humber Bridge and Welton, with off-road running changing through the seasons. Runners can try a couple of sessions before joining. The membership secretary is the best starting point for choosing a suitable group; the committee also publishes a shared enquiry address. Costello is a training venue, not the meeting point for every club run.",
    ],
    founded_year: 1970,
    notable_members: [
      {
        name: "Bob Piercy",
        connection: "Member at the 1970 merger",
        detail:
          "The club history identifies him as an English international 800-metre runner who joined the merged club.",
      },
      {
        name: "Pam Piercy",
        connection: "Member at the 1970 merger",
        detail:
          "The club history identifies her as an English international 800-metre runner who joined the merged club.",
      },
    ],
    corrections: { address_kind: "training" },
    location_note:
      "Costello Stadium is one of several training venues. Other groups meet at Haltemprice, the Humber Bridge or seasonal off-road locations; check the selected session.",
    sources: [
      {
        title: "Club history and predecessor clubs",
        url: "https://www.cityofhullac.co.uk/club-history",
      },
      {
        title: "Training groups and introductory runs",
        url: "https://www.cityofhullac.co.uk/training",
      },
      {
        title: "Committee and membership contacts",
        url: "https://www.cityofhullac.co.uk/contact-us",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "cleethorpes-ac": {
    summary:
      "Cleethorpes AC serves Cleethorpes and Grimsby in North East Lincolnshire, offering junior and adult athletics, road running and cross-country.",
    biography: [
      "Cleethorpes AC was founded in 1975 and serves runners and athletes in Cleethorpes and Grimsby, North East Lincolnshire, England. Its programme spans track and field, road running, cross-country and fell running. The club welcomes beginners and recreational joggers as well as competitors, with activities for children from seven and an explicit welcome for disabled participants. Local races include its New Year's Day 10K, Croxby events and winter road series.",
      "Track training takes place at King George V Stadium on Weelsby Road in Grimsby. Road runners also use Cleethorpes Leisure Centre on Kingsway, so the right meeting point depends on the group rather than simply the club name. Prospective members should use the joining page or shared enquiry email to discuss age, experience and the discipline they want to try. The published membership page distinguishes the club's different training options; check it for the current arrangements before attending.",
    ],
    founded_year: 1975,
    corrections: { address_kind: "training", website: "https://www.cleethorpesac.co.uk/" },
    location_note:
      "King George V Stadium is the Grimsby track base. Road-running groups also meet at Cleethorpes Leisure Centre, Kingsway, Cleethorpes, DN35 0BY.",
    sources: [
      {
        title: "Club origins, disciplines and local events",
        url: "https://www.cleethorpesac.co.uk/",
      },
      {
        title: "Training venues and club groups",
        url: "https://www.cleethorpesac.co.uk/our-club/",
      },
      {
        title: "Membership and public enquiry email",
        url: "https://www.cleethorpesac.co.uk/join/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "doncaster-athletic-club": {
    summary:
      "Doncaster Athletic Club offers junior and adult track and field, road running and cross-country from its Stadium Way base in South Yorkshire.",
    biography: [
      "Doncaster Athletic Club is a family athletics club based at Stadium Way in Doncaster, South Yorkshire, England. It caters for children from five through to adults, with track and field, road running and cross-country alongside team competition. An important step in the modern club's development came in 2012, when it secured a 25-year lease on the track. Its account describes the change from limited rented sessions to access throughout the week.",
      "New members join through the club's published membership process, which explains England Athletics registration and the athlete's unique reference number. Young athletes have team opportunities through the Youth Development League, while the wider club also competes in the Northern league structure. Anyone unsure about a first session should contact the shared club email with their age and preferred events. The track address is a sporting venue; it should not be confused with a representative's correspondence address or treated as a promise that every group trains daily.",
    ],
    corrections: {
      website: "https://www.doncasterathleticclub.com/",
      address: "Doncaster Athletic Club, Stadium Way, Doncaster, DN4 5JB",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club activities and 2012 track lease",
        url: "https://www.doncasterathleticclub.com/dac-club-info/",
      },
      {
        title: "New-member information",
        url: "https://www.doncasterathleticclub.com/new-member-information/",
      },
      {
        title: "Stadium address and club enquiries",
        url: "https://www.doncasterathleticclub.com/dac-contact-us/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "doncaster-triathlon-club": {
    summary:
      "Doncaster Triathlon Club provides coached swimming, cycling and running for adults and juniors at several venues around Doncaster, South Yorkshire.",
    biography: [
      "Doncaster Triathlon Club was established in 2014 to bring swimmers, cyclists and runners together in Doncaster, South Yorkshire, England. It describes a supportive club for different ages and abilities, with British Triathlon-qualified coaches and activators helping members prepare for multisport events. Its programme includes junior and family activity as well as adult sessions, so joining does not depend on already being an experienced triathlete.",
      "Training is spread across the town: swimming uses Armthorpe and Rossington, running includes the Doncaster Athletic Club track, and cycling sessions use the Doncaster Dome circuit during the published outdoor season. Strength and mobility sessions add another option. The club requires sessions to be booked through ClubSpark; newcomers should arrange a trial through the club rather than turn up without booking. Its shared enquiry email and contact form can help identify an appropriate session and confirm the venue, equipment and any age requirements.",
    ],
    founded_year: 2014,
    corrections: {
      website: "https://doncastertriathlonclub.co.uk/",
      address: "",
      postcode: "",
      address_kind: "directory",
      location_precision: "area-only",
      sports: ["Running", "Athletics", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"],
    },
    location_note:
      "Training uses several Doncaster venues, including Armthorpe and Rossington pools, the athletics track and seasonal cycling at the Dome. The former Greenleafe Avenue directory address is not confirmed as a training venue.",
    sources: [
      {
        title: "Club origins and coaching",
        url: "https://doncastertriathlonclub.co.uk/about/about-the-club",
      },
      {
        title: "Sessions, venues and required bookings",
        url: "https://doncastertriathlonclub.co.uk/training",
      },
      { title: "Club enquiry form and email", url: "https://doncastertriathlonclub.co.uk/contact" },
    ],
    reviewed_at: "2026-10-14",
  },
  "east-hull-harriers-and-ac": {
    summary:
      "East Hull Harriers & AC is a Hull running and athletics club founded in 1893, with its clubhouse on Saltshouse Road in East Yorkshire.",
    biography: [
      "East Hull Harriers & AC began in 1893 as Holderness Road Presbyterian Harriers. From those church-linked beginnings, it developed into a long-established part of running in Hull, East Yorkshire, England. The club's own history recalls involvement in the Humber Bridge Marathon and endurance events beyond the marathon, alongside its broader running and athletics activity. Those are historical associations, rather than a claim that the same events remain on today's calendar.",
      "The club has a clubhouse on Saltshouse Road and welcomes enquiries from runners interested in its club nights and track activity. Newcomers can use the website's contact form or membership email to ask which session suits their experience and goals. Road and cross-country running sit within the club's wider athletics programme, with members contributing through coaching, team organisation and committee roles. Confirm the current meeting time and venue directly: the clubhouse is a useful club base, but not evidence that every session starts there.",
    ],
    founded_year: 1893,
    corrections: {
      website: "https://www.easthullharriers.co.uk/",
      address: "East Hull Harriers clubhouse, Saltshouse Road, Hull, HU8 9HF",
      address_kind: "clubhouse",
    },
    sources: [
      { title: "Club history and committee", url: "https://www.easthullharriers.co.uk/about-1" },
      {
        title: "Clubhouse, membership email and contact form",
        url: "https://www.easthullharriers.co.uk/contact-3",
      },
      {
        title: "Club website and official social link",
        url: "https://www.easthullharriers.co.uk/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "halifax-harriers-and-ac": {
    summary:
      "Halifax Harriers & AC trains at Spring Hall in Halifax, with junior and adult track athletics, road, cross-country, fell and trail running.",
    biography: [
      "Halifax Harriers & AC dates from 1884 and is based at Spring Hall Athletics Track on Huddersfield Road in Halifax, West Yorkshire, England. Track and field, road running, cross-country and the local fells all have a place in club life. Its events include the Calderdale Way Relay, Ogden Midsummer Madness and the Giant's Tooth fell race. The club also celebrates the development of middle-distance runner Max Burgin, whose British under-20 800-metre record is highlighted on its homepage.",
      "Prospective members should contact the club before attending: the published junior information includes waiting lists, and availability differs between track and fell groups. The membership secretary can explain the current position. Some members also take part in triathlon, duathlon, swim-run and cycling sportives through club group chats. The club expressly says it is not affiliated to a triathlon or cycling association, so those activities should not be mistaken for a separately accredited multisport programme. Spring Hall remains the main athletics base.",
    ],
    founded_year: 1884,
    notable_members: [
      {
        name: "Max Burgin",
        connection: "Athlete highlighted by the club",
        detail:
          "The club homepage celebrates his British under-20 800-metre record; this is a club association, not a claim about the current record list.",
      },
    ],
    corrections: { website: "https://halifaxharriers.co.uk/", address_kind: "training" },
    contact_note:
      "Ask the membership secretary about current junior places. Track waiting lists and fell-group availability are not interchangeable.",
    sources: [
      {
        title: "Club origins, junior availability and Max Burgin",
        url: "https://halifaxharriers.co.uk/",
      },
      {
        title: "Spring Hall address and role contacts",
        url: "https://halifaxharriers.co.uk/about-us/contact/",
      },
      {
        title: "Member multisport activity and affiliation distinction",
        url: "https://halifaxharriers.co.uk/disciplines/triathlon/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "holmfirth-harriers-ac": {
    summary:
      "Holmfirth Harriers AC is based at Neiley Pavilion in Honley, offering athletics, road, fell and cross-country running and triathlon in West Yorkshire.",
    biography: [
      "Holmfirth Harriers AC was founded in 1907 and serves the Holme Valley in West Yorkshire, England. Its home is Neiley Pavilion in Honley, near Holmfirth. The club history describes the growth of junior activity during the 1980s, improvements to its changing facilities and a later lottery-supported rebuild. A triathlon section developed in the early 2000s, adding to the established track and field, road, fell and cross-country programme.",
      "The club welcomes children from eight and offers an induction before new members begin training. Prospective athletes can arrange three taster sessions, while adults new to running can ask about the Zero to Hero route. Tuesday and Thursday club nights use Neiley as a base, with the appropriate group depending on age, experience and discipline. Contact the club before arriving so that an induction and suitable session can be arranged.",
    ],
    founded_year: 1907,
    corrections: {
      city: "Holmfirth",
      website: "https://www.holmfirthharriers.com/",
      address: "Neiley Pavilion, New Mill Road, Honley, Holmfirth, HD9 6QE",
      postcode: "HD9 6QE",
      address_kind: "clubhouse",
      sports: ["Running", "Athletics", "Triathlon"],
    },
    sources: [
      { title: "Club history and disciplines", url: "https://www.holmfirthharriers.com/about/" },
      {
        title: "Induction, age groups and tasters",
        url: "https://www.holmfirthharriers.com/new-members/",
      },
      {
        title: "Neiley Pavilion directions and postcode",
        url: "https://www.holmfirthharriers.com/how-to-find-us/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "kimberworth-striders": {
    summary:
      "Kimberworth Striders is a Rotherham running club based at the Droppingwell pub, with road, off-road and hill training and a busy local race programme.",
    biography: [
      "Kimberworth Striders was founded in 1986 in the Kimberworth area of Rotherham, South Yorkshire, England. Its programme is built around running: winter road routes give way to more off-road outings in summer, with tempo work, hills and speed sessions alongside steady runs. A graded club championship has operated since 1993, giving members a competition that is not simply a contest between the fastest runners.",
      "The club meets at the Droppingwell pub on Upper Wortley Road for its main Tuesday and Thursday sessions. Its local event programme includes names familiar to South Yorkshire runners, such as the Kimmy Kanter, Stan Bagshaw Toffee Run and Santa Special. The website also provides a Walk to Run route and membership information. Newcomers can use the shared club email to ask about an appropriate group and the current schedule. The pub is a training meeting point, not a club-owned athletics facility.",
    ],
    founded_year: 1986,
    corrections: { sports: ["Running"], address_kind: "training" },
    sources: [
      {
        title: "Origins, training base, championship and races",
        url: "https://www.kimberworthstriders.co.uk",
      },
      {
        title: "Membership options",
        url: "https://www.kimberworthstriders.co.uk/membership-subscriptions",
      },
      {
        title: "Public club email and social links",
        url: "https://www.kimberworthstriders.co.uk/contact",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "lincoln-wellington-athletic-club": {
    summary:
      "Lincoln Wellington Athletic Club offers junior and adult athletics from Yarborough Leisure Centre in Lincoln, with a history stretching back to 1911.",
    biography: [
      "Lincoln Wellington Athletic Club takes its name from the Duke of Wellington Inn on Broadgate, where the Lincoln club was formed on 20 September 1911. Its history connects local athletics in Lincolnshire, England, with international competition: Tommy White ran the 800 metres at the 1948 Olympics, while later generations include Abbie Donnelly and Sam Atkin. More recently, the club received England Athletics' East Midlands Club of the Year award in 2025 and the Lincoln Civic Award in April 2026.",
      "Yarborough Leisure Centre on Riseholme Road is the club's athletics base. The joining page offers routes into running, jumping and throwing from age eight, with specialist training groups as athletes develop. Road and cross-country runners are also part of the club, alongside track athletes and field-event specialists. Email the joining team to discuss age, experience and available coaching before a first session. Volunteers support this programme as well as the athletes: the club's history gives that everyday work a place beside its best-known results.",
    ],
    founded_year: 1911,
    notable_members: [
      {
        name: "Tommy White",
        connection: "Historical club Olympian",
        detail:
          "The club history records his participation in the 800 metres at the 1948 Olympic Games.",
      },
      {
        name: "Abbie Donnelly",
        connection: "Club athlete in its published history",
        detail:
          "The history records her 2023 European cross-country bronze and role as Great Britain and Northern Ireland team captain at the 2024 World Cross Country Championships.",
      },
      {
        name: "Sam Atkin",
        connection: "Club athlete in its published history",
        detail: "The club history records his participation at the Paris 2024 Olympic Games.",
      },
    ],
    corrections: {
      website: "https://www.lwac.org.uk/",
      address: "Yarborough Leisure Centre, Riseholme Road, Lincoln, LN1 3SP",
      address_kind: "training",
    },
    sources: [
      {
        title: "Club history, international athletes and civic recognition",
        url: "https://www.lwac.org.uk/about/history/",
      },
      { title: "Joining, age groups and coaching", url: "https://www.lwac.org.uk/join-us/" },
      { title: "Training address and enquiries", url: "https://www.lwac.org.uk/contact/" },
    ],
    reviewed_at: "2026-10-14",
  },
  "rotherham-harriers-and-ac": {
    summary:
      "Rotherham Harriers and AC is based at Herringthorpe Stadium in Rotherham, with track and field, distance running and opportunities for young athletes.",
    biography: [
      "Rotherham Harriers and AC has a history reaching back to Victorian South Yorkshire. Its detailed timeline describes early cross-country running, the formation of a women's section in 1932 and the opening of Herringthorpe Stadium's track in 1959. The club in Rotherham, England, has produced international athletes: javelin thrower Peter Cullen was selected for the 1956 Olympic team, and Eddie Kirkup won the AAA marathon title in 1957. These are historical club achievements, not claims of current membership.",
      "Herringthorpe Stadium on Middle Lane South is the present home base, with Monday and Wednesday club evenings. The programme includes young-athlete coaching, track and field and distance-running groups, while club officers also organise cross-country, trail and fell activity. Young beginners should follow the published registration-of-interest process before attending; a listed training night does not guarantee an immediate place. The stadium is in Rotherham, not Doncaster: the older Doncaster directory address is not used here as a training venue.",
    ],
    notable_members: [
      {
        name: "Peter Cullen",
        connection: "Historical club Olympian",
        detail:
          "The club's timeline records his selection for the javelin at the 1956 Olympic Games.",
      },
      {
        name: "Eddie Kirkup",
        connection: "Historical club distance runner",
        detail: "The club's timeline records his AAA marathon championship win in 1957.",
      },
    ],
    corrections: {
      city: "Rotherham",
      county: "Rotherham",
      website: "https://rotherhamharriers.org/",
      address: "Herringthorpe Stadium, Middle Lane South, Rotherham, S65 2HR",
      postcode: "S65 2HR",
      address_kind: "training",
    },
    sources: [
      {
        title: "Historical timeline and international athletes",
        url: "https://rotherhamharriers.org/history/keydates.php",
      },
      {
        title: "Herringthorpe home base and club nights",
        url: "https://rotherhamharriers.org/club/based-at.php",
      },
      {
        title: "Young-athlete registration of interest",
        url: "https://rotherhamharriers.org/membership23/",
      },
      {
        title: "Club coaching and discipline roles",
        url: "https://rotherhamharriers.org/club/personnel.php",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "scunthorpe-harriers-athletic-club": {
    summary:
      "Scunthorpe Harriers Athletic Club provides junior and adult track and field training at Quibell Park in Scunthorpe, North Lincolnshire.",
    biography: [
      "Scunthorpe Harriers Athletic Club took its present form on 1 October 2021. Its website traces the preceding organisation to the 1996 merger of Normanby Park, Riddings and Scunthorpe Harriers into Scunthorpe and District AC. Those earlier roots are part of the story, but are distinct from the formation date of the current club. Today it offers athletics in Scunthorpe, North Lincolnshire, England, from Quibell Park Stadium.",
      "The published programme has main club sessions on Tuesdays and Thursdays, with groups for mini juniors from eight, endurance athletes from ten and combined events from eleven, alongside sprint and other event coaching. Places are managed through an athletics enquiry form and a waiting list, so parents and new athletes should register interest before arriving at the track. Ask the club which group has space and what a first session involves. The website is the primary joining route.",
    ],
    founded_year: 2021,
    corrections: { address_kind: "training", contact_url: "https://scunthorpe-harriers.com/" },
    sources: [
      {
        title: "Club history, age groups, training and waiting-list form",
        url: "https://scunthorpe-harriers.com/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-caerleon-rc": {
    summary:
      "Caerleon Running Club is based in Caerleon near Newport, Wales, with social runs, interval training, track sessions and a Couch to 5K programme.",
    biography: [
      "Caerleon Running Club was established in June 2003 and brings runners together in Caerleon, near Newport in south-east Wales. Its welcome extends from Couch to 5K graduates and parkrunners to members training for longer races. The programme combines interval work with sociable group running, while the club's Couch to 5K activity provides a more gradual introduction for people starting out.",
      "Caerleon RFC's clubhouse on Broadway is a regular base, with separate track sessions at Newport Stadium. Tuesday intervals and Thursday social runs offer different kinds of training; the social route is described as around 10K, so beginners should ask which option suits them rather than assume every session starts from scratch. The club's contact and joining form, shared email and published welfare contacts provide routes for questions before joining. Check the current announcements for track dates and Couch to 5K intake, as these are not the same as the regular clubhouse runs.",
    ],
    founded_year: 2003,
    corrections: {
      website: "https://caerleonrunningclub.co.uk/",
      address: "Caerleon RFC clubhouse, Broadway, Caerleon, NP18 1AY",
      postcode: "NP18 1AY",
      address_kind: "training",
    },
    location_note:
      "Caerleon RFC is the club-running base. Track sessions take place separately at Newport Stadium; confirm the current track dates with the club.",
    sources: [
      {
        title: "Club origins, welcome and training",
        url: "https://caerleonrunningclub.co.uk/about-us/",
      },
      { title: "Clubhouse and current programme", url: "https://www.caerleonrunningclub.co.uk/" },
      {
        title: "Contact and joining form",
        url: "https://caerleonrunningclub.co.uk/contact-join-us/",
      },
      {
        title: "Welsh Athletics club contacts",
        url: "https://www.welshathletics.org/en/club/view/caerleon-rc",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-caldicot-running-club": {
    summary:
      "Caldicot Running Club offers sociable pace-group runs, intervals and trail outings in Caldicot, Monmouthshire, Wales, for runners of different abilities.",
    biography: [
      "Caldicot Running Club began in 2000 and became affiliated to Welsh Athletics in 2014. Based in Caldicot, Monmouthshire, Wales, it puts company and encouragement alongside racing and personal goals. Its regular programme includes pace-group runs, interval work and occasional trail or social outings, giving members more than one way to take part.",
      "Monday groups cover a range of distances, described by the club as roughly three to ten miles, while Wednesday training focuses on intervals. Monthly variations include a trail run or a boomerang session designed to bring runners back together. The website identifies Castle Gate car park as the meeting point, but the governing-body entry uses a different location description; newcomers should confirm the precise place before travelling. The shared enquiry email and membership contacts can help with choosing a group and finding the latest session details.",
    ],
    founded_year: 2000,
    corrections: {
      website: "https://caldicotrunningclub.com/",
      address: "",
      postcode: "",
      address_kind: "directory",
      location_precision: "area-only",
    },
    location_note:
      "The club website says Castle Gate car park, Caldicot; the directory says Castlegate Business Park. Confirm the meeting point with the club before travelling; these descriptions have not been treated as interchangeable.",
    sources: [
      { title: "Club origins and affiliation", url: "https://caldicotrunningclub.com/about-us/" },
      {
        title: "Training groups and meeting-point description",
        url: "https://caldicotrunningclub.com/club-training/",
      },
      { title: "Public enquiry email", url: "https://caldicotrunningclub.com/contact-us/" },
      {
        title: "Directory location for comparison",
        url: "https://www.welshathletics.org/en/club/view/caldicot-running-club",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-chepstow-harriers": {
    summary:
      "Chepstow Harriers is a Monmouthshire running club with road, cross-country and fell activity, coached sessions and a registered one-month trial for newcomers.",
    biography: [
      "Chepstow Harriers was re-formed in 1987, reviving a name with much older roots in Chepstow, Monmouthshire, Wales. The club's history suggests that the original Harriers began in 1886 and continued into the 1920s. Early members included Welsh cross-country internationals Sam Judd and Cliff Price; Price also won Welsh mile and four-mile titles in 1912 and 1913. Those athletes belong to the earlier club's history, not the present membership.",
      "The modern club offers road running, cross-country and fell activity, with coached Tuesday sessions and Thursday social runs. Its new-member guide describes the Thursday outing as generally eight to ten kilometres, with shorter options available. Newcomers can register for a one-month free trial through the membership team. Session venues are announced in the club newsletter, so arrange the first visit rather than rely on a single permanent meeting point. Members also contribute by coaching, marshalling and helping with the social side of club events.",
    ],
    founded_year: 1987,
    notable_members: [
      {
        name: "Sam Judd",
        connection: "Member of the early twentieth-century club",
        detail:
          "The club history identifies him as a Welsh cross-country international, pictured with the national team in 1913 and 1914.",
      },
      {
        name: "Cliff Price",
        connection: "Member of the early twentieth-century club",
        detail:
          "The history records Welsh cross-country representation and Welsh mile and four-mile titles in 1912 and 1913.",
      },
    ],
    location_note:
      "Training venues are published in the club newsletter. Contact the membership team to arrange a first visit; no permanent street address is inferred.",
    sources: [
      {
        title: "Original club history and 1987 revival",
        url: "https://sites.google.com/site/chepstowharriersrunningclub/about-the-club/club-history",
      },
      {
        title: "Training, registered trial and volunteering",
        url: "https://sites.google.com/site/chepstowharriersrunningclub/about-the-club/new-members-area",
      },
      {
        title: "New-member enquiries",
        url: "https://sites.google.com/site/chepstowharriersrunningclub/contact-us",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "welsh-athletics-cornelly-striders-ac": {
    summary:
      "Cornelly Striders AC is a running club in North Cornelly, Wales, offering mixed-ability sessions, walking activity, local league racing and a social programme.",
    biography: [
      "Cornelly Striders AC is based in North Cornelly, near Bridgend in south Wales. Its programme welcomes different running abilities and includes walking, with an emphasis on members encouraging one another. The club takes part in and helps host Bridgend County Running League and West Glamorgan cross-country activity. Social gatherings and time together after parkrun sit alongside the more structured training and racing.",
      "Many sessions use Greenacres as a meeting point, with indoor alternatives also appearing in the programme. The club offers two guest outdoor sessions before membership; newcomers must complete the guest disclaimer, and the offer does not include indoor sessions. Published membership categories include young adults aged 16 to 19 as well as adults, so it should not be described as exclusively over-18. Use the club's contact page or official social channels to confirm the next suitable session and exact meeting place.",
    ],
    corrections: {
      city: "North Cornelly",
      website: "https://cornellystriders.uk/",
      adult_only: false,
    },
    location_note:
      "The club describes Greenacres as a frequent meeting point. Confirm the session's precise venue; indoor and outdoor activities have different arrangements.",
    sources: [
      { title: "Club activities and local leagues", url: "https://cornellystriders.uk/about/" },
      {
        title: "Membership ages and guest-session conditions",
        url: "https://cornellystriders.uk/membership/",
      },
      { title: "Official contact routes", url: "https://cornellystriders.uk/contact/" },
      {
        title: "Welsh Athletics role contacts",
        url: "https://www.welshathletics.org/en/club/view/cornelly-striders-ac",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-ballincollig-a-c": {
    summary:
      "Ballincollig AC is a County Cork athletics club founded in 1995, with juvenile athletics and a Fit4Life running section for adults in Ballincollig.",
    biography: [
      "Ballincollig AC was founded in 1995 and offers athletics for different ages and abilities in Ballincollig, County Cork, Ireland. Juvenile athletics and adult Fit4Life running are both part of the club. Its hall of fame records achievements including Gearóid Kelly's Munster Athlete of the Year award in 2010 and Rachel Lynch's national javelin medal in 2019, illustrating a field-event tradition alongside the running groups.",
      "Fit4Life offers five- and ten-kilometre groups at different paces, with a two-week trial described on its joining information. That section meets at Our Lady of Good Counsel School's car park in Innishmore Estate, while other club activity uses different local facilities. New members should ask the shared club contact which group, venue and seasonal timetable apply to them. The directory's Poulavone address is not treated as a universal training base: a junior athletics session and an adult Fit4Life run need not start in the same place.",
    ],
    founded_year: 1995,
    notable_members: [
      {
        name: "Gearóid Kelly",
        connection: "Club hall of fame",
        detail:
          "The club honours his 2010 Munster Athlete of the Year award and achievements in throwing events.",
      },
      {
        name: "Rachel Lynch",
        connection: "Club hall of fame",
        detail:
          "The club records her national javelin medal in 2019; this is a historical achievement, not a current membership assertion.",
      },
    ],
    corrections: {
      city: "Ballincollig",
      website: "https://ballincolligathleticsclub.wordpress.com/",
      address: "",
      postcode: "",
      address_kind: "directory",
      location_precision: "area-only",
    },
    location_note:
      "Fit4Life describes meetings at Our Lady of Good Counsel School car park, Innishmore Estate. Other athletics groups use separate facilities; confirm your group's venue and current schedule.",
    sources: [
      {
        title: "Club origins and programme",
        url: "https://ballincolligathleticsclub.wordpress.com/",
      },
      {
        title: "Fit4Life groups, trial and meeting point",
        url: "https://ballincolligathleticsclub.wordpress.com/fit4life/",
      },
      {
        title: "Club hall of fame",
        url: "https://ballincolligathleticsclub.wordpress.com/hall-of-fame/",
      },
      {
        title: "Public club contact",
        url: "https://ballincolligathleticsclub.wordpress.com/contact/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-ballyroan-abbeyleix-and-district-a-c": {
    summary:
      "Ballyroan Abbeyleix and District AC serves runners in County Laois, Ireland, with a Ballyroan training base and county and national competition links.",
    biography: [
      "Ballyroan Abbeyleix and District AC serves the Ballyroan and Abbeyleix area of County Laois, Ireland. Athletics Ireland lists its training base at Ballyroan Abbey GAA Club in Glenbrook. The club's local role extends beyond entering races: a firsthand report from neighbouring St Abban's records Ballyroan hosting the Laois Senior Road Championships in February 2024, on a course running from the village towards Abbeyleix, with refreshments afterwards.",
      "Members also compete beyond the county. Athletics Ireland's February 2025 national intermediate cross-country report names Breda McDonald as the women's bronze medallist for the club at Westport. Prospective members can use the shared club email or Athletics Ireland membership listing to ask about available groups, age requirements and the current programme. The published GAA-club location is a training base; confirm the session before travelling rather than assuming the directory provides a complete weekly timetable.",
    ],
    notable_members: [
      {
        name: "Breda McDonald",
        connection: "Club athlete in Athletics Ireland's February 2025 report",
        detail:
          "Won women's bronze at the national intermediate cross-country championships in Westport on 9 February 2025.",
      },
    ],
    corrections: {
      city: "Ballyroan",
      address: "Ballyroan Abbey GAA Club, Glenbrook, Ballyroan, Co. Laois, R32 WE04",
    },
    sources: [
      {
        title: "Athletics Ireland club and training listing",
        url: "https://membership.athleticsireland.ie/clubpage/Ballyroan_Abbeyleix_and_District_A.C.",
      },
      {
        title: "St Abban's firsthand report of the 2024 Laois championships",
        url: "https://stabbansac.ie/news-details/laois-senior-road-championships",
      },
      {
        title: "Athletics Ireland national intermediate report, February 2025",
        url: "https://www.athleticsireland.ie/edris-and-butterly-claim-intermediate-cross-country-titles-in-westport/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-blackrock-louth-a-c": {
    summary:
      "Blackrock AC in County Louth offers juvenile and senior athletics in Blackrock, with track and field, cross-country, road running and local beach races.",
    biography: [
      "Blackrock AC serves the coastal village of Blackrock in County Louth, Ireland. It is a separate club from Blackrock AC in Dublin. Athletics Ireland describes juvenile and senior activity across track and field, cross-country and road running, and lists Blackrock Community Centre on Sandy Lane as the training location. The county athletics directory also lists the club and its social channels.",
      "Local events give the club a presence beyond the track: Louth Athletics' 2025 results archive includes Blackrock AC's beach races on 3 July. Volunteers are part of that community work too, with Pete Rowland named for Blackrock AC in Louth Local Sports Partnership's 2025 volunteer awards. Newcomers can use the club's directory-linked Facebook page or Athletics Ireland membership listing to ask about joining and current sessions.",
    ],
    corrections: { city: "Blackrock" },
    sources: [
      {
        title: "Athletics Ireland club disciplines and training location",
        url: "https://membership.athleticsireland.ie/clubpage/Blackrock_(Louth)_A.C.",
      },
      {
        title: "Louth Athletics club directory and social links",
        url: "https://www.athleticslouth.com/clubs/",
      },
      {
        title: "County archive of the 2025 beach races",
        url: "https://www.athleticslouth.com/results/2025-results/",
      },
      {
        title: "Louth Local Sports Partnership volunteer awards 2025",
        url: "https://louthlsp.com/latest-news/llsp-volunteer-awards-2025/",
      },
    ],
    reviewed_at: "2026-10-14",
  },
  "athletics-ireland-blayney-rockets-a-c": {
    summary:
      "Blayney Rockets AC is a senior running club in Castleblayney, County Monaghan, Ireland, and organiser of the local ten-mile road race around Lough Muckno.",
    biography: [
      "Blayney Rockets AC is a senior running club in Castleblayney, County Monaghan, Ireland. Athletics Ireland lists Castleblayney Community Enterprise Centre on Dublin Road as its training location. The club is also associated with a substantial local road-running event: its ten-mile race, first staged in 2014, follows a route around Lough Muckno.",
      "The organiser's 2026 entry page advertised the race for 26 July, finishing at St Mary's Park, home of Castleblayney Faughs. For club membership, use the Athletics Ireland listing and check the current training arrangements before attending the Enterprise Centre. Its senior-only directory category distinguishes this listing from a juvenile athletics programme.",
    ],
    corrections: {
      city: "Castleblayney",
      adult_only: true,
      address:
        "Castleblayney Community Enterprise Centre, Dublin Road, Castleblayney, Co. Monaghan, A75 WF72",
    },
    sources: [
      {
        title: "Athletics Ireland senior-club listing and training location",
        url: "https://membership.athleticsireland.ie/clubpage/Blayney_Rockets_A.C.",
      },
      {
        title: "Organiser's 2026 ten-mile entry page and race origins",
        url: "https://eventmaster.ie/event/yAoxIP0SVy",
      },
    ],
    reviewed_at: "2026-10-14",
  },
};
