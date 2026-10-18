import type { ClubProfile } from "./club-profiles";

// Club-owned history and primary community accounts, read 18 October 2026.
export const recoveredEllenboroughAndHydrographicProfiles: Record<string, ClubProfile> = {
  "ellenborough-ac": {
    summary: "Ellenborough AC is a Maryport and West Cumbria athletics club in England, founded in 1958, with a strong fell-running tradition alongside road and cross-country running.",
    biography: [
      "Ellenborough AC began in 1958, founded by Raymond and Mary Thompson. Its own history recalls young athletes from Maryport and the surrounding West Cumbrian communities wearing the club's blue and gold colours. A senior men's team formed in 2009 and entered the Hodgson Brothers Mountain Relay that year, marking a new chapter in its fell-running activity. The same account records the junior section ending in 2017 after a loss of coaches and declining numbers. That history should not be mistaken for a current junior intake: the retained England Athletics directory entry describes adult membership.",
      "The club's mountain-running interests extend from team relays to long days in the Lake District. Its Bob Graham Round archive names members associated with the challenge, including Ricky Lightfoot in a 2016 winter-round entry. These are dated club associations, not a statement about current membership. Ellenborough also publishes the Coledale Horseshoe race information: the 2026 page advertised a March race from Braithwaite Lodge, taking in Grisedale Pike, Crag Hill and Barrow. The page emphasised fell-running equipment and navigation requirements. Braithwaite is an event location, not evidence of a permanent club training base.",
      "Ellenborough's homepage describes competition on the fells, roads and cross-country courses of its wider running community. Prospective members can use the club's own contact form, or the public handbook enquiry email, to ask about joining and suitable sessions. No regular meeting address or current weekly timetable has been established. The website's junior archive and older accreditation wording are useful historical material, but do not establish present junior provision or a newly verified accreditation. Maryport and West Cumbria provide the geographical context without assigning an unsupported street address."
    ],
    founded_year: 1958,
    notable_members: [
      { name: "Raymond Thompson", connection: "Co-founder", detail: "Ellenborough AC's own club history credits Raymond and Mary Thompson with starting the club in 1958. This records a founding association, not current membership." },
      { name: "Mary Thompson", connection: "Co-founder", detail: "The club's history names Mary Thompson alongside Raymond Thompson as a founder in 1958; no later office or membership period is inferred." },
      { name: "Ricky Lightfoot", connection: "Historical fell-running association", detail: "Ellenborough's Bob Graham Round archive names Ricky Lightfoot among its members, with a winter-round entry dated 2016. This is a dated editorial association, not confirmation of present membership or an imported verified result." }
    ],
    corrections: { city: "Maryport", county: "Cumbria", website: "https://ellenboroughac.com/" },
    location_note: "The club's own history identifies Maryport and West Cumbria. The former regional-only location is refined to Maryport, Cumbria, without a street address or postcode. Braithwaite Lodge is a Coledale race venue, not a confirmed regular training address.",
    contact_note: "Reviewed 18 October 2026. The club's contact form replaces the directory enquiry route; it was read, not submitted. The existing ECCA 2026–2027 email and its provenance are preserved. No additional public telephone or club-linked social account was established. The old .com.uk website is replaced by the readable club-owned .com site.",
    sources: [
      { title: "Ellenborough AC: club history, founders and junior/senior sections", url: "https://ellenboroughac.com/club-info/" },
      { title: "Ellenborough AC: homepage and competition focus", url: "https://ellenboroughac.com/" },
      { title: "Ellenborough AC: Bob Graham Round club archive", url: "https://ellenboroughac.com/bob-graham-round/" },
      { title: "Ellenborough AC: Coledale Horseshoe 2026 race information", url: "https://ellenboroughac.com/coledale-horseshoe/" },
      { title: "Ellenborough AC: public contact form", url: "https://ellenboroughac.com/contact-us/" }
    ],
    reviewed_at: "2026-10-18"
  },
  "hydrographic-harriers": {
    summary: "Hydrographic Harriers is the UK Hydrographic Office running club in Taunton, Somerset, England, with road and trail running interests and a history of organising the Piddle Wood Plod.",
    biography: [
      "Hydrographic Harriers brings a workplace connection to Taunton's running scene in Somerset, England. Its organiser-authored Full On Sport page identifies it as the UK Hydrographic Office running club based in the town. England Athletics' June 2026 affiliated-club list also places Hydrographic Harriers in Somerset and records road and trail running as its disciplines. Together these sources give a clearer club location than the Torquay address carried in the retained directory evidence; neither establishes a regular public training venue or the club's founding year.",
      "One documented contribution to local running is the Piddle Wood Plod. Running Forever Running Club's first-hand report of 10 June 2019 describes its members taking part in Hydro Harriers' hilly 10-kilometre trail race, starting and finishing at Thurlbear School. The report captures a neighbouring club coming together for the event, complete with a cake stall at the finish. This is evidence of past race organisation and local participation, not a current race invitation. The school is a historical event venue and should not be used as a meeting point for ordinary club runs without confirmation.",
      "Prospective members can ask the published club contact about eligibility, any workplace connection required and training arrangements. The organiser page offers no online memberships; this does not establish closure or a closed intake. A founding date, current timetable and membership fees remain unconfirmed, rather than being inferred from the employer's wider activities."
    ],
    corrections: { city: "Taunton", county: "Somerset", address: "", postcode: "", location_precision: "area-only", address_kind: "directory" },
    location_note: "The club's own organiser profile identifies Taunton and the June 2026 England Athletics list, page 38, identifies Somerset. The conflicting Torquay directory address is retained in the underlying source record and audit, but is not displayed as this club's base. Neither the undated Admiralty Way office listing nor Thurlbear's historical race start establishes a current training venue.",
    contact_note: "Reviewed 18 October 2026. The email and phone are attributed to the undated club organiser listing, not a confirmed current committee role. Platform support/social links are excluded. Eligibility and training remain unconfirmed.",
    sources: [
      { title: "Hydrographic Harriers: organiser-authored club profile and contact listing (undated)", url: "https://fullonsport.com/organiser/6923/profile" },
      { title: "England Athletics: affiliated clubs at 8 June 2026, page 38", url: "https://d1laub10p5ibfa.cloudfront.net/2026/06/Affiliated-Clubs-and-Organisations-at-8-June-2026.pdf" },
      { title: "Running Forever Running Club: first-hand Piddle Wood Plod account, 10 June 2019", url: "https://runningforever.club/2019/06/10/weekly-round-up-10-june-2019/" }
    ],
    reviewed_at: "2026-10-18"
  }
};
