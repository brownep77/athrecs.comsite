import type { ClubProfile } from "./club-profiles";

// Primary club, venue and association pages read 18 October 2026.
export const recoveredWinsfordAndBelfastProfiles: Record<string, ClubProfile> = {
  "rock-salt-runners": {
    summary: "Rock Salt Runners is a Winsford running club in Cheshire, England, offering sociable road and trail runs, structured training and a beginner route into running.",
    biography: [
      "Rock Salt Runners takes its name and sense of place from Winsford's salt heritage. Based in this Cheshire town, the club explores the River Weaver, Whitegate Way, Delamere Forest and the surrounding roads and countryside, welcoming runners from neighbouring communities including Northwich, Middlewich and Cuddington. Its approach is practical and sociable: runners look after one another, with a sweep helping the group stay together. The club supports goals ranging from a first 5K to longer-distance training, rather than expecting everyone to arrive at the same level.",
      "The published weekly programme pairs Monday-evening group runs with Wednesday training. Monday runners choose between three flexible pace groups; Wednesday sessions use intervals, hills, repetitions or circuits. Locations rotate, so neither the Cuddington directory address nor any one route is a permanent meeting point. For complete beginners, the club describes a nine-week Couch to 5K programme combining one group session with two independent or buddy sessions each week. Its next intake is still to be confirmed, and participants can repeat weeks instead of treating the plan as a deadline.",
      "Prospective members can arrange a taster before joining, then use the general club email for membership enquiries. Weekly locations are shared through the club's linked WhatsApp community; check the session details before travelling. The membership page also describes social get-togethers as part of club life. England Athletics recorded Rock Salt among clubs involved in development calls in May 2025, a dated organisational connection rather than evidence of a particular grant or award. The club's founding date is not established in the reviewed sources, and current fees should be checked with the club."
    ],
    corrections: { city: "Winsford", address: "", postcode: "", location_precision: "area-only", address_kind: "directory", website: "https://www.rocksaltrunning.com/" },
    location_note: "The club's own site identifies Winsford and explicitly says meeting locations change. The original Cuddington directory address is retained in source provenance, not presented as a Winsford training venue. Consult the club's weekly session information; no fixed clubhouse or postcode is inferred.",
    contact_note: "Reviewed 18 October 2026. The own-site general enquiry email supplements the retained ECCA handbook contact. Instagram and Strava are linked by the club; the existing Facebook link is preserved without duplication. The WhatsApp community is available through the club website, but was not joined. No direct phone was confirmed on the opened pages.",
    sources: [
      { title: "Rock Salt Runners: club identity and Winsford routes", url: "https://www.rocksaltrunning.com/about.html" },
      { title: "Rock Salt Runners: group runs, rotating venues and tasters", url: "https://www.rocksaltrunning.com/our-runs.html" },
      { title: "Rock Salt Runners: beginner programme and unconfirmed next intake", url: "https://www.rocksaltrunning.com/couch-to-5k.html" },
      { title: "Rock Salt Runners: membership and enquiry email", url: "https://www.rocksaltrunning.com/membership.html" },
      { title: "England Athletics: May club-development round-up, 3 June 2025", url: "https://www.englandathletics.org/news/club-support-manager-club-visits-may-round-up/" }
    ],
    reviewed_at: "2026-10-18"
  },
  "athletics-ni-st-annes-ac": {
    summary: "St Annes AC is an athletics and running club in Belfast, Northern Ireland, with Mary Peters Track bookings, links to youth coaching and a recognised contribution to masters athletics.",
    biography: [
      "St Annes AC belongs to Belfast's athletics community and is listed by Athletics Northern Ireland. Its connection with Mary Peters Track is documented in the venue's own booking calendar: the autumn 2026 programme includes a non-exclusive St Annes booking on 21 October and further Wednesday bookings in November and December. These are specific reservations, not a promise that every Wednesday has the same session or that newcomers can attend without arranging it. The club secretary is the appropriate starting point for questions about joining and suitable groups.",
      "The club's work with developing athletes also appears in first-hand accounts from the local coaching community. In October 2019, Fast Twitch Athletics coach Adam McMullen thanked St Annes coaches for directing waiting-list athletes towards his Youngstars sessions. His September 2020 review again acknowledged recommendations from St Annes and other nearby clubs. Those reports show cooperation in helping young people find opportunities to train; the Youngstars timetable, charges and coaches belong to that separate programme and are not presented as St Annes provision today.",
      "Masters athletics provides another documented strand of the club's story. In November 2023, the Irish Master Athletes Association reported that Anne Maguire of St Anne's, Belfast had received its Tadgh Lynch trophy for her service to masters athletics. The association's recipient list confirms her 2023 award, which recognises a sustained contribution to the sport rather than a race result. The current Athletics NI directory names her as club secretary. Ask the club about present intake, fees, age groups and training before visiting; a founding year and a fuller early history remain unconfirmed in the primary sources reviewed."
    ],
    notable_members: [
      { name: "Anne Maguire", connection: "2023 Tadgh Lynch service-award recipient", detail: "The Irish Master Athletes Association identifies St Anne's, Belfast in its November 2023 award report and lists Anne Maguire as that year's recipient. The news report spells her first name Ann; the recipient list and Athletics NI secretary listing use Anne. This is a sourced club association, not athlete-identity verification." }
    ],
    location_note: "Belfast is retained as the club location. Mary Peters Track's calendar supplies dated St Annes bookings, not a club-owned address or permission to attend. No street address, postcode or permanent training schedule is inferred.",
    contact_note: "Reviewed 18 October 2026. Athletics NI's exact St Annes row confirms the existing secretary email and telephone. No separate club website or club-owned social link was confirmed in the opened primary pages. Venue and coaching-provider contacts are not imported as club enquiries.",
    sources: [
      { title: "Athletics Northern Ireland: St Annes club secretary listing", url: "https://athleticsni.org/Clubs/Find-A-Club" },
      { title: "Mary Peters Track: dated club bookings, checked 18 October 2026", url: "https://www.marypeterstrack.com/booking-info" },
      { title: "Fast Twitch Athletics: first-hand coaching-community account, 29 October 2019", url: "https://www.fasttwitchathletics.com/news/onemonthin" },
      { title: "Fast Twitch Athletics: one-year review, 16 September 2020", url: "https://www.fasttwitchathletics.com/news/fast-twitch-athletics-one-year-in" },
      { title: "Irish Master Athletes Association: National Awards, 23 November 2023", url: "https://www.irishmasterathletics.com/post/national-awards" },
      { title: "Irish Master Athletes Association: Tadgh Lynch trophy recipient list", url: "https://www.irishmasterathletics.com/tadgh-lynch-perpetual-trophy" }
    ],
    reviewed_at: "2026-10-18"
  }
};
