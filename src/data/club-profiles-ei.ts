import type { ClubProfile } from "./club-profiles";

// Governing-body and host-club primary sources read 19 October 2026 UTC.
export const olympiaHampshireProfile: Record<string, ClubProfile> = {
  "olympia-athletics": {
    summary: "Olympia Athletics is a Hampshire athletics club in England, with track and field, cross-country, road and trail running listed by England Athletics.",
    biography: [
      "Olympia Athletics belongs to Hampshire's club athletics scene in southern England. England Athletics' October 2026 register places the club in Hampshire and lists track and field, cross-country, road running and trail running. That gives a clearer picture of its sporting range than a general South East location, although the register does not identify a particular town or training ground.",
      "An early documented milestone is its acceptance into the Hampshire Cross Country League. The league's annual meeting on 21 June 2024 recorded that Olympia Athletics and Winchester RC had been accepted for affiliation. This establishes a step into local league competition, not the year Olympia was founded. Road-running participation is also documented: Havant AC's Lakeside 5k results list runners representing Olympia Athletics in May and June 2026, including junior age groups. These dated appearances do not establish a current membership list or make Olympia the event organiser.",
      "For prospective members, the published club contact in the English Cross Country Association's 2026–2027 handbook is a starting point for asking about joining. Confirm the relevant age group, coaching arrangements, session times and meeting place before attending. A current public timetable, membership fees and an exact training venue have not been established, so no race venue or league meeting address is presented as the club's home."
    ],
    location_note: "The October 2026 England Athletics register, printed page 30, supports Hampshire in place of the broader South East county label. South East remains the region; town, street and postcode remain unknown. The league AGM's Eastleigh venue is not a club training address.",
    contact_note: "Reviewed 19 October 2026 UTC. The existing ECCA handbook email and its 18 October check date are retained. No independently established club website, telephone, contact form or official social destination is added; the unrelated Australian Olympia Athletics website is excluded.",
    sources: [
      { title: "England Athletics: October 2026 affiliated clubs, Hampshire, printed page 30", url: "https://www.englandathletics.org/clubs-and-facilities?media-alias=766c234f3796559a82e8" },
      { title: "Hampshire Cross Country League: AGM minutes, 21 June 2024, page 1", url: "https://www.hampshireathletics.org.uk/wp-content/uploads/2025/07/hxcl-agm-minutes-2024.pdf" },
      { title: "Havant AC: Lakeside 5k series results, 27 May and 24 June 2026", url: "https://havantac.co.uk/events/lakeside-5k-series/2026-results/" },
      { title: "ECCA: 2026–2027 handbook, Olympia contact, printed page 35", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-19",
    corrections: { county: "Hampshire" }
  }
};
