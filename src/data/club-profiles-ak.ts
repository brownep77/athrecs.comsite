import type { ClubProfile } from "./club-profiles";

// Primary club and governing-body sources opened 14–15 October 2026.
// Editorial associations only: no athlete identity or result records are created.
export const communityContinuityProfiles: Record<string, ClubProfile> = {
  "barton-and-district-ac": {
    summary: "Barton & District AC combines track and field, road running and cross-country, with roots in the town’s school and cricket-ground athletics.",
    biography: [
      "Barton & District Athletics Club was founded in 1952 by geography teacher Ralph Clark in Barton-upon-Humber, Lincolnshire, England. Its early athletes trained around the cricket ground, and village handicap meetings were part of the local competition scene. The club later made Baysgarth School its base as athletics moved towards more specialised facilities.",
      "The club’s history brings together sprinters, distance runners, hurdlers and throwers. It records Bradley Donkin’s return to the sport and his appearance in the 800 metres final at the 1998 Commonwealth Games. It also celebrates Mark Ding’s international para-athletics career, including competing at the Atlanta Paralympics in 1996. These are historical club connections, not assertions about present competitive membership.",
      "Today the programme includes track and field, road running and cross-country, supported by coaches, run leaders and other volunteers. Adults can use the membership form and membership email. The junior and youth membership page advertises limited places and a waiting-list enquiry route, so families should contact the junior team before attending. Baysgarth School is the club base; the older Barrow-upon-Humber directory address should not be mistaken for the training venue."
    ],
    founded_year: 1952,
    notable_members: [
      { name: "Bradley Donkin", connection: "Historical club athlete", detail: "The club history records his appearance in the 1998 Commonwealth Games 800 metres final." },
      { name: "Mark Ding", connection: "Club athlete and coach", detail: "The club history describes his international para-athletics career, including the 1996 Atlanta Paralympics." }
    ],
    sources: [
      { title: "Club history", url: "https://www.barton-district-ac.co.uk/club-history/" },
      { title: "Membership and junior waiting list", url: "https://www.barton-district-ac.co.uk/membership/" },
      { title: "Club base and contacts", url: "https://www.barton-district-ac.co.uk/contact-us/" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Barton-upon-Humber", address: "Baysgarth School, Barrow Road, Barton-upon-Humber", postcode: "DN18 6AE", address_kind: "training" }
  },
  "basildon-ac": {
    summary: "Basildon Athletic Club offers volunteer-led track and field, cross-country and junior sportshall athletics at Basildon Sporting Village.",
    biography: [
      "Basildon Athletic Club provides athletics in Basildon, Essex, England, from school year five through to senior and veteran age groups. Its website dates the club’s beginnings to 1955. Basildon Sporting Village in Gloucester Park is its training base, with a floodlit track supporting evening sessions through the winter.",
      "The programme covers most track and field disciplines rather than distance running alone. Younger athletes can also take part in sportshall meetings, while the competition calendar includes the Essex Youth Athletics League and Southern Athletics League in summer and the Essex Cross Country League in winter. Coaches, officials and helpers work as volunteers.",
      "Training is normally held on Monday and Wednesday evenings, with additional Saturday sessions offered by some coaches. Prospective members should complete the club’s trial request form, identifying the events that interest them. The club then agrees a suitable date and group; a trial is not an invitation to turn up at any session without arranging it first."
    ],
    founded_year: 1955,
    sources: [
      { title: "Club introduction and origins", url: "https://www.basildonathleticsclub.com/" },
      { title: "Athletics programme", url: "https://www.basildonathleticsclub.com/about" },
      { title: "Trial form and venue", url: "https://www.basildonathleticsclub.com/join-us" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Basildon Sporting Village, Gloucester Park, Cranes Farm Road, Basildon", postcode: "SS14 3GR", address_kind: "training" }
  },
  "basingstoke-and-mid-hants-ac": {
    summary: "Basingstoke & Mid Hants AC offers athletics and endurance running at Down Grange, with a history of reformation and club merger.",
    biography: [
      "Basingstoke & Mid Hants Athletic Club serves Basingstoke, Hampshire, England, through track and field, road running and cross-country. Its history reaches back to a club formed in 1921, disbanded at the outbreak of war in 1939 and reformed in July 1948. The merger with Mid Hants AC followed in October 1990, so those earlier dates describe different stages of the club’s development.",
      "Reg Eade’s club history recalls grass-track athletics, local carnival meetings and the growth of league competition. It identifies Janet Ruff as an outstanding early athlete whose 440-yard performances in the 1950s were world bests, before women’s records at that distance were formally recognised. Later international athletes named in the account include Linda Keough, subsequently Linda Staines.",
      "Down Grange is the regular training base, with Tuesday and Thursday sessions for different age and event groups. Road and trail runners have their own contact route, while younger athletes enter age-appropriate coaching groups. The published joining guidance includes waiting lists for junior groups and asks prospective members to make contact first. Volunteers also support coaching, officiating and club administration."
    ],
    notable_members: [
      { name: "Janet Ruff", connection: "Historical club athlete", detail: "The club history records her 1950s 440-yard world-best performances, before formal women’s world records at that distance." },
      { name: "Linda Keough (Staines)", connection: "Historical club international", detail: "Named in Reg Eade’s history among club athletes who gained Olympic and Commonwealth Games selection." }
    ],
    sources: [
      { title: "Reg Eade’s club history", url: "https://bmhac.co.uk/club-history/" },
      { title: "Training groups and waiting lists", url: "https://bmhac.co.uk/training/" },
      { title: "Membership and role contacts", url: "https://bmhac.co.uk/membership/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Down Grange is the training base. The 1921 predecessor, 1948 reformation and 1990 merger are distinct milestones.",
    corrections: { address: "Down Grange Sports Complex, Basingstoke", postcode: "RG22 5SN", address_kind: "training" }
  },
  "beccles-and-bungay-harriers": {
    summary: "Beccles & Bungay Harriers offers family athletics, junior development and adult running on the Suffolk–Norfolk border.",
    biography: [
      "Beccles & Bungay Harriers Athletics Club brings together runners and young athletes around Beccles and Bungay on the Suffolk–Norfolk border in England. Its family-oriented programme includes adult road and endurance groups, older junior running and sprint sessions, and running, jumping and throwing for children aged seven to eleven.",
      "Tuesday and Thursday training uses several local venues. Thursday sessions are based at Sir John Leman High School in Beccles, with grass-track and winter facilities. Tuesday arrangements vary by season and group around Earsham, Bungay and Ellingham. The club’s general introduction and detailed training page give different summer locations, so newcomers should confirm their session’s meeting point directly.",
      "Members take part in local road races, parkruns and cross-country, including the Suffolk Winter League. Qualified coaches and run leaders support the sessions, while a volunteer committee organises club activities. Joining and session bookings use LoveAdmin, with a membership enquiry email available for help. Published fee information spans older seasons, making the membership team the best source for current charges."
    ],
    sources: [
      { title: "Club and family athletics", url: "https://www.becclesandbungayharriers.org.uk/about-us/" },
      { title: "Training groups and seasonal venues", url: "https://www.becclesandbungayharriers.org.uk/club-training/" },
      { title: "Membership and booking", url: "https://www.becclesandbungayharriers.org.uk/join-us/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Sir John Leman High School is the Thursday venue. Tuesday locations vary; club pages disagree about the summer site, so confirm before travelling.",
    corrections: { address: "Sir John Leman High School, Ringsfield Road, Beccles", postcode: "NR34 9PG", address_kind: "training" }
  },
  "beckenham-running-club": {
    summary: "Beckenham Running Club combines adult social running, coached sessions, cross-country and team racing from Beckenham Sports Club.",
    biography: [
      "Beckenham Running Club is based at Beckenham Sports Club on Foxgrove Road in Beckenham, England. Wednesday evenings are the main social-running night: members gather before a seven o’clock start and choose from group-led routes of different distances and paces. Changing rooms, showers and the club bar make it a place to meet as well as run.",
      "Monday training provides more focused fitness and speed work. Members also join parkruns, road races from five kilometres to the marathon, cross-country and team relays. The club runs a monthly handicap in Beckenham Place Park and a Grand Prix series, and organises a team relay for local clubs and other teams.",
      "The club is for adults and describes its regular running range as roughly fifteen to thirty minutes for five kilometres. People new to running should consult its beginner guidance rather than assume every group is a start-from-scratch course. Prospective members can email before trying a Wednesday evening; affiliated, associated and other membership options cater for different racing and social interests."
    ],
    sources: [
      { title: "Club runs and competition", url: "https://www.beckenhamrunning.co.uk/" },
      { title: "Membership options", url: "https://www.beckenhamrunning.co.uk/membership" },
      { title: "Public enquiries and venue", url: "https://www.beckenhamrunning.co.uk/contact-us" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { adult_only: true, address: "Beckenham Sports Club, Foxgrove Road, Beckenham", postcode: "BR3 5AS", address_kind: "training" }
  },
  "bedale-and-aiskew-runners": {
    summary: "Bedale & Aiskew Runners is an adult running and walking community with road, cross-country and fell-running interests.",
    biography: [
      "Bedale & Aiskew Runners was formed in 2007 in North Yorkshire, England. The club welcomes adults aged eighteen and over and brings together people interested in road running, cross-country and fell running. It also has a speed-walking section, offering another way to take part in its weekly activity.",
      "Wednesday is the main group-running evening, with the club publishing an early-evening meeting at Chantry Hall in Bedale. More specialised running activities take place on Mondays. Its stated approach is to accommodate different abilities without leaving runners behind, supported by qualified running-group leaders.",
      "An online membership form provides the route into the club, and a dedicated membership email is available for questions. Club championships and social participation give members opportunities beyond the regular runs. Chantry Hall is a meeting point rather than evidence that every training session starts there; newcomers should check the arrangements for their first visit."
    ],
    founded_year: 2007,
    sources: [
      { title: "Club introduction and meeting point", url: "https://bedaleandaiskewrunners.org.uk/" },
      { title: "Origins, activities and adult membership", url: "https://bedaleandaiskewrunners.org.uk/aboutus/" },
      { title: "Joining for 2026/27", url: "https://bedaleandaiskewrunners.org.uk/membership-and-programs/membership/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Chantry Hall is the published Wednesday meeting point; confirm the venue for other sessions.",
    corrections: { adult_only: true, address_kind: "training" }
  },
  "belper-running-club": {
    summary: "Belper Running Club offers volunteer-led running groups, early-morning trails and a monthly Peak District walking group.",
    biography: [
      "Belper Running Club is a volunteer-run community in Belper, Derbyshire, England. It describes its running as open to different paces and abilities, from first steps to experienced runners, with groups and programmes aimed at goals such as distance, pace and race preparation. A monthly walking club explores the Peak District at a gentler pace.",
      "The main Monday run meets in the rear car park of Belper Leisure Centre shortly before seven in the evening. The club also lists an early Wednesday trail run from Morrisons in Belper, while walking trips and other runs use different meeting points. These are session locations, not a single clubhouse serving every activity.",
      "Before attending, new runners are asked to complete the membership form, receive the club’s reply and join its communications group. This lets leaders know who to expect and share the right session details. The public enquiry email and joining page provide a direct route to the volunteers; the club’s website also explains that its activities are run on a charitable, volunteer basis."
    ],
    sources: [
      { title: "Club purpose and activities", url: "https://belperrunningclub.weebly.com/" },
      { title: "Joining procedure", url: "https://belperrunningclub.weebly.com/contact.html" },
      { title: "Meeting points and attendance requirements", url: "https://belperrunningclub.weebly.com/club-meeting-information.html" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Belper Leisure Centre is the Monday meeting point. Wednesday trails and monthly walks start elsewhere; complete joining arrangements before attending.",
    corrections: { website: "https://belperrunningclub.weebly.com/", address_kind: "training" }
  },
  "boru-tc": {
    summary: "Boru Tri Club supports adult swimming, cycling and running around Killaloe, Ballina and Lough Derg.",
    biography: [
      "Boru Tri Club serves Killaloe and Ballina, the neighbouring communities on the Clare–Tipperary border in Ireland. Its swim, bike and run activities welcome adults ranging from newcomers seeking fitness to athletes preparing for triathlons and longer-distance challenges. Experienced members mentor new arrivals, with introductory sessions offered during the year.",
      "Lough Derg is central to the club’s outdoor swimming, while running sessions use Clarisford Park and leisure cycles explore the surrounding area. The published timetable distinguishes summer open-water and evening cycling from winter arrangements. Its pages disagree about whether organised running continues through July and August, so the club should confirm seasonal availability.",
      "Membership is for people aged eighteen and over and is arranged through Triathlon Ireland, selecting Boru as the club. The club explains the distinction between racing and non-racing membership and the need for appropriate cover for organised sessions. Social activities and support between members are part of the experience alongside training and the club’s Brian Boru triathlon activity."
    ],
    sources: [
      { title: "Club community and mentoring", url: "https://www.borutriclub.ie/about/" },
      { title: "Seasonal training", url: "https://www.borutriclub.ie/training-timetable/" },
      { title: "Adult membership", url: "https://www.borutriclub.ie/membership/" },
      { title: "Club events", url: "https://www.borutriclub.ie/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "Activities use locations around Killaloe/Ballina and Lough Derg. Confirm the seasonal timetable; no single clubhouse address is established.",
    corrections: { city: "Killaloe / Ballina", adult_only: true }
  },
  "newry-triathlon-club": {
    summary: "Newry Triathlon Club has a documented tradition of coached beginner development and community swimming, cycling and running.",
    biography: [
      "Newry Triathlon Club brings together swimming, cycling and running in the Newry area of Northern Ireland. A first-hand account published by Triathlon Ireland in March 2022 describes a club where coached sessions and encouragement from fellow members helped newcomers progress towards their first triathlon.",
      "That account documents the Coached to Crooked Lake programme, which prepared beginners for the local June triathlon, and the club’s development of a junior section. It also describes the surrounding training landscape: Camlough Lake, Carlingford Lough and the Mourne and Cooley mountains. Those details are historical context, not a current timetable or an assurance that every venue is available for a club session.",
      "Karen Lewis joined the club in 2019 and was its chair when interviewed in 2022. Nominated by Newry, she was elected Triathlon Ireland’s first female president at the April 2026 AGM. Prospective members should use the club’s public contact channels to confirm current coaching groups, junior places and joining arrangements rather than rely on the older interview’s weekly schedule."
    ],
    notable_members: [{ name: "Karen Lewis", connection: "Club member; chair in the 2022 account", detail: "Joined in 2019, described her chair role in a 2022 interview, and was elected Triathlon Ireland’s first female president in April 2026 following nomination by Newry." }],
    sources: [
      { title: "First-hand club account, March 2022", url: "https://www.triathlonireland.com/news/my-triathlon-karen-lewis/" },
      { title: "April 2026 presidential election", url: "https://www.triathlonireland.com/news/karen-lewis-elected-president/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The named lakes and mountains come from a 2022 club interview, not a confirmed current session timetable.",
    corrections: { city: "Newry" }
  },
  "hi-elbow-tc": {
    summary: "Hi Elbow Triathlon Club is an Antrim swimming, cycling and running club with a documented history of organising Brown’s Bay Beast.",
    biography: [
      "Hi Elbow Triathlon Club is associated with County Antrim in Northern Ireland. Its current public website presents swimming, cycling and running as its three activities and provides an enquiry form for people wanting to contact the club. It does not publish enough detail to establish a current training timetable or exact clubhouse address.",
      "A club-contributed report published by Triathlon Ireland in July 2016 records Hi Elbow organising Brown’s Bay Beast on Islandmagee. The coastal event combined a sea swim, a demanding cycle around the peninsula and a run, supported by marshals, local organisations and the borough council. The account shows the club’s role as an event organiser as well as a training community.",
      "That race report is a historical milestone, not confirmation that the event continues in the same format today. Anyone interested in joining should ask the club about current session locations, experience requirements and membership arrangements. Race participants named in the old report are not automatically Hi Elbow members, and no such association is inferred here."
    ],
    sources: [
      { title: "Club website and enquiry form", url: "https://hielbow.club/" },
      { title: "Club-contributed 2016 event account", url: "https://www.triathlonireland.com/news/2016/northerners-show-true-grit-at-browns-bay-beast/" }
    ],
    reviewed_at: "2026-10-15"
  },
  "narrows-triathlon-club": {
    summary: "Narrows Triathlon Club is a Portaferry and Ards Peninsula swim, bike and run community with a national-series podium connection.",
    biography: [
      "Narrows Triathlon Club is based around Portaferry and the Ards Peninsula in County Down, Northern Ireland. Its website welcomes people interested in entering triathlon or improving their fitness through swimming, cycling and running, and directs enquiries to the club’s Facebook page.",
      "The published training outline describes coastal open-water swimming in summer, pool swimming in Bangor in winter, running from Portaferry and group cycling. However, the page also retains COVID-era notices and older race headings. It is useful background to the club’s activities, but prospective members should obtain an up-to-date timetable before travelling or joining a session.",
      "The club has a documented competitive connection through Daniel McManus, identified by Triathlon Ireland as a Narrows member when he finished third in the men’s 2022 Triathlon National Series. That is a dated sporting association, not evidence of his current membership. Club communications remain the appropriate route for current training arrangements and participation requirements."
    ],
    notable_members: [{ name: "Daniel McManus", connection: "Documented 2022 club member", detail: "Triathlon Ireland identified him with Narrows when reporting his third place in the men’s 2022 Triathlon National Series." }],
    sources: [
      { title: "Club introduction and dated training outline", url: "http://www.narrowstc.co.uk/" },
      { title: "2022 national-series report", url: "https://www.triathlonireland.com/news/mens-2022-national-series-goes-to-donncha-kiely/" }
    ],
    reviewed_at: "2026-10-15",
    contact_note: "The website retains COVID-era notices. Ask the club for the current timetable rather than treating its older session list as current.",
    corrections: { city: "Portaferry" }
  },
  "bell-and-harp-running-club": {
    summary: "Bell & Harp Running Club combines social running and interval training in Little Eaton, with the village pub as its regular meeting point.",
    biography: [
      "Bell & Harp Running Club is based in Little Eaton, Derbyshire, England. Its regular Thursday evening run starts from the Bell & Harp pub car park on Alfreton Road, with members often staying afterwards to socialise. The pub is a meeting base, rather than a club-owned athletics facility.",
      "The programme includes Tuesday interval training at varying locations and Thursday social runs, with sessions intended for different abilities. Members take part in local races and relays, and the club also promotes its own Chase event. The emphasis is on enjoying running together while providing opportunities to improve and compete.",
      "New runners are offered two taster sessions before joining. The club publishes social and affiliated membership options, alongside junior membership for ages twelve to seventeen linked to an adult or guardian membership. Families should check the arrangements with the club rather than treat junior membership as an unsupervised drop-in session. The public enquiry email provides a route to the organising volunteers."
    ],
    sources: [{ title: "Club sessions, membership and contact details", url: "https://bhrc24.com/" }],
    reviewed_at: "2026-10-15",
    corrections: { city: "Little Eaton", county: "Derbyshire", address: "Bell & Harp pub, 227 Alfreton Road, Little Eaton", postcode: "DE21 5AE", address_kind: "training" }
  },
  "benfleet-rc": {
    summary: "Benfleet Running Club offers adult running, beginner programmes and junior athletics, and organises the Benfleet 15.",
    biography: [
      "Benfleet Running Club is based in South Benfleet, Essex, England. Its own account records a twenty-fifth anniversary in 2015 and describes a community that welcomes both regular racers and people running mainly for fitness. The Benfleet 15 is a longstanding part of its event-organising activity.",
      "The junior and youth sections began in 2007. The younger section covers ages eight to twelve and includes running, jumping and throwing, while the twelve-to-eighteen youth section focuses on road, cross-country and trail running. Adults can take part in club training, beginner programmes, races and away trips.",
      "Published training plans and club communications help members choose sessions, with separate arrangements for the different age groups. The contact form routes enquiries to coaching, new members, membership and junior or youth organisers. Prospective runners should use that route to confirm their starting point and current programme; older membership totals and past training plans are not treated as a live statement of capacity."
    ],
    sources: [
      { title: "Club background and anniversary", url: "https://benfleetrunningclub.co.uk/about-2/" },
      { title: "Junior and youth sections", url: "https://benfleetrunningclub.co.uk/" },
      { title: "Role-based enquiry form", url: "https://benfleetrunningclub.co.uk/about-2/club-contacts/" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The Brook Road address is retained from the governing-body directory; the club’s current meeting-point page did not expose enough detail to independently confirm it."
  },
  "bentham-beagles-running-club": {
    summary: "Bentham Beagles brings together road and trail runners in North Yorkshire, with local races and a sociable club programme.",
    biography: [
      "Bentham Beagles Running Club was formed on 4 October 2011 in Bentham, North Yorkshire, England. It welcomes novice and experienced runners and lists Bentham Golf Club on Robin Lane as its clubhouse base. The Lancaster postal area does not make this a Lancaster city club.",
      "Tuesday and Thursday are the regular club nights. Most weeks offer a road route on Tuesday and a choice of road and trail running on Thursday, with qualified volunteers among those supporting the club. Members also arrange weekend outings and social events, including winter gatherings and championship presentations.",
      "Organising races is part of club life, including a ten-kilometre event and the Halloween Tricks, Treats & Trails race. Prospective members can contact the club and try a run or two before deciding to join. First-claim, second-claim and social options are published, with the club explaining that social membership does not provide a competition licence."
    ],
    founded_year: 2011,
    sources: [
      { title: "Club origins, training, events and clubhouse", url: "https://www.benthambeagles.co.uk/" },
      { title: "Current membership options", url: "https://www.benthambeagles.co.uk/membership" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { city: "Bentham", address: "Bentham Golf Club, Robin Lane, High Bentham", postcode: "LA2 7AG", address_kind: "clubhouse" }
  },
  "bexley-ac": {
    summary: "Bexley Athletic Club provides junior and adult athletics at Erith Stadium, continuing the club founded as Erith and District AC in 1954.",
    biography: [
      "Bexley Athletic Club began in 1954 as Erith and District AC in south-east London, England. It later became Bexley Borough AC before dropping Borough from its name in December 1999. International runner Gordon Pirie was its first president, and the club continues to associate his name with its middle-distance trophy.",
      "Erith Stadium on Avenue Road is the club’s base for track and field. Road running and cross-country add opportunities away from the track, while the Bexley Tigers introduce children from age six and school year one to athletics. Older juniors and adults train in appropriate coaching groups, and the road-running section is for adults over eighteen.",
      "Prospective members can arrange up to two taster sessions, but some groups operate waiting lists. The club asks people to get in touch before visiting so that interests and capacity can be checked. Membership and training charges are separate, and athletes train under their allocated coach. Opportunities to learn coaching and officiating help sustain the club’s community programme."
    ],
    founded_year: 1954,
    notable_members: [{ name: "Gordon Pirie", connection: "First club president", detail: "The club history names the international runner as its first president; this is a presidential association, not a claim of competitive membership." }],
    sources: [
      { title: "Club history", url: "https://www.bexleyac.org.uk/?page_id=59" },
      { title: "Membership and age groups", url: "https://www.bexleyac.org.uk/?page_id=5475" },
      { title: "Stadium and enquiries", url: "https://www.bexleyac.org.uk/?page_id=76" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Erith Stadium, Avenue Road, Erith", postcode: "DA8 3AT", address_kind: "training" }
  },
  "biggleswade-ac": {
    summary: "Biggleswade Athletic Club trains in Sandy, offering track and field, cross-country and road running from junior to adult level.",
    biography: [
      "Biggleswade Athletic Club serves the Bedfordshire area of England from the athletics track in Sandy. Its history links the club’s early-1950s formation to athletics and grass-track cycling meetings organised by the old Biggleswade Horticultural Society. The same account gives both 1950 and 1951, so an exact founding year is not settled here.",
      "The club moved from its old Fairfield base to Stratton Upper School and then to Sandy in 2004. The all-weather track opened in September 2005, and the club took on its management and maintenance in 2011. Founder Des Ball is remembered for decades of work that helped keep the club going through difficult periods.",
      "The present programme includes track and field, cross-country and road running. Little Bees begins at age eight, while adult distance and multi-terrain groups are intended for runners able to cover at least five kilometres. Newcomers can enquire through the joining form to discuss suitable groups and trial sessions. The Sandy track is the training venue despite the club’s Biggleswade name."
    ],
    notable_members: [{ name: "Des Ball", connection: "Founder and long-serving club volunteer", detail: "The club history credits his sustained work over fifty years with helping the club survive its difficult 1970s and 1980s period." }],
    sources: [
      { title: "Club history and Sandy track", url: "https://www.biggleswadeac.org.uk/the-club/history" },
      { title: "Current programme and entry level", url: "https://www.biggleswadeac.org.uk/" },
      { title: "Joining enquiry", url: "https://www.biggleswadeac.org.uk/the-club/join-the-club" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The club trains in Sandy, not at its former Biggleswade sites. Its history contains conflicting 1950/1951 formation dates.",
    corrections: { address: "Athletics track, adjacent to Sandy Secondary School, Engayne Avenue / Medusa Way, Sandy", postcode: "SG19 1BL", address_kind: "training" }
  },
  "birmingham-swifts": {
    summary: "Birmingham Swifts is an LGBTQ+ inclusive adult running club offering free social runs and periodic beginner programmes.",
    biography: [
      "Birmingham Swifts is an LGBTQ+ running club in Birmingham, England, welcoming adults regardless of sexuality or gender. Free Thursday social runs are central to its programme, alongside local parkrun outings and members’ participation in races. The club’s inclusive identity does not imply anything about an individual runner’s personal identity.",
      "Runners should already be comfortable covering several kilometres; the usual Thursday outing is roughly four to five miles. A looping system lets faster runners add distance while keeping the group together. The published run starts at Pagoda Island, with bag drop, changing facilities and social time at The Fox pub on Lower Essex Street. Separate Starting Out courses help people with little or no running experience build towards five kilometres.",
      "The membership guidance specifies a minimum age of eighteen. Free participation, paid supporter membership and optional England Athletics affiliation are distinct choices; paying for affiliation is not a condition of attending the free social sessions. New runners should use the booking or enquiry route to confirm their first run and current meeting point. Volunteer training and equipment are among the activities supported by club funds."
    ],
    sources: [
      { title: "Club ethos, social runs and beginner programme", url: "https://www.birminghamswifts.co.uk/" },
      { title: "Adult membership and participation options", url: "https://birminghamswifts.co.uk/membership/" },
      { title: "Thursday run start and separate bag drop", url: "https://birminghamswifts.co.uk/weekly-runs/thursdays/" }
    ],
    reviewed_at: "2026-10-15",
    contact_note: "Book the Thursday session before attending. Starting Out courses are separate from the regular social run; membership is for adults aged eighteen and over.",
    location_note: "Thursday runs start at Pagoda Island. The Fox, 17 Lower Essex Street, B5 6SN, provides bag drop and social facilities rather than the run start.",
    corrections: { adult_only: true, address: "Pagoda Island, Birmingham", postcode: "", address_kind: "training" }
  },
  "birstall-rc": {
    summary: "Birstall Running Club offers community running from School Lane Playing Fields, with coached sessions and a beginner pathway.",
    biography: [
      "Birstall Running Club is based in Birstall, Leicestershire, England, and welcomes runners from age fourteen upwards. Its stated aims combine local participation, coaching and opportunities to compete. A volunteer committee and other trained members support the programme rather than leaving club activity to a single organiser.",
      "The main Monday evening run meets at the School Lane Pavilion, where changing rooms and showers are available. Routes are typically around an hour, using out-and-back runs or circuits with shorter options. Other sessions meet at different locations, so the route and training calendar matters when choosing a first visit.",
      "The club publishes Couch to 5K information and takes part in the Leicester Road Running League, alongside its Swithland 6 activity. People considering membership are invited to try a running or training session and meet the group. The committee email offers a straightforward way to ask which session fits a runner’s experience and whether a beginner programme is currently taking new participants."
    ],
    sources: [{ title: "Club purpose, training and contacts", url: "https://www.birstallrc.org.uk/" }],
    reviewed_at: "2026-10-15",
    location_note: "School Lane Pavilion is the Monday meeting point. Other sessions use different locations; the former Syston directory address is not used as a training venue.",
    corrections: { city: "Birstall", address: "School Lane Playing Fields, Birstall", postcode: "", address_kind: "training" }
  },
  "bournville-harriers": {
    summary: "Bournville Harriers offers social runs, coached training and team competition from Rowheath Pavilion in Birmingham.",
    biography: [
      "Bournville Harriers was established in 2000 in Birmingham, England. Rowheath Pavilion in Bournville is its base, and the club’s teal vests are familiar at local races, road relays and cross-country meetings. Participation and improvement sit alongside team competition in its stated aims.",
      "Monday club runs explore Bournville and surrounding districts in different pace groups. Coached sessions during the week use effort-based work such as hills, intervals and track running. The club highlights shared target races to encourage members to compete together, while its annual Tealies awards evening celebrates progress and club life.",
      "Newcomers can arrange one or two trial sessions before joining. People starting or returning to running can enquire about the separate Step Into Running course. Members use the club’s communications app for session and race details, and the joining page explains the membership process. Published fee tables refer to an older season, so current costs should be confirmed directly."
    ],
    founded_year: 2000,
    sources: [
      { title: "Club origins", url: "https://bournvilleharriers.org.uk/about-us" },
      { title: "Running and community programme", url: "https://www.bournvilleharriers.org.uk/" },
      { title: "Trials and joining", url: "https://bournvilleharriers.org.uk/join-us" },
      { title: "Venue and enquiry form", url: "https://bournvilleharriers.org.uk/get-in-touch" }
    ],
    reviewed_at: "2026-10-15",
    corrections: { address: "Rowheath Pavilion, Heath Road, Bournville, Birmingham", postcode: "B30 1HH", address_kind: "training" }
  },
  "brj-run-and-tri": {
    summary: "BRJ Run & Tri is a Huntingdon running and triathlon club with junior activity, beginner support and summer open-water swimming.",
    biography: [
      "BRJ Run & Tri is based in Huntingdon, Cambridgeshire, England. It began as BRJ Roadrunners in 1988 and adopted its current name in 2012 as its swimming, cycling and running identity developed. The initials come from the earlier BRJ social club where the runners were originally based, rather than the names of three running-club founders.",
      "The programme combines weekly multisport sessions, a junior section, club championships and winter cross-country through the Frostbite Friendly League. Summer open-water swimming uses Hinchingbrooke Country Park. Fundraising for a chosen charity and regular social events are also part of club life, alongside racing and training.",
      "Prospective members can use the online membership system or the enquiry form and are asked to let the club know before trying a session. Junior membership is published for ages seven to seventeen, although suitable activities should be agreed with the junior team. The lake swimming sessions are for members; the availability of other sessions to non-members does not extend to unrestricted access to those swims."
    ],
    founded_year: 1988,
    sources: [
      { title: "Club origins and activities", url: "https://brjrunandtri.org/" },
      { title: "Membership and swimming restrictions", url: "https://brjrunandtri.org/wp/?page_id=2013" },
      { title: "Club enquiry form", url: "https://brjrunandtri.org/wp/?page_id=2143" },
      { title: "Seasonal multisport training", url: "https://brjrunandtri.org/wp/?page_id=2755" }
    ],
    reviewed_at: "2026-10-15",
    location_note: "The Riverside address is retained from the governing-body directory. Activities use multiple venues, including Hinchingbrooke Country Park for summer swimming; confirm each session’s meeting point.",
    corrections: { sports: ["Running", "Triathlon", "Swimming", "Cycling"] }
  }
};
