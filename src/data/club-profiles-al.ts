import type { ClubProfile } from "./club-profiles";

// Primary club and governing-body sources opened on 15 October 2026.
export const localParticipationAndHeritageProfiles: Record<string, ClubProfile> = {
  "british-airways-ac": {
    summary: "Concorde Runners AC, formerly British Airways AC, is an independent Heathrow-area club for road running, cross-country, relays and track and field.",
    biography: [
      "Concorde Runners Athletics Club is the present name of British Airways Athletics Club, whose beginnings lie among employees running around Heathrow in west London, England. Founder John Williams recalled how informal lunchtime and after-work groups developed into a club in 1981. His history links those early years with the London Marathon, airline races and the growth of the club's marathon-marshalling teams.",
      "The club now operates independently of British Airways and BA Clubs. Its June 2026 membership guidance welcomes new members while expecting a connection with the airline, existing members or the Heathrow area. That is distinct from the former employee-only arrangement, and from eligibility restrictions that may still apply to particular airline events.",
      "Activities span road running, cross-country, track and field, relays and informal club events. A weekly digest keeps runners connected, with socials and volunteering alongside competition. Prospective members should contact the membership secretary and use the current application form. Venues vary by event; the older Harrow directory street address is not a verified training base."
    ],
    founded_year: 1981,
    notable_members: [{ name: "John Williams", connection: "Founder member and historical club president", detail: "Wrote the club's account of its early years around 2019, identifying himself as a founder member and club president at that time." }],
    sources: [
      { title: "Founder’s account and current independent name", url: "https://www.barunner.org.uk/Club_History.shtml" },
      { title: "June 2026 membership and eligibility", url: "https://www.barunner.org.uk/Club_Membership.shtml" },
      { title: "Club activities", url: "https://www.barunner.org.uk/" },
      { title: "Digest, contacts and public Facebook page", url: "https://www.barunner.org.uk/Club_Contacts.shtml" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Heathrow-area club with changing event and meeting locations. The previous Harrow street address was not confirmed as a current training venue and is not mapped.",
    corrections: { name: "Concorde Runners AC (formerly British Airways AC)", source_names: ["British Airways AC", "Concorde Runners AC"], website: "https://www.barunner.org.uk/", city: "Heathrow area", address: "", postcode: "", address_kind: "directory", location_precision: "area-only" }
  },
  "bromsgrove-and-redditch": {
    summary: "Bromsgrove & Redditch Athletic Club offers coached track and field, road running and cross-country from Abbey Stadium and the Ryland Centre.",
    biography: [
      "Bromsgrove & Redditch Athletic Club was formed in early 1962 when the two Worcestershire town clubs amalgamated. Frank Cardy became its first chairman, and founder members helped prepare the Abbey Stadium site for a cinder track in 1963. Those beginnings are distinct from the later all-weather facilities used by today's club in Bromsgrove and Redditch, England.",
      "Coaching covers running, jumping and throwing, with junior development groups and senior sprint, distance and throws training. Abbey Stadium in Redditch and the Ryland Centre in Bromsgrove are separate training bases. Members represent the club in track-and-field, road and cross-country competition, including regional junior, senior and masters leagues. Social activities and an annual awards evening sit alongside the competitive programme.",
      "The current membership page sets a minimum joining age of nine and offers two free taster sessions once a suitable coach and group are available. Some groups have waiting lists. Applicants should send the enquiry form before attending and confirm their coach's session time and venue. Regular attendance and competition for the club are membership expectations, rather than optional extras. The older history page's age-ten wording is not used in place of the current joining guidance."
    ],
    founded_year: 1962,
    notable_members: [{ name: "Frank Cardy", connection: "First chairman", detail: "The club history identifies Cardy as the first chairman following the early-1962 amalgamation." }],
    sources: [
      { title: "1962 merger and early committee", url: "https://bromsgroveandredditchac.org.uk/information/club-history/" },
      { title: "Current eligibility, taster sessions and competition expectations", url: "https://bromsgroveandredditchac.org.uk/membership/" },
      { title: "Two training locations", url: "https://bromsgroveandredditchac.org.uk/training/" },
      { title: "Role contacts", url: "https://bromsgroveandredditchac.org.uk/contact-2/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Abbey Stadium is the Redditch training base. Wednesday sessions are also listed at the Ryland Centre, New Road, Bromsgrove; confirm the appropriate venue and time with the assigned coach.",
    corrections: { website: "https://bromsgroveandredditchac.org.uk/", address: "Abbey Stadium, Birmingham Road, Redditch", address_kind: "training" }
  },
  "broxbourne-runners": {
    summary: "Broxbourne Runners offers adult running, coached sessions and road and cross-country league racing from Broxbourne Sports Club in Hertfordshire.",
    biography: [
      "Broxbourne Runners is an adult running club in Broxbourne, Hertfordshire, England, based at the sports club on Mill Lane Close. It brings together newcomers and experienced distance runners, with a programme that connects regular coached practice to road races, winter cross-country and summer relays.",
      "Wednesday evening sessions work on speed, stamina and strength. Friday morning running bridges the gap before the longer Sunday endurance outings, while optional yoga and Pilates provide separate opportunities for mobility and core work. The club lists Mid Week League road races, winter cross-country fixtures and a summer 3K relay among its membership activities.",
      "Prospective members can arrange a free Wednesday taster through the enquiry form or club administration email. Membership includes access to Broxbourne Sports Club, although optional classes have additional charges. The homepage and joining page display different subscription prices, so newcomers should confirm the current amount rather than rely on either figure. The site's contrasting age-of-club and history statements also leave its exact founding year unresolved."
    ],
    sources: [
      { title: "Weekly programme and club enquiries", url: "https://www.broxbournerunners.com/" },
      { title: "Taster sessions and membership activities", url: "https://www.broxbournerunners.com/join" },
      { title: "Club background with unresolved date", url: "https://www.broxbournerunners.com/about" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { adult_only: true, address_kind: "clubhouse" }
  },
  "bushfield-runners": {
    summary: "Bushfield Runners combines social and competitive running in Peterborough, with leisure-centre club nights, track sessions and Ferry Meadows outings.",
    biography: [
      "Bushfield Runners is a Peterborough running club in Cambridgeshire, England, welcoming people who want to race as well as those running for fitness and company. Its regular base is Bushfield Leisure Centre, where members use an upstairs meeting room alongside the changing facilities, showers and lockers.",
      "Tuesday and Thursday evenings form the core club-running programme. The published training page adds track sessions on the first and third Wednesdays of the month, summer preparation for the Great Eastern event, and weekend running at Ferry Meadows. Competition includes the winter Frostbite cross-country series, while chip runs, seasonal outings and club socials give members reasons to meet beyond race day.",
      "Newcomers can complete the online application or contact the club through its public enquiry email and form. The website invites visitors to ask for Bushfield Runners at the leisure centre. It gives conflicting postcodes for that venue, so the centre name and a confirmed meeting arrangement are more useful than an assumed exact postal location."
    ],
    sources: [
      { title: "Club introduction, facilities and community activities", url: "https://www.bushfield-runners.co.uk/" },
      { title: "Weekly and seasonal training programme", url: "https://www.bushfield-runners.co.uk/training" },
      { title: "Public enquiries and conflicting venue postcodes", url: "https://www.bushfield-runners.co.uk/contact-us" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Bushfield Leisure Centre is the club-night base. The site uses both PE2 5RQ and PE2 5UW; the exact postcode is left empty pending clarification. Track and Ferry Meadows sessions use separate locations.",
    corrections: { address: "Bushfield Leisure Centre, Peterborough", postcode: "", address_kind: "training" }
  },
  "brandon-fern-hoppers": {
    summary: "Brandon Fern Hoppers is a social trail-running club using Thetford Forest, with roots in a 1989 community fundraising race in Brandon.",
    biography: [
      "Brandon Fern Hoppers grew out of a community fundraising 10K held in Brandon, Suffolk, England, on 29 May 1989. After the race, runners proposed forming a local group, and the first meeting followed on 2 June. The club history credits Ray Obas with organising the new group; the Fern Hoppers name was adopted later after Derek Haden suggested it during a conversation at the leisure centre.",
      "Thetford Forest gives the club much of its character. Tuesday social runs typically cover three to six miles, while Thursday sessions can include hills, pace work, sprints or time trials. Sunday outings provide another social option. Meeting points change with the season: the library car park is used for winter Tuesdays, Mayday's Fire Road 6 car park for summer Tuesdays, and Brandon Country Park for Sundays.",
      "Visitors are encouraged to try a few sessions before joining and to contact the club first, since locations can change. The club asks runners to bring emergency contact details and wear high-visibility clothing for dark winter outings. Its website also carries the Wibbly Wobbly Log Jog event information, alongside a downloadable membership form and a general enquiry form."
    ],
    founded_year: 1989,
    notable_members: [
      { name: "Ray Obas", connection: "Founding organiser", detail: "The club's history credits Obas with organising the first running group after the May 1989 fundraising race." },
      { name: "Derek Haden", connection: "Early member and name originator", detail: "An early participant who later suggested Fern Hoppers among the possible club names, according to Sally Dormer's account in the club history." }
    ],
    sources: [
      { title: "Club origins and later naming", url: "https://bfh.org.uk/club-history/" },
      { title: "Trial runs and training approach", url: "https://bfh.org.uk/joining-us/" },
      { title: "Seasonal meeting locations", url: "https://bfh.org.uk/where-we-meet/" },
      { title: "Forest-running introduction and club event", url: "https://bfh.org.uk/" },
      { title: "Enquiry form", url: "https://bfh.org.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The retained Brandon Library car park address is the winter Tuesday meeting point, not a year-round headquarters. Summer Tuesdays and Sunday runs use separate forest locations; confirm Thursday sessions with the club.",
    corrections: { address_kind: "training" }
  },
  "city-of-southend-on-sea-ac": {
    summary: "City of Southend-on-Sea Athletic Club offers sprint, endurance, jumping and throwing coaching at Garon Park, with junior and masters participation.",
    biography: [
      "City of Southend-on-Sea Athletic Club traces its roots to meetings at George Hogsflesh’s home in Westcliff in 1905. The original Southend Harriers went on their first cross-country run that October. In 1937, Southend and County Harriers joined with Leigh-on-Sea Harriers, founded in 1912, to form Southend-on-Sea Athletic Club. The merger is a later chapter, not the beginning of athletics in the club’s history.",
      "The Essex club now trains at Garon Park in Southend-on-Sea, England. Qualified coaches work across sprints, endurance, jumps and throws, with track access on Tuesday and Thursday evenings and Sunday mornings. A junior academy introduces primary-school-age children to athletics, while masters and league competition offer routes for older athletes to stay involved.",
      "Prospective members complete the club’s membership request so volunteers can arrange a taster session and explain the next steps. Its programme also includes local events such as the Boxing Day Pier Race and Southend 10K. Garon Park is the training base; the older Westcliff directory address should not be used as a training venue."
    ],
    founded_year: 1905,
    notable_members: [{ name: "George Hogsflesh", connection: "Founding organiser", detail: "Hosted the 1905 meetings that led to the original Southend Harriers, a predecessor of the present club." }],
    sources: [
      { title: "Club origins and 1937 amalgamation", url: "https://southendac.co.uk/club-history/" },
      { title: "Coaching, academy and events", url: "https://www.southendac.co.uk/" },
      { title: "Membership and taster process", url: "https://southendac.co.uk/memberships-process/" },
      { title: "Training venue and enquiries", url: "https://southendac.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Southend-on-Sea", address: "Southend Leisure and Tennis Centre, Garon Park, Eastern Avenue, Southend-on-Sea", postcode: "SS2 4FA", address_kind: "training" }
  },
  "cove-joggers": {
    summary: "Cove Joggers is an adult social running club in Farnborough, with weekday runs, Sunday outings and a walking option.",
    biography: [
      "Cove Joggers brings together adult runners in Cove, Farnborough, Hampshire, England. Its emphasis is on company and enjoyment rather than a single racing standard: people of different abilities run together, encourage one another on longer outings and make time for conversation afterwards.",
      "The club lists runs on Tuesday and Thursday evenings, exploring Farnborough and nearby places including Hawley Woods, North Camp, Frimley, Mytchett and Fleet Pond. Sunday mornings combine local or further-afield runs with a walking option and a hot drink afterwards. These changing routes are part of the club’s appeal, so a listed directory address is not a guarantee of the next meeting point.",
      "Newcomers can try a few runs before deciding whether to join. The club asks prospective runners to use its contact form or public enquiry email to arrange a visit. Its published Facebook and Instagram channels provide another way to find the club, while the public website’s upcoming-runs section is the starting point for session details."
    ],
    sources: [{ title: "Club introduction, activities and trial enquiries", url: "https://www.covejoggers.co.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "Runs use changing local and further-afield routes. Confirm the meeting point with the club; the retained directory address was not reconfirmed as a current session start.",
    corrections: { adult_only: true }
  },
  "crystal-palace-triathletes": {
    summary: "Crystal Palace Triathletes supports adult and junior swimming, cycling and running in south-east London, with coached trials and club racing.",
    biography: [
      "Crystal Palace Triathletes was established in 1993 in south-east London, England. The Crystal Palace Sports Partnership records its organisation of the Crystal Palace Triathlon in the park from 2005. The club combines swimming, cycling and running with a junior programme, an age-group league and championships across several triathlon and related multisport distances.",
      "Its training programme includes coached sessions for adults and juniors, with a seasonal progression from general fitness and technique towards race-specific practice. Members can take part in the Triathlon London League as well as club competitions. Training uses facilities in and around Crystal Palace rather than one venue for every activity; the weekly calendar should be checked before attending.",
      "Adults can register for a two-week trial with tokens for introductory sessions. The trial excludes uncoached Sunday rides and Monday swims. Full membership offers all-inclusive or pay-as-you-go training arrangements, with some additional charges. The junior section, which counts Alex Yee among its former members, requires a booked swim trial, the ability to swim twenty-five metres continuously and to ride a bike. Contact the junior coordinator to confirm current age-group arrangements; the page retains a 2025 age-transition note."
    ],
    founded_year: 1993,
    notable_members: [{ name: "Alex Yee", connection: "Former junior member", detail: "The club’s junior membership page identifies Yee as a former member of its junior section." }],
    sources: [
      { title: "Sports partnership club history", url: "https://cpsp2020.com/clubs-at-the-nsc/" },
      { title: "Club activities and leagues", url: "https://crystalpalacetriathletes.com/" },
      { title: "Training and secretary contact", url: "https://crystalpalacetriathletes.com/training" },
      { title: "Trial restrictions and membership", url: "https://crystalpalacetriathletes.com/membership" },
      { title: "Junior entry requirements and Alex Yee association", url: "https://crystalpalacetriathletes.com/juniors" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Training takes place in and around Crystal Palace. The national sports centre is one facility, not the start point for every swim, ride or run.",
    corrections: { website: "https://crystalpalacetriathletes.com/", sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling", "Aquabike"] }
  },
  "crediton-running-network": {
    summary: "Crediton Running Network offers mixed-distance club runs and fitness sessions from Crediton Town Square and helps stage the Crediton Crunch.",
    biography: [
      "Crediton Running Network is a community running club in Crediton, Devon, England. It welcomes people at different stages, from newer runners to those already comfortable with marathon distances, and places shared enjoyment at the centre of its weekly programme.",
      "The club’s current website lists Monday and Wednesday evening sessions from Crediton Town Square. Monday offers a choice of runs of roughly three-and-a-half to six miles; Wednesday focuses on running and fitness work. Visitors are welcome, with an early arrival requested before the session begins. The Town Square meeting point supersedes the older Commercial Road directory address.",
      "The club also contributes to local racing through the Crediton Crunch. The organiser’s 2026 entry page describes a predominantly off-road 10K and identifies Crediton Running Network among its marshal providers. That event used Queen Elizabeth School’s Barnfield site as race headquarters, a separate location from ordinary club training. Prospective runners can use the club’s enquiry form to confirm a suitable first session."
    ],
    sources: [
      { title: "Current club programme", url: "https://creditonrunningnetwork.connectmyclub.co.uk/" },
      { title: "Town Square location and enquiry form", url: "https://creditonrunningnetwork.connectmyclub.co.uk/contact" },
      { title: "Organiser’s 2026 Crediton Crunch information", url: "https://www.sientries.co.uk/event/crediton-crunch-10k-2026-2026" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { website: "https://creditonrunningnetwork.connectmyclub.co.uk/", address: "Town Square, Crediton", postcode: "EX17 2BN", address_kind: "training" }
  },
  "athletics-ireland-ballyskenach-a-c": {
    summary: "Ballyskenach AC is a juvenile and senior athletics club serving south Offaly, with a road-racing role in the Offaly 5K series.",
    biography: [
      "Ballyskenach Athletic Club serves young athletes and adults in south Offaly, Ireland. Athletics Ireland describes it as a juvenile and senior club and lists its training location at Timeighter, with a Roscrea postal address. The postal county and the area served should not be confused: the club’s own directory description places its community in south Offaly.",
      "Beyond regular athletics, Ballyskenach organises a 5K road race within the Offaly series. The timing and entry provider’s 2026 event page describes a route through the grounds of Our Lady of Silence Abbey and post-race hospitality at Roscrea Rugby Club. These are race locations, not evidence that either is the club’s everyday training base.",
      "Athletics Ireland’s club page provides the membership application route and a public club telephone number. Families and senior runners should confirm the appropriate group and current session arrangements before attending; the available primary sources do not establish a weekly timetable or a reliable founding year."
    ],
    sources: [
      { title: "Athletics Ireland club description, venue and joining", url: "https://membership.athleticsireland.ie/clubpage/Ballyskenach_A.C." },
      { title: "Pop Up Races: 2026 club 5K", url: "https://www.popupraces.ie/race/offaly-5k-road-series-2026-ballyskenach-ac-5km/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Athletics Ireland lists Timeighter, Roscrea, E53 EA25 for training and describes the club as based in south Offaly. Race headquarters at Roscrea Rugby Club are separate.",
    corrections: { city: "Ballyskenach / Roscrea", address_kind: "training" }
  },
  "bromley-veterans-ac": {
    summary: "Bromley Veterans AC welcomes runners and athletes aged thirty and over, combining road, cross-country and track-and-field activity with a Beckenham clubhouse base.",
    biography: [
      "Bromley Veterans Athletics Club grew out of a group of Bromley Ladies AC members who wanted more opportunities to compete together as veterans. In September 1989, around fourteen women left to establish a mixed club. Blue and gold became its colours, and men joined the original group during the first year.",
      "Today the club is based at the Parklangley Club in Beckenham, Greater London, England, and welcomes people aged thirty and over, from beginners to experienced competitors. Road running, cross-country and track and field sit alongside organised training and social activity. The clubhouse provides changing facilities and somewhere to meet after runs; access to its gym requires separate membership.",
      "New runners can contact the membership secretary to arrange a visit and discuss a suitable group. The club’s calendar covers weekday and weekend activity, and its history records anniversary fundraising for local and national charities. Its present Beckenham base is distinct from the Norman Park and Bromley Town Squash Club meeting places described in its early history."
    ],
    founded_year: 1989,
    sources: [
      { title: "Current club introduction and age threshold", url: "http://www.bromleyvetsac.org.uk/" },
      { title: "Formation by former Bromley Ladies members", url: "http://www.bromleyvetsac.org.uk/AboutUs/History" },
      { title: "Parklangley facilities", url: "http://www.bromleyvetsac.org.uk/AboutUs/Facilities" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Beckenham", address: "The Parklangley Club, 44A Wickham Way, Beckenham", address_kind: "clubhouse", adult_only: true }
  },
  "broseley-joggers": {
    summary: "Broseley Joggers offers road and off-road running around Broseley and Ironbridge, with seasonal meeting points and groups for different abilities.",
    biography: [
      "Broseley Joggers was formed in 2013 by local people with different running ambitions and a shared interest in getting out together. Based in Shropshire, England, the club runs through Broseley and Ironbridge, using the area’s hills and, in drier summer months, the paths of Benthall Woods.",
      "The club welcomes runners aged sixteen and over and offers Tuesday and Thursday evening outings. Leaders use different routes and paces, with looping back to support less experienced runners. The start changes with the seasons: Broseley Library car park after the spring clock change, and the Station car park by the Iron Bridge after the autumn clock change. Neither address should be treated as a year-round start for every run.",
      "Prospective members can try a club run before completing the online membership form. The club distinguishes England Athletics-registered membership from social membership and provides a public enquiry form and Facebook group. Volunteers run the committee and lead sessions, with the club describing leader training as an important part of sustaining its local programme."
    ],
    founded_year: 2013,
    sources: [
      { title: "Current age range and seasonal locations", url: "https://broseleyjoggers.org.uk/" },
      { title: "Club origins and volunteer leadership", url: "https://broseleyjoggers.org.uk/about-running-club/" },
      { title: "Trial runs and membership", url: "https://broseleyjoggers.org.uk/join-our-club/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Summer: Broseley Library car park, TF12 5EQ. Winter after the autumn clock change: Station car park by the Iron Bridge, TF8 7JP. Confirm the session’s start.",
    corrections: { address_kind: "training" }
  },
  "bury-athletic-club": {
    summary: "Bury Athletic Club provides track, field and endurance coaching from Market Street, with competitive junior membership and recreational options for seniors.",
    biography: [
      "Bury Athletic Club is a volunteer-run athletics charity based at the Market Street track opposite Bury College in Greater Manchester, England. Its programme covers running, jumping and throwing, alongside cross-country, road racing and fell running. Members range from recreational senior runners to athletes competing at national level.",
      "Coaching normally begins at age seven, with Tuesday and Thursday training divided into age and event groups and additional weekend opportunities depending on the season. The club makes an important distinction between its sections: seniors may choose a non-competitive membership, while juniors are expected to commit to competing for the club. Volunteers also help stage local competitions and support schools and community activity.",
      "New athletes request a taster through the joining page. Up to four taster sessions are offered, but the normal training charge applies; they are not advertised as free trials. Membership and training payments are managed through Attendli, and a public club email and secretary’s telephone provide routes for questions. Families should confirm the right group and availability before arriving."
    ],
    sources: [
      { title: "Volunteer club, charity and participation", url: "https://buryac.co.uk/" },
      { title: "Disciplines, training and minimum age", url: "https://buryac.co.uk/about-the-club/" },
      { title: "Taster fees and membership categories", url: "https://buryac.co.uk/join-us/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Bury", address_kind: "training" }
  },
  "buckingham-and-stowe-rc": {
    summary: "Buckingham & Stowe Running Club welcomes adults for varied pace-group training, recreational running and longer-distance or triathlon goals.",
    biography: [
      "Buckingham & Stowe Running Club brings together adult runners in Buckingham, Buckinghamshire, England. Its current introduction includes both running and triathlon interests, from run–walk beginnings to marathon, ultra-distance and Ironman ambitions. The common thread is training with others rather than having to meet one competitive standard.",
      "The main Tuesday run starts from the rear of Waitrose at Cornwall Meadows. Some pace groups also meet on Mondays and Thursdays, with locations that can vary. Sessions include paced runs, hills, intervals, out-and-back routes and occasional summer track work at Stowe, giving members different ways to develop their running.",
      "Membership is open from age eighteen. Newcomers can try up to three free sessions and are asked to email beforehand with their intended visit and an outline of their current running. Club competitions, the Buckingham Half Marathon and social activity provide opportunities beyond the weekly runs. The published meeting point is a run start, not a claim that the club owns premises there."
    ],
    sources: [
      { title: "Club community and activities", url: "https://buckinghamrunningclub.com/" },
      { title: "Adult membership and first-run arrangements", url: "https://buckinghamrunningclub.com/membership-information/" },
      { title: "Training formats", url: "https://buckinghamrunningclub.com/training/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The rear of Waitrose at Cornwall Meadows is the main Tuesday meeting point. Other sessions, including occasional Stowe track training, may start elsewhere.",
    corrections: { adult_only: true, address_kind: "training", sports: ["Running", "Athletics", "Triathlon"] }
  },
  "brackley-and-district-rc": {
    summary: "Brackley & District Running Club offers road, trail and cross-country running, structured weekday sessions and a gentle-pace group.",
    biography: [
      "Brackley & District Running Club began with an inaugural meeting in February 2008, bringing local Northamptonshire runners together to share experience and support. Andy Howe was its founding chair, and Darren Long was among the original officers. Both were later recognised with lifetime membership for their contribution to the club.",
      "Based in Brackley, England, the club runs on Tuesday and Thursday evenings, normally from Brackley Leisure Centre unless a session notice says otherwise. Training mixes paced routes, hills and intervals, with more local trails in summer. Its Gentle Pace Group is welcoming but not a complete-beginner course: the published expectation is the ability to cover four miles at approximately ten to eleven-and-a-half minutes per mile.",
      "New runners may attend three sessions before joining. Members take part in road races, cross-country and longer-distance events, while the club organises the Brackley Chicken Run, first held in 2010. The history records charitable donations from that event as well as the development of handicap competitions that give runners of different speeds a way to compete together."
    ],
    founded_year: 2008,
    notable_members: [
      { name: "Andy Howe", connection: "Founding chair and lifetime member", detail: "Elected chair at the February 2008 inaugural meeting and awarded lifetime membership in 2012." },
      { name: "Darren Long", connection: "Co-founder and lifetime member", detail: "An original club officer, awarded lifetime membership in 2015 for his contribution since co-founding the club." }
    ],
    sources: [
      { title: "Club welcome and trials", url: "https://www.brackleyrunningclub.co.uk/" },
      { title: "Founders, events and community history", url: "https://brackleyrunningclub.co.uk/history/" },
      { title: "Session venues and Gentle Pace Group threshold", url: "https://brackleyrunningclub.co.uk/club-sessions/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Brackley Leisure Centre is the normal meeting point unless the session notice specifies another start. Summer routes may use other local venues.",
    corrections: { sports: ["Running"], address_kind: "training" }
  },
  "burnham-joggers": {
    summary: "Burnham Joggers combines coached and social running from Burnham Bowls Club with beginner support, local races and its longstanding Staggered Jog.",
    biography: [
      "Burnham Joggers began in November 1978 when local GP Bob Green and his wife Sammy helped establish a jogging club in Burnham, Buckinghamshire, England. The early group used Burnham Hall and introduced a shared warm-up known as the Social Mile. Founder Russell Brown devised the Staggered Jog, a handicap run first held in January 1979 that rewarded individual improvement.",
      "After several changes of headquarters, the club now meets at Burnham Bowls Club on Stomp Road. Tuesday and Thursday evenings offer coached sessions or group runs at different paces, with a social element alongside training. Members pursue distances from shorter road races to marathons and ultras, and newcomers can be paired with a buddy for their first sessions.",
      "The club offers trial visits and an annual beginners and improvers course, with enquiries handled through its website. It also organises the Beaconsfield 5, Burnham Beeches Half Marathon and 10K, and Cliveden cross-country event. These races and the Staggered Jog sit alongside ordinary club running; prospective members should check current session and course arrangements rather than rely on historical schedules."
    ],
    founded_year: 1978,
    notable_members: [
      { name: "Bob Green", connection: "Co-founder", detail: "The local GP helped establish Burnham Joggers in November 1978 and introduced its Social Mile warm-up." },
      { name: "Sammy Green", connection: "Co-founder", detail: "Helped establish the club with Bob Green and was among the five runners at the first Staggered Jog in January 1979." },
      { name: "Russell Brown", connection: "Founding secretary and event organiser", detail: "Devised the Staggered Jog handicap and organised it over many years before handing over in 2015." }
    ],
    sources: [
      { title: "Current training, buddy support and races", url: "https://www.burnhamjoggers.co.uk/" },
      { title: "Club and Staggered Jog history", url: "https://burnhamjoggers.co.uk/history/" },
      { title: "Current clubhouse and enquiries", url: "https://burnhamjoggers.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Burnham Bowls Club, Stomp Road, Burnham", postcode: "SL1 7NA", address_kind: "training" }
  },
  "buxton-ac": {
    summary: "Buxton Athletic Club supports senior and junior running across road, fell, trail, cross-country and track in the High Peak.",
    biography: [
      "Buxton Athletic Club was founded in 1977 by Chris Bent, whom the club’s current account identifies as its president. Serving Buxton and the surrounding High Peak in Derbyshire, England, it combines the local landscape’s fell and trail opportunities with road, cross-country and track activity.",
      "The senior section welcomes adults who want social miles, structured training or competition. Its junior programme covers ages seven to eighteen and emphasises progressive coaching and confidence as well as running skills. The club’s own events include the Buxton Half Marathon and Carnival 4, bringing its volunteers and runners into the town’s wider sporting calendar.",
      "Prospective senior members can try a session before applying, while families are encouraged to contact the junior team about availability and a suitable group. The public contact form routes enquiries to membership, coaching-related and other club volunteers. Session venues should be confirmed with the club; no single training address is established by the pages reviewed here."
    ],
    founded_year: 1977,
    notable_members: [{ name: "Chris Bent", connection: "Founder and club president", detail: "The club records him as its 1977 founder and identifies him as president in its current club account." }],
    sources: [
      { title: "Club origins and disciplines", url: "https://buxtonac.org.uk/our-club/" },
      { title: "Senior and junior joining", url: "https://buxtonac.org.uk/membership/" },
      { title: "Club races and community", url: "http://www.buxtonac.org.uk/" },
      { title: "Enquiry routing", url: "https://buxtonac.org.uk/contact/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Buxton", county: "Derbyshire", website: "https://buxtonac.org.uk/" }
  },
  "east-essex-triathlon-club": {
    summary: "East Essex Triathlon Club offers swimming, cycling and running across south Essex, with adult and junior activity and session-specific age limits.",
    biography: [
      "East Essex Triathlon Club began in 1981 as Courtlands Triathlon Club, formed by a handful of squash-club members interested in the emerging sport. It adopted the East Essex name in 1983 as participation grew. Today it serves the Southend, Basildon and Rochford areas of Essex, England, while welcoming members from further afield.",
      "Training is spread across several venues. The current programme lists Monday coached swimming at Runnymede Pool in Thundersley for ages fifteen and over, and Tuesday running at Basildon Sporting Village with separate adult and children’s groups. Children’s swim coaching is currently not running. Cycling includes winter adult group rides and announced junior sessions at Ford’s Dunton test track; informal open-water meet-ups are not described as coached club sessions.",
      "Newcomers can arrange a short trial period, with the membership secretary asking swimmers to confirm attendance beforehand. The club also stages the Basildon Aquathlon, East Essex Kids Triathlon and Grays Triathlon. Participation and personal goals are central to its published approach, but families should check the specific age limits and availability for each discipline rather than assume every session serves every age."
    ],
    founded_year: 1981,
    sources: [
      { title: "Origins, name change and club events", url: "https://www.east-essex-tri-club.co.uk/about-us" },
      { title: "Current training and junior swimming restriction", url: "https://www.east-essex-tri-club.co.uk/training" },
      { title: "Public role contacts", url: "https://www.east-essex-tri-club.co.uk/contact-us" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Running uses Basildon Sporting Village; Monday swimming uses Runnymede Pool, Thundersley. Cycling has separate venues. The former Benfleet directory street address is not confirmed as a training site.",
    corrections: { city: "Basildon / Southend / Rochford", address: "", postcode: "", location_precision: "area-only", sports: ["Running", "Triathlon", "Duathlon", "Aquathlon", "Swimming", "Cycling"] }
  },
  "t3-triathlon-club": {
    summary: "T3 Triathlon Club is a Dublin multisport community with documented involvement in beginner participation and women’s club leadership programmes.",
    biography: [
      "T3 Triathlon Club is based in Dublin, Ireland, and brings together swimming, cycling and running. Triathlon Ireland’s April 2023 introduction described a small, welcoming club for different fitness levels and identified UCD Sport and Fitness at Belfield as its training location at that time.",
      "That year T3 joined Piranha and 3D Triathlon in a six-week women’s beginner programme supported by Triathlon Ireland. The programme combined club sessions, skills coaching and preparation for TriAthy. It is a documented example of the club’s work with newcomers, not an open invitation to enrol in that completed course or a statement of current prices.",
      "T3 also contributed to the 2022 Making Waves leadership programme through Sara Spencer and Laura Thompson, both named by Triathlon Ireland. Prospective members should use the club’s published contact channels to confirm today’s timetable, training locations and membership arrangements. The older UCD description and programme eligibility are retained as historical context rather than assumed to govern all current club activity."
    ],
    notable_members: [
      { name: "Sara Spencer", connection: "Club leadership participant, 2022", detail: "Named for T3 by Triathlon Ireland among participants in the 2022 Making Waves Club Leadership Programme." },
      { name: "Laura Thompson", connection: "Club leadership participant, 2022", detail: "Named for T3 by Triathlon Ireland among participants in the 2022 Making Waves Club Leadership Programme." }
    ],
    sources: [
      { title: "Club-contributed introduction and 2023 beginner programme", url: "https://www.triathlonireland.com/news/dublin-womens-triathlon-programme/" },
      { title: "2022 club leadership programme", url: "https://www.triathlonireland.com/news/the-2022-making-waves-club-leadership-programme/" },
      { title: "Triathlon Ireland club directory", url: "https://www.triathlonireland.com/get-involved/find-a-club/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "UCD Belfield is named in a 2023 programme account, not independently confirmed as today’s venue. Confirm current arrangements with the club.",
    corrections: { city: "Dublin" }
  },
  "mako-tc": {
    summary: "Mako Tri Club serves Skerries and nearby north Dublin towns, with documented contributions to club leadership and local sporting volunteering.",
    biography: [
      "Mako Tri Club is a swimming, cycling and running club serving Skerries and surrounding towns in County Dublin, Ireland. Triathlon Ireland’s directory places it in that area and provides a club enquiry contact. A precise training venue and current weekly timetable are not established by the sources reviewed here.",
      "The club’s community role is visible in primary accounts beyond race results. Andrea Campbell represented Mako in the 2022 Making Waves Club Leadership Programme, which supported women developing governance, volunteer recruitment and club planning skills. Fingal County Council subsequently recognised David Flynn of Mako Triathlon Club among its sporting volunteers at the inaugural Fingal Sports Awards in January 2025.",
      "People interested in joining should ask Mako about the appropriate membership and training group, including any swimming or cycling experience needed. Its Triathlon Ireland directory contact offers a starting point for finding the right session and meeting place. The leadership programme and volunteer award describe contributions at particular points in the club's history, rather than current committee appointments."
    ],
    notable_members: [
      { name: "Andrea Campbell", connection: "Club leadership participant, 2022", detail: "Represented Mako in the Making Waves Club Leadership Programme documented by Triathlon Ireland." },
      { name: "David Flynn", connection: "Recognised club volunteer, 2025", detail: "Listed by Fingal County Council as Mako Triathlon Club’s volunteer at the inaugural January 2025 Fingal Sports Awards." }
    ],
    sources: [
      { title: "Triathlon Ireland club location and contact", url: "https://www.triathlonireland.com/get-involved/find-a-club/" },
      { title: "2022 Making Waves club leadership", url: "https://www.triathlonireland.com/news/the-2022-making-waves-club-leadership-programme/" },
      { title: "Fingal’s January 2025 volunteer recognition", url: "https://www.fingal.ie/news/first-fingal-sports-awards-celebrate-local-heroes" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Skerries and surrounding towns" }
  }
};
