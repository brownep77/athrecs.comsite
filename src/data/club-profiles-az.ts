import type { ClubProfile } from "./club-profiles.ts";

// Primary club pages opened 15 October 2026. Editorial associations are not athlete identities.
export const regionalClubCommunityProfiles: Record<string, ClubProfile> = {
  "northampton-road-runners": {
    summary: "Northampton Road Runners has brought adults together since 1981, combining Wednesday club runs from Waterside Campus with road, trail and cross-country running.",
    biography: [
      "Northampton Road Runners began in 1981 in Northampton, England, when local runners wanted company for training, racing and socialising. Its early home was the United Trades RRC, followed by Moulton Sports Centre and the Obelisk Centre. The club moved to the University of Northampton's Waterside Campus in 2022.",
      "Wednesday remains the main club evening, with groups covering different distances and members organising other outings through the week. Road races, trails, cross-country, club championships and social events give runners several ways to participate. The club's history includes organising the Moulton 10K and the Obelisk Obble and Asterix Amble trail outings.",
      "Newcomers should book their first Wednesday and follow the joining team's campus meeting instructions. Trial runs allow people to find a suitable group before committing. Adult runners with different ambitions are welcome, while those not yet comfortable with ordinary group distances can ask about the separate beginner programme. Membership enquiries go directly to the club's membership team."
    ],
    founded_year: 1981,
    sources: [{ title: "Club history, campus move and enquiries", url: "https://northamptonroadrunners.co.uk/about" }, { title: "First visit and guide pace", url: "https://northamptonroadrunners.co.uk/first-wednesday" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://northamptonroadrunners.co.uk/", address_kind: "training" },
    location_note: "Wednesday runs meet at Waterside Campus, University of Northampton. Book first and follow the membership team's instructions for the meeting point.",
    contact_note: "The club gives a guide of 5K in 36 minutes for ordinary sessions. Ask about its beginner programme if that is not yet comfortable."
  },
  "northants-tri": {
    summary: "Northants Tri Club offers adult swim, bike and run training around Northampton, with coached pool sessions, Moulton track running and Upton Country Park runs.",
    biography: [
      "Northants Tri Club, also known as NTri, is an adult triathlon and multisport club serving Northampton and the surrounding Northamptonshire area in England. It welcomes beginners, returning triathletes and experienced competitors, including people who mainly want the social side of training together.",
      "The coaching team builds sessions around an annual plan, reviewed quarterly to reflect upcoming club races. Pool swimming combines technique and conditioning at Moulton College and Cripps, while running includes Moulton College track sessions and Thursday outings from Upton Country Park. Weekend cycling depends on the weather, and members also meet at local parkruns.",
      "Prospective members can arrange a taster through the club's enquiry email or social pages. New swimmers should contact the coaches before booking so they can be directed to a venue with suitable coaching support. Check the booking calendar for each activity: swimming, track running and road sessions do not all start at the directory contact address."
    ],
    sources: [{ title: "Club and taster enquiries", url: "https://clubspark.net/northantstriclub" }, { title: "Adult membership", url: "https://clubspark.net/northantstriclub/About" }, { title: "Coached programme", url: "https://clubspark.net/northantstriclub/Coaching" }, { title: "Swimming venues", url: "https://clubspark.net/northantstriclub/Coaching/Swim" }, { title: "Running venues", url: "https://clubspark.net/northantstriclub/Coaching/Run" }],
    reviewed_at: "2026-10-15",
    location_note: "Sessions use Moulton College, Cripps and Upton Country Park. The retained Hawkstone Close directory address is not a confirmed training start.",
    contact_note: "New swimmers should email before booking to discuss the appropriate session and coaching cover."
  },
  "northbrook-athletic-club": {
    summary: "Northbrook Athletic Club combines Coventry road and cross-country running with structured training, its Northbrook 10K and a long-running summer handicap series.",
    biography: [
      "Northbrook Athletic Club in Coventry, England, traces its beginnings to Northbrook Striders in 1978. Its history reflects both competitive running and local volunteering, from Warwickshire road racing and Midlands cross-country leagues to organising the Northbrook 10K.",
      "The summer handicap series gives members another way to race together, while regular training and team events support runners with different goals. The club's history records a men's Warwickshire Road Race League victory and Cotswold Hilly 100 relay win in 2005. Long-serving volunteer Bob Adams received life membership in 2017 in recognition of his contribution, including many years as chairman.",
      "People considering membership can try one or two training sessions, but should contact the club beforehand. The public committee email and enquiry form provide a route to the right person. Anyone using the Jaguar Sports and Social Club facilities, including its car park, must also arrange the host venue's associate membership; that is separate from joining Northbrook."
    ],
    founded_year: 1978,
    notable_members: [{ name: "Bob Adams", connection: "Long-serving chairman and life member", detail: "The club's history records his 2017 life membership award for long service, including many years as chairman." }],
    sources: [{ title: "Club history", url: "https://www.northbrookac.org.uk/club-history/" }, { title: "Training trials and host-club requirements", url: "https://www.northbrookac.org.uk/" }, { title: "Public committee contact", url: "https://www.northbrookac.org.uk/club-committee/" }],
    reviewed_at: "2026-10-15",
    contact_note: "Contact the club before a trial session. Jaguar Sports and Social Club associate membership is separately required to use its facilities or car park."
  },
  "northenden-runners": {
    summary: "Wythenshawe & Northenden Runners is a Manchester social running club built around Thursday outings, member feedback and support for local good causes.",
    biography: [
      "Listed here as Northenden Runners, the club introduces itself as Wythenshawe & Northenden Runners on its England Athletics club page. It serves the Wythenshawe and Northenden area of Manchester, England, with an emphasis on sociable running and listening to members' goals.",
      "Its introductory programme centres on a Thursday evening social run. The club also describes ambitions for speed work, Couch to 5K and longer Sunday outings, rather than publishing those as an established weekly timetable. Prospective runners should check which sessions are currently available before attending.",
      "Community involvement is part of the club's stated purpose, through supporting local businesses, volunteering and a good-causes fund receiving twenty per cent of membership fees. Members choose the beneficiaries. The existing Northenden listing is retained rather than creating a second club under the fuller name; use the official club page and linked Instagram account to check current arrangements."
    ],
    sources: [{ title: "Club identity, programme and community aims", url: "https://clubspark.englandathletics.org/WythenshaweandNorthendenRunners" }],
    reviewed_at: "2026-10-15",
    location_note: "The club serves Wythenshawe and Northenden. Confirm the current Thursday meeting point; the introductory club page does not reconfirm the directory's Untapped address.",
    corrections: { website: "https://clubspark.englandathletics.org/WythenshaweandNorthendenRunners" }
  },
  "northern-fells-running-club": {
    summary: "Northern Fells Running Club brings adult fell runners together around the northern Lake District for social outings, local races and mountain challenges.",
    biography: [
      "Northern Fells Running Club was formed in December 2014 in Cumbria, England. Its community is spread around the northern Lake District, including the Hesket Newmarket area, rather than centred on a single track. Fell running is its main focus, although members also take part in road and other endurance events.",
      "The club organises Carrock, Fellside and the Old Crown Round, with the latter selected for the English Fell Championships in 2022 and 2026. Wednesday evening and fortnightly Sunday social runs sit alongside club championships and winter challenges. Its membership secretary Jonathan Savage brings a background in international ultrarunning; that earlier career is distinct from his present club role.",
      "Membership is now restricted to adults aged eighteen and over. New runners can enquire about a taster social run and check the advertised route and meeting point before joining through SiEntries. The club offers different membership options for social fell running and competition, so entrants should check the affiliation requirements of their chosen races."
    ],
    founded_year: 2014,
    notable_members: [{ name: "Jonathan Savage", connection: "Membership secretary and former international ultrarunner", detail: "The club identifies Savage as its membership secretary and records his place on the USA team that won silver at the 2012 24-Hour World Championships; this is historical sporting context, not a current racing claim." }],
    sources: [{ title: "Origins, races and committee biographies", url: "https://www.northernfellsrc.org.uk/" }, { title: "Adult eligibility and membership enquiries", url: "https://www.northernfellsrc.org.uk/join-us/" }, { title: "Club contact", url: "https://www.northernfellsrc.org.uk/contacta/" }, { title: "Uncoached social-run requirements", url: "https://www.northernfellsrc.org.uk/events/club-runs/" }],
    reviewed_at: "2026-10-15",
    location_note: "Social runs have changing meeting points in the northern Lake District. The retained Calebreck Farm directory address is not a universal training start.",
    contact_note: "Eighteen-plus only. Social runs are uncoached and require prior contact, suitable fell kit and the ability to run at least six miles off-road. Read the route and participation guidance before attending."
  },
  "northern-masters-ac": {
    summary: "Northern Masters Athletic Club has supported age-group competition since 1968, organising track, field and endurance opportunities across northern England.",
    biography: [
      "Northern Masters Athletic Club was founded in 1968 as Northern Veterans AC. It serves masters athletes across northern England, with events held at different venues rather than a single Preston training base. Its programme covers running, jumping and throwing, as well as road, cross-country, trail and mountain disciplines.",
      "Competition is organised in five-year age groups from thirty-five upwards. The club stages indoor and outdoor meetings and annual championships, giving members opportunities to compete against their peers and progress to national or international masters events. Social contact is an important part of these meetings, alongside serious competition.",
      "The club's published member introductions include Olympic long-jump bronze medallist Sue Richardson and masters sprinter Steve Peters. New members can use the joining page and contact form, which routes membership, merchandise and other enquiries. Consult the fixtures for venues and entry conditions; the directory's Preston address should not be treated as the start point for every activity."
    ],
    founded_year: 1968,
    notable_members: [{ name: "Sue Richardson", connection: "Member and former Olympic medallist", detail: "NMAC identifies Richardson as a member and the Los Angeles 1984 Olympic long-jump bronze medallist." }, { name: "Steve Peters", connection: "Masters sprinter associated with NMAC", detail: "The club features Peters among its members and describes his masters sprinting achievements. No undated championship title is presented as a current title." }],
    sources: [{ title: "Club origins and member introductions", url: "https://northernmasters.co.uk/" }, { title: "Age groups and competition model", url: "https://northernmasters.co.uk/our-club/" }, { title: "Enquiry form", url: "https://northernmasters.co.uk/contact/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://northernmasters.co.uk/" },
    location_note: "NMAC organises events across northern England. Its Preston directory address is not a confirmed weekly training venue; use each fixture's location."
  },
  "northowram-pumas-running-club": {
    summary: "Northowram Pumas Running Club offers pace-group and development running from Northowram Cricket Club near Halifax, building on its September 2014 beginnings.",
    biography: [
      "Northowram Pumas Running Club began in September 2014 in Northowram, near Halifax in West Yorkshire, England. What started as a small Wednesday running group developed into a club organising its own events and supporting members' running goals.",
      "The club's public England Athletics page lists Monday and Wednesday evenings as its principal club nights, meeting at Northowram Cricket Club on Westercroft Lane. Groups span a range of paces, from roughly seven-minute to thirteen-minute miles, with a separate development group. This gives prospective members a practical way to discuss where they would fit rather than relying only on an all-abilities description.",
      "New runners can email the club for guidance or ask about joining at a club night. Confirm the session and group before a first visit, particularly if returning after a break. The development group offers a distinct point of enquiry alongside the numbered pace groups, so there is no need to guess which session would be suitable."
    ],
    founded_year: 2014,
    sources: [{ title: "Origins, pace groups, meeting point and enquiries", url: "https://clubspark.englandathletics.org/Northowrampumasmembersonly" }],
    reviewed_at: "2026-10-15", corrections: { address: "Northowram Cricket Club, Westercroft Lane, Northowram", address_kind: "training" },
    contact_note: "Use info@northowrampumas.co.uk for club enquiries; the England Athletics footer contacts are not Pumas contacts."
  },
  "northumbria-university": {
    summary: "Northumbria University's Athletics and Cross Country club combines student training and BUCS competition, using Churchill Playing Fields in Monkseaton for 2026/27.",
    biography: [
      "Northumbria University's Athletics and Cross Country club brings students together in the Newcastle upon Tyne area of England. Its programme covers sprints, hurdles, middle- and long-distance running, jumps, throws and cross-country, welcoming newcomers as well as experienced competitors.",
      "For 2026/27, the university specifies Wednesday and Friday training at Churchill Playing Fields in Monkseaton, accessible by Metro. Membership includes regular coached sessions and track access; competition entry and travel are separate costs. Athletes can choose local events and university competition, including BUCS indoor, outdoor and cross-country championships, while weekly socials support the club community.",
      "The university's historical records include hurdler Jason Nicholson and pole vaulter Charlie Myers. Those records do not imply that either is currently a student or member. Prospective students should contact the club committee or its supporting Sport Clubs Officer about joining and any further tasters; the published September and early-October taster dates have already passed."
    ],
    notable_members: [{ name: "Jason Nicholson", connection: "Historical university record-holder", detail: "Northumbria's published club records list Nicholson across sprint and hurdle events; current student or club membership is not inferred." }, { name: "Charlie Myers", connection: "Historical university pole-vault record-holder", detail: "Myers appears in the university's published athletics records for pole vault. The record establishes historical association, not present membership." }],
    sources: [{ title: "2026/27 training, joining contacts and club records", url: "https://northumbriasport.com/sport/athletics-xc" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Monkseaton", county: "Tyne and Wear", address: "Churchill Playing Fields athletics track, Monkseaton", postcode: "NE26 3NT", address_kind: "training" },
    location_note: "The university specifies Churchill Playing Fields, Monkseaton, for all 2026/27 club training, replacing the older Gateshead stadium listing. Sport Central in Newcastle is the sports department's contact address."
  },
  "notfast-rc": {
    summary: "NOTFAST Running Club in Newark welcomes adult beginners and experienced runners, with Tuesday training at Magnus and Thursday sessions around the local area.",
    biography: [
      "NOTFAST Running Club was founded in 1986 as a veterans' running club in Newark, Nottinghamshire, England. In 2016 it opened membership to anyone over eighteen, while keeping the sociable atmosphere that remains central to its identity. Members run for fitness, individual races and club teams.",
      "The club meets twice a week. Tuesday sessions start at Magnus Community Sports Centre, while Thursday training uses different venues around Newark and the surrounding area. Runners range from complete beginners to experienced competitors, so a first enquiry should include the sort of running or support the newcomer is looking for.",
      "Adults can run with the club for two or three weeks before deciding whether to join. The new-member information and public contact page explain the next steps. Social activities have included brewery runs, quiz nights, breakfast runs and an annual awards and Christmas dinner, giving members ways to get to know each other beyond training."
    ],
    founded_year: 1986,
    sources: [{ title: "History, eligibility and club nights", url: "https://www.notfastrunningclub.co.uk/a/club-information-61057.html?page=1" }, { title: "Public enquiries and Magnus location", url: "https://www.notfastrunningclub.co.uk/contact" }],
    reviewed_at: "2026-10-15", corrections: { city: "Newark", address_kind: "training" },
    location_note: "Tuesday training meets at Magnus Community Sports Centre; Thursday venues vary. The site describes Magnus using both Bowbridge Road and Earp Avenue, so confirm the entrance before visiting."
  },
  "notts-women-runners": {
    summary: "Notts Women Runners connects women across Nottinghamshire through local social groups, ten-week beginner courses and coached progression beyond 5K.",
    biography: [
      "Notts Women Runners is a women's running club serving Nottingham and communities across Nottinghamshire, England. It grew from friends looking for running company into a network of local groups, with a particular emphasis on helping complete beginners feel welcome.",
      "Qualified run leaders guide ten-week Couch to 5K courses, often ending with a group visit to a nearby parkrun. Improver groups help runners build distance or speed after that first milestone. Established social groups commonly cover five or ten kilometres, sometimes splitting into separate groups, so the relevant local organiser can explain what is planned.",
      "The club offers both social membership and full England Athletics-affiliated membership, with different competition benefits. Its committee, coaches and mental-health champions support the wider community. Use the group directory and communications email to find a suitable starting point; a single Calverton address does not represent every session across the county. Check current membership information rather than relying on older season-specific prices."
    ],
    sources: [{ title: "Club approach and public links", url: "https://nottswr.com/" }, { title: "Beginner, improver and local groups", url: "https://nottswr.com/groups/" }, { title: "Membership options", url: "https://nottswr.com/become-a-member/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://nottswr.com/" },
    location_note: "Groups meet across Nottinghamshire. Use the club's local-group directory for the appropriate venue; the Calverton directory address is not a county-wide meeting point."
  },
  "nuclear-races-striders": {
    summary: "Nuclear Essex Striders connects runners around Brentwood through parkrun meet-ups, track sessions, cross-country and road or trail events between Nuclear race days.",
    biography: [
      "Nuclear Essex Striders, listed here as Nuclear Races Striders, is an England Athletics-affiliated running club based at the Nuclear Essex estate near Brentwood, England. It welcomes runners from ten years old and gives people who enjoy the Nuclear events a way to keep running together between race days.",
      "The club's activities extend beyond obstacle racing. Members support one another at parkruns, road races, trails, marathons and cross-country, with monthly meet-ups at parkruns, track training and races. Its published programme includes representation in the South Essex cross-country league and a Facebook community for arranging outings and sharing encouragement.",
      "Affiliated and non-affiliated membership routes are available, and the club publishes a dedicated Striders email for questions. Check the current sign-up terms and meeting arrangements before attending. The Wild Forest training area at Parsonage Farm and the wider estate's headquarters are different locations; an estate contact number is not automatically a direct club contact."
    ],
    sources: [{ title: "Striders activities, membership and dedicated enquiries", url: "https://nuclearessex.com/striders" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://nuclearessex.com/striders" },
    location_note: "The listed Parsonage Farm address is the Wild Forest area of Nuclear Essex. Club meet-ups also take place at parkruns, tracks and races; confirm the specific venue.",
    contact_note: "Use striders@nuclearessex.com for club questions, rather than the estate's separate attractions, shop or race-office contacts."
  },
  "off-that-couch-fitness": {
    summary: "Off That Couch Fitness combines a running and triathlon club with Steve Clark's coaching practice, offering membership to runners as well as multisport athletes.",
    biography: [
      "Off That Couch Fitness is a Lincolnshire coaching organisation with a separate club-membership offer for running and triathlon. Founded and led by coach Steve Clark, it brings together people pursuing individual fitness goals, first triathlons and longer-distance challenges. Its September 2026 programme included swimming and cycling in Brigg and a club parkrun outing in Scunthorpe.",
      "The organisation's coaches cover triathlon, swimming and conditioning, while its services also include individual training plans and swim analysis. The club identifies affiliations with England Athletics, British Triathlon and the Ironman club programme. These membership routes should be distinguished from purchasing one-to-one coaching or other specialist services.",
      "Prospective members do not have to be triathletes: they can choose the appropriate membership option through the official website and discuss their needs with the published enquiry contact. Ask for the current venue and session arrangements rather than treating the directory's contact address as a permanent training headquarters. Individual coaching and club participation offer different levels of support, so it is worth discussing which fits the runner's goals."
    ],
    notable_members: [{ name: "Steve Clark", connection: "Founder and head coach", detail: "The official coaching biography identifies Clark as the founder and head coach of Off That Couch Fitness. This editorial role does not create an athlete profile or verify individual race results." }],
    sources: [{ title: "Coaching organisation and public contact", url: "https://www.offthatcouchfitness.com/" }, { title: "Founder and coaching team", url: "https://www.offthatcouchfitness.com/about" }, { title: "Club membership and affiliations", url: "https://www.offthatcouchfitness.com/clubmembership" }, { title: "September 2026 local programme", url: "https://www.offthatcouchfitness.com/post/off-that-couch-fitness-september-racing-and-training-sessions-swim-bike-run-and-team-park-run" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.offthatcouchfitness.com/", sports: ["Running", "Triathlon", "Swimming"] },
    location_note: "Ask the club which venue applies to the chosen activity. The retained Market Rasen directory address has not been established as a regular training start."
  },
  "okehampton-rc": {
    summary: "Okehampton Running Club combines paced group runs, technical training and Dartmoor outings from the Pavilion in Simmons Park, with a separate beginner pathway.",
    biography: [
      "Okehampton Running Club was formed in February 2009 in Okehampton, Devon, England. Its town-and-moor setting shapes a programme that includes road running, woodland tracks, country lanes and Dartmoor outings. Members train in groups led by qualified leaders rather than all following a single pace.",
      "Tuesday club nights focus on steady running, while Thursdays feature technical work such as hills, sprints and distance loops. The usual base is the Pavilion in Simmons Park on Mill Road, with exceptions shown in the timetable. Wednesday moor runs have their own starting points and ability guidance, published through the club's updates.",
      "Ordinary joining guidance asks runners to be able to cover three miles without stopping. People not yet at that stage can enquire about the separate beginner course and progression sessions. The club also has junior activities and a summer race programme including the Oke Croak and Sourton Tors. General, coaching and membership emails help newcomers find the appropriate route."
    ],
    founded_year: 2009,
    sources: [{ title: "Origins, training and joining expectations", url: "https://okehamptonrunningclub.com/about/" }, { title: "Public role contacts", url: "https://okehamptonrunningclub.com/contact-us/" }],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://okehamptonrunningclub.com/", address: "Pavilion in the Park, Mill Road, Okehampton", postcode: "EX20 1GE", address_kind: "training" },
    location_note: "Tuesday and Thursday sessions normally start at the Pavilion in Simmons Park. Moor runs and timetable exceptions have separate starts."
  },
  "oldham-and-royton-h-and-ac": {
    summary: "Oldham and Royton Harriers and Athletic Club has supported local athletics since 1898, with track-and-field, road and cross-country training at Radclyffe.",
    biography: [
      "Oldham and Royton Harriers and Athletic Club was founded in 1898 in the Oldham area of Greater Manchester, England. It describes a family-oriented approach to local athletics, supporting young athletes with competitive ambitions alongside adults returning to sport for fitness.",
      "The club is based at Radclyffe Sports Centre, with an outdoor 400-metre track and indoor sprint facility. Its published programme lists Monday and Thursday evenings, with volunteer coaches working with groups from ten years old through to senior athletes. Road running and cross-country competition complement the track-and-field programme.",
      "Members are encouraged to compete both individually and for club teams, but training is intended to develop fitness and technique at an appropriate rate. The general enquiry email is the best starting point for checking a suitable group and current arrangements. The website retains older administrative wording, so newcomers should confirm the timetable and admission details before travelling to a first session."
    ],
    founded_year: 1898,
    sources: [{ title: "Club history, facilities and programme", url: "https://www.oldhamroytonharriers.co.uk/about-us/" }, { title: "Club enquiry address", url: "https://www.oldhamroytonharriers.co.uk/contact-us/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.oldhamroytonharriers.co.uk/", address_kind: "training" },
    contact_note: "Confirm the current group and timetable by email; the club's public information contains older administrative terminology."
  },
  "olney-runners-ac": {
    summary: "Olney Runners combines coached town runs, Milton Keynes track sessions and a junior section with social running and community fundraising in Buckinghamshire.",
    biography: [
      "Olney Runners is a volunteer-run club serving Olney and nearby Buckinghamshire villages in England. Its programme brings together people new to running and experienced competitors, with coaching, social outings and a separate junior section. Members take part in events ranging from parkruns and 5Ks to cross-country, fell races and ultramarathons.",
      "Wednesday club sessions meet in Olney Market Place and use local roads, parks and countryside paths. The programme also includes fortnightly Monday track sessions at Stantonbury in Milton Keynes, strength-and-stretch work and conversational social runs. Members use Spond to book and check session details.",
      "Newcomers submit their details before a taster so the club can help them choose a suitable group. Ordinary adult sessions are eighteen-plus; younger athletes have their own joining route. Social events and charity fundraising are part of club life, including a July 2026 running day at Emberton Park that raised more than six hundred pounds for Al's Pals."
    ],
    sources: [{ title: "Volunteer club and activities", url: "https://www.olneyrunners.org.uk/about" }, { title: "Session venues and booking", url: "https://www.olneyrunners.org.uk/coaching-schedule" }, { title: "Adult and junior membership routes", url: "https://www.olneyrunners.org.uk/membership-information" }, { title: "July 2026 community fundraising", url: "https://www.olneyrunners.org.uk/" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.olneyrunners.org.uk/", address: "Market Place, Olney", address_kind: "training" },
    location_note: "Wednesday sessions meet in Olney Market Place; track sessions use Stantonbury in Milton Keynes. Check Spond for the chosen activity.",
    contact_note: "Adult sessions are eighteen-plus; the club has a separate junior section. Submit an enquiry before a taster."
  },
  "on-the-run-aylesbury-and-pitstone": {
    summary: "On The Run Aylesbury and Pitstone offers shared membership across two Buckinghamshire bases, with social running, road and trail sessions and beginner courses.",
    biography: [
      "On The Run Aylesbury and Pitstone is a community running club in Buckinghamshire, England. Its two bases give members access to running around Aylesbury and Pitstone under one membership, rather than requiring them to join two separate organisations.",
      "The programme includes road, trail and track running, supported by qualified run leaders. Couch to 5K courses provide a starting point for new runners, while other sessions and programmes help members work towards 10K, half-marathon and marathon goals. The club emphasises encouragement and celebrating progress at different fitness levels.",
      "The Aylesbury base is the tennis and squash club on Wendover Road. Pitstone's regular runs are on Tuesdays, with details listed through the upcoming-runs page. Members from either base can attend the other's sessions. Newcomers can email the club to discuss their experience and check a suitable run before joining through the website."
    ],
    sources: [{ title: "Club programme, Aylesbury base and email", url: "https://www.ontherun.me.uk/" }, { title: "Pitstone sessions and shared membership", url: "https://www.ontherun.me.uk/pitstone" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Aylesbury", county: "Buckinghamshire", address: "Aylesbury Tennis and Squash Club, Wendover Road, Aylesbury", postcode: "HP21 9NJ", address_kind: "training" },
    location_note: "The listed address is the Aylesbury base. Pitstone runs have separate meeting details; one membership covers both."
  },
  "orchard-eagles-running-club": {
    summary: "Orchard Eagles Running Club has grown from eight Eaglescliffe runners in 2014 into a Teesside community offering road, trail, beginner and return-to-running sessions.",
    biography: [
      "Orchard Eagles Running Club was founded in July 2014 by eight runners in Eaglescliffe, in the Stockton-on-Tees area of England. It became affiliated later that year and developed a programme drawing members from nearby Yarm, Middlesbrough, Ingleby Barwick and other Teesside communities.",
      "The first beginner course finished in 2016, and an eight-week return-to-running course was introduced in 2024. Sessions mix hills, speed and distance with road and trail routes. Members participate in cross-country, local races, parkruns and longer challenges, including Hardmoors events, without making competition a requirement for belonging.",
      "Club sessions are held on Mondays, Wednesdays and Thursdays, with individual bookings and starts shown in BookFit. Larger gatherings often use the car park behind Eaglescliffe Community Centre at Orchard shops, but other venues are also used. Prospective runners can email the club or use its enquiry form to discuss a beginner, returning-runner or regular training group."
    ],
    founded_year: 2014,
    sources: [{ title: "Club origins and development", url: "https://www.orchardeaglesrunningclub.co.uk/about-us" }, { title: "Current meeting points and enquiries", url: "https://www.orchardeaglesrunningclub.co.uk/contact" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Eaglescliffe", address: "Car park behind Eaglescliffe Community Centre, Orchard shops, Eaglescliffe", postcode: "TS16 0EH", address_kind: "training" },
    location_note: "The community-centre car park is used for larger meet-ups, not every session. Confirm the start in BookFit."
  },
  "orion-harriers": {
    summary: "Orion Harriers has run from Chingford and Epping Forest since 1911, combining road, woodland and track training with junior athletics and long-standing club races.",
    biography: [
      "Orion Harriers was formally established in September 1911 in Chingford, now part of London, England. Its roots lay in runs organised by Orion Gymnastics Club members Joe Spicer and Frankie Harriss four years earlier. The club later developed traditions including mob matches from 1920 and the Mercury race, first recorded in 1913.",
      "The clubhouse at Jubilee Retreat on Bury Road gives access to Epping Forest. Today's programme includes paced Wednesday groups, track and hill sessions, Sunday endurance runs and marathon preparation. In 2011, members of Walthamstow Athletics Club joined Orion as that older club's membership declined.",
      "Prospective members can try two sessions before joining. Wednesday's beginner and returning-runner group provides one route into the club, while junior enquiries are handled separately: the published minimum ages are eight for track and twelve for cross-country. Check the club app and relevant session details before attending. There is no clubhouse parking; nearby parking is independently operated."
    ],
    founded_year: 1911,
    notable_members: [{ name: "Joe Spicer", connection: "Early organiser", detail: "Orion's history identifies Spicer as one of the gymnastics-club members organising Chingford runs before the running club's formal 1911 foundation." }, { name: "Frankie Harriss", connection: "Early organiser", detail: "Harriss is named alongside Joe Spicer in the club's account of its pre-1911 running origins." }],
    sources: [{ title: "Origins and Walthamstow connection", url: "https://www.orionharriers.com/club-history/" }, { title: "Current programme", url: "https://www.orionharriers.com/" }, { title: "Trials, junior ages and contacts", url: "https://www.orionharriers.com/contact-2/" }, { title: "Clubhouse location", url: "https://www.orionharriers.com/find-us/" }],
    reviewed_at: "2026-10-15", corrections: { city: "Chingford", website: "https://www.orionharriers.com/", address_kind: "training" }
  },
  "orpington-road-runners": {
    summary: "Orpington Road Runners has combined sociable Tuesday running with Kent competition since 1985, with track sessions and year-round High Elms countryside outings.",
    biography: [
      "Orpington Road Runners was formed in 1985 by David Cross, Gillian Else and Alan Else in Orpington, England. Its earliest runners gathered by a local pub for Tuesday evening runs. That simple weekly meeting remains central to the club, alongside a much broader racing and social programme.",
      "Tuesday groups leave from the green near the Buff pub, with different distances and paces. Wednesday training uses Norman Park track, while the High Elms Runners On Sunday outings explore local countryside. The club's history records its men's Kent Grand Prix victory in 2018 and the women's second place that year; these are historical team achievements, not current standings.",
      "New members can try several sessions after contacting the club and should be able to run at least 5K for ordinary groups. A separate BeginnORRs course is available through the website. Social events and member-organised outings help people find running company beyond club nights, while current session details explain venues and any separate track charges."
    ],
    founded_year: 1985,
    notable_members: [{ name: "David Cross", connection: "Co-founder", detail: "The club's history credits Cross with founding Orpington Road Runners in 1985 alongside Gillian and Alan Else." }, { name: "Gillian Else", connection: "Co-founder", detail: "Named in the official history as one of the club's three 1985 founders." }, { name: "Alan Else", connection: "Co-founder", detail: "Named in the official history as one of the club's three 1985 founders." }],
    sources: [{ title: "Founders and club history", url: "https://www.orpingtonroadrunners.org.uk/about" }, { title: "Session venues", url: "https://www.orpingtonroadrunners.org.uk/running" }, { title: "Trials and membership", url: "https://www.orpingtonroadrunners.org.uk/join-us" }],
    reviewed_at: "2026-10-15", corrections: { website: "https://www.orpingtonroadrunners.org.uk/" },
    location_note: "Tuesday runs meet on the green near the Buff pub. Track sessions use Norman Park and Sunday countryside runs start at High Elms; confirm the chosen session."
  },
  "orwell-panthers-ac": {
    summary: "Orwell Panthers offers inclusive athletics in Ipswich, adapting running, jumping and throwing sessions with specialist equipment and coaching at Northgate.",
    biography: [
      "Orwell Panthers Athletics Club began in 2003 and was formally established in 2004 in Ipswich, Suffolk, England. Its founders included Sandra Cheatham and Mitzi Read. The club's purpose is to make athletics accessible, with particular experience supporting athletes with disabilities and participation in Paralympic and Special Olympics pathways.",
      "Wednesday sessions at Northgate combine running, jumping and throwing. Coaches adapt activities to individual needs and can provide or access equipment such as running frames, sports wheelchairs and throwing chairs. Training is about fitness, confidence and friendships as well as competition, so newcomers do not need an established racing background.",
      "The membership page welcomes people from eight years old and offers up to three booked trial sessions before joining. Families and prospective athletes can use the club email to discuss support and equipment needs. Check the calendar before travelling: the current autumn programme lists indoor sessions at Northgate High School, within the wider Northgate site."
    ],
    founded_year: 2004,
    notable_members: [{ name: "Sandra Cheatham", connection: "Co-founder", detail: "The club's official history names Cheatham among the people who formally established Orwell Panthers in 2004, after activities began in 2003." }, { name: "Mitzi Read", connection: "Co-founder and club chair", detail: "The official history identifies Read as a 2004 co-founder and the current roles page lists her as chairperson, as checked in October 2026." }],
    sources: [{ title: "Club origins and founders", url: "https://www.orwellpanthers.co.uk/about" }, { title: "Adapted athletics and current venues", url: "https://www.orwellpanthers.co.uk/training" }, { title: "Age range and trial arrangements", url: "https://www.orwellpanthers.co.uk/members" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Ipswich", address: "Northgate Sports Centre, Sidegate Lane, Ipswich", postcode: "IP4 3DL", address_kind: "training", website: "https://www.orwellpanthers.co.uk/" },
    location_note: "Check the calendar for the exact Northgate facility. Autumn 2026 indoor sessions are listed at Northgate High School, Sidegate Lane."
  }
};
