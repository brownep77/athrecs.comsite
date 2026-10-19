import type { ClubProfile } from "./club-profiles";

// Club-owned public pages and venue evidence read 19 October 2026 UTC.
export const recoveredRiversideAndHeadFirstProfiles: Record<string, ClubProfile> = {
  "riverside-harriers": {
    summary: "Riverside Harriers is a community athletics club in Wood Green, London, England, with youth training and specialist jumps and sprint coaching.",
    biography: [
      "Riverside Harriers offers young people in Wood Green, north London, a route into athletics. Its published programme combines movement skills with event development, with scheduled groups for ages 8–11 and 12–16 at New River Sports Centre. Families with children aged 5–7 or athletes aged 17–18 are asked to discuss suitable placement rather than assume that a scheduled group covers them.",
      "The club identifies John Herbert as its founder and head coach, specialising in jumps and sprints. Its timetable also lists advanced Saturday groups at Lee Valley Athletics Centre. Alongside its youth programme, Riverside describes opportunities for people returning to sport or moving from another discipline. These are pathways offered by the club, not evidence of a founding year or a list of former members.",
      "Prospective athletes can arrange a free first trial through the club's enquiry contact. Competition is optional, and current membership fees need to be requested. Families should confirm the appropriate group, venue and session before travelling; the website's 2026 term dates remain unfilled."
    ],
    location_note: "New River is identified as a training venue by the club. Haringey Council's 29 June 2026 licensing agenda independently confirms White Hart Lane, Wood Green, London N22 5QW, correcting the retained directory's N22 5QJ. Lee Valley is an additional session venue, not a replacement postal address.",
    contact_note: "Reviewed 19 October 2026 UTC. Club enquiries and coaching contacts come from the club website; the earlier ECCA contact and its check date are retained. Conflicting website social handles are withheld pending confirmation. No form was submitted.",
    notable_members: [{ name: "John Herbert", connection: "Founder and head coach — club website", detail: "Named in the club's published coaching team; no athlete account or membership period is inferred." }],
    sources: [
      { title: "Riverside Harriers: club website, coaching team, timetable, joining FAQs and public contact details", url: "https://riversideharriers.uk/" },
      { title: "Riverside Harriers: public client-rendered page content read from the script linked by its homepage", url: "https://riversideharriers.uk/static/js/main.eaca5190.js" },
      { title: "Haringey Council: New River Sports & Fitness licensing agenda, 29 June 2026", url: "https://www.minutes.haringey.gov.uk/mgAi.aspx?ID=85825" }
    ],
    reviewed_at: "2026-10-19",
    corrections: { website: "https://riversideharriers.uk/", address: "New River Sports Centre, White Hart Lane, Wood Green, London, N22 5QW", postcode: "N22 5QW", address_kind: "training" }
  },
  "running-head-first": {
    summary: "Running Head First is a Wallasey running club within a Wirral not-for-profit organisation in England, bringing exercise and social support together.",
    biography: [
      "Running Head First connects running with community support in Wallasey on the Wirral, north-west England. The running club sits within a wider not-for-profit organisation offering exercise activities, rather than being interchangeable with all of its services. Its own running-club page welcomes members of different abilities, while explaining that some activities are reserved for people accessing its charitable support.",
      "The organisation's account names Chris Redmond as its founder and describes collaboration with Lee Plant and Ashley Cox in developing the project. Redmond's own earlier website dates Running Head First CIC to 2019 and describes a club based at LP Strength Academy in Wallasey Village, including a Couch to 5K route into running. That is useful background, not a confirmation that the older timetable, fees or every activity remain unchanged; 2019 is not separately established as the registered running club's founding year.",
      "The club's published page lists a Thursday 5.30 pm run from its Wallasey headquarters. Newcomers should use the organisation's enquiry page to confirm the meeting point, group suitability and joining arrangements. Wider services include walking and exercise groups, but their age ranges and access arrangements should not be transferred to the adult running-club listing. Participation is described as a way to exercise and meet others, not a promise of a medical outcome."
    ],
    location_note: "The retained directory address at 139–141 Wallasey Village remains classified as a directory address. The organisation also publishes an office at The Old School, 188 Liscard Road; this is not substituted as the running meeting point. Confirm the current Wallasey headquarters location before attending.",
    contact_note: "Reviewed 19 October 2026 UTC. The organisation's contact page publishes its enquiry email and telephone. Its website links Facebook and Instagram; these are publisher-attributed links, not independently verified account ownership. The existing ECCA club contact keeps its 18 October provenance. Separate personal-coaching and website-supplier contacts are excluded; no form was submitted.",
    notable_members: [{ name: "Chris Redmond", connection: "Founder of the wider Running Head First organisation", detail: "Named by the organisation and his own account; this is an editorial founding association, not a claim of current club membership." }],
    sources: [
      { title: "Running Head First: organisation and community activities", url: "https://runningheadfirst.org/" },
      { title: "Running Head First: origins and founder", url: "https://runningheadfirst.org/about/" },
      { title: "Running Head First: running-club sessions and access distinction", url: "https://runningheadfirst.org/running-club/" },
      { title: "Running Head First: public enquiries", url: "https://runningheadfirst.org/contact-us/" },
      { title: "Chris Redmond: first-hand account of Running Head First CIC and its club", url: "https://www.chrisredmondpt.co.uk/running-head-first" }
    ],
    reviewed_at: "2026-10-19",
    corrections: { website: "https://runningheadfirst.org/" }
  }
};
