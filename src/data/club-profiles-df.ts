import type { ClubProfile } from "./club-profiles";

// Batch 110: club-authored introductions and county-supplied training information.
export const michelinAndRunWednesdaysProfiles: Record<string, ClubProfile> = {
  "michelin-running-club": {
    summary: "Michelin Running Club is a road and cross-country club in Stoke-on-Trent, Staffordshire, England, with a welcoming, social approach to running for beginners and experienced runners.",
    biography: [
      "Michelin Running Club brings runners together in Stoke-on-Trent, Staffordshire, England. Its own Strava introduction places the group in Hanford and describes a small, friendly club where newcomers and experienced runners can run together without pressure. The emphasis is on companionship and keeping the group together, rather than leaving slower runners behind. England Athletics' June 2026 affiliation list records road running and cross-country as its disciplines.",
      "The directory address is the Michelin Sports Centre on Rose Tree Avenue in nearby Trent Vale. The wider Michelin Athletic Club traces its own history to 1928 and moved to its present Trent Vale site in the mid-1970s. That is the sports organisation's history, not a verified founding date for the running club. The centre's gym membership arrangements should not be assumed to be the running club's joining rules.",
      "Prospective runners can use the club contact published in the September 2026 English Cross Country Association handbook, together with its public social pages, to ask about joining and the next meeting point. The Strava page gives a useful introduction to the group's ethos but does not expose a public session calendar. Confirm the current timetable and starting location before travelling; the sports centre address is retained as directory information rather than a guaranteed start for every run."
    ],
    sources: [
      { title: "Michelin Running Club: club-authored Strava introduction", url: "https://www.strava.com/clubs/Michelinathleticclub" },
      { title: "England Athletics: affiliated clubs at 8 June 2026", url: "https://d1laub10p5ibfa.cloudfront.net/2026/06/Affiliated-Clubs-and-Organisations-at-8-June-2026.pdf" },
      { title: "Michelin Sports and Conference Centre: wider MAC history and location", url: "https://stokemac.michelin.co.uk/about.php" },
      { title: "ECCA 2026–2027 handbook: club contact, page 19", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18",
    location_note: "Hanford is the area named in the club's own introduction; the existing Trent Vale sports-centre address remains directory-only. Neither source establishes a current weekly meeting point.",
    contact_note: "Sources read on 18 October 2026. The handbook email is explicitly a running-club contact, not the sports centre reception. No club phone, founding year or notable-member history was established. The X page was inaccessible, so its search-only timetable was not adopted. Existing adult eligibility, Facebook provenance and England Athletics check date are retained.",
    corrections: { name: "Michelin Running Club" }
  },
  "runwednesdays": {
    summary: "RunWednesdays is a running club in Eastbourne, East Sussex, England, with Wednesday groups and seasonal meeting places along the seafront and at Beachy Head.",
    biography: [
      "RunWednesdays is based in Eastbourne, East Sussex, England, with road, cross-country and trail running recorded in England Athletics' June 2026 affiliation list. The club's information supplied to Sussex Athletics describes a Wednesday programme with separate Little RunWednesdays, Female RunWednesdays and an open-to-all RunWednesdays session. This gives prospective members several routes into the group, but the listing does not specify a minimum age for each session.",
      "Its meeting place changes with the programme and season. Sussex Athletics lists Fisherman's Green and a second seafront meeting point at Wishtower Slopes on King Edward's Parade, with the South Downs at Beachy Head used in lighter, warmer months. Fisherman's Green is therefore one of the club's training meeting places, not its only base. New runners should check that week's arrangements before choosing where to go.",
      "The county directory lists Wednesday starts of 5pm, 6pm and 7pm for the three groups respectively. Those are published session details rather than a live booking schedule. Colin Burbage is the named secretary in that listing, and the same enquiry email appears in the September 2026 ECCA handbook. Contacting the club is the best way to confirm a suitable group, current times and joining arrangements; its existing Facebook group remains another route to information."
    ],
    sources: [
      { title: "Sussex Athletics: club-supplied RunWednesdays groups, training venues and secretary", url: "https://www.sussexathletics.net/Find-a-Club/" },
      { title: "England Athletics: affiliated clubs at 8 June 2026", url: "https://d1laub10p5ibfa.cloudfront.net/2026/06/Affiliated-Clubs-and-Organisations-at-8-June-2026.pdf" },
      { title: "ECCA 2026–2027 handbook: RunWednesdays contact, page 36", url: "https://www.englishcrosscountry.co.uk/wp-content/uploads/2026/09/ECCA_Handbook_2026-27.pdf" }
    ],
    reviewed_at: "2026-10-18",
    location_note: "Sussex Athletics explicitly identifies Fisherman's Green as a training meeting place, alongside Wishtower Slopes and seasonal Beachy Head locations. The existing address is reclassified as training, not a clubhouse or the start of every session.",
    contact_note: "Sources read on 18 October 2026. The secretary email is corroborated by the county directory and current-season ECCA handbook. Facebook could not be read, so its existing directory attribution is retained. Founding date, notable-member history, phone, group age limits and live session availability remain unconfirmed; no results or athlete identities are imported.",
    corrections: { address_kind: "training" }
  }
};
