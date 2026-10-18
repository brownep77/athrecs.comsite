import type { ClubProfile } from "./club-profiles";

// Opened primary club pages and dated first-person historical accounts, 18 October 2026.
export const recoveredHelpstonAndTwistedProfiles: Record<string, ClubProfile> = {
  "helpston-harriers-ac": {
    summary: "Helpston Harriers AC is a running club in the Peterborough area of England, with roots in a group of friends and a distance-running programme spanning road, track and cross-country.",
    biography: [
      "Helpston Harriers AC grew out of friends wanting to improve their running together. In an April 2020 interview, chairman Thomas Musson recalled their wish to share that experience with other runners and keep the new organisation's membership charges and committee small. His account describes the move from an informal group to an England Athletics club, followed by a period of gradual growth. The public Helpston Harriers Strava page places the group in Peterborough, England; the club name should not be taken as a precise training address.",
      "Musson had set out the sporting ambition in September 2018: training was to follow the seasons, with spring marathons, track running in summer and cross-country. He wanted the Harriers to develop naturally and contribute to the local running community. These first-person accounts give the club a clear distance-running identity without turning an old race plan into a current weekly timetable. By the 2020 interview, online social channels were also helping it stay connected with the wider running community.",
      "Prospective members can use the public club contact retained from the 2026–2027 English Cross Country Association handbook to ask about joining, suitable groups and current meeting points. The old interviews do not establish today's fees, trial arrangements or office holders. The listed website was unavailable during this review, so no exact training venue or present coaching schedule is inferred."
    ],
    notable_members: [{ name: "Thomas Musson", connection: "Historical chairman and club spokesperson", detail: "Musson described the club's development and sporting aims in first-person interviews published in September 2018 and April 2020. This is a historical role, not confirmation that he remains chairman or a current member." }],
    location_note: "The public club-labelled Strava page locates Helpston Harriers in Peterborough. Only the town is added; no street, postcode, clubhouse or training venue is established. Existing area-only precision is retained.",
    contact_note: "Reviewed 18 October 2026. The existing ECCA 2026–2027 handbook contact and its source/check date are preserved. No phone, newly verified enquiry form or social-account ownership is established. The club-labelled Strava page is used as a location source, not a claim of independently verified account ownership. The newspaper sources are used for Musson's first-person historical account; their other athlete lists are not imported as current membership. The exact founding year remains unresolved.",
    sources: [
      { title: "Thomas Musson's first-person account of Helpston Harriers, 18 April 2020", url: "https://www.peterboroughtoday.co.uk/sport/other-sport/friends-unite-to-form-a-very-competitive-running-club-2539063" },
      { title: "Thomas Musson's training plans, 6 September 2018", url: "https://www.peterboroughtoday.co.uk/sport/helpston-harriers-up-and-running-258583" },
      { title: "Helpston Harriers public Strava page: Peterborough locality", url: "https://www.strava.com/clubs/Helpston-Harriers" },
      { title: "ECCA 2026–2027 handbook: Helpston Harriers contact, page 33", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { city: "Peterborough" }
  },
  "twisted-running": {
    summary: "Twisted Running combines an online running community with social runs from Altrincham, England, offering optional England Athletics club membership alongside informal participation.",
    biography: [
      "Twisted Running began as a community on social media before adding an England Athletics-affiliated club. Its own membership page makes the distinction clear: runners can join the affiliated club to represent Twisted in races, or remain part of its social community without taking that step. This online identity sits alongside a local meeting point at Twisted HQ in Altrincham, England. The existing virtual-club designation is retained rather than assuming that every member trains in the town.",
      "The published social programme includes a Tuesday 10km run and Sunday groups covering 5km and 10km at different paces. Routes take in canals, rivers, parks and trails, with regrouping and loop-backs intended to keep people together. Coffee after Sunday runs adds time to meet other runners. The club invites newcomers to introduce themselves at Arch 15 on Viaduct Road, but asks everyone to check its Instagram updates because arrangements can change around races, holidays and special events.",
      "Twisted also publishes a nine-week beginner plan that progresses from walking and jogging towards half an hour of continuous running, with sessions led by Run Together group leaders. Its July-to-September dates do not establish a new intake, so ask before applying. A linked Strava group provides another way to share progress and take part in community challenges. The affiliation page offers first-claim and second-claim options; its displayed prices disagree, so current costs and terms should be confirmed through the club's enquiry form rather than taken from the older explanatory copy."
    ],
    location_note: "The club's social-runs page explicitly identifies Twisted HQ, Arch 15, Viaduct Road, Altrincham, WA14 5DU as the meeting point. This is recorded as a training location because the club programme confirms its use, not merely because the shop publishes an address. Virtual-club eligibility and the England flag remain unchanged.",
    contact_note: "Reviewed 18 October 2026. The contact page visibly publishes hello@twistedrunning.co.uk and an enquiry form; its unrelated hello@domain.com mailto placeholder is excluded. Instagram is explicitly recommended for run updates, and the Strava destination is linked by the club's own group page. These are publisher-attributed links, not independent account-ownership verification. No telephone, exact founding year or notable-member association is established. Conflicting affiliation prices and an undated July-to-September beginner intake are not presented as current offers.",
    sources: [
      { title: "Twisted Running: social origins and optional club affiliation", url: "https://twistedrunning.co.uk/pages/club-affiliation" },
      { title: "Twisted Running: social programme and Altrincham meeting point", url: "https://twistedrunning.co.uk/pages/social-runs" },
      { title: "Twisted Running: nine-week beginner programme", url: "https://twistedrunning.co.uk/pages/get-me-started-running" },
      { title: "Twisted Running: official Strava-group link", url: "https://twistedrunning.co.uk/pages/strava-group" },
      { title: "Twisted Running: public enquiry form and displayed email", url: "https://twistedrunning.co.uk/pages/contact" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { city: "Altrincham", address: "Twisted HQ, Arch 15, Viaduct Road", postcode: "WA14 5DU", address_kind: "training", location_precision: "postcode", website: "https://twistedrunning.co.uk/" }
  }
};
