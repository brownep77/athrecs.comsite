import type { ClubProfile } from "./club-profiles";

// Batch 104: school-linked running and a club-written local-authority listing.
export const gordonianAndHartlepoolProfiles: Record<string, ClubProfile> = {
  "gordonian-runners": {
    summary: "Gordonian Runners connects runners with links to Gordon's School in West End, Surrey, with road, cross-country, hill and trail running recorded by England Athletics.",
    biography: [
      "Gordonian Runners is a school-linked running club in West End, Surrey, England. Its public Strava introduction describes a shared enthusiasm for running and a connection with the school, whether as a pupil, teacher, friend or supporter. That gives the club a community identity extending beyond former pupils alone, while the wider Gordonian network maintains links between generations of Gordon's School students and staff.",
      "England Athletics' affiliated-club list dated 1 October 2026 places Gordonian Runners in Surrey and records cross-country, road running, hill and fell running, and trail running. The club's Strava page also points visitors to its Facebook page. These public pages provide a starting point for enquiries, but do not establish a current training timetable, fees or junior arrangements. Prospective runners should confirm eligibility and meeting details with the club before attending; the school's location should not be assumed to be the start of every run."
    ],
    sources: [
      { title: "Gordonian Runners' public introduction and linked Facebook page", url: "https://www.strava.com/clubs/gordonian-runners-131963" },
      { title: "Gordonians: Gordon's School alumni community", url: "https://gordonians.co.uk/" },
      { title: "England Athletics affiliated clubs, 1 October 2026, Surrey listing", url: "https://www.englandathletics.org/clubs-and-facilities?media-alias=766c234f3796559a82e8" }
    ],
    reviewed_at: "2026-10-17",
    corrections: { city: "West End", county: "Surrey", address: undefined, postcode: undefined, address_kind: undefined, location_precision: "area-only" },
    location_note: "West End on the club's Strava page and Surrey in England Athletics' October list supersede the inherited Norwich/Norfolk locality. The old Angel Road address and NR3 3HT postcode remain in the underlying directory provenance but are not displayed as a club base: their purpose is unconfirmed. No school street address or training venue inferred.",
    contact_note: "Strava and its published Facebook link are source-attributed, not verified account ownership. No direct email, telephone, current committee tenure, founding year or notable-member association established. The wider Gordonian association's 2019 dissolution is not evidence of the running club closing."
  },
  "hartlepool-burn-road-harriers": {
    summary: "Hartlepool Burn Road Harriers welcomes runners to try the club before joining, with group running and seasonal cross-country activity in Hartlepool, north-east England.",
    biography: [
      "Hartlepool Burn Road Harriers is a running and athletics club in Hartlepool, north-east England. In its own introduction on Hartlepool Borough Council's community support directory, the club invites runners of different abilities to try a couple of sessions before deciding whether to become paying members. Junior enquiries have a separate route through the chair, rather than an assumption that every adult session is suitable for children.",
      "The same introduction describes weekday evening runs and cross-country training at Summerhill from late summer, with a monthly programme published through the club website. It names Coronation Drive and English Martyrs School as meeting points, but the listing is undated and those details should be checked before travelling. The membership email is the practical starting point for questions about joining and the next suitable session. Mowbray Road, retained from the athletics directory, is not a confirmed training venue or clubhouse."
    ],
    sources: [
      { title: "Club-written introduction and public enquiry contacts on Hartlepool Now", url: "https://www.hartlepoolnow.co.uk/community_support_hub/organisations/30052-hartlepool-burn-road-harriers" }
    ],
    reviewed_at: "2026-10-17",
    location_note: "Mowbray Road remains a directory address. The council listing's undated weekday venues and seasonal Summerhill sessions are not used to overwrite it or promise a current timetable.",
    contact_note: "Publicly encoded membership and chair emails were read from the council-hosted club listing. Chair is explicitly the junior-enquiry route; council and website-supplier contacts are excluded. The club website could not be read and Facebook presented a temporary block. Founding year, telephone and notable associations remain unset."
  }
};
