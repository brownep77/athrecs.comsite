import type { ClubProfile } from "./club-profiles";

// Batch 92: recovered club pages, community accounts and masters competition records.
export const recoveredRunningAndMastersProfiles: Record<string, ClubProfile> = {
  "beaumont-rc": {
    summary: "Beaumont RC is a Leicester running club with roots in Beaumont Leys, seasonal training around the west of the city and a long involvement in road racing and cross-country.",
    biography: [
      "Beaumont RC brings adult runners together in Leicester, England, for training, road racing and cross-country. Its own history begins in August 1984, when fourteen people formed Beaumont Leys Running Club at Babbington College. The shorter Beaumont Running Club name followed in 2002. A volunteer committee runs the club, which welcomes different abilities and describes itself as a founding member of the Leicestershire Road Running League.",
      "The club's meeting places have changed with its needs. Its timeline records moves through Kirby Muxloe and New Parks, followed by Braunstone Leisure Centre in 2016, the Grove Community Hub in 2021 and a return to Braunstone in 2023. These are stages in its local history, not a list of interchangeable current meeting points. Cross-country opportunities include the Derby Runner and North Midlands leagues alongside the road programme.",
      "The membership page separates winter and summer arrangements. For September to April it lists Monday runs from Braunstone Leisure Centre and Wednesday sessions at Leicester Cycle Circuit; summer evening runs use Newtown Linford at Bradgate Park. England Athletics' March 2025 account explains how a £500 grant helped pay for winter cycle-track hire, giving the club a safe space for weekly coached sessions and social contact during the darker months.",
      "New runners can try a few weeks before deciding to join, using the membership page to check arrangements first. It also describes second-claim membership and club participation at Braunstone parkrun. Session times and fees should be confirmed before attending. The Hamelin Road address retained in the directory is not presented as a training start, and a masked website email has not been guessed."
    ],
    founded_year: 1984,
    sources: [{ title: "Beaumont club history and activities", url: "https://www.beaumontrc.co.uk/about-us/" }, { title: "Beaumont membership and seasonal training", url: "https://www.beaumontrc.co.uk/membership/" }, { title: "England Athletics: winter training grant, 20 March 2025", url: "https://www.englandathletics.org/news/making-a-difference-in-local-communities-club-improvement-fund-re-opens/" }],
    reviewed_at: "2026-10-17",
    corrections: { website: "https://www.beaumontrc.co.uk/" },
    location_note: "Hamelin Road is retained as a directory address, not a session venue. Winter training uses Braunstone Leisure Centre and Leicester Cycle Circuit; summer runs use Newtown Linford at Bradgate Park. Confirm the meeting point before attending.",
    contact_note: "Use the readable membership page for joining information. Website email is masked; existing directory-sourced social links retain their original provenance."
  },
  "walney-wind-cheetahs": {
    summary: "Walney Wind Cheetahs is a running club based at Park Vale on Walney Island, welcoming a broad range of ages and abilities to road running and cross-country around Barrow-in-Furness.",
    biography: [
      "Walney Wind Cheetahs is based at Park Vale on Walney Island, part of Barrow-in-Furness in Cumbria, England. Its introduction welcomes runners from twelve to over eighty and puts shared training at the centre of club life. Road races and Mid Lancs cross-country give members competitive options, while the club also makes clear that individual England Athletics affiliation is not required simply to run with the group.",
      "The club is supported by a committee, coaches and a substantial team of run leaders. Its published roles cover affiliation, welfare, health and safety as well as the running sessions themselves. The affiliation page describes its coaches and leaders as England Athletics qualified and registered; that is the club's statement, not an independently awarded verification status. Affiliated members use Spond for registration, and prospective runners are asked to contact the club before their first run.",
      "Membership and England Athletics registration are distinct choices. The website explains how affiliation relates to race-entry discounts and cross-country participation, but its fee information needs clarification: one paragraph says non-affiliated runners pay no fee, while the 2025/26 table includes a club-membership charge. No current price is asserted here. The club's enquiry form is available for questions about joining, age-appropriate groups and session arrangements. Its founding date and notable alumni remain unconfirmed."
    ],
    sources: [{ title: "Walney Wind Cheetahs introduction", url: "https://walneywindcheetahs.co.uk/about-us/" }, { title: "Club committee and run-leader roles", url: "https://walneywindcheetahs.co.uk/the-club/" }, { title: "Affiliation and membership information", url: "https://walneywindcheetahs.co.uk/affiliation/" }, { title: "Club enquiry form and Park Vale location", url: "https://walneywindcheetahs.co.uk/contact-us/" }],
    reviewed_at: "2026-10-17",
    corrections: { city: "Barrow-in-Furness", address: "Park Vale, Walney Island, Barrow-in-Furness", postcode: "", address_kind: "training", location_precision: "unverified" },
    location_note: "The club identifies Park Vale on Walney Island as its base, replacing the unconfirmed North Scale directory address. Exact entrance and postcode have not been verified; confirm the session meeting point with the club.",
    contact_note: "Enquiry form recovered. Confirm current fees: the non-affiliated fee wording and 2025/26 table conflict. Existing Facebook and Instagram provenance remains unchanged; no supplier contact copied."
  },
  "warminster-running-club": {
    summary: "Warminster Running Club offers adult road and trail running in Wiltshire, with grouped Wednesday runs from the Civic Centre and volunteer-led training.",
    biography: [
      "Warminster Running Club is an adult running club in Warminster, Wiltshire, England. Its introduction describes a volunteer-led group for people aged eighteen and over, with routes mixing roads and trails according to the season and weather. England Athletics and Wiltshire Athletics Association affiliations are stated on its membership page, placing the club within the county's wider running community.",
      "The advertised Wednesday club run meets at the Civic Centre near Morrisons at 6.55pm for a 7pm start. Three ability groups cover roughly five to seven miles over about an hour, with route information shared through the club's WhatsApp group. The page also describes alternate-Monday interval or hill sessions. These arrangements depend on volunteer leaders, so newcomers should confirm a suitable group and the current schedule rather than arriving for an assumed session.",
      "Prospective members are encouraged to try a couple of weeks before joining. Membership forms can be handled electronically or on paper, and the club distinguishes its own subscription from optional England Athletics registration. The published fee figures are undated and are not repeated as current prices. Committee information is explicitly headed 2024, so it is not treated as a verified present-day office-holder list. The Civic Centre is a training meeting point rather than an inferred postal address; the club's origins and notable alumni remain unresolved."
    ],
    sources: [{ title: "Warminster introduction, training and dated committee information", url: "https://www.warminsterrc.co.uk/about-us/" }, { title: "Warminster membership and affiliations", url: "https://www.warminsterrc.co.uk/membership/" }],
    reviewed_at: "2026-10-17",
    corrections: { address_kind: "training" },
    location_note: "Warminster Civic Centre is the advertised Wednesday meeting point, not a confirmed correspondence address. Confirm current group and session arrangements before attending.",
    contact_note: "Introduction and membership pages were readable during this review but later requests failed. Existing enquiry-page and Facebook links are retained, not newly authenticated. Committee list is dated 2024; current fees, founding date and alumni are unconfirmed."
  },
  "boalloy-running-club": {
    summary: "Boalloy Running Club is part of Congleton's athletics community, with junior participation and a documented tradition of charity running around Astbury Mere.",
    biography: [
      "Boalloy Running Club is a running and athletics club in Congleton, Cheshire, England. Cheshire County Athletic Association lists it separately from Congleton Harriers, and Excalibur Primary School includes it among local opportunities for young runners. The school's listings place Tuesday activity at Congleton Leisure Centre, but the undated age and time details should be checked with the club before attending.",
      "Charity running is a distinctive part of its community story. In May 2022, organiser Lee Campbell described a planned marathon relay at Astbury Mere supporting Crossroads Together. He said Boalloy's events had raised over £50,000 for local causes over the years. The charity's representative thanked the club for supporting unpaid carers. This is a dated organiser's account and fundraising intention, not a current event announcement or new audit of donations.",
      "That report gives inconsistent indications of the club's age, so an exact founding year is left open. The leisure-centre directory address is retained, with Astbury Mere distinguished as an event setting. The school listing also contains inconsistent versions of an organiser's telephone number, so no new number has been copied. Use the retained official-directory and club-group links to establish current joining arrangements."
    ],
    notable_members: [{ name: "Lee Campbell", connection: "Charity-event organiser interviewed in May 2022", detail: "Campbell spoke about Boalloy's fundraising and the planned Astbury Mere relay. This is a dated organising association, not a promise of a current committee role." }],
    sources: [{ title: "Cheshire County AA affiliated-club handbook", url: "https://www.cheshireaa.com/ccaah.aspx" }, { title: "Excalibur Primary School local running-club listings", url: "https://www.excalibur.cheshire.sch.uk/page/local-clubs/26404" }, { title: "Boalloy organiser and beneficiary interviews, 5 May 2022", url: "https://congleton.nub.news/news/local-news/congleton-running-club-to-raise-thousands-in-charity-event-131767" }],
    reviewed_at: "2026-10-17",
    location_note: "Congleton Leisure Centre is retained from the directory and appears in the school's undated training listing. Astbury Mere is documented for the 2022 charity event, not assumed to be every session's start.",
    contact_note: "Founding date unresolved because the 2022 report's explicit year and quoted club age conflict. School-listed phone variants conflict and are omitted; masked interview email not reconstructed. No employer or charity contact substituted."
  },
  "southern-counties-veterans-ac": {
    summary: "Southern Counties Veterans AC supports masters athletics in southern England, with documented indoor and outdoor track-and-field events and road championships across several venues.",
    biography: [
      "Southern Counties Veterans AC, commonly abbreviated to SCVAC, is part of the masters-athletics community in southern England. Its BMAF OpenTrack page links it with British masters competition and the England Masters Team. No single-town headquarters has been confirmed, so the directory retains a regional England location.",
      "Its published programme includes the 2026 regional track-and-field final at London's Linford Christie Stadium, earlier indoor championships at Lee Valley, and historical road championships at Beckley and Hythe. These are event listings, not training venues or evidence that every competitor belongs to SCVAC.",
      "Volunteer administration is part of the club's history. Veterans AC's August 2024 tribute to Tom Richards records his service to Southern Counties Veterans AC as vice-chairman and treasurer. Richards was also an official and a member of other clubs; the association here concerns his specifically documented SCVAC service, not his father's Olympic career. Prospective members can consult the BMAF organisation page, which directs enquiries to the membership secretary. The club website could not be read during this review, leaving its founding year, current fees, admission details and direct email unconfirmed."
    ],
    notable_members: [{ name: "Tom Richards", connection: "Former vice-chairman and treasurer", detail: "Veterans AC's 2 August 2024 tribute records his SCVAC service. This is Tom Richards (1939–2024), not his Olympic-medallist father." }],
    sources: [{ title: "BMAF OpenTrack: SCVAC organisation and event listings", url: "https://bmaf.opentrack.run/en-gb/orgs/SCVAC/" }, { title: "Veterans AC tribute to former SCVAC officer Tom Richards, 2 August 2024", url: "https://www.vetsac.org.uk/Obituaries.html" }],
    reviewed_at: "2026-10-17",
    location_note: "Regional southern-England club; no single-town headquarters confirmed. Linford Christie Stadium, Lee Valley, Beckley and Hythe are listed event locations, not a replacement club address. England flag retained; not a global club.",
    contact_note: "Club website unavailable. BMAF directs membership enquiries to the secretary but masks the email in the retrieved page; no guessed address or fees added. Founding year and current admission details remain unresolved."
  }
};
