import type { ClubProfile } from "./club-profiles";

// Batch 79: official club, university, governing-body and community-provider sources.
export const regionalRecoveryAndStudentProfiles: Record<string, ClubProfile> = {
  "athletics-ireland-annalee-a-c": {
    summary: "Annalee AC serves County Cavan with mixed athletics and a documented tradition of introducing children to running, jumping and throwing through interclub Sportshall activity.",
    biography: [
      "Annalee AC is an athletics club in County Cavan, Ireland. Athletics Ireland lists it as a mixed club and identifies Kingspan Breifne Park as its training location, with an online route for joining or renewing membership.",
      "The club's youth work is illustrated by a January 2020 Sportshall gathering it hosted at Breifne College in Cavan. Children from Annalee, Innyvale, Shercock and Monaghan Phoenix tried sprints, jumps, throws and mixed-club relays. Athletics Ireland's account emphasised participation and enjoyment rather than medals, with a return gathering in Monaghan the following month.",
      "That report concerns children aged seven to ten at those particular events; it does not establish today's membership age limits or timetable. Families and other prospective members should use the club's governing-body listing to check the appropriate group and current arrangements. Breifne College was the historical event venue, while Kingspan Breifne Park is the training location in the membership directory."
    ],
    sources: [{ title: "Athletics Ireland club membership and training location", url: "https://membership.athleticsireland.ie/clubpage/Annalee_A.C." }, { title: "Athletics Ireland: January–February 2020 Sportshall programme", url: "https://www.athleticsireland.ie/sportshall-cavan-monaghan-meet-january-february-2020/" }],
    reviewed_at: "2026-10-16",
    contact_note: "No current timetable, club-role email, foundation date or notable-member association was established. Athletics Ireland's platform-support email is not a club contact."
  },
  "amazing-feet-running-club": {
    summary: "Amazing Feet Running Club brings adult road, trail and cross-country runners together across Kidderminster, Stourport and Bewdley in the Wyre Forest area.",
    biography: [
      "Amazing Feet Running Club has been part of the Wyre Forest running community since the early 1980s. The volunteer-run club serves Kidderminster, Stourport and Bewdley in Worcestershire, England, welcoming adult runners with different levels of experience. It is distinct from the similarly named club in New Jersey.",
      "Its published programme combines Monday runs with Wednesday hill or speed work and a sociable Friday outing. Meeting points change and are listed in a monthly calendar. Summer routes make use of trails as well as roads, while winter outings favour town roads. Runners regroup during sessions rather than leaving slower members behind.",
      "Club championships and Midlands cross-country participation provide competitive options. Amazing Feet also organises the Wyre Forest Trail Race, with half-marathon and 10K distances. Prospective members can arrange two free trial runs by contacting the club first; the joining guidance suggests being able to run about 5K continuously and invites anyone unsure to ask. The public enquiry email and contact form are the appropriate starting points."
    ],
    sources: [{ title: "Club area, origins and races", url: "https://amazingfeetrc.co.uk/" }, { title: "Training and trial membership", url: "https://amazingfeetrc.co.uk/membership/" }, { title: "Volunteer club background", url: "https://amazingfeetrc.co.uk/about/" }, { title: "Public enquiry email and form", url: "https://amazingfeetrc.co.uk/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://amazingfeetrc.co.uk/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Meeting points vary across the Wyre Forest area. The older Malham Road directory address is not established as a training venue.",
    contact_note: "An exact founding year and notable members remain unconfirmed. Trial runs require advance arrangement; the American namesake's history is excluded."
  },
  "university-of-warwick": {
    summary: "University of Warwick Athletics and Cross Country combines Westwood track training, endurance running and student competition with a long-running social programme in Coventry.",
    biography: [
      "University of Warwick Athletics and Cross Country Club brings together social runners and competitive athletes on the university's Coventry campus in England. Its Students' Union page describes a programme spanning track and field, cross-country, strength and conditioning, and social running, with track sessions at Westwood.",
      "Members can represent the club in indoor and outdoor BUCS athletics, BUCS cross-country, the Midlands cross-country league and the varsity meeting against Coventry. Club life also includes Warwick Relays, an alumni ball and informal gatherings. The page describes its termly PubJog as a tradition extending back more than thirty years, without giving a foundation date for the club itself.",
      "Students can enquire through the club's general email or linked Instagram account before joining through Warwick Students' Union. Membership involves the relevant Warwick Sport Club Pass and Sports Federation membership as well as the athletics club membership. Confirm the current session programme and appropriate pass before paying."
    ],
    sources: [{ title: "Official Students' Union club programme, contact and joining requirements", url: "https://www.warwicksu.com/societies-sports/sports-clubs/athleticscrosscount/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.warwicksu.com/societies-sports/sports-clubs/athleticscrosscount/", address: "Westwood Track, University of Warwick, Coventry", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "Westwood is the published track venue; not every running or conditioning session takes place there.",
    contact_note: "General club email preferred over individual student committee addresses. No foundation date or notable-member claim established."
  },
  "university-of-sheffield-union-of-students": {
    summary: "University of Sheffield Athletics and Cross-Country Club offers student sprint, endurance, field-event and multi-event opportunities, welcoming beginners alongside experienced competitors.",
    biography: [
      "University of Sheffield Athletics and Cross-Country Club is the student athletics group represented by this Sheffield directory entry. Based in Sheffield, South Yorkshire, England, it welcomes complete beginners as well as experienced and elite athletes.",
      "The club's own introduction on the Students' Union website covers sprinting, longer-distance and cross-country running, field events and multi-events. It describes support from experienced affiliated coaches, giving students a route to explore more than one part of athletics rather than limiting membership to distance running.",
      "The Students' Union page provides separate options to register interest and join the group, and directs enquiries to the club's website and its shefuniac social accounts. Prospective members should use those routes to confirm current sessions, venues and membership requirements. The accessible page does not establish a weekly timetable or identify the Goodwin Sports Centre directory address as the start for every session."
    ],
    sources: [{ title: "Official Students' Union athletics and cross-country club introduction", url: "https://su.sheffield.ac.uk/activities/view/athletics-cross-country" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://su.sheffield.ac.uk/activities/view/athletics-cross-country" },
    location_note: "Goodwin Sports Centre remains a directory address, not a newly verified session venue. Ask the club for event-specific training locations.",
    contact_note: "Linked standalone website was unavailable and the email was masked. No address is guessed; the Union's general switchboard is excluded."
  },
  "university-of-portsmouth-athletics-club": {
    summary: "University of Portsmouth Athletics Club offers sprint, distance and jumps training at HMS Temeraire, group runs around Portsmouth and competitive or social membership routes.",
    biography: [
      "University of Portsmouth Athletics Club welcomes students with differing experience and confidence in Portsmouth, Hampshire, England. The university describes a balance of coaching, competition and social activity rather than a club solely for established competitors.",
      "Its published programme includes Monday group runs around the city, Tuesday sprint, distance and jumps training at HMS Temeraire, and Thursday sprint and distance work at the same venue. Members also attend Southsea parkrun, with further distance sessions listed separately. Check term-time arrangements before travelling.",
      "For 2026–27, the club offers Compete, Development and Play memberships. Competitive membership covers coaching and competition entry but excludes affiliation; Development includes local competition but not BUCS entry, while Play focuses on weekly social athletics. The university warns that most competitive memberships require team selection through trials, so applicants should confirm the athletics arrangements. Its official club page links directly to the membership options."
    ],
    sources: [{ title: "University club programme and 2026–27 membership categories", url: "https://sport.port.ac.uk/play-sports/clubs/athletics" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://sport.port.ac.uk/play-sports/clubs/athletics", address: "HMS Temeraire, Portsmouth", postcode: "", address_kind: "training", location_precision: "area-only" },
    location_note: "HMS Temeraire is the athletics training venue; city runs and parkrun use other locations. Ravelin Sports Centre is not substituted for the published track venue.",
    contact_note: "The club email was masked. No address, founding date or notable-member claim is inferred."
  },
  "halton-and-frodsham-harriers": {
    summary: "Halton & Frodsham Harriers introduces young athletes to track and field, Sportshall and cross-country, with seasonal Tuesday training in Frodsham.",
    biography: [
      "Halton & Frodsham Harriers serves North Cheshire, England, with athletics for children from eight through to seniors, focusing particularly on young athletes. Its activities span outdoor track and field, winter Sportshall and cross-country competition in the North West and beyond.",
      "Tuesday sessions move between Castle Park in Frodsham from April to August and Frodsham Leisure Centre from September to March. The same website lists Widnes facilities but prominently marks that programme as suspended, so those sessions should not be treated as available. Ask the club to confirm the current venue and space before attending.",
      "Athletes can take a free taster before committing to membership. The club asks families to complete its contact information before the first session and publishes separate younger and older junior membership forms. Its public club email handles enquiries. Long-serving volunteer Bill Smith describes joining the club community in 1986 when his sons became involved, later working as secretary, coach and field judge."
    ],
    notable_members: [{ name: "Bill Smith", connection: "Long-serving club volunteer", detail: "His club-published account records involvement from 1986 and subsequent secretary, coaching and field-judging roles; this is not an athlete-membership claim." }],
    sources: [{ title: "Club programme, suspended Widnes sessions, membership and volunteer accounts", url: "https://handfharriers.wixsite.com/club" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Frodsham", county: "Cheshire", website: "https://handfharriers.wixsite.com/club", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Tuesday training is seasonal between Castle Park and Frodsham Leisure Centre. The Runcorn street address is not a confirmed training venue; Widnes sessions are marked suspended.",
    contact_note: "Contact the club to confirm places and whether suspended sessions have resumed. No founding year is established."
  },
  "east-durham-running-club": {
    summary: "East Durham Running Club combines inclusive running around Peterlee with a community focus recognised by England Athletics in its 2024 North East awards.",
    biography: [
      "East Durham Running Club serves Peterlee and neighbouring East Durham communities in England. Its club-submitted Club Durham introduction puts inclusion and personal development at the centre of its approach, including an ambition to help people facing financial barriers to basic running kit.",
      "England Athletics named East Durham its North East Club of the Year in September 2024. The award account highlighted a buddy system, attention to runners' wellbeing and support for a local foodbank. These are dated examples of the club's community work, not a promise that a particular support scheme is always available.",
      "Club Durham lists mixed adult sessions and disability participation and links to the club's Facebook presence. Prospective runners should use that route to ask about suitable sessions, meeting points and any support needs. The listing does not provide a weekly timetable, and its Seaside Lane postcode differs from the England Athletics directory record, so a precise training address remains unconfirmed."
    ],
    sources: [{ title: "Club-submitted community remit and participation listing", url: "https://www.clubdurham.co.uk/clubs/east-durham-running-club/" }, { title: "England Athletics North East awards, 27 September 2024", url: "https://www.englandathletics.org/news/volunteer-awards-evening-2024-north-east/" }],
    reviewed_at: "2026-10-16",
    location_note: "Directory postcodes SR8 3PN and SR8 3PL differ. Neither establishes a current session meeting point; confirm with the club.",
    contact_note: "No public club email, telephone, current timetable or founding year was established. Council and website-supplier contacts are excluded."
  },
  "run-peterlee": {
    summary: "Run Peterlee supports beginner and experienced runners in County Durham, with Couch to 5K and volunteer work recognised in England Athletics' 2024 regional awards.",
    biography: [
      "Run Peterlee is a community running club in Peterlee, County Durham, England. Club Durham lists mixed adult sessions and disability participation, with links to the club's own social channels for further information.",
      "In September 2024, England Athletics placed Run Peterlee third in its North East Club of the Year awards. Its account described work with Durham County Council on Couch to 5K, a 5K event for participants and local fundraising. Welfare officer Kieran Sigsworth received the regional Club Leader of the Year award at the same ceremony.",
      "New runners should ask the club about the next beginner intake or a suitable regular session rather than assuming that the 2024 programme is still open. Club Durham lists Helford Road, whereas the governing-body directory carries a Carrock Close address. These are directory locations, not confirmation that every run starts at either one."
    ],
    notable_members: [{ name: "Kieran Sigsworth", connection: "Volunteer recognised in 2024", detail: "England Athletics named Run Peterlee's welfare officer North East Club Leader of the Year in September 2024." }],
    sources: [{ title: "Club Durham participation and contact listing", url: "https://www.clubdurham.co.uk/clubs/run-peterlee/" }, { title: "England Athletics North East awards, 27 September 2024", url: "https://www.englandathletics.org/news/volunteer-awards-evening-2024-north-east/" }],
    reviewed_at: "2026-10-16",
    location_note: "Helford Road and Carrock Close appear in different directories. Current run meeting points require confirmation.",
    contact_note: "The awards account is historical. Current timetable, beginner intake, general email and founding date remain unresolved."
  },
  "kingfisher-harriers": {
    summary: "Kingfisher Harriers is an inclusive Redditch running club with Abbey Stadium track sessions, social and trail runs, junior participation and a four-week trial.",
    biography: [
      "Kingfisher Harriers is a non-profit community running club in Redditch, Worcestershire, England. It records England Athletics affiliation from April 2016, welcoming beginners and experienced runners for both social outings and more demanding training. That affiliation date is not presented as a separately verified founding date.",
      "The regular programme includes Monday track sessions at Abbey Stadium, Thursday social runs and Sunday trails. Members use the club's ConnectMyClub calendar and app to find sessions. Junior membership is available, with the club explaining that sessions generally suit children from around six, subject to an individual assessment rather than a guaranteed place based on age alone.",
      "Prospective members can register for a free four-week trial before paying through the app. Annual membership runs from April to March; social membership and optional England Athletics affiliation are distinct choices. The club invites people who cannot use app payments to seek assistance, and its secretary email is published for membership questions."
    ],
    sources: [{ title: "Club background and regular sessions", url: "https://kingfisherharriers.connectmyclub.co.uk/" }, { title: "Trial, junior suitability and membership categories", url: "https://kingfisherharriers.com.connectmyclub.co.uk/info/membership" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Redditch", website: "https://kingfisherharriers.connectmyclub.co.uk/", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Abbey Stadium hosts track sessions, while other runs have their own meeting points. The incomplete directory address is not used as a training base.",
    contact_note: "The platform provider's email and Kenilworth registered office are excluded. No exact founding date or notable-member claim established."
  },
  "kippax-and-district-harriers": {
    summary: "Kippax & District Harriers runs from Garforth, with Tuesday groups, a beginner course and a long association with organising the Leeds Country Way Relay.",
    biography: [
      "Kippax & District Harriers began in 1983 when local runners decided to train together. The club is based in Garforth, near Leeds in West Yorkshire, England, and its history identifies Les Kitching as a founder member. The rat in its emblem grew out of a local event called The Rat Race.",
      "Tuesday groups meet at Garforth Leisure Centre before heading out on routes generally around five to seven miles, with longer options. The club suggests being comfortable covering four to five miles in about an hour for its regular groups. Cross-country participation, handicaps and social runs complement the road-running programme, and the club has organised the six-leg Leeds Country Way Relay since 1991.",
      "Runners can email about trying sessions before applying online. A separate twelve-week beginner course works towards running or run-walking 10K, but the page says entries for the 2026 course are closed. Ask about the next intake rather than assuming places are currently available."
    ],
    founded_year: 1983,
    notable_members: [{ name: "Les Kitching", connection: "Founder member", detail: "The club history identifies him as a founder member and credits his account of the rat mascot's origins." }],
    sources: [{ title: "Club origins, Garforth base and relay history", url: "https://kippaxharriers.org.uk/about-us/" }, { title: "Trial enquiries and joining", url: "https://kippaxharriers.org.uk/join-us/" }, { title: "Beginner course and closed 2026 entries", url: "https://kippaxharriers.org.uk/beginners-group/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Garforth", county: "West Yorkshire", website: "https://kippaxharriers.org.uk/", address: "Garforth Squash & Leisure Centre, Ninelands Lane, Garforth", address_kind: "training" },
    contact_note: "2026 beginner entries are closed. No individual race results or current founder-member status are inferred."
  },
  "longstanton-and-northstowe-limpers": {
    summary: "Longstanton and Northstowe Limpers offers community running in Cambridgeshire, from Couch to 5K and improvers' groups to social runs and seasonal trail sessions.",
    biography: [
      "Longstanton and Northstowe Limpers supports adult runners across the two Cambridgeshire communities in England. Its development was highlighted by England Athletics in July 2018, when the group, then described as Longstanton Limpers, explained how RunTogether and beginner courses had helped it grow from informal social runs into a more regular club programme.",
      "The NHS-run How Are You South Cambs directory describes Monday social runs, Wednesday improvers, winter intervals and summer trails. Northstowe Green by the Unity Centre is the usual meeting area, with changes advised for particular sessions. Runs are adapted for different paces, and monthly away runs provide other local routes.",
      "The listing welcomes adults without previous running experience and describes a Couch to 5K route into the club. First-timers are encouraged to make contact before attending and can ask a run leader to meet them early. Monday social runs are listed as free and open to non-members; confirm current course dates and membership fees through the club's existing contact channels."
    ],
    sources: [{ title: "England Athletics account of club development, 11 July 2018", url: "https://www.englandathletics.org/news/help-to-boost-club-membership-with-runtogether/" }, { title: "NHS community-provider session and joining information", url: "https://haysouthcambs.co.uk/activities/longstanton-northstowe-limpers-running-club/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Northstowe", website: "https://landnlimpers.org/", address: "Northstowe Green, by the Unity Centre, Northstowe", postcode: "", address_kind: "training", location_precision: "area-only" },
    contact_note: "The club website returned no readable text; the detailed NHS listing is undated. Its masked email is not guessed. Confirm current sessions and fees; no founding date inferred from the 2018 growth account."
  }
};
