import type { ClubProfile } from "./club-profiles";

// Batch 80: recovered club sites, community providers and primary sporting histories.
export const recoveredCommunityAndWalkingProfiles: Record<string, ClubProfile> = {
  "west-end-runners": {
    summary: "West End Runners is an adult running club in Leicester, established in 1984, with road and cross-country competition, Wednesday group runs and coached track sessions.",
    biography: [
      "West End Runners began in Leicester, England, in March 1984 through a community initiative involving Norfolk Street Police Station and Leicester City Council. Its founders wanted to welcome a wider range of runners than the elite-focused clubs of the time. The first gathering was in Dave Lem's running shop, followed by a move to the West End Neighbourhood Centre. Leicester Rowing Club became its base in 1999.",
      "Wednesday club nights start with announcements at the rowing club before runners head out in groups. Members also have coached Monday sessions at Saffron Lane Athletics Stadium. The competitive calendar includes the Leicestershire Road Running League and Derby Runner Cross-Country League, alongside informal and social running.",
      "The club is for adults and asks prospective members to be able to run five miles in under an hour. Anyone not yet at that level can ask its coaches for advice. Contact the membership secretary through the enquiry form before visiting; two Wednesday guest runs are free. The club suggests arriving at 7pm for introductions, ahead of announcements at 7:15 and running at 7:30."
    ],
    founded_year: 1984,
    notable_members: [{ name: "Dave Lem", connection: "Early club host", detail: "The club's history records that its first meeting took place in his running shop. This is a historical contribution, not a claim of current membership." }],
    sources: [{ title: "Club origins, facilities and training", url: "https://westendrunners.co.uk/about/" }, { title: "Membership requirements and trial visits", url: "https://westendrunners.co.uk/about/membership-faqs/" }, { title: "Membership and general enquiry form", url: "https://westendrunners.co.uk/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://westendrunners.co.uk/", address: "Leicester Rowing Club, Upperton Road, Leicester", address_kind: "training" },
    location_note: "The rowing club is the Wednesday meeting base; Monday track sessions use Saffron Lane Athletics Stadium.",
    contact_note: "The contact form routes membership and general enquiries. No direct club email or telephone was established."
  },
  "wheathampstead-warriors": {
    summary: "Wheathampstead Warriors is a Hertfordshire community running club founded in 2016, with adult group runs, Couch to 5K courses and a separate walking group.",
    biography: [
      "Wheathampstead Warriors was started by local runners in 2016 to help more people in Wheathampstead, Hertfordshire, England, enjoy running. An elected village committee runs the club, which welcomes adults aged eighteen and over, from newer runners to people tackling marathons.",
      "Tuesday and Thursday evening runs normally meet at the Memorial Hall on Marford Road at 7:30pm. Volunteer leaders advertise the available groups beforehand, and runners are asked to book rather than arrive unannounced. The membership email is the starting point for arranging a visit; even a trial session requires the free month's trial membership described on the joining page.",
      "The club also runs Couch to 5K courses and offers Walkie Talkies for people who want regular company while walking, whether or not they later progress to running. Its beginner page describes an eleven-week course but still labels 29 April 2025 as the next start. Ask the course team for the next confirmed intake rather than treating that old date as an open booking."
    ],
    founded_year: 2016,
    sources: [{ title: "Club origins and adult membership", url: "https://wheathampsteadwarriors.co.uk/about/" }, { title: "Joining and trial membership", url: "https://wheathampsteadwarriors.co.uk/interested-in-joining-us/" }, { title: "Meeting point and booking arrangements", url: "https://wheathampsteadwarriors.co.uk/where-we-meet/" }, { title: "Beginner programme with dated intake", url: "https://wheathampsteadwarriors.co.uk/couch-to-5k/" }, { title: "Walkie Talkies", url: "https://wheathampsteadwarriors.co.uk/couch-to-5k/walkie-talkies/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://wheathampsteadwarriors.co.uk/", city: "Wheathampstead", address: "Memorial Hall, Marford Road, Wheathampstead", address_kind: "training", adult_only: true },
    location_note: "The Memorial Hall is the published meeting point, not a club-owned clubhouse.",
    contact_note: "The beginner-course date is stale. Membership and Couch to 5K role emails are published separately; no telephone was established."
  },
  "island-tc": {
    summary: "Island TC is an adult triathlon club associated with Coalisland in County Tyrone, Northern Ireland, and listed in Triathlon Ireland's club network.",
    biography: [
      "Island TC brings the swim, bike and run disciplines of triathlon to the Coalisland area of County Tyrone, Northern Ireland. Triathlon Ireland's directory identifies Coalisland as its nearest town and lists the club without a junior section. Its public club enquiry email offers a direct route for prospective adult members.",
      "A recent milestone appears in Triathlon Ireland's inaugural 2026 Triathlon Club Community League: the table updated on 15 October placed Island TC second in Division One. The league rewards club participation as well as performance. Those standings were still subject to affiliation and membership review when checked, with finalisation scheduled for 23 October 2026; they are not presented here as a final award.",
      "Anyone considering joining should ask the club about current swimming, cycling and running sessions, the experience expected and how membership is arranged. A reliable weekly timetable and specific training venues were not available from the club website during this review, so Coalisland is an area indicator rather than a meeting-point address."
    ],
    sources: [{ title: "Triathlon Ireland club location, adult status and enquiry email", url: "https://www.triathlonireland.com/Get-Involved/Find-a-Club/" }, { title: "2026 Community League standings and review qualification", url: "https://www.triathlonireland.com/news/triathlon-club-community-league-divisions-results/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Coalisland", adult_only: true },
    location_note: "Coalisland is the nearest town in Triathlon Ireland's directory, not a verified session venue.",
    contact_note: "Foundation, weekly programme and specific venues remain unresolved. Recheck the provisional 2026 league position after 23 October; no athlete results or identities are created."
  },
  "south-birmingham-striders": {
    summary: "South Birmingham Striders was founded in 2023 and combines sociable running from Longbridge with coached track sessions and road-relay and cross-country opportunities.",
    biography: [
      "South Birmingham Striders was established in 2023 to create an inclusive running community in Birmingham, England. The club welcomes adult runners with different ambitions, from sociable joggers to competitors, and describes participation in national and county cross-country races and road relays during its early years.",
      "The published runs page lists Thursday social runs from Herbert's Yard in Longbridge at 6:30pm and Monday track sessions at the Ryland Centre in Bromsgrove at 7pm. These are separate venues. The membership page also contains an older reference to Abbey Stadium, so newcomers should confirm the current track arrangement with the secretary before travelling.",
      "Runners aged eighteen and over can enquire through the club's form or published secretary email. A couple of trial weeks are offered, with a trial registration form required before attending. The displayed subscription prices are labelled 2024–25 and should not be assumed current. In an April 2025 interview with the Canal & River Trust, club chair Kevin Oakes discussed coaching and the importance of Birmingham's waterways to local running."
    ],
    founded_year: 2023,
    notable_members: [{ name: "Kevin Oakes", connection: "Club chair and coach", detail: "The Canal & River Trust identified him as South Birmingham Striders' chair in its April 2025 coaching interview; the association is dated to that source." }],
    sources: [{ title: "Club foundation and community purpose", url: "https://sbsclub.co.uk/about-us-1" }, { title: "Membership and trial requirements", url: "https://sbsclub.co.uk/membership" }, { title: "Published running and track venues", url: "https://sbsclub.co.uk/runs" }, { title: "Canal & River Trust interview, April 2025", url: "https://canalrivertrust.org.uk/things-to-do/walking/walking-features-and-articles/up-and-running-with-kevin-oakes" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Birmingham", adult_only: true },
    location_note: "Herbert's Yard in Longbridge and the Ryland Centre in Bromsgrove serve different sessions; neither is asserted to be a club-owned clubhouse.",
    contact_note: "Membership fees are labelled 2024–25 and the same page gives conflicting track venues. Confirm both. Retain the existing sourced Instagram link; do not infer a Facebook destination."
  },
  "donnington-runners": {
    summary: "Donnington Runners is a volunteer-led community group in Telford, created through a local health-activities grant and offering weekly fun runs and Couch to 5K activity.",
    biography: [
      "Donnington Runners grew out of the Donnington Partnership's community work in Telford, Shropshire, England. The Partnership says it set up the group using a Health Activities Grant from Telford & Wrekin Council. That funding origin is documented, although a founding year is not given.",
      "The group's emphasis is on helping local people become active through running. Its organiser describes weekly fun runs and an annual Couch to 5K programme, supported by volunteers who are runners themselves. This places the club alongside the Partnership's wider local projects rather than making it a commercial coaching business.",
      "The Partnership's dedicated Donnington Runners page links to the group's Facebook community for current activity and names Debbie as its main contact. Use that route to check the next beginner course, suitable sessions and where to meet. The Community Hub is the catalogue's directory address; the source does not establish that every run begins there."
    ],
    sources: [{ title: "Organiser's account of the running group's origins and activities", url: "https://donningtonpartnership.co.uk/get-involved/donnington-runners/" }, { title: "Donnington Partnership's local community role", url: "https://donningtonpartnership.co.uk/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://donningtonpartnership.co.uk/get-involved/donnington-runners/" },
    location_note: "Donnington Community Hub remains a directory address, not a newly verified start point for weekly runs.",
    contact_note: "No club-specific email, telephone, founding year or current timetable was established. The linked group is the organiser's public enquiry route."
  },
  "seaton-athletic-club": {
    summary: "Seaton Athletic Club serves West Cumbria with athletics for children and adults, combining competition with practical support such as club kit and equipment exchange.",
    biography: [
      "Seaton Athletic Club serves the West Cumbrian athletics community around Workington and Whitehaven, England. Its charity objects focus on community participation through athletics. The catalogue lists Copeland Stadium in Whitehaven, while the Charity Commission publishes a separate correspondence address in Workington; these should not be confused.",
      "England Athletics placed Seaton second in the North West Club of the Year category in September 2026. Its account highlighted support from childhood into adulthood, investment in coaching and officiating, provision of club kit and equipment-exchange initiatives intended to make participation easier.",
      "An older club description, explicitly referring to 2013, records track training in Whitehaven and winter indoor activity in Workington, with coaching across athletics disciplines except pole vault. It is useful historical context, not a dependable current timetable or age policy. Prospective athletes and families should use the published club contact to confirm today's groups, training venues and joining arrangements before attending."
    ],
    sources: [{ title: "England Athletics North West awards, September 2026", url: "https://www.englandathletics.org/news/regional-volunteer-awards-2026-north-west/" }, { title: "Club charitable purpose and public contact", url: "https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/5045915/full-print" }, { title: "Historical club-authored description referring to 2013", url: "https://www.british-athletics.co.uk/clubs/club2157.htm" }],
    reviewed_at: "2026-10-16",
    location_note: "Copeland Stadium is retained from the governing-body directory. The charity's Wastwater Avenue correspondence address is not a training venue.",
    contact_note: "The standalone site was unavailable. The charity's 2014 registration is not a club founding date; its public contact is retained as a charity/club enquiry contact, not a newly confirmed coaching timetable."
  },
  "south-kent-harriers": {
    summary: "South Kent Harriers is a Folkestone-area running club founded in 1987, based at Folkestone Rowing Club in Sandgate and welcoming runners aged sixteen and over.",
    biography: [
      "South Kent Harriers was founded in 1987 and serves runners in the Folkestone and Sandgate area of Kent, England. The club identifies Barry Watson and Mike Hayley as founder members and describes a group welcoming beginners as well as experienced competitors from age sixteen.",
      "Its base is Folkestone Rowing Club on Parade Road in Sandgate. Tuesday evenings focus on technical training and Thursday evenings on a distance run, with members gathering at 6pm to leave at 6:15. The club uses Spond for arrangements, so check the session details before a first visit.",
      "Membership choices distinguish full affiliated membership, with opportunities such as cross-country, track and field and East Kent Road Relays, from social membership covering training and club events. The downloadable form is labelled 2023, so confirm current prices and paperwork through the contact form or the published enquiry telephone. The club also publishes an induction pack and inclusion and welfare documents for prospective members."
    ],
    founded_year: 1987,
    notable_members: [{ name: "Barry Watson", connection: "Founder member", detail: "Named by South Kent Harriers as a founder member; the officials page also identifies him as president and a coach." }, { name: "Mike Hayley", connection: "Founder member", detail: "Named by the club alongside Barry Watson among its founder members. This records the founding association without creating an athlete identity." }],
    sources: [{ title: "Club origins, eligibility and training base", url: "https://southkentharriersfolkestone.webador.co.uk/" }, { title: "Club officials", url: "https://southkentharriersfolkestone.webador.co.uk/club-officials" }, { title: "Membership categories and dated form", url: "https://southkentharriersfolkestone.webador.co.uk/membership" }, { title: "Enquiry form and public telephone", url: "https://southkentharriersfolkestone.webador.co.uk/contact-us" }, { title: "Induction and club documents", url: "https://southkentharriersfolkestone.webador.co.uk/club-info" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://southkentharriersfolkestone.webador.co.uk/", address: "Folkestone Rowing Club, Parade Road, Sandgate", address_kind: "training" },
    location_note: "Folkestone Rowing Club is the published headquarters and run meeting base, not a claimed Harriers-owned property.",
    contact_note: "The published telephone is explicitly offered for club enquiries. No email or social account is guessed; the membership download still bears a 2023 label."
  },
  "leicester-walking-club": {
    summary: "Leicester Walking Club has a long race-walking history, including the Leicester 7 and long-distance walking events, with a documented ninetieth-anniversary gathering in 2017.",
    biography: [
      "Leicester Walking Club is a race-walking club in Leicester, England, with a history spanning short road races and long-distance walking. A first-person account by former member Tony Taylor records its ninetieth-anniversary celebration in Abbey Park in 2017, held alongside the Jim Sharlott 10K Open and British Masters championships.",
      "Taylor describes entering the club's schools event in 1962 and later becoming a Leicester member while living and working in the city. His recollections illustrate the club's role in bringing generations of walkers together. The Centurions' historical archive adds another perspective: its account of the 1974 Leicester-to-Skegness event records seven Leicester club finishers, then a club record in 100-mile walking.",
      "These are historical associations and events, not a current training schedule. The catalogue retains the club's governing-body enquiry listing, but a current weekly programme and joining contact could not be established from its unavailable website. Confirm arrangements before visiting; the Haynes Road directory address is not presented as a verified training venue."
    ],
    notable_members: [{ name: "Tony Taylor", connection: "Former member and historical witness", detail: "In his 2017 account on Lancashire Walking Club's website, Taylor recalls belonging to Leicester Walking Club while living and working in the city in the early 1980s." }],
    sources: [{ title: "Former member's first-person anniversary and club recollections", url: "https://lancswalkingclub.com/2017/10/18/memories-of-leicester-and-lancashire/" }, { title: "Centurions historical account of the 1974 Leicester-to-Skegness walk", url: "https://centurions1911.org.uk/1974-leicester-to-skegness-2/" }],
    reviewed_at: "2026-10-16",
    location_note: "Haynes Road is retained as a directory address. Abbey Park was the 2017 anniversary event venue, not a newly established weekly meeting point.",
    contact_note: "Current timetable, club-role contact and an explicit foundation date remain unresolved. No year is inferred by subtracting ninety from the anniversary year."
  },
  "hermitage-harriers": {
    summary: "Hermitage Harriers is a Coalville running club offering structured road sessions, off-road options, sociable Thursday runs and monthly track visits.",
    biography: [
      "Hermitage Harriers is based at Whitwick and Coalville Leisure Centre in Coalville, Leicestershire, England. Its published programme welcomes runners across a range of abilities, with coached sessions designed so that participants do not need to be elite athletes.",
      "Tuesday evenings begin just before 7pm and offer structured road training or an off-road run led by a coach and run leader. Thursday evenings have a more conversational emphasis, often starting from a different location. The club also describes monthly visits to a private school's running track, including floodlit sessions in winter, without naming the school in the accessible introduction.",
      "A first Tuesday evening is free, followed by a small club-night charge until full membership. Prospective runners can use the club's contact form to ask about a suitable session, joining and the current meeting point. The leisure centre address belongs to the running base; the website provider's Kenilworth office and support email are unrelated to club training or membership."
    ],
    sources: [{ title: "Club sessions and trial arrangements", url: "https://hermitageharriers.co.uk/" }, { title: "Leisure-centre address and club contact form", url: "https://hermitageharriers.co.uk/contact" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://hermitageharriers.co.uk/", address: "Whitwick and Coalville Leisure Centre, Stephenson Way, Coalville", address_kind: "training" },
    location_note: "The leisure centre is the main base; Thursday starts vary and the monthly track is a separate venue.",
    contact_note: "No foundation date, notable-member association, club email or telephone was established. Website-supplier contacts are excluded."
  },
  "heathfield-runners": {
    summary: "Heathfield Runners has supported running in East Sussex since 1985, combining social groups, road and cross-country racing, track training and beginner courses.",
    biography: [
      "Heathfield Runners was established in 1985 and serves Heathfield and surrounding East Sussex communities in England. Run by its members, the club accommodates runners interested in companionship as well as competition, with activities ranging from short relays and parkruns to marathons and longer outings across the South Downs.",
      "Monday group runs use Waldron Recreation Ground in summer and Mill Road car park in Heathfield in winter, normally at 6:30pm. Groups are organised by distance and keep runners together. Wednesday training alternates between town-road sessions and the track at Eastbourne, while Friday morning groups provide additional social running. Confirm the week's meeting point, especially for the Friday runs.",
      "The club participates in the Sussex Grand Prix and East Sussex Sunday Cross Country League and stages the Heathfield Midsummer 10K around Cross in Hand and Waldron. Beginners have a Couch to 5K route: the published 2026 course began on 13 April and is not a future start date. Enquire about the next course through the general club email or contact form; the website also provides an online membership application."
    ],
    founded_year: 1985,
    sources: [{ title: "Club foundation and activities", url: "https://www.heathfieldrunners.club/aboutus" }, { title: "Seasonal training programme and dated beginner course", url: "https://www.heathfieldrunners.club/whatwedo" }, { title: "Club races and cross-country participation", url: "https://www.heathfieldrunners.club/eventsandresults" }, { title: "Public club enquiry contact", url: "https://www.heathfieldrunners.club/contactus" }, { title: "Online membership application", url: "https://www.heathfieldrunners.club/membership" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.heathfieldrunners.club/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Training moves between Heathfield, Waldron and Eastbourne. The former Gorse Hill directory address is not used as a meeting point.",
    contact_note: "Confirm the next beginner intake; the published 13 April 2026 course start has passed. No club telephone or specific social-account destination was established."
  }
};
