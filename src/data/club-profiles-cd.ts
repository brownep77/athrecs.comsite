import type { ClubProfile } from "./club-profiles";

// Batch 82: recovered club programmes, venues and dated community partnerships.
export const recoveredProgrammeAndVenueProfiles: Record<string, ClubProfile> = {
  "hillingdon-ac": {
    summary: "Hillingdon AC offers junior and adult athletics in Ruislip and Uxbridge, west London, combining track and field, road running and cross-country with clubhouse activities.",
    biography: [
      "Hillingdon Athletic Club serves Ruislip and Uxbridge in west London, England. Its two bases have different roles: the headquarters and clubhouse are on Bury Street in Ruislip, while track training uses Hillingdon Athletics Stadium on Gatting Way in Uxbridge. The club's joining information welcomes junior enquiries from age nine and provides a separate route for adults.",
      "The sporting year includes Southern League track and field in summer and road and cross-country competition in winter. Club training races and social evenings bring members together beyond league fixtures. Coaching, strength and conditioning, and access to the clubhouse gym form part of the published membership offer; approved volunteer training is also supported.",
      "Adults are invited to try training for four weeks before committing, but stadium admission is charged separately by the venue operator. Check the appropriate junior or adult joining information before attending. The accessible pages establish the programme and locations, but the club history and direct enquiry details could not be checked, so no founding year or named alumni are supplied here."
    ],
    sources: [{ title: "Club joining and membership programme", url: "https://hillingdonac.com/hillingdon-athletic-club-join-us/" }, { title: "Clubhouse and stadium locations", url: "https://hillingdonac.com/location/" }],
    reviewed_at: "2026-10-16",
    corrections: { address: "Hillingdon Athletics Stadium, Gatting Way, Uxbridge", address_kind: "training" },
    location_note: "The Uxbridge stadium is a training venue; the separate clubhouse is at 206 Bury Street, Ruislip, HA4 7TJ.",
    contact_note: "The linked co.uk contact page was unavailable. The readable joining page is retained as an information route; no email, phone or social destination is guessed."
  },
  "greenwich-tritons-triathlon-club": {
    summary: "Greenwich Tritons is a south-east London triathlon club with adult and junior swimming, cycling and running, seasonal training and a locally organised junior aquathlon.",
    biography: [
      "Greenwich Tritons brings swimming, cycling and running together across Greenwich and neighbouring south-east London, England. The club traces its activity to the 1980s without specifying a founding year. Members can concentrate on one or two disciplines as well as full triathlon, with social events alongside training and competition.",
      "Adults have coached running around Blackheath, advance-booked swimming and organised group rides. The published programme includes Wavelengths Leisure Centre and the Eric Liddell Sports Centre, plus online strength sessions. Meeting points vary by session, so the old Kellerton Road directory address should not be treated as a training destination.",
      "The junior section covers ages seven to eighteen, using venues including Charlton Lido, Sutcliffe Park and Herne Hill Velodrome. It operates a waiting list for new groups and asks families to arrange a taster. Swimming is triathlon training, not a learn-to-swim course: children need established freestyle skills and an age-appropriate continuous swim. Check the seasonal programme and available places before attending.",
      "On 31 May 2026 the club's junior aquathlon at Colfe's School attracted 329 entries, including 51 Tritons starters, according to its own event report. The organisers highlighted volunteer support and first-time multisport participation. This records a community event milestone, not individual results or new athlete identities."
    ],
    sources: [{ title: "Club background and disciplines", url: "https://greenwichtritons.com/" }, { title: "Adult training and venues", url: "https://greenwichtritons.com/training/" }, { title: "Junior waiting list, prerequisites and seasonal venues", url: "https://greenwichtritons.com/juniors/" }, { title: "Club account of the May 2026 aquathlon", url: "https://greenwichtritons.com/greenwich-tritons-aquathlon-2026-smashes-attendance-records/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://greenwichtritons.com/", city: "Greenwich", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Greenwich is an area indicator; swimming, cycling and running use several venues, not one clubhouse.",
    contact_note: "Junior enquiries can use the form linked from the junior page. The adult joining page presented a verification screen and the email was masked; neither fees nor an email address are inferred."
  },
  "stadium-runners": {
    summary: "Stadium Runners is a Huddersfield running club founded in 2005, with ability-grouped training, seasonal local routes and both competitive and social running.",
    biography: [
      "Stadium Runners was formed in 2005 by local runners seeking a shared identity and base in Huddersfield, West Yorkshire, England. Its programme combines coached speed and technique work with group runs, while welcoming members whose main aims are fitness and friendship rather than racing.",
      "Monday and Thursday club nights meet at Huddersfield Leisure Centre on Spring Grove Street. Bronze, Silver and Gold groups help runners choose a suitable pace, with faster runners returning to regroup. Summer routes can include footpaths, canal towpaths and bridleways; winter outings favour lit roads. The club suggests being able to run continuously for around thirty minutes and invites those not yet at that point to ask about beginner options.",
      "Members take part in road, trail and fell events, while the club runs age-graded and Grand Prix competitions, handicap runs and social occasions. Its membership information also lists coached track sessions and club support for the Calderdale Way relay. Use the membership email or contact form to discuss a first visit and confirm the latest programme; participation in races is not compulsory."
    ],
    founded_year: 2005,
    sources: [{ title: "Club origins and training approach", url: "https://stadiumrunners.co.uk/about/" }, { title: "Membership and public enquiry email", url: "https://stadiumrunners.co.uk/membership/" }, { title: "Contact form and meeting base", url: "https://stadiumrunners.co.uk/contact/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://stadiumrunners.co.uk/", address_kind: "training" },
    location_note: "Huddersfield Leisure Centre is the published meeting base, not a club-owned clubhouse."
  },
  "lytchett-manor-striders": {
    summary: "Lytchett Manor Striders is a Dorset running club founded in 1989, with road and trail groups around Lytchett Minster, Lytchett Matravers, Sandbanks and the Purbecks.",
    biography: [
      "Lytchett Manor Striders began in 1989 and is based around Lytchett Minster near Poole, Dorset, England. Its volunteer committee supports a programme for experienced runners and people progressing from Couch to 5K, combining coached running, club competition and social activities.",
      "The published weekly programme offers Tuesday choices at Canford Cliffs Esplanade and Lytchett Matravers recreation ground, followed by Thursday groups from Lytchett Minster School Sports Centre. Longer Sunday runs explore road and trail routes around Wareham and the Purbecks, with meeting details and updates shared through Heylo. Different paced groups and regrouping help members find an appropriate outing.",
      "Prospective members can try a few runs before joining and contact the membership secretary for advice. Coaches offer training guidance, while monthly championship races and social events give members other ways to take part. The club asks its runners to volunteer at its own advertised events, including the Lytchett 10. The joining page still displays the 2024–25 membership period, so its printed fees should be confirmed rather than treated as current."
    ],
    founded_year: 1989,
    sources: [{ title: "Club origins and volunteer committee", url: "https://lytchettmanorstriders.org/our-club" }, { title: "Joining, volunteering and dated fees", url: "https://lytchettmanorstriders.org/join" }, { title: "Weekly venues and Heylo updates", url: "https://lytchettmanorstriders.org/training/info" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://lytchettmanorstriders.org/", address_kind: "training" },
    location_note: "The school sports centre is the Thursday training base; other sessions start elsewhere.",
    contact_note: "The existing membership email and its original provenance are preserved. The joining page's 2024–25 fees need confirmation; no private group content was accessed."
  },
  "tadworth-ac": {
    summary: "Tadworth AC is a Surrey running club with early-1980s roots, road and cross-country competition, North Downs running and a month-long trial membership option.",
    biography: [
      "Tadworth Athletic Club grew from a group of local enthusiasts in the early 1980s in Tadworth, Surrey, England. Its windmill emblem reflects a local landmark, while green and white club colours refer to the wooded chalk landscape of the North Downs. The club describes road running, cross-country, ultras, fell running and orienteering among its interests.",
      "Running in the surrounding countryside, including Epsom Downs, sits alongside the club's social life and its organisation of the Tadworth 10. Members also have club competitions and a summer handicap series. These activities give runners opportunities to compete and meet others without reducing membership to a single race distance.",
      "The club-managed membership page offers newcomers a free month of trial sessions before committing. Adult, student and non-running social categories are listed, along with an under-eighteen option requiring a parent or guardian to be an adult member. Ask the membership secretary about suitable sessions and current arrangements. Although the listed memberships expire in March 2027, explanatory affiliation-fee text still refers to 2024–25; that older figure is not presented as today's charge."
    ],
    sources: [{ title: "Club origins, identity and activities", url: "https://tadworth.org.uk/about-us/" }, { title: "Club-managed membership and trial arrangements", url: "https://membermojo.co.uk/tadworthac" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Tadworth", address: "", postcode: "", location_precision: "area-only", adult_only: false },
    location_note: "Tadworth is an area indicator. The former Epsom street address is not retained as a verified meeting point; confirm the session venue with the club.",
    contact_note: "The membership secretary's published role email supplements the existing general enquiry address. The current site's training page was unavailable, so no weekly timetable is inferred from older material."
  },
  "millom-striders": {
    summary: "Millom Striders is a community running and athletics club in Millom, Cumbria, founded in 2018 and based at Millom Community Track.",
    biography: [
      "Millom Striders Running Club was established in 2018 in Millom, Cumbria, England. The club describes an inclusive group for different ages and abilities, from people preparing for a first 5K to runners working towards a marathon. Regular group training and participation in events form part of its aim to bring the local community together.",
      "The club publishes Millom Community Track on Salthouse Road as its address. Its involvement extends beyond distance running: a Millom Town Deal report records the Striders hosting a junior coaching session on 22 July 2025 to celebrate the new long-jump facility beside the track. National jump coach Carl Foster led that session for eight-to-sixteen-year-olds; this was a visiting coaching contribution, not evidence that he belonged to the club.",
      "The facility was installed as part of the town's wider leisure regeneration work, with school and community use envisaged. That account does not establish unrestricted access or today's club timetable. Prospective runners and families should check current groups and joining arrangements through the club before travelling. A readable direct email and detailed weekly schedule were not available during this review."
    ],
    founded_year: 2018,
    sources: [{ title: "Club origins, purpose and address", url: "https://www.millomstriders.co.uk/" }, { title: "Town Deal account of the July 2025 junior coaching session", url: "https://millomtowndeal.org.uk/jumping-with-joy-for-new-millom-sports-facility/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://www.millomstriders.co.uk/", address: "Millom Community Track, Salthouse Road, Millom", address_kind: "training" },
    location_note: "The community track is the published club base, not a clubhouse owned by the club. Confirm access and session arrangements.",
    contact_note: "The website email is masked and has not been guessed. No visitor or contractor contact is substituted as a club enquiry address."
  },
  "west-wight-road-runners": {
    summary: "West Wight Road Runners serves the Freshwater area of the Isle of Wight, with group running and a documented partnership for the planned 2027 Three Hills race.",
    biography: [
      "West Wight Road Runners is based in the Freshwater area of the Isle of Wight, England. Its first-person club listing describes weekly runs through the year, participation in the Hampshire Road Race League and a welcome for visiting runners holidaying in the area. The listing is undated, so it is a description of the club's established approach rather than confirmation of a particular meeting time.",
      "A new community partnership is documented by West Wight Sports & Community Centre for the Three Hills race planned for 4 April 2027. The centre says Ryde Harriers entrusted it and West Wight Road Runners with the event's future. The proposed off-road route starts and finishes in Freshwater and takes in coastal and downland landmarks, supporting the centre's charitable work.",
      "This is a future organising partnership, not a claim that the club has already delivered the 2027 race. Entry arrangements were still to be announced when checked on 16 October 2026. The club's own blog was unavailable, leaving current training times, joining details and direct contacts unresolved. Confirm a suitable run before visiting; the sports centre remains a directory-listed base rather than a guaranteed start for every session."
    ],
    sources: [{ title: "First-person club description in Good Run Guide", url: "https://www.goodrunguide.co.uk/ClubDetails.asp?ClubID=2614" }, { title: "Co-organiser's planned 2027 Three Hills partnership", url: "https://westwight.org.uk/west-wight-three-hills/" }],
    reviewed_at: "2026-10-16",
    location_note: "The sports centre is a directory-listed base. The future race's Freshwater start does not establish a weekly training meeting point.",
    contact_note: "No direct club email, telephone or official social destination was established. The centre's own general contact is not substituted for the runners' contact."
  }
};
