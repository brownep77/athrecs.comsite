import type { ClubProfile } from "./club-profiles";

// Batch 86: recovered histories and carefully qualified participation information.
export const recoveredClubHistoryAndParticipationProfiles: Record<string, ClubProfile> = {
  "east-grinstead-and-district-ac": {
    summary: "East Grinstead & District Athletic Club has provided track-and-field, road-running and cross-country opportunities in West Sussex since 1978.",
    biography: [
      "East Grinstead & District Athletic Club was formed in 1978 in East Grinstead, West Sussex, England. Its athletics programme spans sprints, distance running, jumps and throws, with road and cross-country competition alongside track and field. The club also organises the East Grinstead and District Primary Schools' Cross-Country Championships at East Court, connecting its coaching work with local schools.",
      "The academy introduces children to several events rather than specialising immediately. A club update dated 23 March 2026 changes its entry point to school year 5 for the 2026/27 season, with the academy covering years 5 and 6. This replaces older year-4 wording still visible on the website. Older athletes progress to event coaching and age-appropriate competitions, with team managers helping them represent the club.",
      "Imberhorne Upper School is the published training base. The website describes outdoor summer sessions and indoor winter training, but its season notice still refers to October 2025. Send an enquiry before attending: the club arranges invited trials and may operate waiting lists to maintain coaching ratios. Confirm the current session and any use of the redeveloped Sackville facilities rather than relying on the old timetable."
    ],
    founded_year: 1978,
    sources: [{ title: "Club history, schools event, training and enquiry form", url: "https://eastgrinsteadac.co.uk/about-us/" }, { title: "Academy intake update, 23 March 2026", url: "https://eastgrinsteadac.co.uk/academy-update-changes/" }],
    reviewed_at: "2026-10-16",
    corrections: { website: "https://eastgrinsteadac.co.uk/", sports: ["Running", "Athletics"], address_kind: "training" },
    location_note: "Imberhorne is a training base; the published season notice is dated 2025, so confirm the current venue and session.",
    contact_note: "Use the enquiry form on the About page for an invited trial. The newer academy guidance starts at school year 5."
  },
  "formula-one-circuit-crew": {
    summary: "Formula One Circuit Crew grew from outdoor circuit training into a Nottingham running club, combining road and cross-country racing with a sociable approach.",
    biography: [
      "Formula One Circuit Crew began in Nottingham, England, in 1998. England Athletics' December 2014 club visit describes friends turning their outdoor circuit sessions into a running club. Founders Matt Nutt and coach Jeff Rainbow emphasised enjoyment and returning to sport, with strength work woven into running sessions at the Forest Recreation Ground.",
      "The same report records road-league and cross-country participation, together with the club's Jagermeister 10K at the University of Nottingham. Its race income supported charitable donations and club activity. These are historical examples, not confirmation of a current race, training start or beginner course.",
      "The club's ClubBuzz membership-enquiry page remains a route for prospective runners and volunteers to request joining information. It welcomes interest in coaching, officiating and other supporting roles as well as running. Ask which sessions suit your experience and where to meet; the directory's Bagnall Road address has not been confirmed as a training venue."
    ],
    founded_year: 1998,
    notable_members: [{ name: "Matt Nutt", connection: "Founder; chair in 2014", detail: "Identified as a founder and interviewed as chair in England Athletics' December 2014 visit." }, { name: "Jeff Rainbow", connection: "Founder and coach", detail: "The 2014 governing-body visit describes Rainbow's founding and circuit-coaching roles." }],
    sources: [{ title: "England Athletics club visit, 11 December 2014", url: "https://www.englandathletics.org/news/ceo-club-visit-formula-one-circuit-crew/" }, { title: "Club membership and volunteering enquiry form", url: "https://formulaonecc.clubbuzz.co.uk/join" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Nottingham" },
    location_note: "Bagnall Road retains directory provenance and is not confirmed as a training start. The Forest Recreation Ground session is documented in 2014.",
    contact_note: "The readable ClubBuzz form accepts membership enquiries. Its data-controller email is not promoted as a general club contact."
  },
  "stock-exchange-ac": {
    summary: "Stock Exchange Athletic Club connects London's financial-services running community with road races, relays and a walking tradition that predates its 1910 formation.",
    biography: [
      "Stock Exchange Athletic Club is a London, England, club whose roots lie in the Exchange's sporting community. Its history distinguishes the first London-to-Brighton walk, proposed by William Bramson in 1903, from the formation of the athletic club in 1910. The club then took responsibility for organising the walks; the event's origins are not treated as the club's founding date.",
      "An introduction published alongside 2017 material describes a broader group, mainly working in financial services and often belonging to other running clubs too. Road and off-road racing sat alongside a social programme. The website continues to document the club's organisational work: June 2026 posts cover the SEAC Bridges Relay, while September updates cover Assembly League race and overall results.",
      "The website is useful for event announcements and its historical archive, but the old introduction still points to Yahoo Groups for joining. That is not presented as a current membership route. A current general enquiry contact, admission policy and weekly training venue remain unconfirmed; prospective members should seek updated arrangements before attending."
    ],
    founded_year: 1910,
    notable_members: [{ name: "William Bramson", connection: "Initiator of the predecessor walk in 1903", detail: "The club history credits Bramson with proposing the London-to-Brighton walk, before the athletic club formed in 1910; this is not a claim that he founded or joined the later club." }],
    sources: [{ title: "Club history: 1903 walk and 1910 formation", url: "https://stockexchangeac.org/?page_id=274" }, { title: "Club introduction with 2017 programme and old joining route", url: "https://stockexchangeac.org/?page_id=93" }, { title: "Club's 2026 relay and Assembly League updates", url: "https://stockexchangeac.org/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "London", county: "Greater London", region: "London" },
    location_note: "London area only; event locations are not a confirmed weekly training base.",
    contact_note: "The old Yahoo Groups joining addresses and archive-administration email are not added as current general enquiries."
  },
  "blythe-bridge-running-club": {
    summary: "Blythe Bridge Running Club is a Staffordshire road and cross-country club with a documented tradition of helping recreational runners progress into club racing.",
    biography: [
      "Blythe Bridge Running Club is based in Blythe Bridge, Staffordshire, England. A February 2018 first-person account by member Paul Elton describes how friendships made through parkrun led him into the club and a wider range of road races. Regular club nights helped turn running alone into a shared activity, with encouragement from other runners along the way.",
      "Elton's account also records a Couch to 5K programme starting at the club at that time. It illustrates the club's earlier support for people taking their first steps into running, alongside opportunities for established runners to try new distances. This is a historical account, not a promise of a course currently accepting entrants.",
      "Road running and cross-country remain the disciplines in the club's governing-body listing. Its England Athletics ClubSpark site has a contact section and a session calendar, although current meeting details were not available to confirm. Prospective adult runners should enquire about suitable groups, joining arrangements and where to meet before attending."
    ],
    notable_members: [{ name: "Paul Elton", connection: "Member's first-person account, 2018", detail: "Elton described joining the club and its beginner programme in a February 2018 interview. The association is historical, not proof of current membership." }],
    sources: [{ title: "Paul Elton's first-person account, 5 February 2018", url: "https://garethmate.com/blogs/inspiration-series" }, { title: "Club's England Athletics ClubSpark contact section", url: "https://clubspark.englandathletics.org/BlytheBridgeRunningClub/Contact" }, { title: "Club's session calendar", url: "https://clubspark.englandathletics.org/BlytheBridgeRunningClub/Coaching" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Blythe Bridge", county: "Staffordshire" },
    location_note: "Blythe Bridge area only; a current meeting venue was not confirmed.",
    contact_note: "ClubSpark exposes a contact section but no readable form fields or current session rows. No supplier or interviewer's contacts are included."
  },
  "hunwick-harriers": {
    summary: "Hunwick Harriers is a County Durham running club whose early development is linked to the beginner-focused Run Hunwick group.",
    biography: [
      "Hunwick Harriers is based around Hunwick in County Durham, England. Its early story is described by coach Mark Ketley in a 2012 first-person article for North East Runner. Ketley had started Run Hunwick in August 2011 through the Run England initiative, bringing together people who were largely new to running.",
      "He described participants progressing towards local road races and parkruns, and anticipated the emerging Hunwick Harriers club. The article documents the group's beginnings rather than an exact founding date for the later club. Its twice-weekly schedule belongs to that period and is not reused as a current timetable.",
      "Club Durham lists Hunwick Harriers at Rough Lea Lane and includes several participation categories, but provides no enquiry details or session times. That listing differs from the existing England Athletics adult-only classification, so junior eligibility needs confirmation. Current training starts, coaching availability and joining arrangements should be checked before attending; neither the old Crook contact address nor the council-directory address is assumed to be the start of every run."
    ],
    notable_members: [{ name: "Mark Ketley", connection: "Founder of predecessor Run Hunwick group", detail: "His 2012 first-person account dates Run Hunwick to August 2011 and anticipates Hunwick Harriers. It does not establish current coaching duties or the later club's founding date." }],
    sources: [{ title: "Mark Ketley's first-person North East Runner article, 2012", url: "https://leemorgstest.weebly.com/mark-ketley/mark-ketley-how-it-all-fits-together" }, { title: "Club Durham directory entry", url: "https://www.clubdurham.co.uk/clubs/hunwick-harriers/" }],
    reviewed_at: "2026-10-16",
    corrections: { city: "Hunwick", address: "", postcode: "", location_precision: "area-only" },
    location_note: "Hunwick area only. Rough Lea Lane is council-directory information, not a confirmed current meeting point.",
    contact_note: "Junior eligibility conflicts between directory sources; adult-only classification retained pending confirmation. No general email or telephone was confirmed."
  },
  "harling-athletic-club": {
    summary: "Harling Athletics Club has offered family-friendly running, jumping and throwing in East Harling, Norfolk, since 2014, with junior and senior coaching.",
    biography: [
      "Harling Athletics Club was established in 2014 in East Harling, Norfolk, England. Its junior section welcomes children from seven, introducing running, jumping and throwing before older athletes work with event-specific coaches. Seniors can train and compete in road running, cross-country and track and field, while volunteers and officials support the wider club programme.",
      "The club's base is Harling Recreation Ground at the Sports and Social Club on Church Road. Monday evening training is listed for all members, with additional senior running on Saturdays and longer runs on selected Sundays. Weekend details differ between pages, so confirm eligibility, finish times and the Sunday schedule with the club. Road or field sessions vary with daylight and conditions.",
      "Newcomers are offered two free tasters before membership, and the public club email provides a route to discuss joining. Harling also organises local events, including its Lotus test-track races. Its July 2026 notice says the Harling 10K will not take place in 2026 because of access and timing issues; a hoped-for return in 2027 is not a confirmed race date."
    ],
    founded_year: 2014,
    sources: [{ title: "Club origins and taster sessions", url: "https://www.harlingac.com/about" }, { title: "Junior athletics programme", url: "https://www.harlingac.com/juniors" }, { title: "Senior disciplines and training", url: "https://www.harlingac.com/seniors" }, { title: "Training locations and alternative weekend wording", url: "https://www.harlingac.com/training-locations" }, { title: "Club enquiry email and venue", url: "https://www.harlingac.com/contact" }, { title: "Club notices including Harling 10K 2026 cancellation", url: "https://www.harlingac.com/" }],
    reviewed_at: "2026-10-16",
    corrections: { address: "Harling Recreation Ground, Harling Sports & Social Club, Church Road, East Harling, Norfolk", postcode: "NR16 2NB", address_kind: "training" },
    location_note: "The Recreation Ground is the training base, replacing the directory correspondence address. Routes vary by session.",
    contact_note: "Saturday eligibility and finish times, and Sunday frequency, differ between club pages. Confirm weekend arrangements by email."
  }
};
