import type { ClubProfile } from "./club-profiles";

// Batch 112: clean league, venue, club-archive and governing-body sources.
// Previously flagged club domains remain suppressed; historical associations are dated.
export const recoveredNorthernClubProfiles: Record<string, ClubProfile> = {
  "liverpool-harriers-and-ac": {
    summary: "Liverpool Harriers & AC is a track-and-field, road-running and cross-country club in Liverpool, England, founded in 1882 and based at Wavertree Athletics Centre.",
    biography: [
      "Liverpool Harriers & AC has been part of Liverpool's athletics scene since 1882. The National Athletics League's club history dates its formation to 27 September at the Farnworth Hotel in Aintree. An early meeting with Birchfield Harriers took place at Kensington Fields in May 1883, followed by a return visit to Birmingham. The club later joined the British Athletics League in 1970 and the UK Women's Athletics League in 1982.",
      "Today its Liverpool base is Wavertree Athletics Centre, where track and field sits alongside the club's road-running and cross-country disciplines. The city council's venue page describes an eight-lane, 400-metre outdoor track with jumping and throwing facilities. It reserves Tuesday and Thursday late-afternoon and evening periods for Liverpool Harriers. These are facility bookings, not an invitation to turn up without arranging a club session; prospective members should ask which group and admission arrangements suit them.",
      "The club's reach across events is illustrated by British Athletics' August 2026 European Championships team announcement: it listed Katarina Johnson-Thompson with Liverpool Harriers for the heptathlon and Jonny Mellor for the marathon. Those are dated club affiliations, not a guarantee of present membership. For enquiries, the English Cross Country Association's 2026–2027 handbook provides a public club email. Confirm training times and joining arrangements directly, since the council notes seasonal changes to track availability."
    ],
    founded_year: 1882,
    notable_members: [
      { name: "Katarina Johnson-Thompson", connection: "Club affiliation listed in August 2026", detail: "British Athletics named her with Liverpool Harriers & AC in its Birmingham 2026 European Championships heptathlon team announcement." },
      { name: "Jonny Mellor", connection: "Club affiliation listed in August 2026", detail: "British Athletics listed Liverpool Harriers AC beside his name in its Birmingham 2026 European Championships marathon team." }
    ],
    location_note: "Wavertree Athletics Centre is a training venue. The council directs outdoor-track users through Liverpool Tennis Centre; check club arrangements before attending.",
    contact_note: "Sources read on 18 October 2026. The public email comes from the ECCA 2026–2027 club directory, page 24, not an assertion about the contact's current office. The previously flagged club website remains suppressed; no telephone or social account is inferred. Existing England Athletics check dates are unchanged.",
    sources: [
      { title: "National Athletics League: Liverpool Harriers history (page headed City of Liverpool)", url: "https://www.nationalathleticsleague.org.uk/club/city-of-liverpool/" },
      { title: "Liverpool City Council: Wavertree outdoor track and club booking periods", url: "https://lifestylesadmin.liverpool.gov.uk/centres/wavertree-athletics-centre/outdoor-track/" },
      { title: "British Athletics: Birmingham 2026 European Championships team, August 2026", url: "https://www.britishathletics.org.uk/jake-wightman-to-captain-the-novuna-gb-ni-team-for-birmingham-2026/" },
      { title: "ECCA 2026–2027 handbook: club contact, page 24", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { address_kind: "training" }
  },
  "liverpool-pembroke-and-sefton-h-ac": {
    summary: "Liverpool Pembroke & Sefton H AC brings together two historic Liverpool clubs, with track and field in Ormskirk, England, alongside cross-country and road running.",
    biography: [
      "Liverpool Pembroke & Sefton H AC connects Liverpool's running history with athletics in Ormskirk, Lancashire, England. The present club was formed by a merger in 1995. Its two predecessors were Sefton Harriers & AC, founded in 1889, and Liverpool Pembroke AC, founded in 1890. The club's own account in the Sefton CVS directory records the track-and-field section's move to Edge Hill University's facilities in 1997.",
      "That account describes a membership drawn particularly from Liverpool, Sefton, Knowsley and West Lancashire, with cross-country, road running, track events and field athletics. It welcomes boys and girls from school Year 6 upwards, as well as adults, and emphasises a willingness to train regularly. The listing does not establish today's session times or available places: families and adult newcomers should confirm the appropriate group before attending.",
      "A separate club-adopted records archive, compiled by Dave Brown, preserves performances across age groups and disciplines. Its introduction explains the research behind the collection and asks readers to help resolve incomplete or mistaken entries. It is a useful route into the club's heritage, distinct from both the joining process and the other Liverpool club, Liverpool Harriers. The ECCA's 2026–2027 handbook supplies a public club enquiry email; the archive's correction mailbox is not used as a membership contact here."
    ],
    founded_year: 1995,
    location_note: "Edge Hill in Ormskirk is the track-and-field location described in the club-supplied community listing. The retained Serpentine address is a directory address, not an established training meeting point or clubhouse.",
    contact_note: "Sources read on 18 October 2026. The ECCA 2026–2027 email, page 24, is preferred to the undated community-directory email and phone. Facebook is attributed to the Sefton CVS listing; its destination could not be read. The previously flagged main club domain remains suppressed. Archive links do not establish current membership, and no athlete identities or results are imported.",
    sources: [
      { title: "Liverpool Pembroke & Sefton: official records archive and predecessor histories", url: "https://www.pembrokian.co.uk/" },
      { title: "Sefton CVS: club-supplied history, catchment, age groups and disciplines", url: "https://www.directory.seftoncvs.org.uk/directory/organisations/694" },
      { title: "ECCA 2026–2027 handbook: club contact, page 24", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18"
  },
  "pudsey-and-bramley-ac": {
    summary: "Pudsey & Bramley AC is a Leeds athletics and running club in England, with a documented fell-running and cross-country heritage alongside road, trail and track-and-field disciplines.",
    biography: [
      "Pudsey & Bramley AC is based in Leeds, West Yorkshire, England. Fell running and cross-country have an important place in its history, alongside the road, trail and track-and-field disciplines retained in its England Athletics directory record. A firsthand history by fell captain Paul Stevenson, published in The Fell Runner in January 1990, describes the club's rebuilding from a small membership in the 1970s into a much stronger travelling fell-racing team in the late 1980s.",
      "Stevenson credited Peter Watson's work with younger runners and described Jack Maitland's arrival as an important step in the team's development. These are historical accounts, not descriptions of today's coaching staff. A later track connection appears in England Athletics' Birmingham 2022 Commonwealth Games team announcement, which listed 800-metre runner Alex Bell with Pudsey and Bramley. The club's story therefore spans both the fells and the track without treating a past affiliation as permanent membership.",
      "For a prospective member, the useful next step is to ask the club which training group, venue and joining process are appropriate. The ECCA's 2026–2027 handbook publishes a public club contact email. A current timetable and junior intake arrangements were not established from the accessible sources, and the Leeds directory address should not be treated as a session meeting point. The founding year is also left open pending reconciliation of conflicting accounts."
    ],
    notable_members: [
      { name: "Peter Watson", connection: "Historical club president and junior coach", detail: "Paul Stevenson's January 1990 club history described Watson's role in developing younger runners; this is not a current coaching appointment." },
      { name: "Jack Maitland", connection: "Historical fell-running member", detail: "Stevenson's January 1990 account described Maitland joining the club and helping its fell team develop during the 1980s." },
      { name: "Alex Bell", connection: "Club affiliation listed in 2022", detail: "England Athletics listed Pudsey and Bramley alongside Bell in its Birmingham 2022 Commonwealth Games 800m team announcement." }
    ],
    location_note: "The Asquith Avenue address is retained as an England Athletics directory address. It is not confirmed as a training venue or clubhouse.",
    contact_note: "Sources read on 18 October 2026. The email is the explicitly matched Pudsey & Bramley row on page 26 of the ECCA 2026–2027 handbook. The previously flagged club domain remains suppressed. No current training schedule, phone, founding year or social account is guessed; older athlete and coaching associations are dated.",
    sources: [
      { title: "The Fell Runner, January 1990: Paul Stevenson, Pudsey and Bramley — The History", url: "https://www.fellrunner.org.uk/documents/fellrunner/1990_Jan.pdf" },
      { title: "England Athletics: Team England athletes selected for Birmingham 2022", url: "https://www.englandathletics.org/news/team-england-athletes-selected-for-birmingham/" },
      { title: "ECCA 2026–2027 handbook: club contact, page 26", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18"
  }
};
