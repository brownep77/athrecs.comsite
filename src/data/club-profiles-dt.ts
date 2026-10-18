import type { ClubProfile } from "./club-profiles";

// Primary organiser accounts and visually checked council records, 18 October 2026.
export const recoveredWinterHillAndUtsProfiles: Record<string, ClubProfile> = {
  "winter-hill-runners": {
    summary: "Winter Hill Runners is an adult running club associated with Horwich, England, combining road and cross-country running with trail and fell activity, including organising Curley's 5km trail race.",
    biography: [
      "Winter Hill Runners has a local presence in Horwich, England, and an off-road identity that reaches beyond the town. Horwich Town Council's grant minutes dated 7 March 2024 name Horwich Winter Hill Runners among the voluntary organisations approved for support, with a £500 award. The record establishes a community connection, although it does not explain how the money was used or when the club began. Its existing athletics-directory entry covers road running and cross-country as well as fell and trail running, with membership listed for adults.",
      "The club also organises races. The published Curley's 5km Trail Race listing for 1 April 2026 names Winter Hill Runners as organiser and gives the Jolley Crofters public house in Horwich as registration headquarters. That was an event arrangement, not evidence of a regular training base. Further afield, the Isle of Jura Fell Race organisers identified Albert Sunter with Winter Hill Runners in their 2025 report, marking his 34th appearance at the race. The report does not say that all those appearances were made as a Winter Hill member.",
      "For joining enquiries, the public contact in the 2026–2027 English Cross Country Association handbook offers a route to ask about suitable sessions, meeting points and membership arrangements. The listed club website displayed only a server placeholder during review, so it cannot currently supply a reliable timetable. Confirm the programme and any experience requirements directly before attending; neither the old race registration point nor the council's meeting venue should be treated as the club's weekly meeting place."
    ],
    notable_members: [{ name: "Albert Sunter", connection: "Fell runner associated with the club in 2025", detail: "The Isle of Jura Fell Race organisers named Sunter with Winter Hill Runners when reporting his 34th appearance in 2025. This is a dated association, not confirmation of present membership or a claim that every appearance was for the club." }],
    location_note: "Horwich is supported by the town council's named grant recipient and the club-organised Curley's race listing. Only the town is added. The Jolley Crofters was race registration headquarters on 1 April 2026, not an established current training venue; no street or postcode is added.",
    contact_note: "Reviewed 18 October 2026. The existing ECCA 2026–2027 handbook contact retains its provenance and check date. The website's server placeholder and throttled Facebook page supply no new contact or social details. Mad Bull Events' email/address and the Jura organiser's contacts belong to those publishers, not Winter Hill Runners. Founding year, current training, fees and grant expenditure remain unresolved.",
    sources: [
      { title: "Horwich Town Council grant minutes, 7 March 2024, page 1", url: "https://www.horwich.gov.uk/wp-content/uploads/2024/03/Grants-Sub-Committee-Minutes-7-March-2024.pdf" },
      { title: "Curley's 5km Trail Race, 1 April 2026: named club organiser", url: "https://www.madbullevents.com/events-1/curleys-5km-trail-race-2026-1" },
      { title: "Isle of Jura Fell Race: organisers' 2025 report", url: "https://www.isleofjurafellrace.co.uk/copy-of-2023-race-report-1" },
      { title: "ECCA 2026–2027 handbook: Winter Hill contact, page 28", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18",
    corrections: { city: "Horwich" }
  },
  "uts-running-club": {
    summary: "UTS Running Club is a Wirral club in England with roots in the Underground Training Station, a history of progressive running sessions and community fundraising through the Virtual Hoylake 10k.",
    biography: [
      "UTS Running Club grew from the Underground Training Station's running programme on the Wirral in England. Wirral Borough Council's January 2021 sports-facilities assessment describes the training organisation establishing its own club, offering a progressive programme for runners with different levels of fitness. Its account includes dedicated sessions for beginners and people returning to running. The assessment largely draws on work undertaken in 2019, so those arrangements provide historical context rather than a current weekly timetable. It does not establish the club's exact founding year.",
      "The club's own charity appeal shows another side of its activity. After the 2020 Hoylake 10k was cancelled, UTS Run Club created a virtual alternative to support the UTS Foundation. Participants were invited to choose their own 10km route and share their runs online, keeping a community challenge going without a single race-day gathering. The appeal is now closed. The Foundation is a separate charity: its establishment date and wider services should not be mistaken for the running club's origins or membership offer.",
      "Merseyside County Athletic Association lists UTS among its member clubs, covering cross-country, fell, road, track and field, and trail running. It describes a black club vest with the name or logo, worn with black shorts. The county directory and the 2026–2027 cross-country handbook provide public enquiry routes, but their named contacts differ. New runners should confirm current sessions, eligibility and joining costs with the club before attending. The retained Station Road address is a directory location, not confirmation that every session starts there."
    ],
    location_note: "The existing Wirral/Station Road/CH47 4AA directory location is retained without a new training-venue claim. The council assessment's adjacent Heswall Squash Racquets Club address belongs to Pensby Running Club, not UTS. No location correction is made from the virtual event name.",
    contact_note: "Reviewed 18 October 2026. The existing ECCA 2026–2027 contact is preserved. Merseyside County Athletic Association separately publishes Mike Stone's email and telephone for UTS; this additional contact is attributed to an undated directory row, not verification of his present office. The county-linked utsrunclub.org and the older gym run-club route were unavailable, so neither supplies current session or fee information. No charity, gym-supplier or neighbouring Warriors PAC contact is imported. Founding year, current programme, social destinations and notable-member associations remain unresolved.",
    sources: [
      { title: "Wirral Borough Council: January 2021 facilities assessment, pages 2 and 88 (mostly 2019 research)", url: "https://programmeofficers.co.uk/Wirral/CoreDocuments/CD4/CD04.19_GI2.2%20Wirral%20Indoor%20Sports%20Facilities%20Needs%20Assessment%202021.pdf" },
      { title: "UTS Run Club's Virtual Hoylake 10k charity appeal, 11 April 2020", url: "https://www.justgiving.com/fundraising/VirtualHoylake10k" },
      { title: "Merseyside County Athletic Association: UTS member-club row", url: "https://merseysidecountyaa.org.uk/member-clubs-associations/" },
      { title: "ECCA 2026–2027 handbook: UTS contact, page 28", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18"
  }
};
